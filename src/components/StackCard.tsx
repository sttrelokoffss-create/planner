import React from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { Trash2, AlertCircle, ArrowUp } from 'lucide-react';
import { cn } from '../lib/utils';
import type { StackTask } from '../types';

interface StackCardProps {
  task: StackTask;
  stackTasks: StackTask[];
  onRemove: (id: string) => void;
  onMoveToBottom: (id: string) => void;
  onMoveToFocus: (task: StackTask) => void;
}

export function StackCard({ 
  task, 
  stackTasks, 
  onRemove, 
  onMoveToBottom, 
  onMoveToFocus 
}: StackCardProps) {
  const indexInStack = stackTasks.findIndex(t => t.id === task.id || (t.clientId && t.clientId === task.clientId));
  const i = indexInStack === -1 ? 0 : indexInStack;
  const isCenter = i === 0;

  // Use framer motion values to track drag distance for zero-lag performance
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  // Transformations for directions indicator overlays
  const purgeOpacity = useTransform(dragX, [-140, -40, 0], [1, 0.15, 0]);
  const purgeScale = useTransform(dragX, [-140, 0], [1, 0.85]);

  const commitOpacity = useTransform(dragX, [0, 40, 140], [0, 0.15, 1]);
  const commitScale = useTransform(dragX, [0, 140], [0.85, 1]);

  const bottomOpacity = useTransform(dragY, [-120, -30, 0], [1, 0.15, 0]);
  const bottomScale = useTransform(dragY, [-120, 0], [1, 0.85]);

  // Card stack dimensions and position calculations
  const yOffset = i * 16;
  const scale = Math.max(0.6, 1 - i * 0.08);

  const handleDragEnd = (e: any, info: any) => {
    if (!isCenter) return;
    const { offset } = info;

    if (Math.abs(offset.x) > Math.abs(offset.y)) {
      if (offset.x < -120) {
        onRemove(task.id);
      } else if (offset.x > 120) {
        onMoveToFocus(task);
      }
    } else {
      if (offset.y < -100) {
        onMoveToBottom(task.id);
      }
    }
  };

  return (
    <div className="absolute inset-t-0 mx-auto w-full max-w-[340px] h-[200px]" style={{ zIndex: 50 - i }}>
      {/* Direction Feedback indicators revealed behind the top cards */}
      {isCenter && (
        <>
          {/* PURGE (Left swipe) */}
          <motion.div 
            style={{ opacity: purgeOpacity, scale: purgeScale }}
            className="absolute right-[-40px] top-1/2 -translate-y-1/2 flex flex-col items-center select-none pointer-events-none z-10 p-2"
          >
            <div className="w-12 h-12 rounded-full bg-red-950/40 border border-red-500/20 flex items-center justify-center text-red-500 mb-2 shadow-[0_4px_12px_rgba(239,68,68,0.1)]">
              <Trash2 size={18} />
            </div>
            <span className="text-[9px] uppercase tracking-[0.3em] text-red-400 font-mono">Purge</span>
          </motion.div>

          {/* COMMIT (Right swipe) */}
          <motion.div 
            style={{ opacity: commitOpacity, scale: commitScale }}
            className="absolute left-[-40px] top-1/2 -translate-y-1/2 flex flex-col items-center select-none pointer-events-none z-10 p-2"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2 shadow-[0_4px_12px_rgba(16,185,129,0.1)]">
              <AlertCircle size={18} className="rotate-180" />
            </div>
            <span className="text-[9px] uppercase tracking-[0.3em] text-emerald-400 font-mono">Commit</span>
          </motion.div>

          {/* ARCHIVE/BOTTOM (Up swipe) */}
          <motion.div 
            style={{ opacity: bottomOpacity, scale: bottomScale }}
            className="absolute inset-x-0 bottom-[-45px] mx-auto flex flex-col items-center select-none pointer-events-none z-10 p-2"
          >
            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-white/60 mb-1 shadow-md">
              <ArrowUp size={16} />
            </div>
            <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-mono">Postpone</span>
          </motion.div>
        </>
      )}

      {/* Main active card */}
      <motion.div
        layoutId={`stack-card-${task.clientId || task.id}`}
        style={{ 
          willChange: "transform, opacity",
          transformOrigin: "top center",
          x: dragX,
          y: dragY,
          boxShadow: isCenter ? "inset 0 1px 1px rgba(255,255,255,0.12), 0 24px 50px -15px rgba(0,0,0,0.9)" : "0 10px 30px -10px rgba(0,0,0,0.8)"
        }}
        initial={{ opacity: 0, scale: 1.05, y: -60 }}
        animate={{ 
          opacity: 1, 
          scale, 
          y: yOffset,
          zIndex: 50 - i
        }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        transition={{ type: "spring", stiffness: 350, damping: 32, mass: 0.5 }}
        className={cn(
          "transform-gpu absolute inset-x-0 mx-auto w-full h-full rounded-[32px] p-6 flex flex-col justify-center items-center text-center transition-all duration-300 select-none pb-8",
          isCenter 
            ? "bg-[#1c1c1c] border border-[rgba(255,255,255,0.08)]" 
            : "bg-[#131313] border border-[rgba(255,255,255,0.03)]",
          !isCenter ? "pointer-events-none" : "cursor-grab active:cursor-grabbing"
        )}
        drag={isCenter}
        dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
        dragElastic={isCenter ? 0.8 : 0}
        dragSnapToOrigin={true}
        onDragEnd={handleDragEnd}
      >
        <div className="w-full max-h-full overflow-hidden flex items-center justify-center pointer-events-none">
          <p className={cn(
            "font-light tracking-tight leading-snug break-words whitespace-pre-wrap line-clamp-6 transition-all duration-300",
            isCenter ? "text-[24px] md:text-[28px] text-white" : "text-[18px] text-white/35"
          )}>
            {task.text}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
