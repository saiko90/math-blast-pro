import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { ArrowLeft, User, Shield, Zap, Lock, LogOut, Loader2, BarChart3 } from 'lucide-react';

export default function Profile() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  
  // États pour les stats
  const [stats, setStats] = useState({
    algebra: 0,
    geometry: 0,
    analysis: 0,
    logic: 0
  });

  // Chargement des Stats réelles
  useEffect(() => {
    async function fetchStats() {
      if (!user) return;

      // On récupère tous les scores de l'utilisateur
      const { data } = await supabase
        .from('scores')
        .select('category, score, total_questions')
        .eq('user_id', user.id);

      if (data && data.length > 0) {
        // Calcul des moyennes par catégorie
        const newStats = { algebra: 0, geometry: 0, analysis: 0, logic: 0 };
        const counts = { algebra: 0, geometry: 0, analysis: 0, logic: 0 };

        data.forEach(game => {
          if (newStats[game.category] !== undefined) {
            // On calcule le pourcentage de cette partie
            const percent = (game.score / game.total_questions) * 100;
            newStats[game.category] += percent;
            counts[game.category]++;
          }
        });

        // On fait la moyenne
        Object.keys(newStats).forEach(key => {
          if (counts[key] > 0) {
            newStats[key] = Math.round(newStats[key] / counts[key]);
          }
        });

        setStats(newStats);
      }
    }
    fetchStats();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMsg({ type: 'success', text: 'Mot de passe mis à jour !' });
      setNewPassword('');
    } catch (error) {
      setMsg({ type: 'error', text: error.message });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen p-6 animate-pop pb-20 relative z-10">
      <button onClick={() => navigate('/')} className="text-white/50 hover:text-white flex items-center gap-2 mb-8 transition-colors">
        <ArrowLeft size={20}/> Retour Accueil
      </button>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* COLONNE 1 : ID CARD */}
        <div className="md:col-span-1">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl text-center relative overflow-hidden">
            <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-2xl font-bold text-xs text-white ${profile?.is_pro ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-white/10'}`}>
              {profile?.is_pro ? 'PRO MEMBER' : 'FREE PLAN'}
            </div>

            <div className="flex justify-center mb-4 mt-2">
               {profile?.avatar_url ? (
                  // CORRECTION BUG IMAGE : referrerPolicy="no-referrer"
                  <img 
                    src={profile.avatar_url} 
                    alt="Avatar" 
                    referrerPolicy="no-referrer"
                    className="w-24 h-24 rounded-full border-4 border-white/10 shadow-lg object-cover" 
                  />
               ) : (
                  <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center text-white/50">
                    <User size={40} />
                  </div>
               )}
            </div>
            
            <h2 className="text-2xl font-bold text-white">{profile?.username || "Pilote"}</h2>
            <p className="text-white/40 text-sm mb-6">{user?.email}</p>

            <div className="grid grid-cols-2 gap-2 text-left bg-black/20 p-4 rounded-xl mb-6 border border-white/5">
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">Niveau</p>
                <p className="text-xl font-bold text-cyan-400">{profile?.level || 1}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">XP Total</p>
                <p className="text-xl font-bold text-purple-400">{profile?.xp || 0}</p>
              </div>
            </div>

            {!profile?.is_pro && (
              <button className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold py-2 rounded-xl shadow-lg hover:scale-105 transition-transform mb-4 flex items-center justify-center gap-2">
                <Zap size={18} /> Passer PRO
              </button>
            )}

            <button onClick={handleLogout} className="w-full border border-red-500/30 text-red-400 font-bold py-2 rounded-xl hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2">
              <LogOut size={18} /> Déconnexion
            </button>
          </div>
        </div>

        {/* COLONNE 2 & 3 : DETAILS */}
        <div className="md:col-span-2 space-y-6">
          
          {/* STATISTIQUES (CONNECTÉES À LA DB !) */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="text-yellow-400"/> Performances Moyennes
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {/* Carte Algèbre */}
               <div className="bg-black/20 p-4 rounded-2xl text-center border border-white/5 hover:border-blue-400/50 transition-colors">
                  <p className="text-sm text-gray-400 font-bold mb-1">Algèbre</p>
                  <div className={`text-2xl font-bold ${stats.algebra > 0 ? 'text-blue-400' : 'text-gray-600'}`}>
                    {stats.algebra}%
                  </div>
               </div>

               {/* Carte Géométrie */}
               <div className="bg-black/20 p-4 rounded-2xl text-center border border-white/5 hover:border-pink-400/50 transition-colors">
                  <p className="text-sm text-gray-400 font-bold mb-1">Géométrie</p>
                  <div className={`text-2xl font-bold ${stats.geometry > 0 ? 'text-pink-400' : 'text-gray-600'}`}>
                    {stats.geometry}%
                  </div>
               </div>

               {/* Carte Analyse */}
               <div className="bg-black/20 p-4 rounded-2xl text-center border border-white/5 hover:border-emerald-400/50 transition-colors">
                  <p className="text-sm text-gray-400 font-bold mb-1">Analyse</p>
                  <div className={`text-2xl font-bold ${stats.analysis > 0 ? 'text-emerald-400' : 'text-gray-600'}`}>
                    {stats.analysis}%
                  </div>
               </div>

               {/* Carte Logique */}
               <div className="bg-black/20 p-4 rounded-2xl text-center border border-white/5 hover:border-purple-400/50 transition-colors">
                  <p className="text-sm text-gray-400 font-bold mb-1">Logique</p>
                  <div className={`text-2xl font-bold ${stats.logic > 0 ? 'text-purple-400' : 'text-gray-600'}`}>
                    {stats.logic}%
                  </div>
               </div>
            </div>
          </div>

          {/* SÉCURITÉ */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="text-cyan-400"/> Sécurité
            </h3>

            {msg.text && (
              <div className={`p-4 mb-4 rounded-xl border ${msg.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-400 mb-1">Nouveau mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-black/20 pl-10 pr-4 py-2.5 rounded-xl border border-white/10 text-white focus:border-cyan-400 focus:bg-black/40 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="bg-white/10 hover:bg-white/20 text-white border border-white/10 font-bold px-6 py-2.5 rounded-xl transition-all">
                {loading ? <Loader2 className="animate-spin"/> : 'Modifier'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}