# 🔍 Syntaxesia Pipeline Debug Report

**Generated**: 2026-02-07
**Status**: ✅ **Architecture is correct, needs server restart for CORS fix**

---

## 📊 Investigation Summary

I've thoroughly analyzed the connection between your extraction API (Python) and placard API (Node.js). Here's what I found:

### ✅ What's Working

1. **File Structure**: `repo_data.json` exists at correct location with valid data
2. **Data Format**: All required fields present (`metadata`, `analysis.important_files`)
3. **File Permissions**: Node.js can successfully read the extraction output
4. **API Architecture**: Both endpoints are correctly designed
5. **Test Page Logic**: Properly waits for extraction before calling placard generation

### ⚠️ Issues Found & Fixed

#### 1. CORS Configuration (Critical)
**Status**: ✅ Fixed, needs server restart

The extraction API now has proper CORS configuration:
```python
CORS(app, resources={r"/*": {"origins": "*"}})
```

**Action Required**: Restart both servers (see instructions below)

#### 2. Working Directory Dependency
**Status**: ✅ Fixed

The Python API was saving `repo_data.json` to the current working directory, which could cause issues if run from the wrong location. Now it uses absolute paths:
```python
script_dir = os.path.dirname(os.path.abspath(__file__))
repo_data_path = os.path.join(script_dir, "repo_data.json")
```

