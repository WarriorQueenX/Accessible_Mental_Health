import React from 'react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-teal-700">📊 Dashboard</h1>
          <Link to="/" className="text-teal-600 hover:text-teal-700 text-sm">
            ← Back
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <p className="text-gray-500">Dashboard coming soon...</p>
        </div>
      </div>
    </div>
  );
}