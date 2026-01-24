import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import BackgroundWrapper from './components/BackgroundWrapper'; 

import AlbertChat from './components/AlbertChat';

import Home from './pages/Home';
import QuizCategories from './pages/QuizCategories';
import QuizGame from './pages/QuizGame';
import FlashcardGame from './pages/FlashcardGame';
import Login from './pages/Login';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* ON ENVELOPPE TOUT DANS LE BACKGROUND WRAPPER */}
        <BackgroundWrapper> 
          <div className="container mx-auto px-4 font-sans">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              
              <Route path="/profile" element={
                <ProtectedRoute><Profile /></ProtectedRoute>
              } />
              
              <Route path="/modes/:mode" element={
                <ProtectedRoute><QuizCategories /></ProtectedRoute>
              } />
              <Route path="/play/:category/:difficulty" element={
                <ProtectedRoute><QuizGame /></ProtectedRoute>
              } />
              <Route path="/theory/:category/:difficulty" element={
                <ProtectedRoute><FlashcardGame /></ProtectedRoute>
              } />
            </Routes>
          </div>
          <AlbertChat />
        </BackgroundWrapper>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;