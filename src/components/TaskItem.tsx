import React from "react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import type { Task } from "@/src/types";

interface TaskItemProps {
  task: Task;
  onToggle: (id: number) => void;
  onDelete: () => void;
}

export const TaskItem = React.memo(({ task, onToggle, onDelete }: TaskItemProps) => {
  return (
    <motion.div
      layoutId={`task-${task.id}`}
      style={{ willChange: "transform, opacity" }}
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
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={(e, info) => {
        const threshold = 80;
        const velocityThreshold = 400;
        if (Math.abs(info.offset.x) > threshold || Math.abs(info.velocity.x) > velocityThreshold) {
          onDelete();
        }
      }}
      onClick={() => onToggle(task.id)}
      className={cn(
        "transform-gpu group relative flex items-center p-6 md:p-8 cursor-grab active:cursor-grabbing rounded-[20px] md:rounded-[24px] transition-colors duration-400 border",
        task.done 
          ? "bg-white/95 border-transparent text-black" 
          : "bg-[rgba(255,255,255,0.03)] backdrop-blur-2xl border-[rgba(255,255,255,0.08)]"
      )}
    >
      <div className="flex-1 min-w-0 pr-4">
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
  );
}, (prevProps, nextProps) => {
  return prevProps.task === nextProps.task && 
         prevProps.onToggle === nextProps.onToggle && 
         prevProps.onDelete === nextProps.onDelete;
});
