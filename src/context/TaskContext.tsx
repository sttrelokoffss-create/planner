import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loadTasks, createTask, updateTask, deleteTask as deleteSupabaseTask } from '../services/taskService';
import type { Task, StackTask } from '../types';
import { triggerHaptic } from '../lib/telegram';
import { playCinematicSound } from '../hooks/useAudio';

interface TaskContextType {
  tasks: Task[];
  stackTasks: StackTask[];
  isLoaded: boolean;
  addTask: (text: string) => Promise<void>;
  addStackTask: (text: string) => Promise<void>;
  removeStackTask: (id: string) => Promise<void>;
  moveStackTaskToBottom: (id: string) => void;
  moveStackTaskToFocus: (task: StackTask) => Promise<void>;
  toggleTask: (id: number) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  completeTask: (id: number) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within a TaskProvider');
  return context;
};

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stackTasks, setStackTasks] = useState<StackTask[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const data = await loadTasks();
        if (data) {
          const loadedTasks: Task[] = [];
          const loadedStack: StackTask[] = [];
          for (const row of data) {
            if (row.text.startsWith('STACK::')) {
              loadedStack.push({
                id: row.id.toString(),
                clientId: crypto.randomUUID(),
                text: row.text.substring(7),
                createdAt: new Date(row.created_at).getTime()
              });
            } else {
              loadedTasks.push({
                id: row.id,
                clientId: crypto.randomUUID(),
                text: row.text,
                done: row.done,
                date: new Date(row.created_at).toISOString().split('T')[0]
              });
            }
          }
          setTasks(loadedTasks.reverse());
          setStackTasks(loadedStack);
        }
      } catch (e) {
        console.error("Failed to load tasks", e);
      } finally {
        setIsLoaded(true);
      }
    };
    fetchInitData();
  }, []);

  const getTodayStr = () => new Date().toISOString().split('T')[0];

  const addTask = async (text: string) => {
    const today = getTodayStr();
    const todaysTasks = tasks.filter(t => t && t.date === today);
    if (todaysTasks.length >= 3) return;
    
    const tempId = Date.now();
    const clientId = crypto.randomUUID();
    setTasks(prev => [...prev, { id: tempId, clientId, text, done: false, date: today }]);
    triggerHaptic('medium');
    playCinematicSound('click');
    
    try {
      const savedTask = await createTask(text);
      if (savedTask) {
        setTasks(prev => prev.map(t => t.id === tempId ? {
          ...t,
          id: savedTask.id,
          text: savedTask.text,
          done: savedTask.done,
          date: new Date(savedTask.created_at).toISOString().split('T')[0]
        } : t));
      }
    } catch (e: any) {
      console.error(e);
      alert("Error saving: " + (e.message || JSON.stringify(e)));
      setTasks(prev => prev.filter(t => t.id !== tempId));
      triggerHaptic('error' as any);
    }
  };

  const addStackTask = async (text: string) => {
    const tempId = Date.now().toString();
    const clientId = crypto.randomUUID();
    setStackTasks(prev => [{ id: tempId, clientId, text, createdAt: Date.now() }, ...prev]);
    triggerHaptic('medium');
    playCinematicSound('click');
    try {
      const saved = await createTask(`STACK::${text}`);
      if (saved) {
        setStackTasks(prev => prev.map(t => t.id === tempId ? {
          ...t,
          id: saved.id.toString(),
          text: saved.text.substring(7),
          createdAt: new Date(saved.created_at).getTime()
        } : t));
      }
    } catch (e: any) {
      console.error(e);
      alert("Error saving: " + (e.message || JSON.stringify(e)));
      setStackTasks(prev => prev.filter(t => t.id !== tempId));
      triggerHaptic('error' as any);
    }
  };

  const removeStackTask = async (id: string) => {
    const taskToDelete = stackTasks.find(t => t.id === id);
    setStackTasks(prev => prev.filter(t => t.id !== id));
    try {
      await deleteSupabaseTask(parseInt(id));
      triggerHaptic('light');
      playCinematicSound('whoosh');
    } catch (e: any) {
      console.error(e);
      alert("Error deleting: " + (e.message || JSON.stringify(e)));
      if (taskToDelete) setStackTasks(prev => [{...taskToDelete}, ...prev]);
    }
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
    triggerHaptic('light');
  };

  const moveStackTaskToFocus = async (task: StackTask) => {
    const today = getTodayStr();
    const todaysTasks = tasks.filter(t => t && t.date === today);
    if (todaysTasks.length >= 3) {
      triggerHaptic('error' as any);
      return;
    }

    setStackTasks(prev => prev.filter(t => t.id !== task.id));
    const tempId = Date.now();
    const clientId = crypto.randomUUID();
    setTasks(prev => [...prev, { id: tempId, clientId, text: task.text, done: false, date: today }]);
    triggerHaptic('medium');
    playCinematicSound('success');

    try {
      await deleteSupabaseTask(parseInt(task.id));
      const savedTask = await createTask(task.text);
      if (savedTask) {
        setTasks(prev => prev.map(t => t.id === tempId ? {
          ...t,
          id: savedTask.id,
          text: savedTask.text,
          done: savedTask.done,
          date: new Date(savedTask.created_at).toISOString().split('T')[0]
        } : t));
      }
    } catch (e: any) {
      console.error(e);
      alert("Error moving: " + (e.message || JSON.stringify(e)));
      setTasks(prev => prev.filter(t => t.id !== tempId));
      setStackTasks(prev => [{...task}, ...prev]);
      triggerHaptic('error' as any);
    }
  };

  const toggleTask = async (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newDone = !task.done;
    
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: newDone } : t));
    triggerHaptic('medium');
    playCinematicSound(newDone ? 'success' : 'whoosh');
    
    try {
      await updateTask(id, { done: newDone });
    } catch (e: any) {
      console.error(e);
      alert("Error updating: " + (e.message || JSON.stringify(e)));
      setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !newDone } : t));
    }
  };

  const deleteTask = async (id: number) => {
    const taskToDelete = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter((task) => task.id !== id));
    triggerHaptic('soft');
    playCinematicSound('whoosh');
    
    try {
      await deleteSupabaseTask(id);
    } catch (e: any) {
      console.error(e);
      alert("Error deleting: " + (e.message || JSON.stringify(e)));
      if (taskToDelete) setTasks(prev => [...prev, taskToDelete]);
    }
  };

  const completeTask = async (id: number) => {
    setTasks(prev => prev.map((task) => task.id === id ? { ...task, done: true } : task));
    triggerHaptic('heavy');
    playCinematicSound('complete');
    
    try {
      await updateTask(id, { done: true });
    } catch (e: any) {
      console.error(e);
      alert("Error completing: " + (e.message || JSON.stringify(e)));
      setTasks(prev => prev.map((task) => task.id === id ? { ...task, done: false } : task));
    }
  };

  return (
    <TaskContext.Provider value={{
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
    }}>
      {children}
    </TaskContext.Provider>
  );
};
