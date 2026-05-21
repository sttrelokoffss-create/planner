import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AmbientBackground } from "./components/AmbientBackground";
import { TaskBoard } from "./components/TaskBoard";
import { FocusMode } from "./components/FocusMode";
import { BottomDock, type Tab } from "./components/BottomDock";
import type { Task } from "./types";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('focus');

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tasks");
      if (saved) {
        setTasks(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  const addTask = (text: string) => {
    if (tasks.length >= 3) return;
    setTasks((prev) => [
      ...prev,
      {
        id: Date.now(),
        text,
        done: false,
      },
    ]);
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analytics':
        return (
          <motion.div 
            key="analytics"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} 
            className="w-full h-full absolute inset-0 flex flex-col items-center justify-center pb-24"
          >
            <p className="text-white/20 font-sans text-xs tracking-[0.3em] uppercase">Analytics</p>
            <p className="text-white/30 font-extralight text-sm mt-4">Still minds leave no trace.</p>
          </motion.div>
        );
      case 'history':
        return (
          <motion.div 
            key="history"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} 
            className="w-full h-full absolute inset-0 flex flex-col items-center justify-center pb-24"
          >
            <p className="text-white/20 font-sans text-xs tracking-[0.3em] uppercase">History</p>
            <p className="text-white/30 font-extralight text-sm mt-4">The past is completed.</p>
          </motion.div>
        );
      case 'focus':
      default:
        return (
          <motion.div 
            key="board" 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full absolute inset-0 pb-[100px] pointer-events-auto overflow-y-auto overflow-x-hidden"
          >
            <TaskBoard 
              tasks={tasks}
              onAddTask={addTask}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
            />
          </motion.div>
        );
    }
  };

  return (
    <div className="relative min-h-[100dvh] bg-[#050505] text-white font-sans overflow-hidden flex flex-col">
      <AmbientBackground />
      
      <div className="flex-1 relative w-full h-full pointer-events-none">
        <AnimatePresence mode="popLayout">
          {!isFocusMode ? (
            renderTabContent()
          ) : (
            <motion.div key="focus" className="w-full h-full absolute inset-0 pointer-events-auto">
              <FocusMode 
                tasks={tasks}
                onExit={() => setIsFocusMode(false)}
                onCompleteTask={completeTask}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {!isFocusMode && (
          <BottomDock activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
      </AnimatePresence>
    </div>
  );
}
