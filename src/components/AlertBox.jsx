import React from 'react';
import { AlertTriangle, Settings, X, ShieldAlert } from 'lucide-react';

export default function AlertBox({ title, message, onOpenSettings, onClose }) {
  return (
    <div className="modern-alert-box">
      <div className="alert-icon-wrapper">
        <AlertTriangle size={22} className="alert-warning-icon" />
      </div>
      
      <div className="alert-content-body">
        {title && <h4 className="alert-title">{title}</h4>}
        <p className="alert-message">{message}</p>
      </div>

      <div className="alert-actions">
        {onOpenSettings && (
          <button className="alert-settings-btn" onClick={onOpenSettings}>
            <Settings size={14} />
            <span>Configure API Keys</span>
          </button>
        )}
        {onClose && (
          <button className="alert-close-btn" onClick={onClose} title="Dismiss">
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
