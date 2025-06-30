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
    AlertCircle
} from "lucide-react";

export default function SummaryPage() {
    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold">프로젝트 요약</h1>
                <p className="text-muted-foreground">전체 프로젝트 현황을 한눈에 확인하세요</p>
            </div>

            {/* 주요 지표 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">전체 작업</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">24</div>
                        <p className="text-xs text-muted-foreground">
                            +3 from last week
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">완료된 작업</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">18</div>
                        <p className="text-xs text-muted-foreground">
                            75% 완료율
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">진행 중</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4</div>
                        <p className="text-xs text-muted-foreground">
                            2개 지연 예정
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">팀원</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">6</div>
                        <p className="text-xs text-muted-foreground">
                            활성 팀원
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* 진행률 차트 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            전체 진행률
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>프로젝트 완료율</span>
                                <span>75%</span>
                            </div>
                            <Progress value={75} className="h-2" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>스프린트 완료율</span>
                                <span>90%</span>
                            </div>
                            <Progress value={90} className="h-2" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>코드 리뷰 완료율</span>
                                <span>60%</span>
                            </div>
                            <Progress value={60} className="h-2" />
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
            <Card>
                <CardHeader>
                    <CardTitle>작업 상태 분포</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span className="font-medium">완료</span>
                            </div>
                            <Badge variant="default">18</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-blue-500" />
                                <span className="font-medium">진행 중</span>
                            </div>
                            <Badge variant="secondary">4</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-yellow-500" />
                                <span className="font-medium">검토 중</span>
                            </div>
                            <Badge variant="outline">2</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                                <span className="font-medium">블로커</span>
                            </div>
                            <Badge variant="destructive">0</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 