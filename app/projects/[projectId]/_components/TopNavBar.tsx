"use client"


import { useState } from "react"
import Link from "next/link"
import { Bell } from "lucide-react";
import SearchForm from "../board/_components/SearchForm";

export default function Header() {
  const [showModal, setShowModal] = useState(false)
  const [description, setDescription] = useState("")
  const [name, setName] = useState("")
  const [assignee, setAssignee] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [status, setStatus] = useState("")


  return (
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="w-full px-6 py-4">
              <div className="flex items-center">
                  <div className="flex items-center gap-4">
                      <Link
                          href="/projects"
                          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                      >
                          {/* Logo */}
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                              <svg
                                  className="w-5 h-5 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                              >
                                  <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                  />
                              </svg>
                          </div>
                          <h1 className="text-2xl font-bold text-slate-800">
                              Code Planner
                          </h1>
                      </Link>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                          DEMO
                      </span>
                  </div>

                  <div className="flex flex-1 justify-center ">
                      <div className="w-full max-w-[60rem]">
                          <SearchForm />
                      </div>
                  </div>

                  <div className="flex items-center gap-3">
                      {/* 새프로젝트 버튼 */}
                      {/* <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              새 프로젝트
            </button> */}

                      {/*{showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h2 className="text-xl font-semibold mb-4">새 프로젝트 만들기</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">프로젝트 이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">담당자</label>
                <input
                  type="text"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">마감일</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">상태</label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as Project["status"])
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="대기중">대기중</option>
                  <option value="진행중">진행중</option>
                  <option value="완료">완료</option>
                  <option value="보류">보류</option>
                </select>
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">이슈 개수</label>
                <input
                  type="number"
                  min="0"
                  value={issues}
                  onChange={(e) =>
                    setIssues(Number.parseInt(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">설명</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
            </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  // 저장 로직 필요 시 여기에 추가
                  setShowModal(false)
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                저장
              </button>
            </div>

            {/* 닫기 버튼 (X) 
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setShowModal(false)}> × </button>
          </div>
        </div>
      )}*/}
                      {/* 새프로젝트 버튼 */}

                      {/* Notifications */}
                      <div className="relative group">
                          <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors relative">
                              <Bell className="w-6 h-6" />
                              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
                          </button>

                          {/* Notification Popup */}
                          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                              <div className="p-4 border-b border-slate-200">
                                  <h3 className="font-semibold text-slate-800">
                                      알림
                                  </h3>
                              </div>
                              <div className="max-h-64 overflow-y-auto">
                                  <div className="p-3 hover:bg-slate-50 border-b border-slate-100">
                                      <div className="flex items-start gap-3">
                                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                          <div>
                                              <p className="text-sm text-slate-800">
                                                  새로운 이슈가 할당되었습니다
                                              </p>
                                              <p className="text-xs text-slate-500 mt-1">
                                                  사용자 인증 시스템 - 5분 전
                                              </p>
                                          </div>
                                      </div>
                                  </div>
                                  <div className="p-3 hover:bg-slate-50 border-b border-slate-100">
                                      <div className="flex items-start gap-3">
                                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                          <div>
                                              <p className="text-sm text-slate-800">
                                                  코드 리뷰가 완료되었습니다
                                              </p>
                                              <p className="text-xs text-slate-500 mt-1">
                                                  결제 모듈 개발 - 1시간 전
                                              </p>
                                          </div>
                                      </div>
                                  </div>
                                  <div className="p-3 hover:bg-slate-50">
                                      <div className="flex items-start gap-3">
                                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                                          <div>
                                              <p className="text-sm text-slate-800">
                                                  마감일이 임박했습니다
                                              </p>
                                              <p className="text-xs text-slate-500 mt-1">
                                                  관리자 대시보드 - 2시간 전
                                              </p>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                              <div className="p-3 border-t border-slate-200">
                                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                      모든 알림 보기
                                  </button>
                              </div>
                          </div>
                      </div>

                      {/* Settings */}
                      <div className="relative group">
                          <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors">
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
                                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                  />
                                  <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                              </svg>
                          </button>

                          {/* Settings Popup */}
                          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                              <div className="p-2">
                                  <button className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-3">
                                      <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                      >
                                          <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                          />
                                      </svg>
                                      계정 설정
                                  </button>
                                  <button className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-3">
                                      <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                      >
                                          <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                                          />
                                      </svg>
                                      환경 설정
                                  </button>
                                  <button className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-3">
                                      <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                      >
                                          <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                          />
                                      </svg>
                                      로그아웃
                                  </button>
                              </div>
                          </div>
                      </div>

                      {/* Profile */}
                      <div className="relative group">
                          <button className="flex items-center gap-2 p-1 text-slate-600 hover:text-blue-600 rounded-lg transition-colors">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm font-semibold">
                                      김
                                  </span>
                              </div>
                          </button>

                          {/* Profile Popup */}
                          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                              <div className="p-4 border-b border-slate-200">
                                  <div className="flex items-center gap-3">
                                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                          <span className="text-white font-semibold">
                                              김
                                          </span>
                                      </div>
                                      <div>
                                          <p className="font-semibold text-slate-800">
                                              김개발
                                          </p>
                                          <p className="text-sm text-slate-500">
                                              kim.dev@example.com
                                          </p>
                                      </div>
                                  </div>
                              </div>
                              <div className="p-2">
                                  <button className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-3">
                                      <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                      >
                                          <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                          />
                                      </svg>
                                      내 프로필
                                  </button>
                                  <button className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-3">
                                      <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                      >
                                          <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                          />
                                      </svg>
                                      내 프로젝트
                                  </button>
                                  <button className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-3">
                                      <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                      >
                                          <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                          />
                                      </svg>
                                      활동 기록
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </header>
  );
}
