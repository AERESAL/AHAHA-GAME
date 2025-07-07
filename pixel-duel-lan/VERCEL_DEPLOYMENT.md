# Vercel Deployment Guide for Pixel Duel LAN

## Prerequisites

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Make sure you have a Vercel account (sign up at https://vercel.com)

## Deployment Steps

### 1. Login to Vercel
```bash
vercel login
```

### 2. Deploy to Vercel
From the `pixel-duel-lan` directory:
```bash
vercel
```

### 3. Follow the prompts:
- Set up and deploy: `Y`
- Which scope: Select your account
- Link to existing project: `N`
- Project name: `pixel-duel-lan` (or your preferred name)
- Directory: `./` (current directory)
- Override settings: `N`

### 4. Production Deployment
```bash
vercel --prod
```

## Build Configuration

The project is configured with:
- **Build Command**: `npm run build` (no build step required for static files)
- **Output Directory**: `./` (current directory)
- **Install Command**: `npm install`

## Vercel Configuration

The `vercel.json` file configures:
- Static file serving for HTML, CSS, JS, and PNG files
- API routes for WebSocket functionality
- Proper routing for the game

## WebSocket Support

The game uses WebSocket connections for multiplayer. Vercel supports WebSocket connections through:
- `/api/ws` endpoint for WebSocket connections
- Serverless functions with extended timeout (30 seconds)

## Environment Variables

No environment variables are required for basic functionality.

## Custom Domain (Optional)

After deployment, you can add a custom domain in the Vercel dashboard:
1. Go to your project in Vercel dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain

## Troubleshooting

### WebSocket Issues
- Ensure clients connect to the correct WebSocket URL
- Check Vercel function logs for connection errors
- WebSocket connections have a 30-second timeout

### Static Files Not Loading
- Verify all files are in the correct directory
- Check that `vercel.json` includes all file types
- Ensure file paths in HTML are correct

### Build Errors
- Make sure Node.js version is 18+ (specified in package.json)
- Check that all dependencies are in package.json
- Verify the build command is correct

## Local Development

For local development with Vercel:
```bash
vercel dev
```

This will start a local development server that mimics Vercel's environment.

## Monitoring

- Check Vercel dashboard for deployment status
- Monitor function logs for WebSocket connections
- Use Vercel Analytics for performance insights

## Support

If you encounter issues:
1. Check Vercel function logs in the dashboard
2. Verify all files are properly committed
3. Ensure package.json has all required dependencies
4. Test locally with `vercel dev` before deploying 