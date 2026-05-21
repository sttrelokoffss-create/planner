import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Play, Pause, RotateCcw } from "lucide-react";
import type { Task } from "@/src/types";

interface FocusModeProps {
  tasks: Task[];
  onExit: () => void;
  onCompleteTask: (id: number) => void;
}

export function FocusMode({ tasks, onExit, onCompleteTask }: FocusModeProps) {
  const pendingTasks = tasks.filter(t => !t.done);
  const activeTask = pendingTasks[0]; // Focus on the next pending task

  // Default Focus Timer: 25 minutes
  const INITIAL_TIME = 25 * 60;
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      // Timer finished - we could trigger a gentle sound here
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(INITIAL_TIME);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = 1 - (timeLeft / INITIAL_TIME);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1 } }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="fixed inset-0 z-50 flex flex-col items-center py-12 px-6"
    >
      {/* Immersive Dark Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-3xl z-0"
      />

      {/* Focus Breathing Light */}
      <motion.div
        animate={{
          scale: isActive ? [1, 1.05, 1] : 1,
          opacity: isActive ? [0.2, 0.4, 0.2] : 0.1,
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[80vw] bg-white/10 blur-[120px] rounded-full z-0 pointer-events-none"
      />

      <div className="relative z-10 w-full flex justify-between items-center max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="text-white/40 font-display tracking-[0.2em] text-xs uppercase"
        >
          Flow State
        </motion.div>
        
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onExit}
          className="p-3 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer"
        >
          <X size={24} strokeWidth={1.5} />
        </motion.button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full mb-12">
        <AnimatePresence mode="popLayout">
          {activeTask ? (
            <motion.div 
              key={activeTask.id}
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -30, filter: "blur(10px)", scale: 0.9 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-center max-w-2xl px-6"
            >
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-light tracking-tight text-white mb-8 md:mb-16 leading-tight">
                {activeTask.text}
              </h2>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-white/50 font-light text-2xl tracking-wide"
            >
              Session Complete
            </motion.div>
          )}
        </AnimatePresence>

        {activeTask && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="flex flex-col items-center gap-12 mt-12"
          >
            {/* Giant Minimal Timer */}
            <div className="relative group flex items-center justify-center">
              {/* Progress Ring */}
              <svg className="absolute -inset-4 md:-inset-8 w-[calc(100%+2rem)] md:w-[calc(100%+4rem)] h-[calc(100%+2rem)] md:h-[calc(100%+4rem)] -rotate-90 pointer-events-none opacity-20">
                <circle
                  cx="50%"
                  cy="50%"
                  r="48%"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-white/20"
                />
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="48%"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-white"
                  strokeDasharray="1000"
                  strokeDashoffset={1000 - (1000 * progress)}
                  transition={{ duration: 1, ease: "linear" }}
                />
              </svg>

              <div 
                className="text-[4.5rem] sm:text-[6rem] md:text-[8rem] font-display font-light tracking-tighter text-white/90 tabular-nums cursor-pointer select-none"
                onClick={toggleTimer}
              >
                {formatTime(timeLeft)}
              </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-8 mt-4 md:mt-0">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={resetTimer}
                className="p-3 md:p-4 rounded-full text-white/30 hover:text-white hover:bg-white/5 transition-all"
              >
                <RotateCcw size={20} className="md:w-6 md:h-6" strokeWidth={1.5} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTimer}
                className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-full bg-white text-black flex items-center justify-center hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all duration-500"
              >
                {isActive ? <Pause size={24} className="md:w-8 md:h-8" strokeWidth={1} fill="currentColor" /> : <Play size={24} className="md:w-8 md:h-8 ml-1 md:ml-2" strokeWidth={1} fill="currentColor" />}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  onCompleteTask(activeTask.id);
                  resetTimer();
                }}
                className="px-5 py-3 md:px-6 md:py-4 rounded-full border border-white/20 text-white/70 hover:bg-white hover:text-black transition-all flex items-center gap-2 shrink-0"
              >
                <span className="font-medium tracking-wide text-xs md:text-sm">Done</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
