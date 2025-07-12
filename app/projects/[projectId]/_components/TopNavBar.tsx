"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import SearchForm from "../board/_components/SearchForm";
import { getApiUrl } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import HealthCheck from "@/components/health-check";
import { Notification_issue } from "@/components/type";
import { isDevelopment } from "@/lib/api";

// 상대 시간 변환 함수
function getRelativeTime(isoString: string) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000; // 초 단위

    if (diff < 60) return "방금 전";
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}일 전`;

    // 한 달 이상은 날짜로 표시
    return date.toLocaleDateString("ko-KR");
}

export default function Header() {
    const [showModal, setShowModal] = useState(false);
    const [description, setDescription] = useState("");
    const [name, setName] = useState("");
    const [assignee, setAssignee] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");

    const [notification, setNotification] = useState<Notification_issue[]>([]);

    const handleLogout = async () => {
        try {
            const response = await fetch(`${getApiUrl()}/auth/logout`, {
                method: "POST",
                credentials: "include",
            });
            if (response.ok) {
                window.location.href = "/auth/login";
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "로그아웃 중 오류가 발생했습니다."
            );
        }
    };

    const handleNotification = async () => {
        try {
            const response = await fetch(`${getApiUrl()}/notification/recent`, {
                method: "GET",
                credentials: "include",
            });
            const data = await response.json();

            setNotification(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "알림 조회 중 오류가 발생했습니다."
            );
        }
    };

    useEffect(() => {
        handleNotification();
    }, []);

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
            <div className="w-full px-6 py-4">
                <div className="flex items-center">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/projectList"
                            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                        >
                            {/* 로고 */}
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                                <img
                                    src="/CodePlannerIcon.png"
                                    alt="Code Planner Icon"
                                    className="w-10 h-10 object-contain"
                                />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                Code Planner
                            </h1>
                        </Link>
                    </div>
                    <div className="flex flex-1 justify-center ">
                        <div className="w-full max-w-[60rem]"></div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* 헬스체크 */}
                        {typeof window !== "undefined" && !isDevelopment() && <HealthCheck />}

                        {/* 알림 */}
                        <div className="relative group">
                            <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors relative">
                                <Bell className="w-6 h-6" />
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
                            </button>

                            {/* 알림 팝업 */}
                            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <div className="p-4 border-b border-slate-200">
                                    <h3 className="font-semibold text-slate-800">
                                        알림
                                    </h3>
                                </div>

                                <div className="max-h-64 overflow-y-auto">
                                    {/* notification이 배열이 아닐 경우 에러 발생 가능, notification이 undefined/null일 때도 대비 필요 */}
                                    {Array.isArray(notification) &&
                                    notification.length > 0 ? (
                                        notification.map((item, idx) => (
                                            <Link
                                                key={item.issueId || idx}
                                                href={`/projects/${item.projectId}/issue/${item.issueId}`}
                                                className="block p-3 hover:bg-slate-50 border-b border-slate-100 cursor-pointer"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                                    <div>
                                                        <p className="text-sm text-slate-800">
                                                            {item.issueTitle}
                                                        </p>
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            {item.projectName} -{" "}
                                                            {getRelativeTime(
                                                                item.createdAt
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="p-3 text-sm text-slate-500 text-center">
                                            새로운 알림이 없습니다.
                                        </div>
                                    )}
                                </div>

                                <div className="p-3 border-t border-slate-200">
                                    <button
                                        type="button"
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium w-full text-center"
                                    >
                                        모든 알림 보기
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 프로필 */}
                        <div className="relative group">
                            <button className="flex items-center gap-2 p-1 text-slate-600 hover:text-blue-600 rounded-lg transition-colors">
                                <Link href="/user/mypage">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-semibold">
                                            김
                                        </span>
                                    </div>
                                </Link>
                            </button>

                            {/* 프로필 팝업 */}
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
                                    <Link
                                        href="/user/mypage"
                                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-3"
                                    >
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
                                    </Link>
                                    <a
                                        href="/projects"
                                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-3 block"
                                    >
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
                                    </a>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-3"
                                    >
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
                    </div>
                </div>
            </div>
        </header>
    );
}
