"use client";

import { getApiUrl } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function GithubOAuth() {
  useEffect(() => {
    const fetchGithubToken = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get("code");
      const response = await fetch(`${getApiUrl()}/auth/github-oauth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
        credentials: "include",
      });

      if (response.ok) {
        alert("Github 인증 성공");
        window.location.href = "/user/mypage";
      } else {
        alert("Github 인증 실패");
        window.location.href = "/user/mypage";
      }
    };
    fetchGithubToken();
  }, []);
  return <div>Github 인증 중</div>;
}
