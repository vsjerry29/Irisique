import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

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
  title: "IRIS® — Nothing Like Yours",
  description: "A universe in every eye. Bespoke, living iris photography and personalised art.",
  openGraph: {
    title: "IRIS® — Nothing Like Yours",
    description: "A universe in every eye. Bespoke, living iris photography and personalised art.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#030304",
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
    <html lang="en" className={`${sansFont.variable} ${displayFont.variable} bg-[#030304] text-[#f0f0f2]`}>
      <body className="bg-[#030304] text-[#f0f0f2] antialiased min-h-screen selection:bg-amber-deep/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
