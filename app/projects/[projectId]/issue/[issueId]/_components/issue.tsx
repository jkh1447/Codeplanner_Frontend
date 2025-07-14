"use client";

import { useEffect, useState } from "react";
import {
    CalendarDays,
    Edit3,
    MessageSquare,
    Save,
    X,
    Clock,
    User,
    Flag,
    Trash2,
    GitCommitHorizontal,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { getApiUrl } from "@/lib/api";
import { useParams } from "next/navigation";
import { Issue_detail, User_detail } from "@/components/type";
import CommitListModal from "../../../list/common/CommitListModal";

interface Comment {
    id: string;
    issueId: string;
    authorId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    displayName?: string;
}

export default function IssueDetail() {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [title, setTitle] = useState(
        "로그인 페이지 UI 개선 및 반응형 디자인 적용"
    );
    const [description, setDescription] =
        useState(`현재 로그인 페이지의 UI가 구식이며 모바일 환경에서 사용성이 떨어집니다.

**개선 사항:**
- 모던한 디자인으로 UI 업데이트
- 반응형 디자인 적용
- 접근성 개선
- 로딩 상태 표시 추가

**기대 효과:**
- 사용자 경험 향상
- 모바일 사용자 증가
- 브랜드 이미지 개선`);
    const { projectId, issueId, notificationId } = useParams();

    const [issue, setIssue] = useState<Issue_detail | null>(null);
    const [tempTitle, setTempTitle] = useState("");
    const [tempDescription, setTempDescription] = useState("");
    const [newComment, setNewComment] = useState("");
    const [assignee, setAssignee] = useState<User_detail | null>(null);
    const [reporter, setReporter] = useState<User_detail | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(
        null
    );
    const [editingCommentContent, setEditingCommentContent] = useState("");
    const [currentUser, setCurrentUser] = useState<{
        id: string;
        display_name: string;
    } | null>(null);
    const [showCommitModal, setShowCommitModal] = useState(false);
    // 현재 사용자 정보 가져오기
    const getCurrentUser = async () => {
        try {
            console.log("현재 사용자 정보 가져오기 시작");
            const res = await fetch(`${getApiUrl()}/user/me`, {
                credentials: "include",
            });
            console.log("사용자 정보 응답 상태:", res.status, res.statusText);

            if (res.ok) {
                const userData = await res.json();
                console.log("사용자 정보 성공:", userData);
                setCurrentUser(userData);
            } else {
                const errorText = await res.text();
                console.error(
                    "사용자 정보 가져오기 실패:",
                    res.status,
                    errorText
                );
            }
        } catch (error) {
            console.error("현재 사용자 정보 가져오기 실패:", error);
        }
    };

    // 댓글 목록 가져오기
    const fetchComments = async () => {
        if (!projectId || !issueId) return;

        setIsLoadingComments(true);
        try {
            const res = await fetch(
                `${getApiUrl()}/comments/${projectId}/${issueId}/`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );
            if (res.ok) {
                const commentsData = await res.json();
                console.log("commentsData:", commentsData);

                setComments(commentsData);
            } else {
                console.error("댓글 가져오기 실패");
            }
        } catch (error) {
            console.error("댓글 가져오기 중 오류:", error);
        } finally {
            setIsLoadingComments(false);
        }
    };

    // 댓글 생성
    const createComment = async () => {
        console.log("댓글 생성 시작:", {
            newComment: newComment.trim(),
            projectId,
            issueId,
            currentUser: currentUser?.id,
        });

        if (!newComment.trim() || !projectId || !issueId || !currentUser) {
            console.log("댓글 생성 조건 불만족:", {
                hasComment: !!newComment.trim(),
                hasProjectId: !!projectId,
                hasIssueId: !!issueId,
                hasCurrentUser: !!currentUser,
            });
            return;
        }

        setIsSubmittingComment(true);
        try {
            const requestBody = {
                issueId: issueId,
                authorId: currentUser.id,
                content: newComment.trim(),
            };

            console.log("댓글 생성 요청:", requestBody);

            const res = await fetch(
                `${getApiUrl()}/comments/${projectId}/${issueId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                    credentials: "include",
                }
            );

            console.log("댓글 생성 응답 상태:", res.status, res.statusText);

            if (res.ok) {
                const newCommentData = await res.json();
                console.log("댓글 생성 성공:", newCommentData);

                // displayName은 현재 사용자 이름으로 추가
                setComments([
                    ...comments,
                    {
                        ...newCommentData,
                        displayName: currentUser.display_name, // 필드명 수정
                    },
                ]);
                setNewComment("");
            } else {
                const errorText = await res.text();
                console.error("댓글 생성 실패:", res.status, errorText);
                alert(`댓글 생성 실패: ${res.status} - ${errorText}`);
            }
        } catch (error) {
            console.error("댓글 생성 중 오류:", error);
            alert(`댓글 생성 중 오류: ${error}`);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    // 댓글 수정
    const updateComment = async (commentId: string) => {
        if (!editingCommentContent.trim() || !projectId || !issueId) return;

        try {
            const res = await fetch(
                `${getApiUrl()}/comments/${projectId}/${issueId}/${commentId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        content: editingCommentContent.trim(),
                        updatedAt: new Date(),
                    }),
                    credentials: "include",
                }
            );

            if (res.ok) {
                const updatedComment = await res.json();

                setComments(
                    comments.map((comment) =>
                        comment.id === commentId
                            ? {
                                  ...updatedComment,
                                  displayName: comment.displayName,
                              }
                            : comment
                    )
                );
                setEditingCommentId(null);
                setEditingCommentContent("");
            } else {
                console.error("댓글 수정 실패");
            }
        } catch (error) {
            console.error("댓글 수정 중 오류:", error);
        }
    };

    // 댓글 삭제
    const deleteComment = async (commentId: string) => {
        if (!projectId || !issueId) return;

        if (!confirm("댓글을 삭제하시겠습니까?")) return;

        try {
            const res = await fetch(
                `${getApiUrl()}/comments/${projectId}/${issueId}/${commentId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            if (res.ok) {
                setComments(
                    comments.filter((comment) => comment.id !== commentId)
                );
            } else {
                console.error("댓글 삭제 실패");
            }
        } catch (error) {
            console.error("댓글 삭제 중 오류:", error);
        }
    };

    // 댓글 수정 모드 시작
    const startEditingComment = (comment: Comment) => {
        setEditingCommentId(comment.id);
        setEditingCommentContent(comment.content);
    };

    // 댓글 수정 모드 취소
    const cancelEditingComment = () => {
        setEditingCommentId(null);
        setEditingCommentContent("");
    };

    // 이슈 업데이트 함수
    const updateIssueField = async (
        field: "title" | "description" | "status",
        value: string
    ) => {
        if (!issueId) return;
        try {
            const res = await fetch(
                `${getApiUrl()}/projects/${projectId}/${issueId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ [field]: value }),
                    credentials: "include",
                }
            );
            if (!res.ok) throw new Error("이슈 업데이트 실패");
            // 서버에서 최신 이슈 정보를 받아오고 싶으면 아래 코드 사용
            // const updated = await res.json();
            // setIssue(updated);
        } catch (err) {
            console.error("이슈 업데이트 중 오류:", err);
        }
    };

    const handleSaveTitle = async () => {
        setTitle(tempTitle || "");
        setIsEditingTitle(false);
        if (tempTitle && tempTitle !== issue?.title) {
            await updateIssueField("title", tempTitle);
            setIssue(issue ? { ...issue, title: tempTitle } : issue);
        }
    };

    const handleCancelTitle = () => {
        setTempTitle(title);
        setIsEditingTitle(false);
    };

    const handleSaveDescription = async () => {
        setDescription(tempDescription || "");
        setIsEditingDescription(false);
        if (tempDescription && tempDescription !== issue?.description) {
            await updateIssueField("description", tempDescription);
            setIssue(
                issue ? { ...issue, description: tempDescription } : issue
            );
        }
    };

    const handleCancelDescription = () => {
        setTempDescription(description);
        setIsEditingDescription(false);
    };

    const getAssigneeAndReporter = async (
        assigneeId: string,
        reporterId: string
    ) => {
        const res = await fetch(`${getApiUrl()}/user/${assigneeId}`, {
            method: "GET",
            credentials: "include",
        });
        const data = await res.json();
        console.log("assignee name:", data.displayName);
        const res2 = await fetch(`${getApiUrl()}/user/${reporterId}`, {
            method: "GET",
            credentials: "include",
        });
        const data2 = await res2.json();
        console.log("reporter name:", data2.displayName);

        setAssignee(data);
        setReporter(data2);
    };

    // 이슈 가져오기
    const getIssue = async () => {
        const res = await fetch(
            `${getApiUrl()}/projects/${projectId}/${issueId}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            }
        );
        const data = await res.json();
        setIssue(data);
        console.log("issue data:", data);
        getAssigneeAndReporter(data.assigneeId, data.reporterId);
    };

    // 이슈 읽음 처리
    const handleReadIssue = async () => {
        const res = await fetch(
            `${getApiUrl()}/notification/${issueId}/${notificationId}/read`,
            {
                method: "PATCH",
                credentials: "include",
            }
        );

        if (res.ok) {
            console.log("이슈 읽음 처리 성공");
        } else {
            console.error("이슈 읽음 처리 실패");
        }
    };

    useEffect(() => {
        getCurrentUser();
        getIssue();
        fetchComments();
        // handleReadIssue();
    }, []);

    // issue가 바뀔 때마다 tempTitle/tempDescription도 동기화
    useEffect(() => {
        setTempTitle(issue?.title || "");
        setTempDescription(issue?.description || "");
    }, [issue]);

    // 날짜 포맷팅 함수
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 60)
        );

        if (diffInMinutes < 1) return "방금 전";
        if (diffInMinutes < 60) return `${diffInMinutes}분 전`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}시간 전`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}일 전`;

        return date.toLocaleDateString("ko-KR");
    };

    return (
        <div className="min-h-screen bg-white p-6">
            <div className="max-w-7xl mx-auto bg-white">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Issue Title */}
                        <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow">
                            <CardContent className="p-8">
                                {isEditingTitle ? (
                                    <div className="space-y-4">
                                        <Input
                                            value={tempTitle}
                                            onChange={(e) =>
                                                setTempTitle(e.target.value)
                                            }
                                            className="text-2xl font-bold border-2 border-blue-200 focus:border-blue-400"
                                            autoFocus
                                        />
                                        <div className="flex gap-3">
                                            <Button
                                                size="sm"
                                                onClick={handleSaveTitle}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                <Save className="w-4 h-4 mr-2" />
                                                저장
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleCancelTitle}
                                                className="border-gray-300 bg-transparent"
                                            >
                                                <X className="w-4 h-4 mr-2" />
                                                취소
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className="group cursor-pointer"
                                        onClick={() => setIsEditingTitle(true)}
                                    >
                                        <h1 className="text-3xl font-bold mb-2 group-hover:bg-blue-50 p-3 rounded-lg transition-colors text-gray-800">
                                            {issue?.title}
                                            <Edit3 className="w-5 h-5 ml-3 inline opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                                        </h1>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Issue Description */}
                        <Card className="shadow-sm border-gray-200">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-200">
                                <CardTitle className="text-lg text-gray-800 flex items-center gap-3">
                                    <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                                    설명
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {isEditingDescription ? (
                                    <div className="space-y-4">
                                        <Textarea
                                            value={tempDescription}
                                            onChange={(e) =>
                                                setTempDescription(
                                                    e.target.value
                                                )
                                            }
                                            rows={12}
                                            className="min-h-[250px] border-2 border-blue-200 focus:border-blue-400"
                                            autoFocus
                                        />
                                        <div className="flex gap-3">
                                            <Button
                                                size="sm"
                                                onClick={handleSaveDescription}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                <Save className="w-4 h-4 mr-2" />
                                                저장
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={
                                                    handleCancelDescription
                                                }
                                                className="border-gray-300 bg-transparent"
                                            >
                                                <X className="w-4 h-4 mr-2" />
                                                취소
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className="group cursor-pointer"
                                        onClick={() =>
                                            setIsEditingDescription(true)
                                        }
                                    >
                                        <div className="whitespace-pre-wrap group-hover:bg-blue-50 p-4 rounded-lg transition-colors min-h-[120px] text-gray-700 leading-relaxed">
                                            {issue?.description}
                                            <Edit3 className="w-4 h-4 ml-2 inline opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Comments Section */}
                        <Card className="shadow-sm border-gray-200">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-200">
                                <CardTitle className="flex items-center gap-3 text-gray-800">
                                    <MessageSquare className="w-5 h-5 text-blue-500" />
                                    댓글 ({comments.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {/* Add Comment */}
                                <div className="space-y-4">
                                    <Textarea
                                        placeholder="댓글을 입력하세요..."
                                        value={newComment}
                                        onChange={(e) =>
                                            setNewComment(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                            if (
                                                e.key === "Enter" &&
                                                (e.ctrlKey || e.metaKey)
                                            ) {
                                                e.preventDefault();
                                                createComment();
                                            }
                                        }}
                                        rows={4}
                                        className="border-gray-300 focus:border-blue-400 focus:ring-blue-400"
                                        disabled={isSubmittingComment}
                                    />
                                    <div className="flex items-center justify-between">
                                        <Button
                                            onClick={createComment}
                                            disabled={
                                                !newComment.trim() ||
                                                isSubmittingComment ||
                                                !currentUser
                                            }
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {isSubmittingComment
                                                ? "댓글 추가 중..."
                                                : "댓글 추가"}
                                        </Button>
                                        {!currentUser && (
                                            <span className="text-sm text-red-500">
                                                로그인이 필요합니다
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <Separator className="bg-gray-200" />

                                {/* Comments List */}
                                <div className="space-y-6">
                                    {isLoadingComments ? (
                                        <div className="text-center py-8 text-gray-500">
                                            댓글을 불러오는 중...
                                        </div>
                                    ) : comments.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            아직 댓글이 없습니다.
                                        </div>
                                    ) : (
                                        comments.map((comment) => (
                                            <div
                                                key={comment.id}
                                                className="flex gap-4"
                                            >
                                                <Avatar className="w-10 h-10 border-2 border-gray-200">
                                                    <AvatarFallback className="bg-blue-100 text-blue-700">
                                                        {comment
                                                            .displayName?.[0] ||
                                                            "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-semibold text-gray-800">
                                                                {comment.displayName ||
                                                                    "알 수 없는 사용자"}
                                                            </span>
                                                            <span className="text-sm text-gray-500">
                                                                {formatDate(
                                                                    comment.createdAt
                                                                )}
                                                            </span>
                                                            {comment.updatedAt !==
                                                                comment.createdAt && (
                                                                <span className="text-xs text-gray-400">
                                                                    (수정됨)
                                                                </span>
                                                            )}
                                                        </div>
                                                        {currentUser &&
                                                            comment.authorId ===
                                                                currentUser.id && (
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() =>
                                                                            startEditingComment(
                                                                                comment
                                                                            )
                                                                        }
                                                                        className="h-8 px-2 text-gray-500 hover:text-blue-600"
                                                                    >
                                                                        <Edit3 className="w-3 h-3" />
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() =>
                                                                            deleteComment(
                                                                                comment.id
                                                                            )
                                                                        }
                                                                        className="h-8 px-2 text-gray-500 hover:text-red-600"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                    </div>
                                                    {editingCommentId ===
                                                    comment.id ? (
                                                        <div className="space-y-3">
                                                            <Textarea
                                                                value={
                                                                    editingCommentContent
                                                                }
                                                                onChange={(e) =>
                                                                    setEditingCommentContent(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                rows={3}
                                                                className="border-gray-300 focus:border-blue-400"
                                                                autoFocus
                                                            />
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        updateComment(
                                                                            comment.id
                                                                        )
                                                                    }
                                                                    className="bg-blue-600 hover:bg-blue-700"
                                                                >
                                                                    <Save className="w-3 h-3 mr-1" />
                                                                    저장
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={
                                                                        cancelEditingComment
                                                                    }
                                                                    className="border-gray-300"
                                                                >
                                                                    <X className="w-3 h-3 mr-1" />
                                                                    취소
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm bg-gray-50 p-4 rounded-lg border border-gray-200 leading-relaxed">
                                                            {comment.content}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Issue Details */}
                    <div className="space-y-6">
                        <Card className="shadow-sm border-gray-200 sticky top-6">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                                <CardTitle className="text-lg text-gray-800">
                                    이슈 정보
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {/* Issue Type */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Flag className="w-4 h-4" />
                                        이슈 유형
                                    </Label>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        {issue?.issueType}
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        상태
                                    </Label>
                                    <Select
                                        value={issue?.status}
                                        onValueChange={async (value) => {
                                            if (issue) {
                                                setIssue({
                                                    ...issue,
                                                    status: value as
                                                        | "TODO"
                                                        | "IN_PROGRESS"
                                                        | "DONE",
                                                });
                                                await updateIssueField(
                                                    "status",
                                                    value
                                                );
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="border-gray-300">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="BACKLOG">
                                                백로그
                                            </SelectItem>
                                            <SelectItem value="TODO">
                                                해야 할 일
                                            </SelectItem>
                                            <SelectItem value="IN_PROGRESS">
                                                진행 중
                                            </SelectItem>
                                            <SelectItem value="IN_REVIEW">
                                                리뷰 중
                                            </SelectItem>
                                            <SelectItem value="DONE">
                                                완료
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Separator className="bg-gray-200" />

                                {/* Assignee */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        {assignee?.displayName
                                            ? "담당자"
                                            : "담당자 없음"}
                                    </Label>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        {assignee?.displayName ? (
                                            <>
                                                {/* <Avatar className="w-8 h-8 border-2 border-white">
                                            <AvatarImage src="/placeholder.svg?height=32&width=32" />
                                            <AvatarFallback className="bg-blue-100 text-blue-700">
                                                김
                                            </AvatarFallback>
                                                </Avatar> */}
                                                <span className="text-sm font-medium text-gray-800 ">
                                                    {assignee?.displayName}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-sm font-medium text-gray-800 ">
                                                담당자 없음
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Reporter */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        보고자
                                    </Label>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        {/* <Avatar className="w-8 h-8 border-2 border-white">
                                            <AvatarImage src="/placeholder.svg?height=32&width=32" />
                                            <AvatarFallback className="bg-green-100 text-green-700">
                                                이
                                            </AvatarFallback>
                                        </Avatar> */}
                                        <span className="text-sm font-medium text-gray-800">
                                            {reporter?.displayName}
                                        </span>
                                    </div>
                                </div>

                                <Separator className="bg-gray-200" />

                                {/* Dates */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold text-gray-700">
                                        시작일
                                    </Label>
                                    <div className="flex items-center gap-3 text-sm p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <CalendarDays className="w-4 h-4 text-blue-500" />
                                        <span className="text-gray-800">
                                            {issue?.startDate}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold text-gray-700">
                                        마감일
                                    </Label>
                                    <div className="flex items-center gap-3 text-sm p-3 bg-red-50 rounded-lg border border-red-200">
                                        <CalendarDays className="w-4 h-4 text-red-500" />
                                        <span className="text-red-700 font-medium">
                                            {issue?.dueDate}
                                        </span>
                                    </div>
                                </div>

                                <Separator className="bg-gray-200" />

                                {/* 커밋 링크 */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        커밋 목록
                                    </label>
                                    <button
                                        onClick={() => setShowCommitModal(true)}
                                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm transition-colors duration-200"
                                    >
                                        <GitCommitHorizontal className="w-4 h-4" />
                                        <span>GitHub 커밋 보기</span>
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                        {/* 커밋 목록 모달 */}
                        <CommitListModal
                            isOpen={showCommitModal}
                            onClose={() => setShowCommitModal(false)}
                            projectId={String(projectId)}
                            taskId={String(issueId)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
