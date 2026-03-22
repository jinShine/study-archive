import { NextRequest, NextResponse } from "next/server";
import { db, Prompt } from "@/lib/db";

/* =========================================================
 * [6] 컬렉션(전체 자원) 타격 라우트: GET (목록 조회) & POST (신규 생성)
 * =========================================================
 */

export async function GET() {
  // DB 객체의 프롬프트 배열 전체를 순수 JSON 포맷으로 반환합니다.
  return NextResponse.json(db.prompts);
}

export async function POST(request: NextRequest) {
  // 1. 데이터 파싱: 클라이언트가 보낸 Body 텍스트를 자바스크립트 객체로 해독합니다. (비동기 처리)
  const body = await request.json();

  // 2. 1차 방어선 (Validation): 시스템을 지키기 위해 필수 데이터가 없으면 즉시 차단(400 Bad Request)합니다.
  if (!body.title || !body.content) {
    return NextResponse.json({ error: "제목과 내용 데이터가 누락되었습니다." }, { status: 400 });
  }

  // 3. 데이터 레코드 조립
  const newPrompt: Prompt = {
    id: Date.now().toString(), // 고유 식별자 생성 (실무에서는 UUID 사용)
    title: body.title,
    content: body.content,
    updatedAt: new Date().toISOString()
  };

  // 4. 데이터베이스 갱신: unshift를 사용해 배열 맨 앞(최신순)에 데이터를 밀어 넣습니다.
  db.prompts.unshift(newPrompt);
  console.log(`✅ [CREATE] 신규 프롬프트 등록 완료: ${newPrompt.title}`);

  // 5. 생성 완료 규약: 단순히 200 OK가 아니라, 새 자원이 생성되었음을 명시하는 201 Created를 반환합니다.
  return NextResponse.json(newPrompt, { status: 201 });
}