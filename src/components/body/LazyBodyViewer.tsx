'use client';
import dynamic from 'next/dynamic';
import { ScanLine } from 'lucide-react';

/**
 * The 3D viewer is heavy (three.js + GLB assets) and client-only, so every
 * screen goes through this lazy boundary and the main bundle stays lean.
 */
const LazyBodyViewer = dynamic(() => import('./BodyViewer'), {
  ssr: false,
  loading: () => (
    <div className="body-loading">
      <ScanLine size={30} />
      <span>Preparing your body map…</span>
    </div>
  ),
});

export default LazyBodyViewer;
