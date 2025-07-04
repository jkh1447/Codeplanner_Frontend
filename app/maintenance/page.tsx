import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Settings, Clock, Home } from "lucide-react"
import Link from "next/link"

export default function Maintenance() {
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

        {/* Maintenance Card */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-[#64748b]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Settings className="w-8 h-8 text-[#64748b] animate-spin" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">시스템 점검 중</h1>

            <p className="text-gray-600 mb-6">
              더 나은 서비스 제공을 위해
              <br />
              시스템 점검을 진행하고 있습니다.
            </p>

            <div className="bg-[#64748b]/10 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-center text-[#64748b] mb-2">
                <Clock className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">예상 완료 시간</span>
              </div>
              <p className="text-[#475569] font-semibold">2024년 7월 30일 오후 3시</p>
            </div>

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
          </CardContent>
        </Card>

        {/* Status Updates */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">실시간 업데이트는 공식 SNS에서 확인하세요.</p>
        </div>
      </div>
    </div>
  )
}
