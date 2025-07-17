// 프로젝트 요약 정보 타입
export interface ProjectSummary {
    totalTasks: number;
    progress: number;
    dueDate: string | null;
    teamMembers: number;
    projectTitle: string;
}

// 작업 상태 통계 타입
export interface TaskStatistics {
    label: string;
    color: string;
    count: number;
}

// 프로젝트 개요 타입
export interface ProjectOverview {
    title: string;
    description: string | null;
    projectKey: string;
    status: string;
    repositoryUrl: string | null;
    dueDate: string | null;
    labels: string[];
}

// Gantt 차트 작업 타입
export interface GanttTask {
    id: string;
    name: string;
    start: string | null;
    end: string | null;
    progress: number;
    dependencies?: string[];
} 