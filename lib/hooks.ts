import { useEffect, useState } from "react";
import { ref, onValue, update, get } from "firebase/database";
import { onAuthStateChanged, User } from "firebase/auth";
import { db, auth } from "./firebase";
import type { EtatActuel, Controles, HistoriqueEntry, UserSettings } from "./types";

// Définition des pièces et appareils (doit correspondre à la page)
const ROOMS = [
  {
    id: "salon",
    name: "Salon",
    devices: [
      { id: "tv_salon", defaultState: false },
      { id: "wifi_salon", defaultState: true }
    ]
  },
  {
    id: "chambre",
    name: "Chambre",
    devices: [
      { id: "tv_chambre", defaultState: false },
      { id: "chargeur", defaultState: false }
    ]
  },
  {
    id: "cuisine",
    name: "Cuisine",
    devices: [
      { id: "frigo", defaultState: true },
      { id: "four", defaultState: false },
      { id: "micro", defaultState: false }
    ]
  }
];

// Fonction pour initialiser les données par défaut dans Firebase si elles n'existent pas
const initializeFirebaseData = async () => {
  try {
    const etatActuelRef = ref(db, "etat_actuel");
    const controlesRef = ref(db, "controles");
    const userSettingsRef = ref(db, "user_settings");

    const etatActuelSnap = await get(etatActuelRef);
    if (!etatActuelSnap.exists()) {
      const defaultEtatActuel: EtatActuel = {
        puissance: 0,
        energie: 0,
        temperature_salon: 0,
        climatiseur_marche: false,
        lampes: {
          salon: false,
          couloir: false,
          chambre: false,
          cuisine: false
        },
        last_seen: 0
      };
      await update(etatActuelRef, defaultEtatActuel);
    }

    const controlesSnap = await get(controlesRef);
    if (!controlesSnap.exists()) {
      const defaultControles: Controles = {
        seuil_temperature_clim: 32,
        modes: {
          salon: "AUTO",
          couloir: "AUTO",
          chambre: "AUTO",
          cuisine: "AUTO",
          climatiseur: "AUTO"
        },
        forces: {
          lampe_salon: false,
          lampe_couloir: false,
          lampe_chambre: false,
          lampe_cuisine: false,
          climatiseur: false
        }
      };
      await update(controlesRef, defaultControles);
    }

    // Initialiser les appareils simulés
    const controlesData = (await get(controlesRef)).val() as Controles;
    const defaultForces: any = controlesData.forces || {};
    let needsUpdate = false;

    ROOMS.forEach(room => {
      room.devices.forEach(device => {
        if (!(device.id in defaultForces)) {
          defaultForces[device.id] = device.defaultState;
          needsUpdate = true;
        }
      });
    });

    if (needsUpdate) {
      await update(ref(db, "controles/forces"), defaultForces);
    }

    const userSettingsSnap = await get(userSettingsRef);
    if (!userSettingsSnap.exists()) {
      const defaultUserSettings: UserSettings = {
        tarif_kwh: 175,
        alerte_puissance: 3500,
        budget_mensuel: 10000,
        theme: "sombre",
        language: "fr"
      };
      await update(userSettingsRef, defaultUserSettings);
    }
  } catch (error) {
    console.error("Erreur lors de l'initialisation des données Firebase:", error);
  }
};

export function useFirebaseData() {
  const [etatActuel, setEtatActuel] = useState<EtatActuel | null>(null);
  const [controles, setControles] = useState<Controles | null>(null);
  const [historique, setHistorique] = useState<HistoriqueEntry[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const defaultEtatActuel: EtatActuel = {
    puissance: 0,
    energie: 0,
    temperature_salon: 0,
    climatiseur_marche: false,
    lampes: {
      salon: false,
      couloir: false,
      chambre: false,
      cuisine: false
    },
    last_seen: 0
  };

  const defaultControles: Controles = {
    seuil_temperature_clim: 32,
    modes: {
      salon: "AUTO",
      couloir: "AUTO",
      chambre: "AUTO",
      cuisine: "AUTO",
      climatiseur: "AUTO"
    },
    forces: {
      lampe_salon: false,
      lampe_couloir: false,
      lampe_chambre: false,
      lampe_cuisine: false,
      climatiseur: false
    }
  };

  const defaultUserSettings: UserSettings = {
    tarif_kwh: 175,
    alerte_puissance: 3500,
    budget_mensuel: 10000,
    theme: "sombre",
    language: "fr"
  };

  useEffect(() => {
    // Écouter les changements d'authentification
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    // Initialiser les données Firebase d'abord
    initializeFirebaseData();

    const etatActuelRef = ref(db, "etat_actuel");
    const controlesRef = ref(db, "controles");
    const historiqueRef = ref(db, "historique");
    const userSettingsRef = ref(db, "user_settings");

    const unsub1 = onValue(etatActuelRef, (snapshot) => {
      const val = snapshot.val();
      setEtatActuel(val ? { ...defaultEtatActuel, ...val } : defaultEtatActuel);
      setLoading(false);
    });

    const unsub2 = onValue(controlesRef, (snapshot) => {
      const val = snapshot.val();
      setControles(val ? { ...defaultControles, ...val } : defaultControles);
    });

    const unsub3 = onValue(historiqueRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const entries = Object.values(data) as HistoriqueEntry[];
        setHistorique(entries.sort((a, b) => a.timestamp - b.timestamp));
      }
    });

    const unsub4 = onValue(userSettingsRef, (snapshot) => {
      const val = snapshot.val();
      setUserSettings(val ? { ...defaultUserSettings, ...val } : defaultUserSettings);
    });

    return () => {
      unsubscribeAuth();
      unsub1();
      unsub2();
      unsub3();
      unsub4();
    };
  }, []);

  const safeEtatActuel = etatActuel || defaultEtatActuel;
  const safeControles = controles || defaultControles;
  const safeUserSettings = userSettings || defaultUserSettings;

  return { etatActuel: safeEtatActuel, controles: safeControles, historique, userSettings: safeUserSettings, loading, user };
}

export function updateControles(path: string, value: any) {
  const controlesRef = ref(db, "controles");
  const updates: Record<string, any> = {};
  updates[path] = value;
  update(controlesRef, updates);
}

export function updateSettings(path: string, value: any) {
  const settingsRef = ref(db, "user_settings");
  const updates: Record<string, any> = {};
  updates[path] = value;
  update(settingsRef, updates);
}
