"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/lib/api";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NeedEmailPage() {
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleResendEmail = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/user/email-resend`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("인증 메일 다시 보내기 실패");
      }
      const data = await response.json();
      console.log(data);
      setSuccess(true);
    } catch (error) {
      console.error("인증 메일 다시 보내기 실패:", error);
    }
    router.push("/auth/login?resend=true");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="mx-auto max-w-sm w-full">
        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              인증 메일이 다시 보내졌습니다! 인증 이후 로그인 해주세요.
            </AlertDescription>
          </Alert>
        )}
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">이메일 인증 필요</CardTitle>
          <CardDescription>
            계정 인증이 완료되지 않았습니다. 이메일로 인증해주세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center">
            <p className="text-sm text-gray-500">
              이메일 인증이 만료되셨나요? 재인증 해주세요.
            </p>
          </div>
          <div className="mt-4 text-center" onClick={handleResendEmail}>
            <Button>인증 메일 다시 보내기</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
