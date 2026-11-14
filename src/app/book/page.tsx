"use client";

import React, { useState } from "react";
import Image from "next/image";
import Header from "@/components/layout/Header";
import { SITE_CONFIG } from "@/lib/config";
import { ArrowUpRight, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";

export default function BookPage() {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    numberOfPeople: "1",
    preferredLocation: "Pondicherry Atelier (White Town)",
    preferredDate: "",
    preferredTime: "Morning (10:00 - 13:00)",
    productInterest: "Fine Art Print",
    message: "",
    consentGiven: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    id: string;
    whatsappUrl: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Please provide your full name.");
      return;
    }
    if (!formData.mobile.trim() || formData.mobile.replace(/[^0-9]/g, "").length < 10) {
      setError("Please provide a valid 10-digit mobile number.");
      return;
    }
    if (!formData.consentGiven) {
      setError("You must acknowledge the biometric photography privacy consent to proceed.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to log booking enquiry.");
      }
      setSuccessResult({
        id: data.booking.id,
        whatsappUrl: data.whatsappUrl,
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative bg-[#030405] text-[#f0f0f2] min-h-screen selection:bg-[#7ec8e3]/30">
      <Header />

      <section className="pt-32 pb-20 px-6 sm:px-12 md:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Visual Artwork & Studio Policy */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5 text-[10px] font-mono tracking-[0.30em] uppercase text-[#7ec8e3]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7ec8e3] animate-pulse" />
                <span>ATELIER SESSIONS</span>
              </div>
              <h1 className="font-display text-4xl sm:text-6xl font-light tracking-[-0.035em] uppercase text-white leading-tight">
                BOOK A PRIVATE SESSION.
              </h1>
              <p className="text-xs sm:text-sm font-sans text-[#8e8e9c] leading-relaxed">
                Step into our dedicated macro studio in Pondicherry. We capture your eye
                under non-invasive optical illumination in an intimate 20-minute session.
              </p>
            </div>

            {/* Featured Visual */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-[#222230] bg-[#07070c] shadow-[0_0_60px_rgba(0,0,0,0.8)]">
              <Image
                src="/assets/gallery/iris_amber.webp"
                alt="Iris Photography Session"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 p-3 bg-black/80 backdrop-blur-md border border-[#222230] text-[10px] font-mono text-[#8e8e9c]">
                <span>LOCATION: {SITE_CONFIG.location.toUpperCase()} • NON-INVASIVE CAPTURE</span>
              </div>
            </div>

            {/* Privacy & Protocol */}
            <div className="p-5 border border-[#1b1b28] bg-[#07070b]/80 flex flex-col gap-3">
              <div className="flex items-center gap-2.5 text-[#7ec8e3] text-xs font-mono uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>BIOMETRIC SAFETY PROTOCOL</span>
              </div>
              <p className="text-xs font-sans text-[#7a7a8a] leading-relaxed">
                {SITE_CONFIG.privacy.collectionNotice}
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Booking Form */}
          <div className="lg:col-span-7 border border-[#1a1a28] bg-[#07070c]/90 p-6 sm:p-10 md:p-12">
            {successResult ? (
              <div className="flex flex-col gap-6 text-left animate-fadeIn">
                <div className="flex items-center gap-3 text-[#7ec8e3]">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="font-mono text-xs tracking-widest uppercase">
                    ENQUIRY LOGGED [{successResult.id}]
                  </span>
                </div>

                <h3 className="font-display text-3xl font-light uppercase text-white">
                  NEXT STEP: CONFIRM ON WHATSAPP
                </h3>

                <p className="font-sans text-xs sm:text-sm text-[#9a9aa8] leading-relaxed">
                  Your reservation request has been created in our atelier queue.
                  <strong className="text-white block mt-1">
                    *Important: This booking is an enquiry and is NOT yet finalized.*
                  </strong>
                  To verify schedule availability and reserve your slot, connect directly with
                  our studio manager via WhatsApp.
                </p>

                <div className="p-4 border border-[#26263a] bg-[#0d0d16] font-mono text-xs text-[#808096] flex flex-col gap-2">
                  <span>• Reference: {successResult.id}</span>
                  <span>• Name: {formData.name}</span>
                  <span>• Mobile: {formData.mobile}</span>
                  <span>• Slot: {formData.preferredDate || "Flexible"} ({formData.preferredTime})</span>
                </div>

                <a
                  href={successResult.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 w-full py-4 bg-[#7ec8e3] hover:bg-[#68bcdb] text-[#030304] font-sans font-semibold text-xs tracking-[0.24em] uppercase transition-all"
                >
                  <span>CONNECT ON WHATSAPP TO CONFIRM</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>

                <button
                  onClick={() => setSuccessResult(null)}
                  className="text-xs font-mono text-[#666677] hover:text-white uppercase tracking-widest text-center pt-2"
                >
                  SUBMIT ANOTHER ENQUIRY
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="border-b border-[#181824] pb-4">
                  <h3 className="font-display text-2xl uppercase text-white">
                    RESERVATION DETAILS
                  </h3>
                  <span className="font-mono text-xs text-[#666677] tracking-wider uppercase">
                    No upfront payment required for enquiry
                  </span>
                </div>

                {error && (
                  <div className="p-3 border border-[#e05848]/60 bg-[#e05848]/10 text-xs font-mono text-[#fca5a5] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Form Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-mono tracking-wider uppercase text-[#9e9ea8]">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maya Iyer"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="p-3 border border-[#222232] bg-[#0c0c14] text-white text-xs font-sans focus:outline-none focus:border-[#7ec8e3]"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-mono tracking-wider uppercase text-[#9e9ea8]">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98400 12345"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="p-3 border border-[#222232] bg-[#0c0c14] text-white text-xs font-sans focus:outline-none focus:border-[#7ec8e3]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-mono tracking-wider uppercase text-[#9e9ea8]">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. maya@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="p-3 border border-[#222232] bg-[#0c0c14] text-white text-xs font-sans focus:outline-none focus:border-[#7ec8e3]"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-mono tracking-wider uppercase text-[#9e9ea8]">
                      Number of Participants
                    </label>
                    <select
                      value={formData.numberOfPeople}
                      onChange={(e) => setFormData({ ...formData, numberOfPeople: e.target.value })}
                      className="p-3 border border-[#222232] bg-[#0c0c14] text-white text-xs font-sans focus:outline-none focus:border-[#7ec8e3]"
                    >
                      <option value="1">1 Person (Solo Stroma)</option>
                      <option value="2">2 Persons (Couple Harmony)</option>
                      <option value="3">3 Persons (Family Triad)</option>
                      <option value="4">4+ Persons (Group Constellation)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-mono tracking-wider uppercase text-[#9e9ea8]">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      className="p-3 border border-[#222232] bg-[#0c0c14] text-white text-xs font-sans focus:outline-none focus:border-[#7ec8e3]"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-mono tracking-wider uppercase text-[#9e9ea8]">
                      Preferred Window
                    </label>
                    <select
                      value={formData.preferredTime}
                      onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                      className="p-3 border border-[#222232] bg-[#0c0c14] text-white text-xs font-sans focus:outline-none focus:border-[#7ec8e3]"
                    >
                      <option value="Morning (10:00 - 13:00)">Morning (10:00 - 13:00)</option>
                      <option value="Afternoon (14:00 - 17:00)">Afternoon (14:00 - 17:00)</option>
                      <option value="Evening (17:00 - 20:00)">Evening (17:00 - 20:00)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-mono tracking-wider uppercase text-[#9e9ea8]">
                    Product Interest
                  </label>
                  <select
                    value={formData.productInterest}
                    onChange={(e) => setFormData({ ...formData, productInterest: e.target.value })}
                    className="p-3 border border-[#222232] bg-[#0c0c14] text-white text-xs font-sans focus:outline-none focus:border-[#7ec8e3]"
                  >
                    <option value="Fine Art Print (From ₹499)">Fine Art Print (From ₹499)</option>
                    <option value="Anodized Box Frame (From ₹799)">Anodized Box Frame (From ₹799)</option>
                    <option value="Digital 4K Master (From ₹299)">Digital 4K Master (From ₹299)</option>
                    <option value="Couple Artwork (From ₹999)">Couple Artwork (From ₹999)</option>
                    <option value="Family Constellation (From ₹1499)">Family Constellation (From ₹1499)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-mono tracking-wider uppercase text-[#9e9ea8]">
                    Special Requests or Message
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Any specific requests or occasion details..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="p-3 border border-[#222232] bg-[#0c0c14] text-white text-xs font-sans focus:outline-none focus:border-[#7ec8e3]"
                  />
                </div>

                {/* Biometric Consent Checkbox */}
                <div className="p-4 border border-[#222232] bg-[#0a0a10] flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="consentCheck"
                    required
                    checked={formData.consentGiven}
                    onChange={(e) => setFormData({ ...formData, consentGiven: e.target.checked })}
                    className="mt-1 accent-[#7ec8e3] cursor-pointer"
                  />
                  <label htmlFor="consentCheck" className="text-xs font-sans text-[#8e8e9c] cursor-pointer">
                    I understand that iris photography captures macroscopic optical reflections of the eye.
                    I consent to processing for bespoke fine art creation and acknowledge my data is stored securely.
                  </label>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#7ec8e3] hover:bg-[#68bcdb] text-[#030304] text-xs font-sans font-semibold tracking-[0.24em] uppercase transition-all disabled:opacity-50"
                >
                  {loading ? "PROCESSING ENQUIRY..." : "SEND SESSION ENQUIRY"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
