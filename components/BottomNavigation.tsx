"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart3, Settings, FileText, AlertCircle } from "lucide-react";
import { useFirebaseData } from "@/lib/hooks";
import { translations } from "@/lib/i18n";

export default function BottomNavigation() {
  const pathname = usePathname();
  const { userSettings } = useFirebaseData();
  const t = translations[userSettings.language];

  const navItems = [
    { href: "/", icon: Home, label: t.nav.home },
    { href: "/analytics", icon: BarChart3, label: t.nav.analytics },
    { href: "/reports", icon: FileText, label: t.nav.reports },
    { href: "/alert-history", icon: AlertCircle, label: "Alertes" },
    { href: "/settings", icon: Settings, label: t.nav.settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-3xl border-t border-gray-700/50 px-4 py-3 md:hidden">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 group">
              <div
              className={`p-2 rounded-2xl transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/30"
                  : "bg-transparent group-hover:bg-gray-800"
              }`}
            >
                <item.icon
                  className={`w-5 h-5 transition-all duration-300 ${
                    isActive ? "text-white" : "text-gray-400 group-hover:text-white"}`}
                />
              </div>
              <span
                className={`text-[10px] font-medium transition-all duration-300 ${
                  isActive ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
