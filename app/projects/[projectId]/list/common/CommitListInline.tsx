"use client";
import { useEffect, useState } from "react";
import { getApiUrl } from "@/lib/api";

interface Commit {
  id: string;
  commitHash: string;
  commitMessage: string;
  commitUrl: string;
  createdAt: string;
}

interface CommitListInlineProps {
  projectId: string;
  taskId: string;
}

export default function CommitListInline({
  projectId,
  taskId,
}: CommitListInlineProps) {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!taskId) return;
    setLoading(true);
    setError("");
    fetch(getApiUrl() + `/github/webhook/commit/${taskId}`)
      .then((res) => {
        if (!res.ok) throw new Error("커밋 정보를 불러오지 못했습니다");
        return res.json();
      })
      .then((data) => setCommits(data.commits || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [taskId]);

  if (loading) return <div>커밋 정보를 불러오는 중...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!commits.length) return <div>커밋이 없습니다.</div>;

  return (
    <ul className="mt-4">
      {commits.map((commit) => (
        <li key={commit.id} className="mb-2 border-b pb-2">
          <a
            href={commit.commitUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 font-mono"
          >
            {commit.commitMessage}
          </a>
          <div className="text-xs text-gray-500">{commit.commitHash.slice(0, 7)}</div>
          <div className="text-xs text-gray-400">{new Date(commit.createdAt).toLocaleString()}</div>
        </li>
      ))}
    </ul>
  );
}
