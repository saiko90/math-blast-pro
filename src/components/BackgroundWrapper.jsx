import { motion } from 'framer-motion';

const MathParticles = () => {
  const symbols = ["∫", "∑", "π", "∞", "√", "ƒ", "∂", "∆", "≈", "≠", "≤", "≥", "x²", "sin", "log", "e", "φ"];
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* On passe à 40 particules pour un effet dense */}
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={i}
          // COULEURS & OPACITÉ BOOSTÉES : Cyan et Violet vifs
          className={`absolute font-serif font-bold select-none ${i % 2 === 0 ? 'text-cyan-400' : 'text-purple-400'}`}
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: Math.random() * window.innerHeight,
            scale: 0.5 + Math.random(), // Plus gros
            opacity: 0
          }}
          animate={{ 
            y: [null, Math.random() * -150], // Monte plus haut
            opacity: [0, 0.8, 0], // Opacité monte jusqu'à 0.8 (très visible)
          }}
          transition={{ 
            duration: 8 + Math.random() * 15, // Vitesse variable
            repeat: Infinity, 
            ease: "linear",
            delay: Math.random() * 5
          }}
          style={{ 
            fontSize: `${20 + Math.random() * 30}px`,
            textShadow: '0 0 10px rgba(255,255,255,0.3)' // Petit effet glow
          }}
        >
          {symbols[Math.floor(Math.random() * symbols.length)]}
        </motion.div>
      ))}
    </div>
  );
};

export default function BackgroundWrapper({ children }) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0f172a] text-white">
      
      {/* 1. FOND AURORA BOREALIS (Global) */}
      <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-indigo-900 via-[#0f172a] to-purple-900 animate-spin-slow opacity-60 fixed" />
      
      {/* 2. TEXTURE CUBES (Subtile) */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay fixed"></div>
      
      {/* 3. PARTICULES MATHÉMATIQUES (Visibles partout) */}
      <MathParticles />

      {/* 4. LE CONTENU DE LA PAGE (Z-Index supérieur pour être cliquable) */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}