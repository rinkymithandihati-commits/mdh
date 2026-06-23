"use client";
import { useCart } from "@/context/CartContext";
import { t } from "@/lib/i18n";
import Link from "next/link";

export default function Header({ showCart = true, transparent = false }) {
  const { getCartCount } = useCart();
  const count = getCartCount();

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 no-print ${
        transparent
          ? "bg-transparent"
          : "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11 md:w-14 md:h-14 rounded-full overflow-hidden ring-2 ring-gold/30 group-hover:ring-gold/60 transition-all">
            <img
              src="/logo.png"
              alt="Mitthan Di Hatti"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-primary leading-tight tracking-tight">
              Mitthan Di Hatti
            </h1>
            <p className="text-[10px] md:text-xs text-gold font-medium tracking-wider uppercase">
              {t("subtitle")}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 md:gap-3">
          {showCart && (
            <Link
              href="/cart"
              className="relative p-2 rounded-full hover:bg-primary/5 transition"
            >
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-secondary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
