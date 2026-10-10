export const CLASS_SECTIONS = [
  'Play Group - A',
  'Nursery - A',
  'Class 1 - A',
  'Class 2 - A',
  'Class 3 - B',
  'Class 5 - A',
  'Class 7 - C',
  'Class 8 - A',
  'Class 9 - B',
  'Class 10 - A',
];

export const CLASS_NAMES = [
  'Play Group', 'Nursery', 'Class 1', 'Class 2', 'Class 3',
  'Class 5', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
];

export const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const SUBJECTS = [
  'Mathematics', 'English', 'Science', 'Urdu', 'Islamiat',
  'Computer', 'Social Studies', 'Physics', 'Chemistry', 'Biology', 'Art',
];

export const TEACHER_NAMES = [
  'Priya Nair', 'Vikram Malhotra', 'Sana Ahmed', 'Imran Khan',
  'Fatima Noor', 'Ali Raza', 'Mehreen Shah', 'Hassan Ali',
];

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

export function money(n) {
  return `Rs. ${Math.round(Number(n) || 0).toLocaleString()}`;
}
