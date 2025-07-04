"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Code2, Building } from "lucide-react"
import Link from "next/link"

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
    agreeMarketing: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // 페이지 로드 시 이름 필드에 자동 포커스
    const timer = setTimeout(() => {
      nameInputRef.current?.focus()
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors }

    switch (name) {
      case "name":
        if (!value.trim()) {
          newErrors.name = "이름을 입력해주세요"
        } else if (value.trim().length < 2) {
          newErrors.name = "이름은 2자 이상이어야 합니다"
        } else {
          delete newErrors.name
        }
        break
      case "email":
        if (!value.trim()) {
          newErrors.email = "이메일을 입력해주세요"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = "올바른 이메일 형식이 아닙니다"
        } else {
          delete newErrors.email
        }
        break
      case "password":
        if (!value) {
          newErrors.password = "비밀번호를 입력해주세요"
        } else if (value.length < 8) {
          newErrors.password = "비밀번호는 8자 이상이어야 합니다"
        } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(value)) {
          newErrors.password = "영문과 숫자를 포함해야 합니다"
        } else {
          delete newErrors.password
        }
        break
      case "confirmPassword":
        if (value !== formData.password) {
          newErrors.confirmPassword = "비밀번호가 일치하지 않습니다"
        } else {
          delete newErrors.confirmPassword
        }
        break
    }

    setErrors(newErrors)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "이름을 입력해주세요"
    if (!formData.email.trim()) newErrors.email = "이메일을 입력해주세요"
    if (!formData.password) newErrors.password = "비밀번호를 입력해주세요"
    if (formData.password.length < 8) newErrors.password = "비밀번호는 8자 이상이어야 합니다"
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다"
    }
    if (!formData.agreeTerms) newErrors.agreeTerms = "이용약관에 동의해주세요"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    // 회원가입 로직 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
  }

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
            <h1 className="text-4xl font-bold mb-4">시작해보세요</h1>
            <p className="text-xl text-white/80 mb-8">몇 분만에 계정을 만들고 프로젝트 관리를 시작하세요</p>
          </div>

          <div className="space-y-6 text-white/70">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-sm">1</span>
              </div>
              <span>계정 생성 (2분)</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-sm">2</span>
              </div>
              <span>팀 초대 및 설정</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-sm">3</span>
              </div>
              <span>첫 번째 프로젝트 시작</span>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-xl" />
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/5 rounded-full blur-xl" />
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1 pb-6">
              <div className="flex items-center justify-center lg:hidden mb-4">
                <div className="w-10 h-10 bg-[#64748b] rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">CP</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">Code Planner</span>
              </div>
              <CardTitle className="text-2xl font-bold text-center text-gray-900">회원가입</CardTitle>
              <p className="text-center text-gray-600">무료로 시작하고 프로젝트를 효율적으로 관리하세요</p>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                      <Input
                        ref={nameInputRef}
                        id="name"
                        type="text"
                        className={`pl-10 h-11 pt-6 pb-2 transition-all duration-300 peer ${
                          errors.name
                            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:shadow-lg focus:shadow-red-500/10"
                            : "focus:ring-2 focus:ring-[#64748b]/20 focus:border-[#64748b] focus:shadow-lg focus:shadow-[#64748b]/10"
                        }`}
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value })
                          validateField("name", e.target.value)
                        }}
                        onBlur={(e) => validateField("name", e.target.value)}
                        placeholder=" "
                      />
                      <Label
                        htmlFor="name"
                        className={`absolute left-10 transition-all duration-300 pointer-events-none ${
                          formData.name || document.activeElement?.id === "name"
                            ? "top-1 text-xs text-[#64748b] font-medium"
                            : "top-1/2 -translate-y-1/2 text-gray-500"
                        }`}
                      >
                        이름 *
                      </Label>
                    </div>
                    {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                      <Input
                        id="company"
                        type="text"
                        className="pl-10 h-11 pt-6 pb-2 transition-all duration-300 focus:ring-2 focus:ring-[#64748b]/20 focus:border-[#64748b] focus:shadow-lg focus:shadow-[#64748b]/10"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder=" "
                      />
                      <Label
                        htmlFor="company"
                        className={`absolute left-10 transition-all duration-300 pointer-events-none ${
                          formData.company || document.activeElement?.id === "company"
                            ? "top-1 text-xs text-[#64748b] font-medium"
                            : "top-1/2 -translate-y-1/2 text-gray-500"
                        }`}
                      >
                        회사명
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                    <Input
                      id="email"
                      type="email"
                      className={`pl-10 h-11 pt-6 pb-2 transition-all duration-300 peer ${
                        errors.email
                          ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:shadow-lg focus:shadow-red-500/10"
                          : "focus:ring-2 focus:ring-[#64748b]/20 focus:border-[#64748b] focus:shadow-lg focus:shadow-[#64748b]/10"
                      }`}
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value })
                        validateField("email", e.target.value)
                      }}
                      onBlur={(e) => validateField("email", e.target.value)}
                      placeholder=" "
                    />
                    <Label
                      htmlFor="email"
                      className={`absolute left-10 transition-all duration-300 pointer-events-none ${
                        formData.email || document.activeElement?.id === "email"
                          ? "top-1 text-xs text-[#64748b] font-medium"
                          : "top-1/2 -translate-y-1/2 text-gray-500"
                      }`}
                    >
                      이메일 *
                    </Label>
                  </div>
                  {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className={`pl-10 pr-10 h-11 pt-6 pb-2 transition-all duration-300 peer ${
                        errors.password
                          ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:shadow-lg focus:shadow-red-500/10"
                          : "focus:ring-2 focus:ring-[#64748b]/20 focus:border-[#64748b] focus:shadow-lg focus:shadow-[#64748b]/10"
                      }`}
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value })
                        validateField("password", e.target.value)
                      }}
                      onBlur={(e) => validateField("password", e.target.value)}
                      placeholder=" "
                    />
                    <Label
                      htmlFor="password"
                      className={`absolute left-10 transition-all duration-300 pointer-events-none ${
                        formData.password || document.activeElement?.id === "password"
                          ? "top-1 text-xs text-[#64748b] font-medium"
                          : "top-1/2 -translate-y-1/2 text-gray-500"
                      }`}
                    >
                      비밀번호 *
                    </Label>
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      className={`pl-10 pr-10 h-11 pt-6 pb-2 transition-all duration-300 peer ${
                        errors.confirmPassword
                          ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:shadow-lg focus:shadow-red-500/10"
                          : "focus:ring-2 focus:ring-[#64748b]/20 focus:border-[#64748b] focus:shadow-lg focus:shadow-[#64748b]/10"
                      }`}
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, confirmPassword: e.target.value })
                        validateField("confirmPassword", e.target.value)
                      }}
                      onBlur={(e) => validateField("confirmPassword", e.target.value)}
                      placeholder=" "
                    />
                    <Label
                      htmlFor="confirmPassword"
                      className={`absolute left-10 transition-all duration-300 pointer-events-none ${
                        formData.confirmPassword || document.activeElement?.id === "confirmPassword"
                          ? "top-1 text-xs text-[#64748b] font-medium"
                          : "top-1/2 -translate-y-1/2 text-gray-500"
                      }`}
                    >
                      비밀번호 확인 *
                    </Label>
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                      className="mt-1"
                    />
                    <Label htmlFor="agreeTerms" className="text-sm text-gray-600 leading-5">
                      <Link href="/terms" className="text-[#64748b] hover:underline">
                        이용약관
                      </Link>
                      과{" "}
                      <Link href="/privacy" className="text-[#64748b] hover:underline">
                        개인정보처리방침
                      </Link>
                      에 동의합니다 *
                    </Label>
                  </div>
                  {errors.agreeTerms && <p className="text-sm text-red-600">{errors.agreeTerms}</p>}

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="agreeMarketing"
                      checked={formData.agreeMarketing}
                      onChange={(e) => setFormData({ ...formData, agreeMarketing: e.target.checked })}
                      className="mt-1"
                    />
                    <Label htmlFor="agreeMarketing" className="text-sm text-gray-600 leading-5">
                      마케팅 정보 수신에 동의합니다 (선택)
                    </Label>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-[#64748b] hover:bg-[#475569] text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      계정 생성 중...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      무료로 시작하기
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="text-center">
                <span className="text-gray-600">이미 계정이 있으신가요? </span>
                <Link href="/auth/login" className="text-[#64748b] hover:text-[#475569] font-medium hover:underline">
                  로그인
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
