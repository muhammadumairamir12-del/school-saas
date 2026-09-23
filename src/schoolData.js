export const CLASS_SECTIONS = ['Class 10 - A', 'Class 9 - B', 'Class 8 - A', 'Class 7 - C'];

export const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function percentGrade(marks, total) {
  const max = Number(total) || 0;
  const score = Number(marks) || 0;
  if (max <= 0) return '—';
  const pct = (score / max) * 100;
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B';
  if (pct >= 60) return 'C';
  if (pct >= 50) return 'D';
  return 'F';
}
