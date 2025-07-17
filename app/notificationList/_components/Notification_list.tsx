"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Bell,
    Check,
    CheckCheck,
    MoreVertical,
    Trash2,
    MessageSquare,
    Calendar,
    Settings,
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import Link from "next/link";

interface Notification {
    type: string;
    notificationId: string;
    issueId: string;
    issueTitle: string;
    projectId: string;
    projectName: string;
    createdAt: string;
    isRead: boolean;
}

const initialNotifications: Notification[] = [];

// 상대 시간 변환 함수
const getRelativeTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000; // 초 단위

    if (diff < 60) return "방금 전";
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}일 전`;

    // 한 달 이상은 날짜로 표시
    return date.toLocaleDateString("ko-KR");
};

const getNotificationIcon = (type: string) => {
    switch (type) {
        case "issue_created_assignee":
            return <Bell className="h-4 w-4" />;
        case "issue_created_backlog":
            return <Bell className="h-4 w-4" />;
        default:
            return <Bell className="h-4 w-4" />;
    }
};

const getNotificationColor = (type: string) => {
    switch (type) {
        case "issue_created_assignee":
            return "bg-red-500";
        case "issue_created_backlog":
            return "bg-blue-500";
        default:
            return "bg-blue-500";
    }
};

const getNotificationMessage = (type: string) => {
    switch (type) {
        case "issue_created_assignee":
            return "나에게 할당되었습니다";
        case "issue_created_backlog":
            return "backlog에 추가되었습니다";
        case "issue_created_mention":
            return "회원님이 언급되었습니다";
        default:
            return "";
    }
};

export default function NotificationsPage() {
    const [notifications, setNotifications] =
        useState<Notification[]>(initialNotifications);
    const [activeTab, setActiveTab] = useState("all");

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const filteredNotifications = notifications.filter((notification) => {
        if (activeTab === "unread") return !notification.isRead;
        if (activeTab === "read") return notification.isRead;
        return true;
    });

    const markAsRead = async (notificationId: string) => {
        try {
            await fetch(`${getApiUrl()}/notification/${notificationId}/read`, {
                method: "PATCH",
                credentials: "include",
            });
            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.notificationId === notificationId
                        ? { ...notification, isRead: true }
                        : notification
                )
            );
        } catch (err) {
            console.error("알림 읽음 처리 실패:", err);
        }
    };

    const deleteNotification = async (notificationId: string) => {
        try {
            await deleteUserNotification(notificationId);
            setNotifications((prev) =>
                prev.filter(
                    (notification) =>
                        notification.notificationId !== notificationId
                )
            );
        } catch (err) {
            console.error("알림 삭제 실패:", err);
        }
    };

    const deleteAllRead = async () => {
        try {
            // 모든 읽은 알림을 삭제
            const readNotifications = notifications.filter((n) => n.isRead);
            await Promise.all(
                readNotifications.map((notification) =>
                    deleteUserNotification(notification.notificationId)
                )
            );
            setNotifications((prev) =>
                prev.filter((notification) => !notification.isRead)
            );
        } catch (err) {
            console.error("읽은 알림 삭제 실패:", err);
        }
    };

    const markAllAsRead = async () => {
        try {
            // 모든 읽지 않은 알림을 읽음 처리
            const unreadNotifications = notifications.filter((n) => !n.isRead);
            await Promise.all(
                unreadNotifications.map((notification) =>
                    fetch(
                        `${getApiUrl()}/notification/${
                            notification.notificationId
                        }/read`,
                        {
                            method: "PATCH",
                            credentials: "include",
                        }
                    )
                )
            );
            setNotifications((prev) =>
                prev.map((notification) => ({ ...notification, isRead: true }))
            );
        } catch (err) {
            console.error("모든 알림 읽음 처리 실패:", err);
        }
    };

    const handleNotificationClick = async (item: Notification) => {
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

        getNotifications();
    };

    const getNotifications = async () => {
        const response = await fetch(`${getApiUrl()}/notification`, {
            method: "GET",
            credentials: "include",
        });
        const data = await response.json();
        console.log(data);
        setNotifications(data);
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

    useEffect(() => {
        getNotifications();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="mx-auto max-w-6xl">
                <Card>
                    <CardHeader className="border-b">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Bell className="h-6 w-6" />
                                <div>
                                    <CardTitle className="text-2xl">
                                        알림
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {unreadCount > 0
                                            ? `${unreadCount}개의 읽지 않은 알림`
                                            : "모든 알림을 확인했습니다"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={markAllAsRead}
                                    >
                                        <CheckCheck className="h-4 w-4 mr-2" />
                                        모두 읽음
                                    </Button>
                                )}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={deleteAllRead}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            읽은 알림 삭제
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <div className="border-t px-6 pt-6">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger
                                        value="all"
                                        className="relative"
                                    >
                                        전체
                                        <Badge
                                            variant="secondary"
                                            className="ml-2 text-xs"
                                        >
                                            {notifications.length}
                                        </Badge>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="unread"
                                        className="relative"
                                    >
                                        읽지 않음
                                        {unreadCount > 0 && (
                                            <Badge
                                                variant="destructive"
                                                className="ml-2 text-xs"
                                            >
                                                {unreadCount}
                                            </Badge>
                                        )}
                                    </TabsTrigger>
                                    <TabsTrigger value="read">
                                        읽음
                                        <Badge
                                            variant="secondary"
                                            className="ml-2 text-xs"
                                        >
                                            {notifications.length - unreadCount}
                                        </Badge>
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value={activeTab} className="mt-6">
                                <div className="divide-y">
                                    {filteredNotifications.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                                            <h3 className="text-lg font-medium text-muted-foreground">
                                                {activeTab === "unread"
                                                    ? "읽지 않은 알림이 없습니다"
                                                    : activeTab === "read"
                                                    ? "읽은 알림이 없습니다"
                                                    : "알림이 없습니다"}
                                            </h3>
                                        </div>
                                    ) : (
                                        filteredNotifications.map(
                                            (notification) => {
                                                // 링크 경로 결정
                                                let linkHref = `/projects/${notification.projectId}/issue/${notification.issueId}`;
                                                if (
                                                    notification.type ===
                                                        "issue_created_assignee" ||
                                                    notification.type ===
                                                        "issue_created_backlog"
                                                ) {
                                                    linkHref = `/projects/${notification.projectId}/board`;
                                                }
                                                return (
                                                    <Link
                                                        key={
                                                            notification.notificationId
                                                        }
                                                        href={linkHref}
                                                        onClick={async (e) => {
                                                            // 읽음 처리 후 이동
                                                            if (
                                                                !notification.isRead
                                                            ) {
                                                                e.preventDefault();
                                                                await markAsRead(
                                                                    notification.notificationId
                                                                );
                                                                window.location.href =
                                                                    linkHref;
                                                            }
                                                        }}
                                                        className="block"
                                                    >
                                                        <div
                                                            className={`flex items-start gap-4 p-6 hover:bg-gray-50 transition-colors ${
                                                                !notification.isRead
                                                                    ? "bg-blue-50/50"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <div
                                                                className={`flex h-10 w-10 items-center justify-center rounded-full ${getNotificationColor(
                                                                    notification.type
                                                                )} text-white`}
                                                            >
                                                                {getNotificationIcon(
                                                                    notification.type
                                                                )}
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <h4
                                                                                className={`text-sm font-medium ${
                                                                                    !notification.isRead
                                                                                        ? "text-gray-900"
                                                                                        : "text-gray-700"
                                                                                }`}
                                                                            >
                                                                                {
                                                                                    notification.issueTitle
                                                                                }
                                                                            </h4>
                                                                            {!notification.isRead && (
                                                                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                                            )}
                                                                        </div>
                                                                        <p className="text-sm text-muted-foreground mb-2">
                                                                            {
                                                                                notification.projectName
                                                                            }{" "}
                                                                            -{" "}
                                                                            {getNotificationMessage(
                                                                                notification.type
                                                                            )}
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {getRelativeTime(
                                                                                notification.createdAt
                                                                            )}
                                                                        </p>
                                                                    </div>

                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger
                                                                            asChild
                                                                        >
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="h-8 w-8 p-0"
                                                                                onClick={(
                                                                                    e
                                                                                ) =>
                                                                                    e.stopPropagation()
                                                                                }
                                                                            >
                                                                                <MoreVertical className="h-4 w-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            {!notification.isRead && (
                                                                                <DropdownMenuItem
                                                                                    onClick={(
                                                                                        e
                                                                                    ) => {
                                                                                        e.preventDefault();
                                                                                        markAsRead(
                                                                                            notification.notificationId
                                                                                        );
                                                                                    }}
                                                                                >
                                                                                    <Check className="h-4 w-4 mr-2" />
                                                                                    읽음으로
                                                                                    표시
                                                                                </DropdownMenuItem>
                                                                            )}
                                                                            <DropdownMenuItem
                                                                                onClick={(
                                                                                    e
                                                                                ) => {
                                                                                    e.preventDefault();
                                                                                    deleteNotification(
                                                                                        notification.notificationId
                                                                                    );
                                                                                }}
                                                                                className="text-red-600"
                                                                            >
                                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                                삭제
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                );
                                            }
                                        )
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
