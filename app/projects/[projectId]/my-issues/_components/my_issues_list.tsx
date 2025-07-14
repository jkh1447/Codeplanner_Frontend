"use client";

import { Task } from "@/components/type";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { getApiUrl } from "@/lib/api";
import TaskDrawer from "../../list/common/TaskDrawer";
import MyIssueCard from "./my_issue_card";
import { Select, SelectValue, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Book, Bug, SquareCheckBig } from "lucide-react";

export default function MyIssuesPage() {
  const [typeFilter, setTypeFilter] = useState<string>("전체");
  const [statusFilter, setStatusFilter] = useState<string>("전체");
  const [issues, setIssues] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [displayedIssues, setDisplayedIssues] = useState<Task[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const ITEMS_PER_PAGE = 10;
  const params = useParams();
  const projectId = params?.projectId as string;
  const typeOptions: { value: string; label: string; icon: ReactNode }[] = [
    { value: "전체", label: "유형 전체", icon: <></> },
    { value: "bug", label: "버그", icon: <Bug className="w-5 h-5 mr-1" color="#ff0000" /> },
    { value: "story", label: "스토리", icon: <Book className="w-5 h-5 mr-1" color="#ff9500" /> },
    { value: "task", label: "작업", icon: <SquareCheckBig className="w-5 h-5 mr-1" color="#3729ff" /> },
  ];
  const statusOptions: { value: string; label: string }[] = [
    { value: "전체", label: "상태 전체" },
    { value: "BACKLOG", label: "백로그" },
    { value: "TODO", label: "해야 할 일" },
    { value: "IN_PROGRESS", label: "진행 중" },
    { value: "IN_REVIEW", label: "리뷰 중" },
    { value: "DONE", label: "완료" },
  ];
  
  useEffect(() => {
    fetch(`${getApiUrl()}/projects/${projectId}/my-issues`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data: any[]) => {
        const mapped = data.map(issue => ({
          ...issue,
          project_id: issue.projectId,
          assignee_id: issue.assigneeId,
          reporter_id: issue.reporterId,
          issue_type: issue.issueType,
          start_date: issue.startDate,
          due_date: issue.dueDate,
          tag: issue.tag,
          labels: issue.labels,
        }));
        setIssues(mapped);
        mapped.forEach((issue) => {
          console.log("이슈 ID:", issue.id, "labels:", issue.labels);
        });
      });
  }, [projectId]);

  const refreshIssues = () => {
    fetch(`${getApiUrl()}/projects/${projectId}/my-issues`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data: any[]) => {
        setIssues(data.map(issue => ({
          ...issue,
          project_id: issue.projectId,
          assignee_id: issue.assigneeId,
          reporter_id: issue.reporterId,
          issue_type: issue.issueType,
          start_date: issue.startDate,
          due_date: issue.dueDate,
          tag: issue.tag,
          labels: issue.labels,
        })));
      });
  };

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesSearch =
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (issue.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "전체" || issue.issue_type === typeFilter;
      const matchesStatus = statusFilter === "전체" || issue.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [issues, typeFilter, statusFilter]);

  useEffect(() => {
    setDisplayedIssues(filteredIssues.slice(0, ITEMS_PER_PAGE));
    setPage(1);
    setHasMore(filteredIssues.length > ITEMS_PER_PAGE);
  }, [filteredIssues]);

  const handleCloseDrawer = () => {
    setSelectedTask(null);
    refreshIssues();
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">내 이슈</h1>
        <p className="text-muted-foreground">내가 담당하는 이슈들을 관리하세요</p>
        <div className="flex justify-end mt-6">
          <span className="flex items-center gap-2">
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
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {issues.length === 0 ? (
          <div className="col-span-3 text-center text-gray-400 py-8">내 이슈가 없습니다.</div>
        ) : (
          displayedIssues.map((issue) => (
            <MyIssueCard key={issue.id} issue={issue} />
          ))
        )}
      </div>
      {selectedTask && (
        <TaskDrawer 
          task={selectedTask} 
          onClose={handleCloseDrawer} 
          onSave={refreshIssues}
        />
      )}
    </div>
  );
}