"use client";
import { createContext, useContext, useState, useCallback, useEffect } from "react";

const CartContext = createContext({
  cart: [],
  addToCart: () => {},
  updateQty: () => {},
  removeItem: () => {},
  clearCart: () => {},
  getCartTotal: () => 0,
  getCartCount: () => 0,
});

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("cart");
        return saved ? JSON.parse(saved) : [];
      } catch { return []; }
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch {}
  }, [cart]);

  const addToCart = useCallback((item, qty, isHalf) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.id === item.id && i.isHalf === !!isHalf
      );
      if (existing) {
        return prev.map((i) =>
          i.id === item.id && i.isHalf === !!isHalf
            ? { ...i, qty: i.qty + qty }
            : i
        );
      }
      const unitPrice = isHalf && item.halfPrice ? item.halfPrice : item.price;
      return [...prev, { ...item, qty, isHalf: !!isHalf, unitPrice }];
    });
  }, []);

  const updateQty = useCallback((id, qty, isHalf) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => !(i.id === id && i.isHalf === isHalf)));
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.id === id && i.isHalf === isHalf ? { ...i, qty } : i
      )
    );
  }, []);

  const removeItem = useCallback((id, isHalf) => {
    setCart((prev) => prev.filter((i) => !(i.id === id && i.isHalf === isHalf)));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  }, [cart]);

  const getCartCount = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQty, removeItem, clearCart, getCartTotal, getCartCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
