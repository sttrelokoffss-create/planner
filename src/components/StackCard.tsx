import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, animate } from 'motion/react';
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
  onMoveToBottom 
}) => {
  const [exitX, setExitX] = useState(0);
  const [exitY, setExitY] = useState(0);

  const indexInStack = stackTasks.findIndex(t => t.id === task.id || (t.clientId && t.clientId === task.clientId));
  const i = indexInStack === -1 ? 0 : indexInStack;
  const isCenter = i === 0;

  // Make the cards peek visually so the stack looks good.
  const yOffset = -i * 12;
  const scale = Math.max(0.6, 1 - i * 0.05);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    // Bring back to center when becoming the active card, or if it wasn't exited.
    if (isCenter && exitX === 0 && exitY === 0) {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 25 });
      animate(y, 0, { type: 'spring', stiffness: 300, damping: 25 });
    }
  }, [i, x, y, isCenter, exitX, exitY]);

  const handleDragEnd = (e: any, info: any) => {
    if (!isCenter) return;
    const { offset, velocity } = info;

    const SWIPE_THRESHOLD = 50;
    const VELOCITY_THRESHOLD = 200;

    const absX = Math.abs(offset.x);
    const absY = Math.abs(offset.y);

    if (absX > absY && (absX > SWIPE_THRESHOLD || Math.abs(velocity.x) > VELOCITY_THRESHOLD)) {
      const direction = offset.x > 0 ? 1 : -1;
      setExitX(direction * (window.innerWidth || 500));
      setTimeout(() => onRemove(task.id), 150);
    } else if (absY > absX && (absY > SWIPE_THRESHOLD || Math.abs(velocity.y) > VELOCITY_THRESHOLD)) {
      const direction = offset.y > 0 ? 1 : -1;
      setExitY(direction * 220);
      setTimeout(() => {
        onMoveToBottom(task.id);
        // Reset exit for the case when it goes to bottom
        setExitY(0);
      }, 150);
    } else {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 25 });
      animate(y, 0, { type: 'spring', stiffness: 300, damping: 25 });
    }
  };

  return (
    <motion.div 
      className="absolute top-12 md:top-24 mt-12 inset-x-0 mx-auto w-full max-w-[340px] h-[200px]" 
      style={{ 
        zIndex: 50 - i,
        x,
        y
      }}
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ 
        opacity: 1, 
        scale, 
        y: exitY !== 0 ? exitY : yOffset,
        x: exitX !== 0 ? exitX : 0
      }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      transition={{ 
        type: "spring", 
        stiffness: exitX !== 0 || exitY !== 0 ? 500 : 350, 
        damping: exitX !== 0 || exitY !== 0 ? 30 : 25 
      }}
      drag={isCenter}
      dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
      dragElastic={1}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: "grabbing" }}
    >
      <div
        style={{ 
          transformOrigin: "bottom center",
          boxShadow: isCenter ? "inset 0 1px 1px rgba(255,255,255,0.12), 0 24px 50px -15px rgba(0,0,0,0.9)" : "0 10px 30px -10px rgba(0,0,0,0.8)"
        }}
        className={cn(
          "w-full h-full rounded-[32px] p-6 flex flex-col justify-center items-center text-center transition-all duration-300 select-none pb-8",
          isCenter ? "bg-[#1c1c1c] border border-[rgba(255,255,255,0.1)] cursor-grab" : "bg-[#161616] border border-[rgba(255,255,255,0.03)] pointer-events-none"
        )}
      >
        <div className="w-full h-full flex flex-col items-center justify-center pt-4 line-clamp-4 overflow-hidden">
          <p className={cn(
            "text-[20px] md:text-[22px] tracking-[-0.01em] leading-[1.3] break-words whitespace-pre-wrap",
            isCenter ? "font-medium text-white shadow-black drop-shadow-md" : "font-normal text-white/50"
          )}>
            {task.text}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
