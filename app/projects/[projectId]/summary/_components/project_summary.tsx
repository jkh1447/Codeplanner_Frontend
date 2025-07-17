"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Users,
  Calendar,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getApiUrl } from "@/lib/api";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveWaffle } from "@nivo/waffle";
import { PieChart } from "lucide-react";
import { BarChart } from "lucide-react";
import { ResponsiveBar } from "@nivo/bar";

export default function SummaryPage() {
  const { projectId } = useParams();
  const [memberCount, setMemberCount] = useState(0);
  const [allIssue, setAllIssue] = useState(0);
  const [completedIssue, setCompletedIssue] = useState(0);
  const [inProgressIssue, setInProgressIssue] = useState(0);
  const [inReviewIssue, setInReviewIssue] = useState(0);
  const [issueTypeData, setIssueTypeData] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [labelData, setLabelData] = useState<any[]>([]);

  useEffect(() => {
    const fetchMemberCount = async () => {
      const response = await fetch(
        `${getApiUrl()}/summary/${projectId}/members`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await response.json();
      setMemberCount(Array.isArray(data) ? data.length : 0);
    };

    const fetchAllIssue = async () => {
      const response = await fetch(
        `${getApiUrl()}/summary/${projectId}/issues`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!response.ok) {
        if (response.status == 401) {
          alert("로그인 후 이용해주세요.");
          window.location.href = "/auth/login";
        }
      }
      const data = await response.json();
      setAllIssue(data.length);
      setCompletedIssue(
        data.filter((issue: any) => issue.status === "DONE").length
      );
      setInProgressIssue(
        data.filter((issue: any) => issue.status === "IN_PROGRESS").length
      );
      setInReviewIssue(
        data.filter((issue: any) => issue.status === "IN_REVIEW").length
      );
      const progressCount = data.reduce((acc: any, cur:any) => {
        const progress = cur.status;
        acc[progress] = (acc[progress] || 0) + 1;
        return acc;
      }, {});

      const progressDataArr = Object.entries(progressCount).map(([progress, count]) =>({
        id: progress,
        value: count as number,
      }));

      setProgressData(progressDataArr);
      // 이슈 타입별 갯수 집계
      const typeCount = data.reduce((acc: any, cur: any) => {
        const type = cur.issueType || "기타";
        acc[type] = (acc[type] || 0) + 1;
        console.log(type);
        return acc;
      }, {});

      // 차트용 배열로 변환
      const typeDataArr = Object.entries(typeCount).map(([type, count]) => ({
        id: type,
        value: count as number,
      }));

      setIssueTypeData(typeDataArr);
    };

    const fetchRecentActivities = async () => {
      try {
        const response = await fetch(
          `${getApiUrl()}/activity/project/${projectId}/recent?limit=5`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (response.ok) {
          const data = await response.json();
          setRecentActivities(data);
        }
      } catch (error) {
        console.error('최근 활동 조회 실패:', error);
      }
    };

    const fetchLabelData = async () => {
      const response = await fetch(`${getApiUrl()}/projects/${projectId}/labels-count`,
      {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        // 전체 count 합계 계산
        const totalCount = data.reduce((sum: number, item: any) => sum + item.count, 0);
        // 백분율로 변환하여 value에 할당
        const labelDataArr = data.map((item: any) => ({
          id: item.name,
          value: totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0,
        }));
        setLabelData(labelDataArr);
      }
    }
    fetchMemberCount();
    fetchAllIssue();
    fetchRecentActivities();
    fetchLabelData();
  }, [projectId]);

  

  // 활동 타입에 따른 스타일과 메시지 설정
  const getActivityStyle = (actionType: string) => {
    switch (actionType) {
      case 'issue_created':
        return {
          color: 'bg-blue-500',
          message: '이슈 생성',
        };
      case 'issue_updated':
        return {
          color: 'bg-yellow-500',
          message: '이슈 업데이트',
        };
      case 'issue_deleted':
        return {
          color: 'bg-red-500',
          message: '이슈 삭제',
        };
      default:
        return {
          color: 'bg-gray-500',
          message: '활동',
        };
    }
  };

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
        return status
    }
  }

  // 시간 포맷팅 함수
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const activityDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}일 전`;
    
    return activityDate.toLocaleDateString('ko-KR');
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">프로젝트 요약</h1>
        <p className="text-muted-foreground">
          전체 프로젝트 현황을 한눈에 확인하세요
        </p>
      </div>

      {/* 주요 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 작업</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allIssue}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">완료된 작업</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedIssue}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((completedIssue / allIssue) * 100)}% 완료율
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">진행 중</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressIssue + inReviewIssue}</div>
            <p className="text-xs text-muted-foreground">
              진행 상태 : {inProgressIssue}
            </p>
            <p className="text-xs text-muted-foreground">
              리뷰 상태 : {inReviewIssue}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">팀원</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberCount} 명</div>
          </CardContent>
        </Card>
      </div>

      {/* 진행률 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              이슈 상태 분포
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="w-full h-full">
              <div style={{ width: "100%", height: "300px" }}>
                {progressData.length > 0 ? (
                <ResponsivePie
                  data={progressData.map((item) => ({
                  ...item,
                  id: setStatusBadge(item.id),
                  label: setStatusBadge(item.id),
                }))}
                  margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                  innerRadius={0.5}
                  legends={[
                    {
                      anchor: "bottom", // 위치
                      direction: "row", // item 그려지는 방향
                      justify: false, // 글씨, 색상간 간격 justify 적용 여부
                      translateX: 0, // chart와 X 간격
                      translateY: 56, // chart와 Y 간격
                      itemsSpacing: 0, // item간 간격
                      itemWidth: 100, // item width
                      itemHeight: 18, // item height
                      itemDirection: "left-to-right", // item 내부에 그려지는 방향
                      itemOpacity: 1, // item opacity
                      symbolSize: 18, // symbol (색상 표기) 크기
                      symbolShape: "circle", // symbol (색상 표기) 모양
                      effects: [
                        {
                          // 추가 효과 설정 (hover하면 textColor를 olive로 변경)
                          on: "hover",
                          style: {
                            itemTextColor: "olive",
                          },
                        },
                      ],
                    },
                  ]}
                />
                ) :(
                  <div className="text-center text-gray-400 py-4">
                    이슈 상태 분포 데이터가 없습니다.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              최근 활동
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {recentActivities.length === 0 ? (
                <div className="text-center text-gray-400 py-4">
                  최근 활동이 없습니다.
                </div>
              ) : (
                recentActivities.map((activity) => {
                  const style = getActivityStyle(activity.actionType);
                  return (
                    <div key={activity.id} className="flex items-center gap-3">
                      <div className={`w-2 h-2 ${style.color} rounded-full`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                           {style.message}: {activity.issueTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 작업 상태 분포 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>이슈 종류 분포</CardTitle>
          </CardHeader>
          <CardContent className="w-full h-full">
            <div style={{ width: "100%", height: "300px" }}>
              {/* 이슈 종류 분포 와플형 그래프 (라벨이 문자열로 변환되어 표시됨) */}
              <ResponsiveWaffle
                data={issueTypeData.map((item) => ({
                  ...item,
                  id: String(item.id),
                  label: item.id,
                }))}
                margin={{ top: 40, right: 80, bottom: 80, left: 120 }}
                total={allIssue}
                rows={10}
                columns={20}
                motionStagger={2}
                fillDirection="right"
                colors={{ scheme: "set3" }}
                legends={[
                  {
                    anchor: "top-left",
                    direction: "column",
                    translateX: -100,
                    itemsSpacing: 4,
                    itemWidth: 100,
                    itemHeight: 20,
                    symbolSize: 20, // symbol (색상 표기) 크기
                    symbolShape: "circle", // symbol (색상 표기) 모양
                  },
                ]}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>이슈 라벨 분포
              </CardTitle>
          </CardHeader>
            <CardContent>
              <div style={{ width: "100%", height: "300px" }}>
                {labelData.length > 0 ? (
                  <ResponsiveBar
                    data={labelData.map((item) => ({
                      ...item,
                      id: String(item.id),
                      label: item.id,
                    }))}
                    keys={["value"]}
                    indexBy="id"
                    margin={{ top: 30, right: 30, bottom: 30, left: 30 }}
                    padding={0.3}
                    valueScale={{ type: "linear" }}
                    indexScale={{ type: "band", round: true }}
                    colors={{ scheme: "pastel1" }}
                    colorBy="indexValue"
                  />
                ) : (
                  <div className="text-center text-gray-400 py-4">
                    이슈 라벨 분포 데이터가 없습니다.
                  </div>
                )}
              </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
