import { useSyncExternalStore } from 'react';

// Loads an image sequence coarse-to-fine so the whole range is usable early, then fills in the gaps.
export function loadFrames({ total, url, concurrency = 6, onLoad }) {
  const images = new Array(total);
  const seen = new Uint8Array(total);
  const order = [];
  for (const step of [24, 12, 6, 3, 1]) {
    for (let i = 0; i < total; i += step) {
      if (!seen[i]) {
        seen[i] = 1;
        order.push(i);
      }
    }
  }

  let next = 0;
  let cancelled = false;
  const worker = async () => {
    while (!cancelled && next < order.length) {
      const i = order[next++];
      const img = new Image();
      img.src = url(i);
      try {
        await img.decode();
      } catch {
        continue;
      }
      if (cancelled) return;
      images[i] = img;
      onLoad?.(i);
    }
  };
  for (let k = 0; k < concurrency; k++) worker();

  return {
    images,
    cancel: () => {
      cancelled = true;
    }
  };
}

// Closest decoded frame to `i`; `circular` wraps around for looping sequences such as a turntable.
export function nearestFrame(images, i, { reach = 48, circular = false } = {}) {
  const total = images.length;
  const at = (j) => images[circular ? ((j % total) + total) % total : j];
  if (at(i)) return at(i);
  for (let d = 1; d < reach; d++) {
    if (at(i - d)) return at(i - d);
    if (at(i + d)) return at(i + d);
  }
  return null;
}

export function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches
  );
}

export const smoothstep = (edge0, edge1, x) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};
