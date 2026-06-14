"use client";

import { useState } from "react";
import { X, Zap } from "lucide-react";
import { useFirebaseData, updateControles } from "@/lib/hooks";
import { translations } from "@/lib/i18n";
import { Device } from "@/lib/types";

interface ActiveDevice {
  device: Device;
  roomName: string;
}

interface PowerAlertNotificationProps {
  activeDevices: ActiveDevice[];
  onClose: () => void;
}

export default function PowerAlertNotification({
  activeDevices,
  onClose,
}: PowerAlertNotificationProps) {
  const { userSettings } = useFirebaseData();
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const t = translations[userSettings.language];

  const toggleDeviceSelection = (deviceId: string) => {
    setSelectedDevices((prev) =>
      prev.includes(deviceId)
        ? prev.filter((id) => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  const turnOffSelectedDevices = () => {
    if (selectedDevices.length === 0) return;
    selectedDevices.forEach((deviceId) => {
      updateControles(`forces/${deviceId}`, false);
    });
    onClose();
  };

  const cardBg = userSettings.theme === "sombre"
    ? "bg-gradient-to-br from-gray-800/95 via-gray-700/90 to-gray-900/95"
    : "bg-gradient-to-br from-white/95 via-purple-50/90 to-indigo-50/95";
  const textClass = userSettings.theme === "sombre" ? "text-white" : "text-gray-800";
  const textMutedClass = userSettings.theme === "sombre" ? "text-gray-300" : "text-gray-600";

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] md:w-auto max-w-2xl max-h-[80vh] overflow-y-auto animate-slide-in">
      <div className={`${cardBg} backdrop-blur-3xl rounded-3xl p-6 border border-gray-700/50 shadow-2xl shadow-blue-500/20`}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`font-bold text-lg ${textClass}`}>{t.notifications.powerAlertTitle}</h3>
              <p className={`text-sm md:text-base ${textMutedClass}`}>{t.notifications.powerAlertMessage}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl hover:bg-gray-700/30 transition-all ${textMutedClass}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <h4 className={`font-semibold mb-3 ${textClass}`}>{t.notifications.selectDevicesToTurnOff}</h4>
          <div className="space-y-3">
            {activeDevices.map(({ device, roomName }) => (
              <div
                key={device.id}
                className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedDevices.includes(device.id)
                    ? "bg-gradient-to-br from-red-900/30 to-orange-900/30 border-red-500/50"
                    : userSettings.theme === "sombre"
                    ? "bg-gray-800/30 border-gray-700/30 hover:bg-gray-700/50"
                    : "bg-white/30 border-gray-200 hover:bg-white/50"
                }`}
                onClick={() => toggleDeviceSelection(device.id)}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedDevices.includes(device.id)}
                    onChange={(e) => e.stopPropagation()}
                    className="w-5 h-5 accent-orange-500"
                  />
                  <div>
                    <p className={`font-semibold ${textClass}`}>{device.name}</p>
                    <p className={`text-xs ${textMutedClass}`}>
                      {roomName} • {device.power_watts} W
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
              userSettings.theme === "sombre" ? "bg-gray-700/50 text-white" : "bg-gray-200 text-gray-800"
            } hover:scale-[1.02]`}
          >
            Annuler
          </button>
          <button
            onClick={turnOffSelectedDevices}
            disabled={selectedDevices.length === 0}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
              selectedDevices.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-600/30 hover:scale-[1.02]"
            }`}
          >
            {t.notifications.turnOffSelected}
          </button>
        </div>
      </div>
    </div>
  );
}