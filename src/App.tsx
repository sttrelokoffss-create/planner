import React, { useEffect, useState } from 'react';
import { initTelegramApp, getTelegramUser } from './lib/telegram';
import { TaskProvider } from './context/TaskContext';
import { Dashboard } from './components/Dashboard';

const App = () => {
  const [isReady, setIsReady] = useState(false);
  const [hasUser, setHasUser] = useState(false);

  useEffect(() => {
    try {
      initTelegramApp();
      const user = getTelegramUser();
      if (user && user.id) {
        setHasUser(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsReady(true);
    }
  }, []);

  if (!isReady) return null;

  if (!hasUser) {
    return (
      <div className="flex flex-col items-center justify-center h-dvh w-full bg-[#050505] p-6 text-center text-white">
        <p className="text-zinc-500 text-sm">Please open as Telegram WebApp</p>
      </div>
    );
  }

  return (
    <TaskProvider>
      <div className="h-dvh w-full bg-[#050505] text-white selection:bg-zinc-800 overflow-hidden">
        <Dashboard />
      </div>
    </TaskProvider>
  );
};

export default App;
