"use client";

import { useState, useMemo } from "react";
import { useFirebaseData } from "@/lib/hooks";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend } from "recharts";
import { TrendingUp, Calendar, Zap, Wallet } from "lucide-react";

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleString("fr-FR", {
    month: "short",
    day: "numeric",
    hour: "2-digit"
  });
};

const getWeeklyData = (historique: any[], userSettings: any) => {
  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const weekData = historique.filter(entry => entry.timestamp > oneWeekAgo);
  
  if (weekData.length === 0) return [];
  
  // Group by day
  const dailyData: Record<string, { totalPower: number; totalEnergy: number; count: number }> = {};
  
  weekData.forEach(entry => {
    const dateKey = new Date(entry.timestamp).toISOString().split('T')[0];
    if (!dailyData[dateKey]) {
      dailyData[dateKey] = { totalPower: 0, totalEnergy: 0, count: 0 };
    }
    dailyData[dateKey].totalPower += entry.puissance;
    dailyData[dateKey].totalEnergy += entry.energie;
    dailyData[dateKey].count += 1;
  });
  
  return Object.entries(dailyData).map(([dateKey, data]) => {
    const date = new Date(dateKey);
    return {
      date: `${date.getDate()}/${date.getMonth() + 1}`,
      puissance: Math.round(data.totalPower / data.count),
      energie: Math.round(data.totalEnergy),
      cout: Math.round(data.totalEnergy * userSettings.tarif_kwh)
    };
  });
};

const getMonthlyData = (historique: any[], userSettings: any) => {
  const now = Date.now();
  const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
  const monthData = historique.filter(entry => entry.timestamp > oneMonthAgo);
  
  if (monthData.length === 0) return [];
  
  // Group by week (simplified: every 7 days)
  const weeklyData: Record<string, { totalPower: number; totalEnergy: number; count: number }> = {};
  
  monthData.forEach(entry => {
    const weekNum = Math.floor((entry.timestamp - oneMonthAgo) / (7 * 24 * 60 * 60 * 1000));
    const weekKey = `Semaine ${weekNum + 1}`;
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = { totalPower: 0, totalEnergy: 0, count: 0 };
    }
    weeklyData[weekKey].totalPower += entry.puissance;
    weeklyData[weekKey].totalEnergy += entry.energie;
    weeklyData[weekKey].count += 1;
  });
  
  return Object.entries(weeklyData).map(([weekKey, data]) => ({
    semaine: weekKey,
    puissance: Math.round(data.totalPower / data.count),
    energie: Math.round(data.totalEnergy),
    cout: Math.round(data.totalEnergy * userSettings.tarif_kwh)
  }));
};

export default function ReportsPage() {
  const { historique, userSettings, loading } = useFirebaseData();
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

  const bgClass = userSettings.theme === "sombre" ? "bg-gray-900 text-white" : "bg-white text-gray-900";
  const cardClass = userSettings.theme === "sombre" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200";
  const textMutedClass = userSettings.theme === "sombre" ? "text-gray-400" : "text-gray-500";
  
  const weekData = useMemo(() => getWeeklyData(historique, userSettings), [historique, userSettings]);
  const monthData = useMemo(() => getMonthlyData(historique, userSettings), [historique, userSettings]);
  const currentData = period === "week" ? weekData : monthData;

  // Calculate totals
  const totals = useMemo(() => {
    if (currentData.length === 0) return { avgPower: 0, totalEnergy: 0, totalCost: 0 };
    
    const avgPower = Math.round(currentData.reduce((sum, d) => sum + (d.puissance || 0), 0) / currentData.length);
    const totalEnergy = currentData.reduce((sum, d) => sum + (d.energie || 0), 0);
    const totalCost = currentData.reduce((sum, d) => sum + (d.cout || 0), 0);
    
    return { avgPower, totalEnergy, totalCost };
  }, [currentData]);

  return (
    <div className={`min-h-screen ${userSettings.theme === "sombre" ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black" : "bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50"} pt-4 md:pt-24 pb-24 md:pb-8 px-4 transition-colors duration-500`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">Rapports</h1>
            <p className={`text-lg ${textMutedClass}`}>Analysez votre consommation d'énergie.</p>
          </div>
          
          <div className="flex gap-2 p-1 rounded-xl bg-gray-800/30 border border-gray-700/30">
            <button
              onClick={() => setPeriod("week")}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                period === "week"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : `text-gray-400 hover:text-white hover:bg-gray-700/30`
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
                  : `text-gray-400 hover:text-white hover:bg-gray-700/30`
              }`}
            >
              <Calendar className="inline w-4 h-4 mr-2" />
              Mensuel
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl ${cardClass} border-blue-500/30`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Zap className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className={`text-sm ${textMutedClass}`}>Puissance moyenne</p>
                <h3 className="text-2xl font-bold">{totals.avgPower} W</h3>
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
                <h3 className="text-2xl font-bold">{totals.totalEnergy} kWh</h3>
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
                <h3 className="text-2xl font-bold">{totals.totalCost.toLocaleString()} FCFA</h3>
              </div>
            </div>
          </div>
        </div>

        {currentData.length === 0 ? (
          <div className={`p-12 rounded-3xl border-2 border-dashed text-center ${cardClass}`}>
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Pas de données</h2>
            <p className={textMutedClass}>Commencez à utiliser le système pour générer des rapports.</p>
          </div>
        ) : (
          <>
            {/* Power chart */}
            <div className={`p-6 rounded-3xl border-2 mb-8 ${cardClass}`}>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Zap className="text-blue-500" />
                Évolution de la puissance
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={currentData}>
                    <defs>
                      <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={userSettings.theme === "sombre" ? "#374151" : "#e5e7eb"} />
                    <XAxis 
                      dataKey={period === "week" ? "date" : "semaine"} 
                      stroke={userSettings.theme === "sombre" ? "#9ca3af" : "#6b7280"} 
                    />
                    <YAxis 
                      stroke={userSettings.theme === "sombre" ? "#9ca3af" : "#6b7280"} 
                      unit=" W"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: userSettings.theme === "sombre" ? "#1f2937" : "#ffffff", 
                        border: `1px solid ${userSettings.theme === "sombre" ? "#374151" : "#e5e7eb"}`,
                        borderRadius: "12px"
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="puissance" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorPower)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cost chart */}
            <div className={`p-6 rounded-3xl border-2 ${cardClass}`}>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Wallet className="text-orange-500" />
                Évolution du coût
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={currentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={userSettings.theme === "sombre" ? "#374151" : "#e5e7eb"} />
                    <XAxis 
                      dataKey={period === "week" ? "date" : "semaine"} 
                      stroke={userSettings.theme === "sombre" ? "#9ca3af" : "#6b7280"} 
                    />
                    <YAxis 
                      stroke={userSettings.theme === "sombre" ? "#9ca3af" : "#6b7280"} 
                      unit=" FCFA"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: userSettings.theme === "sombre" ? "#1f2937" : "#ffffff", 
                        border: `1px solid ${userSettings.theme === "sombre" ? "#374151" : "#e5e7eb"}`,
                        borderRadius: "12px"
                      }} 
                    />
                    <Bar 
                      dataKey="cout" 
                      fill="#f59e0b" 
                      radius={[8, 8, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
