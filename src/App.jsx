import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Shell from './components/layout/Shell';
import Dashboard from './components/pages/Dashboard';
import StudentsPage from './components/pages/Students';
import StaffPage from './components/pages/Staff';
import ClassesPage from './components/pages/Classes';
import AttendancePage from './components/pages/Attendance';
import FeesPage from './components/pages/Fees';
import NoticesPage from './components/pages/Notices';
import SettingsPage from './components/pages/Settings';
import DiaryPage from './components/pages/Diary';

function MainApp() {
  const { currentUser } = useAuth();
  const [page, setPage] = useState('dashboard');

  if (!currentUser) return <Login />;

  return (
    <Shell page={page} onNavigate={setPage}>
      {page === 'dashboard' && <Dashboard onNavigate={setPage} />}
      {page === 'students' && <StudentsPage />}
      {page === 'staff' && <StaffPage />}
      {page === 'classes' && <ClassesPage />}
      {page === 'attendance' && <AttendancePage />}
      {page === 'fees' && <FeesPage />}
      {page === 'diary' && <DiaryPage />}
      {page === 'notices' && <NoticesPage />}
      {page === 'settings' && <SettingsPage />}
    </Shell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
