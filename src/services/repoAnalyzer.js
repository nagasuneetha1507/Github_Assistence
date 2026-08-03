/**
 * Heuristic AI Analyzer Engine for codebases
 */
import { MOCK_REPOSITORIES } from '../data/mockRepos.js';

export function analyzeRepository(repoDetails, fileTree, packageJsonContent = null, readmeContent = null) {
  const repoKey = `${repoDetails.owner}/${repoDetails.repo}`.toLowerCase();
  
  // Use mock pre-analyzed metadata if available for deep fidelity
  if (MOCK_REPOSITORIES[repoKey]) {
    const mock = MOCK_REPOSITORIES[repoKey];
    return {
      tech_stack: mock.tech_stack,
      summary: mock.summary,
      entry_points: mock.entry_points,
      architecture_nodes: mock.architecture_nodes,
      architecture_edges: mock.architecture_edges,
      health_score: mock.health_score,
      audit_findings: mock.audit_findings,
      file_stats: calculateFileStats(fileTree),
      generated_readme: generateMarkdownReadme(repoDetails, mock.tech_stack, mock.entry_points, mock.summary, fileTree)
    };
  }

  // Real dynamic static analysis
  const filePaths = fileTree.map(f => f.path);
  const detectedTech = detectTechStack(filePaths, packageJsonContent);
  const entryPoints = detectEntryPoints(filePaths);
  const archGraph = buildArchitectureGraph(entryPoints, filePaths, detectedTech);
  const audit = calculateAuditScore(filePaths, packageJsonContent, readmeContent);
  const summary = generateRepoSummary(repoDetails, detectedTech, entryPoints);

  return {
    tech_stack: detectedTech,
    summary,
    entry_points: entryPoints,
    architecture_nodes: archGraph.nodes,
    architecture_edges: archGraph.edges,
    health_score: audit.score,
    audit_findings: audit.findings,
    file_stats: calculateFileStats(fileTree),
    generated_readme: generateMarkdownReadme(repoDetails, detectedTech, entryPoints, summary, fileTree)
  };
}

function detectTechStack(filePaths, packageJsonContent) {
  const exts = new Set(filePaths.map(p => p.split('.').pop()?.toLowerCase()));
  const deps = new Set();
  
  let parsedPkg = null;
  if (packageJsonContent) {
    try {
      parsedPkg = JSON.parse(packageJsonContent);
      const allDeps = { ...parsedPkg.dependencies, ...parsedPkg.devDependencies };
      Object.keys(allDeps).forEach(d => deps.add(d));
    } catch (e) {
      // ignore
    }
  }

  const frameworks = [];
  const testTools = [];

  // Frontend / Framework checks
  if (deps.has('react') || exts.has('jsx') || exts.has('tsx')) frameworks.push('React');
  if (deps.has('vue') || exts.has('vue')) frameworks.push('Vue.js');
  if (deps.has('next')) frameworks.push('Next.js');
  if (deps.has('express')) frameworks.push('Express.js');
  if (deps.has('fastapi') || filePaths.some(p => p.includes('fastapi'))) frameworks.push('FastAPI');
  if (deps.has('django') || filePaths.some(p => p.includes('manage.py'))) frameworks.push('Django');
  if (filePaths.some(p => p.endsWith('Cargo.toml'))) frameworks.push('Rust Cargo');
  if (filePaths.some(p => p.endsWith('go.mod'))) frameworks.push('Go Modules');

  // Test tool checks
  if (deps.has('jest')) testTools.push('Jest');
  if (deps.has('vitest')) testTools.push('Vitest');
  if (deps.has('mocha')) testTools.push('Mocha');
  if (deps.has('pytest') || filePaths.some(p => p.includes('test_') || p.includes('_test.py'))) testTools.push('PyTest');

  let primaryLanguage = 'JavaScript';
  if (exts.has('ts') || exts.has('tsx')) primaryLanguage = 'TypeScript';
  else if (exts.has('py')) primaryLanguage = 'Python';
  else if (exts.has('go')) primaryLanguage = 'Go';
  else if (exts.has('rs')) primaryLanguage = 'Rust';
  else if (exts.has('java')) primaryLanguage = 'Java';
  else if (exts.has('cpp') || exts.has('c')) primaryLanguage = 'C/C++';

  let architecture = 'Modular Monolith';
  if (filePaths.some(p => p.startsWith('packages/') || p.startsWith('apps/'))) architecture = 'Monorepo Workspace';
  else if (frameworks.includes('Express.js') || frameworks.includes('FastAPI')) architecture = 'REST API Backend Server';
  else if (frameworks.includes('React') || frameworks.includes('Next.js')) architecture = 'Component-driven Client App';

  return {
    category: frameworks.length ? frameworks.join(' + ') : `${primaryLanguage} Project`,
    architecture,
    primary_language: primaryLanguage,
    frameworks: frameworks.length ? frameworks : [primaryLanguage],
    dependencies: Array.from(deps).slice(0, 12),
    test_tools: testTools.length ? testTools : ['Generic Test Suite'],
    database: deps.has('mongoose') ? 'MongoDB' : deps.has('pg') || deps.has('prisma') ? 'PostgreSQL' : 'Agnostic / Not Specified'
  };
}

