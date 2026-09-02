import React from 'react';

export default function SafetyAlert({ onDismiss }) {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 m-2 rounded-lg">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🆘</span>
        <div className="flex-1">
          <h3 className="font-semibold text-red-800">We're here for you</h3>
          <p className="text-sm text-red-700 mt-1">
            You've shared something serious. Please call <strong>Tele MANAS at 14416</strong> 
            (free, 24/7, professional support available).
          </p>
          <div className="mt-2 flex gap-2">
            <a
              href="tel:14416"
              className="text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all"
            >
              📞 Call 14416 Now
            </a>
            <button
              onClick={onDismiss}
              className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}