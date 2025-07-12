"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Mail, Users, Clock, ArrowRight } from "lucide-react";
import { getApiUrl } from "@/lib/api";

interface InvitationData {
  email: string;
  role: string;
  roleDisplayName: string;
  project: {
    id: number;
    title: string;
    description: string;
  };
  hasAccount: boolean;
  token: string;
}

// 로딩 컴포넌트
function InviteLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">초대 링크를 확인하는 중...</p>
        </CardContent>
      </Card>
    </div>
  );
}

// 실제 초대 처리 컴포넌트
function InviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("초대 토큰이 없습니다.");
      setLoading(false);
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/invite?token=${token}`, {
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "초대 링크가 유효하지 않습니다.");
      }

      const data = await response.json();
      setInvitation(data.invitation);
    } catch (err: any) {
      setError(err.message || "초대 링크를 확인하는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!invitation) return;

    setActionLoading(true);
    try {
      const response = await fetch(`${getApiUrl()}/invite/accept?token=${token}`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "초대 수락에 실패했습니다.");
      }

      const data = await response.json();
      
      // 성공 시 프로젝트 페이지로 이동
      alert("프로젝트에 성공적으로 참여했습니다!");
      router.push(`/projects/${invitation.project.id}/summary`);
    } catch (err: any) {
      alert(err.message || "초대 수락 중 오류가 발생했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!invitation) return;

    if (!confirm("정말로 초대를 거부하시겠습니까?")) return;

    setActionLoading(true);
    try {
      const response = await fetch(`${getApiUrl()}/invite/decline?token=${token}`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "초대 거부에 실패했습니다.");
      }

      alert("초대를 거부했습니다.");
      router.push("/projectList");
    } catch (err: any) {
      alert(err.message || "초대 거부 중 오류가 발생했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleNeedSignup = () => {
    // 회원가입 페이지로 이동 (토큰을 유지하여 가입 후 다시 돌아올 수 있도록)
    router.push(`/user/create?redirect=/invite?token=${token}`);
  };

  const handleNeedLogin = () => {
    // 로그인 페이지로 이동
    router.push(`/auth/login?redirect=/invite?token=${token}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">초대 링크를 확인하는 중...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">초대 링크 오류</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push("/projectList")} className="w-full">
              프로젝트 목록으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  // 계정이 없는 경우
  if (!invitation.hasAccount) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <CardTitle className="text-xl">프로젝트 초대</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">{invitation.project.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{invitation.project.description}</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>{invitation.email}</strong>님을 <span className="font-semibold">{invitation.roleDisplayName}</span> 역할로 초대합니다.
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">계정이 필요합니다</span>
              </div>
              <p className="text-sm text-yellow-700">
                프로젝트에 참여하려면 먼저 CodePlanner 계정을 생성해야 합니다.
              </p>
            </div>

            <div className="space-y-3">
              <Button onClick={handleNeedSignup} className="w-full" size="lg">
                <ArrowRight className="h-4 w-4 mr-2" />
                회원가입하고 프로젝트 참여하기
              </Button>
              <Button onClick={handleNeedLogin} variant="outline" className="w-full">
                이미 계정이 있다면 로그인
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 계정이 있는 경우 - 초대 수락/거부
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <CardTitle className="text-xl">프로젝트 초대</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-2">{invitation.project.title}</h3>
            <p className="text-gray-600 text-sm mb-4">{invitation.project.description}</p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 justify-center mb-1">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">초대 정보</span>
              </div>
              <p className="text-sm text-green-700">
                <strong>{invitation.email}</strong>님을 <span className="font-semibold text-blue-600">{invitation.roleDisplayName}</span> 역할로 초대합니다.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2 justify-center mb-1">
                <Clock className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-500">초대 링크는 7일간 유효합니다</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleAccept} 
              className="w-full" 
              size="lg"
              disabled={actionLoading}
            >
              {actionLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              초대 수락하기
            </Button>
            <Button 
              onClick={handleDecline} 
              variant="outline" 
              className="w-full"
              disabled={actionLoading}
            >
              초대 거부하기
            </Button>
          </div>

          <div className="text-center">
            <Button 
              variant="link" 
              onClick={() => router.push("/projectList")}
              className="text-sm text-gray-500"
            >
              프로젝트 목록으로 돌아가기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 메인 페이지 컴포넌트
export default function InvitePage() {
  return (
    <Suspense fallback={<InviteLoading />}>
      <InviteContent />
    </Suspense>
  );
}
