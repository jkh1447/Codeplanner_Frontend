"use client";

import { useEffect, useRef, useCallback, use } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Target, AlertCircle } from "lucide-react";
import { useTimelineData } from "./hooks/useTimelineData";

// Frappe Gantt CSS를 동적으로 로드
// Gantt 차트 컴포넌트를 동적으로 로드
// SSR을 비활성화하여 클라이언트 사이드에서만 렌더링
// 로딩 중에는 로딩 메시지를 표시
const GanttChart = dynamic(() => import("./components/GanttChart"), {
    ssr: false, // 서버 사이드 렌더링 비활성화
    loading: () => (
        // 로딩 중 표시할 컴포넌트
        <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Gantt 차트 로딩 중...</div>
        </div>
    ),
});

export default function Page({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = use(params);
    const { summary, statistics, ganttData, overview, loading, error } = useTimelineData(projectId);

    // 로딩 상태
    if (loading) {
        return (
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-muted-foreground">데이터 로딩 중...</div>
                </div>
            </div>
        );
    }

    // 에러 상태
    if (error) {
        return (
            <div className="space-y-6 p-6">
                <Card>
                    <CardContent className="flex items-center space-x-2 text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <span>데이터 로딩 실패: {error}</span>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* 프로젝트 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">전체 작업</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary?.totalTasks || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            프로젝트 전체 작업
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">진행률</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary?.progress || 0}%</div>
                        <p className="text-xs text-muted-foreground">
                            완료된 작업 비율
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">완료 예정</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {summary?.dueDate ? new Date(summary.dueDate).toLocaleDateString() : '미정'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            프로젝트 마감일
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">팀원</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary?.teamMembers || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            활성 팀원
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* 작업 상태 요약 */}
            <Card>
                <CardHeader>
                    <CardTitle>작업 상태 요약</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {statistics.map((stat, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: stat.color }}
                                ></div>
                                <span className="text-sm">{stat.label}</span>
                                <Badge variant="secondary">{stat.count}</Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Gantt 차트 */}
            <GanttChart tasks={ganttData} />

            <Card>
                <CardHeader>
                    <CardTitle>프로젝트 개요</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-semibold mb-2">{overview?.title || '프로젝트'}</h4>
                        <p className="text-muted-foreground text-sm">
                            {overview?.description || '프로젝트 설명이 없습니다.'}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {overview?.labels.map((label, index) => (
                            <Badge key={index} variant="outline">{label}</Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 