const STRATEGIES = [
  {
    name: 'Deep Breathing',
    instruction: 'Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds. Do this 3 times.',
    emoji: '🫁'
  },
  {
    name: 'Grounding (5-4-3-2-1)',
    instruction: 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.',
    emoji: '🌿'
  },
  {
    name: 'Reframing',
    instruction: 'What would you tell a friend in this situation? Treat yourself like a friend.',
    emoji: '🤝'
  },
  {
    name: 'Gentle Movement',
    instruction: 'Stand up. Stretch your arms above your head for 10 seconds. Roll your shoulders.',
    emoji: '🧘'
  },
  {
    name: 'Mini Break',
    instruction: 'Step away for 2 minutes. Drink water. Look at something far away.',
    emoji: '☕'
  },
];

export function getCopingStrategy() {
  const strategy = STRATEGIES[Math.floor(Math.random() * STRATEGIES.length)];
  return `${strategy.emoji} **${strategy.name}**: ${strategy.instruction}`;
}