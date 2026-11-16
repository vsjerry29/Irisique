"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { SITE_CONFIG } from "@/lib/config";
import { X, Trash2, ArrowUpRight, ShoppingBag } from "lucide-react";

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, totalPrice, isCartOpen, setIsCartOpen } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Keyboard accessibility: Escape to close & body scroll lock
  useEffect(() => {
    if (!isCartOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsCartOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  const handleWhatsAppEnquiry = () => {
    if (items.length === 0) return;
    const itemsSummary = items
      .map(
        (it) =>
          `• ${it.title} (${it.size}) × ${it.quantity} — $${it.price * it.quantity}`
      )
      .join("\n");

    const text = encodeURIComponent(
      `Hello Iris Atelier, I would like to place an order enquiry for the following items:\n\n` +
      `${itemsSummary}\n\n` +
      `Total Estimated Amount: $${totalPrice}\n\n` +
      `Please let me know how to proceed with the commission.`
    );

    window.open(`https://wa.me/${SITE_CONFIG.whatsapp.cleanNumber}?text=${text}`, "_blank");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Atelier Cart"
      className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn"
      onClick={() => setIsCartOpen(false)}
    >
      <div
        ref={drawerRef}
        className="relative w-full max-w-md h-full bg-[#FAFAF8] text-[#090909] border-l border-[#090909]/15 flex flex-col justify-between p-6 sm:p-8 shadow-2xl select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#090909]/15 pb-5">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#090909]" />
            <h3 className="font-display text-lg tracking-[0.16em] uppercase text-[#090909] font-bold">
              YOUR ATELIER CART
            </h3>
          </div>
          <button
            ref={closeBtnRef}
            onClick={() => setIsCartOpen(false)}
            className="flex items-center gap-2 px-3 py-1.5 border border-[#090909]/20 hover:border-[#090909] text-xs font-mono uppercase tracking-wider text-[#090909] transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <span>ESC</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 text-[#706D68]">
              <span className="font-mono text-xs uppercase tracking-widest">
                YOUR ATELIER CART IS EMPTY
              </span>
              <p className="text-xs max-w-xs leading-relaxed font-sans">
                Explore our curated formats and select a bespoke stroma piece to begin.
              </p>
              <Link
                href="/shop"
                onClick={() => setIsCartOpen(false)}
                className="mt-2 px-6 py-3 bg-[#090909] text-[#FAFAF8] text-xs font-sans uppercase font-bold tracking-[0.20em] hover:bg-[#262626] transition-colors"
              >
                EXPLORE SHOP
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4 p-4 border border-[#090909]/10 bg-[#F4F1EA]"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-sans text-sm font-bold tracking-wide text-[#090909] uppercase">
                    {item.title}
                  </span>
                  <span className="font-mono text-[11px] text-[#706D68] tracking-widest uppercase">
                    {item.size}
                  </span>
                  {item.irisArtworkName && (
                    <span className="text-[10px] font-sans text-[#706D68]">
                      Artwork: {item.irisArtworkName}
                    </span>
                  )}
                  <span className="font-mono text-xs text-[#090909] font-bold mt-1">
                    ${item.price} each
                  </span>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-[#706D68] hover:text-red-700 transition-colors p-1"
                    title="Remove item"
                    aria-label={`Remove ${item.title}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex items-center border border-[#090909]/30 text-xs font-mono">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2 py-0.5 hover:bg-[#090909] hover:text-white transition-colors"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="px-2 py-0.5 font-bold min-w-[20px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-0.5 hover:bg-[#090909] hover:text-white transition-colors"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Order Enquiry Action */}
        {items.length > 0 && (
          <div className="border-t border-[#090909]/15 pt-5 flex flex-col gap-4">
            <div className="flex items-baseline justify-between text-xs font-mono">
              <span className="text-[#706D68] uppercase tracking-wider">SUBTOTAL</span>
              <span className="text-xl font-bold font-mono text-[#090909]">${totalPrice}</span>
            </div>

            <p className="text-[11px] font-mono text-[#706D68] leading-tight">
              Taxes calculated at proofing. Bespoke pieces include Certificate of Authenticity.
            </p>

            <button
              onClick={handleWhatsAppEnquiry}
              className="w-full py-4 bg-[#090909] text-[#FAFAF8] text-xs font-sans font-bold tracking-[0.22em] uppercase hover:bg-[#262626] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>CONFIRM ORDER (WHATSAPP)</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
