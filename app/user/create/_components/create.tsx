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
}

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateUserDto>({
    display_name: "",
    email: "",
    password: "",
    password_again: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: keyof CreateUserDto, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.display_name.trim()) {
      setError("닉네임을 입력해주세요.");
      return false;
    }
    if (!formData.email.trim()) {
      setError("이메일을 입력해주세요.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("올바른 이메일 형식을 입력해주세요.");
      return false;
    }
    if (!formData.password) {
      setError("비밀번호를 입력해주세요.");
      return false;
    }
    if (formData.password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.");
      return false;
    }
    if (formData.password !== formData.password_again) {
      setError("비밀번호가 일치하지 않습니다.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${getApiUrl()}/user/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
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
      });
      router.push("/auth/login?success=true");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "회원가입 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CP</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Code Planner</h1>
          </div>
          <p className="text-gray-600">새로운 계정을 만들어보세요</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center">
              회원가입
            </CardTitle>
            <CardDescription className="text-center">
              프로젝트 관리를 시작하기 위해 계정을 생성하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display_name" className="text-sm font-medium">
                  닉네임
                </Label>
                <Input
                  id="display_name"
                  type="text"
                  placeholder="사용할 닉네임을 입력하세요"
                  value={formData.display_name}
                  onChange={(e) =>
                    handleInputChange("display_name", e.target.value)
                  }
                  className="h-11"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  이메일
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="h-11"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  비밀번호
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="최소 6자 이상 입력하세요"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="h-11"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_again" className="text-sm font-medium">
                  비밀번호 확인
                </Label>
                <Input
                  id="password_again"
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={formData.password_again}
                  onChange={(e) =>
                    handleInputChange("password_again", e.target.value)
                  }
                  className="h-11"
                  disabled={loading}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
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
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    회원가입 중...
                  </>
                ) : (
                  "회원가입"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                이미 계정이 있으신가요?{" "}
                <a
                  href="/auth/login"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  로그인하기
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
