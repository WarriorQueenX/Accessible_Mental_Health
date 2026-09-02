import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import SectorSelection from '../components/onboarding/SectorSelection';
import LanguageSelection from '../components/onboarding/LanguageSelection';
import ConsentScreen from '../components/onboarding/ConsentScreen';

export default function HomePage() {
  const navigate = useNavigate();
  const { user, updateUser } = useUser();

  const handleComplete = () => {
    navigate('/chat');
  };

  // If user already completed onboarding, go to chat
  if (user.sector && user.consentGiven) {
    navigate('/chat');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌱</div>
          <h1 className="text-3xl font-bold text-teal-700">Accessible Mental Health</h1>
          <p className="text-gray-500 mt-1">Aapka apna mental health saathi</p>
        </div>

        {!user.sector && (
          <SectorSelection onSelect={(sector) => updateUser({ sector })} />
        )}

        {user.sector && !user.language && (
          <LanguageSelection onSelect={(lang) => updateUser({ language: lang })} />
        )}

        {user.sector && user.language && !user.consentGiven && (
          <ConsentScreen onConsent={() => {
            updateUser({ consentGiven: true });
            handleComplete();
          }} />
        )}
      </div>
    </div>
  );
}