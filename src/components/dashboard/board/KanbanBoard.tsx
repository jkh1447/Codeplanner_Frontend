"use client";

import PlusIcon from "@/src/icons/PlusIcon";
import { Column, Id, Task } from "@/src/type";
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

function KanbanBoard({
    issues,
    projectId,
}: {
    issues: Task[];
    projectId: string;
}) {
    const [columns, setColumns] = useState<Column[]>([
        {
            id: "TODO",
            title: "Todo",
        },
        {
            id: "IN_PROGRESS",
            title: "In Progress",
        },
        {
            id: "DONE",
            title: "Done",
        },
    ]);
    const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);
    const [isClient, setIsClient] = useState(false);

    const [tasks, setTasks] = useState<Task[]>(issues);

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
    async function fetchLatestTasks() {
        try {
            const response = await fetch(
                `http://localhost:5000/api/projects/${projectId}/issues`
            );
            if (response.ok) {
                const latestTasks = await response.json();
                setTasks(latestTasks);
            }
        } catch (error) {
            console.error("Error fetching latest tasks:", error);
        }
    }

    // 컴포넌트 마운트 시 또는 projectId 변경 시 최신 데이터 가져오기
    useEffect(() => {
        if (isClient && projectId) {
            fetchLatestTasks();
        }
    }, [isClient, projectId]);

    // 초기 데이터 설정 (서버에서 가져온 데이터가 없을 때만)
    useEffect(() => {
        if (issues && issues.length > 0 && tasks.length === 0) {
            setTasks(issues);
        }
    }, [issues, tasks.length]);

    

    return (
        <>
            <BoardMenu />
            <div className="w-full overflow-x-auto overflow-y-hidden">
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
                                            tasks={tasks.filter(
                                                (task) => task.status === col.id
                                            )}
                                            deleteTask={deleteTask}
                                            updateTask={updateTask}
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
                                    />
                                )}
                                {activeTask && (
                                    <TaskCard
                                        task={activeTask}
                                        deleteTask={deleteTask}
                                        updateTask={updateTask}
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
                        <button className="h-[60px] w-[350px] min-w-[350px] cursor-pointer rounded-lg bg-[#f8f8f8] border-2 border-gray-300 p-4 ring-rose-500 hover:ring-2 flex gap-2 flex-shrink-0">
                            <PlusIcon />
                            Add Column
                        </button>
                    </div>
                )}
            </div>
        </>
    );

    function createTask(columnId: Id) {
        const newTask: Task = {
            id: generateId(),
            project_id: projectId,
            title: "2",
            description: "3",
            issue_type: "4",
            status: columnId as string,
            assignee_id: "5",
            reporter_id: "6",
            start_date: "7",
            due_date: "8",
        };
        setTasks([...tasks, newTask]);
    }

    function deleteTask(id: Id) {
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

    function onDragEnd(event: DragEndEvent) {
        setActiveColumn(null);
        setActiveTask(null);
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        // Column 드래그만 처리
        const isActiveColumn = active.data.current?.type === "Column";
        const isOverColumn = over.data.current?.type === "Column";

        if (isActiveColumn && isOverColumn) {
            setColumns((columns) => {
                const activeColumnIndex = columns.findIndex(
                    (col) => col.id === activeId
                );
                const overColumnIndex = columns.findIndex(
                    (col) => col.id === overId
                );

                return arrayMove(columns, activeColumnIndex, overColumnIndex);
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
                `http://localhost:5000/api/projects/${projectId}/issues/updateOrder`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
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

    function onDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;
        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveATask = active.data.current?.type === "Task";
        const isOverTask = over.data.current?.type === "Task";

        if (!isActiveATask) return;

        if (isActiveATask && isOverTask) {
            setTasks((tasks) => {
                console.log("onDragOver1");
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                const overIndex = tasks.findIndex((t) => t.id === overId);

                tasks[activeIndex].status = tasks[overIndex].status;

                const newTasks = arrayMove(tasks, activeIndex, overIndex);

                // 같은 Column 내에서 순서 변경된 경우
                const targetColumnId = newTasks[activeIndex].status;
                const issueIds = newTasks
                    .filter((task) => task.status === targetColumnId)
                    .map((task) => task.id.toString());

                // 서버에 업데이트
                updateTaskOrderAndStatus(issueIds, targetColumnId);

                return newTasks;
            });
        }

        const isOverAColumn = over.data.current?.type === "Column";

        if (isActiveATask && isOverAColumn) {
            setTasks((tasks) => {
                console.log("onDragOver2");
                const activeIndex = tasks.findIndex((t) => t.id === activeId);

                tasks[activeIndex].status = overId as string;

                const newTasks = arrayMove(tasks, activeIndex, activeIndex);

                // 새로운 Column의 모든 Task ID를 수집
                const targetColumnId = overId.toString();
                const issueIds = newTasks
                    .filter((task) => task.status === targetColumnId)
                    .map((task) => task.id.toString());

                // 서버에 업데이트
                updateTaskOrderAndStatus(issueIds, targetColumnId);

                return newTasks;
            });
        }
    }
}

function generateId() {
    return Math.floor(Math.random() * 10001);
}

export default KanbanBoard;
