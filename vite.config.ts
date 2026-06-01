import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { execSync } from 'node:child_process';

const base = process.env.GITHUB_REPOSITORY
  ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
  : '/Ride-the-Bus/';

const commit = process.env.GITHUB_SHA ?? getGitCommit();
const appBuildId = process.env.GITHUB_SHA ?? `${commit ?? 'local'}-${Date.now().toString(36)}`;
const appVersion = {
  buildId: appBuildId,
  commit,
  builtAt: new Date().toISOString()
};

function getGitCommit() {
  try {
    return execSync('git rev-parse --short=12 HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

function appVersionPlugin(): Plugin {
  return {
    name: 'ride-the-bus-app-version',
    transformIndexHtml(html) {
      return html.replaceAll('__APP_BUILD_ID__', appBuildId);
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'app-version.json',
        source: `${JSON.stringify(appVersion, null, 2)}\n`
      });
    }
  };
}

export default defineConfig({
  base,
  define: {
    __APP_BUILD_ID__: JSON.stringify(appBuildId)
  },
  plugins: [
    react(),
    appVersionPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png', 'icon.png'],
      manifest: {
        name: 'Ride the Bus',
        short_name: 'Ride the Bus',
        description: 'A polished mobile-first Ride the Bus card game.',
        id: base,
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        scope: base,
        theme_color: '#042317',
        background_color: '#042317',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}']
      }
    })
  ],
  test: {
    environment: 'node',
    include: ['src/tests/**/*.test.ts']
  }
});
