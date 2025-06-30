# GitHub Secrets 설정 가이드

## 1. GitHub Repository Secrets 설정

GitHub 저장소에서 다음 Secrets를 설정해야 합니다:

### Settings → Secrets and variables → Actions → New repository secret

#### 필수 Secrets:
1. **`EC2_HOST`**: EC2 인스턴스의 퍼블릭 IP
   - 값: `43.201.107.10`

2. **`EC2_USERNAME`**: EC2 인스턴스의 사용자명
   - 값: `ubuntu` (또는 설정한 사용자명)

3. **`EC2_SSH_KEY`**: EC2 인스턴스 접속용 SSH 프라이빗 키
   - 값: `.pem` 파일의 전체 내용 (-----BEGIN RSA PRIVATE KEY----- 부터 -----END RSA PRIVATE KEY----- 까지)

4. **`EC2_PORT`**: SSH 포트 (기본값: 22)
   - 값: `22`

## 2. SSH 키 설정 방법

### SSH 키 생성 (아직 없는 경우):
```bash
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
```

### EC2에 SSH 키 등록:
```bash
# 로컬에서 SSH 키를 EC2에 복사
ssh-copy-id -i ~/.ssh/id_rsa.pub ubuntu@43.201.107.10

# 또는 수동으로 authorized_keys에 추가
cat ~/.ssh/id_rsa.pub | ssh ubuntu@43.201.107.10 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### GitHub Secrets에 SSH 키 추가:
1. 프라이빗 키 파일 내용 복사:
   ```bash
   cat ~/.ssh/id_rsa
   ```
2. GitHub Secrets에서 `EC2_SSH_KEY`로 저장

## 3. 환경변수 파일 설정

### .env.development 파일 생성:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ENV=development
```

### .env.production 파일 생성:
```env
NEXT_PUBLIC_API_URL=http://43.201.107.10:5000
NEXT_PUBLIC_ENV=production
```

## 4. EC2 초기 설정 (최초 1회)

### 필수 패키지 설치:
```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Node.js 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# nginx 설치
sudo apt install nginx -y

# PM2 설치
sudo npm install -g pm2

# Git 설치
sudo apt install git -y
```

### 프로젝트 디렉토리 생성:
```bash
mkdir -p /home/ubuntu/codeplanner-frontend
cd /home/ubuntu/codeplanner-frontend

# Git 저장소 클론
git clone https://github.com/your-username/your-repo.git .
```

### nginx 설정:
```bash
# nginx 설정 파일 복사
sudo cp nginx.conf /etc/nginx/sites-available/codeplanner
sudo ln -s /etc/nginx/sites-available/codeplanner /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# nginx 설정 테스트 및 재시작
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 5. 자동 배포 테스트

### 코드 푸시로 배포 테스트:
```bash
# 로컬에서 코드 수정 후
git add .
git commit -m "Test deployment"
git push origin main
```

### GitHub Actions 확인:
1. GitHub 저장소 → Actions 탭
2. "Deploy to EC2" 워크플로우 실행 확인
3. 각 단계별 성공/실패 상태 확인

## 6. 문제 해결

### SSH 연결 문제:
```bash
# SSH 연결 테스트
ssh -i ~/.ssh/id_rsa ubuntu@43.201.107.10

# 권한 확인
ls -la ~/.ssh/
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
```

### PM2 문제:
```bash
# PM2 상태 확인
pm2 status

# PM2 로그 확인
pm2 logs codeplanner-frontend

# PM2 재시작
pm2 restart codeplanner-frontend
```

### nginx 문제:
```bash
# nginx 상태 확인
sudo systemctl status nginx

# nginx 로그 확인
sudo tail -f /var/log/nginx/error.log
```

## 7. 보안 주의사항

- SSH 키는 절대 공개하지 마세요
- GitHub Secrets는 안전하게 관리하세요
- EC2 보안 그룹에서 필요한 포트만 열어두세요
- 정기적으로 시스템 업데이트를 진행하세요 