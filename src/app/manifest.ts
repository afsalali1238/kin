import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'kinē',
    short_name: 'kinē',
    description: 'Interactive physiotherapy and rehabilitation guide',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f8f3',
    theme_color: '#f7f8f3',
    lang: 'en',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  };
}
