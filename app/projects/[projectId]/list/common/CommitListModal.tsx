"use client";
import { useState, useEffect, useRef } from "react";
import { getApiUrl } from "@/lib/api";
import GitCommitIcon from "@/components/icons/GitCommitIcon";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Commit {
    id: string;
    commitHash: string;
    commitMessage: string;
    commitUrl: string;
    createdAt: string;
}

interface PaginationInfo {
    hasNextPage: boolean;
    nextCursor: string | null;
    limit: number;
}

interface ApiResponse {
    commits: Commit[];
    pagination: PaginationInfo;
}

interface CommitListModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    taskId: string;
}

// 시간을 상대적으로 표시하는 함수
function formatTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
        return "방금 전";
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
        return `${diffInHours}시간 전`;
    } else if (diffInDays < 7) {
        return `${diffInDays}일 전`;
    } else {
        return date.toLocaleDateString("ko-KR");
    }
}

function getAnalysisColor(cppcheck: boolean, clangTidy: boolean) {
    if (cppcheck && clangTidy) return "bg-green-500"; // 초록
    if (!cppcheck && !clangTidy) return "bg-red-500"; // 빨강
    return "bg-yellow-400"; // 노랑
}

export default function CommitListModal({
    isOpen,
    onClose,
    projectId,
    taskId,
}: CommitListModalProps) {
    const [commits, setCommits] = useState<Commit[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [hasNextPage, setHasNextPage] = useState(true);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    // 파일 모달 상태
    const [fileModalOpen, setFileModalOpen] = useState(false);
    const [fileList, setFileList] = useState<string[]>([]);
    const [fileLoading, setFileLoading] = useState(false);
    const [fileError, setFileError] = useState("");
    const [selectedCommit, setSelectedCommit] = useState<{owner: string, repo: string, sha: string} | null>(null);
    const [projectOwner, setProjectOwner] = useState("");
    const [projectRepo, setProjectRepo] = useState("");
    const [analyzeResults, setAnalyzeResults] = useState<{ [filename: string]: {cpp: boolean, clang: boolean, format: boolean} | null }>({});
    const [analyzing, setAnalyzing] = useState<{ [filename: string]: boolean }>({});

    // 초기 커밋 목록 불러오기
    useEffect(() => {
        const fetchInitialCommits = async () => {
            try {
                setLoading(true);
                setError("");
                setCommits([]);
                setHasNextPage(true);
                setNextCursor(null);

                const response = await fetch(
                    `${getApiUrl()}/github/webhook/commit/${taskId}/infinite`,
                    { credentials: "include" }
                );
                if (!response.ok) {
                    throw new Error("커밋 정보를 불러오지 못했습니다");
                }
                const data: ApiResponse = await response.json();
                setCommits(data.commits);
                setHasNextPage(data.pagination.hasNextPage);
                setNextCursor(data.pagination.nextCursor);
            } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
            } finally {
                setLoading(false);
            }
        };

        // 프로젝트 owner/repo 정보 불러오기
        const fetchProjectInfo = async () => {
            try {
                const response = await fetch(`${getApiUrl()}/projects/${projectId}`, { credentials: "include" });
                if (response.ok) {
                    const projectData = await response.json();
                    // 프로젝트 데이터에서 owner/repo 추출 (필드명은 실제 API 응답에 맞게 수정)
                    if (projectData.repository_url) {
                        const match = projectData.repository_url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
                        if (match) {
                            setProjectOwner(match[1]);
                            setProjectRepo(match[2]);
                        }
                    }
                }
            } catch (err) {
                console.error("프로젝트 정보 불러오기 실패:", err);
            }
        };

        if (isOpen) {
            fetchInitialCommits();
            fetchProjectInfo();
        }
    }, [taskId, isOpen, projectId]);

    // 추가 커밋 목록 불러오기 (무한스크롤)
    const loadMoreCommits = async () => {
        if (loadingMore || !hasNextPage || !nextCursor) return;

        try {
            setLoadingMore(true);
            const response = await fetch(
                `${getApiUrl()}/github/webhook/commit/${taskId}/infinite?cursor=${nextCursor}`,
                { credentials: "include" }
            );
            if (!response.ok) {
                throw new Error("추가 커밋 정보를 불러오지 못했습니다");
            }
            const data: ApiResponse = await response.json();
            setCommits((prev) => [...prev, ...data.commits]);
            setHasNextPage(data.pagination.hasNextPage);
            setNextCursor(data.pagination.nextCursor);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoadingMore(false);
        }
    };

    // 스크롤 이벤트 핸들러
    useEffect(() => {
        const handleScroll = () => {
            const scrollContainer = scrollContainerRef.current;
            if (!scrollContainer) return;

            const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
            const threshold = 100; // 스크롤 끝에서 100px 전에 로드

            if (scrollTop + clientHeight >= scrollHeight - threshold) {
                loadMoreCommits();
            }
        };

        // 모달이 열려있을 때만 스크롤 이벤트 리스너 추가
        if (isOpen && scrollContainerRef.current) {
            const scrollContainer = scrollContainerRef.current;
            scrollContainer.addEventListener("scroll", handleScroll);

            return () => {
                scrollContainer.removeEventListener("scroll", handleScroll);
            };
        }
    }, [isOpen, hasNextPage, nextCursor, loadingMore]);

    // 파일 목록 불러오기
    const handleShowFiles = async (sha: string) => {
        if (!projectOwner || !projectRepo) {
            alert("프로젝트 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
            return;
        }
        
        setFileModalOpen(true);
        setFileLoading(true);
        setFileError("");
        setFileList([]);
        setSelectedCommit({ owner: projectOwner, repo: projectRepo, sha });
        try {
            const res = await fetch(`${getApiUrl()}/github/repos/${projectOwner}/${projectRepo}/commit/${sha}/files`, { credentials: "include" });
            if (!res.ok) throw new Error("파일 목록을 불러오지 못했습니다.");
            const data = await res.json();
            console.log("들어온새끼: ", data)
            setFileList(data || []);
        } catch (err: any) {
            setError(err.message || "파일 목록 오류");
        } finally {
            setFileLoading(false);
        }
    };

    // 분석 함수
    const handleAnalyze = async (file: any) => {
        setAnalyzing(prev => ({ ...prev, [file.filename]: true }));
        setAnalyzeResults(prev => ({ ...prev, [file.filename]: null }));
        try {
            const res = await fetch(
                `${getApiUrl()}/analysis/github/commit/${projectOwner}/${projectRepo}/${selectedCommit?.sha}?file=${file.filename}`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                }
            );
            if (!res.ok) throw new Error("분석 실패");
            const data = await res.json();
            const result = data.find((r: any) => r.file === file.filename);
            setAnalyzeResults(prev => ({
                ...prev,
                [file.filename]: {
                    cpp: !!result?.cppcheck?.success,
                    clang: !!result?.clangTidy?.success,
                }
            }));
        } catch {
            setAnalyzeResults(prev => ({
                ...prev,
                [file.filename]: { cpp: false, clang: false }
            }));
        } finally {
            setAnalyzing(prev => ({ ...prev, [file.filename]: false }));
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-50 animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <GitCommitIcon className="w-6 h-6 text-gray-600" />
                            <h2 className="text-xl font-semibold text-gray-900">
                                커밋 목록
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden">
                        {/* Commits List */}
                        <div
                            ref={scrollContainerRef}
                            className="h-full overflow-y-auto p-4 modal-content"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center h-32">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <span className="ml-2 text-gray-600">
                                        커밋 정보를 불러오는 중...
                                    </span>
                                </div>
                            ) : error ? (
                                <div className="text-red-500 text-center py-8">
                                    {error}
                                </div>
                            ) : commits.length > 0 ? (
                                <div className="space-y-3">
                                    {commits.map((commit: Commit) => (
                                        <div
                                            key={commit.id}
                                            className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                        >
                                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                            <div className="flex-1 min-w-0">
                                                <a
                                                    href={commit.commitUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-medium text-blue-600 hover:text-blue-800 truncate block"
                                                >
                                                    {commit.commitMessage}
                                                </a>
                                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                                    <span>
                                                        {formatTimeAgo(
                                                            commit.createdAt
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                                                    {commit.commitHash.slice(
                                                        0,
                                                        7
                                                    )}
                                                </span>
                                            </div>
                                            <button
                                                className="text-blue-600 underline text-xs ml-4"
                                                onClick={() => {
                                                    handleShowFiles(commit.commitHash);
                                                }}
                                            >
                                                파일 보기
                                            </button>
                                        </div>
                                    ))}

                                    {/* 무한스크롤 로딩 인디케이터 */}
                                    {loadingMore && (
                                        <div className="flex items-center justify-center py-4">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                            <span className="ml-2 text-gray-600 text-sm">
                                                더 많은 커밋을 불러오는 중...
                                            </span>
                                        </div>
                                    )}

                                    {/* 더 이상 로드할 커밋이 없을 때 */}
                                    {!hasNextPage && commits.length > 0 && (
                                        <div className="text-center py-4 text-gray-500 text-sm">
                                            모든 커밋을 불러왔습니다.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    커밋이 없습니다.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 파일 목록 모달 */}
            <Dialog open={fileModalOpen} onOpenChange={setFileModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>커밋 파일 목록</DialogTitle>
                </DialogHeader>
                {fileLoading && <div>불러오는 중...</div>}
                {fileError && <div className="text-red-500">{fileError}</div>}
                <div className="mt-4 space-y-3">
                  {fileList.map((file: any, idx) => {
                    const result = analyzeResults[file.filename];
                    let color = "";
                    if (result) {
                        if (result.cpp && result.clang) color = "bg-green-500";
                        else if (!result.cpp && !result.clang) color = "bg-red-500";
                        else color = "bg-yellow-400";
                    }
                    return (
                        <div key={file.filename + '-' + idx} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition bg-white flex items-center">
                            <div className="mr-4 flex-shrink-0">
                                {result && (
                                    <span className={`inline-block w-4 h-4 rounded-full ${color}`} title="분석 결과" />
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="font-semibold text-base text-gray-800 truncate max-w-[70%]">
                                        {file.filename}
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                        file.status === 'added' ? 'bg-green-100 text-green-700' :
                                        file.status === 'modified' ? 'bg-yellow-100 text-yellow-700' :
                                        file.status === 'removed' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {file.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span>언어: {file.language}</span>
                                    <span>•</span>
                                    <span>파일 크기: {file.content ? file.content.length : 0} 문자</span>
                                </div>
                            </div>
                            <button
                                className="ml-4 px-3 py-1 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600 disabled:opacity-50"
                                onClick={() => handleAnalyze(file)}
                                disabled={!!analyzing[file.filename]}
                            >
                                {analyzing[file.filename] ? "분석 중..." : "분석"}
                            </button>
                        </div>
                    );
                  })}
                </div>
                {fileList.length === 0 && !fileLoading && !fileError && <div>파일이 없습니다.</div>}
              </DialogContent>
            </Dialog>
        </>
    );
}
