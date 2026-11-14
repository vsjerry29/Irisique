"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { PRODUCTS_CATALOG, GALLERY_ITEMS } from "@/lib/data";
import { Product, ProductVariant } from "@/lib/types";
import { useCart } from "@/lib/cart";
import { ArrowRight, CheckCircle2, ShieldCheck, ShoppingBag, AlertCircle } from "lucide-react";

export default function ShopPage() {
  const { items, addItem, removeItem, clearCart, totalPrice } = useCart();

  // Customizer State
  const [selectedProduct, setSelectedProduct] = useState<Product>(PRODUCTS_CATALOG[1]); // Default Print
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(PRODUCTS_CATALOG[1].variants[0]);
  const [selectedArtwork, setSelectedArtwork] = useState(GALLERY_ITEMS[0]);
  const [customInscription, setCustomInscription] = useState("");

  // Checkout Form State
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "shipping" | "success">("cart");
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
    city: "Pondicherry",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);

  // Read URL query params on load (e.g. /shop?format=digital)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const fmt = params.get("format");
      if (fmt) {
        const found = PRODUCTS_CATALOG.find((p) => p.format === fmt);
        if (found) {
          setSelectedProduct(found);
          setSelectedVariant(found.variants[0] || null);
        }
      }
    }
  }, []);

  const handleProductChange = (prod: Product) => {
    setSelectedProduct(prod);
    setSelectedVariant(prod.variants[0]);
  };

  const handleAddCustomizedToCart = () => {
    addItem({
      productId: selectedProduct.id,
      title: selectedProduct.title,
      format: selectedProduct.format,
      size: selectedVariant.size,
      price: selectedVariant.price,
      quantity: 1,
      irisArtworkName: selectedArtwork.name,
      personalisationText: customInscription || "Studio Proofing",
    });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError(null);

    if (!customerDetails.name.trim() || !customerDetails.mobile.trim() || !customerDetails.address.trim()) {
      setOrderError("Please complete all required shipping fields.");
      return;
    }

    if (items.length === 0) {
      setOrderError("Your atelier cart is empty.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerDetails.name,
          customerMobile: customerDetails.mobile,
          customerEmail: customerDetails.email,
          deliveryAddress: customerDetails.address,
          city: customerDetails.city,
          items: items,
          notes: customerDetails.notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Order submission failed.");
      }

      setConfirmedOrder(data.order);
      setCheckoutStep("success");
      clearCart();
    } catch (err: any) {
      setOrderError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative bg-[#030405] text-[#f0f0f2] min-h-screen selection:bg-[#7ec8e3]/30">
      <Header />

      <section className="pt-32 pb-20 px-6 sm:px-12 md:px-16 max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="flex flex-col gap-3 border-b border-[#181824] pb-8 mb-12">
          <div className="flex items-center gap-2.5 text-[10px] font-mono tracking-[0.30em] uppercase text-[#7ec8e3]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7ec8e3] animate-pulse" />
            <span>BESPOKE ATELIER STORE</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-light uppercase text-white">
            CONFIGURE & ORDER.
          </h1>
          <p className="max-w-xl text-xs sm:text-sm font-sans text-[#8e8e9c] leading-relaxed">
            Select an edition format, choose your stroma masterwork, and specify your archival sizing.
          </p>
        </div>

        {checkoutStep === "success" && confirmedOrder ? (
          /* ─── Success Confirmation ─── */
          <div className="max-w-2xl mx-auto p-8 sm:p-12 border border-[#222232] bg-[#07070c] flex flex-col gap-6 animate-fadeIn">
            <div className="flex items-center gap-3 text-[#7ec8e3]">
              <CheckCircle2 className="w-8 h-8" />
              <div className="flex flex-col">
                <span className="font-mono text-xs tracking-widest uppercase">
                  ORDER REQUEST RECEIVED
                </span>
                <span className="font-display text-2xl uppercase text-white">
                  REFERENCE #{confirmedOrder.id}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-sans text-[#9a9aa8] leading-relaxed">
              Thank you, <strong className="text-white">{confirmedOrder.customerName}</strong>. Your atelier order has been
              logged into our production pipeline.
            </p>

            <div className="p-4 border border-[#1e1e2c] bg-[#0c0c14] font-mono text-xs text-[#808092] flex flex-col gap-2">
              <span className="text-white uppercase tracking-wider">ORDER SUMMARY</span>
              <span>• Tracking ID: {confirmedOrder.id}</span>
              <span>• Total Amount: ₹{confirmedOrder.totalAmount}</span>
              <span>• Status: {confirmedOrder.status}</span>
              <span>• Destination: {confirmedOrder.deliveryAddress}, {confirmedOrder.city}</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Link
                href={`/track-order?id=${confirmedOrder.id}`}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 bg-[#7ec8e3] text-[#030304] text-xs font-sans font-semibold uppercase tracking-wider"
              >
                <span>TRACK THIS ORDER</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setCheckoutStep("cart")}
                className="w-full sm:w-auto px-6 py-3.5 border border-[#222230] text-xs font-mono uppercase tracking-wider text-white"
              >
                CONTINUE BROWSING
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Live Interactive Visualizer */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              {/* Visual Preview */}
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-[#202030] bg-[#050508] shadow-[0_0_80px_rgba(0,0,0,0.8)]">
                <Image
                  src={selectedProduct.image}
                  alt={selectedProduct.title}
                  fill
                  priority
                  className="object-contain p-6 sm:p-10 transition-all duration-500 animate-fadeIn"
                />

                <div className="absolute bottom-4 left-4 right-4 p-3 bg-black/75 backdrop-blur-md border border-[#20202e] flex items-center justify-between text-[11px] font-mono text-[#8e8e9c]">
                  <span className="text-white uppercase">{selectedProduct.title}</span>
                  <span className="text-[#7ec8e3] font-semibold">₹{selectedVariant.price}</span>
                </div>
              </div>

              {/* Step 1: Edition Format Selector */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-mono text-[#7ec8e3] tracking-widest uppercase">
                  1. CHOOSE PRESENTATION FORMAT
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PRODUCTS_CATALOG.map((prod) => (
                    <button
                      key={prod.id}
                      onClick={() => handleProductChange(prod)}
                      className={`p-3.5 border text-left flex flex-col gap-1 transition-all ${
                        selectedProduct.id === prod.id
                          ? "border-[#7ec8e3] bg-[#7ec8e3]/10"
                          : "border-[#1b1b26] bg-[#07070c] hover:border-[#333348]"
                      }`}
                    >
                      <span className="font-sans text-xs font-medium text-white">
                        {prod.title}
                      </span>
                      <span className="font-mono text-[11px] text-[#7ec8e3]">
                        From ₹{prod.startingPrice}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Scale & Dimension Options */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-mono text-[#7ec8e3] tracking-widest uppercase">
                  2. SELECT DIMENSIONS
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {selectedProduct.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`p-3 border text-left flex flex-col gap-1 transition-all ${
                        selectedVariant.id === v.id
                          ? "border-[#7ec8e3] bg-[#7ec8e3]/10"
                          : "border-[#1b1b26] bg-[#07070c] hover:border-[#333348]"
                      }`}
                    >
                      <span className="font-sans text-xs text-white">{v.name}</span>
                      <span className="font-mono text-[10px] text-[#808092]">{v.size}</span>
                      <span className="font-mono text-xs text-[#7ec8e3] mt-1">₹{v.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Stroma Artwork Assignment */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-mono text-[#7ec8e3] tracking-widest uppercase">
                  3. SELECT SAMPLE STROMA OR ASSIGN PERSONAL SCAN
                </span>
                <div className="grid grid-cols-3 gap-3">
                  {GALLERY_ITEMS.map((art) => (
                    <button
                      key={art.id}
                      onClick={() => setSelectedArtwork(art)}
                      className={`relative aspect-square rounded-xl overflow-hidden border p-1 transition-all ${
                        selectedArtwork.id === art.id
                          ? "border-[#7ec8e3] ring-2 ring-[#7ec8e3]/40"
                          : "border-[#1c1c28] opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image src={art.image} alt={art.name} fill className="object-cover" />
                      <div className="absolute inset-x-0 bottom-0 p-1.5 bg-black/80 text-[9px] font-mono text-center text-white truncate">
                        {art.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Inscription / Note */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#9e9ea8]">
                  4. Custom Personalisation Inscription (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maya & Arjun • 2026"
                  value={customInscription}
                  onChange={(e) => setCustomInscription(e.target.value)}
                  className="p-3 border border-[#222232] bg-[#0c0c14] text-white text-xs font-sans focus:outline-none focus:border-[#7ec8e3]"
                />
              </div>

              {/* Add Customized Item to Cart Button */}
              <button
                onClick={handleAddCustomizedToCart}
                className="w-full py-4 bg-[#7ec8e3] hover:bg-[#68bcdb] text-[#030304] text-xs font-sans font-semibold tracking-[0.24em] uppercase transition-all"
              >
                ADD CONFIGURED PIECE TO ATELIER CART (₹{selectedVariant.price})
              </button>
            </div>

            {/* Right Column: Cart Review & Delivery Checkout Form */}
            <div className="lg:col-span-5 border border-[#1a1a28] bg-[#07070c]/90 p-6 sm:p-8 flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-[#181824] pb-4">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4 text-[#7ec8e3]" />
                  <h3 className="font-display text-xl uppercase text-white">
                    ORDER CHECKOUT
                  </h3>
                </div>
                <span className="font-mono text-xs text-[#7ec8e3]">
                  {items.length} {items.length === 1 ? "Item" : "Items"}
                </span>
              </div>

              {orderError && (
                <div className="p-3 border border-[#e05848]/60 bg-[#e05848]/10 text-xs font-mono text-[#fca5a5] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{orderError}</span>
                </div>
              )}

              {/* Cart Items List in Sidebar */}
              <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
                {items.length === 0 ? (
                  <div className="p-6 text-center text-xs font-mono text-[#666677] border border-dashed border-[#1c1c28]">
                    Your cart is currently empty. Configure a piece above or explore our collections.
                  </div>
                ) : (
                  items.map((it) => (
                    <div
                      key={it.id}
                      className="p-3 border border-[#181824] bg-[#0a0a12] flex items-start justify-between text-xs"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-white">{it.title}</span>
                        <span className="text-[10px] text-[#7ec8e3] font-mono">
                          {it.format} • {it.size}
                        </span>
                        <span className="text-[10px] text-[#777788]">
                          Qty: {it.quantity} × ₹{it.price}
                        </span>
                      </div>
                      <button
                        onClick={() => removeItem(it.id)}
                        className="text-[#666677] hover:text-[#ff6666] font-mono text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Subtotal */}
              <div className="flex items-center justify-between border-t border-[#181824] pt-4">
                <span className="font-mono text-xs uppercase tracking-wider text-[#8e8e9c]">
                  Total Archival Value:
                </span>
                <span className="font-mono text-lg font-semibold text-white">
                  ₹{totalPrice}
                </span>
              </div>

              {/* Delivery Details Form */}
              <form onSubmit={handlePlaceOrder} className="flex flex-col gap-4 border-t border-[#181824] pt-4">
                <span className="text-xs font-mono uppercase tracking-wider text-white">
                  Delivery Destination
                </span>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase text-[#888898]">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sen"
                    value={customerDetails.name}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                    className="p-2.5 border border-[#222232] bg-[#0c0c14] text-white text-xs font-sans focus:outline-none focus:border-[#7ec8e3]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase text-[#888898]">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98..."
                      value={customerDetails.mobile}
                      onChange={(e) => setCustomerDetails({ ...customerDetails, mobile: e.target.value })}
                      className="p-2.5 border border-[#222232] bg-[#0c0c14] text-white text-xs font-sans focus:outline-none focus:border-[#7ec8e3]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase text-[#888898]">City *</label>
                    <input
                      type="text"
                      required
                      value={customerDetails.city}
                      onChange={(e) => setCustomerDetails({ ...customerDetails, city: e.target.value })}
                      className="p-2.5 border border-[#222232] bg-[#0c0c14] text-white text-xs font-sans focus:outline-none focus:border-[#7ec8e3]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase text-[#888898]">Street Address *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Door No, Street Name, Landmark..."
                    value={customerDetails.address}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, address: e.target.value })}
                    className="p-2.5 border border-[#222232] bg-[#0c0c14] text-white text-xs font-sans focus:outline-none focus:border-[#7ec8e3]"
                  />
                </div>

                <div className="p-3 border border-[#1e1e2c] bg-[#06060a] text-[10px] font-mono text-[#777788] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#7ec8e3] shrink-0" />
                  <span>
                    No immediate online charge. Studio will contact you to verify biometric alignment before final invoice.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading || items.length === 0}
                  className="w-full py-4 bg-[#7ec8e3] hover:bg-[#68bcdb] text-[#030304] text-xs font-sans font-semibold tracking-[0.24em] uppercase transition-all disabled:opacity-40"
                >
                  {loading ? "PROCESSING ATELIER ORDER..." : "CONFIRM ATELIER ORDER REQUEST"}
                </button>
              </form>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
