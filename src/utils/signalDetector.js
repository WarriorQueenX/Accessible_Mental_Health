export const SIGNAL_KEYWORDS = {
  work_stress: ['boss', 'deadline', 'pressure', 'target', 'shift', 'kaam', 'stress', 'tension', 'manager', 'work'],
  sleep_problems: ['sleep', 'insomnia', 'tired', 'exhausted', 'night', 'neend', 'thakan', 'jag raha'],
  loneliness: ['alone', 'lonely', 'nobody', 'no one', 'akela', 'tanha', 'kisi se baat'],
  anxiety: ['anxious', 'worry', 'fear', 'panic', 'chain', 'dar', 'fear', 'darr', 'darta'],
  hopelessness: ['hopeless', 'useless', 'nothing', 'pointless', 'ummeed', 'bechain', 'khatam'],
  social_withdrawal: ['avoid', 'hide', 'isolated', 'social', 'dost', 'baat', 'milna'],
  financial_stress: ['money', 'loan', 'emi', 'paise', 'problem', 'payment', 'salary', 'financially'],
  family_conflict: ['family', 'ghar', 'parents', 'wife', 'husband', 'bahu', 'beti'],
  extreme_thoughts: ['suicide', 'self-harm', 'die', 'kill', 'mar jana', 'khatam kar doon', 'end life'],
};

export function extractSignals(message) {
  const detected = [];
  const lowerMsg = message.toLowerCase();

  for (const [signal, keywords] of Object.entries(SIGNAL_KEYWORDS)) {
    if (keywords.some(kw => lowerMsg.includes(kw))) {
      detected.push(signal);
    }
  }
  return detected;
}

export function isCrisis(message) {
  const crisisKeywords = SIGNAL_KEYWORDS.extreme_thoughts;
  const lowerMsg = message.toLowerCase();
  return crisisKeywords.some(kw => lowerMsg.includes(kw));
}