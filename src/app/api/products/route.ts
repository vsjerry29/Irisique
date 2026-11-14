import { NextResponse } from "next/server";
import { PRODUCTS_CATALOG } from "@/lib/data";

export async function GET() {
  return NextResponse.json({
    products: PRODUCTS_CATALOG,
    count: PRODUCTS_CATALOG.length,
  });
}