function detectEntryPoints(filePaths) {
  const entries = [];
  const matches = [
    { path: 'src/index.ts', role: 'TypeScript Application Entry', desc: 'Main exports and runtime bootstrap.' },
    { path: 'src/index.js', role: 'JavaScript Application Entry', desc: 'Main exports and runtime bootstrap.' },
    { path: 'src/main.tsx', role: 'React App Root', desc: 'Renders top-level React root DOM element.' },
    { path: 'src/App.tsx', role: 'React Core Component', desc: 'Top-level app layout and routing switch.' },
    { path: 'index.js', role: 'Root Express/Node Server', desc: 'Server listener or package export.' },
    { path: 'server.js', role: 'Node HTTP Server', desc: 'Express listener and environment setup.' },
    { path: 'main.py', role: 'Python Entry script', desc: 'Executable script or ASGI/WSGI app launcher.' },
    { path: 'app.py', role: 'Python Application Module', desc: 'Flask or FastAPI app instance creation.' }
  ];

  filePaths.forEach(fp => {
    const match = matches.find(m => m.path.toLowerCase() === fp.toLowerCase());
    if (match) {
      entries.push({ path: fp, role: match.role, description: match.desc });
    }
  });

  if (entries.length === 0) {
    const firstCodeFile = filePaths.find(p => /\.(js|ts|py|go|rs|java)$/i.test(p));
    if (firstCodeFile) {
      entries.push({ path: firstCodeFile, role: 'Primary Source File', description: 'Core application file.' });
    }
  }

  return entries;
}

function buildArchitectureGraph(entryPoints, filePaths, detectedTech) {
  const nodes = [];
  const edges = [];

  const mainEntry = entryPoints[0]?.path || 'root';
  nodes.push({
    id: 'entry',
    label: `Entry Point (${mainEntry})`,
    type: 'entry',
    description: 'Initial bootstrapper and routing entry point.'
  });

  const hasRoutes = filePaths.some(p => /route|controller|api/i.test(p));
  const hasServices = filePaths.some(p => /service|logic|store|model/i.test(p));
  const hasUtils = filePaths.some(p => /util|helper|common|lib/i.test(p));

  if (hasRoutes) {
    nodes.push({
      id: 'router',
      label: 'Router & Controllers Layer',
      type: 'router',
      description: 'Handles HTTP endpoints, input parsing, and response serialization.'
    });
    edges.push({ from: 'entry', to: 'router', label: 'dispatches to' });
  }

  if (hasServices) {
    nodes.push({
      id: 'service',
      label: 'Business Logic / Services',
      type: 'core',
      description: 'Contains core algorithms, state management, and business rules.'
    });
    edges.push({ from: hasRoutes ? 'router' : 'entry', to: 'service', label: 'invokes' });
  }

  if (hasUtils) {
    nodes.push({
      id: 'utils',
      label: 'Utilities & Helpers',
      type: 'util',
      description: 'Shared functions, formatters, and environment constants.'
    });
    edges.push({ from: hasServices ? 'service' : 'entry', to: 'utils', label: 'uses' });
  }

  return { nodes, edges };
}

