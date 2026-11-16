"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Order, OrderStatus } from "@/lib/types";
import { ArrowUpRight, Check, Search, AlertCircle } from "lucide-react";
import OpticalTrace from "@/components/ui/OpticalTrace";

const STATUS_STEPS: string[] = [
  "Request received",
  "Confirmed",
  "Artwork preparation",
  "Production",
  "Dispatched",
  "Delivered",
];

export default function TrackOrderPage() {
  const [searchId, setSearchId] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const qId = params.get("id");
      if (qId) {
        setSearchId(qId);
        fetchOrder(qId);
      }
    }
  }, []);

  const fetchOrder = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const res = await fetch(`/api/orders?id=${encodeURIComponent(id.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Order with reference "${id}" could not be located.`);
      }
      setOrder(data.order);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(searchId);
  };

  const getCurrentStepIndex = (currentStatus: string) => {
    const idx = STATUS_STEPS.findIndex(
      (s) => s.toLowerCase() === (currentStatus || "").toLowerCase()
    );
    return idx === -1 ? 0 : idx;
  };

  return (
    <main className="relative bg-[#F4F1EA] text-[#090909] min-h-screen selection:bg-[#090909] selection:text-[#FAFAF8]">
      <Header />

      <section className="pt-32 pb-24 sm:pt-40 sm:pb-32 px-6 sm:px-12 md:px-16 max-w-5xl mx-auto">
        {/* ─── Header ─── */}
        <div className="flex flex-col gap-4 border-b border-[#090909]/15 pb-10">
          <div className="flex items-center gap-3 text-xs font-mono tracking-[0.26em] text-[#706D68] uppercase">
            <span className="w-2 h-2 rounded-full bg-[#090909]" />
            <span>ATELIER DISPATCH</span>
          </div>
          <h1 className="font-display text-5xl sm:text-7xl font-bold uppercase tracking-[-0.04em] text-[#090909] leading-[0.88]">
            TRACK ORDER.
          </h1>
          <p className="max-w-md font-sans text-sm sm:text-base text-[#706D68] leading-relaxed">
            Enter your atelier reference code (e.g. <span className="font-mono text-[#090909] font-bold">IRIS-7402</span>) to view real-time production status.
          </p>
        </div>

        {/* ─── Search Input Form ─── */}
        <form onSubmit={handleSearch} className="my-10 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            required
            placeholder="Enter Order Reference (e.g. IRIS-7402)"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="flex-1 px-5 py-4 bg-transparent border-b-2 border-[#090909]/20 focus:border-[#090909] outline-none text-base font-mono uppercase text-[#090909] placeholder:text-[#706D68]/50"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-[#090909] text-[#FAFAF8] text-xs font-sans font-bold tracking-[0.22em] uppercase hover:bg-[#262626] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? "SEARCHING..." : "TRACK STATUS"}</span>
            <Search className="w-4 h-4" />
          </button>
        </form>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-mono mb-8">
            {error}
          </div>
        )}

        {/* ─── Order Results with Optical Trace Progress ─── */}
        {order && (
          <div className="bg-[#FAFAF8] border border-[#090909]/15 p-8 sm:p-12 space-y-10 animate-fadeIn">
            {/* Top Order Details */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-[#090909]/15">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#706D68] block">
                  ORDER REFERENCE
                </span>
                <span className="font-display text-3xl font-bold uppercase text-[#090909]">
                  {order.id}
                </span>
              </div>
              <div className="text-left sm:text-right font-mono text-xs text-[#706D68] space-y-1">
                <div>LOGGED: {new Date(order.createdAt).toLocaleDateString()}</div>
                <div>DESTINATION: {order.city}</div>
              </div>
            </div>

            {/* Restrained Optical Trace Progress Indicator */}
            <div className="space-y-6">
              <span className="text-xs font-mono uppercase tracking-[0.22em] text-[#090909] font-bold block">
                PRODUCTION STAGES
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 font-mono text-xs">
                {STATUS_STEPS.map((step, idx) => {
                  const currentIdx = getCurrentStepIndex(order.status);
                  const isDone = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div
                      key={step}
                      className={`p-4 border transition-all ${
                        isCurrent
                          ? "border-[#090909] bg-[#090909] text-white"
                          : isDone
                          ? "border-[#090909]/40 bg-[#F4F1EA] text-[#090909]"
                          : "border-[#090909]/10 bg-transparent text-[#706D68]/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] opacity-70">0{idx + 1}</span>
                        {isDone && <Check className="w-3 h-3" />}
                      </div>
                      <span className="font-bold uppercase tracking-wider block text-[11px] leading-tight">
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items Specification */}
            <div className="space-y-4 pt-4 border-t border-[#090909]/15">
              <span className="text-xs font-mono uppercase tracking-[0.20em] text-[#090909] font-bold block">
                COMMISSIONED PIECES
              </span>
              <div className="space-y-3 font-mono text-xs">
                {order.items.map((it, i) => (
                  <div
                    key={i}
                    className="p-4 bg-[#F4F1EA] border border-[#090909]/10 flex justify-between items-center"
                  >
                    <div>
                      <span className="font-bold text-[#090909] uppercase block">{it.title}</span>
                      <span className="text-[#706D68]">{it.format} • {it.size}</span>
                    </div>
                    <span className="font-bold text-[#090909]">Qty: {it.quantity}</span>
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
