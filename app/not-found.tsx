"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
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

        {/* 404 Card */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-[#64748b]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-[#64748b]" />
            </div>

            <div className="mb-6">
              <h1 className="text-6xl font-bold text-[#64748b] mb-2">404</h1>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">페이지를 찾을 수 없습니다</h2>
            </div>

            <p className="text-gray-600 mb-8">
              요청하신 페이지가 존재하지 않거나
              <br />
              이동되었을 수 있습니다.
            </p>

            <div className="space-y-3">
              <Button className="w-full bg-[#64748b] hover:bg-[#475569] text-white" asChild>
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  홈으로 돌아가기
                </Link>
              </Button>

              <Button
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                이전 페이지로
              </Button>
            </div>
          </CardContent>
        </Card>
          </div>
        </div>
  )
} 