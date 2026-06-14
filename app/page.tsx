"use client";

import { useState, useEffect, useRef } from "react";
import { Zap, Droplets, Thermometer, Wifi, WifiOff, Lightbulb, Snowflake, TrendingUp, AlertCircle, LightbulbIcon, Tv, Refrigerator, Microwave, Settings2, Tv2 } from "lucide-react";
import { useFirebaseData, updateControles, logAlert } from "@/lib/hooks";
import { Room, Device } from "@/lib/types";
import { translations } from "@/lib/i18n";
import LampNotification from "@/components/LampNotification";
import PowerAlertNotification from "@/components/PowerAlertNotification";

// Fonction pour envoyer une alerte par email
const sendAlertEmail = async (subject: string, html: string, text: string) => {
  try {
    const response = await fetch("/api/send-alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, html, text }),
    });
    
    if (!response.ok) {
      throw new Error("Erreur API");
    }
    
    console.log("Email d'alerte envoyé avec succès !");
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
  }
};

// Définition des pièces et appareils
const ROOMS: Room[] = [
  {
    id: "salon",
    name: "Salon",
    devices: [
      { id: "lampe_salon", name: "Lampe Salon", type: "lamp", power_watts: 60, is_real: true, is_on: false },
      { id: "climatiseur", name: "Climatiseur", type: "ac", power_watts: 1500, is_real: true, is_on: false },
      { id: "tv_salon", name: "TV", type: "tv", power_watts: 120, is_real: false, is_on: false },
      { id: "wifi_salon", name: "Box WiFi", type: "other", power_watts: 15, is_real: false, is_on: true }
    ]
  },
  {
    id: "couloir",
    name: "Couloir",
    devices: [
      { id: "lampe_couloir", name: "Lampe Couloir", type: "lamp", power_watts: 40, is_real: true, is_on: false }
    ]
  },
  {
    id: "chambre",
    name: "Chambre",
    devices: [
      { id: "lampe_chambre", name: "Lampe Chambre", type: "lamp", power_watts: 50, is_real: true, is_on: false },
      { id: "tv_chambre", name: "TV Chambre", type: "tv", power_watts: 80, is_real: false, is_on: false },
      { id: "chargeur", name: "Chargeur", type: "other", power_watts: 10, is_real: false, is_on: false }
    ]
  },
  {
    id: "cuisine",
    name: "Cuisine",
    devices: [
      { id: "lampe_cuisine", name: "Lampe Cuisine", type: "lamp", power_watts: 70, is_real: true, is_on: false },
      { id: "frigo", name: "Réfrigérateur", type: "fridge", power_watts: 150, is_real: false, is_on: true },
      { id: "four", name: "Four", type: "oven", power_watts: 2000, is_real: false, is_on: false },
      { id: "micro", name: "Micro-ondes", type: "other", power_watts: 1000, is_real: false, is_on: false }
    ]
  }
];

interface NotificationData {
  roomId: string;
  roomName: string;
  deviceId: string;
  timeOn: number;
}

interface ActiveDevice {
  device: Device;
  roomName: string;
}

