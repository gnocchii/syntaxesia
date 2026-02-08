# GitHub Code Extractor

Extracts structured information and code samples from GitHub repositories for AI-powered analysis, image generation, and satirical museum placard creation.

## Features

### Data Extraction
- **Metadata**: Repository name, description, stars, forks, topics, creation/update dates
- **Languages**: Language breakdown with byte counts and percentages
- **File Tree**: Complete directory structure with all files and folders
- **README**: Full README content for context
- **Key Files**: Important config files (package.json, requirements.txt, Cargo.toml, etc.)

### Advanced Analysis
- **Complexity Metrics**: Largest files, average file size, directory depth, estimated lines of code
- **Framework Detection**: Automatically identifies React, Vue, Angular, Django, Flask, FastAPI, Docker, and more
- **README Insights**: Extracts project type, tech keywords, feature lists, and key terms for AI image generation
- **Code Extraction**: Saves up to 15 most important code files to `code_samples/` folder
- **Code Smell Detection**: Identifies potential issues like massive files, deep nesting, stale repos, file bloat

### Output Format
- **JSON file** (`repo_data.json`): Structured metadata and analysis
- **Code samples folder** (`code_samples/`): Actual code files for detailed analysis
- Optimized for downstream AI processing (DALL-E image generation, Gemini placard creation)

---

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Get a GitHub Token (Recommended)

Without a token, you're limited to **60 requests/hour**. With a token, you get **5000 requests/hour**.

1. Go to https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Select scopes: `repo` (for private repos) or leave blank (for public repos only)
4. Copy the token

### 3. Configure Environment

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your token:

```
GITHUB_TOKEN=your_actual_github_token_here
```

**Important**: Never commit `.env` to git! It's already in `.gitignore`.

---

## Usage

### Option 1: Command Line Interface (CLI)

**Basic usage** (60 requests/hour limit):
```bash
python github_extractor.py https://github.com/owner/repo
```

**With environment variable** (5000 requests/hour):
```bash
# Token is automatically loaded from .env file
python github_extractor.py https://github.com/pallets/flask
```

**With inline token**:
```bash
python github_extractor.py https://github.com/owner/repo YOUR_GITHUB_TOKEN
```

### Option 2: REST API (For Frontend Integration)

Start the Flask API server:

```bash
python api.py
```

The server runs on `http://localhost:5000` with CORS enabled.

#### API Endpoints

**1. Extract Repository Data**

```http
POST /api/extract
Content-Type: application/json

{
  "github_url": "https://github.com/owner/repo"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "metadata": { ... },
    "languages": { ... },
    "analysis": {
      "complexity": { ... },
      "frameworks": ["React", "Express", "Docker"],
      "readme_insights": { ... },
      "code_smells": { ... },
      "important_files": { ... }
    }
  },
  "code_samples_count": 15
}
```

**2. Get Code Sample File**

```http
GET /api/code-sample/src_main.py
```

Returns the raw code file content.

**3. Health Check**

```http
GET /api/health
```

Returns server status and token availability.

#### Frontend Integration Example (React)

```javascript
// Extract repository data
const extractRepo = async (githubUrl) => {
  const response = await fetch('http://localhost:5000/api/extract', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ github_url: githubUrl })
  });

  const result = await response.json();

  if (result.success) {
    console.log('Repo data:', result.data);
    console.log('Code samples extracted:', result.code_samples_count);

    // Pass data to DALL-E for image generation
    // Pass data to Gemini for placard generation
  }
};

// Usage
extractRepo('https://github.com/facebook/react');
```

---

## Output Structure

### JSON Output (`repo_data.json`)

