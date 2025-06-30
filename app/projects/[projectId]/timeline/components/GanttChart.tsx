"use client";

import { useEffect, useRef } from "react";
import { GanttTask } from "../types";

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

    useEffect(() => {
        function drawGantt() {
            if (ganttRef.current && window.Gantt && tasks.length > 0) {
                // 기존 컨테이너 완전히 비우기!
                ganttRef.current.innerHTML = '';
                new window.Gantt(ganttRef.current, tasks, {
                    view_mode: 'Week',
                    today_button: true,
                    view_mode_select: true,
                });
            }
        }

        if (!window.Gantt) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/frappe-gantt/dist/frappe-gantt.css';
            document.head.appendChild(link);

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/frappe-gantt/dist/frappe-gantt.umd.js';
            script.onload = () => drawGantt();
            document.head.appendChild(script);

            return () => {
                if (document.head.contains(link)) document.head.removeChild(link);
                if (document.head.contains(script)) document.head.removeChild(script);
            };
        } else {
            drawGantt();
        }
    }, [tasks]);

    if (loading) return <div style={{height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Gantt 차트 로딩 중...</div>;
    if (error) return <div style={{height: 300, color: 'red', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{error}</div>;
    if (tasks.length === 0) return <div style={{height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>표시할 작업이 없습니다.</div>;

    return (
        <div ref={ganttRef} style={{ width: '100%' }} />
    );
} 