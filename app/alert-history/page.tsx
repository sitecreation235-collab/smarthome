"use client";

import { useFirebaseData } from "@/lib/hooks";
import { AlertCircle, Zap, Lightbulb, CheckCircle, XCircle } from "lucide-react";

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const getActionLabel = (action?: string) => {
  switch (action) {
    case "turned_off": return "Appareil éteint";
    case "auto_mode": return "Mode AUTO activé";
    case "dismissed": return "Alerte ignorée";
    default: return "Aucune action";
  }
};

export default function AlertHistoryPage() {
  const { alertHistory, userSettings, loading } = useFirebaseData();

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

  return (
    <div className={`min-h-screen ${userSettings.theme === "sombre" ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black" : "bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50"} pt-4 md:pt-24 pb-24 md:pb-8 px-4 transition-colors duration-500`}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">Historique des alertes</h1>
          <p className={`text-lg ${textMutedClass}`}>Suivi de toutes les alertes passées et actions entreprises.</p>
        </div>

        {alertHistory.length === 0 ? (
          <div className={`p-12 rounded-3xl border-2 border-dashed text-center ${cardClass}`}>
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Aucune alerte</h2>
            <p className={textMutedClass}>Vous n'avez pas encore reçu d'alertes.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alertHistory.map((alert) => (
              <div key={alert.id} className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl ${cardClass} ${alert.type === "power" ? "border-orange-500/30" : "border-blue-500/30"}`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${alert.type === "power" ? "bg-orange-500/20" : "bg-blue-500/20"}`}>
                    {alert.type === "power" ? <Zap className="w-8 h-8 text-orange-500" /> : <Lightbulb className="w-8 h-8 text-blue-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg">{alert.title}</h3>
                      <span className={`text-sm ${textMutedClass}`}>{formatDate(alert.timestamp)}</span>
                    </div>
                    <p className={textMutedClass}>{alert.message}</p>
                    
                    {alert.metadata && (
                      <div className="mt-4 pt-4 border-t border-gray-700/30">
                        {alert.metadata.roomName && (
                          <p className={`text-sm ${textMutedClass}`}>Pièce : <span className="font-medium">{alert.metadata.roomName}</span></p>
                        )}
                        {alert.metadata.totalPower && (
                          <p className={`text-sm ${textMutedClass}`}>Puissance : <span className="font-medium">{alert.metadata.totalPower} W</span></p>
                        )}
                        {alert.metadata.devices && alert.metadata.devices.length > 0 && (
                          <p className={`text-sm ${textMutedClass}`}>Appareils : <span className="font-medium">{alert.metadata.devices.join(", ")}</span></p>
                        )}
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-2">
                      {alert.action_taken ? (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">{getActionLabel(alert.action_taken)}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-500/20 text-gray-400">
                          <XCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">{getActionLabel()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
