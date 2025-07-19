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
  display_name: string;
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
  const [searchQuery, setSearchQuery] = useState("");

  // 모달 상태에 따른 초기화 및 데이터 로딩
  useEffect(() => {
    if (open) {
      // 모달이 열릴 때 상태 초기화
      setSelectedReviewers([]);
      setSearchQuery("");
      setLoading(false);
      
      // 프로젝트 멤버 목록 가져오기
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

      if (projectId) {
        fetchProjectMembers();
      }
    } else {
      // 모달이 닫힐 때 상태 초기화
      setSelectedReviewers([]);
      setSearchQuery("");
      setLoading(false);
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
    setLoading(true);
    try {
      await onConfirm(selectedReviewers);
      // 성공 시 상태 초기화
      setSelectedReviewers([]);
      setSearchQuery("");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // 모든 상태 초기화
    setSelectedReviewers([]);
    setSearchQuery("");
    setLoading(false);
    onCancel();
  };

  // 검색된 멤버 필터링
  const filteredMembers = projectMembers.filter((member) =>
    (member.display_name || member.email)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>리뷰어 지정</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 flex-1 overflow-hidden p-2">
          <div className="text-sm text-gray-600">
            <strong>이슈:</strong> {issueTitle}
          </div>
          
          <div className="space-y-2">
            <Label className="text-base font-medium">
              리뷰어 선택 (선택사항)
            </Label>
            
            {/* 검색 입력 */}
            <div className="relative p-1">
              <input
                type="text"
                placeholder="구성원 이름 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
            
            {/* 멤버 목록 */}
            <div className="space-y-2 max-h-72 overflow-y-auto border border-gray-200 rounded-md p-1">
              {filteredMembers.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  {searchQuery ? "검색 결과가 없습니다." : "구성원이 없습니다."}
                </div>
              ) : (
                filteredMembers.map((member) => (
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
                      <img src={member.avatar} alt={member.display_name || member.email} />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center text-sm font-semibold">
                        {(member.display_name || member.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{member.display_name || member.email}</div>
                    <div className="text-sm text-gray-500">{member.email}</div>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>

          {/* 하단 버튼 영역 */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
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
              disabled={loading}
            >
              {loading ? "처리 중..." : `리뷰어 지정 (${selectedReviewers.length}명)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 