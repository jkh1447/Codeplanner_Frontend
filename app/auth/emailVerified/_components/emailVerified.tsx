"use client";

import { Button } from "@/components/ui/button";
import { getApiUrl } from "@/lib/api";
import { useEffect } from "react";

export default function EmailVerifiedPage() {
  useEffect(() => {
    const verifyEmail = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const email = searchParams.get("email");
      const verifyToken = searchParams.get("verifyToken");
      console.log("email", email);
      console.log("verifyToken", verifyToken);

      // URL 경로 파라미터로 요청
      const response = await fetch(
        `${getApiUrl()}/user/email-verify/${encodeURIComponent(
          email ?? ""
        )}/${encodeURIComponent(verifyToken ?? "")}`,
        {
          method: "GET",
        }
      );
      if (response.ok) {
        // 성공 처리
      } else {
        alert("이메일 인증에 실패했습니다.");
      }
    };
    verifyEmail();
  }, []);
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1>이메일 인증 완료</h1>
      <p>이메일 인증이 완료되었습니다.</p>
      <p>로그인 페이지로 이동합니다.</p>
      <Button onClick={() => (window.location.href = "/auth/login")}>
        로그인 페이지로 이동
      </Button>
    </div>
  );
}
