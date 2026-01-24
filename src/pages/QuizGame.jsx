import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowRight, Home, Brain, Loader2, Trophy } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext'; // <-- IMPORTANT: On a besoin de l'utilisateur
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

export default function QuizGame() {
  const { category, difficulty } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // On récupère l'info "QUI joue ?"
  
  // États
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // État de sauvegarde
  
  // État pour le mélange
  const [shuffledOptions, setShuffledOptions] = useState([]);

  // --- 1. CHARGEMENT DES DONNÉES ---
  useEffect(() => {
    fetchQuestions();
  }, [category, difficulty]);

  async function fetchQuestions() {
    setLoading(true);
    let query = supabase.from('questions').select('*');

    if (category !== 'mix') {
      query = query.eq('category', category);
    }

    const level = difficulty || 1;
    query = query.eq('difficulty', level);

    const { data, error } = await query;

    if (error) {
      console.error("Erreur Supabase:", error);
    } else if (data) {
      const shuffled = data.sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
    }
    setLoading(false);
  }

  const currentQ = questions[currentQIndex];

  // --- 2. MÉLANGE DES RÉPONSES ---
  useEffect(() => {
    if (currentQ) {
      const optionsWithIndices = currentQ.options.map((opt, index) => ({
        text: opt,
        originalIndex: index
      }));
      setShuffledOptions(optionsWithIndices.sort(() => Math.random() - 0.5));
    }
  }, [currentQ]);


  // --- 3. GESTION DU JEU ---
  const handleAnswer = (realIndex) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedOption(realIndex);
    
    if (realIndex === currentQ.correct_index) setScore(prev => prev + 1);
  };

  const nextQuestion = () => {
    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex(prev => prev + 1);
      setIsAnswered(false);
      setSelectedOption(null);
    } else {
      finishGame(); // <-- ON LANCE LA SAUVEGARDE ICI
    }
  };

  // --- 4. SAUVEGARDE DU SCORE (La partie qui manquait !) ---
  const finishGame = async () => {
    setGameFinished(true);
    if (!user) return; // Si pas connecté, on ne sauvegarde pas

    setSaving(true);
    
    // Calcul XP : 10 pts par question juste * (1 + difficulté/10)
    // Ex: Niveau 1 = x1.1, Niveau 5 = x1.5
    const multiplier = 1 + (parseInt(difficulty || 1) * 0.1);
    const xpEarned = Math.round(score * 10 * multiplier);

    try {
        const { error } = await supabase.from('scores').insert({
            user_id: user.id,
            category: category,
            difficulty: parseInt(difficulty || 1),
            score: score,
            total_questions: questions.length,
            xp_earned: xpEarned
        });

        if (error) {
            console.error("Erreur sauvegarde :", error);
        } else {
            console.log("Score sauvegardé !");
        }
    } catch (err) {
        console.error("Crash sauvegarde :", err);
        alert("Erreur de sauvegarde : " + err.message); 
    } finally {
        setSaving(false);
    }
  };

  // --- RENDU : LOADING ---
  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-white relative z-10">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="text-xl">Téléchargement du cerveau d'Albert...</p>
      </div>
    );
  }

  // --- RENDU : PAS DE QUESTIONS ---
  if (questions.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-white text-center p-4 relative z-10">
        <h2 className="text-3xl font-bold mb-4">Oups !</h2>
        <p className="mb-6">Aucune question trouvée pour la catégorie : {category} (Niveau {difficulty}).</p>
        <button onClick={() => navigate('/modes/quiz')} className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full font-bold transition-colors">
            Retour Menu
        </button>
      </div>
    );
  }

  // --- RENDU : FIN (GAME OVER) ---
  if (gameFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const xpEarned = Math.round(score * 10 * (1 + (parseInt(difficulty || 1) * 0.1)));

    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 animate-pop text-center relative z-10">
        
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-3xl shadow-2xl max-w-md w-full animate-slide-up">
            <Trophy className="text-yellow-400 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" size={80} />
            
            <h2 className="text-4xl font-black text-white mb-2 tracking-tight">MISSION ACCOMPLIE</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-8 mt-6">
                <div className="bg-black/30 p-4 rounded-2xl border border-white/10">
                    <p className="text-gray-400 text-xs font-bold uppercase">Score</p>
                    <p className="text-3xl font-bold text-white">{score} <span className="text-lg text-gray-500">/ {questions.length}</span></p>
                </div>
                <div className="bg-black/30 p-4 rounded-2xl border border-white/10">
                    <p className="text-gray-400 text-xs font-bold uppercase">XP Gagné</p>
                    <p className="text-3xl font-bold text-yellow-400">+{xpEarned}</p>
                </div>
            </div>

            <div className="w-full bg-gray-700 h-3 rounded-full mb-8 overflow-hidden border border-white/10">
                <div className={`h-full ${percentage >= 50 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} style={{ width: `${percentage}%` }} />
            </div>

            {saving ? (
                <div className="flex justify-center items-center gap-2 text-white/50 mb-4">
                    <Loader2 className="animate-spin" size={20}/> Sauvegarde en cours...
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    <button onClick={() => navigate('/modes/quiz')} className="w-full bg-white text-indigo-900 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg">
                        Nouveau Défi
                    </button>
                    <button onClick={() => navigate('/profile')} className="w-full bg-white/10 text-white py-3 rounded-xl font-bold hover:bg-white/20 transition-colors border border-white/10">
                        Voir mon Profil
                    </button>
                </div>
            )}
        </div>
      </div>
    );
  }

  // --- RENDU : JEU EN COURS ---
  return (
    <div className="min-h-[80vh] p-4 flex flex-col items-center max-w-2xl mx-auto relative z-10">
      
      <div className="w-full bg-white/10 h-2 rounded-full mb-6 overflow-hidden border border-white/10">
        <div 
          className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all duration-500 ease-out"
          style={{ width: `${((currentQIndex) / questions.length) * 100}%` }}
        />
      </div>

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl w-full animate-slide-up relative">
        <button onClick={() => navigate('/modes/quiz')} className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors">
            <Home size={20}/>
        </button>
        
        <h2 className="text-2xl font-bold text-white mb-4">{currentQ.question_text}</h2>

        {currentQ.question_latex && (
        <div className="text-3xl text-center py-6 text-cyan-300 font-serif mb-6 bg-black/20 border border-white/5 rounded-xl overflow-x-auto shadow-inner">
            <Latex>{`$${currentQ.question_latex}$`}</Latex>
        </div>
        )}

        <div className="space-y-3">
          {shuffledOptions.map((optObj, idx) => {
            const realIndex = optObj.originalIndex;
            let btnClass = "w-full p-4 rounded-xl text-left font-semibold border-2 transition-all ";
            
            if (!isAnswered) {
              btnClass += "border-white/10 bg-white/5 text-gray-200 hover:border-cyan-400 hover:bg-cyan-400/10 hover:text-white hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]";
            } else {
              if (realIndex === currentQ.correct_index) btnClass += "border-green-500 bg-green-500/20 text-green-200 shadow-[0_0_15px_rgba(34,197,94,0.3)]";
              else if (realIndex === selectedOption) btnClass += "border-red-500 bg-red-500/20 text-red-200";
              else btnClass += "border-transparent text-gray-500 opacity-50";
            }

            return (
              <button key={idx} onClick={() => handleAnswer(realIndex)} className={btnClass} disabled={isAnswered}>
                <div className="flex justify-between items-center">
                  <span className="w-full">
                      <Latex>{optObj.text}</Latex>
                  </span>
                  {isAnswered && realIndex === currentQ.correct_index && <CheckCircle className="text-green-400 flex-shrink-0" size={20}/>}
                  {isAnswered && realIndex === selectedOption && realIndex !== currentQ.correct_index && <XCircle className="text-red-400 flex-shrink-0" size={20}/>}
                </div>
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="mt-6 animate-pop">
            <div className="bg-blue-500/10 p-4 rounded-xl border-l-4 border-blue-400 mb-4 backdrop-blur-sm">
              <h3 className="font-bold text-blue-300 flex items-center gap-2 mb-1">
                <Brain size={18}/> Explication de l'IA
              </h3>
              <p className="text-blue-100 leading-relaxed text-sm"><Latex>{currentQ.rationale}</Latex></p>
            </div>
            
            <button onClick={nextQuestion} className="w-full bg-white text-indigo-900 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow-lg">
              Suivant <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}