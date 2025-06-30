"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Plus } from "lucide-react";

export default function ListPage() {
    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">작업 목록</h1>
                    <p className="text-muted-foreground">모든 작업을 목록으로 확인하세요</p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    새 작업 추가
                </Button>
            </div>

            {/* 필터 및 검색 */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="작업 검색..." className="pl-10" />
                            </div>
                        </div>
                        <Select>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="상태 필터" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">모든 상태</SelectItem>
                                <SelectItem value="todo">할 일</SelectItem>
                                <SelectItem value="in-progress">진행 중</SelectItem>
                                <SelectItem value="review">검토 중</SelectItem>
                                <SelectItem value="done">완료</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="우선순위" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">모든 우선순위</SelectItem>
                                <SelectItem value="high">높음</SelectItem>
                                <SelectItem value="medium">보통</SelectItem>
                                <SelectItem value="low">낮음</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* 작업 테이블 */}
            <Card>
                <CardHeader>
                    <CardTitle>작업 목록</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>작업명</TableHead>
                                <TableHead>담당자</TableHead>
                                <TableHead>상태</TableHead>
                                <TableHead>우선순위</TableHead>
                                <TableHead>마감일</TableHead>
                                <TableHead>진행률</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">로그인 기능 구현</TableCell>
                                <TableCell>김개발</TableCell>
                                <TableCell>
                                    <Badge variant="default">완료</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="destructive">높음</Badge>
                                </TableCell>
                                <TableCell>2024-01-15</TableCell>
                                <TableCell>100%</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">데이터베이스 설계</TableCell>
                                <TableCell>이백엔드</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">진행 중</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">보통</Badge>
                                </TableCell>
                                <TableCell>2024-01-20</TableCell>
                                <TableCell>75%</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">UI 컴포넌트 개발</TableCell>
                                <TableCell>박프론트</TableCell>
                                <TableCell>
                                    <Badge variant="outline">검토 중</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">보통</Badge>
                                </TableCell>
                                <TableCell>2024-01-18</TableCell>
                                <TableCell>90%</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">API 문서 작성</TableCell>
                                <TableCell>최문서</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">진행 중</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">낮음</Badge>
                                </TableCell>
                                <TableCell>2024-01-25</TableCell>
                                <TableCell>60%</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
} 