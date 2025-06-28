import KanbanBoard from "@/src/components/dashboard/board/KanbanBoard";
import "./page.css";

export default function Page() {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-slate-800">프로젝트 Demo</h1>
            <p className="text-slate-600 mt-2">
                <KanbanBoard/>
            </p>
        </div>
    );
}
