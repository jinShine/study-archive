import { NextResponse } from 'next/server';
import { todos } from '../db';
export async function GET() { await new Promise(r => setTimeout(r, 1000)); return NextResponse.json(todos); }
export async function POST(req: Request) {
  const { text } = await req.json();
  const newTodo = { id: Math.random(), text, completed: false };
  todos.push(newTodo);
  return NextResponse.json(newTodo);
}
