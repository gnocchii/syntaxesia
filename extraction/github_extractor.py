import requests
import json
import re
from typing import Dict, List, Any
from urllib.parse import urlparse

class GitHubExtractor:
    def __init__(self, github_token: str = None):
        """
        Initialize GitHub extractor.

        Args:
            github_token: Optional GitHub personal access token for higher rate limits
        """
        self.base_url = "https://api.github.com"
        self.headers = {
            "Accept": "application/vnd.github.v3+json"
        }
        if github_token:
            self.headers["Authorization"] = f"token {github_token}"

    def parse_github_url(self, url: str) -> tuple:
        """Extract owner and repo name from GitHub URL."""
        # Handle both https://github.com/owner/repo and git@github.com:owner/repo.git
        pattern = r'github\.com[:/]([^/]+)/([^/\.]+)'
        match = re.search(pattern, url)
        if match:
            return match.group(1), match.group(2)
        raise ValueError("Invalid GitHub URL")

    def get_repo_metadata(self, owner: str, repo: str) -> Dict[str, Any]:
        """Fetch basic repository metadata."""
        url = f"{self.base_url}/repos/{owner}/{repo}"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()

        data = response.json()
        return {
            "name": data["name"],
            "full_name": data["full_name"],
            "description": data.get("description", ""),
            "language": data.get("language", ""),
            "stars": data.get("stargazers_count", 0),
            "forks": data.get("forks_count", 0),
            "topics": data.get("topics", []),
            "created_at": data.get("created_at", ""),
            "updated_at": data.get("updated_at", ""),
        }

    def get_languages(self, owner: str, repo: str) -> Dict[str, int]:
        """Fetch language breakdown (bytes of code per language)."""
        url = f"{self.base_url}/repos/{owner}/{repo}/languages"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()

    def get_file_tree(self, owner: str, repo: str, branch: str = "main") -> List[Dict[str, Any]]:
        """Fetch repository file tree."""
        # Try main first, fallback to master
        for branch_name in [branch, "master", "main"]:
            try:
                url = f"{self.base_url}/repos/{owner}/{repo}/git/trees/{branch_name}?recursive=1"
                response = requests.get(url, headers=self.headers)
                response.raise_for_status()
                data = response.json()

                # Filter and simplify tree structure
                tree = []
                for item in data.get("tree", []):
                    tree.append({
                        "path": item["path"],
                        "type": item["type"],  # blob (file) or tree (directory)
                        "size": item.get("size", 0)
                    })
                return tree
            except:
                continue
        return []

    def get_readme(self, owner: str, repo: str) -> str:
        """Fetch README content."""
        url = f"{self.base_url}/repos/{owner}/{repo}/readme"
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            data = response.json()

            # Get the actual content
            content_url = data["download_url"]
            content_response = requests.get(content_url)
            content_response.raise_for_status()
            return content_response.text
        except:
            return ""

    def get_key_files(self, owner: str, repo: str, tree: List[Dict]) -> Dict[str, str]:
        """
        Identify and fetch content of key files.

        Looks for common entry points and config files.
        """
        key_patterns = [
            "package.json", "requirements.txt", "setup.py", "Cargo.toml",
            "main.py", "index.js", "index.ts", "app.py", "main.go",
            "docker-compose.yml", "Dockerfile"
        ]

        key_files = {}
        for item in tree:
            if item["type"] == "blob":
                filename = item["path"].split("/")[-1]
                if filename in key_patterns or item["path"] in key_patterns:
                    content = self.get_file_content(owner, repo, item["path"])
                    if content:
                        key_files[item["path"]] = content

        return key_files

    def get_file_content(self, owner: str, repo: str, path: str) -> str:
        """Fetch content of a specific file."""
        url = f"{self.base_url}/repos/{owner}/{repo}/contents/{path}"
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            data = response.json()

            if "download_url" in data:
                content_response = requests.get(data["download_url"])
                content_response.raise_for_status()
                return content_response.text
        except:
            pass
        return ""

    def analyze_complexity(self, tree: List[Dict]) -> Dict[str, Any]:
        """
        Analyze code complexity metrics for satirical commentary.

        Returns metrics like largest files, deepest nesting, etc.
        """
        files = [f for f in tree if f["type"] == "blob"]

        # Find largest files
        sorted_by_size = sorted(files, key=lambda x: x.get("size", 0), reverse=True)
        largest_files = [
            {"path": f["path"], "size": f.get("size", 0)}
            for f in sorted_by_size[:5]
        ]

        # Calculate average file size
        total_size = sum(f.get("size", 0) for f in files)
        avg_file_size = total_size / len(files) if files else 0

        # Find deepest directory nesting
        max_depth = 0
        deepest_path = ""
        for f in files:
            depth = f["path"].count("/")
            if depth > max_depth:
                max_depth = depth
                deepest_path = f["path"]

        # Estimate total lines of code (rough estimate: avg 50 chars per line)
        estimated_loc = total_size // 50

        return {
            "largest_files": largest_files,
            "average_file_size_bytes": round(avg_file_size, 2),
            "total_size_bytes": total_size,
            "estimated_lines_of_code": estimated_loc,
            "max_directory_depth": max_depth,
            "deepest_file_path": deepest_path,
            "total_files": len(files)
        }

    def detect_frameworks(self, key_files: Dict[str, str]) -> List[str]:
        """
        Detect frameworks and technologies from dependency files.

        Useful for understanding the tech stack.
        """
        frameworks = []

        # Check package.json for JavaScript frameworks
        if "package.json" in key_files:
            content = key_files["package.json"].lower()
            if "react" in content:
                frameworks.append("React")
            if "vue" in content:
                frameworks.append("Vue")
            if "angular" in content:
                frameworks.append("Angular")
            if "express" in content:
                frameworks.append("Express")
            if "next" in content:
                frameworks.append("Next.js")
            if "svelte" in content:
                frameworks.append("Svelte")

        # Check requirements.txt for Python frameworks
        if "requirements.txt" in key_files:
            content = key_files["requirements.txt"].lower()
            if "django" in content:
                frameworks.append("Django")
            if "flask" in content:
                frameworks.append("Flask")
            if "fastapi" in content:
                frameworks.append("FastAPI")
            if "tensorflow" in content:
                frameworks.append("TensorFlow")
            if "pytorch" in content:
                frameworks.append("PyTorch")

        # Check Cargo.toml for Rust frameworks
        if "Cargo.toml" in key_files:
            content = key_files["Cargo.toml"].lower()
            if "actix" in content:
                frameworks.append("Actix")
            if "rocket" in content:
                frameworks.append("Rocket")

        # Check for Docker
        if "Dockerfile" in key_files or "docker-compose.yml" in key_files:
            frameworks.append("Docker")

        return frameworks

    def analyze_readme(self, readme: str) -> Dict[str, Any]:
        """
        Analyze README to extract key characteristics for image generation.

        Identifies project type, key terms, and distinctive features.
        """
        if not readme:
            return {
                "key_terms": [],
                "project_type": "unknown",
                "features": [],
                "tech_keywords": []
            }

        readme_lower = readme.lower()

        # Detect project type from common patterns
        project_type = "library"  # default
        if any(term in readme_lower for term in ["web app", "web application", "dashboard", "frontend"]):
            project_type = "web_application"
        elif any(term in readme_lower for term in ["cli tool", "command line", "terminal"]):
            project_type = "cli_tool"
        elif any(term in readme_lower for term in ["api", "rest", "graphql", "endpoint"]):
            project_type = "api_service"
        elif any(term in readme_lower for term in ["operating system", "kernel", "os"]):
            project_type = "operating_system"
        elif any(term in readme_lower for term in ["framework", "library", "package"]):
            project_type = "library"
        elif any(term in readme_lower for term in ["database", "storage", "data store"]):
            project_type = "database"
        elif any(term in readme_lower for term in ["machine learning", "ml", "ai", "neural network"]):
            project_type = "ml_ai"
        elif any(term in readme_lower for term in ["game", "engine", "graphics"]):
            project_type = "game_engine"

        # Extract technical keywords (common tech terms)
        tech_keywords = []
        tech_terms = [
            "kubernetes", "docker", "microservices", "serverless", "cloud",
            "react", "vue", "angular", "node", "typescript", "javascript",
            "python", "rust", "go", "java", "c++", "c#",
            "async", "concurrent", "parallel", "distributed",
            "security", "encryption", "authentication", "oauth",
            "api", "rest", "graphql", "grpc",
            "database", "sql", "nosql", "redis", "postgres", "mongodb",
            "machine learning", "neural network", "deep learning",
            "blockchain", "smart contract", "web3",
            "real-time", "streaming", "websocket",
            "testing", "ci/cd", "devops"
        ]

        for term in tech_terms:
            if term in readme_lower:
                tech_keywords.append(term)

        # Extract feature-like bullet points (lines starting with -, *, or •)
        features = []
        lines = readme.split('\n')
        for line in lines[:100]:  # Only check first 100 lines
            stripped = line.strip()
            if stripped.startswith(('-', '*', '•', '✓', '✔')) and len(stripped) > 5:
                # Clean up the feature text
                feature = stripped[1:].strip()
                if 10 < len(feature) < 100:  # Reasonable feature length
                    features.append(feature)

        # Limit to top 5 features
        features = features[:5]

        # Extract key terms (capitalized words, likely important concepts)
        import re
        words = re.findall(r'\b[A-Z][a-z]+(?:[A-Z][a-z]+)*\b', readme)
        # Filter out common words
        common_words = {'The', 'This', 'That', 'These', 'Those', 'There', 'Here', 'What', 'When', 'Where', 'Why', 'How', 'Who', 'Which'}
        key_terms = [w for w in words if w not in common_words and len(w) > 3]
        # Get unique terms, keep first 10
        seen = set()
        unique_terms = []
        for term in key_terms:
            if term.lower() not in seen:
                seen.add(term.lower())
                unique_terms.append(term)
                if len(unique_terms) >= 10:
                    break

        return {
            "project_type": project_type,
            "tech_keywords": tech_keywords[:15],  # Limit to 15 most relevant
            "features": features,
            "key_terms": unique_terms
        }

    def extract_important_files(self, owner: str, repo: str, tree: List[Dict], key_files: Dict[str, str]) -> Dict[str, Any]:
        """
        Extract code from the most important/representative files.

        Prioritizes:
        - Entry points (main.*, index.*, app.*)
        - Large source files (not binaries)
        - Root-level configuration
        - Files already identified as key files

        Returns up to 15 files with their content.
        """
        import os

        # File extensions we want to extract (actual code, not binaries)
        code_extensions = {
            '.py', '.js', '.ts', '.jsx', '.tsx', '.rs', '.go', '.java', '.c', '.cpp',
            '.h', '.hpp', '.cs', '.rb', '.php', '.swift', '.kt', '.scala', '.sh',
            '.toml', '.yaml', '.yml', '.json', '.xml', '.sql', '.md'
        }

        # Important file name patterns
        important_names = {
            'main', 'index', 'app', 'server', 'client', 'config', 'settings',
            '__init__', 'mod', 'lib', 'core', 'utils', 'helper'
        }

        # Score each file for importance
        scored_files = []

        for item in tree:
            if item["type"] != "blob":
                continue

            path = item["path"]
            size = item.get("size", 0)

            # Skip very large files (likely binaries) and very small files
            if size > 500000 or size < 10:
                continue

            # Check if it's a code file
            _, ext = os.path.splitext(path)
            if ext.lower() not in code_extensions:
                continue

            # Calculate importance score
            score = 0

            # Boost for file size (larger = more important, up to a point)
            score += min(size / 1000, 100)  # Max 100 points for size

            # Boost for being in root or shallow directories
            depth = path.count('/')
            score += max(0, 50 - (depth * 10))  # Prefer shallow files

            # Boost for important names
            filename = os.path.basename(path).lower()
            name_without_ext = os.path.splitext(filename)[0]
            if any(important in name_without_ext for important in important_names):
                score += 100

            # Boost if it's already in key_files
            if path in key_files:
                score += 150

            # Boost for certain extensions
            if ext in ['.rs', '.py', '.js', '.ts', '.go']:
                score += 20

            scored_files.append({
                'path': path,
                'size': size,
                'score': score
            })

        # Sort by score and take top 15
        scored_files.sort(key=lambda x: x['score'], reverse=True)
        top_files = scored_files[:15]

        # Extract content for these files
        extracted_files = {}
        print(f"  Extracting {len(top_files)} important files...")

        for file_info in top_files:
            path = file_info['path']

            # Check if we already have this content in key_files
            if path in key_files:
                content = key_files[path]
            else:
                content = self.get_file_content(owner, repo, path)

            if content:
                # Take first 200 lines for JSON (keep it reasonable)
                lines = content.split('\n')
                snippet = '\n'.join(lines[:200])

                extracted_files[path] = {
                    'full_content': content,
                    'snippet': snippet,
                    'lines': len(lines),
                    'size': file_info['size'],
                    'importance_score': file_info['score']
                }

        return extracted_files

    def detect_code_smells(self, metadata: Dict, complexity: Dict) -> Dict[str, Any]:
        """
        Detect potential code smells for satirical placard generation.

        Returns indicators that might be funny/interesting.
        """
        from datetime import datetime

        smells = []

        # Check if repo is stale
        try:
            updated_at = datetime.fromisoformat(metadata["updated_at"].replace("Z", "+00:00"))
            days_since_update = (datetime.now(updated_at.tzinfo) - updated_at).days
            if days_since_update > 365:
                smells.append({
                    "type": "stale_repo",
                    "description": f"Last updated {days_since_update} days ago",
                    "severity": "medium"
                })
        except:
            pass

        # Check for very large files (potential god objects)
        if complexity["largest_files"]:
            largest = complexity["largest_files"][0]
            if largest["size"] > 100000:  # > 100KB
                smells.append({
                    "type": "massive_file",
                    "description": f"Contains {largest['path']} ({largest['size']} bytes)",
                    "severity": "high"
                })

        # Check for deep nesting (potential over-engineering)
        if complexity["max_directory_depth"] > 6:
            smells.append({
                "type": "deep_nesting",
                "description": f"Directory nesting reaches {complexity['max_directory_depth']} levels deep",
                "severity": "medium"
            })

        # Check for low activity (might be abandoned)
        if metadata["stars"] < 5 and metadata["forks"] < 2:
            smells.append({
                "type": "low_engagement",
                "description": "Minimal community engagement",
                "severity": "low"
            })

        # Check for very high file count (might be bloated)
        if complexity["total_files"] > 500:
            smells.append({
                "type": "file_bloat",
                "description": f"Contains {complexity['total_files']} files",
                "severity": "medium"
            })

        return {
            "smells": smells,
            "smell_count": len(smells),
            "has_issues": len(smells) > 0
        }

    def extract(self, github_url: str) -> Dict[str, Any]:
        """
        Main extraction method - pulls all relevant info from a GitHub repo.

        Args:
            github_url: Full GitHub repository URL

        Returns:
            Dictionary containing all extracted repository information
        """
        owner, repo = self.parse_github_url(github_url)

        print(f"Extracting data from {owner}/{repo}...")

        # Get all the data
        metadata = self.get_repo_metadata(owner, repo)
        languages = self.get_languages(owner, repo)
        tree = self.get_file_tree(owner, repo)
        readme = self.get_readme(owner, repo)
        key_files = self.get_key_files(owner, repo, tree)

        # Calculate language percentages
        total_bytes = sum(languages.values())
        language_percentages = {
            lang: round((bytes / total_bytes) * 100, 2)
            for lang, bytes in languages.items()
        } if total_bytes > 0 else {}

        # NEW: Perform analysis for image generation and placard creation
        print("Analyzing code complexity...")
        complexity = self.analyze_complexity(tree)

        print("Detecting frameworks...")
        frameworks = self.detect_frameworks(key_files)

        print("Analyzing README for project context...")
        readme_analysis = self.analyze_readme(readme)

        print("Extracting important code files...")
        important_files = self.extract_important_files(owner, repo, tree, key_files)

        print("Detecting code patterns...")
        code_smells = self.detect_code_smells(metadata, complexity)

        return {
            "metadata": metadata,
            "languages": {
                "breakdown": languages,
                "percentages": language_percentages
            },
            "file_tree": tree,
            "readme": readme,
            "key_files": key_files,
            "summary": {
                "total_files": len([f for f in tree if f["type"] == "blob"]),
                "total_directories": len([f for f in tree if f["type"] == "tree"]),
                "main_language": metadata["language"],
                "file_types": list(set([f["path"].split(".")[-1] for f in tree if "." in f["path"]]))
            },
            # NEW: Analysis data for downstream components
            "analysis": {
                "complexity": complexity,
                "frameworks": frameworks,
                "readme_insights": readme_analysis,
                "code_smells": code_smells,
                "important_files": {
                    path: {
                        "snippet": data["snippet"],
                        "lines": data["lines"],
                        "size": data["size"],
                        "importance_score": data["importance_score"],
                        "saved_to": f"code_samples/{path.replace('/', '_')}"
                    }
                    for path, data in important_files.items()
                }
            },
            # Reference to extracted code files
            "code_samples_dir": "code_samples",
            # Full file contents (will be saved to disk and removed from JSON)
            "extracted_code_files": important_files
        }


