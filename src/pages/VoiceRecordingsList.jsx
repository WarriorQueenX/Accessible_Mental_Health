import React, { useState, useEffect } from 'react';

export default function VoiceRecordingsList() {
  const [recordings, setRecordings] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('voice_recordings');
    if (saved) {
      setRecordings(JSON.parse(saved));
    }
  }, []);

  // Listen for new recordings from other tabs/windows
  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('voice_recordings');
      if (saved) {
        setRecordings(JSON.parse(saved));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  if (recordings.length === 0) {
    return (
      <div className="text-center text-[#94a3b8] text-sm py-4">
        No voice recordings yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recordings.map((rec) => (
        <div
          key={rec.id}
          className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-xl border border-[#f1f5f9]"
        >
          <span className="text-lg">🎤</span>
          <div className="flex-1">
            <div className="text-xs text-[#94a3b8]">
              {new Date(rec.timestamp).toLocaleString()}
            </div>
            <audio controls className="w-full h-8 mt-1">
              <source src={rec.audioData} type="audio/webm" />
              Your browser does not support the audio element.
            </audio>
          </div>
          <span className="text-xs text-[#94a3b8]">{rec.duration}s</span>
        </div>
      ))}
    </div>
  );
}