import { NextResponse } from "next/server";

interface Agent {
  id: number;
  name: string;
  role: string;
}

// 임시 데이터베이스
const agents: Agent[] = [
  { id: 1, name: "CodeReviewBot", role: "코드 리뷰 및 최적화" },
  { id: 2, name: "DocuSummarizer", role: "긴 문서 요약" },
];

export async function GET() {
  // NextResponse를 사용한 표준 응답
  return NextResponse.json(agents);
}

export async function POST(request: Request) {
  try {
    const body: Partial<Agent> = await request.json();

    // 1차 방어선 (Validation)
    if (!body.name || !body.role) {
      return NextResponse.json(
        { error: "에이전트 이름 또는 역할 정보가 누락되었습니다." },
        { status: 400 }
      );
    }

    const newAgent: Agent = {
      id: agents.length + 1,
      name: body.name,
      role: body.role,
    };
    agents.push(newAgent);

    return NextResponse.json(newAgent, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: "서버 내부에서 요청을 처리하지 못했습니다." },
      { status: 500 }
    );
  }
}
