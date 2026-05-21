import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import type { Task } from "@/src/types";
import { TaskItem } from "./TaskItem";
import { Plus } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface TaskBoardProps {
  tasks: Task[];
  onAddTask: (text: string) => void;
  onToggleTask: (id: number) => void;
  onDeleteTask: (id: number) => void;
}

export function TaskBoard({ tasks, onAddTask, onToggleTask, onDeleteTask }: TaskBoardProps) {
  const [input, setInput] = React.useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
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

  const [showVictory, setShowVictory] = useState(false);
  // Initialize to current isVictory. This ensures if we load/switch to a state where it's already 3/3, it doesn't pop up.
  const prevVictoryRef = useRef(isVictory);

  useEffect(() => {
    if (isVictory && !prevVictoryRef.current) {
      setShowVictory(true);
      const timer = setTimeout(() => {
        setShowVictory(false);
      }, 8000); // Extended slightly for naturally slower reading pace
      
      return () => clearTimeout(timer);
    }
    prevVictoryRef.current = isVictory;
  }, [isVictory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    if (isFull) {
      alert("max 3 tasks");
      return;
    }
    
    onAddTask(input.trim());
    setInput("");
    setIsSheetOpen(false);
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
          
          {Array.from({ length: Math.max(0, 3 - tasks.length) }).map((_, i) => (
            <motion.div
              layout
              key={`empty-${i}`}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={i === 0 ? { scale: 1.01, borderColor: "rgba(255,255,255,0.15)" } : {}}
              whileTap={i === 0 ? { scale: 0.99 } : {}}
              onClick={() => i === 0 ? setIsSheetOpen(true) : undefined}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={cn(
                "flex items-center p-6 md:p-8 rounded-[20px] md:rounded-[24px] border",
                i === 0 
                  ? "cursor-pointer bg-white/[0.03] backdrop-blur-2xl border-white/[0.08]" 
                  : "opacity-40 cursor-default bg-white/[0.01] border-white/[0.04]"
              )}
            >
              <span className={cn(
                "text-[16px] xl:text-[20px] font-light tracking-[-0.01em]",
                i === 0 ? "text-white/40" : "text-white/10"
              )}>
                {i === 0 ? "+ Add Focus Task" : ""}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {typeof document !== 'undefined' && createPortal(
        <>
          <AnimatePresence>
            {isSheetOpen && (
              <>
                {/* Backdrop overlay dimming */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setIsSheetOpen(false)}
                  className="fixed inset-0 z-[140] backdrop-blur-[2px] bg-black/40"
                />
                
                {/* Bottom Sheet UI */}
                <motion.div 
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 250 }}
                  className="fixed bottom-0 left-0 right-0 w-full z-[150] pt-4 pb-8 px-4 sm:px-6 bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-white/[0.08] rounded-t-[32px] shadow-[0_-20px_40px_rgba(0,0,0,0.5)]"
                >
                  <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6 shrink-0" />
                  
                  <form onSubmit={handleSubmit} className="max-w-[580px] mx-auto w-full relative">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Whisper a new intention..."
                      autoFocus
                      className="w-full bg-white/95 text-black p-6 md:p-8 rounded-[20px] md:rounded-[24px] text-[16px] xl:text-[20px] font-light tracking-[-0.01em] focus:outline-none placeholder-black/40 pr-24 transition-all"
                    />
                    <button 
                      type="submit"
                      disabled={!input.trim()}
                      className="absolute right-6 top-1/2 -translate-y-1/2 uppercase text-[10px] md:text-[11px] tracking-[0.2em] text-black/40 hover:text-black disabled:opacity-0 transition-all font-medium py-2 px-3 pl-4"
                    >
                      Done
                    </button>
                  </form>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showVictory && ringCenter.x !== 0 && (
              <motion.div
                initial={{ clipPath: `circle(0px at ${ringCenter.x}px ${ringCenter.y}px)` }}
                animate={{ clipPath: `circle(4000px at ${ringCenter.x}px ${ringCenter.y}px)` }}
                exit={{ opacity: 0, filter: "blur(20px)", transition: { duration: 1.2, ease: "easeInOut" } }}
                transition={{ duration: 3.5, ease: "easeInOut" }}
                className="fixed inset-0 z-[200] flex items-center justify-center bg-[#f7f7f7]"
              >
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.4,
                        delayChildren: 0.8,
                      }
                    }
                  }}
                  className="text-black text-center flex flex-col items-center px-6"
                >
                  <motion.span 
                    variants={{
                      hidden: { opacity: 0, y: 12, filter: "blur(8px)" },
                      visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1.8, ease: [0.16, 1, 0.3, 1] } }
                    }}
                    className="text-[10px] md:text-[12px] uppercase tracking-[0.4em] text-black/40 mb-6 font-sans"
                  >
                    Day Complete
                  </motion.span>
                  <motion.h2 
                    variants={{
                      hidden: { opacity: 0, y: 16, filter: "blur(12px)" },
                      visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 2, ease: [0.16, 1, 0.3, 1] } }
                    }}
                    className="text-4xl sm:text-5xl md:text-7xl font-extralight tracking-tight mb-8 text-[#050505]"
                  >
                    A quiet mind.
                  </motion.h2>
                  <motion.p 
                    variants={{
                      hidden: { opacity: 0, y: 16, filter: "blur(12px)" },
                      visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 2, ease: [0.16, 1, 0.3, 1] } }
                    }}
                    className="text-[#050505]/50 font-light text-base md:text-lg max-w-[300px] md:max-w-md leading-relaxed text-balance"
                  >
                    All intentions fulfilled. The essential has been accomplished. The rest is noise.
                  </motion.p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>,
        document.body
      )}
    </motion.div>
  );
}
