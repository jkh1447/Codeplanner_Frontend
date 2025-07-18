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
import { Label } from "@/components/ui/label";
import { GitBranch, Loader2 } from "lucide-react";
import { getApiUrl } from "@/lib/api";

interface CreateBranchModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    issueTitle: string;
    projectId: string;
    issueId: string;
    onConfirm: (branchName?: string, branchError?: string) => void;
    onCancel: () => void;
}

export default function CreateBranchModal({
    open,
    onOpenChange,
    issueTitle,
    projectId,
    issueId,
    onConfirm,
    onCancel,
}: CreateBranchModalProps) {
    const [loading, setLoading] = useState(false);
    const [branchName, setBranchName] = useState("");
    const [error, setError] = useState("");

    // 모달이 열릴 때 브랜치 이름 생성
    useEffect(() => {
        if (open) {
            const generatedBranchName = `feature/${issueTitle.replace(/\s+/g, '-').toLowerCase()}`;
            setBranchName(generatedBranchName);
            setError("");
        }
    }, [open, issueTitle]);

    const handleBranchNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBranchName(e.target.value);
    };

    const handleCreateBranch = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${getApiUrl()}/projects/${projectId}/issues/${issueId}/create-branch`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        issueTitle,
                        branchName: branchName.trim(),
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "브랜치 생성에 실패했습니다.");
            }

            // 성공 시 브랜치 이름과 함께 콜백 호출
            onConfirm(result.branchName);
        } catch (error: any) {
            setError(error.message || "브랜치 생성 중 오류가 발생했습니다.");
            // 에러가 있어도 onConfirm 호출 (브랜치 없이 진행)
            onConfirm(undefined, error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setLoading(false);
        setError("");
        onCancel();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <GitBranch className="h-5 w-5" />
                        브랜치 생성
                    </DialogTitle>
                    <DialogDescription>
                        이 이슈 작업을 시작하기 위해 새 브랜치를 생성하시겠습니까?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="branchName" className="text-sm font-medium">
                            브랜치 이름:
                        </Label>
                        <input
                            id="branchName"
                            type="text"
                            value={branchName}
                            onChange={handleBranchNameChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                            placeholder="브랜치 이름을 입력하세요"
                            disabled={loading}
                        />
                        <p className="text-xs text-gray-500">
                            브랜치 이름을 입력하세요
                        </p>
                    </div>
                    
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                            {error}
                        </div>
                    )}
                    
                    <div className="text-xs text-gray-500 space-y-1">
                        <p>• 이슈 제목을 기반으로 브랜치가 생성됩니다</p>
                        <p>• 프로젝트에 GitHub 저장소가 연결되어 있어야 합니다</p>
                        <p>• 브랜치 생성에 실패해도 이슈 상태는 변경됩니다</p>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        브랜치 없이 진행
                    </Button>
                    <Button
                        onClick={handleCreateBranch}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                브랜치 생성 중...
                            </>
                        ) : (
                            "브랜치 생성하고 진행"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}