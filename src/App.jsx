import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './index.css';

// ========== HOME PAGE ==========
function HomePage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-[#f1f5f9] p-10 max-w-md w-full">
        <div className="text-center">
          <div className="w-14 h-14 bg-[#f1f5f9] rounded-full flex items-center justify-center text-2xl mx-auto mb-4">🌱</div>
          <h1 className="text-2xl font-semibold text-[#0f172a] tracking-tight">Accessible Mental Health</h1>
          <p className="text-sm text-[#64748b] mt-1.5">Evidence-based support for India's working class</p>
          
          <div className="h-px bg-[#f1f5f9] my-6"></div>
          
          <Link to="/chat" className="block w-full bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-medium py-3 px-4 rounded-lg transition-all">
            Start Conversation
          </Link>
          
          <Link to="/dashboard" className="block w-full mt-2.5 bg-white hover:bg-[#f8fafc] text-[#0f172a] text-sm font-medium py-3 px-4 rounded-lg transition-all border border-[#e2e8f0]">
            View Dashboard
          </Link>
          
          <div className="flex justify-center gap-5 mt-6 text-[11px] text-[#94a3b8]">
            <span>24/7</span>
            <span>Confidential</span>
            <span>Free</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== CHAT PAGE ==========
function ChatPage() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey there 👋 I'm here to listen, not judge. How's your day been?", sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [usedResponses, setUsedResponses] = useState([]);
  const [userContext, setUserContext] = useState({ name: null, recentTopics: [] });
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isCrisis = (text) => {
    const lower = text.toLowerCase();
    const terms = ['suicide', 'self-harm', 'kill myself', 'die', 'end my life', 'want to die', 'should end it', 'better off dead', 'end it all', 'don\'t want to live', 'no reason to live', 'give up', 'can\'t go on', 'mar jana', 'khatam kar doon'];
    return terms.some(t => lower.includes(t));
  };

  const pickUniqueResponse = (pool, used) => {
    const available = pool.filter(r => !used.includes(r));
    if (available.length === 0) {
      setUsedResponses(prev => prev.slice(-3));
      return pool[Math.floor(Math.random() * pool.length)];
    }
    return available[Math.floor(Math.random() * available.length)];
  };

  const getResponse = (text, history) => {
    const lower = text.toLowerCase();
    const userName = userContext.name || 'friend';
    
    // Crisis
    if (isCrisis(text)) {
      const crisisResponses = [
        "🫂 I'm really glad you told me this. Please call Tele MANAS at 14416 (free, 24/7). I'll stay here with you.",
        "🫂 You're not alone. Please reach out to Tele MANAS at 14416 right now. They're trained to help.",
        "🫂 Thank you for trusting me. Your life matters. Call Tele MANAS at 14416. I'm here with you."
      ];
      const response = pickUniqueResponse(crisisResponses, usedResponses);
      setUsedResponses(prev => [...prev, response]);
      return response;
    }

    // Extract name
    const nameMatch = text.match(/my name is (\w+)/i) || text.match(/i am (\w+)/i);
    if (nameMatch) setUserContext(prev => ({ ...prev, name: nameMatch[1] }));

    // Track topics
    const topics = [];
    if (lower.includes('stress') || lower.includes('work') || lower.includes('boss')) topics.push('work');
    if (lower.includes('sleep') || lower.includes('neend') || lower.includes('tired')) topics.push('sleep');
    if (lower.includes('alone') || lower.includes('lonely') || lower.includes('akela')) topics.push('lonely');
    if (lower.includes('sad') || lower.includes('depressed') || lower.includes('cry')) topics.push('sad');
    if (topics.length > 0) {
      setUserContext(prev => ({
        ...prev,
        recentTopics: [...new Set([...prev.recentTopics, ...topics])].slice(-3)
      }));
    }

    // Response pools
    let pool = [];
    const hasWork = userContext.recentTopics.includes('work');
    const hasSleep = userContext.recentTopics.includes('sleep');
    const hasSad = userContext.recentTopics.includes('sad');

    if (lower.includes('stress') || lower.includes('work') || lower.includes('boss')) {
      pool = hasWork 
        ? [`I remember you mentioned work before, ${userName}. How are you holding up?`,
           `Work again, ${userName}? 😅 What's the hardest part right now?`,
           `You've talked about work a few times, ${userName}. What would help even a little?`]
        : [`Work stress is brutal, ${userName}. Tell me more about what's going on.`,
           `I feel you on work stress, ${userName}. What's been the toughest part today?`,
           `Work can be so draining, ${userName}. What's one thing that could make it lighter?`];
    } else if (lower.includes('sleep') || lower.includes('neend') || lower.includes('tired')) {
      pool = hasSleep
        ? [`Still struggling with sleep, ${userName}? 😴 What have you tried?`,
           `Sleep is precious, ${userName}. What's keeping you up at night?`,
           `I can see sleep is still a challenge, ${userName}. Let's think about this.`]
        : [`Sleep issues are exhausting, ${userName}. 😴 Try 3 deep breaths with me.`,
           `Insomnia is tough, ${userName}. Have you tried the 4-7-8 breathing technique?`,
           `Not sleeping well is brutal, ${userName}. What's on your mind at bedtime?`];
    } else if (lower.includes('alone') || lower.includes('lonely') || lower.includes('akela')) {
      pool = [`You're not alone, ${userName}. 🫂 So many people feel this way.`,
              `I see you, ${userName}. Loneliness is so heavy. Have you talked to anyone else?`,
              `${userName}, if I could give you a hug through the screen, I would. 🤗`];
    } else if (lower.includes('sad') || lower.includes('depressed') || lower.includes('cry')) {
      pool = hasSad
        ? [`I see you're still feeling heavy, ${userName}. 💙 What do you need right now?`,
           `${userName}, I'm here. Keep talking - I'm really listening.`,
           `It breaks my heart you're hurting, ${userName}. 💔 What's one small thing that could help?`]
        : [`I'm sorry you're feeling this way, ${userName}. 💙 What's been on your mind?`,
           `${userName}, you don't have to have it all figured out. I'm proud of you for talking.`,
           `Feeling low is exhausting, ${userName}. I'm here. Tell me more.`];
    } else if (text.length < 5) {
      pool = [`I'm here, ${userName}. Take your time. 🫂`,
              `Tell me more when you're ready, ${userName}. I'm not going anywhere.`,
              `I hear you, ${userName}. I'm listening.`];
    } else {
      pool = [
        `I'm really glad you're sharing this, ${userName}. 🫂 What else is on your mind?`,
        `That makes sense, ${userName}. I appreciate you trusting me. Keep going.`,
        `${userName}, you're brave for talking about this. What else do you want me to know?`,
        `I hear you, ${userName}. The weight you're carrying is real. Let's sit with it. 🫂`,
        `${userName}, you're doing the right thing by talking. Tell me more.`,
        `I'm here, ${userName}. What's been happening in your world lately?`,
        `${userName}, even showing up here today is a huge step. I'm proud of you.`
      ];
    }

    const response = pickUniqueResponse(pool, usedResponses);
    setUsedResponses(prev => [...prev, response]);
    return response;
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    const userMsg = { id: Date.now(), text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    const userText = inputText;
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = getResponse(userText, [...messages, userMsg]);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: reply, sender: 'bot' }]);
      setIsTyping(false);
    }, 600 + Math.random() * 500);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-[#f1f5f9] overflow-hidden flex flex-col h-[85vh] max-h-[700px]">
        <div className="px-5 py-4 border-b border-[#f1f5f9] flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm font-medium text-[#0f172a]">
            <span>🌱</span> Accessible Mental Health
          </div>
          <button onClick={() => navigate('/')} className="text-[#94a3b8] hover:text-[#0f172a] text-xl">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#fafbfc]">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-xl text-sm ${
                msg.sender === 'user'
                  ? 'bg-[#0f172a] text-white'
                  : msg.text.includes('🫂')
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-white text-[#0f172a] border border-[#f1f5f9]'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-[#f1f5f9] px-4 py-2.5 rounded-xl">
                <span className="text-[#94a3b8] text-sm">typing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-5 py-4 border-t border-[#f1f5f9] bg-white flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2.5 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:border-[#0f172a] transition"
            disabled={isTyping}
          />
          <button
            onClick={handleSend}
            disabled={isTyping}
            className="px-5 py-2.5 bg-[#0f172a] text-white text-sm font-medium rounded-lg hover:bg-[#1e293b] transition disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// ========== DASHBOARD PAGE ==========
function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-[#0f172a] tracking-tight">Dashboard</h1>
          <Link to="/" className="text-sm text-[#64748b] hover:text-[#0f172a] transition">← Back</Link>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Active Users', value: '0' },
            { label: 'Signals Detected', value: '0' },
            { label: 'Crisis Alerts', value: '0' },
            { label: 'Peer Connections', value: '0' }
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-[#f1f5f9] p-5 text-center">
              <div className="text-2xl font-semibold text-[#0f172a]">{stat.value}</div>
              <div className="text-xs text-[#94a3b8] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-[#f1f5f9] p-6">
          <h2 className="text-sm font-medium text-[#0f172a] mb-4">Signal Trends</h2>
          <div className="h-48 bg-[#fafbfc] rounded-lg flex items-center justify-center text-[#94a3b8] text-sm border border-dashed border-[#e2e8f0]">
            Longitudinal data visualization
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== MAIN APP ==========
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/widget" element={<WidgetPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;