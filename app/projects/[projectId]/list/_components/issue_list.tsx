"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, MoreHorizontal, Trash2, User, Calendar, MessageSquare, Loader2, SquareCheckBig, BookOpen, ClipboardList, Book, Bug, Flame } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useParams } from "next/navigation";
import TaskDrawer from "../common/TaskDrawer";
import AddIssueModal from "../../board/_components/AddIssueModal";
import { getApiUrl } from "@/lib/api";
import { Task, User as UserType, Label as LabelType, Comment as CommentType, Id } from "@/components/type";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import type { ReactNode } from "react";

// 상태별 색상
const statusColors: Record<string, string> = {
  Backlog: "bg-gray-100 text-gray-800 border-gray-200",
  Todo: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "In Progress": "bg-blue-100 text-blue-800 border-blue-200",
  Done: "bg-green-100 text-green-800 border-green-200",
};

// 상태, 유형 한글 매핑 객체 추가
const statusMap: Record<string, string> = {
  BACKLOG: "백로그",
  TODO: "해야 할 일",
  IN_PROGRESS: "진행 중",
  IN_REVIEW: "리뷰 중",
  DONE: "완료",
};
const typeMap: Record<string, string> = {
  bug: "버그",
  story: "핫픽스",
  task: "작업",
};

// 문자열 자르기 함수
function truncate(str: string, n: number) {
  return str && str.length > n ? str.slice(0, n) + "..." : str;
}

const ITEMS_PER_PAGE = 10;

