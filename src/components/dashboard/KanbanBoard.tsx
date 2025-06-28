"use client";

import PlusIcon from "@/src/icons/PlusIcon";
import { Column } from "@/src/type";
import React, { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import ColumnContainer from "./ColumnContainer";

function KanbanBoard() {
    const [columns, setColumns] = useState<Column[]>([]);
    const idCounter = useRef(1);
    console.log(columns);

    

    return (
        <div className="m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-[40px]">
            <div className="m-auto flex gap-4">
                <div className="flex gap-4">
                    {columns.map((col) => (
                        <ColumnContainer column={col} />
                    ))}
                </div>
                <button
                    onClick={() => {
                        createNewColumn();
                    }}
                    className="h-[60px] w-[350px] min-w-[350px] cursor-pointer rounded-lg bg-[#f8f8f8] border-2 border-gray-300 p-4 ring-rose-500 hover:ring-2 flex gap-2"
                >
                    <PlusIcon />
                    Add Column
                </button>
            </div>
        </div>
    );


    function generateId() {
        return Math.floor(Math.random() * 10001);
    }

    function createNewColumn() {
        const columnToAdd: Column = {
            id: generateId(),
            title: `Column ${columns.length + 1}`,
        };
        setColumns([...columns, columnToAdd]);
    }
}

export default KanbanBoard;
