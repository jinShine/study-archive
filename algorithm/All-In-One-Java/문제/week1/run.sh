#!/bin/bash

# Week 1 Java 실행 스크립트

if [ -z "$1" ]; then
    echo "사용법: ./run.sh <ProblemNumber>"
    echo "예시:"
    echo "  ./run.sh Problem1"
    echo "  ./run.sh Problem2"
    echo "  ./run.sh Problem3"
    exit 1
fi

PROBLEM=$1

# 컴파일 클래스 파일이 있는지 확인
if [ ! -f "src/${PROBLEM}.class" ]; then
    echo "⚠️  컴파일되지 않은 파일입니다. 먼저 build.sh를 실행하세요."
    echo "  ./build.sh"
    exit 1
fi

echo "🚀 ${PROBLEM} 실행 중..."
echo ""

java -cp src ${PROBLEM}

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 실행 완료"
else
    echo ""
    echo "❌ 실행 실패"
    exit 1
fi
