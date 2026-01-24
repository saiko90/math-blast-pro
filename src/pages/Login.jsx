import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { ArrowLeft, Mail, Lock, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';

// Sound Effect
const playClickSound = () => {
  const audio = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU"); 
  audio.volume = 0.2;
  // audio.play().catch(() => {});
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  // --- EFFET 3D TILT (Suit la souris sur la carte uniquement) ---
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPct = (e.clientX - rect.left) / width - 0.5;
    const mouseYPct = (e.clientY - rect.top) / height - 0.5;
    x.set(mouseXPct);
    y.set(mouseYPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // --- LOGIQUE AUTH ---
  const handleGoogleLogin = async () => {
    playClickSound();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    playClickSound();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Lien magique envoyé ! Vérifie ta boîte mail.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Container principal transparent pour laisser voir le BackgroundWrapper
    <div className="min-h-[80vh] flex items-center justify-center p-6 relative z-10">
      
      {/* BOUTON RETOUR FLOTTANT */}
      <motion.button 
        onClick={() => navigate('/')} 
        whileHover={{ scale: 1.1, x: -5 }}
        whileTap={{ scale: 0.95 }}
        className="absolute top-0 left-4 text-white/50 hover:text-white transition-colors z-50 flex items-center gap-2 font-medium"
      >
        <ArrowLeft size={20} /> Retour
      </motion.button>

      {/* ZONE DE CAPTURE SOURIS POUR L'EFFET 3D */}
      <div 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full max-w-md perspective-1000 py-10"
      >
        <motion.div 
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full"
        >
          <div className="relative bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl p-8 overflow-hidden transform-style-3d">
            
            {/* Reflet brillant sur la carte */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />

            {/* HEADER ANIMÉ */}
            <div className="text-center mb-8 relative z-10">
              <motion.div 
                key={isSignUp ? "signup" : "login"}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2 drop-shadow-lg">
                  {isSignUp ? 'Bienvenue à bord' : 'Retour au QG'}
                </h1>
                <p className="text-blue-200/60 font-medium">
                  {isSignUp ? 'Prêt à dépasser tes limites ?' : 'Tes neurones t\'attendaient.'}
                </p>
              </motion.div>
            </div>

            {/* ERREUR */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: "auto", opacity: 1 }} 
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-xl mb-6 text-sm text-center backdrop-blur-md"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* BOUTON GOOGLE */}
            <motion.button 
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 1)" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white text-gray-800 font-bold py-3.5 rounded-2xl hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all flex justify-center items-center gap-3 mb-6 group relative overflow-hidden"
            >
               <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12 group-hover:animate-shine" />
               
               <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
               </svg>
               {loading ? 'Connexion...' : 'Continuer avec Google'}
            </motion.button>

            <div className="relative flex py-2 items-center mb-6">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink mx-4 text-white/30 text-xs uppercase font-bold tracking-widest">Ou Classique</span>
                <div className="flex-grow border-t border-white/10"></div>
            </div>

            {/* FORMULAIRE EMAIL ANIMÉ */}
            <form onSubmit={handleEmailAuth} className="space-y-4 relative z-10">
              <div className="group">
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-indigo-300 transition-colors group-focus-within:text-cyan-400" size={20} />
                  <input 
                    type="email" 
                    required
                    className="w-full bg-black/20 pl-12 pr-4 py-3.5 rounded-2xl border border-white/10 text-white placeholder-white/30 focus:border-cyan-400/50 focus:bg-black/40 focus:ring-4 focus:ring-cyan-400/10 transition-all outline-none"
                    placeholder="ton.email@futur-genie.ch"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="group">
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-indigo-300 transition-colors group-focus-within:text-cyan-400" size={20} />
                  <input 
                    type="password" 
                    required
                    className="w-full bg-black/20 pl-12 pr-4 py-3.5 rounded-2xl border border-white/10 text-white placeholder-white/30 focus:border-cyan-400/50 focus:bg-black/40 focus:ring-4 focus:ring-cyan-400/10 transition-all outline-none"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {isSignUp && (
                   <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="flex items-center gap-2 text-xs text-blue-200/70 px-2"
                   >
                      <Sparkles size={12} className="text-yellow-400"/>
                      <span>Un mot de passe fort, c'est comme une bonne équation.</span>
                   </motion.div>
              )}

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3.5 rounded-2xl hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all flex justify-center items-center gap-2 mt-4"
              >
                {loading ? <Loader2 className="animate-spin"/> : (
                    <>
                      {isSignUp ? "Créer l'accès" : "Entrer dans la matrice"}
                      <ArrowRight size={18} />
                    </>
                )}
              </motion.button>
            </form>

            {/* TOGGLE LOGIN/SIGNUP */}
            <div className="mt-8 text-center">
              <button 
                onClick={() => { playClickSound(); setIsSignUp(!isSignUp); }}
                className="text-sm font-medium text-white/50 hover:text-white transition-colors group"
              >
                {isSignUp ? "Déjà un compte ?" : "Pas encore inscrit ?"}
                <span className="ml-2 text-cyan-400 font-bold group-hover:underline decoration-2 underline-offset-4">
                  {isSignUp ? "Connecte-toi" : "Rejoins-nous"}
                </span>
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}