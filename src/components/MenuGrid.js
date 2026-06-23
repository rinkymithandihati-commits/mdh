"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useCart } from "@/context/CartContext";
import { t } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import menuData from "@/lib/menu-data";

export default function MenuGrid({ tableId }) {
  const { addToCart } = useCart();
  const [search, setSearch] = useState("");
  const [addedItems, setAddedItems] = useState({});
  const [overrides, setOverrides] = useState({});

  useEffect(() => {
    let channel;
    let interval;

    const loadOverrides = async () => {
      const { data, error } = await supabase.from("menu_overrides").select("*");
      if (error) return;
      const ov = {};
      (data || []).forEach((d) => { ov[d.id] = d; });
      setOverrides(ov);
      localStorage.setItem("menuOverrides", JSON.stringify(ov));
    };

    loadOverrides();
    interval = setInterval(loadOverrides, 30000);

    channel = supabase.channel("menu-overrides-customer")
      .on("postgres_changes",
        { event: "*", schema: "public", table: "menu_overrides" },
        () => { loadOverrides(); }
      )
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const isItemAvailable = useCallback((item) => {
    const o = overrides[item.id];
    if (o) {
      if (o.deleted) return false;
      if (o.available === false) return false;
    }
    return true;
  }, [overrides]);

  const filteredData = useMemo(() => {
    const customItems = Object.values(overrides).filter((d) => d.is_custom && !d.deleted && d.available !== false);

    const merged = menuData.map((cat) => {
      const staticItems = cat.items.filter(
        (item) =>
          isItemAvailable(item) &&
          item.name.toLowerCase().includes(search.toLowerCase())
      );
      const catCustom = customItems
        .filter((c) => c.category_id === cat.id && c.name.toLowerCase().includes(search.toLowerCase()))
        .map((c) => ({
          id: c.id,
          name: c.name,
          price: c.price,
          halfPrice: c.half_price,
          unit: c.unit || "piece",
          desc: null,
          isCustom: true,
        }));
      return { ...cat, items: [...staticItems, ...catCustom] };
    }).filter((cat) => cat.items.length > 0);

    const otherCustom = customItems
      .filter((c) => !menuData.some((cat) => cat.id === c.category_id) && c.name.toLowerCase().includes(search.toLowerCase()))
      .map((c) => ({
        id: c.id,
        name: c.name,
        price: c.price,
        halfPrice: c.half_price,
        unit: c.unit || "piece",
        desc: null,
        isCustom: true,
      }));

    if (otherCustom.length > 0) {
      merged.push({ id: "_custom", category: "Other", items: otherCustom });
    }

    return merged;
  }, [search, overrides, isItemAvailable]);

  const handleAdd = (item, qty = 1, isHalf = false) => {
    addToCart({ ...item, tableId }, qty, isHalf);
    const key = item.id + (isHalf ? "-half" : "");
    setAddedItems((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => setAddedItems((prev) => ({ ...prev, [key]: false })), 800);
  };

  const formatPrice = (price) => `₹${price}`;

  const unitLabel = (unit) => {
    const map = { kg: "/kg", piece: "/pc", piece6: "/6 pcs", plate: "", glass: "", bowl: "", cup: "", mrp: "" };
    return map[unit] || "";
  };

  return (
    <div>
      <div className="sticky top-16 z-40 bg-cream pb-3 no-print">
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-gray-100 bg-white focus:border-gold focus:outline-none text-sm shadow-sm"
          />
        </div>
        {search && (
          <p className="text-xs text-gray-400 mt-1.5 ml-1">
            {filteredData.reduce((s, c) => s + c.items.length, 0)} {t("items")}
          </p>
        )}
      </div>

      <div className="space-y-6 mt-2">
        {filteredData.map((cat) => (
          <div key={cat.id}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/10 to-gold/10 flex items-center justify-center">
                <span className="text-primary font-bold text-[10px]">#</span>
              </div>
              <h3 className="text-base font-bold text-primary">{cat.category}</h3>
              <span className="text-[11px] text-gray-400 bg-white/60 px-2 py-0.5 rounded-full">{cat.items.length}</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {cat.items.map((item) => {
                const hasHalf = item.halfPrice != null;
                const overridePrice = overrides[item.id]?.price;
                const overrideHalf = overrides[item.id]?.half_price;
                const displayPrice = overridePrice || item.price;
                const displayHalf = overrideHalf || item.halfPrice;
                return (
                  <div key={item.id} className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-50 hover:shadow-md hover:border-gray-100 transition flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-800">{item.name}</h4>
                      {item.desc && <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{item.desc}</p>}
                      <div className="flex items-center gap-2 mt-0.5">
                        {hasHalf ? (
                          <span className="text-xs text-gray-500">
                            <span className="font-semibold text-primary">{formatPrice(displayHalf)}</span>
                            <span className="text-gray-300 mx-1">/</span>
                            <span className="font-semibold text-primary">{formatPrice(displayPrice)}</span>
                            <span className="text-gray-400 ml-0.5">{unitLabel(item.unit)}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">
                            <span className="font-semibold text-primary">{formatPrice(displayPrice)}</span>
                            <span className="text-gray-400 ml-0.5">{unitLabel(item.unit)}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      {hasHalf ? (
                        <>
                          <button
                            onClick={() => handleAdd(item, 1, false)}
                            className={`px-3.5 py-2 rounded-xl text-[11px] font-bold transition border ${
                              addedItems[item.id + "-full"]
                                ? "bg-emerald-500 text-white border-emerald-500 scale-95"
                                : "bg-primary/5 text-primary border-primary/10 hover:bg-primary/10"
                            }`}
                          >
                            Full
                          </button>
                          <button
                            onClick={() => handleAdd(item, 1, true)}
                            className={`px-3.5 py-2 rounded-xl text-[11px] font-bold transition border ${
                              addedItems[item.id + "-half"]
                                ? "bg-emerald-500 text-white border-emerald-500 scale-95"
                                : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                            }`}
                          >
                            Half
                          </button>
                        </>
                      ) : item.unit === "kg" ? (
                        <button
                          onClick={() => handleAdd(item, 0.5)}
                          className={`px-4 py-2 rounded-xl text-[11px] font-bold transition border ${
                            addedItems[item.id]
                              ? "bg-emerald-500 text-white border-emerald-500 scale-95"
                              : "bg-primary/5 text-primary border-primary/10 hover:bg-primary/10"
                          }`}
                        >
                          0.5
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAdd(item, 1)}
                          className={`px-4 py-2 rounded-xl text-[11px] font-bold transition border ${
                            addedItems[item.id]
                              ? "bg-emerald-500 text-white border-emerald-500 scale-95"
                              : "bg-primary/5 text-primary border-primary/10 hover:bg-primary/10"
                          }`}
                        >
                          + {t("add")}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {filteredData.length === 0 && (
          <div className="text-center py-20">
            <div className="text-3xl mb-3 opacity-20">🍽️</div>
            <p className="text-gray-400 text-sm font-medium">{t("noItems")}</p>
            {search && <button onClick={() => setSearch("")} className="text-gold text-xs mt-2 underline">{t("clear")}</button>}
          </div>
        )}
      </div>
    </div>
  );
}
