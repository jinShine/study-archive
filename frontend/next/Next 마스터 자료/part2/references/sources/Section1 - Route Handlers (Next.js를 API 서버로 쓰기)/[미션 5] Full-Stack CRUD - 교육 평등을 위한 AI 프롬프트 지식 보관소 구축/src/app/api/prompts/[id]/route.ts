import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/* =========================================================
 * [7] 단일 자원 타격 라우트: PATCH (수정) & DELETE (삭제)
 * 폴더 이름에 대괄호 [id]를 씌워 동적 라우팅을 구현합니다.
 * =========================================================
 */

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // [★ Next.js 15 핵심: 동적 변수는 반드시 비동기로 해석됩니다]
) {
  // 실행 흐름을 일시정지(await)하여 URL에 들어온 id 값을 안전하게 포획합니다.
  const { id } = await params;
  const body = await request.json();

  // DB에서 타겟 데이터 검색
  const targetIndex = db.prompts.findIndex(p => p.id === id);
  if (targetIndex === -1) {
    return NextResponse.json({ error: "해당 데이터를 찾을 수 없습니다." }, { status: 404 });
  }

  // 데이터 덮어쓰기: 전개 연산자(...)를 사용해 기존 데이터를 유지하면서, 새 데이터만 병합합니다.
  db.prompts[targetIndex] = {
    ...db.prompts[targetIndex],
    title: body.title || db.prompts[targetIndex].title,
    content: body.content || db.prompts[targetIndex].content,
    updatedAt: new Date().toISOString()
  };

  console.log(`🔄 [UPDATE] 프롬프트 내용 수정 완료: ${db.prompts[targetIndex].title}`);
  return NextResponse.json(db.prompts[targetIndex]);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const targetIndex = db.prompts.findIndex(p => p.id === id);
  if (targetIndex === -1) {
    return NextResponse.json({ error: "해당 데이터를 찾을 수 없습니다." }, { status: 404 });
  }

  // 배열의 splice 메서드를 사용하여 타겟 메모리를 완전히 도려냅니다.
  db.prompts.splice(targetIndex, 1);
  console.log(`🗑️ [DELETE] 프롬프트 시스템 삭제 완료 (ID: ${id})`);

  return NextResponse.json({ message: "데이터 삭제 완료" });
}