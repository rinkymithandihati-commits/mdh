"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useCart } from "@/context/CartContext";
import { t } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

export default function CartPage() {
  const { cart, updateQty, removeItem, clearCart, getCartTotal } = useCart();
  const router = useRouter();
  const [orderType, setOrderType] = useState("dinein");
  const [tableNo, setTableNo] = useState("");
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);

  const total = getCartTotal();
  const subtotal = total;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setPlacing(true);
    try {
      const { data, error } = await supabase.from("orders").insert({
        items: cart.map((i) => ({
          id: i.id, name: i.name, qty: i.qty, price: i.unitPrice,
          unit: i.unit, is_half: i.isHalf,
          total: i.unitPrice * i.qty,
        })),
        total, subtotal, order_type: orderType,
        table_no: orderType === "dinein" ? tableNo : null,
        notes, status: "pending", paid: false, source: "qr",
        order_date: new Date().toISOString().split("T")[0],
      }).select().single();
      if (error) throw error;
      clearCart();
      router.push(`/order-success?id=${data.id}`);
    } catch (e) {
      alert("Error: " + e.message);
      setPlacing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-cream">
        <Header showCart={false} />
        <main className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-500 mb-1">{t("emptyCart")}</h2>
          <p className="text-sm text-gray-400 mb-6">Add some delicious items from our menu</p>
          <button onClick={() => router.push("/")} className="px-8 py-3 bg-primary text-white rounded-full font-medium shadow-md hover:bg-primary-light transition">
            {t("backToMenu")}
          </button>
        </main>
      </div>
    );
  }

  const formatQty = (item) => item.unit === "kg" ? `${item.qty} ${t("kg")}` : `${item.qty}`;

  return (
    <div className="min-h-screen bg-cream">
      <Header showCart={false} />
      <main className="max-w-lg mx-auto px-4 py-4 pb-28">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => router.back()} className="p-1.5 rounded-full hover:bg-gray-100 transition">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-primary">{t("yourCart")} ({cart.length})</h2>
        </div>

        <div className="space-y-3 mb-6">
          {cart.map((item, idx) => (
            <div key={item.id + (item.isHalf ? "-half" : "") + idx} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/5 to-gold/5 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-lg">#</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                <p className="text-xs text-gray-400">
                  ₹{item.unitPrice} × {formatQty(item)}
                  {item.isHalf ? ` (${t("half")})` : ""}
                </p>
                <p className="text-primary font-bold text-sm mt-0.5">
                  ₹{item.unit === "kg" ? (item.unitPrice * item.qty).toFixed(0) : item.unitPrice * item.qty}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => updateQty(item.id, item.qty - 1, item.isHalf)} className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center font-bold text-gray-500 transition">−</button>
                <span className="font-semibold text-sm w-6 text-center">{item.qty}</span>
                <button onClick={() => updateQty(item.id, item.qty + 1, item.isHalf)} className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center font-bold text-gray-500 transition">+</button>
                <button onClick={() => removeItem(item.id, item.isHalf)} className="ml-1 p-1.5 rounded-full hover:bg-red-50 transition">
                  <svg className="w-4 h-4 text-red-300 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5 space-y-4">
          <div className="flex gap-2">
            <button onClick={() => setOrderType("dinein")} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${orderType === "dinein" ? "bg-primary text-white shadow-sm" : "bg-gray-50 text-gray-500 border border-gray-200 hover:border-primary"}`}>
              🍽 {t("dineIn")}
            </button>
            <button onClick={() => setOrderType("pickup")} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${orderType === "pickup" ? "bg-primary text-white shadow-sm" : "bg-gray-50 text-gray-500 border border-gray-200 hover:border-primary"}`}>
              🛍 {t("pickup")}
            </button>
          </div>
          {orderType === "dinein" && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("tableNo")}</label>
              <input type="text" inputMode="numeric" pattern="[0-9]*" value={tableNo} onChange={(e) => setTableNo(e.target.value)} placeholder={t("enterTableNo")} className="w-full mt-1.5 p-3 rounded-xl border border-gray-200 focus:border-gold focus:outline-none text-sm bg-gray-50" />
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("notes")}</label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special requests..." className="w-full mt-1.5 p-3 rounded-xl border border-gray-200 focus:border-gold focus:outline-none text-sm bg-gray-50" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Subtotal</span>
            <span className="font-semibold">₹{subtotal}</span>
          </div>
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
            <span className="text-lg font-bold text-primary">{t("total")}</span>
            <span className="text-2xl font-bold text-primary">₹{total}</span>
          </div>
        </div>

        <button onClick={handlePlaceOrder} disabled={placing || (orderType === "dinein" && !tableNo)}
          className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-light transition flex items-center justify-center gap-2">
          {placing ? <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Placing...</> : <>🛒 {t("placeOrder")}</>}
        </button>
      </main>
    </div>
  );
}
