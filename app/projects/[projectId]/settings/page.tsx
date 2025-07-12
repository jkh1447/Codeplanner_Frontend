"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Settings, Users, Bell, Shield, Palette, Database } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Modal from "@/components/ui/modal";
import { getApiUrl } from "@/lib/api";
import TeamInvite from "./_components/TeamInvite";

export default function SettingsPage() {
    const { projectId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [userRole, setUserRole] = useState<{ role: string; isLeader: boolean } | null>(null);
    const [hasAdminPermission, setHasAdminPermission] = useState(false);
    const [hasLeaderPermission, setHasLeaderPermission] = useState(false);
    const [project, setProject] = useState({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        repositoryUrl: "",
        status: "진행중",
    });
    const [members, setMembers] = useState<any[]>([]);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [projectLeader, setProjectLeader] = useState<any>(null);

    // 상태 옵션 (DDL 및 기존 코드 참고)
    const statusOptions = [
        { value: "진행중", label: "진행중" },
        { value: "완료", label: "완료" },
        { value: "대기중", label: "대기중" },
        { value: "보류", label: "보류" },
    ];

    // 날짜를 YYYY-MM-DD로 변환
    function toDateInputString(dateStr: string | null | undefined): string {
        if (!dateStr) return "";

        // 한글 형식인지 확인: "2025년 07월 31일"
        const koreanDateRegex = /^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일$/;
        const match = dateStr.match(koreanDateRegex);
        if (match) {
            const [, year, month, day] = match;
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }

        // 일반 ISO, UTC 형식
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "";
        return d.toISOString().slice(0, 10);
    }

    useEffect(() => {
        async function fetchUserRole() {
            try {
                const res = await fetch(`${getApiUrl()}/projects/${projectId}/my-role`, {
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                });

                if (res.ok) {
                    const data = await res.json();
                    setUserRole(data);
                    // 관리자 권한과 리더 권한을 분리
                    const adminPermission = data.role === 'ADMIN';
                    const leaderPermission = data.isLeader;
                    setHasAdminPermission(adminPermission);
                    setHasLeaderPermission(leaderPermission);

                    // 리더 또는 관리자만 접근 가능
                    if (!leaderPermission && !adminPermission) {
                        setError("설정 페이지에 접근할 권한이 없습니다.");
                        return;
                    }
                } else {
                    setError("권한 정보를 확인할 수 없습니다.");
                    return;
                }
            } catch (e: any) {
                setError("권한 확인 중 오류가 발생했습니다.");
                return;
            }
        }

        async function fetchProject() {
            setLoading(true);
            setError(null);

            // 먼저 권한을 확인
            await fetchUserRole();

            try {
                const res = await fetch(`${getApiUrl()}/projects/${projectId}`, {
                    method: "GET",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                });
                if (!res.ok) throw new Error("프로젝트 정보를 불러오지 못했습니다.");
                const data = await res.json();


                setProject({
                    name: data.title ?? "",
                    description: data.description ?? "",
                    startDate: toDateInputString(data.start_date),
                    endDate: toDateInputString(data.due_date),
                    repositoryUrl: data.repository_url ?? "",
                    status: data.status ?? "ACTIVE",
                });
                // 프로젝트 리더 정보 설정
                setProjectLeader({
                    id: data.leader_id,
                    display_name: data.project_leader || 'Unknown',
                });
            } catch (e: any) {
                setError(e.message || "알 수 없는 오류");
            } finally {
                setLoading(false);
            }
        }
        if (projectId) fetchProject();
    }, [projectId]);

    // 팀원 목록 불러오기
    useEffect(() => {
        if (!projectId) return;
        fetch(`${getApiUrl()}/projects/${projectId}/members`, {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => setMembers(data || []));
    }, [projectId]);



    // input/select 변경 핸들러
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setProject((prev) => ({ ...prev, [id]: value }));
    };
    const handleStatusChange = (value: string) => {
        setProject((prev) => ({ ...prev, status: value }));
    };

    // 저장 버튼 클릭 시
    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const res = await fetch(`${getApiUrl()}/projects/${projectId}`, {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: project.name,
                    description: project.description,
                    due_date: project.endDate,
                    repository_url: project.repositoryUrl,
                    status: project.status,
                }),
            });
            if (!res.ok) throw new Error("저장에 실패했습니다.");
            alert("프로젝트 정보가 저장되었습니다.");
        } catch (e: any) {
            setError(e.message || "알 수 없는 오류");
        } finally {
            setSaving(false);
        }
    };

    // 역할 변경 핸들러
    const handleRoleChange = (userId: string, role: string) => {
        // PATCH /projects/:id/members/:userId/role
        fetch(`${getApiUrl()}/projects/${projectId}/members/${userId}/role`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ role }),
        }).then(() => {
            setMembers(members => members.map(m => m.id === userId ? { ...m, role } : m));
        });
    };



    // 팀원 제거 핸들러
    const handleRemoveMember = (userId: string) => {
        if (!confirm('정말로 이 팀원을 제거하시겠습니까?')) return;

        fetch(`${getApiUrl()}/projects/${projectId}/members/${userId}`, {
            method: "DELETE",
            credentials: "include",
        }).then(() => {
            setMembers(members => members.filter(m => m.id !== userId));
            alert('팀원이 제거되었습니다.');
        }).catch(error => {
            console.error('팀원 제거 실패:', error);
            alert('팀원 제거에 실패했습니다.');
        });
    };

    // 프로젝트 리더 변경 핸들러
    const handleChangeLeader = async (userId: string) => {
        if (!confirm('리더 권한을 위임하시겠습니까?')) return;

        try {
            // 1. 기존 리더를 멤버로 변경
            const currentLeader = members.find(m => m.id === projectLeader?.id);
            if (currentLeader) {
                await fetch(`${getApiUrl()}/projects/${projectId}/members/${currentLeader.id}/role`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ role: 'MEMBER' }),
                });
            }

            // 2. 새로운 리더의 역할을 리더로 변경
            await fetch(`${getApiUrl()}/projects/${projectId}/members/${userId}/role`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ role: 'LEADER' }),
            });

            // 3. 프로젝트 테이블의 leader_id 업데이트
            await fetch(`${getApiUrl()}/projects/${projectId}/leader`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ leader_id: userId }),
            });

            // 4. 로컬 상태 업데이트
            setMembers(members => members.map(m => {
                if (m.id === projectLeader?.id) {
                    return { ...m, role: 'MEMBER' };
                }
                if (m.id === userId) {
                    return { ...m, role: 'LEADER' };
                }
                return m;
            }));

            // 5. 프로젝트 리더 정보 새로고침
            const projectRes = await fetch(`${getApiUrl()}/projects/${projectId}`, {
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });
            const projectData = await projectRes.json();
            setProjectLeader({
                id: projectData.leader_id,
                display_name: projectData.project_leader || 'Unknown',
            });

            alert('프로젝트 리더가 변경되었습니다.');
        } catch (error) {
            console.error('리더 변경 실패:', error);
            alert('리더 변경에 실패했습니다.');
        }
    };

    const handleDelete = async () => {
        if (!confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) return;
        try {
            const res = await fetch(`${getApiUrl()}/projects/${projectId}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) throw new Error("삭제에 실패했습니다.");
            alert("프로젝트가 삭제되었습니다.");
            // 프로젝트 목록 등으로 이동
            window.location.href = "/projectList"; // 실제 경로에 맞게 수정
        } catch (e: any) {
            alert(e.message || "알 수 없는 오류");
        }
    };

    return (
        <div className="space-y-4 p-4 max-w-3xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold">프로젝트 설정</h1>
                <p className="text-muted-foreground text-sm">프로젝트 설정을 관리하세요</p>
            </div>
            {loading ? (
                <div className="text-center py-8">불러오는 중...</div>
            ) : error ? (
                <div className="text-center py-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <div className="flex items-center justify-center mb-4">
                            <Shield className="h-12 w-12 text-red-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-red-800 mb-2">접근 권한 없음</h3>
                        <p className="text-red-600 mb-4">{error}</p>
                        <div className="text-sm text-red-500 mb-4">
                            {userRole && (
                                <p>현재 역할: {userRole.role} {userRole.isLeader && '(리더)'}</p>
                            )}
                            <p>설정 페이지는 프로젝트 리더 또는 관리자만 접근할 수 있습니다.</p>
                            <p className="text-xs">※ 관리자는 조회만 가능하며, 수정은 리더만 가능합니다.</p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => window.history.back()}
                            className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                            뒤로 가기
                        </Button>
                    </div>
                </div>
            ) : (!hasLeaderPermission && !hasAdminPermission) ? (
                <div className="text-center py-8">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <div className="flex items-center justify-center mb-4">
                            <Shield className="h-12 w-12 text-yellow-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-yellow-800 mb-2">권한 부족</h3>
                        <p className="text-yellow-600 mb-4">설정 페이지에 접근할 권한이 없습니다.</p>
                        <div className="text-sm text-yellow-600 mb-4">
                            {userRole && (
                                <p>현재 역할: {userRole.role} {userRole.isLeader && '(리더)'}</p>
                            )}
                            <p>설정 변경은 프로젝트 리더만 가능합니다.</p>
                            <p className="text-xs">※ 관리자는 조회만 가능합니다.</p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => window.location.href = `/projects/${projectId}/summary`}
                            className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                        >
                            프로젝트 요약으로 이동
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col space-y-4">
                    {/* 기본 정보 - 리더와 관리자 모두 접근 가능 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                기본 정보
                                {hasLeaderPermission && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">리더</span>}
                                {hasAdminPermission && !hasLeaderPermission && <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">관리자 (조회 전용)</span>}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {/* 관리자 권한 제한 안내 */}
                            {hasAdminPermission && !hasLeaderPermission && (
                                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                                        <p className="text-sm text-orange-800">
                                            관리자 권한: 프로젝트 기본 정보 수정은 리더만 가능합니다.
                                        </p>
                                    </div>
                                </div>
                            )}
                            
                            <div className="space-y-2">
                                <Label htmlFor="name">프로젝트명</Label>
                                <Input 
                                    id="name" 
                                    value={project.name} 
                                    onChange={handleChange}
                                    disabled={!hasLeaderPermission}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">설명</Label>
                                <Textarea 
                                    id="description" 
                                    value={project.description} 
                                    onChange={handleChange} 
                                    rows={3}
                                    disabled={!hasLeaderPermission}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="endDate">종료일</Label>
                                    <Input 
                                        id="endDate" 
                                        type="date" 
                                        value={project.endDate} 
                                        onChange={handleChange}
                                        disabled={!hasLeaderPermission}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">프로젝트 상태</Label>
                                    <select
                                        id="status"
                                        value={project.status}
                                        onChange={e => handleStatusChange(e.target.value)}
                                        className="w-full border rounded-md px-3 py-2"
                                        disabled={!hasLeaderPermission}
                                    >
                                        {statusOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="repositoryUrl">프로젝트 URL</Label>
                                <Input 
                                    id="repositoryUrl" 
                                    value={project.repositoryUrl} 
                                    onChange={handleChange}
                                    disabled={!hasLeaderPermission}
                                />
                            </div>
                            <div className="pt-2">
                                <Button 
                                    onClick={handleSave} 
                                    disabled={saving || !hasLeaderPermission}
                                >
                                    {saving ? "저장 중..." : "저장"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 팀 관리 - 리더와 관리자 접근 가능 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                팀 관리
                                {hasLeaderPermission && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">리더</span>}
                                {hasAdminPermission && !hasLeaderPermission && <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">관리자 (제한된 관리)</span>}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {/* 프로젝트 리더 표시 */}
                            {projectLeader && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-blue-800">프로젝트 리더</p>
                                            <p className="text-sm text-blue-600">{projectLeader.display_name}</p>
                                        </div>
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">리더</span>
                                    </div>
                                </div>
                            )}

                            {/* 관리자 권한 제한 안내 */}
                            {hasAdminPermission && !hasLeaderPermission && (
                                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                                        <p className="text-sm text-orange-800">
                                            관리자 권한: 멤버/뷰어 관리만 가능합니다. 관리자 관련 권한은 리더만 가능합니다.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {members
                                    .filter(member => {
                                        // 리더는 항상 제외
                                        if (member.role === 'LEADER') return false;
                                        // 관리자가 보는 경우: 자신(ADMIN)도 제외
                                        if (hasAdminPermission && !hasLeaderPermission && member.role === 'ADMIN') return false;
                                        return true;
                                    })
                                    .map(member => (
                                        <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <p className="font-medium">{member.display_name}</p>
                                                <p className="text-sm text-muted-foreground">{member.role}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Select 
                                                    value={member.role} 
                                                    onValueChange={role => handleRoleChange(member.id, role)}
                                                    disabled={
                                                        (!hasLeaderPermission && !hasAdminPermission) || 
                                                        (hasAdminPermission && !hasLeaderPermission && member.role === 'ADMIN')
                                                    }
                                                >
                                                    <SelectTrigger className="w-[100px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {/* 관리자 옵션은 리더만 또는 현재 ADMIN인 경우 표시 */}
                                                        {(hasLeaderPermission || member.role === 'ADMIN') && <SelectItem value="ADMIN">관리자</SelectItem>}
                                                        <SelectItem value="MEMBER">멤버</SelectItem>
                                                        <SelectItem value="VIEWER">뷰어</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {/* 리더 권한 위임은 리더만 가능 */}
                                                {hasLeaderPermission && (
                                                    <Button 
                                                        variant="outline"
                                                        onClick={() => handleChangeLeader(member.id)}
                                                        size="sm"
                                                        className="text-blue-600 hover:text-blue-700"
                                                    >
                                                        리더로
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleRemoveMember(member.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                    disabled={
                                                        (!hasLeaderPermission && !hasAdminPermission) ||
                                                        (hasAdminPermission && !hasLeaderPermission && member.role === 'ADMIN')
                                                    }
                                                >
                                                    제거
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                {members.filter(member => {
                                    // 리더는 항상 제외
                                    if (member.role === 'LEADER') return false;
                                    // 관리자가 보는 경우: 자신(ADMIN)도 제외
                                    if (hasAdminPermission && !hasLeaderPermission && member.role === 'ADMIN') return false;
                                    return true;
                                }).length === 0 && (
                                    <div className="text-center py-4 text-sm text-muted-foreground">
                                        {hasAdminPermission && !hasLeaderPermission ? '관리할 수 있는 팀원이 없습니다.' : '다른 팀원이 없습니다.'}
                                    </div>
                                )}
                            </div>
                            <Button 
                                variant="outline" 
                                className="w-full" 
                                onClick={() => setShowInviteModal(true)}
                                disabled={!hasLeaderPermission && !hasAdminPermission}
                            >
                                이메일로 팀원 초대
                            </Button>
                            {showInviteModal && (
                                <Modal onClose={() => setShowInviteModal(false)}>
                                    <div className="p-4 w-full">
                                        <TeamInvite
                                            projectId={String(projectId)}
                                            hasLeaderPermission={hasLeaderPermission}
                                            hasAdminPermission={hasAdminPermission}
                                            onClose={() => setShowInviteModal(false)}
                                        />
                                    </div>
                                </Modal>
                            )}
                        </CardContent>
                    </Card>
                    {/* 알림 설정 추가 예정 */}
                    {/* 알림 설정
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                알림 설정
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">이메일 알림</p>
                                    <p className="text-sm text-muted-foreground">작업 업데이트 시 이메일로 알림</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">브라우저 알림</p>
                                    <p className="text-sm text-muted-foreground">브라우저 푸시 알림</p>
                                </div>
                                <Switch />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">마감일 알림</p>
                                    <p className="text-sm text-muted-foreground">마감일 3일 전 알림</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card> */}

                    {/* 데이터 관리 - 리더만 접근 가능 */}
                    {hasLeaderPermission && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Database className="h-5 w-5" />
                                    데이터 관리
                                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">리더 전용</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <h4 className="font-medium text-red-800 mb-2">위험 구역</h4>
                                        <p className="text-sm text-red-600 mb-3">
                                            프로젝트 삭제는 되돌릴 수 없습니다. 모든 데이터가 영구적으로 삭제됩니다.
                                        </p>
                                        <Button variant="destructive" className="w-full" onClick={handleDelete}>
                                            프로젝트 삭제
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    
                    {/* 관리자에게는 삭제 권한 없음을 알림 */}
                    {hasAdminPermission && !hasLeaderPermission && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Database className="h-5 w-5" />
                                    데이터 관리
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">권한 제한</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                                    <p className="text-sm text-gray-600">
                                        프로젝트 삭제는 리더만 수행할 수 있습니다.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
} 