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

interface Comment {
    id: string;
    author: string;
    avatar: string;
    content: string;
    createdAt: string;
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
    const { projectId, issueId } = useParams();
    const [issue, setIssue] = useState<Issue_detail | null>(null);
    const [tempTitle, setTempTitle] = useState("");
    const [tempDescription, setTempDescription] = useState("");
    const [newComment, setNewComment] = useState("");
    const [assignee, setAssignee] = useState<User_detail | null>(null);
    const [reporter, setReporter] = useState<User_detail | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);

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

    const handleAddComment = () => {
        if (newComment.trim()) {
            const comment: Comment = {
                id: Date.now().toString(),
                author: "현재 사용자",
                avatar: "/placeholder.svg?height=32&width=32",
                content: newComment,
                createdAt: new Date().toLocaleString("ko-KR"),
            };
            setComments([...comments, comment]);
            setNewComment("");
        }
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

    useEffect(() => {
        getIssue();
    }, []);

    // issue가 바뀔 때마다 tempTitle/tempDescription도 동기화
    useEffect(() => {
        setTempTitle(issue?.title || "");
        setTempDescription(issue?.description || "");
    }, [issue]);

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
                                        rows={4}
                                        className="border-gray-300 focus:border-blue-400 focus:ring-blue-400"
                                    />
                                    <Button
                                        onClick={handleAddComment}
                                        disabled={!newComment.trim()}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        댓글 추가
                                    </Button>
                                </div>

                                <Separator className="bg-gray-200" />

                                {/* Comments List */}
                                <div className="space-y-6">
                                    {comments.map((comment) => (
                                        <div
                                            key={comment.id}
                                            className="flex gap-4"
                                        >
                                            <Avatar className="w-10 h-10 border-2 border-gray-200">
                                                <AvatarImage
                                                    src={
                                                        comment.avatar ||
                                                        "/placeholder.svg"
                                                    }
                                                />
                                                <AvatarFallback className="bg-blue-100 text-blue-700">
                                                    {comment.author[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-semibold text-gray-800">
                                                        {comment.author}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        {comment.createdAt}
                                                    </span>
                                                </div>
                                                <div className="text-sm bg-gray-50 p-4 rounded-lg border border-gray-200 leading-relaxed">
                                                    {comment.content}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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
                                            <SelectItem value="TODO">
                                                Todo
                                            </SelectItem>
                                            <SelectItem value="IN_PROGRESS">
                                                In Progress
                                            </SelectItem>
                                            <SelectItem value="DONE">
                                                Done
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
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
