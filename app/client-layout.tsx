"use client";

import "./globals.css";
import BottomNavigation from "@/components/BottomNavigation";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Settings, Languages, Sun, Moon, Home, BarChart3, FileText, LogOut } from "lucide-react";
import { useFirebaseData, updateSettings } from "@/lib/hooks";
import { translations } from "@/lib/i18n";
import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userSettings, user, loading } = useFirebaseData();
  const t = translations[userSettings.language];
  const pathname = usePathname();
  const router = useRouter();

  // Gérer la redirection si non connecté
  useEffect(() => {
    if (!loading && !user && pathname !== "/landing") {
      router.push("/landing");
    }
    if (!loading && user && pathname === "/landing") {
      router.push("/");
    }
  }, [user, loading, pathname, router]);

  // Apply theme to document
  useEffect(() => {
    if (userSettings.theme === "sombre") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [userSettings.theme]);

  // Si on est sur la landing page, on n'affiche pas le layout
  if (pathname === "/landing") {
    return (
      <html lang={userSettings.language}>
        <body className="min-h-screen">
          {children}
        </body>
      </html>
    );
  }

  // Afficher un chargement si loading
  if (loading || !user) {
    return (
      <html lang={userSettings.language}>
        <body className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement...</p>
          </div>
        </body>
      </html>
    );
  }

  const bgClass = userSettings.theme === "sombre"
    ? "bg-gradient-to-br from-gray-950 via-gray-900 to-slate-950 text-white"
    : "bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 text-gray-900";

  return (
    <html lang={userSettings.language}>
      <body className={`min-h-screen ${bgClass} pb-24 md:pb-0 transition-colors duration-500`}>
        {/* Desktop Header */}
        <div className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-3xl border-b border-gray-700/50 px-10 py-5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-10">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                Smart Energy
              </Link>
              <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center gap-2 text-gray-300 hover:text-blue-300 font-semibold transition-all duration-300">
                  <Home className="w-5 h-5" />
                  {t.nav.home}
                </Link>
                <Link href="/analytics" className="flex items-center gap-2 text-gray-300 hover:text-blue-300 font-semibold transition-all duration-300">
                  <BarChart3 className="w-5 h-5" />
                  {t.nav.analytics}
                </Link>
                <Link href="/reports" className="flex items-center gap-2 text-gray-300 hover:text-blue-300 font-semibold transition-all duration-300">
                  <FileText className="w-5 h-5" />
                  {t.nav.reports}
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <span className="font-bold text-white">{user.email?.[0].toUpperCase()}</span>
                </div>
                <span className="text-gray-300 text-sm hidden lg:block">{user.email}</span>
              </div>
              {/* Language Switcher */}
              <button
                onClick={() => updateSettings("language", userSettings.language === "fr" ? "en" : "fr")}
                className="p-3 bg-gray-800/50 rounded-2xl text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-300"
              >
                <Languages className="w-6 h-6" />
              </button>
              {/* Theme Switcher */}
              <button
                onClick={() => updateSettings("theme", userSettings.theme === "sombre" ? "clair" : "sombre")}
                className="p-3 bg-gray-800/50 rounded-2xl text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-300"
              >
                {userSettings.theme === "sombre" ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>
              {/* Logout Button */}
              <button
                onClick={() => signOut(auth)}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl font-semibold shadow-lg shadow-red-600/30 hover:shadow-red-600/40 transition-all duration-300"
              >
                <LogOut className="w-5 h-5" />
                Déconnexion
              </button>
              {/* Settings Link */}
              <Link
                href="/settings"
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transition-all duration-300"
              >
                <Settings className="w-5 h-5" />
                {t.nav.settings}
              </Link>
            </div>
          </div>
        </div>

        {/* Padding for desktop header */}
        <div className="hidden md:block pt-24" />

        {children}
        <BottomNavigation />
      </body>
    </html>
  );
}
