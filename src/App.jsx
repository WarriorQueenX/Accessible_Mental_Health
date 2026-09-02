import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './index.css';

// ========== UTILITIES ==========
const SIGNAL_KEYWORDS = {
  work_stress: ['stress', 'work', 'boss', 'pressure', 'shift', 'tension'],
  sleep_problems: ['sleep', 'neend', 'tired', 'insomnia', 'exhausted'],
  loneliness: ['alone', 'lonely', 'akela', 'isolated', 'no one'],
  sadness: ['sad', 'depressed', 'cry', 'down', 'low', 'hopeless'],
  anxiety: ['anxious', 'worry', 'fear', 'panic', 'scared'],
};

function extractSignals(text) {
  const detected = [];
  const lower = text.toLowerCase();
  for (const [signal, keywords] of Object.entries(SIGNAL_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      detected.push(signal);
    }
  }
  return detected;
}

// ===== HOME PAGE =====
function HomePage() {
  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center">
          <div className="text-4xl mb-3">🌱</div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Accessible Mental Health</h1>
          <p className="text-sm text-[#64748b] mt-1">Evidence-based support for India's working class</p>
          <div className="h-px bg-[#e2e8f0] my-6"></div>
          <Link to="/chat" className="block w-full bg-[#0f172a] text-white font-semibold py-3 rounded-xl hover:bg-[#1e293b] transition">Start Conversation</Link>
          <Link to="/dashboard" className="block w-full mt-2 bg-white text-[#0f172a] font-semibold py-3 rounded-xl border border-[#e2e8f0] hover:bg-[#f8fafc] transition">View Dashboard</Link>
          <div className="flex justify-center gap-5 mt-6 text-xs text-[#94a3b8]">
            <span>24/7</span><span>Confidential</span><span>Free</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== CHAT PAGE =====
function ChatPage() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey there 👋 I'm here to listen, not judge. How's your day been?", sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [signalCounts, setSignalCounts] = useState(() => {
    const saved = localStorage.getItem('signal_counts');
    return saved ? JSON.parse(saved) : {};
  });
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save signal counts to localStorage
  useEffect(() => {
    localStorage.setItem('signal_counts', JSON.stringify(signalCounts));
  }, [signalCounts]);

  const isCrisis = (text) => {
    const lower = text.toLowerCase();
    const terms = ['suicide', 'self-harm', 'kill myself', 'die', 'end my life', 'want to die', 'should end it', 'better off dead', 'end it all', "don't want to live", 'no reason to live', 'give up', "can't go on", 'mar jana', 'khatam kar doon'];
    return terms.some(t => lower.includes(t));
  };

  const getResponse = (text) => {
    const lower = text.toLowerCase();

    // Crisis
    if (isCrisis(text)) {
      return "🫂 I'm really glad you told me this. Please call Tele MANAS at 14416 (free, 24/7). You are not alone. I'll stay here with you.";
    }

    // Work stress
    if (lower.includes('stress') || lower.includes('work') || lower.includes('boss')) {
      return "Work stress is tough. Let's try something: take 3 deep breaths with me. Inhale for 4, hold for 4, exhale for 4. How does that feel?";
    }

    // Sleep
    if (lower.includes('sleep') || lower.includes('neend') || lower.includes('tired')) {
      return "Sleep issues are exhausting. Try this tonight: write down any worries before bed, then put them aside. No screens 30 mins before sleep.";
    }

    // Loneliness
    if (lower.includes('alone') || lower.includes('lonely') || lower.includes('akela')) {
      return "You're not alone in feeling this way. Many people feel disconnected sometimes. I'm here with you.";
    }

    // Sadness
    if (lower.includes('sad') || lower.includes('depressed') || lower.includes('cry') || lower.includes('down')) {
      return "I'm sorry you're feeling this way. It's okay to not be okay. I'm here to listen. What's been on your mind lately?";
    }

    // Anxiety
    if (lower.includes('anxious') || lower.includes('worry') || lower.includes('fear') || lower.includes('panic')) {
      return "Anxiety is exhausting. Let's ground you: name 5 things you can see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.";
    }

    // Short messages
    if (text.length < 5) {
      return "I'm here. Take your time. When you're ready, tell me more.";
    }

    // Default
    const responses = [
      "Thank you for sharing. That sounds really difficult. How long have you been feeling this way?",
      "I appreciate you opening up. It takes courage. What would help you feel even a little better right now?",
      "I hear you. Sometimes speaking things out loud makes them lighter. What else is on your mind?",
      "I'm really glad you're here talking to me. What's one thing you're feeling right now?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userText = inputText;
    const userMsg = { id: Date.now(), text: userText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // ✅ Extract signals from user message
    const signals = extractSignals(userText);
    if (signals.length > 0) {
      console.log('📊 Signals detected:', signals);
      setSignalCounts(prev => {
        const newCounts = { ...prev };
        signals.forEach(signal => {
          newCounts[signal] = (newCounts[signal] || 0) + 1;
        });
        return newCounts;
      });
    }

    setTimeout(() => {
      const reply = getResponse(userText);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: reply, sender: 'bot' }]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col h-[600px] max-h-[90vh]">
        <div className="px-5 py-4 bg-white border-b border-[#f1f5f9] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌱</span>
            <span className="font-semibold text-sm text-[#0f172a]">Accessible Mental Health</span>
          </div>
          <button onClick={() => navigate('/')} className="text-[#94a3b8] hover:text-[#0f172a] text-lg">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fafbfc]">
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
              <div className="bg-white border border-[#f1f5f9] px-4 py-2.5 rounded-xl flex gap-1">
                <span className="w-2 h-2 bg-[#94a3b8] rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-[#94a3b8] rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-[#94a3b8] rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-[#f1f5f9] flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2.5 border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#0f172a] transition"
            disabled={isTyping}
          />
          <button
            onClick={handleSend}
            disabled={isTyping}
            className="px-5 py-2.5 bg-[#0f172a] text-white text-sm font-medium rounded-xl hover:bg-[#1e293b] transition disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== DASHBOARD PAGE =====
function DashboardPage() {
  const [signalCounts, setSignalCounts] = useState(() => {
    const saved = localStorage.getItem('signal_counts');
    return saved ? JSON.parse(saved) : {};
  });

  // Listen for storage changes
  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('signal_counts');
      if (saved) setSignalCounts(JSON.parse(saved));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const totalSignals = Object.values(signalCounts).reduce((sum, count) => sum + count, 0);
  const signalLabels = {
    work_stress: '💼 Work Stress',
    sleep_problems: '😴 Sleep Issues',
    loneliness: '🫂 Loneliness',
    sadness: '😔 Sadness',
    anxiety: '😰 Anxiety'
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[#0f172a]">📊 Dashboard</h1>
          <Link to="/" className="text-sm text-[#64748b] bg-white px-4 py-2 rounded-xl border border-[#e2e8f0] hover:border-[#94a3b8] transition">← Back</Link>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-[#f1f5f9] p-5 text-center">
            <div className="text-2xl font-bold text-[#0f172a]">{Object.keys(signalCounts).length}</div>
            <div className="text-xs text-[#94a3b8] mt-1">Signal Types</div>
          </div>
          <div className="bg-white rounded-xl border border-[#f1f5f9] p-5 text-center">
            <div className="text-2xl font-bold text-[#0f172a]">{totalSignals}</div>
            <div className="text-xs text-[#94a3b8] mt-1">Total Signals</div>
          </div>
          <div className="bg-white rounded-xl border border-[#f1f5f9] p-5 text-center">
            <div className="text-2xl font-bold text-[#0f172a]">0</div>
            <div className="text-xs text-[#94a3b8] mt-1">Crisis Alerts</div>
          </div>
          <div className="bg-white rounded-xl border border-[#f1f5f9] p-5 text-center">
            <div className="text-2xl font-bold text-[#0f172a]">0</div>
            <div className="text-xs text-[#94a3b8] mt-1">Peer Connections</div>
          </div>
        </div>

        {/* Signal Breakdown */}
        <div className="bg-white rounded-xl border border-[#f1f5f9] p-6 mb-6">
          <h2 className="text-sm font-semibold text-[#0f172a] mb-4">📌 Signal Breakdown</h2>
          {Object.keys(signalCounts).length === 0 ? (
            <div className="text-center text-[#94a3b8] text-sm py-8">
              No signals detected yet. Start chatting to track signals!
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(signalCounts).map(([signal, count]) => (
                <div key={signal} className="flex items-center justify-between py-2 border-b border-[#f1f5f9] last:border-0">
                  <span className="text-sm text-[#0f172a]">{signalLabels[signal] || signal}</span>
                  <span className="text-sm font-semibold text-[#0f172a] bg-[#f1f5f9] px-3 py-1 rounded-full">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-[#f1f5f9] p-6">
          <h2 className="text-sm font-semibold text-[#0f172a] mb-4">📈 Signal Trends</h2>
          <div className="h-48 bg-[#fafbfc] rounded-lg flex items-center justify-center text-[#94a3b8] text-sm border border-dashed border-[#e2e8f0]">
            {totalSignals > 0 ? `${totalSignals} signals tracked` : 'No data yet'}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== WIDGET PAGE =====
function WidgetPage() {
  const [signalCounts, setSignalCounts] = useState(() => {
    const saved = localStorage.getItem('signal_counts');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('signal_counts');
      if (saved) setSignalCounts(JSON.parse(saved));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const totalSignals = Object.values(signalCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4">
      <div className="w-[340px] bg-white rounded-2xl shadow-xl border border-[#f1f5f9] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌱</span>
            <span className="font-semibold text-sm text-[#0f172a]">AMH</span>
          </div>
          <span className="text-[10px] text-[#94a3b8] bg-[#f1f5f9] px-2 py-0.5 rounded-full">24/7</span>
        </div>
        <div className="mb-4">
          <p className="text-sm font-semibold text-[#0f172a]">Good {new Date().getHours() < 12 ? 'Morning' : 'Evening'}</p>
          <p className="text-xs text-[#94a3b8] mt-0.5">{totalSignals > 0 ? `${totalSignals} signals tracked` : 'How are you feeling today?'}</p>
        </div>
        <div className="bg-[#f8fafc] rounded-xl p-3 mb-4 border border-[#f1f5f9]">
          <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">Recent Signals</p>
          {Object.keys(signalCounts).length === 0 ? (
            <span className="text-xs text-[#94a3b8] mt-1 block">No signals yet</span>
          ) : (
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(signalCounts).slice(0, 3).map(([signal, count]) => (
                <span key={signal} className="text-[11px] bg-white px-2 py-0.5 rounded-full border border-[#e2e8f0]">
                  {signal.replace('_', ' ')} ×{count}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Link to="/chat" className="flex-1 bg-[#0f172a] text-white text-xs font-semibold py-2.5 rounded-xl text-center hover:bg-[#1e293b] transition">💬 Chat</Link>
          <Link to="/dashboard" className="flex-1 bg-[#f8fafc] text-[#0f172a] text-xs font-semibold py-2.5 rounded-xl text-center border border-[#e2e8f0] hover:bg-[#f1f5f9] transition">📊 Progress</Link>
        </div>
        <p className="text-[9px] text-[#94a3b8] text-center mt-3">Confidential • Free • 24/7</p>
      </div>
    </div>
  );
}

// ===== MAIN APP =====
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