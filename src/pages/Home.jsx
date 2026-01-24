import { useNavigate } from 'react-router-dom';
import { Rocket, BookOpen, Brain, User, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  return (
    // Pas de background ici, juste le layout
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center p-4 animate-pop relative z-10">
      
      {/* --- ZONE UTILISATEUR (Haut Droite) --- */}
      <div className="absolute top-0 right-0 p-4">
        {user ? (
          <div 
            onClick={() => navigate('/profile')} 
            className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full text-white backdrop-blur-md border border-white/20 shadow-xl animate-slide-up cursor-pointer hover:bg-white/20 transition-colors"
          >
              {/* AVATAR */}
              {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full border-2 border-indigo-400" />
              ) : (
                  <div className="bg-indigo-600 rounded-full p-1.5">
                      <User size={16} className="text-white"/>
                  </div>
              )}

              {/* INFOS */}
              <div className="flex flex-col items-start text-left">
                  <span className="font-bold text-sm leading-none mb-1">
                      {profile?.username || user.email?.split('@')[0]}
                  </span>
                  {/* BARRE D'XP */}
                  <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">
                          NIV {profile?.level || 1}
                      </span>
                      <div className="w-16 h-1.5 bg-black/30 rounded-full overflow-hidden">
                          <div 
                              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500" 
                              style={{ width: `${(profile?.xp || 0) % 100}%` }} 
                          />
                      </div>
                  </div>
              </div>
          </div>
        ) : (
          <button 
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 bg-white text-indigo-900 font-bold px-5 py-2 rounded-full shadow-lg hover:scale-105 transition-transform border border-indigo-100"
          >
            <LogIn size={18} />
            Connexion
          </button>
        )}
      </div>

      {/* --- CONTENU PRINCIPAL --- */}
      <h1 className="text-6xl font-extrabold text-white mb-2 drop-shadow-lg animate-float">
        MATH⚡BLAST
      </h1>
      <p className="text-white/90 text-xl mb-12 font-medium">L'Excellence Suisse. Du Collège au Doctorat.</p>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl animate-slide-up border border-white/20">
        <h2 className="text-2xl font-bold mb-8 text-white">Choisis ta voie</h2>
        
        <button 
          onClick={() => navigate('/modes/quiz')} 
          className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-xl py-5 rounded-2xl shadow-lg mb-6 hover:scale-105 transition-transform flex items-center justify-center gap-4 active:scale-95 border border-white/20"
        >
          <Rocket size={32} />
          MODE QUIZ
        </button>

        <button 
          onClick={() => navigate('/modes/theory')} 
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xl py-5 rounded-2xl shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-4 active:scale-95 border border-white/20"
        >
          <BookOpen size={32} />
          THÉORIE
        </button>
      </div>
      
      <div className="mt-8 flex items-center gap-2 text-white/50 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm text-sm">
        <Brain size={16} />
        <span>v0.8 - Global Design System</span>
      </div>
    </div>
  );
}