// Définition des appareils
export interface Device {
  id: string;
  name: string;
  type: "lamp" | "ac" | "tv" | "fridge" | "oven" | "washing_machine" | "other";
  power_watts: number; // Consommation en Watts quand allumé
  is_real: boolean; // Si c'est un vrai appareil (ESP) ou simulé
  is_on: boolean;
}

// Définition des pièces
export interface Room {
  id: string;
  name: string;
  devices: Device[];
}

export interface EtatActuel {
  puissance: number;
  energie: number;
  temperature_salon: number;
  climatiseur_marche: boolean;
  lampes: {
    salon: boolean;
    couloir: boolean;
    chambre: boolean;
    cuisine: boolean;
  };
  last_seen: number;
}

export interface Controles {
  seuil_temperature_clim: number;
  modes: {
    salon: "AUTO" | "MANUEL";
    couloir: "AUTO" | "MANUEL";
    chambre: "AUTO" | "MANUEL";
    cuisine: "AUTO" | "MANUEL";
    climatiseur: "AUTO" | "MANUEL";
  };
  forces: {
    lampe_salon: boolean;
    lampe_couloir: boolean;
    lampe_chambre: boolean;
    lampe_cuisine: boolean;
    climatiseur: boolean;
    [key: string]: boolean | undefined; // Pour les appareils simulés
  };
}

export interface HistoriqueEntry {
  timestamp: number;
  puissance: number;
  energie: number;
  cout_cumule: number;
}

export interface AlertHistoryEntry {
  id: string;
  type: "lamp" | "power";
  title: string;
  message: string;
  timestamp: number;
  action_taken?: string; // "turned_off" | "auto_mode" | "dismissed" | "none"
  metadata?: {
    roomName?: string;
    totalPower?: number;
    devices?: string[];
  };
}

export type Language = "fr" | "en";

export interface UserSettings {
  tarif_kwh: number;
  alerte_puissance: number;
  budget_mensuel: number;
  theme: "clair" | "sombre";
  language: Language;
}

export interface FirebaseData {
  etat_actuel: EtatActuel;
  controles: Controles;
  historique: Record<string, HistoriqueEntry>;
  user_settings: UserSettings;
}
