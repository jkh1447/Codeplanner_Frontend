"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Loader2, Check, Github, AlertCircle, Plus } from "lucide-react";
import { getApiUrl } from "@/lib/api";

type ConnectionStatus = "idle" | "loading" | "success" | "error";
type ConnectionMode = "connect" | "create";


interface Organization {
    login: string;
    id: number;
    avatar_url: string;
    description: string;
    url: string;
    html_url: string;
    canCreateRepo?: boolean;
    role?: string;
    state?: string;
    permissionError?: string;
}

interface HelpStep {
    step: number;
    title: string;
    description: string;
}

interface HelpInfo {
    organization: string;
    helpSteps: HelpStep[];
    settingsUrl: string;
    helpUrl: string;
}

export default function GitHubConnector({ setRepositoryUrl }: { setRepositoryUrl: (repositoryUrl: string) => void }) {

    const [repoUrl, setRepoUrl] = useState("");
    const [status, setStatus] = useState<ConnectionStatus>("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [mode, setMode] = useState<ConnectionMode>("connect");
    const [newRepoName, setNewRepoName] = useState("");
    const [newRepoDescription, setNewRepoDescription] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [selectedOrg, setSelectedOrg] = useState<string>("");
    const [loadingOrgs, setLoadingOrgs] = useState(false);
    const [orgPermissions, setOrgPermissions] = useState<{[key: string]: any}>({});
    const [showHelp, setShowHelp] = useState(false);
    const [helpInfo, setHelpInfo] = useState<HelpInfo | null>(null);
    const [manualOrgName, setManualOrgName] = useState("");
    const [connecting, setConnecting] = useState(false);

    // 조직 목록 가져오기
    const fetchOrganizations = async () => {
        setLoadingOrgs(true);
        try {
            const response = await fetch(`${getApiUrl()}/github/organizations`, {
                method: "GET",
                credentials: "include",
            });
            
            if (response.ok) {
                const data = await response.json();
                setOrganizations(data.organizations || []);
                
                // 백엔드에서 이미 권한 정보를 포함해서 보내주므로 별도 권한 확인 불필요
                const permissionsMap: {[key: string]: any} = {};
                data.organizations.forEach((org: Organization) => {
                    permissionsMap[org.login] = {
                        canCreateRepo: org.canCreateRepo,
                        role: org.role,
                        state: org.state,
                        error: org.permissionError
                    };
                });
                setOrgPermissions(permissionsMap);
            } else {
                const errorData = await response.json();
                console.error("조직 목록 가져오기 실패:", errorData);
                // 사용자에게 권한 문제를 알림
                if (response.status === 403) {
                    setErrorMessage("조직 목록을 가져올 권한이 없습니다. GitHub OAuth에서 'read:org' 권한을 확인해주세요.");
                }
            }
        } catch (error) {
            console.error("조직 목록 가져오기 실패:", error);
        } finally {
            setLoadingOrgs(false);
        }
    };

    // 모드가 create로 변경될 때 조직 목록 가져오기
    const handleModeChange = (newMode: ConnectionMode) => {
        setMode(newMode);
        handleReset();
        if (newMode === "create") {
            fetchOrganizations();
        }
    };

    const handleConnect = async () => {
        if (mode === "connect") {
            if (!repoUrl.trim()) {
                setErrorMessage("Repository URL을 입력해주세요.");
                setStatus("error");
                return;
            }

            // GitHub URL 형식 검증
            const githubUrlPattern =
                /^https:\/\/github\.com\/[\w\-.]+\/[\w\-.]+\/?$/;
            if (!githubUrlPattern.test(repoUrl.trim())) {
                setErrorMessage("올바른 GitHub repository URL을 입력해주세요.");
                setStatus("error");
                return;
            }

            setStatus("loading");
            setErrorMessage("");

        try {
            // 실제 연결 로직을 시뮬레이션 (2-3초 대기)
            const match = repoUrl.match(
                /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?\/?$/i
            );
            const [, owner, repo] = match || [];
            const response = await fetch(
                `${getApiUrl()}/github/connect/${owner}/${repo}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );
            if (!response.ok) {
                throw new Error("Failed to connect to GitHub");
            }
            const data = await response.json();
            console.log("data", data);
                // 성공적으로 연결됨
                setStatus("success");
                setRepositoryUrl(repoUrl);
            } catch (error) {
                setStatus("error");
                setErrorMessage("연결 중 오류가 발생했습니다. 다시 시도해주세요.");
            }
        } else {
            // 새로운 저장소 생성 모드
            if (!newRepoName.trim()) {
                setErrorMessage("저장소 이름을 입력해주세요.");
                setStatus("error");
                return;
            }

            // 선택된 조직의 멤버십 상태 확인
            if (selectedOrg && selectedOrg !== "__manual__" && orgPermissions[selectedOrg]) {
                const membershipState = orgPermissions[selectedOrg].state;
                if (membershipState === 'inactive') {
                    setErrorMessage("비활성 멤버십 상태입니다. 조직 관리자에게 문의하여 멤버십을 활성화해주세요.");
                    setStatus("error");
                    return;
                } else if (membershipState === 'pending') {
                    setErrorMessage("멤버십 승인이 대기 중입니다. 조직 관리자의 승인을 기다려주세요.");
                    setStatus("error");
                    return;
                }
            }

            // 직접 입력 모드에서 조직 이름 검증
            if (selectedOrg === "__manual__") {
                if (!manualOrgName.trim()) {
                    setErrorMessage("조직 이름을 입력해주세요.");
                    setStatus("error");
                    return;
                }
                // GitHub 조직 이름 형식 검증 (소문자, 하이픈, 언더스코어만 허용)
                const orgNamePattern = /^[a-z0-9-]+$/;
                if (!orgNamePattern.test(manualOrgName.trim())) {
                    setErrorMessage("조직 이름은 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다.");
                    setStatus("error");
                    return;
                }
            }

            setStatus("loading");
            setErrorMessage("");

            try {

                // 실제 사용할 조직 이름 결정
                const actualOrgName = selectedOrg === "__manual__" ? manualOrgName.trim() : selectedOrg;
                
                const response = await fetch(`${getApiUrl()}/github/create-repo`, {

                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        repoName: newRepoName.trim(),
                        description: newRepoDescription.trim(),
                        isPrivate,
                        orgName: actualOrgName || undefined
                    })
                });

                if (!response.ok) {
                    const text = await response.text();
                    let msg = text;
                    try { msg = JSON.parse(text).message; } catch { }
                    throw new Error(`GitHub 저장소 생성 실패: ${msg}`);
                }

                const { repositoryUrl } = await response.json();
                setStatus("success");
                // 생성된 저장소 URL을 상태에 저장하여 나중에 연결할 때 사용
                setRepoUrl(repositoryUrl);
            } catch (error) {
                setStatus("error");
                setErrorMessage(error instanceof Error ? error.message : "저장소 생성 중 오류가 발생했습니다.");
            }
        }
    };

    const handleReset = () => {
        setStatus("idle");
        setRepoUrl("");
        setNewRepoName("");
        setNewRepoDescription("");
        setIsPrivate(false);
        setErrorMessage("");
        setSuccessMessage("");
        setSelectedOrg("");
        setShowHelp(false);
        setHelpInfo(null);
        setManualOrgName("");
        setConnecting(false);
    };

    const getButtonContent = () => {
        switch (status) {
            case "loading":
                return (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {mode === "connect" ? "연결 중..." : "생성 중..."}
                    </>
                );
            case "success":
                return (
                    <>
                        <Check className="w-4 h-4 mr-2" />
                        {mode === "connect" ? "연결 완료" : "생성 완료"}
                    </>
                );
            case "error":
                return (
                    <>
                        <AlertCircle className="w-4 h-4 mr-2" />
                        다시 시도
                    </>
                );
            default:
                return (
                    <>
                        {mode === "connect" ? <Github className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                        {mode === "connect" ? "연결하기" : "생성하기"}
                    </>
                );
        }
    };

    const getButtonVariant = () => {
        switch (status) {
            case "success":
                return "default";
            case "error":
                return "destructive";
            default:
                return "default";
        }
    };

    return (
        <>
            <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Github className="w-5 h-5" />
                    GitHub Repository
                </CardTitle>
                <CardDescription>
                    기존 저장소를 연결하거나 새로운 저장소를 생성하세요.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* 모드 선택 버튼 */}
                <div className="flex gap-2">
                    <Button
                        variant={mode === "connect" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleModeChange("connect")}
                        className="flex-1"
                    >
                        <Github className="w-4 h-4 mr-2" />
                        기존 저장소 연결
                    </Button>
                    <Button
                        variant={mode === "create" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleModeChange("create")}
                        className="flex-1"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        새 저장소 생성
                    </Button>
                </div>

                {mode === "connect" ? (
                    // 기존 저장소 연결 모드
                    <div className="space-y-2">
                        <Label htmlFor="repo-url">Repository URL</Label>
                        <Input
                            id="repo-url"
                            type="url"
                            placeholder="https://github.com/username/repository"
                            value={repoUrl}
                            onChange={(e) => setRepoUrl(e.target.value)}
                            disabled={status === "loading" || status === "success"}
                            className={
                                status === "error" ? "border-destructive" : ""
                            }
                        />
                    </div>
                ) : (
                    // 새 저장소 생성 모드
                    <div className="space-y-4">
                        {/* 조직 선택 */}
                        <div className="space-y-2">
                            <Label htmlFor="organization">조직 선택 (선택사항)</Label>
                            <select
                                id="organization"
                                value={selectedOrg}
                                onChange={(e) => setSelectedOrg(e.target.value)}
                                disabled={status === "loading" || status === "success" || loadingOrgs}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">개인 계정에 생성</option>
                                <option value="__manual__">직접 입력 (조회되지 않는 조직)</option>
                                {loadingOrgs ? (
                                    <option disabled>조직 목록 로딩 중...</option>
                                ) : (
                                    organizations.map((org) => {
                                        const permission = orgPermissions[org.login];
                                        const canCreate = permission?.canCreateRepo !== false;
                                        const hasError = permission?.error;
                                        
                                        // 멤버십 상태에 따른 표시
                                        const getStateDisplay = (state: string) => {
                                            switch (state) {
                                                case 'active':
                                                    return '활성';
                                                case 'pending':
                                                    return '대기 중';
                                                case 'inactive':
                                                    return '비활성';
                                                default:
                                                    return state;
                                            }
                                        };
                                        
                                        return (
                                            <option key={org.id} value={org.login}>
                                                {org.login} {org.description && `(${org.description})`}
                                                {` - ${getStateDisplay(org.state || 'unknown')}`}
                                                {permission && (
                                                    canCreate 
                                                        ? ` - 저장소 생성 가능 (${permission.role})`
                                                        : hasError 
                                                            ? ` - 권한 확인 실패`
                                                            : ` - 저장소 생성 불가 (${permission.role})`
                                                )}
                                            </option>
                                        );
                                    })
                                )}
                            </select>
                            
                            {/* 직접 입력 필드 */}
                            {selectedOrg === "__manual__" && (
                                <div className="mt-2 space-y-2">
                                    <Input
                                        type="text"
                                        placeholder="조직 이름을 입력하세요 (예: my-organization)"
                                        value={manualOrgName}
                                        onChange={(e) => setManualOrgName(e.target.value)}
                                        disabled={status === "loading" || status === "success"}
                                        className="w-full"
                                    />
                                    <p className="text-xs text-gray-600">
                                        조직 이름을 정확히 입력해주세요. 저장소 생성 시 권한을 확인합니다.
                                    </p>
                                </div>
                            )}
                            
                            {/* 선택된 조직의 권한 상태 표시 */}
                            {selectedOrg && selectedOrg !== "__manual__" && orgPermissions[selectedOrg] && (
                                <div className="mt-2 p-2 border rounded-md">
                                    {/* 멤버십 상태 표시 */}
                                    <div className="mb-2 text-sm">
                                        <span className="font-medium">멤버십 상태: </span>
                                        <span className={
                                            orgPermissions[selectedOrg].state === 'active' 
                                                ? 'text-green-600' 
                                                : orgPermissions[selectedOrg].state === 'pending'
                                                ? 'text-yellow-600'
                                                : 'text-red-600'
                                        }>
                                            {orgPermissions[selectedOrg].state === 'active' 
                                                ? '활성' 
                                                : orgPermissions[selectedOrg].state === 'pending'
                                                ? '대기 중 (승인 필요)'
                                                : orgPermissions[selectedOrg].state === 'inactive'
                                                ? '비활성'
                                                : orgPermissions[selectedOrg].state || '알 수 없음'
                                            }
                                        </span>
                                    </div>
                                    
                                    {orgPermissions[selectedOrg].canCreateRepo ? (
                                        <div className="text-green-600 text-sm flex items-center gap-2">
                                            <Check className="w-4 h-4" />
                                            저장소 생성 가능 (역할: {orgPermissions[selectedOrg].role})
                                        </div>
                                    ) : orgPermissions[selectedOrg].error ? (
                                        <div className="text-orange-600 text-sm">
                                            <div className="flex items-center gap-2 mb-2">
                                                <AlertCircle className="w-4 h-4" />
                                                권한 확인 실패: {orgPermissions[selectedOrg].error}
                                            </div>
                                            <p className="text-xs text-gray-600 mb-2">
                                                {orgPermissions[selectedOrg].error.includes('비공개 조직') 
                                                    ? '비공개 조직의 경우 권한 확인이 제한될 수 있습니다. 저장소 생성을 시도해보세요.'
                                                    : '조직에 속해있지만 권한을 확인할 수 없습니다. 저장소 생성을 시도해보세요.'
                                                }
                                            </p>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    // 기본 도움말 정보 생성
                                                    const helpInfo = {
                                                        organization: selectedOrg,
                                                        helpSteps: [
                                                            {
                                                                step: 1,
                                                                title: "조직 멤버십 확인",
                                                                description: `먼저 조직 '${selectedOrg}'의 멤버인지 확인하세요.`
                                                            },
                                                            {
                                                                step: 2,
                                                                title: "GitHub OAuth 권한 확인",
                                                                description: "GitHub OAuth에서 'repo' 및 'read:org' 권한이 부여되었는지 확인하세요."
                                                            },
                                                            {
                                                                step: 3,
                                                                title: "비공개 조직 설정 확인",
                                                                description: "비공개 조직의 경우 조직 관리자가 외부 앱 접근을 허용해야 합니다."
                                                            },
                                                            {
                                                                step: 4,
                                                                title: "조직 관리자에게 문의",
                                                                description: "권한 문제가 지속되면 조직 관리자에게 문의하세요."
                                                            }
                                                        ],
                                                        settingsUrl: `https://github.com/organizations/${selectedOrg}/settings/member-privileges`,
                                                        helpUrl: "https://docs.github.com/ko/organizations/managing-organization-settings/managing-member-privileges-for-your-organization"
                                                    };
                                                    setHelpInfo(helpInfo);
                                                    setShowHelp(true);
                                                }}
                                            >
                                                권한 요청 방법 보기
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="text-red-600 text-sm">
                                            <div className="flex items-center gap-2 mb-2">
                                                <AlertCircle className="w-4 h-4" />
                                                저장소 생성 권한이 없습니다
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    // 기본 도움말 정보 생성
                                                    const helpInfo = {
                                                        organization: selectedOrg,
                                                        helpSteps: [
                                                            {
                                                                step: 1,
                                                                title: "조직 멤버십 확인",
                                                                description: `먼저 조직 '${selectedOrg}'의 멤버인지 확인하세요.`
                                                            },
                                                            {
                                                                step: 2,
                                                                title: "조직 설정 확인",
                                                                description: `GitHub에서 조직 '${selectedOrg}'의 Settings > Member privileges로 이동하세요.`
                                                            },
                                                            {
                                                                step: 3,
                                                                title: "저장소 생성 권한 확인",
                                                                description: "Repository creation 권한이 'Members' 또는 'All members'로 설정되어 있는지 확인하세요."
                                                            },
                                                            {
                                                                step: 4,
                                                                title: "조직 관리자에게 문의",
                                                                description: "위 설정이 제한되어 있다면 조직 관리자에게 권한 요청을 하세요."
                                                            }
                                                        ],
                                                        settingsUrl: `https://github.com/organizations/${selectedOrg}/settings/member-privileges`,
                                                        helpUrl: "https://docs.github.com/ko/organizations/managing-organization-settings/managing-member-privileges-for-your-organization"
                                                    };
                                                    setHelpInfo(helpInfo);
                                                    setShowHelp(true);
                                                }}
                                            >
                                                권한 요청 방법 보기
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {/* 직접 입력 선택 시 안내 */}
                            {selectedOrg === "__manual__" && (
                                <div className="mt-2 p-2 border border-blue-200 rounded-md bg-blue-50">
                                    <div className="text-blue-800 text-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertCircle className="w-4 h-4" />
                                            직접 입력 모드
                                        </div>
                                        <p className="text-xs text-blue-700 mb-2">
                                            조직 목록에 표시되지 않는 조직의 경우 직접 입력할 수 있습니다. 
                                            저장소 생성 시 권한을 확인하고 결과를 알려드립니다.
                                        </p>
                                        <ul className="text-xs text-blue-700 space-y-1">
                                            <li>• 조직 이름을 정확히 입력해주세요</li>
                                            <li>• 해당 조직의 멤버여야 합니다</li>
                                            <li>• 저장소 생성 권한이 필요합니다</li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="new-repo-name">저장소 이름</Label>
                            <Input
                                id="new-repo-name"
                                type="text"
                                placeholder="my-project"
                                value={newRepoName}
                                onChange={(e) => setNewRepoName(e.target.value)}
                                disabled={status === "loading" || status === "success"}
                                className={
                                    status === "error" ? "border-destructive" : ""
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-repo-description">설명 (선택사항)</Label>
                            <Input
                                id="new-repo-description"
                                type="text"
                                placeholder="프로젝트에 대한 간단한 설명"
                                value={newRepoDescription}
                                onChange={(e) => setNewRepoDescription(e.target.value)}
                                disabled={status === "loading" || status === "success"}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="is-private"
                                checked={isPrivate}
                                onChange={(e) => setIsPrivate(e.target.checked)}
                                disabled={status === "loading" || status === "success"}
                                className="rounded"
                            />
                            <Label htmlFor="is-private">비공개 저장소로 생성</Label>
                        </div>
                    </div>
                )}

                {errorMessage && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errorMessage}
                    </p>
                )}

                {successMessage && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {successMessage}
                    </p>
                )}

                <div className="flex gap-2">
                    <Button
                        onClick={
                            status === "success" ? handleReset : handleConnect
                        }
                        disabled={status === "loading"}
                        variant={getButtonVariant()}
                        className="flex-1"
                    >
                        {getButtonContent()}
                    </Button>

                    {status === "success" && mode === "create" && (
                        <Button
                            onClick={async () => {
                                try {
                                    // repoUrl이 설정되어 있는지 확인
                                    if (!repoUrl) {
                                        setErrorMessage("저장소 URL이 설정되지 않았습니다. 다시 시도해주세요.");
                                        return;
                                    }
                                    
                                    setConnecting(true);
                                    setErrorMessage("");
                                    setSuccessMessage("");
                                    
                                    // 저장된 repoUrl을 사용하여 연결
                                    const encodedRepoUrl = encodeURIComponent(repoUrl);
                                    const response = await fetch(
                                        `${getApiUrl()}/github/connect/${encodedRepoUrl}`,
                                        {
                                            method: "GET",
                                            credentials: "include",
                                        }
                                    );
                                    if (!response.ok) {
                                        throw new Error("Failed to connect to GitHub");
                                    }
                                    const data = await response.json();
                                    
                                    // 성공적으로 연결됨
                                    setRepositoryUrl(repoUrl);
                                    
                                    // 성공 메시지 표시
                                    setSuccessMessage("저장소가 성공적으로 연결되었습니다!");
                                } catch (error) {
                                    setStatus("error");
                                    setErrorMessage("연결 중 오류가 발생했습니다. 다시 시도해주세요.");
                                } finally {
                                    setConnecting(false);
                                }
                            }}
                            disabled={connecting}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            {connecting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    연결 중...
                                </>
                            ) : (
                                <>
                                    <Github className="w-4 h-4" />
                                    연결하기
                                </>
                            )}
                        </Button>
                    )}

                    {status === "success" && mode === "connect" && (
                        <Button
                            onClick={handleReset}
                            variant="outline"
                            size="icon"
                        >
                            <Github className="w-4 h-4" />
                        </Button>
                    )}
                </div>

                {status === "success" && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm text-green-800 flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            {mode === "connect" 
                                ? "Repository가 성공적으로 연결되었습니다!"
                                : `새 Repository가 성공적으로 생성되었습니다!${
                                    selectedOrg === "__manual__" 
                                        ? ` (조직: ${manualOrgName})` 
                                        : selectedOrg 
                                        ? ` (조직: ${selectedOrg})` 
                                        : ""
                                  }`
                            }
                        </p>
                        {mode === "create" && (
                            <p className="text-sm text-green-700 mt-2">
                                오른쪽의 "연결하기" 버튼을 클릭하여 프로젝트에 연결하세요.
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>

        {/* 권한 요청 도움말 모달 */}
        {showHelp && helpInfo && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">조직 권한 요청 방법</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowHelp(false)}
                        >
                            ✕
                        </Button>
                    </div>
                    
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            조직 <strong>{helpInfo?.organization}</strong>에서 저장소를 생성하려면 다음 단계를 따라주세요:
                        </p>
                        
                        <div className="space-y-3">
                            {helpInfo?.helpSteps.map((step) => (
                                <div key={step.step} className="flex gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                        {step.step}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-sm">{step.title}</h4>
                                        <p className="text-sm text-gray-600">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <h4 className="font-medium text-sm text-yellow-800 mb-2">비공개 조직 관련 안내</h4>
                            <ul className="text-sm text-yellow-700 space-y-1">
                                <li>• 비공개 조직의 경우 조직 멤버십이 필요합니다</li>
                                <li>• 조직 관리자가 초대를 보내고 승인해야 합니다</li>
                                <li>• GitHub OAuth에서 'repo' 및 'read:org' 권한이 필요합니다</li>
                                <li>• 조직에서 외부 앱 접근을 허용해야 합니다</li>
                                <li>• 비공개 조직의 경우 권한 확인이 제한될 수 있습니다</li>
                                <li>• 권한 확인에 실패해도 저장소 생성은 시도해볼 수 있습니다</li>
                            </ul>
                        </div>
                        
                        <div className="flex gap-2 pt-4">
                            <Button
                                onClick={() => window.open(helpInfo?.settingsUrl, '_blank')}
                                className="flex-1"
                            >
                                조직 설정으로 이동
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => window.open(helpInfo?.helpUrl, '_blank')}
                            >
                                도움말 보기
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </>
    );
}
