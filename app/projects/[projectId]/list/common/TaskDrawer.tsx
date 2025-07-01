"use client";
import { Task } from "@/components/type";
import { useState } from "react";
import { getApiUrl } from "@/lib/api";

{/* 이슈에 대한 카드 Drawer */}
export default function TaskDrawer({
  task,
  onClose,
}: {
  task: Task; // 전달받은 task 객체 초기화
  onClose: () => void; // 전달받은 Drawer 닫기 함수
}) {
  // 폼 상태 관리 - task로부터 초기 값 설정
  const [form, setForm] = useState({
    id: task.project_id,
    title: task.title || "",
    description: task.description || "",
    issueType: task.issue_type || "",
    status: task.status || "",
    assigneeId: task.assignee_id || "",
    reporterId: task.reporter_id || "",
    startDate: task.start_date || "",
    dueDate: task.due_date || "",
  });

  // 로딩 및 에러 상태값 정의
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 폼 값 변경해주는 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 저장 버튼 클릭시 PATCH 요청
  const handleSave = async () => {
    // UI 로딩 실행중 -> setLoading
    setLoading(true);
    setError("");
    try {
      console.log("project_id: ", task.project_id, "task_id: ", task.id);
      const res = await fetch(`${getApiUrl()}/projects/${task.project_id}/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
      });
      if (!res.ok) throw new Error("저장 실패");
      onClose(); // -> 저장 완료하면, drawer 닫는다.
    } catch (err: any) {
      setError(err.message || "저장 중 오류 발생"); // 저장 실패시 오류
    } finally {
      // UI 로딩 실행 종료 -> setLoading
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
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <input
              className="text-xl font-bold text-gray-900 bg-transparent border-b border-gray-200 focus:outline-none focus:border-blue-400 w-full"
              name="title"
              value={form.title}
              onChange={handleChange}
            />
            <p className="text-sm text-gray-500 mt-1">Task ID: {task.id}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-6 max-h-[calc(100vh-180px)] overflow-y-auto flex-1">
          {/* Type & Status */}
          <div className="flex gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">유형</label>
              <select
                name="issueType"
                value={form.issueType}
                onChange={handleChange}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-xs"
              >
                <option value="">선택</option>
                <option value="bug">버그</option>
                <option value="feature">기능</option>
                <option value="task">작업</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">상태</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="px-3 py-1 bg-green-50 text-green-700 rounded-md text-xs"
              >
                <option value="">선택</option>
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>
            </div>
          </div>
          {/* Description */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">설명</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="p-4 bg-gray-50 rounded-md border border-gray-200 w-full min-h-[80px] text-sm"
            />
          </div>
          {/* Assignee & Reporter */}
          <div className="flex gap-4">
            <div className="space-y-1">
              {/* 지금 불러오는건 ID 값 자체를 불러오기 때문에, ID로 넣어야함. 더미데이터 추가되면, 그 아이디로 넣어서 확인해야 하고, 추후 변경 필요 
                  나중에 이메일도 좋을 것 같고, 닉네임이나 이런걸로 변경하는걸 얘기해보면 될 듯 - 윤호가 해결할 문제임 */}
              <label className="text-sm font-medium text-gray-700">담당자</label>
              <input
                name="assigneeId"
                value={form.assigneeId}
                onChange={handleChange}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs w-full"
              />
            </div>
            <div className="space-y-1">
              {/* 지금 불러오는건 ID 값 자체를 불러오기 때문에, ID로 넣어야함. 더미데이터 추가되면, 그 아이디로 넣어서 확인해야 하고, 추후 변경 필요 
                  나중에 이메일도 좋을 것 같고, 닉네임이나 이런걸로 변경하는걸 얘기해보면 될 듯 - 윤호가 해결할 문제임 */}
              <label className="text-sm font-medium text-gray-700">보고자</label>
              <input
                name="reporterId"
                value={form.reporterId}
                onChange={handleChange}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs w-full"
              />
            </div>
          </div>
          {/* Dates */}
          <div className="flex gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">시작일</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs w-full"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">마감일</label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs w-full"
              />
            </div>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-end bg-gray-50">
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </>
  );
} 