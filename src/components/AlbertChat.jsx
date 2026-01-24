import { useState, useRef, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { Bot, Send, ArrowLeft, Image as ImageIcon, Loader2, Sparkles, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

export default function AlbertChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Salut ! Je suis Albert. Bloqué sur une équation ? Envoie une photo ou écris-moi !" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- SCROLL AUTO ---
  const scrollToBottom = () => {
    setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || loading) return;

    const userMsg = { role: 'user', content: input, image: selectedImage };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const imageToSend = selectedImage;
    setSelectedImage(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('albert-tutor', {
        body: { message: userMsg.content, image: imageToSend }
      });

      if (error) throw error;
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Oups, mes circuits surchauffent. Réessaie plus tard !" }]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* 1. BOUTON FLOTTANT (Visible uniquement si chat fermé) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.6)] hover:scale-110 transition-transform z-40 animate-pop group"
        >
          <Bot size={32} className="text-white" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </span>
        </button>
      )}

      {/* 2. OVERLAY GLOBAL (Fond sombre) */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm md:flex md:items-center md:justify-center">
            
            {/* 3. LA CARTE DE CHAT */}
            {/* SUR MOBILE : On force "fixed inset-0" pour coller aux bords quoi qu'il arrive */}
            {/* SUR PC : On reprend une taille normale centrée */}
            <div className="fixed inset-0 md:relative md:inset-auto md:w-[450px] md:h-[700px] bg-[#0f172a] md:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                
                {/* A. HEADER (Fixe en haut) */}
                <div className="h-[70px] bg-gradient-to-r from-indigo-900 to-purple-900 px-4 flex items-center justify-between border-b border-white/10 shrink-0 z-20 relative">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setIsOpen(false)} 
                            className="bg-white/10 p-2 rounded-full hover:bg-white/20 text-white transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h3 className="font-bold text-white text-lg leading-none">Albert IA</h3>
                            <p className="text-xs text-cyan-400 flex items-center gap-1 mt-1">
                                <Sparkles size={10} /> En ligne
                            </p>
                        </div>
                    </div>
                    <Bot size={28} className="text-white/20" />
                </div>

                {/* B. LISTE DES MESSAGES (Zone centrale extensible) */}
                {/* On utilise flex-1 et overflow-y-auto pour que ça prenne TOUT l'espace restant */}
                <div className="flex-1 overflow-y-auto bg-[#0f172a] p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/20 relative">
                    
                    <div className="text-center py-4 opacity-30">
                        <p className="text-xs font-bold uppercase tracking-widest text-white">Début de la session</p>
                    </div>

                    {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-4 text-base shadow-lg ${
                        msg.role === 'user' 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-[#1e293b] text-gray-100 border border-white/10 rounded-tl-none'
                        }`}>
                            {msg.image && (
                                <img src={msg.image} alt="Upload" className="w-full rounded-xl mb-3 border border-white/20" />
                            )}
                            
                            <div className="prose prose-invert prose-p:leading-relaxed max-w-none break-words">
                                <ReactMarkdown 
                                    remarkPlugins={[remarkMath]} 
                                    rehypePlugins={[rehypeKatex]}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start animate-pulse">
                            <div className="bg-[#1e293b] px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-3 border border-white/10">
                                <Loader2 className="animate-spin text-cyan-400" size={20} />
                                <span className="text-sm text-gray-400">Analyse...</span>
                            </div>
                        </div>
                    )}
                    
                    {/* Cible de scroll */}
                    <div ref={messagesEndRef} className="h-4" /> 
                </div>

                {/* C. INPUT ZONE (Fixe en bas) */}
                <div className="min-h-[80px] bg-[#1e293b] border-t border-white/10 p-4 shrink-0 z-20 pb-safe">
                    <form onSubmit={handleSend} className="flex flex-col gap-2">
                        {selectedImage && (
                        <div className="flex items-center gap-3 bg-indigo-500/20 p-2 rounded-lg border border-indigo-500/50">
                            <ImageIcon size={16} className="text-indigo-300"/>
                            <span className="text-xs text-indigo-200 truncate flex-1">Image prête</span>
                            <button type="button" onClick={() => setSelectedImage(null)} className="text-white/50 hover:text-white">
                                <X size={14} />
                            </button>
                        </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                ref={fileInputRef}
                                onChange={handleImageSelect}
                            />
                            <button 
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className="p-3 text-gray-400 hover:text-cyan-400 bg-white/5 rounded-xl transition-colors"
                            >
                                <ImageIcon size={24} />
                            </button>
                            
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Pose ta question..."
                                className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
                            />
                            
                            <button 
                                type="submit" 
                                disabled={loading || (!input && !selectedImage)}
                                className="bg-indigo-600 text-white p-3 rounded-xl disabled:opacity-50"
                            >
                                <Send size={24} />
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
      )}
    </>
  );
}