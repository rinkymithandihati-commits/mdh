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
            <span className="text-xl font-bold text-primary">Mitthan Di Hatti</span>
          </Link>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">
            {t("orderConfirmed")}
          </h2>
          <p className="text-gray-400 mb-6 text-sm">{t("estimatedTime")}</p>
          <div className="bg-gradient-to-br from-primary/5 to-gold/5 rounded-2xl p-5 mb-6 border border-primary/5">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">{t("orderNumber")}</p>
            <p className="text-sm font-bold text-primary break-all font-mono">{orderId || "Generating..."}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="w-full py-3 bg-primary text-white rounded-2xl font-bold shadow-md hover:bg-primary-light transition"
            >
              ← {t("backToMenu")}
            </Link>
            <Link
              href="/cart"
              className="w-full py-3 bg-white text-primary border-2 border-primary/20 rounded-2xl font-bold hover:bg-primary/5 transition"
            >
              🛒 {t("orderMore")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
