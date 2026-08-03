import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FileCode, 
  Search, 
  Copy, 
  Check, 
  Sparkles, 
  Bot, 
  ArrowLeftRight, 
  FileText,
  Info,
  ChevronRight,
  ChevronDown,
  Cpu
} from 'lucide-react';
import { fetchFileContent } from '../services/githubApi';
import { generateFileExplanation } from '../services/aiEngine';

export default function FileTreeTab({ repoDetails, fileTree, githubToken, techStack, geminiApiKey, groqApiKey }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [codeContent, setCodeContent] = useState('');
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showExplanationDrawer, setShowExplanationDrawer] = useState(true);

  // Auto select first file on load
  useEffect(() => {
    if (fileTree && fileTree.length > 0 && !selectedFile) {
      const firstFile = fileTree.find(f => f.type === 'file') || fileTree[0];
      if (firstFile) {
        handleFileSelect(firstFile.path);
      }
    }
  }, [fileTree]);

  const handleFileSelect = async (filePath) => {
    setSelectedFile(filePath);
    setIsLoadingCode(true);
    setIsGeneratingAi(true);
    setCodeContent('');
    setExplanation(null);

    const rawCode = await fetchFileContent(
      repoDetails.owner, 
      repoDetails.repo, 
      filePath, 
      repoDetails.default_branch || 'main',
      githubToken
    );

    setCodeContent(rawCode);
    setIsLoadingCode(false);

    // Generate AI explanation (async if using Gemini or Groq)
    const aiExplanation = await generateFileExplanation(filePath, rawCode, techStack, { geminiApiKey, groqApiKey });
    setExplanation(aiExplanation);
    setIsGeneratingAi(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter file tree
  const filteredTree = fileTree.filter(item => 
    item.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeProviderName = geminiApiKey ? 'Gemini 2.0' : groqApiKey ? 'Groq Llama-3.3' : null;

  return (
    <div className="tab-filetree">
      <div className="filetree-layout">
        {/* Left Side: Directory Explorer */}
        <div className="tree-sidebar">
          <div className="sidebar-search">
            <Search size={15} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search files by path..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="tree-list">
            {filteredTree.map((item, idx) => {
              const isSelected = selectedFile === item.path;
              const isFolder = item.type === 'folder';

              return (
                <div 
                  key={idx}
                  className={`tree-item ${isFolder ? 'is-folder' : 'is-file'} ${isSelected ? 'selected' : ''}`}
                  onClick={() => !isFolder && handleFileSelect(item.path)}
                >
                  {isFolder ? (
                    <Folder size={15} className="folder-icon" />
                  ) : (
                    <FileCode size={15} className="file-icon" />
                  )}
                  <span className="item-path">{item.path}</span>
                  {!isFolder && item.size > 0 && (
                    <span className="item-size">{(item.size / 1024).toFixed(1)} KB</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Code Viewer & AI Explainer */}
        <div className="code-viewer-container">
          {selectedFile ? (
            <>
              {/* File Top Bar */}
              <div className="code-header">
                <div className="code-file-info">
                  <FileCode size={16} />
                  <span className="active-filepath">{selectedFile}</span>
                </div>

                <div className="code-header-actions">
                  <button 
                    className={`toggle-explain-btn ${showExplanationDrawer ? 'active' : ''}`}
                    onClick={() => setShowExplanationDrawer(!showExplanationDrawer)}
                  >
                    <Sparkles size={14} /> AI Explainer {activeProviderName ? `(${activeProviderName})` : ''}
                  </button>

                  <button className="copy-code-btn" onClick={handleCopyCode} disabled={!codeContent}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
              </div>

              {/* Main Split: Code Box & AI Explanation */}
              <div className={`code-body-layout ${showExplanationDrawer ? 'with-drawer' : ''}`}>
                <div className="code-scroll-area">
                  {isLoadingCode ? (
                    <div className="code-loading">
                      <span className="spinner"></span> Fetching file content...
                    </div>
                  ) : (
                    <pre className="code-content-block">
                      <code>
                        {codeContent.split('\n').map((line, idx) => (
                          <div key={idx} className="code-line">
                            <span className="line-num">{idx + 1}</span>
                            <span className="line-text">{line}</span>
                          </div>
                        ))}
                      </code>
                    </pre>
                  )}
                </div>

                {/* AI Explanation Drawer */}
                {showExplanationDrawer && (
                  <div className="ai-explainer-drawer">
                    {isGeneratingAi ? (
                      <div className="drawer-loading">
                        <Cpu className="spin" size={24} style={{ color: 'var(--cyan-accent)', marginBottom: '0.5rem' }} />
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {activeProviderName ? `Querying ${activeProviderName} LLM...` : 'Analyzing file structure...'}
                        </p>
                      </div>
                    ) : explanation ? (
                      <>
                        <div className="drawer-header">
                          <Bot size={18} className="drawer-ai-icon" />
                          <div>
                            <span className="drawer-badge">
                              {explanation.is_llm_powered ? `⚡ ${explanation.provider_used.toUpperCase()} AI` : 'FILE BREAKDOWN'}
                            </span>
                            <h4>{explanation.role}</h4>
                          </div>
                        </div>

                        <div className="drawer-body">
                          <div className="drawer-section">
                            <label><Info size={13} /> Purpose & Summary:</label>
                            <p>{explanation.overview}</p>
                          </div>

                          <div className="drawer-section">
                            <label><Sparkles size={13} /> Key Operations:</label>
                            <ul className="drawer-list">
                              {explanation.keyItems.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="drawer-footer-note">
                            <p>{explanation.summary}</p>
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="empty-code-state">
              <FileText size={40} />
              <h3>Select a file to inspect</h3>
              <p>Choose any code file from the left sidebar to view syntax and trigger instant AI analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
