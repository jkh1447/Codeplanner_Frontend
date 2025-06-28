export type Id = string | number;

export type Column = {
    id: Id;
    title: string;
};

export type Task = {
    id: Id;
    content: string;
    columnId: Id;
};

export type ColumnWithTasks = Column & {
    tasks: Task[];
}; 