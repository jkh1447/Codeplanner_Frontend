import TrashIcon from "@/components/icons/TrashIcon";
import PlusIcon from "@/components/icons/PlusIcon";
import UserIcon from "@/components/icons/UserIcon";
import { Id, Task } from "@/components/type";
import { useSortable } from "@dnd-kit/sortable";
import React, { useEffect, useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import TaskDrawer from "../../list/common/TaskDrawer";
import { getApiUrl } from "@/lib/api";
import { Book, Bug, SquareCheckBig, Calendar, AlertTriangle } from 'lucide-react';
import { differenceInDays, parseISO } from "date-fns";

interface Props {
    task: Task;
    deleteTask: (id: Id, projectId: string) => void;
    projectId: string;
    onSave?: () => void;
}

function TaskCard({ task, deleteTask, projectId, onSave }: Props) {
    const [mouseIsOver, setMouseIsOver] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false);
    const [currentUserName, setCurrentUserName] = useState("");

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: "Task",
            task,
        },
        disabled: false,
    });

    const [assignee_display_name, setAssigneeDisplayName] = useState<string>("");

    const getAssigneeDisplayName = async () => {
        const res = await fetch(`${getApiUrl()}/user/${task.assignee_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        
        const text = await res.text();
        if (text) {
            try {
                const data = JSON.parse(text);
                setAssigneeDisplayName(data.displayName || "N/A");
            } catch (e) {
                setAssigneeDisplayName("N/A");
                console.error("JSON 파싱 에러:", e);
            }
        } else {
            setAssigneeDisplayName("N/A");
        }
    };

    useEffect(() => {
        getAssigneeDisplayName();
    }, [task.assignee_id]);

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    // 마감일에 따른 스타일 결정 (왼쪽 테두리 + 배경색)
    const getUrgencyStyle = () => {
        if (task.status === "DONE") return "bg-white hover:bg-gray-50";
        if (!task.due_date) return "bg-white hover:bg-gray-50";

        const dueDate = parseISO(task.due_date);
        const today = new Date();
        const daysLeft = differenceInDays(dueDate, today);

        if (daysLeft <= 1) {
            return "border-l-4 border-l-red-500 bg-red-50 hover:bg-red-100";
        } else if (daysLeft <= 3) {
            return "border-l-4 border-l-yellow-500 bg-yellow-50 hover:bg-yellow-100";
        }
        
        return "bg-white hover:bg-gray-50";
    };

    // 마감일 뱃지 생성
    const getUrgencyBadge = () => {
        if (!task.due_date || task.status === "DONE") return null;

        const dueDate = parseISO(task.due_date);
        const today = new Date();
        const daysLeft = differenceInDays(dueDate, today);

        if (daysLeft <= 1) {
            return (
                <div className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded-full text-xs font-semibold">
                    <AlertTriangle className="w-3 h-3" />
                    마감
                </div>
            );
        } else if (daysLeft <= 2) {
            return (
                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500 text-white rounded-full text-xs font-semibold">
                    <Calendar className="w-3 h-3" />
                    {daysLeft}일 남음
                </div>
            );
        }

        return (
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">
                <Calendar className="w-3 h-3" />
                {daysLeft}일 남음
            </div>
        );
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className={`${getUrgencyStyle()} p-2.5 h-[120px] min-h-[120px] items-center flex flex-col justify-center rounded-xl border-2 border-blue-500 cursor-grab relative opacity-30`}
            />
        );
    }

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                className={`${getUrgencyStyle()} p-3 min-h-[100px] flex flex-col rounded-xl shadow-md hover:ring-2 hover:ring-inset hover:ring-blue-300 cursor-pointer relative group transition-all`}
                onMouseEnter={() => setMouseIsOver(true)}
                onMouseLeave={() => setMouseIsOver(false)}
                onClick={() => setShowDrawer(true)}
            >
                <div className="flex flex-col h-full min-h-[80px] relative">
                    <div className="flex items-start justify-between mb-2">
                        <span
                            className="font-medium text-base text-gray-800 break-words whitespace-pre-line block flex-1"
                            style={{ wordBreak: "break-all" }}
                        >
                            {task.title}
                        </span>
                        {/* getUrgencyBadge() 제거됨 */}
                    </div>

                    {/* 레이블 뱃지 + 마감일 뱃지 한 줄에 배치 (항상 같은 줄) */}
                    {(Array.isArray(task.labels) && task.labels.length > 0) || task.due_date ? (
                        <div className="flex flex-row items-center mt-2 w-full min-h-[1.5rem]">
                            {/* 레이블 뱃지 (왼쪽) */}
                            <div className="flex flex-wrap gap-2">
                                {Array.isArray(task.labels) && task.labels.length > 0 &&
                                    task.labels.map((label: any) => (
                                        <span
                                            key={label.id.toString()}
                                            className="px-2 py-0.5 rounded text-xs font-semibold"
                                            style={{
                                                backgroundColor: label.color,
                                                color: "#fff",
                                                minWidth: "2rem",
                                                display: "inline-block",
                                            }}
                                        >
                                            {label.name}
                                        </span>
                                    ))}
                            </div>
                            {/* 마감일 뱃지 (오른쪽) */}
                            {task.due_date && task.status !== "DONE" && (
                                <span className="ml-auto">{getUrgencyBadge()}</span>
                            )}
                        </div>
                    ) : null}

                    {/* 담당자 표시 (오른쪽 하단, 담당자 있을 때만) */}
                    <div className="flex-1" />
                    <div className="flex items-end justify-between mt-2">
                        <span className="flex items-center gap-1 py-1 rounded-full text-xs font-semibold">
                            {task.issue_type === "task" && (
                                <SquareCheckBig
                                    className="w-5 h-5 mr-1"
                                    color={"#3729ff"}
                                />
                            )}
                            {task.issue_type === "story" && (
                                <Book
                                    className="w-5 h-5 mr-1"
                                    color="#ff9500"
                                />
                            )}
                            {task.issue_type === "bug" && (
                                <Bug className="w-5 h-5 mr-1" color="#ff0000" />
                            )}
                            {task.tag}
                        </span>
                        {assignee_display_name &&
                            assignee_display_name !== "N/A" && (
                                <div className="flex items-center gap-2">
                                    <span
                                        className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-bold"
                                        title={assignee_display_name}
                                    >
                                        {assignee_display_name[0]}
                                    </span>
                                    <span className="text-xs text-gray-700 font-bold truncate max-w-[80px]">
                                        {assignee_display_name}
                                    </span>
                                </div>
                            )}
                    </div>
                </div>
            </div>
            {showDrawer && (
                <TaskDrawer
                    task={task}
                    onClose={() => setShowDrawer(false)}
                    onSave={onSave}
                />
            )}
        </>
    );
}

export default TaskCard;