export default function Home() {
  const { etatActuel, controles, userSettings, loading } = useFirebaseData();
  const [isOnline, setIsOnline] = useState(false);
  const [activeTab, setActiveTab] = useState("salon");
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const [showPowerAlert, setShowPowerAlert] = useState(false);
  const [activeDevices, setActiveDevices] = useState<ActiveDevice[]>([]);
  const lampOnTimeRef = useRef<Record<string, { startTime: number; notified: boolean }>>({});
  const t = translations[userSettings.language];

  // Fonction pour obtenir l'état d'un appareil
  const getDeviceState = (device: Device) => {
    if (device.is_real) {
      if (device.type === "lamp") {
        const roomId = ROOMS.find(r => r.devices.some(d => d.id === device.id))?.id || "salon";
        return etatActuel.lampes[roomId as keyof typeof etatActuel.lampes];
      }
      if (device.type === "ac") {
        return etatActuel.climatiseur_marche;
      }
    }
    return controles.forces[device.id] ?? device.is_on;
  };

  // Fonction pour basculer un appareil
  const toggleDevice = (device: Device) => {
    if (device.is_real) {
      if (device.type === "lamp") {
        const current = controles.forces[device.id] ?? false;
        updateControles(`forces/${device.id}`, !current);
        const roomId = ROOMS.find(r => r.devices.some(d => d.id === device.id))?.id || "salon";
        if (controles.modes[roomId as keyof typeof controles.modes] === "AUTO") {
          updateControles(`modes/${roomId}`, "MANUEL");
        }
      }
      if (device.type === "ac") {
        const current = controles.forces.climatiseur ?? false;
        updateControles(`forces/climatiseur`, !current);
        if (controles.modes.climatiseur === "AUTO") {
          updateControles(`modes/climatiseur`, "MANUEL");
        }
      }
    } else {
      const current = controles.forces[device.id] ?? device.is_on;
      updateControles(`forces/${device.id}`, !current);
    }
  };

  // Calcul de la consommation totale (réelle + simulée)
  const calculateTotalPower = () => {
    let total = etatActuel.puissance;
    ROOMS.forEach(room => {
      room.devices.forEach(device => {
        if (device.is_real) {
          // Pour les tests, ajoutons la puissance des appareils réels si ils sont allumés
          const deviceOn = getDeviceState(device);
          if (deviceOn) total += device.power_watts;
        } else {
          const deviceOn = controles.forces[device.id] ?? device.is_on;
          if (deviceOn) total += device.power_watts;
        }
      });
    });
    return total;
  };

  const totalPower = calculateTotalPower();
  const coutTotal = etatActuel ? Math.round(etatActuel.energie * userSettings.tarif_kwh) : 0;

  useEffect(() => {
    if (etatActuel?.last_seen) {
      const now = Date.now() / 1000;
      setIsOnline(now - etatActuel.last_seen < 60);
    }
  }, [etatActuel]);

  useEffect(() => {
    if (loading) return;

    // Check all lamps
    ROOMS.forEach((room) => {
      const lampDevice = room.devices.find((d) => d.type === "lamp" && d.is_real);
      if (!lampDevice) return;

      const isLampOn = getDeviceState(lampDevice);
      const mode = controles.modes[room.id as keyof typeof controles.modes];

      if (isLampOn && mode === "MANUEL") {
        // Lamp is on and in manual mode
        if (!lampOnTimeRef.current[lampDevice.id]) {
          lampOnTimeRef.current[lampDevice.id] = { startTime: Date.now(), notified: false };
        } else {
          const elapsed = Math.floor((Date.now() - lampOnTimeRef.current[lampDevice.id].startTime) / 1000);
          if (elapsed >= 10 && !lampOnTimeRef.current[lampDevice.id].notified) {
            // Show notification and send email
            lampOnTimeRef.current[lampDevice.id].notified = true;
            setNotification({
              roomId: room.id,
              roomName: room.name,
              deviceId: lampDevice.id,
              timeOn: elapsed
            });
            const lampHtml = `
              <h2>🔔 Alerte Lampe</h2>
              <p>La lampe du <strong>${room.name}</strong> est allumée depuis 10 secondes en mode manuel.</p>
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
                <p style="color: #92400e; margin: 0; font-weight: 500;">💡 Pensez à l'éteindre pour économiser de l'énergie !</p>
              </div>
              <a href="https://smarthome-demo.vercel.app/" class="cta">Aller sur le dashboard</a>
            `;
            logAlert({
              type: "lamp",
              title: "Lampe allumée en mode manuel",
              message: `La lampe du ${room.name} est allumée depuis 10 secondes en mode manuel.`,
              metadata: { roomName: room.name }
            });
            sendAlertEmail(
              "🔔 Alerte : Lampe allumée depuis 10 secondes",
              lampHtml,
              `Bonjour,\n\nLa lampe du ${room.name} est allumée depuis 10 secondes en mode manuel.\n\nPensez à l'éteindre pour économiser de l'énergie !\n\n- Smart Energy`
            );
          } else if (notification?.deviceId === lampDevice.id) {
            // Update the time in the notification
            setNotification(prev => prev ? { ...prev, timeOn: elapsed } : null);
          }
        }
      } else {
        // Lamp is off or not in manual mode
        if (lampOnTimeRef.current[lampDevice.id]) {
          delete lampOnTimeRef.current[lampDevice.id];
        }
        if (notification?.deviceId === lampDevice.id) {
          setNotification(null);
        }
      }
    });

    // Set up interval to check elapsed time
    const intervalId = setInterval(() => {
      ROOMS.forEach((room) => {
        const lampDevice = room.devices.find((d) => d.type === "lamp" && d.is_real);
        if (!lampDevice) return;

        const isLampOn = getDeviceState(lampDevice);
        const mode = controles.modes[room.id as keyof typeof controles.modes];

        if (isLampOn && mode === "MANUEL" && lampOnTimeRef.current[lampDevice.id]) {
          const elapsed = Math.floor((Date.now() - lampOnTimeRef.current[lampDevice.id].startTime) / 1000);
          if (elapsed >= 10 && !lampOnTimeRef.current[lampDevice.id].notified) {
            lampOnTimeRef.current[lampDevice.id].notified = true;
            setNotification({
              roomId: room.id,
              roomName: room.name,
              deviceId: lampDevice.id,
              timeOn: elapsed
            });
          } else if (elapsed >= 10 && notification?.deviceId === lampDevice.id) {
            setNotification(prev => prev ? { ...prev, timeOn: elapsed } : null);
          }
        }
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [etatActuel, controles, loading, notification]);

  // Power alert logic
  useEffect(() => {
    if (loading) return;

    // Collect all active devices
    const active: ActiveDevice[] = [];
    ROOMS.forEach((room) => {
      room.devices.forEach((device) => {
        const isOn = getDeviceState(device);
        if (isOn) {
          active.push({ device, roomName: room.name });
        }
      });
    });
    setActiveDevices(active);

    // Check if total power exceeds 1500 W
    if (totalPower > 1500 && active.length > 0 && !showPowerAlert) {
      setShowPowerAlert(true);
      const devicesHtml = active.map((ad) => {
        const icon = ad.device.type === "lamp" ? "💡" : ad.device.type === "ac" ? "❄️" : ad.device.type === "tv" ? "📺" : ad.device.type === "fridge" ? "🧊" : "🔌";
        return `
          <div class="device-item">
            <div class="device-icon">${icon}</div>
            <div class="device-details">
              <div class="device-name">${ad.device.name}</div>
              <div class="device-info">${ad.roomName} • ${ad.device.power_watts} W</div>
            </div>
          </div>
        `;
      }).join("");
      
      const powerHtml = `
        <h2>⚠️ Dépassement de Consommation</h2>
        <div class="power-badge">⚡ ${totalPower} W</div>
        <p>Votre consommation dépasse 1500 W !</p>
        <div class="devices-list">
          <h3 style="color: #1e293b; margin-bottom: 15px; font-size: 18px; font-weight: 600;">Appareils en cours d'utilisation</h3>
          ${devicesHtml}
        </div>
        <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
          <p style="color: #991b1b; margin: 0; font-weight: 500;">🔴 Pensez à éteindre certains appareils pour économiser de l'énergie !</p>
        </div>
        <a href="https://smarthome-demo.vercel.app/" class="cta">Aller sur le dashboard</a>
      `;
      logAlert({
        type: "power",
        title: "Dépassement de la consommation",
        message: `Votre consommation dépasse 1500 W (actuellement: ${totalPower} W).`,
        metadata: { 
          totalPower,
          devices: active.map(ad => `${ad.device.name} (${ad.roomName})`)
        }
      });
      sendAlertEmail(
        "⚠️ Alerte : Dépassement de la consommation de puissance",
        powerHtml,
        `Bonjour,\n\nVotre consommation totale dépasse 1500 W (actuellement: ${totalPower} W) !\n\nAppareils en cours d'utilisation :\n${active.map((ad) => `- ${ad.device.name} (${ad.roomName}) : ${ad.device.power_watts} W`).join('\n')}\n\nPensez à éteindre certains appareils pour économiser de l'énergie !\n\n- Smart Energy`
      );
    } else if (totalPower <= 1500 && showPowerAlert) {
      setShowPowerAlert(false);
    }
  }, [totalPower, etatActuel, controles, loading, showPowerAlert]);

  // Générer les conseils
  const getTips = () => {
    const tips = [];
    if (etatActuel.climatiseur_marche && etatActuel.temperature_salon < 24) {
      tips.push({ icon: Snowflake, title: t.tips.ac, message: t.tips.acText });
    }
    if (totalPower > userSettings.alerte_puissance * 0.8) {
      tips.push({ icon: Zap, title: t.tips.highPower, message: t.tips.highPowerText });
    }
    if (tips.length === 0) {
      tips.push({ icon: LightbulbIcon, title: t.tips.good, message: t.tips.goodText });
    }
    return tips;
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${userSettings.theme === "sombre" ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black" : "bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50"}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500 shadow-lg shadow-blue-500/30"></div>
          <p className={`text-lg font-medium animate-pulse ${userSettings.theme === "sombre" ? "text-blue-300" : "text-blue-600"}`}>Loading...</p>
        </div>
      </div>
    );
  }

  const activeRoom = ROOMS.find(r => r.id === activeTab)!;
  const tips = getTips();

  // Classes dynamiques pour le thème
  const cardBg = userSettings.theme === "sombre"
    ? "bg-gradient-to-br from-gray-800/70 via-gray-700/50 to-gray-900/70 backdrop-blur-3xl border border-gray-700/50"
    : "bg-gradient-to-br from-white/70 via-white/50 to-purple-50/70 backdrop-blur-3xl border border-white/50";
  const textClass = userSettings.theme === "sombre" ? "text-white" : "text-gray-800";
  const textMutedClass = userSettings.theme === "sombre" ? "text-gray-300" : "text-gray-600";

  return (
    <>
      <LampNotification 
        notification={notification} 
        onClose={() => setNotification(null)} 
      />
      {showPowerAlert && (
        <PowerAlertNotification
          activeDevices={activeDevices}
          onClose={() => setShowPowerAlert(false)}
        />
      )}
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <h1 className={`text-3xl md:text-5xl font-bold bg-gradient-to-r ${userSettings.theme === "sombre" ? "from-white via-blue-200 to-indigo-400" : "from-blue-600 via-purple-600 to-indigo-700"} bg-clip-text text-transparent drop-shadow-2xl`}>
            {t.header.title}
          </h1>
          <p className={`${textMutedClass} text-sm md:text-lg`}>{t.header.subtitle}</p>
        </div>

        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all duration-500 ${isOnline
          ? "bg-green-900/30 border-green-700/50 text-green-300"
          : "bg-red-900/30 border-red-700/50 text-red-300"}`}>
          {isOnline ? <Wifi className="w-5 h-5 animate-pulse" /> : <WifiOff className="w-5 h-5" />}
          <span className="font-semibold">{isOnline ? t.header.online : t.header.offline}</span>
        </div>
      </header>

      {/* Stat Cards avec effet 3D */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {[
          { icon: Zap, value: totalPower.toFixed(0), unit: "W", label: t.stats.power, color: "from-blue-600 to-cyan-600" },
          { icon: Droplets, value: etatActuel.energie.toFixed(2), unit: "kWh", label: t.stats.consumption, color: "from-purple-600 to-pink-600" },
          { icon: TrendingUp, value: coutTotal.toLocaleString(), unit: "FCFA", label: t.stats.cost, color: "from-green-600 to-emerald-600" },
          { icon: Thermometer, value: etatActuel.temperature_salon.toFixed(1), unit: "°C", label: t.stats.temp, color: "from-orange-600 to-yellow-600" }
        ].map((stat, idx) => (
          <div key={idx}
            className={`${cardBg} rounded-3xl p-6 md:p-7 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500 transform-gpu`}
            style={{ perspective: "1000px" }}
          >
            <div className={`p-3 md:p-4 bg-gradient-to-br ${stat.color} rounded-2xl w-fit mb-4 shadow-lg`}>
              <stat.icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
            </div>
            <p className={`text-xs md:text-sm font-semibold mb-1 uppercase tracking-wider ${textMutedClass}`}>{stat.label}</p>
            <p className={`text-2xl md:text-4xl font-bold ${textClass}`}>
              {stat.value} <span className={`text-sm md:text-lg font-normal ${textMutedClass} ml-1`}>{stat.unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Conseils */}
      <div className={`${cardBg} rounded-3xl p-6 md:p-7 mb-8`}>
        <div className="flex items-center gap-3 mb-6">
          <Lightbulb className="w-7 h-8 text-yellow-400" />
          <h2 className={`text-xl md:text-2xl font-bold ${textClass}`}>{t.tips.title}</h2>
        </div>
        <div className="space-y-4">
          {tips.map((TipIcon, idx) => (
            <div key={idx} className={`flex items-start gap-3 p-4 md:p-5 rounded-2xl border ${userSettings.theme === "sombre" ? "bg-gray-800/30 border-gray-700/30" : "bg-white/30 border-white/30"}`}>
              <TipIcon.icon className="w-6 h-7 md:w-7 md:h-8 mt-1 text-yellow-400" />
              <div className="flex-1">
                <p className={`font-semibold mb-1 ${textClass}`}>{TipIcon.title}</p>
                <p className={`${textMutedClass} text-sm md:text-base`}>{TipIcon.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Onglets des pièces */}
      <div className="mb-6 flex items-center gap-3 overflow-x-auto pb-2">
        {ROOMS.map((room) => (
          <button
            key={room.id}
            onClick={() => setActiveTab(room.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm md:text-base transition-all duration-500 whitespace-nowrap ${activeTab === room.id
              ? `bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 scale-105`
              : `${cardBg} ${textClass} hover:scale-105`}`}
          >
            {room.name}
          </button>
        ))}
      </div>

      {/* Contenu de la pièce active */}
      <div className={`${cardBg} rounded-3xl p-6 md:p-8`}>
        <h2 className={`text-2xl md:text-3xl font-bold mb-7 flex items-center gap-3 ${textClass}`}>
          <Lightbulb className="w-8 h-9 text-yellow-400" />
          {activeRoom.name}
        </h2>

        {/* Contrôles du mode de la pièce si pas le salon */}
        {activeTab !== "salon" && activeRoom.devices.some(d => d.is_real) && (
          <div className={`mb-7 p-5 rounded-2xl border ${userSettings.theme === "sombre" ? "bg-gray-800/30 border-gray-700/30" : "bg-white/30 border-white/30"}`}>
            <h3 className={`text-lg font-semibold mb-4 ${textClass}`}>{t.lampControls.title}</h3>
            <div className="flex gap-3">
              <button
                onClick={() => updateControles(`modes/${activeTab}`, "AUTO")}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                  controles.modes[activeTab as keyof typeof controles.modes] === "AUTO"
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30"
                    : `${cardBg} ${textClass}`
                }`}
              >
                {t.lampControls.auto}
              </button>
              <button
                onClick={() => updateControles(`modes/${activeTab}`, "MANUEL")}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                  controles.modes[activeTab as keyof typeof controles.modes] === "MANUEL"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30"
                    : `${cardBg} ${textClass}`
                }`}
              >
                {t.lampControls.manual}
              </button>
            </div>
          </div>
        )}

        {/* Appareils */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {activeRoom.devices.map(device => {
            const isOn = getDeviceState(device);
            return (
              <div key={device.id}
                className={`p-5 md:p-6 rounded-2xl border transition-all duration-500 transform-gpu hover:scale-[1.02] hover:shadow-2xl ${isOn
                  ? "bg-gradient-to-br from-green-900/20 via-green-800/10 to-emerald-900/20 border-green-700/40"
                  : `${userSettings.theme === "sombre" ? "bg-gray-800/30 border-gray-700/30" : "bg-white/30 border-white/30"}`}`}
                style={{ perspective: "800px" }}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-4">
                    {device.type === "lamp" && <Lightbulb className={`w-9 h-10 ${isOn ? "text-yellow-400" : "text-gray-500"}`} />}
                    {device.type === "ac" && <Snowflake className={`w-9 h-10 ${isOn ? "text-cyan-400" : "text-gray-500"}`} />}
                    {device.type === "tv" && <Tv2 className={`w-9 h-10 ${isOn ? "text-blue-400" : "text-gray-500"}`} />}
                    {device.type === "fridge" && <Refrigerator className={`w-9 h-10 ${isOn ? "text-cyan-400" : "text-gray-500"}`} />}
                    {device.type === "oven" && <Microwave className={`w-9 h-10 ${isOn ? "text-orange-400" : "text-gray-500"}`} />}
                    {device.type === "other" && <Settings2 className={`w-9 h-10 ${isOn ? "text-purple-400" : "text-gray-500"}`} />}
                    <div>
                      <p className={`font-bold text-lg ${textClass}`}>{device.name}</p>
                      <p className={`${textMutedClass} text-xs md:text-sm`}>{device.is_real ? t.devices.real : t.devices.simulated} • {device.power_watts}W</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3.5 h-3.5 rounded-full ${isOn ? "bg-green-400 animate-pulse" : "bg-gray-500"}`} />
                    <span className={`text-sm md:text-base font-semibold ${isOn ? "text-green-400" : textMutedClass}`}>
                      {isOn ? t.devices.on : t.devices.off}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => toggleDevice(device)}
                  className={`w-full py-3.5 rounded-xl font-bold transition-all duration-300 shadow-lg ${isOn
                    ? "bg-gradient-to-r from-red-600 to-orange-600 text-white hover:shadow-red-600/40"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-600/40"}`}
                >
                  {isOn ? t.devices.toggleOff : t.devices.toggleOn}
                </button>

                {/* Estimation pour les appareils simulés */}
                {!device.is_real && isOn && (
                  <div className={`mt-4 p-4 rounded-xl border ${userSettings.theme === "sombre" ? "bg-blue-900/20 border-blue-700/30" : "bg-blue-50 border-blue-200"}`}>
                    <p className={`text-xs md:text-sm ${userSettings.theme === "sombre" ? "text-blue-300" : "text-blue-600"}`}>{t.devices.estimate} :</p>
                    <p className={`text-base md:text-lg font-bold ${textClass}`}>
                      {(device.power_watts / 1000 * userSettings.tarif_kwh).toFixed(2)} {t.devices.perHour}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contrôles spécifiques au salon */}
        {activeTab === "salon" && (
          <div className="mt-8 pt-8 border-t border-gray-700/30 space-y-7">
            {/* Contrôles de la lampe du salon */}
            <div className={`p-5 md:p-6 rounded-2xl border ${userSettings.theme === "sombre" ? "bg-gray-800/30 border-gray-700/30" : "bg-white/30 border-white/30"}`}>
              <h3 className={`text-lg md:text-xl font-bold mb-4 flex items-center gap-2 ${textClass}`}>
                <Lightbulb className="w-7 h-8 text-yellow-400" />
                {t.lampControls.title}
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={() => updateControles("modes/salon", "AUTO")}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    controles.modes.salon === "AUTO"
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30"
                      : `${cardBg} ${textClass}`
                  }`}
                >
                  {t.lampControls.auto}
                </button>
                <button
                  onClick={() => updateControles("modes/salon", "MANUEL")}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    controles.modes.salon === "MANUEL"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30"
                      : `${cardBg} ${textClass}`
                  }`}
                >
                  {t.lampControls.manual}
                </button>
              </div>
            </div>

            {/* Contrôles du climatiseur */}
            <div className={`p-5 md:p-6 rounded-2xl border ${userSettings.theme === "sombre" ? "bg-gray-800/30 border-gray-700/30" : "bg-white/30 border-white/30"}`}>
              <h3 className={`text-lg md:text-xl font-bold mb-4 flex items-center gap-2 ${textClass}`}>
                <Snowflake className="w-7 h-8 text-cyan-400" />
                {t.acControls.title}
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => updateControles("modes/climatiseur", "AUTO")}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      controles.modes.climatiseur === "AUTO"
                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30"
                        : `${cardBg} ${textClass}`
                    }`}
                  >
                    {t.acControls.auto}
                  </button>
                  <button
                    onClick={() => updateControles("modes/climatiseur", "MANUEL")}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      controles.modes.climatiseur === "MANUEL"
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30"
                        : `${cardBg} ${textClass}`
                    }`}
                  >
                    {t.acControls.manual}
                  </button>
                </div>
                {controles.modes.climatiseur === "AUTO" && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className={`${textMutedClass} text-sm md:text-base font-semibold`}>{t.acControls.threshold}</label>
                      <span className={`text-2xl md:text-3xl font-bold ${textClass}`}>{controles.seuil_temperature_clim}°C</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="40"
                      value={controles.seuil_temperature_clim}
                      onChange={(e) => updateControles("seuil_temperature_clim", parseFloat(e.target.value))}
                      className="w-full h-3 bg-gray-700 rounded-full appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
