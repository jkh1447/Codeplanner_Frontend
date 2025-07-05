"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Id, User } from "@/components/type";
import { getApiUrl } from "@/lib/api";

// 더미 데이터 - 실제로는 서버에서 가져올 예정
const users = [
    {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "김철수",
        email: "kim@example.com",
    },
    {
        id: "124e4567-e89b-12d3-a456-426614174000",
        name: "이영희",
        email: "lee@example.com",
    },
    {
        id: "183e4567-e89b-12d3-a456-426614174000",
        name: "박민수",
        email: "park@example.com",
    },
    {
        id: "123e4467-e89b-12d3-a456-426614174000",
        name: "정수진",
        email: "jung@example.com",
    },
    {
        id: "ae4ea619-20e5-40b8-92bc-a36c935dff26",
        name: "츄미밍a",
        email: "myong2404@gmail.com",
    },
];

interface IssueFormData {
    project_id: string;
    title: string;
    description: string;
    issueType: string;
    status: string;
    assigneeId: string;
    reporterId: string;
    startDate: Date | undefined;
    dueDate: Date | undefined;
    position: number;
    tag: string;
}

interface AddIssueModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedColumn?: string;
    projectId: string;
    taskCount?: number;
    createTask: (formData: IssueFormData) => void;
    current_user: any;
}

export default function AddIssueModal({
    open,
    onOpenChange,
    selectedColumn,
    projectId,
    taskCount,
    createTask,
    current_user,
}: AddIssueModalProps) {
    // console.log("addissueprojectId", projectId);
    const [formData, setFormData] = useState<IssueFormData>({
        project_id: projectId,
        title: "",
        description: "",
        issueType: "",
        status: selectedColumn || "",
        assigneeId: "",
        reporterId: "",
        startDate: undefined,
        dueDate: undefined,
        position: taskCount || 0,
        tag: "",
    });

    const [projectMembers, setProjectMembers] = useState<User[]>([]);
    const [current_member, setCurrent_member] = useState<any | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 폼 검증
        if (!formData.title.trim()) {
            alert("제목을 입력해주세요.");
            return;
        }

        if (!formData.issueType) {
            alert("업무 유형을 선택해주세요.");
            return;
        }

        if (!formData.status) {
            alert("상태를 선택해주세요.");
            return;
        }

        formData.tag = projectTag;

        // createTask에 formData 전체를 넘김 (KanbanBoard에서 서버에 POST 후 fetchLatestTasks 실행)
        createTask(formData);

        // 폼 초기화 및 모달 닫기
        setFormData({
            project_id: "",
            title: "",
            description: "",
            issueType: "",
            status: "",
            assigneeId: "",
            reporterId: "",
            startDate: undefined,
            dueDate: undefined,
            position: 0,
            tag: "",
        });
        onOpenChange(false);

        // alert("이슈가 성공적으로 등록되었습니다!");삭제 0705진혁 github 브랜치 생성 알림 추가에 포함함
    };

    const handleInputChange = (field: keyof IssueFormData, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const getProjectMembers = async (projectId: string) => {
        const response = await fetch(
            `${getApiUrl()}/projects/${projectId}/members`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            }
        );
        const data = await response.json();
        if (response.ok) {
            setProjectMembers(data);
        } else {
            console.error("Failed to fetch project members:", data);
        }
    };

    const [projectTag, setProjectTag] = useState<string>("");
    const getProjectTag = async (projectId: string) => {
        const response = await fetch(
            `${getApiUrl()}/projects/${projectId}/tag`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            }
        );
        const data = await response.json();
        if (response.ok) {
            setProjectTag(data.issue_tag);
        } else {
            console.error("Failed to fetch project tag:", data);
        }
    };

    useEffect(() => {
        getProjectMembers(projectId);
        getProjectTag(projectId);
        console.log("current_user", current_user);
    }, []);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle>새 이슈 추가</DialogTitle>
                        {projectTag && (
                            <span className="ml-4 px-3 py-1 rounded-full bg-purple-200 text-purple-800 text-sm font-semibold mr-4">
                                {projectTag}
                            </span>
                        )}
                    </div>
                    <DialogDescription>
                        새로운 이슈를 등록합니다. 필수 항목을 모두 입력해주세요.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        {/* 제목 */}
                        <div className="space-y-2">
                            <Label htmlFor="title">제목 *</Label>
                            <Textarea
                                id="title"
                                placeholder="이슈 제목을 입력하세요"
                                value={formData.title}
                                onChange={(e) =>
                                    handleInputChange("title", e.target.value)
                                }
                                required
                                rows={2}
                            />
                        </div>

                        {/* 설명 */}
                        <div className="space-y-2">
                            <Label htmlFor="description">설명</Label>
                            <Textarea
                                id="description"
                                placeholder="이슈에 대한 상세한 설명을 입력하세요"
                                value={formData.description}
                                onChange={(e) =>
                                    handleInputChange(
                                        "description",
                                        e.target.value
                                    )
                                }
                                rows={4}
                            />
                        </div>

                        {/* 업무 유형과 상태 */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>업무 유형 *</Label>
                                <Select
                                    value={formData.issueType}
                                    onValueChange={(value) =>
                                        handleInputChange("issueType", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="유형 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="story">
                                            Story
                                        </SelectItem>
                                        <SelectItem value="task">
                                            Task
                                        </SelectItem>
                                        <SelectItem value="bug">Bug</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>상태 *</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) =>
                                        handleInputChange("status", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="상태 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TODO">
                                            Todo
                                        </SelectItem>
                                        <SelectItem value="IN_PROGRESS">
                                            In Progress
                                        </SelectItem>
                                        <SelectItem value="DONE">
                                            Done
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* 담당자와 보고자 */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>담당자</Label>
                                <Select
                                    value={formData.assigneeId}
                                    onValueChange={(value) =>
                                        handleInputChange("assigneeId", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="담당자 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projectMembers.map((user) => (
                                            <SelectItem
                                                key={user.id}
                                                value={user.id.toString()}
                                            >
                                                {user.display_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>보고자</Label>
                                <Select
                                    onValueChange={(value) =>
                                        handleInputChange("reporterId", value)
                                    }
                                    defaultValue={current_user.id || ""}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="보고자 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projectMembers.map((user) => (
                                            <SelectItem
                                                key={user.id}
                                                value={user.id.toString()}
                                            >
                                                {user.display_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* 시작일과 마감일 */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>시작일</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !formData.startDate &&
                                                    "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.startDate
                                                ? format(
                                                      formData.startDate,
                                                      "yyyy년 MM월 dd일",
                                                      {
                                                          locale: ko,
                                                      }
                                                  )
                                                : "시작일 선택"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={formData.startDate}
                                            onSelect={(date) =>
                                                handleInputChange(
                                                    "startDate",
                                                    date
                                                )
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label>마감일</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !formData.dueDate &&
                                                    "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.dueDate
                                                ? format(
                                                      formData.dueDate,
                                                      "yyyy년 MM월 dd일",
                                                      {
                                                          locale: ko,
                                                      }
                                                  )
                                                : "마감일 선택"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={formData.dueDate}
                                            onSelect={(date) =>
                                                handleInputChange(
                                                    "dueDate",
                                                    date
                                                )
                                            }
                                            initialFocus
                                            disabled={(date) =>
                                                formData.startDate
                                                    ? date < formData.startDate
                                                    : false
                                            }
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            취소
                        </Button>
                        <Button type="submit">이슈 등록</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
