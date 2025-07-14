"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import ColumnContainer from "./ColumnContainer";
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";
import { useParams } from "next/navigation";
import BoardMenu from "./BoardMenu";
import PlusIcon from "@/components/icons/PlusIcon";
import { Column, Id, Task } from "@/components/type";
import { useDebouncedCallback } from "use-debounce";
import { getApiUrl } from "@/lib/api";
import { Book, Bug, SquareCheckBig } from "lucide-react";
import dynamic from "next/dynamic";
const ReactSelect = dynamic(() => import("react-select"), { ssr: false });

function KanbanBoard({ projectId }: { projectId: string }) {
    const [columns, setColumns] = useState<Column[]>([
        {
            id: "BACKLOG",
            title: "백로그",
        },
        {
            id: "TODO",
            title: "해야 할 일",
        },
        {
            id: "IN_PROGRESS",
            title: "진행 중",
        },
        {
            id: "IN_REVIEW",
            title: "리뷰 중",
        },
        {
            id: "DONE",
            title: "완료",
        },
    ]);
    const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);
    const [isClient, setIsClient] = useState(false);
    const [current_user, setCurrent_user] = useState<any>("");

    const [tasks, setTasks] = useState<Task[]>([]);

    const [project_title_name, setProject_title_name] = useState<string>("");
    const allTasks = useRef<Task[]>([]);

    // 드래그 상태 관리 변수
    const [activeColumn, setActiveColumn] = useState<Column | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3,
            },
        })
    );

    // 클라이언트에서만 렌더링되도록 설정
    useEffect(() => {
        setIsClient(true);
    }, []);

    // 서버에서 최신 데이터를 가져오는 함수
    const fetchLatestTasks = React.useCallback(async () => {
        try {
            const response = await fetch(
                `${getApiUrl()}/projects/${projectId}/issues`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                }
            );
            if (response.ok) {
                const latestTasks = await response.json();
                allTasks.current = latestTasks;
                console.log("latestTasks", latestTasks);
                setTasks(
                    latestTasks.map((issue: any) => ({
                        ...issue,
                        project_id: issue.projectId,
                        assignee_id: issue.assigneeId,
                        reporter_id: issue.reporterId,
                        issue_type: issue.issueType,
                        start_date: issue.startDate,
                        due_date: issue.dueDate,
                        tag: issue.tag,
                        labels: issue.labels,
                    }))
                );
            }
        } catch (error) {
            console.error("Error fetching latest tasks:", error);
        }
    }, [projectId]);

    // 컴포넌트 마운트 시 또는 projectId 변경 시 최신 데이터 가져오기
    useEffect(() => {
        if (isClient && projectId) {
            fetchLatestTasks();
            getCurrentUser();
            getProjectTitle();
        }
    }, [isClient, projectId, fetchLatestTasks]);

    // 초기 데이터 설정 (서버에서 가져온 데이터가 없을 때만)

    // 기존 onDragOver의 setTasks 로직을 함수로 분리
    // activeId: 현재 드래그 중인 task의 id
    // overId: 드래그 중인 task가 드롭될 위치의 id
    // overType: 드롭될 위치의 타입 (Task 또는 Column)
    const moveTask = (activeId: Id, overId: Id, overType: string) => {
        setTasks((tasks) => {
            // 현재 드래그 중인 task의 id가 tasks 배열에 있는지 확인하고 저장.
            const activeIndex = tasks.findIndex((t) => t.id === activeId);
            // 없으면 task배열 그대로 반환
            if (activeIndex === -1) return tasks;
            // 드롭될 위치의 타입이 "Task"인 경우, 드래그 중인 테스크가 속한 컬럼을 드롭될 위치의 컬럼의 status로 변경
            if (overType === "Task") {
                // tasks배열 안에서 드롭될 위치에 있는 task의 인덱스 찾기
                const overIndex = tasks.findIndex((t) => t.id === overId);
                // 없으면 task배열 그대로 반환
                if (overIndex === -1) return tasks;
                //  테스크 배열의 테스크 마다 반복하면서 현재 테스크의 인덱스와 드롭될 위치의 인덱스가 같으면 현재 테스크의 status를 드롭될 위치의 테스크의 status로 변경
                // 그렇지 않으면 현재 테스크 그대로 반환
                const updatedTasks = tasks.map((task, idx) =>
                    idx === activeIndex
                        ? { ...task, status: tasks[overIndex].status }
                        : task
                );
                return arrayMove(updatedTasks, activeIndex, overIndex);
                // 테스크 위에 있지 않고 컬럼위에 있는 경우, 현재 테스크의 status를 드롭될 위치의 컬럼의 id로 변경
            }
            // 의미없음.
            else if (overType === "Column") {
                // status만 변경, 위치는 그대로
                const updatedTasks = tasks.map((task, idx) =>
                    idx === activeIndex
                        ? { ...task, status: overId as string }
                        : task
                );
                return arrayMove(updatedTasks, activeIndex, activeIndex);
            }
            return tasks;
        });
    };

    // 0ms 디바운스된 moveTask
    const debouncedMoveTask = useDebouncedCallback(moveTask, 0);

    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [labelFilter, setLabelFilter] = useState<string[]>([]);
    const [allProjectLabels, setAllProjectLabels] = useState<any[]>([]);

    // 레이블 전체 목록 가져오기 (프로젝트 기준)
    useEffect(() => {
        async function fetchLabels() {
            try {
                const response = await fetch(
                    `${getApiUrl()}/projects/${projectId}/labels`,
                    {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                    }
                );
                if (response.ok) {
                    const data = await response.json();
                    setAllProjectLabels(data);
                }
            } catch (e) {
                // ignore
            }
        }
        fetchLabels();
    }, [projectId]);

    // 필터링된 tasks
    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const typeMatch =
                typeFilter === "all" || task.issue_type === typeFilter;
            // labelFilter: []이면 전체, 아니면 하나라도 포함된 카드만
            const labelMatch =
                labelFilter.length === 0 ||
                (Array.isArray(task.labels) &&
                    task.labels.some((l: any) => labelFilter.includes(l.id)));
            return typeMatch && labelMatch;
        });
    }, [tasks, typeFilter, labelFilter]);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const minimapRef = useRef<HTMLDivElement>(null);
    const [isDraggingMinimap, setIsDraggingMinimap] = useState(false);
    const [viewportPosition, setViewportPosition] = useState(0);
    const [viewportWidth, setViewportWidth] = useState(100);
    const minimapColumnCount = 5;

    // 스크롤 위치 업데이트
    const updateViewportIndicator = () => {
        if (!scrollContainerRef.current || !minimapRef.current) return;
        const container = scrollContainerRef.current;
        const scrollLeft = container.scrollLeft;
        const scrollWidth = container.scrollWidth;
        const clientWidth = container.clientWidth;
        setViewportWidth((clientWidth / scrollWidth) * 100);
        setViewportPosition((scrollLeft / scrollWidth) * 100);
    };

    // 미니맵에서 드래그/클릭 시 메인 보드 스크롤
    const handleMinimapMouseDown = (e: React.MouseEvent) => {
        if (!minimapRef.current || !scrollContainerRef.current) return;
        setIsDraggingMinimap(true);
        const minimapRect = minimapRef.current.getBoundingClientRect();
        const clickX = e.clientX - minimapRect.left;
        const clickPercent = (clickX / minimapRect.width) * 100;
        const container = scrollContainerRef.current;
        const maxScroll = container.scrollWidth - container.clientWidth;
        const newScrollLeft =
            (clickPercent / 100) * container.scrollWidth -
            container.clientWidth / 2;
        container.scrollLeft = Math.max(0, Math.min(maxScroll, newScrollLeft));
        updateViewportIndicator();
    };
    const handleMinimapMouseMove = (e: MouseEvent) => {
        if (
            !isDraggingMinimap ||
            !minimapRef.current ||
            !scrollContainerRef.current
        )
            return;
        const minimapRect = minimapRef.current.getBoundingClientRect();
        const clickX = e.clientX - minimapRect.left;
        const clickPercent = Math.max(
            0,
            Math.min(100, (clickX / minimapRect.width) * 100)
        );
        const container = scrollContainerRef.current;
        const maxScroll = container.scrollWidth - container.clientWidth;
        const newScrollLeft =
            (clickPercent / 100) * container.scrollWidth -
            container.clientWidth / 2;
        container.scrollLeft = Math.max(0, Math.min(maxScroll, newScrollLeft));
        updateViewportIndicator();
    };
    const handleMinimapMouseUp = () => {
        setIsDraggingMinimap(false);
    };
    // 메인 스크롤 이벤트 리스너
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;
        const handleScroll = () => updateViewportIndicator();
        container.addEventListener("scroll", handleScroll);
        setTimeout(updateViewportIndicator, 100);
        return () => container.removeEventListener("scroll", handleScroll);
    }, []);
    // 전역 마우스 이벤트 리스너
    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (isDraggingMinimap) handleMinimapMouseMove(e);
        };
        const handleGlobalMouseUp = () => setIsDraggingMinimap(false);
        if (isDraggingMinimap) {
            document.addEventListener("mousemove", handleGlobalMouseMove);
            document.addEventListener("mouseup", handleGlobalMouseUp);
        }
        return () => {
            document.removeEventListener("mousemove", handleGlobalMouseMove);
            document.removeEventListener("mouseup", handleGlobalMouseUp);
        };
    }, [isDraggingMinimap]);

    // 창 크기 변경 시 미니맵 인디케이터 갱신 (setTimeout으로 딜레이 추가)
    useEffect(() => {
        const handleResize = () => {
            setTimeout(() => {
                updateViewportIndicator();
            }, 50);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <>
            <h6 className="text-sm text-slate-500 mb-2">프로젝트</h6>
            <h1 className="text-2xl font-bold text-slate-800 mb-4">
                {project_title_name}
            </h1>

            <div className="flex justify-start space-x-4">
                {/* 검색 기능 */}
                <div className="pt-2 relative text-gray-600">
                    <input
                        className="border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
                        type="search"
                        name="search"
                        placeholder="Search"
                        onChange={(e) => searchTasks(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="absolute right-0 top-0 mt-5 mr-4"
                    ></button>
                </div>

                {/* 필터 기능 */}
                <div className="flex items-center gap-2">
                    {/* 업무 유형 필터 */}
                    <span className="text-xs text-gray-500 mr-1">
                        업무 유형:
                    </span>
                    <button
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border ${
                            typeFilter === "all"
                                ? "bg-blue-100 border-blue-400 text-blue-700"
                                : "bg-white border-gray-300 text-gray-600"
                        }`}
                        onClick={() => setTypeFilter("all")}
                    >
                        전체
                    </button>
                    <button
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border ${
                            typeFilter === "bug"
                                ? "bg-red-100 border-red-400 text-red-700"
                                : "bg-white border-gray-300 text-gray-600"
                        }`}
                        onClick={() => setTypeFilter("bug")}
                    >
                        <Bug className="w-4 h-4" color="#ff0000" /> 버그
                    </button>
                    <button
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border ${
                            typeFilter === "story"
                                ? "bg-orange-100 border-orange-400 text-orange-700"
                                : "bg-white border-gray-300 text-gray-600"
                        }`}
                        onClick={() => setTypeFilter("story")}
                    >
                        <Book className="w-4 h-4" color="#ff9500" /> 스토리
                    </button>
                    <button
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border ${
                            typeFilter === "task"
                                ? "bg-indigo-100 border-indigo-400 text-indigo-700"
                                : "bg-white border-gray-300 text-gray-600"
                        }`}
                        onClick={() => setTypeFilter("task")}
                    >
                        <SquareCheckBig className="w-4 h-4" color="#3729ff" />{" "}
                        작업
                    </button>
                </div>
                <div className="flex items-center gap-2 ml-4 min-w-[200px]">
                    {/* 레이블 필터 (멀티 셀렉트) */}
                    <span className="text-xs text-gray-500 mr-1">레이블:</span>
                    <div style={{ minWidth: 180 }}>
                        <ReactSelect
                            isMulti
                            options={allProjectLabels.map((label) => ({
                                value: label.id,
                                label: label.name,
                                color: label.color,
                            }))}
                            value={allProjectLabels
                                .filter((label) =>
                                    labelFilter.includes(label.id)
                                )
                                .map((label) => ({
                                    value: label.id,
                                    label: label.name,
                                    color: label.color,
                                }))}
                            onChange={(selected) => {
                                setLabelFilter(
                                    Array.isArray(selected)
                                        ? selected.map((s) => s.value)
                                        : []
                                );
                            }}
                            placeholder="전체"
                            closeMenuOnSelect={false}
                            styles={{
                                multiValue: (base, state) => {
                                    const label = state.data as {
                                        color: string;
                                    };
                                    return {
                                        ...base,
                                        backgroundColor: label.color,
                                        color: "#fff",
                                    };
                                },
                                multiValueLabel: (base) => ({
                                    ...base,
                                    color: "#fff",
                                }),
                                multiValueRemove: (base) => ({
                                    ...base,
                                    color: "#fff",
                                    ":hover": {
                                        backgroundColor: "#333",
                                        color: "#fff",
                                    },
                                }),
                            }}
                            components={{
                                Option: (props) => {
                                    const label = props.data as {
                                        color: string;
                                        label: string;
                                    };
                                    return (
                                        <div
                                            {...props.innerProps}
                                            className={
                                                props.isFocused
                                                    ? "bg-gray-100 px-3 py-2 flex items-center gap-2"
                                                    : "px-3 py-2 flex items-center gap-2"
                                            }
                                        >
                                            <span
                                                style={{
                                                    backgroundColor:
                                                        label.color,
                                                    display: "inline-block",
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: "50%",
                                                }}
                                            />
                                            {label.label}
                                        </div>
                                    );
                                },
                                MultiValueLabel: (props) => {
                                    const label = props.data as {
                                        color: string;
                                        label: string;
                                    };
                                    return (
                                        <div className="flex items-center gap-1">
                                            <span
                                                style={{
                                                    backgroundColor:
                                                        label.color,
                                                    display: "inline-block",
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: "50%",
                                                }}
                                            />
                                            {label.label}
                                        </div>
                                    );
                                },
                            }}
                        />
                    </div>
                </div>
            </div>

            <div
                className="overflow-x-auto overflow-y-hidden"
                ref={scrollContainerRef}
            >
                {isClient && (
                    <DndContext
                        sensors={sensors}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                        onDragOver={onDragOver}
                    >
                        <div className="flex gap-4 min-w-max py-4">
                            <div className="flex gap-4">
                                <SortableContext items={columnsId}>
                                    {columns.map((col) => (
                                        <ColumnContainer
                                            key={col.id}
                                            column={col}
                                            projectId={projectId}
                                            deleteColumn={deleteColumn}
                                            updateColumn={updateColumn}
                                            createTask={createTask}
                                            tasks={filteredTasks.filter(
                                                (task) => task.status === col.id
                                            )}
                                            deleteTask={deleteTask}
                                            updateTask={updateTask}
                                            current_user={current_user}
                                            onSave={fetchLatestTasks}
                                        />
                                    ))}
                                </SortableContext>
                            </div>
                            {/* <button
                            onClick={() => {
                                createNewColumn();
                            }}
                            className="h-[60px] w-[350px] min-w-[350px] cursor-pointer rounded-lg bg-[#f8f8f8] border-2 border-gray-300 p-4 ring-rose-500 hover:ring-2 flex gap-2 flex-shrink-0"
                        >
                            <PlusIcon />
                            Add Column
                        </button> */}
                        </div>

                        {createPortal(
                            <DragOverlay>
                                {activeColumn && (
                                    <ColumnContainer
                                        projectId={projectId}
                                        column={activeColumn}
                                        deleteColumn={deleteColumn}
                                        updateColumn={updateColumn}
                                        createTask={createTask}
                                        tasks={tasks.filter(
                                            (task) =>
                                                task.status === activeColumn.id
                                        )}
                                        deleteTask={deleteTask}
                                        updateTask={updateTask}
                                        current_user={current_user}
                                    />
                                )}
                                {activeTask && (
                                    <TaskCard
                                        task={activeTask}
                                        deleteTask={deleteTask}
                                        projectId={projectId}
                                    />
                                )}
                            </DragOverlay>,
                            document.body
                        )}
                    </DndContext>
                )}

                {/* 서버에서 렌더링할 정적 버전 */}
                {!isClient && (
                    <div className="flex gap-4 min-w-max py-4">
                        <div className="flex gap-4">
                            {columns.map((col) => (
                                <div
                                    key={col.id}
                                    className="bg-[#f8f8f8] w-[350px] h-[3000px] max-h-[3000px] rounded-md flex flex-col"
                                >
                                    <div className="flex items-center justify-between bg-[#f8f8f8] text-md h-[60px] rounded-md rounded-b-none p-3 font-bold border-[#f8f8f8] border-4">
                                        <div className="flex gap-2">
                                            <div className="flex justify-center items-center bg-[#f8f8f8] px-2 py-1 text-sm rounded-full">
                                                0
                                            </div>
                                            {col.title}
                                        </div>
                                    </div>
                                    <div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
                                        <button className="flex gap-2 items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-md p-4 hover:bg-gray-100 hover:border-gray-400 transition-colors mt-2">
                                            <PlusIcon />
                                            Add Task
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* <button className="h-[60px] w-[350px] min-w-[350px] cursor-pointer rounded-lg bg-[#f8f8f8] border-2 border-gray-300 p-4 ring-rose-500 hover:ring-2 flex gap-2 flex-shrink-0">
                            <PlusIcon />
                            Add Column
                        </button> */}
                    </div>
                )}
            </div>
            {/* 미니맵 - 오른쪽 하단 */}
            <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-30 select-none">
                {/* <div className="text-xs text-gray-500 mb-2">미니맵</div> */}
                <div
                    ref={minimapRef}
                    className="relative w-28 h-10 bg-gray-100 rounded cursor-pointer border"
                    onMouseDown={handleMinimapMouseDown}
                >
                    {/* 미니맵 컬럼들 */}
                    <div className="flex h-full">
                        {Array.from({ length: minimapColumnCount }).map(
                            (_, idx) => (
                                <div
                                    key={idx}
                                    className="flex-shrink-0 bg-gray-200 border-r border-gray-300 last:border-r-0"
                                    style={{
                                        width: `${100 / minimapColumnCount}%`,
                                    }}
                                >
                                    <div className="h-full bg-gradient-to-b from-gray-300 to-gray-200"></div>
                                </div>
                            )
                        )}
                    </div>
                    {/* 현재 뷰포트 표시 */}
                    <div
                        className="absolute top-0 h-full bg-blue-500 bg-opacity-30 border-2 border-blue-500 rounded cursor-grab active:cursor-grabbing"
                        style={{
                            left: `${viewportPosition}%`,
                            width: `${viewportWidth}%`,
                            minWidth: "8px",
                        }}
                    />
                </div>
            </div>
        </>
    );

    function createTask(taskData: any) {
        fetch(`${getApiUrl()}/projects/${projectId}/issues/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(taskData),
            credentials: "include",
        })
            .then(async (res) => {
                if (!res.ok) throw new Error("Failed to add issue");
                const result = await res.json();
                console.log("이슈 생성 응답:", result);
                console.log("taskData.createBranch:", taskData.createBranch);
                fetchLatestTasks();

                // 브랜치 생성 결과 알림 (createBranch 옵션이 활성화된 경우에만)
                if (taskData.createBranch !== false) {
                    console.log("브랜치 생성 옵션 활성화됨");
                    console.log("result.branchName:", result.branchName);
                    console.log("result.branchError:", result.branchError);

                    if (result.branchName) {
                        alert(
                            `이슈가 성공적으로 등록되었습니다!\n\n이슈 제목을 기반으로 GitHub 브랜치가 자동으로 생성되었습니다.\n브랜치 이름: ${result.branchName}`
                        );
                    } else if (result.branchError) {
                        alert(
                            `이슈가 성공적으로 등록되었습니다!\n\n브랜치 생성에 실패했습니다:\n${result.branchError}`
                        );
                    } else {
                        alert(
                            `이슈가 성공적으로 등록되었습니다!\n\n브랜치 생성에 실패했습니다. (저장소 URL이 설정되지 않았거나 GitHub 연결에 문제가 있을 수 있습니다.)`
                        );
                    }
                } else {
                    console.log("브랜치 생성 옵션 비활성화됨");
                    alert("이슈가 성공적으로 등록되었습니다!");
                }
            })
            .catch((err) => {
                console.error("Error adding issue:", err);
                alert("이슈 생성에 실패했습니다.");
            });
    }

    function deleteTask(id: Id, projectId: string) {
        fetch(`${getApiUrl()}/projects/${projectId}/issues/${id}`, {
            method: "DELETE",
            credentials: "include",
        }).then((res) => {
            if (!res.ok) throw new Error("Failed to delete issue");
            fetchLatestTasks();
        });
        setTasks(tasks.filter((task) => task.id !== id));
    }

    function updateTask(id: Id, description: string) {
        const newTasks = tasks.map((task) => {
            if (task.id !== id) return task;
            return { ...task, description };
        });
        setTasks(newTasks);
    }

    function createNewColumn() {
        const columnToAdd: Column = {
            id: generateId(),
            title: `Column ${columns.length + 1}`,
        };
        setColumns([...columns, columnToAdd]);
    }

    function deleteColumn(id: Id) {
        setColumns(columns.filter((col) => col.id !== id));

        const newTasks = tasks.filter((task) => task.status !== id);
        setTasks(newTasks);
    }

    function updateColumn(id: Id, title: string) {
        const newColumns = columns.map((col) => {
            if (col.id !== id) return col;
            return { ...col, title };
        });
        setColumns(newColumns);
    }
    function onDragStart(event: DragStartEvent) {
        console.log("drag start", event);
        if (event.active.data.current?.type === "Column") {
            setActiveColumn(event.active.data.current.column);
            return;
        }
        if (event.active.data.current?.type === "Task") {
            setActiveTask(event.active.data.current.task);
            return;
        }
    }

    //
    function onDragEnd(event: DragEndEvent) {
        setActiveColumn(null);
        setActiveTask(null);
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;
        // 드래그중인 요소가 테스크인지 확인
        const isActiveTask = active.data.current?.type === "Task";
        // 드롭될 위치가 테스크인지 확인
        const isOverTask = over.data.current?.type === "Task";
        // 드롭될 위치가 컬럼인지 확인
        const isOverAColumn = over.data.current?.type === "Column";

        // 드래그중인 요소가 테스크이고 드롭될 위치가 테스크 또는 컬럼인 경우
        if (isActiveTask && (isOverTask || isOverAColumn)) {
            setTasks((tasks) => {
                // 드래그중인 요소의 인덱스 찾기
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                let newTasks = [...tasks];

                // 드롭될 위치가 테스크인 경우
                if (isOverTask) {
                    // 드롭될 위치의 인덱스 찾기
                    const overIndex = tasks.findIndex((t) => t.id === overId);
                    // 드롭될 위치의 컬럼의 id 찾기
                    const targetColumnId = tasks[overIndex].status;

                    // 같은 컬럼 내에서 순서 이동
                    if (tasks[activeIndex].status === targetColumnId) {
                        newTasks = arrayMove(newTasks, activeIndex, overIndex);
                    } else {
                        // 다른 컬럼으로 이동

                        // 드래그 중인 테스크의 상태를 드롭될 위치의 컬럼의 id로 변경
                        const movedTask = {
                            ...newTasks[activeIndex],
                            status: targetColumnId,
                        };
                        // newTasks 배열에서 activeIndex 부터 1개 제거
                        newTasks.splice(activeIndex, 1); // 기존 위치에서 제거
                        // 해당 컬럼의 마지막 인덱스 찾기
                        const lastIndex = newTasks.reduce(
                            (acc, t, idx) =>
                                t.status === targetColumnId ? idx : acc,
                            -1
                        );
                        newTasks.splice(lastIndex + 1, 0, movedTask);
                    }

                    // 서버에 업데이트
                    const issueIds = newTasks
                        .filter((task) => task.status === targetColumnId)
                        .map((task) => task.id.toString());
                    updateTaskOrderAndStatus(issueIds, targetColumnId);
                } else if (isOverAColumn) {
                    const targetColumnId = overId as string;
                    const movedTask = {
                        ...newTasks[activeIndex],
                        status: targetColumnId,
                    };
                    newTasks.splice(activeIndex, 1);
                    // 해당 컬럼의 마지막 인덱스 찾기
                    const lastIndex = newTasks.reduce(
                        (acc, t, idx) =>
                            t.status === targetColumnId ? idx : acc,
                        -1
                    );
                    newTasks.splice(lastIndex + 1, 0, movedTask);

                    // 서버에 업데이트
                    const issueIds = newTasks
                        .filter((task) => task.status === targetColumnId)
                        .map((task) => task.id.toString());
                    updateTaskOrderAndStatus(issueIds, targetColumnId);
                }

                return newTasks;
            });
        }
    }

    // 서버에 Task 순서와 상태 업데이트를 보내는 함수
    async function updateTaskOrderAndStatus(
        issueIds: string[],
        targetColumnId: string
    ) {
        try {
            const response = await fetch(
                `${getApiUrl()}/projects/${projectId}/issues/updateOrder`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        issueIds,
                        targetColumnId,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update task order and status");
            }

            console.log("Task order and status updated successfully");
        } catch (error) {
            console.error("Error updating task order and status:", error);
        }
    }

    // tasks의 상태와 위치를 임시로 바꿔서 시각적 피드백을 준다.
    function onDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;
        const activeId = active.id;
        const overId = over.id;
        if (activeId === overId) return;
        const isActiveATask = active.data.current?.type === "Task";
        const isOverATask = over.data.current?.type === "Task";
        const isOverAColumn = over.data.current?.type === "Column";
        if (!isActiveATask) return;
        if (isOverATask) {
            debouncedMoveTask(activeId, overId, "Task");
        } else if (isOverAColumn) {
            debouncedMoveTask(activeId, overId, "Column");
        }
    }

    function searchTasks(searchTerm: string) {
        const filteredTasks = allTasks.current.filter((task) =>
            task.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setTasks(filteredTasks);
    }

    async function getCurrentUser() {
        const current_user = await fetch(`${getApiUrl()}/user/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });
        if (!current_user.ok) {
            console.log(current_user);
            throw new Error("Failed to fetch current user");
        }
        const current_user_data = await current_user.json();
        console.log(current_user_data);
        setCurrent_user(current_user_data);
    }

    async function getProjectTitle() {
        console.log("getProjectTitle");

        const project_title = await fetch(
            `${getApiUrl()}/projects/${projectId}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            }
        );
        if (!project_title.ok) {
            console.log(
                "status",
                project_title.status,
                project_title.statusText
            );
            throw new Error("Failed to fetch project title");
        }
        const project_title_data = await project_title.json();
        const project_title_name = project_title_data.title;
        setProject_title_name(project_title_name);
    }
}

function generateId() {
    return Math.floor(Math.random() * 10001);
}

export default KanbanBoard;
