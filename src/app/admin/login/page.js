"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import Image from "next/image";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        sessionStorage.setItem("adminAuth", "true");
        router.push("/admin/dashboard");
      } else {
        setError(true);
        setTimeout(() => setError(false), 2000);
      }
    } catch {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <div className="text-center mb-6">
          <Image
            src="/logo.png"
            alt="Mitthan Di Hatti"
            width={80}
            height={80}
            className="rounded-full mx-auto mb-3"
          />
          <h2 className="text-xl font-bold text-primary">{t("admin")}</h2>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("enterPassword")}
              className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none text-center text-lg"
              autoFocus
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center">{t("wrongPassword")}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary-light transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : null}
            {t("login")}
          </button>
        </form>
      </div>
    </div>
  );
}
