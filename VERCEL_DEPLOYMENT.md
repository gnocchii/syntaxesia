# Vercel Deployment Guide

## Prerequisites
- A Vercel account (sign up at https://vercel.com)
- GitHub repository connected to Vercel

## Step 1: Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

## Step 2: Deploy to Vercel

### Option A: Deploy via GitHub (Recommended)
1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. Vercel will auto-detect the configuration from `vercel.json`
5. Click "Deploy"

### Option B: Deploy via CLI
```bash
vercel
```

## Step 3: Configure Environment Variables

In your Vercel project dashboard, go to **Settings > Environment Variables** and add the following:

### Required Environment Variables

1. **OPENAI_API_KEY**
   - Description: OpenAI API key for QA checking
   - Value: `sk-proj-...` (your OpenAI API key)

2. **GEMINI_API_KEY**
   - Description: Primary Google Gemini API key for image generation
   - Value: `AIzaSy...` (your Gemini API key)

3. **GEMINI_API_KEY_2**
   - Description: Secondary Google Gemini API key for load balancing
   - Value: `AIzaSy...` (your second Gemini API key)

4. **ELEVENLABS_API_KEY**
   - Description: ElevenLabs API key
   - Value: `sk_...` (your ElevenLabs API key)

5. **GCP_PROJECT_ID**
   - Description: Google Cloud Project ID for Vertex AI
   - Value: `gen-lang-client-0523226541`

6. **GCP_LOCATION**
   - Description: Google Cloud location
   - Value: `us-central1`

7. **GOOGLE_APPLICATION_CREDENTIALS_JSON**
   - Description: Service account credentials as JSON string (NOT a file path)
   - Value: The entire contents of your `syntaxesia-vertex-key.json` file
   - **Important**: Copy and paste the entire JSON content as a string

### How to get GOOGLE_APPLICATION_CREDENTIALS_JSON
1. Open your `syntaxesia-vertex-key.json` file
2. Copy the entire JSON content
3. Paste it as the value for this environment variable in Vercel
4. Your Python code will need to parse this JSON string instead of reading from a file

## Step 4: Update Python Code for Vercel

Your `api/main.py` needs to be modified to handle credentials as an environment variable instead of a file. Update the code that loads Google credentials:

```python
import json
import os
from google.oauth2 import service_account

# Instead of:
# credentials = service_account.Credentials.from_service_account_file(
#     os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
# )

# Use:
credentials_json = os.getenv('GOOGLE_APPLICATION_CREDENTIALS_JSON')
if credentials_json:
    credentials_dict = json.loads(credentials_json)
    credentials = service_account.Credentials.from_service_account_info(credentials_dict)
```

## Step 5: Production Build Test (Local)

Before deploying, test the production build locally:

```bash
npm run build
npm run preview
```

## Vercel Configuration Details

The `vercel.json` file configures:
- **Frontend**: Vite React app built to `dist/` directory
- **Backend**: FastAPI Python functions in `api/` directory
- **API Routes**: All `/api/*` requests are routed to Python backend

## Troubleshooting

### API Routes Not Working
- Ensure your Python dependencies are in `requirements.txt`
- Check Vercel function logs in the dashboard
- Python runtime on Vercel has a 10-second timeout for Hobby plan

### Environment Variables Not Loading
- Make sure variables are added to all environments (Production, Preview, Development)
- Redeploy after adding environment variables

### Build Failures
- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

## Useful Commands

```bash
# Deploy to production
vercel --prod

# Check deployment logs
vercel logs

# List deployments
vercel ls

# Open project in browser
vercel open
```

## Post-Deployment

After successful deployment:
1. Test all API endpoints
2. Verify image generation works
3. Check that environment variables are loaded correctly
4. Monitor performance and errors in Vercel dashboard

## Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Python Runtime](https://vercel.com/docs/functions/serverless-functions/runtimes/python)
- [Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)
