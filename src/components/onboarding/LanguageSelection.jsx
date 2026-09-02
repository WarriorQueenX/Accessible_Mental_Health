import React from 'react';

const LANGUAGES = [
  { id: 'hindi', label: 'हिन्दी (Hindi)' },
  { id: 'english', label: 'English' },
  { id: 'hinglish', label: 'Hinglish' },
  { id: 'bengali', label: 'বাংলা (Bengali)' },
  { id: 'tamil', label: 'தமிழ் (Tamil)' },
];

export default function LanguageSelection({ onSelect }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700">Kis bhasha mein baat karein?</h2>
      <div className="space-y-2">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.id}
            onClick={() => onSelect(lang.id)}
            className="w-full p-3 bg-gray-50 hover:bg-teal-50 border-2 border-transparent hover:border-teal-300 rounded-xl text-left transition-all duration-200"
          >
            <span className="font-medium text-gray-700">{lang.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}