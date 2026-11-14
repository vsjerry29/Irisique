"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Order, OrderStatus } from "@/lib/types";
import { Search, CheckCircle2, Clock, Package, Truck, Home, AlertCircle } from "lucide-react";

const STATUS_STEPS: OrderStatus[] = [
  "Request received",
  "Confirmed",
  "Artwork processing",
  "Printing",
  "Ready for dispatch",
  "Shipped",
  "Delivered",
];

export default function TrackOrderPage() {
  const [searchId, setSearchId] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check URL param ?id=IRIS-XXXX on mount
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

  const getCurrentStepIndex = (currentStatus: OrderStatus) => {
    const idx = STATUS_STEPS.indexOf(currentStatus);
    return idx === -1 ? 0 : idx;
  };

  return (
    <main className="relative bg-[#030405] text-[#f0f0f2] min-h-screen selection:bg-[#7ec8e3]/30">
      <Header />

      <section className="pt-32 pb-20 px-6 sm:px-12 md:px-16 max-w-4xl mx-auto">
        <div className="flex flex-col gap-3 border-b border-[#181824] pb-8 mb-10 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2.5 text-[10px] font-mono tracking-[0.30em] uppercase text-[#7ec8e3]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7ec8e3] animate-pulse" />
            <span>PRODUCTION DISPATCH PIPELINE</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-light uppercase text-white">
            TRACK ATELIER ORDER.
          </h1>
          <p className="text-xs sm:text-sm font-sans text-[#8e8e9c] leading-relaxed">
            Enter your order reference code (e.g. <span className="font-mono text-white">IRIS-7402</span> or <span className="font-mono text-white">IRIS-8821</span>) to inspect real-time calibration and dispatch status.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7ec8e3]" />
            <input
              type="text"
              placeholder="e.g. IRIS-7402"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 border border-[#222232] bg-[#07070c] text-white text-xs font-mono uppercase tracking-wider focus:outline-none focus:border-[#7ec8e3]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 bg-[#7ec8e3] hover:bg-[#68bcdb] text-[#030304] text-xs font-sans font-semibold tracking-[0.20em] uppercase transition-all disabled:opacity-50"
          >
            {loading ? "SEARCHING..." : "INSPECT STATUS"}
          </button>
        </form>

        {error && (
          <div className="p-4 border border-[#e05848]/60 bg-[#e05848]/10 text-xs font-mono text-[#fca5a5] flex items-center gap-3 mb-8">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Order Details & Timeline */}
        {order && (
          <div className="p-6 sm:p-10 border border-[#1e1e2c] bg-[#08080e] flex flex-col gap-8 animate-fadeIn">
            {/* Order Meta Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#181824] pb-6">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] tracking-widest uppercase text-[#7ec8e3]">
                  VERIFIED ORDER RECORD
                </span>
                <h3 className="font-display text-2xl uppercase text-white">
                  {order.id}
                </h3>
                <span className="font-mono text-xs text-[#777788]">
                  Created: {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex flex-col sm:items-end gap-1">
                <span className="px-3 py-1 border border-[#7ec8e3]/40 bg-[#7ec8e3]/10 text-[#7ec8e3] text-xs font-mono uppercase tracking-wider">
                  {order.status}
                </span>
                <span className="font-mono text-xs text-[#9a9aa8]">
                  Customer: {order.customerName} ({order.city})
                </span>
              </div>
            </div>

            {/* Stepped Progress Timeline */}
            <div className="flex flex-col gap-4">
              <span className="text-xs font-mono tracking-widest uppercase text-white">
                CRAFTSMANSHIP & DISPATCH STAGES
              </span>

              <div className="relative flex flex-col md:flex-row items-start justify-between gap-6 md:gap-2 pt-2">
                {STATUS_STEPS.map((step, idx) => {
                  const currentIdx = getCurrentStepIndex(order.status);
                  const isDone = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div
                      key={step}
                      className="flex md:flex-col items-center gap-3 text-left md:text-center flex-1"
                    >
                      {/* Step Indicator Dot */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-[10px] transition-all ${
                          isDone
                            ? "bg-[#7ec8e3] text-[#030304] font-bold shadow-[0_0_12px_rgba(126,200,227,0.4)]"
                            : "border border-[#2a2a3a] text-[#555566] bg-[#06060a]"
                        }`}
                      >
                        {isDone ? "✓" : idx + 1}
                      </div>

                      <div className="flex flex-col">
                        <span
                          className={`text-xs font-mono uppercase tracking-wider ${
                            isCurrent
                              ? "text-white font-semibold"
                              : isDone
                              ? "text-[#a0a0b2]"
                              : "text-[#555566]"
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ordered Items Table */}
            <div className="flex flex-col gap-3 border-t border-[#181824] pt-6">
              <span className="text-xs font-mono tracking-widest uppercase text-white">
                COMMISSIONED ATELIER PIECES
              </span>
              <div className="flex flex-col gap-2">
                {order.items.map((it, i) => (
                  <div
                    key={i}
                    className="p-3 border border-[#161622] bg-[#050508] flex items-center justify-between text-xs"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-white">{it.title}</span>
                      <span className="text-[10px] font-mono text-[#7ec8e3]">
                        {it.format.toUpperCase()} • {it.size}
                      </span>
                    </div>
                    <span className="font-mono text-white">
                      ₹{it.price} × {it.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Destination & Payment Verification */}
            <div className="p-4 border border-[#1a1a26] bg-[#050508] text-xs font-mono text-[#808092] flex flex-col gap-1.5">
              <span className="text-white uppercase tracking-wider">DISPATCH NOTES</span>
              <span>• Delivery Address: {order.deliveryAddress}, {order.city}</span>
              <span>• Total Value: ₹{order.totalAmount}</span>
              <span>• Studio Reference Verification: Active</span>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
