"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft, Send, CheckCircle } from "lucide-react"
import Link from "next/link"
import { getApiUrl } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [error, setError] = useState("")
  const [isEmailFocused, setIsEmailFocused] = useState(false);


  const emailInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // 페이지 로드 시 이메일 필드에 자동 포커스
    const timer = setTimeout(() => {
      emailInputRef.current?.focus()
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      setError("이메일을 입력해주세요")
      return false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("올바른 이메일 형식이 아닙니다")
      return false
    } else {
      setError("")
      return true
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) return;

    setIsLoading(true);
    setError("");
    console.log("email", email);
    try {
      const res = await fetch(`${getApiUrl()}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }), // email을 객체로 감싸서 보냄
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "이메일 발송에 실패했습니다.");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setIsEmailSent(true);
    } catch (err: any) {
      setError("이메일 발송 중 오류가 발생했습니다.");
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">이메일을 확인하세요</h2>
            <p className="text-gray-600 mb-6">
              <strong>{email}</strong>로 비밀번호 재설정 링크를 보내드렸습니다.
              <br />
              이메일을 확인하고 링크를 클릭해주세요.
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full bg-[#64748b] hover:bg-[#475569] text-white">
                <Link href="/auth/login">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  로그인으로 돌아가기
                </Link>
              </Button>
              <Button variant="outline" className="w-full bg-transparent" onClick={() => setIsEmailSent(false)}>
                다른 이메일로 재시도
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

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
            <CardTitle className="text-2xl font-bold text-center text-gray-900">비밀번호 찾기</CardTitle>
            <p className="text-center text-gray-600">
              가입하신 이메일 주소를 입력하시면
              <br />
              비밀번호 재설정 링크를 보내드립니다
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                  <Input
                    ref={emailInputRef}
                    id="email"
                    type="email"
                    className={`pl-10 h-11 pt-6 pb-2 transition-all duration-300 peer ${
                      error
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:shadow-lg focus:shadow-red-500/10"
                        : "focus:ring-2 focus:ring-[#64748b]/20 focus:border-[#64748b] focus:shadow-lg focus:shadow-[#64748b]/10"
                    }`}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (error) validateEmail(e.target.value)
                    }}
                    onFocus={() => setIsEmailFocused(true)}
                    onBlur={(e) => {
                      setIsEmailFocused(false);
                      validateEmail(e.target.value);
                    }}

                    placeholder=" "
                    required
                  />
                  <Label
                    htmlFor="email"
                    className={`absolute left-10 transition-all duration-300 pointer-events-none ${
                      email || isEmailFocused
                        ? "top-1 text-xs text-[#64748b] font-medium"
                        : "top-1/2 -translate-y-1/2 text-gray-500"
                    }`}
                  >
                    이메일 주소
                  </Label>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-[#64748b] hover:bg-[#475569] text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    이메일 발송 중...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Send className="w-4 h-4 mr-2" />
                    재설정 링크 보내기
                  </div>
                )}
              </Button>
            </form>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center text-[#64748b] hover:text-[#475569] font-medium hover:underline"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                로그인으로 돌아가기
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
