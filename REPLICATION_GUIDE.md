# Complete POS + QR Ordering System — Replication Guide

Use this prompt with opencode to build the entire system from scratch.

Replace placeholders: `[Business Name]`, `[Phone]`, `[Address]`, `[Firebase keys]`.

---

## PHASE 1: Project Setup

```
npx create-next-app@latest [businessname]-pos --use-npm
# ✓ src/ directory
# ✓ Tailwind CSS (v4)
cd [businessname]-pos
npm install firebase uuid
```

Then:
- Create Firebase project → Firestore → Test mode
- Copy firebaseConfig keys

**Create `jsconfig.json`** (in root):
```json
{ "compilerOptions": { "paths": { "@/*": ["./src/*"] } } }
```

**`package.json` must include:**
```json
"dependencies": {
  "firebase": "^12.15.0",
  "next": "16.2.9",
  "react": "19.2.4",
  "react-dom": "19.2.4",
  "uuid": "^14.0.0"
},
"devDependencies": {
  "@tailwindcss/postcss": "^4",
  "tailwindcss": "^4",
  "eslint": "^9"
}
```

---

## PHASE 2: Firebase + i18n

**`src/lib/firebase.js`**:
```js
"use client";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

export function getFirestoreInstance() {
  const existing = getApps().find((a) => a.name === "myapp");
  const app = existing || initializeApp(firebaseConfig, "myapp");
  return getFirestore(app);
}
```

**`src/lib/i18n.js`**:
```js
const en = {
  appName: "[Business Name]", subtitle: "Sweets & Restaurant Since 1890",
  menu: "Menu", ourMenu: "Our Menu", search: "Search items...",
  addToCart: "Add to Cart", added: "Added",
  cart: "Cart", yourCart: "Your Cart", emptyCart: "Cart is empty",
  total: "Total", placeOrder: "Place Order",
  orderType: "Order Type", dineIn: "Dine In", pickup: "Pickup",
  tableNo: "Table No", enterTableNo: "Enter table number",
  orderSummary: "Order Summary", orderConfirmed: "Order Confirmed!",
  orderNumber: "Order Number", estimatedTime: "Estimated time: 20-30 mins",
  backToMenu: "Back to Menu", orderMore: "Order More",
  admin: "Admin", login: "Login", password: "Password",
  enterPassword: "Enter admin password", wrongPassword: "Wrong password",
  liveOrders: "Live Orders", billing: "Billing",
  dailySales: "Daily Sales", menuManage: "Menu Management",
  payment: "Payment", cash: "Cash", upi: "UPI", card: "Card",
  printBill: "Print Bill", discount: "Discount",
  newOrder: "New Order", preparing: "Preparing",
  ready: "Ready", delivered: "Delivered", pending: "Pending",
  all: "All", today: "Today", thisMonth: "This Month",
  sales: "Sales", revenue: "Revenue", orders: "Orders",
  items: "Items", qty: "Qty", price: "Price", amount: "Amount",
  edit: "Edit", save: "Save", cancel: "Cancel", delete: "Delete",
  logout: "Logout",
  kg: "kg", gram: "g", piece: "pc", plate: "plate",
  glass: "glass", bowl: "bowl", cup: "cup", mrp: "MRP",
  half: "Half", full: "Full",
  totalOrders: "Total Orders", orderValue: "Order Value",
  topSelling: "Top Selling Items",
  searchPlaceholder: "Search menu items...",
  noItems: "No items found", notes: "Special Notes",
};
export function t(key) { return en[key] || key; }
```

---

## PHASE 3: Menu Data

