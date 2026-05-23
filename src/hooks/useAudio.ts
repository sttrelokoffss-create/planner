import { useState, useCallback } from 'react';

export const useAudio = (url: string) => {
  const [audio] = useState(new Audio(url));
  const [isMuted] = useState(() => localStorage.getItem('app_muted') === 'true');

  const play = useCallback(() => {
    if (isMuted) return;
    audio.volume = 0.4;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, [audio, isMuted]);

  return { play };
};
