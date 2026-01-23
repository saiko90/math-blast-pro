import { useNavigate } from 'react-router-dom';
import { Rocket, BookOpen, Brain } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-4 animate-pop">
      <h1 className="text-5xl font-extrabold text-white mb-2 drop-shadow-lg animate-float">
        MATH⚡BLAST
      </h1>
      <p className="text-white/80 text-lg mb-10">Les Maths 2.0</p>

      <div className="w-full max-w-md bg-white/95 backdrop-blur rounded-3xl p-8 shadow-2xl animate-slide-up">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Choisis ton mode</h2>
        
        <button 
          onClick={() => navigate('/modes/quiz')}
          className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xl py-4 rounded-2xl shadow-lg mb-4 hover:scale-105 transition-transform flex items-center justify-center gap-3"
        >
          <Rocket size={28} />
          MODE QUIZ
        </button>

        <button 
          onClick={() => navigate('/modes/theory')}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-xl py-4 rounded-2xl shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-3"
        >
          <BookOpen size={28} /> 
          THÉORIE
        </button>
      </div>
      
      <button className="mt-8 flex items-center gap-2 text-white/80 hover:text-white border border-white/30 px-4 py-2 rounded-full transition-colors">
        <Brain size={18} />
        Albert IA connecté
      </button>
    </div>
  );
}