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
    const auth = sessionStorage.getItem("adminAuth");
    if (!auth) {
      router.push("/admin/login");
    }
  }, [pathname, router]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-3 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo"
              width={36}
              height={36}
              className="rounded-full"
              style={{ width: 36, height: 36 }}
            />
            <h1 className="font-bold text-primary">Mitthan Di Hatti - Admin</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sessionStorage.removeItem("adminAuth");
                router.push("/admin/login");
              }}
              className="px-3 py-1.5 rounded-full text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition"
            >
              {t("logout")}
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
