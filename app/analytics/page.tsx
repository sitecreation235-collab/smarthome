"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { ArrowLeft, TrendingUp, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";
import { useFirebaseData } from "@/lib/hooks";
import { translations } from "@/lib/i18n";

export default function Analytics() {
  const { historique, loading, userSettings } = useFirebaseData();
  const [periode, setPeriode] = useState<"jour" | "semaine" | "mois">("jour");
  const t = translations[userSettings.language];

  const getFilteredData = () => {
    const now = Date.now() / 1000;
    let cutoff = 0;

    switch (periode) {
      case "jour":
        cutoff = now - 24 * 60 * 60;
        break;
      case "semaine":
        cutoff = now - 7 * 24 * 60 * 60;
        break;
      case "mois":
        cutoff = now - 30 * 24 * 60 * 60;
        break;
    }

    return historique.filter((entry) => entry.timestamp >= cutoff);
  };

  const calculerPrediction = () => {
    if (historique.length < 2) return 0;

    const sorted = [...historique].sort((a, b) => a.timestamp - b.timestamp);
    const premier = sorted[0];
    const dernier = sorted[sorted.length - 1];

    const heuresEcoulees = (dernier.timestamp - premier.timestamp) / (60 * 60);
    if (heuresEcoulees === 0) return 0;

    const consommationHeure = (dernier.energie - premier.energie) / heuresEcoulees;
    const joursRestants = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate();
    const prediction = dernier.energie + (consommationHeure * 24 * joursRestants);

    return prediction * userSettings.tarif_kwh;
  };

  const getDataCoutQuotidien = () => {
    const dataParJour: Record<string, number> = {};

    historique.forEach((entry) => {
      const date = new Date(entry.timestamp * 1000).toLocaleDateString("fr-FR");
      if (!dataParJour[date]) {
        dataParJour[date] = entry.cout_cumule;
      } else {
        dataParJour[date] = Math.max(dataParJour[date], entry.cout_cumule);
      }
    });

    return Object.entries(dataParJour)
      .map(([date, cout]) => ({ date, cout }))
      .slice(-7);
  };

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

  const filteredData = getFilteredData();
  const prediction = calculerPrediction();
  const coutQuotidien = getDataCoutQuotidien();

  const cardBg = userSettings.theme === "sombre"
    ? "bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-2xl border border-gray-700/50"
    : "bg-gradient-to-br from-white/60 to-purple-50/60 backdrop-blur-2xl border border-white/50";
  const textClass = userSettings.theme === "sombre" ? "text-white" : "text-gray-800";
  const textMutedClass = userSettings.theme === "sombre" ? "text-gray-400" : "text-gray-600";
  const buttonBg = userSettings.theme === "sombre" ? "bg-gray-800/50" : "bg-white/50";

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
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
        <h1 className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${userSettings.theme === "sombre" ? "from-white via-blue-200 to-indigo-400" : "from-blue-600 via-purple-600 to-indigo-700"} bg-clip-text text-transparent mb-2`}>
          {t.analytics.title}
        </h1>
        <p className={textMutedClass}>{userSettings.language === "fr" ? "Visualisez votre consommation et optimisez vos dépenses" : "Visualize your consumption and optimize your expenses"}</p>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Power Chart */}
        <div className={`lg:col-span-2 ${cardBg} rounded-3xl p-6`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-2xl">
                <TrendingUp className="text-blue-400 w-6 h-6" />
              </div>
              <h2 className={`text-xl font-semibold ${textClass}`}>{t.analytics.powerEvolution}</h2>
            </div>
            <div className={`flex gap-2 p-1 ${buttonBg} rounded-2xl`}>
              {(["jour", "semaine", "mois"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriode(p)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    periode === p
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30"
                      : `${textMutedClass} hover:${textClass} hover:${userSettings.theme === "sombre" ? "bg-gray-700/50" : "bg-white/50"}`
                  }`}
                >
                  {userSettings.language === "fr" 
                    ? (p === "jour" ? "Aujourd'hui" : p === "semaine" ? "Semaine" : "Mois")
                    : (p === "jour" ? "Today" : p === "semaine" ? "Week" : "Month")
                  }
                </button>
              ))}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredData}>
                <defs>
                  <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={userSettings.theme === "sombre" ? "#374151" : "#e5e7eb"} vertical={false} />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(ts) => new Date(ts * 1000).toLocaleTimeString(userSettings.language === "fr" ? "fr-FR" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                  stroke={userSettings.theme === "sombre" ? "#9ca3af" : "#6b7280"}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={userSettings.theme === "sombre" ? "#9ca3af" : "#6b7280"}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: userSettings.theme === "sombre" ? "#1f2937" : "#ffffff",
                    border: `1px solid ${userSettings.theme === "sombre" ? "#374151" : "#e5e7eb"}`,
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                  }}
                  labelFormatter={(ts) => new Date(ts * 1000).toLocaleString(userSettings.language === "fr" ? "fr-FR" : "en-US")}
                  itemStyle={{ color: "#60a5fa" }}
                />
                <Line
                  type="monotone"
                  dataKey="puissance"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6 }}
                  fill="url(#colorPower)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prediction Card */}
        <div className={`bg-gradient-to-br from-purple-900/30 to-indigo-900/30 backdrop-blur-2xl border border-purple-700/30 rounded-3xl p-6 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-600/20 to-violet-600/20 rounded-2xl">
              <Calendar className="text-purple-400 w-6 h-6" />
            </div>
            <h2 className={`text-xl font-semibold ${textClass}`}>{t.analytics.budgetPrediction}</h2>
          </div>
          <div className="text-center py-6">
            <p className={`text-sm mb-2 ${textMutedClass}`}>{t.analytics.budgetText}</p>
            <p className={`text-4xl md:text-5xl font-bold ${textClass} mb-1`}>
              {Math.round(prediction).toLocaleString()}
            </p>
            <p className="text-purple-400 font-semibold text-lg">FCFA</p>
            <div className={`mt-6 p-4 ${buttonBg} rounded-2xl`}>
              <p className={`text-xs uppercase tracking-wider mb-1 ${textMutedClass}`}>{userSettings.language === "fr" ? "Fin du mois" : "End of month"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Cost Chart */}
      <div className={`${cardBg} rounded-3xl p-6`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-2xl">
            <DollarSign className="text-green-400 w-6 h-6" />
          </div>
          <h2 className={`text-xl font-semibold ${textClass}`}>{t.analytics.dailyCost}</h2>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={coutQuotidien}>
              <CartesianGrid strokeDasharray="3 3" stroke={userSettings.theme === "sombre" ? "#374151" : "#e5e7eb"} vertical={false} />
              <XAxis
                dataKey="date"
                stroke={userSettings.theme === "sombre" ? "#9ca3af" : "#6b7280"}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke={userSettings.theme === "sombre" ? "#9ca3af" : "#6b7280"}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: userSettings.theme === "sombre" ? "#1f2937" : "#ffffff",
                  border: `1px solid ${userSettings.theme === "sombre" ? "#374151" : "#e5e7eb"}`,
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                }}
                formatter={(value: number) => [`${Math.round(value).toLocaleString()} FCFA`, userSettings.language === "fr" ? "Coût" : "Cost"]}
                itemStyle={{ color: "#34d399" }}
              />
              <Bar
                dataKey="cout"
                fill="url(#colorCost)"
                radius={[10, 10, 0, 0]}
                barSize={40}
              />
              <defs>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
