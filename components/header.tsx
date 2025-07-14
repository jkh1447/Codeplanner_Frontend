"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, X } from "lucide-react";

import { getApiUrl } from "@/lib/api";
import { Alert, AlertDescription } from "./ui/alert";
import HealthCheck from "./health-check";
import { Notification_issue } from "./type";
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
    const [notificationCount, setNotificationCount] = useState(0);
    const [currentUserName, setCurrentUserName] = useState("");
    const [currentUserEmail, setCurrentUserEmail] = useState("");
    const [currentUserNameFirst, setCurrentUserNameFirst] = useState("");

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

    const currentUserDisplayName = async () => {
        try {
            const response = await fetch(`${getApiUrl()}/user/me`, {
                method: "GET",
                credentials: "include",
            });
            if (response.ok) {
                const data = await response.json();
                console.log("display name: ", data.display_name);
                console.log("display email: ", data.email);
                setCurrentUserName(data.display_name);
                setCurrentUserEmail(data.email);
                setCurrentUserNameFirst(
                    data.display_name ? data.display_name[0] : ""
                );
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "사용자 이름을 불러오는 데에 오류가 발생하였습니다."
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

    const handleNotificationClick = async (item: Notification_issue) => {
        // 알림을 읽음 처리하는 API 호출 (선택사항)
        try {
            await fetch(
                `${getApiUrl()}/notification/${item.notificationId}/read`,
                {
                    method: "PATCH",
                    credentials: "include",
                }
            );
        } catch (err) {
            console.error("알림 읽음 처리 실패:", err);
        }

        // 알림 목록 새로고침
        handleNotification();
    };

    const deleteUserNotification = async (notificationId: string) => {
        const response = await fetch(
            `${getApiUrl()}/notification/${notificationId}`,
            {
                method: "DELETE",
                credentials: "include",
            }
        );
        if (response.ok) {
            console.log("noti delete success");
        } else {
            console.log("noti delete failed");
        }
    };

    const handleDeleteNotification = async (
        e: React.MouseEvent,
        item: Notification_issue
    ) => {
        e.preventDefault(); // Link 클릭 방지
        e.stopPropagation(); // 이벤트 버블링 방지

        if (!item.notificationId) {
            console.error("알림 ID가 없습니다.");
            return;
        }

        try {
            await deleteUserNotification(item.notificationId);
            // 알림 목록 새로고침
            handleNotification();
        } catch (err) {
            console.error("알림 삭제 실패:", err);
        }
    };

    useEffect(() => {
        handleNotification();
        currentUserDisplayName();
    }, []);

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
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
                        {typeof window !== "undefined" && !isDevelopment() && (
                            <HealthCheck />
                        )}

                        {/* 알림 */}
                        <div className="relative group">
                            <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors relative">
                                <Bell className="w-6 h-6" />
                                {Array.isArray(notification) &&
                                    notification.length > 0 && (
                                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
                                    )}
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
                                            <div className="relative group/item">
                                                <Link
                                                    key={`${item.issueId}-${item.createdAt}-${idx}`}
                                                    href={`/projects/${item.projectId}/issue/${item.issueId}`}
                                                    className="block p-3 hover:bg-slate-50 border-b border-slate-100 cursor-pointer"
                                                    onClick={() =>
                                                        handleNotificationClick(
                                                            item
                                                        )
                                                    }
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div
                                                            className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                                                item.type ===
                                                                "issue_created_assignee"
                                                                    ? "bg-red-500"
                                                                    : "bg-blue-500"
                                                            }`}
                                                        ></div>
                                                        <div className="flex-1">
                                                            <p className="text-sm text-slate-800">
                                                                {
                                                                    item.issueTitle
                                                                }
                                                            </p>
                                                            <p className="text-xs text-slate-500 mt-1">
                                                                {
                                                                    item.projectName
                                                                }{" "}
                                                                -{" "}
                                                                {item.type ===
                                                                    "issue_created_assignee" &&
                                                                    "나에게 할당되었습니다. "}
                                                                {item.type ===
                                                                    "issue_created_backlog" &&
                                                                    "backlog에 추가되었습니다. "}
                                                                {getRelativeTime(
                                                                    item.createdAt
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Link>
                                                <button
                                                    onClick={(e) =>
                                                        handleDeleteNotification(
                                                            e,
                                                            item
                                                        )
                                                    }
                                                    className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover/item:opacity-100 transition-all duration-200"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-3 text-sm text-slate-500 text-center">
                                            새로운 알림이 없습니다.
                                        </div>
                                    )}
                                </div>

                                <div className="p-3 border-t border-slate-200 flex justify-center">
                                    <Link
                                        href="/notificationList"
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        모든 알림 보기
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* 프로필 */}
                        <div className="relative group">
                            <button className="flex items-center gap-2 p-1 text-slate-600 hover:text-blue-600 rounded-lg transition-colors">
                                <Link href="/user/mypage">
                                    <span className="w-8 h-8 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center font-bold">
                                        {currentUserNameFirst}
                                    </span>
                                </Link>
                            </button>

                            {/* 프로필 팝업 */}
                            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <div className="p-4 border-b border-slate-200">
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center font-bold">
                                            {currentUserNameFirst}
                                        </span>
                                        <div>
                                            <p className="font-semibold text-slate-800">
                                                {currentUserName}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {currentUserEmail}
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
