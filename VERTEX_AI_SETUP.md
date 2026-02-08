# Vertex AI Imagen 3 Setup Guide

## Prerequisites
- Google Cloud Platform (GCP) account
- Billing enabled on your GCP project
- Vertex AI API enabled

## Step 1: Create/Select a GCP Project

1. Go to https://console.cloud.google.com/
2. Create a new project or select an existing one
3. Note your **Project ID** (you'll need this)

## Step 2: Enable Required APIs

1. Go to: https://console.cloud.google.com/apis/library
2. Search for and enable:
   - **Vertex AI API**
   - **Imagen API**

## Step 3: Create Service Account & Key

1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Click **"Create Service Account"**
3. Name it: `syntaxesia-imagen`
4. Click **"Create and Continue"**
5. Grant roles:
   - **Vertex AI User** (roles/aiplatform.user)
   - **Storage Object Viewer** (roles/storage.objectViewer)
6. Click **"Done"**
7. Click on the service account you just created
8. Go to **"Keys"** tab
9. Click **"Add Key"** → **"Create new key"**
10. Choose **JSON**
11. Download the key file (save it securely!)

## Step 4: Configure Environment Variables

Update your `.env.local`:

```bash
# OpenAI for QA checking
OPENAI_API_KEY=sk-proj-...

# Gemini API key
GEMINI_API_KEY=AIzaSy...

# Vertex AI Configuration
GCP_PROJECT_ID=your-project-id-here
GCP_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/your-service-account-key.json
```

**Important:**
- Replace `your-project-id-here` with your actual GCP project ID
- Replace `/absolute/path/to/...` with the actual path to your downloaded JSON key
- Use an **absolute path**, not a relative one

## Step 5: Verify Imagen 3 Access

1. Go to: https://console.cloud.google.com/vertex-ai/generative/multimodal/create/image
2. Make sure you can access Imagen 3
3. If not available, you may need to:
   - Request access (if in preview)
   - Check your billing status
   - Verify region availability (us-central1 is recommended)

## Step 6: Restart Dev Server

```bash
# Kill the current server
pkill -f "next dev"

# Start again
npm run dev
```

## Troubleshooting

### Error: "User does not have permission"
- Make sure the service account has **Vertex AI User** role
- Check that billing is enabled

### Error: "Model not found"
- Imagen 3 might not be available in your region
- Try changing `GCP_LOCATION` to `us-central1` or `us-east4`

### Error: "Invalid credentials"
- Check that `GOOGLE_APPLICATION_CREDENTIALS` path is correct and absolute
- Verify the JSON key file is valid
- Make sure you're using the correct GCP project ID

## Cost Estimate

Imagen 3 pricing (as of Feb 2024):
- ~$0.04 per image generation
- Significantly cheaper than DALL-E 3 ($0.08-0.12)

## Alternative: Use DALL-E 3 (Current Setup)

If you want to keep using DALL-E 3, just remove the Vertex AI code and revert to the original implementation.
