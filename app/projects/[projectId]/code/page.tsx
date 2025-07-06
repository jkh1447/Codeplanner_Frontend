"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Code2,
  GitBranch,
  GitCommit,
  GitPullRequest,
  FileCode,
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { useParams } from "next/navigation";
import PullRequest from "./_components/pull_request";

// 타입 정의 추가
interface GithubRepo {
  html_url: string;
  full_name: string;
  description: string;
  default_branch: string;
  updated_at: string;
}

interface GithubTreeItem {
  path: string;
  type: string; // 'blob' | 'tree'
}

// 트리 데이터 구조 변환 함수
function buildTree(items: GithubTreeItem[]) {
  const root: any = {};
  items.forEach((item) => {
    const parts = item.path.split("/");
    let current = root;
    parts.forEach((part, idx) => {
      if (!current[part]) {
        current[part] = {
          __type: idx === parts.length - 1 ? item.type : "tree",
          __children: {},
        };
      }
      if (idx < parts.length - 1) {
        current = current[part].__children;
      }
    });
  });
  return root;
}

// 트리 렌더링 컴포넌트
function TreeNode({
  name,
  node,
  depth = 0,
}: {
  name: string;
  node: any;
  depth?: number;
}) {
  const [open, setOpen] = React.useState(depth === 0); // 최상위는 기본 open
  
  // 파일 확장자에 따른 아이콘 결정
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return '📄';
      case 'json':
        return '📋';
      case 'md':
        return '📝';
      case 'yml':
      case 'yaml':
        return '⚙️';
      case 'gitignore':
        return '🚫';
      case 'lock':
        return '🔒';
      default:
        return '📄';
    }
  };
  
  if (node.__type === "blob") {
    return <div style={{ marginLeft: depth * 16 }}>{getFileIcon(name)} {name}</div>;
  }
  
  // 폴더(tree)
  const folderName = name === "." ? "프로젝트 루트" : name;
  return (
    <div style={{ marginLeft: depth * 16 }}>
      <div
        style={{ cursor: "pointer", fontWeight: "bold" }}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "📂" : "📁"} {folderName}
      </div>
      {open &&
        Object.entries(node.__children)
          .sort(([a], [b]) => {
            // 폴더를 먼저, 그 다음 파일을 알파벳 순으로 정렬
            const aIsFolder = node.__children[a].__type === "tree";
            const bIsFolder = node.__children[b].__type === "tree";
            if (aIsFolder && !bIsFolder) return -1;
            if (!aIsFolder && bIsFolder) return 1;
            return a.localeCompare(b);
          })
          .map(([childName, childNode]) => (
            <TreeNode
              key={childName}
              name={childName}
              node={childNode}
              depth={depth + 1}
            />
          ))}
    </div>
  );
}

