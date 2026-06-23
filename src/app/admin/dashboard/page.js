"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

const STATUS_FLOW = ["pending", "confirmed", "preparing", "ready", "delivered"];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const soundEnabledRef = useRef(soundEnabled);
  const audioCtxRef = useRef(null);
  const bellBufferRef = useRef(null);
  const refreshTimerRef = useRef(null);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  const initAudio = useCallback(async () => {
    if (audioCtxRef.current) return;
    try {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const resp = await fetch("/bell.mp3");
      const buf = await resp.arrayBuffer();
      bellBufferRef.current = await audioCtxRef.current.decodeAudioData(buf);
    } catch (e) {
      console.error("Failed to initialize audio:", e);
    }
  }, []);

  const playSound = useCallback(() => {
    if (!soundEnabledRef.current || !audioCtxRef.current || !bellBufferRef.current) return;
    try {
      if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
      const src = audioCtxRef.current.createBufferSource();
      src.buffer = bellBufferRef.current;
      const gain = audioCtxRef.current.createGain();
      gain.gain.value = 0.6;
      src.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      src.start(0);
    } catch (e) {
      console.error("Failed to play sound:", e);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(500);
    if (!error) setOrders(data || []);
  }, []);

  useEffect(() => {
    initAudio();

    const unlock = () => {
      if (audioCtxRef.current?.state === "suspended") audioCtxRef.current.resume();
      document.removeEventListener("click", unlock);
      document.removeEventListener("touchstart", unlock);
    };
    document.addEventListener("click", unlock, { once: true });
    document.addEventListener("touchstart", unlock, { once: true });

    const load = async () => { await fetchOrders(); };
    load();

    const channel = supabase.channel("dashboard-orders")
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          setOrders((prev) => [payload.new, ...prev]);
          if (!payload.new.paid) playSound();
        }
      )
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          setOrders((prev) => prev.map((o) => o.id === payload.new.id ? { ...o, ...payload.new } : o));
        }
      )
      .on("postgres_changes",
        { event: "DELETE", schema: "public", table: "orders" },
        (payload) => {
          setOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
        }
      )
      .subscribe();

    refreshTimerRef.current = setInterval(() => {
      fetchOrders();
    }, 3600000);

    return () => {
      supabase.removeChannel(channel);
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
      clearInterval(refreshTimerRef.current);
    };
  }, [initAudio, fetchOrders, playSound]);

  const markPaid = useCallback(async (orderId) => {
    try {
      const { error } = await supabase.from("orders").update({ paid: true, paid_at: new Date().toISOString() }).eq("id", orderId);
      if (error) throw error;
    } catch (e) {
      console.error("Failed to mark paid:", e);
      alert("Failed to mark as paid: " + e.message);
    }
  }, []);

  const updateStatus = useCallback(async (orderId, newStatus) => {
    try {
      const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
      if (error) throw error;
    } catch (e) {
      console.error("Failed to update status:", e);
      alert("Failed to update status: " + e.message);
    }
  }, []);

  const billOrder = useCallback(
    (order) => {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("billOrder", JSON.stringify(order));
      }
      router.push("/admin/billing");
    },
    [router]
  );

  const cancelOrder = useCallback(async (orderId) => {
    if (!confirm("Cancel this order?")) return;
    try {
      const { error } = await supabase.from("orders").update({ status: "canceled" }).eq("id", orderId);
      if (error) throw error;
    } catch (e) {
      console.error("Failed to cancel order:", e);
      alert("Failed to cancel order: " + e.message);
    }
  }, []);

  const pendingOrders = orders.filter((o) => !o.paid && o.status !== "canceled");
  const paidOrders = orders.filter((o) => o.paid);
  const canceledOrders = orders.filter((o) => o.status === "canceled");
  const revenue = paidOrders.reduce((s, o) => s + (o.total || 0), 0);

  const statCards = [
    { label: "Pending Orders", value: pendingOrders.length, color: "from-amber-400 to-amber-600", icon: "⏳" },
    { label: t("revenue"), value: `₹${revenue}`, color: "from-emerald-400 to-emerald-600", icon: "💰" },
    { label: "Total Orders", value: orders.length, color: "from-blue-400 to-blue-600", icon: "📋" },
    { label: "Canceled", value: canceledOrders.length, color: "from-red-400 to-red-600", icon: "❌" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {statCards.map((s) => (
          <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-xl p-4 shadow-lg text-white`}>
            <div className="flex items-center justify-between">
              <p className="text-xs opacity-80 font-medium">{s.label}</p>
              <span className="text-lg opacity-50">{s.icon}</span>
            </div>
            <p className="text-2xl font-bold mt-1.5">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-primary">Pending Payments</h2>
        <button onClick={() => setSoundEnabled(!soundEnabled)} title="Sound" className={`p-2 rounded-lg text-sm transition ${soundEnabled ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-400"}`}>
          {soundEnabled ? "🔊" : "🔇"}
        </button>
      </div>

      <div className="space-y-3">
        {pendingOrders.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3 opacity-30">✅</div>
            <p className="text-gray-400 text-sm font-medium">All payments cleared!</p>
          </div>
        )}
        {pendingOrders.map((order) => {
          const currentIdx = STATUS_FLOW.indexOf(order.status);
          return (
            <div key={order.id} className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono bg-gray-50 px-2 py-0.5 rounded-md text-gray-500">#{order.id?.slice(0, 8)}</span>
                    {order.table_no && <span className="text-xs bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded-full font-medium">Table {order.table_no}</span>}
                    <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full font-medium">{order.status}</span>
                    {order.source === "qr" && <span className="text-xs bg-purple-50 text-purple-600 border border-purple-200 px-2.5 py-0.5 rounded-full font-medium">QR</span>}
                    {order.source === "counter" && <span className="text-xs bg-gold/10 text-gold border border-gold/20 px-2.5 py-0.5 rounded-full font-medium">Counter</span>}
                    {order.order_type === "pickup" && <span className="text-xs bg-purple-50 text-purple-600 border border-purple-200 px-2.5 py-0.5 rounded-full">Pickup</span>}
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    {order.created_at ? new Date(order.created_at).toLocaleString() : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">₹{order.total}</p>
                  {order.discount > 0 && <p className="text-[10px] text-red-400">{order.discount}% off</p>}
                </div>
              </div>

              <div className="bg-gray-50/50 rounded-xl p-3 mb-3">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-0.5">
                    <span className="text-gray-700">
                      {item.name}
                      {item.is_half ? <span className="text-gold text-xs ml-1">(Half)</span> : ""}
                      <span className="text-gray-400 ml-1">×{item.qty}{item.unit === "kg" ? "kg" : ""}</span>
                    </span>
                    <span className="font-semibold text-gray-800">₹{item.total}</span>
                  </div>
                ))}
              </div>

              {order.notes && (
                <p className="text-xs text-gray-400 mb-3 italic flex items-center gap-1">
                  <span className="text-gray-300">✏️</span> {order.notes}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-3 border-t border-gray-100 no-print">
                {currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1 && (
                  <button
                    onClick={() => updateStatus(order.id, STATUS_FLOW[currentIdx + 1])}
                    className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-sm"
                  >
                    → {STATUS_FLOW[currentIdx + 1]}
                  </button>
                )}
                <button onClick={() => billOrder(order)} className="px-4 py-2 text-xs font-bold bg-gold/10 text-gold border border-gold/20 rounded-xl hover:bg-gold/20 transition shadow-sm">
                  🧾 Bill
                </button>
                <button onClick={() => markPaid(order.id)} className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition shadow-sm">
                  ₹ Paid
                </button>
                <button onClick={() => cancelOrder(order.id)} className="px-3 py-2 text-xs font-medium bg-red-500/10 text-red-600 border border-red-200 rounded-xl hover:bg-red-500/20 transition">
                  Cancel
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