Create `src/lib/menu-data.js`:
```js
const menuData = [
  {
    id: "thali",
    category: "Thali",
    items: [
      { id: "thali-special", name: "Special Thali", price: 299, halfPrice: null, unit: "plate", desc: "Includes: Dal, Sabzi, Roti, Rice, Raita, Salad, Pickle, Papad, Sweet" },
      { id: "thali-veg", name: "Veg Thali", price: 199, halfPrice: null, unit: "plate", desc: "Dal, 2 Sabzi, Roti, Rice, Raita, Salad" },
      // ... 10+ thali items with desc field
    ]
  },
  {
    id: "main-course",
    category: "Main Course",
    items: [
      { id: "paneer-butter-masala", name: "Paneer Butter Masala", price: 220, halfPrice: 120, unit: "plate" },
      { id: "dal-makhani", name: "Dal Makhani", price: 180, halfPrice: 100, unit: "plate" },
      { id: "shahi-paneer", name: "Shahi Paneer", price: 240, halfPrice: 130, unit: "plate" },
      { id: "matar-paneer", name: "Matar Paneer", price: 200, halfPrice: 110, unit: "plate" },
      { id: "paneer-do-pyaza", name: "Paneer Do Pyaza", price: 230, halfPrice: 125, unit: "plate" },
      { id: "palak-paneer", name: "Palak Paneer", price: 210, halfPrice: 115, unit: "plate" },
      { id: "kadhai-paneer", name: "Kadhai Paneer", price: 240, halfPrice: 130, unit: "plate" },
      { id: "malai-kofta", name: "Malai Kofta", price: 250, halfPrice: 135, unit: "plate" },
      { id: "chana-masala", name: "Chana Masala", price: 150, halfPrice: 85, unit: "plate" },
      { id: "dal-tadka", name: "Dal Tadka", price: 160, halfPrice: 90, unit: "plate" },
      { id: "mushroom-masala", name: "Mushroom Masala", price: 220, halfPrice: 120, unit: "plate" },
      { id: "bhindi-do-pyaza", name: "Bhindi Do Pyaza", price: 160, halfPrice: 90, unit: "plate" },
      { id: "baingan-bharta", name: "Baingan Bharta", price: 170, halfPrice: 95, unit: "plate" },
      { id: "mix-veg", name: "Mix Veg", price: 160, halfPrice: 90, unit: "plate" },
      { id: "aloo-gobi", name: "Aloo Gobi", price: 140, halfPrice: 80, unit: "plate" },
      { id: "aloo-matar", name: "Aloo Matar", price: 140, halfPrice: 80, unit: "plate" },
    ]
  },
  { id: "rotis", category: "Roti / Breads", items: [
    { id: "tawa-roti", name: "Tawa Roti", price: 10, halfPrice: null, unit: "piece" },
    { id: "butter-roti", name: "Butter Roti", price: 15, halfPrice: null, unit: "piece" },
    { id: "tandoori-roti", name: "Tandoori Roti", price: 15, halfPrice: null, unit: "piece" },
    { id: "butter-tandoori", name: "Butter Tandoori Roti", price: 20, halfPrice: null, unit: "piece" },
    { id: "missi-roti", name: "Missi Roti", price: 20, halfPrice: null, unit: "piece" },
    { id: "lachha-parantha", name: "Lachha Parantha", price: 30, halfPrice: null, unit: "piece" },
    { id: "pudina-parantha", name: "Pudina Parantha", price: 35, halfPrice: null, unit: "piece" },
    { id: "stuffed-parantha", name: "Stuffed Parantha", price: 45, halfPrice: null, unit: "piece" },
    { id: "aloo-parantha", name: "Aloo Parantha", price: 50, halfPrice: null, unit: "piece" },
    { id: "gobhi-parantha", name: "Gobhi Parantha", price: 55, halfPrice: null, unit: "piece" },
    { id: "paneer-parantha", name: "Paneer Parantha", price: 70, halfPrice: null, unit: "piece" },
    { id: "onion-parantha", name: "Onion Parantha", price: 50, halfPrice: null, unit: "piece" },
    { id: "n-amritsari", name: "Amritsari Naan", price: 40, halfPrice: null, unit: "piece" },
    { id: "butter-naan", name: "Butter Naan", price: 40, halfPrice: null, unit: "piece" },
    { id: "garlic-naan", name: "Garlic Naan", price: 50, halfPrice: null, unit: "piece" },
    { id: "stuffed-naan", name: "Stuffed Naan", price: 60, halfPrice: null, unit: "piece" },
    { id: "pudina-naan", name: "Pudina Naan", price: 55, halfPrice: null, unit: "piece" },
    { id: "roti-basket", name: "Roti Basket (6 pcs)", price: 80, halfPrice: null, unit: "piece6" },
    { id: "tawa-parantha", name: "Tawa Parantha", price: 25, halfPrice: null, unit: "piece" },
  ]},
  { id: "chinese", category: "Chinese", items: [
    { id: "veg-manchurian-dry", name: "Veg Manchurian (Dry)", price: 120, halfPrice: null, unit: "plate" },
    { id: "veg-manchurian-gravy", name: "Veg Manchurian (Gravy)", price: 130, halfPrice: null, unit: "plate" },
    { id: "gobi-manchurian", name: "Gobi Manchurian", price: 120, halfPrice: null, unit: "plate" },
    { id: "paneer-manchurian", name: "Paneer Manchurian", price: 150, halfPrice: null, unit: "plate" },
    { id: "fried-rice", name: "Fried Rice", price: 120, halfPrice: null, unit: "plate" },
    { id: "schezwan-rice", name: "Schezwan Rice", price: 140, halfPrice: null, unit: "plate" },
    { id: "hakka-noodles", name: "Hakka Noodles", price: 120, halfPrice: null, unit: "plate" },
    { id: "schezwan-noodles", name: "Schezwan Noodles", price: 140, halfPrice: null, unit: "plate" },
    { id: "chopsuey", name: "American Chopsuey", price: 180, halfPrice: null, unit: "plate" },
    { id: "manchow-soup", name: "Manchow Soup", price: 90, halfPrice: null, unit: "bowl" },
    { id: "hot-sour-soup", name: "Hot & Sour Soup", price: 90, halfPrice: null, unit: "bowl" },
    { id: "sweet-corn-soup", name: "Sweet Corn Soup", price: 90, halfPrice: null, unit: "bowl" },
    { id: "spring-roll", name: "Spring Roll (4 pcs)", price: 110, halfPrice: null, unit: "plate" },
    { id: "chilli-garlic-noodles", name: "Chilli Garlic Noodles", price: 140, halfPrice: null, unit: "plate" },
    { id: "singapore-noodles", name: "Singapore Noodles", price: 150, halfPrice: null, unit: "plate" },
  ]},
  // ... include ALL 22 categories with same structure
  // Complete structure at src/lib/menu-data.js in the original project
];
export default menuData;
```

