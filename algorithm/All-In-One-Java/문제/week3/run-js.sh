#!/bin/bash

# Week 3 JavaScript 실행 스크립트

if [ -z "$1" ]; then
    echo "사용법: ./run-js.sh <ProblemNumber>"
    echo "예시:"
    echo "  ./run-js.sh Problem1"
    echo "  ./run-js.sh Problem2"
    echo "  ./run-js.sh Problem3"
    exit 1
fi

PROBLEM=$1

if [ ! -f "src-js/${PROBLEM}.js" ]; then
    echo "⚠️  파일을 찾을 수 없습니다: src-js/${PROBLEM}.js"
    exit 1
fi

echo "🚀 ${PROBLEM}.js 실행 중..."
echo ""

node "src-js/${PROBLEM}.js"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 실행 완료"
else
    echo ""
    echo "❌ 실행 실패"
    exit 1
fi
