import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import CartDrawer from "@/components/commerce/CartDrawer";

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "IRIS® — Biometric Fine Art Photography | Pondicherry",
  description:
    "A universe in every eye. Bespoke, living iris macro photography and personalised fine art created in Pondicherry, India.",
  openGraph: {
    title: "IRIS® — Biometric Fine Art Photography",
    description: "Look closer. Living iris macro photography and personalised fine art.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#030405",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sansFont.variable} ${displayFont.variable} bg-[#090909] text-[#FAFAF8]`}
    >
      <head>
        <link
          rel="preload"
          as="image"
          href="/assets/iris/iris-color.webp"
          type="image/webp"
        />
      </head>
      <body className="bg-[#090909] text-[#FAFAF8] antialiased min-h-screen selection:bg-neutral-800 selection:text-white">
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