Categories ordered:
1. Thali `(id: "thali")`
2. Main Course `(id: "main-course")`
3. Roti / Breads `(id: "rotis")`
4. Parantha `(id: "parantha")`
5. Rice `(id: "rice")`
6. Rayta / Salad `(id: "rayta")`
7. Dips / Chutney `(id: "dips")`
8. Indian Snacks `(id: "snacks")`
9. Chunky Chaat `(id: "chaat")`
10. Chaap / Tikka `(id: "chaap")`
11. Burger / Sandwich `(id: "burger")`
12. Pizza `(id: "pizza")`
13. Pasta `(id: "pasta")`
14. Momos `(id: "momos")`
15. Chinese `(id: "chinese")`
16. South Indian `(id: "south-indian")`
17. Shake `(id: "shake")`
18. Lassi `(id: "lassi")`
19. Soda `(id: "soda")`
20. Juice `(id: "juice")`
21. Desserts `(id: "desserts")`
22. Drinks `(id: "drinks")`

**CRITICAL**: Must have 100+ items, all with realistic ₹ prices. Use units: `"piece"`, `"kg"`, `"plate"`, `"glass"`, `"bowl"`, `"cup"`, `"piece6"`, `"mrp"`. Items with `halfPrice` must have it as a number (not null). Thali items must have `desc` field.

---

## PHASE 4: Cart Context

**`src/context/CartContext.js`**:
```js
"use client";
import { createContext, useContext, useState, useCallback } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addToCart = useCallback((item, qty, isHalf) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.isHalf === !!isHalf);
      if (existing) return prev.map((i) => i.id === item.id && i.isHalf === !!isHalf ? { ...i, qty: i.qty + qty } : i);
      const unitPrice = isHalf && item.halfPrice ? item.halfPrice : item.price;
      return [...prev, { ...item, qty, isHalf: !!isHalf, unitPrice }];
    });
  }, []);

  const updateQty = useCallback((id, qty, isHalf) => {
    if (qty <= 0) { setCart((prev) => prev.filter((i) => !(i.id === id && i.isHalf === isHalf))); return; }
    setCart((prev) => prev.map((i) => i.id === id && i.isHalf === isHalf ? { ...i, qty } : i));
  }, []);

  const removeItem = useCallback((id, isHalf) => {
    setCart((prev) => prev.filter((i) => !(i.id === id && i.isHalf === isHalf)));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const getCartTotal = useCallback(() => cart.reduce((s, i) => s + i.unitPrice * i.qty, 0), [cart]);
  const getCartCount = useCallback(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQty, removeItem, clearCart, getCartTotal, getCartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() { return useContext(CartContext); }
```

---

## PHASE 5: Root Layout

**`src/app/layout.js`** (SERVER COMPONENT):
```js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "[Business Name] - Sweets & Restaurant Since 1890",
  description: "[Business Name] - Premium Indian Sweets & Restaurant",
  icons: { icon: "/logo.png", apple: "/logo.png" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-cream">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
```

---

## PHASE 6: Global CSS

**`src/app/globals.css`**:
```css
@import "tailwindcss";

@theme inline {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --color-primary: #6B1D1D;
  --color-primary-light: #8B2D2D;
  --color-secondary: #C9A84C;
  --color-secondary-light: #E8CF6E;
  --color-cream: #FFFDF7;
  --color-gold: #C9A84C;
  --color-maroon: #6B1D1D;
}

* { -webkit-tap-highlight-color: transparent; }

body {
  font-family: 'Georgia', 'Times New Roman', serif;
  background-color: var(--color-cream);
  color: #2D1B1B;
}

::selection { background: #C9A84C; color: #6B1D1D; }

.category-scroll::-webkit-scrollbar { display: none; }
.category-scroll { -ms-overflow-style: none; scrollbar-width: none; }

.menu-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
.menu-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(107, 29, 29, 0.1); }
.menu-card:active { transform: scale(0.97); }

.hero-overlay { background: linear-gradient(135deg, rgba(107, 29, 29, 0.85) 0%, rgba(43, 12, 12, 0.7) 100%); }

.gold-text {
  background: linear-gradient(135deg, #C9A84C, #E8CF6E, #C9A84C);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.animate-fade-up { animation: fadeInUp 0.6s ease forwards; }

@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
.shimmer { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); background-size: 200% 100%; animation: shimmer 2s infinite; }

@keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
.animate-pulse-dot { animation: pulse-dot 1.5s ease-in-out infinite; }

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
input[type="number"] { -moz-appearance: textfield; }

@media print { .no-print { display: none !important; } }
```

