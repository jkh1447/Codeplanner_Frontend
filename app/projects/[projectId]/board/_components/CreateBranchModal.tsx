"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GitBranch } from "lucide-react";

interface CreateBranchModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    issueTitle: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function CreateBranchModal({
    open,
    onOpenChange,
    issueTitle,
    onConfirm,
    onCancel,
}: CreateBranchModalProps) {
    const branchName = `feature/${issueTitle.replace(/\s+/g, '-').toLowerCase()}`;

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
                    <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm text-gray-600 mb-2">생성될 브랜치 이름:</p>
                        <code className="text-sm bg-white px-2 py-1 rounded border">
                            {branchName}
                        </code>
                    </div>
                    
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
                        onClick={onCancel}
                    >
                        브랜치 없이 진행
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        브랜치 생성하고 진행
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}