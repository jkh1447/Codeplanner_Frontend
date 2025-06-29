export type Id = string | number;

export type Column = {
    id: Id;
    title: string;
};

export type Task = {
    id: Id;
    project_id: Id;
    title: string;
    description: string;
    issue_type: string;
    status: string;
    assignee_id: Id;
    reporter_id: Id;
    start_date: string;
    due_date: string;
};

export type ColumnWithTasks = Column & {
    tasks: Task[];
};  