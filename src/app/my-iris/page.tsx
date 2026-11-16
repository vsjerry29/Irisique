"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CustomerProfile, CustomerArtwork } from "@/lib/types";
import { MOCK_CUSTOMER } from "@/lib/data";
import { useCart } from "@/lib/cart";
import { Lock, Download, ArrowUpRight, X, Eye } from "lucide-react";
import OpticalTrace from "@/components/ui/OpticalTrace";

export default function MyIrisPage() {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [mobileInput, setMobileInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewArtwork, setViewArtwork] = useState<CustomerArtwork | null>(null);

  const { addItem } = useCart();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("iris_customer_session");
      if (saved) {
        setCustomer(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = mobileInput.replace(/[^0-9]/g, "");
    if (clean.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setOtpSent(true);
      setLoading(false);
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      // Sign in with verified mock customer session
      const profile = {
        ...MOCK_CUSTOMER,
        mobile: mobileInput,
      };
      setCustomer(profile);
      try {
        localStorage.setItem("iris_customer_session", JSON.stringify(profile));
      } catch {}
      setLoading(false);
    }, 600);
  };

  const handleSignOut = () => {
    setCustomer(null);
    try {
      localStorage.removeItem("iris_customer_session");
    } catch {}
  };

  return (
    <main className="relative bg-[#F4F1EA] text-[#090909] min-h-screen selection:bg-[#090909] selection:text-[#FAFAF8]">
      <Header />

      <section className="pt-32 pb-24 sm:pt-40 sm:pb-32 px-6 sm:px-12 md:px-16 max-w-7xl mx-auto">
        {!customer ? (
          /* ─── Client Authentication Portal ─── */
          <div className="max-w-md mx-auto my-12 border border-[#090909]/15 bg-[#FAFAF8] p-8 sm:p-12 flex flex-col gap-6 select-none animate-fadeIn">
            <div className="flex flex-col gap-2 border-b border-[#090909]/10 pb-5">
              <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-[#706D68]">
                <Lock className="w-3.5 h-3.5 text-[#090909]" />
                <span>PRIVATE CLIENT ACCESS</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold uppercase text-[#090909]">
                MY IRIS ARCHIVE.
              </h1>
              <p className="text-xs sm:text-sm font-sans text-[#706D68] leading-relaxed">
                Access your captured high-resolution iris stroma files, provenance certificates, and orders.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-xs font-mono text-red-700">
                {error}
              </div>
            )}

            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#090909] font-bold">
                    Registered Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 98400 99881"
                    value={mobileInput}
                    onChange={(e) => setMobileInput(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-transparent border-b-2 border-[#090909]/20 focus:border-[#090909] outline-none text-base font-mono text-[#090909]"
                  />
                  <span className="text-[11px] font-mono text-[#706D68]">
                    We will send a one-time authentication code.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#090909] text-[#FAFAF8] text-xs font-sans font-bold tracking-[0.22em] uppercase hover:bg-[#262626] transition-colors cursor-pointer"
                >
                  {loading ? "SENDING CODE..." : "REQUEST AUTHENTICATION CODE"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#090909] font-bold">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter any 4-6 digits"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-transparent border-b-2 border-[#090909]/20 focus:border-[#090909] outline-none text-center font-mono text-xl tracking-[0.5em] text-[#090909]"
                  />
                  <span className="text-[11px] font-mono text-[#706D68]">
                    Verification for {mobileInput} (Development access)
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#090909] text-[#FAFAF8] text-xs font-sans font-bold tracking-[0.22em] uppercase hover:bg-[#262626] transition-colors cursor-pointer"
                >
                  {loading ? "VERIFYING..." : "ENTER PRIVATE GALLERY"}
                </button>

                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-xs font-mono text-[#706D68] hover:text-[#090909] text-center"
                >
                  Use a different number
                </button>
              </form>
            )}
          </div>
        ) : (
          /* ─── Client Private Gallery ─── */
          <div className="flex flex-col gap-12 sm:gap-16">
            {/* Header with Sign Out */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pb-8 border-b border-[#090909]/15">
              <div className="space-y-2">
                <span className="text-xs font-mono tracking-[0.24em] uppercase text-[#706D68]">
                  PRIVATE CLIENT ATELIER
                </span>
                <h1 className="font-display text-4xl sm:text-6xl font-bold uppercase text-[#090909]">
                  {customer.name}
                </h1>
                <p className="text-xs font-mono text-[#706D68]">
                  Registered: {customer.mobile} • Member ID: {customer.id}
                </p>
              </div>

              <button
                onClick={handleSignOut}
                className="px-6 py-2.5 border border-[#090909]/30 hover:border-[#090909] text-xs font-mono uppercase tracking-wider text-[#090909] transition-colors cursor-pointer"
              >
                SIGN OUT
              </button>
            </div>

            {/* Customer Stroma Artwork Grid */}
            <div className="space-y-6">
              <h2 className="font-sans text-xs uppercase tracking-[0.24em] text-[#090909] font-bold">
                YOUR CAPTURED MASTERWORKS ({customer.artworks.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-14">
                {customer.artworks.map((art) => (
                  <div
                    key={art.id}
                    className="group border border-[#090909]/15 bg-[#FAFAF8] p-6 sm:p-8 flex flex-col gap-6"
                  >
                    <div className="relative w-full aspect-square max-h-[400px] overflow-hidden bg-transparent">
                      <Image
                        src={art.previewUrl}
                        alt={art.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-contain"
                      />
                    </div>

                    <div className="flex flex-col gap-2 pt-4 border-t border-[#090909]/10">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-sans text-lg font-bold uppercase tracking-wider text-[#090909]">
                          {art.title}
                        </h3>
                        <span className="font-mono text-xs text-[#706D68]">
                          {new Date(art.capturedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-[#706D68]">
                        {art.eyeType} • {art.location}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                      <Link
                        href={`/shop?artwork=${art.id}`}
                        className="flex-1 py-3 px-4 bg-[#090909] text-[#FAFAF8] text-xs font-sans font-bold tracking-wider uppercase hover:bg-[#262626] transition-colors text-center"
                      >
                        COMMISSION PHYSICAL PRINT
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
