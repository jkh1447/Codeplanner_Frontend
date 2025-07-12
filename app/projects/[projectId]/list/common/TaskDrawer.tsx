"use client";
import { Task } from "@/components/type";
import { getApiUrl } from "@/lib/api";
import { useState, useEffect } from "react";
import GitCommitIcon from "@/components/icons/GitCommitIcon";
import CommitListModal from "./CommitListModal";
import { ArrowBigLeftDash, GitCommitHorizontal, MessageSquare, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

{
    /* 이슈에 대한 카드 모달 */
}
export default function TaskDrawer({
    task,
    onClose,
    onSave,
}: {
    task: Task; // 전달받은 task 객체 초기화
    onClose: () => void; // 전달받은 모달 닫기 함수
    onSave?: () => void; // 저장 후 부모 컴포넌트 데이터 새로고침 콜백
}) {
    // 날짜를 YYYY-MM-DD 형식으로 변환하는 함수
    const formatDateForInput = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";
        return date.toISOString().split('T')[0];
    };

    // 폼 상태 관리 - task로부터 초기 값 설정
    const [formData, setFormData] = useState({
        id: task.id,
        project_id: task.project_id,
        title: task.title || "",
        description: task.description || "",
        issue_type: task.issue_type || "",
        status: task.status || "",
        assignee_id: task.assignee_id || "",
        reporter_id: task.reporter_id || "",
        start_date: formatDateForInput(task.start_date),
        due_date: formatDateForInput(task.due_date),
    });
    const [activeTab, setActiveTab] = useState<"details" | "commits" | "comments">("details");
    const [newComment, setNewComment] = useState("");

    // task props가 변경될 때마다 form 상태 업데이트
    useEffect(() => {
        setFormData({
            id: task.id,
            project_id: task.project_id,
            title: task.title || "",
            description: task.description || "",
            issue_type: task.issue_type || "",
            status: task.status || "",
            assignee_id: task.assignee_id || "",
            reporter_id: task.reporter_id || "",
            start_date: formatDateForInput(task.start_date),
            due_date: formatDateForInput(task.due_date),
        });
    }, [task]);

    // 로딩 및 에러 상태값 정의
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [memberList, setMemberList] = useState<any[]>([]);
    const [assigneeSearch, setAssigneeSearch] = useState("");
    const [reporterSearch, setReporterSearch] = useState("");
    const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
    const [showReporterDropdown, setShowReporterDropdown] = useState(false);
    const [showCommitModal, setShowCommitModal] = useState(false);

    // 드롭다운 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;

            // 담당자 드롭다운 외부 클릭 시 닫기
            if (showAssigneeDropdown && !target.closest(".assignee-dropdown")) {
                setShowAssigneeDropdown(false);
            }

            // 보고자 드롭다운 외부 클릭 시 닫기
            if (showReporterDropdown && !target.closest(".reporter-dropdown")) {
                setShowReporterDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showAssigneeDropdown, showReporterDropdown]);

    // 멤버 리스트 불러오기 및 현재 담당자/보고자 이름 설정
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await fetch(
                    `${getApiUrl()}/projects/${task.project_id}/members`,
                    {
                        credentials: "include",
                    }
                );
                if (!response.ok) {
                    throw new Error(
                        "프로젝트 멤버를 불러오는 데 실패했습니다."
                    );
                }
                const data = await response.json();
                setMemberList(data);
                
                // 현재 담당자와 보고자의 이름을 설정
                const assignee = data.find((member: any) => member.id === task.assignee_id);
                const reporter = data.find((member: any) => member.id === task.reporter_id);
                
                if (assignee) {
                    setAssigneeSearch(assignee.display_name);
                }
                if (reporter) {
                    setReporterSearch(reporter.display_name);
                }
            } catch (err: any) {
                setError(err.message || "멤버 목록을 불러오는 중 오류 발생");
            }
        };
        fetchMembers();
    }, [task.project_id, task.assignee_id, task.reporter_id]);

    // 폼 값 변경해주는 핸들러
    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // 담당자 선택 핸들러
    const handleAssigneeSelect = (memberId: string, displayName: string) => {
        setFormData((prev) => ({ ...prev, assignee_id: memberId }));
        setAssigneeSearch(displayName);
        setShowAssigneeDropdown(false);
    };

    // 보고자 선택 핸들러
    const handleReporterSelect = (memberId: string, displayName: string) => {
        setFormData((prev) => ({ ...prev, reporter_id: memberId }));
        setReporterSearch(displayName);
        setShowReporterDropdown(false);
    };

    // 필터링된 멤버 리스트
    const filteredAssignees = memberList.filter((member) =>
        member.display_name.toLowerCase().includes(assigneeSearch.toLowerCase())
    );

    const filteredReporters = memberList.filter((member) =>
        member.display_name.toLowerCase().includes(reporterSearch.toLowerCase())
    );

    // 저장 버튼 클릭시 PATCH 요청
    const handleSave = async () => {
        // 필수 필드 검증
        const missingFields: string[] = [];
        
        if (!formData.title || formData.title.trim() === '') {
            missingFields.push('제목');
        }
        if (!formData.description || formData.description.trim() === '') {
            missingFields.push('설명');
        }
        if (!formData.issue_type || formData.issue_type.trim() === '') {
            missingFields.push('유형');
        }
        if (!formData.status || formData.status.trim() === '') {
            missingFields.push('상태');
        }
        if (!formData.assignee_id) {
            missingFields.push('담당자');
        }
        if (!formData.reporter_id) {
            missingFields.push('보고자');
        }
        
        if (missingFields.length > 0) {
            const missingFieldNames = missingFields.join(', ');
            setError(`다음 항목을 입력해주세요: ${missingFieldNames}`);
            return;
        }

        setLoading(true);
        setError("");
        try {
            console.log("project_id: ", task.project_id, "task_id: ", task.id);
            
            const res = await fetch(
                `${getApiUrl()}/projects/${task.project_id}/${task.id}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        title: formData.title,
                        description: formData.description,
                        issueType: formData.issue_type,
                        status: formData.status,
                        assigneeId: formData.assignee_id,
                        reporterId: formData.reporter_id,
                        startDate: formData.start_date,
                        dueDate: formData.due_date,
                    }),
                }
            );
            
            if (!res.ok) throw new Error("저장 실패");
            
            // 부모 컴포넌트에게 데이터 새로고침 요청
            if (onSave) {
                onSave();
            }
            
            onClose(); // -> 저장 완료하면, 모달 닫는다.
        } catch (err: any) {
            setError(err.message || "저장 중 오류 발생"); // 저장 실패시 오류
        } finally {
            // UI 로딩 실행 종료 -> setLoading
            setLoading(false);
        }
    };

    // 삭제 버튼 클릭시 DELETE 요청
    const handleDelete = async () => {
        setLoading(true);
        setError("");
        try {
            await fetch(
                `${getApiUrl()}/projects/${task.project_id}/${task.id}`,
                {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                }
            );
            
            // 부모 컴포넌트에게 데이터 새로고침 요청
            if (onSave) {
                onSave();
            }
            
            onClose(); // 삭제 후 모달 닫기
        } catch (err: any) {
            setError(err.message || "삭제 중 오류 발생");
        } finally {
            setLoading(false);
        }
    };

    // 댓글 추가 핸들러
    const handleAddComment = (issueId: string, comment: string) => {
        // 실제 구현에서는 API 호출
        alert("댓글 기능은 추후 구현 예정입니다.");
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim() && task.id) {
            handleAddComment(String(task.id), newComment.trim());
            setNewComment("");
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-in fade-in duration-300"
                onClick={onClose}
            />
            
            {/* 모달 컨테이너 */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-2 overflow-y-auto">
                {/* 모달 */}
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-xl flex flex-col animate-in zoom-in-95 duration-300">
                    {/* 헤더 */}
                    <div className="px-4 pt-2 pb-2 flex items-center justify-between">
                        <h1 className="text-xl font-bold text-black">이슈 수정</h1>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    {/* 본문(탭/토글+내용) 스크롤 영역 */}
                    <div className="flex-1 overflow-y-scroll bg-white" style={{maxHeight: '60vh'}}>
                        <div className="flex items-center justify-between px-4 mt-2 mb-2">
                            {/* 탭 버튼 - 심플 스타일 */}
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    className={`px-4 py-2 rounded-md text-sm ${activeTab === 'details' ? 'bg-white text-black' : 'bg-transparent text-black'}`}
                                    onClick={() => setActiveTab('details')}>
                                    이슈 상세
                                </button>
                                <button
                                    className={`px-4 py-2 rounded-md text-sm ${activeTab === 'commits' ? 'bg-white text-black' : 'bg-transparent text-black'}`}
                                    onClick={() => setActiveTab('commits')}>
                                    GitHub 커밋
                                </button>
                            </div>
                            {/* 상세/댓글 토글 */}
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('comments')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${activeTab === 'comments' ? 'bg-gray-900 text-white' : 'bg-white text-black border border-gray-200'}`}
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                                    댓글 (매핑필요)
                                </button>
                            </div>
                        </div>
                        {/* 본문 내용 전체(ScrollArea, 탭별 내용 등) */}
                        <div className="flex-1 overflow-hidden">
                            <ScrollArea className="h-full">
                                <div className="p-6 space-y-6">
                                    {activeTab === "details" ? (
                                        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
                                            <div className="space-y-4">
                                                <div>
                                                <Label htmlFor="title" className="font-medium text-black">제목</Label>
                                                    <Input
                                                        id="title"
                                                        name="title"
                                                        value={formData.title}
                                                        onChange={handleChange}
                                                        placeholder="이슈 제목을 입력하세요"
                                                        className="mt-1 text-lg font-semibold text-black placeholder:text-gray-500"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="description" className="font-medium text-black">설명</Label>
                                                    <Textarea
                                                        id="description"
                                                        name="description"
                                                        value={formData.description}
                                                        onChange={handleChange}
                                                        placeholder="이슈에 대한 자세한 설명을 입력하세요"
                                                        rows={6}
                                                        className="mt-1 text-black placeholder:text-gray-500"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="issue_type" className="font-medium text-black">유형</Label>
                                                        <Select
                                                            value={formData.issue_type}
                                                            onValueChange={(value: any) => setFormData({ ...formData, issue_type: value })}
                                                        >
                                                            <SelectTrigger className="mt-1 text-black">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="text-black">
                                                                <SelectItem value="bug" className="text-black">버그</SelectItem>
                                                                <SelectItem value="story" className="text-black">스토리</SelectItem>
                                                                <SelectItem value="task" className="text-black">작업</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="status" className="font-medium text-black">상태</Label>
                                                        <Select
                                                            value={formData.status}
                                                            onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                                                        >
                                                            <SelectTrigger className="mt-1 text-black">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="text-black">
                                                                <SelectItem value="BACKLOG" className="text-black">백로그</SelectItem>
                                                                <SelectItem value="TODO" className="text-black">해야 할 일</SelectItem>
                                                                <SelectItem value="IN_PROGRESS" className="text-black">진행 중</SelectItem>
                                                                <SelectItem value="IN-REVIEW" className="text-black">리뷰 중</SelectItem>
                                                                <SelectItem value="DONE" className="text-black">완료</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="assignee_id" className="font-medium text-black">담당자</Label>
                                                        <div className="relative assignee-dropdown mt-1">
                                                            <input
                                                                type="text"
                                                                placeholder="담당자 검색"
                                                                value={assigneeSearch}
                                                                onChange={(e) =>
                                                                    setAssigneeSearch(e.target.value)
                                                                }
                                                                onFocus={(e) => {
                                                                    setShowAssigneeDropdown(true);
                                                                    e.target.select();
                                                                }}
                                                                className="px-3 py-2 bg-gray-100 text-black rounded-md text-sm w-full"
                                                            />
                                                            {showAssigneeDropdown && (
                                                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                                                                    {filteredAssignees.map((member) => (
                                                                        <div
                                                                            key={member.id}
                                                                            onClick={() =>
                                                                                handleAssigneeSelect(
                                                                                    member.id,
                                                                                    member.display_name
                                                                                )
                                                                            }
                                                                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                                                                        >
                                                                            {member.display_name}
                                                                        </div>
                                                                    ))}
                                                                    {filteredAssignees.length === 0 && (
                                                                        <div className="px-3 py-2 text-black text-sm">
                                                                            검색 결과가 없습니다.
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="reporter_id" className="font-medium text-black">보고자</Label>
                                                        <div className="relative reporter-dropdown mt-1">
                                                            <input
                                                                type="text"
                                                                placeholder="보고자 검색"
                                                                value={reporterSearch}
                                                                onChange={(e) =>
                                                                    setReporterSearch(e.target.value)
                                                                }
                                                                onFocus={(e) => {
                                                                    setShowReporterDropdown(true);
                                                                    e.target.select();
                                                                }}
                                                                className="px-3 py-2 bg-gray-100 text-black rounded-md text-sm w-full"
                                                            />
                                                            {showReporterDropdown && (
                                                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                                                                    {filteredReporters.map((member) => (
                                                                        <div
                                                                            key={member.id}
                                                                            onClick={() =>
                                                                                handleReporterSelect(
                                                                                    member.id,
                                                                                    member.display_name
                                                                                )
                                                                            }
                                                                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                                                                        >
                                                                            {member.display_name}
                                                                        </div>
                                                                    ))}
                                                                    {filteredReporters.length === 0 && (
                                                                        <div className="px-3 py-2 text-black text-sm">
                                                                            검색 결과가 없습니다.
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="start_date" className="font-medium text-black">시작일</Label>
                                                        <Input
                                                            id="start_date"
                                                            name="start_date"
                                                            type="date"
                                                            value={formData.start_date || ""}
                                                            onChange={handleChange}
                                                            className="mt-1 text-black"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="due_date" className="font-medium text-black">마감일</Label>
                                                        <Input
                                                            id="due_date"
                                                            name="due_date"
                                                            type="date"
                                                            value={formData.due_date || ""}
                                                            onChange={handleChange}
                                                            className="mt-1 text-black"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    ) : activeTab === "commits" ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-medium">GitHub 커밋 목록</h3>
                                                <Button variant="outline" size="sm">
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    커밋 연결
                                                </Button>
                                            </div>
                                            <div className="text-center py-8 text-black">
                                                <p>연결된 커밋이 없습니다.</p>
                                                <p className="text-sm mt-1">GitHub 저장소와 연결하여 커밋을 추적하세요.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-medium">댓글</h3>
                                            </div>
                                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                                                                            <div className="text-center py-8 text-black">
                                                <p>아직 댓글이 없습니다.</p>
                                                <p className="text-sm mt-1">첫 번째 댓글을 작성해보세요.</p>
                                            </div>
                                            </div>
                                            <form onSubmit={handleCommentSubmit} className="space-y-3">
                                                <Textarea
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    placeholder="댓글을 입력하세요..."
                                                    rows={3}
                                                    required
                                                    className="text-black placeholder:text-gray-500"
                                                />
                                                <div className="flex justify-end">
                                                    <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">
                                                        댓글 작성
                                                    </Button>
                                                </div>
                                            </form>
                                            <Separator />
                                            <div className="flex justify-end space-x-2">
                                                <Button type="button" variant="outline" onClick={onClose}>
                                                    닫기
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                    {/* 에러 메시지 표시 */}
                    {error && (
                        <div className="px-4 py-3 bg-amber-50 border-l-4 border-amber-400 text-amber-800 rounded-r-lg shadow-sm">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <p className="font-medium">입력이 필요합니다</p>
                                    <p className="text-sm mt-1">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* 하단 버튼 영역 */}
                    <div className="flex justify-between items-center gap-2 px-4 py-3 bg-white-50 rounded-b-lg">
                        <Button
                            onClick={handleDelete}
                            variant="destructive"
                            disabled={loading}
                        >
                            삭제
                        </Button>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={onClose}>
                                취소
                            </Button>
                            <Button type="button" className="bg-black hover:bg-gray-800 text-white" disabled={loading} onClick={handleSave}>
                                {loading ? "저장 중..." : "저장"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 커밋 목록 모달 */}
            <CommitListModal
                isOpen={showCommitModal}
                onClose={() => setShowCommitModal(false)}
                projectId={String(task.project_id)}
                taskId={String(task.id)}
            />
        </>
    );
}
