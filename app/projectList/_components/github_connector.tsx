"use client";

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
import { Loader2, Check, Github, AlertCircle } from "lucide-react";
import { getApiUrl } from "@/lib/api";

type ConnectionStatus = "idle" | "loading" | "success" | "error";

export default function GitHubConnector({ setRepositoryUrl }: { setRepositoryUrl: (repositoryUrl: string) => void }) {
    const [repoUrl, setRepoUrl] = useState("");
    const [status, setStatus] = useState<ConnectionStatus>("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleConnect = async () => {
        if (!repoUrl.trim()) {
            setErrorMessage("Repository URL을 입력해주세요.");
            setStatus("error");
            return;
        }

        // GitHub URL 형식 검증
        const githubUrlPattern =
            /^https:\/\/github\.com\/[\w\-.]+\/[\w\-.]+\/?$/;
        if (!githubUrlPattern.test(repoUrl.trim())) {
            setErrorMessage("올바른 GitHub repository URL을 입력해주세요.");
            setStatus("error");
            return;
        }

        setStatus("loading");
        setErrorMessage("");

        try {
          // 실제 연결 로직을 시뮬레이션 (2-3초 대기)
          const encodedRepoUrl = encodeURIComponent(repoUrl);
          const response = await fetch(
              `${getApiUrl()}/github/connect/${encodedRepoUrl}`,
              {
                method: "GET",
                credentials: "include",
              }
          );
          if (!response.ok) {
            throw new Error("Failed to connect to GitHub");
          }
          const data = await response.json();

            // 성공적으로 연결됨
            setStatus("success");
            setRepositoryUrl(repoUrl);
        } catch (error) {
            setStatus("error");
            setErrorMessage("연결 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
    };

    const handleReset = () => {
        setStatus("idle");
        setRepoUrl("");
        setErrorMessage("");
    };

    const getButtonContent = () => {
        switch (status) {
            case "loading":
                return (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        연결 중...
                    </>
                );
            case "success":
                return (
                    <>
                        <Check className="w-4 h-4 mr-2" />
                        연결 완료
                    </>
                );
            case "error":
                return (
                    <>
                        <AlertCircle className="w-4 h-4 mr-2" />
                        다시 시도
                    </>
                );
            default:
                return (
                    <>
                        <Github className="w-4 h-4 mr-2" />
                        연결하기
                    </>
                );
        }
    };

    const getButtonVariant = () => {
        switch (status) {
            case "success":
                return "default";
            case "error":
                return "destructive";
            default:
                return "default";
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Github className="w-5 h-5" />
                    GitHub Repository 연결
                </CardTitle>
                <CardDescription>
                    연결할 GitHub repository의 URL을 입력해주세요.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="repo-url">Repository URL</Label>
                    <Input
                        id="repo-url"
                        type="url"
                        placeholder="https://github.com/username/repository"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        disabled={status === "loading" || status === "success"}
                        className={
                            status === "error" ? "border-destructive" : ""
                        }
                    />
                    {errorMessage && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errorMessage}
                        </p>
                    )}
                </div>

                <div className="flex gap-2">
                    <Button
                        onClick={
                            status === "success" ? handleReset : handleConnect
                        }
                        disabled={status === "loading"}
                        variant={getButtonVariant()}
                        className="flex-1"
                    >
                        {getButtonContent()}
                    </Button>

                    {status === "success" && (
                        <Button
                            onClick={handleReset}
                            variant="outline"
                            size="icon"
                        >
                            <Github className="w-4 h-4" />
                        </Button>
                    )}
                </div>

                {status === "success" && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm text-green-800 flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            Repository가 성공적으로 연결되었습니다!
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
