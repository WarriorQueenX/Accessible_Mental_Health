import React from 'react';
import ChatInterface from '../components/chat/ChatInterface';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-teal-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <h1 className="font-semibold">Accessible Mental Health</h1>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="bg-teal-500 px-3 py-1 rounded-full text-xs">24/7</span>
          </div>
        </div>

        {/* Chat Interface */}
        <ChatInterface />
      </div>
    </div>
  );
}