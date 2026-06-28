"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { t } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import menuData from "@/lib/menu-data";

const BUSINESS_INFO = {
  name: "Mitthan Di Hatti",
  subtitle: "Sweets & Restaurant",
  phone: "9812270023",
  address1: "NH 709AD, Kurar, Baha Ud Dinpur,",
  address2: "near Sanauli Khurd, Panipat, Haryana 132104",
};

export default function AdminBillingPage() {
  const [cart, setCart] = useState(() => {
    if (typeof window === "undefined") return [];
    const stored = sessionStorage.getItem("billOrder");
    if (stored) {
      try {
        const order = JSON.parse(stored);
        if (order && order.items) {
          return order.items.map((i) => {
            const menuItem = menuData.flatMap(c => c.items).find(m => m.id === i.id) || {};
            return {
              id: i.id, name: i.name, qty: i.qty, unitPrice: i.price,
              unit: i.unit || menuItem.unit || "plate",
              isHalf: i.is_half || false,
              halfPrice: menuItem.halfPrice || null,
              price: menuItem.price || i.price,
            };
          });
        }
      } catch (e) { console.error(e); }
      sessionStorage.removeItem("billOrder");
    }
    return [];
  });
  const [search, setSearch] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [discount, setDiscount] = useState(() => {
    if (typeof window === "undefined") return 0;
    const stored = sessionStorage.getItem("billOrder");
    if (stored) {
      try {
        const order = JSON.parse(stored);
        return order?.discount || 0;
      } catch { return 0; }
    }
    return 0;
  });
  const [orderType, setOrderType] = useState(() => {
    if (typeof window === "undefined") return "dinein";
    const stored = sessionStorage.getItem("billOrder");
    if (stored) {
      try {
        const order = JSON.parse(stored);
        return order?.orderType || "dinein";
      } catch { return "dinein"; }
    }
    return "dinein";
  });
  const [tableNo, setTableNo] = useState(() => {
    if (typeof window === "undefined") return "";
    const stored = sessionStorage.getItem("billOrder");
    if (stored) {
      try {
        const order = JSON.parse(stored);
        return order?.tableNo || "";
      } catch { return ""; }
    }
    return "";
  });
  const [placing, setPlacing] = useState(false);
  const [billSaved, setBillSaved] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [miscName, setMiscName] = useState("");
  const [miscPrice, setMiscPrice] = useState("");
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [billNo, setBillNo] = useState("");
  let miscIdCounter = useRef(0);

  const [overrides, setOverrides] = useState({});
  const [customItems, setCustomItems] = useState([]);

  useEffect(() => {
    const loadOverrides = async () => {
      const { data } = await supabase.from("menu_overrides").select("*");
      const ov = {};
      const custom = [];
      (data || []).forEach((d) => {
        if (d.is_custom) { custom.push(d); }
        else { ov[d.id] = d; }
      });
      setOverrides(ov);
      setCustomItems(custom);
    };
    loadOverrides();

    const channel = supabase.channel("menu_overrides_billing")
      .on("postgres_changes",
        { event: "*", schema: "public", table: "menu_overrides" },
        loadOverrides
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (showPrintPreview) {
      const timer = setTimeout(() => {
        window.print();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showPrintPreview]);

  useEffect(() => {
    const handleAfterPrint = () => setShowPrintPreview(false);
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  const mergedItems = useMemo(() => {
    const items = menuData.flatMap((cat) =>
      cat.items
        .filter((item) => !overrides[item.id]?.deleted)
        .map((item) => {
          const ov = overrides[item.id];
          return {
            ...item,
            price: ov?.price ?? item.price,
            halfPrice: ov?.half_price ?? item.halfPrice,
            available: ov?.available !== false,
          };
        })
    );
    customItems
      .filter((c) => c.available !== false)
      .forEach((c) => {
        items.push({
          id: c.id,
          name: c.name,
          price: c.price,
          halfPrice: c.half_price || null,
          unit: c.unit || "piece",
          desc: null,
          isCustom: true,
        });
      });
    return items;
  }, [overrides, customItems]);

  const filteredItems = useMemo(
    () =>
      mergedItems.filter((item) =>
        item.available !== false &&
        item.name.toLowerCase().includes(search.toLowerCase())
      ),
    [mergedItems, search]
  );

  const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const discountAmt = (subtotal * discount) / 100;
  const total = subtotal - discountAmt;

  const addItemToBill = (item, isHalf = false) => {
    const existing = cart.find(
      (c) => c.id === item.id && c.isHalf === isHalf
    );
    if (existing) {
      setCart((prev) =>
        prev.map((c) =>
          c.id === item.id && c.isHalf === isHalf ? { ...c, qty: c.qty + 1 } : c
        )
      );
    } else {
      const unitPrice = isHalf && item.halfPrice ? item.halfPrice : item.price;
      setCart((prev) => [
        ...prev,
        {
          ...item,
          qty: item.unit === "kg" ? 0.5 : 1,
          isHalf,
          unitPrice,
        },
      ]);
    }
  };

  const updateQty = (id, isHalf, qty) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => !(c.id === id && c.isHalf === isHalf)));
      return;
    }
    setCart((prev) =>
      prev.map((c) =>
        c.id === id && c.isHalf === isHalf ? { ...c, qty } : c
      )
    );
  };

  const addMiscItem = () => {
    const name = miscName.trim();
    const price = parseFloat(miscPrice);
    if (!name || !price || price <= 0) return;
    miscIdCounter.current += 1;
    const id = `_misc_${miscIdCounter.current}`;
    setCart((prev) => [
      ...prev,
      { id, name, qty: 1, unitPrice: price, unit: "piece", isHalf: false, halfPrice: null, price, isMisc: true },
    ]);
    setMiscName("");
    setMiscPrice("");
  };

  const saveBill = async (markPaid) => {
    if (cart.length === 0) return;
    setPlacing(true);
    try {
      const billData = {
        items: cart.map((i) => ({
          id: i.id, name: i.name, qty: i.qty, price: i.unitPrice,
          unit: i.unit, is_half: i.isHalf,
          total: i.unitPrice * i.qty,
        })),
        total, subtotal, discount, payment_mode: paymentMode,
        order_type: orderType, table_no: orderType === "dinein" ? tableNo : null,
        status: "confirmed",
      };
      if (markPaid) {
        billData.paid = true;
        billData.paid_at = new Date().toISOString();
      } else {
        billData.paid = false;
      }
      billData.order_date = new Date().toISOString().split("T")[0];

      if (editingOrderId) {
        const { error } = await supabase.from("orders").update(billData).eq("id", editingOrderId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("orders").insert({
          ...billData,
          source: "counter",
        });
        if (error) throw error;
      }
      setEditingOrderId(null);
      setBillSaved(true);
      setTimeout(() => {
        setCart([]);
        setDiscount(0);
        setTableNo("");
        setBillSaved(false);
      }, 3000);
    } catch (e) {
      alert("Error saving bill: " + e.message);
    }
    setPlacing(false);
  };

  const printBill = () => {
    if (cart.length === 0) return;
    setBillNo(editingOrderId ? editingOrderId.slice(0, 8).toUpperCase() : `#${Date.now().toString(36).toUpperCase()}`);
    setShowPrintPreview(true);
  };

  if (showPrintPreview) {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    return (
      <div className="print-bill" style={{ fontFamily: "'Courier New', monospace", fontSize: "12px", padding: "30px 20px", maxWidth: "300px", margin: "0 auto", color: "#222" }}>
        <div style={{ textAlign: "center", marginBottom: "12px", borderBottom: "1px dashed #999", paddingBottom: "12px" }}>
          <h1 style={{ fontSize: "18px", margin: "0 0 4px 0", letterSpacing: "1px" }}>{BUSINESS_INFO.name}</h1>
          <p style={{ margin: "2px 0", fontSize: "11px", color: "#555" }}>{BUSINESS_INFO.subtitle}</p>
          <p style={{ margin: "2px 0", fontSize: "11px", color: "#555" }}>Phone: {BUSINESS_INFO.phone}</p>
          <p style={{ margin: "2px 0", fontSize: "9px", color: "#777" }}>{BUSINESS_INFO.address1}</p>
          <p style={{ margin: "2px 0", fontSize: "9px", color: "#777" }}>{BUSINESS_INFO.address2}</p>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "8px", borderBottom: "1px dashed #999", paddingBottom: "8px" }}>
          <span>Bill: {billNo}</span>
          <span>{dateStr} {timeStr}</span>
          <span>{orderType === "dinein" && tableNo ? "T" + tableNo : orderType === "pickup" ? "Pickup" : "Counter"}</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8px", fontSize: "12px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #999" }}>
              <th style={{ textAlign: "left", padding: "4px 2px", fontSize: "11px" }}>Item</th>
              <th style={{ textAlign: "center", padding: "4px 2px", fontSize: "11px" }}>Qty</th>
              <th style={{ textAlign: "right", padding: "4px 2px", fontSize: "11px" }}>Rate</th>
              <th style={{ textAlign: "right", padding: "4px 2px", fontSize: "11px" }}>Amt</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((i, idx) => (
              <tr key={idx}>
                <td style={{ padding: "2px" }}>{i.name}{i.isHalf ? " (Half)" : ""}{i.isMisc ? " *" : ""}</td>
                <td style={{ textAlign: "center", padding: "2px" }}>{i.qty}{i.unit === "kg" ? "kg" : ""}</td>
                <td style={{ textAlign: "right", padding: "2px" }}>{i.unitPrice.toFixed(0)}</td>
                <td style={{ textAlign: "right", padding: "2px" }}>{(i.unitPrice * i.qty).toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ borderTop: "1px dashed #999", paddingTop: "4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", padding: "1px 0" }}>
            <span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span>
          </div>
          {discount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", padding: "1px 0" }}>
              <span>Discount ({discount}%)</span><span>-₹{discountAmt.toFixed(0)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: "bold", borderTop: "1px solid #999", paddingTop: "4px", marginTop: "4px" }}>
            <span>Total</span><span>₹{total.toFixed(0)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#888", marginTop: "6px" }}>
            <span>Payment: {paymentMode.toUpperCase()}</span>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: "16px", paddingTop: "8px", borderTop: "1px dashed #999", fontSize: "11px", color: "#555" }}>
          <p>Thank you! Visit again.</p>
        </div>
        <style>{`
          @media print {
            body { margin: 0; padding: 0; }
            @page { margin: 10mm; }
          }
        `}</style>
      </div>
    );
  }

  if (billSaved) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-emerald-600">Bill Saved!</h3>
          <p className="text-gray-400 text-sm mt-1">Preparing new bill...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="flex-1">
        <div className="relative mb-3">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-gray-100 bg-white focus:border-gold focus:outline-none text-sm shadow-sm"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition">
              <h4 className="font-semibold text-sm leading-tight mb-1.5 text-gray-800">{item.name}</h4>
              {item.unit === "mrp" ? (
                <span className="text-xs text-gray-400 italic">MRP</span>
              ) : (
                <span className="text-primary font-bold text-sm">₹{item.price}<span className="text-gray-400 font-normal text-xs">/{item.unit}</span></span>
              )}
              <div className="flex gap-1 mt-2">
                {item.halfPrice ? (
                  <>
                    <button
                      onClick={() => addItemToBill(item, false)}
                      className="flex-1 text-xs py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 font-medium hover:bg-amber-100 transition"
                    >
                      F-₹{item.price}
                    </button>
                    <button
                      onClick={() => addItemToBill(item, true)}
                      className="flex-1 text-xs py-1.5 rounded-lg bg-primary/5 text-primary border border-primary/10 font-medium hover:bg-primary/10 transition"
                    >
                      H-₹{item.halfPrice}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => addItemToBill(item)}
                    className="w-full text-xs py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-light transition shadow-sm"
                  >
                    + Add
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:w-96 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 lg:sticky lg:top-20 self-start">
        <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {t("billing")}
        </h3>

        <div className="space-y-2 mb-4 max-h-[35vh] overflow-y-auto">
          {cart.map((item, idx) => (
            <div key={item.id + (item.isHalf ? "-h" : "") + idx} className="flex items-center gap-2 bg-gray-50 rounded-xl p-2.5 border border-gray-100">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{item.name}{item.isHalf ? <span className="text-gold text-xs"> (H)</span> : ""}{item.isMisc ? <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full ml-1">MISC</span> : ""}</p>
                <p className="text-xs text-gray-400">₹{item.unitPrice}/{item.unit}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {item.unit === "kg" ? (
                  <input
                    type="number"
                    step="0.05"
                    min="0.05"
                    value={item.qty}
                    onChange={(e) => updateQty(item.id, item.isHalf, parseFloat(e.target.value) || 0)}
                    className="w-16 text-center text-sm p-1.5 border border-gray-200 rounded-lg bg-white"
                  />
                ) : (
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(item.id, item.isHalf, item.qty - 1)} className="w-7 h-7 rounded-lg bg-gray-200 hover:bg-gray-300 text-xs font-bold text-gray-600 transition">−</button>
                    <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.isHalf, item.qty + 1)} className="w-7 h-7 rounded-lg bg-gray-200 hover:bg-gray-300 text-xs font-bold text-gray-600 transition">+</button>
                  </div>
                )}
              </div>
              <p className="text-sm font-bold text-primary w-16 text-right">
                ₹{item.unit === "kg" ? (item.unitPrice * item.qty).toFixed(0) : item.unitPrice * item.qty}
              </p>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="text-center py-8">
              <div className="text-3xl mb-2 opacity-30">🛒</div>
              <p className="text-gray-400 text-sm">{t("emptyCart")}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={miscName}
            onChange={(e) => setMiscName(e.target.value)}
            placeholder="Misc item name"
            className="flex-1 p-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:border-gold focus:outline-none"
            onKeyDown={(e) => e.key === "Enter" && addMiscItem()}
          />
          <input
            type="number"
            value={miscPrice}
            onChange={(e) => setMiscPrice(e.target.value)}
            placeholder="₹"
            className="w-20 p-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:border-gold focus:outline-none text-center"
            onKeyDown={(e) => e.key === "Enter" && addMiscItem()}
          />
          <button onClick={addMiscItem} disabled={!miscName.trim() || !miscPrice} className="px-3 py-2 bg-gray-600 text-white rounded-lg text-xs font-bold hover:bg-gray-700 disabled:opacity-40 transition">
            + Add
          </button>
        </div>

        <div className="space-y-3 mb-4 p-3 bg-gray-50 rounded-xl">
          <div className="flex gap-2">
            <button onClick={() => setOrderType("dinein")} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${orderType === "dinein" ? "bg-primary text-white shadow-sm" : "bg-white text-gray-500 border border-gray-200 hover:border-primary"}`}>
              🍽 {t("dineIn")}
            </button>
            <button onClick={() => setOrderType("pickup")} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${orderType === "pickup" ? "bg-primary text-white shadow-sm" : "bg-white text-gray-500 border border-gray-200 hover:border-primary"}`}>
              🛍 {t("pickup")}
            </button>
          </div>
          {orderType === "dinein" && (
            <input type="text" inputMode="numeric" pattern="[0-9]*" value={tableNo} onChange={(e) => setTableNo(e.target.value)} placeholder={t("tableNo")} className="w-full p-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:border-gold focus:outline-none" />
          )}
          <div>
            <label className="text-xs text-gray-500 font-medium">{t("discount")} (%)</label>
            <input type="number" value={discount} onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))} className="w-full p-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:border-gold focus:outline-none mt-1" />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3 space-y-1.5 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium">₹{subtotal.toFixed(0)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Discount ({discount}%)</span>
              <span className="text-red-500 font-medium">-₹{discountAmt.toFixed(0)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-100">
            <span className="text-primary">{t("total")}</span>
            <span className="text-primary">₹{total.toFixed(0)}</span>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {["cash", "upi", "card"].map((m) => (
            <button key={m} onClick={() => setPaymentMode(m)} className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition ${paymentMode === m ? "bg-primary text-white shadow-sm" : "bg-gray-50 text-gray-500 border border-gray-200 hover:border-primary"}`}>
              {m === "cash" ? "💵 " + t("cash") : m === "upi" ? "📱 " + t("upi") : "💳 " + t("card")}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 no-print">
          <div className="flex gap-2">
            <button onClick={printBill} disabled={cart.length === 0} className="flex-1 py-3 border-2 border-primary text-primary rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-primary/5 transition">
              🖨 {t("printBill")}
            </button>
            <button onClick={() => saveBill(false)} disabled={placing || cart.length === 0} className="flex-1 py-3 bg-amber-500 text-white rounded-xl text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-600 transition shadow-md flex items-center justify-center gap-1.5">
              {placing ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : null}
              {placing ? "Saving..." : `💾 Save (Unpaid)`}
            </button>
          </div>
          <button onClick={() => saveBill(true)} disabled={placing || cart.length === 0} className="w-full py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-700 transition shadow-md flex items-center justify-center gap-1.5">
            {placing ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : null}
            {placing ? "Saving..." : `✅ Save & Mark Paid`}
          </button>
        </div>
      </div>
    </div>
  );
}
