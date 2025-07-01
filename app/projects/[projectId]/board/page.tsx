import KanbanBoard from "./_components/KanbanBoard";
import { Task } from "@/components/type";
import "./page.css";
import { getApiUrl } from "@/lib/api";

export default async function Page({params}: {params: {projectId: string}}) {
    const { projectId } = params;
    let issues: Task[] = [];
    let fetchError = null;
    try {
        const res = await fetch(
            `${getApiUrl()}/projects/${projectId}/issues`,
            { next: { revalidate: 60 } }
        );
        if (!res.ok) {
            const errorText = await res.text();
            console.error('API Error:', res.status, errorText);
            fetchError = `이슈 데이터를 불러오지 못했습니다. (status: ${res.status})`;
        } else {
            issues = await res.json();
        }
    } catch (e) {
        console.error('Fetch Error:', e);
        fetchError = '이슈 데이터를 불러오는 중 서버 오류가 발생했습니다.';
    }

    if (fetchError) {
        return (
            <div className="min-h-screen p-8">
                <h1 className="text-2xl font-bold text-red-600">프로젝트 Demo</h1>
                <div className="text-red-500 mt-2">{fetchError}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8">
            <h1 className="text-2xl font-bold text-slate-800">프로젝트 Demo</h1>
            <div className="text-slate-600 mt-2">
                <KanbanBoard issues={issues} projectId={projectId} />
            </div>
        </div>
    );
}
