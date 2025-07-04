"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";

export default function EmailVerifiedPage() {
  const [verificationStatus, setVerificationStatus] = useState<"loading" | "success" | "error">("loading");
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const emailParam = searchParams.get("email");
      const verifyToken = searchParams.get("verifyToken");
      setEmail(emailParam);
      if (!emailParam || !verifyToken) {
        setVerificationStatus("error");
        return;
      }
      try {
        const response = await fetch(
          `${getApiUrl()}/user/email-verify/${encodeURIComponent(emailParam)}/${encodeURIComponent(verifyToken)}`,
          { method: "GET" }
        );
        if (response.ok) {
          setVerificationStatus("success");
        } else {
          setVerificationStatus("error");
        }
      } catch {
        setVerificationStatus("error");
      }
    };
    verifyEmail();
  }, []);

  const handleResendEmail = async () => {
    setIsResending(true);
    // 실제로는 이메일 재발송 API 호출 필요
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsResending(false);
  };

  const renderContent = () => {
    switch (verificationStatus) {
      case "loading":
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-[#64748b]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-8 h-8 border-2 border-[#64748b] border-t-transparent rounded-full animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">이메일 인증 중...</h2>
            <p className="text-gray-600">잠시만 기다려주세요</p>
          </div>
        );
      case "success":
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">인증 완료!</h2>
            <p className="text-gray-600 mb-6">
              이메일 인증이 성공적으로 완료되었습니다.<br />
              이제 Code Planner의 모든 기능을 사용하실 수 있습니다.
            </p>
            <Button asChild className="w-full bg-[#64748b] hover:bg-[#475569] text-white">
              <Link href="/projectList">대시보드로 이동</Link>
            </Button>
          </div>
        );
      case "error":
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">인증 실패</h2>
            <p className="text-gray-600 mb-6">
              이메일 인증 링크가 만료되었거나 유효하지 않습니다.<br />
              새로운 인증 이메일을 요청해주세요.
            </p>
            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                className="w-full bg-[#64748b] hover:bg-[#475569] text-white"
                disabled={isResending}
              >
                {isResending ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    재발송 중...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    인증 이메일 재발송
                  </div>
                )}
              </Button>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/auth/login">로그인으로 돌아가기</Link>
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <div className="w-10 h-10 bg-[#64748b] rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">CP</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">Code Planner</span>
        </div>
        <Card className="border-0 shadow-xl">
          <CardContent className="p-8">{renderContent()}</CardContent>
        </Card>
      </div>
    </div>
  );
}
