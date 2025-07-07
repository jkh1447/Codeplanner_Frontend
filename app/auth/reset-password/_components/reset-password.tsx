"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getApiUrl } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");
  const router = useRouter();

  const [step, setStep] = useState<"verifying" | "verified" | "error">("verifying");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);

  // 1. 인증 요청
  useEffect(() => {
    async function verify() {
      if (!email || !token) {
        setError("잘못된 접근입니다.");
        setStep("error");
        return;
      }
      try {
        const res = await fetch(`${getApiUrl()}/auth/verify-reset-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, token }),
        });
        if (!res.ok) throw new Error("인증에 실패했습니다.");
        setStep("verified");
      } catch (err: any) {
        setError(err.message || "인증에 실패했습니다.");
        setStep("error");
      }
    }
    verify();
  }, [email, token]);

  // 2. 비밀번호 재설정
  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    try {
      const res = await fetch(`${getApiUrl()}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("비밀번호 재설정에 실패했습니다.");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "비밀번호 재설정에 실패했습니다.");
    }
  }

  // 성공 시 2초 후 로그인 페이지로 이동
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push("/auth/login");
      }, 2000); // 2초 후 이동
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  if (step === "verifying")
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="p-8 text-center text-lg font-semibold text-gray-700">인증 중...</CardContent>
        </Card>
      </div>
    );
  if (step === "error")
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="p-8 text-center text-red-500 font-semibold">{error}</CardContent>
        </Card>
      </div>
    );
  if (success)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">비밀번호 변경 완료</h2>
            <p className="text-gray-600 mb-4">비밀번호가 성공적으로 변경되었습니다!<br />
              <span className="text-sm text-gray-500">잠시 후 로그인 페이지로 이동합니다...</span>
            </p>
            <Button className="w-full bg-[#64748b] hover:bg-[#475569] text-white" onClick={() => router.push("/auth/login")}>로그인으로 이동</Button>
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 bg-[#64748b] rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">CP</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">Code Planner</span>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-gray-900">비밀번호 재설정</CardTitle>
            <p className="text-center text-gray-600">
              새 비밀번호를 입력하고 확인을 위해 한 번 더 입력해주세요.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">새 비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="새 비밀번호"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="비밀번호 확인"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {error && <div className="text-sm text-red-600">{error}</div>}
              <Button type="submit" className="w-full h-11 bg-[#64748b] hover:bg-[#475569] text-white">비밀번호 변경</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}