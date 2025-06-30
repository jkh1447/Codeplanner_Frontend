"use client";
import { Task } from "@/components/type";

{/* 이슈에 대한 Drawer */}
export default function TaskDrawer({
  task,
  onClose,
}: {
  task: Task;
  onClose: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-in fade-in duration-300"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[500px] bg-white shadow-2xl z-50 drawer-slide-in">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{task.title || 'Task Details'}</h2>
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
        <div className="p-6 space-y-6 max-h-[calc(100vh-100px)] overflow-y-auto">
          {/* Task Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Type</label>
            <div className="px-3 py-2 bg-blue-50 text-blue-700 rounded-md inline-block">
              {task.issue_type || 'Task'}
            </div>
          </div>
          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <div className="px-3 py-2 bg-green-50 text-green-700 rounded-md inline-block">
              {task.status || 'Active'}
            </div>
          </div>
          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-gray-800 whitespace-pre-wrap">
                {task.description || 'No description provided'}
              </p>
            </div>
          </div>
          {/* Additional Info */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Additional Information</label>
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-gray-600 text-sm">
                Created: {new Date().toLocaleDateString()}
              </p>
              <p className="text-gray-600 text-sm mt-1">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 