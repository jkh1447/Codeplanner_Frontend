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

interface CommitFile {
  filename: string;
  status: 'added' | 'modified' | 'removed' | string; // github에서 오는 값 기준
  language?: string;
  content?: string;
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
    const [fileContents, setFileContents] = useState<{ [filename: string]: string }>({});
    const [analyzeResults, setAnalyzeResults] = useState<{
      [filename: string]: {
        cpp: boolean;
        clang: boolean;
        format: boolean;
        cppcheckOutput?: string;
        clangTidyOutput?: string;
        clangFormatOutput?: string;
        cppcheckIssues?: any[];
        clangTidyIssues?: any[];
        clangFormatIssues?: any[];
      } | null;
    }>({});
    const [analyzing, setAnalyzing] = useState<{ [filename: string]: boolean }>({});

    // 파일 모달이 열릴 때마다 분석 상태 초기화
    useEffect(() => {
      if (fileModalOpen) {
        setAnalyzeResults({});
        setAnalyzing({});
      }
    }, [fileModalOpen]);

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
                    format: !!result?.clangFormat?.success,
                    cppcheckOutput: result?.cppcheck && !result?.cppcheck?.success ? result.cppcheck.output : undefined,
                    clangTidyOutput: result?.clangTidy && !result?.clangTidy?.success ? result.clangTidy.output : undefined,
                    clangFormatOutput: result?.clangFormat && !result?.clangFormat?.success ? result.clangFormat.output : undefined,
                    cppcheckIssues: result?.cppcheck?.issues,
                    clangTidyIssues: result?.clangTidy?.issues,
                    clangFormatIssues: result?.clangFormat?.issues,
                }
            }));
        } catch {
            setAnalyzeResults(prev => ({
                ...prev,
                [file.filename]: { cpp: false, clang: false, format: false }
            }));
        } finally {
            setAnalyzing(prev => ({ ...prev, [file.filename]: false }));
        }
    };

    // 파일 가져오는 함수
    const handleGetContent = async (file: CommitFile) => {
    const [owner, repo] = file.filename.split('/'); // 예시 처리
    const sha = selectedCommit?.sha; // 선택된 SHA가 있다고 가정

    try {
        const res = await fetch(
        `${getApiUrl()}/github/repos/commit/${projectOwner}/${projectRepo}/${sha}?file=${file.filename}`,
            {
                credentials: "include",
            }
        );
        const data = await res.json();

        // 파일 내용 저장 (예: 상태 업데이트)
        setFileContents((prev) => ({
        ...prev,
        [file.filename]: data.content, // API 응답이 content 필드를 포함한다고 가정
        }));
    } catch (err) {
        console.error('파일 내용을 가져오지 못했어요:', err);
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
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    커밋 파일 목록
                  </DialogTitle>
                </DialogHeader>
                {fileLoading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">파일 목록을 불러오는 중...</span>
                  </div>
                )}
                {fileError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {fileError}
                    </div>
                  </div>
                )}
                <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto">
                  {fileList.map((file: any, idx) => {
                    const result = analyzeResults[file.filename];
                    let color = "";
                    let statusColor = "";
                    if (result) {
                        // 새 색상 로직: 둘 다 성공(초록), 둘 다 실패(빨강), 하나만 성공(노랑)
                        const cppSuccess = !!result.cpp;
                        const formatSuccess = !!result.format;
                        if (cppSuccess && formatSuccess) color = "bg-green-500";
                        else if (!cppSuccess && !formatSuccess) color = "bg-red-500";
                        else color = "bg-yellow-400";
                    }
                    
                    // 파일 상태에 따른 색상
                    if (file.status === 'added') statusColor = 'bg-green-100 text-green-800 border-green-200';
                    else if (file.status === 'modified') statusColor = 'bg-yellow-100 text-yellow-800 border-yellow-200';
                    else if (file.status === 'removed') statusColor = 'bg-red-100 text-red-800 border-red-200';
                    else statusColor = 'bg-gray-100 text-gray-800 border-gray-200';

                    return (
                        <div key={file.filename + '-' + idx} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200">
                            <div className="flex items-start gap-4">
                                {/* 분석 결과 표시 */}
                                <div className="flex-shrink-0">
                                    {result && (
                                        <div className={`w-4 h-4 rounded-full ${color} shadow-sm`} title="분석 결과" />
                                    )}
                                </div>
                                
                                {/* 파일 정보 */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <h3 className="font-semibold text-gray-900 break-all">
                                                {file.filename}
                                            </h3>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor} flex-shrink-0`}>
                                            {file.status}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                            <span>언어: {file.language || 'Unknown'}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                            </svg>
                                            <span>크기: {file.content ? file.content.length : 0} 문자</span>
                                        </div>
                                    </div>
                                    
                                    {/* 첫 번째 버튼 */}
                                    <div className='flex gap-2'>
                                        <button
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                                                analyzing[file.filename]
                                                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                                    : 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md'
                                            }`}
                                            onClick={() => handleAnalyze(file)}
                                            disabled={!!analyzing[file.filename]}
                                        >
                                            {analyzing[file.filename] ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    분석 중...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                    분석
                                                </>
                                            )}
                                        </button>
                                        {/* 두 번째 버튼 */}
                                        <button
                                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-gray-200 hover:bg-gray-300 text-gray-800"
                                            onClick={() => handleGetContent(file)}
                                        >
                                            내용 보기
                                        </button>
                                    </div>
                                    {/* 파일 내용 출력 */}
                                    {fileContents[file.filename] && (
                                        <div className="mt-4">
                                            <div className="text-xs text-gray-500 mb-1">변경된 내용:</div>
                                            {(() => {
                                                const codeLines = (fileContents[file.filename] || "").split('\n');
                                                // cppcheck 에러 라인 추출
                                                let cppcheckErrorLines = new Set<number>();
                                                if (result && result.cppcheckIssues) {
                                                    cppcheckErrorLines = new Set(result.cppcheckIssues.map((issue: any) => issue.line));
                                                }
                                                return (
                                                    <pre className="bg-gray-100 border rounded p-3 text-sm font-mono overflow-x-auto whitespace-pre-wrap max-w-full">
                                                        {codeLines.map((line, idx) => {
                                                            const lineNumber = idx + 1;
                                                            const isCppcheckError = cppcheckErrorLines.has(lineNumber);
                                                            return (
                                                                <div
                                                                    key={idx}
                                                                    className="flex"
                                                                >
                                                                    <span className="w-8 text-right pr-2 select-none text-gray-400">{lineNumber}</span>
                                                                    <span className={
                                                                        "whitespace-pre flex-1" +
                                                                        (isCppcheckError ? " underline decoration-red-500 decoration-2" : "")
                                                                    }>{line}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </pre>
                                                );
                                            })()}
                                        </div>
                                    )}
                                    
                                </div>
                            </div>
                            
                            {/* clang-format 등 분석 결과 */}
                            {result && (
                                <div className="mt-4 space-y-3">
                                    {/* cppcheck 에러 */}
                                    {result.cpp === false && (result.cppcheckIssues?.length ?? 0) > 0 && (
                                        <div className="bg-red-50 border border-red-200 rounded p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="font-bold text-red-700">cppcheck 에러</span>
                                            </div>
                                            <ul className="ml-6 list-disc text-red-700 text-sm font-mono">
                                                {(result.cppcheckIssues ?? []).map((issue: any, idx: number) => (
                                                    <li key={idx}>
                                                        타입: {issue.type} [{issue.line}, {issue.column}]: {issue.message}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {/* clang-format 에러 */}
                                    {result.format === false && (result.clangFormatIssues?.length ?? 0) > 0 && (
                                        <div className="bg-purple-50 border border-purple-200 rounded p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="font-bold text-purple-700">clang-format 에러</span>
                                            </div>
                                            <ul className="ml-6 list-disc text-purple-700 text-sm font-mono">
                                                {(result.clangFormatIssues ?? []).map((issue: any, idx: number) => (
                                                    <li key={idx}>
                                                        타입: {issue.type} [{issue.line}, {issue.column}]: {issue.message}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                  })}
                </div>
                {fileList.length === 0 && !fileLoading && !fileError && (
                    <div className="text-center py-8 text-gray-500">
                        <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        파일이 없습니다.
                    </div>
                )}
              </DialogContent>
            </Dialog>
        </>
    );
}
