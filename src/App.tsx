import React from 'react';
import Mandelbrot9 from './components/Mandelbrot9';
import { motion } from 'motion/react';

const App: React.FC = () => {
  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      <Mandelbrot9 />
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute top-10 left-10 z-10 pointer-events-none"
      >
        <h1 className="text-white font-sans text-6xl font-bold tracking-tighter opacity-80 leading-none">
          RECURSIVE<br/>NINE
        </h1>
        <p className="text-white/40 text-sm font-mono mt-4 tracking-widest uppercase">
          Fractal Dimension 9.0 • Time Spiral
        </p>
      </motion.div>
      
      <div className="absolute bottom-10 right-10 z-10 text-right opacity-20 hover:opacity-100 transition-opacity duration-500">
        <p className="text-white text-[10px] font-mono leading-relaxed">
          &lambda; = z&sup2; + c<br/>
          &infin; RECURSION ACTIVE<br/>
          &spades; QUANTUM FRACTAL
        </p>
      </div>
    </div>
  );
};

export default App;
