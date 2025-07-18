"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@/components/type";
import {
    Book,
    Bug,
    SquareCheckBig,
    User,
    Calendar,
    Flag,
    MessageSquare,
    Flame,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getApiUrl } from "@/lib/api";
import TaskDrawer from "../../list/common/TaskDrawer";
import React from "react";

interface Props {
    issue: Task;
    onSave?: () => void;
}

interface Comment {
    id: string;
    issueId: string;
    authorId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    displayName?: string;
}

export default function MyIssueCard({ issue, onSave }: Props) {
  const [reporter, setReporter] = useState<string>("")
  const [showDrawer, setShowDrawer] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [comments, setComments] = useState<Comment[]>([]);

  const fetchComments = async () => {
    const response = await fetch(`${getApiUrl()}/comments/${issue.project_id}/${issue.id}/`, {
      method: "GET",
      credentials: "include",
    })
    const data = await response.json()
    setComments(data)
  }

  const fetchReporter = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/user/${issue.reporter_id}`, {
        credentials: "include",
      })
      const data = await response.json()
      setReporter(data.displayName)
    } catch (error) {
      console.error("Failed to fetch reporter:", error)
      setReporter("Unknown")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReporter()
    fetchComments()
  }, [issue.reporter_id])

  const getIssueTypeConfig = (type: string) => {
    switch (type) {
      case "task":
        return {
          icon: SquareCheckBig,
          color: "#3b82f6",
          bgColor: "bg-blue-100",
          borderColor: "border-l-blue-500",
        }
      case "story":
        return {
          icon: Book,
          color: "#f59e0b",
          bgColor: "bg-amber-100",
          borderColor: "border-l-amber-500",
        }
      case "bug":
        return {
          icon: Bug,
          color: "#ef4444",
          bgColor: "bg-red-100",
          borderColor: "border-l-red-500",
        }
      default:
        return {
          icon: SquareCheckBig,
          color: "#6b7280",
          bgColor: "bg-gray-100",
          borderColor: "border-l-gray-500",
        }
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "todo":
      case "할 일":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "in_progress":
      case "진행중":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "done":
      case "완료":
        return "bg-green-100 text-green-800 border-green-200"
      case "in_review":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "backlog":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const setStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "todo":
        return "해야 할 일"
      case "in_progress":
        return "진행 중"
      case "done":
        return "완료"
      case "in_review":
        return "리뷰 중"
      case "backlog":
        return "백로그"
      default:
        return "할일"
    }
  }
  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    try {
      return new Date(dateString).toLocaleDateString("ko-KR")
    } catch {
      return dateString
    }
  }

  function renderLimitedCommentWithMentions(content: string, maxLines = 2) {
  const lines = content.split('\n');
  const limitedLines = lines.slice(0, maxLines);

  // 줄 개수 초과되면 마지막 줄에 "..." 붙이기
  if (lines.length > maxLines) {
    limitedLines[maxLines - 1] += '...';
  }

    return limitedLines.map((line, lineIdx) => (
      <div key={lineIdx}>
        {line.split(/(@\[[^\]]+\]\([^\)]+\))/g).map((part, i) => {
          const match = part.match(/^@\[(.+?)\]\([^\)]+\)$/);
          if (match) {
            const display = match[1];
            return (
              <span
                key={i}
                className="bg-blue-100 text-blue-800 rounded px-1"
              >
                @{display}
              </span>
            );
          }
          return <React.Fragment key={i}>{part}</React.Fragment>;
        })}
      </div>
    ));
  }

  // 멘션 처리 함수
function renderCommentWithMentions(content: string) {
  return content.split(/(@\[[^\]]+\]\([^\)]+\))/g).map((part, i) => {
      const match = part.match(/^@\[(.+?)\]\([^\)]+\)$/);
      if (match) {
          const display = match[1];
          return (
              <span
                  key={i}
                  className="bg-blue-100 text-blue-800 rounded px-1"
              >
                  @{display}
              </span>
          );
      }
      return part;
  });
}


  const typeConfig = getIssueTypeConfig(issue.issue_type)
  const IconComponent = typeConfig.icon

  return (
    <>
      <Card
        className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-l-4 ${typeConfig.borderColor} group`}
        onClick={() => setShowDrawer(true)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold group-hover:text-blue-600 transition-colors">
              <div className={`p-2 rounded-lg ${typeConfig.bgColor}`}>
                <IconComponent className="w-5 h-5" style={{ color: typeConfig.color }} />
              </div>
              <span className="line-clamp-2">{issue.title}</span>
            </CardTitle>

            <Badge variant="outline" className={`ml-2 font-medium ${getStatusBadgeColor(issue.status)}`}>
              {setStatusBadge(issue.status)}
            </Badge>
          </div>

          {/* Labels */}
          {Array.isArray(issue.labels) && issue.labels.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {issue.labels.map((label: any) => (
                                <span
                                    key={label.id.toString()}
                                    className="px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm"
                                    style={{
                                        backgroundColor: label.color,
                                        opacity: 0.9,
                                    }}
                                >
                                    {label.name}
                                </span>
                            ))}
                        </div>
                    )}
                </CardHeader>

                <CardContent className="pt-0">
                    {/* Description */}
                    {issue.description && (
                        <p
                            className="text-sm text-gray-600 mb-4 line-clamp-2"
                            style={{ minHeight: "4em" }} // 2줄 높이 확보 (line-height 1.25rem * 2)
                        >
                            {issue.description}
                        </p>
                    )}

                    {/* Meta Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="flex items-center gap-2 text-gray-500">
                            <User className="w-4 h-4" />
                            <div>
                                <span className="text-gray-400">보고자</span>
                                <p className="font-medium text-gray-700">
                                    {isLoading ? "로딩중..." : reporter || "-"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <div>
                                <span className="text-gray-400">마감일</span>
                                <p className="font-medium text-gray-700">
                                    {formatDate(issue.due_date)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-500">
                            <Flag className="w-4 h-4" />
                            <div>
                                <span className="text-gray-400">유형</span>
                                <p className="font-medium text-gray-700 capitalize">
                                    {issue.issue_type}
                                </p>
                            </div>
                        </div>
                    </div>
                    <br />
                    <div>
                        <p className="font-bold flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-blue-500" />
                            <span>최근 댓글</span>
                        </p>
                        <hr className="my-2" />
                        <div className="min-h-[4.5rem] flex flex-col justify-center items-center">
                            {comments.length === 0 ? (
                                <div className="text-gray-400 text-sm py-2 text-center w-full">
                                    아무 코멘트도 없습니다.
                                </div>
                            ) : (
                                comments.slice(0, 3).map((comment) => (
                                    <div key={comment.id} className="w-full">
                                        <p>
                                            <div className="py-2 border-b">
                                              <span className="font-bold">
                                                {comment.displayName}
                                              </span>
                                              <span className="block whitespace-pre-line line-clamp-2 text-sm text-gray-700">
                                                {renderLimitedCommentWithMentions(comment.content)}
                                                
                                              </span>
                                            </div>
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {showDrawer && (
                <TaskDrawer
                    task={issue}
                    onClose={() => setShowDrawer(false)}
                    onSave={onSave}
                />
            )}
        </>
    );
}
