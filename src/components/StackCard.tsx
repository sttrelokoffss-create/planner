import React from 'react';
import { motion, useMotionValue } from 'motion/react';
import { cn } from '../lib/utils';
import type { StackTask } from '../types';

interface StackCardProps {
  task: StackTask;
  stackTasks: StackTask[];
  onRemove: (id: string) => void;
  onMoveToBottom: (id: string) => void;
  onMoveToFocus: (task: StackTask) => void;
}

export const StackCard: React.FC<StackCardProps> = ({ 
  task, 
  stackTasks, 
  onRemove, 
  onMoveToBottom, 
  onMoveToFocus 
}) => {
  const indexInStack = stackTasks.findIndex(t => t.id === task.id || (t.clientId && t.clientId === task.clientId));
  const i = indexInStack === -1 ? 0 : indexInStack;
  const isCenter = i === 0;

  // Use framer motion values to track drag distance for zero-lag performance
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  // Card stack dimensions and position calculations
  const yOffset = i * 16;
  const scale = Math.max(0.6, 1 - i * 0.08);

  const handleDragEnd = (e: any, info: any) => {
    if (!isCenter) return;
    const { offset, velocity } = info;

    const SWIPE_THRESHOLD_X = 50; // Ultra-light 50px threshold for effortless swiping
    const SWIPE_THRESHOLD_Y = 50; // Ultra-light 50px threshold for effortless shuffling
    const VELOCITY_THRESHOLD = 150; // Lowered velocity requirement to respond to quick flicks

    const absX = Math.abs(offset.x);
    const absY = Math.abs(offset.y);

    if (absX > absY) {
      // Horizontal swipe (X-Axis): Left (X < 0) or Right (X > 0) -> Purge / delete task
      if (absX > SWIPE_THRESHOLD_X || Math.abs(velocity.x) > VELOCITY_THRESHOLD) {
        onRemove(task.id);
      }
    } else {
      // Vertical swipe (Y-Axis): Up (Y < 0) or Down (Y > 0) -> Shuffle front card to bottom of the stack
      if (absY > SWIPE_THRESHOLD_Y || Math.abs(velocity.y) > VELOCITY_THRESHOLD) {
        onMoveToBottom(task.id);
      }
    }
  };

  return (
    <div className="absolute top-12 inset-x-0 mx-auto w-full max-w-[340px] h-[200px]" style={{ zIndex: 50 - i }}>
      {/* Main active card */}
      <motion.div
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
        dragElastic={isCenter ? 1.0 : 0}
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
};
