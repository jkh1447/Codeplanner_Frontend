"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { useRouter } from "next/navigation";

interface CreateUserDto {
  display_name: string;
  email: string;
  password: string;
  password_again: string;
  agreeTerms?: boolean;
  agreeMarketing?: boolean;
}

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateUserDto>({
    display_name: "",
    email: "",
    password: "",
    password_again: "",
    agreeTerms: false,
    agreeMarketing: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: keyof CreateUserDto, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors({ ...errors, [field]: "" });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.display_name.trim()) newErrors.display_name = "닉네임을 입력해주세요.";
    if (!formData.email.trim()) newErrors.email = "이메일을 입력해주세요.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "올바른 이메일 형식이 아닙니다.";
    if (!formData.password) newErrors.password = "비밀번호를 입력해주세요.";
    else if (formData.password.length < 6) newErrors.password = "비밀번호는 6자 이상이어야 합니다.";
    else if (!/(?=.*[a-zA-Z])/.test(formData.password)) newErrors.password = "영문을 포함해야 합니다.";
    if (formData.password !== formData.password_again) newErrors.password_again = "비밀번호가 일치하지 않습니다.";
    if (!formData.agreeTerms) newErrors.agreeTerms = "이용약관에 동의해주세요.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setSuccess(false);
    try {
      const response = await fetch(`${getApiUrl()}/user/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          display_name: formData.display_name,
          email: formData.email,
          password: formData.password,
          password_again: formData.password_again,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "회원가입에 실패했습니다.");
      }
      setSuccess(true);
      setFormData({
        display_name: "",
        email: "",
        password: "",
        password_again: "",
        agreeTerms: false,
        agreeMarketing: false,
      });
      router.push("/auth/login?success=true");
    } catch (err) {
      setErrors({ ...errors, submit: err instanceof Error ? err.message : "회원가입 중 오류가 발생했습니다." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* 왼쪽 - 브랜딩/설명 (PC에서만 보임) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#64748b] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#64748b] to-[#475569]" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 w-full">
          <div className="mb-8">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
              <span className="text-3xl font-bold">CP</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">시작해보세요</h1>
            <p className="text-xl text-white/80 mb-8">몇 분만에 계정을 만들고 프로젝트 관리를 시작하세요</p>
          </div>
          <div className="space-y-6 text-white/70">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-sm">1</span>
              </div>
              <span>계정 생성 (2분)</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-sm">2</span>
              </div>
              <span>팀 초대 및 설정</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-sm">3</span>
              </div>
              <span>첫 번째 프로젝트 시작</span>
            </div>
          </div>
        </div>
        {/* 장식용 blur 원 */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-xl" />
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/5 rounded-full blur-xl" />
      </div>
      {/* 오른쪽 - 회원가입 폼 */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <div className="w-10 h-10 bg-[#64748b] rounded-lg flex items-center justify-center mr-3 mx-auto mb-2">
              <span className="text-white font-bold text-sm">CP</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">Code Planner</span>
          </div>
          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center">회원가입</CardTitle>
              <CardDescription className="text-center">무료로 시작하고 프로젝트를 효율적으로 관리하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display_name" className="text-sm font-medium">닉네임</Label>
                  <Input
                    id="display_name"
                    type="text"
                    placeholder="사용할 닉네임을 입력하세요"
                    value={formData.display_name}
                    onChange={e => handleInputChange("display_name", e.target.value)}
                    className="h-11"
                    disabled={loading}
                  />
                  {errors.display_name && <p className="text-sm text-red-600">{errors.display_name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={e => handleInputChange("email", e.target.value)}
                    className="h-11"
                    disabled={loading}
                  />
                  {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">비밀번호</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="영문, 숫자 포함 6자 이상"
                    value={formData.password}
                    onChange={e => handleInputChange("password", e.target.value)}
                    className="h-11"
                    disabled={loading}
                  />
                  {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password_again" className="text-sm font-medium">비밀번호 확인</Label>
                  <Input
                    id="password_again"
                    type="password"
                    placeholder="비밀번호를 다시 입력하세요"
                    value={formData.password_again}
                    onChange={e => handleInputChange("password_again", e.target.value)}
                    className="h-11"
                    disabled={loading}
                  />
                  {errors.password_again && <p className="text-sm text-red-600">{errors.password_again}</p>}
                </div>
                <div className="flex items-start space-x-2">
                  <input
                    id="agreeTerms"
                    type="checkbox"
                    checked={!!formData.agreeTerms}
                    onChange={e => handleInputChange("agreeTerms", e.target.checked)}
                    className="mt-1"
                    disabled={loading}
                  />
                  <Label htmlFor="agreeTerms" className="text-sm text-gray-600 leading-5">
                    <a href="/terms" className="text-[#64748b] hover:underline">이용약관</a>과 <a href="/privacy" className="text-[#64748b] hover:underline">개인정보처리방침</a>에 동의합니다
                  </Label>
                </div>
                {errors.agreeTerms && <p className="text-sm text-red-600">{errors.agreeTerms}</p>}
                <div className="flex items-start space-x-2">
                  <input
                    id="agreeMarketing"
                    type="checkbox"
                    checked={!!formData.agreeMarketing}
                    onChange={e => handleInputChange("agreeMarketing", e.target.checked)}
                    className="mt-1"
                    disabled={loading}
                  />
                  <Label htmlFor="agreeMarketing" className="text-sm text-gray-600 leading-5">
                    마케팅 정보 수신에 동의합니다 (선택)
                  </Label>
                </div>
                {errors.submit && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.submit}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-800">
                      회원가입이 완료되었습니다! 로그인해주세요.
                    </AlertDescription>
                  </Alert>
                )}
                <Button
                  type="submit"
                  className="w-full h-11 bg-[#64748b] hover:bg-[#475569] text-white font-medium"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      회원가입 중...
                    </>
                  ) : (
                    "무료로 시작하기"
                  )}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  이미 계정이 있으신가요?{" "}
                  <a
                    href="/auth/login"
                    className="text-[#64748b] hover:text-[#475569] font-medium hover:underline"
                  >
                    로그인
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
