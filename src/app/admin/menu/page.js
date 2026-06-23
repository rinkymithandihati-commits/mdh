"use client";
import { useState, useMemo, useEffect } from "react";
import { t } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import menuData from "@/lib/menu-data";

const ALL_CATEGORIES = menuData.map((c) => ({ id: c.id, name: c.category }));

export default function AdminMenuPage() {
  const [search, setSearch] = useState("");
  const [prices, setPrices] = useState(() => {
    const initial = {};
    menuData.forEach((cat) =>
      cat.items.forEach((item) => {
        initial[item.id] = { price: item.price, halfPrice: item.halfPrice || 0, available: true };
      })
    );
    return initial;
  });
  const [overrides, setOverrides] = useState({});
  const [customItems, setCustomItems] = useState([]);
  const [saving, setSaving] = useState(null);
  const [showSaveBtn, setShowSaveBtn] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", categoryId: ALL_CATEGORIES[0]?.id || "", price: "", halfPrice: "", unit: "piece" });

  useEffect(() => {
    const loadOverrides = async () => {
      const { data } = await supabase.from("menu_overrides").select("*");
      const ov = {};
      const custom = [];
      (data || []).forEach((d) => {
        if (d.name && d.is_custom) {
          custom.push(d);
        } else {
          ov[d.id] = d;
        }
      });
      setOverrides(ov);
      setCustomItems(custom);
    };
    loadOverrides();

    const channel = supabase.channel("menu-overrides")
      .on("postgres_changes",
        { event: "*", schema: "public", table: "menu_overrides" },
        loadOverrides
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (Object.keys(overrides).length === 0 && customItems.length === 0) return;
    const merge = () => {
      setPrices((prev) => {
        const newPrices = { ...prev };
        Object.entries(overrides).forEach(([id, data]) => {
          if (data.price !== undefined) {
            newPrices[id] = { ...newPrices[id], ...data };
          }
        });
        customItems.forEach((item) => {
          newPrices[item.id] = { price: item.price, halfPrice: item.half_price || 0, available: item.available !== false };
        });
        return newPrices;
      });
    };
    merge();
  }, [overrides, customItems]);

  const handlePriceChange = (id, field, value) => {
    setPrices((prev) => ({ ...prev, [id]: { ...prev[id], [field]: parseFloat(value) || 0 } }));
    setShowSaveBtn(true);
  };

  const handleSave = async (id) => {
    setSaving(id);
    try {
      const p = prices[id];
      await supabase.from("menu_overrides").upsert({
        id,
        price: p.price,
        half_price: p.halfPrice,
        available: p.available,
      });
      setTimeout(() => setSaving(null), 1000);
    } catch (e) {
      alert("Error saving: " + e.message);
      setSaving(null);
    }
  };

  const toggleAvailability = (id) => {
    setPrices((prev) => ({
      ...prev,
      [id]: { ...prev[id], available: !prev[id]?.available },
    }));
    setShowSaveBtn(true);
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    try {
      if (item.is_custom) {
        await supabase.from("menu_overrides").delete().eq("id", item.id);
      } else {
        const p = prices[item.id] || {};
        await supabase.from("menu_overrides").upsert({
          id: item.id,
          price: p.price,
          half_price: p.halfPrice,
          available: p.available,
          deleted: true,
        });
      }
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name.trim()) return;
    try {
      const cat = ALL_CATEGORIES.find((c) => c.id === newItem.categoryId);
      await supabase.from("menu_overrides").insert({
        id: crypto.randomUUID(),
        name: newItem.name.trim(),
        category_id: newItem.categoryId,
        category: cat?.name || "",
        unit: newItem.unit,
        price: parseFloat(newItem.price) || 0,
        half_price: newItem.halfPrice ? parseFloat(newItem.halfPrice) : null,
        available: true,
        is_custom: true,
      });
      setNewItem({ name: "", categoryId: ALL_CATEGORIES[0]?.id || "", price: "", halfPrice: "", unit: "piece" });
      setShowAddModal(false);
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const filteredData = useMemo(() => {
    const merged = menuData.map((cat) => {
      const staticItems = cat.items.filter((item) => !overrides[item.id]?.deleted);
      const customInCat = customItems.filter((c) => c.category_id === cat.id);
      const allItems = [...staticItems, ...customInCat];
      return {
        ...cat,
        items: allItems.filter((item) =>
          item.name.toLowerCase().includes(search.toLowerCase())
        ),
      };
    }).filter((cat) => cat.items.length > 0);
    const customInOther = customItems.filter((c) => {
      const known = ALL_CATEGORIES.some((cat) => cat.id === c.category_id);
      return !known && c.name.toLowerCase().includes(search.toLowerCase());
    });
    if (customInOther.length > 0) {
      merged.push({ id: "_custom", category: "Other", items: customInOther });
    }
    return merged;
  }, [search, overrides, customItems]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1">
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
        <button onClick={() => setShowAddModal(true)} className="px-5 py-3 bg-gold text-white rounded-2xl text-sm font-bold shadow-md hover:bg-gold/90 transition flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Item
        </button>
      </div>

      <div className="space-y-4">
        {filteredData.map((cat) => (
          <div key={cat.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/10 to-gold/10 flex items-center justify-center">
                <span className="text-primary font-bold text-sm">#</span>
              </div>
              <h3 className="font-bold text-primary text-lg">{cat.category}</h3>
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{cat.items.length} items</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 text-xs border-b border-gray-50">
                    <th className="pb-3 font-medium">{t("items")}</th>
                    <th className="pb-3 font-medium">Unit</th>
                    <th className="pb-3 font-medium w-24">{t("price")}</th>
                    <th className="pb-3 font-medium w-20">Half</th>
                    <th className="pb-3 font-medium w-16">Avail</th>
                    <th className="pb-3 font-medium w-16">{t("save")}</th>
                    <th className="pb-3 font-medium w-16">Del</th>
                  </tr>
                </thead>
                <tbody>
                  {cat.items.map((item) => {
                    const p = prices[item.id] || { price: item.price, halfPrice: item.halfPrice || 0, available: true };
                    const isCustom = item.is_custom;
                    return (
                      <tr key={item.id} className={`border-b border-gray-50 hover:bg-gray-50/30 transition ${isCustom ? "bg-amber-50/30" : ""}`}>
                        <td className="py-3">
                          <span className={`text-sm font-medium ${!p.available ? "line-through text-gray-300" : "text-gray-800"}`}>
                            {item.name}
                          </span>
                          {isCustom && <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">custom</span>}
                        </td>
                        <td className="py-3">
                          <span className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full">{item.unit}</span>
                        </td>
                        <td className="py-3">
                          <input
                            type="number"
                            value={p.price}
                            onChange={(e) => handlePriceChange(item.id, "price", e.target.value)}
                            className={`w-20 p-1.5 border border-gray-200 rounded-lg text-center text-sm bg-white focus:border-gold focus:outline-none ${!p.available ? "opacity-50" : ""}`}
                            disabled={item.unit === "mrp"}
                          />
                        </td>
                        <td className="py-3">
                          {item.halfPrice !== null && item.halfPrice !== undefined ? (
                            <input
                              type="number"
                              value={p.halfPrice}
                              onChange={(e) => handlePriceChange(item.id, "halfPrice", e.target.value)}
                              className={`w-16 p-1.5 border border-gray-200 rounded-lg text-center text-sm bg-white focus:border-gold focus:outline-none ${!p.available ? "opacity-50" : ""}`}
                            />
                          ) : (
                            <span className="text-xs text-gray-300">---</span>
                          )}
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => toggleAvailability(item.id)}
                            className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                              p.available
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100"
                                : "bg-red-50 text-red-500 border border-red-200 hover:bg-red-100"
                            }`}
                          >
                            {p.available ? "✓" : "✕"}
                          </button>
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => handleSave(item.id)}
                            disabled={saving === item.id}
                            className={`px-4 py-1.5 rounded-xl text-xs font-medium transition ${
                              saving === item.id
                                ? "bg-emerald-500 text-white shadow-sm"
                                : "bg-primary/5 text-primary border border-primary/10 hover:bg-primary/10"
                            }`}
                          >
                            {saving === item.id ? (
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Done
                              </span>
                            ) : t("save")}
                          </button>
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => handleDelete(item)}
                            className="w-9 h-9 rounded-xl text-xs font-bold bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition"
                          >
                            🗑
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-primary">Add New Item</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="space-y-3.5">
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Item Name</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g. Paneer Butter Masala"
                  className="w-full p-3 border-2 border-gray-100 rounded-xl text-sm focus:border-gold focus:outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Category</label>
                <select
                  value={newItem.categoryId}
                  onChange={(e) => setNewItem({ ...newItem, categoryId: e.target.value })}
                  className="w-full p-3 border-2 border-gray-100 rounded-xl text-sm focus:border-gold focus:outline-none bg-white"
                >
                  {ALL_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Unit</label>
                  <select
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full p-3 border-2 border-gray-100 rounded-xl text-sm focus:border-gold focus:outline-none bg-white"
                  >
                    <option value="piece">Piece</option>
                    <option value="kg">Kg</option>
                    <option value="mrp">MRP</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Price (₹)</label>
                  <input
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    placeholder="0"
                    className="w-full p-3 border-2 border-gray-100 rounded-xl text-sm focus:border-gold focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Half Price (₹) <span className="text-gray-300 font-normal">(optional)</span></label>
                <input
                  type="number"
                  value={newItem.halfPrice}
                  onChange={(e) => setNewItem({ ...newItem, halfPrice: e.target.value })}
                  placeholder="Leave empty if not applicable"
                  className="w-full p-3 border-2 border-gray-100 rounded-xl text-sm focus:border-gold focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 border-2 border-gray-200 text-gray-500 rounded-xl text-sm font-bold hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleAddItem} disabled={!newItem.name.trim()} className="flex-1 py-3 bg-gold text-white rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-gold/90 transition shadow-md">
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
