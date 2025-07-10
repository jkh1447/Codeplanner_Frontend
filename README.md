# 프로젝트 폴더 구조
```
📦Codeplanner_Frontend
 ┣ 📂app                        # Next.js App Router의 메인 폴더
 ┃ ┣ 📂api                       # (비어있음/미정의) API 관련 폴더
 ┃ ┣ 📂auth                      # 인증 관련 페이지 및 컴포넌트
 ┃ ┃ ┣ 📂emailVerified             # 이메일 인증 관련
 ┃ ┃ ┣ 📂forgot-password           # 비밀번호 찾기
 ┃ ┃ ┣ 📂github-oauth              # 깃허브 OAuth 로그인
 ┃ ┃ ┣ 📂login                     # 로그인
 ┃ ┃ ┣ 📂needEmail                 # 이메일 필요 안내
 ┃ ┃ ┗ 📂reset-password            # 비밀번호 재설정
 ┃ ┣ 📂error                      # 에러 페이지
 ┃ ┣ 📂maintenance                # 점검 안내 페이지
 ┃ ┣ 📂not-found.tsx              # 404 Not Found 페이지
 ┃ ┣ 📂projectList                # 프로젝트 리스트 및 깃허브 연동
 ┃ ┣ 📂projects                   # 개별 프로젝트 관련 라우팅
 ┃ ┃ ┣ 📂[projectId]                # 동적 라우팅: 프로젝트별
 ┃ ┃ ┃ ┣ 📂board                      # 칸반보드
 ┃ ┃ ┃ ┣ 📂code                       # 코드/Pull Request
 ┃ ┃ ┃ ┣ 📂issue                      # 이슈 상세
 ┃ ┃ ┃ ┣ 📂issue-generater-ai         # AI 이슈 생성
 ┃ ┃ ┃ ┣ 📂list                       # 이슈 리스트
 ┃ ┃ ┃ ┣ 📂my-issues                  # 내 이슈
 ┃ ┃ ┃ ┣ 📂settings                   # 프로젝트 설정
 ┃ ┃ ┃ ┣ 📂summary                    # 프로젝트 요약
 ┃ ┃ ┃ ┗ 📂timeline                   # 간트차트 등 타임라인
 ┃ ┣ 📂user                       # 유저 관련 페이지
 ┃ ┃ ┣ 📂create                      # 회원가입
 ┃ ┃ ┗ 📂mypage                      # 마이페이지
 ┃ ┣ 📂welcome                    # 웰컴 페이지
 ┃ ┣ layout.tsx                   # 전체 레이아웃
 ┃ ┣ globals.css                  # 전역 스타일
 ┃ ┗ page.tsx                     # 루트 페이지
 ┣ 📂components                  # 전역 컴포넌트
 ┃ ┣ 📂auth-layout                 # 인증 레이아웃
 ┃ ┣ 📂header                      # 헤더
 ┃ ┣ 📂icons                       # 아이콘 컴포넌트
 ┃ ┣ 📂theme-provider              # 테마 관련
 ┃ ┗ 📂ui                          # 버튼, 모달 등 UI 요소
 ┣ 📂lib                         # API, 유틸 함수 등
 ┣ 📂public                      # 정적 파일 (이미지, 파비콘 등)
 ┣ 📂scripts                     # 배포/운영 스크립트
 ┣ components.json
 ┣ DEPLOYMENT.md
 ┣ ENVIRONMENT_SETUP.md
 ┣ GITHUB_SECRETS_SETUP.md
 ┣ jsconfig.json
 ┣ next-env.d.ts
 ┣ next.config.mjs
 ┣ nginx.conf
 ┣ package.json
 ┣ postcss.config.mjs
 ┣ README.md
 ┣ tailwind.config.ts
 ┣ tsconfig.json
```

## 프로젝트 실행방법

프로젝트 디렉토리에서 다음을 실행할 수 있습니다.

### 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# 개발 환경 설정
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ENV=development

# 배포 환경 설정 (EC2 IP 주소로 변경)
# NEXT_PUBLIC_API_URL=http://your-ec2-ip:5000
# NEXT_PUBLIC_ENV=production
```

### `npm install`

npm 패키지를 프로젝트에 설치합니다.

### `npm start`

앱을 개발 모드로 실행합니다.\
브라우저에서 확인하려면 [http://localhost:3000](http://localhost:3000)을 여세요.

편집하면 페이지가 다시 로드됩니다.\
또한 콘솔에서 Lint 오류를 확인할 수 있습니다.

### `npm test`

테스트 실행을 대화형 감시 모드로 실행합니다.\
자세한 내용은 [테스트 실행](https://facebook.github.io/create-react-app/docs/running-tests) 섹션을 참조하세요.

### `npm run build`

프로덕션용 앱을 `build` 폴더에 빌드합니다. \
프로덕션 모드에서 React를 올바르게 번들링하고 최상의 성능을 위해 빌드를 최적화합니다.

빌드가 최소화되었으며 파일 이름에 해시가 포함됩니다. \
앱을 배포할 준비가 되었습니다!

자세한 내용은 [배포](https://facebook.github.io/create-react-app/docs/deployment) 섹션을 참조하세요.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build depend                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                ency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
//
