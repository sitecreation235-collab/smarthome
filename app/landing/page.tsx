"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap, Lightbulb, Thermometer, Wind, TrendingUp, ArrowRight, Lock, Unlock, Mail, User, Eye, EyeOff } from "lucide-react";
import { useFirebaseData } from "@/lib/hooks";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, db } from "@/lib/firebase";

// Liste des astuces d'économie d'énergie
const ENERGY_TIPS = [
  { icon: Thermometer, title: "Thermostat", text: "Baissez votre thermostat de 1°C pour économiser jusqu'à 10% d'énergie !" },
  { icon: Lightbulb, title: "Éclairage", text: "Remplacez vos ampoules incandescentes par des LED pour 80% d'économie." },
  { icon: Wind, title: "Éteignez !", text: "Éteignez les appareils en veille, ils consomment de l'énergie pour rien !" },
  { icon: TrendingUp, title: "Optimisation", text: "Utilisez votre lave-linge et lave-vaisselle en mode économique." },
];

export default function LandingPage() {
  const router = useRouter();
  const { user } = useFirebaseData();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Rediriger si l'utilisateur est déjà connecté
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  // Gérer la connexion/inscription
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isLogin) {
        console.log("Logging in...");
        await signInWithEmailAndPassword(auth, email, password);
        console.log("Logged in successfully!");
      } else {
        console.log("Creating user...");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("User created:", user.uid, user.email);
        console.log("Saving user to Firebase Realtime Database...");
        // Save user data to Realtime Database
        await set(ref(db, `users/${user.uid}`), {
          email: user.email,
          createdAt: Date.now()
        });
        console.log("User saved to database successfully!");
      }
      router.push("/");
    } catch (err: any) {
      console.error("Erreur d'authentification Firebase :", err.code, err.message);
      
      if (err.code === "auth/invalid-credential") {
        setError("Email ou mot de passe incorrect");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Cet email est déjà utilisé");
      } else if (err.code === "auth/weak-password") {
        setError("Mot de passe trop faible (6 caractères minimum)");
      } else if (err.code === "auth/invalid-email") {
        setError("Format d'email invalide");
      } else if (err.code === "auth/operation-not-allowed") {
        setError("L'authentification par email/mot de passe n'est pas activée dans Firebase");
      } else {
        setError(`Erreur (${err.code}): ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Veuillez entrer votre email d'abord");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setError("Email de réinitialisation envoyé ! Vérifiez votre boîte mail");
    } catch (err: any) {
      console.error("Erreur mot de passe oublié :", err.code, err.message);
      setError(`Erreur (${err.code}): ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white overflow-hidden">
      {/* Arrière-plan avec éléments flottants 3D */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float-delay"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl shadow-lg shadow-blue-500/30">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Smart Energy</h1>
              <p className="text-sm text-slate-400">Gestion intelligente de l'énergie</p>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Colonne gauche : Contenu principal avec astuces */}
          <div className="space-y-8">
            <div>
              <h2 className="text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Maîtrisez
                </span>
                <br />votre consommation d'énergie
              </h2>
              <p className="text-xl text-slate-300">
                Suivez, optimisez et économisez avec notre système de gestion intelligente de l'énergie.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ENERGY_TIPS.map((tip, index) => (
                <div
                  key={index}
                  className="p-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                >
                  <tip.icon className="w-10 h-10 text-blue-400 mb-3" />
                  <h3 className="font-semibold text-lg mb-2">{tip.title}</h3>
                  <p className="text-sm text-slate-400">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Colonne droite : Formulaire de connexion/inscription */}
          <div className="flex justify-center">
            <div className="w-full max-w-md p-8 bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl">
              <div className="flex items-center justify-center mb-8">
                <div className={`p-3 rounded-2xl ${isLogin ? "bg-blue-500/20" : "bg-purple-500/20"}`}>
                  {isLogin ? <Unlock className="w-8 h-8 text-blue-400" /> : <Lock className="w-8 h-8 text-purple-400" />}
                </div>
              </div>

              <h3 className="text-2xl font-bold text-center mb-6">
                {isLogin ? "Connexion" : "Créer un compte"}
              </h3>

              <form onSubmit={handleAuth} className="space-y-5">
                {error && (
                  <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 transition-all text-white placeholder-slate-500"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-12 pr-12 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 transition-all text-white placeholder-slate-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {isLogin && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Mot de passe oublié ?
                  </button>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Chargement...</span>
                    </div>
                  ) : (
                    isLogin ? "Se connecter" : "Créer un compte"
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-slate-400">
                  {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                  >
                    {isLogin ? "Créer un compte" : "Se connecter"}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles pour les animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delay {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delay { animation: float-delay 8s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
