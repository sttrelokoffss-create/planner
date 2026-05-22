import React, { useState, useEffect } from "react";
import { AnimatePresence, motion, LayoutGroup } from "motion/react";
import { AmbientBackground } from "./components/AmbientBackground";
import { TaskBoard } from "./components/TaskBoard";
import { FocusMode } from "./components/FocusMode";
import { StackView } from "./components/StackView";
import { AnalyticsView } from "./components/AnalyticsView";
import { BottomDock, type Tab } from "./components/BottomDock";
import type { Task, StackTask } from "./types";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stackTasks, setStackTasks] = useState<StackTask[]>([]);

  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('focus');

  // Telegram WebApp setup
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.expand();
      tg.setHeaderColor?.('#050505');
      tg.setBackgroundColor?.('#050505');
      tg.setBottomBarColor?.('#050505');
    }
  }, []);

  // Load from local storage
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem("tasks");
      const savedStack = localStorage.getItem("stackTasks");
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedStack) setStackTasks(JSON.parse(savedStack));
    } catch (e) {
      console.error(e);
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("tasks", JSON.stringify(tasks));
      localStorage.setItem("stackTasks", JSON.stringify(stackTasks));
    }
  }, [tasks, stackTasks, isLoaded]);

  const getTodayStr = () => new Date().toISOString().split('T')[0];

  const addTask = (text: string) => {
    const today = getTodayStr();
    const todaysTasks = tasks.filter(t => t.date === today);
    if (todaysTasks.length >= 3) return;
    
    setTasks((prev) => [
      ...prev,
      {
        id: Date.now(),
        text,
        done: false,
        date: today
      },
    ]);
  };

  const addStackTask = (text: string) => {
    setStackTasks(prev => [{ id: Date.now().toString(), text, createdAt: Date.now() }, ...prev]);
  };

  const removeStackTask = (id: string) => {
    setStackTasks(prev => prev.filter(t => t.id !== id));
  };

  const moveStackTaskToBottom = (id: string) => {
    setStackTasks(prev => {
      const taskIndex = prev.findIndex(t => t.id === id);
      if (taskIndex === -1) return prev;
      const newStack = [...prev];
      const [task] = newStack.splice(taskIndex, 1);
      newStack.push(task);
      return newStack;
    });
  };

  const moveStackTaskToFocus = (task: StackTask) => {
    const today = getTodayStr();
    const todaysTasks = tasks.filter(t => t.date === today);
    if (todaysTasks.length >= 3) return; // Full focus

    addTask(task.text);
    removeStackTask(task.id);
  };

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const completeTask = (id: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: true } : task
      )
    );
  };

  if (!isLoaded) return null;

  // Filter tasks for today's Focus Hub
  const todayStr = getTodayStr();
  const currentTasks = tasks.filter(t => t.date === todayStr);

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
            onMoveToFocus={moveStackTaskToFocus}
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
              onPullFromStack={(task) => moveStackTaskToFocus(task)}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
            />
          </div>
        );
    }
  };

  return (
    <LayoutGroup>
      <div className="relative h-full bg-[#050505] text-white font-sans overflow-hidden flex flex-col">
        <AmbientBackground />
        
        <motion.div 
          className="flex-1 relative w-full h-full pointer-events-none"
          drag="x"
          dragDirectionLock
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
        >
          <AnimatePresence mode="popLayout" initial={false}>
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
}
