// "use client";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react";
// import { Task, User } from "@/components/type";
// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";



// export default function MyIssuesPage() {
//   const [issues, setIssues] = useState<Task[]>([]);
//   const [users, setUsers] = useState<User[]>([]);
//   const params = useParams();
//   const projectId = params?.projectId as string;

//   useEffect(() => {
//     fetch(`http://localhost:5000/api/projects/${projectId}`)
//   })

//     return (
//         <div className="space-y-6 p-6">
//             <div>
//                 <h1 className="text-3xl font-bold">내 이슈</h1>
//                 <p className="text-muted-foreground">내가 담당하는 이슈들을 관리하세요</p>
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 <Card>
//                     <CardHeader>
//                         <CardTitle className="flex items-center gap-2">
//                             <AlertCircle className="h-5 w-5 text-yellow-500" />
//                             로그인 기능 개선
//                         </CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                         <p className="text-sm text-muted-foreground mb-3">
//                             사용자 로그인 시 보안 강화 및 UX 개선이 필요합니다.
//                         </p>
//                         <div className="flex items-center justify-between">
//                             <Badge variant="secondary">High Priority</Badge>
//                             <span className="text-xs text-muted-foreground">2일 전</span>
//                         </div>
//                     </CardContent>
//                 </Card>

//                 <Card>
//                     <CardHeader>
//                         <CardTitle className="flex items-center gap-2">
//                             <Clock className="h-5 w-5 text-blue-500" />
//                             데이터베이스 최적화
//                         </CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                         <p className="text-sm text-muted-foreground mb-3">
//                             쿼리 성능 개선 및 인덱스 최적화 작업이 필요합니다.
//                         </p>
//                         <div className="flex items-center justify-between">
//                             <Badge variant="outline">Medium Priority</Badge>
//                             <span className="text-xs text-muted-foreground">1주 전</span>
//                         </div>
//                     </CardContent>
//                 </Card>

//                 <Card>
//                     <CardHeader>
//                         <CardTitle className="flex items-center gap-2">
//                             <CheckCircle className="h-5 w-5 text-green-500" />
//                             UI 컴포넌트 리팩토링
//                         </CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                         <p className="text-sm text-muted-foreground mb-3">
//                             재사용 가능한 컴포넌트로 리팩토링이 완료되었습니다.
//                         </p>
//                         <div className="flex items-center justify-between">
//                             <Badge variant="default">Completed</Badge>
//                             <span className="text-xs text-muted-foreground">3일 전</span>
//                         </div>
//                     </CardContent>
//                 </Card>
//             </div>
//         </div>
//     );
// } 

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/components/type";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getApiUrl } from "@/lib/api";

export default function MyIssuesPage() {
  const [issues, setIssues] = useState<Task[]>([]);
  const params = useParams();
  const projectId = params?.projectId as string;

  useEffect(() => {
    fetch(`${getApiUrl()}/projects/${projectId}/my-issues`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data: Task[]) => {setIssues(data)
        console.log("넣어진 데이터: ", data);
      });
  }, [projectId]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">내 이슈</h1>
        <p className="text-muted-foreground">내가 담당하는 이슈들을 관리하세요</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {issues.length === 0 ? (
          <div className="col-span-3 text-center text-gray-400 py-8">내 이슈가 없습니다.</div>
        ) : (
          issues.map((issue) => (
            <Card key={issue.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {issue.status === "DONE" ? "✅" : issue.status === "INPROGRESS" ? "🕒" : "⚠️"}
                  {issue.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{issue.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{issue.issue_type}</Badge>
                  <span className="text-xs text-muted-foreground">{issue.due_date || "-"}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}