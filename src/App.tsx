import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AmbientBackground } from "./components/AmbientBackground";
import { TaskBoard } from "./components/TaskBoard";
import { FocusMode } from "./components/FocusMode";
import type { Task } from "./types";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("limit-three-tasks");
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
      localStorage.setItem("limit-three-tasks", JSON.stringify(tasks));
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

  const completeTask = (id: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: true } : task
      )
    );
  };

  if (!isLoaded) return null;

  return (
    <div className="relative min-h-screen bg-matte-black text-white font-sans overflow-hidden">
      <AmbientBackground />
      
      <AnimatePresence mode="popLayout">
        {!isFocusMode ? (
          <motion.div key="board" className="w-full h-full absolute inset-0">
            <TaskBoard 
              tasks={tasks}
              onAddTask={addTask}
              onToggleTask={toggleTask}
              onEnterFocus={() => setIsFocusMode(true)}
            />
          </motion.div>
        ) : (
          <motion.div key="focus" className="w-full h-full absolute inset-0">
            <FocusMode 
              tasks={tasks}
              onExit={() => setIsFocusMode(false)}
              onCompleteTask={completeTask}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