#### 3. Hardcoded Path in test.html
**Status**: ⚠️ Acceptable for now (it's a placeholder)

Line 357 in test.html has:
```javascript
repoDataPath: '/Users/melindayong/syntaxesia/extraction/repo_data.json'
```

This works but isn't portable. Since your teammate is building the real frontend, this is fine as a temporary test page.

---

## 🔄 How The Pipeline Works

```
┌─────────────────────────────────────────────────────────────┐
│  USER INPUT: GitHub URL                                      │
│  (http://localhost:3001/test.html)                          │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Extraction API (Python Flask)                      │
│  POST http://localhost:5000/api/extract                     │
│  ├─ Fetches repo data from GitHub API                       │
│  ├─ Analyzes complexity, frameworks, code patterns          │
│  ├─ Extracts top 15 important files                         │
│  └─ Saves to: /Users/melindayong/syntaxesia/extraction/    │
│     ├─ repo_data.json (metadata + analysis)                 │
│     └─ code_samples/ (extracted code files)                 │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Placard API (Node.js Express)                      │
│  POST http://localhost:3001/api/placard/from-repo-data      │
│  ├─ Reads repo_data.json from extraction directory          │
│  ├─ For each important file:                                │
│  │  ├─ Analyzes code metrics                                │
│  │  ├─ Calls Gemini API to generate:                        │
│  │  │  ├─ Witty museum placard description                  │
│  │  │  └─ Vertex AI Imagen prompt for artwork               │
│  │  └─ Creates complete placard object                      │
│  └─ Returns array of placards                               │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Display Results                                    │
│  Shows placards with:                                        │
│  ├─ Title, Artist, Medium, Year                             │
│  ├─ Witty description                                        │
│  ├─ Code metrics                                             │
│  └─ Imagen prompt (for your teammate to generate artwork)   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 How to Test (Step-by-Step)

### Step 1: Restart Python Extraction API

```bash
# Terminal 1
cd /Users/melindayong/syntaxesia/extraction
python api.py
```

Expected output:
```
✓ GitHub token loaded
==================================================
GitHub Extractor API Server
==================================================
API Endpoints:
  POST   /api/extract        - Extract repo data
  GET    /api/code-sample/:filename - Get code sample
  GET    /api/health         - Health check
==================================================

 * Running on http://127.0.0.1:5000
```

### Step 2: Restart Node Placard API

```bash
# Terminal 2
cd /Users/melindayong/syntaxesia/placard
node server.js
```

Expected output:
```
🎨 Syntaxesia Placard Generator API
Server running on http://localhost:3001

🌐 Demo Interface:
  → http://localhost:3001  (Open in browser to test!)

✨ Combined API Endpoints (RECOMMENDED - Imagen + Placard in 1 call):
  POST /api/placard/generate-with-image-prompt
  POST /api/placard/batch-with-image-prompts
  POST /api/placard/from-repo-data  (uses combined by default)
```

### Step 3: Run Test Script (Optional but Recommended)

```bash
# Terminal 3
cd /Users/melindayong/syntaxesia
./test-pipeline.sh
```

This will verify:
- ✅ Python API is running
- ✅ Node API is running
- ✅ CORS is configured
- ✅ repo_data.json exists

### Step 4: Test in Browser

1. Open: **http://localhost:3001/test.html**
2. Enter a GitHub URL (e.g., `https://github.com/pallets/flask`)
3. Click "Run Full Pipeline"
4. Watch the browser console for detailed logs

---

## 🐛 Debugging Tips

### If extraction fails:
```bash
# Check if Python server is running
curl http://localhost:5000/api/health

# Expected response:
# {"has_token": true, "status": "healthy"}
```

### If placard generation fails:
```bash
# Check if Node server is running
curl http://localhost:3001/health

# Expected response:
# {"service": "syntaxesia-placard-generator", "status": "ok"}

# Check if Gemini API key is set
cat placard/.env | grep GEMINI_API_KEY
```

### If CORS errors persist:
```bash
# Test CORS headers
curl -I -H "Origin: http://localhost:3001" http://localhost:5000/api/health

# Should see:
# Access-Control-Allow-Origin: *
```

---

## 📁 Key Files

| File | Purpose | Location |
|------|---------|----------|
| `extraction/api.py` | Flask API for GitHub extraction | Port 5000 |
| `extraction/github_extractor.py` | Core extraction logic | - |
| `placard/server.js` | Express API for placard generation | Port 3001 |
| `placard/placardGenerator.js` | Placard generation logic | - |
| `placard/geminiClient.js` | Gemini API integration | - |
| `placard/public/test.html` | Test interface | http://localhost:3001/test.html |
| `extraction/repo_data.json` | Extracted repository data | Generated by extraction API |
| `extraction/code_samples/` | Extracted code files | Generated by extraction API |

---

## 🔗 API Endpoints

### Extraction API (Port 5000)
- `POST /api/extract` - Extract repository data
- `GET /api/health` - Health check
- `GET /api/code-sample/:filename` - Get code sample

### Placard API (Port 3001)
- `POST /api/placard/from-repo-data` - Generate placards from repo_data.json
- `POST /api/placard/generate-with-image-prompt` - Generate single placard with Imagen prompt
- `POST /api/placard/batch-with-image-prompts` - Generate multiple placards
- `GET /health` - Health check

---

## ✅ Next Steps

1. **Restart both servers** using the commands above
2. **Run the test script** to verify everything is working
3. **Test in browser** at http://localhost:3001/test.html
4. **Share the Imagen prompts** with your teammate who's building image generation
5. **Wait for the real frontend** - test.html is just a placeholder

---

## 💡 For Your Teammate Building the Frontend

The placard API returns objects in this format:

```json
{
  "title": "app.py",
  "filePath": "src/app.py",
  "artist": "Code by @username",
  "medium": "Mixed complexity, 2024 Python",
  "year": 2024,
  "description": "This piece explores the tension between...",
  "imagenPrompt": "Abstract post-modern artwork featuring angular geometric shapes...",
  "imageUrl": null,
  "metadata": {
    "lines": 340,
    "size": 12500,
    "language": "Python",
    "importanceScore": 85.5,
    "metrics": { ... }
  },
  "generatedAt": "2024-02-07T12:00:00.000Z"
}
```

The `imagenPrompt` field is ready to be passed to Vertex AI Imagen to generate the actual artwork images.

---

**Status**: ✅ Ready to test after server restart
