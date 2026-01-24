import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // 1. On attend que Supabase vérifie si on est connecté
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-indigo-900">
        <Loader2 className="animate-spin text-white" size={40} />
      </div>
    );
  }

  // 2. Si pas d'utilisateur, on éjecte vers le Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Sinon, on laisse entrer (on affiche la page demandée)
  return children;
}