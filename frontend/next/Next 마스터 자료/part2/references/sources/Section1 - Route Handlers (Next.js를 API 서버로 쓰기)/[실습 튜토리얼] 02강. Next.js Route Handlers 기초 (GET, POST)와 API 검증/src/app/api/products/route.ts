import { NextResponse } from "next/server";

interface Product {
  id: number;
  name: string;
  price: number;
}

const products: Product[] = [
  { id: 1, name: "초경량 노트북", price: 1200000 },
  { id: 2, name: "무소음 키보드", price: 185000 },
];

export async function GET() {
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.price) {
      return NextResponse.json(
        { error: "규격 미달: 상품 명칭 또는 가격 정보가 누락되었습니다." },
        { status: 400 }
      );
    }

    const newProduct: Product = {
      id: products.length + 1,
      name: body.name,
      price: Number(body.price),
    };

    products.push(newProduct);
    return NextResponse.json(newProduct, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: "시스템 장애 발생" },
      { status: 500 }
    );
  }
}