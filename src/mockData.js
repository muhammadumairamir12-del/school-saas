const today = () => new Date().toISOString().split('T')[0];
const month = () => new Date().toISOString().slice(0, 7);
const now = () => new Date().toISOString();

export const DEMO_STUDENTS = [
  { id: 'std-101', name: 'Aarav Sharma', fatherName: 'Rajesh Sharma', contact: '0300-1112233', classSection: 'Class 10 - A', admissionDate: '2024-04-10', monthlyFee: 3500, status: 'Active', rollNo: '10A-01', gender: 'Male', photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80', createdAt: now() },
  { id: 'std-102', name: 'Diya Patel', fatherName: 'Suresh Patel', contact: '0300-1112234', classSection: 'Class 10 - A', admissionDate: '2024-04-12', monthlyFee: 3500, status: 'Active', rollNo: '10A-02', gender: 'Female', photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', createdAt: now() },
  { id: 'std-103', name: 'Rohan Gupta', fatherName: 'Amit Gupta', contact: '0300-1112235', classSection: 'Class 9 - B', admissionDate: '2024-05-01', monthlyFee: 3200, status: 'Active', rollNo: '9B-01', gender: 'Male', photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', createdAt: now() },
  { id: 'std-104', name: 'Ananya Verma', fatherName: 'Vikas Verma', contact: '0300-1112236', classSection: 'Class 9 - B', admissionDate: '2024-05-05', monthlyFee: 3200, status: 'Active', rollNo: '9B-02', gender: 'Female', photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80', createdAt: now() },
  { id: 'std-105', name: 'Hassan Ali', fatherName: 'Tariq Ali', contact: '0301-5556677', classSection: 'Class 8 - A', admissionDate: '2025-04-02', monthlyFee: 2800, status: 'Active', rollNo: '8A-01', gender: 'Male', photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80', createdAt: now() },
  { id: 'std-106', name: 'Zara Khan', fatherName: 'Imran Khan', contact: '0301-5556688', classSection: 'Class 8 - A', admissionDate: '2025-04-08', monthlyFee: 2800, status: 'Active', rollNo: '8A-02', gender: 'Female', photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', createdAt: now() },
  { id: 'std-107', name: 'Bilal Ahmed', fatherName: 'Naveed Ahmed', contact: '0321-7778899', classSection: 'Class 7 - C', admissionDate: '2025-04-15', monthlyFee: 2500, status: 'Active', rollNo: '7C-01', gender: 'Male', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', createdAt: now() },
  { id: 'std-108', name: 'Ayesha Noor', fatherName: 'Farhan Noor', contact: '0321-7778800', classSection: 'Class 5 - A', admissionDate: month() + '-03', monthlyFee: 2200, status: 'Active', rollNo: '5A-01', gender: 'Female', photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80', createdAt: now() },
  { id: 'std-109', name: 'Omar Farooq', fatherName: 'Salman Farooq', contact: '0333-4445566', classSection: 'Class 3 - B', admissionDate: month() + '-05', monthlyFee: 2000, status: 'Active', rollNo: '3B-01', gender: 'Male', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', createdAt: now() },
  { id: 'std-110', name: 'Hina Malik', fatherName: 'Asif Malik', contact: '0333-4445577', classSection: 'Nursery - A', admissionDate: '2025-08-20', monthlyFee: 1800, status: 'Active', rollNo: 'NA-01', gender: 'Female', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', createdAt: now() },
  { id: 'std-111', name: 'Usman Shah', fatherName: 'Kamran Shah', contact: '0345-1212121', classSection: 'Class 10 - A', admissionDate: '2024-04-20', monthlyFee: 3500, status: 'Active', rollNo: '10A-03', gender: 'Male', photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', createdAt: now() },
  { id: 'std-112', name: 'Sara Iqbal', fatherName: 'Javed Iqbal', contact: '0345-1313131', classSection: 'Class 2 - A', admissionDate: month() + '-01', monthlyFee: 1900, status: 'Active', rollNo: '2A-01', gender: 'Female', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', createdAt: now() },
];

export const DEMO_STAFF = [
  { id: 'stf-1', name: 'Priya Nair', role: 'Class Incharge', contact: '0300-9001001', salary: 45000, assignedClass: 'Class 10 - A', subject: 'English', email: 'priya@sky.edu', status: 'Active', createdAt: now() },
  { id: 'stf-2', name: 'Vikram Malhotra', role: 'Class Incharge', contact: '0300-9001002', salary: 42000, assignedClass: 'Class 9 - B', subject: 'Mathematics', email: 'vikram@sky.edu', status: 'Active', createdAt: now() },
  { id: 'stf-3', name: 'Sana Ahmed', role: 'Class Incharge', contact: '0300-9001003', salary: 40000, assignedClass: 'Class 8 - A', subject: 'Science', email: 'sana@sky.edu', status: 'Active', createdAt: now() },
  { id: 'stf-4', name: 'Imran Khan', role: 'Subject Teacher', contact: '0300-9001004', salary: 38000, assignedClass: 'Class 7 - C', subject: 'Urdu', email: 'imran@sky.edu', status: 'Active', createdAt: now() },
  { id: 'stf-5', name: 'Fatima Noor', role: 'Class Incharge', contact: '0300-9001005', salary: 36000, assignedClass: 'Class 5 - A', subject: 'Islamiyat', email: 'fatima@sky.edu', status: 'Active', createdAt: now() },
  { id: 'stf-6', name: 'Ali Raza', role: 'Computer Teacher', contact: '0300-9001006', salary: 39000, assignedClass: 'Class 10 - A', subject: 'Computer', email: 'ali@sky.edu', status: 'Active', createdAt: now() },
  { id: 'stf-7', name: 'Mehreen Shah', role: 'Class Incharge', contact: '0300-9001007', salary: 35000, assignedClass: 'Nursery - A', subject: 'Art', email: 'mehreen@sky.edu', status: 'Active', createdAt: now() },
  { id: 'stf-8', name: 'Hassan Ali', role: 'Accountant', contact: '0300-9001008', salary: 48000, assignedClass: '', subject: 'Accounts', email: 'hassan@sky.edu', status: 'Active', createdAt: now() },
];

export const DEMO_SESSIONS = [
  { id: 'ses-2026', name: '2026-2027', startDate: '2026-04-01', endDate: '2027-03-31', status: 'Active', note: 'Current academic year' },
  { id: 'ses-2025', name: '2025-2026', startDate: '2025-04-01', endDate: '2026-03-31', status: 'Closed', note: 'Previous year' },
  { id: 'ses-2024', name: '2024-2025', startDate: '2024-04-01', endDate: '2025-03-31', status: 'Closed', note: 'Archived' },
];

export const DEMO_CLASSES = [
  { id: 'cls-pg', name: 'Play Group', level: 'Pre-School', monthlyFee: 1600, capacity: 20, incharge: 'Mehreen Shah', session: '2026-2027', status: 'Active' },
  { id: 'cls-nur', name: 'Nursery', level: 'Pre-School', monthlyFee: 1800, capacity: 25, incharge: 'Mehreen Shah', session: '2026-2027', status: 'Active' },
  { id: 'cls-1', name: 'Class 1', level: 'Primary', monthlyFee: 1900, capacity: 30, incharge: 'Fatima Noor', session: '2026-2027', status: 'Active' },
  { id: 'cls-2', name: 'Class 2', level: 'Primary', monthlyFee: 1900, capacity: 30, incharge: 'Fatima Noor', session: '2026-2027', status: 'Active' },
  { id: 'cls-3', name: 'Class 3', level: 'Primary', monthlyFee: 2000, capacity: 32, incharge: 'Imran Khan', session: '2026-2027', status: 'Active' },
  { id: 'cls-5', name: 'Class 5', level: 'Primary', monthlyFee: 2200, capacity: 35, incharge: 'Fatima Noor', session: '2026-2027', status: 'Active' },
  { id: 'cls-7', name: 'Class 7', level: 'Middle', monthlyFee: 2500, capacity: 35, incharge: 'Imran Khan', session: '2026-2027', status: 'Active' },
  { id: 'cls-8', name: 'Class 8', level: 'Middle', monthlyFee: 2800, capacity: 35, incharge: 'Sana Ahmed', session: '2026-2027', status: 'Active' },
  { id: 'cls-9', name: 'Class 9', level: 'Secondary', monthlyFee: 3200, capacity: 40, incharge: 'Vikram Malhotra', session: '2026-2027', status: 'Active' },
  { id: 'cls-10', name: 'Class 10', level: 'Secondary', monthlyFee: 3500, capacity: 40, incharge: 'Priya Nair', session: '2026-2027', status: 'Active' },
];

export const DEMO_SECTIONS = [
  { id: 'sec-pga', className: 'Play Group', name: 'A', room: 'PG-1', incharge: 'Mehreen Shah', capacity: 20, status: 'Active' },
  { id: 'sec-na', className: 'Nursery', name: 'A', room: 'N-1', incharge: 'Mehreen Shah', capacity: 25, status: 'Active' },
  { id: 'sec-1a', className: 'Class 1', name: 'A', room: '101', incharge: 'Fatima Noor', capacity: 30, status: 'Active' },
  { id: 'sec-2a', className: 'Class 2', name: 'A', room: '102', incharge: 'Fatima Noor', capacity: 30, status: 'Active' },
  { id: 'sec-3b', className: 'Class 3', name: 'B', room: '103', incharge: 'Imran Khan', capacity: 32, status: 'Active' },
  { id: 'sec-5a', className: 'Class 5', name: 'A', room: '201', incharge: 'Fatima Noor', capacity: 35, status: 'Active' },
  { id: 'sec-7c', className: 'Class 7', name: 'C', room: '202', incharge: 'Imran Khan', capacity: 35, status: 'Active' },
  { id: 'sec-8a', className: 'Class 8', name: 'A', room: '203', incharge: 'Sana Ahmed', capacity: 35, status: 'Active' },
  { id: 'sec-9b', className: 'Class 9', name: 'B', room: '301', incharge: 'Vikram Malhotra', capacity: 40, status: 'Active' },
  { id: 'sec-10a', className: 'Class 10', name: 'A', room: '302', incharge: 'Priya Nair', capacity: 40, status: 'Active' },
];

export const DEMO_TESTS = [
  { id: 'test-1', name: 'Unit Test 1', examType: 'Unit Test', classSection: 'Class 10 - A', subject: 'Mathematics', totalMarks: 50, date: today(), session: '2026-2027', teacher: 'Vikram Malhotra', status: 'Published' },
  { id: 'test-2', name: 'Unit Test 1', examType: 'Unit Test', classSection: 'Class 10 - A', subject: 'English', totalMarks: 50, date: today(), session: '2026-2027', teacher: 'Priya Nair', status: 'Published' },
  { id: 'test-3', name: 'Mid Term', examType: 'Mid Term', classSection: 'Class 9 - B', subject: 'Science', totalMarks: 100, date: today(), session: '2026-2027', teacher: 'Sana Ahmed', status: 'Published' },
  { id: 'test-4', name: 'Class Test', examType: 'Class Test', classSection: 'Class 8 - A', subject: 'Computer', totalMarks: 25, date: today(), session: '2026-2027', teacher: 'Ali Raza', status: 'Draft' },
  { id: 'test-5', name: 'Monthly Test', examType: 'Monthly', classSection: 'Class 7 - C', subject: 'Urdu', totalMarks: 40, date: today(), session: '2026-2027', teacher: 'Imran Khan', status: 'Published' },
];

export const DEMO_PAPERS = [
  { id: 'paper-1', title: 'Math UT-1 Question Paper', classSection: 'Class 10 - A', subject: 'Mathematics', examName: 'Unit Test 1', totalMarks: 50, duration: '60 min', setBy: 'Vikram Malhotra', status: 'Ready', date: today() },
  { id: 'paper-2', title: 'English UT-1 Paper', classSection: 'Class 10 - A', subject: 'English', examName: 'Unit Test 1', totalMarks: 50, duration: '60 min', setBy: 'Priya Nair', status: 'Ready', date: today() },
  { id: 'paper-3', title: 'Science Mid Term Paper', classSection: 'Class 9 - B', subject: 'Science', examName: 'Mid Term', totalMarks: 100, duration: '2 hours', setBy: 'Sana Ahmed', status: 'Ready', date: today() },
  { id: 'paper-4', title: 'Computer Class Test', classSection: 'Class 8 - A', subject: 'Computer', examName: 'Class Test', totalMarks: 25, duration: '30 min', setBy: 'Ali Raza', status: 'Draft', date: today() },
];

export const DEMO_EXAMS = [
  { id: 'ex-1', studentId: 'std-101', studentName: 'Aarav Sharma', classSection: 'Class 10 - A', examName: 'Unit Test 1', subject: 'Mathematics', marks: 42, total: 50, session: '2026-2027' },
  { id: 'ex-2', studentId: 'std-102', studentName: 'Diya Patel', classSection: 'Class 10 - A', examName: 'Unit Test 1', subject: 'Mathematics', marks: 46, total: 50, session: '2026-2027' },
  { id: 'ex-3', studentId: 'std-111', studentName: 'Usman Shah', classSection: 'Class 10 - A', examName: 'Unit Test 1', subject: 'Mathematics', marks: 38, total: 50, session: '2026-2027' },
  { id: 'ex-4', studentId: 'std-101', studentName: 'Aarav Sharma', classSection: 'Class 10 - A', examName: 'Unit Test 1', subject: 'English', marks: 40, total: 50, session: '2026-2027' },
  { id: 'ex-5', studentId: 'std-103', studentName: 'Rohan Gupta', classSection: 'Class 9 - B', examName: 'Mid Term', subject: 'Science', marks: 71, total: 100, session: '2026-2027' },
  { id: 'ex-6', studentId: 'std-104', studentName: 'Ananya Verma', classSection: 'Class 9 - B', examName: 'Mid Term', subject: 'Science', marks: 84, total: 100, session: '2026-2027' },
  { id: 'ex-7', studentId: 'std-105', studentName: 'Hassan Ali', classSection: 'Class 8 - A', examName: 'Class Test', subject: 'Computer', marks: 20, total: 25, session: '2026-2027' },
  { id: 'ex-8', studentId: 'std-107', studentName: 'Bilal Ahmed', classSection: 'Class 7 - C', examName: 'Monthly Test', subject: 'Urdu', marks: 32, total: 40, session: '2026-2027' },
];

export const DEMO_FEES = [
  { id: 'fee-201', studentId: 'std-101', studentName: 'Aarav Sharma', classSection: 'Class 10 - A', month: month(), amount: 3500, paymentDate: today(), receiptNo: 'REC-100201', method: 'Cash', createdAt: now() },
  { id: 'fee-202', studentId: 'std-103', studentName: 'Rohan Gupta', classSection: 'Class 9 - B', month: month(), amount: 3200, paymentDate: today(), receiptNo: 'REC-100202', method: 'Bank', createdAt: now() },
  { id: 'fee-203', studentId: 'std-105', studentName: 'Hassan Ali', classSection: 'Class 8 - A', month: month(), amount: 2800, paymentDate: today(), receiptNo: 'REC-100203', method: 'JazzCash', createdAt: now() },
  { id: 'fee-204', studentId: 'std-108', studentName: 'Ayesha Noor', classSection: 'Class 5 - A', month: month(), amount: 2200, paymentDate: today(), receiptNo: 'REC-100204', method: 'Cash', createdAt: now() },
  { id: 'fee-205', studentId: 'std-110', studentName: 'Hina Malik', classSection: 'Nursery - A', month: month(), amount: 1800, paymentDate: today(), receiptNo: 'REC-100205', method: 'Cash', createdAt: now() },
];

export const DEMO_VOUCHERS = [
  { id: 'vch-101', studentName: 'Aarav Sharma', classSection: 'Class 10 - A', month: month(), amount: 3500, dueDate: month() + '-10', status: 'Paid', session: '2026-2027' },
  { id: 'vch-102', studentName: 'Diya Patel', classSection: 'Class 10 - A', month: month(), amount: 3500, dueDate: month() + '-10', status: 'Unpaid', session: '2026-2027' },
  { id: 'vch-103', studentName: 'Usman Shah', classSection: 'Class 10 - A', month: month(), amount: 3500, dueDate: month() + '-10', status: 'Unpaid', session: '2026-2027' },
  { id: 'vch-104', studentName: 'Rohan Gupta', classSection: 'Class 9 - B', month: month(), amount: 3200, dueDate: month() + '-10', status: 'Paid', session: '2026-2027' },
  { id: 'vch-105', studentName: 'Ananya Verma', classSection: 'Class 9 - B', month: month(), amount: 3200, dueDate: month() + '-10', status: 'Partial', session: '2026-2027' },
  { id: 'vch-106', studentName: 'Zara Khan', classSection: 'Class 8 - A', month: month(), amount: 2800, dueDate: month() + '-10', status: 'Unpaid', session: '2026-2027' },
];

export const DEMO_ATTENDANCE = [
  {
    id: `${today()}_Class 10 - A`,
    date: today(),
    classSection: 'Class 10 - A',
    records: { 'std-101': 'Present', 'std-102': 'Present', 'std-111': 'Absent' },
    createdAt: now(),
  },
  {
    id: `${today()}_Class 9 - B`,
    date: today(),
    classSection: 'Class 9 - B',
    records: { 'std-103': 'Present', 'std-104': 'Present' },
    createdAt: now(),
  },
  {
    id: `${today()}_Class 8 - A`,
    date: today(),
    classSection: 'Class 8 - A',
    records: { 'std-105': 'Present', 'std-106': 'Absent' },
    createdAt: now(),
  },
];

export const DEMO_EXPENSES = [
  { id: 'exp-301', category: 'Salary', amount: 323000, date: today(), description: 'Monthly staff salaries', createdAt: now() },
  { id: 'exp-302', category: 'Utilities', amount: 18500, date: today(), description: 'Electricity and internet', createdAt: now() },
  { id: 'exp-303', category: 'Supplies', amount: 9200, date: today(), description: 'Stationery and exam paper', createdAt: now() },
  { id: 'exp-304', category: 'Maintenance', amount: 15000, date: today(), description: 'Classroom furniture repair', createdAt: now() },
];

export const DEMO_NOTICES = [
  { id: 'notice-welcome', title: 'Parent-teacher meeting', message: 'PTM for all classes is on Saturday, 10:00 AM in the main hall.', audience: 'All', pinned: true, date: today(), createdAt: now() },
  { id: 'notice-fee', title: 'Fee due reminder', message: 'Monthly fee is due by the 10th. Defaulters will appear on the fee report.', audience: 'All', pinned: true, date: today(), createdAt: now() },
  { id: 'notice-sports', title: 'Sports day practice', message: 'Class 10 - A will practice after the last period this week.', audience: 'Class 10 - A', pinned: false, date: today(), createdAt: now() },
  { id: 'notice-exam', title: 'Unit Test week', message: 'Unit tests for Classes 8–10 begin next Monday. Papers are ready in the office.', audience: 'All', pinned: false, date: today(), createdAt: now() },
];

export const DEMO_TIMETABLE = [
  { id: 'tt-1', classSection: 'Class 10 - A', day: 'Monday', start: '08:00', end: '08:45', subject: 'Mathematics', teacher: 'Vikram Malhotra' },
  { id: 'tt-2', classSection: 'Class 10 - A', day: 'Monday', start: '08:45', end: '09:30', subject: 'English', teacher: 'Priya Nair' },
  { id: 'tt-3', classSection: 'Class 10 - A', day: 'Tuesday', start: '08:00', end: '08:45', subject: 'Science', teacher: 'Sana Ahmed' },
  { id: 'tt-4', classSection: 'Class 10 - A', day: 'Wednesday', start: '09:30', end: '10:15', subject: 'Computer', teacher: 'Ali Raza' },
  { id: 'tt-5', classSection: 'Class 9 - B', day: 'Monday', start: '08:00', end: '08:45', subject: 'Mathematics', teacher: 'Vikram Malhotra' },
  { id: 'tt-6', classSection: 'Class 9 - B', day: 'Thursday', start: '10:15', end: '11:00', subject: 'Social Studies', teacher: 'Priya Nair' },
  { id: 'tt-7', classSection: 'Class 8 - A', day: 'Friday', start: '08:00', end: '08:45', subject: 'Science', teacher: 'Sana Ahmed' },
];

export const DEMO_HOMEWORK = [
  { id: 'hw-1', title: 'Algebra worksheet 4', subject: 'Mathematics', classSection: 'Class 10 - A', dueDate: today(), details: 'Complete questions 1 to 12 from chapter 4.', done: false },
  { id: 'hw-2', title: 'Essay: My city', subject: 'English', classSection: 'Class 10 - A', dueDate: today(), details: 'Write 250 words.', done: false },
  { id: 'hw-3', title: 'Lab diagram', subject: 'Science', classSection: 'Class 9 - B', dueDate: today(), details: 'Draw and label the human heart.', done: true },
  { id: 'hw-4', title: 'Typing practice', subject: 'Computer', classSection: 'Class 8 - A', dueDate: today(), details: 'Complete lesson 3 in the lab book.', done: false },
];

export const DEMO_FINES = [
  { id: 'fine-late', name: 'Late fee', amount: 50, rule: 'Per day after the 10th', status: 'Active' },
  { id: 'fine-absent', name: 'Exam absent fine', amount: 200, rule: 'Per missed paper without leave', status: 'Active' },
];

export const DEMO_DISCOUNTS = [
  { id: 'disc-sibling', name: 'Sibling discount', percent: 10, appliesTo: 'Monthly fee', status: 'Active' },
  { id: 'disc-early', name: 'Early payment', percent: 5, appliesTo: 'Paid before the 5th', status: 'Active' },
  { id: 'disc-staff', name: 'Staff child', percent: 20, appliesTo: 'Monthly fee', status: 'Active' },
];

export const DEMO_CONCESSIONS = [
  { id: 'con-1', studentName: 'Ananya Verma', reason: 'Need-based', percent: 25, approvedBy: 'Admin', status: 'Approved' },
  { id: 'con-2', studentName: 'Bilal Ahmed', reason: 'Sibling concession', percent: 10, approvedBy: 'Admin', status: 'Approved' },
];

export const DEMO_PAYMENT_METHODS = [
  { id: 'pay-cash', name: 'Cash', details: 'Front office counter', status: 'Active' },
  { id: 'pay-bank', name: 'Bank transfer', details: 'SkyEagle A/C 0011223344', status: 'Active' },
  { id: 'pay-jazz', name: 'JazzCash', details: '0300-0000000', status: 'Active' },
  { id: 'pay-card', name: 'Debit / Credit Card', details: 'POS at accounts desk', status: 'Active' },
];

export const DEMO_CITIES = [
  { id: 'city-1', name: 'Lahore', province: 'Punjab', status: 'Active' },
  { id: 'city-2', name: 'Karachi', province: 'Sindh', status: 'Active' },
  { id: 'city-3', name: 'Islamabad', province: 'ICT', status: 'Active' },
];

export const DEMO_CAMPUSES = [
  { id: 'camp-1', name: 'Main Campus', city: 'Lahore', code: 'MAIN', status: 'Active' },
];

export const DEMO_CAMPUS_CLASSES = [
  { id: 'cc-1', campus: 'Main Campus', className: 'Class 10', status: 'Active' },
  { id: 'cc-2', campus: 'Main Campus', className: 'Nursery', status: 'Active' },
];

export const DEMO_ROLL_SERIES = [
  { id: 'rs-1', name: 'Default', prefix: 'SKY-', startFrom: 1001, status: 'Active' },
];

export const DEMO_ADMISSION_CAPACITY = [
  { id: 'ac-1', className: 'Nursery', seats: 25, filled: 12, status: 'Active' },
  { id: 'ac-2', className: 'Class 10', seats: 40, filled: 35, status: 'Active' },
];

export const DEMO_ACADEMIC_DURATION = [
  { id: 'ad-1', name: 'Full Year', months: 12, status: 'Active' },
  { id: 'ad-2', name: 'Term', months: 4, status: 'Active' },
];

export const DEMO_GUARDIAN_RELATIONS = [
  { id: 'gr-1', name: 'Father', status: 'Active' },
  { id: 'gr-2', name: 'Mother', status: 'Active' },
  { id: 'gr-3', name: 'Guardian', status: 'Active' },
];

export const DEMO_GENDERS = [
  { id: 'gen-1', name: 'Male', status: 'Active' },
  { id: 'gen-2', name: 'Female', status: 'Active' },
];

export const DEMO_NATIONALITIES = [
  { id: 'nat-1', name: 'Pakistani', status: 'Active' },
  { id: 'nat-2', name: 'Other', status: 'Active' },
];

export const DEMO_RELIGIONS = [
  { id: 'rel-1', name: 'Islam', status: 'Active' },
  { id: 'rel-2', name: 'Christianity', status: 'Active' },
  { id: 'rel-3', name: 'Hinduism', status: 'Active' },
  { id: 'rel-4', name: 'Other', status: 'Active' },
];

export const DEMO_MOTHER_TONGUES = [
  { id: 'mt-1', name: 'Urdu', status: 'Active' },
  { id: 'mt-2', name: 'Punjabi', status: 'Active' },
  { id: 'mt-3', name: 'English', status: 'Active' },
];

export const DEMO_STUDENT_GROUPS = [
  { id: 'sg-1', name: 'General', status: 'Active' },
  { id: 'sg-2', name: 'Science', status: 'Active' },
  { id: 'sg-3', name: 'Arts', status: 'Active' },
];

export const DEMO_HOLIDAYS = [
  { id: 'hol-1', name: 'Independence Day', date: '2026-08-14', status: 'Active' },
  { id: 'hol-2', name: 'Iqbal Day', date: '2026-11-09', status: 'Active' },
];

export const DEMO_FEE_PLANS = [
  { id: 'fpl-1', name: 'Standard 2026', monthly: 3000, session: '2026-2027', status: 'Active' },
  { id: 'fpl-2', name: 'Sibling 2026', monthly: 2700, session: '2026-2027', status: 'Active' },
];

export const DEMO_SUBJECT_GROUPS = [
  { id: 'sug-1', name: 'Science Group', status: 'Active' },
  { id: 'sug-2', name: 'Arts Group', status: 'Active' },
];

export const DEMO_SUBJECTS_CATALOG = [
  { id: 'sub-1', name: 'Mathematics', code: 'MATH', status: 'Active' },
  { id: 'sub-2', name: 'English', code: 'ENG', status: 'Active' },
  { id: 'sub-3', name: 'Science', code: 'SCI', status: 'Active' },
  { id: 'sub-4', name: 'Urdu', code: 'URD', status: 'Active' },
];

export const DEMO_TEST_TYPES = [
  { id: 'tt-1', name: 'Unit Test', weight: 10, status: 'Active' },
  { id: 'tt-2', name: 'Mid Term', weight: 30, status: 'Active' },
  { id: 'tt-3', name: 'Final', weight: 50, status: 'Active' },
];

export const DEMO_GRADING_POLICIES = [
  { id: 'gp-1', name: 'Standard GPA', passPercent: 40, status: 'Active' },
];

export const DEMO_SHIFTS = [
  { id: 'sh-1', name: 'Morning', start: '08:00', end: '14:00', status: 'Active' },
  { id: 'sh-2', name: 'Evening', start: '14:00', end: '18:00', status: 'Inactive' },
];

export const DEMO_SMS_TEMPLATES = [
  { id: 'sms-1', name: 'Absence alert', body: 'Your child was marked absent today.', status: 'Active' },
  { id: 'sms-2', name: 'Fee reminder', body: 'Fee challan is due. Please pay on time.', status: 'Active' },
];

export const DEMO_ALLOWANCES = [
  { id: 'al-1', name: 'Housing', type: 'Allowance', amount: 5000, status: 'Active' },
  { id: 'al-2', name: 'Transport', type: 'Allowance', amount: 2000, status: 'Active' },
  { id: 'al-3', name: 'Provident Fund', type: 'Deduction', amount: 1500, status: 'Active' },
];

export const DEMO_DEPARTMENTS = [
  { id: 'dep-1', name: 'Teaching', status: 'Active' },
  { id: 'dep-2', name: 'Admin', status: 'Active' },
  { id: 'dep-3', name: 'Accounts', status: 'Active' },
];

export const DEMO_DESIGNATION_GROUPS = [
  { id: 'dg-1', name: 'Academic', status: 'Active' },
  { id: 'dg-2', name: 'Support', status: 'Active' },
];

export const DEMO_DESIGNATIONS = [
  { id: 'des-1', name: 'Principal', group: 'Academic', status: 'Active' },
  { id: 'des-2', name: 'Teacher', group: 'Academic', status: 'Active' },
  { id: 'des-3', name: 'Accountant', group: 'Support', status: 'Active' },
];

export const DEMO_EMPLOYMENT_TYPES = [
  { id: 'et-1', name: 'Permanent', status: 'Active' },
  { id: 'et-2', name: 'Contract', status: 'Active' },
  { id: 'et-3', name: 'Visiting', status: 'Active' },
];

/** All collections used by demo reset */
export const DEMO_PACK = {
  students: DEMO_STUDENTS,
  staff: DEMO_STAFF,
  sessions: DEMO_SESSIONS,
  classes: DEMO_CLASSES,
  sections: DEMO_SECTIONS,
  tests: DEMO_TESTS,
  papers: DEMO_PAPERS,
  exams: DEMO_EXAMS,
  fees: DEMO_FEES,
  vouchers: DEMO_VOUCHERS,
  attendance: DEMO_ATTENDANCE,
  expenses: DEMO_EXPENSES,
  notices: DEMO_NOTICES,
  timetable: DEMO_TIMETABLE,
  homework: DEMO_HOMEWORK,
  fines: DEMO_FINES,
  discounts: DEMO_DISCOUNTS,
  concessions: DEMO_CONCESSIONS,
  paymentMethods: DEMO_PAYMENT_METHODS,
  cities: DEMO_CITIES,
  campuses: DEMO_CAMPUSES,
  campusClasses: DEMO_CAMPUS_CLASSES,
  rollSeries: DEMO_ROLL_SERIES,
  admissionCapacity: DEMO_ADMISSION_CAPACITY,
  academicDuration: DEMO_ACADEMIC_DURATION,
  guardianRelations: DEMO_GUARDIAN_RELATIONS,
  genders: DEMO_GENDERS,
  nationalities: DEMO_NATIONALITIES,
  religions: DEMO_RELIGIONS,
  motherTongues: DEMO_MOTHER_TONGUES,
  studentGroups: DEMO_STUDENT_GROUPS,
  holidays: DEMO_HOLIDAYS,
  feePlans: DEMO_FEE_PLANS,
  subjectGroups: DEMO_SUBJECT_GROUPS,
  subjects: DEMO_SUBJECTS_CATALOG,
  testTypes: DEMO_TEST_TYPES,
  gradingPolicies: DEMO_GRADING_POLICIES,
  shifts: DEMO_SHIFTS,
  smsTemplates: DEMO_SMS_TEMPLATES,
  allowances: DEMO_ALLOWANCES,
  departments: DEMO_DEPARTMENTS,
  designationGroups: DEMO_DESIGNATION_GROUPS,
  designations: DEMO_DESIGNATIONS,
  employmentTypes: DEMO_EMPLOYMENT_TYPES,
};
