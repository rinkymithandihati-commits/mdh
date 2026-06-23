# Complete POS + QR Ordering System — Supabase Edition

Use this prompt with opencode to build the entire system from scratch on **Supabase** (unlimited reads, no daily quota).

Replace placeholders: `[mitthan di hatti]`, `[9812270023]`, `[NH 709AD, Kurar, Baha Ud Dinpur, near Sanauli Khurd, Panipat, Haryana 132104]`, `[https://tqypzmlzrevjtrzejvyg.supabase.co]`, `[eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxeXB6bWx6cmV2anRyemVqdnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NTgyODYsImV4cCI6MjA5NzUzNDI4Nn0.6SVF5TNeCc7BBJGnr7MLTu8AobNL_F3277_Pe1AjKFU]`.

---

## PHASE 1: Project Setup

```
npx create-next-app@latest [businessname]-pos --use-npm
# ✓ src/ directory
# ✓ Tailwind CSS (v4)
cd [businessname]-pos
npm install @supabase/supabase-js uuid
```

Then manually:
- Create Supabase project at supabase.com (free tier: 500MB DB, unlimited API)
- Copy Project URL + anon key from Settings → API
- Run the schema SQL below in Supabase SQL Editor

**Create `jsconfig.json`** (in root):
```json
{ "compilerOptions": { "paths": { "@/*": ["./src/*"] } } }
```

**`package.json` must include:**
```json
"dependencies": {
  "@supabase/supabase-js": "^2.49.4",
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

**Run this SQL in Supabase SQL Editor** to create tables + enable realtime:

```sql
-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  items JSONB NOT NULL DEFAULT '[]',
  total NUMERIC NOT NULL DEFAULT 0,
  subtotal NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  payment_mode TEXT DEFAULT 'cash',
  order_type TEXT DEFAULT 'dinein',
  table_no TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMPTZ,
  source TEXT DEFAULT 'online',
  order_date TEXT DEFAULT to_char(now(), 'YYYY-MM-DD'),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Menu overrides (item price/availability changes)
