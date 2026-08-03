/**
 * AI Reasoning & Conversation Assistant Engine supporting Gemini API & Groq API
 */

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_DEFAULT_MODEL = "llama-3.3-70b-versatile";

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

/**
 * Call Gemini API (Google AI Studio key: AIza...)
 */
export async function callGeminiApi(apiKey, systemPrompt, userPrompt) {
  if (!apiKey) return null;

  try {
    const url = `${GEMINI_ENDPOINT}?key=${apiKey.trim()}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1500
        }
      })
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return text || null;
    } else {
      const errText = await res.text();
      console.warn(`Gemini API HTTP ${res.status}:`, errText);
      return null;
    }
  } catch (err) {
    console.warn("Gemini API request error:", err);
    return null;
  }
}

/**
 * Call Groq API (Groq console key: gsk_...)
 */
export async function callGroqApi(apiKey, systemPrompt, userPrompt, model = GROQ_DEFAULT_MODEL) {
  if (!apiKey) return null;

  try {
    const res = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })
    });

    if (res.ok) {
      const data = await res.json();
      return data.choices?.[0]?.message?.content || null;
    } else {
      const errText = await res.text();
      console.warn(`Groq API HTTP ${res.status}:`, errText);
      return null;
    }
  } catch (err) {
    console.warn("Groq API request error:", err);
    return null;
  }
}

/**
 * Universal LLM Router (Gemini -> Groq -> Heuristic Fallback)
 */
export async function queryLlm(systemPrompt, userPrompt, config = {}) {
  const { geminiApiKey, groqApiKey, provider = 'auto' } = config;

  // Try Gemini first if selected or in auto mode
  if ((provider === 'gemini' || provider === 'auto') && geminiApiKey) {
    const geminiRes = await callGeminiApi(geminiApiKey, systemPrompt, userPrompt);
    if (geminiRes) {
      return { text: geminiRes, providerUsed: 'Gemini 2.0 Flash' };
    }
  }

  // Try Groq if selected or in auto mode
  if ((provider === 'groq' || provider === 'auto') && groqApiKey) {
    const groqRes = await callGroqApi(groqApiKey, systemPrompt, userPrompt);
    if (groqRes) {
      return { text: groqRes, providerUsed: 'Groq Llama-3.3' };
    }
  }

  return null;
}

/**
 * Generate File Explanation (LLM powered with fallback)
 */
export async function generateFileExplanation(filePath, content, techStack, llmConfig = {}) {
  const ext = filePath.split('.').pop()?.toLowerCase();
  
  // Default heuristic fallback
  let role = "Configuration & Metadata";
  let overview = `This file (\`${filePath}\`) configures settings or dependencies for the application.`;
  let keyItems = ["Defines metadata or build instructions."];

  if (filePath.endsWith('package.json')) {
    role = "Dependency Manifest";
    overview = "Specifies package name, scripts (dev, test, build), and third-party node_modules dependencies.";
    keyItems = [
      "Provides build/dev lifecycle scripts.",
      "Declares exact semver versions for runtime and dev dependencies.",
      "Configures module entry points (`main` / `module`)."
    ];
  } else if (filePath.includes('index') || filePath.includes('main') || filePath.includes('App')) {
    role = "Core Application Entry Point";
    overview = `Primary entry point (\`${filePath}\`) initializing runtime listeners, state, or framework components.`;
    keyItems = [
      "Bootstraps main application context.",
      "Configures global middleware, routing switches, or DOM render root.",
      "Imports core sub-modules and exports primary interface."
    ];
  } else if (filePath.includes('route') || filePath.includes('controller') || filePath.includes('api')) {
    role = "HTTP Routing / Controller Module";
    overview = `Handles HTTP endpoints, request validation, and response formatting for specific routes.`;
    keyItems = [
      "Receives incoming HTTP requests.",
      "Parses path parameters and request payload.",
      "Delegates business processing to underlying services."
    ];
  } else if (ext === 'ts' || ext === 'tsx' || ext === 'js' || ext === 'jsx' || ext === 'py') {
    role = "Source Logic Module";
    overview = `Contains operational routines and helper utilities written in ${techStack.primary_language}.`;
    keyItems = [
      "Implements modular functions / class methods.",
      "Handles internal state updates or data mutations.",
      "Exports reusable utility helpers across the codebase."
    ];
  }

  const fallbackResult = {
    filePath,
    role,
    overview,
    keyItems,
    summary: `File \`${filePath}\` serves as a ${role.toLowerCase()}. It bridges runtime operations and maintains modular encapsulation in ${techStack.primary_language}.`,
    is_llm_powered: false,
    provider_used: null
  };

  // Check if LLM key is available
  if (llmConfig.geminiApiKey || llmConfig.groqApiKey) {
    const systemPrompt = "You are an expert software architect analyzing source code files. Output a JSON object with keys: role (short title), overview (1-2 sentences), keyItems (array of 3 short bullet strings), and summary (1 sentence summary). Do NOT output markdown code fences, only raw valid JSON.";
    const snippet = content ? content.slice(0, 1500) : "No content";
    const userPrompt = `Analyze file "${filePath}" in a ${techStack.primary_language} project:\n\n${snippet}`;

    const llmRes = await queryLlm(systemPrompt, userPrompt, llmConfig);
    if (llmRes && llmRes.text) {
      try {
        const cleanJson = llmRes.text.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        return {
          filePath,
          role: parsed.role || role,
          overview: parsed.overview || overview,
          keyItems: parsed.keyItems || keyItems,
          summary: parsed.summary || fallbackResult.summary,
          is_llm_powered: true,
          provider_used: llmRes.providerUsed
        };
      } catch (e) {
        return {
          ...fallbackResult,
          overview: llmRes.text.slice(0, 350),
          is_llm_powered: true,
          provider_used: llmRes.providerUsed
        };
      }
    }
  }

  return fallbackResult;
}

/**
 * Answer Chat Question (LLM powered with fallback)
 */
export async function answerRepoQuestion(question, repoDetails, analysis, selectedFile = null, llmConfig = {}) {
  const q = question.toLowerCase();
  const repoName = repoDetails.repo;
  const tech = analysis.tech_stack;
  const entries = analysis.entry_points;

  // Real LLM query via Gemini or Groq
  if (llmConfig.geminiApiKey || llmConfig.groqApiKey) {
    const systemPrompt = `You are RepoIQ AI, an elite staff software architect assisting a developer with the public GitHub codebase "${repoDetails.full_name}".
Repository Metadata & Specs:
- Description: ${repoDetails.description}
- Primary Language: ${tech.primary_language}
- Frameworks & Libraries: ${tech.frameworks.join(', ')}
- Architecture Pattern: ${tech.architecture}
- Key Entry Points: ${entries.map(e => `${e.path} (${e.role})`).join(', ')}
- Health Score: ${analysis.health_score}/100

Instruction: Explain the architecture, setup, code quality, or business logic in simple, clear developer-friendly terms. Format response with Markdown headings, bullet points, and code blocks.`;

    const userPrompt = selectedFile 
      ? `User question regarding active file "${selectedFile.filePath}": ${question}`
      : `User question regarding repository "${repoDetails.full_name}": ${question}`;

    const llmRes = await queryLlm(systemPrompt, userPrompt, llmConfig);
    if (llmRes && llmRes.text) {
      return {
        text: llmRes.text,
        is_llm_powered: true,
        provider_used: llmRes.providerUsed
      };
    }
  }

  // Built-in intelligent response generator fallback
  if (q.includes('structure') || q.includes('organization') || q.includes('folder') || q.includes('where')) {
    return {
      text: `### 📁 Codebase Structure & Architecture for **${repoName}**
- **Architecture**: ${tech.architecture}
- **Primary Language**: ${tech.primary_language}
- **Frameworks**: ${tech.frameworks.join(', ')}

**Key Entry Points & Components:**
${entries.map(e => `- \`${e.path}\`: **${e.role}** — ${e.description}`).join('\n')}

The repository isolates concerns into entry points, routing/controllers, core services, and helper utilities.`,
      is_llm_powered: false
    };
  }

  if (q.includes('run') || q.includes('start') || q.includes('install') || q.includes('setup') || q.includes('build')) {
    return {
      text: `### 🚀 Setup & Execution Guide for **${repoName}**

1. **Clone Repository:**
\`\`\`bash
git clone https://github.com/${repoDetails.owner}/${repoName}.git
cd ${repoName}
\`\`\`

2. **Install Dependencies:**
\`\`\`bash
npm install   # (Or pip install -r requirements.txt / cargo build)
\`\`\`

3. **Start Development Server:**
\`\`\`bash
npm run dev   # (Or python main.py / uvicorn main:app)
\`\`\``,
      is_llm_powered: false
    };
  }

  if (q.includes('auth') || q.includes('login') || q.includes('security') || q.includes('audit') || q.includes('quality')) {
    return {
      text: `### 🔒 Code Quality & Security Audit Summary for **${repoName}**
- **Health Score**: **${analysis.health_score}/100**
- Flagged Audit Items: ${analysis.audit_findings.length} recommendation(s).

Inspect the **Code Audit** tab to review actionable refactoring diffs and compliance checks.`,
      is_llm_powered: false
    };
  }

  if (selectedFile) {
    return {
      text: `### 📄 File Analysis: **\`${selectedFile.filePath}\`**
- **Role**: ${selectedFile.role}
- **Summary**: ${selectedFile.overview}

**Key Operations:**
${selectedFile.keyItems.map(k => `- ${k}`).join('\n')}`,
      is_llm_powered: false
    };
  }

  return {
    text: `### 🤖 Repository Insight for **${repoName}**

Regarding your query: *"${question}"*

- **Tech Stack**: ${tech.primary_language} with ${tech.frameworks.join(', ')}.
- **Architecture**: ${tech.architecture}.
- **Primary Entry File**: \`${entries[0]?.path || 'index.js'}\`.

*(Tip: Enter a **Gemini API Key** or **Groq API Key** in settings to enable live LLM reasoning for any query!)*`,
    is_llm_powered: false
  };
}
