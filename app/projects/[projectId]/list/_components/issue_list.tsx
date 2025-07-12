"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, MoreHorizontal, Trash2, User, Calendar, MessageSquare, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams } from "next/navigation";
import TaskDrawer from "../common/TaskDrawer";
import AddIssueModal from "../../board/_components/AddIssueModal";
import { getApiUrl } from "@/lib/api";
import { Issue as Task, User as UserType, Label as LabelType, Comment as CommentType, Id } from "@/components/type";

// 상태별 색상
const statusColors: Record<string, string> = {
  Backlog: "bg-gray-100 text-gray-800 border-gray-200",
  Todo: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "In Progress": "bg-blue-100 text-blue-800 border-blue-200",
  Done: "bg-green-100 text-green-800 border-green-200",
};

const ITEMS_PER_PAGE = 10;

export default function IssueManagement() {
  // 실제 데이터 상태
  const [issues, setIssues] = useState<Task[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [labels, setLabels] = useState<LabelType[]>([]);
  const [issueLabels, setIssueLabels] = useState<{ issue_id: Id; label_id: Id }[]>([]);
  const [comments, setComments] = useState<CommentType[]>([]); 
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("전체");
  const [statusFilter, setStatusFilter] = useState<string>("전체");
  const [selectedIssue, setSelectedIssue] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [displayedIssues, setDisplayedIssues] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const params = useParams();
  const projectId = params?.projectId as string;

  // useRef로 최신값 추적
  const pageRef = useRef(page);
  const isLoadingRef = useRef(isLoading);
  const hasMoreRef = useRef(hasMore);

  useEffect(() => { pageRef.current = page; }, [page]);
  useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);

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
          // position, tag 기본값 보완 (Task 타입에 필요하다면)
          position: typeof issue.position === 'number' ? issue.position : 0,
          tag: typeof issue.tag === 'string' ? issue.tag : '',
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

  // 이슈 수정/저장
  const handleSaveIssue = async (updatedIssue: Task) => {
    try {
      // position, tag는 타입에 없으면 그대로 전달
      await refreshIssues();
      setIsEditModalOpen(false);
      setIsCreateModalOpen(false);
    } catch (err) {
      alert("이슈 저장에 실패했습니다.");
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

  // TaskDrawer 핸들러
  const handleCloseDrawer = () => setSelectedTask(null);

  // 이슈 클릭 시 상세 모달 오픈
  const handleIssueClick = (issue: Task) => {
    setSelectedIssue(issue);
    setIsEditModalOpen(true);
  };

  // 이슈 생성 모달 오픈
  const handleCreateIssue = () => {
    setSelectedIssue(null);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 필터 영역 */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="이슈 검색..."
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
            <SelectItem value="전체">전체</SelectItem>
            <SelectItem value="Bug">Bug</SelectItem>
            <SelectItem value="Story">Story</SelectItem>
            <SelectItem value="Task">Task</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="전체">전체</SelectItem>
            <SelectItem value="Backlog">Backlog</SelectItem>
            <SelectItem value="Todo">Todo</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Done">Done</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleCreateIssue} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          이슈 추가
        </Button>
      </div>

      {/* 이슈 리스트 */}
      <div className="space-y-4">
        {displayedIssues.map((issue) => (
          <Card
            key={issue.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => {
              // TaskDrawer 대신 새 페이지로 이동
              window.location.href = `/projects/${projectId}/list/${issue.id}`;
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{issue.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{issue.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>담당: {issue.assignee_id || "-"}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>보고: {issue.reporter_id || "-"}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {issue.start_date || "-"} ~ {issue.due_date || "-"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Badge className={`${statusColors[issue.status] ?? 'bg-gray-200 text-gray-600 border-gray-200'} text-xs`}>
                    {issue.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/projects/${projectId}/list/${issue.id}`;
                        }}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        상세 보기
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteIssue(String(issue.id));
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="flex items-center space-x-2 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>이슈를 불러오는 중...</span>
            </div>
          </div>
        )}
        {!hasMore && displayedIssues.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>모든 이슈를 불러왔습니다.</p>
            <p className="text-sm mt-1">총 {displayedIssues.length}개의 이슈</p>
          </div>
        )}
        {displayedIssues.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500">
            <p>검색 조건에 맞는 이슈가 없습니다.</p>
            <p className="text-sm mt-1">다른 검색어나 필터를 시도해보세요.</p>
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
    </div>
  );
}

// 이슈 상세/수정 폼 (댓글, 커밋 탭 등 포함)
interface IssueFormProps {
  issue: Task;
  onSave: (issue: Task) => void;
  onCancel: () => void;
  onAddComment: (issueId: string, comment: string) => void;
}

function IssueForm({ issue, onSave, onCancel, onAddComment }: IssueFormProps) {
  const [formData, setFormData] = useState<Task>(issue);
  const [activeTab, setActiveTab] = useState<"details" | "commits" | "comments">("details");
  const [newComment, setNewComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // position, tag 기본값 보완 (Task 타입에 필요하다면)
    onSave({
      ...formData,
      position: typeof formData.position === 'number' ? formData.position : 0,
      tag: typeof formData.tag === 'string' ? formData.tag : '',
    });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && issue.id) {
      onAddComment(String(issue.id), newComment.trim());
      setNewComment("");
    }
  };

  return (
    <ScrollArea className="max-h-[calc(90vh-120px)]">
      <div className="space-y-6 pr-4">
        {/* Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "details" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              이슈 상세
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("commits")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "commits" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              GitHub 커밋 (0)
            </button>
          </div>

          <div className="flex space-x-2">
            <Button
              type="button"
              variant={activeTab === "details" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("details")}
            >
              상세
            </Button>
            <Button
              type="button"
              variant={activeTab === "comments" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("comments")}
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              댓글 (0)
            </Button>
          </div>
        </div>

        {activeTab === "details" ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="이슈 제목을 입력하세요"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="이슈에 대한 자세한 설명을 입력하세요"
                  rows={4}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">유형</Label>
                  <Select
                    value={formData.issue_type}
                    onValueChange={(value: any) => setFormData({ ...formData, issue_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bug">Bug</SelectItem>
                      <SelectItem value="Story">Story</SelectItem>
                      <SelectItem value="Task">Task</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">상태</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Backlog">Backlog</SelectItem>
                      <SelectItem value="Todo">Todo</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assignee">담당자</Label>
                  <Input
                    id="assignee"
                    value={formData.assignee_id || ""}
                    onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
                    placeholder="담당자 이름을 입력하세요"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="reporter">보고자</Label>
                  <Input
                    id="reporter"
                    value={formData.reporter_id || ""}
                    onChange={(e) => setFormData({ ...formData, reporter_id: e.target.value })}
                    placeholder="보고자 이름을 입력하세요"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">시작일</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date || ""}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="due_date">마감일</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date || ""}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
            <Separator />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                취소
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                저장
              </Button>
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
            <div className="text-center py-8 text-gray-500">
              <p>연결된 커밋이 없습니다.</p>
              <p className="text-sm mt-1">GitHub 저장소와 연결하여 커밋을 추적하세요.</p>
            </div>
            <Separator />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                닫기
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">댓글</h3>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="text-center py-8 text-gray-500">
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
              />
              <div className="flex justify-end">
                <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">
                  댓글 작성
                </Button>
              </div>
            </form>
            <Separator />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                닫기
              </Button>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
