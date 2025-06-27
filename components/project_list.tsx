"use client"

import { useState } from "react"
import Header from "./header"

interface Project {
  id: number
  name: string
  status: "진행중" | "완료" | "대기중" | "보류"
  priority: "높음" | "보통" | "낮음"
  assignee: string
  dueDate: string
  issues: number
  codeQuality: number
  description: string
}

const mockProjects: Project[] = [
  {
    id: 1,
    name: "사용자 인증 시스템",
    status: "진행중",
    priority: "높음",
    assignee: "김개발",
    dueDate: "2024-01-15",
    issues: 3,
    codeQuality: 92,
    description: "JWT 기반 로그인/회원가입 시스템 구현",
  },
  {
    id: 2,
    name: "결제 모듈 개발",
    status: "완료",
    priority: "높음",
    assignee: "이코드",
    dueDate: "2024-01-10",
    issues: 0,
    codeQuality: 95,
    description: "PG사 연동 및 결제 프로세스 구현",
  },
  {
    id: 3,
    name: "관리자 대시보드",
    status: "대기중",
    priority: "보통",
    assignee: "박프론트",
    dueDate: "2024-01-20",
    issues: 1,
    codeQuality: 88,
    description: "관리자용 통계 및 관리 페이지",
  },
  {
    id: 4,
    name: "모바일 앱 최적화",
    status: "보류",
    priority: "낮음",
    assignee: "최모바일",
    dueDate: "2024-01-25",
    issues: 5,
    codeQuality: 76,
    description: "반응형 디자인 및 성능 최적화",
  },
  {
    id: 5,
    name: "API 문서화",
    status: "진행중",
    priority: "보통",
    assignee: "정백엔드",
    dueDate: "2024-01-18",
    issues: 2,
    codeQuality: 90,
    description: "Swagger를 이용한 API 문서 자동화",
  },
]

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "status" | "priority" | "dueDate" | "codeQuality">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [newProject, setNewProject] = useState({
    name: "",
    assignee: "",
    dueDate: "",
    priority: "보통" as const,
    description: "",
  })

  // Utility functions
  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "진행중":
        return "bg-blue-100 text-blue-800"
      case "완료":
        return "bg-green-100 text-green-800"
      case "대기중":
        return "bg-yellow-100 text-yellow-800"
      case "보류":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: Project["priority"]) => {
    switch (priority) {
      case "높음":
        return "bg-red-100 text-red-800"
      case "보통":
        return "bg-yellow-100 text-yellow-800"
      case "낮음":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCodeQualityColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  const filteredAndSortedProjects = projects
    .filter(
      (project) =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.assignee.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      let aValue: any = a[sortBy]
      let bValue: any = b[sortBy]

      if (sortBy === "dueDate") {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const handleCreateProject = () => {
    if (newProject.name && newProject.assignee && newProject.dueDate) {
      const project: Project = {
        id: Math.max(...projects.map((p) => p.id)) + 1,
        ...newProject,
        status: "대기중",
        issues: 0,
        codeQuality: Math.floor(Math.random() * 20) + 80,
      }
      setProjects([...projects, project])
      setNewProject({ name: "", assignee: "", dueDate: "", priority: "보통", description: "" })
      setShowCreateModal(false)
    }
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setShowEditModal(true)
  }

  const handleUpdateProject = () => {
    if (editingProject) {
      setProjects(projects.map((p) => (p.id === editingProject.id ? editingProject : p)))
      setShowEditModal(false)
      setEditingProject(null)
    }
  }

  const handleDeleteProject = (projectId: number) => {
    if (confirm("정말로 이 프로젝트를 삭제하시겠습니까?")) {
      setProjects(projects.filter((p) => p.id !== projectId))
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
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
                <option value="priority">우선순위순</option>
                <option value="dueDate">마감일순</option>
                <option value="codeQuality">코드품질순</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedProjects.map((project) => (
            <div
              key={project.id}
              className="group relative bg-white rounded-2xl border border-slate-200/60 p-8 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 hover:border-slate-300/80 hover:-translate-y-1 overflow-hidden"
            >
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Content */}
              <div className="relative z-10">
                {/* Header with Title and Status */}
                <div className="flex items-start justify-between mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 line-clamp-2 flex-1 mr-4 group-hover:text-slate-800 transition-colors">
                    {project.name}
                  </h3>
                  <span
                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap shadow-sm ${getStatusColor(project.status)} group-hover:shadow-md transition-shadow`}
                  >
                    {project.status}
                  </span>
                </div>

                {/* Description */}
                <p className="text-slate-600 text-base mb-8 line-clamp-3 leading-relaxed group-hover:text-slate-700 transition-colors">
                  {project.description}
                </p>

                {/* Bottom section with project info and assignee */}
                <div className="flex items-center justify-between">
                  {/* Left side - Project info */}
                  <div className="flex items-center gap-4 text-slate-500 text-sm">
                    {/* Team size */}
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>3명</span>
                    </div>

                    {/* Due date */}
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                  {/* Right side - Assignee */}
                  <span className="text-slate-500 text-sm">{project.assignee}</span>
                </div>
              </div>

              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

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
      </main>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-800">새 프로젝트 생성</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">프로젝트 이름</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="프로젝트 이름을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">담당자</label>
                <input
                  type="text"
                  value={newProject.assignee}
                  onChange={(e) => setNewProject({ ...newProject, assignee: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="담당자 이름을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">마감일</label>
                <input
                  type="date"
                  value={newProject.dueDate}
                  onChange={(e) => setNewProject({ ...newProject, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">우선순위</label>
                <select
                  value={newProject.priority}
                  onChange={(e) => setNewProject({ ...newProject, priority: e.target.value as Project["priority"] })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="낮음">낮음</option>
                  <option value="보통">보통</option>
                  <option value="높음">높음</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">설명</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="프로젝트 설명을 입력하세요"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleCreateProject}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                생성
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && editingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-800">프로젝트 편집</h2>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">프로젝트 이름</label>
                <input
                  type="text"
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">담당자</label>
                <input
                  type="text"
                  value={editingProject.assignee}
                  onChange={(e) => setEditingProject({ ...editingProject, assignee: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">마감일</label>
                <input
                  type="date"
                  value={editingProject.dueDate}
                  onChange={(e) => setEditingProject({ ...editingProject, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">상태</label>
                <select
                  value={editingProject.status}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, status: e.target.value as Project["status"] })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="대기중">대기중</option>
                  <option value="진행중">진행중</option>
                  <option value="완료">완료</option>
                  <option value="보류">보류</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">우선순위</label>
                <select
                  value={editingProject.priority}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, priority: e.target.value as Project["priority"] })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="낮음">낮음</option>
                  <option value="보통">보통</option>
                  <option value="높음">높음</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">이슈 개수</label>
                <input
                  type="number"
                  min="0"
                  value={editingProject.issues}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, issues: Number.parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">코드 품질 점수</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingProject.codeQuality}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, codeQuality: Number.parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">설명</label>
                <textarea
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleUpdateProject}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
