"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { X, Trash2, ArrowRight, ShoppingBag } from "lucide-react";

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, totalPrice, isCartOpen, setIsCartOpen } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div
        className="relative w-full max-w-md h-full bg-[#08080c] border-l border-[#1a1a24] flex flex-col justify-between p-6 sm:p-8 text-[#f0f0f2] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#181822] pb-5">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-[#7ec8e3]" />
            <h3 className="font-display text-lg tracking-[0.16em] uppercase text-white">
              YOUR ATELIER CART
            </h3>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-[#888898] hover:text-white transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-[#777788]">
              <span className="font-mono text-xs uppercase tracking-widest">Your cart is empty</span>
              <p className="text-xs max-w-xs text-[#555566]">
                Explore our curated iris fine art collections to select a format.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4 p-4 border border-[#161622] bg-[#0c0c14]/70"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-display text-sm tracking-wide text-white uppercase">
                    {item.title}
                  </span>
                  <span className="font-mono text-[11px] text-[#7ec8e3] tracking-widest uppercase">
                    {item.format} • {item.size}
                  </span>
                  {item.irisArtworkName && (
                    <span className="text-[10px] font-sans text-[#8e8e9c]">
                      Artwork: {item.irisArtworkName}
                    </span>
                  )}
                  <span className="font-mono text-xs text-[#dedee5] mt-1">
                    ₹{item.price} each
                  </span>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-[#666677] hover:text-[#e05848] transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center border border-[#222230] text-xs">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2 py-0.5 hover:bg-[#1a1a28] text-white"
                    >
                      -
                    </button>
                    <span className="px-2 font-mono text-xs text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-0.5 hover:bg-[#1a1a28] text-white"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#181822] pt-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs tracking-widest uppercase text-[#888898]">
                ESTIMATED SUB-TOTAL
              </span>
              <span className="font-mono text-lg font-medium text-white">
                ₹{totalPrice}
              </span>
            </div>
            <p className="text-[10px] text-[#666677] leading-relaxed">
              Price includes studio proofing & certificate of provenance. Shipping calculated at checkout.
            </p>
            <Link
              href="/shop"
              onClick={() => setIsCartOpen(false)}
              className="inline-flex items-center justify-center gap-3 w-full py-3.5 bg-[#7ec8e3] hover:bg-[#68bcdb] text-[#030304] font-sans font-semibold text-xs tracking-[0.22em] uppercase transition-all"
            >
              <span>PROCEED TO ORDER ENQUIRY</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
