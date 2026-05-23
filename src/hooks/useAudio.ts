import { useCallback, useEffect, useState } from 'react';

export const toggleMute = () => {};
export const getIsMuted = () => true;
export const playCinematicSound = (type: 'success' | 'click' | 'whoosh' | 'complete') => {
  // Silent-mode: Completely disabled per user request
};

export const useAudio = (type: 'success' | 'click' | 'whoosh' | 'complete' = 'click') => {
  const play = useCallback(() => {
    // Silent-mode: Completely disabled per user request
  }, []);

  return { play };
};