def main():
    """Example usage"""
    import sys
    import os

    if len(sys.argv) < 2:
        print("Usage: python github_extractor.py <github_repo_url> [github_token]")
        print("Example: python github_extractor.py https://github.com/owner/repo")
        print("\nTip: Set GITHUB_TOKEN environment variable to avoid passing token in command")
        sys.exit(1)

    github_url = sys.argv[1]

    # Priority: 1) Command-line arg, 2) Environment variable, 3) None
    github_token = sys.argv[2] if len(sys.argv) > 2 else os.getenv('GITHUB_TOKEN')

    if github_token:
        print("✓ Using GitHub token (increased rate limits)")
    else:
        print("⚠ No token provided - limited to 60 requests/hour")

    extractor = GitHubExtractor(github_token)

    try:
        data = extractor.extract(github_url)

        # Save extracted code files to disk
        import os
        code_samples_dir = "code_samples"
        if "extracted_code_files" in data:
            os.makedirs(code_samples_dir, exist_ok=True)
            print(f"\nSaving code samples to {code_samples_dir}/...")

            for file_path, file_data in data["extracted_code_files"].items():
                # Create safe filename
                safe_filename = file_path.replace('/', '_')
                output_path = os.path.join(code_samples_dir, safe_filename)

                # Write the full content
                with open(output_path, "w", encoding="utf-8") as f:
                    f.write(file_data["full_content"])

            print(f"✓ Saved {len(data['extracted_code_files'])} code files")

            # Remove full_content from JSON to keep it smaller
            for file_path in data["extracted_code_files"]:
                del data["extracted_code_files"][file_path]["full_content"]

        # Pretty print the JSON
        output = json.dumps(data, indent=2)
        print("\n" + "="*50)
        print("EXTRACTION COMPLETE")
        print("="*50)
        print(output)

        # Save to file
        output_file = "repo_data.json"
        with open(output_file, "w") as f:
            f.write(output)
        print(f"\n✓ Saved metadata to {output_file}")

    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
