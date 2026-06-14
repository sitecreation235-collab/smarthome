"use client";

import { X, Lightbulb } from "lucide-react";
import { useFirebaseData, updateControles } from "@/lib/hooks";
import { translations } from "@/lib/i18n";

interface NotificationData {
  roomId: string;
  roomName: string;
  deviceId: string;
  timeOn: number;
}

interface LampNotificationProps {
  notification: NotificationData | null;
  onClose: () => void;
}

export default function LampNotification({ notification, onClose }: LampNotificationProps) {
  const { userSettings } = useFirebaseData();
  const t = translations[userSettings.language];

  if (!notification) return null;

  const message = t.notifications.lampOnMessage
    .replace("{room}", notification.roomName)
    .replace("{time}", notification.timeOn.toString());

  const handleTurnOff = () => {
    updateControles(`forces/${notification.deviceId}`, false);
    onClose();
  };

  const handleSwitchToAuto = () => {
    updateControles(`modes/${notification.roomId}`, "AUTO");
    onClose();
  };

  const cardBg = userSettings.theme === "sombre"
    ? "bg-gradient-to-br from-gray-800/95 via-gray-700/90 to-gray-900/95"
    : "bg-gradient-to-br from-white/95 via-purple-50/90 to-indigo-50/95";
  const textClass = userSettings.theme === "sombre" ? "text-white" : "text-gray-800";
  const textMutedClass = userSettings.theme === "sombre" ? "text-gray-300" : "text-gray-600";

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] md:w-auto max-w-lg animate-slide-in">
      <div className={`${cardBg} backdrop-blur-3xl rounded-3xl p-6 border border-gray-700/50 shadow-2xl shadow-blue-500/20`}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-lg">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`font-bold text-lg ${textClass}`}>{t.notifications.title}</h3>
              <p className={`text-sm md:text-base ${textMutedClass}`}>{message}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl hover:bg-gray-700/30 transition-all ${textMutedClass}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleTurnOff}
            className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-600/30 hover:shadow-red-600/40 hover:scale-[1.02]"
          >
            {t.notifications.turnOff}
          </button>
          <button
            onClick={handleSwitchToAuto}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30 hover:shadow-cyan-600/40 hover:scale-[1.02]`}
          >
            {t.notifications.switchToAuto}
          </button>
        </div>
      </div>
    </div>
  );
}