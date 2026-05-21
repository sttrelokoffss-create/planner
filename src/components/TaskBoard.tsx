import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Task } from "@/src/types";
import { TaskItem } from "./TaskItem";
import { Plus } from "lucide-react";

interface TaskBoardProps {
  tasks: Task[];
  onAddTask: (text: string) => void;
  onToggleTask: (id: number) => void;
  onDeleteTask: (id: number) => void;
  onEnterFocus: () => void;
}

export function TaskBoard({ tasks, onAddTask, onToggleTask, onDeleteTask, onEnterFocus }: TaskBoardProps) {
  const [input, setInput] = React.useState("");
  
  const ringRef = useRef<HTMLDivElement>(null);
  const [ringCenter, setRingCenter] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateCenter = () => {
      if (ringRef.current) {
        const rect = ringRef.current.getBoundingClientRect();
        setRingCenter({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        });
      }
    };
    
    updateCenter();
    window.addEventListener('resize', updateCenter);
    const timer = setTimeout(updateCenter, 100);
    return () => {
      window.removeEventListener('resize', updateCenter);
      clearTimeout(timer);
    };
  }, []);

  const completed = tasks.filter((t) => t.done).length;
  const score = `${completed}/${tasks.length || 3}`;
  const isFull = tasks.length >= 3;
  const allDone = tasks.length > 0 && completed === tasks.length;
  const isVictory = tasks.length === 3 && completed === 3;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    if (isFull) {
      alert("max 3 tasks");
      return;
    }
    
    onAddTask(input.trim());
    setInput("");
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <motion.div 
      initial={{ opacity: 0, filter: "blur(20px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(20px)", scale: 0.95 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[1024px] mx-auto flex flex-col h-full z-10 relative px-6 md:px-16 py-8 md:py-16"
    >
      <header className="mb-12 md:mb-16 flex flex-row items-center md:items-start justify-between gap-4">
        <div>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-white/40 uppercase tracking-[0.3em] text-[10px] md:text-[12px] font-sans mb-1 md:mb-2"
          >
            {today}
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="text-[52px] sm:text-[64px] md:text-[84px] font-extralight tracking-tight text-white m-0 leading-[0.9]"
          >
            Focus.
          </motion.h1>
        </div>
        
        <motion.div 
          ref={ringRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="w-[90px] h-[90px] sm:w-[120px] sm:h-[120px] md:w-[180px] md:h-[180px] rounded-full border border-white/10 flex flex-col justify-center items-center bg-white/[0.02] backdrop-blur-[10px] shadow-[0_0_40px_rgba(0,0,0,0.5)] shrink-0"
        >
          <div className="text-[28px] sm:text-[36px] md:text-[48px] font-extralight leading-none">{completed}/{tasks.length || 3}</div>
          <div className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-white/40 mt-1">Day Score</div>
        </motion.div>
      </header>

      <div className="flex-1 max-w-[580px] w-full mx-auto space-y-4">
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <motion.div layout key={task.id}>
              <TaskItem 
                task={task} 
                onToggle={onToggleTask} 
                onDelete={() => onDeleteTask(task.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {!isFull && (
            <motion.form 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              onSubmit={handleSubmit} 
              className="relative mt-4 md:mt-8"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="new task"
                className="w-full bg-transparent border-b border-white/10 pb-4 pt-4 text-[16px] md:text-[18px] font-extralight text-white placeholder-[rgba(255,255,255,0.2)] focus:outline-none focus:border-white/40 transition-colors tracking-[0.02em] pr-20"
                autoFocus
              />
              <button 
                type="submit"
                disabled={!input.trim()}
                className="absolute right-0 top-4 uppercase text-[10px] md:text-[11px] tracking-[0.2em] text-white/60 hover:text-white disabled:opacity-0 transition-all cursor-pointer px-2 py-1"
              >
                Commit
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="mt-16 flex flex-col items-center gap-6"
      >
        <AnimatePresence>
          {allDone && !isVictory ? (
            <motion.div
              initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 10, filter: "blur(10px)" }}
              className="text-center"
            >
              <p className="text-white/60 font-light text-lg">The day is won.</p>
              <button 
                onClick={() => tasks.forEach(t => onToggleTask(t.id))} // Quick cheat to reset, just for feeling
                className="mt-4 text-xs text-white/30 hover:text-white/60 uppercase tracking-[0.2em] transition-colors"
              >
                Reset
              </button>
            </motion.div>
          ) : (
            tasks.length > 0 && !isVictory && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEnterFocus}
                className="px-8 py-3 rounded-full bg-white text-black font-medium tracking-wide text-sm hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all duration-500"
              >
                Enter Focus
              </motion.button>
            )
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {isVictory && ringCenter.x !== 0 && (
          <motion.div
            initial={{ clipPath: `circle(0px at ${ringCenter.x}px ${ringCenter.y}px)` }}
            animate={{ clipPath: `circle(3000px at ${ringCenter.x}px ${ringCenter.y}px)` }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: [0.4, 0, 0.1, 1] }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#f7f7f7]"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ delay: 0.5, duration: 2, ease: "easeOut" }}
              className="text-black text-center flex flex-col items-center px-6"
            >
              <span className="text-[10px] md:text-[12px] uppercase tracking-[0.4em] text-black/40 mb-6 font-sans">
                Day Complete
              </span>
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-extralight tracking-tight mb-8 text-[#050505]">
                A quiet mind.
              </h2>
              <p className="text-[#050505]/50 font-light text-base md:text-lg mb-12 max-w-[300px] md:max-w-md leading-relaxed text-balance">
                All intentions fulfilled. The essential has been accomplished. The rest is noise.
              </p>
              <button 
                onClick={() => tasks.forEach(t => onToggleTask(t.id))}
                className="text-[10px] text-black/40 hover:text-black uppercase tracking-[0.2em] transition-colors border-b border-black/10 hover:border-black/50 pb-1"
              >
                Begin Anew
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
