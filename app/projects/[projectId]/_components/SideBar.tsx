"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
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

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getApiUrl } from "@/lib/api";
import { Project } from "@/components/type";

// 샘플 프로젝트 데이터

export default function SideBar() {
  const [isProjectsOpen, setIsProjectsOpen] = React.useState(true);
  const [myIssueCount, setMyIssueCount] = React.useState<number | null>(null);
  const [myProjects, setMyProjects] = React.useState<Project[]>([]);
  const pathname = usePathname();
  const apiUrl = getApiUrl();
  const match = pathname.match(/\/projects\/([^/]+)/);
  const projectId = match ? match[1] : null;

  React.useEffect(() => {
    const fetchMyIssueCount = async () => {
      try {
        const res = await fetch(
          `${apiUrl}/api/projects/${projectId}/my-issues-count`,
          {
            credentials: "include",
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

  React.useEffect(() => {
    fetch(`${apiUrl}/projects`, {
        credentials: "include",
    })
    .then((res) => res.json())
    .then((data: Project[]) => {
        setMyProjects(data)
        console.log("📦 내 프로젝트 데이터:", data);
    });
    },[]);

  const projects = myProjects;
//   {
//     id: 1,
//     name: "웹 애플리케이션 개발",
//     status: "active",
//   },
//   {
//     id: 2,
//     name: "모바일 앱 프로젝트",
//     status: "active",
//   },
//   {
//     id: 3,
//     name: "API 서버 구축",
//     status: "completed",
//   },
//   {
//     id: 4,
//     name: "데이터베이스 마이그레이션",
//     status: "pending",
//   },];

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
        <Collapsible open={isProjectsOpen} onOpenChange={setIsProjectsOpen}>
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
                  }}
                >
                  <Plus className="h-3 w-3" />
                </div>
                <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="ml-6 space-y-1">
                {myProjects.map((project) => (
                  <a
                    key={project.id}
                    href={`/projects/${project.id}/board`}
                    className="flex items-center justify-between p-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-md"
                  >
                    <span className="truncate max-w-[160px] overflow-hidden whitespace-nowrap">
                      {project.title}
                    </span>
                    <span
                      className={`h-2 w-2 rounded-full ${
                        project.status === "ACTIVE"
                          ? "bg-green-500"
                          : project.status === "COMPLETED"
                          ? "bg-blue-500"
                          : project.status === "PENDING"
                          ? "bg-yellow-500"
                          : "bg-gray-400"
                      }`}
                    />
                  </a>
                ))}
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
