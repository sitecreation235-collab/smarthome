import { Language } from "./types";

export const translations = {
  fr: {
    nav: {
      home: "Accueil",
      analytics: "Analyse",
      reports: "Rapports",
      settings: "Paramètres"
    },
    header: {
      title: "Smart Energy",
      subtitle: "Surveillance en temps réel",
      online: "En ligne",
      offline: "Hors ligne"
    },
    stats: {
      power: "Puissance Totale",
      consumption: "Consommation",
      cost: "Coût Total",
      temp: "Température"
    },
    tips: {
      title: "Conseils d'Économie",
      ac: "Climatiseur trop froid",
      acText: "Augmentez la température de 1-2°C pour économiser jusqu'à 15% d'énergie !",
      highPower: "Consommation élevée",
      highPowerText: "Votre consommation est proche du seuil d'alerte, vérifiez les appareils inutiles.",
      good: "Excellent !",
      goodText: "Votre consommation est sous contrôle, continuez comme ça !"
    },
    rooms: {
      livingRoom: "Salon",
      hallway: "Couloir",
      bedroom: "Chambre",
      kitchen: "Cuisine"
    },
    devices: {
      real: "Appareil réel",
      simulated: "Simulé",
      on: "ON",
      off: "OFF",
      toggleOn: "Allumer",
      toggleOff: "Éteindre",
      estimate: "Estimation de consommation",
      perHour: "FCFA/heure"
    },
    acControls: {
      title: "Contrôles du Climatiseur",
      auto: "Mode AUTO",
      manual: "Mode MANUEL",
      threshold: "Seuil d'activation"
    },
    lampControls: {
      title: "Contrôles de la Lampe",
      auto: "Mode AUTO",
      manual: "Mode MANUEL"
    },
    settings: {
      title: "Paramètres",
      tariff: "Coût par kWh (FCFA)",
      powerAlert: "Seuil de puissance (W)",
      budget: "Budget mensuel (FCFA)",
      theme: "Thème",
      language: "Langue"
    },
    reports: {
      title: "Rapports",
      thisWeek: "Cette semaine",
      thisMonth: "Ce mois-ci",
      export: "Exporter CSV",
      consumptionAvg: "Consommation moyenne par jour",
      costAvg: "Coût moyen par jour",
      avgPower: "Puissance moyenne",
      tip: "Conseil du jour",
      tipText: "Baisser la température de votre climatiseur de seulement 1°C peut vous faire économiser jusqu'à 10% sur votre facture !"
    },
    analytics: {
      title: "Analyse Énergétique",
      powerEvolution: "Évolution de la puissance",
      dailyCost: "Coût quotidien",
      budgetPrediction: "Prédiction budgétaire",
      budgetText: "Votre facture prévisible pour la fin du mois est estimée à :"
    }
  },
  en: {
    nav: {
      home: "Home",
      analytics: "Analytics",
      reports: "Reports",
      settings: "Settings"
    },
    header: {
      title: "Smart Energy",
      subtitle: "Real-time monitoring",
      online: "Online",
      offline: "Offline"
    },
    stats: {
      power: "Total Power",
      consumption: "Consumption",
      cost: "Total Cost",
      temp: "Temperature"
    },
    tips: {
      title: "Saving Tips",
      ac: "AC too cold",
      acText: "Raise the temperature by 1-2°C to save up to 15% on energy !",
      highPower: "High consumption",
      highPowerText: "Your consumption is close to the alert threshold, check unused devices.",
      good: "Excellent !",
      goodText: "Your consumption is under control, keep it up !"
    },
    rooms: {
      livingRoom: "Living Room",
      hallway: "Hallway",
      bedroom: "Bedroom",
      kitchen: "Kitchen"
    },
    devices: {
      real: "Real device",
      simulated: "Simulated",
      on: "ON",
      off: "OFF",
      toggleOn: "Turn On",
      toggleOff: "Turn Off",
      estimate: "Consumption estimate",
      perHour: "FCFA/hour"
    },
    acControls: {
      title: "AC Controls",
      auto: "AUTO Mode",
      manual: "MANUAL Mode",
      threshold: "Activation threshold"
    },
    lampControls: {
      title: "Lamp Controls",
      auto: "AUTO Mode",
      manual: "MANUAL Mode"
    },
    settings: {
      title: "Settings",
      tariff: "Cost per kWh (FCFA)",
      powerAlert: "Power threshold (W)",
      budget: "Monthly budget (FCFA)",
      theme: "Theme",
      language: "Language"
    },
    reports: {
      title: "Reports",
      thisWeek: "This week",
      thisMonth: "This month",
      export: "Export CSV",
      consumptionAvg: "Average consumption per day",
      costAvg: "Average cost per day",
      avgPower: "Average power",
      tip: "Tip of the day",
      tipText: "Lowering your AC temperature by just 1°C can save you up to 10% on your bill !"
    },
    analytics: {
      title: "Energy Analytics",
      powerEvolution: "Power evolution",
      dailyCost: "Daily cost",
      budgetPrediction: "Budget prediction",
      budgetText: "Your estimated bill for the end of the month is :"
    }
  }
};