---

## PHASE 7: Header Component

**`src/components/Header.js`**:
```js
"use client";
import { useCart } from "@/context/CartContext";
import { t } from "@/lib/i18n";
import Link from "next/link";

export default function Header({ showCart = true, transparent = false }) {
  const { getCartCount } = useCart();
  const count = getCartCount();
  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 no-print ${transparent ? "bg-transparent" : "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"}`}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11 md:w-14 md:h-14 rounded-full overflow-hidden ring-2 ring-gold/30 group-hover:ring-gold/60 transition-all">
            <img src="/logo.png" alt="[Business Name]" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-primary leading-tight tracking-tight">[Business Name]</h1>
            <p className="text-[10px] md:text-xs text-gold font-medium tracking-wider uppercase">{t("subtitle")}</p>
          </div>
        </Link>
        {showCart && (
          <Link href="/cart" className="relative p-2 rounded-full hover:bg-primary/5 transition">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            {count > 0 && <span className="absolute -top-0.5 -right-0.5 bg-secondary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">{count > 9 ? "9+" : count}</span>}
          </Link>
        )}
      </div>
    </header>
  );
}
```

---

## PHASE 8: MenuGrid (Customer-facing)

**`src/components/MenuGrid.js`** — Uses `getDocs` (NOT onSnapshot):
```js
"use client";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { t } from "@/lib/i18n";
import { getFirestoreInstance } from "@/lib/firebase";
import { collection, query, getDocs } from "firebase/firestore";
import menuData from "@/lib/menu-data";