export default function IssueManagement() {
  // 실제 데이터 상태
  const [issues, setIssues] = useState<Task[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [labels, setLabels] = useState<LabelType[]>([]);
  // [불필요한 상태 제거]
  // const [issueLabels, setIssueLabels] = useState<{ issue_id: Id; label_id: Id }[]>([]);
  // const [comments, setComments] = useState<CommentType[]>([]); 
  const [searchTerm, setSearchTerm] = useState("");
  // [typeFilter/statusFilter 값 통일]
  // typeFilter/statusFilter는 실제 데이터와 대소문자 일치 필요
  const typeOptions: { value: string; label: string; icon: ReactNode }[] = [
      { value: "전체", label: "유형 전체", icon: <></> },
      {
          value: "bug",
          label: "버그",
          icon: <Bug className="w-5 h-5 mr-1" color="#008000" />,
      },
      {
          value: "story",
          label: "핫픽스",
          icon: <Flame className="w-5 h-5 mr-1" color="#ff0000" />,
      },
      {
          value: "task",
          label: "작업",
          icon: <SquareCheckBig className="w-5 h-5 mr-1" color="#3729ff" />,
      },
  ];
  const statusOptions: { value: string; label: string }[] = [
    { value: "전체", label: "상태 전체" },
    { value: "BACKLOG", label: "백로그" },
    { value: "TODO", label: "해야 할 일" },
    { value: "IN_PROGRESS", label: "진행 중" },
    { value: "IN_REVIEW", label: "리뷰 중" },
    { value: "DONE", label: "완료" },
  ];
  const [typeFilter, setTypeFilter] = useState<string>("전체");
  const [statusFilter, setStatusFilter] = useState<string>("전체");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [displayedIssues, setDisplayedIssues] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // 미사용 상태 제거
  // const [project, setProject] = useState<{ project_key: string } | null>(null); // 삭제
  const params = useParams();
  const projectId = params?.projectId as string;

  // useRef로 최신값 추적
  const pageRef = useRef(page);
  const isLoadingRef = useRef(isLoading);
  const hasMoreRef = useRef(hasMore);

  useEffect(() => { pageRef.current = page; }, [page]);
  useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);

  // 사용자 목록 가져오기 함수
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/projects/${projectId}/members`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error("사용자 목록 불러오기 실패");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("사용자 목록 불러오기 실패:", err);
      setUsers([]);
    }
  };

  // 이슈 목록 새로고침 함수
  const refreshIssues = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${getApiUrl()}/projects/${projectId}/issues`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error("이슈 목록 불러오기 실패");
      const data = await res.json();
      setIssues(
        data.map((issue: any, idx: number) => ({
          ...issue,
          project_id: issue.projectId,
          assignee_id: issue.assigneeId,
          reporter_id: issue.reporterId,
          issue_type: issue.issueType,
          start_date: issue.startDate,
          due_date: issue.dueDate,
          position: issue.position || 0,
          tag: issue.tag || "",
          labels: issue.labels || [],
        }))
      );
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setIssues([]);
    }
  };

  useEffect(() => {
    refreshIssues();
    fetchUsers();
  }, [projectId]);

  // 필터링된 이슈들 (useMemo로 메모이제이션)
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesSearch =
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (issue.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "전체" || issue.issue_type === typeFilter;
      const matchesStatus = statusFilter === "전체" || issue.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [issues, searchTerm, typeFilter, statusFilter]);

  // 페이지네이션 (의존성 수정)
  useEffect(() => {
    setDisplayedIssues(filteredIssues.slice(0, ITEMS_PER_PAGE));
    setPage(1);
    setHasMore(filteredIssues.length > ITEMS_PER_PAGE);
  }, [filteredIssues]);

  // 더 많은 이슈 로드 (useCallback → 일반 함수, useRef 사용)
  const loadMoreIssues = () => {
    if (isLoadingRef.current || !hasMoreRef.current) return;
    setIsLoading(true);
    setTimeout(() => {
      const nextPage = pageRef.current + 1;
      const startIndex = (nextPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const newIssues = filteredIssues.slice(startIndex, endIndex);
      if (newIssues.length > 0) {
        setDisplayedIssues((prev) => [...prev, ...newIssues]);
        setPage(nextPage);
        setHasMore(endIndex < filteredIssues.length);
      } else {
        setHasMore(false);
      }
      setIsLoading(false);
    }, 500);
  };

  // 스크롤 이벤트 핸들러 (의존성 빈 배열)
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        loadMoreIssues();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 이슈 생성
  const createTask = async (formData: any) => {
    try {
      // 날짜 변환
      const start_date = formData.startDate
        ? (typeof formData.startDate === 'string' ? formData.startDate : formData.startDate.toISOString().split("T")[0])
        : undefined;
      const due_date = formData.dueDate
        ? (typeof formData.dueDate === 'string' ? formData.dueDate : formData.dueDate.toISOString().split("T")[0])
        : undefined;
      // 서버에 보낼 데이터 구조로 변환
      const apiData = {
        project_id: projectId,
        title: formData.title,
        description: formData.description,
        issue_type: formData.issueType,
        status: formData.status,
        assignee_id: formData.assigneeId,
        reporter_id: formData.reporterId,
        start_date,
        due_date,
      };
      const response = await fetch(`${getApiUrl()}/projects/${projectId}/issues/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(apiData),
      });
      if (!response.ok) throw new Error("이슈 생성 실패");
      await refreshIssues();
      alert("이슈가 성공적으로 등록되었습니다!");
    } catch (err) {
      alert("이슈 생성에 실패했습니다.");
    }
  };



  // 이슈 삭제
  const handleDeleteIssue = async (issueId: string) => {
    try {
      // 실제 구현에서는 API 호출로 삭제
      // 예시: DELETE /projects/:projectId/issues/:issueId
      setDisplayedIssues(displayedIssues.filter((issue) => String(issue.id) !== String(issueId)));
      await refreshIssues();
    } catch (err) {
      alert("이슈 삭제에 실패했습니다.");
    }
  };

  // 댓글 추가 (실제 구현 필요)
  const handleAddComment = (issueId: string, comment: string) => {
    // 실제 구현에서는 API 호출
    // selectedIssue 업데이트 등
    alert("댓글 기능은 추후 구현 예정입니다.");
  };

  // 사용자 ID를 display_name으로 변환하는 헬퍼 함수
  const getUserDisplayName = (userId: string | number | null | undefined): string => {
    if (!userId) return "-";
    const user = users.find(u => String(u.id) === String(userId));
    return user?.display_name || String(userId);
  };

  // TaskDrawer 핸들러
  const handleCloseDrawer = () => setSelectedTask(null);

  // 이슈 클릭 시 TaskDrawer 모달 오픈
  const handleIssueClick = (issue: Task) => {
    setSelectedTask(issue);
  };

  // 이슈 생성 모달 오픈
  const handleCreateIssue = () => {
    setIsCreateModalOpen(true);
  };

  const typeIcon: Record<string, ReactNode> = {
      bug: <Bug className="w-4 h-4 mr-1 inline" color="#008000" />,
      story: <Flame className="w-4 h-4 mr-1 inline" color="#ff0000" />,
      task: <SquareCheckBig className="w-4 h-4 mr-1 inline" color="#3729ff" />,
  };

  const statusOrder: Record<string, number> = {
    BACKLOG: 0,
    TODO: 1,
    IN_PROGRESS: 2,
    IN_REVIEW: 3,
    DONE: 4,
  };

  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  function compare(a: any, b: any, key: string, order: "asc" | "desc") {
    let v1 = a[key];
    let v2 = b[key];
    if (key === "due_date") {
      v1 = v1 ? new Date(v1).getTime() : 0;
      v2 = v2 ? new Date(v2).getTime() : 0;
    }
    if (v1 === undefined || v1 === null) v1 = "";
    if (v2 === undefined || v2 === null) v2 = "";
    if (v1 < v2) return order === "asc" ? -1 : 1;
    if (v1 > v2) return order === "asc" ? 1 : -1;
    return 0;
  }

  const sortedIssues = [...filteredIssues].sort((a, b) => {
    if (!sortBy) {
      // 기본: 상태 → 마감기한 오름차순
      const s1 = statusOrder[a.status] ?? 99;
      const s2 = statusOrder[b.status] ?? 99;
      if (s1 !== s2) return s1 - s2;
      // 같은 상태면 마감기한 오름차순
      const d1 = a.due_date ? new Date(a.due_date).getTime() : 0;
      const d2 = b.due_date ? new Date(b.due_date).getTime() : 0;
      return d1 - d2;
    } else {
      return compare(a, b, sortBy, sortOrder);
    }
  });

  function handleSort(col: string) {
    if (sortBy === col) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortOrder("asc");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 페이지 제목 및 설명 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">전체 이슈 목록</h1>
        <p className="text-gray-600">해당 페이지에서 전체 이슈를 한 눈에 확인하세요. 각 항목의 헤더를 클릭하여 정렬 가능합니다.</p>
      </div>

      {/* 필터 영역 */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="이슈 제목 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="유형" />
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                <span className="flex items-center">{opt.icon}{opt.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="상태" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 이슈 테이블 */}
      <div className="overflow-x-auto bg-white rounded-lg shadow border">
        <table className="min-w-full text-sm align-middle">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-3 py-2 font-semibold text-left cursor-pointer" onClick={() => handleSort("issue_type")}>유형 {sortBy === "issue_type" && (sortOrder === "asc" ? "▲" : "▼")}</th>
              <th className="px-3 py-2 font-semibold text-left cursor-pointer" onClick={() => handleSort("tag")}>키 {sortBy === "tag" && (sortOrder === "asc" ? "▲" : "▼")}</th>
              <th className="px-3 py-2 font-semibold text-left cursor-pointer" onClick={() => handleSort("title")}>제목 {sortBy === "title" && (sortOrder === "asc" ? "▲" : "▼")}</th>
              <th className="px-3 py-2 font-semibold text-left cursor-pointer" onClick={() => handleSort("description")}>요약 {sortBy === "description" && (sortOrder === "asc" ? "▲" : "▼")}</th>
              <th className="px-3 py-2 font-semibold text-left cursor-pointer" onClick={() => handleSort("status")}>상태 {sortBy === "status" && (sortOrder === "asc" ? "▲" : "▼")}</th>
              <th className="px-3 py-2 font-semibold text-left cursor-pointer" onClick={() => handleSort("assignee_id")}>담당자 {sortBy === "assignee_id" && (sortOrder === "asc" ? "▲" : "▼")}</th>
              <th className="px-3 py-2 font-semibold text-left cursor-pointer" onClick={() => handleSort("reporter_id")}>보고자 {sortBy === "reporter_id" && (sortOrder === "asc" ? "▲" : "▼")}</th>
              <th className="px-3 py-2 font-semibold text-left cursor-pointer" onClick={() => handleSort("due_date")}>마감기한 {sortBy === "due_date" && (sortOrder === "asc" ? "▲" : "▼")}</th>
              <th className="px-3 py-2 font-semibold text-left" >댓글 </th>
              <th className="px-3 py-2 font-semibold text-left">레이블</th>
            </tr>
          </thead>
          <tbody>
            {sortedIssues.length === 0 && !isLoading ? (
              <tr>
                <td colSpan={10} className="text-center py-8 text-gray-500">검색 조건에 맞는 이슈가 없습니다.</td>
              </tr>
            ) : (
              sortedIssues.map((issue) => (
                <tr
                  key={issue.id}
                  className="transition rounded-md shadow-sm hover:shadow-md hover:bg-gray-50 cursor-pointer border-b border-b-gray-200"
                  onClick={() => setSelectedTask(issue)}
                >
                  {/* 유형 */}
                  <td className="px-3 py-2 border-r border-r-gray-200">
                    <span className="flex items-center">
                      {typeIcon[issue.issue_type]}
                      {typeMap[issue.issue_type] || issue.issue_type}
                    </span>
                  </td>
                  
                  {/* 키 */}
                  <td className="px-3 py-2 font-mono text-m text-gray-700 border-r border-r-gray-200">{issue.tag}
                  </td>

                  {/* 제목 */}
                  <td className="px-3 py-2 max-w-xs truncate border-r border-r-gray-200">{issue.title}
                  </td>

                  {/* 요약 */}
                  <td className="px-3 py-2 max-w-xs truncate border-r border-r-gray-200">
                    {truncate(issue.description || "", 60)}
                  </td>

                  {/* 상태 */}
                  <td className="px-3 py-2 border-r border-r-gray-200">
                    <span className={
                      issue.status === 'BACKLOG' ? 'bg-slate-300 text-black-800' :
                      issue.status === 'TODO' ? 'bg-purple-300 text-black-800' :
                      issue.status === 'IN_PROGRESS' ? 'bg-green-300 text-black-800' :
                      issue.status === 'IN_REVIEW' ? 'bg-yellow-300 text-black-800' :
                      issue.status === 'DONE' ? 'bg-indigo-300 text-black-800' :
                      'bg-blue-100 text-blue-800'
                    + ' px-2 py-1 rounded text-xs font-semibold border'
                    }>
                      {statusMap[issue.status] || issue.status}
                    </span>
                  </td>

                  {/* 담당자 */}
                  <td className="px-3 py-2 border-r border-r-gray-200">
                    <span className="inline-flex items-center gap-1">
                      <span className="inline-block w-6 h-6 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center font-bold">
                        {getUserDisplayName(issue.assignee_id).charAt(0)}
                      </span>
                      <span>{getUserDisplayName(issue.assignee_id)}</span>
                    </span>
                  </td>

                  {/* 보고자 */}
                  <td className="px-3 py-2 border-r border-r-gray-200">
                    <span className="inline-flex items-center gap-1">
                      <span className="inline-block w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                        {getUserDisplayName(issue.reporter_id).charAt(0)}
                      </span>
                      <span>{getUserDisplayName(issue.reporter_id)}</span>
                    </span>
                  </td>
                  
                  {/* 마감기한 */}
                  <td className="px-3 py-2 border-r border-r-gray-200">
                    {issue.due_date ? (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {format(new Date(issue.due_date), "yyyy년 MM월 dd일", { locale: ko })}
                      </span>
                    ) : '-'}
                  </td>

                  {/* 댓글 */}
                  <td className="px-3 py-2 border-r border-r-gray-200">
                    <Link
                      href={`/projects/${issue.project_id}/issue/${issue.id}`}
                      className="inline-flex items-center gap-1 text-gray-500 hover:underline"
                      onClick={e => e.stopPropagation()}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>댓글 추가</span>
                    </Link>
                  </td>

                  {/* 레이블 (마지막 열, border-r 없음) */}
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {issue.labels && issue.labels.length > 0 ? (
                        issue.labels.map(label => (
                          <span key={label.id} className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: label.color, color: '#fff' }}>{label.name}</span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="flex items-center space-x-2 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>이슈를 불러오는 중...</span>
            </div>
          </div>
        )}
        {sortedIssues.length > 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500 text-sm">
            모든 이슈를 불러왔습니다. (총 {sortedIssues.length}개)
          </div>
        )}
      </div>

      {/* Create Issue Modal */}
      {isCreateModalOpen && (
        <AddIssueModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          projectId={projectId}
          createTask={createTask}
          current_user={null}
        />
      )}

      {/* TaskDrawer Modal */}
      {selectedTask && (
        <TaskDrawer
          task={selectedTask}
          onClose={handleCloseDrawer}
          onSave={() => {
            refreshIssues();
            handleCloseDrawer();
          }}
        />
      )}
    </div>
  );
}
