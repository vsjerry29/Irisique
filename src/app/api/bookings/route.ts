import { NextResponse } from "next/server";
import { SITE_CONFIG } from "@/lib/config";
import { BookingEnquiry } from "@/lib/types";

// In-memory / process-level store for demo & local persistence
const bookingsStore: BookingEnquiry[] = [];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      mobile,
      email,
      numberOfPeople,
      preferredLocation,
      preferredDate,
      preferredTime,
      productInterest,
      message,
      consentGiven,
    } = body;

    if (!name || !mobile) {
      return NextResponse.json(
        { error: "Name and Mobile number are required fields." },
        { status: 400 }
      );
    }

    if (!consentGiven) {
      return NextResponse.json(
        { error: "Biometric photography consent must be acknowledged before booking." },
        { status: 400 }
      );
    }

    const id = `BOOK-${Date.now().toString().slice(-4)}`;
    const newBooking: BookingEnquiry = {
      id,
      createdAt: new Date().toISOString(),
      name,
      mobile,
      email: email || undefined,
      numberOfPeople: Number(numberOfPeople) || 1,
      preferredLocation: preferredLocation || SITE_CONFIG.location,
      preferredDate: preferredDate || "Flexible",
      preferredTime: preferredTime || "Morning",
      productInterest: productInterest || "Fine Art Print",
      message: message || "",
      consentGiven: true,
      status: "Pending Studio Review",
    };

    bookingsStore.unshift(newBooking);

    // Format WhatsApp message
    const waText = encodeURIComponent(
      `*New Iris Session Enquiry [${id}]*\n` +
      `• *Name*: ${name}\n` +
      `• *Mobile*: ${mobile}\n` +
      `• *People*: ${newBooking.numberOfPeople}\n` +
      `• *Location*: ${newBooking.preferredLocation}\n` +
      `• *Preferred Date*: ${newBooking.preferredDate}\n` +
      `• *Time*: ${newBooking.preferredTime}\n` +
      `• *Interest*: ${newBooking.productInterest}\n` +
      (message ? `• *Note*: ${message}\n` : "") +
      `\n_Note: Submitted via iris-pondicherry.art. Awaiting studio availability confirmation._`
    );

    const whatsappUrl = `https://wa.me/${SITE_CONFIG.whatsapp.cleanNumber}?text=${waText}`;

    return NextResponse.json({
      success: true,
      booking: newBooking,
      whatsappUrl,
      message: "Booking enquiry logged. Please connect via WhatsApp to confirm slot.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to process booking enquiry.", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    bookings: bookingsStore,
    total: bookingsStore.length,
  });
}
