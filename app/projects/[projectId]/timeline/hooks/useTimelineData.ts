import { useState, useEffect } from 'react';

interface ProjectSummary {
  totalTasks: number;
  progress: number;
  dueDate: string | null;
  teamMembers: number;
  projectTitle: string;
}

interface ProjectStatistics {
  label: string;
  color: string;
  count: number;
}

interface GanttData {
  id: string;
  name: string;
  start: string | null;
  end: string | null;
  progress: number;
}

interface ProjectOverview {
  title: string;
  description: string;
  projectKey: string;
  status: string;
  repositoryUrl: string | null;
  dueDate: string | null;
  labels: string[];
}

interface TimelineData {
  summary: ProjectSummary | null;
  statistics: ProjectStatistics[];
  ganttData: GanttData[];
  overview: ProjectOverview | null;
  loading: boolean;
  error: string | null;
}

const API_BASE_URL = 'http://localhost:5000';

export const useTimelineData = (projectId: string): TimelineData => {
  const [data, setData] = useState<TimelineData>({
    summary: null,
    statistics: [],
    ganttData: [],
    overview: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        // 병렬로 모든 API 호출
        const [summaryRes, statisticsRes, ganttRes, overviewRes] = await Promise.all([
          fetch(`${API_BASE_URL}/timeline/${projectId}/summary`),
          fetch(`${API_BASE_URL}/timeline/${projectId}/statistics`),
          fetch(`${API_BASE_URL}/timeline/${projectId}/gantt-data`),
          fetch(`${API_BASE_URL}/timeline/${projectId}/overview`),
        ]);

        // 응답 확인
        if (!summaryRes.ok || !statisticsRes.ok || !ganttRes.ok || !overviewRes.ok) {
          throw new Error('API 요청 실패');
        }

        // JSON 파싱
        const [summary, statistics, ganttData, overview] = await Promise.all([
          summaryRes.json(),
          statisticsRes.json(),
          ganttRes.json(),
          overviewRes.json(),
        ]);

        setData({
          summary,
          statistics,
          ganttData,
          overview,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('타임라인 데이터 로딩 실패:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : '알 수 없는 오류',
        }));
      }
    };

    if (projectId) {
      fetchTimelineData();
    }
  }, [projectId]);

  return data;
}; 