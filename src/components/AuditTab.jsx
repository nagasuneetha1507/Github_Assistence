import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Copy, 
  Check, 
  Wrench, 
  FileCode, 
  Sparkles 
} from 'lucide-react';

export default function AuditTab({ analysis }) {
  const { health_score, audit_findings } = analysis;
  const [copiedId, setCopiedId] = useState(null);

  const getScoreColor = (score) => {
    if (score >= 90) return '#10b981'; // Emerald
    if (score >= 75) return '#06b6d4'; // Cyan
    if (score >= 60) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const handleCopySnippet = (id, snippet) => {
    navigator.clipboard.writeText(snippet);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="tab-audit">
      <div className="audit-header">
        <div>
          <h2><ShieldCheck size={22} /> Codebase Health & Refactoring Audit</h2>
          <p className="audit-subtitle">
            Automated quality inspection checking documentation presence, test harness configuration, security best practices, and module organization.
          </p>
        </div>
      </div>

      {/* Health Score Banner */}
      <div className="health-score-card">
        <div className="gauge-container">
          <div 
            className="score-circle" 
            style={{ borderColor: getScoreColor(health_score), color: getScoreColor(health_score) }}
          >
            <span className="score-number">{health_score}</span>
            <span className="score-max">/100</span>
          </div>
        </div>

        <div className="score-info">
          <div className="score-status-badge" style={{ backgroundColor: `${getScoreColor(health_score)}20`, color: getScoreColor(health_score) }}>
            <CheckCircle2 size={16} /> {health_score >= 90 ? 'Excellent Code Health' : health_score >= 75 ? 'Good Maintainability' : 'Improvement Recommended'}
          </div>
          <h3 className="score-title">
            {health_score >= 90 
              ? 'This repository adheres to high documentation and structure standards.' 
              : 'Several refactoring and documentation enhancements were identified.'}
          </h3>
          <p className="score-desc">
            Code quality score is calculated by parsing tree depth, package configs, test presence, documentation completeness, and entry point setup.
          </p>
        </div>
      </div>

      {/* Audit Findings List */}
      <div className="audit-findings-section">
        <h3 className="section-title"><Wrench size={18} /> Actionable Audit Findings & Refactoring Diffs</h3>
        
        {audit_findings && audit_findings.length > 0 ? (
          <div className="findings-list">
            {audit_findings.map((finding) => (
              <div key={finding.id} className="finding-card">
                <div className="finding-card-header">
                  <div className="finding-title-group">
                    <span className={`severity-tag severity-${finding.severity.toLowerCase()}`}>
                      {finding.severity}
                    </span>
                    <span className="type-tag">{finding.type}</span>
                    <h4 className="finding-title">{finding.title}</h4>
                  </div>
                  <span className="finding-id">{finding.id}</span>
                </div>

                <p className="finding-desc">{finding.description}</p>

                {finding.fix_snippet && (
                  <div className="fix-snippet-box">
                    <div className="snippet-header">
                      <span><Sparkles size={13} /> Recommended Refactoring Snippet:</span>
                      <button 
                        className="copy-snippet-btn"
                        onClick={() => handleCopySnippet(finding.id, finding.fix_snippet)}
                      >
                        {copiedId === finding.id ? <Check size={13} /> : <Copy size={13} />}
                        {copiedId === finding.id ? 'Copied!' : 'Copy Code'}
                      </button>
                    </div>
                    <pre className="snippet-code">
                      <code>{finding.fix_snippet}</code>
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="all-clean-card">
            <CheckCircle2 size={32} className="clean-icon" />
            <h4>No Critical Issues Found!</h4>
            <p>This repository meets essential codebase structure and documentation requirements.</p>
          </div>
        )}
      </div>
    </div>
  );
}
