"use client"

import type React from "react"

import { Code2 } from "lucide-react"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
  features?: string[]
}

export function AuthLayout({ children, title, subtitle, features }: AuthLayoutProps) {
  const defaultFeatures = ["직관적인 프로젝트 관리", "팀 협업 도구", "실시간 진행 상황 추적"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#64748b] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#64748b] to-[#475569]" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="mb-8">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
              <Code2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">{title}</h1>
            <p className="text-xl text-white/80 mb-8">{subtitle}</p>
          </div>

          <div className="space-y-6 text-white/70">
            {(features || defaultFeatures).map((feature, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  <span className="text-sm">✓</span>
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-xl" />
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/5 rounded-full blur-xl" />
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">{children}</div>
    </div>
  )
}
