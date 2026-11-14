"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { CustomerProfile, CustomerArtwork } from "@/lib/types";
import { MOCK_CUSTOMER } from "@/lib/data";
import { useCart } from "@/lib/cart";
import {
  Lock,
  Download,
  ShoppingBag,
  Trash2,
  ShieldCheck,
  Eye,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

export default function MyIrisPage() {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [mobileInput, setMobileInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewArtwork, setViewArtwork] = useState<CustomerArtwork | null>(null);
  const [deletionRequested, setDeletionRequested] = useState(false);

  const { addItem } = useCart();

  useEffect(() => {
    // Check if session token exists
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
    setOtpSent(true);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: mobileInput, otp: otpInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      setCustomer(data.customer);
      localStorage.setItem("iris_customer_session", JSON.stringify(data.customer));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("iris_customer_session");
    setCustomer(null);
    setOtpSent(false);
    setMobileInput("");
    setOtpInput("");
  };

  const handleOrderFormat = (art: CustomerArtwork, format: "digital" | "print" | "framed") => {
    const priceMap = { digital: 299, print: 499, framed: 799 };
    addItem({
      productId: `prod-${format}`,
      title: `${art.title} — ${format.toUpperCase()}`,
      format: format,
      size: "Gallery Medium",
      price: priceMap[format],
      quantity: 1,
      irisArtworkId: art.id,
      irisArtworkName: art.title,
    });
  };

  return (
    <main className="relative bg-[#030405] text-[#f0f0f2] min-h-screen selection:bg-[#7ec8e3]/30">
      <Header />

      <section className="pt-32 pb-20 px-6 sm:px-12 md:px-16 max-w-7xl mx-auto">
        {!customer ? (
          /* ─── Client Authentication Portal ─── */
          <div className="max-w-md mx-auto my-12 border border-[#1a1a28] bg-[#07070c]/90 p-8 sm:p-10 flex flex-col gap-6">
            <div className="flex flex-col gap-2 border-b border-[#161622] pb-5">
              <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-[#7ec8e3]">
                <Lock className="w-3.5 h-3.5" />
                <span>SECURE BIOMETRIC VAULT</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-light uppercase text-white">
                CLIENT ACCESS
              </h1>
              <p className="text-xs font-sans text-[#8e8e9c] leading-relaxed">
                Access your private high-resolution iris captures, certified provenance, and archival orders.
              </p>
            </div>

            {error && (
              <div className="p-3 border border-[#e05848]/60 bg-[#e05848]/10 text-xs font-mono text-[#fca5a5]">
                {error}
              </div>
            )}

            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[#9e9ea8]">
                    Registered Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9840099881"
                    value={mobileInput}
                    onChange={(e) => setMobileInput(e.target.value)}
                    required
                    className="p-3 border border-[#222232] bg-[#0c0c14] text-white text-xs font-sans focus:outline-none focus:border-[#7ec8e3]"
                  />
                  <span className="text-[10px] font-mono text-[#666677]">
                    Tip: Enter any 10-digit number (e.g. 9840099881) for development access.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#7ec8e3] hover:bg-[#68bcdb] text-[#030304] text-xs font-sans font-semibold tracking-[0.22em] uppercase transition-all"
                >
                  REQUEST ACCESS CODE
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4 animate-fadeIn">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[#9e9ea8]">
                    Verification Code (OTP)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter any 4-digit code (e.g. 1234)"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    required
                    className="p-3 border border-[#222232] bg-[#0c0c14] text-white text-xs font-sans focus:outline-none focus:border-[#7ec8e3]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#7ec8e3] hover:bg-[#68bcdb] text-[#030304] text-xs font-sans font-semibold tracking-[0.22em] uppercase transition-all disabled:opacity-50"
                >
                  {loading ? "VERIFYING..." : "ENTER PRIVATE VAULT"}
                </button>

                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-[10px] font-mono text-[#777788] hover:text-white uppercase tracking-wider text-center"
                >
                  CHANGE NUMBER
                </button>
              </form>
            )}

            <div className="p-3 border border-[#161622] bg-[#050508] text-[10px] font-mono text-[#555566] flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#7ec8e3]" />
              <span>TLS 1.3 End-to-End Vault Encryption Active</span>
            </div>
          </div>
        ) : (
          /* ─── Authenticated Customer Dashboard ─── */
          <div className="flex flex-col gap-12">
            {/* Top Profile Bar */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#181824] pb-8">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2.5 text-[10px] font-mono tracking-[0.30em] uppercase text-[#7ec8e3]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7ec8e3] animate-pulse" />
                  <span>AUTHENTICATED CLIENT VAULT</span>
                </div>
                <h1 className="font-display text-3xl sm:text-5xl font-light uppercase text-white">
                  WELCOME, {customer.name}
                </h1>
                <span className="font-mono text-xs text-[#777788]">
                  ID: {customer.id} • {customer.mobile}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  href="/track-order"
                  className="px-4 py-2 border border-[#222230] hover:border-[#7ec8e3] text-xs font-mono uppercase tracking-wider text-white transition-colors"
                >
                  TRACK RECENT ORDERS
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-[#331111] hover:border-[#ff4444] text-xs font-mono uppercase tracking-wider text-[#ff8888] transition-colors"
                >
                  SIGN OUT
                </button>
              </div>
            </div>

            {/* Private Artworks Collection */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl uppercase text-white">
                  YOUR CAPTURED IRIS MASTERWORKS ({customer.artworks.length})
                </h2>
                <span className="font-mono text-xs text-[#7ec8e3] uppercase tracking-wider">
                  Verified Biometric Archive
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {customer.artworks.map((art) => (
                  <div
                    key={art.id}
                    className="border border-[#1a1a28] bg-[#08080e] p-6 flex flex-col justify-between gap-6 group hover:border-[#7ec8e3]/60 transition-all duration-300"
                  >
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#040406] border border-[#202030]">
                      <Image
                        src={art.previewUrl}
                        alt={art.title}
                        fill
                        className="object-cover transform transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] tracking-widest uppercase text-[#7ec8e3]">
                          {art.eyeType}
                        </span>
                        <span className="font-mono text-[10px] text-[#666677]">
                          Captured: {art.capturedAt}
                        </span>
                      </div>
                      <h3 className="font-display text-xl uppercase text-white">
                        {art.title}
                      </h3>
                      <span className="text-xs font-mono text-[#808092]">
                        {art.location} • Color: {art.dominantColor}
                      </span>
                    </div>

                    {/* Actions: View, Download, Order */}
                    <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#161622]">
                      <button
                        onClick={() => setViewArtwork(art)}
                        className="inline-flex items-center gap-2 px-3 py-2 border border-[#222232] hover:border-[#7ec8e3] text-[11px] font-mono uppercase tracking-wider text-white"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#7ec8e3]" />
                        <span>ZOOM</span>
                      </button>

                      <a
                        href={art.highResAuthorizedUrl}
                        download={`iris_artwork_${art.id}.png`}
                        className="inline-flex items-center gap-2 px-3 py-2 border border-[#222232] hover:border-[#7ec8e3] text-[11px] font-mono uppercase tracking-wider text-white"
                      >
                        <Download className="w-3.5 h-3.5 text-[#7ec8e3]" />
                        <span>DOWNLOAD 4K</span>
                      </a>

                      <button
                        onClick={() => handleOrderFormat(art, "framed")}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#7ec8e3] hover:bg-[#68bcdb] text-[#030304] text-[11px] font-sans font-semibold uppercase tracking-wider ml-auto"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>ORDER PRINT / FRAME</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy & Data Rights Section */}
            <div className="p-6 sm:p-8 border border-[#1e1e2c] bg-[#07070b] flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-[#7ec8e3] text-xs font-mono uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>BIOMETRIC PRIVACY & ERASURE RIGHTS</span>
                </div>
                <span className="text-[10px] font-mono text-[#555566]">
                  Consent on file: {customer.consentRecordedAt}
                </span>
              </div>

              <p className="text-xs font-sans text-[#8e8e9c] leading-relaxed max-w-3xl">
                In compliance with international biometric data stewardship standards, you hold the right
                to request complete erasure of your stroma scans and cryptographic records at any time.
              </p>

              {deletionRequested ? (
                <div className="p-4 border border-[#7ec8e3]/40 bg-[#7ec8e3]/10 text-xs font-mono text-[#7ec8e3] flex items-center gap-3">
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    Your data erasure request has been queued. Studio custodians will wipe the files within 48 hours.
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => setDeletionRequested(true)}
                  className="self-start inline-flex items-center gap-2 px-4 py-2 border border-[#442222] hover:border-[#ff4444] text-[11px] font-mono text-[#ff8888] uppercase tracking-wider transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>REQUEST COMPLETE DATA DELETION</span>
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ─── Detail Zoom Modal ─── */}
      {viewArtwork && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl animate-fadeIn"
          onClick={() => setViewArtwork(null)}
        >
          <div
            className="relative w-full max-w-3xl aspect-square rounded-2xl overflow-hidden border border-[#222232] bg-[#020204]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={viewArtwork.previewUrl}
              alt={viewArtwork.title}
              fill
              className="object-contain"
            />
            <button
              onClick={() => setViewArtwork(null)}
              className="absolute top-4 right-4 px-3 py-1.5 bg-black/70 border border-white/20 text-xs font-mono uppercase text-white"
            >
              CLOSE [ESC]
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
