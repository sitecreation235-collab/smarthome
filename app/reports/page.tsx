"use client";

import { useState } from "react";
import { useFirebaseData } from "@/lib/hooks";
import { TrendingUp, Calendar, Zap, Wallet } from "lucide-react";

export default function ReportsPage() {
  const { userSettings, loading } = useFirebaseData();
  const [period, setPeriod] = useState<"week" | "month">("week");

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${userSettings.theme === "sombre" ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black" : "bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50"}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 shadow-lg shadow-blue-500/30"></div>
          <p className={`text-lg font-medium animate-pulse ${userSettings.theme === "sombre" ? "text-blue-300" : "text-blue-600"}`}>Chargement...</p>
        </div>
      </div>
    );
  }

  const cardClass = userSettings.theme === "sombre" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200";
  const textMutedClass = userSettings.theme === "sombre" ? "text-gray-400" : "text-gray-500";

  const stats = {
    avgPower: 1050,
    totalEnergy: 29.5,
    totalCost: 51625,
  };

  return (
    <div className={`min-h-screen ${userSettings.theme === "sombre" ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black" : "bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50"} pt-4 md:pt-24 pb-24 md:pb-8 px-4 transition-colors duration-500`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">Rapports</h1>
            <p className={`text-lg ${textMutedClass}`}>Analysez votre consommation d'énergie.</p>
          </div>
          
          <div className={`flex gap-2 p-1 rounded-xl ${userSettings.theme === "sombre" ? "bg-gray-800/30 border border-gray-700/30" : "bg-white/30 border border-gray-300/30"}`}>
            <button
              onClick={() => setPeriod("week")}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                period === "week"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : userSettings.theme === "sombre"
                  ? "text-gray-400 hover:text-white hover:bg-gray-700/30"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/30"
              }`}
            >
              <Calendar className="inline w-4 h-4 mr-2" />
              Hebdo
            </button>
            <button
              onClick={() => setPeriod("month")}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                period === "month"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : userSettings.theme === "sombre"
                  ? "text-gray-400 hover:text-white hover:bg-gray-700/30"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/30"
              }`}
            >
              <Calendar className="inline w-4 h-4 mr-2" />
              Mensuel
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl ${cardClass} border-blue-500/30`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Zap className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className={`text-sm ${textMutedClass}`}>Puissance moyenne</p>
                <h3 className="text-2xl font-bold">{stats.avgPower} W</h3>
              </div>
            </div>
          </div>
          
          <div className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl ${cardClass} border-purple-500/30`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className={`text-sm ${textMutedClass}`}>Énergie totale</p>
                <h3 className="text-2xl font-bold">{stats.totalEnergy} kWh</h3>
              </div>
            </div>
          </div>
          
          <div className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl ${cardClass} border-orange-500/30`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <Wallet className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className={`text-sm ${textMutedClass}`}>Coût total</p>
                <h3 className="text-2xl font-bold">{stats.totalCost.toLocaleString()} FCFA</h3>
              </div>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-3xl border-2 ${cardClass}`}>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Zap className="text-blue-500" />
            Informations
          </h3>
          <p className={textMutedClass}>
            Les graphiques seront affichés ici lorsque les données seront disponibles.
          </p>
        </div>
      </div>
    </div>
  );
}
