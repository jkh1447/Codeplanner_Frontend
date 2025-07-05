import TrashIcon from "@/components/icons/TrashIcon";
import PlusIcon from "@/components/icons/PlusIcon";
import UserIcon from "@/components/icons/UserIcon";
import { Id, Task } from "@/components/type";
import { useSortable } from "@dnd-kit/sortable";
import React, { useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import TaskDrawer from "../../list/common/TaskDrawer";

interface Props {
    task: Task;
    deleteTask: (id: Id, projectId: string) => void;
    projectId: string;
}

function TaskCard({ task, deleteTask, projectId }: Props) {
    const [mouseIsOver, setMouseIsOver] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false);

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

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

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
                className="bg-white p-3 min-h-[100px] flex flex-col rounded-xl shadow-md border border-gray-200 hover:ring-2 hover:ring-inset hover:ring-blue-300 cursor-pointer relative group transition-all"
                onMouseEnter={() => setMouseIsOver(true)}
                onMouseLeave={() => setMouseIsOver(false)}
                onClick={() => setShowDrawer(true)}
            >
                <div className="flex flex-col h-full min-h-[120px] relative">
                    <span
                        className="font-semibold text-base text-gray-800 break-words whitespace-pre-line block"
                        style={{ wordBreak: "break-all" }}
                    >
                        {task.title}
                    </span>
                    <div className="flex-1" />
                    <div className="flex items-end">
                        <span className="px-3 py-1 rounded-full bg-purple-200 text-purple-800 text-sm font-semibold">
                            {task.tag}
                        </span>
                    </div>
                    {mouseIsOver && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteTask(task.id, projectId);
                            }}
                            className="stroke-white absolute right-3 top-3 bg-gray-300 p-1.5 rounded hover:bg-red-400 hover:stroke-white opacity-80 hover:opacity-100 transition"
                        >
                            <TrashIcon />
                        </button>
                    )}
                </div>
                <div className="absolute bottom-3 right-3">
                    <div className="w-7 h-7 rounded-full border-2 border-white shadow bg-gray-200 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-gray-500" />
                    </div>
                </div>
            </div>
            {showDrawer && (
                <TaskDrawer task={task} onClose={() => setShowDrawer(false)} />
            )}
        </>
    );
}

export default TaskCard;
