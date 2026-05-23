import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface CinematicIntroProps {
  onComplete: () => void;
}

export function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const messages = [
    "Execution environment initialized.",
    "Noise reduction active.",
    "Focus protocol online."
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < messages.length) {
      const timer = setTimeout(() => {
        setIndex((prev) => prev + 1);
      }, 1800);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        onComplete();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [index, onComplete, messages.length]);

  return (
    <motion.div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-[#050505] pointer-events-none"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.2, ease: "easeInOut" } }}
    >
      <AnimatePresence mode="wait">
        {index < messages.length && (
          <motion.p
            key={index}
            initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.7, ease: "easeOut" } }}
            exit={{ opacity: 0, scale: 1.02, filter: "blur(10px)", transition: { duration: 0.7, ease: "easeIn" } }}
            className="text-zinc-400 font-mono text-[11px] md:text-sm tracking-[0.2em] uppercase text-center max-w-[80%]"
          >
            {messages[index]}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
