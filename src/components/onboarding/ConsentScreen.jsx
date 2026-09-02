import React from 'react';

export default function ConsentScreen({ onConsent }) {
  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <h2 className="text-lg font-semibold text-amber-800">⚠️ Important</h2>
        <p className="text-sm text-amber-700 mt-1">
          Accessible Mental Health aapki baatein sunta hai, lekin personal information nahi rakhta.
          Humne aapko pehchanne ke liye random ID di hai.
        </p>
        <p className="text-sm text-amber-700 mt-2">
          Kya aap is sehmat hain?
        </p>
      </div>
      <button
        onClick={onConsent}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-xl transition-all duration-200"
      >
        Haan, main sehmat hoon
      </button>
    </div>
  );
}