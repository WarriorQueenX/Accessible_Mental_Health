import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { MemoryProvider } from './contexts/MemoryContext';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import DashboardPage from './pages/DashboardPage';
import PeerPage from './pages/PeerPage';
import WidgetPage from './pages/WidgetPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <UserProvider>
      <MemoryProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/peer" element={<PeerPage />} />
              <Route path="/widget" element={<WidgetPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </BrowserRouter>
      </MemoryProvider>
    </UserProvider>
  );
}

export default App;