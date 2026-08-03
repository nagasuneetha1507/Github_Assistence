import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import RepoInput from './components/RepoInput';
import OverviewTab from './components/OverviewTab';
import ArchitectureTab from './components/ArchitectureTab';
import FileTreeTab from './components/FileTreeTab';
import DocumentationTab from './components/DocumentationTab';
import AuditTab from './components/AuditTab';
import RepoChatbot from './components/RepoChatbot';

import { 
  fetchRepoDetails, 
  fetchRepoTree, 
  fetchFileContent, 
  parseRepoInput 
} from './services/githubApi';
import { analyzeRepository } from './services/repoAnalyzer';

import { 
  LayoutDashboard, 
  GitMerge, 
  FolderTree, 
  FileText, 
  ShieldCheck, 
  MessageSquare,
  Star,
  GitFork,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Info
} from 'lucide-react';
import GithubIcon from './components/GithubIcon';

export default function App() {
  // Auto-load keys from localStorage
  const [githubToken, setGithubToken] = useState(() => {
    return localStorage.getItem('repoiq_github_token') || '';
  });
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    return localStorage.getItem('repoiq_gemini_api_key') || '';
  });
  const [groqApiKey, setGroqApiKey] = useState(() => {
    return localStorage.getItem('repoiq_groq_api_key') || '';
  });

  const [recentRepos, setRecentRepos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('repoiq_recent_repos')) || ['expressjs/express', 'fastapi/fastapi', 'pmndrs/zustand'];
    } catch {
      return ['expressjs/express', 'fastapi/fastapi', 'pmndrs/zustand'];
    }
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [repoDetails, setRepoDetails] = useState(null);
  const [fileTree, setFileTree] = useState([]);
  const [analysis, setAnalysis] = useState(null);

  // Key Handlers
  const handleSaveToken = (token) => {
    setGithubToken(token);
    if (token) localStorage.setItem('repoiq_github_token', token);
    else localStorage.removeItem('repoiq_github_token');
  };

  const handleRemoveToken = () => {
    setGithubToken('');
    localStorage.removeItem('repoiq_github_token');
  };

  const handleSaveGeminiApiKey = (key) => {
    setGeminiApiKey(key);
    if (key) localStorage.setItem('repoiq_gemini_api_key', key);
    else localStorage.removeItem('repoiq_gemini_api_key');
  };

  const handleRemoveGeminiApiKey = () => {
    setGeminiApiKey('');
    localStorage.removeItem('repoiq_gemini_api_key');
  };

  const handleSaveGroqApiKey = (key) => {
    setGroqApiKey(key);
    if (key) localStorage.setItem('repoiq_groq_api_key', key);
    else localStorage.removeItem('repoiq_groq_api_key');
  };

  const handleRemoveGroqApiKey = () => {
    setGroqApiKey('');
    localStorage.removeItem('repoiq_groq_api_key');
  };

  // Add to Recent
  const addToRecent = (fullName) => {
    setRecentRepos(prev => {
      const updated = [fullName, ...prev.filter(r => r.toLowerCase() !== fullName.toLowerCase())].slice(0, 6);
      localStorage.setItem('repoiq_recent_repos', JSON.stringify(updated));
      return updated;
    });
  };

  // Main Analyze Handler with Pre-Validations
  const handleAnalyze = async (inputStr) => {
    setError(null);

    // 1. Validate GitHub Token presence
    if (!githubToken) {
      setError('Step 1 Required: Please configure a valid GitHub Personal Access Token before repository analysis.');
      return;
    }

    // 2. Validate Gemini/Groq Key presence
    if (!geminiApiKey && !groqApiKey) {
      setError('Step 2 Required: Please configure a Gemini API Key or Groq API Key before repository analysis.');
      return;
    }

    // 3. Normalize & validate URL
    const parsed = parseRepoInput(inputStr);
    if (!parsed) {
      setError('Invalid repository format. Please enter as "https://github.com/owner/repo" or "owner/repo".');
      return;
    }

    setIsLoading(true);

    try {
      const details = await fetchRepoDetails(parsed.owner, parsed.repo, githubToken);
      const tree = await fetchRepoTree(parsed.owner, parsed.repo, details.default_branch, githubToken);

      let pkgContent = null;
      let readmeContent = null;

      const hasPkg = tree.some(f => f.path === 'package.json');
      if (hasPkg) {
        pkgContent = await fetchFileContent(parsed.owner, parsed.repo, 'package.json', details.default_branch, githubToken);
      }

      const hasReadme = tree.some(f => /^readme\.md$/i.test(f.path));
      if (hasReadme) {
        const readmePath = tree.find(f => /^readme\.md$/i.test(f.path))?.path;
        readmeContent = await fetchFileContent(parsed.owner, parsed.repo, readmePath, details.default_branch, githubToken);
      }

      const analysisResult = analyzeRepository(details, tree, pkgContent, readmeContent);

      setRepoDetails(details);
      setFileTree(tree);
      setAnalysis(analysisResult);
      addToRecent(details.full_name);
      setActiveTab('overview');
    } catch (err) {
      setError(err.message || 'An error occurred while fetching repository analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load default showcase repository
  useEffect(() => {
    if (githubToken && (geminiApiKey || groqApiKey)) {
      handleAnalyze('expressjs/express');
    }
  }, []);

  const hasLlm = !!(geminiApiKey || groqApiKey);

  return (
    <div className="app-root">
      <Navbar 
        currentRepo={repoDetails}
        onSelectPreset={(repoName) => handleAnalyze(repoName)}
        githubToken={githubToken}
        onSaveToken={handleSaveToken}
        onRemoveToken={handleRemoveToken}
        geminiApiKey={geminiApiKey}
        onSaveGeminiApiKey={handleSaveGeminiApiKey}
        onRemoveGeminiApiKey={handleRemoveGeminiApiKey}
        groqApiKey={groqApiKey}
        onSaveGroqApiKey={handleSaveGroqApiKey}
        onRemoveGroqApiKey={handleRemoveGroqApiKey}
        showSettingsModal={showSettingsModal}
        setShowSettingsModal={setShowSettingsModal}
        isLoading={isLoading}
      />

      <main className="main-content">
        {!repoDetails && !isLoading ? (
          <RepoInput 
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            error={error}
            setError={setError}
            recentRepos={recentRepos}
            onSelectRecent={handleAnalyze}
            githubToken={githubToken}
            onSaveToken={handleSaveToken}
            onRemoveToken={handleRemoveToken}
            geminiApiKey={geminiApiKey}
            onSaveGeminiApiKey={handleSaveGeminiApiKey}
            onRemoveGeminiApiKey={handleRemoveGeminiApiKey}
            groqApiKey={groqApiKey}
            onSaveGroqApiKey={handleSaveGroqApiKey}
            onRemoveGroqApiKey={handleRemoveGroqApiKey}
            onOpenSettingsModal={() => setShowSettingsModal(true)}
          />
        ) : (
          <div className="repo-analysis-container">
            {/* Top Bar: Search New & Active Repo Header */}
            <div className="repo-view-header">
              <div className="header-left">
                <button 
                  className="btn-back-search" 
                  onClick={() => setRepoDetails(null)}
                  title="Search another repository"
                >
                  <ArrowLeft size={16} /> <span>New Search</span>
                </button>

                {repoDetails && (
                  <div className="repo-meta-identity">
                    <GithubIcon size={20} className="meta-github-icon" />
                    <div>
                      <div className="meta-title-row">
                        <h1 className="meta-repo-name">{repoDetails.full_name}</h1>
                        <span className="meta-branch-tag">{repoDetails.default_branch}</span>
                        {repoDetails.is_mock && <span className="meta-mock-tag">Cached Analysis</span>}
                      </div>
                      <p className="meta-repo-desc">{repoDetails.description}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="header-right">
                {repoDetails && (
                  <div className="header-stats">
                    <span className="stat-pill"><Star size={13} /> {(repoDetails.stars || 0).toLocaleString()}</span>
                    <span className="stat-pill"><GitFork size={13} /> {(repoDetails.forks || 0).toLocaleString()}</span>
                    <button 
                      className="btn-refresh" 
                      onClick={() => handleAnalyze(repoDetails.full_name)}
                      disabled={isLoading}
                      title="Re-analyze repository"
                    >
                      <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message banner if any */}
            {error && (
              <div className="app-error-banner" style={{ marginBottom: '1.5rem' }}>
                <Info size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Interactive Tab Navigation */}
            <div className="tabs-navigation-bar">
              <button 
                className={`tab-item ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <LayoutDashboard size={16} />
                <span>Overview & Tech Specs</span>
              </button>

              <button 
                className={`tab-item ${activeTab === 'architecture' ? 'active' : ''}`}
                onClick={() => setActiveTab('architecture')}
              >
                <GitMerge size={16} />
                <span>Module Flow Diagram</span>
              </button>

              <button 
                className={`tab-item ${activeTab === 'filetree' ? 'active' : ''}`}
                onClick={() => setActiveTab('filetree')}
              >
                <FolderTree size={16} />
                <span>File Tree & Explainer</span>
              </button>

              <button 
                className={`tab-item ${activeTab === 'docs' ? 'active' : ''}`}
                onClick={() => setActiveTab('docs')}
              >
                <FileText size={16} />
                <span>Auto README</span>
              </button>

              <button 
                className={`tab-item ${activeTab === 'audit' ? 'active' : ''}`}
                onClick={() => setActiveTab('audit')}
              >
                <ShieldCheck size={16} />
                <span>Code Audit ({analysis?.health_score || 0}/100)</span>
              </button>

              <button 
                className={`tab-item ${activeTab === 'chat' ? 'active' : ''}`}
                onClick={() => setActiveTab('chat')}
              >
                <MessageSquare size={16} />
                <span>AI Q&A Assistant {hasLlm ? '⚡' : ''}</span>
              </button>
            </div>

            {/* Active Tab View Body */}
            <div className="tab-view-body">
              {isLoading ? (
                <div className="analysis-loading-screen">
                  <div className="loading-card">
                    <Sparkles className="loading-sparkle spin" size={36} />
                    <h3>Analyzing {repoDetails?.full_name || 'Repository'}</h3>
                    <p>Fetching files, mapping entry points, calculating health metrics, and synthesizing AI insights...</p>
                    <div className="loading-progress-bar">
                      <div className="progress-fill"></div>
                    </div>
                  </div>
                </div>
              ) : analysis && repoDetails ? (
                <>
                  {activeTab === 'overview' && <OverviewTab repoDetails={repoDetails} analysis={analysis} />}
                  {activeTab === 'architecture' && <ArchitectureTab analysis={analysis} />}
                  {activeTab === 'filetree' && (
                    <FileTreeTab 
                      repoDetails={repoDetails} 
                      fileTree={fileTree} 
                      githubToken={githubToken}
                      techStack={analysis.tech_stack} 
                      geminiApiKey={geminiApiKey}
                      groqApiKey={groqApiKey}
                    />
                  )}
                  {activeTab === 'docs' && <DocumentationTab repoDetails={repoDetails} analysis={analysis} />}
                  {activeTab === 'audit' && <AuditTab analysis={analysis} />}
                  {activeTab === 'chat' && (
                    <RepoChatbot 
                      repoDetails={repoDetails} 
                      analysis={analysis} 
                      geminiApiKey={geminiApiKey}
                      groqApiKey={groqApiKey}
                    />
                  )}
                </>
              ) : null}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