CREATE TABLE menu_overrides (
  id TEXT PRIMARY KEY,
  name TEXT DEFAULT '',
  category_id TEXT DEFAULT '',
  category TEXT DEFAULT '',
  unit TEXT DEFAULT 'piece',
  price NUMERIC,
  half_price NUMERIC,
  available BOOLEAN DEFAULT true,
  deleted BOOLEAN DEFAULT false,
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security — open access for app
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all_orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_menu" ON menu_overrides FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_overrides;
```

---

## PHASE 2: Supabase Client

**`src/lib/supabase.js`**:
```js
"use client";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://YOUR_PROJECT.supabase.co";
const supabaseAnonKey = "YOUR_ANON_KEY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**`src/lib/i18n.js`** — English-only (same as Firebase version):
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

Same as Firebase version — `src/lib/menu-data.js` with all 22 categories, 160+ items. Categories ordered: Thali → Main Course → Roti/Breads → Parantha → Rice → Rayta/Salad → Dips → Indian Snacks → Chunky Chaat → Chaap/Tikka → Burger/Sandwich → Pizza → Pasta → Momos → Chinese → South Indian → Shake → Lassi → Soda → Juice → Desserts → Drinks.

Each item: `{ id, name, price, halfPrice, unit }`. Thali items need `desc` field.



THIS IS MY SHOP MENU IMPLEMENT THIS IN THE WEBISITE 
Pasta
Red Sauce Pasta: 179 (1 Plate)

White Sauce Pasta: 179 (1 Plate)

Tandoori Sauce Pasta: 199 (1 Plate)

Mix Sauce Pasta: 199 (1 Plate)

Lassi
Sweet Lassi: 80 (1 Glass)

Masala Lassi: 80 (1 Glass)

Desserts
Garm Gulabjamun: 25 (1 Pc.)

Spunch Rasgulla: 25 (1 Pc.)

Rajbhog: 35 (1 Pc.)

Ras Malai: 50 (1 Pc.)

Rabdi Cup: 70 (1 Pc.)

Garm Jalebi (Desi Ghee): 540 K.G.

Ice Cream: ON MRP

Pizza
Cheese Pizza: 149 (1 Pc.)

Onion Pizza: 149 (1 Pc.)

Capsicum Pizza: 149 (1 Pc.)

Tomato Pizza: 149 (1 Pc.)

Sweet Corn Pizza: 149 (1 Pc.)

Onion Capsicum Pizza: 159 (1 Pc.)

Mushroom Pizza: 189 (1 Pc.)

Paneer Pizza: 219 (1 Pc.)

Mix Deluxe Pizza: 219 (1 Pc.)

Momos
Veg Momos Fry: 90 (6 Pc.)

Veg Momos Steam: 90 (6 Pc.)

Paneer Momos Fry: 110 (6 Pc.)

Paneer Momos Steam: 110 (6 Pc.)

Chaap & Tikka (Full / Half)
Malai Chaap: 220 / 130

Tandoori Chaap: 210 / 125

Achari Chaap: 210 / 130

Paneer Tikka: 260 / 160

Malai Paneer Tikka: 270 / 180

Achari Paneer Tikka: 270 / 180

Mushroom Tikka: 250 / 160

Malai Mushroom Tikka: 270 / 180

Shake (Full / Half)
Banana Shake: 100 / 80

Mango Shake: 100 / 80

Chiku Shake: 150 / 120

Kitkat Shake: 80

Butter Scotch Oreo Shake: 120

Butterscotch Shake: 100

Classic Cold Coffee: 100

Chocolate Shake: 80

Classic Vanilla Shake: 110

Strawberry Shake: 120

Soda
Watermelon Mojito: 120

Apple Soda: 100

Masala Coke: 80

Shikanji Masala: 60

Masala Soda: 60

Virgin Mojito: 100

Pineapple Mojito: 120

Juice (Full / Half)
Anar Juice: 140 / 90

Mosambi Juice: 90 / 70

Mix Juice: 90 / 70

Orange Juice: 100 / 80

Pineapple Juice: 100 / 80

📄 Screenshot 2026-06-19 192248.png (Page 2)
Indian Snacks
Samosa: 18 (1 Pc.)

Daal Kachauri: 25 (1 Pc.)

Aloo Pyaaz Kachauri: 30 (1 Pc.)

Chhole Samosa: 50 (1 Pc.)

Chhole Kachauri: 50 (1 Pc.)

Bread Pakoda: 25 (1 Pc.)

Paneer Bread Pakoda: 35 (1 Pc.)

Chhole Bhature: 80 (1 Plate)

Mix Pakoda: 360 / KG. (Half Fry)

Paneer Pakoda: 460 / KG. (Half Fry)

Dhokla: 240 / KG.

Pav Bhaji: 120 (1 Plate)

Extra Pav: 25 (1 Pc.)

Chunky Chaat
Golgappe (5 Pcs): 30 (1 Plate)

Bharwa Golgappa (5 Pcs): 70 (1 Plate)

Dahi Golgappe (5 Pcs): 80 (1 Plate)

Papdi Chaat: 80 / 50 (Full / Half)

Tikki Chaat: 80 / 50 (Full / Half)

Spe. Dahi Bhalle: 80 / 50 (Full / Half)

Chhole Tikki: 80 / 50 (Full / Half)

Bread Tikki: 50 (1 Pc.)

Raj Kachauri: 120 (1 Pc.)

Burger & Sandwich
Veg Burger: 60 (1 Pc.)

Cheese Burger: 80 (1 Pc.)

Sandwich: 30 (1 Pc.)

Grill Sandwich: 120 (Full Pc.)

Cheese Grill Sandwich: 140 (Full Pc.)

Chinese (Full / Half)
Veg Chowmein: 120 / 70

Singapuri Chowmein: 170 / 100

Hakka Chowmein: 180 / 110

Paneer Chowmein: 170 / 100

Chili Garlic Chowmein: 140 / 80

Spring Roll: 110 (1 Plate)

Cheese Chili (Dry/Gravy): 200 / 140

Manchurian (Dry/Gravy): 170 / 100

French Fries: 100 (1 Plate)

Honey Chili Potato: 140 (1 Plate)

Chili Potato: 130 (1 Plate)

Fried Rice: 130 (1 Plate)

South Indian
Plain Dosa: 120 (1 Plate)

Rava Plain Dosa: 150 (1 Plate)

Butter Plain Dosa: 140 (1 Plate)

Masala Dosa: 140 (1 Plate)

Butter Masala Dosa: 160 (1 Plate)

Rava Masala Dosa: 170 (1 Plate)

Paneer Dosa: 180 (1 Plate)

Butter Paneer Dosa: 200 (1 Plate)

Rava Paneer Dosa: 210 (1 Plate)

Onion Dosa: 140 (1 Plate)

Onion Masala Dosa: 150 (1 Plate)

Butter Onion Dosa: 170 (1 Plate)

Rava Onion Dosa: 180 (1 Plate)

Tomato Uttapam: 150 (1 Plate)

Onion Uttapam: 170 (1 Plate)

Paneer Uttapam: 200 (1 Plate)

Mix Veg Uttapam: 170 (1 Plate)

📄 Screenshot 2026-06-19 192243.png (Page 3)
Main Course (Full / Half jahan applicable hai)
Shahi Paneer: 250 / 160

Kadhai Paneer: 280 / 170

Paneer Butter Masala: 270

Paneer Lababdar: 270

Paneer Do Pyaaza: 270

Paneer Tikka Butter Masala: 300

Paneer Bhurji: 300

Palak Paneer: 270

Matar Paneer: 270

Paneer Methi Malai: 270

Gravy Chaap: 250

Mushroom Matar: 270

Mushroom Masala: 250

Dal Makhani: 190 / 120

Peeli Dal: 170 / 110

Peeli Dal Tadka: 180 / 120

Chana Masala: 170

Rajma: 170

Jeera Aloo: 170

Mix Veg: 200 / 120

Aloo Gobhi Masala: 170

Malai Kofta: 240

Veg Kofta: 220

Parantha
Aloo Parantha: 80

Paneer Parantha: 95

Pyaaz Parantha: 85

Mix Parantha: 95

Gobhi Parantha: 85

Mooli Parantha: 85

Aloo Pyaaz Parantha: 85

Dips
Sirka Pyaaz: 20

Pudina Chatni: 20

Rice
Jeera Rice: 170

Plain Rice: 140

Veg Pulao: 180

Veg Biryani Dahi Ke Saath: 280

Hyderabadi Biryani Dahi Ke Saath: 300

Rajma Chawal Combo: 100

Chhole Chawal Combo: 100

Rayta, Salad
Plain Dahi: 80

Boondi Rayta: 100

Mix Rayta: 110

Pineapple Rayta: 150

Green Salad: 100

Plain Salad: 25

Roti / Breads
Plain Roti: 15

Butter Roti: 22

Plain Naan: 45

Butter Naan: 55

Stuff Naan: 60

Missi Roti: 50

Lachha Paratha: 50

Onion Naan: 60

Garlic Naan: 70

Dhaniya Pyaaz Naan: 60

Dhaniya Pyaaz Roti: 35

Drinks
Chai: 20

Kulhad Chai: 30

Coffee: 40

Cold Drinks: ON MRP

Mineral Water: ON MRP

📄 Screenshot 2026-06-19 192237.png (Page 4)
Thali
Thali 1: Dal Makhani, Mix Veg, Rice, 2 Roti — 159

Thali 2: Dal Makhani, Paneer, Rice, 2 Roti, Salad — 209

Thali 3: Dal Makhani, Mix Veg, Kadhai Paneer, Rice, Rayta, Salad, Achar, Dessert, Lachha Paratha, Butter Naan — 269

Important Note:-

Your Order May Take 30 Mins.

We Accept Last Order By 9:00 Pm

Home Delivery last Order By 7:00 Pm

Some Items May Not Be Available At All Times

Price May Change Without Any Prior Notice

---

## PHASE 4: Cart Context

**`src/context/CartContext.js`** — Exactly same as Firebase version:
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

**`src/app/layout.js`** — Same as Firebase version:
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

**`src/app/globals.css`** — Same as Firebase version:
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

body { font-family: 'Georgia', 'Times New Roman', serif; background-color: var(--color-cream); color: #2D1B1B; }
::selection { background: #C9A84C; color: #6B1D1D; }
.category-scroll::-webkit-scrollbar { display: none; }
.category-scroll { -ms-overflow-style: none; scrollbar-width: none; }
.menu-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
.menu-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(107, 29, 29, 0.1); }
.menu-card:active { transform: scale(0.97); }
.hero-overlay { background: linear-gradient(135deg, rgba(107, 29, 29, 0.85) 0%, rgba(43, 12, 12, 0.7) 100%); }
.gold-text { background: linear-gradient(135deg, #C9A84C, #E8CF6E, #C9A84C); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.animate-fade-up { animation: fadeInUp 0.6s ease forwards; }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
.shimmer { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); background-size: 200% 100%; animation: shimmer 2s infinite; }
@keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
.animate-pulse-dot { animation: pulse-dot 1.5s ease-in-out infinite; }
input[type="number"]::-webkit-inner-spin-button, input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
input[type="number"] { -moz-appearance: textfield; }
@media print { .no-print { display: none !important; } }
```

---

## PHASE 7: Header Component

Same as Firebase version — `src/components/Header.js`:
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

## PHASE 8: MenuGrid (Customer-facing) — Supabase + localStorage cache

**`src/components/MenuGrid.js`** — Uses `supabase.from("menu_overrides").select()`:
```js
"use client";
import { useState, useEffect } from "react";
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
    const cached = localStorage.getItem("menuOverrides");
    if (cached) { try { setOverrides(JSON.parse(cached)); } catch (e) {} }
    supabase.from("menu_overrides").select("*").then(({ data }) => {
      if (data) {
        const ov = {};
        data.forEach((row) => { ov[row.id] = row; });
        setOverrides(ov);
        localStorage.setItem("menuOverrides", JSON.stringify(ov));
      }
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
                const o = overrides[item.id];
                const displayPrice = o?.price || item.price;
                const displayHalf = o?.half_price || item.halfPrice;
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
                            className={`px-3.5 py-2 rounded-xl text-[11px] font-bold transition border ${addedItems[animKey] ? "bg-emerald-500 text-white border-emerald-500 scale-95" : "bg-primary/5 text-primary border-primary/10 hover:bg-primary/10"}`}>Full</button>
                          <button onClick={() => handleAdd(item, 1, true)}
                            className={`px-3.5 py-2 rounded-xl text-[11px] font-bold transition border ${addedItems[halfAnimKey] ? "bg-emerald-500 text-white border-emerald-500 scale-95" : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"}`}>Half</button>
                        </>
                      ) : item.unit === "kg" ? (
                        <button onClick={() => handleAdd(item, 0.5)}
                          className={`px-4 py-2 rounded-xl text-[11px] font-bold transition border ${addedItems[animKey] ? "bg-emerald-500 text-white border-emerald-500 scale-95" : "bg-primary/5 text-primary border-primary/10 hover:bg-primary/10"}`}>0.5</button>
                      ) : (
                        <button onClick={() => handleAdd(item)}
                          className={`px-4 py-2 rounded-xl text-[11px] font-bold transition border ${addedItems[animKey] ? "bg-emerald-500 text-white border-emerald-500 scale-95" : "bg-primary/5 text-primary border-primary/10 hover:bg-primary/10"}`}>+ {t("add")}</button>
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

**`src/app/page.js`** — Same as Firebase version (uses same Header + MenuGrid):
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
      <section id="menu" className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        <div className="text-center mb-6 md:mb-8">
          <span className="text-gold text-sm font-medium tracking-widest uppercase">Our Collection</span>
          <h2 className="text-3xl md:text-4xl font-bold text-primary mt-1">Premium Menu</h2>
          <div className="w-16 h-0.5 bg-gold mx-auto mt-3 rounded-full" />
        </div>
        <MenuGrid />
      </section>
      <footer className="bg-primary text-white/60 py-8 mt-8 relative">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <img src="/logo.png" alt="Logo" width={32} height={32} className="rounded-full" style={{ width: 32, height: 32 }} />
            <span className="text-white font-bold text-lg">[Business Name]</span>
          </div>
          <p className="text-sm">Since 1890 | [City], [State]</p>
          <p className="text-xs mt-2 opacity-50">Premium Indian Sweets & Restaurant</p>
        </div>
        <div onClick={() => router.push("/admin/login")}
          className="absolute bottom-2 right-2 w-3 h-3 bg-gray-500/30 hover:bg-gray-500/50 rounded-full cursor-pointer transition" />
      </footer>
    </div>
  );
}
```

Assets: `public/logo.png` + `public/hero-new.webp`

---

## PHASE 10: Cart + Checkout — Supabase insert

**`src/app/cart/page.js`**:
```js
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
  const [tableNo, setTableNo] = useState("");
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);

  const total = getCartTotal();

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setPlacing(true);
    try {
      const { data, error } = await supabase.from("orders").insert({
        items: cart.map((i) => ({
          id: i.id, name: i.name, qty: i.qty, price: i.unitPrice,
          unit: i.unit, isHalf: i.isHalf,
          total: i.unitPrice * i.qty,
        })),
        total, order_type: "dinein",
        table_no: tableNo, notes,
        status: "pending", paid: false,
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
          <button onClick={() => router.push("/")} className="px-8 py-3 bg-primary text-white rounded-full font-medium shadow-md hover:bg-primary-light transition">{t("backToMenu")}</button>
        </main>
      </div>
    );
  }

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
                <p className="text-xs text-gray-400">₹{item.unitPrice} × {item.unit === "kg" ? `${item.qty} ${t("kg")}` : item.qty}{item.isHalf ? ` (${t("half")})` : ""}</p>
                <p className="text-primary font-bold text-sm mt-0.5">₹{item.unitPrice * item.qty}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => updateQty(item.id, item.qty - 1, item.isHalf)} className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center font-bold text-gray-500 transition">−</button>
                <span className="font-semibold text-sm w-6 text-center">{item.unit === "kg" ? item.qty : item.qty}</span>
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
          <div className="bg-primary/5 rounded-xl p-3 flex items-center gap-2">
            <span className="text-lg">🍽</span>
            <span className="text-sm font-semibold text-primary">{t("dineIn")}</span>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("tableNo")}</label>
            <input type="number" value={tableNo} onChange={(e) => setTableNo(e.target.value)} placeholder={t("enterTableNo")} className="w-full mt-1.5 p-3 rounded-xl border border-gray-200 focus:border-gold focus:outline-none text-sm bg-gray-50" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("notes")}</label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special requests..." className="w-full mt-1.5 p-3 rounded-xl border border-gray-200 focus:border-gold focus:outline-none text-sm bg-gray-50" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Subtotal</span>
            <span className="font-semibold">₹{total}</span>
          </div>
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
            <span className="text-lg font-bold text-primary">{t("total")}</span>
            <span className="text-2xl font-bold text-primary">₹{total}</span>
          </div>
        </div>
        <button onClick={handlePlaceOrder} disabled={placing || !tableNo}
          className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-light transition flex items-center justify-center gap-2">
          {placing ? <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Placing...</> : <>🗳 {t("placeOrder")}</>}
        </button>
      </main>
    </div>
  );
}
```

---

## PHASE 11: Order Success Page

**`src/app/order-success/page.js`** — Same as Firebase version (Suspense-wrapped):
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

## PHASE 12: Table Ordering Page

**`src/app/table/[id]/page.js`** — Same as Firebase version:
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

---

## PHASE 13: Admin Login — Same as Firebase

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

## PHASE 14: Admin Layout + Sidebar — Same as Firebase

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

**`src/app/admin/page.js`** — Redirect to dashboard (same):
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

**`src/components/AdminSidebar.js`** — Same:
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

## PHASE 15: Admin Dashboard — Supabase Realtime channel

**`src/app/admin/dashboard/page.js`** — Uses `supabase.channel()` instead of `onSnapshot`:

```js
"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const refresh = setTimeout(() => window.location.reload(), 3600000);
    return () => clearTimeout(refresh);
  }, []);

  useEffect(() => {
    // Initial fetch
    supabase.from("orders").select("*").eq("paid", false).order("created_at", { ascending: false })
      .then(({ data }) => setOrders(data || []));

    // Real-time listener — only INSERT events on orders table
    const channel = supabase.channel("dashboard-orders")
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "orders", filter: "paid=eq.false" },
        (payload) => {
          setOrders((prev) => {
            const exists = prev.some((o) => o.id === payload.new.id);
            if (exists) return prev;
            if (soundEnabled) {
              try {
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
              } catch (e) {}
            }
            return [payload.new, ...prev];
          });
        }
      )
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: "paid=eq.false" },
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

    return () => { supabase.removeChannel(channel); };
  }, [soundEnabled]);

  const markPaid = useCallback(async (orderId) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    await supabase.from("orders").update({ paid: true, paid_at: new Date().toISOString() }).eq("id", orderId);
  }, []);

  const billOrder = useCallback((order) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("billOrder", JSON.stringify(order));
    }
    router.push("/admin/billing");
  }, [router]);

  const cancelOrder = useCallback(async (orderId) => {
    if (!confirm("Cancel this order?")) return;
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    await supabase.from("orders").update({ status: "canceled" }).eq("id", orderId);
  }, []);

  const pendingOrders = orders.filter((o) => o.status !== "canceled");
  const allOrders = orders;

  const statCards = [
    { label: "Pending Orders", value: pendingOrders.length, color: "from-amber-400 to-amber-600", icon: "⏳" },
    { label: t("revenue"), value: `₹${allOrders.filter(o => o.paid).reduce((s, o) => s + (o.total || 0), 0)}`, color: "from-emerald-400 to-emerald-600", icon: "💰" },
    { label: "Total Orders", value: allOrders.length, color: "from-blue-400 to-blue-600", icon: "📋" },
    { label: "Canceled", value: allOrders.filter(o => o.status === "canceled").length, color: "from-red-400 to-red-600", icon: "❌" },
  ];

  function formatDate(d) {
    if (!d) return "";
    const date = new Date(d);
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

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
        <button onClick={() => setSoundEnabled(!soundEnabled)} title="Sound"
          className={`p-2 rounded-lg text-sm transition ${soundEnabled ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-400"}`}>
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
        {pendingOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono bg-gray-50 px-2 py-0.5 rounded-md text-gray-500">#{order.id?.slice(0, 8)}</span>
                  {order.table_no && <span className="text-xs bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded-full font-medium">Table {order.table_no}</span>}
                  <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full font-medium">{order.status}</span>
                  {order.order_type === "pickup" && <span className="text-xs bg-purple-50 text-purple-600 border border-purple-200 px-2.5 py-0.5 rounded-full">Pickup</span>}
                  {order.source === "counter" && <span className="text-xs bg-gold/10 text-gold border border-gold/20 px-2.5 py-0.5 rounded-full font-medium">Counter</span>}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">{formatDate(order.created_at)}</p>
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
                    {item.isHalf ? <span className="text-gold text-xs ml-1">(Half)</span> : ""}
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
            <div className="flex flex-wrap items-center gap-2 mt-2 pt-3 border-t border-gray-100 no-print">
              <button onClick={() => billOrder(order)} className="px-5 py-2 text-xs font-bold bg-gold/10 text-gold border border-gold/20 rounded-xl hover:bg-gold/20 transition shadow-sm">🧾 Bill Now</button>
              <button onClick={() => markPaid(order.id)} className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition shadow-sm">₹ Mark Paid</button>
              <button onClick={() => cancelOrder(order.id)} className="px-4 py-2 text-xs font-medium bg-red-500/10 text-red-600 border border-red-200 rounded-xl hover:bg-red-500/20 transition">Cancel</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## PHASE 16: Admin Billing — FULL SUPABASE CODE

**`src/app/admin/billing/page.js`**:
```js
"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { t } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import menuData from "@/lib/menu-data";

export default function AdminBillingPage() {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [discount, setDiscount] = useState(0);
  const [orderType, setOrderType] = useState("dinein");
  const [tableNo, setTableNo] = useState("");
  const [placing, setPlacing] = useState(false);
  const [billSaved, setBillSaved] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [miscName, setMiscName] = useState("");
  const [miscPrice, setMiscPrice] = useState("");
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  let miscIdCounter = useRef(0);

  useEffect(() => {
    const stored = sessionStorage.getItem("billOrder");
    if (stored) {
      try {
        const order = JSON.parse(stored);
        if (order && order.items) {
          const mapped = order.items.map((i) => {
            const menuItem = menuData.flatMap(c => c.items).find(m => m.id === i.id) || {};
            return {
              id: i.id, name: i.name, qty: i.qty, unitPrice: i.price,
              unit: i.unit || menuItem.unit || "plate",
              isHalf: i.isHalf || false,
              halfPrice: menuItem.halfPrice || null,
              price: menuItem.price || i.price,
            };
          });
          setCart(mapped);
          if (order.tableNo) setTableNo(order.tableNo);
          if (order.orderType) setOrderType(order.orderType);
          setEditingOrderId(order.id);
          if (order.discount) setDiscount(order.discount);
        }
      } catch (e) { console.error(e); }
      sessionStorage.removeItem("billOrder");
    }
  }, []);

  useEffect(() => {
    if (showPrintPreview) {
      setTimeout(() => { window.print(); }, 100);
    }
  }, [showPrintPreview]);

  useEffect(() => {
    const handleAfterPrint = () => setShowPrintPreview(false);
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  const allItems = useMemo(() => menuData.flatMap((cat) => cat.items), []);
  const filteredItems = useMemo(() => allItems.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())), [allItems, search]);

  const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const discountAmt = (subtotal * discount) / 100;
  const total = subtotal - discountAmt;

  const addItemToBill = (item, isHalf = false) => {
    const existing = cart.find((c) => c.id === item.id && c.isHalf === isHalf);
    if (existing) {
      setCart((prev) => prev.map((c) => c.id === item.id && c.isHalf === isHalf ? { ...c, qty: c.qty + 1 } : c));
    } else {
      const unitPrice = isHalf && item.halfPrice ? item.halfPrice : item.price;
      setCart((prev) => [...prev, { ...item, qty: item.unit === "kg" ? 0.5 : 1, isHalf, unitPrice }]);
    }
  };

  const updateQty = (id, isHalf, qty) => {
    if (qty <= 0) { setCart((prev) => prev.filter((c) => !(c.id === id && c.isHalf === isHalf))); return; }
    setCart((prev) => prev.map((c) => c.id === id && c.isHalf === isHalf ? { ...c, qty } : c));
  };

  const addMiscItem = () => {
    const name = miscName.trim();
    const price = parseFloat(miscPrice);
    if (!name || !price || price <= 0) return;
    miscIdCounter.current += 1;
    setCart((prev) => [...prev, { id: `_misc_${miscIdCounter.current}`, name, qty: 1, unitPrice: price, unit: "piece", isHalf: false, halfPrice: null, price, isMisc: true }]);
    setMiscName("");
    setMiscPrice("");
  };

  const saveBill = async (markPaid) => {
    if (cart.length === 0) return;
    setPlacing(true);
    try {
      const billData = {
        items: cart.map((i) => ({ id: i.id, name: i.name, qty: i.qty, price: i.unitPrice, unit: i.unit, isHalf: i.isHalf, total: i.unitPrice * i.qty })),
        total, subtotal, discount, payment_mode: paymentMode,
        order_type: orderType, table_no: orderType === "dinein" ? tableNo : null,
        status: "confirmed", paid: markPaid, paid_at: markPaid ? new Date().toISOString() : null,
        order_date: new Date().toISOString().split("T")[0],
        source: "counter",
      };
      if (editingOrderId) {
        await supabase.from("orders").update(billData).eq("id", editingOrderId);
      } else {
        await supabase.from("orders").insert(billData);
      }
      setEditingOrderId(null);
      setBillSaved(true);
      setTimeout(() => { setCart([]); setDiscount(0); setTableNo(""); setBillSaved(false); }, 3000);
    } catch (e) { alert("Error: " + e.message); }
    setPlacing(false);
  };

  const printBill = () => {
    if (cart.length === 0) return;
    setShowPrintPreview(true);
  };

  if (showPrintPreview) {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    const billNo = editingOrderId ? editingOrderId.slice(0, 8).toUpperCase() : `#${Date.now().toString(36).toUpperCase()}`;
    return (
      <div className="print-bill" style={{ fontFamily: "'Courier New', monospace", fontSize: "12px", padding: "30px 20px", maxWidth: "300px", margin: "0 auto", color: "#222" }}>
        <div style={{ textAlign: "center", marginBottom: "12px", borderBottom: "1px dashed #999", paddingBottom: "12px" }}>
          <h1 style={{ fontSize: "18px", margin: "0 0 4px 0", letterSpacing: "1px" }}>[Business Name]</h1>
          <p style={{ margin: "2px 0", fontSize: "11px", color: "#555" }}>Sweets & Restaurant</p>
          <p style={{ margin: "2px 0", fontSize: "11px", color: "#555" }}>Phone: [Phone]</p>
          <p style={{ margin: "2px 0", fontSize: "9px", color: "#777" }}>[Address Line 1]</p>
          <p style={{ margin: "2px 0", fontSize: "9px", color: "#777" }}>[Address Line 2]</p>
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
          <input type="text" placeholder={t("search")} value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-gray-100 bg-white focus:border-gold focus:outline-none text-sm shadow-sm" autoFocus />
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
                    <button onClick={() => addItemToBill(item, false)}
                      className="flex-1 text-xs py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 font-medium hover:bg-amber-100 transition">F-₹{item.price}</button>
                    <button onClick={() => addItemToBill(item, true)}
                      className="flex-1 text-xs py-1.5 rounded-lg bg-primary/5 text-primary border border-primary/10 font-medium hover:bg-primary/10 transition">H-₹{item.halfPrice}</button>
                  </>
                ) : (
                  <button onClick={() => addItemToBill(item)}
                    className="w-full text-xs py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-light transition shadow-sm">+ Add</button>
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
                  <input type="number" step="0.05" min="0.05" value={item.qty}
                    onChange={(e) => updateQty(item.id, item.isHalf, parseFloat(e.target.value) || 0)}
                    className="w-16 text-center text-sm p-1.5 border border-gray-200 rounded-lg bg-white" />
                ) : (
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(item.id, item.isHalf, item.qty - 1)} className="w-7 h-7 rounded-lg bg-gray-200 hover:bg-gray-300 text-xs font-bold text-gray-600 transition">−</button>
                    <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.isHalf, item.qty + 1)} className="w-7 h-7 rounded-lg bg-gray-200 hover:bg-gray-300 text-xs font-bold text-gray-600 transition">+</button>
                  </div>
                )}
              </div>
              <p className="text-sm font-bold text-primary w-16 text-right">₹{item.unit === "kg" ? (item.unitPrice * item.qty).toFixed(0) : item.unitPrice * item.qty}</p>
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
          <input type="text" value={miscName} onChange={(e) => setMiscName(e.target.value)} placeholder="Misc item name"
            className="flex-1 p-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:border-gold focus:outline-none"
            onKeyDown={(e) => e.key === "Enter" && addMiscItem()} />
          <input type="number" value={miscPrice} onChange={(e) => setMiscPrice(e.target.value)} placeholder="₹"
            className="w-20 p-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:border-gold focus:outline-none text-center"
            onKeyDown={(e) => e.key === "Enter" && addMiscItem()} />
          <button onClick={addMiscItem} disabled={!miscName.trim() || !miscPrice}
            className="px-3 py-2 bg-gray-600 text-white rounded-lg text-xs font-bold hover:bg-gray-700 disabled:opacity-40 transition">+ Add</button>
        </div>

        <div className="space-y-3 mb-4 p-3 bg-gray-50 rounded-xl">
          <div className="flex gap-2">
            <button onClick={() => setOrderType("dinein")} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${orderType === "dinein" ? "bg-primary text-white shadow-sm" : "bg-white text-gray-500 border border-gray-200 hover:border-primary"}`}>🍽 {t("dineIn")}</button>
            <button onClick={() => setOrderType("pickup")} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${orderType === "pickup" ? "bg-primary text-white shadow-sm" : "bg-white text-gray-500 border border-gray-200 hover:border-primary"}`}>🛍 {t("pickup")}</button>
          </div>
          {orderType === "dinein" && (
            <input type="number" value={tableNo} onChange={(e) => setTableNo(e.target.value)} placeholder={t("tableNo")} className="w-full p-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:border-gold focus:outline-none" />
          )}
          <div>
            <label className="text-xs text-gray-500 font-medium">{t("discount")} (%)</label>
            <input type="number" value={discount} onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))} className="w-full p-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:border-gold focus:outline-none mt-1" />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3 space-y-1.5 mb-4">
          <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="font-medium">₹{subtotal.toFixed(0)}</span></div>
          {discount > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">Discount ({discount}%)</span><span className="text-red-500 font-medium">-₹{discountAmt.toFixed(0)}</span></div>}
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-100"><span className="text-primary">{t("total")}</span><span className="text-primary">₹{total.toFixed(0)}</span></div>
        </div>

        <div className="flex gap-2 mb-4">
          {["cash", "upi", "card"].map((m) => (
            <button key={m} onClick={() => setPaymentMode(m)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition ${paymentMode === m ? "bg-primary text-white shadow-sm" : "bg-gray-50 text-gray-500 border border-gray-200 hover:border-primary"}`}>
              {m === "cash" ? "💵 " + t("cash") : m === "upi" ? "📱 " + t("upi") : "💳 " + t("card")}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 no-print">
          <div className="flex gap-2">
            <button onClick={printBill} disabled={cart.length === 0} className="flex-1 py-3 border-2 border-primary text-primary rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-primary/5 transition">🖨 {t("printBill")}</button>
            <button onClick={() => saveBill(false)} disabled={placing || cart.length === 0} className="flex-1 py-3 bg-amber-500 text-white rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-amber-600 transition shadow-md flex items-center justify-center gap-1.5">
              {placing ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : null}{placing ? "Saving..." : "💾 Save (Unpaid)"}
            </button>
          </div>
          <button onClick={() => saveBill(true)} disabled={placing || cart.length === 0} className="w-full py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-emerald-700 transition shadow-md flex items-center justify-center gap-1.5">
            {placing ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : null}{placing ? "Saving..." : "✅ Save & Mark Paid"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## PHASE 17: Admin Sales — FULL SUPABASE CODE

**`src/app/admin/sales/page.js`**:
```js
"use client";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { t } from "@/lib/i18n";

export default function AdminSalesPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("daily");
  const [filter, setFilter] = useState("all");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const dailyData = useMemo(() => {
    const map = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      map[key] = 0;
    }
    orders.forEach((o) => {
      if (o.paid) {
        const d = new Date(o.created_at);
        const key = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
        if (map[key] !== undefined) map[key] += o.total || 0;
      }
    });
    return Object.entries(map).map(([date, total]) => ({ date, total }));
  }, [orders]);

  const monthlyData = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      if (o.paid) {
        const d = new Date(o.created_at);
        const key = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
        map[key] = (map[key] || 0) + (o.total || 0);
      }
    });
    return Object.entries(map).map(([month, total]) => ({ month, total }));
  }, [orders]);

  const chartData = dateRange === "daily" ? dailyData : monthlyData;
  const maxVal = Math.max(...chartData.map((d) => d.total), 1);

  const filteredOrders = useMemo(() => {
    let list = [...orders];
    if (filter === "paid") list = list.filter((o) => o.paid);
    else if (filter === "unpaid") list = list.filter((o) => !o.paid);
    return list.slice(0, 100);
  }, [orders, filter]);

  const totalRevenue = orders.filter((o) => o.paid).reduce((s, o) => s + (o.total || 0), 0);
  const totalOrders = orders.filter((o) => o.paid).length;
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const topItems = useMemo(() => {
    const count = {};
    orders.filter((o) => o.paid).forEach((o) => {
      (o.items || []).forEach((item) => {
        count[item.name] = (count[item.name] || 0) + item.qty;
      });
    });
    return Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [orders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t("totalRevenue")}</p>
          <p className="text-2xl font-bold text-primary">₹{totalRevenue.toFixed(0)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t("orders")}</p>
          <p className="text-2xl font-bold text-primary">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t("avgOrder")}</p>
          <p className="text-2xl font-bold text-primary">₹{avgOrder.toFixed(0)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 text-sm">
            {dateRange === "daily" ? t("dailySales") : t("monthlySales")}
          </h3>
          <div className="flex gap-1">
            <button onClick={() => setDateRange("daily")} className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${dateRange === "daily" ? "bg-primary text-white shadow-sm" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}>{t("daily")}</button>
            <button onClick={() => setDateRange("monthly")} className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${dateRange === "monthly" ? "bg-primary text-white shadow-sm" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}>{t("monthly")}</button>
          </div>
        </div>
        <div className="flex items-end gap-1.5 h-32" style={{ minWidth: chartData.length * 20 }}>
          {chartData.map((d, i) => (
            <div key={i} className="flex flex-col items-center flex-1 group relative">
              <div
                className="w-full bg-gradient-to-t from-gold to-amber-300 rounded-t-md transition-all duration-300 hover:from-amber-400 hover:to-amber-500"
                style={{ height: `${(d.total / maxVal) * 100}%`, minHeight: d.total > 0 ? "4px" : "2px" }}
              />
              <div className="text-[8px] text-gray-400 mt-1.5 rotate-45 origin-left whitespace-nowrap" style={{ fontSize: "7px" }}>
                {d.date}
              </div>
              {d.total > 0 && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10 shadow-lg">
                  ₹{d.total.toFixed(0)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 text-sm">{t("orders")}</h3>
          <div className="flex gap-1">
            {["all", "paid", "unpaid"].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${filter === f ? "bg-primary text-white shadow-sm" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {filteredOrders.length === 0 ? (
          <div className="text-center py-10"><p className="text-gray-400 text-sm">{t("noOrders")}</p></div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-sm transition">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${o.paid ? "bg-emerald-500" : "bg-amber-500"}`} />
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      <span className="text-gray-400 font-mono text-xs mr-2">#{o.id?.slice(0, 6)}</span>
                      {o.order_type === "dinein" && o.table_no ? `T${o.table_no}` : o.order_type || "Counter"}
                    </p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${o.paid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {o.paid ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(o.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    {" "}{new Date(o.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <p className="text-lg font-bold text-primary ml-3">₹{o.total?.toFixed(0) || "0"}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 text-sm mb-4">{t("topSelling")}</h3>
        {topItems.length === 0 ? (
          <div className="text-center py-6"><p className="text-gray-400 text-sm">{t("noData")}</p></div>
        ) : (
          <div className="space-y-2">
            {topItems.map(([name, qty], i) => (
              <div key={name} className="flex items-center gap-3">
                <span className="w-5 text-center text-xs font-bold text-gray-400">#{i + 1}</span>
                <div className="flex-1 bg-gray-50 rounded-full h-7 flex items-center px-3 border border-gray-100">
                  <span className="text-xs font-medium text-gray-700 truncate">{name}</span>
                </div>
                <span className="text-xs font-bold text-primary w-12 text-right">{qty}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## PHASE 18: Admin Menu Mgmt — FULL SUPABASE CODE

**`src/app/admin/menu/page.js`**:
```js
"use client";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import menuData from "@/lib/menu-data";
import { t } from "@/lib/i18n";

export default function AdminMenuPage() {
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", category: "", unit: "plate", price: "", halfPrice: "" });

  useEffect(() => {
    fetchOverrides();
    const channel = supabase.channel("menu")
      .on("postgres_changes", { event: "*", schema: "public", table: "menu_overrides" }, () => { fetchOverrides(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchOverrides = async () => {
    try {
      const { data } = await supabase.from("menu_overrides").select("*");
      setOverrides(data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const getOverride = (itemId) => overrides.find((o) => o.id === itemId);

  const updateOverride = async (itemId, updates) => {
    try {
      await supabase.from("menu_overrides").upsert({ id: itemId, ...updates });
      await fetchOverrides();
    } catch (e) { alert("Error: " + e.message); }
  };

  const deleteItem = async (itemId) => {
    if (!confirm("Delete this item?")) return;
    try {
      const override = getOverride(itemId);
      if (override && override.is_custom) {
        await supabase.from("menu_overrides").delete().eq("id", itemId);
      } else {
        await supabase.from("menu_overrides").upsert({ id: itemId, deleted: true });
      }
      await fetchOverrides();
    } catch (e) { alert("Error: " + e.message); }
  };

  const addCustomItem = async () => {
    if (!newItem.name || !newItem.category || !newItem.price) return;
    const categoryObj = menuData.find((c) => c.name === newItem.category);
    if (!categoryObj) return;
    try {
      await supabase.from("menu_overrides").insert({
        name: newItem.name, category_id: categoryObj.id, category: newItem.category,
        unit: newItem.unit, price: parseFloat(newItem.price),
        half_price: newItem.halfPrice ? parseFloat(newItem.halfPrice) : null,
        available: true, is_custom: true,
      });
      setNewItem({ name: "", category: "", unit: "plate", price: "", halfPrice: "" });
      setShowModal(false);
      await fetchOverrides();
    } catch (e) { alert("Error: " + e.message); }
  };

  const allCategories = useMemo(() => {
    const cats = menuData.map((c) => ({ ...c, items: c.items.map((item) => {
      const ov = getOverride(item.id);
      return ov ? { ...item, ...ov, isOverridden: true } : item;
    }) }));
    if (overrides.some((o) => o.is_custom && !o.deleted)) {
      cats.push({
        id: "_custom", name: "Custom Items", items: overrides.filter((o) => o.is_custom && !o.deleted).map((o) => ({
          id: o.id, name: o.name, price: o.price, halfPrice: o.half_price, unit: o.unit,
          available: o.available, desc: null, isCustom: true,
        })),
      });
    }
    return cats;
  }, [menuData, overrides]);

  const filteredCategories = useMemo(() => {
    if (!search) return allCategories;
    return allCategories.map((cat) => ({
      ...cat, items: cat.items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())),
    })).filter((cat) => cat.items.length > 0);
  }, [allCategories, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder={t("searchPlaceholder")} value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-gray-100 bg-white focus:border-gold focus:outline-none text-sm shadow-sm" />
        </div>
        <button onClick={() => setShowModal(true)}
          className="px-5 py-3 bg-primary text-white rounded-2xl text-sm font-bold hover:bg-primary-light transition shadow-md flex items-center gap-2 whitespace-nowrap">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t("addItem")}
        </button>
      </div>

      {filteredCategories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="text-4xl mb-3 opacity-30">🍽️</div>
          <p className="text-gray-400">{t("noItems")}</p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredCategories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-800">{cat.name}</h3>
                <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full font-medium">{cat.items.length} items</span>
              </div>
              <div className="divide-y divide-gray-50">
                {cat.items.map((item, idx) => {
                  const override = overrides.find((o) => o.id === item.id);
                  const isUnavailable = override?.available === false || (override?.deleted && !item.isCustom);
                  const displayPrice = override?.price !== undefined ? override.price : item.price;
                  const displayHalfPrice = override?.half_price !== undefined ? override.half_price : item.halfPrice;
                  return (
                    <div key={item.id + idx} className={`flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition ${isUnavailable ? "opacity-40" : ""}`}>
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 truncate">{item.name}</span>
                        {item.isCustom && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap">CUSTOM</span>}
                        {item.isOverridden && !item.isCustom && <span className="text-[10px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap">MODIFIED</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {displayHalfPrice ? (
                            <div className="flex gap-1">
                              <input type="number" step="1" defaultValue={displayPrice}
                                onBlur={(e) => { const v = parseFloat(e.target.value); if (v && v !== item.price) updateOverride(item.id, { price: v }); }}
                                className="w-16 text-center text-xs p-1.5 border border-gray-200 rounded-lg bg-white focus:border-gold focus:outline-none" />
                              <span className="text-xs text-gray-400 self-center">/</span>
                              <input type="number" step="1" defaultValue={displayHalfPrice}
                                onBlur={(e) => { const v = parseFloat(e.target.value); if (v && v !== item.halfPrice) updateOverride(item.id, { half_price: v }); }}
                                className="w-16 text-center text-xs p-1.5 border border-gray-200 rounded-lg bg-white focus:border-gold focus:outline-none" />
                            </div>
                          ) : (
                            <input type="number" step="1" defaultValue={displayPrice}
                              onBlur={(e) => { const v = parseFloat(e.target.value); if (v && v !== item.price) updateOverride(item.id, { price: v }); }}
                              className="w-16 text-center text-xs p-1.5 border border-gray-200 rounded-lg bg-white focus:border-gold focus:outline-none" />
                          )}
                          <span className="text-xs text-gray-400">{item.unit}</span>
                        </div>
                        <button onClick={() => updateOverride(item.id, { available: !isUnavailable })}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition shadow-sm ${isUnavailable ? "bg-gray-200 text-gray-500" : "bg-emerald-50 text-emerald-600"}`}>
                          {isUnavailable ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <button onClick={() => deleteItem(item.id)}
                          className="w-9 h-9 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition flex items-center justify-center shadow-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">{t("addItem")}</h3>
            <div className="space-y-3">
              <input type="text" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} placeholder="Item name" className="w-full p-3 text-sm border border-gray-200 rounded-xl bg-white focus:border-gold focus:outline-none" />
              <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} className="w-full p-3 text-sm border border-gray-200 rounded-xl bg-white focus:border-gold focus:outline-none">
                <option value="">Select category</option>
                {menuData.map((cat) => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
              </select>
              <select value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })} className="w-full p-3 text-sm border border-gray-200 rounded-xl bg-white focus:border-gold focus:outline-none">
                {["plate", "piece", "kg", "glass", "bowl", "cup", "mrp"].map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
              <div className="flex gap-2">
                <input type="number" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} placeholder="Price (₹)" className="flex-1 p-3 text-sm border border-gray-200 rounded-xl bg-white focus:border-gold focus:outline-none" />
                <input type="number" value={newItem.halfPrice} onChange={(e) => setNewItem({ ...newItem, halfPrice: e.target.value })} placeholder="Half price (optional)" className="flex-1 p-3 text-sm border border-gray-200 rounded-xl bg-white focus:border-gold focus:outline-none" />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 border-2 border-gray-200 text-gray-500 rounded-xl text-sm font-bold hover:bg-gray-50 transition">{t("cancel")}</button>
                <button onClick={addCustomItem} disabled={!newItem.name || !newItem.category || !newItem.price} className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-primary-light transition shadow-md">{t("save")}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## PHASE 19: Build & Deploy

```
npm run build
npx vercel --prod
```

Add assets to `public/`: `logo.png`, `hero-new.webp`, `hero-bg.webp`

---

## KEY DIFFERENCES: Firebase vs Supabase

| Feature | Firebase | Supabase |
|---|---|---|
| **Library** | `firebase` | `@supabase/supabase-js` |
| **Client file** | `src/lib/firebase.js` | `src/lib/supabase.js` |
| **Read orders** | `getDocs(collection(db, "orders"))` | `supabase.from("orders").select("*")` |
| **Real-time dashboard** | `onSnapshot(q, ...)` | `supabase.channel("x").on("postgres_changes", ...)` |
| **Write order** | `addDoc(collection(db, "orders"), data)` | `supabase.from("orders").insert(data)` |
| **Update order** | `updateDoc(doc(db, "orders", id), data)` | `supabase.from("orders").update(data).eq("id", id)` |
| **Delete doc** | `deleteDoc(doc(db, "menuOverrides", id))` | `supabase.from("menu_overrides").delete().eq("id", id)` |
| **Server timestamp** | `serverTimestamp()` | `new Date().toISOString()` or `now()` default |
| **Query filter** | `where("paid", "==", false)` | `.eq("paid", false)` |
| **Field names** | `camelCase` (paid, tableNo) | `snake_case` (paid, table_no, order_type) |
| **Read limit** | 50,000/day | **Unlimited** |

---

## FILES THAT STAY EXACTLY SAME (no Supabase changes)

| File | Reason |
|---|---|
| `src/app/layout.js` | CartProvider wrapper, metadata, fonts |
| `src/app/globals.css` | CSS only |
| `src/app/page.js` | Uses Header + MenuGrid only |
| `src/app/admin/login/page.js` | sessionStorage, password gate |
| `src/app/admin/layout.js` | Auth check, sidebar, header |
| `src/app/admin/page.js` | Redirect to dashboard |
| `src/app/order-success/page.js` | Only shows order ID from URL |
| `src/app/table/[id]/page.js` | Uses Header + MenuGrid only |
| `src/components/Header.js` | Cart icon only |
| `src/components/AdminSidebar.js` | Nav links only |
| `src/context/CartContext.js` | Pure state management |
| `src/lib/i18n.js` | Translation keys |
| `src/lib/menu-data.js` | Static menu data |

---

## FILES THAT CHANGE (Firebase → Supabase)

| File | Change |
|---|---|
| `src/lib/supabase.js` | NEW — createClient |
| `src/app/admin/dashboard/page.js` | `supabase.channel()` + `.select()` |
| `src/app/admin/sales/page.js` | `.select("*")` |
| `src/app/admin/billing/page.js` | `.insert()` / `.update().eq()` |
| `src/app/admin/menu/page.js` | `.select()` + `.upsert()` + `.delete().eq()` |
| `src/app/cart/page.js` | `.insert()` |
| `src/components/MenuGrid.js` | `.select("*")` + localStorage |
| `/firebase.js` | DELETE — not needed |

---

## Design Decisions (Same as Firebase)
1. ❌ No customer auth — admin password gate (admin123)
2. ❌ No Hindi — English-only
3. ❌ No product images on cards — text only
4. ❌ No filter pills — all categories expanded
5. ❌ No pickup in customer cart — dine-in only
6. ❌ No status buttons — only Bill Now / Mark Paid / Cancel
7. ✅ `<img>` for logo, Next.js Image for hero
8. ✅ Print bill inline same page
9. ✅ Web Audio API bell sound
10. ✅ Admin dot bottom-right footer
11. ✅ Auto-refresh dashboard every 1 hour
