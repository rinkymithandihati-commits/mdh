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
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                active
                  ? "bg-white/20 shadow-md"
                  : "hover:bg-white/10"
              }`}
            >
              <span>{l.icon}</span>
              <span>{t(l.labelKey)}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
