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
    tag: string;
};

export type ColumnWithTasks = Column & {
    tasks: Task[];
};

// DB 스키마 기반 타입 추가
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
  display_name: string;
  email: string;
  role: string;
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

export type Project = {
  id: Id;
  title: string;
  description: string;
  due_date: string;
  expires_at: string | null;
  leader_id: Id;
  project_key: string;
  project_leader: string;
  project_people: number;
  repository_url: string;
  status: "진행중" | "완료" | "대기중" | "보류";
};



export type Notification_issue = {
  issueId: string;
  issueTitle: string;
  projectName: string;
  projectId: string;
  createdAt: string;
};



export type Issue_detail = {
    id: Id;
    projectId: Id;
    title: string;
    description?: string;
    issueType: "bug" | "task" | "story";
    status: "TODO" | "IN_PROGRESS" | "DONE";
    assigneeId?: Id;
    reporterId: Id;
    startDate?: string;
    dueDate?: string;
};

export type User_detail = {
    id: string;
    displayName: string;
    
};

