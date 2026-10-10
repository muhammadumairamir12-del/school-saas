/** Simple localStorage store for school data */

const KEY = 'sky-school-v1';

const DEFAULT_CLASSES = [
  { id: 'c1', name: 'Nursery', section: 'A', capacity: 30 },
  { id: 'c2', name: 'KG', section: 'A', capacity: 30 },
  { id: 'c3', name: 'Class 1', section: 'A', capacity: 35 },
  { id: 'c4', name: 'Class 2', section: 'A', capacity: 35 },
  { id: 'c5', name: 'Class 5', section: 'A', capacity: 40 },
  { id: 'c6', name: 'Class 8', section: 'A', capacity: 40 },
  { id: 'c7', name: 'Class 10', section: 'A', capacity: 40 },
];

const DEFAULT_STUDENTS = [
  { id: 's1', name: 'Ahmed Khan', rollNo: '101', classId: 'c7', gender: 'Male', phone: '0300-1111111', guardian: 'Imran Khan', monthlyFee: 4500, status: 'Active' },
  { id: 's2', name: 'Sara Ali', rollNo: '102', classId: 'c7', gender: 'Female', phone: '0300-2222222', guardian: 'Ali Raza', monthlyFee: 4500, status: 'Active' },
  { id: 's3', name: 'Hassan Malik', rollNo: '201', classId: 'c5', gender: 'Male', phone: '0301-3333333', guardian: 'Malik Asif', monthlyFee: 3500, status: 'Active' },
  { id: 's4', name: 'Fatima Noor', rollNo: '202', classId: 'c5', gender: 'Female', phone: '0301-4444444', guardian: 'Noor Ahmed', monthlyFee: 3500, status: 'Active' },
  { id: 's5', name: 'Bilal Ahmed', rollNo: '301', classId: 'c3', gender: 'Male', phone: '0321-5555555', guardian: 'Ahmed Shah', monthlyFee: 2800, status: 'Active' },
  { id: 's6', name: 'Ayesha Siddiqui', rollNo: '001', classId: 'c1', gender: 'Female', phone: '0333-6666666', guardian: 'Siddiqui Sb', monthlyFee: 2500, status: 'Active' },
];

const DEFAULT_STAFF = [
  { id: 't1', name: 'Priya Nair', role: 'Teacher', subject: 'Mathematics', phone: '0300-7777777', salary: 45000, status: 'Active' },
  { id: 't2', name: 'Vikram Malhotra', role: 'Teacher', subject: 'English', phone: '0300-8888888', salary: 42000, status: 'Active' },
  { id: 't3', name: 'Sana Ahmed', role: 'Teacher', subject: 'Science', phone: '0301-9999999', salary: 43000, status: 'Active' },
  { id: 't4', name: 'Imran Khan', role: 'Admin', subject: '—', phone: '0321-1010101', salary: 55000, status: 'Active' },
];

const DEFAULT_SETTINGS = {
  schoolName: 'SkyEagle School',
  campus: 'Main Campus',
  session: '2026-2027',
  phone: '042-1234567',
  email: 'info@skyeagle.edu',
  address: 'Lahore, Pakistan',
};

function emptyState() {
  return {
    settings: { ...DEFAULT_SETTINGS },
    classes: [...DEFAULT_CLASSES],
    students: [...DEFAULT_STUDENTS],
    staff: [...DEFAULT_STAFF],
    fees: [],
    attendance: [],
    notices: [
      {
        id: 'n1',
        title: 'Welcome to the new session',
        body: 'Classes start from Monday. Please ensure fee clearance.',
        date: new Date().toISOString().slice(0, 10),
      },
    ],
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const s = emptyState();
      localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    return { ...emptyState(), ...JSON.parse(raw) };
  } catch {
    return emptyState();
  }
}

function save(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
  return state;
}

export function getState() {
  return load();
}

export function updateSettings(patch) {
  const s = load();
  s.settings = { ...s.settings, ...patch };
  return save(s);
}

export function listClasses() {
  return load().classes;
}

export function saveClass(row) {
  const s = load();
  const idx = s.classes.findIndex((c) => c.id === row.id);
  if (idx >= 0) s.classes[idx] = row;
  else s.classes.push({ ...row, id: row.id || `c${Date.now()}` });
  return save(s).classes;
}

export function removeClass(id) {
  const s = load();
  s.classes = s.classes.filter((c) => c.id !== id);
  return save(s).classes;
}

export function listStudents() {
  return load().students;
}

export function saveStudent(row) {
  const s = load();
  const idx = s.students.findIndex((x) => x.id === row.id);
  if (idx >= 0) s.students[idx] = row;
  else s.students.push({ ...row, id: row.id || `s${Date.now()}`, status: row.status || 'Active' });
  return save(s).students;
}

export function removeStudent(id) {
  const s = load();
  s.students = s.students.filter((x) => x.id !== id);
  return save(s).students;
}

export function listStaff() {
  return load().staff;
}

export function saveStaff(row) {
  const s = load();
  const idx = s.staff.findIndex((x) => x.id === row.id);
  if (idx >= 0) s.staff[idx] = row;
  else s.staff.push({ ...row, id: row.id || `t${Date.now()}`, status: row.status || 'Active' });
  return save(s).staff;
}

export function removeStaff(id) {
  const s = load();
  s.staff = s.staff.filter((x) => x.id !== id);
  return save(s).staff;
}

export function listFees() {
  return load().fees;
}

export function addFee(row) {
  const s = load();
  s.fees.unshift({
    ...row,
    id: row.id || `f${Date.now()}`,
    paidOn: row.paidOn || new Date().toISOString().slice(0, 10),
  });
  return save(s).fees;
}

export function listAttendance() {
  return load().attendance;
}

export function saveAttendance(record) {
  const s = load();
  const idx = s.attendance.findIndex(
    (a) => a.date === record.date && a.classId === record.classId
  );
  if (idx >= 0) s.attendance[idx] = { ...s.attendance[idx], ...record };
  else s.attendance.push({ ...record, id: `a${Date.now()}` });
  return save(s).attendance;
}

export function listNotices() {
  return load().notices;
}

export function saveNotice(row) {
  const s = load();
  const idx = s.notices.findIndex((n) => n.id === row.id);
  if (idx >= 0) s.notices[idx] = row;
  else
    s.notices.unshift({
      ...row,
      id: row.id || `n${Date.now()}`,
      date: row.date || new Date().toISOString().slice(0, 10),
    });
  return save(s).notices;
}

export function removeNotice(id) {
  const s = load();
  s.notices = s.notices.filter((n) => n.id !== id);
  return save(s).notices;
}

export function classLabel(classId, classes = null) {
  const list = classes || listClasses();
  const c = list.find((x) => x.id === classId);
  return c ? `${c.name} - ${c.section}` : '—';
}

export function money(n) {
  return `Rs ${Math.round(Number(n) || 0).toLocaleString('en-PK')}`;
}

export function resetDemoData() {
  const s = emptyState();
  save(s);
  return s;
}
