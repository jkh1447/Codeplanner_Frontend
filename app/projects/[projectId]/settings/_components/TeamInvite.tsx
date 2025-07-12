"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { getApiUrl } from "@/lib/api";

interface TeamInviteProps {
    projectId: string;
    hasLeaderPermission: boolean;
    hasAdminPermission: boolean;
    onClose?: () => void;
}

export default function TeamInvite({ 
    projectId, 
    hasLeaderPermission, 
    hasAdminPermission,
    onClose 
}: TeamInviteProps) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("MEMBER");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSendInvite = async () => {
        if (!email.trim()) {
            setMessage({ type: 'error', text: '이메일을 입력해주세요.' });
            return;
        }

        // 이메일 형식 검증
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setMessage({ type: 'error', text: '올바른 이메일 형식을 입력해주세요.' });
            return;
        }

        setIsLoading(true);
        setMessage(null);

        console.log('초대 요청 전송:', { projectId, email: email.trim(), role });

        try {
            const response = await fetch(`${getApiUrl()}/projects/${projectId}/invite`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    email: email.trim(),
                    role: role
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '초대 발송에 실패했습니다.');
            }

            const data = await response.json();
            setMessage({ 
                type: 'success', 
                text: `${email}로 초대 이메일이 발송되었습니다.` 
            });
            
            // 성공 시 폼 초기화
            setEmail("");
            setRole("MEMBER");
            
        } catch (error: any) {
            setMessage({ 
                type: 'error', 
                text: error.message || '초대 발송 중 오류가 발생했습니다.' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    const canInviteAsAdmin = hasLeaderPermission;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    이메일로 팀원 초대
                    {hasLeaderPermission && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">리더</span>}
                    {hasAdminPermission && !hasLeaderPermission && <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">관리자</span>}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* 권한 안내 */}
                {hasAdminPermission && !hasLeaderPermission && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                            <p className="text-sm text-orange-800">
                                관리자 권한: 멤버/뷰어로만 초대 가능합니다.
                            </p>
                        </div>
                    </div>
                )}

                {/* 이메일 입력 */}
                <div className="space-y-2">
                    <Label htmlFor="invite-email">초대할 이메일</Label>
                    <Input
                        id="invite-email"
                        type="email"
                        placeholder="example@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                    />
                </div>

                {/* 역할 선택 */}
                <div className="space-y-2">
                    <Label htmlFor="invite-role">역할</Label>
                    <Select value={role} onValueChange={setRole} disabled={isLoading}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {/* 리더만 관리자로 초대 가능 */}
                            {canInviteAsAdmin && <SelectItem value="ADMIN">관리자</SelectItem>}
                            <SelectItem value="MEMBER">멤버</SelectItem>
                            <SelectItem value="VIEWER">뷰어</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* 메시지 표시 */}
                {message && (
                    <div className={`p-3 rounded-lg flex items-center gap-2 ${
                        message.type === 'success' 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-red-50 border border-red-200'
                    }`}>
                        {message.type === 'success' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <p className={`text-sm ${
                            message.type === 'success' ? 'text-green-800' : 'text-red-800'
                        }`}>
                            {message.text}
                        </p>
                    </div>
                )}

                {/* 버튼들 */}
                <div className="flex gap-2 pt-2">
                    <Button
                        onClick={handleSendInvite}
                        disabled={isLoading || !email.trim()}
                        className="flex-1"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                발송 중...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4 mr-2" />
                                초대 발송
                            </>
                        )}
                    </Button>
                    {onClose && (
                        <Button variant="outline" onClick={onClose} disabled={isLoading}>
                            닫기
                        </Button>
                    )}
                </div>

                {/* 안내 메시지 */}
                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-600">
                        💡 <strong>초대 방법:</strong><br/>
                        • 입력한 이메일로 초대 링크가 발송됩니다<br/>
                        • 상대방이 링크를 클릭하면 프로젝트 참여를 승인/거부할 수 있습니다<br/>
                        • 초대 링크는 7일간 유효합니다
                    </p>
                </div>
            </CardContent>
        </Card>
    );
} 