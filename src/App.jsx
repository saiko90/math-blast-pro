import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import QuizCategories from './pages/QuizCategories';
import QuizGame from './pages/QuizGame'; 
import FlashcardGame from './pages/FlashcardGame'; 



function App() {
  return (
    <BrowserRouter>
      <div className="container mx-auto px-4">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Nouvelle route intelligente qui capture le mode (quiz ou theory) */}
          <Route path="/modes/:mode" element={<QuizCategories />} />

          <Route path="/play/:category:difficulty" element={<QuizGame />} />
          <Route path="/theory/:category:dificulty" element={<FlashcardGame />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
export default App;