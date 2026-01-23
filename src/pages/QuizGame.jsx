import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowRight, Home, Brain, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';


export default function QuizGame() {
  const { category, difficulty } = useParams();
  const navigate = useNavigate();
  
  // États
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- CHARGEMENT DES DONNÉES (SUPABASE) ---
  useEffect(() => {
    fetchQuestions();
  }, [category]);

  async function fetchQuestions() {
  setLoading(true);
  let query = supabase.from('questions').select('*');

  // Filtre Catégorie
  if (category !== 'mix') {
    query = query.eq('category', category);
  }

  // Filtre Difficulté (IMPORTANT)
  // On cherche les questions du niveau demandé (et les niveaux inférieurs pour varier un peu si tu veux, mais restons stricts pour l'instant)
  query = query.eq('difficulty', difficulty);

  const { data, error } = await query;

    if (error) {
      console.error("Erreur Supabase:", error);
      alert("Impossible de charger les questions ! Vérifie ta connexion.");
    } else {
      // Mélange les questions reçues
      const shuffled = data.sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
    }
    setLoading(false);
  }
  // ------------------------------------------

  const currentQ = questions[currentQIndex];

  const handleAnswer = (index) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedOption(index);
    // Dans la DB, j'ai appelé la colonne 'correct_index'
    if (index === currentQ.correct_index) setScore(score + 1);
  };

  const nextQuestion = () => {
    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex(currentQIndex + 1);
      setIsAnswered(false);
      setSelectedOption(null);
    } else {
      setGameFinished(true);
    }
  };

  // --- RENDU : CHARGEMENT ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="text-xl">Téléchargement du cerveau d'Albert...</p>
      </div>
    );
  }

  // --- RENDU : PAS DE QUESTIONS ---
  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white text-center p-4">
        <h2 className="text-3xl font-bold mb-4">Oups !</h2>
        <p className="mb-6">Aucune question trouvée pour la catégorie : {category}.</p>
        <button onClick={() => navigate('/categories')} className="bg-white text-purple-600 px-6 py-2 rounded-full font-bold">Retour</button>
      </div>
    );
  }

  // --- RENDU : ÉCRAN DE FIN ---
  if (gameFinished) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-pop text-center">
        <h1 className="text-6xl mb-4">🎉</h1>
        <h2 className="text-4xl font-bold text-white mb-2">Terminé !</h2>
        <p className="text-xl text-white/80 mb-8">Ton score : {score} / {questions.length}</p>
        <button onClick={() => navigate('/modes/quiz')} className="bg-white text-purple-600 px-8 py-3 rounded-full font-bold text-lg hover:scale-105 transition-transform">
          Rejouer
        </button>
      </div>
    );
  }

  // --- RENDU : JEU ---
  return (
    <div className="min-h-screen p-4 flex flex-col items-center max-w-2xl mx-auto">
      {/* Barre de progression */}
      <div className="w-full bg-black/20 h-2 rounded-full mb-6 overflow-hidden">
        <div 
          className="h-full bg-white transition-all duration-500 ease-out"
          style={{ width: `${((currentQIndex) / questions.length) * 100}%` }}
        />
      </div>

      {/* Carte Question */}
      <div className="bg-white rounded-3xl p-8 shadow-2xl w-full animate-slide-up relative">
        <button onClick={() => navigate('/modes/quiz')} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><Home size={20}/></button>
        
        {/* Supabase appelle la colonne 'question_text' */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{currentQ.question_text}</h2>

            {/* Si une formule LaTeX existe, on l'affiche en gros et beau */}
            {currentQ.question_latex && (
            <div className="text-3xl text-center py-6 text-indigo-600 font-serif mb-6 bg-indigo-50 rounded-xl">
                <Latex>{`$${currentQ.question_latex}$`}</Latex>
            </div>
            )}

        <div className="space-y-3">
          {currentQ.options.map((opt, idx) => {
            let btnClass = "w-full p-4 rounded-xl text-left font-semibold border-2 transition-all ";
            
            if (!isAnswered) {
              btnClass += "border-gray-100 hover:border-blue-400 hover:bg-blue-50 text-gray-700";
            } else {
              if (idx === currentQ.correct_index) btnClass += "border-green-500 bg-green-100 text-green-800";
              else if (idx === selectedOption) btnClass += "border-red-500 bg-red-100 text-red-800";
              else btnClass += "border-gray-100 text-gray-400 opacity-50";
            }

            return (
              <button 
                key={idx} 
                onClick={() => handleAnswer(idx)}
                className={btnClass}
                disabled={isAnswered}
              >
                <div className="flex justify-between items-center">
                  {opt}
                  {isAnswered && idx === currentQ.correct_index && <CheckCircle className="text-green-600" size={20}/>}
                  {isAnswered && idx === selectedOption && idx !== currentQ.correct_index && <XCircle className="text-red-600" size={20}/>}
                </div>
              </button>
            );
          })}
        </div>

        {/* EXPLICATION IA */}
        {isAnswered && (
          <div className="mt-6 animate-pop">
            <div className="bg-blue-50 p-4 rounded-xl border-l-4 border-blue-500 mb-4">
              <h3 className="font-bold text-blue-800 flex items-center gap-2 mb-1">
                <Brain size={18}/> Explication de l'IA
              </h3>
              <p className="text-blue-900 leading-relaxed">{currentQ.rationale}</p>
            </div>
            
            <button 
              onClick={nextQuestion}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition-colors flex items-center justify-center gap-2"
            >
              Question Suivante <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}