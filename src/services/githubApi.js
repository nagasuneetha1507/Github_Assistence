/**
 * Service to interact with public GitHub REST API with robust error handling and token validation.
 */
import { MOCK_REPOSITORIES } from '../data/mockRepos.js';

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Normalizes input URL or string into { owner, repo }
 * Accepts:
 * - https://github.com/facebook/react
 * - https://github.com/facebook/react/tree/main/src
 * - http://github.com/facebook/react.git
 * - facebook/react
 * - expressjs/express
 */
export function parseRepoInput(input) {
  if (!input || typeof input !== 'string') return null;
  let cleaned = input.trim();
  
  // Remove protocol and domain if present
  cleaned = cleaned.replace(/^https?:\/\/(www\.)?github\.com\//i, '');
  cleaned = cleaned.replace(/\.git$/i, '');
  cleaned = cleaned.replace(/\/$/, '');

  // If URL has /tree/branch/subpath, strip extra path
  if (cleaned.includes('/tree/')) {
    cleaned = cleaned.split('/tree/')[0];
  }
  if (cleaned.includes('/blob/')) {
    cleaned = cleaned.split('/blob/')[0];
  }

  const parts = cleaned.split('/').filter(Boolean);
  if (parts.length >= 2) {
    return { owner: parts[0], repo: parts[1] };
  }
  return null;
}

/**
 * Format authorization header
 */
function getHeaders(token = null) {
  const headers = {
    'Accept': 'application/vnd.github.v3+json'
  };
  if (token && token.trim()) {
    const t = token.trim();
    headers['Authorization'] = t.startsWith('Bearer ') || t.startsWith('token ') ? t : `token ${t}`;
  }
  return headers;
}

/**
 * Test & validate GitHub Personal Access Token against GET https://api.github.com/user
 */
export async function validateGithubToken(token) {
  if (!token || !token.trim()) {
    return { valid: false, message: 'No GitHub Personal Access Token provided.' };
  }

  try {
    const res = await fetch(`${GITHUB_API_BASE}/user`, {
      headers: getHeaders(token)
    });

    if (res.ok) {
      const data = await res.json();
      return { 
        valid: true, 
        user: data.login, 
        name: data.name || data.login, 
        avatar: data.avatar_url,
        message: `GitHub Connected as @${data.login}`
      };
    }

    if (res.status === 401) {
      return { 
        valid: false, 
        status: 401, 
        message: 'GitHub authentication failed. Check your Personal Access Token.' 
      };
    }

    if (res.status === 403) {
      return { 
        valid: false, 
        status: 403, 
        message: 'GitHub API rate limit exceeded or token forbidden.' 
      };
    }

    return { 
      valid: false, 
      status: res.status, 
      message: `GitHub token verification returned HTTP ${res.status}.` 
    };
  } catch (err) {
    return { 
      valid: false, 
      message: 'Network Error: Cannot connect to GitHub API.' 
    };
  }
}

/**
 * Fetch main repository details with friendly error mapping
 */
export async function fetchRepoDetails(owner, repo, token = null) {
  const repoKey = `${owner}/${repo}`.toLowerCase();
  
  try {
    const res = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
      headers: getHeaders(token)
    });
    
    if (res.ok) {
      const data = await res.json();
      return {
        owner: data.owner.login,
        repo: data.name,
        full_name: data.full_name,
        description: data.description || 'No description provided.',
        stars: data.stargazers_count,
        forks: data.forks_count,
        open_issues: data.open_issues_count,
        language: data.language || 'Multi-language',
        license: data.license ? data.license.spdx_id || data.license.name : 'Unlicensed',
        default_branch: data.default_branch || 'main',
        updated_at: data.updated_at,
        topics: data.topics || [],
        is_mock: false
      };
    }
    
    // Map HTTP error codes to clear user-friendly messages
    if (res.status === 401) {
      if (MOCK_REPOSITORIES[repoKey]) {
        return { 
          ...MOCK_REPOSITORIES[repoKey], 
          is_mock: true, 
          fallback_reason: 'GitHub authentication failed (HTTP 401). Displaying pre-cached dataset.' 
        };
      }
      throw new Error('GitHub authentication failed. Please configure a valid GitHub Personal Access Token.');
    } 
    
    if (res.status === 403) {
      if (MOCK_REPOSITORIES[repoKey]) {
        return { 
          ...MOCK_REPOSITORIES[repoKey], 
          is_mock: true, 
          fallback_reason: 'GitHub API rate limit exceeded (HTTP 403). Displaying pre-cached dataset.' 
        };
      }
      throw new Error('GitHub API rate limit exceeded. Please configure a valid Personal Access Token.');
    } 
    
    if (res.status === 404) {
      if (MOCK_REPOSITORIES[repoKey]) {
        return { 
          ...MOCK_REPOSITORIES[repoKey], 
          is_mock: true, 
          fallback_reason: 'Repository not found on live GitHub API (HTTP 404). Displaying pre-cached dataset.' 
        };
      }
      throw new Error(`Repository "${owner}/${repo}" not found. Please check the URL or repository privacy settings.`);
    }

    if (res.status >= 500) {
      throw new Error('Internal server error occurred while connecting to GitHub.');
    }

    throw new Error(`GitHub API returned HTTP ${res.status}. Please check your credentials.`);
  } catch (err) {
    if (MOCK_REPOSITORIES[repoKey] && !err.message.includes('not found')) {
      return { 
        ...MOCK_REPOSITORIES[repoKey], 
        is_mock: true, 
        fallback_reason: err.message 
      };
    }
    throw err;
  }
}

/**
 * Fetch recursive file tree for repository
 */
export async function fetchRepoTree(owner, repo, defaultBranch = 'main', token = null) {
  const repoKey = `${owner}/${repo}`.toLowerCase();

  try {
    const res = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`, {
      headers: getHeaders(token)
    });

    if (res.ok) {
      const data = await res.json();
      return (data.tree || []).map(item => ({
        path: item.path,
        type: item.type === 'tree' ? 'folder' : 'file',
        size: item.size || 0,
        sha: item.sha
      }));
    }

    if (MOCK_REPOSITORIES[repoKey]) {
      return MOCK_REPOSITORIES[repoKey].file_tree;
    }
    return [];
  } catch (err) {
    if (MOCK_REPOSITORIES[repoKey]) {
      return MOCK_REPOSITORIES[repoKey].file_tree;
    }
    throw err;
  }
}

/**
 * Fetch file content
 */
export async function fetchFileContent(owner, repo, filePath, defaultBranch = 'main', token = null) {
  const repoKey = `${owner}/${repo}`.toLowerCase();

  if (MOCK_REPOSITORIES[repoKey] && MOCK_REPOSITORIES[repoKey].sample_files && MOCK_REPOSITORIES[repoKey].sample_files[filePath]) {
    return MOCK_REPOSITORIES[repoKey].sample_files[filePath];
  }

  try {
    const res = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${filePath}`, {
      headers: getHeaders(token)
    });

    if (res.ok) {
      return await res.text();
    }

    const apiRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${filePath}?ref=${defaultBranch}`, {
      headers: getHeaders(token)
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.content && data.encoding === 'base64') {
        return atob(data.content.replace(/\n/g, ''));
      }
    }

    return `// Code preview for ${filePath}\n// File content unavailable or binary.`;
  } catch (err) {
    return `// Error loading content for ${filePath}: ${err.message}`;
  }
}
