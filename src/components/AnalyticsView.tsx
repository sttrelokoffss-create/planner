import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import type { Task } from '../types';
import { cn } from '../lib/utils';

interface AnalyticsViewProps {
  tasks: Task[];
}

const GridSquare = React.memo(({ done }: { done: number }) => {
  let bg = "bg-[#111111] border border-[rgba(255,255,255,0.04)]";
  if (done >= 3) bg = "bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)]";
  else if (done === 2) bg = "bg-white/40";
  else if (done === 1) bg = "bg-white/15";
  
  return (
    <div className={cn("transform-gpu aspect-square rounded-[4px] md:rounded-[6px] transition-all", bg)} style={{ willChange: "transform, opacity" }} />
  );
}, (prev, next) => prev.done === next.done);

export function AnalyticsView({ tasks }: AnalyticsViewProps) {
  // Compute analytics
  const today = new Date();
  
  const { streak, heatmapData, executionRate } = useMemo(() => {
    // 1. Group tasks by date
    const dailyStats: Record<string, { total: number, done: number }> = {};
    
    // We assume task.date is 'YYYY-MM-DD'
    tasks.forEach(t => {
      if (!dailyStats[t.date]) {
        dailyStats[t.date] = { total: 0, done: 0 };
      }
      dailyStats[t.date].total++;
      if (t.done) dailyStats[t.date].done++;
    });

    // 2. Generate last 28 days data
    const last28Days = [];
    const heatmap = [];
    let currentStreak = 0;
    let isStreakActive = true;
    
    for (let i = 0; i < 28; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const stats = dailyStats[dateStr] || { total: 0, done: 0 };
      const isPerfect = stats.total > 0 && stats.done === stats.total;
      
      // A healthy day implies they created tasks and finished them all. Given standard is 3 max, 
      // let's say they must finish 3/3 to keep streak, OR if they created < 3 but finished them, maybe it's also win?
      // "если за день не закрыты все задачи." => stats.total > 0 && stats.done === stats.total.
      // But if stats.total === 0, they didn't even plan. So streak breaks.
      const isWin = stats.total > 0 && stats.done === stats.total;
      
      if (isStreakActive) {
        if (isWin) {
          currentStreak++;
        } else if (i > 0) {
          // Break streak only if not today
          isStreakActive = false;
        }
      }

      heatmap.unshift({
        date: dateStr,
        done: stats.done,
        total: stats.total
      });
    }

    // 3. Execution rate
    const totalCreated = tasks.length;
    const totalDone = tasks.filter(t => t.done).length;
    const rate = totalCreated === 0 ? 0 : Math.round((totalDone / totalCreated) * 100);

    return { streak: currentStreak, heatmapData: heatmap, executionRate: rate };
  }, [tasks]);

  return (
    <div className="w-full h-full pb-[120px] overflow-y-auto overflow-x-hidden flex flex-col items-center justify-center px-6">
      <div className="max-w-[400px] w-full flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 1 }}
          className="text-center mb-16"
        >
          <div className="text-[64px] md:text-[84px] font-extralight leading-[0.9] text-white">
            {streak}
          </div>
          <div className="text-[10px] md:text-[12px] uppercase tracking-[0.4em] text-white/40 mt-4">
            Days Momentum
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="w-full mb-16"
        >
          <div className="grid grid-cols-7 gap-2 md:gap-3">
            {heatmapData.map((day, i) => (
              <GridSquare key={day.date} done={day.done} />
            ))}
          </div>
        </motion.div>
        
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.6, duration: 1 }}
           className="w-full pt-8 border-t border-[rgba(255,255,255,0.08)] text-center"
        >
          <div className="text-white/60 font-light text-lg">
            Execution Rate: <span className="text-white font-medium ml-1">{executionRate}%</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