export default function CodePage() {
  const { projectId } = useParams();
  const [repoData, setRepoData] = useState<GithubRepo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [branchesError, setBranchesError] = useState<string | null>(null);
  const [tree, setTree] = useState<GithubTreeItem[]>([]);
  const [treeLoading, setTreeLoading] = useState(true);
  const [treeError, setTreeError] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [commits, setCommits] = useState<any[]>([]);
  const [commitsLoading, setCommitsLoading] = useState(true);
  const [commitsError, setCommitsError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRepo() {
      try {
        setLoading(true);
        // 1. 프로젝트 정보 먼저 가져오기
        const projectRes = await fetch(`${getApiUrl()}/projects/${projectId}`, {
          credentials: "include",
        });
        if (!projectRes.ok)
          throw new Error("프로젝트 정보를 불러오지 못했습니다");
        const project = await projectRes.json();
        // 2. repository_url에서 owner/repo 추출
        const repoUrl = project.repository_url; // 예: https://github.com/Krafton-Jungle-Weight/Codeplanner_Backend
        const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) throw new Error("저장소 URL이 올바르지 않습니다");
        const owner = match[1];
        const repo = match[2];
        // 3. 깃허브 저장소 정보 fetch
        const response = await fetch(
          `${getApiUrl()}/github/repos/${owner}/${repo}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!response.ok)
          throw new Error("깃허브 저장소 정보를 불러오지 못했습니다");
        const data = await response.json();
        setRepoData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    fetchRepo();
  }, [projectId]);

  useEffect(() => {
    async function fetchBranches() {
      try {
        setBranchesLoading(true);
        setBranchesError(null);
        // 프로젝트 정보 먼저 가져오기
        const projectRes = await fetch(`${getApiUrl()}/projects/${projectId}`, {
          credentials: "include",
        });
        if (!projectRes.ok)
          throw new Error("프로젝트 정보를 불러오지 못했습니다");
        const project = await projectRes.json();
        const repoUrl = project.repository_url;
        const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) throw new Error("저장소 URL이 올바르지 않습니다");
        const owner = match[1];
        const repo = match[2];
        // 브랜치 정보 fetch
        const response = await fetch(
          `${getApiUrl()}/github/repos/${owner}/${repo}/branches`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!response.ok) throw new Error("브랜치 정보를 불러오지 못했습니다");
        const data = await response.json();
        setBranches(data);
      } catch (err) {
        setBranchesError(err instanceof Error ? err.message : String(err));
      } finally {
        setBranchesLoading(false);
      }
    }
    fetchBranches();
  }, [projectId]);

  useEffect(() => {
    async function fetchTree() {
      try {
        setTreeLoading(true);
        setTreeError(null);
        // 프로젝트 정보 가져오기
        const projectRes = await fetch(`${getApiUrl()}/projects/${projectId}`, {
          credentials: "include",
        });
        if (!projectRes.ok)
          throw new Error("프로젝트 정보를 불러오지 못했습니다");
        const project = await projectRes.json();
        const repoUrl = project.repository_url;
        const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) throw new Error("저장소 URL이 올바르지 않습니다");
        const owner = match[1];
        const repo = match[2];
        // 저장소 정보 fetch (기본 브랜치 알아내기)
        const repoRes = await fetch(
          `${getApiUrl()}/github/repos/${owner}/${repo}`,
          {
            credentials: "include",
          }
        );
        if (!repoRes.ok) throw new Error("저장소 정보를 불러오지 못했습니다");
        const repoData = await repoRes.json();
        const branch = repoData.default_branch || "main";
        // 트리 정보 fetch
        const treeRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
        );
        if (!treeRes.ok) throw new Error("프로젝트 구조를 불러오지 못했습니다");
        const treeData = await treeRes.json();
        setTree(treeData.tree || []);
      } catch (err) {
        setTreeError(err instanceof Error ? err.message : String(err));
      } finally {
        setTreeLoading(false);
      }
    }
    fetchTree();
  }, [projectId]);

  useEffect(() => {
    if (branches && branches.length > 0) {
      setSelectedBranch(branches[0].name);
    }
  }, [branches]);

  useEffect(() => {
    if (!selectedBranch) return;
    async function fetchCommits() {
      try {
        setCommitsLoading(true);
        setCommitsError(null);
        const projectRes = await fetch(`${getApiUrl()}/projects/${projectId}`, {
          credentials: "include",
        });
        if (!projectRes.ok)
          throw new Error("프로젝트 정보를 불러오지 못했습니다");
        const project = await projectRes.json();
        const repoUrl = project.repository_url;
        const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) throw new Error("저장소 URL이 올바르지 않습니다");
        const owner = match[1];
        const repo = match[2];
        const res = await fetch(
          `${getApiUrl()}/github/repos/${owner}/${repo}/commits?sha=${selectedBranch}`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("커밋 정보를 불러오지 못했습니다");
        const data = await res.json();
        setCommits(data);
      } catch (err) {
        setCommitsError(err instanceof Error ? err.message : String(err));
      } finally {
        setCommitsLoading(false);
      }
    }
    fetchCommits();
  }, [selectedBranch, projectId]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">코드 관리</h1>
        <p className="text-muted-foreground">
          프로젝트 코드와 버전 관리를 확인하세요
        </p>
      </div>

      {/* 저장소 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            저장소 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>로딩 중...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : repoData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold">저장소</h4>
                <a
                  href={repoData.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 underline"
                >
                  {repoData.full_name}
                </a>
                <p className="text-xs text-muted-foreground mt-1">
                  {repoData.description}
                </p>
              </div>
              <div>
                <h4 className="font-semibold">기본 브랜치</h4>
                <p className="text-sm text-muted-foreground">
                  {repoData.default_branch}
                </p>
              </div>
              <div>
                <h4 className="font-semibold">마지막 업데이트</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(repoData.updated_at).toLocaleString("ko-KR")}
                </p>
              </div>
            </div>
          ) : (
            <div>데이터가 없습니다.</div>
          )}
        </CardContent>
      </Card>

      {/* 브랜치 및 커밋 */}
      <Tabs defaultValue="branches" className="space-y-4">
        <TabsList>
          <TabsTrigger value="branches">브랜치</TabsTrigger>
          <TabsTrigger value="commits">커밋</TabsTrigger>
          <TabsTrigger value="pull-requests">Pull Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="branches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                브랜치 목록
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {branchesLoading ? (
                  <div>브랜치 정보를 불러오는 중...</div>
                ) : branchesError ? (
                  <div className="text-red-500">{branchesError}</div>
                ) : branches && branches.length > 0 ? (
                  branches.map((branch: any) => (
                    <div
                      key={branch.name}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            branch.name === repoData?.default_branch
                              ? "default"
                              : branch.name.startsWith("feature/")
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {branch.name}
                        </Badge>
                        <span className="font-medium">
                          {branch.name === repoData?.default_branch
                            ? "메인 브랜치"
                            : branch.displayName || branch.name}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        최신 커밋:{" "}
                        {branch.commit &&
                        branch.commit.commit &&
                        branch.commit.commit.author
                          ? new Date(
                              branch.commit.commit.author.date
                            ).toLocaleString("ko-KR", {
                              hour12: false,
                            })
                          : "-"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div>브랜치가 없습니다.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commits" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <CardTitle className="flex items-center gap-2">
                  <GitCommit className="h-5 w-5" />
                  최근 커밋
                </CardTitle>
                {/* 브랜치 선택 드롭다운 */}
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  {branches.map((branch: any) => (
                    <option key={branch.name} value={branch.name}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {commitsLoading ? (
                  <div>커밋 정보를 불러오는 중...</div>
                ) : commitsError ? (
                  <div className="text-red-500">{commitsError}</div>
                ) : commits && commits.length > 0 ? (
                  commits.map((commit: any) => (
                    <div
                      key={commit.sha}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium">{commit.commit.message}</p>
                        <p className="text-sm text-muted-foreground">
                          {commit.commit.author.name} •{" "}
                          {new Date(commit.commit.author.date).toLocaleString(
                            "ko-KR"
                          )}
                        </p>
                      </div>
                      <Badge variant="outline">{commit.sha.slice(0, 7)}</Badge>
                    </div>
                  ))
                ) : (
                  <div>커밋이 없습니다.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pull-requests" className="space-y-4">
          <PullRequest />
        </TabsContent>
      </Tabs>

      {/* 파일 구조 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            프로젝트 구조
          </CardTitle>
        </CardHeader>
        <CardContent>
          {treeLoading ? (
            <div>프로젝트 구조를 불러오는 중...</div>
          ) : treeError ? (
            <div className="text-red-500">{treeError}</div>
          ) : tree && tree.length > 0 ? (
            <div className="space-y-2 text-sm">
              <TreeNode
                name="."
                node={{
                  __type: "tree",
                  __children: buildTree(tree),
                }}
              />
            </div>
          ) : (
            <div>구조 데이터가 없습니다.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
