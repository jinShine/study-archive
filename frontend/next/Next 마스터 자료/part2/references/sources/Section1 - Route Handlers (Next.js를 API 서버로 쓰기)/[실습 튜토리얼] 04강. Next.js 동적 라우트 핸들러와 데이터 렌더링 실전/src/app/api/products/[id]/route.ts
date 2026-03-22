import { NextResponse } from "next/server";

interface ProductDetail {
  id: string;
  name: string;
  price: number;
  description: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const product: ProductDetail = {
    id,
    name: `${id}번 상품`,
    price: 50000,
    description: "시스템 통제 센터에서 발행한 안전한 데이터입니다."
  };

  return NextResponse.json(product);
}