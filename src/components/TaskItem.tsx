import { motion } from "motion/react";
import { format } from "date-fns";
import { cn } from "@/src/lib/utils";
import type { Task } from "@/src/types";

interface TaskItemProps {
  task: Task;
  onToggle: (id: number) => void;
}

export function TaskItem({ task, onToggle }: TaskItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
      whileHover={{ scale: 1.01, borderColor: "rgba(255,255,255,0.15)" }}
      whileTap={{ scale: 0.99 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 30 
      }}
      onClick={() => onToggle(task.id)}
      className={cn(
        "group relative flex items-center p-8 cursor-pointer rounded-[24px] transition-colors duration-400 border",
        task.done 
          ? "bg-white/95 border-transparent text-black" 
          : "bg-white/[0.03] backdrop-blur-2xl border-white/[0.08]"
      )}
    >
      <div className="flex-1">
        <motion.span 
          animate={{
            color: task.done ? "#000" : "#fff",
          }}
          className={cn(
            "text-[20px] font-light tracking-[-0.01em] transition-all duration-400 block",
            task.done && "opacity-70"
          )}
        >
          {task.text}
        </motion.span>
      </div>
      
      {/* Minimal checkbox indicator */}
      <div 
        className={cn(
          "ml-4 flex items-center justify-center w-5 h-5 rounded-full border transition-all duration-400",
          task.done ? "border-black bg-black" : "border-white/30"
        )}
      >
        <motion.div 
          initial={false}
          animate={{
            scale: task.done ? 1 : 0,
            opacity: task.done ? 1 : 0
          }}
          className="flex items-center justify-center w-full h-full"
        >
          <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 4.5L4.5 8L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
}
