export function detectIncreasingPattern(memory) {
  const weeks = Object.keys(memory).sort();
  if (weeks.length < 3) return null;

  const lastWeek = memory[weeks[weeks.length - 1]];
  const prevWeek = memory[weeks[weeks.length - 2]];
  const olderWeek = memory[weeks[weeks.length - 3]];

  if (!lastWeek || !prevWeek || !olderWeek) return null;

  for (const [signal, count] of Object.entries(lastWeek)) {
    const prevCount = prevWeek[signal] || 0;
    const olderCount = olderWeek[signal] || 0;

    if (count > prevCount && prevCount > olderCount && count >= 2) {
      return { signal, count, trend: 'increasing', severity: '⚠️ concerning' };
    }
  }
  return null;
}