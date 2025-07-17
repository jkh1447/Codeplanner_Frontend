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

    // 모달이 열릴 때마다 댓글 초기화
    useEffect(() => {
        if (open) {
            setError("");
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
                        <Textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="댓글을 입력하세요..."
                            rows={6}
                            className="resize-none"
                        />
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