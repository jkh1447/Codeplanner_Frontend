"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/components/type";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getApiUrl } from "@/lib/api";
import TaskDrawer from "../../list/common/TaskDrawer";

export default function MyIssuesPage() {
  const [issues, setIssues] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const params = useParams();
  const projectId = params?.projectId as string;

  useEffect(() => {
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
        })));
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
        })));
      });
  };

  const handleCloseDrawer = () => {
    setSelectedTask(null);
    refreshIssues();
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">내 이슈</h1>
        <p className="text-muted-foreground">내가 담당하는 이슈들을 관리하세요</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {issues.length === 0 ? (
          <div className="col-span-3 text-center text-gray-400 py-8">내 이슈가 없습니다.</div>
        ) : (
          issues.map((issue) => (
            <Card key={issue.id} onClick={() => setSelectedTask(issue)} className="cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {issue.status === "DONE" ? "✅" : issue.status === "INPROGRESS" ? "🕒" : "⚠️"}
                  {issue.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{issue.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{issue.issue_type}</Badge>
                  <span className="text-xs text-muted-foreground">{issue.due_date || "-"}</span>
                </div>
              </CardContent>
            </Card>
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