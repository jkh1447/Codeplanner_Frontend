"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Bot, Send, Loader2 } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { useParams } from "next/navigation";

interface GeneratedIssue {
  id: string;
  title: string;
  description: string;
  estimated_hours?: number;
}

export default function IssueGenerater() {
  const { projectId } = useParams();
  const [meetingNotes, setMeetingNotes] = useState("");
  const [generatedIssues, setGeneratedIssues] = useState<GeneratedIssue[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateIssues = async () => {
    if (!meetingNotes.trim()) {
      alert("회의록을 입력해주세요.");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(`${getApiUrl()}/aimodel/${projectId}/send-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
         text : meetingNotes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate issues");
      }

      const data = await response.json();
      setGeneratedIssues(data.issues || []);
    } catch (error) {
      console.error("Error generating issues:", error);
      alert("이슈 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };



  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">AI 이슈 생성기</h1>
        <p className="text-muted-foreground">
          회의록을 입력하면 AI가 자동으로 이슈를 생성해드립니다
        </p>
      </div>

      {/* 회의록 입력 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            회의록 입력
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="meeting-notes" className="text-base font-medium">
              회의 내용을 자세히 입력해주세요
            </Label>
            <Textarea
              id="meeting-notes"
              placeholder="예시: 오늘 회의에서 새로운 로그인 기능 추가에 대해 논의했습니다. 소셜 로그인(구글, 카카오) 지원이 필요하고, 보안 강화를 위해 2FA 인증도 함께 구현해야 합니다. 기존 회원가입 폼도 개선이 필요합니다..."
              value={meetingNotes}
              onChange={(e) => setMeetingNotes(e.target.value)}
              className="min-h-[200px] resize-none"
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleGenerateIssues}
              disabled={isGenerating || !meetingNotes.trim()}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  이슈 생성하기
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 생성된 이슈 목록 */}
      {generatedIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI가 생성한 이슈 ({generatedIssues.length}개)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedIssues.map((issue) => (
                <Card key={issue.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base">
                      {issue.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {issue.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 이슈가 없을 때 안내 */}
      {!isGenerating && generatedIssues.length === 0 && meetingNotes && (
        <Card>
          <CardContent className="text-center py-8">
            <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              회의록을 입력하고 "이슈 생성하기" 버튼을 클릭하세요
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}