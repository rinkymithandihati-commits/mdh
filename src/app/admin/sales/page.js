"use client";
import { useState, useEffect, useMemo } from "react";
import { t } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

export default function AdminSalesPage() {
  const [orders, setOrders] = useState([]);
  const [viewMode, setViewMode] = useState("daily");
  const [paidFilter, setPaidFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedMonth, setSelectedMonth] = useState(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
  );

  useEffect(() => {
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(1000).then(({ data, error }) => {
      if (!error) setOrders(data || []);
    });
  }, []);

  const dailyOrders = useMemo(() => {
    return orders.filter((o) => o.order_date === selectedDate);
  }, [orders, selectedDate]);

  const monthlyOrders = useMemo(() => {
    return orders.filter((o) => o.order_date?.startsWith(selectedMonth));
  }, [orders, selectedMonth]);

  const filteredOrders = useMemo(() => {
    const base = viewMode === "daily" ? dailyOrders : monthlyOrders;
    if (paidFilter === "paid") return base.filter((o) => o.paid);
    if (paidFilter === "unpaid") return base.filter((o) => !o.paid);
    return base;
  }, [viewMode, dailyOrders, monthlyOrders, paidFilter]);

  const displayOrders = filteredOrders;
  const revenue = displayOrders.filter((o) => o.paid).reduce((s, o) => s + (o.total || 0), 0);
  const totalOrders = displayOrders.length;
  const canceledOrders = displayOrders.filter((o) => o.status === "canceled").length;

  const topItems = useMemo(() => {
    const itemMap = {};
    displayOrders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const key = item.name + (item.is_half ? " (Half)" : "");
        itemMap[key] = (itemMap[key] || 0) + (item.qty || 0);
      });
    });
    return Object.entries(itemMap).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [displayOrders]);

  const last30Days = useMemo(() => {
    const sales = {};
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      sales[key] = 0;
    }
    orders.forEach((o) => {
      if (o.paid && sales[o.order_date] !== undefined) {
        sales[o.order_date] += o.total || 0;
      }
    });
    return Object.entries(sales).reverse();
  }, [orders]);

  const maxDaySales = Math.max(...last30Days.map(([, v]) => v), 1);

  const paymentBreakdown = useMemo(() => {
    const counts = { cash: 0, upi: 0, card: 0 };
    const totals = { cash: 0, upi: 0, card: 0 };
    displayOrders.forEach((o) => {
      const mode = o.payment_mode;
      if (mode && counts[mode] !== undefined) {
        counts[mode]++;
        totals[mode] += o.total || 0;
      }
    });
    return { counts, totals };
  }, [displayOrders]);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-4 shadow-lg text-white">
          <div className="flex items-center justify-between">
            <p className="text-xs opacity-80 font-medium">{t("revenue")}</p>
            <span className="text-lg opacity-50">💰</span>
          </div>
          <p className="text-2xl font-bold mt-1.5">₹{revenue}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl p-4 shadow-lg text-white">
          <div className="flex items-center justify-between">
            <p className="text-xs opacity-80 font-medium">{t("orders")}</p>
            <span className="text-lg opacity-50">📋</span>
          </div>
          <p className="text-2xl font-bold mt-1.5">{totalOrders}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl p-4 shadow-lg text-white">
          <div className="flex items-center justify-between">
            <p className="text-xs opacity-80 font-medium">Canceled</p>
            <span className="text-lg opacity-50">❌</span>
          </div>
          <p className="text-2xl font-bold mt-1.5">{canceledOrders}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl p-4 shadow-lg text-white">
          <div className="flex items-center justify-between">
            <p className="text-xs opacity-80 font-medium">Avg/Order</p>
            <span className="text-lg opacity-50">📊</span>
          </div>
          <p className="text-2xl font-bold mt-1.5">₹{totalOrders ? (revenue / totalOrders).toFixed(0) : 0}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button onClick={() => setViewMode("daily")} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${viewMode === "daily" ? "bg-primary text-white shadow-md" : "bg-white border border-gray-200 text-gray-500 hover:border-primary"}`}>
          🗓 {t("today")}
        </button>
        <button onClick={() => setViewMode("monthly")} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${viewMode === "monthly" ? "bg-primary text-white shadow-md" : "bg-white border border-gray-200 text-gray-500 hover:border-primary"}`}>
          📅 {t("thisMonth")}
        </button>
        <div className="flex-1" />
        <button onClick={() => setPaidFilter("all")} className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${paidFilter === "all" ? "bg-gray-800 text-white shadow-md" : "bg-white border border-gray-200 text-gray-500 hover:border-primary"}`}>
          All
        </button>
        <button onClick={() => setPaidFilter("paid")} className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${paidFilter === "paid" ? "bg-emerald-600 text-white shadow-md" : "bg-white border border-gray-200 text-gray-500 hover:border-primary"}`}>
          Paid
        </button>
        <button onClick={() => setPaidFilter("unpaid")} className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${paidFilter === "unpaid" ? "bg-amber-600 text-white shadow-md" : "bg-white border border-gray-200 text-gray-500 hover:border-primary"}`}>
          Unpaid
        </button>
      </div>

      <div className="mb-4">
        {viewMode === "daily" ? (
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="p-2.5 rounded-xl border-2 border-gray-100 focus:border-gold focus:outline-none bg-white shadow-sm text-sm" />
        ) : (
          <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="p-2.5 rounded-xl border-2 border-gray-100 focus:border-gold focus:outline-none bg-white shadow-sm text-sm" />
        )}
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="font-bold text-gray-800">Last 30 Days Sales</h3>
        </div>
        <div className="flex items-end gap-1 h-40">
          {last30Days.map(([date, amount]) => (
            <div key={date} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-gradient-to-t from-primary to-gold hover:from-primary/80 hover:to-gold/80 rounded-t-md transition-all cursor-pointer relative group"
                style={{ height: `${(amount / maxDaySales) * 100}%`, minHeight: amount > 0 ? "6px" : "2px" }}
              >
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap shadow-lg transition-opacity">
                  ₹{amount}
                </div>
              </div>
              <span className="text-[8px] text-gray-400 mt-1">{date.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <h3 className="font-bold text-gray-800">{t("topSelling")}</h3>
          </div>
          <div className="space-y-2">
            {topItems.map(([name, qty], i) => (
              <div key={name} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-gold/20 text-gold" : i === 1 ? "bg-gray-200 text-gray-500" : i === 2 ? "bg-amber-100 text-amber-600" : "bg-gray-50 text-gray-400"}`}>
                  {i + 1}
                </span>
                <span className="flex-1 text-sm text-gray-700">{name}</span>
                <span className="text-sm font-bold text-primary">{qty}</span>
              </div>
            ))}
            {topItems.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-4">No sales data yet</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm0 0V7m0 0h10" />
            </svg>
            <h3 className="font-bold text-gray-800">Payment Methods</h3>
          </div>
          <div className="space-y-3">
            {[
              { mode: "cash", label: "Cash", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "💵" },
              { mode: "upi", label: "UPI", color: "bg-blue-50 text-blue-700 border-blue-200", icon: "📱" },
              { mode: "card", label: "Card", color: "bg-purple-50 text-purple-700 border-purple-200", icon: "💳" },
            ].map(({ mode, label, color, icon }) => (
              <div key={mode} className={`flex items-center justify-between p-3 rounded-xl border ${color}`}>
                <div className="flex items-center gap-2">
                  <span>{icon}</span>
                  <span className="font-semibold text-sm">{label}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{paymentBreakdown.counts[mode]}</p>
                  <p className="text-[10px] opacity-60">₹{paymentBreakdown.totals[mode]}</p>
                </div>
              </div>
            ))}
            {Object.values(paymentBreakdown.counts).every((c) => c === 0) && (
              <p className="text-center text-gray-400 text-sm py-4">No payment data yet</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="font-bold text-gray-800">{t("orders")}</h3>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {displayOrders.slice(0, 20).map((o) => (
              <div key={o.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 rounded-lg px-2 -mx-2 transition">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-gray-50 px-1.5 py-0.5 rounded text-gray-500">#{o.id?.slice(0, 6)}</span>
                  {o.table_no && <span className="text-xs bg-primary/5 text-primary px-1.5 py-0.5 rounded font-medium">T{o.table_no}</span>}
                  {o.paid && <span className="text-xs bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">Paid</span>}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">₹{o.total}</p>
                  <p className={`text-[10px] ${o.paid ? "text-emerald-500" : "text-red-400"}`}>
                    {o.paid ? "Paid" : "Unpaid"}
                  </p>
                </div>
              </div>
            ))}
            {displayOrders.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-4">No orders in this period</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
