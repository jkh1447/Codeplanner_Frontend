"use client";
import { Task } from "@/components/type";
import { getApiUrl } from "@/lib/api";
import { useState, useEffect } from "react";
import GitCommitIcon from "@/components/icons/GitCommitIcon";
import CommitListModal from "./CommitListModal";
import { ArrowBigLeftDash, GitCommitHorizontal } from "lucide-react";
import Link from "next/link";

{
    /* 이슈에 대한 카드 Drawer */
}
export default function TaskDrawer({
    task,
    onClose,
    onSave,
}: {
    task: Task; // 전달받은 task 객체 초기화
    onClose: () => void; // 전달받은 Drawer 닫기 함수
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
    const [form, setForm] = useState({
        id: task.project_id,
        title: task.title || "",
        description: task.description || "",
        issueType: task.issue_type || "",
        status: task.status || "",
        assigneeId: task.assignee_id || "",
        reporterId: task.reporter_id || "",
        startDate: formatDateForInput(task.start_date),
        dueDate: formatDateForInput(task.due_date),
    });

    // task props가 변경될 때마다 form 상태 업데이트
    useEffect(() => {
        setForm({
            id: task.project_id,
            title: task.title || "",
            description: task.description || "",
            issueType: task.issue_type || "",
            status: task.status || "",
            assigneeId: task.assignee_id || "",
            reporterId: task.reporter_id || "",
            startDate: formatDateForInput(task.start_date),
            dueDate: formatDateForInput(task.due_date),
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
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // 담당자 선택 핸들러
    const handleAssigneeSelect = (memberId: string, displayName: string) => {
        setForm((prev) => ({ ...prev, assigneeId: memberId }));
        setAssigneeSearch(displayName);
        setShowAssigneeDropdown(false);
    };

    // 보고자 선택 핸들러
    const handleReporterSelect = (memberId: string, displayName: string) => {
        setForm((prev) => ({ ...prev, reporterId: memberId }));
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
        // UI 로딩 실행중 -> setLoading
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
                        title: form.title,
                        description: form.description,
                        issueType: form.issueType,
                        status: form.status,
                        assigneeId: form.assigneeId,
                        reporterId: form.reporterId,
                        startDate: form.startDate,
                        dueDate: form.dueDate,
                    }),
                }
            );
            if (!res.ok) throw new Error("저장 실패");
            
            // 부모 컴포넌트에게 데이터 새로고침 요청
            if (onSave) {
                onSave();
            }
            
            onClose(); // -> 저장 완료하면, drawer 닫는다.
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
                `${getApiUrl()}/projects/${task.project_id}/issues/${task.id}`,
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
            
            onClose(); // 삭제 후 drawer 닫기
        } catch (err: any) {
            setError(err.message || "삭제 중 오류 발생");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-in fade-in duration-300"
                onClick={onClose}
            />
            {/* Drawer */}
            <div className="fixed top-0 right-0 h-full w-[500px] bg-white shadow-2xl z-50 drawer-slide-in flex flex-col">
                {/* Drawer 카드의 헤더 부분,  */}
                <div className="p-6 border-b border-gray-200 flex  items-center bg-gray-50">
                    <div className="flex items-center">
                        <Link
                            href={`/projects/${task.project_id}/issue/${task.id}`}
                        >
                            <ArrowBigLeftDash className="w-8 h-8 border-2 border-gray-200 rounded-sm p-1 hover:bg-gray-100 transition-colors cursor-pointer" />
                        </Link>
                    </div>
                    <div>
                        <input
                            className="text-xl ml-4 font-bold text-gray-900 bg-transparent border-b border-gray-200 focus:outline-none focus:border-blue-400 w-full"
                            name="title"
                            value={form.title} // 제목
                            onChange={handleChange} // ID
                        />
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-200"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                                {/* 본문 내용 */}
                <div className="p-6 space-y-6 max-h-[calc(100vh-180px)] overflow-y-auto flex-1">
                    {/* Type & Status */}
                    <div className="flex gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">
                                    유형
                                </label>
                                                            <select
                                name="issueType"
                                value={form.issueType}
                                onChange={handleChange}
                                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-xs"
                            >
                                {!form.issueType && <option value="">선택</option>}
                                <option value="bug">버그</option>
                                <option value="feature">기능</option>
                                <option value="task">작업</option>
                            </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">
                                    상태
                                </label>
                                                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className="px-3 py-1 bg-green-50 text-green-700 rounded-md text-xs"
                            >
                                {!form.status && <option value="">선택</option>}
                                <option value="TODO">TODO</option>
                                <option value="IN_PROGRESS">IN_PROGRESS</option>
                                <option value="DONE">DONE</option>
                            </select>
                            </div>
                        </div>
                        
                    {/* Description */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                            설명
                        </label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            className="p-4 bg-gray-50 rounded-md border border-gray-200 w-full min-h-[400px] text-sm"
                        />
                    </div>

                    {/* 커밋 링크 */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                            커밋 목록
                        </label>
                        <button
                            onClick={() => setShowCommitModal(true)}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm transition-colors duration-200"
                        >
                            <GitCommitHorizontal className="w-4 h-4" />
                            <span>GitHub 커밋 보기</span>
                        </button>
                    </div>

                    {/* Assignee & Reporter */}
                    <div className="flex gap-4">
                        <div className="space-y-1 flex-1">
                            <label className="text-sm font-medium text-gray-700">
                                담당자
                            </label>
                            <div className="relative assignee-dropdown">
                                <input
                                    type="text"
                                    placeholder="담당자 검색..."
                                    value={assigneeSearch}
                                    onChange={(e) =>
                                        setAssigneeSearch(e.target.value)
                                    }
                                    onFocus={() =>
                                        setShowAssigneeDropdown(true)
                                    }
                                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs w-full"
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
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-xs"
                                            >
                                                {member.display_name}
                                            </div>
                                        ))}
                                        {filteredAssignees.length === 0 && (
                                            <div className="px-3 py-2 text-gray-500 text-xs">
                                                검색 결과가 없습니다.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-1 flex-1">
                            <label className="text-sm font-medium text-gray-700">
                                보고자
                            </label>
                            <div className="relative reporter-dropdown">
                                <input
                                    type="text"
                                    placeholder="보고자 검색..."
                                    value={reporterSearch}
                                    onChange={(e) =>
                                        setReporterSearch(e.target.value)
                                    }
                                    onFocus={() =>
                                        setShowReporterDropdown(true)
                                    }
                                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs w-full"
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
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-xs"
                                            >
                                                {member.display_name}
                                            </div>
                                        ))}
                                        {filteredReporters.length === 0 && (
                                            <div className="px-3 py-2 text-gray-500 text-xs">
                                                검색 결과가 없습니다.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Dates */}
                    <div className="flex gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">
                                시작일
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                value={form.startDate}
                                onChange={handleChange}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs w-full"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">
                                마감일
                            </label>
                            <input
                                type="date"
                                name="dueDate"
                                value={form.dueDate}
                                onChange={handleChange}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs w-full"
                            />
                        </div>
                    </div>
                    {error && (
                        <div className="text-red-500 text-sm">{error}</div>
                    )}
                </div>
                <div className="p-4 border-t border-gray-200 flex justify-end gap-2 bg-gray-50">
                    <button
                        onClick={handleDelete}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                        disabled={loading}
                    >
                        삭제
                    </button>
                    <button
                        // 버튼 클릭시 저장
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                        // 종료 후 UI 상태 갱신
                        disabled={loading}
                    >
                        {loading ? "저장 중..." : "저장"}
                    </button>
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
