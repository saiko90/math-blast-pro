import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calculator, Ruler, Brain, Zap, BookOpen, GraduationCap } from 'lucide-react';

export default function QuizCategories() {
  const navigate = useNavigate();
  const { mode } = useParams(); // 'quiz' ou 'theory'
  const isQuiz = mode === 'quiz';
  
  // État pour le niveau de difficulté (1 à 5)
  const [difficulty, setDifficulty] = useState(1);

  const categories = [
    { id: 'algebra', name: 'Algèbre', icon: <Calculator size={32} />, color: 'from-blue-500 to-cyan-400', desc: 'Équations & Inconnues' },
    { id: 'analysis', name: 'Analyse', icon: <GraduationCap size={32} />, color: 'from-emerald-500 to-teal-400', desc: 'Limites & Intégrales' },
    { id: 'geometry', name: 'Géométrie', icon: <Ruler size={32} />, color: 'from-pink-500 to-rose-400', desc: 'Espace & Formes' },
    { id: 'logic', name: 'Logique', icon: <Brain size={32} />, color: 'from-purple-500 to-indigo-400', desc: 'Binaire & Raisonnement' },
  ];

  const handleClick = (catId) => {
    // On envoie aussi la difficulté dans l'URL !
    // Ex: /play/algebra/3  (Algèbre niveau 3)
    if (isQuiz) {
      navigate(`/play/${catId}/${difficulty}`);
    } else {
      navigate(`/theory/${catId}/${difficulty}`);
    }
  };

  // Textes dynamiques selon le niveau
  const difficultyLabels = {
    1: { text: "Débutant (Collège)", color: "text-green-500" },
    2: { text: "Intermédiaire (Gymnase/Lycée)", color: "text-blue-500" },
    3: { text: "Avancé (Bachelor/HES)", color: "text-yellow-500" },
    4: { text: "Expert (Master/Ingénieur)", color: "text-orange-500" },
    5: { text: "God Mode (Doctorat/Recherche)", color: "text-red-600" }
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center animate-pop">
      
      {/* Header */}
      <div className="w-full max-w-3xl flex items-center mb-6">
        <button onClick={() => navigate('/')} className="bg-white/20 p-2 rounded-full hover:bg-white/30 text-white transition-colors">
          <ArrowLeft />
        </button>
        <div className="ml-4 text-white">
          <h1 className="text-3xl font-bold drop-shadow-md">
            {isQuiz ? 'Zone de Combat' : 'Zone de Révision'}
          </h1>
        </div>
      </div>

      {/* SÉLECTEUR DE NIVEAU (NOUVEAU !) */}
      <div className="w-full max-w-3xl bg-white/95 backdrop-blur rounded-3xl p-6 shadow-xl mb-8 animate-slide-up">
        <h3 className="text-gray-500 font-bold uppercase text-xs tracking-wider mb-4">Niveau de difficulté</h3>
        
        <input 
          type="range" 
          min="1" 
          max="5" 
          step="1" 
          value={difficulty} 
          onChange={(e) => setDifficulty(parseInt(e.target.value))}
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
        
        <div className="flex justify-between items-center mt-4">
          <span className="font-bold text-4xl text-gray-200">{difficulty}</span>
          <span className={`font-bold text-xl ${difficultyLabels[difficulty].color}`}>
            {difficultyLabels[difficulty].text}
          </span>
        </div>
      </div>

      {/* Grille des Matières */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleClick(cat.id)}
            className="group relative bg-white/95 hover:bg-white p-5 rounded-2xl shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl text-left overflow-hidden border border-white/50"
          >
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${cat.color} opacity-20 rounded-bl-full transition-transform group-hover:scale-110`} />
            <div className="flex items-center gap-4">
              <div className={`text-white p-3 rounded-xl bg-gradient-to-br ${cat.color} shadow-md`}>
                {cat.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{cat.name}</h3>
                <p className="text-gray-500 text-sm font-medium">{cat.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}