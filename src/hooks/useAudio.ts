import { useState, useCallback, useEffect, useRef } from 'react';

// Global memory state for audio (so all hooks share the same muted state)
let globalIsMuted = false;
let globalHasInteracted = false;

// AudioContext is shared to prevent multiple contexts
let sharedAudioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioContext) {
    sharedAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return sharedAudioContext;
};

// Subscribers to update UI if needed
const subscribers: Set<(muted: boolean) => void> = new Set();

export const toggleMute = () => {
  globalIsMuted = !globalIsMuted;
  subscribers.forEach(cb => cb(globalIsMuted));
};

export const getIsMuted = () => globalIsMuted;

// Cinematic synthesizer function
export const playCinematicSound = (type: 'success' | 'click' | 'whoosh' | 'complete') => {
  if (globalIsMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);

  if (type === 'click') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.05);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.08, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.start(t);
    osc.stop(t + 0.1);
  } else if (type === 'whoosh') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.3);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.05, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.start(t);
    osc.stop(t + 0.4);
  } else if (type === 'success') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.setTargetAtTime(880, t + 0.1, 0.1);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.1, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    osc.start(t);
    osc.stop(t + 0.8);
  } else if (type === 'complete') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, t); // C5
    osc.frequency.setValueAtTime(659.25, t + 0.15); // E5
    osc.frequency.setValueAtTime(783.99, t + 0.3); // G5
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.05, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    osc.start(t);
    osc.stop(t + 1.2);
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('click', () => {
    if (!globalHasInteracted) {
      globalHasInteracted = true;
      getAudioContext()?.resume();
    }
  }, { once: true });
}

export const useAudio = (type: 'success' | 'click' | 'whoosh' | 'complete' = 'click') => {
  const [muted, setMuted] = useState(globalIsMuted);

  useEffect(() => {
    const cb = (m: boolean) => setMuted(m);
    subscribers.add(cb);
    return () => { subscribers.delete(cb); };
  }, []);

  const play = useCallback(() => {
    if (!muted) {
      playCinematicSound(type);
    }
  }, [muted, type]);

  return { play };
};
