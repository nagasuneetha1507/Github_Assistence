import React from 'react';
import { 
  Star, 
  GitFork, 
  AlertCircle, 
  FileCode, 
  Scale, 
  Layers, 
  Cpu, 
  CheckCircle, 
  Compass, 
  FolderCheck,
  Server,
  Database,
  Terminal,
  Info
} from 'lucide-react';

export default function OverviewTab({ repoDetails, analysis }) {
  const { tech_stack, summary, entry_points, file_stats } = analysis;

  // Render language distribution percentage bar
  const totalFiles = file_stats.totalFiles || 1;
  const extList = Object.entries(file_stats.byExt || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const getExtColor = (ext) => {
    const map = {
      JS: '#f7df1e',
      TS: '#3178c6',
      TSX: '#3178c6',
      JSX: '#61dafb',
      PY: '#3572A5',
      GO: '#00ADD8',
      RS: '#dea584',
      HTML: '#e34c26',
      CSS: '#563d7c',
      JSON: '#cbd5e1'
    };
    return map[ext] || '#94a3b8';
  };

  return (
    <div className="tab-overview">
      {/* Executive Summary Card */}
      <div className="overview-hero-card">
        <div className="card-badge">
          <Info size={14} /> Executive Summary
        </div>
        <h2 className="overview-title">What is {repoDetails.repo}?</h2>
        <p className="overview-text">{summary}</p>
        {repoDetails.fallback_reason && (
          <div className="fallback-note">
            <Info size={14} /> Note: {repoDetails.fallback_reason}
          </div>
        )}
      </div>

      {/* Language Breakdown */}
      <div className="overview-section">
        <h3 className="section-title"><FileCode size={18} /> File Type Distribution</h3>
        <div className="lang-bar-container">
          <div className="lang-bar">
            {extList.map(([ext, count], idx) => {
              const pct = Math.round((count / totalFiles) * 100);
              return (
                <div 
                  key={idx} 
                  className="lang-bar-segment" 
                  style={{ width: `${pct}%`, backgroundColor: getExtColor(ext) }}
                  title={`${ext}: ${count} files (${pct}%)`}
                />
              );
            })}
          </div>
          <div className="lang-legend">
            {extList.map(([ext, count], idx) => (
              <div key={idx} className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: getExtColor(ext) }}></span>
                <span className="legend-name">.{ext.toLowerCase()}</span>
                <span className="legend-count">{count} files ({Math.round((count / totalFiles) * 100)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><Star size={20} className="icon-gold" /></div>
          <div className="stat-val">{(repoDetails.stars || 0).toLocaleString()}</div>
          <div className="stat-label">GitHub Stars</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><GitFork size={20} className="icon-blue" /></div>
          <div className="stat-val">{(repoDetails.forks || 0).toLocaleString()}</div>
          <div className="stat-label">Forks</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><AlertCircle size={20} className="icon-purple" /></div>
          <div className="stat-val">{repoDetails.open_issues || 0}</div>
          <div className="stat-label">Open Issues</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FileCode size={20} className="icon-emerald" /></div>
          <div className="stat-val">{file_stats.totalFiles}</div>
          <div className="stat-label">Total Files</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Scale size={20} className="icon-cyan" /></div>
          <div className="stat-val">{repoDetails.license || 'MIT'}</div>
          <div className="stat-label">License</div>
        </div>
      </div>

      {/* Tech Stack Specs Grid */}
      <div className="overview-section">
        <h3 className="section-title"><Cpu size={18} /> Detected Tech Stack & Architecture Specs</h3>
        <div className="tech-specs-grid">
          <div className="spec-card">
            <div className="spec-header">
              <Layers size={16} className="spec-icon" />
              <span>Category</span>
            </div>
            <div className="spec-body">{tech_stack.category}</div>
          </div>
          <div className="spec-card">
            <div className="spec-header">
              <Compass size={16} className="spec-icon" />
              <span>Architecture Pattern</span>
            </div>
            <div className="spec-body">{tech_stack.architecture}</div>
          </div>
          <div className="spec-card">
            <div className="spec-header">
              <Terminal size={16} className="spec-icon" />
              <span>Primary Language</span>
            </div>
            <div className="spec-body">{tech_stack.primary_language}</div>
          </div>
          <div className="spec-card">
            <div className="spec-header">
              <Server size={16} className="spec-icon" />
              <span>Frameworks & Libraries</span>
            </div>
            <div className="spec-body">
              {tech_stack.frameworks.map((fw, idx) => (
                <span key={idx} className="badge-tag">{fw}</span>
              ))}
            </div>
          </div>
          <div className="spec-card">
            <div className="spec-header">
              <Database size={16} className="spec-icon" />
              <span>Database / Storage</span>
            </div>
            <div className="spec-body">{tech_stack.database}</div>
          </div>
          <div className="spec-card">
            <div className="spec-header">
              <CheckCircle size={16} className="spec-icon" />
              <span>Testing & Quality</span>
            </div>
            <div className="spec-body">
              {tech_stack.test_tools.map((tt, idx) => (
                <span key={idx} className="badge-tag alt">{tt}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Entry Points List */}
      <div className="overview-section">
        <h3 className="section-title"><FolderCheck size={18} /> Key Entry Points & Bootstrappers</h3>
        <div className="entry-points-list">
          {entry_points.map((ep, idx) => (
            <div key={idx} className="entry-point-card">
              <div className="ep-badge">{ep.role}</div>
              <div className="ep-path"><code>{ep.path}</code></div>
              <div className="ep-desc">{ep.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
