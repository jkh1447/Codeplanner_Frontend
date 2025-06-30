"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2, GitBranch, GitCommit, GitPullRequest, FileCode } from "lucide-react";

export default function CodePage() {
    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold">코드 관리</h1>
                <p className="text-muted-foreground">프로젝트 코드와 버전 관리를 확인하세요</p>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <h4 className="font-semibold">저장소</h4>
                            <p className="text-sm text-muted-foreground">github.com/company/project-name</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">기본 브랜치</h4>
                            <p className="text-sm text-muted-foreground">main</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">마지막 커밋</h4>
                            <p className="text-sm text-muted-foreground">2시간 전</p>
                        </div>
                    </div>
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
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="default">main</Badge>
                                        <span className="font-medium">메인 브랜치</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        최신 커밋: 2시간 전
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="secondary">feature/login</Badge>
                                        <span className="font-medium">로그인 기능 개발</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        최신 커밋: 1일 전
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline">feature/dashboard</Badge>
                                        <span className="font-medium">대시보드 구현</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        최신 커밋: 3일 전
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="commits" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <GitCommit className="h-5 w-5" />
                                최근 커밋
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 border rounded-lg">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <div className="flex-1">
                                        <p className="font-medium">로그인 기능 완료</p>
                                        <p className="text-sm text-muted-foreground">김개발 • 2시간 전</p>
                                    </div>
                                    <Badge variant="outline">abc1234</Badge>
                                </div>
                                <div className="flex items-center gap-3 p-3 border rounded-lg">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <div className="flex-1">
                                        <p className="font-medium">UI 컴포넌트 리팩토링</p>
                                        <p className="text-sm text-muted-foreground">박프론트 • 1일 전</p>
                                    </div>
                                    <Badge variant="outline">def5678</Badge>
                                </div>
                                <div className="flex items-center gap-3 p-3 border rounded-lg">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    <div className="flex-1">
                                        <p className="font-medium">API 엔드포인트 추가</p>
                                        <p className="text-sm text-muted-foreground">이백엔드 • 2일 전</p>
                                    </div>
                                    <Badge variant="outline">ghi9012</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pull-requests" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <GitPullRequest className="h-5 w-5" />
                                Pull Requests
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="default">Open</Badge>
                                        <span className="font-medium">로그인 기능 구현</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        김개발 • 1일 전
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="secondary">Review</Badge>
                                        <span className="font-medium">대시보드 UI 개선</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        박프론트 • 3일 전
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline">Merged</Badge>
                                        <span className="font-medium">데이터베이스 스키마 업데이트</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        이백엔드 • 1주 전
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
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
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">📁</span>
                            <span>src/</span>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                            <span className="text-muted-foreground">📁</span>
                            <span>components/</span>
                        </div>
                        <div className="flex items-center gap-2 ml-8">
                            <span className="text-muted-foreground">📄</span>
                            <span>Button.tsx</span>
                        </div>
                        <div className="flex items-center gap-2 ml-8">
                            <span className="text-muted-foreground">📄</span>
                            <span>Card.tsx</span>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                            <span className="text-muted-foreground">📁</span>
                            <span>pages/</span>
                        </div>
                        <div className="flex items-center gap-2 ml-8">
                            <span className="text-muted-foreground">📄</span>
                            <span>Dashboard.tsx</span>
                        </div>
                        <div className="flex items-center gap-2 ml-8">
                            <span className="text-muted-foreground">📄</span>
                            <span>Login.tsx</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 