export default function MenuGrid({ tableId }) {
  const { addToCart } = useCart();
  const [search, setSearch] = useState("");
  const [addedItems, setAddedItems] = useState({});
  const [overrides, setOverrides] = useState({});

  useEffect(() => {
    const cached = localStorage.getItem("menuOverrides");
    if (cached) { try { setOverrides(JSON.parse(cached)); } catch (e) {} }
    const db = getFirestoreInstance();
    getDocs(query(collection(db, "menuOverrides"))).then((snap) => {
      const ov = {}; snap.forEach((d) => { ov[d.id] = d.data(); });
      setOverrides(ov);
      localStorage.setItem("menuOverrides", JSON.stringify(ov));
    });
  }, []);

  const isItemAvailable = (item) => {
    const o = overrides[item.id];
    return !(o && (o.deleted || o.available === false));
  };

  const filteredData = menuData.map((cat) => ({
    ...cat,
    items: cat.items.filter((item) => isItemAvailable(item) && item.name.toLowerCase().includes(search.toLowerCase())),
  })).filter((cat) => cat.items.length > 0);

  const handleAdd = (item, qty = 1, isHalf = false) => {
    addToCart(item, qty, isHalf);
    const key = item.id + (isHalf ? "-half" : "");
    setAddedItems((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => setAddedItems((prev) => ({ ...prev, [key]: false })), 800);
  };

  const unitLabel = (unit) => ({ kg: "/kg", piece: "/pc", piece6: "/6 pcs", plate: "", glass: "", bowl: "", cup: "", mrp: "" })[unit] || "";

  return (
    <div>
      {/* Sticky search bar */}
      <div className="sticky top-16 z-40 bg-cream pb-3 no-print">
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder={t("search")} value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-gray-100 bg-white focus:border-gold focus:outline-none text-sm shadow-sm" />
        </div>
        {search && <p className="text-xs text-gray-400 mt-1.5 ml-1">{filteredData.reduce((s, c) => s + c.items.length, 0)} {t("items")}</p>}
      </div>

      <div className="space-y-6 mt-2">
        {filteredData.length === 0 && (
          <div className="text-center py-20">
            <div className="text-3xl mb-3 opacity-20">🍽️</div>
            <p className="text-gray-400 text-sm font-medium">{t("noItems")}</p>
            {search && <button onClick={() => setSearch("")} className="text-gold text-xs mt-2 underline">{t("clear")}</button>}
          </div>
        )}
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
                const overrideHalf = overrides[item.id]?.halfPrice;
                const displayPrice = overridePrice || item.price;
                const displayHalf = overrideHalf || item.halfPrice;
                const animKey = item.id;
                const halfAnimKey = item.id + "-half";
                return (
                  <div key={item.id} className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-50 hover:shadow-md hover:border-gray-100 transition flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-800">{item.name}</h4>
                      {item.desc && <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{item.desc}</p>}
                      <div className="flex items-center gap-2 mt-0.5">
                        {hasHalf ? (
                          <span className="text-xs text-gray-500">
                            <span className="font-semibold text-primary">₹{displayHalf}</span>
                            <span className="text-gray-300 mx-1">/</span>
                            <span className="font-semibold text-primary">₹{displayPrice}</span>
                            <span className="text-gray-400 ml-0.5">{unitLabel(item.unit)}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">
                            <span className="font-semibold text-primary">₹{displayPrice}</span>
                            <span className="text-gray-400 ml-0.5">{unitLabel(item.unit)}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      {hasHalf ? (
                        <>
                          <button onClick={() => handleAdd(item, 1, false)}
                            className={`px-3.5 py-2 rounded-xl text-[11px] font-bold transition border ${addedItems[animKey] ? "bg-emerald-500 text-white border-emerald-500 scale-95" : "bg-primary/5 text-primary border-primary/10 hover:bg-primary/10"}`}>
                            Full
                          </button>
                          <button onClick={() => handleAdd(item, 1, true)}
                            className={`px-3.5 py-2 rounded-xl text-[11px] font-bold transition border ${addedItems[halfAnimKey] ? "bg-emerald-500 text-white border-emerald-500 scale-95" : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"}`}>
                            Half
                          </button>
                        </>
                      ) : item.unit === "kg" ? (
                        <button onClick={() => handleAdd(item, 0.5)}
                          className={`px-4 py-2 rounded-xl text-[11px] font-bold transition border ${addedItems[animKey] ? "bg-emerald-500 text-white border-emerald-500 scale-95" : "bg-primary/5 text-primary border-primary/10 hover:bg-primary/10"}`}>
                          0.5
                        </button>
                      ) : (
                        <button onClick={() => handleAdd(item)}
                          className={`px-4 py-2 rounded-xl text-[11px] font-bold transition border ${addedItems[animKey] ? "bg-emerald-500 text-white border-emerald-500 scale-95" : "bg-primary/5 text-primary border-primary/10 hover:bg-primary/10"}`}>
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
      </div>
    </div>
  );
}
```

---

## PHASE 9: Homepage

**`src/app/page.js`**:
```js
"use client";
import Header from "@/components/Header";
import MenuGrid from "@/components/MenuGrid";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-cream">
      <Header transparent={false} showCart={true} />

      {/* Hero — full width image with overlay, "Since 1890" badge, CTA buttons */}
      <section className="relative h-[50vh] md:h-[65vh] overflow-hidden">
        <Image src="/hero-new.webp" alt="[Business Name]" fill className="object-cover" priority />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4 max-w-3xl animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-gold/20 backdrop-blur-sm px-4 py-1.5 rounded-full mb-4 md:mb-6">
              <span className="w-1.5 h-1.5 bg-gold rounded-full" />
              <span className="text-gold text-xs md:text-sm font-medium tracking-wider uppercase">Since 1890</span>
              <span className="w-1.5 h-1.5 bg-gold rounded-full" />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-3 md:mb-4 leading-tight">[Business Name]</h1>
            <p className="text-lg md:text-xl text-white/80 mb-6 md:mb-8 font-light">Premium Indian Sweets & Restaurant — [City]</p>
            <div className="flex items-center justify-center gap-3">
              <a href="#menu" className="px-6 md:px-8 py-3 bg-gold text-maroon font-bold rounded-full text-sm md:text-base hover:bg-gold/90 transition shadow-lg">Explore Menu</a>
              <Link href="/cart" className="px-6 md:px-8 py-3 bg-white/10 backdrop-blur-sm text-white border border-white/20 font-medium rounded-full text-sm md:text-base hover:bg-white/20 transition">View Cart</Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cream to-transparent" />
      </section>

      {/* Menu */}
      <section id="menu" className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        <div className="text-center mb-6 md:mb-8">
          <span className="text-gold text-sm font-medium tracking-widest uppercase">Our Collection</span>
          <h2 className="text-3xl md:text-4xl font-bold text-primary mt-1">Premium Menu</h2>
          <div className="w-16 h-0.5 bg-gold mx-auto mt-3 rounded-full" />
        </div>
        <MenuGrid />
      </section>

      {/* Footer with hidden admin dot */}
      <footer className="bg-primary text-white/60 py-8 mt-8 relative">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <img src="/logo.png" alt="Logo" width={32} height={32} className="rounded-full" style={{ width: 32, height: 32 }} />
            <span className="text-white font-bold text-lg">[Business Name]</span>
          </div>
          <p className="text-sm">Since 1890 | [City], [State]</p>
          <p className="text-xs mt-2 opacity-50">Premium Indian Sweets & Restaurant</p>
        </div>
        {/* Admin access dot — gray semi-transparent 12px circle bottom-right */}
        <div onClick={() => router.push("/admin/login")}
          className="absolute bottom-2 right-2 w-3 h-3 bg-gray-500/30 hover:bg-gray-500/50 rounded-full cursor-pointer transition" />
      </footer>
    </div>
  );
}
```

**Assets to add to `public/`**:
- `logo.png` — your brand logo (48×48 or larger, circular crop)
- `hero-new.webp` — wide hero image (1920×1080 recommended, from Unsplash)

---

## PHASE 10: Cart + Checkout

**`src/app/cart/page.js`**:
- "use client", uses `useCart()`, `getFirestoreInstance()`, `addDoc`, `serverTimestamp`
- Empty state: show cart SVG icon + "Cart is empty" + "Back to Menu" button
- Item list: each row shows logo gradient icon, name, unitPrice × qty, half badge, total
- Qty controls: − (decrease/qty-1) / number / + (increase/qty+1) / delete (trash icon) per row
- **Dine In only** — show "🍽 Dine In" badge (no pickup option)
- Table number input (required, type="number")
- Notes input (optional)
- Subtotal + Total display
- Place Order button → `disabled` when placing or no tableNo
- On order: save to Firestore with fields: `{ items, total, orderType: "dinein", tableNo, notes, status: "pending", paid: false, createdAt: serverTimestamp(), orderDate: "YYYY-MM-DD" }`
- On success: `clearCart()` → `router.push("/order-success?id=DOC_ID")`

**`src/app/order-success/page.js`** — MUST be Suspense-wrapped:
```js
"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { t } from "@/lib/i18n";
import Link from "next/link";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <img src="/logo.png" alt="" width={48} height={48} className="rounded-full" style={{ width: 48, height: 48 }} />
            <span className="text-xl font-bold text-primary">[Business Name]</span>
          </Link>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">{t("orderConfirmed")}</h2>
          <p className="text-gray-400 mb-6 text-sm">{t("estimatedTime")}</p>
          <div className="bg-gradient-to-br from-primary/5 to-gold/5 rounded-2xl p-5 mb-6 border border-primary/5">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">{t("orderNumber")}</p>
            <p className="text-sm font-bold text-primary break-all font-mono">{orderId || "Generating..."}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/" className="w-full py-3 bg-primary text-white rounded-2xl font-bold shadow-md hover:bg-primary-light transition">← {t("backToMenu")}</Link>
            <Link href="/cart" className="w-full py-3 bg-white text-primary border-2 border-primary/20 rounded-2xl font-bold hover:bg-primary/5 transition">🛒 {t("orderMore")}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" /><p className="text-gray-400 text-sm">Loading...</p></div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
```

---

## PHASE 11: Table Ordering Page

**`src/app/table/[id]/page.js`**:
```js
"use client";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import MenuGrid from "@/components/MenuGrid";
import Image from "next/image";

export default function TablePage() {
  const params = useParams();
  const tableId = params.id;
  return (
    <div className="min-h-screen bg-cream">
      <Header showCart={true} />
      <section className="relative h-40 md:h-52 overflow-hidden">
        <Image src="/hero-bg.webp" alt="" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-gold/20 backdrop-blur-sm px-3 py-1 rounded-full mb-2">
              <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
              <span className="text-gold text-xs font-medium">Table {tableId}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">[Business Name]</h1>
            <p className="text-white/60 text-sm">Scan & order — we serve fresh!</p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-cream to-transparent" />
      </section>
      <main className="max-w-6xl mx-auto px-4 py-4">
        <div className="text-center mb-4">
          <span className="text-gold text-xs font-medium tracking-widest uppercase">Order From Table</span>
          <h2 className="text-2xl font-bold text-primary mt-1">Our Menu</h2>
        </div>
        <MenuGrid tableId={tableId} />
      </main>
    </div>
  );
}
```

Add `public/hero-bg.webp` — any food/restaurant background image.

---

## PHASE 12: Admin Login

**`src/app/admin/login/page.js`**:
```js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import Image from "next/image";

const ADMIN_PASSWORD = "admin123";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("adminAuth", "true");
      router.push("/admin/dashboard");
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <div className="text-center mb-6">
          <Image src="/logo.png" alt="[Business Name]" width={80} height={80} className="rounded-full mx-auto mb-3" />
          <h2 className="text-xl font-bold text-primary">{t("admin")}</h2>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder={t("enterPassword")}
            className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none text-center text-lg" autoFocus />
          {error && <p className="text-red-500 text-sm text-center">{t("wrongPassword")}</p>}
          <button type="submit" className="w-full py-3 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary-light transition">{t("login")}</button>
        </form>
      </div>
    </div>
  );
}
```

---

## PHASE 13: Admin Layout + Sidebar

**`src/app/admin/layout.js`**:
```js
"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import { t } from "@/lib/i18n";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/admin/login") return;
    if (!sessionStorage.getItem("adminAuth")) router.push("/admin/login");
  }, [pathname, router]);

  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-3 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" width={36} height={36} className="rounded-full" style={{ width: 36, height: 36 }} />
            <h1 className="font-bold text-primary">[Business Name] - Admin</h1>
          </div>
          <button onClick={() => { sessionStorage.removeItem("adminAuth"); router.push("/admin/login"); }}
            className="px-3 py-1.5 rounded-full text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition">{t("logout")}</button>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
