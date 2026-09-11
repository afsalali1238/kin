'use client';
import { useEffect, useState } from 'react';
import { figureSvg, FRAME_COUNT } from '@/lib/illustrations';
import type { Exercise } from '@/lib/clinical';

// Per-exercise movement figure. The illustration module precomputes 10
// distinct pose frames per exercise; this component renders them as a
// crossfading stack and steps through the movement arc while `playing` is
// true (the same state that drives the session timer). Respects
// prefers-reduced-motion by staying on the mid-range pose. The session screen
// keys this component by exercise id, so switching exercises remounts it
// with the mid-range pose selected.
export default function ExerciseFigure({ exercise, playing, caption }: { exercise: Exercise; playing: boolean; caption: string }) {
  const [frame, setFrame] = useState(4);
  useEffect(() => {
    if (!playing) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setFrame(f => (f + 1) % FRAME_COUNT), 700);
    return () => clearInterval(id);
  }, [playing, exercise.id]);
  return (
    <div className={`exercise-demo ${playing ? 'moving' : ''}`}>
      <div className="k-figure-wrap" dangerouslySetInnerHTML={{ __html: figureSvg(exercise, frame) }} />
      <span><span className="live-dot" /> {caption}</span>
    </div>
  );
}
