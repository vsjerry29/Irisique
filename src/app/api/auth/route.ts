import { NextResponse } from "next/server";
import { MOCK_CUSTOMER } from "@/lib/data";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mobile, otp } = body;

    // Demo development authentication
    // Any valid 10-digit Indian phone or demo number "9840099881" works
    const clean = (mobile || "").replace(/[^0-9]/g, "");
    if (clean.length < 10) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    // If OTP check is provided or standard development login
    return NextResponse.json({
      success: true,
      token: `iris_auth_${Date.now()}`,
      customer: {
        ...MOCK_CUSTOMER,
        mobile: `+91 ${clean.slice(-10)}`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Authentication failed." }, { status: 500 });
  }
}
