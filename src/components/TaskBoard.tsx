import React, { useRef, useState, useEffect, useId } from "react";
import { createPortal } from "react-dom";
import TextareaAutosize from "react-textarea-autosize";
import { motion, AnimatePresence } from "motion/react";
import type { Task, StackTask } from "@/src/types";
import { TaskItem } from "./TaskItem";
import { Plus, Layers } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface TaskBoardProps {
  tasks: Task[];
  stackTasks: StackTask[];
  onAddTask: (text: string) => void;
  onPullFromStack: (task: StackTask) => void;
  onToggleTask: (id: number) => void;
  onDeleteTask: (id: number) => void;
}

export function TaskBoard({ tasks, stackTasks, onAddTask, onPullFromStack, onToggleTask, onDeleteTask }: TaskBoardProps) {
  const instanceId = useId();
  const [input, setInput] = React.useState("");
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
  const [isPullingFromStack, setIsPullingFromStack] = useState(false);
  
  const ringRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
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
  const prevVictoryRef = useRef(isVictory);

  useEffect(() => {
    if (activeSlotIndex !== null) document.body.classList.add('hide-dock');
    else document.body.classList.remove('hide-dock');
    return () => document.body.classList.remove('hide-dock');
  }, [activeSlotIndex]);

  useEffect(() => {
    if (isVictory && !prevVictoryRef.current) {
      setShowVictory(true);
      
      // Update Telegram Theme Color for edge-to-edge white background
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        const tg = (window as any).Telegram.WebApp;
        tg.setBackgroundColor?.('#f7f7f7');
        tg.setBottomBarColor?.('#f7f7f7');
      }

      const timer = setTimeout(() => {
        setShowVictory(false);
        // Reset Telegram Theme Color to black
        if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
          const tg = (window as any).Telegram.WebApp;
          tg.setBackgroundColor?.('#050505');
          tg.setBottomBarColor?.('#050505');
        }
      }, 3000); 
      
      return () => {
        clearTimeout(timer);
        if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
          const tg = (window as any).Telegram.WebApp;
          tg.setBackgroundColor?.('#050505');
          tg.setBottomBarColor?.('#050505');
        }
      };
    }
    prevVictoryRef.current = isVictory;
  }, [isVictory]);

  // Reset pull mode when sheet closes
  useEffect(() => {
    if (activeSlotIndex === null) {
      setIsPullingFromStack(false);
      setInput("");
    }
  }, [activeSlotIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    if (isFull) {
      alert("max 3 tasks");
      return;
    }
    
    onAddTask(input.trim());
    setInput("");
    setActiveSlotIndex(null);
  };

  const handleConfirmPull = () => {
    if (isFull || !stackTasks[0]) return;
    onPullFromStack(stackTasks[0]);
    setActiveSlotIndex(null);
    setIsPullingFromStack(false);
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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
          className="w-[90px] h-[90px] sm:w-[120px] sm:h-[120px] md:w-[180px] md:h-[180px] rounded-full border border-[rgba(255,255,255,0.08)] flex flex-col justify-center items-center bg-[#111] bg-opacity-90 shadow-[0_4px_32px_rgba(0,0,0,0.5)] shrink-0"
        >
          <div className="text-[28px] sm:text-[36px] md:text-[48px] font-extralight leading-none">{completed}/{tasks.length || 3}</div>
          <div className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-white/40 mt-1">Day Score</div>
        </motion.div>
      </header>

      <div className="flex-1 max-w-[580px] w-full mx-auto space-y-4">
        <AnimatePresence>
          {tasks.map((task) => (
            <motion.div layout key={task.clientId || task.id}>
              <TaskItem 
                task={task} 
                onToggle={onToggleTask} 
                onDelete={() => onDeleteTask(task.id)}
              />
            </motion.div>
          ))}
          
          {Array.from({ length: Math.max(0, 3 - tasks.length) }).map((_, i) => {
            const isMorphing = activeSlotIndex === i;
            
            if (isMorphing) {
              return (
                <div key={`empty-${i}`} className="w-full h-[76px] md:h-[90px]" />
              );
            }

            return (
              <motion.div
                layoutId={`empty-slot-${instanceId}-${i}`}
                key={`empty-${i}`}
                style={{ willChange: "transform, opacity" }}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.01, borderColor: "rgba(255,255,255,0.15)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveSlotIndex(i)}
                transition={{ type: "spring", stiffness: 240, damping: 28, mass: 1 }}
                className="transform-gpu flex items-center p-6 md:p-8 rounded-[20px] md:rounded-[24px] border cursor-pointer border-[rgba(255,255,255,0.05)] bg-[#111] bg-opacity-90 text-white/30 will-change-transform shadow-[0_8px_16px_rgba(0,0,0,0.3)]"
              >
                <span className="text-[16px] xl:text-[20px] font-light tracking-[-0.01em]">
                  + Add Execution Target
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {typeof document !== 'undefined' && createPortal(
        <>
          <AnimatePresence>
            {activeSlotIndex !== null && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ willChange: "opacity" }}
                  transition={{ duration: 0.4 }}
                  onClick={() => {
                    setActiveSlotIndex(null);
                    setIsPullingFromStack(false);
                    setInput("");
                  }}
                  className="transform-gpu fixed inset-0 z-[140] bg-black/80 pointer-events-auto"
                />
                
                <div className="fixed bottom-0 left-0 right-0 z-[150] w-full flex flex-col justify-end pointer-events-none">
                  <motion.div 
                    layoutId={`empty-slot-${instanceId}-${activeSlotIndex}`}
                    style={{ willChange: "transform, opacity" }}
                    transition={{ type: "spring", stiffness: 240, damping: 28, mass: 1 }}
                    className="transform-gpu w-full bg-[#0a0a0a] border-t border-[rgba(255,255,255,0.08)] rounded-t-[32px] overflow-hidden pointer-events-auto flex flex-col will-change-transform shadow-[0_-20px_40px_rgba(0,0,0,0.8)] pb-[160px] md:pb-[200px]"
                  >
                    <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-4 mb-2 shrink-0" />
                    
                    <div className="w-full relative flex flex-col pt-4 px-6 md:px-8">
                      {isPullingFromStack && stackTasks[0] ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="w-full bg-white text-black p-6 md:p-8 rounded-[20px] md:rounded-[24px] flex flex-col gap-6"
                        >
                           <p className="text-[18px] md:text-[22px] font-medium leading-snug">{stackTasks[0].text}</p>
                           <div className="flex gap-3 mt-auto">
                              <button 
                                 onClick={() => setIsPullingFromStack(false)}
                                 className="flex-1 py-3 text-center rounded-[12px] bg-black/5 text-black/60 font-medium hover:bg-black/10 transition-colors"
                              >
                                 Cancel
                              </button>
                              <button 
                                 onClick={handleConfirmPull}
                                 className="flex-1 py-3 text-center rounded-[12px] bg-black text-white font-medium hover:bg-black/90 transition-colors"
                              >
                                 Add to Focus
                              </button>
                           </div>
                        </motion.div>
                      ) : (
                        <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="flex flex-col gap-4">
                          {stackTasks.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setIsPullingFromStack(true)}
                              className="flex items-center gap-2 self-start px-4 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-full text-white/80 hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                            >
                              <Layers size={14} className="text-white/50" />
            <span className="text-[12px] font-medium tracking-wide">Import from Storage</span>
                            </button>
                          )}
                          <div className="relative">
                            <TextareaAutosize
                              ref={inputRef}
                              autoFocus
                              value={input}
                              onChange={(e) => setInput(e.target.value)}
                              placeholder="Define clear execution target..."
                              minRows={1}
                              maxRows={5}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  if (input.trim()) handleSubmit(e as any);
                                }
                              }}
                              className={cn(
                                "w-full bg-transparent p-4 md:p-6 pr-20 md:pr-24 text-[20px] xl:text-[24px] font-medium tracking-[-0.01em] focus:outline-none transition-colors resize-none overflow-hidden",
                                input.length > 0 ? "text-white" : "text-neutral-700"
                              )}
                            />
                            <button 
                              type="submit"
                              disabled={!input.trim()}
                              className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 uppercase text-[10px] md:text-[11px] tracking-[0.2em] text-white/40 hover:text-white disabled:opacity-0 transition-all font-medium py-2 px-4 bg-white/5 rounded-full"
                            >
                              Add
                            </button>
                          </div>
                        </motion.form>
                      )}
                    </div>
                  </motion.div>
                </div>
              </>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showVictory && ringCenter.x !== 0 && (
              <motion.div
                initial={{ clipPath: `circle(0px at ${ringCenter.x}px ${ringCenter.y}px)` }}
                animate={{ clipPath: `circle(4000px at ${ringCenter.x}px ${ringCenter.y}px)` }}
                exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
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
                        staggerChildren: 0.1,
                        delayChildren: 0.3,
                      }
                    }
                  }}
                  className="text-black text-center flex flex-col items-center px-6"
                >
                  <motion.span 
                    variants={{
                      hidden: { opacity: 0, y: 12, filter: "blur(8px)" },
                      visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
                    }}
                    className="text-[10px] md:text-[12px] uppercase tracking-[0.4em] text-black/40 mb-6 font-sans"
                  >
                    Day Complete
                  </motion.span>
                  <motion.h2 
                    variants={{
                      hidden: { opacity: 0, y: 16, filter: "blur(12px)" },
                      visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
                    }}
                    className="text-4xl sm:text-5xl md:text-7xl font-extralight tracking-tight mb-8 text-[#050505]"
                  >
                    A quiet mind.
                  </motion.h2>
                  <motion.p 
                    variants={{
                      hidden: { opacity: 0, y: 16, filter: "blur(12px)" },
                      visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
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