```json
{
  "metadata": {
    "name": "flask",
    "full_name": "pallets/flask",
    "description": "A lightweight WSGI web application framework",
    "stars": 67000,
    "forks": 16000,
    "language": "Python",
    "topics": ["python", "web-framework", "wsgi"],
    "created_at": "2010-04-06T11:13:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "languages": {
    "breakdown": {
      "Python": 500000,
      "HTML": 50000
    },
    "percentages": {
      "Python": 90.91,
      "HTML": 9.09
    }
  },
  "analysis": {
    "complexity": {
      "largest_files": [...],
      "average_file_size_bytes": 5432.21,
      "total_size_bytes": 550000,
      "estimated_lines_of_code": 11000,
      "max_directory_depth": 4,
      "deepest_file_path": "src/flask/cli.py",
      "total_files": 101
    },
    "frameworks": ["Flask", "Pytest", "Docker"],
    "readme_insights": {
      "project_type": "library",
      "tech_keywords": ["python", "web-framework", "wsgi", "async"],
      "features": ["Simple and lightweight", "Built-in development server", ...],
      "key_terms": ["Flask", "WSGI", "Werkzeug", "Jinja"]
    },
    "code_smells": {
      "smells": [...],
      "smell_count": 2,
      "has_issues": true
    },
    "important_files": {
      "src/flask/app.py": {
        "snippet": "...",
        "lines": 850,
        "size": 45000,
        "importance_score": 275.5,
        "saved_to": "code_samples/src_flask_app.py"
      }
    }
  },
  "summary": {
    "total_files": 101,
    "total_directories": 25,
    "main_language": "Python",
    "file_types": ["py", "txt", "md", "yml", ...]
  }
}
```

### Code Samples Directory

```
code_samples/
├── src_flask_app.py          (Main application file)
├── src_flask_cli.py          (CLI utilities)
├── setup.py                  (Package config)
├── tests_test_basic.py       (Test suite)
└── ... (up to 15 files)
```

---

## Architecture

This extractor is part of a larger **"Code as Museum Art"** pipeline:

```
┌─────────────────┐
│  User Input     │
│  (GitHub URL)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  This Extractor │ ◄── You are here
│  • Analyze repo │
│  • Extract code │
│  • Save JSON    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  DALL-E Image   │
│  Generation     │
│  (by teammate)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Gemini Placard │
│  Generation     │
│  (by teammate)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Display to     │
│  User           │
│  • Artwork.png  │
│  • Placard.txt  │
└─────────────────┘
```

---

## Limitations

- **Rate Limits**: 60 requests/hour without token, 5000/hour with token
- **Code Samples**: Limited to 15 files to avoid overwhelming large repositories
- **File Size**: Files larger than 500KB are skipped to avoid memory issues
- **Binary Files**: Only text-based code files are extracted (no images, PDFs, etc.)
- **Large Repos**: Very large repos (>10,000 files) may take several minutes to process
- **Private Repos**: Requires GitHub token with `repo` scope

---

## Troubleshooting

### "API rate limit exceeded"
- Add a GitHub token to `.env` file
- Wait an hour if you've exceeded limits
- Check remaining rate limit: `curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/rate_limit`

### "CORS error" (from frontend)
- Make sure `flask-cors` is installed: `pip install flask-cors`
- API automatically enables CORS for all origins
- Check that the API server is running on the expected port

### "Invalid GitHub URL"
- URL must start with `https://github.com/`
- Format: `https://github.com/owner/repository`
- Don't include trailing slashes or extra paths

### Code samples not saving
- Check write permissions in the current directory
- Ensure `code_samples/` folder can be created
- Check disk space availability

---

## Security Notes

- **Never commit `.env`**: Contains your GitHub token (already in `.gitignore`)
- **Token Rotation**: If you accidentally expose your token, regenerate it immediately at https://github.com/settings/tokens
- **Minimal Scopes**: Use tokens with minimal required scopes (no scopes needed for public repos)
- **API Security**: For production, add authentication to the API endpoints

---

## Development

### Project Structure
```
extraction/
├── github_extractor.py   # Core extraction logic
├── api.py                # Flask API wrapper
├── requirements.txt      # Python dependencies
├── .env.example          # Template for environment variables
├── .env                  # Your secrets (gitignored)
├── .gitignore           # Excluded files
├── README.md            # This file
├── repo_data.json       # Output JSON (gitignored)
└── code_samples/        # Extracted code (gitignored)
```

### Running Tests
```bash
# Test CLI
python github_extractor.py https://github.com/pallets/flask

# Test API
python api.py
# In another terminal:
curl -X POST http://localhost:5000/api/extract \
  -H "Content-Type: application/json" \
  -d '{"github_url": "https://github.com/pallets/flask"}'
```

---

## License

MIT License - Feel free to use this for your "Code as Museum Art" project!

---

## Contributing

This is part of a team project. If you're a teammate:
1. Never commit `.env` (it's gitignored)
2. Update this README if you add features
3. Test with various repo sizes before pushing
4. Coordinate API changes with the frontend developer

---

## Contact

For questions about integration or issues, contact the extraction team member (Melinda).
