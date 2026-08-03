import React, { useState } from 'react';
import { 
  GitBranch, 
  Key, 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  Zap,
  FolderGit2,
  Cpu,
  CheckCircle2,
  BrainCircuit,
  Settings,
  RefreshCw,
  XCircle,
  Trash2
} from 'lucide-react';
import GithubIcon from './GithubIcon';
import { validateGithubToken } from '../services/githubApi';

export default function Navbar({ 
  currentRepo, 
  onSelectPreset, 
  githubToken, 
  onSaveToken,
  onRemoveToken,
  geminiApiKey,
  onSaveGeminiApiKey,
  onRemoveGeminiApiKey,
  groqApiKey,
  onSaveGroqApiKey,
  onRemoveGroqApiKey,
  showSettingsModal,
  setShowSettingsModal,
  isLoading 
}) {
  const [githubTokenInput, setGithubTokenInput] = useState(githubToken || '');
  const [geminiApiKeyInput, setGeminiApiKeyInput] = useState(geminiApiKey || '');
  const [groqApiKeyInput, setGroqApiKeyInput] = useState(groqApiKey || '');

  const [testingStatus, setTestingStatus] = useState(null); // { github: res, gemini: boolean, groq: boolean }
  const [isTesting, setIsTesting] = useState(false);

  const handleSaveSettings = () => {
    onSaveToken(githubTokenInput.trim());
    onSaveGeminiApiKey(geminiApiKeyInput.trim());
    onSaveGroqApiKey(groqApiKeyInput.trim());
    setShowSettingsModal(false);
  };

  const handleTestConnections = async () => {
    setIsTesting(true);
    setTestingStatus(null);

    const ghRes = githubTokenInput.trim() ? await validateGithubToken(githubTokenInput.trim()) : { valid: false, message: 'No Token' };
    
    setTestingStatus({
      github: ghRes,
      gemini: !!geminiApiKeyInput.trim(),
      groq: !!groqApiKeyInput.trim()
    });
    setIsTesting(false);
  };

  const hasLlmKey = !!(geminiApiKey || groqApiKey);

  return (
    <header className="app-navbar">
      <div className="navbar-container">
        {/* Brand / Logo */}
        <div className="navbar-brand">
          <div className="brand-icon-wrapper">
            <Sparkles className="brand-icon" />
          </div>
          <div className="brand-text">
            <span className="brand-name">RepoIQ</span>
            <span className="brand-tag">AI CODEBASE PLATFORM</span>
          </div>
        </div>

        {/* Preset Repositories Quick Switcher */}
        <div className="navbar-presets">
          <span className="presets-label"><FolderGit2 size={14} /> Featured Repos:</span>
          <div className="preset-chips">
            <button 
              className={`preset-btn ${currentRepo?.full_name === 'expressjs/express' ? 'active' : ''}`}
              onClick={() => onSelectPreset('expressjs/express')}
              disabled={isLoading}
            >
              Express.js
            </button>
            <button 
              className={`preset-btn ${currentRepo?.full_name === 'fastapi/fastapi' ? 'active' : ''}`}
              onClick={() => onSelectPreset('fastapi/fastapi')}
              disabled={isLoading}
            >
              FastAPI
            </button>
            <button 
              className={`preset-btn ${currentRepo?.full_name === 'pmndrs/zustand' ? 'active' : ''}`}
              onClick={() => onSelectPreset('pmndrs/zustand')}
              disabled={isLoading}
            >
              Zustand
            </button>
          </div>
        </div>

        {/* Actions & Settings */}
        <div className="navbar-actions">
          {currentRepo && (
            <a 
              href={`https://github.com/${currentRepo.full_name}`} 
              target="_blank" 
              rel="noreferrer" 
              className="github-link-btn"
              title="Open on GitHub"
            >
              <GithubIcon size={16} />
              <span>{currentRepo.full_name}</span>
              <ExternalLink size={12} />
            </a>
          )}

          <button 
            className={`token-btn ${hasLlmKey ? 'active-groq' : ''}`}
            onClick={() => setShowSettingsModal(true)}
            title="Open API & Connection Settings"
          >
            <Settings size={15} />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Dedicated Settings Modal */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-content settings-modal-wide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Settings size={18} /> API Configuration & Test Connections</h3>
              <button className="close-btn" onClick={() => setShowSettingsModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              {/* GitHub PAT Configuration */}
              <div className="setting-block">
                <div className="setting-header-row">
                  <label className="setting-label">
                    <Key size={15} className="label-icon" />
                    <strong>GitHub Personal Access Token (PAT)</strong>
                  </label>
                  {githubToken && (
                    <button className="btn-remove-inline" onClick={() => { onRemoveToken(); setGithubTokenInput(''); }}>
                      <Trash2 size={12} /> Remove Key
                    </button>
                  )}
                </div>
                <p className="modal-desc">
                  Required to authenticate GitHub REST API requests and avoid rate limits.
                </p>
                <div className="token-input-group">
                  <input 
                    type="password" 
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    value={githubTokenInput}
                    onChange={(e) => setGithubTokenInput(e.target.value)}
                  />
                </div>
              </div>

              <hr className="setting-divider" />

              {/* Gemini API Key */}
              <div className="setting-block">
                <div className="setting-header-row">
                  <label className="setting-label">
                    <Sparkles size={15} className="label-icon" style={{ color: 'var(--primary-accent)' }} />
                    <strong>Google Gemini API Key</strong>
                  </label>
                  {geminiApiKey && (
                    <button className="btn-remove-inline" onClick={() => { onRemoveGeminiApiKey(); setGeminiApiKeyInput(''); }}>
                      <Trash2 size={12} /> Remove Key
                    </button>
                  )}
                </div>
                <div className="token-input-group">
                  <input 
                    type="password" 
                    placeholder="AIzaSy..."
                    value={geminiApiKeyInput}
                    onChange={(e) => setGeminiApiKeyInput(e.target.value)}
                  />
                </div>
              </div>

              <hr className="setting-divider" />

              {/* Groq API Key */}
              <div className="setting-block">
                <div className="setting-header-row">
                  <label className="setting-label">
                    <Cpu size={15} className="label-icon groq-icon" />
                    <strong>Groq API Key (Llama-3.3 70B)</strong>
                  </label>
                  {groqApiKey && (
                    <button className="btn-remove-inline" onClick={() => { onRemoveGroqApiKey(); setGroqApiKeyInput(''); }}>
                      <Trash2 size={12} /> Remove Key
                    </button>
                  )}
                </div>
                <div className="token-input-group">
                  <input 
                    type="password" 
                    placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxx"
                    value={groqApiKeyInput}
                    onChange={(e) => setGroqApiKeyInput(e.target.value)}
                  />
                </div>
              </div>

              {/* Test Results Output */}
              {testingStatus && (
                <div className="test-results-box">
                  <h4>Connection Diagnostic Results:</h4>
                  <div className="test-result-row">
                    <span>GitHub REST API:</span>
                    {testingStatus.github.valid ? (
                      <span className="text-success"><CheckCircle2 size={14} /> {testingStatus.github.message}</span>
                    ) : (
                      <span className="text-danger"><XCircle size={14} /> {testingStatus.github.message}</span>
                    )}
                  </div>
                  <div className="test-result-row">
                    <span>Gemini / Groq LLM Key:</span>
                    {testingStatus.gemini || testingStatus.groq ? (
                      <span className="text-success"><CheckCircle2 size={14} /> Key Configured</span>
                    ) : (
                      <span className="text-danger"><XCircle size={14} /> Missing LLM API Key</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleTestConnections} disabled={isTesting}>
                {isTesting ? <RefreshCw size={14} className="spin" /> : <Zap size={14} />}
                {isTesting ? 'Testing...' : 'Test Connections'}
              </button>
              <button className="btn-primary" onClick={handleSaveSettings}>Save & Close</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
