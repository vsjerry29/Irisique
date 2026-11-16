"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SITE_CONFIG } from "@/lib/config";
import { ArrowUpRight, Check, MapPin, Calendar, Users, Phone, User } from "lucide-react";
import OpticalTrace from "@/components/ui/OpticalTrace";

export default function BookPage() {
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    people: 1,
    date: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedResult, setSubmittedResult] = useState<{
    whatsappUrl: string;
    details: typeof formData;
  } | null>(null);

  const handlePeopleChange = (delta: number) => {
    setFormData((prev) => ({
      ...prev,
      people: Math.max(1, Math.min(8, prev.people + delta)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Please provide your full name.");
      return;
    }

    const cleanMobile = formData.mobile.replace(/[^0-9]/g, "");
    if (cleanMobile.length < 10) {
      setError("Please provide a valid 10-digit mobile number.");
      return;
    }

    if (!formData.date) {
      setError("Please select your preferred session date.");
      return;
    }

    setLoading(true);

    try {
      // Send to internal enquiry logger
      await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          mobile: cleanMobile,
          numberOfPeople: formData.people,
          preferredDate: formData.date,
          preferredLocation: "White Town, Pondicherry",
          consentGiven: true,
        }),
      });

      // Format WhatsApp prefill message
      const text = encodeURIComponent(
        `Hello Iris Atelier, I would like to request an iris portrait session in Pondicherry.\n\n` +
        `• Name: ${formData.name.trim()}\n` +
        `• Mobile: ${cleanMobile}\n` +
        `• People: ${formData.people}\n` +
        `• Preferred Date: ${formData.date}\n` +
        `• Location: White Town Atelier, Pondicherry\n\n` +
        `Please let me know your available slots for this date.`
      );

      const whatsappUrl = `https://wa.me/${SITE_CONFIG.whatsapp.cleanNumber}?text=${text}`;

      setSubmittedResult({
        whatsappUrl,
        details: { ...formData },
      });
    } catch (err: any) {
      setError("Unable to process request. Please contact the atelier directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative bg-[#F4F1EA] text-[#090909] min-h-screen selection:bg-[#090909] selection:text-[#FAFAF8]">
      <Header />

      <section className="pt-32 pb-24 sm:pt-40 sm:pb-32 px-6 sm:px-12 md:px-16 max-w-7xl mx-auto">
        {/* ─── Asymmetrical Header ─── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-12 border-b border-[#090909]/15">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs font-mono tracking-[0.26em] text-[#706D68] uppercase">
              <span className="w-2 h-2 rounded-full bg-[#090909]" />
              <span>ATELIER APPOINTMENTS</span>
            </div>
            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-[-0.04em] uppercase text-[#090909] leading-[0.85]">
              BOOK YOUR<br />IRIS.
            </h1>
          </div>

          <p className="max-w-md font-sans text-sm sm:text-base text-[#706D68] leading-relaxed pb-1">
            A few details. One extraordinary portrait. Reserve your dedicated macro capture at our White Town studio.
          </p>
        </div>

        {/* ─── Two-Column Editorial Booking Area ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start pt-12 sm:pt-16">
          {/* Left Column: Exactly Four Primary Fields Form */}
          <div className="lg:col-span-7">
            {submittedResult ? (
              /* ─── Submitted Enquiry State ─── */
              <div className="p-8 sm:p-12 bg-[#FAFAF8] border border-[#090909]/15 flex flex-col gap-6 animate-fadeIn">
                <div className="space-y-2">
                  <span className="text-xs font-mono tracking-[0.24em] uppercase text-[#706D68] block">
                    SESSION REQUEST LOGGED
                  </span>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase text-[#090909]">
                    THANK YOU, {submittedResult.details.name.toUpperCase()}.
                  </h2>
                  <p className="font-sans text-sm text-[#706D68] leading-relaxed">
                    Your appointment request has been received. To review available time slots and finalize your session, tap below to open WhatsApp with the atelier.
                  </p>
                </div>

                <div className="p-5 border border-[#090909]/10 bg-[#F4F1EA] text-xs font-mono space-y-2 text-[#706D68]">
                  <div className="flex justify-between">
                    <span>PARTICIPANTS</span>
                    <span className="text-[#090909] font-bold">{submittedResult.details.people} Subject(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>REQUESTED DATE</span>
                    <span className="text-[#090909] font-bold">{submittedResult.details.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>LOCATION</span>
                    <span className="text-[#090909] font-bold">White Town, Pondicherry</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                  <a
                    href={submittedResult.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-8 py-4 bg-[#090909] text-[#FAFAF8] text-xs font-sans font-bold tracking-[0.22em] uppercase hover:bg-[#262626] transition-all inline-flex items-center justify-center gap-2"
                  >
                    <span>CONNECT ON WHATSAPP</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => setSubmittedResult(null)}
                    className="w-full sm:w-auto px-6 py-4 text-xs font-mono uppercase tracking-wider text-[#706D68] hover:text-[#090909] transition-colors"
                  >
                    MODIFY REQUEST
                  </button>
                </div>

                <p className="text-[11px] font-mono text-[#706D68] pt-2 border-t border-[#090909]/10">
                  Notice: Your appointment is an enquiry awaiting studio confirmation and is not finalized until our atelier contacts you.
                </p>
              </div>
            ) : (
              /* ─── Streamlined 4-Field Form ─── */
              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-mono">
                    {error}
                  </div>
                )}

                {/* 1. Full Name */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-xs font-mono tracking-[0.20em] uppercase text-[#090909] font-bold">
                    01 / FULL NAME *
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-4 bg-transparent border-b-2 border-[#090909]/20 focus:border-[#090909] outline-none text-base sm:text-lg font-sans text-[#090909] placeholder:text-[#706D68]/50 transition-colors"
                  />
                </div>

                {/* 2. Mobile Number */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="mobile" className="text-xs font-mono tracking-[0.20em] uppercase text-[#090909] font-bold">
                    02 / WHATSAPP MOBILE NUMBER *
                  </label>
                  <input
                    id="mobile"
                    type="tel"
                    required
                    placeholder="e.g. 98400 99881"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-4 py-4 bg-transparent border-b-2 border-[#090909]/20 focus:border-[#090909] outline-none text-base sm:text-lg font-sans text-[#090909] placeholder:text-[#706D68]/50 transition-colors"
                  />
                  <span className="text-[11px] font-mono text-[#706D68]">
                    We use WhatsApp for slot confirmation and preview proofing.
                  </span>
                </div>

                {/* 3. Number of People Stepper */}
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-mono tracking-[0.20em] uppercase text-[#090909] font-bold">
                    03 / NUMBER OF PEOPLE *
                  </label>
                  <div className="flex items-center gap-6 py-2">
                    <button
                      type="button"
                      onClick={() => handlePeopleChange(-1)}
                      className="w-12 h-12 flex items-center justify-center border border-[#090909]/30 text-lg font-mono text-[#090909] hover:bg-[#090909] hover:text-white transition-all cursor-pointer"
                      aria-label="Decrease participants"
                    >
                      −
                    </button>
                    <span className="font-display text-3xl font-bold text-[#090909] w-12 text-center">
                      {formData.people}
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePeopleChange(1)}
                      className="w-12 h-12 flex items-center justify-center border border-[#090909]/30 text-lg font-mono text-[#090909] hover:bg-[#090909] hover:text-white transition-all cursor-pointer"
                      aria-label="Increase participants"
                    >
                      +
                    </button>
                    <span className="text-xs font-mono text-[#706D68] ml-2">
                      {formData.people === 1
                        ? "(Solo Stroma Portrait)"
                        : formData.people === 2
                        ? "(Couple / Duo Composition)"
                        : "(Family Constellation)"}
                    </span>
                  </div>
                </div>

                {/* 4. Preferred Date */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="date" className="text-xs font-mono tracking-[0.20em] uppercase text-[#090909] font-bold">
                    04 / PREFERRED DATE *
                  </label>
                  <input
                    id="date"
                    type="date"
                    required
                    min={today}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-4 bg-transparent border-b-2 border-[#090909]/20 focus:border-[#090909] outline-none text-base sm:text-lg font-sans text-[#090909] transition-colors"
                  />
                  <span className="text-[11px] font-mono text-[#706D68]">
                    Studio hours: Tuesday to Sunday, 10:00 to 19:30.
                  </span>
                </div>

                {/* Studio Location Indicator */}
                <div className="p-4 border border-[#090909]/10 bg-[#FAFAF8] flex items-center gap-3 text-xs font-mono text-[#706D68]">
                  <MapPin className="w-4 h-4 text-[#090909]" />
                  <span>LOCATION: ATELIER IRIS, WHITE TOWN, PONDICHERRY 605001</span>
                </div>

                {/* Primary CTA */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-[#090909] text-[#FAFAF8] text-xs font-sans font-bold tracking-[0.24em] uppercase hover:bg-[#262626] transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
                  >
                    <span>{loading ? "PREPARING REQUEST..." : "REQUEST A SESSION"}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Privacy acknowledgement */}
                <p className="text-[11px] font-mono text-[#706D68] leading-relaxed">
                  By submitting this request, you agree to our atelier enquiry policy. Your biometric photography session is conducted under safe optical illumination and your raw stroma captures remain private.
                </p>
              </form>
            )}
          </div>

          {/* Right Column: Secondary Iris Visual & Studio Context */}
          <div className="lg:col-span-5 flex flex-col gap-8 lg:pl-6">
            <div className="relative w-full aspect-square max-h-[500px] overflow-hidden bg-transparent">
              <Image
                src="/assets/gallery/iris_amber.webp"
                alt="Bespoke Macro Iris"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-contain"
              />
            </div>

            <div className="space-y-4 border-t border-[#090909]/15 pt-6 text-xs font-mono text-[#706D68]">
              <div className="flex items-center gap-2 text-[#090909] font-bold uppercase tracking-wider">
                <span>THE ATELIER PROTOCOL</span>
              </div>
              <p className="font-sans text-sm leading-relaxed text-[#706D68]">
                Each sitting takes approximately 20 minutes in our calibrated darkroom. We guide your eye through high-resolution optical positioning with zero corneal contact.
              </p>
              <div className="pt-2 flex items-center justify-between text-[11px] uppercase tracking-wider">
                <span>ESTIMATED DURATION</span>
                <span className="text-[#090909] font-bold">20 MINUTES</span>
              </div>
              <div className="flex items-center justify-between text-[11px] uppercase tracking-wider">
                <span>PROOFING TIME</span>
                <span className="text-[#090909] font-bold">SAME DAY</span>
              </div>
            </div>

            <div className="w-full h-16 opacity-40">
              <OpticalTrace theme="light" variant="compact" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
