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
    Bot,
    TrendingUp
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

interface UserRole {
    role: string;
    isLeader: boolean;
}

export default function SideBar() {
    const [projects, setProjects] = React.useState<Project[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string | null>(null);
    const [isProjectsOpen, setIsProjectsOpen] = React.useState(false);
    const pathname = usePathname();
    const match = pathname.match(/\/projects\/([^/]+)/);
    const projectId = match ? match[1] : null;
    const [myIssueCount, setMyIssueCount] = React.useState<number | null>(null);
    const [userRole, setUserRole] = React.useState<UserRole | null>(null);
    
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
        
        const fetchUserRole = async () => {
            try {
                // 현재 사용자의 프로젝트 내 역할을 가져오기
                const res = await fetch(
                    `${getApiUrl()}/projects/${projectId}/my-role`,
                    {
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                    }
                );
                
                if (res.ok) {
                    const data = await res.json();
                    setUserRole({
                        role: data.role,
                        isLeader: data.isLeader || false
                    });
                } else {
                    // 멤버 정보가 없는 경우 (프로젝트에 속하지 않음)
                    setUserRole({ role: 'NONE', isLeader: false });
                }
            } catch (err) {
                console.error('Failed to fetch user role:', err);
                setUserRole({ role: 'NONE', isLeader: false });
            }
        };

        if (projectId) {
            fetchMyIssueCount();
            fetchUserRole();
        }
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
            title: "AI 이슈 생성",
            icon: Bot,
            url: "issue-generater-ai",
            highlight: true,
        },
        {
            title: "Summary AI (회고/기여도)",
            icon: TrendingUp,
            url: "summaryai",
            highlight: true,
        },
        {
            title: "설정",
            icon: Settings,
            url: "settings",
        },
    ];

    // 역할 표시 텍스트 및 색상 결정
    const getRoleDisplay = () => {
        if (!userRole || userRole.role === 'NONE') return null;
        
        // 리더가 최고 권한자이므로 우선 표시
        if (userRole.isLeader) {
            return (
                <div className="px-2 py-1 rounded-full text-xs font-medium border bg-yellow-100 text-yellow-800 border-yellow-200">
                    리더
                </div>
            );
        }
        
        // 리더가 아닌 경우 일반 역할 표시
        const roleInfo = {
            ADMIN: { text: '관리자', color: 'bg-orange-100 text-orange-800 border-orange-200' },
            MEMBER: { text: '멤버', color: 'bg-blue-100 text-blue-800 border-blue-200' },
            VIEWER: { text: '뷰어', color: 'bg-gray-100 text-gray-800 border-gray-200' },
        };
        
        const currentRole = roleInfo[userRole.role as keyof typeof roleInfo];
        if (!currentRole) return null;
        
        return (
            <div className={`px-2 py-1 rounded-full text-xs font-medium border ${currentRole.color}`}>
                {currentRole.text}
            </div>
        );
    };
    
    return (
        <div className="w-64 border-r bg-background text-foreground min-h-screen max-h-screen overflow-y-auto flex flex-col">
            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                {/* 현재 프로젝트와 역할 정보 */}
                {userRole && userRole.role !== 'NONE' && (
                    <div className="bg-muted/50 rounded-lg p-3 border">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-muted-foreground">
                                {userRole.isLeader ? '프로젝트 리더' : '프로젝트 권한'}
                            </span>
                            {getRoleDisplay()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {userRole.isLeader && '프로젝트 최고 관리자 권한'}
                            {!userRole.isLeader && userRole.role === 'VIEWER' && '읽기 전용 권한'}
                            {!userRole.isLeader && userRole.role === 'MEMBER' && '이슈 생성/수정 가능'}
                            {!userRole.isLeader && userRole.role === 'ADMIN' && '제한된 관리 권한'}
                        </div>                
                    </div>
                )}
                {/* 접속 중인 프로젝트 (항상 표시) */}
                {projectId && projects.length > 0 && (() => {
                    const currentProject = projects.find(p => String(p.id) === String(projectId));
                    if (!currentProject) return null;
                    
                    return (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 p-2 text-sm bg-accent/50 rounded-md border">
                                <FolderOpen className="h-4 w-4" />
                                <span className="truncate font-medium flex-1">
                                    {currentProject.name}
                                </span>
                                <span
                                    className={`h-2 w-2 rounded-full flex-shrink-0 ${
                                        currentProject.status === "대기중"
                                            ? "bg-yellow-500"
                                            : currentProject.status === "진행중"
                                            ? "bg-blue-500"
                                            : currentProject.status === "완료"
                                            ? "bg-green-500"
                                            : currentProject.status === "보류"
                                            ? "bg-red-500"
                                            : "bg-gray-500"
                                    }`}
                                />
                            </div>
                        </div>
                    );
                })()}

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
                                {isProjectsOpen ? (
                                    <ChevronDown className="h-4 w-4 transition-transform rotate-180" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 transition-transform" />
                                )}
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <div className="ml-6 space-y-3">
                                {loading ? (
                                    <div className="text-xs text-muted-foreground">
                                        불러오는 중...
                                    </div>
                                ) : error ? (
                                    <div className="text-xs text-red-500">
                                        {error}
                                    </div>
                                ) : (
                                    projects.length === 0 ? (
                                        <div className="text-xs text-muted-foreground">
                                            프로젝트가 없습니다.
                                        </div>
                                    ) : (
                                        projects
                                            .filter((project) => String(project.id) !== String(projectId)) // 접속 중인 프로젝트 제외
                                            .map((project) => (
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
                                                            project.status === "대기중"
                                                                ? "bg-yellow-500"
                                                                : project.status === "진행중"
                                                                ? "bg-blue-500"
                                                                : project.status === "완료"
                                                                ? "bg-green-500"
                                                                : project.status === "보류"
                                                                ? "bg-red-500"
                                                                : "bg-gray-500"
                                                        }`}
                                                    />
                                                </Link>
                                            ))
                                    )
                                )}
                            </div>
                        </CollapsibleContent>
                    </div>
                </Collapsible>

                {/* 메인 메뉴 섹션 */}
                <div className="space-y-1">
                    {menuItems
                        .filter((item) => {
                            if (!userRole || userRole.role === 'NONE') return false;
                            
                            // VIEWER 권한은 제한된 메뉴만 볼 수 있음
                            if (userRole.role === 'VIEWER') {
                                // VIEWER는 요약, 타임라인, 보드, 목록, 코드만 볼 수 있음
                                return ['summary', 'timeline', 'board', 'list', 'code'].includes(item.url);
                            }
                            
                            // 설정 메뉴는 프로젝트 리더 또는 관리자만 볼 수 있음
                            if (item.url === 'settings') {
                                return userRole.isLeader || userRole.role === 'ADMIN';
                            }
                            
                            // AI 이슈 생성은 리더, 관리자, 멤버만 사용 가능 (뷰어 제외)
                            if (item.url === 'issue-generater-ai') {
                                return userRole.isLeader || userRole.role === 'ADMIN' || userRole.role === 'MEMBER';
                            }
                            
                            // 기여도 분석은 모든 역할에서 사용 가능
                            if (item.url === 'summaryai') {
                                return true;
                            }
                            
                            // 내 이슈, 요약, 타임라인, 보드, 목록, 코드는 모든 역할에서 볼 수 있음
                            return true;
                        })
                        .map((item) => {
                            // url path가 완전히 일치할 때만 active
                            const isActive = pathname.endsWith(`/${item.url}`);
                            return (
                                <a
                                    key={item.title}
                                    href={`/projects/${projectId}/${item.url}`}
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
