"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem } from "./types";

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  totalCount: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("iris_cart");
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("iris_cart", JSON.stringify(items));
    } catch {}
  }, [items]);

  const addItem = (item: Omit<CartItem, "id">) => {
    const id = `${item.productId}-${item.format}-${item.size}-${Date.now()}`;
    setItems((prev) => [...prev, { ...item, id }]);
    setIsCartOpen(true);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i))
    );
  };

  const clearCart = () => setItems([]);

  const totalCount = items.reduce((sum, it) => sum + it.quantity, 0);
  const totalPrice = items.reduce(
    (sum, it) => sum + it.price * it.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalCount,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
