export function reachGoal(goal, params) {
  if (typeof window === 'undefined' || !window.ym) return;
  try {
    window.ym(109048904, 'reachGoal', goal, params);
  } catch {
  }
}
