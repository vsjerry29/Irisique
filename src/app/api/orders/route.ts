import { NextResponse } from "next/server";
import { INITIAL_ORDERS } from "@/lib/data";
import { Order } from "@/lib/types";

// Maintain memory store initialized with sample orders
let ordersStore: Order[] = [...INITIAL_ORDERS];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("id");

  if (orderId) {
    const cleanId = orderId.trim().toUpperCase();
    const order = ordersStore.find((o) => o.id.toUpperCase() === cleanId);
    if (!order) {
      return NextResponse.json(
        { error: `No order found with reference "${cleanId}".` },
        { status: 404 }
      );
    }
    return NextResponse.json({ order });
  }

  return NextResponse.json({ orders: ordersStore });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, customerMobile, customerEmail, deliveryAddress, city, items, notes } = body;

    if (!customerName || !customerMobile || !deliveryAddress || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Name, Mobile, Delivery Address, and at least one item are required." },
        { status: 400 }
      );
    }

    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    const id = `IRIS-${orderNumber}`;
    const totalAmount = items.reduce(
      (sum: number, it: any) => sum + (it.price || 0) * (it.quantity || 1),
      0
    );

    const now = new Date().toISOString();
    const newOrder: Order = {
      id,
      createdAt: now,
      customerName,
      customerMobile,
      customerEmail: customerEmail || undefined,
      deliveryAddress,
      city: city || "Pondicherry",
      status: "Request received",
      statusHistory: [
        {
          status: "Request received",
          timestamp: now,
          note: "Order request received through iris-pondicherry.art.",
        },
      ],
      items,
      totalAmount,
      paymentMethod: "enquiry_bank_transfer",
      isPaid: false,
      notes: notes || undefined,
    };

    ordersStore.unshift(newOrder);

    return NextResponse.json({
      success: true,
      order: newOrder,
      message: "Order placed successfully. Reference assigned for tracking.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Order creation failed.", details: err.message },
      { status: 500 }
    );
  }
}
