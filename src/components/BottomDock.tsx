import React from 'react';
import { motion } from 'motion/react';
import { BarChart2, Target, Layers } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export type Tab = 'analytics' | 'focus' | 'stack';

interface BottomDockProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const TABS = [
  { id: 'analytics', icon: BarChart2 },
  { id: 'focus', icon: Target },
  { id: 'stack', icon: Layers },
] as const;

export function BottomDock({ activeTab, setActiveTab }: BottomDockProps) {
  return (
    <div 
      className="fixed left-1/2 -translate-x-1/2 z-[100] dock-container"
      style={{ bottom: 'max(2rem, calc(env(safe-area-inset-bottom) + 1.5rem))' }}
    >
      <motion.div 
        className="transform-gpu flex items-center gap-1.5 p-1.5 rounded-[40px] bg-[#1a1a1a] bg-opacity-95 border border-[rgba(255,255,255,0.08)] shadow-[0_20px_40px_-8px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)]"
        style={{ willChange: "transform, opacity" }}
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 350, damping: 30, delay: 0.1 }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <div key={tab.id} className="relative z-0 flex items-center justify-center">
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  style={{ willChange: "transform" }}
                  className="transform-gpu absolute inset-0 bg-[rgba(255,255,255,0.12)] rounded-full"
                  transition={{ 
                    type: "spring", 
                    stiffness: 240, 
                    damping: 28,
                    mass: 1
                  }}
                />
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ 
                  scale: 0.85, 
                  skewX: -2 // slight physical deformation on press
                }}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={cn(
                  "transform-gpu relative z-10 w-[64px] h-[48px] flex items-center justify-center transition-colors duration-300 rounded-full cursor-pointer",
                  isActive ? "text-white" : "text-white/40 hover:text-white/80"
                )}
                aria-label={`Go to ${tab.id}`}
                style={{ willChange: "transform" }}
              >
                <motion.div
                  animate={{
                    scale: isActive ? 1.15 : 1,
                    y: isActive ? -1 : 0,
                  }}
                  style={{ willChange: "transform" }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 20
                  }}
                >
                  <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
                </motion.div>
              </motion.button>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
