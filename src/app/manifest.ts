import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'kinē — physiotherapy & rehabilitation',
    short_name: 'kinē',
    description: 'Clinical-grade interactive 3D physiotherapy, musculoskeletal assessment, and personalised rehabilitation exercises.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f7f8f3',
    theme_color: '#f7f8f3',
    lang: 'en',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  };
}
