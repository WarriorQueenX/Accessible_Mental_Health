import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useMemory } from '../../contexts/MemoryContext';
import { detectIncreasingPattern } from '../../utils/trendAnalyzer';

export default function WidgetView() {
  const { user } = useUser();
  const { memory } = useMemory();
  const [pattern, setPattern] = useState(null);
  const [recentSignals, setRecentSignals] = useState([]);

  useEffect(() => {
    const detected = detectIncreasingPattern(memory);
    setPattern(detected);

    const weekKeys = Object.keys(memory).sort();
    if (weekKeys.length > 0) {
      const lastWeek = memory[weekKeys[weekKeys.length - 1]];
      setRecentSignals(Object.entries(lastWeek).slice(0, 3));
    }
  }, [memory]);

  return (
    <div className="w-[340px] h-[500px] bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl shadow-2xl p-5 flex flex-col border border-teal-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌱</span>
          <span className="font-bold text-teal-700 text-sm">AMH</span>
        </div>
        <span className="text-xs text-gray-400 bg-white/50 px-2 py-1 rounded-full">24/7</span>
      </div>

      {/* Greeting */}
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-700">
          ☀️ Good {new Date().getHours() < 12 ? 'Morning' : 'Evening'}, {user?.sector || 'Friend'}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {recentSignals.length > 0 
            ? `${recentSignals.length} signals detected this week` 
            : 'How are you feeling today?'}
        </p>
      </div>

      {/* Signal Summary */}
      {recentSignals.length > 0 && (
        <div className="bg-white/70 rounded-lg p-3 mb-3">
          <p className="text-xs font-medium text-gray-600 mb-2">📌 Recent Signals</p>
          <div className="flex flex-wrap gap-1.5">
            {recentSignals.map(([signal, count]) => (
              <span key={signal} className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full">
                {signal.replace('_', ' ')} ×{count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Pattern Alert */}
      {pattern && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
          <p className="text-xs font-medium text-amber-700 flex items-center gap-1">
            ⚠️ Increasing {pattern.signal.replace('_', ' ')}
          </p>
          <p className="text-xs text-amber-600 mt-0.5">
            Mentioned {pattern.count} times this week
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-auto flex gap-2">
        <Link
          to="/chat"
          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg py-3 text-sm font-medium text-center transition-all"
        >
          💬 Talk
        </Link>
        <Link
          to="/dashboard"
          className="flex-1 bg-white hover:bg-teal-50 text-teal-700 border border-teal-200 rounded-lg py-3 text-sm font-medium text-center transition-all"
        >
          📊 Progress
        </Link>
      </div>

      {/* Footer */}
      <p className="text-[10px] text-gray-400 text-center mt-3">
        AMH • Your safe space • Anonymous & Free
      </p>
    </div>
  );
}