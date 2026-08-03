import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  Key, 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Trash2, 
  Zap, 
  Layers, 
  Code2, 
  FileText,
  RefreshCw,
  Info
} from 'lucide-react';
import GithubIcon from './GithubIcon';
import AlertBox from './AlertBox';
import { validateGithubToken } from '../services/githubApi';

export default function RepoInput({ 
  onAnalyze, 
  isLoading, 
  error, 
  setError,
  recentRepos, 
  onSelectRecent,
  githubToken,
  onSaveToken,
  onRemoveToken,
  geminiApiKey,
  onSaveGeminiApiKey,
  onRemoveGeminiApiKey,
  groqApiKey,
  onSaveGroqApiKey,
  onRemoveGroqApiKey,
  onOpenSettingsModal
}) {
  const [inputUrl, setInputUrl] = useState('');
  
  // Local Token Edit states
  const [tokenInput, setTokenInput] = useState('');
  const [isEditingToken, setIsEditingToken] = useState(!githubToken);
  
  // Local LLM Key Edit states
  const [llmKeyInput, setLlmKeyInput] = useState('');
  const [llmProvider, setLlmProvider] = useState('gemini'); // 'gemini' | 'groq'
  const [isEditingLlmKey, setIsEditingLlmKey] = useState(!(geminiApiKey || groqApiKey));

  // Token Validation Status
  const [tokenValidation, setTokenValidation] = useState(null); // { valid: boolean, message: string }
  const [isValidatingToken, setIsValidatingToken] = useState(false);

  // Validate GitHub PAT on mount or token update
  useEffect(() => {
    if (githubToken) {
      checkTokenStatus(githubToken);
    } else {
      setTokenValidation(null);
    }
  }, [githubToken]);

  const checkTokenStatus = async (tok) => {
    setIsValidatingToken(true);
    const res = await validateGithubToken(tok);
    setTokenValidation(res);
    setIsValidatingToken(false);
  };

  const maskKey = (key) => {
    if (!key) return '';
    if (key.length <= 8) return '••••••••';
    return key.slice(0, 4) + '••••••••••••' + key.slice(-4);
  };

  const handleSaveTokenClick = async (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    onSaveToken(tokenInput.trim());
    setIsEditingToken(false);
    await checkTokenStatus(tokenInput.trim());
    if (setError) setError(null);
  };

  const handleSaveLlmKeyClick = (e) => {
    e.preventDefault();
    if (!llmKeyInput.trim()) return;
    if (llmProvider === 'gemini') {
      onSaveGeminiApiKey(llmKeyInput.trim());
    } else {
      onSaveGroqApiKey(llmKeyInput.trim());
    }
    setIsEditingLlmKey(false);
    if (setError) setError(null);
  };

  const handleAnalyzeSubmit = (e) => {
    e.preventDefault();
    
    // Client-side pre-analysis validations
    if (!githubToken) {
      if (setError) setError('Step 1 Required: Please configure and save a GitHub Personal Access Token before analyzing.');
      return;
    }

    if (!geminiApiKey && !groqApiKey) {
      if (setError) setError('Step 2 Required: Please configure and save a Gemini API Key or Groq API Key before analyzing.');
      return;
    }

    if (!inputUrl || !inputUrl.trim()) {
      if (setError) setError('Step 3 Required: Please enter a public GitHub repository URL or owner/repo format.');
      return;
    }

    onAnalyze(inputUrl.trim());
  };

  const sampleRepos = [
    {
      name: "expressjs/express",
      title: "Express.js",
      desc: "Fast, minimalist web framework for Node.js",
      tech: "Node.js • JavaScript",
      badge: "Backend"
    },
    {
      name: "fastapi/fastapi",
      title: "FastAPI",
      desc: "High performance Python API framework",
      tech: "Python 3.8+ • ASGI",
      badge: "Python API"
    },
    {
      name: "pmndrs/zustand",
      title: "Zustand",
      desc: "Bear necessities for state management in React",
      tech: "TypeScript • React",
      badge: "State Management"
    }
  ];

  return (
    <div className="homepage-hero-wrapper">
      <div className="hero-glow-bg"></div>

      <div className="homepage-hero-container">
        {/* Title Header */}
        <div className="hero-compact-header">
          <div className="hero-pill">
            <Sparkles size={14} /> AI-Powered Codebase Intelligence Platform
          </div>
          <h1 className="homepage-main-title">
            AI GitHub Project Assistant
          </h1>
          <p className="homepage-sub-title">
            Configure your API credentials below, paste any public GitHub repository link, and automatically receive visual architecture graphs, file explanations, auto-documentation, code health audits, and context-aware Q&A.
          </p>
        </div>

        {/* Modern Error Alert Banner if validation or API fails */}
        {error && (
          <AlertBox 
            title="Action Required"
            message={error}
            onOpenSettings={onOpenSettingsModal}
            onClose={() => setError && setError(null)}
          />
        )}

        {/* Step-by-Step API & Repo Config Cards Section */}
        <div className="api-config-top-section">
          {/* STEP 1: GitHub PAT */}
          <div className="config-card">
            <div className="card-step-badge">STEP 1</div>
            <div className="config-card-header">
              <div className="card-title-group">
                <Key size={18} className="icon-blue" />
                <h3>GitHub Personal Access Token</h3>
              </div>

              {/* Status Badge */}
              {githubToken && (
                <div className="status-badge-container">
                  {isValidatingToken ? (
                    <span className="status-badge validating"><RefreshCw size={12} className="spin" /> Checking...</span>
                  ) : tokenValidation?.valid ? (
                    <span className="status-badge connected"><CheckCircle2 size={13} /> {tokenValidation.message}</span>
                  ) : (
                    <span className="status-badge error"><XCircle size={13} /> Invalid GitHub Token</span>
                  )}
                </div>
              )}
            </div>

            {githubToken && !isEditingToken ? (
              <div className="saved-key-row">
                <code className="masked-key-display">{maskKey(githubToken)}</code>
                <div className="key-action-btns">
                  <button className="btn-key-edit" onClick={() => setIsEditingToken(true)}>
                    <Edit3 size={14} /> Edit
                  </button>
                  <button className="btn-key-remove" onClick={() => { onRemoveToken(); setIsEditingToken(true); }}>
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveTokenClick} className="config-input-form">
                <input 
                  type="password" 
                  placeholder="Paste GitHub Token (e.g. ghp_xxxxxxxxxxxxxxxxxxxx)"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                />
                <button type="submit" className="btn-save-key" disabled={!tokenInput.trim()}>
                  Save Token
                </button>
              </form>
            )}
          </div>

          {/* STEP 2: Gemini / Groq API Key */}
          <div className="config-card">
            <div className="card-step-badge">STEP 2</div>
            <div className="config-card-header">
              <div className="card-title-group">
                <Cpu size={18} className="icon-purple" />
                <h3>Gemini / Groq LLM API Key</h3>
              </div>

              {(geminiApiKey || groqApiKey) && (
                <span className="status-badge connected">
                  <CheckCircle2 size={13} /> {geminiApiKey ? 'Gemini 2.0 Connected' : 'Groq Llama-3.3 Connected'}
                </span>
              )}
            </div>

            {(geminiApiKey || groqApiKey) && !isEditingLlmKey ? (
              <div className="saved-key-row">
                <code className="masked-key-display">
                  {geminiApiKey ? `[Gemini] ${maskKey(geminiApiKey)}` : `[Groq] ${maskKey(groqApiKey)}`}
                </code>
                <div className="key-action-btns">
                  <button className="btn-key-edit" onClick={() => setIsEditingLlmKey(true)}>
                    <Edit3 size={14} /> Edit
                  </button>
                  <button className="btn-key-remove" onClick={() => { onRemoveGeminiApiKey(); onRemoveGroqApiKey(); setIsEditingLlmKey(true); }}>
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveLlmKeyClick} className="config-input-form">
                <select 
                  value={llmProvider} 
                  onChange={(e) => setLlmProvider(e.target.value)} 
                  className="provider-select"
                >
                  <option value="gemini">Google Gemini API</option>
                  <option value="groq">Groq Llama-3.3 API</option>
                </select>
                <input 
                  type="password" 
                  placeholder={llmProvider === 'gemini' ? 'Paste Gemini Key (AIzaSy...)' : 'Paste Groq Key (gsk_...)'}
                  value={llmKeyInput}
                  onChange={(e) => setLlmKeyInput(e.target.value)}
                />
                <button type="submit" className="btn-save-key" disabled={!llmKeyInput.trim()}>
                  Save API Key
                </button>
              </form>
            )}
          </div>
        </div>

        {/* STEP 3 & 4: Repository URL & Analyze Action */}
        <div className="repo-url-section">
          <div className="section-label-row">
            <span className="card-step-badge inline">STEP 3 & 4</span>
            <label className="input-label">Repository URL or owner/repository</label>
          </div>

          <form onSubmit={handleAnalyzeSubmit} className="main-search-form">
            <div className="search-input-box">
              <GithubIcon className="search-github-icon" size={22} />
              <input 
                type="text" 
                placeholder="https://github.com/facebook/react or facebook/react or expressjs/express"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                disabled={isLoading}
              />
              <button type="submit" className="main-analyze-btn" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Analyzing Codebase...
                  </>
                ) : (
                  <>
                    Analyze Repository <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Recent Searches */}
        {recentRepos && recentRepos.length > 0 && (
          <div className="recent-searches">
            <span className="recent-label"><Zap size={13} /> Quick Analysis Shortcuts:</span>
            <div className="recent-tags">
              {recentRepos.map((repo, idx) => (
                <button 
                  key={idx} 
                  className="recent-tag-btn"
                  onClick={() => onAnalyze(repo)}
                  disabled={isLoading}
                >
                  {repo}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sample Repositories Showcase */}
        <div className="sample-repos-section">
          <h3 className="sample-repos-title">Or test with popular open-source repositories:</h3>
          <div className="sample-grid">
            {sampleRepos.map((sample, idx) => (
              <div 
                key={idx} 
                className="sample-card"
                onClick={() => onAnalyze(sample.name)}
              >
                <div className="sample-card-header">
                  <span className="sample-card-badge">{sample.badge}</span>
                  <GithubIcon size={18} className="sample-icon" />
                </div>
                <h4 className="sample-card-title">{sample.title}</h4>
                <p className="sample-card-desc">{sample.desc}</p>
                <div className="sample-card-footer">
                  <span className="sample-card-tech">{sample.tech}</span>
                  <span className="sample-action">Analyze <ArrowRight size={13} /></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
