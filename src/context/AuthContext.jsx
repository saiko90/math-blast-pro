import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // <-- NOUVEAU : On stocke le profil (XP, Niveau)
  const [loading, setLoading] = useState(true);

  // Fonction pour charger le profil détaillé depuis la table 'profiles'
  const getProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.warn("Profil non trouvé (création en cours par le trigger...)", error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error("Erreur fetch profile:", error);
    }
  };

  useEffect(() => {
    // 1. Vérifier la session au démarrage
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) getProfile(session.user.id); // <-- On charge le profil
      setLoading(false);
    });

    // 2. Écouter les changements
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getProfile(session.user.id);
      } else {
        setProfile(null); // Si déconnecté, on vide le profil
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    signUp: (data) => supabase.auth.signUp(data),
    signIn: (data) => supabase.auth.signInWithPassword(data),
    signOut: () => supabase.auth.signOut(),
    user,     // Les infos techniques (Email, ID)
    profile,  // Les infos de jeu (XP, Niveau, Avatar)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}