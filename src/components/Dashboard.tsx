import React, { useState } from 'react';
import { AnimatePresence, motion, LayoutGroup } from 'motion/react';
import { AmbientBackground } from './AmbientBackground';
import { TaskBoard } from './TaskBoard';
import { FocusMode } from './FocusMode';
import { StackView } from './StackView';
import { AnalyticsView } from './AnalyticsView';
import { BottomDock, type Tab } from './BottomDock';
import { useTasks } from '../context/TaskContext';

export const Dashboard = () => {
  const { 
    tasks, 
    stackTasks, 
    isLoaded,
    addTask,
    addStackTask,
    removeStackTask,
    moveStackTaskToBottom,
    moveStackTaskToFocus,
    toggleTask,
    deleteTask,
    completeTask
  } = useTasks();

  const [activeTab, setActiveTab] = useState<Tab>('focus');
  const [isFocusMode, setIsFocusMode] = useState(false);

  if (!isLoaded) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const currentTasks = tasks.filter(t => t && t.date === todayStr);

  const swipeThreshold = 50;
  const tabsOrder: Tab[] = ['analytics', 'focus', 'stack'];
  
  const handleDragEnd = (e: any, info: { offset: { x: number } }) => {
    if (Math.abs(info.offset.x) < swipeThreshold) return;
    const currentIndex = tabsOrder.indexOf(activeTab);
    
    if (info.offset.x < -swipeThreshold && currentIndex < tabsOrder.length - 1) {
      setActiveTab(tabsOrder[currentIndex + 1]);
    } else if (info.offset.x > swipeThreshold && currentIndex > 0) {
      setActiveTab(tabsOrder[currentIndex - 1]);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <AnalyticsView tasks={tasks} />;
      case 'stack':
        return (
          <StackView 
            stackTasks={stackTasks}
            onAddStackTask={addStackTask}
            onRemoveStackTask={removeStackTask}
            onMoveToBottom={moveStackTaskToBottom}
            onMoveToFocus={moveStackTaskToFocus as any}
          />
        );
      case 'focus':
      default:
        return (
          <div className="w-full h-full pb-[100px] overflow-y-auto overflow-x-hidden">
            <TaskBoard 
              tasks={currentTasks}
              stackTasks={stackTasks}
              onAddTask={addTask}
              onPullFromStack={moveStackTaskToFocus as any}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
            />
          </div>
        );
    }
  };

  return (
    <LayoutGroup>
      <div className="relative h-full text-white font-sans overflow-hidden flex flex-col">
        <AmbientBackground />
        
        <motion.div 
          className="flex-1 relative w-full h-full pointer-events-none"
          drag="x"
          dragDirectionLock
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
        >
          <AnimatePresence mode="wait" initial={false}>
            {!isFocusMode ? (
              <motion.div
                key={activeTab}
                style={{ willChange: "transform, opacity" }}
                initial={{ opacity: 0, x: activeTab === 'stack' ? 30 : activeTab === 'analytics' ? -30 : 0, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: activeTab === 'stack' ? 30 : activeTab === 'analytics' ? -30 : 0, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 240, damping: 28, mass: 1 }}
                className="transform-gpu w-full h-full absolute inset-0 pointer-events-auto"
              >
                {renderTabContent()}
              </motion.div>
            ) : (
              <motion.div 
                key="focus" 
                style={{ willChange: "transform, opacity" }}
                transition={{ type: "spring", stiffness: 240, damping: 28, mass: 1 }}
                className="transform-gpu w-full h-full absolute inset-0 pointer-events-auto"
              >
                <FocusMode 
                  tasks={currentTasks}
                  onExit={() => setIsFocusMode(false)}
                  onCompleteTask={completeTask}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {!isFocusMode && (
            <BottomDock activeTab={activeTab} setActiveTab={setActiveTab} />
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
};
