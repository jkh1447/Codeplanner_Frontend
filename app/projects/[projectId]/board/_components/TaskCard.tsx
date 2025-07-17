import TrashIcon from "@/components/icons/TrashIcon";
import PlusIcon from "@/components/icons/PlusIcon";
import UserIcon from "@/components/icons/UserIcon";
import { Id, Task } from "@/components/type";
import { useSortable } from "@dnd-kit/sortable";
import React, { useEffect, useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import TaskDrawer from "../../list/common/TaskDrawer";
import { getApiUrl } from "@/lib/api";
import { Book, Bug, SquareCheckBig } from "lucide-react";
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

    const [assignee_display_name, setAssigneeDisplayName] =
        useState<string>("");

    const getAssigneeDisplayName = async () => {
        const res = await fetch(`${getApiUrl()}/user/${task.assignee_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        // 응답 body를 먼저 text로 읽음
        const text = await res.text();

        if (text) {
            // body가 비어있지 않으면 JSON 파싱
            try {
                const data = JSON.parse(text);
                setAssigneeDisplayName(data.displayName || "N/A");
                // console.log("assignee_display_name", data);
            } catch (e) {
                setAssigneeDisplayName("N/A");
                console.error("JSON 파싱 에러:", e);
            }
        } else {
            // body가 비어있으면 N/A로 처리
            setAssigneeDisplayName("N/A");
            // console.log("assignee_display_name: N/A (body empty)");
        }
    };

    useEffect(() => {
        getAssigneeDisplayName();
    }, []);

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    // 마감일에 따른 테두리 색상 결정 (색상 단계별)
    let borderClass = "border-gray-200 border"; // 기본: 여유 있음
    if (task.due_date) {
        const dueDate = parseISO(task.due_date);
        const today = new Date();
        const daysLeft = differenceInDays(dueDate, today);
        if (daysLeft <= 0) {
            borderClass = "border-red-600 border"; // 이미 연체/오늘
        } else if (daysLeft <= 3) {
            borderClass = "border-orange-400 border"; // 1~3일 임박
        } else if (daysLeft <= 7) {
            borderClass = "border-yellow-400 border"; // 4~7일 다가옴
        } else {
            borderClass = "border-gray-200 border"; // 8일 이상
        }
    }

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-white p-2.5 h-[120px] min-h-[120px] items-center flex flex-col justify-center rounded-xl border-2 border-blue-500 cursor-grab relative opacity-30"
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
                className={`bg-white p-3 min-h-[100px] flex flex-col rounded-xl shadow-md ${borderClass} hover:ring-2 hover:ring-inset hover:ring-blue-300 cursor-pointer relative group transition-all`}
                onMouseEnter={() => setMouseIsOver(true)}
                onMouseLeave={() => setMouseIsOver(false)}
                onClick={() => setShowDrawer(true)}
            >
                <div className="flex flex-col h-full min-h-[80px] relative">
                    <span
                        className="font-medium text-base text-gray-800 break-words whitespace-pre-line block"
                        style={{ wordBreak: "break-all" }}
                    >
                        {task.title}
                    </span>
                    {/* 레이블 뱃지 */}
                    {Array.isArray(task.labels) && task.labels.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {task.labels.map((label: any) => (
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
                    )}
                    {/* 담당자 표시 (오른쪽 하단, 담당자 있을 때만) */}
                    <div className="flex-1" />
                    
                    {/* IN_REVIEW 상태일 때 리뷰어 표시 */}
                    {task.status === "IN_REVIEW" && task.reviewers && task.reviewers.length > 0 && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                            <div className="text-xs font-semibold text-yellow-800 mb-1">리뷰어</div>
                            <div className="flex flex-wrap gap-1">
                                {task.reviewers.map((reviewer) => (
                                    <span
                                        key={reviewer.id}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium"
                                        title={reviewer.displayName}
                                    >
                                        <span className="w-4 h-4 rounded-full bg-yellow-300 flex items-center justify-center text-xs font-bold">
                                            {(reviewer.displayName || 'U').charAt(0).toUpperCase()}
                                        </span>
                                        <span className="truncate max-w-[60px]">
                                            {reviewer.displayName || 'Unknown'}
                                        </span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

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
                    {/* {mouseIsOver && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteTask(task.id, projectId);
                            }}
                            className="stroke-white absolute right-3 top-3 bg-gray-300 p-1.5 rounded hover:bg-red-400 hover:stroke-white opacity-80 hover:opacity-100 transition"
                        >
                            <TrashIcon />
                        </button>
                    )} */}
                </div>
                {/* <div className="absolute bottom-3 right-3">
                    <div className="border-2 px-2 py-1 border-white shadow bg-gray-200 flex items-center justify-center">
                        {assignee_display_name ? assignee_display_name : "N/A"}
                    </div>
                </div> */}
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
