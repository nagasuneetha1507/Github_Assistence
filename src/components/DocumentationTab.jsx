import React, { useState } from 'react';
import { 
  FileText, 
  Copy, 
  Download, 
  Check, 
  Eye, 
  Code, 
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function DocumentationTab({ repoDetails, analysis }) {
  const markdownText = analysis.generated_readme;
  const [viewMode, setViewMode] = useState('rendered'); // 'rendered' | 'raw'
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdownText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `README_${repoDetails.repo}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="tab-documentation">
      <div className="doc-header">
        <div>
          <h2><BookOpen size={22} /> Automated README & Documentation Builder</h2>
          <p className="doc-subtitle">
            AI-synthesized production README complete with tech stack badges, architecture overview, entry points, and local setup instructions.
          </p>
        </div>

        <div className="doc-actions">
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'rendered' ? 'active' : ''}`}
              onClick={() => setViewMode('rendered')}
            >
              <Eye size={14} /> Preview
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'raw' ? 'active' : ''}`}
              onClick={() => setViewMode('raw')}
            >
              <Code size={14} /> Raw Markdown
            </button>
          </div>

          <button className="btn-secondary" onClick={handleCopy}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy .md'}
          </button>

          <button className="btn-primary" onClick={handleDownload}>
            <Download size={14} /> Download README.md
          </button>
        </div>
      </div>

      {/* Main Documentation Viewer Container */}
      <div className="doc-body-container">
        {viewMode === 'rendered' ? (
          <div className="rendered-markdown">
            <div className="markdown-preview-badge">
              <Sparkles size={14} /> AI Generated Documentation
            </div>
            
            {/* Formatted Markdown Rendering */}
            <div className="markdown-content">
              <h1 className="md-h1">{repoDetails.repo}</h1>
              <p className="md-lead">{repoDetails.description}</p>

              <div className="md-badges">
                <span className="badge badge-blue">Language: {analysis.tech_stack.primary_language}</span>
                <span className="badge badge-green">License: {repoDetails.license || 'MIT'}</span>
                <span className="badge badge-yellow">Stars: {repoDetails.stars || 0}</span>
              </div>

              <h2 className="md-h2">📌 Executive Summary</h2>
              <p>{analysis.summary}</p>

              <h2 className="md-h2">🛠️ Technology Stack & Architecture</h2>
              <ul>
                <li><strong>Primary Language</strong>: {analysis.tech_stack.primary_language}</li>
                <li><strong>Frameworks & Libraries</strong>: {analysis.tech_stack.frameworks.join(', ')}</li>
                <li><strong>Architecture Pattern</strong>: {analysis.tech_stack.architecture}</li>
                <li><strong>Database / Storage</strong>: {analysis.tech_stack.database}</li>
                <li><strong>Testing Tools</strong>: {analysis.tech_stack.test_tools.join(', ')}</li>
              </ul>

              <h2 className="md-h2">🚀 Key Entry Points</h2>
              <div className="md-entry-grid">
                {analysis.entry_points.map((ep, idx) => (
                  <div key={idx} className="md-ep-box">
                    <code>{ep.path}</code>
                    <strong>{ep.role}</strong>
                    <p>{ep.description}</p>
                  </div>
                ))}
              </div>

              <h2 className="md-h2">⚡ Getting Started</h2>
              <h3 className="md-h3">1. Clone & Install</h3>
              <pre className="md-codeblock">
                <code>
{`git clone https://github.com/${repoDetails.owner}/${repoDetails.repo}.git
cd ${repoDetails.repo}
npm install  # or equivalent package manager`}
                </code>
              </pre>

              <h3 className="md-h3">2. Launch Local Server</h3>
              <pre className="md-codeblock">
                <code>
{`npm run dev  # or python main.py`}
                </code>
              </pre>
            </div>
          </div>
        ) : (
          <div className="raw-markdown-view">
            <pre className="raw-codeblock">
              <code>{markdownText}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
