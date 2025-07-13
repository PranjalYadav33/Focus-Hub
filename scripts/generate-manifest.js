#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine if we're in production (GitHub Pages) or development
const isProduction = process.env.NODE_ENV === 'production';
const basePath = isProduction ? '/Focus-Hub' : '';

const manifest = {
  "name": "Memphis Focus Hub",
  "short_name": "Focus Hub",
  "description": "A retro-inspired productivity app combining a to-do list and focus timer with vibrant Memphis design aesthetic",
  "start_url": `${basePath}/`,
  "display": "standalone",
  "background_color": "#FFE66D",
  "theme_color": "#4ECDC4",
  "orientation": "portrait-primary",
  "scope": `${basePath}/`,
  "lang": "en",
  "categories": ["productivity", "lifestyle", "utilities"],
  "icons": [
    {
      "src": `${basePath}/app-icon.svg`,
      "sizes": "72x72",
      "type": "image/svg+xml",
      "purpose": "maskable any"
    },
    {
      "src": `${basePath}/app-icon.svg`,
      "sizes": "96x96",
      "type": "image/svg+xml",
      "purpose": "maskable any"
    },
    {
      "src": `${basePath}/app-icon.svg`,
      "sizes": "128x128",
      "type": "image/svg+xml",
      "purpose": "maskable any"
    },
    {
      "src": `${basePath}/app-icon.svg`,
      "sizes": "144x144",
      "type": "image/svg+xml",
      "purpose": "maskable any"
    },
    {
      "src": `${basePath}/app-icon.svg`,
      "sizes": "152x152",
      "type": "image/svg+xml",
      "purpose": "maskable any"
    },
    {
      "src": `${basePath}/app-icon.svg`,
      "sizes": "192x192",
      "type": "image/svg+xml",
      "purpose": "maskable any"
    },
    {
      "src": `${basePath}/app-icon.svg`,
      "sizes": "512x512",
      "type": "image/svg+xml",
      "purpose": "maskable any"
    }
  ],
  "shortcuts": [
    {
      "name": "Focus Timer",
      "short_name": "Focus",
      "description": "Start a focus session",
      "url": `${basePath}/focus`,
      "icons": [
        {
          "src": `${basePath}/app-icon.svg`,
          "sizes": "96x96"
        }
      ]
    },
    {
      "name": "To-Do List",
      "short_name": "Tasks",
      "description": "Manage your tasks",
      "url": `${basePath}/todo`,
      "icons": [
        {
          "src": `${basePath}/app-icon.svg`,
          "sizes": "96x96"
        }
      ]
    }
  ],
  "screenshots": [
    {
      "src": `${basePath}/dashboard.jpeg`,
      "sizes": "1024x768",
      "type": "image/jpeg",
      "form_factor": "wide",
      "label": "Dashboard view showing focus goals and statistics"
    },
    {
      "src": `${basePath}/to%20do%20page.jpeg`,
      "sizes": "1024x768",
      "type": "image/jpeg",
      "form_factor": "wide",
      "label": "To-Do list for task management"
    },
    {
      "src": `${basePath}/focus-screen.jpeg`,
      "sizes": "1024x768",
      "type": "image/jpeg",
      "form_factor": "wide",
      "label": "Focus timer for productivity sessions"
    }
  ]
};

// Write manifest to public directory
const publicDir = path.join(__dirname, '..', 'public');
const manifestPath = path.join(publicDir, 'manifest.json');

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`✅ Generated manifest.json for ${isProduction ? 'production' : 'development'}`);
console.log(`   Base path: ${basePath || '/'}`);
console.log(`   Start URL: ${manifest.start_url}`);
