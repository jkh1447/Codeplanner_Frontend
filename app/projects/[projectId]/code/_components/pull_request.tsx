"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitPullRequest, Plus } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import CreatePullRequestModal from "./create_pull_request_modal";

export default function PullRequest() {
  const { projectId } = useParams();
  const [pullRequests, setPullRequests] = useState<any[]>([]);
  const [isPullRequestCreateModalOpen, setIsPullRequestCreateModalOpen] =
    useState(false);

  useEffect(() => {
    const fetchPullRequests = async () => {
      const projectRes = await fetch(`${getApiUrl()}/projects/${projectId}`, {
        method: "GET",
        credentials: "include",
      });
      if (!projectRes.ok) {
        throw new Error("Failed to fetch project");
      }
      const project = await projectRes.json();

      const response = await fetch(
        `${getApiUrl()}/github/project/${projectId}/pulls`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch pull requests");
      }
      const data = await response.json();
      const pullRequestData = data.map((item: any) => ({
        number: item.number,
        title: item.title,
        author: item.user.login,
        state: item.state,
        created_at: item.created_at,
        head: item.head.ref,
        base: item.base.ref,
      }));
      setPullRequests(pullRequestData);
    };
    fetchPullRequests();
  }, [projectId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitPullRequest className="h-5 w-5" />
          Pull Requests
        </CardTitle>
        <Button
          variant="outline"
          onClick={() => setIsPullRequestCreateModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Pull Request 생성
        </Button>
        <div className="absolute top-0 right-0">
          {isPullRequestCreateModalOpen && (
            <CreatePullRequestModal
              open={isPullRequestCreateModalOpen}
              onOpenChange={setIsPullRequestCreateModalOpen}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* PR 목록 */}
          {pullRequests && pullRequests.length > 0 ? (
            pullRequests.map((pullRequest) => (
              <div
                key={pullRequest.number}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="default">{pullRequest.state}</Badge>
                  <span className="font-medium">
                    <a href="">{pullRequest.title}</a>
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {pullRequest.author} •{" "}
                  {new Date(pullRequest.created_at).toLocaleString("ko-KR")}
                </div>
              </div>
            ))
          ) : (
            <div>풀 리퀘스트가 없습니다.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
