"use client";

import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getApiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";

interface ProjectMember {
  id: string;
  displayName: string;
  email: string;
  avatar?: string;
}

interface AssignReviewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issueTitle: string;
  onConfirm: (reviewers: string[]) => void;
  onCancel: () => void;
}

export default function AssignReviewerModal({
  open,
  onOpenChange,
  issueTitle,
  onConfirm,
  onCancel,
}: AssignReviewerModalProps) {
  const { projectId } = useParams();
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // 프로젝트 멤버 목록 가져오기
  useEffect(() => {
    const fetchProjectMembers = async () => {
      try {
        const response = await fetch(
          `${getApiUrl()}/projects/${projectId}/members`,
          {
            credentials: "include",
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch project members");
        }
        const data = await response.json();
        setProjectMembers(data);
      } catch (error) {
        console.error("Error fetching project members:", error);
      }
    };

    if (open && projectId) {
      fetchProjectMembers();
    }
  }, [open, projectId]);

  const handleReviewerToggle = (memberId: string) => {
    setSelectedReviewers(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleConfirm = async () => {
    if (selectedReviewers.length === 0) {
      alert("최소 한 명의 리뷰어를 선택해주세요.");
      return;
    }
    
    setLoading(true);
    try {
      await onConfirm(selectedReviewers);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedReviewers([]);
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>리뷰어 지정</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <strong>이슈:</strong> {issueTitle}
          </div>
          
          <div className="space-y-2">
            <Label className="text-base font-medium">
              리뷰어 선택 (1명 이상 선택)
            </Label>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {projectMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => handleReviewerToggle(member.id)}
                >
                  <Checkbox
                    checked={selectedReviewers.includes(member.id)}
                    onChange={() => handleReviewerToggle(member.id)}
                  />
                  <Avatar className="w-8 h-8">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.displayName || member.email} />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center text-sm font-semibold">
                        {(member.displayName || member.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{member.displayName || member.email}</div>
                    <div className="text-sm text-gray-500">{member.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              취소
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading || selectedReviewers.length === 0}
            >
              {loading ? "처리 중..." : "리뷰어 지정"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 