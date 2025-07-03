"use client";

import * as React from "react";
import { useParams, usePathname } from "next/navigation";
import {
    ChevronDown,
    FolderOpen,
    AlertCircle,
    Users,
    Settings,
    Plus,
    Hand,
    Globe,
    ChartNoAxesGantt,
    Kanban,
    TableOfContents,
    Code,
} from "lucide-react";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Project {
    id: number;
    name: string;
    status: string;
}

export default function SideBar() {
    const [projects, setProjects] = React.useState<Project[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string | null>(null);
    const [isProjectsOpen, setIsProjectsOpen] = React.useState(true);
    const pathname = usePathname();
    const match = pathname.match(/\/projects\/([^/]+)/);
    const projectId = match ? match[1] : null;
    const [myIssueCount, setMyIssueCount] = React.useState<number | null>(null);
    
    const project_id = usePathname().split("/");
    console.log("project_id", project_id);
    React.useEffect(() => {
        
        async function fetchProjects() {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(`${getApiUrl()}/projects`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                if (!res.ok) {
                    console.log("status", res.status, res.statusText);

                    if (res.status == 401) {
                        alert("로그인 후 이용해주세요.");
                        window.location.href = "/auth/login?redirect=" + project_id[2] + "/" + project_id[3];
                    }

                    throw new Error("프로젝트 목록을 불러오지 못했습니다.");
                }
                const data = await res.json();

                // 데이터가 없거나 빈 배열인 경우 처리
                if (!data || !Array.isArray(data) || data.length === 0) {
                    setProjects([]);
                    setLoading(false);
                    return;
                }

                // 백엔드 데이터를 프론트엔드 형식으로 변환
                const transformedProjects: Project[] = data.map(
                    (project: any) => ({
                        id: project.id,
                        name: project.title ?? project.name ?? "",
                        status: project.status,
                        // 사이드바에서는 assignee, people, description 등은 사용하지 않으므로 생략
                    })
                );
                setProjects(transformedProjects);
            } catch (e: any) {
                setError(e.message || "알 수 없는 오류");
            } finally {
                setLoading(false);
            }
        }
        fetchProjects();
    }, []);

    React.useEffect(() => {
        const fetchMyIssueCount = async () => {
            try {
                const res = await fetch(
                    `${getApiUrl()}/projects/${projectId}/my-issues-count`,
                    {
                        credentials: "include", // 👈 요거 넣어야 쿠키(JWT) 같이 감!
                    }
                );
                if (!res.ok) throw new Error("Failed to fetch count");
                const data = await res.json();
                setMyIssueCount(data.count);
            } catch (err) {
                console.error(err);
            }
        };
        fetchMyIssueCount();
    }, [projectId]);

    const menuItems = [
        {
            title: "내 이슈",
            icon: AlertCircle,
            url: "my-issues",
            badge: myIssueCount !== null ? String(myIssueCount) : undefined,
        },
        {
            title: "요약",
            icon: Globe,
            url: "summary",
        },
        {
            title: "타임라인",
            icon: ChartNoAxesGantt,
            url: "timeline",
        },
        {
            title: "보드",
            icon: Kanban,
            url: "board",
        },
        {
            title: "목록",
            icon: TableOfContents,
            url: "list",
        },
        {
            title: "코드",
            icon: Code,
            url: "code",
        },
        {
            title: "설정",
            icon: Settings,
            url: "settings",
        },
    ];

    return (
        <div className="w-64 border-r bg-background text-foreground h-screen overflow-y-auto">
            <div className="p-4 space-y-4">
                {/* 프로젝트 섹션 */}
                <Collapsible
                    open={isProjectsOpen}
                    onOpenChange={setIsProjectsOpen}
                >
                    <div className="space-y-2">
                        <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-accent hover:text-accent-foreground rounded-md p-2">
                            <div className="flex items-center gap-2">
                                <FolderOpen className="h-4 w-4" />
                                <span className="font-medium">프로젝트</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div
                                    className="h-5 w-5 rounded-sm hover:bg-accent flex items-center justify-center cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // 새 프로젝트 추가 로직
                                    }}
                                >
                                    <Plus className="h-3 w-3" />
                                </div>
                                <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <div className="ml-6 space-y-1">
                                {loading ? (
                                    <div className="text-xs text-muted-foreground">
                                        불러오는 중...
                                    </div>
                                ) : error ? (
                                    <div className="text-xs text-red-500">
                                        {error}
                                    </div>
                                ) : projects.length === 0 ? (
                                    <div className="text-xs text-muted-foreground">
                                        프로젝트가 없습니다.
                                    </div>
                                ) : (
                                    projects.map((project) => (
                                        <Link
                                            key={project.id}
                                            href={`/projects/${project.id}/summary`}
                                            className="flex items-center justify-between p-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-md"
                                        >
                                            <span className="truncate">
                                                {project.name}
                                            </span>
                                            <span
                                                className={`h-2 w-2 rounded-full ${
                                                    project.status === "ACTIVE"
                                                        ? "bg-green-500"
                                                        : project.status ===
                                                          "COMPLETED"
                                                        ? "bg-blue-500"
                                                        : "bg-yellow-500"
                                                }`}
                                            />
                                        </Link>
                                    ))
                                )}
                            </div>
                        </CollapsibleContent>
                    </div>
                </Collapsible>

                {/* 메인 메뉴 섹션 */}
                <div className="space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname.includes(item.url);
                        return (
                            <a
                                key={item.title}
                                href={item.url}
                                className={`flex items-center justify-between p-2 rounded-md transition-colors ${
                                    isActive
                                        ? "bg-accent text-accent-foreground font-medium"
                                        : "hover:bg-accent hover:text-accent-foreground"
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.title}</span>
                                </div>
                                {item.badge && (
                                    <span className="bg-accent text-accent-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                                        {item.badge}
                                    </span>
                                )}
                            </a>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
