import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calculator, Ruler, Brain, Zap, GraduationCap, GripHorizontal } from 'lucide-react';

export default function QuizCategories() {
  const navigate = useNavigate();
  const { mode } = useParams();
  const isQuiz = mode === 'quiz';
  
  const [difficulty, setDifficulty] = useState(1);

  const categories = [
    { id: 'algebra', name: 'Algèbre', icon: <Calculator size={32} />, color: 'from-blue-500 to-cyan-400', desc: 'Équations & Inconnues' },
    { id: 'analysis', name: 'Analyse', icon: <GraduationCap size={32} />, color: 'from-emerald-500 to-teal-400', desc: 'Limites & Intégrales' },
    { id: 'geometry', name: 'Géométrie', icon: <Ruler size={32} />, color: 'from-pink-500 to-rose-400', desc: 'Espace & Formes' },
    { id: 'logic', name: 'Logique', icon: <Brain size={32} />, color: 'from-purple-500 to-indigo-400', desc: 'Binaire & Raisonnement' },
    ...(isQuiz ? [{ id: 'mix', name: 'Mix Total', icon: <Zap size={32} />, color: 'from-orange-500 to-red-400', desc: 'Le Défi Ultime' }] : []),
  ];

  const handleClick = (catId) => {
    navigate(isQuiz ? `/play/${catId}/${difficulty}` : `/theory/${catId}/${difficulty}`);
  };

  const difficultyLabels = {
    1: { text: "Débutant", sub: "Collège / Cycle", color: "text-green-400", bg: "bg-green-400/20 border-green-500/50" },
    2: { text: "Intermédiaire", sub: "Lycée / Gymnase", color: "text-blue-400", bg: "bg-blue-400/20 border-blue-500/50" },
    3: { text: "Avancé", sub: "HES / Bachelor", color: "text-yellow-400", bg: "bg-yellow-400/20 border-yellow-500/50" },
    4: { text: "Expert", sub: "Ingénieur / Master", color: "text-orange-400", bg: "bg-orange-400/20 border-orange-500/50" },
    5: { text: "God Mode", sub: "Doctorat / Recherche", color: "text-red-500", bg: "bg-red-500/20 border-red-500/50" }
  };

  return (
    <div className="min-h-[80vh] p-6 flex flex-col items-center animate-pop relative z-10">
      
      {/* Header */}
      <div className="w-full max-w-3xl flex items-center mb-8">
        <button onClick={() => navigate('/')} className="bg-white/10 p-2 rounded-full hover:bg-white/20 text-white transition-colors border border-white/10">
          <ArrowLeft />
        </button>
        <div className="ml-4 text-white">
          <h1 className="text-3xl font-bold drop-shadow-md">
            {isQuiz ? 'Zone de Combat' : 'Zone de Révision'}
          </h1>
        </div>
      </div>

      {/* SÉLECTEUR DE NIVEAU (DARK MODE) */}
      <div className="w-full max-w-3xl bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-2xl mb-10 border border-white/10 relative overflow-hidden">
        <div className="flex justify-between items-end mb-6">
            <div>
                <h3 className="text-gray-400 font-bold uppercase text-xs tracking-wider mb-2">Niveau de difficulté</h3>
                <div className={`inline-block px-4 py-1 rounded-full border font-bold ${difficultyLabels[difficulty].bg} ${difficultyLabels[difficulty].color} transition-colors`}>
                    {difficultyLabels[difficulty].text}
                </div>
            </div>
            <div className="text-right">
                <span className="text-sm text-gray-400 font-medium">{difficultyLabels[difficulty].sub}</span>
            </div>
        </div>

        <div className="relative h-12 flex items-center justify-center">
            <div className="absolute w-full flex justify-between px-2 text-white/20 font-bold text-sm pointer-events-none select-none z-0">
                <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
            </div>
            <input 
              type="range" min="1" max="5" step="1" 
              value={difficulty} 
              onChange={(e) => setDifficulty(parseInt(e.target.value))}
              className="relative z-10 w-full h-3 bg-white/10 rounded-full appearance-none cursor-grab active:cursor-grabbing accent-indigo-500"
            />
        </div>
        
        <div className="text-center mt-2 text-white/30 text-xs flex items-center justify-center gap-2 animate-pulse">
            <GripHorizontal size={16}/> Ajuster le niveau
        </div>
      </div>

      {/* Grille des Matières */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleClick(cat.id)}
            className="group relative bg-white/5 hover:bg-white/10 backdrop-blur-md p-5 rounded-2xl shadow-lg transition-all hover:-translate-y-1 text-left overflow-hidden border border-white/10"
          >
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${cat.color} opacity-10 rounded-bl-full transition-transform group-hover:scale-110`} />
            <div className="flex items-center gap-4">
              <div className={`text-white p-3 rounded-xl bg-gradient-to-br ${cat.color} shadow-lg shadow-black/20`}>
                {cat.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">{cat.name}</h3>
                <p className="text-gray-400 text-sm font-medium">{cat.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}