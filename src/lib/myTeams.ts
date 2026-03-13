// Track which teams the current user created via localStorage
const STORAGE_KEY = 'optc_my_teams';

export function getMyTeamIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

export function addMyTeam(teamId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const ids = getMyTeamIds();
    if (ids.indexOf(teamId) < 0) {
      ids.push(teamId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    }
  } catch { /* ignore */ }
}

export function removeMyTeam(teamId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const ids = getMyTeamIds().filter(id => id !== teamId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch { /* ignore */ }
}

export function isMyTeam(teamId: string): boolean {
  return getMyTeamIds().indexOf(teamId) >= 0;
}