function calculateAuditScore(filePaths, packageJsonContent, readmeContent) {
  let score = 70;
  const findings = [];

  const hasReadme = filePaths.some(p => /^readme\.md$/i.test(p));
  const hasTests = filePaths.some(p => /test|spec|__tests__/i.test(p));
  const hasLicense = filePaths.some(p => /^license/i.test(p));
  const hasLinter = filePaths.some(p => /eslint|prettier|tsconfig|flake8|pyproject/i.test(p));

  if (hasReadme) score += 10;
  else findings.push({
    id: 'AUD-DOC-01',
    type: 'Documentation',
    severity: 'High',
    title: 'Missing Root README.md',
    description: 'No root README file found. Beginners cannot identify setup or usage steps.',
    fix_snippet: '# Project Title\n\n## Overview\nAdd project details here...'
  });

  if (hasTests) score += 10;
  else findings.push({
    id: 'AUD-TEST-01',
    type: 'Test Coverage',
    severity: 'Medium',
    title: 'No Automated Tests Detected',
    description: 'No test files (e.g. *.test.js, test_*.py) detected in repository.',
    fix_snippet: `// Example test file (src/app.test.js)
import { describe, it, expect } from 'vitest';

describe('App Integrity', () => {
  it('should run successfully', () => {
    expect(true).toBe(true);
  });
});`
  });

  if (hasLicense) score += 5;
  if (hasLinter) score += 5;

  return { score: Math.min(score, 98), findings };
}

function generateRepoSummary(repoDetails, detectedTech, entryPoints) {
  return `${repoDetails.repo} is a ${detectedTech.primary_language}-based ${detectedTech.architecture.toLowerCase()}. It utilizes ${detectedTech.frameworks.join(', ')} to provide structured functionality, featuring entry points at ${entryPoints.map(e => e.path).join(', ')}.`;
}

function calculateFileStats(fileTree) {
  const byExt = {};
  let totalFiles = 0;
  let totalFolders = 0;
  let totalSizeBytes = 0;

  fileTree.forEach(item => {
    if (item.type === 'folder') {
      totalFolders++;
    } else {
      totalFiles++;
      totalSizeBytes += (item.size || 0);
      const ext = item.path.split('.').pop()?.toUpperCase() || 'Other';
      byExt[ext] = (byExt[ext] || 0) + 1;
    }
  });

  return {
    totalFiles,
    totalFolders,
    totalSizeBytes,
    byExt
  };
}

function generateMarkdownReadme(repoDetails, techStack, entryPoints, summary, fileTree) {
  const treeSnippet = fileTree.slice(0, 15).map(f => `├── ${f.path}`).join('\n');

  return `# ${repoDetails.repo}

> ${repoDetails.description}

![Primary Language](https://img.shields.io/badge/Language-${encodeURIComponent(techStack.primary_language)}-blue.svg)
![License](https://img.shields.io/badge/License-${encodeURIComponent(repoDetails.license || 'MIT')}-green.svg)
![Stars](https://img.shields.io/badge/Stars-${repoDetails.stars || 0}-yellow.svg)

## 📌 Executive Summary
${summary}

---

## 🛠️ Technology Stack & Architecture
- **Primary Language**: ${techStack.primary_language}
- **Frameworks & Libraries**: ${techStack.frameworks.join(', ')}
- **Architecture Pattern**: ${techStack.architecture}
- **Database / Persistence**: ${techStack.database}
- **Testing Tools**: ${techStack.test_tools.join(', ')}

---

## 🚀 Key Entry Points
${entryPoints.map(e => `- \`${e.path}\` - **${e.role}**: ${e.description}`).join('\n')}

---

## 📁 Repository Structure Overview
\`\`\`text
${repoDetails.repo}/
${treeSnippet}
... (additional files omitted for brevity)
\`\`\`

---

## ⚡ Getting Started

### Prerequisites
- Install **${techStack.primary_language}** runtime on your local machine.

### Installation
\`\`\`bash
# 1. Clone repository
git clone https://github.com/${repoDetails.owner}/${repoDetails.repo}.git
cd ${repoDetails.repo}

# 2. Install dependencies
npm install  # or pip install -r requirements.txt
\`\`\`

### Running Locally
\`\`\`bash
npm run dev  # or python main.py
\`\`\`
`;
}
