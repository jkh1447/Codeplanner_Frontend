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

export default function SummaryPage() {
  const { projectId } = useParams();
  const [memberCount, setMemberCount] = useState(0);
  const [allIssue, setAllIssue] = useState(0);
  const [completedIssue, setCompletedIssue] = useState(0);
  const [inProgressIssue, setInProgressIssue] = useState(0);
  const [issueTypeData, setIssueTypeData] = useState<any[]>([]);

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
    fetchMemberCount();
    fetchAllIssue();
  }, [projectId]);

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
            <p className="text-xs text-muted-foreground">+3 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">완료된 작업</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedIssue}</div>
            <p className="text-xs text-muted-foreground">75% 완료율</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">진행 중</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressIssue}</div>
            <p className="text-xs text-muted-foreground">2개 지연 예정</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">팀원</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberCount}</div>
            <p className="text-xs text-muted-foreground">활성 팀원</p>
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
                <ResponsivePie
                  data={[
                    { id: "Done", value: completedIssue },
                    { id: "In Progress", value: inProgressIssue },
                    {
                      id: "To Do",
                      value: allIssue - completedIssue - inProgressIssue,
                    },
                  ]}
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
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">로그인 기능 완료</p>
                  <p className="text-xs text-muted-foreground">2시간 전</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">API 문서 업데이트</p>
                  <p className="text-xs text-muted-foreground">4시간 전</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">UI 테스트 시작</p>
                  <p className="text-xs text-muted-foreground">1일 전</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">데이터베이스 오류 발생</p>
                  <p className="text-xs text-muted-foreground">2일 전</p>
                </div>
              </div>
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
                colors={[
                  "#FF9980",
                  "#FBE870",
                  "#76D7EA",
                  "#EBB0D7",
                  "#C9C0BB",
                  "#000000",
                  "#FF00FF",
                  "#00FFFF",
                  "#FFFF00",
                  "#FF00FF",
                ]}
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
      </div>
    </div>
  );
}
