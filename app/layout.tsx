import type { Metadata } from 'next'
import './globals.css'

{/* 메타데이터 설정 */}
export const metadata: Metadata = {
  title: 'Code Planner',
  description: 'Created and planned by Code Planner',
  generator: 'v0.dev',
}

{/* 루트 레이아웃 컴포넌트 */}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <head>
        {/* 파비콘 설정 */}
        <link rel="icon" href="/CodePlannerIconPAV_Circle.png" type="image/png" />
      </head>
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  )
}
