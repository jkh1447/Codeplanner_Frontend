// API URL 관리 유틸리티
export const getApiUrl = () => {
  // 환경변수에서 직접 가져오기
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL 환경변수가 설정되지 않았습니다.');
  }
  return apiUrl;
};

// API 호출 헬퍼 함수
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = getApiUrl();
  const url = `${baseUrl}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API 호출 오류:', error);
    throw error;
  }
};

// 환경 정보 확인
export const isProduction = () => {
  return process.env.NEXT_PUBLIC_ENV === 'production';
};

export const isDevelopment = () => {
  return process.env.NEXT_PUBLIC_ENV === 'development';
};

// 백엔드 서버 헬스체크 함수
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    // 환경변수에서 직접 URL 구성하여 중복 방지
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    // /api가 이미 포함되어 있으면 제거하고 다시 추가
    const cleanBaseUrl = baseUrl.replace(/\/api$/, '');
    const healthUrl = `${cleanBaseUrl}/api/health`;
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      console.log('✅ 백엔드 서버 정상 동작');
      return true;
    } else {
      console.error('❌ 백엔드 서버 응답 오류:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ 백엔드 서버 연결 실패:', error);
    return false;
  }
}; 
