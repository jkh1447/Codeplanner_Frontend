"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Header from "../../../components/header";

export default function Welcome() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const isTouchingRef = useRef(false);
  const [isMobile, setIsMobile] = useState(false);

  // Particle effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      setIsMobile(window.innerWidth < 768);
    };

    updateCanvasSize();

    let particles: {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      size: number;
      color: string;
      scatteredColor: string;
      life: number;
    }[] = [];

    let textImageData: ImageData | null = null;

    // 파티클 수 계산 함수를 전역으로 이동
    const calculateParticleCount = (
      canvas: HTMLCanvasElement,
      baseParticleCount: number
    ) => {
      // 기준 해상도 (Full HD)
      const baseResolution = 1920 * 1080;
      const currentResolution = canvas.width * canvas.height;

      // 비율 계산 (1.0이 기준)
      const ratio = currentResolution / baseResolution;

      // 안전한 범위로 제한 (0.5 ~ 2.0)
      const safeRatio = Math.max(0.5, Math.min(2.0, ratio));

      // 파티클 수 계산
      const calculatedCount = Math.floor(baseParticleCount * safeRatio);

      // 최소/최대 값 보장
      const minParticles = Math.floor(baseParticleCount * 0.3);
      const maxParticles = Math.floor(baseParticleCount * 2.5);

      return Math.max(minParticles, Math.min(maxParticles, calculatedCount));
    };

    function createTextImage() {
      if (!ctx || !canvas) return 0;

      // ⛔ Guard: avoid IndexSizeError
      if (canvas.width === 0 || canvas.height === 0) return 0;

      ctx.fillStyle = "#1e293b";
      ctx.save();

      const fontSize = isMobile ? 48 : 96;
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.fillText("Code Planner", 0, 0);

      ctx.restore();

      // ⛔ Guard: ensure positive dimensions before reading image data
      if (canvas.width === 0 || canvas.height === 0) return 0;
      textImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return 1;
    }

    function createParticle() {
      if (!ctx || !canvas || !textImageData) return null;

      const data = textImageData.data;

      for (let attempt = 0; attempt < 100; attempt++) {
        const x = Math.floor(Math.random() * canvas.width);
        const y = Math.floor(Math.random() * canvas.height);

        if (data[(y * canvas.width + x) * 4 + 3] > 128) {
          return {
            x: x,
            y: y,
            baseX: x,
            baseY: y,
            size: Math.random() * 1 + 0.5,
            color: "#1e293b",
            scatteredColor: "#3b82f6",
            life: Math.random() * 100 + 50,
          };
        }
      }

      return null;
    }

    function createInitialParticles() {
      const baseParticleCount = 6000;
      if (!canvas) return;
      const particleCount = calculateParticleCount(canvas, baseParticleCount);
      for (let i = 0; i < particleCount; i++) {
        const particle = createParticle();
        if (particle) particles.push(particle);
      }
    }

    let animationFrameId: number;

    function animate() {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const { x: mouseX, y: mouseY } = mousePositionRef.current;
      const maxDistance = 200;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (
          distance < maxDistance &&
          (isTouchingRef.current || !("ontouchstart" in window))
        ) {
          const force = (maxDistance - distance) / maxDistance;
          const angle = Math.atan2(dy, dx);
          const moveX = Math.cos(angle) * force * 50;
          const moveY = Math.sin(angle) * force * 50;
          p.x = p.baseX - moveX;
          p.y = p.baseY - moveY;

          ctx.fillStyle = p.scatteredColor;
        } else {
          p.x += (p.baseX - p.x) * 0.1;
          p.y += (p.baseY - p.y) * 0.1;
          ctx.fillStyle = p.color;
        }

        ctx.fillRect(p.x, p.y, p.size, p.size);

        p.life--;
        if (p.life <= 0) {
          const newParticle = createParticle();
          if (newParticle) {
            particles[i] = newParticle;
          } else {
            particles.splice(i, 1);
            i--;
          }
        }
      }

      const baseParticleCount = 6000;
      const targetParticleCount = calculateParticleCount(
        canvas,
        baseParticleCount
      );
      while (particles.length < targetParticleCount) {
        const newParticle = createParticle();
        if (newParticle) particles.push(newParticle);
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    createTextImage();
    createInitialParticles();
    animate();

    const handleResize = () => {
      updateCanvasSize();
      // createTextImage() now self-guards; call it unconditionally
      createTextImage();
      particles = [];
      createInitialParticles();
    };

    const handleMove = (x: number, y: number) => {
      mousePositionRef.current = { x, y };
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchStart = () => {
      isTouchingRef.current = true;
    };

    const handleTouchEnd = () => {
      isTouchingRef.current = false;
      mousePositionRef.current = { x: 0, y: 0 };
    };

    const handleMouseLeave = () => {
      if (!("ontouchstart" in window)) {
        mousePositionRef.current = { x: 0, y: 0 };
      }
    };

    window.addEventListener("resize", handleResize);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchend", handleTouchEnd);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile]);

  return (
    <div className="bg-slate-50">
      {/* Hero Section with Particles */}
      <div className="relative w-full h-dvh flex flex-col items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full h-full absolute top-0 left-0 touch-none"
          aria-label="Interactive particle effect with Code Planner text"
        />
        <div className="absolute bottom-[100px] text-center z-10">
          <p className="font-mono text-slate-600 text-xs sm:text-base md:text-sm">
            Welcome to{" "}
            <span className="text-blue-600 transition-colors duration-300">
              Code Planner
            </span>
            <br />
            <span className="text-slate-500 text-xs mt-2.5 inline-block">
              Smart Issue Tracking & Code Quality Management
            </span>
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="animate-bounce">
            <svg
              className="w-6 h-6 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Service Introduction Section */}
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-slate-800">
                <span className="text-blue-600">Code Planner</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 mb-8">
                이슈 트래킹부터 코드 품질 관리까지, 개발 프로젝트의 모든 것을 한
                곳에서
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/login">
                  <button className="bg-slate-500 hover:bg-slate-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg">
                    로그인하여 시작하기
                  </button>
                </Link>
                <Link
                  href="/projectList"
                  className="border border-blue-600 hover:border-slate-300 text-blue-600 hover:text-slate-700 px-8 py-3 rounded-lg font-semibold transition-colors inline-block text-center"
                >
                  데모 보기
                </Link>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-800">
                  스마트 이슈 트래킹
                </h3>
                <p className="text-slate-600">
                  Jira와 같은 강력한 이슈 관리 기능으로 프로젝트를 체계적으로
                  관리하세요.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-800">
                  클린 코드 검사
                </h3>
                <p className="text-slate-600">
                  자동화된 코드 품질 검사로 더 나은 코드를 작성하고 유지보수성을
                  높이세요.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-800">
                  GitHub 연동
                </h3>
                <p className="text-slate-600">
                  GitHub와 완벽하게 연동되어 커밋, PR, 이슈를 자동으로
                  동기화합니다.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-800">
                  업무 자동화
                </h3>
                <p className="text-slate-600">
                  반복적인 작업을 자동화하여 개발에만 집중할 수 있는 환경을
                  제공합니다.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-800">
                  실시간 대시보드
                </h3>
                <p className="text-slate-600">
                  프로젝트 진행 상황과 코드 품질 지표를 한눈에 확인할 수
                  있습니다.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-800">
                  팀 협업
                </h3>
                <p className="text-slate-600">
                  팀원들과 효율적으로 소통하고 협업할 수 있는 도구를 제공합니다.
                </p>
              </div>
            </div>

            {/* Demo Section */}
            <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
            <h2 className="text-3xl font-bold mb-8 text-center text-slate-800">Code Planner의 핵심 기능</h2>
            <div className="grid md:grid-cols-2 gap-8 items-start mb-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-blue-600">📋 이슈 트래킹</h3>

                {/* 이슈 트래킹 기능 설명 */}
                <div className="mb-4 space-y-3">
                  <p className="text-slate-700 text-sm leading-relaxed">
                    프로젝트의 모든 작업을 체계적으로 관리하고 추적할 수 있습니다. 작업, 버그, 핫픽스를 구분하여 관리하며, 각
                    이슈의 진행 상태를 실시간으로 확인할 수 있습니다.
                  </p>

                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2 text-sm">주요 기능:</h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>
                        • <strong>이슈 타입 분류:</strong> 작업, 버그, 핫픽스 구분 관리
                      </li>
                      <li>
                        • <strong>상태 추적:</strong> 백로그 → 해야 할 일 → 진행 중 → 리뷰 → 완료
                      </li>
                      <li>
                        • <strong>고유 키 시스템:</strong> CP-1, CP-2 등 체계적인 식별자
                      </li>
                    </ul>
                  </div>
                </div>

                {/* 이슈 보드 이미지 */}
                <div className="w-full flex justify-center mb-3">
                  <img
                    src="IssueBoard.PNG"
                    alt="이슈 트래킹 테이블 - 작업, 버그, 핫픽스를 포함한 체계적인 이슈 관리"
                    className="rounded-lg border border-slate-200 shadow-md max-w-full h-auto"
                  />
                </div>

                {/* 이슈 목록 테이블 이미지 */}
                <div className="w-full flex justify-center mb-3">
                  <img
                    src="IssueList.PNG"
                    alt="이슈 트래킹 테이블 - 작업, 버그, 핫픽스를 포함한 체계적인 이슈 관리"
                    className="rounded-lg border border-slate-200 shadow-md max-w-full h-auto"
                  />
                </div>

                {/* 이미지 설명 */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-600 text-center">
                    실제 이슈 트래킹 화면 - 다양한 이슈 타입과 상태를 색상으로 구분하여 직관적으로 관리
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 text-green-600">✅ 코드 품질 검사</h3>

                {/* 코드 품질 검사 설명 */}
                <div className="mb-4 space-y-3">
                  <p className="text-slate-700 text-sm leading-relaxed">
                    실시간 코드 분석을 통해 잠재적 오류와 코딩 스타일 문제를 자동으로 감지하고 개선 방안을 제시합니다. 다양한
                    분석 도구를 통해 코드 품질을 향상시킵니다.
                  </p>

                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2 text-sm">지원 도구:</h4>
                    <ul className="text-xs text-green-700 space-y-1">
                      <li>
                        • <strong>cppcheck:</strong> C/C++ 정적 분석 및 버그 탐지
                      </li>
                      <li>
                        • <strong>clang-format:</strong> 코드 포맷팅 및 스타일 검사
                      </li>
                    </ul>
                  </div>
                </div>

                {/* 코드 분석 인터페이스 */}
                <div className="bg-white border border-slate-200 rounded-lg shadow-md overflow-hidden">
                  {/* 파일 헤더 */}
                  <div className="bg-slate-50 px-3 py-2 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-xs font-medium text-slate-700">test_files/presentation/twofail.c</span>
                      </div>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-md font-medium">modified</span>
                    </div>
                    <div className="flex items-center space-x-3 mt-1 text-xs text-slate-500">
                      <span>라인: c</span>
                      <span>크기: 118 문자</span>
                    </div>
                  </div>

                  {/* 버튼 영역 */}
                  <div className="px-3 py-2 bg-slate-50 border-b border-slate-200">
                    <div className="flex space-x-2">
                      <button className="px-2 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700">분석</button>
                      <button className="px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded-md hover:bg-slate-300">
                        내용 보기
                      </button>
                    </div>
                  </div>

                  {/* 코드 에디터 */}
                  <div className="p-3">
                    <div className="text-xs text-slate-500 mb-2">변경된 내용:</div>
                    <div className="bg-slate-50 rounded-md p-2 font-mono text-xs">
                      <div className="flex">
                        <div className="text-slate-400 pr-3 select-none">
                          <div>1</div>
                          <div>2</div>
                          <div>3</div>
                          <div>4</div>
                          <div>5</div>
                          <div>6</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-slate-700">#include &lt;stdio.h&gt;</div>
                          <div></div>
                          <div className="text-slate-700">int main(){"{"} int a = 0;</div>
                          <div className="text-slate-700 bg-red-50">
                            <span className="bg-red-200 px-1">if(a == 1){"{"}</span>
                          </div>
                          <div className="text-slate-700 pl-4">printf("format, cppcheck 툴니...");</div>
                          <div className="text-slate-700">{"}"}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 에러 섹션들 */}
                  <div className="space-y-2 p-3 pt-0">
                    {/* cppcheck 에러 */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">!</span>
                        </div>
                        <span className="font-medium text-red-800 text-sm">cppcheck 에러</span>
                      </div>
                      <div className="text-xs text-red-700 ml-5">
                        • 타입: <code className="bg-red-100 px-1 rounded">style [4, 8]</code>: Condition 'a==1' is always
                        false
                      </div>
                    </div>

                    {/* clang-format 에러 */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">i</span>
                        </div>
                        <span className="font-medium text-blue-800 text-sm">clang-format 에러</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 이미지 설명 */}
                <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-600 text-center">
                    실시간 코드 분석 - 잠재적 버그와 스타일 문제를 즉시 감지하여 코드 품질 향상
                  </p>
                </div>
              </div>
            </div>
              <div className="text-center">
                <Link href="/user/create">
                  <button className="bg-slate-500 hover:bg-slate-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg">
                    지금 시작하기
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
