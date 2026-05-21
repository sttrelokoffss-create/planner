import React from 'react';
import { motion } from 'motion/react';
import { BarChart2, Target, History } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export type Tab = 'analytics' | 'focus' | 'history';

interface BottomDockProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const TABS = [
  { id: 'analytics', icon: BarChart2 },
  { id: 'focus', icon: Target },
  { id: 'history', icon: History },
] as const;

export function BottomDock({ activeTab, setActiveTab }: BottomDockProps) {
  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100]">
      <motion.div 
        className="flex items-center gap-1.5 p-1.5 rounded-full bg-[#1c1c1e]/60 backdrop-blur-2xl border border-white/[0.08] shadow-[0_16px_32px_-8px_rgba(0,0,0,0.6)]"
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
                  className="absolute inset-0 bg-white/[0.12] rounded-full"
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 24,
                    mass: 0.6
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
                  "relative z-10 w-[64px] h-[48px] flex items-center justify-center transition-colors duration-300 rounded-full cursor-pointer",
                  isActive ? "text-white" : "text-white/40 hover:text-white/80"
                )}
                aria-label={`Go to ${tab.id}`}
              >
                <motion.div
                  animate={{
                    scale: isActive ? 1.15 : 1,
                    y: isActive ? -1 : 0,
                  }}
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
