"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
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
import { Eye, EyeOff, Mail, Lock, ArrowRight, Code2 } from "lucide-react";
import Link from "next/link";

interface LoginDTO {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  // touched, handleBlur 제거
  const [submitted, setSubmitted] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showResendAlert, setShowResendAlert] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const redirect = searchParams.get("redirect");
  const [loginError, setLoginError] = useState("");

  const emailInputRef = useRef<HTMLInputElement>(null);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

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

  useEffect(() => {
    // 페이지 로드 시 이메일 필드에 자동 포커스
    const timer = setTimeout(() => {
      emailInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };
    switch (name) {
      case "email":
        if (!value.trim()) {
          newErrors.email = "이메일을 입력해주세요";
        } else if (!/^[^\s@]+@[^-\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = "올바른 이메일 형식이 아닙니다";
        } else {
          delete newErrors.email;
        }
        break;
      case "password":
        if (!value) {
          newErrors.password = "비밀번호를 입력해주세요";
        } else if (value.length < 6) {
          newErrors.password = "비밀번호는 6자 이상이어야 합니다";
        } else {
          delete newErrors.password;
        }
        break;
    }
    setErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setIsLoading(true);
    setLoginError("");
    const loginData = {
      email: formData.email,
      password: formData.password,
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
        if (result.user.is_verified) {
          if (redirect) {
            router.push("/projects/" + redirect);
          } else {
            router.push("/projectList");
          }
        } else {
          router.push("/auth/needEmail");
        }
      } else {
        const error = await response.json();
        setLoginError(error.message || "로그인 정보를 확인해 주세요.");
        toast({
          title: "로그인 실패",
          description: error.message || "이메일 또는 비밀번호를 확인해주세요.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setLoginError("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
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
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#64748b] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#64748b] to-[#475569]" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 w-full">
          <div className="mb-8">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
              <span className="text-3xl font-bold">CP</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">Code Planner</h1>
            <p className="text-xl text-white/80 mb-8">프로젝트를 계획하고 관리하는 가장 스마트한 방법</p>
          </div>
          <div className="space-y-6 text-white/70">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-sm">1</span>
              </div>
              <span>직관적인 프로젝트 관리</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-sm">2</span>
              </div>
              <span>팀 협업 도구</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-sm">3</span>
              </div>
              <span>실시간 진행 상황 추적</span>
            </div>
          </div>
        </div>
        {/* 장식용 blur 원 */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-xl" />
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/5 rounded-full blur-xl" />
      </div>
      {/* 오른쪽 - 로그인 폼 */}
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
              <CardTitle className="text-2xl font-bold text-center">로그인</CardTitle>
              <CardDescription className="text-center">계정에 로그인하여 프로젝트를 관리하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
              <Input
                      ref={emailInputRef}
                id="email"
                type="email"
                      className={`pl-10 h-11 pt-6 pb-2 transition-all duration-300 peer ${
                        errors.email
                          ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:shadow-lg focus:shadow-red-500/10"
                          : "focus:ring-2 focus:ring-[#64748b]/20 focus:border-[#64748b] focus:shadow-lg focus:shadow-[#64748b]/10"
                      }`}
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        validateField("email", e.target.value);
                      }}
                      onFocus={() => setIsEmailFocused(true)}
                      // onBlur 제거
                      placeholder=" "
                required
              />
                    <Label
                      htmlFor="email"
                      className={`absolute left-10 transition-all duration-300 pointer-events-none ${
                        formData.email || isEmailFocused
                          ? "top-1 text-xs text-[#64748b] font-medium"
                          : "top-1/2 -translate-y-1/2 text-gray-500"
                      }`}
                    >
                      이메일
                    </Label>
                  </div>
                  {submitted && errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
            </div>

            <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
              <Input
                id="password"
                      type={showPassword ? "text" : "password"}
                      className={`pl-10 pr-10 h-11 pt-6 pb-2 transition-all duration-300 peer ${
                        errors.password
                          ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:shadow-lg focus:shadow-red-500/10"
                          : "focus:ring-2 focus:ring-[#64748b]/20 focus:border-[#64748b] focus:shadow-lg focus:shadow-[#64748b]/10"
                      }`}
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        validateField("password", e.target.value);
                      }}
                      onFocus={() => setIsPasswordFocused(true)}
                      // onBlur 제거
                      placeholder=" "
                required
              />
                    <Label
                      htmlFor="password"
                      className={`absolute left-10 transition-all duration-300 pointer-events-none ${
                        formData.password || isPasswordFocused
                          ? "top-1 text-xs text-[#64748b] font-medium"
                          : "top-1/2 -translate-y-1/2 text-gray-500"
                      }`}
                    >
                      비밀번호
                    </Label>
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {submitted && errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      id="remember"
                      type="checkbox"
                      className="rounded border-gray-300 text-[#64748b] focus:ring-[#64748b]"
                      checked={formData.rememberMe}
                      onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-600">
                      로그인 상태 유지
                    </Label>
                  </div>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-[#64748b] hover:text-[#475569] hover:underline"
                  >
                    비밀번호 찾기
                  </Link>
            </div>

            <Button
              type="submit"
                  className="w-full h-11 bg-[#64748b] hover:bg-[#475569] text-white"
              disabled={isLoading}
            >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      로그인 중...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      로그인
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  )}
            </Button>
                {loginError && (
                  <p className="text-sm text-red-600 text-center mt-2">{loginError}</p>
                )}
          </form>

              <div className="text-center">
                <span className="text-gray-600">계정이 없으신가요? </span>
                <Link href="/auth/create" className="text-[#64748b] hover:text-[#475569] font-medium hover:underline">
              회원가입
                </Link>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
}
