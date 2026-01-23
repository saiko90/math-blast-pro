import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCw, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import 'katex/dist/katex.min.css'; // Import du style Math
import Latex from 'react-latex-next'; // Import du moteur Math

export default function FlashcardGame() {
  const { category, difficulty } = useParams();
  const navigate = useNavigate();
  
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  // Charger depuis Supabase
  useEffect(() => {
    async function fetchCards() {
      setLoading(true);
      
      let query = supabase.from('flashcards').select('*');

      // 1. Filtre Catégorie (sauf si c'est 'mix')
      if (category !== 'mix') {
        query = query.eq('category', category);
      }

      // 2. Filtre Difficulté (IMPORTANT)
      // On s'assure que difficulty existe, sinon par défaut niveau 1
      const level = difficulty || 1;
      query = query.eq('difficulty', level);

      const { data, error } = await query;
      
      if (error) {
        console.error("Erreur chargement cartes:", error);
      } else if (data) {
        // Mélanger les cartes
        setCards(data.sort(() => Math.random() - 0.5));
      }
      setLoading(false);
    }
    fetchCards();
  }, [category, difficulty]);

  // Actions
  const handleNext = () => {
    setIsFlipped(false); 
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % cards.length); 
    }, 300);
  };

  const handleFlip = () => setIsFlipped(!isFlipped);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white"><Loader2 className="animate-spin" size={40}/></div>;
  
  if (cards.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white text-center">
      <h2 className="text-2xl font-bold mb-4">Vide ! 🏜️</h2>
      <p>Aucune fiche trouvée pour cette catégorie au niveau {difficulty}.</p>
      <button onClick={() => navigate('/modes/theory')} className="mt-4 bg-white/20 px-6 py-2 rounded-full">Retour</button>
    </div>
  );

  const currentCard = cards[index];

  return (
    <div className="min-h-screen p-6 flex flex-col items-center animate-pop">
      {/* Header */}
      <div className="w-full max-w-md flex justify-between items-center mb-10">
        <button onClick={() => navigate('/modes/theory')} className="text-white/70 hover:text-white flex items-center gap-2">
          <ArrowLeft size={20}/> Retour
        </button>
        <span className="text-white font-bold bg-white/20 px-4 py-1 rounded-full">
          Carte {index + 1} / {cards.length}
        </span>
      </div>

      {/* LA CARTE (SCÈNE 3D) */}
      <div 
        className="relative w-full max-w-md h-80 cursor-pointer perspective-1000 group"
        onClick={handleFlip}
      >
        <div className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* RECTO (Face Avant - Question) */}
          <div className="absolute w-full h-full backface-hidden bg-white rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 text-center border-b-8 border-blue-500">
            <span className="text-sm text-gray-400 uppercase tracking-widest mb-4">Question</span>
            <h2 className="text-2xl font-bold text-gray-800">
                {/* On enveloppe dans Latex pour afficher les formules si besoin */}
                <Latex>{currentCard.front}</Latex>
            </h2>
            <p className="absolute bottom-6 text-gray-400 text-sm flex items-center gap-2">
              <RotateCw size={14}/> Clique pour retourner
            </p>
          </div>

          {/* VERSO (Face Arrière - Réponse) */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 text-center border-b-8 border-blue-800">
            <span className="text-sm text-blue-200 uppercase tracking-widest mb-4">Réponse</span>
            <h2 className="text-3xl font-bold text-white">
                <Latex>{currentCard.back}</Latex>
            </h2>
          </div>

        </div>
      </div>

      {/* Bouton Suivant */}
      <button 
        onClick={handleNext}
        className="mt-12 bg-white/10 hover:bg-white/20 text-white border border-white/30 px-10 py-4 rounded-2xl font-bold text-xl transition-all hover:scale-105 active:scale-95"
      >
        Carte Suivante →
      </button>

    </div>
  );
}