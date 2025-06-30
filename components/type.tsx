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
    position: number;
};

export type ColumnWithTasks = Column & {
    tasks: Task[];
};

// DB 스키마 기반 타입 추가ㄴㅁㅇ래ㅑㅓㄴㅁ애랴ㅓㅁㄷ내ㅑ러
export type Issue = {
  id: Id;
  project_id: Id;
  title: string;
  description?: string;  
  issue_type: "bug" | "task" | "story";
  status: "TODO" | "INPROGRESS" | "DONE";
  assignee_id?: Id;
  reporter_id: Id;
  start_date?: string;
  due_date?: string;
};

export type User = {
  id: Id;
  email: string;
  display_name: string;
};

export type Label = {
  id: Id;
  name: string;
};

export type Comment = {
  id: Id;
  issue_id: Id;
  author_id: Id;
  content: string;
  created_at: string;
  updated_at: string;
};  