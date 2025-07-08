import TrashIcon from "@/components/icons/TrashIcon";
import { Column, Id, Task } from "@/components/type";
import React, { useMemo, useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import PlusIcon from "@/components/icons/PlusIcon";
import TaskCard from "./TaskCard";
import AddIssueModal from "./AddIssueModal";

interface Props {
    column: Column;
    projectId: string;
    deleteColumn: (id: Id) => void;
    updateColumn: (id: Id, title: string) => void;
    createTask: (formData: any) => void;
    updateTask: (id: Id, content: string) => void;
    deleteTask: (id: Id, projectId: string) => void;
    tasks: Task[];
    current_user: any;
    onSave?: () => void;
}

function ColumnContainer(props: Props) {
    const {
        column,
        projectId,
        deleteColumn,
        updateColumn,
        createTask,
        tasks,
        deleteTask,
        updateTask,
        current_user,
        onSave,
    } = props;

    const [editMode, setEditMode] = useState(false);

    const tasksIds = useMemo(() => {
        return tasks.map((task) => task.id);
    }, [tasks]);

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: column.id,
        data: {
            type: "Column",
            column,
        },
        disabled: true,
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
                className="bg-[#f8f8f8] opacity-40 border-[#1d4ed8] border-2 w-[350px] h-[3000px] max-h-[3000px] rounded-md flex flex-col"
            ></div>
        );
    }
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedColumn, setSelectedColumn] = useState("");

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-[#f8f8f8] w-[350px] h-[3000px] max-h-[3000px] rounded-md flex flex-col"
        >
            {/* Column title */}

            <div
                {...attributes}
                {...listeners}
                className="flex items-center justify-between bg-[#f8f8f8] text-md h-[60px] cursor-grab rounded-md rounded-b-none p-3 font-bold border-[#f8f8f8] border-4"
            >
                <div className="flex gap-2">
                    <div className="flex justify-center items-center bg-[#f8f8f8]  py-1 text-sm rounded-full"></div>

                    <span className="flex outline-none px-2">
                        {column.title} &nbsp;{" "}
                        <h6 className="bg-[#e9eaeb] px-2">{tasks.length}</h6>
                    </span>
                </div>
                {/* <button
                    onClick={() => {
                        deleteColumn(column.id);
                    }}
                    className="stroke-gray-500 hover:stroke-white hover:bg-gray-300 rounded px-1 py-2 "
                >
                    <TrashIcon />
                </button> */}
            </div>
            {/* Column task container */}
            <div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
                <SortableContext items={tasksIds}>
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            deleteTask={deleteTask}
                            projectId={projectId}
                                onSave={onSave}
                        />
                    ))}
                </SortableContext>

                {/* Add Task button inside the task container */}
                <button
                    className="flex gap-2 items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-md p-4 hover:bg-gray-100 hover:border-gray-400 transition-colors mt-2"
                    onClick={() => {
                        // createTask(column.id);
                        setIsModalOpen(true);
                        setSelectedColumn(column.id.toString());
                    }}
                >
                    <PlusIcon />
                    Add Task
                </button>
            </div>
            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-white bg-opacity-5 flex justify-center items-center z-50"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div onClick={(e) => e.stopPropagation()}>
                        <AddIssueModal
                            open={isModalOpen}
                            onOpenChange={setIsModalOpen}
                            selectedColumn={selectedColumn}
                            taskCount={tasks.length}
                            projectId={projectId}
                            createTask={createTask}
                            current_user={current_user}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default ColumnContainer;
