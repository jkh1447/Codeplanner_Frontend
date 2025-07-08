import "./page.css";
import { getApiUrl } from "@/lib/api";
import IssueDetail from "./_components/issue";

export default async function Page({}: {}) {
    return (
        <div className="min-h-screen p-5">
            <div className="text-slate-600 mt-2">
                <IssueDetail />
            </div>
        </div>
    );
}
