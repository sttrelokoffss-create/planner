import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { initTelegramApp, getTelegramUser } from './lib/telegram';
import { TaskProvider } from './context/TaskContext';
import { Dashboard } from './components/Dashboard';
import { CinematicIntro } from './components/CinematicIntro';

const App = () => {
  const [isReady, setIsReady] = useState(false);
  const [hasUser, setHasUser] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

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
        <p className="text-zinc-500 text-sm tracking-wide font-mono uppercase">Unauthorized interface. Requires secure connection.</p>
      </div>
    );
  }

  return (
    <TaskProvider>
      <div className="h-dvh w-full bg-[#050505] text-white selection:bg-zinc-800 overflow-hidden relative">
        <AnimatePresence>
          {showIntro && <CinematicIntro onComplete={() => setShowIntro(false)} />}
        </AnimatePresence>
        <Dashboard />
      </div>
    </TaskProvider>
  );
};

export default App;
