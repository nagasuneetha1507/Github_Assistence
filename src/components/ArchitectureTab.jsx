import React, { useState } from 'react';
import { 
  GitMerge, 
  ArrowRight, 
  Layers, 
  FileCode, 
  Server, 
  ShieldCheck, 
  Database, 
  Box,
  CheckCircle2,
  Info
} from 'lucide-react';

export default function ArchitectureTab({ analysis }) {
  const { architecture_nodes, architecture_edges, tech_stack } = analysis;
  const [selectedNode, setSelectedNode] = useState(architecture_nodes[0] || null);

  const getNodeIcon = (type) => {
    switch (type) {
      case 'entry': return <FileCode className="node-icon icon-entry" />;
      case 'router': return <GitMerge className="node-icon icon-router" />;
      case 'core': return <Server className="node-icon icon-core" />;
      case 'middleware': return <ShieldCheck className="node-icon icon-middleware" />;
      case 'util': return <Box className="node-icon icon-util" />;
      default: return <Layers className="node-icon" />;
    }
  };

  return (
    <div className="tab-architecture">
      <div className="arch-header">
        <div>
          <h2><GitMerge size={22} /> Module Architecture & Flow Diagram</h2>
          <p className="arch-subtitle">
            Visual breakdown of how incoming requests flow through entry points, routers, middleware, and business logic services in this repository.
          </p>
        </div>
        <div className="arch-pattern-badge">
          <Layers size={14} /> {tech_stack.architecture}
        </div>
      </div>

      <div className="arch-content-layout">
        {/* Interactive Diagram Canvas */}
        <div className="diagram-canvas-container">
          <div className="canvas-header">
            <span>Interactive Data Flow Graph</span>
            <span className="canvas-hint"><Info size={13} /> Click any node for detailed module specification</span>
          </div>

          <div className="node-flow-graph">
            {architecture_nodes.map((node, idx) => {
              const isSelected = selectedNode?.id === node.id;
              const outgoingEdge = architecture_edges.find(e => e.from === node.id);

              return (
                <React.Fragment key={node.id}>
                  <div 
                    className={`graph-node node-${node.type} ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedNode(node)}
                  >
                    <div className="node-icon-box">
                      {getNodeIcon(node.type)}
                    </div>
                    <div className="node-info">
                      <div className="node-title">{node.label}</div>
                      <div className="node-type-tag">{node.type.toUpperCase()}</div>
                    </div>
                  </div>

                  {/* Flow Arrow Connector */}
                  {idx < architecture_nodes.length - 1 && (
                    <div className="flow-arrow-container">
                      <div className="arrow-line"></div>
                      <div className="arrow-badge">{outgoingEdge?.label || 'passes control to'}</div>
                      <ArrowRight size={16} className="arrow-head" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Node Detail Side Panel */}
        <div className="node-detail-panel">
          {selectedNode ? (
            <div className="detail-card">
              <div className="detail-card-header">
                {getNodeIcon(selectedNode.type)}
                <div>
                  <span className="detail-tag">{selectedNode.type.toUpperCase()} NODE</span>
                  <h3 className="detail-title">{selectedNode.label}</h3>
                </div>
              </div>

              <div className="detail-body">
                <div className="detail-field">
                  <label>Role & Responsibility:</label>
                  <p>{selectedNode.description}</p>
                </div>

                <div className="detail-field">
                  <label>Pattern Connection:</label>
                  <div className="connection-pill">
                    <CheckCircle2 size={14} /> Part of core {tech_stack.primary_language} pipeline
                  </div>
                </div>

                <div className="detail-field">
                  <label>Architectural Guidance:</label>
                  <p className="detail-guidance">
                    When extending this repository, additions to <strong>{selectedNode.label}</strong> should maintain pure separation of concerns and avoid mixing state mutations directly with HTTP request handling.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-detail-state">
              <Layers size={32} />
              <p>Click on any node in the flow diagram to inspect its exact responsibilities and code patterns.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
