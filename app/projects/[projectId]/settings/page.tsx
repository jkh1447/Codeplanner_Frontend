"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Settings, Users, Bell, Shield, Palette, Database } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold">프로젝트 설정</h1>
                <p className="text-muted-foreground">프로젝트 설정을 관리하세요</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 기본 정보 */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                기본 정보
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="project-name">프로젝트명</Label>
                                <Input id="project-name" defaultValue="웹 애플리케이션 개발" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="project-description">설명</Label>
                                <Textarea 
                                    id="project-description" 
                                    defaultValue="현대적인 웹 애플리케이션 개발 프로젝트입니다."
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start-date">시작일</Label>
                                    <Input id="start-date" type="date" defaultValue="2024-01-01" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end-date">종료일</Label>
                                    <Input id="end-date" type="date" defaultValue="2024-06-30" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="project-url">프로젝트 URL</Label>
                                <Input id="project-url" defaultValue="https://github.com/company/project" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* 팀 관리 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                팀 관리
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>팀원 권한</Label>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="font-medium">김개발</p>
                                            <p className="text-sm text-muted-foreground">프론트엔드 개발자</p>
                                        </div>
                                        <Select defaultValue="member">
                                            <SelectTrigger className="w-[140px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admin">관리자</SelectItem>
                                                <SelectItem value="member">멤버</SelectItem>
                                                <SelectItem value="viewer">뷰어</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="font-medium">이백엔드</p>
                                            <p className="text-sm text-muted-foreground">백엔드 개발자</p>
                                        </div>
                                        <Select defaultValue="member">
                                            <SelectTrigger className="w-[140px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admin">관리자</SelectItem>
                                                <SelectItem value="member">멤버</SelectItem>
                                                <SelectItem value="viewer">뷰어</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full">
                                팀원 초대
                            </Button>
                        </CardContent>
                    </Card>

                    {/* 알림 설정 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                알림 설정
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">이메일 알림</p>
                                    <p className="text-sm text-muted-foreground">작업 업데이트 시 이메일로 알림</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">브라우저 알림</p>
                                    <p className="text-sm text-muted-foreground">브라우저 푸시 알림</p>
                                </div>
                                <Switch />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">마감일 알림</p>
                                    <p className="text-sm text-muted-foreground">마감일 3일 전 알림</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 사이드바 설정 */}
                <div className="space-y-6">
                    {/* 보안 설정 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                보안
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">2단계 인증</p>
                                    <p className="text-sm text-muted-foreground">추가 보안</p>
                                </div>
                                <Switch />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">세션 관리</p>
                                    <p className="text-sm text-muted-foreground">활성 세션</p>
                                </div>
                                <Button variant="outline" size="sm">
                                    관리
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 테마 설정 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="h-5 w-5" />
                                테마
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>색상 테마</Label>
                                <Select defaultValue="system">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">라이트</SelectItem>
                                        <SelectItem value="dark">다크</SelectItem>
                                        <SelectItem value="system">시스템</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>언어</Label>
                                <Select defaultValue="ko">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ko">한국어</SelectItem>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="ja">日本語</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 데이터 관리 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="h-5 w-5" />
                                데이터
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button variant="outline" className="w-full">
                                데이터 내보내기
                            </Button>
                            <Button variant="outline" className="w-full">
                                백업 생성
                            </Button>
                            <Separator />
                            <Button variant="destructive" className="w-full">
                                프로젝트 삭제
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 