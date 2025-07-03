import KanbanBoard from "./_components/KanbanBoard";
import { Task } from "@/components/type";
import "./page.css";
import { getApiUrl } from "@/lib/api";


export default async function Page({
    params,
}: {
    params: { projectId: string };
}) {
    const { projectId } = await params;
    console.log(projectId);

    // const res = await fetch(`${getApiUrl()}/projects/${projectId}/issues`, {
    //     next: { revalidate: 60 },
    // });
    // if (!res.ok) {
    //     console.log(res);
    //     throw new Error("Failed to fetch issues");
    // }
    // const issues: Task[] = await res.json();

        
    
    return (
        <div className="min-h-screen p-5">
            
            <div className="text-slate-600 mt-2">
                <KanbanBoard  projectId={projectId}  />
                {/* <Board /> */}
            </div>
        </div>
    );
}
