"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Loader2,
  TrendingUp,
  MessageSquare,
  GitCommit,
  GitPullRequest,
  Copy,
  CheckCircle,
  BarChart3,
  Users,
  Calendar,
  Settings,
  Github,
  Activity,
} from "lucide-react"
import { getApiUrl } from "@/lib/api"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface ActivityData {
  id: string
  title?: string
  content?: string
  createdAt: Date
  updatedAt?: Date
  closedAt?: Date
  status?: string
  type: "issue" | "pr" | "commit" | "comment"
  author: string
}

interface ContributionStats {
  totalIssues: number
  totalPRs: number
  totalCommits: number
  totalComments: number
  userIssues: number
  userPRs: number
  userCommits: number
  userComments: number
  userContributionPercentage: number
}

interface CollaborationFeedback {
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  collaborationStyle: string
  activityPattern: string
}

interface ProjectTimeline {
  events: ActivityData[]
  summary: string
}

interface ContributionAnalysisResponse {
  projectTimeline: ProjectTimeline
  userStats: ContributionStats
  userActivities: ActivityData[]
  collaborationFeedback: CollaborationFeedback
  aiSummary: string
  peerFeedbackSummary?: string
}

export default function SummaryAIPage() {
  const params = useParams()
  const projectId = params?.projectId as string

  const [analysis, setAnalysis] = useState<ContributionAnalysisResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [projectTitle, setProjectTitle] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [showPeerFeedback, setShowPeerFeedback] = useState(false)
  const [peerFeedbackLoading, setPeerFeedbackLoading] = useState(false)
  const [peerFeedback, setPeerFeedback] = useState<string | null>(null)

  const [owner, setOwner] = useState<string>("")
  const [repo, setRepo] = useState<string>("")
  const [includeMergeCommits, setIncludeMergeCommits] = useState(false)

  const [userStats, setUserStats] = useState<ContributionStats | null>(null)
  const [collaborationFeedback, setCollaborationFeedback] = useState<CollaborationFeedback | null>(null)
  const [userActivities, setUserActivities] = useState<ActivityData[] | null>(null)

  useEffect(() => {
    if (!projectId) return
    const fetchProjectTitle = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/projects/${projectId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        })
        if (response.ok) {
          const data = await response.json()
          setProjectTitle(data.title)
        }
      } catch (e) {
        // 에러 무시
      }
    }
    fetchProjectTitle()
  }, [projectId])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const ownerFromUrl = urlParams.get("owner")
    const repoFromUrl = urlParams.get("repo")
    if (ownerFromUrl) setOwner(ownerFromUrl)
    if (repoFromUrl) setRepo(repoFromUrl)
  }, [])

  useEffect(() => {
    if (!projectId) return
    const fetchBaseStats = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/summaryai/base-stats`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ projectId }),
        })
        if (response.ok) {
          const data = await response.json()
          setUserStats(data.userStats)
          setCollaborationFeedback(data.collaborationFeedback)
          setUserActivities(data.userActivities)
        }
      } catch (e) {}
    }
    fetchBaseStats()
  }, [projectId])

  const analyzeContribution = async () => {
    if (!projectId) {
      setError("프로젝트 ID가 필요합니다.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${getApiUrl()}/summaryai/analyze-contribution`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          projectId,
          ...(owner && { owner }),
          ...(repo && { repo }),
          includeMergeCommits,
        }),
      })
      if (!response.ok) {
        throw new Error("분석 요청에 실패했습니다.")
      }
      const data = await response.json()
      setAnalysis(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyMarkdown = () => {
    if (!analysis?.aiSummary) return
    navigator.clipboard.writeText(analysis.aiSummary)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "issue":
        return <MessageSquare className="h-4 w-4" />
      case "pr":
        return <GitPullRequest className="h-4 w-4" />
      case "commit":
        return <GitCommit className="h-4 w-4" />
      case "comment":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <TrendingUp className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "issue":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "pr":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "commit":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "comment":
        return "bg-amber-50 text-amber-700 border-amber-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const renderStatsAndCollab = () =>
    (analysis || (userStats && collaborationFeedback)) && (
      <div className="grid gap-6">
        {/* 내 기여도 분석 */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-800">내 기여도 분석</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600">전체 기여도</span>
                <span className="text-2xl font-bold text-blue-600">
                  {analysis?.userStats.userContributionPercentage ?? userStats?.userContributionPercentage ?? 0}%
                </span>
              </div>
              <Progress
                value={analysis?.userStats.userContributionPercentage ?? userStats?.userContributionPercentage ?? 0}
                className="h-3 bg-gray-100"
              />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "이슈",
                  value: analysis?.userStats.userIssues ?? userStats?.userIssues ?? 0,
                  total: analysis?.userStats.totalIssues ?? userStats?.totalIssues ?? 0,
                  color: "blue",
                  icon: MessageSquare,
                },
                {
                  label: "PR",
                  value: analysis?.userStats.userPRs ?? userStats?.userPRs ?? 0,
                  total: analysis?.userStats.totalPRs ?? userStats?.totalPRs ?? 0,
                  color: "emerald",
                  icon: GitPullRequest,
                },
                {
                  label: "커밋",
                  value: analysis?.userStats.userCommits ?? userStats?.userCommits ?? 0,
                  total: analysis?.userStats.totalCommits ?? userStats?.totalCommits ?? 0,
                  color: "purple",
                  icon: GitCommit,
                },
                {
                  label: "댓글",
                  value: analysis?.userStats.userComments ?? userStats?.userComments ?? 0,
                  total: analysis?.userStats.totalComments ?? userStats?.totalComments ?? 0,
                  color: "amber",
                  icon: MessageSquare,
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className={`h-4 w-4 text-${stat.color}-600`} />
                    <span className="text-sm font-medium text-gray-600">{stat.label}</span>
                  </div>
                  <div className={`text-2xl font-bold text-${stat.color}-600 mb-1`}>{stat.value}</div>
                  <div className="text-xs text-gray-500">전체 {stat.total}개</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 협업 스타일 분석 */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-800">협업 스타일 분석</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <h4 className="font-semibold mb-3 text-gray-700 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  협업 스타일
                </h4>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                  {analysis?.collaborationFeedback.collaborationStyle ?? collaborationFeedback?.collaborationStyle}
                </Badge>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <h4 className="font-semibold mb-3 text-gray-700 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  활동 패턴
                </h4>
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1">
                  {analysis?.collaborationFeedback.activityPattern ?? collaborationFeedback?.activityPattern}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-5 border border-gray-100">
                <h4 className="font-semibold mb-4 text-emerald-600 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  강점
                </h4>
                <ul className="space-y-2">
                  {(analysis?.collaborationFeedback.strengths ?? collaborationFeedback?.strengths ?? []).map(
                    (strength, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                        {strength}
                      </li>
                    ),
                  )}
                </ul>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-100">
                <h4 className="font-semibold mb-4 text-red-600 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  개선점
                </h4>
                <ul className="space-y-2">
                  {(analysis?.collaborationFeedback.weaknesses ?? collaborationFeedback?.weaknesses ?? []).map(
                    (weakness, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                        {weakness}
                      </li>
                    ),
                  )}
                </ul>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-100">
                <h4 className="font-semibold mb-4 text-blue-600 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  제안사항
                </h4>
                <ul className="space-y-2">
                  {(analysis?.collaborationFeedback.suggestions ?? collaborationFeedback?.suggestions ?? []).map(
                    (suggestion, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        {suggestion}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )

  const renderTimeline = () =>
    (analysis || userActivities) && (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-800">내 활동 타임라인</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                전체
              </TabsTrigger>
              <TabsTrigger value="issues" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                이슈
              </TabsTrigger>
              <TabsTrigger value="prs" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                PR
              </TabsTrigger>
              <TabsTrigger value="commits" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                커밋
              </TabsTrigger>
              <TabsTrigger value="comments" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                댓글
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3 mt-6">
              {(analysis?.userActivities ?? userActivities ?? []).map((activity) => (
                <div
                  key={activity.id}
                  className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-lg ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className={`${getActivityColor(activity.type)} text-xs font-medium`}>
                          {activity.type.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(activity.createdAt).toLocaleDateString("ko-KR")}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-800 mb-1 line-clamp-2">
                        {activity.title || activity.content?.substring(0, 100)}
                      </h4>
                      {activity.content && activity.content.length > 100 && (
                        <p className="text-sm text-gray-600 line-clamp-2">{activity.content.substring(0, 100)}...</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            {["issues", "prs", "commits", "comments"].map((type) => (
              <TabsContent key={type} value={type} className="space-y-3 mt-6">
                {(analysis?.userActivities ?? userActivities ?? [])
                  .filter((activity) => activity.type === type.slice(0, -1))
                  .map((activity) => (
                    <div
                      key={activity.id}
                      className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-lg ${getActivityColor(activity.type)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge
                              variant="outline"
                              className={`${getActivityColor(activity.type)} text-xs font-medium`}
                            >
                              {activity.type.toUpperCase()}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(activity.createdAt).toLocaleDateString("ko-KR")}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-800 mb-1 line-clamp-2">
                            {activity.title || activity.content?.substring(0, 100)}
                          </h4>
                          {activity.content && activity.content.length > 100 && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {activity.content.substring(0, 100)}...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    )

  const handlePeerFeedbackAnalyze = async () => {
    if (!projectId) return
    console.log("팀원 피드백 분석 요청")
    setPeerFeedbackLoading(true)
    setPeerFeedback(null)
    try {
      const response = await fetch("/api/summaryai/analyze-contribution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ projectId }),
      })
      if (response.ok) {
        const data = await response.json()
        setPeerFeedback(data.peerFeedbackSummary)
        console.log("[팀원 피드백 요약]", data.peerFeedbackSummary)
        if (!data.peerFeedbackSummary) {
          console.log("팀원 피드백 요약이 비어 있음")
        }
      } else {
        console.error("팀원 피드백 분석 API 응답 실패")
      }
    } catch (e) {
      setPeerFeedback("피드백 분석 중 오류 발생")
      console.error("팀원 피드백 분석 중 오류", e)
    } finally {
      setPeerFeedbackLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto p-6 space-y-8 max-w-7xl">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                프로젝트 회고 및 기여도 분석
              </h1>
              <div className="space-y-2">
                <div className="text-gray-600 flex items-center gap-2">
                  <span className="font-medium">프로젝트:</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {projectTitle || projectId}
                  </Badge>
                  {owner && repo && (
                    <>
                      <Github className="h-4 w-4 text-gray-400" />
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                        {owner}/{repo}
                      </Badge>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  프로젝트 내부 데이터를 기반으로 분석합니다. GitHub 정보가 있으면 커밋과 PR 정보도 포함됩니다.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                <input
                  type="checkbox"
                  checked={includeMergeCommits}
                  onChange={(e) => setIncludeMergeCommits(e.target.checked)}
                  className="rounded border-gray-300"
                />
                머지 커밋 포함
              </label>

              <div className="flex gap-2">
                <Button
                  onClick={analyzeContribution}
                  disabled={loading || !projectId}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
                  AI 분석 시작
                </Button>

                <Button
                  onClick={handlePeerFeedbackAnalyze}
                  disabled={peerFeedbackLoading || !projectId}
                  variant="outline"
                  className="flex items-center gap-2 border-gray-300 hover:bg-gray-50 bg-transparent"
                >
                  {peerFeedbackLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                  팀원 피드백 분석
                </Button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50 shadow-lg rounded-xl">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* AI Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* 전체 요약 */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-green-50">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-800">프로젝트 전체 요약</CardTitle>
                </div>
                {analysis.aiSummary && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyMarkdown}
                    className="flex items-center gap-2 hover:bg-gray-50 bg-transparent"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        복사됨!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        마크다운 복사
                      </>
                    )}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  {analysis.aiSummary ? (
                    <div className="prose max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-li:text-gray-600">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>{analysis.aiSummary}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-gray-600">요약 결과가 없습니다.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 팀원 피드백 요약 */}
            {showPeerFeedback && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Users className="h-5 w-5 text-amber-600" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-800">팀원 피드백 요약</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-white rounded-xl p-6 border border-gray-100">
                    {analysis.peerFeedbackSummary ? (
                      <div className="prose max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-li:text-gray-600">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>{analysis.peerFeedbackSummary}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-gray-600">팀원 피드백이 없습니다.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* 팀원 피드백 요약 (별도 버튼) */}
        {peerFeedback !== null && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Users className="h-5 w-5 text-amber-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-800">팀원 피드백 요약</CardTitle>
              </div>
              {peerFeedback && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(peerFeedback)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 1500)
                  }}
                  className="flex items-center gap-2 hover:bg-white"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      복사됨!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      마크다운 복사
                    </>
                  )}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="prose max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-li:text-gray-600">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>{peerFeedback || "팀원 피드백이 없습니다."}</ReactMarkdown>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats and Collaboration Analysis */}
        {userStats && collaborationFeedback && renderStatsAndCollab()}

        {/* Activity Timeline */}
        {(userActivities || analysis) && renderTimeline()}
      </div>
    </div>
  )
}
