export const appTabs = ['today', 'calendar', 'balances', 'history', 'shifts', 'changes', 'settings'] as const;
export type AppTab = typeof appTabs[number];
export function isAppTab(value: unknown): value is AppTab {
  return typeof value === 'string' && (appTabs as readonly string[]).includes(value);
}

// Navigation metadata only: never put account IDs or records in browser history.
export function navigationEntry(session: string, index: number, tab: AppTab) {
  return { zeitkontoNavigation: session, index, tab };
}
export function readNavigation(value: unknown, session: string) {
  if (!value || typeof value !== 'object') return null;
  const entry = value as Record<string, unknown>;
  return entry.zeitkontoNavigation === session && Number.isInteger(entry.index)
    && Number(entry.index) >= -1 && isAppTab(entry.tab)
    ? { index: Number(entry.index), tab: entry.tab } : null;
}
