"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getApiUrl } from "@/lib/api";
import { MentionsInput, Mention } from "react-mentions";

interface data {
    id: string;
    display: string;
    email: string;
}

interface ReviewCommentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reviewType: "assign" | "approve" | "reject";
    projectId: string;
    issueId: string;
    reviewers: Array<{
        id: string;
        displayName: string;
        email?: string;
    }>;
    onConfirm: (comment: string) => Promise<void>;
    onCancel: () => void;
}

export default function ReviewCommentModal({
    open,
    onOpenChange,
    reviewType,
    projectId,
    issueId,
    reviewers,
    onConfirm,
    onCancel,
}: ReviewCommentModalProps) {
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    ㅛ

    // 모달이 열릴 때마다 댓글 초기화
    useEffect(() => {
        if (open) {
            setError("");
            getProjectMembers();
        } else {
            // 모달이 닫힐 때 상태 초기화
            setComment("");
            setError("");
        }
    }, [open, reviewType, reviewers]);

    const getModalTitle = () => {
        switch (reviewType) {
            case "assign":
                return "리뷰어 지정 댓글 작성";
            case "approve":
                return "리뷰 승인 댓글 작성";
            case "reject":
                return "리뷰 거부 댓글 작성";
            default:
                return "댓글 작성";
        }
    };

    const getModalDescription = () => {
        switch (reviewType) {
            case "assign":
                return "리뷰어 지정과 함께 댓글을 작성하세요.";
            case "approve":
                return "리뷰 승인과 함께 댓글을 작성하세요.";
            case "reject":
                return "리뷰 거부 사유를 댓글로 작성하세요.";
            default:
                return "댓글을 작성하세요.";
        }
    };

    const handleSubmit = async () => {
        if (!comment.trim()) {
            setError("댓글 내용을 입력해주세요.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // 먼저 댓글을 작성
            const commentResponse = await fetch(
                `${getApiUrl()}/comments/${projectId}/${issueId}/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        content: comment.trim(),
                    }),
                }
            );

            if (!commentResponse.ok) {
                throw new Error("댓글 작성에 실패했습니다.");
            }

            // 그 다음 리뷰 액션 실행
            await onConfirm(comment.trim());

            // 성공 시 상태 초기화 후 모달 닫기
            setComment("");
            setError("");
            setLoading(false);
            onOpenChange(false);
        } catch (error: any) {
            setError(error.message || "처리 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        // 모든 상태 초기화
        setComment("");
        setError("");
        setLoading(false);
        onCancel();
        onOpenChange(false);
    };

    const mentionStyle = {
        backgroundColor: "#d1eaff",
        fontWeight: "bold",
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{getModalTitle()}</DialogTitle>
                    <DialogDescription>
                        {getModalDescription()}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="comment">댓글 내용</Label>
                        {projectMembers.length > 0 ? (
                            <MentionsInput
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="border border-gray-300 rounded focus:border-blue-400 focus:ring-blue-400 min-h-[80px] p-2 bg-white"
                                placeholder="댓글을 입력하세요... @로 멘션할 수 있습니다."
                            >
                                <Mention
                                    trigger="@"
                                    data={projectMembers}
                                    markup="@[__display__](__id__)"
                                    displayTransform={(id, display) =>
                                        `@${display}`
                                    }
                                    renderSuggestion={(
                                        entry,
                                        search,
                                        highlightedDisplay,
                                        index,
                                        focused
                                    ) => {
                                        const member = entry as unknown as data;
                                        return (
                                            <div
                                                className={`w-72 flex items-center rounded-lg m-1 px-3 py-2 cursor-pointer transition-colors duration-100 ${
                                                    focused
                                                        ? "bg-blue-100 text-blue-900"
                                                        : "bg-white text-gray-900"
                                                }`}
                                            >
                                                <span
                                                    className={`w-6 h-6 rounded-full flex items-center mr-2 justify-center font-bold transition-colors duration-100 ${
                                                        focused
                                                            ? "bg-white text-blue-700"
                                                            : "bg-blue-200 text-blue-800"
                                                    }`}
                                                >
                                                    {member.display?.[0]?.toUpperCase() ||
                                                        "U"}
                                                </span>
                                                <span className="font-semibold text-sm leading-tight">
                                                    {highlightedDisplay}
                                                </span>
                                                <span
                                                    className={`ml-2 text-xs ${
                                                        focused
                                                            ? "text-blue-700"
                                                            : "text-gray-500"
                                                    }`}
                                                >
                                                    {member.email}
                                                </span>
                                            </div>
                                        );
                                    }}
                                />
                            </MentionsInput>
                        ) : (
                            <Textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="댓글을 입력하세요..."
                                rows={6}
                                className="resize-none"
                            />
                        )}
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                            {error}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        취소
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {loading ? "처리 중..." : "확인"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
