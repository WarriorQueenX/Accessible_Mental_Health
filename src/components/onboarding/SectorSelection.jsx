import React from 'react';

const SECTORS = [
  { id: 'bpo', label: 'BPO / Call Center', icon: '📞' },
  { id: 'gig', label: 'Gig / Delivery Worker', icon: '🛵' },
  { id: 'factory', label: 'Factory Worker', icon: '🏭' },
  { id: 'construction', label: 'Construction Worker', icon: '🏗️' },
  { id: 'driver', label: 'Driver / Transporter', icon: '🚗' },
  { id: 'retail', label: 'Retail / Service Worker', icon: '🛍️' },
  { id: 'other', label: 'Other / Not Listed', icon: '👤' },
];

export default function SectorSelection({ onSelect }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700">Aap kaam karte hain?</h2>
      <div className="grid grid-cols-2 gap-3">
        {SECTORS.map((sector) => (
          <button
            key={sector.id}
            onClick={() => onSelect(sector.id)}
            className="p-4 bg-gray-50 hover:bg-teal-50 border-2 border-transparent hover:border-teal-300 rounded-xl text-center transition-all duration-200"
          >
            <div className="text-2xl mb-1">{sector.icon}</div>
            <div className="text-sm font-medium text-gray-700">{sector.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}