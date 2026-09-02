import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Signal detection (copied from App.jsx)
const SIGNAL_KEYWORDS = {
  work_stress: ['stress', 'work', 'boss', 'pressure', 'shift', 'tension', 'deadline', 'target', 'manager'],
  sleep_problems: ['sleep', 'neend', 'tired', 'insomnia', 'exhausted', 'thakan', 'raat', 'jag raha'],
  loneliness: ['alone', 'lonely', 'akela', 'isolated', 'no one', 'tanha', 'kisi se baat'],
  sadness: ['sad', 'depressed', 'cry', 'down', 'low', 'hopeless', 'udaas', 'dukh'],
  anxiety: ['anxious', 'worry', 'fear', 'panic', 'scared', 'darr', 'chain', 'ghabrahat'],
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

function saveSignalToStorage(signals) {
  const existing = JSON.parse(localStorage.getItem('signal_counts') || '{}');
  signals.forEach(signal => {
    existing[signal] = (existing[signal] || 0) + 1;
  });
  localStorage.setItem('signal_counts', JSON.stringify(existing));
  window.dispatchEvent(new Event('storage'));
}

function getSignalFromStorage() {
  return JSON.parse(localStorage.getItem('signal_counts') || '{}');
}

export default function WidgetView() {
  const [inputText, setInputText] = useState('');
  const [signalCounts, setSignalCounts] = useState(getSignalFromStorage);
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorage = () => {
      setSignalCounts(getSignalFromStorage());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const totalSignals = Object.values(signalCounts).reduce((sum, count) => sum + count, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      const signals = extractSignals(inputText);
      if (signals.length > 0) {
        saveSignalToStorage(signals);
        setSignalCounts(getSignalFromStorage());
      }
      navigate('/chat');
    }
  };

  return (
    <div className="w-[600px] bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-gray-100/50 p-5">
      
      {/* Google-style logo */}
      <div className="text-center mb-5">
        <div className="flex items-center justify-center gap-2">
          <span className="text-3xl">🌱</span>
          <span className="text-2xl font-light text-gray-700">AMH</span>
          <span className="text-xs text-blue-500 font-medium bg-blue-50 px-2 py-0.5 rounded-full">beta</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">How are you feeling today?</p>
      </div>

      {/* Google-style search bar */}
      <form onSubmit={handleSearch}>
        <div className="relative">
          <div className="flex items-center w-full bg-white border border-gray-200 rounded-full px-5 py-3 transition-all duration-200 hover:shadow-[0_1px_6px_rgba(0,0,0,0.1)] focus-within:shadow-[0_1px_6px_rgba(0,0,0,0.15)] focus-within:border-blue-400">
            {/* Search icon */}
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type how you feel..."
              className="w-full bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 mx-3"
              autoFocus
            />
            
            {/* Mic icon (placeholder) */}
            <button type="button" className="text-gray-400 hover:text-gray-600 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          </div>
          
          {/* Google-style buttons below search */}
          <div className="flex justify-center gap-3 mt-4">
            <button
              type="submit"
              className="px-6 py-2 bg-gray-50 hover:bg-gray-100 text-sm text-gray-700 rounded-full border border-gray-200 transition-all"
            >
              🔍 Search
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-gray-50 hover:bg-gray-100 text-sm text-gray-700 rounded-full border border-gray-200 transition-all"
            >
              📊 Dashboard
            </button>
          </div>
        </div>
      </form>

      {/* Google-style footer with signal count */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-400">🔒 Confidential</span>
          <span className="text-[10px] text-gray-300">•</span>
          <span className="text-[10px] text-gray-400">24/7</span>
        </div>
        {totalSignals > 0 ? (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-[10px] text-gray-500">{totalSignals} signals tracked</span>
          </div>
        ) : (
          <span className="text-[10px] text-gray-400">No signals yet</span>
        )}
      </div>
    </div>
  );
}