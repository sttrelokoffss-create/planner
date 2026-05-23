import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import type { Task } from '../types';
import { cn } from '../lib/utils';
import { triggerHaptic } from '../lib/telegram';

interface AnalyticsViewProps {
  tasks: Task[];
}

const GridSquare = React.memo(({ done, delay }: { done: number, delay: number }) => {
  let bg = "bg-[#111111] border border-[rgba(255,255,255,0.04)]";
  let glow = "";
  if (done >= 3) {
    bg = "bg-white";
    glow = "shadow-[0_0_15px_rgba(255,255,255,0.4)]";
  } else if (done === 2) {
    bg = "bg-white/40";
  } else if (done === 1) {
    bg = "bg-white/15";
  }
  
  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, delay: delay * 0.01 }}
      className={cn("transform-gpu aspect-square rounded-[4px] md:rounded-[6px] transition-all", bg, glow)} 
      style={{ willChange: "transform, opacity" }} 
    />
  );
}, (prev, next) => prev.done === next.done && prev.delay === next.delay);

export function AnalyticsView({ tasks }: AnalyticsViewProps) {
  const today = new Date();
  
  const { streak, heatmapData, executionRate, recentRhythm } = useMemo(() => {
    const dailyStats: Record<string, { total: number, done: number }> = {};
    
    tasks.forEach(t => {
      if (!dailyStats[t.date]) {
        dailyStats[t.date] = { total: 0, done: 0 };
      }
      dailyStats[t.date].total++;
      if (t.done) dailyStats[t.date].done++;
    });

    const heatmap = [];
    let currentStreak = 0;
    let isStreakActive = true;
    const rhythm = [];
    
    for (let i = 0; i < 28; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const stats = dailyStats[dateStr] || { total: 0, done: 0 };
      const isWin = stats.total > 0 && stats.done === stats.total;
      
      if (isStreakActive) {
        if (isWin) {
          currentStreak++;
        } else if (i > 0) {
          isStreakActive = false;
        }
      }

      heatmap.unshift({
        date: dateStr,
        done: stats.done,
        total: stats.total
      });

      if (i < 7) {
        rhythm.unshift(stats.total === 0 ? 0 : (stats.done / stats.total) * 100);
      }
    }

    const totalCreated = tasks.length;
    const totalDone = tasks.filter(t => t.done).length;
    const rate = totalCreated === 0 ? 0 : Math.round((totalDone / totalCreated) * 100);

    return { 
      streak: currentStreak, 
      heatmapData: heatmap, 
      executionRate: rate,
      recentRhythm: rhythm 
    };
  }, [tasks]);

  const sparklinePath = useMemo(() => {
    if (recentRhythm.length === 0) return "";
    const minX = 0;
    const maxX = 100;
    const minY = 30; // height
    const maxY = 0;
    
    const points = recentRhythm.map((val, i) => {
      const x = (i / (recentRhythm.length - 1)) * maxX;
      const y = minY - (val / 100) * minY;
      return `${x},${y}`;
    });
    
    return `M${points.join(' L')}`;
  }, [recentRhythm]);

  return (
    <div className="w-full h-full pb-[120px] overflow-hidden flex flex-col pt-12 px-6">
      <div className="absolute top-0 left-0 right-0 text-center pointer-events-none mt-12 z-0">
         <h2 className="text-white/20 text-[10px] md:text-[11px] font-sans tracking-[0.4em] uppercase">Operator Status</h2>
      </div>

      <div className="max-w-[400px] w-full mx-auto flex flex-col gap-6 mt-16 pb-8 z-10">
        <motion.div 
          onClick={() => triggerHaptic('light')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-[#111] bg-opacity-90 border-[rgba(255,255,255,0.06)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_16px_rgba(0,0,0,0.5)] rounded-[32px] p-8 flex flex-col items-center justify-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="text-center relative z-10"
          >
            <div className="text-[64px] md:text-[84px] font-extralight leading-[0.9] text-white">
              {streak}
            </div>
            <div className="text-[10px] md:text-[12px] uppercase tracking-[0.4em] text-white/40 mt-3 font-sans">
              Days Momentum
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="w-full bg-[#111] bg-opacity-90 border-[rgba(255,255,255,0.06)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_16px_rgba(0,0,0,0.5)] rounded-[32px] p-8"
        >
          <div className="flex justify-between items-end mb-6">
             <h3 className="text-white/50 text-xs font-sans tracking-[0.2em] uppercase">Execution Heatmap</h3>
             <span className="text-white font-medium text-sm">{executionRate}% AVG</span>
          </div>
          <div className="grid grid-cols-7 gap-2 md:gap-3">
            {heatmapData.map((day, i) => (
              <GridSquare key={day.date} done={day.done} delay={i} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
