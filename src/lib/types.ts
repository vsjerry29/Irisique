export type ProductFormat =
  | "digital"
  | "print"
  | "framed"
  | "couple"
  | "family"
  | "acrylic"
  | "lightbox"
  | "jewelry"
  | (string & {});

export interface ProductVariant {
  id: string;
  name: string;
  format: ProductFormat;
  size: string;
  price: number;
  description: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  format: ProductFormat;
  startingPrice: number;
  image: string;
  description: string;
  leadTime: string;
  variants: ProductVariant[];
  features: string[];
}

export interface CartItem {
  id: string; // unique item id in cart
  productId: string;
  title: string;
  format: ProductFormat;
  size: string;
  price: number;
  quantity: number;
  irisArtworkId?: string;
  irisArtworkName?: string;
  personalisationText?: string;
}

export type OrderStatus =
  | "Request received"
  | "Awaiting confirmation"
  | "Confirmed"
  | "Artwork processing"
  | "Printing"
  | "Ready for dispatch"
  | "Shipped"
  | "Delivered";

export interface Order {
  id: string; // e.g. "IRIS-8492"
  createdAt: string;
  customerName: string;
  customerMobile: string;
  customerEmail?: string;
  deliveryAddress: string;
  city: string;
  status: OrderStatus;
  statusHistory: { status: OrderStatus; timestamp: string; note?: string }[];
  items: CartItem[];
  totalAmount: number;
  paymentMethod: "enquiry_bank_transfer" | "studio_direct" | "mock_verified";
  isPaid: boolean;
  notes?: string;
}

export interface BookingEnquiry {
  id: string;
  createdAt: string;
  name: string;
  mobile: string;
  email?: string;
  numberOfPeople: number;
  preferredLocation: string;
  preferredDate: string;
  preferredTime: string;
  productInterest: string;
  message?: string;
  consentGiven: boolean;
  status: "Pending Studio Review" | "Contacted" | "Confirmed" | "Completed";
}

export interface CustomerArtwork {
  id: string;
  title: string;
  capturedAt: string;
  location: string;
  previewUrl: string;
  highResAuthorizedUrl: string;
  eyeType: "Left Eye" | "Right Eye" | "Couple Stroma";
  dominantColor: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  mobile: string;
  email: string;
  consentRecordedAt: string;
  artworks: CustomerArtwork[];
}
