## Goal
Maintain and improve Mitthan Di Hatti POS + QR ordering system.

## Progress

### Done (Session 1)
- **Billing page** — now fetches `menu_overrides` on mount + realtime subscription. Merges static `menu-data.js` with overrides: applies price/halfPrice changes, includes custom items, excludes deleted items, respects availability toggle
- **Supabase blueprint table** — created `app_blueprint` table + SQL seed file (`supabase_seed_blueprint.sql`) with 72 entries documenting every page, component, button, DB table, config. RLS allows anon SELECT
- **Blueprint page** (`/admin/blueprint`) — reads from `app_blueprint`, collapsible sections with search, type badges, location paths, detail tags. Added sidebar link (📐 Blueprint)
- **Bell sound** — replaced Web Audio API synthesized oscillator with actual `bell.mp3` file (from project root). Refactored to use `AudioContext` + `decodeAudioData` to avoid browser autoplay blocking. One-time document click/touch handler resumes AudioContext on first user gesture. 60% volume gain. Rings on every new unpaid order INSERT
- **AGENTS.md** — cleaned to only Next.js rules + two error-handling rules

### Done (Session 2 — Bug Fixes)
- **25 bugs found and fixed** — full audit of codebase, all critical/medium/low issues resolved
- **CRITICAL: Admin password** — moved from hardcoded client-side `const ADMIN_PASSWORD = "admin123"` to server-side validation via `/api/auth` API route. Password stored in `.env.local` as `ADMIN_PASSWORD`
- **CRITICAL: Supabase credentials** — moved from hardcoded values in `src/lib/supabase.js` to `.env.local` environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Added missing-variable console error
- **CRITICAL: CartContext guard** — `createContext()` now has safe default values so `useCart()` outside provider won't crash the page
- **Cart persistence** — cart state now saved to `localStorage` on every change, restored on mount. Cart survives page refreshes
- **Customer order `source` field** — cart page now inserts `source: "qr"` so dashboard can distinguish QR orders from counter orders
- **Customer order `subtotal` field** — cart page now includes `subtotal` in order insert
- **Dine-In/Pickup toggle** — cart page now has order type toggle. Pickup orders don't require table number. Button disabled only when dine-in selected without table number
- **Supabase error checking** — billing save now destructures `{ error }` from Supabase `update`/`insert` and throws on failure. No more silent data loss
- **React error boundary** — new `src/components/ErrorBoundary.js` wraps entire app in `layout.js`. Shows user-friendly error screen with reload button instead of white screen
- **AudioContext cleanup** — dashboard now closes `AudioContext` on component unmount to prevent memory leaks
- **Query limits** — dashboard fetch limited to 500 orders, sales to 1000. Prevents memory issues as order volume grows
- **Print timer cleanup** — `setTimeout` for print preview now has `clearTimeout` in useEffect cleanup
- **`tableId` prop used** — MenuGrid now passes `tableId` to cart items so QR orders from `/table/[id]` page include table number
- **Kitchen status progression** — dashboard now has "→ confirmed/preparing/ready/delivered" buttons to advance order status
- **Menu price override stale closure** — admin menu override sync now uses functional `setPrices(prev => ...)` to avoid overwriting manual edits
- **Dead code removed** — `getCartTotal` kg/pc branches simplified (were identical)
- **i18n keys added** — `add`, `clear`, `confirmed` keys added to `src/lib/i18n.js`
- **`uuid` package removed** — unused dependency uninstalled
- **Empty catch blocks fixed** — `console.error` added to audio init/play failures
- **Error feedback** — `markPaid`, `cancelOrder`, `updateStatus` now show alert on failure
- **Graceful refresh** — hourly `window.location.reload()` replaced with `setInterval` data refetch + proper cleanup on unmount
- **Dead CSS removed** — `.gold-text`, `.shimmer`, `.menu-card` classes deleted from `globals.css`
- **Business info extracted** — `BUSINESS_INFO` constant in billing page for print bill template (no more hardcoded phone/address in JSX)
- **Blueprint doc fixed** — `ding.mp3` references updated to `bell.mp3` in `supabase_seed_blueprint.sql`

### Constraints
- Supabase free tier: 200 realtime concurrent peak connections (NOT per day/month). If hit, new realtime connections rejected but manual refresh still works. Naturally drops as tabs close / phones sleep / heartbeat detects stale connections (~30-60s)
- PostgreSQL handles 10+ concurrent writes easily — no race condition (UUID primary key)
- Mobile network is the actual bottleneck, not Supabase
- `.env.local` must exist with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ADMIN_PASSWORD` — file is gitignored

### Key Files Modified
- `src/app/admin/billing/page.js` — menu_overrides fetch + realtime + merged items + error checking + print cleanup + business info extraction
- `src/app/admin/dashboard/page.js` — bell.mp3 via Web Audio API + status progression buttons + AudioContext cleanup + graceful refresh + error feedback
- `src/components/AdminSidebar.js` — added Blueprint link
- `src/app/admin/blueprint/page.js` — new page
- `supabase_seed_blueprint.sql` — new file + ding.mp3 → bell.mp3 fix
- `AGENTS.md` — simplified
- `src/lib/supabase.js` — moved to env vars
- `src/lib/i18n.js` — added add, clear, confirmed keys
- `src/context/CartContext.js` — localStorage persistence + default context values
- `src/app/cart/page.js` — order type toggle + source + subtotal fields
- `src/app/admin/login/page.js` — now uses /api/auth server route
- `src/app/admin/menu/page.js` — stale closure fix
- `src/app/admin/sales/page.js` — query limit added
- `src/components/MenuGrid.js` — tableId prop used + useCallback for isItemAvailable
- `src/components/ErrorBoundary.js` — new file
- `src/app/layout.js` — ErrorBoundary wrapper added
- `src/app/globals.css` — removed dead CSS classes
- `.env.local` — new file (gitignored)
- `src/app/api/auth/route.js` — new file (server-side password validation)

### Relevant Files
- `src/lib/supabase.js` — Supabase client singleton (now uses env vars)
- `src/lib/menu-data.js` — static default menu
- `src/lib/i18n.js` — translation keys
- `src/context/CartContext.js` — cart state management (with localStorage)
- `src/app/globals.css` — Tailwind v4 theme + animations
- `public/bell.mp3` — bell sound (167 KB)
- `src/app/admin/dashboard/page.js` — sound toggle + stat cards + realtime order list + status buttons
- `src/app/admin/billing/page.js` — POS billing with merged items + error handling
- `src/app/admin/menu/page.js` — menu CRUD via menu_overrides
- `src/app/admin/sales/page.js` — sales with payment breakdown
- `src/components/MenuGrid.js` — customer menu with overrides
- `src/components/ErrorBoundary.js` — React error boundary
- `src/app/api/auth/route.js` — server-side admin password validation
- `.env.local` — environment variables (gitignored)
