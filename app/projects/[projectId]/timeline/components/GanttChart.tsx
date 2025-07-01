"use client";

import { useEffect, useRef, useCallback } from "react";
import { GanttTask } from "../types";
import { getApiUrl } from "@/lib/api";

// Frappe Gantt 라이브러리를 위한 전역 타입 정의
// window 객체에 Gantt 속성을 추가하여 TypeScript 오류 방지
declare global {
    interface Window {
        Gantt: any;
    }
}

interface GanttChartProps {
    tasks: GanttTask[];
    loading?: boolean;
    error?: string | null;
}


export default function GanttChart({ tasks, loading = false, error = null }: GanttChartProps) {
  const ganttRef = useRef<HTMLDivElement>(null);
  const isScriptLoaded = useRef(false);
  const hasInitialized = useRef(false);

  const handleDateChange = useCallback(async (task: GanttTask, start: Date, end: Date) => {
    try {
      const response = await fetch(`${getApiUrl()}/api/issues/${task.id}/update-dates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: start.toISOString().split('T')[0],
          dueDate: end.toISOString().split('T')[0],
        }),
      });
      if (!response.ok) {
        throw new Error('날짜 변경 실패');
      }
    } catch {
      alert('날짜 변경에 실패했습니다.');
    }
  }, []);

  // Load CSS and JS only once
  useEffect(() => {
    if (isScriptLoaded.current || typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/frappe-gantt/dist/frappe-gantt.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/frappe-gantt/dist/frappe-gantt.umd.js';
    script.onload = () => {
      isScriptLoaded.current = true;
      // Initial draw in case tasks were already passed
      if (tasks.length > 0) drawChart();
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(script);
    };
  }, []);

  // Draw or redraw the Gantt chart when tasks change
  useEffect(() => {
    if (!isScriptLoaded.current || typeof window === 'undefined') return;
    drawChart();
  }, [tasks, handleDateChange]);

  function drawChart() {
    if (!ganttRef.current) return;

    // Prevent duplicate initialization
    if (hasInitialized.current) {
      ganttRef.current.innerHTML = '';
    }
    hasInitialized.current = true;

    if (tasks.length === 0) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (window as any).Gantt(ganttRef.current, tasks, {
      view_mode: 'Week',
      today_button: true,
      view_mode_select: true,
      on_date_change: handleDateChange,
    });
  }

  if (loading) {
    return (
      <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Gantt 차트 로딩 중...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ height: 300, color: 'red', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {error}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        표시할 작업이 없습니다.
      </div>
    );
  }

  return <div ref={ganttRef} style={{ width: '100%' }} />;
}
