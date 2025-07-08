"use client";

import { useState, useEffect } from "react";
import { Task } from "@/components/type";
import TaskDrawer from "../../common/TaskDrawer";

export default function IssueList() {
  const [issues, setIssues] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const handleCloseDrawer = () => setSelectedTask(null);
  
  const refreshIssues = () => {
    // 데이터 새로고침 로직이 필요한 경우 여기에 추가
  };

  return (
    <div className="min-h-screen px-12 py-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">📋 목록</h1>
      <div className="grid grid-cols-1 gap-4">
        {issues.length === 0 ? (
          <div className="text-gray-500">등록된 이슈가 없습니다.</div>
        ) : (
          issues.map((issue) => (
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