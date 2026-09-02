// src/utils/helpers.js

export const SIGNAL_KEYWORDS = {
  work_stress: { keywords: ['stress','work','boss','pressure'], emoji: '💼', label: 'Work Stress' },
  sleep_problems: { keywords: ['sleep','neend','tired','insomnia'], emoji: '😴', label: 'Sleep Issues' },
  loneliness: { keywords: ['alone','lonely','akela'], emoji: '🫂', label: 'Loneliness' },
  sadness: { keywords: ['sad','depressed','cry','down','low'], emoji: '😔', label: 'Sadness' },
  anxiety: { keywords: ['anxious','worry','fear','panic'], emoji: '😰', label: 'Anxiety' },
  anger: { keywords: ['angry','frustrated','gussa'], emoji: '😤', label: 'Anger' },
  burnout: { keywords: ['burnout','drained','empty','exhausted'], emoji: '🔥', label: 'Burnout' }
};

export function extractSignals(text) { /* ... */ }
export function isCrisis(text) { /* ... */ }
export function saveSignalToStorage(signals) { /* ... */ }
export function getSignalFromStorage() { /* ... */ }
export function saveCopingFeedback(strategy, helpful, context) { /* ... */ }
export function getCopingFeedback() { /* ... */ }

export const COPING_STRATEGIES = {
  slow_breathing: { label: 'Slow Breathing', emoji: '🌬️', instruction: 'Breathe in slowly...' },
  // ... add all strategies from the previous code
};

export const SITUATION_STRATEGIES = {
  work_stress: ['slow_breathing', 'one_tiny_step', 'short_walk'],
  // ... etc
};

export function getSituationType(signals) {
  if (!signals || signals.length === 0) return 'anxiety';
  const priority = ['burnout','anxiety','sadness','loneliness','anger','sleep_problems','work_stress'];
  for (const type of priority) {
    if (signals.some(s => s.signal === type)) return type;
  }
  return signals[0].signal;
}

export function getPersonalizedStrategy(situation, usedStrategies) {
  // ... (from previous code)
}