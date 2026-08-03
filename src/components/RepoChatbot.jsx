import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  HelpCircle, 
  Terminal, 
  Copy, 
  Check,
  Zap,
  CornerDownLeft,
  Cpu
} from 'lucide-react';
import { answerRepoQuestion } from '../services/aiEngine';

export default function RepoChatbot({ repoDetails, analysis, geminiApiKey, groqApiKey }) {
  const activeLlm = geminiApiKey ? 'Gemini 2.0 Flash' : groqApiKey ? 'Groq Llama-3.3' : null;

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Hello! I am **RepoIQ AI Assistant**, context-indexed on **${repoDetails.full_name}**.${activeLlm ? ` ⚡ **${activeLlm} Engine is ACTIVE**.` : ''} Ask me anything about project structure, entry points, setup steps, or architecture patterns!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef(null);

  const quickPrompts = [
    "Explain project structure & folder organization",
    "How do I setup & run this repository locally?",
    "Where is the main entry point & how is routing handled?",
    "Summarize code health & security recommendations"
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSendMessage = async (textToSend = null) => {
    const text = textToSend || inputText;
    if (!text || !text.trim() || isThinking) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsThinking(true);

    // Call AI Engine (handles Gemini & Groq LLMs if key present)
    const response = await answerRepoQuestion(text.trim(), repoDetails, analysis, null, { geminiApiKey, groqApiKey });
    
    const botMsg = {
      id: Date.now() + 1,
      sender: 'bot',
      text: response.text,
      is_llm: response.is_llm_powered,
      provider: response.provider_used,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, botMsg]);
    setIsThinking(false);
  };

  return (
    <div className="tab-chatbot">
      <div className="chatbot-header">
        <div className="bot-header-title">
          <div className="bot-avatar">
            <Bot size={20} />
          </div>
          <div>
            <h3>RepoIQ AI Assistant</h3>
            <span className="bot-status-online">
              <span className="online-dot"></span> 
              {activeLlm ? `⚡ Powered by ${activeLlm}` : `Context-indexed for ${repoDetails.full_name}`}
            </span>
          </div>
        </div>

        <div className="quick-prompts-bar">
          <span className="prompts-label"><Zap size={13} /> Suggested Questions:</span>
          <div className="prompt-chips">
            {quickPrompts.map((prompt, idx) => (
              <button 
                key={idx} 
                className="prompt-chip-btn"
                onClick={() => handleSendMessage(prompt)}
                disabled={isThinking}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="chat-messages-container">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message-row ${msg.sender === 'user' ? 'row-user' : 'row-bot'}`}>
            <div className={`message-avatar ${msg.sender}`}>
              {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>

            <div className="message-bubble-wrapper">
              <div className="message-header">
                <span className="message-sender-name">
                  {msg.sender === 'user' ? 'You' : 'RepoIQ Assistant'}
                  {msg.is_llm && <span className="groq-pill"><Cpu size={11} /> {msg.provider}</span>}
                </span>
                <span className="message-time">{msg.timestamp}</span>
              </div>
              
              <div className="message-bubble">
                <div className="message-text">
                  {msg.text.split('\n').map((line, lIdx) => {
                    if (line.startsWith('### ')) {
                      return <h4 key={lIdx} className="msg-h4">{line.replace('### ', '')}</h4>;
                    }
                    if (line.startsWith('## ')) {
                      return <h3 key={lIdx} className="msg-h4">{line.replace('## ', '')}</h3>;
                    }
                    if (line.startsWith('- ')) {
                      return <div key={lIdx} className="msg-bullet">• {line.replace('- ', '')}</div>;
                    }
                    return <p key={lIdx}>{line}</p>;
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="chat-message-row row-bot">
            <div className="message-avatar bot">
              <Bot size={16} />
            </div>
            <div className="thinking-bubble">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="thinking-text">
                {activeLlm ? `Querying ${activeLlm} LLM...` : 'Synthesizing response...'}
              </span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Chat Input Field */}
      <div className="chat-input-area">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }} 
          className="chat-form"
        >
          <input 
            type="text" 
            placeholder={`Ask anything about ${repoDetails.repo} (e.g. "Where is authentication handled?")`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isThinking}
          />
          <button type="submit" className="chat-send-btn" disabled={!inputText.trim() || isThinking}>
            <Send size={16} />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
