import { NextResponse } from "next/server";
let mockDb = [{ id: 1, title: "기본 모니터", price: 150000 }];
export async function GET() { return NextResponse.json(mockDb); }
export async function POST(req: Request) { 
  const body = await req.json(); 
  mockDb.push({ id: mockDb.length + 1, ...body }); 
  return NextResponse.json({ success: true }); 
}