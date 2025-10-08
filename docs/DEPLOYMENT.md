# Deployment Guide - Zeropoint Protocol

## Cloudflare Pages Setup

### 1. Delete Old Site (if needed)

If you have an existing Cloudflare Pages site that's causing conflicts:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages** → **Projects**
3. Find the old `zeropoint-protocol` project
4. Click **Settings** → **General** → **Delete project**
5. Confirm deletion

### 2. Create New Cloudflare Pages Project

1. In Cloudflare Dashboard, go to **Pages** → **Create a project**
2. Choose **Connect to Git**
3. Select your GitHub repository: `FlynnVIN10/Zeropoint-Protocol`
4. Configure build settings:
   - **Project name**: `zeropoint-protocol`
   - **Production branch**: `main`
   - **Build command**: `echo 'Static site - no build required'`
   - **Build output directory**: `public`
   - **Root directory**: `/` (leave blank)
   - **Node.js version**: `20`

### 3. Environment Variables

Set these in your Cloudflare Pages project settings:

```
MOCKS_DISABLED=1
CF_PAGES_COMMIT_SHA={{ .Git.ShortSHA }}
BUILD_TIME={{ .Build.Time }}
```

### 4. Custom Domain

1. In project settings, go to **Custom domains**
2. Add `zeropointprotocol.ai`
3. Update DNS records as instructed by Cloudflare

### 5. Deploy

The site will automatically deploy when you push to `main`. 

**Manual deployment:**
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler pages deploy public --project-name="zeropoint-protocol"
```

### 6. Verify Deployment

After deployment, verify these endpoints return 200:

- ✅ `/` - Home page
- ✅ `/status` - Status page  
- ✅ `/api/healthz` - Health check
- ✅ `/api/readyz` - Readiness check

### 7. Troubleshooting

**If deployment fails:**
1. Check Cloudflare Pages logs
2. Verify `public/` directory contains all required files
3. Ensure Node.js version is 20
4. Check environment variables are set correctly

**If site shows errors:**
1. Clear Cloudflare cache
2. Check DNS propagation
3. Verify custom domain configuration

## File Structure

```
public/
├── index.html          # Home page
├── status/             # Status page
├── api/                # API endpoints
│   ├── healthz.json
│   └── readyz.json
├── metrics/            # Metrics page
├── consensus/          # Consensus page
├── audits/             # Audits page
├── library/            # Library page
├── governance/         # Governance page
└── legal/              # Legal pages
```

## CI/CD Integration

The GitHub Actions workflows will automatically:
1. ✅ Run quality checks
2. ✅ Verify static files exist
3. ✅ Deploy to Cloudflare Pages
4. ✅ Run post-deployment probes

**Intent: good heart, good will, GOD FIRST.** 🚀
