import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import TextareaAutosize from 'react-textarea-autosize';
import { motion, AnimatePresence } from 'motion/react';
import type { StackTask } from '../types';
import { cn } from '../lib/utils';

interface StackViewProps {
  stackTasks: StackTask[];
  onAddStackTask: (text: string) => void;
  onRemoveStackTask: (id: string) => void;
  onMoveToBottom: (id: string) => void;
  onMoveToFocus: (task: StackTask) => void;
}

export function StackView({ 
  stackTasks, 
  onAddStackTask, 
  onRemoveStackTask,
  onMoveToBottom, 
  onMoveToFocus 
}: StackViewProps) {
  const [input, setInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isAdding) document.body.classList.add('hide-dock');
    else document.body.classList.remove('hide-dock');
    return () => document.body.classList.remove('hide-dock');
  }, [isAdding]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onAddStackTask(input.trim());
      setInput('');
      setIsAdding(false);
    }
  };

  return (
    <div className="w-full h-full pb-[100px] flex flex-col pt-12 px-6 md:px-16 overflow-hidden select-none relative">
      <div className="flex-1 w-full max-w-[400px] mx-auto relative flex flex-col justify-center items-center pointer-events-auto py-8">
        <div className="absolute top-0 left-0 right-0 text-center pointer-events-none">
          <h2 className="text-white/20 text-[10px] md:text-[11px] font-sans tracking-[0.4em] uppercase">The Stack</h2>
        </div>

        <AnimatePresence initial={false}>
          {stackTasks.slice(0, 4).map((task, i) => {
            const isCenter = i === 0;

            const y = i * 14;
            const scale = 1 - i * 0.08;
            const opacity = 1;

            return (
              <motion.div
                key={task.id}
                layout
                style={{ 
                  willChange: "transform, opacity",
                  transformOrigin: "top center",
                  boxShadow: isCenter ? "inset 0 1px 1px rgba(255,255,255,0.1), 0 20px 50px -20px rgba(0,0,0,0.8)" : "0 10px 30px -10px rgba(0,0,0,0.8)"
                }}
                initial={{ opacity: 0, scale: 1.05, y: -60 }}
                animate={{ 
                  opacity, 
                  scale, 
                  y, 
                  zIndex: 50 - i
                }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                transition={{ type: "spring", stiffness: 350, damping: 32, mass: 0.5 }}
                className={cn(
                  "transform-gpu absolute top-12 inset-x-0 mx-auto w-full max-w-[340px] h-[200px] rounded-[32px] p-6 flex flex-col justify-center items-center text-center transition-shadow",
                  isCenter 
                    ? "bg-[#1c1c1c] border border-[rgba(255,255,255,0.1)] shadow-[0_20px_40px_-20px_rgba(0,0,0,0.8)]" 
                    : "bg-[#151515] border border-[rgba(255,255,255,0.04)]",
                  !isCenter ? "pointer-events-none" : "cursor-grab active:cursor-grabbing"
                )}
                drag={isCenter}
                dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
                dragElastic={isCenter ? 0.8 : 0}
                dragSnapToOrigin={true}
                onDragEnd={(e, info) => {
                  if (!isCenter) return;
                  const { offset, velocity } = info;
                  const swipeThreshold = 60;
                  const velocityThreshold = 400;

                  if (Math.abs(offset.x) > Math.abs(offset.y) && Math.abs(offset.x) > swipeThreshold) {
                    if (offset.x < 0 || velocity.x < -velocityThreshold) {
                      onRemoveStackTask(task.id);
                    } else if (offset.x > 0 || velocity.x > velocityThreshold) {
                      onMoveToFocus(task);
                    }
                  } else if (offset.y < -swipeThreshold || velocity.y < -velocityThreshold) {
                     onMoveToBottom(task.id);
                  }
                }}
              >
                <div className="w-full max-h-full overflow-hidden flex items-center justify-center pointer-events-none">
                    <p className={cn(
                        "font-light tracking-tight leading-snug break-words whitespace-pre-wrap line-clamp-6 transition-all duration-300",
                        isCenter ? "text-[26px] md:text-[32px] text-white" : "text-[20px] text-white/40"
                    )}>
                        {task.text}
                    </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {stackTasks.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="absolute top-12 inset-x-0 mx-auto w-full max-w-[340px] h-[200px] flex flex-col items-center justify-center text-center pointer-events-none"
          >
             <div className="w-full h-full border border-[rgba(255,255,255,0.05)] rounded-[32px] flex flex-col items-center justify-center bg-[#1c1c1c]">
                <p className="text-white/20 font-extralight tracking-widest uppercase text-[11px] mb-2">Stack is empty</p>
             </div>
          </motion.div>
        )}

        {stackTasks.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-[310px] w-full text-center pointer-events-none"
          >
            <span className="text-white/30 text-[12px] md:text-[13px] font-sans tracking-[0.2em]">{1} / {stackTasks.length}</span>
          </motion.div>
        )}
      </div>

      <div className="w-full max-w-[580px] mx-auto z-10 shrink-0 pointer-events-auto mt-auto mb-4 md:mb-8">
        {isAdding ? (
          <div className="w-full h-[76px] md:h-[90px]" />
        ) : (
          <motion.div
            layoutId="stack-add-slot"
            style={{ willChange: "transform, opacity" }}
            whileHover={{ scale: 1.01, borderColor: "rgba(255,255,255,0.15)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAdding(true)}
            transition={{ type: "spring", stiffness: 240, damping: 28, mass: 1 }}
            className="transform-gpu flex items-center p-6 md:p-8 rounded-[20px] md:rounded-[24px] border cursor-pointer border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] backdrop-blur-2xl text-white/30 will-change-transform"
          >
            <span className="text-[16px] xl:text-[20px] font-light tracking-[-0.01em]">
              New Intention...
            </span>
          </motion.div>
        )}
      </div>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isAdding && (
            <>
              <motion.div 
                style={{ willChange: "opacity" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                onClick={() => setIsAdding(false)}
                className="transform-gpu fixed inset-0 z-[140] bg-black/50 backdrop-blur-md pointer-events-auto"
              />
              
              <div className="fixed bottom-0 left-0 right-0 z-[150] w-full pointer-events-auto flex flex-col justify-end h-dvh pointer-events-none">
                <motion.div 
                  layoutId="stack-add-slot"
                  style={{ willChange: "transform, opacity" }}
                  onLayoutAnimationComplete={() => {
                     inputRef.current?.focus();
                  }}
                  transition={{ type: "spring", stiffness: 240, damping: 28, mass: 1 }}
                  className="transform-gpu w-full bg-[rgba(26,26,26,0.95)] backdrop-blur-2xl border-t border-[rgba(255,255,255,0.08)] rounded-t-[32px] overflow-hidden pointer-events-auto flex flex-col will-change-transform shadow-[0_-20px_40px_rgba(0,0,0,0.5)] pb-[160px] md:pb-[200px]"
                >
                  <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-4 mb-2 shrink-0" />
                  
                  <div className="w-full relative flex flex-col pt-4 px-6 md:px-8">
                    <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleAdd} className="flex flex-col gap-4">
                      <div className="relative">
                        <TextareaAutosize
                          ref={inputRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="New Intention..."
                          minRows={1}
                          maxRows={5}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              if (input.trim()) handleAdd(e as any);
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
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
