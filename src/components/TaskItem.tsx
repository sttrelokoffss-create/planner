import React from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import { Trash2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { Task } from "@/src/types";

interface TaskItemProps {
  task: Task;
  onToggle: (id: number) => void;
  onDelete: () => void;
}

export const TaskItem = React.memo(({ task, onToggle, onDelete }: TaskItemProps) => {
  const x = useMotionValue(0);
  // Transform x offset to opacity & scale of the delete overlay beneath
  const deleteIndicatorOpacity = useTransform(x, [-140, -40, 0], [1, 0.15, 0]);
  const deleteIconScale = useTransform(x, [-140, 0], [1.1, 0.95]);

  return (
    <div className="relative overflow-hidden rounded-[20px] md:rounded-[24px]">
      {/* Background layer: Revealed when swiping left */}
      <motion.div 
        style={{ opacity: deleteIndicatorOpacity }}
        className="absolute inset-y-0 right-0 w-1/2 flex items-center justify-end pr-8 bg-gradient-to-l from-red-950/45 to-transparent border-r border-t border-b border-red-500/10 rounded-[20px] md:rounded-[24px] pointer-events-none"
      >
        <motion.div style={{ scale: deleteIconScale }} className="flex items-center gap-2 text-red-400">
          <span className="text-[10px] uppercase tracking-[0.3em] font-mono leading-none">Purge</span>
          <Trash2 size={16} />
        </motion.div>
      </motion.div>

      {/* Main active interactive card */}
      <motion.div
        layoutId={`task-${task.id}`}
        style={{ x, willChange: "transform, opacity" }}
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)", x: -100 }}
        whileHover={{ scale: 1.01, borderColor: "rgba(255,255,255,0.15)" }}
        whileTap={{ scale: 0.99 }}
        transition={{ 
          type: "spring", 
          stiffness: 350, 
          damping: 32,
          mass: 0.5
        }}
        drag="x"
        dragConstraints={{ left: -160, right: 0 }}
        dragElastic={{ left: 0.5, right: 0 }}
        onDragEnd={(e, info) => {
          const threshold = 50;
          if (info.offset.x < -threshold || (info.offset.x < 0 && info.velocity.x < -200)) {
            onDelete();
          }
        }}
        onClick={() => {
          if (Math.abs(x.get()) < 10) {
            onToggle(task.id);
          }
        }}
        className={cn(
          "transform-gpu group relative flex items-center p-6 md:p-8 cursor-grab active:cursor-grabbing rounded-[20px] md:rounded-[24px] transition-colors duration-400 border z-10",
          task.done 
            ? "bg-white/95 border-transparent text-black" 
            : "bg-[#111] bg-opacity-90 border-[rgba(255,255,255,0.06)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_16px_rgba(0,0,0,0.5)]"
        )}
      >
        <div className="flex-1 min-w-0 pr-4 pointer-events-none">
          <motion.span 
            animate={{
              color: task.done ? "#000" : "#fff",
            }}
            className={cn(
              "text-[16px] xl:text-[20px] font-light tracking-[-0.01em] transition-all duration-400 block break-words",
              task.done && "opacity-70"
            )}
          >
            {task.text}
          </motion.span>
        </div>
        
        {/* Apple-style toggle switch */}
        <div 
          className={cn(
            "ml-3 md:ml-4 w-[50px] h-[30px] rounded-full p-[2px] transition-colors duration-400 ease-in-out shrink-0 cursor-pointer flex relative shadow-inner",
            task.done ? "bg-[#34C759]" : "bg-black/30 border border-white/10"
          )}
        >
          <motion.div
            initial={false}
            animate={{
              x: task.done ? 20 : 0
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30
            }}
            className="h-full aspect-square bg-white rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.2),0_0_1px_rgba(0,0,0,0.1)]"
          />
        </div>
      </motion.div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.task === nextProps.task && 
         prevProps.onToggle === nextProps.onToggle && 
         prevProps.onDelete === nextProps.onDelete;
});
