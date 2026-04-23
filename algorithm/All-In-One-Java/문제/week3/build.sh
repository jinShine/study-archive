#!/bin/bash

# Week 3 Java 컴파일 스크립트

echo "🔨 Week 3 문제 컴파일 중..."

javac src/*.java

if [ $? -eq 0 ]; then
    echo "✅ 컴파일 완료!"
    echo ""
    echo "실행 방법:"
    echo "  ./run.sh Problem1"
    echo "  ./run.sh Problem2"
    echo "  ./run.sh Problem3"
else
    echo "❌ 컴파일 실패"
    exit 1
fi
