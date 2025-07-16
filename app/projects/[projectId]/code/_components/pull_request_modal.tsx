'use client';

import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getApiUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { GitBranch, FileText, Plus, Minus } from 'lucide-react';
import { Alert } from '@/components/ui/alert';

export default function PullRequestModal({
  open,
  onOpenChange,
  number,
  title,
  head,
  base,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  number: number;
  title: string;
  head: string;
  base: string;
}) {
  const { projectId } = useParams();
  const [changeList, setChangeList] = useState<any[]>([]);
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const [fileChanges, setFileChanges] = useState<{ [filename: string]: any }>(
    {},
  );
  const [fileAnalysis, setFileAnalysis] = useState<{ [filename: string]: any }>(
    {},
  );
  const [isAnalyzed, setIsAnalyzed] = useState<string[]>([]);
  const [loadingFiles, setLoadingFiles] = useState<{
    [filename: string]: boolean;
  }>({});
  const [isMergeConflict, setIsMergeConflict] = useState<{
    [number: number]: boolean;
  }>({ [number]: false });
  const [isMerged, setIsMerged] = useState<{ [number: number]: boolean }>({
    [number]: false,
  });

  // 파일 변경 내역 불러오기
  const fetchPullRequestChanges = async (
    filename: string,
    owner: string,
    repo: string,
    prNumber: number,
  ) => {
    try {
      setLoadingFiles((prev) => ({ ...prev, [filename]: true }));
      const response = await fetch(
        `${getApiUrl()}/github/repos/${owner}/${repo}/pulls/${prNumber}/recent-files`,
        {
          credentials: 'include',
        },
      );
      if (!response.ok) {
        throw new Error('Failed to fetch pull request changes');
      }
      const data = await response.json();
      console.log(data);

      // 특정 파일명과 매칭되는 데이터 찾기
      const matchedFile = data.find((file: any) => file.filename === filename);
      if (matchedFile) {
        setFileChanges((prev) => ({ ...prev, [filename]: matchedFile }));
      }
    } catch (error) {
      console.error('파일 변경 내역 불러오기 실패:', error);
    } finally {
      setLoadingFiles((prev) => ({ ...prev, [filename]: false }));
    }
  };

  // 파일 펼치기 핸들러
  const handleToggleFile = async (filename: string) => {
    if (openFiles.includes(filename)) {
      setOpenFiles(openFiles.filter((f) => f !== filename));
    } else {
      setOpenFiles([...openFiles, filename]);
      // 이미 받아온 적이 없다면 fetch
      if (!fileChanges[filename]) {
        await fetchPullRequestChanges(filename, owner, repo, number);
      }
    }
  };

  const mergePullRequest = async () => {
    console.log('number : ', number);
    console.log('owner : ', owner);
    console.log('repo : ', repo);
    const response = await fetch(
      `${getApiUrl()}/github/project/${projectId}/merge-pull-request`,
      {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pull_number: number,
          owner: owner,
          repo: repo,
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 405) {
        console.log('conflict 발생');
        setIsMergeConflict((prev) => ({ ...prev, [number]: true }));
      }
      return;
    }
    setIsMerged((prev) => ({ ...prev, [number]: true }));
    alert('Merge 완료');
    window.location.reload();
  };

  const fetchFileAnalysis = async (
    filename: string,
    owner: string,
    repo: string,
    number: number,
  ) => {
    const response = await fetch(
      `${getApiUrl()}/analysis/github/pr/${owner}/${repo}/${number}/recent`,
      {
        credentials: 'include',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.log('파일 분석 데이터가 없습니다.');
      }
      return;
    }

    const data = await response.json();
    console.log('🧪 분석 전체 결과:', data);

    // 경로 일부 포함 시에도 매칭되도록 끝 경로 기준 비교
    const matchedFile = data.find(
      (entry: any) => entry.file && entry.file.endsWith(filename),
    );

    if (matchedFile) {
      console.log('✅ 매칭 성공:', matchedFile);
      setFileAnalysis((prev) => ({ ...prev, [filename]: matchedFile }));
    } else {
      console.warn('❌ 매칭 실패. entry.file과 filename이 다름', filename);
    }
  };

  const handleFileAnalysis = async (filename: string) => {
    if (isAnalyzed.includes(filename)) {
      setIsAnalyzed((prev) => prev.filter((file: string) => file !== filename));
    } else {
      setIsAnalyzed((prev) => [...prev, filename]); // prev 사용
      if (!fileAnalysis[filename]) {
        await fetchFileAnalysis(filename, owner, repo, number);
      }
    }
  };
  useEffect(() => {
    const getOwner = async () => {
      const projectRes = await fetch(`${getApiUrl()}/projects/${projectId}`, {
        credentials: 'include',
      });
      if (!projectRes.ok) {
        throw new Error('Failed to fetch project');
      }
      const project = await projectRes.json();
      const repoUrl = project.repository_url;
      const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) {
        throw new Error('Invalid repository URL');
      }
      const owner = match[1];
      const repo = match[2];
      setOwner(owner);
      setRepo(repo);

      await fetchChangeList(owner, repo);
    };
    const fetchChangeList = async (owner: string, repo: string) => {
      const response = await fetch(
        `${getApiUrl()}/github/project/${projectId}/pull-request-file-changes/${number}/${owner}/${repo}`,
        {
          credentials: 'include',
          method: 'GET',
        },
      );
      if (!response.ok) {
        throw new Error('Failed to fetch change list');
      }
      const data = await response.json();
      console.log(data);
      setChangeList(data);
    };
    getOwner();
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          {isMergeConflict[number] && (
            <Alert className="text-red-500">
              Conflict 발생. Git 허브에서 직접 병합하세요.
            </Alert>
          )}
          <DialogTitle className="text-xl font-semibold">
            Pull Request 정보
          </DialogTitle>
          <DialogDescription>
            Pull Request의 상세 정보를 확인하세요.
          </DialogDescription>
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
                <h3 className="text-sm font-medium text-gray-500">
                  파일 변경 내역
                </h3>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-green-600">
                    <Plus className="h-3 w-3" />
                    <span>
                      {changeList.reduce(
                        (sum, file) => sum + (file.additions || 0),
                        0,
                      )}{' '}
                      추가
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-red-600">
                    <Minus className="h-3 w-3" />
                    <span>
                      {changeList.reduce(
                        (sum, file) => sum + (file.deletions || 0),
                        0,
                      )}{' '}
                      삭제
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {changeList.length > 0 ? (
                  changeList.map((file: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="font-mono text-sm font-medium">
                            {file.filename}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${file.status === 'added' ? 'bg-green-100 text-green-800 border-green-200' : file.status === 'modified' ? 'bg-blue-100 text-blue-800 border-blue-200' : file.status === 'deleted' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}
                          >
                            {file.status === 'added'
                              ? '추가됨'
                              : file.status === 'modified'
                                ? '수정됨'
                                : file.status === 'deleted'
                                  ? '삭제됨'
                                  : file.status}
                          </Badge>
                          <span className="ml-2 gap-x-4">
                            <Button
                              onClick={() => handleFileAnalysis(file.filename)}
                            >
                              코드 분석
                            </Button>
                          </span>
                        </div>
                        <button
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                          onClick={() => handleToggleFile(file.filename)}
                        >
                          {openFiles.includes(file.filename)
                            ? '접기'
                            : '펼치기'}
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
                            <div className="text-sm text-gray-500">
                              변경 내역을 불러오는 중...
                            </div>
                          ) : fileChanges[file.filename] ? (
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-gray-700">
                                변경된 내용:
                              </div>
                                {
                                  (() => {
                                    const codeLines = (fileChanges[file.filename]?.content || '').split('\n');
                                    // cppcheck, clang-format 에러 라인 추출
                                    let errorLines = new Set<number>();
                                    // cppcheck
                                    const cppIssues = fileAnalysis[file.filename]?.cppcheck?.issues ?? [];
                                    cppIssues.forEach((issue: any) => {
                                      if (typeof issue.line === 'number') errorLines.add(issue.line);
                                    });
                                    // clang-format
                                    const formatIssues = fileAnalysis[file.filename]?.clangFormat?.issues ?? [];
                                    formatIssues.forEach((issue: any) => {
                                      if (typeof issue.line === 'number') errorLines.add(issue.line);
                                    });
                                    return (
                                      <pre className="bg-gray-50 rounded p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap border">
                                        {codeLines.map((line: string, idx: number) => {
                                          const lineNumber = idx + 1;
                                          const isError = errorLines.has(lineNumber);
                                          return (
                                            <div
                                              key={idx}
                                              className={
                                                'flex' +
                                                (isError ? ' underline decoration-red-500 decoration-2' : '')
                                              }
                                            >
                                              <span className="w-8 text-right pr-2 select-none text-gray-400">{lineNumber}</span>
                                              <span className="whitespace-pre flex-1">{line}</span>
                                            </div>
                                          );
                                        })}
                                      </pre>
                                    );
                                  })()
                                }
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">
                              변경 내역을 불러올 수 없습니다.
                            </div>
                          )}
                        </div>
                      )}
                      {isAnalyzed.includes(file.filename) && (
                        <div className="mt-4 space-y-3">
                          {(
                            ['cppcheck', 'clangTidy', 'clangFormat'] as const
                          ).map((toolKey) => {
                            const result =
                              fileAnalysis[file.filename]?.[toolKey];

                            if (
                              !result ||
                              !result.issues ||
                              result.issues.length === 0
                            )
                              return null;

                            const toolLabel = {
                              clangFormat: 'clang-format',
                              clangTidy: 'clang-tidy',
                              cppcheck: 'cppcheck',
                            }[toolKey];

                            const colorMap = {
                              cppcheck: 'bg-red-50 text-red-700 border-red-200',
                              clangTidy:
                                'bg-orange-50 text-orange-700 border-orange-200',
                              clangFormat:
                                'bg-purple-50 text-purple-700 border-purple-200',
                            };

                            const colorClass = colorMap[toolKey];

                            return (
                              <div
                                key={toolKey}
                                className={`rounded-lg border p-4 text-sm ${colorClass}`}
                              >
                                <div className="font-semibold mb-2 flex items-center gap-2">
                                  <span>⚠️</span>
                                  <span className="capitalize">
                                    {toolLabel} 에러
                                  </span>
                                </div>
                                <ul className="list-disc pl-5 space-y-1">
                                  {result.issues.map(
                                    (issue: any, i: number) => (
                                      toolKey === 'clangFormat' && issue.type === 'style' ? null : (
                                        <li key={i}>
                                          타입: {issue.type} [{issue.line}, {issue.column}]: {issue.message}
                                        </li>
                                      )
                                    ),
                                  )}
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 text-center">
                    변경된 파일이 없습니다.
                  </div>
                )}
              </div>
            </div>
            {/* Merge 버튼 오른쪽 하단 배치 */}
            <div className="flex justify-end mt-8 gap-x-3">
              <Button
                variant="outline"
                className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={() => {
                  window.open(
                    `https://github.com/${owner}/${repo}/pull/${number}`,
                    '_blank',
                  );
                }}
              >
                깃허브에서 직접 병합
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded shadow"
                type="button"
                onClick={() => {
                  mergePullRequest();
                }}
                disabled={isMergeConflict[number]}
              >
                {isMergeConflict[number]
                  ? 'Conflict 발생'
                  : 'Merge Pull Request'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}