import React, { useState, useEffect } from "react";
import { AnimatePresence, motion, LayoutGroup } from "motion/react";
import { AmbientBackground } from "./components/AmbientBackground";
import { TaskBoard } from "./components/TaskBoard";
import { FocusMode } from "./components/FocusMode";
import { StackView } from "./components/StackView";
import { AnalyticsView } from "./components/AnalyticsView";
import { BottomDock, type Tab } from "./components/BottomDock";
import type { Task, StackTask } from "./types";
import { supabase } from "./lib/supabase";
import { initTelegramApp, getTelegramUserId } from "./lib/telegram";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stackTasks, setStackTasks] = useState<StackTask[]>([]);
  const [telegramId, setTelegramId] = useState<number | null>(null);

  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('focus');

  useEffect(() => {
    initTelegramApp();
    const id = getTelegramUserId();
    if (id) {
      setTelegramId(id);
    }
  }, []);

  useEffect(() => {
    if (!telegramId) {
      return;
    }

    const loadTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('telegram_id', telegramId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error(error);
      } else if (data) {
        const loadedTasks: Task[] = [];
        const loadedStack: StackTask[] = [];
        
        for (const row of data) {
           if (row.text.startsWith('STACK::')) {
             loadedStack.push({
                id: row.id.toString(),
                text: row.text.substring(7),
                createdAt: new Date(row.created_at).getTime()
             });
           } else {
             loadedTasks.push({
                id: row.id,
                text: row.text,
                done: row.done,
                date: new Date(row.created_at).toISOString().split('T')[0]
             });
           }
        }
        setTasks(loadedTasks.reverse());
        setStackTasks(loadedStack);
      }
      setIsLoaded(true);
    };

    loadTasks();
  }, [telegramId]);

  const getTodayStr = () => new Date().toISOString().split('T')[0];

  const addTask = async (text: string) => {
    if (!telegramId) {
      return;
    }
    
    const today = getTodayStr();
    const todaysTasks = tasks.filter(t => t.date === today);
    if (todaysTasks.length >= 3) {
      return;
    }
    
    const tempId = Date.now();
    setTasks(prev => [...prev, { id: tempId, text, done: false, date: today }]);
    
    const { data, error } = await supabase.from('tasks').insert({
       telegram_id: telegramId,
       text,
       done: false
    }).select().single();
    
    if (!error && data) {
       setTasks(prev => prev.map(t => t.id === tempId ? {
         id: data.id,
         text: data.text,
         done: data.done,
         date: new Date(data.created_at).toISOString().split('T')[0]
       } : t));
    } else {
       setTasks(prev => prev.filter(t => t.id !== tempId));
    }
  };

  const addStackTask = async (text: string) => {
    if (!telegramId) {
      return;
    }
    
    const tempId = Date.now().toString();
    setStackTasks(prev => [{ id: tempId, text, createdAt: Date.now() }, ...prev]);
    
    const { data, error } = await supabase.from('tasks').insert({
       telegram_id: telegramId,
       text: `STACK::${text}`,
       done: false
    }).select().single();
    
    if (!error && data) {
       setStackTasks(prev => prev.map(t => t.id === tempId ? {
         id: data.id.toString(),
         text: data.text.substring(7),
         createdAt: new Date(data.created_at).getTime()
       } : t));
    } else {
       setStackTasks(prev => prev.filter(t => t.id !== tempId));
    }
  };

  const removeStackTask = async (id: string) => {
    setStackTasks(prev => prev.filter(t => t.id !== id));
    await supabase.from('tasks').delete().eq('id', parseInt(id));
  };

  const moveStackTaskToBottom = (id: string) => {
    setStackTasks(prev => {
      const taskIndex = prev.findIndex(t => t.id === id);
      if (taskIndex === -1) {
        return prev;
      }
      const newStack = [...prev];
      const [task] = newStack.splice(taskIndex, 1);
      newStack.push(task);
      return newStack;
    });
  };

  const moveStackTaskToFocus = async (task: StackTask) => {
    if (!task || !telegramId) {
      return;
    }
    
    const today = getTodayStr();
    const todaysTasks = tasks.filter(t => t.date === today);
    if (todaysTasks.length >= 3) {
      return;
    }

    setStackTasks(prev => prev.filter(t => t.id !== task.id));
    
    const tempId = Date.now();
    setTasks(prev => [...prev, {
       id: tempId,
       text: task.text,
       done: false,
       date: today
    }]);

    await supabase.from('tasks').delete().eq('id', parseInt(task.id));
    
    const { data: newData, error: newError } = await supabase.from('tasks').insert({
       telegram_id: telegramId,
       text: task.text,
       done: false
    }).select().single();

    if (!newError && newData) {
       setTasks(prev => prev.map(t => t.id === tempId ? {
         id: newData.id,
         text: newData.text,
         done: newData.done,
         date: new Date(newData.created_at).toISOString().split('T')[0]
       } : t));
    } else {
       setTasks(prev => prev.filter(t => t.id !== tempId));
       setStackTasks(prev => [{ ...task }, ...prev]);
    }
  };

  const toggleTask = async (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (!task) {
      return;
    }
    
    const newDone = !task.done;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: newDone } : t));
    
    const { error } = await supabase.from('tasks').update({ done: newDone }).eq('id', id);
    if (error) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, done: task.done } : t));
    }
  };

  const deleteTask = async (id: number) => {
    const taskToRestore = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter((task) => task.id !== id));
    
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error && taskToRestore) {
      setTasks(prev => [...prev, taskToRestore]);
    }
  };

  const completeTask = async (id: number) => {
    setTasks(prev => prev.map((task) => task.id === id ? { ...task, done: true } : task));
    await supabase.from('tasks').update({ done: true }).eq('id', id);
  };

  if (!isLoaded) {
    return null;
  }

  const todayStr = getTodayStr();
  const currentTasks = tasks.filter(t => t.date === todayStr);

  const swipeThreshold = 50;
  const tabsOrder: Tab[] = ['analytics', 'focus', 'stack'];
  
  const handleDragEnd = (e: any, info: { offset: { x: number } }) => {
    if (Math.abs(info.offset.x) < swipeThreshold) {
      return;
    }
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
}