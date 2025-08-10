# Focus Hub - Deployment Guide

## GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Automatic Deployment

1. **Fork or Clone** this repository
2. **Enable GitHub Pages** in your repository settings:
   - Go to Settings → Pages
   - Source: "GitHub Actions"
3. **Push to main branch** - deployment happens automatically
4. **Access your site** at: `https://pranjalyadav33.github.io/Focus-Hub/`

### Manual Deployment

If you need to deploy manually:

```bash
# Build the project
npm run build

# The dist/ folder contains all files ready for deployment
# Upload the contents to any static hosting service
```

### Configuration Files

The following files are configured for GitHub Pages deployment:

- `.github/workflows/deploy.yml` - GitHub Actions workflow
- `vite.config.ts` - Base path configuration
- `public/404.html` - SPA routing support
- `scripts/generate-manifest.js` - PWA manifest generation
- `scripts/generate-sw.js` - Service worker generation

### Environment Variables

The build process automatically detects the environment:

- **Development**: Base path is `/`
- **Production**: Base path is `/Focus-Hub/`

### PWA Features

The deployment includes full PWA support:

- ✅ Service Worker for offline functionality
- ✅ Web App Manifest for installation
- ✅ Optimized caching strategies
- ✅ Background sync capabilities

### Troubleshooting

If deployment fails:

1. Check the Actions tab for error logs
2. Ensure GitHub Pages is enabled
3. Verify the base path in `vite.config.ts`
4. Check that all PWA files are generated correctly

### Custom Domain

To use a custom domain:

1. Add a `CNAME` file to the `public/` directory
2. Update the base path in `vite.config.ts` to `/`
3. Configure your DNS settings

### Other Hosting Platforms

This project can also be deployed to:

- **Netlify**: Connect GitHub repo, build command: `npm run build`, publish directory: `dist`
- **Vercel**: Import GitHub repo, framework preset: Vite
- **Firebase Hosting**: `firebase deploy` after building
- **Any static host**: Upload `dist/` folder contents
