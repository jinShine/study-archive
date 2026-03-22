import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return NextResponse.json({
    id,
    status: "Active",
    cpuUsage: Math.floor(Math.random() * 25) + 5,
    timestamp: new Date().toISOString(),
    log: "보안 터널을 통해 수집된 최신 데이터입니다."
  });
}
