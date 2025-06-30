import KanbanBoard from "./_components/KanbanBoard";
import { Task } from "@/components/type";
import "./page.css";

export default async function Page({params}: {params: {projectId: string}}) {
    const { projectId } = await params;
    console.log(projectId);

    const res = await fetch(
        `http://localhost:5000/api/projects/${projectId}/issues`,
        { next: { revalidate: 60 } }
    );
    if (!res.ok) {
        console.log(res);
        throw new Error("Failed to fetch issues");
    }
    const issues: Task[] = await res.json();

    return (
        <div className="min-h-screen p-8">
            <h1 className="text-2xl font-bold text-slate-800">프로젝트 Demo</h1>
            <div className="text-slate-600 mt-2">
                <KanbanBoard issues={issues} projectId={projectId} />
            </div>
        </div>
    );
}
