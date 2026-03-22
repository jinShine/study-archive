import { NextRequest, NextResponse } from "next/server";
interface StarEvent { sender: { login: string; avatar_url: string }; repository: { full_name: string }; starred_at?: string; }
let starEvents: StarEvent[] = [];

export async function POST(request: NextRequest) {
  try {
    const body: StarEvent = await request.json();
    if (!body.sender?.login || !body.repository?.full_name) return NextResponse.json({ error: "규격 미달" }, { status: 400 });
    body.starred_at = new Date().toISOString();
    starEvents = [body, ...starEvents].slice(0, 5);
    console.log(`🚀 [알림 수신] ${body.sender.login}님이 별을 눌렀습니다!`);
    return NextResponse.json({ message: "기록 완료" }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: "내부 오류" }, { status: 500 }); }
}

export async function GET() { return NextResponse.json({ events: starEvents, updatedAt: new Date().toISOString() }); }