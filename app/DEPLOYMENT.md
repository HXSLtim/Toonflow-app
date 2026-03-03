# Toonflow Frontend Deployment Guide

## Build Configuration

### Environment Variables

Create `.env.production` file:
```
VITE_API_BASE_URL=http://localhost:60000
```

### Build Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Production Build

The production build is optimized with:
- Code splitting (React, UI, Form, State vendors)
- Minification with Terser
- Console/debugger removal
- Source maps disabled
- Asset hashing for cache busting

Build output: `app/dist/`

## Deployment Options

### 1. Static Hosting (Recommended)

Deploy `dist/` folder to:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### 2. Node.js Server

Use a static file server:
```bash
npm install -g serve
serve -s dist -p 5173
```

### 3. Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:60000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Backend Integration

Ensure backend server is running on port 60000:
```bash
cd ../server
npm start
```

## Performance Optimization

- Lazy loading routes (future enhancement)
- Image optimization
- CDN for static assets
- Gzip/Brotli compression

## Monitoring

- Check browser console for errors
- Monitor API response times
- Track Core Web Vitals
