import { useSyncExternalStore } from 'react';

// Poses the visitor photographed in the hero, newest last; the booking call sheet pins them on.
const listeners = new Set();
let shots = [];

export function addShot(pose) {
  shots = [...shots.slice(-7), pose];
  listeners.forEach((listener) => listener());
}

export function useShots() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => shots
  );
}
