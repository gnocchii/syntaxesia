"""
Flask API wrapper for GitHub Extractor
Allows frontend applications to extract GitHub repo data via REST API
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
from github_extractor import GitHubExtractor

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

# Load GitHub token from environment
GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')

@app.route('/api/extract', methods=['POST'])
def extract_repo():
    """
    Extract data from a GitHub repository

    Request body:
        {
            "github_url": "https://github.com/owner/repo"
        }

    Returns:
        {
            "success": true,
            "data": { ... repo data ... },
            "code_samples_count": 15
        }
    """
    try:
        # Get URL from request
        data = request.get_json()

        if not data or 'github_url' not in data:
            return jsonify({
                "success": False,
                "error": "Missing 'github_url' in request body"
            }), 400

        github_url = data['github_url']

        # Validate URL format
        if not github_url.startswith('https://github.com/'):
            return jsonify({
                "success": False,
                "error": "Invalid GitHub URL format. Must start with 'https://github.com/'"
            }), 400

        # Create extractor and extract data
        extractor = GitHubExtractor(GITHUB_TOKEN)
        repo_data = extractor.extract(github_url)

        # Save code samples to disk
        code_samples_dir = "code_samples"
        if "extracted_code_files" in repo_data:
            os.makedirs(code_samples_dir, exist_ok=True)

            for file_path, file_data in repo_data["extracted_code_files"].items():
                safe_filename = file_path.replace('/', '_')
                output_path = os.path.join(code_samples_dir, safe_filename)

                with open(output_path, "w", encoding="utf-8") as f:
                    f.write(file_data["full_content"])

            # Remove full_content from response to keep it small
            for file_path in repo_data["extracted_code_files"]:
                del repo_data["extracted_code_files"][file_path]["full_content"]

        # Save JSON to file for reference
        with open("repo_data.json", "w") as f:
            json.dump(repo_data, f, indent=2)

        return jsonify({
            "success": True,
            "data": repo_data,
            "code_samples_count": len(repo_data.get("extracted_code_files", {}))
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/code-sample/<filename>', methods=['GET'])
def get_code_sample(filename):
    """
    Retrieve a specific code sample file

    Example: GET /api/code-sample/src_main.py
    """
    try:
        return send_from_directory('code_samples', filename)
    except FileNotFoundError:
        return jsonify({
            "success": False,
            "error": "Code sample file not found"
        }), 404


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "has_token": GITHUB_TOKEN is not None
    })


if __name__ == '__main__':
    # Check for GitHub token
    if not GITHUB_TOKEN:
        print("⚠️  WARNING: No GITHUB_TOKEN found in environment")
        print("   Rate limits will be restricted to 60 requests/hour")
        print("   Set GITHUB_TOKEN in .env file for increased limits")
    else:
        print("✓ GitHub token loaded")

    print("\n" + "="*50)
    print("GitHub Extractor API Server")
    print("="*50)
    print("API Endpoints:")
    print("  POST   /api/extract        - Extract repo data")
    print("  GET    /api/code-sample/:filename - Get code sample")
    print("  GET    /api/health         - Health check")
    print("="*50 + "\n")

    # Run the server
    app.run(debug=True, port=5000)
