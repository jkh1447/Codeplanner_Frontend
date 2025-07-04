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
import { Loader2, Check, Github, AlertCircle, Plus } from "lucide-react";
import { getApiUrl } from "@/lib/api";

type ConnectionStatus = "idle" | "loading" | "success" | "error";
type ConnectionMode = "connect" | "create";

export default function GitHubConnector({
    setRepositoryUrl,
}: {
    setRepositoryUrl: (repositoryUrl: string) => void;
}) {
    const [repoUrl, setRepoUrl] = useState("");
    const [status, setStatus] = useState<ConnectionStatus>("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const [mode, setMode] = useState<ConnectionMode>("connect");
    const [newRepoName, setNewRepoName] = useState("");
    const [newRepoDescription, setNewRepoDescription] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);

    const handleConnect = async () => {
        if (mode === "connect") {
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
        } else {
            // 새로운 저장소 생성 모드
            if (!newRepoName.trim()) {
                setErrorMessage("저장소 이름을 입력해주세요.");
                setStatus("error");
                return;
            }

            setStatus("loading");
            setErrorMessage("");

            try {
                const response = await fetch(`${getApiUrl()}/github/create-repo`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        repoName: newRepoName.trim(),
                        description: newRepoDescription.trim(),
                        isPrivate
                    })
                });

                if (!response.ok) {
                    const text = await response.text();
                    let msg = text;
                    try { msg = JSON.parse(text).message; } catch { }
                    throw new Error(`GitHub 저장소 생성 실패: ${msg}`);
                }

                const { repositoryUrl } = await response.json();
                setStatus("success");
                setRepositoryUrl(repositoryUrl);
            } catch (error) {
                setStatus("error");
                setErrorMessage(error instanceof Error ? error.message : "저장소 생성 중 오류가 발생했습니다.");
            }
        }
    };

    const handleReset = () => {
        setStatus("idle");
        setRepoUrl("");
        setNewRepoName("");
        setNewRepoDescription("");
        setIsPrivate(false);
        setErrorMessage("");
    };

    const getButtonContent = () => {
        switch (status) {
            case "loading":
                return (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {mode === "connect" ? "연결 중..." : "생성 중..."}
                    </>
                );
            case "success":
                return (
                    <>
                        <Check className="w-4 h-4 mr-2" />
                        {mode === "connect" ? "연결 완료" : "생성 완료"}
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
                        {mode === "connect" ? <Github className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                        {mode === "connect" ? "연결하기" : "생성하기"}
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
                    GitHub Repository
                </CardTitle>
                <CardDescription>
                    기존 저장소를 연결하거나 새로운 저장소를 생성하세요.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* 모드 선택 버튼 */}
                <div className="flex gap-2">
                    <Button
                        variant={mode === "connect" ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                            setMode("connect");
                            handleReset();
                        }}
                        className="flex-1"
                    >
                        <Github className="w-4 h-4 mr-2" />
                        기존 저장소 연결
                    </Button>
                    <Button
                        variant={mode === "create" ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                            setMode("create");
                            handleReset();
                        }}
                        className="flex-1"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        새 저장소 생성
                    </Button>
                </div>

                {mode === "connect" ? (
                    // 기존 저장소 연결 모드
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
                    </div>
                ) : (
                    // 새 저장소 생성 모드
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-repo-name">저장소 이름</Label>
                            <Input
                                id="new-repo-name"
                                type="text"
                                placeholder="my-project"
                                value={newRepoName}
                                onChange={(e) => setNewRepoName(e.target.value)}
                                disabled={status === "loading" || status === "success"}
                                className={
                                    status === "error" ? "border-destructive" : ""
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-repo-description">설명 (선택사항)</Label>
                            <Input
                                id="new-repo-description"
                                type="text"
                                placeholder="프로젝트에 대한 간단한 설명"
                                value={newRepoDescription}
                                onChange={(e) => setNewRepoDescription(e.target.value)}
                                disabled={status === "loading" || status === "success"}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="is-private"
                                checked={isPrivate}
                                onChange={(e) => setIsPrivate(e.target.checked)}
                                disabled={status === "loading" || status === "success"}
                                className="rounded"
                            />
                            <Label htmlFor="is-private">비공개 저장소로 생성</Label>
                        </div>
                    </div>
                )}

                {errorMessage && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errorMessage}
                    </p>
                )}

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
                            {mode === "connect" 
                                ? "Repository가 성공적으로 연결되었습니다!"
                                : "새 Repository가 성공적으로 생성되었습니다!"
                            }
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
