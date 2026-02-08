# Vercel Deployment Checklist

## Pre-Deployment Checklist

- [ ] All code changes are committed to the `main` branch
- [ ] `.env.local` is in `.gitignore` (sensitive keys should NOT be committed)
- [ ] `vercel.json` configuration is present
- [ ] Google Cloud service account key JSON file is ready

## Deployment Steps

### 1. Connect Repository to Vercel

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Sign in with GitHub
3. Import your `syntaxesia` repository
4. Vercel will auto-detect the configuration

### 2. Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

#### Required Variables
```
OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=AIzaSy...
GEMINI_API_KEY_2=AIzaSy...
ELEVENLABS_API_KEY=sk_...
GCP_PROJECT_ID=gen-lang-client-0523226541
GCP_LOCATION=us-central1
```

#### Google Cloud Credentials (Important!)
For `GOOGLE_APPLICATION_CREDENTIALS_JSON`:
1. Open your local `syntaxesia-vertex-key.json` file
2. Copy the ENTIRE JSON content (should start with `{"type":"service_account"...`)
3. Paste it as the value for `GOOGLE_APPLICATION_CREDENTIALS_JSON`
4. Make sure it's added to **all environments** (Production, Preview, Development)

#### CORS Configuration
```
CORS_ORIGINS=https://your-app-name.vercel.app
```
**Note**: Replace `your-app-name` with your actual Vercel deployment URL after first deploy

### 3. Deploy

Click **Deploy** in Vercel dashboard. The build process will:
1. Install Node.js dependencies
2. Build the Vite React frontend
3. Set up Python serverless functions for the API

### 4. Post-Deployment Verification

After deployment, test:
- [ ] Frontend loads correctly
- [ ] API endpoints respond (check `/api/health` or similar)
- [ ] Image generation works (Vertex AI/Gemini)
- [ ] Text-to-speech works (ElevenLabs)

### 5. Update CORS

After your first deployment:
1. Copy your Vercel deployment URL (e.g., `https://syntaxesia.vercel.app`)
2. Update the `CORS_ORIGINS` environment variable in Vercel:
   ```
   CORS_ORIGINS=https://syntaxesia.vercel.app,https://syntaxesia-*.vercel.app
   ```
3. Redeploy (or wait for next deployment)

## Troubleshooting

### Build Fails
- Check Vercel build logs
- Verify all dependencies are in `package.json` and `requirements.txt`
- Ensure Node.js version is compatible (Vercel uses Node 20.x by default)

### API Returns 500 Errors
- Check Vercel Function logs in dashboard
- Verify environment variables are set correctly
- Ensure `GOOGLE_APPLICATION_CREDENTIALS_JSON` is valid JSON

### CORS Errors
- Add your Vercel domain to `CORS_ORIGINS` environment variable
- Format: `https://your-domain.vercel.app`
- Include both production and preview URLs if needed

### Python Function Timeout
- Vercel Hobby plan has 10-second serverless function timeout
- Image generation may take longer - consider upgrading plan if needed
- Or implement async queuing for long-running tasks

## Useful Vercel Commands (CLI)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Open project in browser
vercel open
```

## Environment URLs

- **Production**: `https://syntaxesia.vercel.app` (or your custom domain)
- **Preview**: `https://syntaxesia-git-<branch>.vercel.app`
- **Development**: Use local development with `npm run dev`

## Security Notes

- ✅ Never commit `.env.local` or service account keys to git
- ✅ Rotate API keys regularly
- ✅ Use Vercel environment variables for all secrets
- ✅ Set appropriate CORS origins (don't use wildcard `*` in production)
- ✅ Service account JSON keys are stored securely in Vercel's encrypted storage

## Maintenance

- Monitor usage in Vercel dashboard
- Check API quotas in Google Cloud Console
- Review Vercel function logs for errors
- Update dependencies regularly

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Discord](https://vercel.com/discord)
- [GitHub Issues](https://github.com/vercel/vercel/issues)
