"use client";

import {
    Dialog,
    DialogHeader,
    DialogTitle,
    DialogContent,
    DialogDescription,
  } from "@/components/ui/dialog";
  import { Label } from "@/components/ui/label";
  import { Input } from "@/components/ui/input";
  import { Textarea } from "@/components/ui/textarea";
  import { useEffect, useState } from "react";
  import { useParams } from "next/navigation";
  import { getApiUrl } from "@/lib/api";
  import { Button } from "@/components/ui/button";
  import { Badge } from "@/components/ui/badge";
  import { Separator } from "@/components/ui/separator";
  import { GitBranch, FileText, Plus, Minus } from "lucide-react";

export default function PullRequestModal({
    open,
    onOpenChange,
    number,
    title,
    head,
    base,
}:{
    open: boolean;
    onOpenChange: (open: boolean) => void;
    number: number;
    title: string;
    head: string;
    base: string;
}) {

    const {projectId} = useParams();
    const [changeList, setChangeList] = useState<any[]>([]);
    const [owner, setOwner] = useState("");
    const [repo, setRepo] = useState("");
    const [openFiles, setOpenFiles] = useState<string[]>([]);
    const [fileChanges, setFileChanges] = useState<{ [filename: string]: any }>({});
    const [loadingFiles, setLoadingFiles] = useState<{ [filename: string]: boolean }>({});

    // 파일 변경 내역 불러오기
    const fetchPullRequestChanges = async (filename: string, owner: string, repo: string, prNumber: number) => {
        try {
            setLoadingFiles(prev => ({ ...prev, [filename]: true }));
            const response = await fetch(`${getApiUrl()}/github/repos/${owner}/${repo}/pulls/${prNumber}/files`, {
                credentials: "include",
            });
            if(!response.ok) {
                throw new Error("Failed to fetch pull request changes");
            }
            const data = await response.json();
            console.log(data);
            
            // 특정 파일명과 매칭되는 데이터 찾기
            const matchedFile = data.find((file: any) => file.filename === filename);
            if (matchedFile) {
                setFileChanges(prev => ({ ...prev, [filename]: matchedFile }));
            }
        } catch (error) {
            console.error("파일 변경 내역 불러오기 실패:", error);
        } finally {
            setLoadingFiles(prev => ({ ...prev, [filename]: false }));
        }
    }

    // 파일 펼치기 핸들러
    const handleToggleFile = async (filename: string) => {
        if (openFiles.includes(filename)) {
            setOpenFiles(openFiles.filter(f => f !== filename));
        } else {
            setOpenFiles([...openFiles, filename]);
            // 이미 받아온 적이 없다면 fetch
            if (!fileChanges[filename]) {
                await fetchPullRequestChanges(filename, owner, repo, number);
            }
        }
    };

    useEffect(() => {
        const getOwner = async () => {
            const projectRes = await fetch(`${getApiUrl()}/projects/${projectId}`, {
                credentials: "include",
              });
            if(!projectRes.ok) {
                throw new Error("Failed to fetch project");
            }
            const project = await projectRes.json();
            const repoUrl = project.repository_url;
            const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
            if(!match) {
                throw new Error("Invalid repository URL");
            }
            const owner = match[1];
            const repo = match[2];
            setOwner(owner);
            setRepo(repo);
            
            await fetchChangeList(owner, repo);
        }
        const fetchChangeList = async (owner: string, repo: string) => {
            console.log("number : ", number);
            console.log("owner : ", owner);
            console.log("repo : ", repo);
            const response = await fetch(`${getApiUrl()}/github/project/${projectId}/pull-request-file-changes/${number}/${owner}/${repo}`, {
                credentials: "include",
                method: "GET",
            });
            if(!response.ok) {
                throw new Error("Failed to fetch change list");
            }
            const data = await response.json();
            console.log(data);
            setChangeList(data);
        }
        getOwner();
    }, [])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Pull Request 정보</DialogTitle>
                    <DialogDescription>Pull Request의 상세 정보를 확인하세요.</DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                    <div className="space-y-6">
                        {/* 제목 */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">제목</h3>
                            <p className="text-lg font-medium">{title}</p>
                        </div>
                        {/* 브랜치 정보 */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <GitBranch className="h-4 w-4 text-gray-500" />
                                <Badge variant="outline" className="font-mono">
                                    {head}
                                </Badge>
                                <span className="text-gray-500">→</span>
                                <Badge variant="outline" className="font-mono">
                                    {base}
                                </Badge>
                            </div>
                        </div>
                        <Separator />
                        {/* 파일 변경 내역 */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-gray-500">파일 변경 내역</h3>
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1 text-green-600">
                                        <Plus className="h-3 w-3" />
                                        <span>{changeList.reduce((sum, file) => sum + (file.additions || 0), 0)} 추가</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-red-600">
                                        <Minus className="h-3 w-3" />
                                        <span>{changeList.reduce((sum, file) => sum + (file.deletions || 0), 0)} 삭제</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {changeList.length > 0 ? changeList.map((file: any, index: number) => (
                                    <div key={index} className="border rounded-lg p-4 bg-white">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-gray-500" />
                                                <span className="font-mono text-sm font-medium">{file.filename}</span>
                                                <Badge variant="outline" className={`text-xs ${file.status === "added" ? "bg-green-100 text-green-800 border-green-200" : file.status === "modified" ? "bg-blue-100 text-blue-800 border-blue-200" : file.status === "deleted" ? "bg-red-100 text-red-800 border-red-200" : "bg-gray-100 text-gray-800 border-gray-200"}`}>
                                                    {file.status === "added" ? "추가됨" : file.status === "modified" ? "수정됨" : file.status === "deleted" ? "삭제됨" : file.status}
                                                </Badge>
                                            </div>
                                            <button
                                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                                                onClick={() => handleToggleFile(file.filename)}
                                            >
                                                {openFiles.includes(file.filename) ? "접기" : "펼치기"}
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-gray-600">
                                            {file.additions > 0 && (
                                                <div className="flex items-center gap-1 text-green-600">
                                                    <Plus className="h-3 w-3" />
                                                    <span>{file.additions}</span>
                                                </div>
                                            )}
                                            {file.deletions > 0 && (
                                                <div className="flex items-center gap-1 text-red-600">
                                                    <Minus className="h-3 w-3" />
                                                    <span>{file.deletions}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* 파일 변경 내역 표시 */}
                                        {openFiles.includes(file.filename) && (
                                            <div className="mt-3 border-t pt-3">
                                                {loadingFiles[file.filename] ? (
                                                    <div className="text-sm text-gray-500">변경 내역을 불러오는 중...</div>
                                                ) : fileChanges[file.filename] ? (
                                                    <div className="space-y-2">
                                                        <div className="text-sm font-medium text-gray-700">변경된 내용:</div>
                                                        <div className="bg-gray-50 rounded p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap border">
                                                            {fileChanges[file.filename].content}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-gray-500">변경 내역을 불러올 수 없습니다.</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )) : <div className="text-gray-400 text-center">변경된 파일이 없습니다.</div>}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}