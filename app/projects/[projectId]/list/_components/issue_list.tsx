"use client";

import { useEffect, useState } from "react";
import Header from "../../../../../components/header";
import { Issue, User, Label, Comment, Id, Task } from "@/components/type";
import PlusIcon from "@/components/icons/PlusIcon";
import { getApiUrl } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import TaskDrawer from "../common/TaskDrawer";
import { useParams } from "next/navigation";

// 이슈 상세 모달
function IssueDetailModal({ open, onOpenChange, issue, assignee, reporter, labels, comments }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issue: Issue | null;
  assignee?: User;
  reporter?: User;
  labels: Label[];
  comments: Comment[];
}) {
  if (!issue) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{issue.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <div className="text-sm text-gray-500">{issue.issue_type} | 상태: {issue.status}</div>
          <div className="text-base whitespace-pre-line mb-2">{issue.description}</div>
          <div className="flex gap-2 text-xs">
            <span>담당자: {assignee?.display_name || issue.assignee_id || "없음"}</span>
            <span>보고자: {reporter?.display_name || issue.reporter_id}</span>
            <span>마감일: {issue.due_date || "-"}</span>
          </div>
          <div className="flex gap-2 mt-2">
            {labels.map(label => (
              <span key={label.id} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{label.name}</span>
            ))}
          </div>
          <div className="mt-4">
            <div className="font-semibold mb-1">댓글({comments.length})</div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {comments.length === 0 ? (
                <div className="text-gray-400 text-sm">댓글이 없습니다.</div>
              ) : (
                comments.map(c => (
                  <div key={c.id} className="bg-gray-50 rounded p-2 text-sm">
                    <div className="font-semibold text-xs mb-1">{c.author_id}</div>
                    <div>{c.content}</div>
                    <div className="text-gray-400 text-xs mt-1">{new Date(c.created_at).toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>닫기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 이슈 카드
function IssueCard({ issue, assignee, labels, commentCount, onClick }: {
  issue: Issue;
  assignee?: User;
  labels: Label[];
  commentCount: number;
  onClick: () => void;
}) {
  return (
    <div className="bg-white p-4 rounded-xl border mb-3 shadow hover:shadow-lg cursor-pointer" onClick={onClick}>
      <div className="flex items-center gap-2 mb-1">
        <span className="font-semibold text-base">{issue.title}</span>
        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">{issue.status}</span>
        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">{issue.issue_type}</span>
      </div>
      <div className="text-xs text-gray-500 mb-1 truncate">{issue.description}</div>
      <div className="flex gap-2 text-xs mb-1">
        <span>담당: {assignee?.display_name || issue.assignee_id || "없음"}</span>
        <span>마감: {issue.due_date || "-"}</span>
      </div>
      <div className="flex gap-1 mb-1">
        {labels.map(label => (
          <span key={label.id} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{label.name}</span>
        ))}
      </div>
      <div className="text-xs text-gray-400">💬 {commentCount}</div>
    </div>
  );
}

export default function IssueList() {
  const [issues, setIssues] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [issueLabels, setIssueLabels] = useState<{ issue_id: Id; label_id: Id }[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const params = useParams();
  const projectId = params?.projectId as string;

  const handleCloseDrawer = () => setSelectedTask(null);

  useEffect(() => {
        fetch(`${getApiUrl()}/projects/${projectId}/issues`, {
    credentials: 'include',
  })
    .then((res) => {
      if (!res.ok) throw new Error("이슈 목록 불러오기 실패");
      return res.json();
    })
    .then((data: any[]) => setIssues(
      data.map(issue => ({
        ...issue,
        project_id: issue.projectId,
        assignee_id: issue.assigneeId,
        reporter_id: issue.reporterId,
        issue_type: issue.issueType,
        start_date: issue.startDate,
        due_date: issue.dueDate,
      }))
    ))
    .catch((err) => {
      console.error(err);
      setIssues([]);
    });
}, [projectId]);

  // 검색 필터링
  const filtered = issues.filter(issue =>
    issue.title.toLowerCase().includes(search.toLowerCase()) ||
    (issue.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
            <PlusIcon /> 이슈 추가
          </Button>
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="이슈 검색"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          {filtered.length === 0 ? (
            <div className="text-center text-gray-400 py-8">이슈가 없습니다.</div>
          ) : (
            filtered.map(issue => {
              const assignee = users.find(u => u.id === issue.assignee_id);
              const issueLabelIds = issueLabels.filter(il => il.issue_id === issue.id).map(il => il.label_id);
              const issueLabelsList = labels.filter(l => issueLabelIds.includes(l.id));
              const commentCount = comments.filter(c => c.issue_id === issue.id).length;
              return (
                <div
                  key={issue.id}
                  onClick={() => setSelectedTask(issue)}
                  className="border rounded-lg p-4 shadow-sm hover:shadow-md transition bg-white"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-lg font-semibold">{issue.title}</div>
                    <span className="text-sm text-gray-500">{issue.status}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {issue.description || "설명이 없습니다"}
                  </p>
                  <div className="text-xs text-gray-400">
                    담당자: {issue.assignee_id || "-"}
                  </div>
                  <div className="text-xs text-gray-400">
                    보고자: {issue.reporter_id || "-"}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    시작: {issue.start_date || "-"}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    마감: {issue.due_date || "-"}
                  </div>
                </div>
              );
            })
          )}
        </div>
        {selectedTask && (
          <TaskDrawer task={{ ...selectedTask, project_id: projectId}} onClose={handleCloseDrawer} />
        )}
      </main>
    </div>
  );
} 