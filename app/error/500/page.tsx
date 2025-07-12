"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Server, RefreshCw, Home, Mail } from "lucide-react"
import Link from "next/link"

export default function ServerError() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#64748b] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CP</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">Code Planner</span>
          </div>
        </div>

        {/* 500 Error Card */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Server className="w-8 h-8 text-red-600" />
            </div>

            <div className="mb-6">
              <h1 className="text-6xl font-bold text-red-600 mb-2">500</h1>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">서버 오류</h2>
            </div>

            <p className="text-gray-600 mb-8">
              서버에서 문제가 발생했습니다.
              <br />
              잠시 후 다시 시도해 주세요.
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-[#64748b] hover:bg-[#475569] text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                다시 시도
              </Button>

              <Button
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                asChild
              >
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  홈으로 돌아가기
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-3">문제가 지속되나요?</p>
          <Button variant="ghost" size="sm" className="text-[#64748b] hover:text-[#475569] hover:bg-[#64748b]/5">
            <Mail className="w-4 h-4 mr-2" />
            고객지원팀 문의
          </Button>
        </div>
      </div>
    </div>
  )
} 