# 환경변수 설정 가이드

## 1. 환경변수 파일 생성

프로젝트 루트에 다음 파일들을 생성하세요:

### .env.development (개발 환경)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ENV=development
```

### .env.production (배포 환경)
```env
NEXT_PUBLIC_API_URL=http://43.201.107.10:5000
NEXT_PUBLIC_ENV=production
```

### .env.local (로컬 오버라이드 - 선택사항)
```env
# 이 파일은 .gitignore에 포함되어 있어야 함
# 로컬에서만 사용할 설정
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ENV=development
```

## 2. 파일 생성 방법

### 방법 1: 수동 생성
```bash
# 개발 환경
cp env.example .env.development

# 배포 환경
cp env.example .env.production

# 로컬 환경 (선택사항)
cp env.example .env.local
```

### 방법 2: 직접 생성
```bash
# 개발 환경
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.development
echo "NEXT_PUBLIC_ENV=development" >> .env.development

# 배포 환경
echo "NEXT_PUBLIC_API_URL=http://43.201.107.10:5000" > .env.production
echo "NEXT_PUBLIC_ENV=production" >> .env.production
```

## 3. 환경변수 로딩 우선순위

Next.js는 다음 순서로 환경변수를 로드합니다:

1. `.env.local` (항상 로드, git에 커밋되지 않음)
2. `.env.development` (개발 환경에서만)
3. `.env.production` (배포 환경에서만)
4. `.env` (항상 로드)

## 4. 환경변수 확인

### 개발 환경에서 확인:
```bash
npm run dev
# 브라우저 콘솔에서 process.env.NEXT_PUBLIC_API_URL 확인
```

### 배포 환경에서 확인:
```bash
npm run build:prod
npm run start:prod
# 브라우저 콘솔에서 process.env.NEXT_PUBLIC_API_URL 확인
```

## 5. 환경변수 사용법

### 컴포넌트에서 사용:
```typescript
// 직접 사용
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// 또는 lib/api.ts의 함수 사용
import { getApiUrl } from "@/lib/api";
const apiUrl = getApiUrl();
```

### API 호출에서 사용:
```typescript
import { getApiUrl } from "@/lib/api";

// GET 요청
const response = await fetch(`${getApiUrl()}/api/endpoint`);

// POST 요청
const response = await fetch(`${getApiUrl()}/api/endpoint`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

## 6. 주의사항

### NEXT_PUBLIC_ 접두사
- 클라이언트 사이드에서 사용할 환경변수는 `NEXT_PUBLIC_` 접두사가 필요합니다
- 서버 사이드에서만 사용하는 환경변수는 접두사 없이 사용

### 보안
- 민감한 정보(API 키, 비밀번호 등)는 `NEXT_PUBLIC_` 접두사를 사용하지 마세요
- `.env.local` 파일은 git에 커밋하지 마세요

### 배포 시
- EC2에서도 동일한 환경변수 파일이 필요합니다
- CI/CD 파이프라인에서 환경변수가 올바르게 설정되었는지 확인하세요

## 7. 문제 해결

### 환경변수가 로드되지 않는 경우:
1. 파일명 확인 (`.env.development`, `.env.production`)
2. 파일 위치 확인 (프로젝트 루트)
3. Next.js 재시작
4. 브라우저 캐시 삭제

### 환경변수 값 확인:
```typescript
// 컴포넌트에서 확인
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('Environment:', process.env.NEXT_PUBLIC_ENV);
``` 