```

Also create **`src/app/admin/page.js`** — redirect to dashboard:
```js
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function AdminPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/admin/dashboard"); }, [router]);
  return null;
}
```

**`src/components/AdminSidebar.js`**:
```js
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { t } from "@/lib/i18n";

const links = [
  { href: "/admin/dashboard", labelKey: "liveOrders", icon: "📋" },
  { href: "/admin/billing", labelKey: "billing", icon: "🧾" },
  { href: "/admin/sales", labelKey: "dailySales", icon: "📊" },
  { href: "/admin/menu", labelKey: "menuManage", icon: "📝" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 bg-primary text-white min-h-screen p-4 no-print">
      <div className="text-center mb-6 pb-4 border-b border-white/20">
        <h2 className="font-bold text-lg">{t("admin")}</h2>
      </div>
      <nav className="flex flex-col gap-2">
        {links.map((l) => (
          <Link key={l.href} href={l.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${pathname === l.href ? "bg-white/20 shadow-md" : "hover:bg-white/10"}`}>
            <span>{l.icon}</span><span>{t(l.labelKey)}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

---

## PHASE 14: Admin Dashboard — CRITICAL

**`src/app/admin/dashboard/page.js`** — Uses `onSnapshot` WITH `where("paid", "==", false)`:
- Only fetches **unpaid** orders (5-20 docs), NOT entire collection
- Auto-refresh page every 1 hour via `setTimeout(() => window.location.reload(), 3600000)`
- Bell sound: Web Audio API (880Hz sine + 1320Hz sine, 1.2sec decay)
- Sound toggle button 🔊/🔇
- Sort orders by `createdAt` in JS (no orderBy in query — avoids composite index)
- 4 stat cards: Pending Orders, Revenue, Total Orders, Canceled
- Order cards with: truncated ID, table badge, status badge, source badge, timestamp, items list, total, discount
- 3 action buttons: "Bill Now" (sessionStorage + navigate), "Mark Paid" (updateDoc), "Cancel" (confirm + updateDoc)
- Empty state with checkmark

**`onSnapshot` query:**
```js
const q = query(collection(db, "orders"), where("paid", "==", false));
onSnapshot(q, (snapshot) => {
  const list = [];
  snapshot.forEach((d) => list.push({ id: d.id, ...d.data() }));
  list.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
  // ... check for new orders → bell sound ...
  setOrders(list);
});
```

**No `orderBy("createdAt")` in query** — avoids needing composite index. Sort in JS.

**Bell sound implementation** (inside the onSnapshot callback when new order detected):
```js
const ctx = new (window.AudioContext || window.webkitAudioContext)();
const gain = ctx.createGain();
gain.connect(ctx.destination);
gain.gain.setValueAtTime(0.8, ctx.currentTime);
gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
const osc1 = ctx.createOscillator();
osc1.type = "sine";
osc1.frequency.setValueAtTime(880, ctx.currentTime);
osc1.connect(gain);
osc1.start(ctx.currentTime);
osc1.stop(ctx.currentTime + 1.2);
const osc2 = ctx.createOscillator();
osc2.type = "sine";
osc2.frequency.setValueAtTime(1320, ctx.currentTime + 0.05);
osc2.connect(gain);
osc2.start(ctx.currentTime + 0.05);
osc2.stop(ctx.currentTime + 0.8);
```

---

## PHASE 15: Admin Billing (POS)

**`src/app/admin/billing/page.js`**:
- "use client"
- **Left panel**: Search input + grid of menu items (read from `menuData` JS import — no Firestore reads)
- Each item card: name, price, F-₹ button (full), H-₹ button (half if available), + Add button
- **Right panel** (sticky lg:w-96):
  - Cart with qty −/+ controls per item
  - **Misc item adder**: name input + price input + "Add" button. Items added with id `_misc_N` and `isMisc: true`
  - Order type: Dine In / Pickup toggle buttons
  - Table number input (shown only when Dine In selected)
  - Discount % input (number)
  - Subtotal, discount amount, total display
  - Payment mode: Cash / UPI / Card buttons (highlight selected)
  - **Print Bill** button → renders bill inline, `window.print()` (no new tab)
  - **Save (Unpaid)** button (amber) → `paid: false`
  - **Save & Mark Paid** button (emerald) → `paid: true, paidAt: now`

- Loads existing order from `sessionStorage.getItem("billOrder")` on mount for editing
- After save: show ✅ "Bill Saved!" for 3s, then reset cart
- `afterprint` event listener → hides print preview
- Bill data always includes: `orderDate: new Date().toISOString().split("T")[0]`, `source: "counter"`

**Print Bill layout** — Monospace font, max-width 300px, centered:
```
[SHOP NAME]
Sweets & Restaurant
Phone: [PHONE]
[ADDRESS LINE 1]
[ADDRESS LINE 2]

Bill: #XXXX1234   12 Apr 2025 14:30   T5

Item           Qty   Rate   Amt
Paneer Butter   1    220   220
Dal Makhni      1    180   180
Tawa Roti       3     10    30
Butter Naan     2     40    80
-------------------------
Subtotal                510
Discount (10%)           -51
TOTAL                  ₹459
Payment: CASH

Thank you! Visit again.
```

---

## PHASE 16: Admin Sales — `getDocs` (NOT onSnapshot)

**`src/app/admin/sales/page.js`**:
- Fetch orders via `getDocs()` once on mount (not `onSnapshot`)
- `query(collection(db, "orders"), orderBy("createdAt", "desc"))`
- Filter orders displayed using `useMemo` based on date/month + paid filter
- View mode toggle: Daily (date input type="date") / Monthly (month input type="month")
- Filter buttons: All / Paid / Unpaid
- 4 stat cards: Revenue, Orders, Canceled, Avg/Order
- **Last 30 Days bar chart**: horizontal bars with gradient, hover tooltip with ₹amount
- **Top 10 Selling Items**: ranked list with medal-style badges (🥇 gold, 🥈 silver, 🥉 bronze)
- **Orders list**: last 20 orders, truncated ID, table badge, paid badge, amount

---

## PHASE 17: Admin Menu Management

**`src/app/admin/menu/page.js`**:
- "use client"
- `onSnapshot` on `menuOverrides` collection (small collection, ~50 docs — fine for real-time)
- Initializes prices from `menuData` in state
- Search bar + "Add Item" button
- **Add Item modal**: name, category (dropdown from ALL_CATEGORIES), unit (piece/kg/mrp/plate), price, half price (optional)
- Table per category with columns: Item Name, Unit, Price, Half, Avail, Save, Del
- Custom items: amber "custom" badge, editable inline
- Availability toggle: ✓ green / ✕ red buttons (inline)
- Delete: 🗑 button → confirm → marks `deleted: true` for static items, `deleteDoc()` for custom items
- Save: per-row button → calls `setDoc(doc(db, "menuOverrides", itemId), priceData)`
- Custom items saved with: `{ isCustom: true, name, categoryId, category, unit, price, halfPrice, available }`
- Overrides for static items saved with: `{ price, halfPrice, available }` only (partial update)

---

## PHASE 18: Firestore Rules + Indexes

**Firestore Rules** (Firebase Console → Firestore → Rules):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**No composite index needed** — Dashboard uses `where("paid", "==", false)` without `orderBy`. Sorts in JS.

---

## PHASE 19: Build & Deploy

```
npm run build
```

Fix any errors. Then deploy to Vercel:
```
npx vercel --prod
```

Add `public/logo.png` (brand logo) to the deployment. Add `public/hero-new.webp` and `public/hero-bg.webp` as Unsplash restaurant/food images.

---

## ⚠️ CRITICAL: Firestore Read Optimization — NEVER CHANGE

| Page | Method | Filter | Reads/day | 
|---|---|---|---|
| Dashboard | `onSnapshot` | `where("paid", "==", false)` | ~110 |
| Sales | `getDocs()` (once) | None (all orders) | ~500 |
| MenuGrid | `getDocs()` + localStorage | None (menuOverrides) | ~50 for 50 customers |
| Menu Mgmt | `onSnapshot` | None (small collection) | ~200 |
| Billing | No Firestore reads at all | Uses JS menu data | 0 |
| **Total** | | | **~1,860** |
| **Free limit** | | | **50,000/day** |

**Rules**:
1. Dashboard `onSnapshot` must ALWAYS have `where("paid", "==", false)` — never query all orders
2. Sales page must use `getDocs()` — `onSnapshot` is wasteful here
3. MenuGrid must use `getDocs()` + localStorage cache — never `onSnapshot`
4. Billing reads menu from the JS module, NOT Firestore
5. Dashboard auto-refresh every 1 hour to clear memory
6. All `orderBy` sorting in JS — avoid composite indexes

---

## Key Design Decisions (DO NOT CHANGE)
1. ❌ No customer authentication — admin password gate only
2. ❌ No Hindi support — English-only
3. ❌ No product images on menu cards — text only
4. ❌ No category filter pills — all categories expanded
5. ❌ No pickup in customer cart — dine-in only
6. ❌ No status buttons on dashboard — only "Bill Now" / "Mark Paid" / "Cancel"
7. ❌ No server toggle — single Firebase project
8. ✅ `<img>` for logos (not Next.js Image — avoids warnings)
9. ✅ Print bill inline same page (not new tab)
10. ✅ Web Audio API for bell sound (no audio files)
11. ✅ Admin dot bottom-right footer (12px gray semi-transparent)

---

## To continue in a new session, tell opencode:
"Read REPLICATION_GUIDE.md and SESSION_SUMMARY.md and continue building."
