"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, User, Mail, Edit3, Check, X } from "lucide-react";

interface UserProfile {
  display_name: string;
  email: string;
}

export default function MyPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>({
    display_name: "",
    email: "",
  });
  const [editingDisplayName, setEditingDisplayName] = useState(false);
  const [tempDisplayName, setTempDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 사용자 정보 불러오기
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/user/mypage", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status == 401) {
          alert("로그인 후 이용해주세요.");
          window.location.href = "/auth/login";
        }
        throw new Error("사용자 정보를 불러올 수 없습니다.");
      }

      const userData = await response.json();
      setProfile({
        display_name: userData.display_name,
        email: userData.email,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "정보를 불러오는 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditDisplayName = () => {
    setEditingDisplayName(true);
    setTempDisplayName(profile.display_name);
    setError("");
    setSuccess("");
  };

  const handleCancelEdit = () => {
    setEditingDisplayName(false);
    setTempDisplayName("");
  };

  const handleSaveDisplayName = async () => {
    if (!tempDisplayName.trim()) {
      setError("닉네임을 입력해주세요.");
      return;
    }

    setUpdateLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/user/mypage/updateDisplayName",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            display_name: tempDisplayName,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "닉네임 업데이트에 실패했습니다.");
      }

      setProfile((prev) => ({
        ...prev,
        display_name: tempDisplayName,
      }));
      setEditingDisplayName(false);
      setTempDisplayName("");
      setSuccess("닉네임이 성공적으로 업데이트되었습니다.");

      // 3초 후 성공 메시지 자동 제거
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "닉네임 업데이트 중 오류가 발생했습니다."
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        window.location.href = "/auth/login";
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "로그아웃 중 오류가 발생했습니다."
      );
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">사용자 정보를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CP</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Code Planner</h1>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">마이페이지</h2>
          <div className="flex items-center gap-3 relative">
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.back()}
              disabled={updateLoading}
              className="h-10 w-10 bg-transparent absolute top-0 right-0"
              style={{ zIndex: 10 }}
              aria-label="닫기"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-gray-600">내 정보를 확인하고 관리하세요</p>
        </div>

        {/* 알림 메시지 */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 mb-6">
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* 프로필 정보 카드 */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-bold">
                  {profile.display_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="h-6 w-6 text-blue-600" />내 정보
                </CardTitle>
                <CardDescription className="text-base">
                  계정 정보를 확인하고 수정하세요
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 닉네임 섹션 */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">
                닉네임
              </Label>
              <div className="flex items-center gap-3">
                {editingDisplayName ? (
                  <>
                    <Input
                      type="text"
                      value={tempDisplayName}
                      onChange={(e) => setTempDisplayName(e.target.value)}
                      className="h-12 text-base flex-1"
                      placeholder="닉네임을 입력하세요"
                      disabled={updateLoading}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveDisplayName}
                        disabled={updateLoading}
                        className="h-12 px-4 bg-blue-600 hover:bg-blue-700"
                      >
                        {updateLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={updateLoading}
                        className="h-12 px-4 bg-transparent"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1 h-12 px-4 py-3 bg-gray-50 rounded-md border flex items-center">
                      <span className="text-base text-gray-900">
                        {profile.display_name}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleEditDisplayName}
                      className="h-12 px-4 border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      수정
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* 이메일 섹션 */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                이메일
              </Label>
              <div className="h-12 px-4 py-3 bg-gray-50 rounded-md border flex items-center">
                <span className="text-base text-gray-900">{profile.email}</span>
              </div>
              <p className="text-sm text-gray-500">
                이메일은 변경할 수 없습니다.
              </p>
            </div>

            {/* 계정 정보 */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                계정 정보
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-1">가입일</h4>
                  <p className="text-sm text-blue-700">2024년 12월 31일</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-1">계정 상태</h4>
                  <p className="text-sm text-green-700">활성화</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 추가 설정 카드 */}
        <Card className="shadow-lg border-0 mt-6">
          <CardHeader>
            <CardTitle className="text-lg">계정 관리</CardTitle>
            <CardDescription>
              계정과 관련된 추가 작업을 수행하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1 bg-transparent">
                비밀번호 변경
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={handleLogout}
              >
                로그아웃
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
