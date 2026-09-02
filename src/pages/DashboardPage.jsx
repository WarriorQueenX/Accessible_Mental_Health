import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import VoiceRecordingsList from '../components/VoiceRecordingsList';
import { getSignalFromStorage, getSignalLabels } from '../utils/helpers';

function DashboardPage() {
  const [signalCounts, setSignalCounts] = useState(getSignalFromStorage);
  const signalLabels = getSignalLabels();

  useEffect(() => {
    const handleStorage = () => {
      setSignalCounts(getSignalFromStorage());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const totalSignals = Object.values(signalCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="min-h-screen bg-[#f0f2f5] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[#0f172a]">📊 Dashboard</h1>
          <Link to="/" className="text-sm text-[#64748b] bg-white px-4 py-2 rounded-xl border border-[#e2e8f0] hover:border-[#94a3b8] transition">← Back</Link>
        </div>

        {/* Stats */}
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

        {/* Voice Recordings Section */}
        <div className="bg-white rounded-xl border border-[#f1f5f9] p-6 mb-6">
          <h2 className="text-sm font-semibold text-[#0f172a] mb-4">🎤 Voice Recordings</h2>
          <VoiceRecordingsList />
        </div>

        {/* Signal Breakdown */}
        <div className="bg-white rounded-xl border border-[#f1f5f9] p-6 mb-6">
          <h2 className="text-sm font-semibold text-[#0f172a] mb-4">📌 Signal Breakdown</h2>
          {Object.keys(signalCounts).length === 0 ? (
            <div className="text-center text-[#94a3b8] text-sm py-8">No signals detected yet.</div>
          ) : (
            <div className="space-y-2">
              {Object.entries(signalCounts).map(([signal, count]) => (
                <div key={signal} className="flex items-center justify-between py-2 border-b border-[#f1f5f9] last:border-0">
                  <span className="text-sm text-[#0f172a]">
                    {signalLabels[signal]?.emoji || '📌'} {signalLabels[signal]?.label || signal}
                  </span>
                  <span className="text-sm font-semibold text-[#0f172a] bg-[#f1f5f9] px-3 py-1 rounded-full">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Signal Trends */}
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

export default DashboardPage;