"use client";

import { useEffect, useRef, useCallback } from "react";
import { GanttTask } from "../types";
import { getApiUrl } from "@/lib/api";
import { useDebouncedCallback } from "use-debounce";

declare global {
  interface Window {
    Gantt: any;
  }
}

interface GanttChartProps {
  tasks: GanttTask[];
  loading?: boolean;
  error?: string | null;
  userRole?: { role: string; isLeader: boolean } | null;
}

export default function GanttChart({
  tasks,
  loading = false,
  error = null,
  userRole = null,
}: GanttChartProps) {
  const ganttRef = useRef<HTMLDivElement>(null);
  const ganttInstance = useRef<any>(null);
  const isScriptLoaded = useRef(false);
  const hasInitialized = useRef(false);
  const viewerWarningShown = useRef(false);

  const handleDateChange = useCallback(
    async (task: GanttTask, start: Date, end: Date) => {
      const startStr = start.toISOString().split("T")[0];
      const endStr = end.toISOString().split("T")[0];
      try {
        const res = await fetch(
          `${getApiUrl()}/projects/issues/${task.id}/update-dates`,
          {
            credentials: "include",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ startDate: startStr, dueDate: endStr }),
          }
        );
        if (!res.ok) throw new Error("이슈 날짜 변경 실패");
      } catch {
        alert("이슈 날짜 변경에 실패했습니다.");
      }
    },
    []
  );

  // 디바운싱된 날짜 변경 핸들러 (500ms)
  const debouncedHandleDateChange = useDebouncedCallback(handleDateChange, 500);

  // Load CSS & JS once
  useEffect(() => {
    if (isScriptLoaded.current || typeof window === "undefined") return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/frappe-gantt/dist/frappe-gantt.css";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.innerHTML = `
      .gantt-container {
        width: 100%;
        overflow-x: auto;
        position: relative;
        min-height: 150px;
      }
      
      .gantt .details-container {
        z-index: 999 !important;
        position: fixed !important;
        background: white !important;
        border: 1px solid #ccc !important;
        padding: 8px !important;
      }

      /* 필수 스타일만 유지 */
      .gantt .today-highlight {
        background: rgba(59, 130, 246, 0.1) !important;
      }
    `;
    document.head.appendChild(style);

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/frappe-gantt/dist/frappe-gantt.umd.js";
    script.onload = () => {
      isScriptLoaded.current = true;
      if (tasks.length) drawChart();
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(style);
      document.head.removeChild(script);
    };
  }, []);

  // Re-draw on tasks change only
  useEffect(() => {
    if (!isScriptLoaded.current || typeof window === "undefined") return;
    drawChart();
  }, [tasks]);

  // 휠 스크롤 핸들러를 drawChart 함수에서 직접 추가하도록 변경

  function drawChart() {
    if (!ganttRef.current) return;
    
    // 이전 인스턴스 정리
    if (ganttInstance.current) {
      ganttInstance.current = null;
    }
    
    // tasks가 변경되었을 때만 초기화 (스크롤 중이 아닐 때)
    if (hasInitialized.current && tasks.length > 0) {
      // 스크롤 중인지 확인
      const isScrolling = ganttRef.current.querySelector('.gantt-container')?.classList.contains('scrolling');
      if (!isScrolling) {
      ganttRef.current.innerHTML = "";
      }
    }
    hasInitialized.current = true;
    
    if (!tasks.length) return;

    try {
      ganttInstance.current = new window.Gantt(ganttRef.current, tasks, {
        view_mode: "Day",
        today_button: true,
        view_mode_select: true,
        language: "ko",
        
        // 초기 로딩 시 today로 스크롤
        scroll_to: "today",
        
        // 날짜 변경 이벤트 (VIEWER 권한일 때 비활성화, 디바운싱 적용)
        on_date_change: (task: GanttTask, start: Date, end: Date) => {
          // VIEWER 권한이면 날짜 변경 불가 (경고 메시지는 한 번만 표시)
          if (userRole?.role === 'VIEWER') {
            if (!viewerWarningShown.current) {
              alert('뷰어 권한으로는 날짜를 변경할 수 없습니다.');
              viewerWarningShown.current = true;
              // 3초 후에 경고 메시지 플래그 초기화
              setTimeout(() => {
                viewerWarningShown.current = false;
              }, 3000);
            }
            return;
          }
          
          // KST 시간대 보정
          const correctedStart = new Date(start.getTime() + 9 * 60 * 60 * 1000);
          const correctedEnd = new Date(end.getTime() + 9 * 60 * 60 * 1000);
          debouncedHandleDateChange(task, correctedStart, correctedEnd);
        },
      });
      
      // 차트 초기화 후 today로 스크롤 (추가 보장)
      setTimeout(() => {
        if (ganttInstance.current && ganttInstance.current.scroll_to_today) {
          ganttInstance.current.scroll_to_today();
        }
      }, 100);
      
      // 차트가 완전히 그려진 후 스크롤 핸들러 추가
      setTimeout(() => {
        addScrollHandler();
      }, 200);
      
    } catch (error) {
      console.error("Gantt chart 초기화 실패:", error);
    }
  }

  // 스크롤 핸들러 추가 함수
  function addScrollHandler() {
    if (!ganttRef.current) return;

    // 기존 핸들러 제거
    const existingHandler = ganttRef.current.dataset.scrollHandler;
    if (existingHandler) {
      ganttRef.current.removeEventListener('wheel', (window as any).ganttScrollHandler);
    }

    const handleWheel = (e: WheelEvent) => {
      // Ctrl/Cmd + 스크롤은 줌 기능으로 사용 (라이브러리 기본 기능 유지)
      if (e.ctrlKey || e.metaKey) return;
      
      // 수직 스크롤을 수평 스크롤로 변환
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        e.stopPropagation(); // 이벤트 전파 중단
        
        // 실제로 생성된 Gantt 스크롤 컨테이너 찾기
        const ganttContainer = ganttRef.current?.querySelector('.gantt-container') || 
                              ganttRef.current?.parentElement?.querySelector('.gantt-container') ||
                              document.querySelector('.gantt .gantt-container');
        
        if (ganttContainer) {
          // 스크롤 중 상태 표시
          ganttContainer.classList.add('scrolling');
          
          const scrollAmount = e.deltaY * 1.5;
          ganttContainer.scrollLeft += scrollAmount;
          
          // 스크롤 완료 후 상태 제거
          clearTimeout((window as any).scrollTimeout);
          (window as any).scrollTimeout = setTimeout(() => {
            ganttContainer.classList.remove('scrolling');
          }, 150);
        }
      }
    };

    // 전역 참조 저장 (cleanup을 위해)
    (window as any).ganttScrollHandler = handleWheel;
    
    // 이벤트 리스너 추가 (capture: true로 변경하여 이벤트 캡처)
    ganttRef.current.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    ganttRef.current.dataset.scrollHandler = 'true';
  }

  if (loading) {
    return <div style={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
      타임라인 차트 로딩 중...
    </div>;
  }

  if (error) {
    return <div style={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center", color: "red" }}>
      {error}
    </div>;
  }

  if (!tasks.length) {
    return <div style={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
      표시할 이슈가 없습니다.
    </div>;
  }

  return (
    <div className="gantt-container">
      <div ref={ganttRef} />
    </div>
  );
}
  