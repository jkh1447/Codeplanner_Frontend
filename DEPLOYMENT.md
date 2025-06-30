# EC2 배포 가이드

## 1. EC2 인스턴스 설정

### 필수 패키지 설치
```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Node.js 설치 (v18 이상)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# nginx 설치
sudo apt install nginx -y

# PM2 설치 (프로세스 관리)
sudo npm install -g pm2
```

## 2. 프로젝트 배포

### 프로젝트 클론 및 빌드
```bash
# 프로젝트 디렉토리 생성
mkdir -p /home/ubuntu/codeplanner-frontend
cd /home/ubuntu/codeplanner-frontend

# 프로젝트 파일 업로드 (Git 또는 SCP 사용)
# git clone <repository-url> .

# 의존성 설치
npm install

# 프로덕션 빌드
npm run build:prod
```

## 3. nginx 설정

### nginx 설정 파일 복사
```bash
# nginx 설정 파일 복사
sudo cp nginx.conf /etc/nginx/sites-available/codeplanner
sudo ln -s /etc/nginx/sites-available/codeplanner /etc/nginx/sites-enabled/

# 기본 설정 비활성화
sudo rm /etc/nginx/sites-enabled/default

# nginx 설정 테스트 및 재시작
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 4. 애플리케이션 실행

### PM2로 애플리케이션 실행
```bash
# PM2 설정 파일 생성
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'codeplanner-frontend',
    script: 'npm',
    args: 'start:prod',
    cwd: '/home/ubuntu/codeplanner-frontend',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# PM2로 애플리케이션 시작
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 5. 방화벽 설정

### AWS 보안 그룹 설정
- **인바운드 규칙**:
  - HTTP (80): 0.0.0.0/0
  - HTTPS (443): 0.0.0.0/0 (추후 SSL 인증서 적용 시)
  - SSH (22): 본인 IP 또는 0.0.0.0/0

### UFW 방화벽 설정 (선택사항)
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 6. 백엔드 서버 설정

### 백엔드 서버가 별도 인스턴스에 있는 경우
- 백엔드 서버는 포트 5000에서 실행 중이어야 함
- 프론트엔드에서 `http://43.201.107.10:5000`으로 API 호출

### 같은 인스턴스에 있는 경우
- 백엔드도 PM2로 관리하여 포트 5000에서 실행

## 7. SSL 인증서 설정 (추후)

### Let's Encrypt 사용
```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx -y

# SSL 인증서 발급
sudo certbot --nginx -d your-domain.com

# 자동 갱신 설정
sudo crontab -e
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## 8. 모니터링 및 로그

### PM2 모니터링
```bash
# 애플리케이션 상태 확인
pm2 status

# 로그 확인
pm2 logs codeplanner-frontend

# 실시간 모니터링
pm2 monit
```

### nginx 로그 확인
```bash
# 액세스 로그
sudo tail -f /var/log/nginx/access.log

# 에러 로그
sudo tail -f /var/log/nginx/error.log
```

## 9. 업데이트 프로세스

### 애플리케이션 업데이트
```bash
cd /home/ubuntu/codeplanner-frontend

# 코드 업데이트
git pull origin main

# 의존성 설치
npm install

# 빌드
npm run build:prod

# PM2 재시작
pm2 restart codeplanner-frontend
```

## 10. 문제 해결

### 포트 충돌 확인
```bash
# 포트 사용 현황 확인
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :5000
```

### 서비스 상태 확인
```bash
# nginx 상태
sudo systemctl status nginx

# PM2 상태
pm2 status

# 애플리케이션 로그
pm2 logs codeplanner-frontend
``` 