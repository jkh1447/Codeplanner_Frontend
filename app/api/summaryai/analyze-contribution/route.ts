import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from "@/lib/api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, owner, repo, includeMergeCommits } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: '프로젝트 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 백엔드 API 호출
    const response = await fetch(`${getApiUrl()}/summaryai/analyze-contribution`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
        'Cookie': request.headers.get('cookie') || '', // 쿠키도 함께 전달
      },
      credentials: 'include', // 쿠키 포함
      body: JSON.stringify({
        projectId,
        ...(owner && { owner }),
        ...(repo && { repo }),
        ...(typeof includeMergeCommits === 'boolean' ? { includeMergeCommits } : {}),
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('SummaryAI API error:', error);
    return NextResponse.json(
      { error: '분석 요청에 실패했습니다.' },
      { status: 500 }
    );
  }
} 