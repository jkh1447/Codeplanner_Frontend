"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { getApiUrl } from "@/lib/api";

interface LoginDTO {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showResendAlert, setShowResendAlert] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const success = searchParams.get("success");
    const resend = searchParams.get("resend");
    if (success === "true") {
      setShowSuccessAlert(true);
      // URL에서 success 파라미터 제거
      router.replace("/auth/login");
    }
    if (resend === "true") {
      setShowResendAlert(true);
      // URL에서 resend 파라미터 제거
      router.replace("/auth/login");
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const loginData: LoginDTO = {
      email,
      password,
    };

    try {
      const response = await fetch(`${getApiUrl()}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "로그인 성공",
          description: "성공적으로 로그인되었습니다.",
        });
        // 로그인 성공 후 리다이렉트 (필요에 따라 수정)
        console.log(result.user.is_verified);
        if (result.user.is_verified) {
          router.push("/projectList");
        } else {
          router.push("/auth/needEmail");
        }
      } else {
        const error = await response.json();
        toast({
          title: "로그인 실패",
          description: error.message || "이메일 또는 비밀번호를 확인해주세요.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpClick = () => {
    // 개발/배포 환경에 따라 회원가입 경로 분기
    if (process.env.NEXT_PUBLIC_ENV === "production") {
      router.push("/user/create"); // 배포 환경: 상대경로 사용
    } else {
      router.push("http://localhost:3000/user/create"); // 개발 환경: 로컬 주소 사용
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">로그인</CardTitle>
          <CardDescription>
            계정에 로그인하여 프로젝트를 관리하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showSuccessAlert && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                회원가입이 완료되었습니다! 로그인해주세요.
              </AlertDescription>
            </Alert>
          )}
          {showResendAlert && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                인증 메일이 다시 보내졌습니다! 인증 이후 로그인 해주세요.
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            계정이 없으신가요?{" "}
            <button
              onClick={handleSignUpClick}
              className="text-blue-600 hover:underline font-medium"
            >
              회원가입
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
