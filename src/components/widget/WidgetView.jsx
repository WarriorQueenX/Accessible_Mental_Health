import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function WidgetView() {
  const [signalCounts, setSignalCounts] = useState(() => {
    const saved = localStorage.getItem('signal_counts');
    return saved ? JSON.parse(saved) : {};
  });

  const [inputText, setInputText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('signal_counts');
      if (saved) setSignalCounts(JSON.parse(saved));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const totalSignals = Object.values(signalCounts).reduce((sum, count) => sum + count, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      // Store the search as a signal
      const signals = extractSignals(inputText);
      if (signals.length > 0) {
        const existing = JSON.parse(localStorage.getItem('signal_counts') || '{}');
        signals.forEach(s => {
          existing[s] = (existing[s] || 0) + 1;
        });
        localStorage.setItem('signal_counts', JSON.stringify(existing));
        window.dispatchEvent(new Event('storage'));
      }
      // Navigate to chat with the message
      navigate('/chat', { state: { message: inputText } });
    }
  };

  return (
    <div className="w-[360px] bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-4">
      {/* Google-style header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌱</span>
          <span className="text-sm font-medium text-gray-700">AMH</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">24/7</span>
          <button className="text-gray-400 hover:text-gray-600 text-sm">⋯</button>
        </div>
      </div>

      {/* Search bar - Google style */}
      <form onSubmit={handleSearch} className="relative">
        <div className="flex items-center bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 transition-all duration-200 focus-within:bg-white focus-within:shadow-md focus-within:ring-2 focus-within:ring-blue-500">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="How are you feeling?"
            className="w-full bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 ml-2"
          />
          <button type="submit" className="text-blue-500 hover:text-blue-600 text-sm font-medium ml-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </form>

      {/* Quick actions - Google-style chips */}
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={() => navigate('/chat')}
          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700 transition-all flex items-center gap-1"
        >
          💬 Chat
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700 transition-all flex items-center gap-1"
        >
          📊 Dashboard
        </button>
        {totalSignals > 0 && (
          <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs">
            {totalSignals} signals
          </span>
        )}
      </div>

      {/* Footer - Google style */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <span className="text-[10px] text-gray-400">Confidential</span>
        <span className="text-[10px] text-gray-400">Free</span>
        <span className="text-[10px] text-gray-400">24/7</span>
      </div>
    </div>
  );
}

// Helper function
function extractSignals(text) {
  const lower = text.toLowerCase();
  const signals = [];
  if (lower.includes('stress') || lower.includes('work') || lower.includes('boss')) signals.push('work_stress');
  if (lower.includes('sleep') || lower.includes('neend') || lower.includes('tired')) signals.push('sleep_problems');
  if (lower.includes('alone') || lower.includes('lonely') || lower.includes('akela')) signals.push('loneliness');
  if (lower.includes('sad') || lower.includes('depressed') || lower.includes('cry')) signals.push('sadness');
  if (lower.includes('anxious') || lower.includes('worry') || lower.includes('fear')) signals.push('anxiety');
  return signals;
}