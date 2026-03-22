import { NextRequest, NextResponse } from "next/server";

interface CourseReview {
  studentName: string;
  courseTitle: string;
  rating: number;
  comment: string;
  timestamp?: string;
}

// 아키텍트의 인메모리 방어벽 (데이터베이스 연동 전 파이프라인 흐름 증명용)
let reviews: CourseReview[] = [];

// [POST] 외부 플랫폼이 우리 서버를 타격할 때 작동하는 수신소
export async function POST(request: NextRequest) {
  try {
    const body: CourseReview = await request.json();

    // 1차 방어선: 데이터 무결성 검증 (Validation)
    if (!body.studentName || !body.courseTitle || !body.comment) {
      return NextResponse.json({ error: "Invalid Data" }, { status: 400 });
    }
    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    body.timestamp = new Date().toISOString();

    // 메모리 누수(Memory Leak)를 차단하기 위해 큐를 5개로 제한합니다.
    reviews = [body, ...reviews].slice(0, 5);
    console.log(`🎉 [수강평 수신] ${body.studentName}님이 🌟${body.rating}점 리뷰를 남겼습니다!`);

    return NextResponse.json({ message: "수강평 기록 완료" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// [GET] 내부 프론트엔드가 데이터를 요구할 때 최신 상태를 반환하는 브릿지
export async function GET() {
  return NextResponse.json({ events: reviews, updatedAt: new Date().toISOString() });
}