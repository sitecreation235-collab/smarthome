"use client";

import { useState } from "react";
import { ArrowLeft, FileText, Download, TrendingUp, TrendingDown, Calendar, DollarSign, Zap } from "lucide-react";
import Link from "next/link";
import { useFirebaseData } from "@/lib/hooks";
import { translations } from "@/lib/i18n";

export default function ReportsPage() {
  const { historique, etatActuel, loading, userSettings } = useFirebaseData();
  const [periode, setPeriode] = useState<"semaine" | "mois">("mois");
  const t = translations[userSettings.language];

  const calculerStats = () => {
    if (historique.length < 2) {
      return {
        consoTotal: 0,
        coutTotal: 0,
        puissanceMax: 0,
        puissanceMoyenne: 0,
        evolution: 0
      };
    }

    const now = Date.now() / 1000;
    const cutoff = periode === "semaine" ? now - 7 * 24 * 60 * 60 : now - 30 * 24 * 60 * 60;
    const periodeData = historique.filter(entry => entry.timestamp >= cutoff);

    if (periodeData.length === 0) {
      return {
        consoTotal: etatActuel.energie,
        coutTotal: etatActuel.energie * userSettings.tarif_kwh,
        puissanceMax: etatActuel.puissance,
        puissanceMoyenne: etatActuel.puissance,
        evolution: 0
      };
    }

    const puissances = periodeData.map(entry => entry.puissance);
    const consoTotal = periodeData[periodeData.length - 1].energie - periodeData[0].energie;
    const coutTotal = consoTotal * userSettings.tarif_kwh;
    const puissanceMax = Math.max(...puissances);
    const puissanceMoyenne = puissances.reduce((a, b) => a + b, 0) / puissances.length;
    const evolution = periodeData.length > 1 ? ((puissances[puissances.length - 1] - puissances[0]) / puissances[0]) * 100 : 0;

    return {
      consoTotal: Math.max(consoTotal, etatActuel.energie),
      coutTotal: Math.max(coutTotal, etatActuel.energie * userSettings.tarif_kwh),
      puissanceMax,
      puissanceMoyenne,
      evolution
    };
  };

  const stats = calculerStats();

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

  const exporterCSV = () => {
    const headers = userSettings.language === "fr" 
      ? ["Date", "Heure", "Puissance (W)", "Énergie (kWh)", "Coût (FCFA)"]
      : ["Date", "Time", "Power (W)", "Energy (kWh)", "Cost (FCFA)"];
    const rows = historique.map(entry => {
      const date = new Date(entry.timestamp * 1000);
      return [
        date.toLocaleDateString(userSettings.language === "fr" ? "fr-FR" : "en-US"),
        date.toLocaleTimeString(userSettings.language === "fr" ? "fr-FR" : "en-US"),
        entry.puissance.toFixed(1),
        entry.energie.toFixed(2),
        entry.cout_cumule.toFixed(0)
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${userSettings.language === "fr" ? "rapport_energetique" : "energy_report"}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const cardBg = userSettings.theme === "sombre"
    ? "bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-2xl border border-gray-700/50"
    : "bg-gradient-to-br from-white/60 to-purple-50/60 backdrop-blur-2xl border border-white/50";
  const textClass = userSettings.theme === "sombre" ? "text-white" : "text-gray-800";
  const textMutedClass = userSettings.theme === "sombre" ? "text-gray-400" : "text-gray-600";
  const buttonBg = userSettings.theme === "sombre" ? "bg-gray-800/50" : "bg-white/50";

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto pb-24 md:pb-8">
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-green-400" />
            <h1 className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${userSettings.theme === "sombre" ? "from-white via-green-200 to-emerald-400" : "from-green-600 via-emerald-600 to-teal-700"} bg-clip-text text-transparent`}>
              {t.reports.title}
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className={`flex gap-2 p-1 ${buttonBg} rounded-2xl`}>
              <button
                onClick={() => setPeriode("semaine")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  periode === "semaine"
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-600/30"
                    : `${textMutedClass} hover:${textClass} hover:${userSettings.theme === "sombre" ? "bg-gray-700/50" : "bg-white/50"}`
                }`}
              >
                {t.reports.thisWeek}
              </button>
              <button
                onClick={() => setPeriode("mois")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  periode === "mois"
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-600/30"
                    : `${textMutedClass} hover:${textClass} hover:${userSettings.theme === "sombre" ? "bg-gray-700/50" : "bg-white/50"}`
                }`}
              >
                {t.reports.thisMonth}
              </button>
            </div>

            <button
              onClick={exporterCSV}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              {t.reports.export}
            </button>
          </div>
        </div>
        <p className={textMutedClass}>{userSettings.language === "fr" ? "Analyse détaillée de votre consommation" : "Detailed analysis of your consumption"}</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className={`${cardBg} rounded-3xl p-6`}>
          <div className="p-3 bg-gradient-to-br from-purple-600/20 to-violet-600/20 rounded-2xl w-fit mb-4">
            <TrendingUp className="w-8 h-8 text-purple-400" />
          </div>
          <p className={`text-xs mb-1 font-medium uppercase tracking-wider ${textMutedClass}`}>{userSettings.language === "fr" ? "Consommation" : "Consumption"}</p>
          <p className={`text-3xl font-bold ${textClass}`}>{stats.consoTotal.toFixed(2)} <span className="text-lg font-normal text-gray-500">kWh</span></p>
        </div>

        <div className={`${cardBg} rounded-3xl p-6`}>
          <div className="p-3 bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-2xl w-fit mb-4">
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
          <p className={`text-xs mb-1 font-medium uppercase tracking-wider ${textMutedClass}`}>{userSettings.language === "fr" ? "Coût Total" : "Total Cost"}</p>
          <p className={`text-3xl font-bold ${textClass}`}>{Math.round(stats.coutTotal).toLocaleString()} <span className="text-lg font-normal text-gray-500">FCFA</span></p>
        </div>

        <div className={`${cardBg} rounded-3xl p-6`}>
          <div className="p-3 bg-gradient-to-br from-orange-600/20 to-yellow-600/20 rounded-2xl w-fit mb-4">
            <Zap className="w-8 h-8 text-orange-400" />
          </div>
          <p className={`text-xs mb-1 font-medium uppercase tracking-wider ${textMutedClass}`}>{userSettings.language === "fr" ? "Puissance Max" : "Max Power"}</p>
          <p className={`text-3xl font-bold ${textClass}`}>{stats.puissanceMax.toFixed(0)} <span className="text-lg font-normal text-gray-500">W</span></p>
        </div>

        <div className={`${cardBg} rounded-3xl p-6`}>
          <div className="p-3 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-2xl w-fit mb-4">
            <TrendingDown className="w-8 h-8 text-blue-400" />
          </div>
          <p className={`text-xs mb-1 font-medium uppercase tracking-wider ${textMutedClass}`}>{userSettings.language === "fr" ? "Évolution" : "Evolution"}</p>
          <p className={`text-3xl font-bold ${stats.evolution > 0 ? "text-red-400" : "text-green-400"}`}>
            {stats.evolution.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Résumé du Rapport */}
      <div className={`${cardBg} rounded-3xl p-6`}>
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-blue-400" />
          <h2 className={`text-xl font-semibold ${textClass}`}>{userSettings.language === "fr" ? "Résumé de la période" : "Period summary"}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className={`flex justify-between items-center py-3 border-b ${userSettings.theme === "sombre" ? "border-gray-700/30" : "border-gray-200"}`}>
              <span className={textMutedClass}>{t.reports.consumptionAvg}</span>
              <span className={`${textClass} font-medium`}>{(stats.consoTotal / (periode === "semaine" ? 7 : 30)).toFixed(2)} kWh</span>
            </div>
            <div className={`flex justify-between items-center py-3 border-b ${userSettings.theme === "sombre" ? "border-gray-700/30" : "border-gray-200"}`}>
              <span className={textMutedClass}>{t.reports.costAvg}</span>
              <span className={`${textClass} font-medium`}>{Math.round(stats.coutTotal / (periode === "semaine" ? 7 : 30)).toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className={textMutedClass}>{t.reports.avgPower}</span>
              <span className={`${textClass} font-medium`}>{stats.puissanceMoyenne.toFixed(0)} W</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-700/30 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-green-300 mb-2">{t.reports.tip}</h3>
            <p className={`text-sm ${userSettings.theme === "sombre" ? "text-gray-300" : "text-gray-600"}`}>
              {t.reports.tipText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
