"use client";

import { Button } from "@/components/ui/button";
import { getApiUrl } from "@/lib/api";
import { useEffect } from "react";

export default function EmailVerifiedPage() {
  useEffect(() => {
    const apiUrl = getApiUrl();
    const verifyEmail = async () => {
      // URLSearchParams를 사용해서 쿼리스트링을 붙여서 GET 요청을 보냅니다.
      const searchParams = new URLSearchParams(window.location.search);
      const email = searchParams.get("email");
      const verifyToken = searchParams.get("verifyToken");
      const response = await fetch(
        `${apiUrl}/user/email-verify?email=${encodeURIComponent(
          email ?? ""
        )}&verifyToken=${encodeURIComponent(verifyToken ?? "")}`,
        {
          method: "GET",
        }
      );
      if (response.ok) {
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
