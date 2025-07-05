"use client";
import { useState, useEffect, useRef } from "react";
import { getApiUrl } from "@/lib/api";
import GitCommitIcon from "@/components/icons/GitCommitIcon";

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

        if (isOpen) {
            fetchInitialCommits();
        }
    }, [taskId, isOpen]);

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
        </>
    );
}
