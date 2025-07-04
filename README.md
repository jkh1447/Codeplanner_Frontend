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