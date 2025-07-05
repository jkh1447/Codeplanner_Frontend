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

export default function SettingsPage() {
    const { projectId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [project, setProject] = useState({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        repositoryUrl: "",
        status: "진행중",
    });
    const [members, setMembers] = useState<any[]>([]);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [inviteRoles, setInviteRoles] = useState<{ [userId: string]: string }>({});
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
        async function fetchProject() {
            setLoading(true);
            setError(null);
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

    // 전체 유저 목록 불러오기 (모달 열릴 때)
    const fetchAllUsers = () => {
        fetch(`${getApiUrl()}/user/users`, { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                // 배열인지 확인하고 안전하게 처리
                if (Array.isArray(data)) {
                    setAllUsers(data);
                } else {
                    console.error('API 응답이 배열이 아닙니다:', data);
                    setAllUsers([]);
                }
            })
            .catch(error => {
                console.error('유저 목록 불러오기 실패:', error);
                setAllUsers([]);
            });
    };

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

    // 초대 핸들러
    const handleInvite = (userId: string, role: string) => {
        fetch(`${getApiUrl()}/projects/${projectId}/members/invite`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ userId, role }),
        }).then(() => {
            setShowMemberModal(false);
            // 초대 후 멤버 목록 새로고침
            fetch(`${getApiUrl()}/projects/${projectId}/members`, { credentials: "include" })
                .then(res => res.json())
                .then(data => setMembers(data || []));
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
    const handleChangeLeader = (userId: string) => {
        if (!confirm('이 사용자를 프로젝트 리더로 변경하시겠습니까?')) return;
        
        fetch(`${getApiUrl()}/projects/${projectId}/leader`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ leader_id: userId }),
        }).then(() => {
            // 리더 변경 후 프로젝트 정보 새로고침
            fetch(`${getApiUrl()}/projects/${projectId}`, {
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            })
            .then(res => res.json())
            .then(data => {
                setProjectLeader({
                    id: data.leader_id,
                    display_name: data.project_leader || 'Unknown',
                });
            });
            alert('프로젝트 리더가 변경되었습니다.');
        }).catch(error => {
            console.error('리더 변경 실패:', error);
            alert('리더 변경에 실패했습니다.');
        });
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
                <div className="text-center text-red-500 py-8">{error}</div>
            ) : (
                <div className="flex flex-col space-y-4">
                    {/* 기본 정보 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                기본 정보
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-2">
                                <Label htmlFor="name">프로젝트명</Label>
                                <Input id="name" value={project.name} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">설명</Label>
                                <Textarea id="description" value={project.description} onChange={handleChange} rows={3} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="endDate">종료일</Label>
                                    <Input id="endDate" type="date" value={project.endDate} onChange={handleChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">프로젝트 상태</Label>
                                    <select
                                        id="status"
                                        value={project.status}
                                        onChange={e => handleStatusChange(e.target.value)}
                                        className="w-full border rounded-md px-3 py-2"
                                    >
                                        {statusOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="repositoryUrl">프로젝트 URL</Label>
                                <Input id="repositoryUrl" value={project.repositoryUrl} onChange={handleChange} />
                            </div>
                            <div className="pt-2">
                                <Button onClick={handleSave} disabled={saving}>
                                    {saving ? "저장 중..." : "저장"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 팀 관리 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                팀 관리
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
                            
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {members.map(member => (
                                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="font-medium">{member.display_name}</p>
                                            <p className="text-sm text-muted-foreground">{member.role}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Select value={member.role} onValueChange={role => handleRoleChange(member.id, role)}>
                                                <SelectTrigger className="w-[100px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ADMIN">관리자</SelectItem>
                                                    <SelectItem value="MEMBER">멤버</SelectItem>
                                                    <SelectItem value="VIEWER">뷰어</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => handleRemoveMember(member.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                제거
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" className="w-full" onClick={() => { setShowMemberModal(true); fetchAllUsers(); }}>
                                팀원 관리
                            </Button>
                            {showMemberModal && (
                                <Modal onClose={() => setShowMemberModal(false)}>
                                    <div className="p-4">
                                        <h2 className="text-lg font-bold mb-4">전체 유저 목록</h2>
                                        <div className="space-y-2 max-h-96 overflow-y-auto">
                                            {allUsers.map(user => (
                                                <div key={user.id} className="flex items-center justify-between p-2 border rounded-lg">
                                                    <span>{user.display_name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <Select value={inviteRoles[user.id] || "MEMBER"} onValueChange={role => setInviteRoles(r => ({ ...r, [user.id]: role }))}>
                                                            <SelectTrigger className="w-[100px]">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="ADMIN">관리자</SelectItem>
                                                                <SelectItem value="MEMBER">멤버</SelectItem>
                                                                <SelectItem value="VIEWER">뷰어</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <Button 
                                                            onClick={() => handleInvite(user.id, inviteRoles[user.id] || "MEMBER")}
                                                            size="sm"
                                                        >
                                                            초대
                                                        </Button>
                                                        <Button 
                                                            variant="outline"
                                                            onClick={() => handleChangeLeader(user.id)}
                                                            size="sm"
                                                            className="text-blue-600 hover:text-blue-700"
                                                        >
                                                            리더로
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
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

                    {/* 데이터 관리 - 프로젝트 삭제만 남김 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="h-5 w-5" />
                                데이터
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button variant="destructive" className="w-full" onClick={handleDelete}>
                                프로젝트 삭제
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
} 