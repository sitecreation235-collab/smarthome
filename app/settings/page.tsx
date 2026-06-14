"use client";

import { ArrowLeft, Settings, Zap, Coins, AlertTriangle, Sun, Moon, Languages } from "lucide-react";
import Link from "next/link";
import { useFirebaseData, updateSettings } from "@/lib/hooks";
import { translations } from "@/lib/i18n";

export default function SettingsPage() {
  const { userSettings, loading } = useFirebaseData();
  const t = translations[userSettings.language];

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${userSettings.theme === "sombre" ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black" : "bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50"}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className={`text-lg animate-pulse ${userSettings.theme === "sombre" ? "text-gray-400" : "text-gray-600"}`}>
            {userSettings.language === "fr" ? "Chargement..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  const cardBg = userSettings.theme === "sombre"
    ? "bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-2xl border border-gray-700/50"
    : "bg-gradient-to-br from-white/60 to-purple-50/60 backdrop-blur-2xl border border-white/50";
  const textClass = userSettings.theme === "sombre" ? "text-white" : "text-gray-800";
  const textMutedClass = userSettings.theme === "sombre" ? "text-gray-400" : "text-gray-600";
  const buttonBg = userSettings.theme === "sombre" ? "bg-gray-800/50" : "bg-white/50";
  const inputBg = userSettings.theme === "sombre" ? "bg-gray-900/50 border-gray-700/50" : "bg-white/70 border-gray-300";

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto pb-24 md:pb-8">
      {/* Back Button */}
      <Link
        href="/"
        className={`inline-flex items-center gap-2 mb-8 transition-all duration-200 group ${textMutedClass} hover:${textClass}`}
      >
        <div className={`p-2 ${buttonBg} rounded-xl group-hover:${userSettings.theme === "sombre" ? "bg-gray-700/50" : "bg-white/70"} transition-colors`}>
          <ArrowLeft className="w-5 h-5" />
        </div>
        <span className="font-medium">{t.nav.home}</span>
      </Link>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-8 h-8 text-blue-400" />
          <h1 className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${userSettings.theme === "sombre" ? "from-white via-blue-200 to-indigo-400" : "from-blue-600 via-purple-600 to-indigo-700"} bg-clip-text text-transparent`}>
            {t.settings.title}
          </h1>
        </div>
      </header>

      <div className="space-y-6">
        {/* Language */}
        <div className={`${cardBg} rounded-3xl p-6`}>
          <div className="flex items-center gap-3 mb-4">
            <Languages className="w-6 h-6 text-purple-400" />
            <h2 className={`text-xl font-semibold ${textClass}`}>{t.settings.language}</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => updateSettings("language", "fr")}
              className={`p-4 rounded-2xl border transition-all duration-300 ${
                userSettings.language === "fr"
                  ? "bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-500/50"
                  : `${userSettings.theme === "sombre" ? "bg-gray-800/30 border-gray-700/30 hover:bg-gray-700/50" : "bg-white/30 border-gray-200 hover:bg-white/50"}`
              }`}
            >
              <p className={`text-center font-semibold ${textClass}`}>
                Français
              </p>
              <p className={`text-sm ${textMutedClass}`}>
                French
              </p>
            </button>
            <button
              onClick={() => updateSettings("language", "en")}
              className={`p-4 rounded-2xl border transition-all duration-300 ${
                userSettings.language === "en"
                  ? "bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-500/50"
                  : `${userSettings.theme === "sombre" ? "bg-gray-800/30 border-gray-700/30 hover:bg-gray-700/50" : "bg-white/30 border-gray-200 hover:bg-white/50"}`
              }`}
            >
              <p className={`text-center font-semibold ${textClass}`}>
                English
              </p>
              <p className={`text-sm ${textMutedClass}`}>
                Anglais
              </p>
            </button>
          </div>
        </div>

        {/* Tarif kWh */}
        <div className={`${cardBg} rounded-3xl p-6`}>
          <div className="flex items-center gap-3 mb-4">
            <Coins className="w-6 h-6 text-yellow-400" />
            <h2 className={`text-xl font-semibold ${textClass}`}>{t.settings.tariff}</h2>
          </div>
          <div className="space-y-3">
            <input
              type="number"
              value={userSettings.tarif_kwh}
              onChange={(e) => updateSettings("tarif_kwh", parseFloat(e.target.value) || 0)}
              className={`w-full ${inputBg} border rounded-2xl px-4 py-3 ${textClass} focus:outline-none focus:border-blue-500 transition-all`}
            />
            <p className={`text-xs ${textMutedClass}`}>
              {userSettings.language === "fr" 
                ? "Ce tarif est utilisé pour calculer les coûts de consommation" 
                : "This rate is used to calculate consumption costs"}
            </p>
          </div>
        </div>

        {/* Alertes */}
        <div className={`${cardBg} rounded-3xl p-6`}>
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
            <h2 className={`text-xl font-semibold ${textClass}`}>{t.settings.powerAlert}</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className={`text-sm ${textMutedClass}`}>{t.settings.powerAlert}</label>
                <span className={`font-medium ${textClass}`}>{userSettings.alerte_puissance} W</span>
              </div>
              <input
                type="range"
                min="1000"
                max="10000"
                step="500"
                value={userSettings.alerte_puissance}
                onChange={(e) => updateSettings("alerte_puissance", parseFloat(e.target.value))}
                className="w-full h-3 bg-gray-700 rounded-full appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1000 W</span>
                <span>10000 W</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className={`text-sm ${textMutedClass}`}>{t.settings.budget}</label>
                <span className={`font-medium ${textClass}`}>{userSettings.budget_mensuel.toLocaleString()} FCFA</span>
              </div>
              <input
                type="range"
                min="5000"
                max="100000"
                step="5000"
                value={userSettings.budget_mensuel}
                onChange={(e) => updateSettings("budget_mensuel", parseFloat(e.target.value))}
                className="w-full h-3 bg-gray-700 rounded-full appearance-none cursor-pointer accent-green-500"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>5 000 FCFA</span>
                <span>100 000 FCFA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Thème */}
        <div className={`${cardBg} rounded-3xl p-6`}>
          <div className="flex items-center gap-3 mb-4">
            {userSettings.theme === "sombre" ? <Moon className="w-6 h-6 text-indigo-400" /> : <Sun className="w-6 h-6 text-yellow-400" />}
            <h2 className={`text-xl font-semibold ${textClass}`}>{t.settings.theme}</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => updateSettings("theme", "sombre")}
              className={`p-4 rounded-2xl border transition-all duration-300 ${
                userSettings.theme === "sombre"
                  ? "bg-gradient-to-br from-gray-700/80 to-gray-800/80 border-indigo-500/50"
                  : `${userSettings.theme === "sombre" ? "bg-gray-800/30 border-gray-700/30 hover:bg-gray-700/50" : "bg-white/30 border-gray-200 hover:bg-white/50"}`
              }`}
            >
              <Moon className="w-8 h-8 mx-auto mb-2 text-indigo-400" />
              <p className={`text-center font-semibold ${textClass}`}>
                {userSettings.language === "fr" ? "Sombre" : "Dark"}
              </p>
            </button>
            <button
              onClick={() => updateSettings("theme", "clair")}
              className={`p-4 rounded-2xl border transition-all duration-300 ${
                userSettings.theme === "clair"
                  ? "bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-500/50"
                  : `${userSettings.theme === "sombre" ? "bg-gray-800/30 border-gray-700/30 hover:bg-gray-700/50" : "bg-white/30 border-gray-200 hover:bg-white/50"}`
              }`}
            >
              <Sun className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <p className={`text-center font-semibold ${textClass}`}>
                {userSettings.language === "fr" ? "Clair" : "Light"}
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
