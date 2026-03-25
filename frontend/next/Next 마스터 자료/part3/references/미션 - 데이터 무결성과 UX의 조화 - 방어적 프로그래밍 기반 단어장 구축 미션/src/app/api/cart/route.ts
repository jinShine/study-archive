import { NextResponse } from 'next/server';
import { cart } from '@/app/api/db';
export async function GET() { await new Promise(r => setTimeout(r, 1000)); return NextResponse.json(cart); }
export async function POST(req: Request) {
  await new Promise(r => setTimeout(r, 1000));
  const { name } = await req.json();
  const newItem = { id: Date.now(), name, quantity: 1 };
  cart.push(newItem);
  return NextResponse.json(newItem);
}