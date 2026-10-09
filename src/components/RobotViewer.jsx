import React, { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '../utils/frames';
import { PAGE_RIG } from '../three/a2Rig';
import { useLanguage } from '../context/LanguageContext';

const hasWebgl = () => {
  try {
    const probe = document.createElement('canvas');
    return Boolean(probe.getContext('webgl2') || probe.getContext('webgl'));
  } catch {
    return false;
  }
};

// The 3D stage inside .rp-media: loads the right GLB, shows the Lusion-style % counter,
// links the model's licence credit, and falls back to the photo cutout if WebGL fails.
export default function RobotViewer({ robot }) {
  const canvasRef = useRef(null);
  const viewerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(() => (hasWebgl() ? 'loading' : 'error'));
  const [hinted, setHinted] = useState(false);
  const isMobile = useMediaQuery('(max-width: 767px)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const rig = PAGE_RIG[robot.model];
  const t = useLanguage().t;

  useEffect(() => {
    if (!rig || !hasWebgl()) return undefined;
    let cancelled = false;
    // Delay stage creation until the page entrance tween is done: the render loop's
    // frame cost otherwise triggers gsap lag-smoothing and freezes the entrance.
    const timer = setTimeout(() => {
      import('../three/robotViewer').then(({ createRobotViewer }) => {
        if (cancelled || !canvasRef.current) return;
        const viewer = createRobotViewer({
          canvas: canvasRef.current,
          url: isMobile ? rig.model.mobile : rig.model.desktop,
          rigConfig: rig.config,
          chest: rig.chest,
          emotes: rig.emotes,
          eyeMood: rig.eyeMood,
          breath: rig.breath,
          isMobile,
          reducedMotion,
          onProgress: setProgress,
          onReady: () => setStatus('ready'),
          onError: () => setStatus('error')
        });
        viewerRef.current = viewer;
        if (import.meta.env.DEV) window.__rv = viewer;
        viewer.load();
      });
    }, reducedMotion ? 0 : 1600);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      viewerRef.current?.dispose();
      viewerRef.current = null;
    };
  }, [robot.id, isMobile, reducedMotion, rig]);

  if (!rig) return null;
  if (status === 'error') {
    return <img className="rp-cutout-fallback" src={`/assets/robots/${robot.id}.webp`} alt={robot.name} width="1100" height="1100" fetchPriority="high" />;
  }

  return (
    <div className="rpv" onPointerDown={() => setHinted(true)}>
      <canvas ref={canvasRef} className="rpv-canvas" aria-label={`Model 3D ${robot.name}`} role="img" />
      {status === 'loading' && (
        <div className="rpv-load mono-label" aria-live="polite">{String(Math.round(progress * 100)).padStart(3, '0')}%</div>
      )}
{status === 'ready' && !hinted && !reducedMotion && (
        <div className="rpv-hint mono-label">{t.viewer.dragHint}</div>
      )}
      <a className="rpv-credit mono-label" href={rig.credit} target="_blank" rel="noopener noreferrer">
        {t.viewer.credit}
      </a>
      <style>{`
        .rpv {
          position: absolute;
          inset: 0;
        }
        .rpv-canvas {
          width: 100%;
          height: 100%;
          display: block;
          cursor: grab;
        }
        .rpv-canvas:active {
          cursor: grabbing;
        }
        .rpv-load,
        .rpv-hint {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          color: rgba(223, 230, 251, 0.65);
          pointer-events: none;
        }
        .rpv-hint {
          top: auto;
          bottom: 3.4rem;
          white-space: nowrap;
          color: rgba(223, 230, 251, 0.42);
          animation: rpv-hint 2.4s ease-in-out infinite;
        }
        .rpv-credit {
          position: absolute;
          right: 1.1rem;
          bottom: 1.1rem;
          color: rgba(223, 230, 251, 0.38);
          text-decoration: none;
          transition: color 0.25s ease;
        }
        .rpv-credit:hover {
          color: rgba(223, 230, 251, 0.9);
        }
        @keyframes rpv-hint {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .rp-cutout-fallback {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      `}</style>
    </div>
  );
}
