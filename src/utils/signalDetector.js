// ========== SIGNAL DETECTION ==========
export const SIGNAL_KEYWORDS = {
  work_stress: {
    keywords: ['stress', 'work', 'boss', 'pressure', 'shift', 'tension', 'deadline', 'target', 'manager', 'workload', 'overtime', 'toxic', 'colleague'],
    emoji: '💼',
    label: 'Work Stress'
  },
  sleep_problems: {
    keywords: ['sleep', 'neend', 'tired', 'insomnia', 'exhausted', 'thakan', 'raat', 'jag raha', 'restless', 'nightmare', 'fatigue'],
    emoji: '😴',
    label: 'Sleep Issues'
  },
  loneliness: {
    keywords: ['alone', 'lonely', 'akela', 'isolated', 'no one', 'tanha', 'kisi se baat', 'left out', 'abandoned', 'disconnected'],
    emoji: '🫂',
    label: 'Loneliness'
  },
  sadness: {
    keywords: ['sad', 'depressed', 'cry', 'down', 'low', 'hopeless', 'udaas', 'dukh', 'grief', 'empty', 'worthless', 'meaningless'],
    emoji: '😔',
    label: 'Sadness'
  },
  anxiety: {
    keywords: ['anxious', 'worry', 'fear', 'panic', 'scared', 'darr', 'chain', 'ghabrahat', 'overwhelmed', 'restless', 'nervous', 'tense'],
    emoji: '😰',
    label: 'Anxiety'
  },
  financial_stress: {
    keywords: ['money', 'paise', 'loan', 'emi', 'payment', 'salary', 'financially', 'bills', 'debt', 'expensive', 'struggle'],
    emoji: '💰',
    label: 'Financial Stress'
  },
  family_conflict: {
    keywords: ['family', 'ghar', 'parents', 'wife', 'husband', 'bahu', 'beti', 'betta', 'sasural', 'rishta', 'marriage', 'divorce'],
    emoji: '👨‍👩‍👧‍👦',
    label: 'Family Conflict'
  },
  burnout: {
    keywords: ['burnout', 'exhausted', 'drained', 'empty', 'no energy', 'can\'t cope', 'overwhelmed', 'too much'],
    emoji: '🔥',
    label: 'Burnout'
  }
};

// ========== EXTRACT SIGNALS ==========
export function extractSignals(text) {
  const detected = [];
  const lower = text.toLowerCase();
  
  for (const [signal, data] of Object.entries(SIGNAL_KEYWORDS)) {
    if (data.keywords.some(kw => lower.includes(kw))) {
      detected.push({
        signal,
        label: data.label,
        emoji: data.emoji
      });
    }
  }
  
  return detected;
}

// ========== SAVE TO localStorage ==========
export function saveSignalToStorage(signals) {
  const existing = JSON.parse(localStorage.getItem('signal_counts') || '{}');
  signals.forEach(s => {
    existing[s.signal] = (existing[s.signal] || 0) + 1;
  });
  localStorage.setItem('signal_counts', JSON.stringify(existing));
  window.dispatchEvent(new Event('storage'));
}

// ========== GET FROM localStorage ==========
export function getSignalFromStorage() {
  return JSON.parse(localStorage.getItem('signal_counts') || '{}');
}

// ========== GET TOTAL SIGNALS ==========
export function getTotalSignals() {
  const data = getSignalFromStorage();
  return Object.values(data).reduce((sum, count) => sum + count, 0);
}

// ========== GET SIGNAL LABELS ==========
export function getSignalLabels() {
  const labels = {};
  for (const [signal, data] of Object.entries(SIGNAL_KEYWORDS)) {
    labels[signal] = { label: data.label, emoji: data.emoji };
  }
  return labels;
}