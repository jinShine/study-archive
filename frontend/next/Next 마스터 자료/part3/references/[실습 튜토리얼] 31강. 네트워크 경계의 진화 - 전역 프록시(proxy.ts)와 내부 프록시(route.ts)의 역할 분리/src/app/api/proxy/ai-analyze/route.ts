import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const userStudyData = await request.json();
  try {
    const secretApiKey = process.env.OPENAI_SECRET_KEY;
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const aiResult = {
      message: "외부 서버(OpenAI) 가상 분석 완료!",
      receivedData: userStudyData,
      usedSecretKey: secretApiKey ? "키 존재함(보안유지 완벽)" : "키 없음"
    };

    return NextResponse.json({ success: true, data: aiResult });
  } catch (error) {
    return NextResponse.json({ success: false, message: '에러 발생' }, { status: 500 });
  }
}
