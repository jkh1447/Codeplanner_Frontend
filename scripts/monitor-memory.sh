#!/bin/bash

echo "=== 메모리 사용량 모니터링 ==="
echo "시간: $(date)"
echo ""

# 전체 메모리 정보
echo "전체 메모리 정보:"
free -h
echo ""

# Node.js 프로세스 메모리 사용량
echo "Node.js 프로세스 메모리 사용량:"
ps aux | grep node | grep -v grep | awk '{print $2, $3, $4, $11}' | head -10
echo ""

# PM2 프로세스 정보
echo "PM2 프로세스 정보:"
pm2 list
echo ""

# 디스크 사용량
echo "디스크 사용량:"
df -h
echo ""

# 스왑 사용량
echo "스왑 사용량:"
swapon --show
echo "" 