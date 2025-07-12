"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Header from "../../../components/header";
import { getApiUrl } from "@/lib/api";
import GitHubConnector from "./github_connector";

// 프로젝트 데이터 타입 정의
interface Project {
  id: number;
  name: string;
  status: "진행중" | "완료" | "대기중" | "보류";
  assignee: string;
  dueDate: string;
  description: string;
  people: number;
}

async function createRepoOnGitHub({
  repoName,
  description,
  isPrivate
}: {
  repoName: string;
  description: string;
  isPrivate: boolean;
}): Promise<string> {
  const res = await fetch(`${getApiUrl()}/github/create-repo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ repoName, description, isPrivate })
  });
  if (!res.ok) {
    const text = await res.text();
    let msg = text;
    try { msg = JSON.parse(text).message; } catch { }
    throw new Error(`GitHub 저장소 생성 실패: ${msg}`);
  }
  const { repositoryUrl } = await res.json();
  return repositoryUrl;
}
// 프로젝트 목록 컴포넌트
export default function ProjectList() {
    const [projects, setProjects] = useState<Project[]>([]);
    const overlayMouseDown = useRef(false);
    useEffect(() => {
        console.log("백엔드 서버에 연결 시도 중...");
        fetch(`${getApiUrl()}/projects`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => {
                console.log("응답 상태:", res.status, res.statusText);
                console.log("응답 헤더:", res.headers);
                if (!res.ok) {
                    throw new Error(
                        `HTTP error! status: ${res.status} ${res.statusText}`
                    );
                }
                return res.json();
            })
            .then((data) => {
                console.log("백엔드에서 데이터를 성공적으로 받았습니다:", data);
                // 데이터가 없거나 빈 배열인 경우 처리
        if (!data || !Array.isArray(data) || data.length === 0) {
          console.log("백엔드에서 데이터가 없습니다.");
          return;
        }

        // 백엔드 데이터를 프론트엔드 형식으로 변환
        const transformedProjects: Project[] = data.map((project: any) => ({
          id: project.id,
          name: project.title ?? project.name ?? "",
          status: project.status,
          assignee: project.project_leader ?? project.assignee ?? "",
          dueDate: project.due_date ?? project.dueDate ?? "",
          description: project.description ?? project.description ?? "",
          people: project.project_people ?? project.people ?? 0,
        }));

        console.log("변환된 프로젝트:", transformedProjects);
        setProjects(transformedProjects);
      })
      .catch((error) => {
        console.error("상세 에러 정보:", error);
        console.warn("백엔드 서버 연결 실패", error);
        console.log("백엔드 서버가 실행되지 않았습니다.");
      });
  }, []);

  // 검색 및 필터링 상태 관리
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "status" | "dueDate">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showCreateModal, setShowCreateModal] = useState(false);
  // const [showEditModal, setShowEditModal] = useState(false)
  // const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [newProject, setNewProject] = useState({
    name: "",
    assignee: "",
    dueDate: "",
    description: "",
    repository_url: "",
    tag: "",
    createRepo: false,
    orgName: "",
    isPrivate: false,
  });

  // 상태 관리 함수
  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "진행중":
        return "bg-blue-100 text-blue-800";
      case "완료":
        return "bg-green-100 text-green-800";
      case "대기중":
        return "bg-yellow-100 text-yellow-800";
      case "보류":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // 검색 및 필터링 적용
  const filteredAndSortedProjects = projects
    .filter(
      (project) =>
        (project.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.assignee ?? "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (project.description ?? "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === "dueDate") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // 프로젝트 생성 함수
  const handleCreateProject = async () => {
    if (newProject.name && newProject.dueDate) {
      let finalRepositoryUrl = newProject.repository_url;
      
      // GitHub 저장소 생성이 필요한 경우
      if (newProject.createRepo && newProject.name) {
        try {
          console.log("GitHub 저장소 생성 중...");
          const repoName = newProject.name.replace(/\s+/g, '-').toLowerCase();
          const repoDescription = newProject.description || `Project: ${newProject.name}`;
          
          const createdRepoUrl = await createRepoOnGitHub({
            repoName,
            description: repoDescription,
            isPrivate: newProject.isPrivate
          });
          
          finalRepositoryUrl = createdRepoUrl;
          console.log("GitHub 저장소 생성 완료:", createdRepoUrl);
        } catch (error) {
          console.error("GitHub 저장소 생성 실패:", error);
          alert(`GitHub 저장소 생성에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
          return;
        }
      }

      const payload = {
        title: newProject.name,
        description: newProject.description,
        status: "대기중",
        project_people: 1, // 실제 인원 입력 구조 있으면 바꾸세요
        due_date: newProject.dueDate,
        tag: newProject.tag,
        repository_url: finalRepositoryUrl,
      };
      
      try {
        console.log("백엔드 서버에 프로젝트 생성 요청 중...");
        console.log("전송할 데이터:", payload);
        
        const res = await fetch(`${getApiUrl()}/projects/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        });

        console.log("POST 응답 상태:", res.status, res.statusText);
        console.log("POST 응답 헤더:", res.headers);

        if (res.ok) {
          const created = await res.json();
          console.log(
            "백엔드에서 프로젝트가 성공적으로 생성되었습니다:",
            created
          );
          setProjects((prev) => [
            ...prev,
            {
              id: created.id,
              name: created.title,
              description: created.description,
              status: created.status,
              assignee: created.project_leader,
              dueDate: created.due_date,
              people: created.project_people,
            },
          ]);
          setNewProject({
            name: "",
            assignee: "",
            dueDate: "",
            description: "",
            tag: "",
            repository_url: "",
            createRepo: false,
            orgName: "",
            isPrivate: false,
          });
          setShowCreateModal(false);
          alert("프로젝트가 성공적으로 생성되었습니다!");
        } else {
          const errorText = await res.text();
          console.error("서버 응답 에러:", errorText);
          console.error("응답 상태:", res.status, res.statusText);
          throw new Error(
            `HTTP error! status: ${res.status} ${res.statusText}`
          );
        }
      } catch (err) {
        console.error("상세 POST 에러 정보:", err);
        console.warn("백엔드 서버 연결 실패", err);
        setProjects((prev) => [...prev]);
        setNewProject({
          name: "",
          assignee: "",
          dueDate: "",
          description: "",
          tag: "",
          repository_url: "",
          createRepo: false,
          orgName: "",
          isPrivate: false,
        });
        setShowCreateModal(false);
      }
    } else {
      alert("필수 필드를 모두 입력해주세요.");
    }
  };



  // 프로젝트 목록 컴포넌트 반환
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* 검색 및 필터링 바 */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              style={{ backgroundColor: "#64748b" }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              새 프로젝트
            </button>

            <div className="flex-1 max-w-md">
              <div className="relative">
                <svg
                  className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>

                <input
                  type="text"
                  placeholder="프로젝트 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name">이름순</option>
                <option value="status">상태순</option>
                <option value="dueDate">마감일순</option>
              </select>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        </div>

        {/* 프로젝트 그리드 시작 */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}/summary`}
              className="group relative bg-white rounded-2xl border border-slate-200/60 p-8 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 hover:border-slate-300/80 hover:-translate-y-1 overflow-hidden cursor-pointer"
            >
              {/* 프로젝트 그리드 내부 그라데이션 오버레이 */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* 프로젝트 그리드 내부 컨텐츠 */}
              <div className="relative z-10">
                {/* 프로젝트 그리드 내부 헤더 */}
                <div className="flex items-start justify-between mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 line-clamp-2 flex-1 mr-4 group-hover:text-slate-800 transition-colors">
                    {project.name}
                  </h3>
                  <span
                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap shadow-sm ${getStatusColor(
                      project.status
                    )} group-hover:shadow-md transition-shadow`}
                  >
                    {project.status}
                  </span>
                </div>

                {/* 프로젝트 그리드 내부 설명 */}
                <p className="text-slate-600 text-base mb-8 line-clamp-3 leading-relaxed group-hover:text-slate-700 transition-colors">
                  {project.description}
                </p>

                {/* 프로젝트 그리드 내부 하단 섹션 */}
                <div className="flex items-center justify-between">
                  {/* 프로젝트 그리드 내부 왼쪽 섹션 */}
                  <div className="flex items-center gap-4 text-slate-500 text-sm">
                    {/* 프로젝트 그리드 내부 팀 인원 */}
                    <div className="flex items-center gap-1.5">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>{project.people}명</span>
                    </div>

                    {/* 프로젝트 그리드 내부 마감일 */}
                    <div className="flex items-center gap-1.5">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>{project.dueDate}</span>
                    </div>
                  </div>

                  {/* 프로젝트 그리드 내부 담당자 */}
                  <span className="text-slate-500 text-sm">
                    {project.assignee}
                  </span>
                </div>
              </div>

              {/* 프로젝트 그리드 내부 데코레이티브 코너 악센트 */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          ))}
        </div>

        {/* 검색 결과가 없을 때 */}
        {filteredAndSortedProjects.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-slate-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-slate-500">검색 결과가 없습니다.</p>
          </div>
        )}
        {/* 페이지 헤더 끝*/}

        {/* 프로젝트 생성 모달 */}
        {showCreateModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onMouseDown={e => {
              if (e.target === e.currentTarget) overlayMouseDown.current = true;
            }}
            onMouseUp={e => {
              if (e.target === e.currentTarget && overlayMouseDown.current) {
                setShowCreateModal(false);
              }
              overlayMouseDown.current = false;
            }}
          >
            <div className="bg-white rounded-lg max-w-md w-full flex flex-col p-0" onClick={e => e.stopPropagation()}>
              {/* 헤더 고정 */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b">
                <h2 className="text-xl font-semibold text-slate-800">
                  새 프로젝트 생성
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              {/* 내용 스크롤 영역 */}
              <div className="flex-1 overflow-y-auto max-h-[60vh] px-6 py-4 scrollbar-hide">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      프로젝트 이름
                    </label>
                    <input
                      type="text"
                      value={newProject.name}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="프로젝트 이름을 입력하세요"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      마감일
                    </label>
                    <input
                      type="date"
                      value={newProject.dueDate}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          dueDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      설명
                    </label>
                    <textarea
                      value={newProject.description}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="프로젝트 설명을 입력하세요"
                    />
                  </div>

                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 ">
                      프로젝트 태그 
                    </label>
                    <input
                      type="text"
                      value={newProject.tag}
                      onChange={(e) => {
                        const value = e.target.value;
                        // 영어(대소문자)와 공백만 허용
                        if (/^[a-zA-Z\s]*$/.test(value)) {
                          setNewProject({
                            ...newProject,
                            tag: value,
                          });
                        }
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="태그를 입력하세요(영어만 입력 가능)."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      GitHub 저장소
                    </label>
                    <GitHubConnector setRepositoryUrl={(url) => setNewProject({...newProject, repository_url: url})} />
                  </div>
                </div>
              </div>
              {/* 바텀 버튼 고정 */}
              <div className="flex gap-3 px-6 pb-6 pt-4 border-t bg-white sticky bottom-0 rounded-b-lg">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleCreateProject}
                  className="flex-1 px-4 py-2 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  style={{ backgroundColor: "#64748b" }}>
                  생성
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
