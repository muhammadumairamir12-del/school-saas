import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';

import StudentList from './components/students/StudentList';
import StudentProfile from './components/students/StudentProfile';

import FeeCollection from './components/fees/FeeCollection';
import DefaultersList from './components/fees/DefaultersList';
import FeeReport from './components/fees/FeeReport';

import MarkAttendance from './components/attendance/MarkAttendance';
import AttendanceReport from './components/attendance/AttendanceReport';

import StaffList from './components/staff/StaffList';
import ExpenseList from './components/expenses/ExpenseList';
import NoticeBoard from './components/notices/NoticeBoard';
import Timetable from './components/timetable/Timetable';
import Homework from './components/homework/Homework';
import ExamResults from './components/exams/ExamResults';
import { LayoutDashboard, Users, CreditCard, CalendarCheck, Menu } from 'lucide-react';

function MainApp() {
  const { currentUser, role } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Sub-tabs for Fees & Attendance
  const [feeSubTab, setFeeSubTab] = useState('collection'); // 'collection' | 'defaulters' | 'report'
  const [attendanceSubTab, setAttendanceSubTab] = useState('mark'); // 'mark' | 'report'
  
  // Selected Student for Profile View
  const [selectedStudent, setSelectedStudent] = useState(null);

  if (!currentUser) {
    return <Login />;
  }

  const handleSelectStudentProfile = (student) => {
    setSelectedStudent(student);
    setActiveTab('students');
  };

  const handleCollectFeeForStudent = (student) => {
    setActiveTab('fees');
    setFeeSubTab('collection');
  };

  const changeTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'students') setSelectedStudent(null);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={changeTab} 
        role={role}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen min-w-0 w-full">
        <Header onMenuClick={() => setSidebarOpen(true)} activeTab={activeTab} />

        <main className="p-4 sm:p-6 pb-24 lg:pb-6 flex-1 max-w-7xl w-full mx-auto">
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <Dashboard 
              setActiveTab={setActiveTab} 
              onSelectStudent={handleSelectStudentProfile} 
            />
          )}

          {/* STUDENTS TAB */}
          {activeTab === 'students' && (
            selectedStudent ? (
              <StudentProfile 
                student={selectedStudent} 
                onBack={() => setSelectedStudent(null)} 
              />
            ) : (
              <StudentList 
                onSelectStudent={handleSelectStudentProfile} 
              />
            )
          )}

          {/* FEES & DEFAULTERS TAB */}
          {activeTab === 'fees' && (
            <div className="space-y-5">
              {/* Fees Sub-navigation */}
              <div className="flex bg-white p-1 rounded-2xl border border-slate-200 w-full sm:w-fit overflow-x-auto">
                <button
                  onClick={() => setFeeSubTab('collection')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition whitespace-nowrap shrink-0 ${
                    feeSubTab === 'collection' 
                      ? 'bg-pink-500 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Fee Collection Log
                </button>
                <button
                  onClick={() => setFeeSubTab('defaulters')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition whitespace-nowrap shrink-0 ${
                    feeSubTab === 'defaulters' 
                      ? 'bg-pink-500 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Defaulters List
                </button>
                <button
                  onClick={() => setFeeSubTab('report')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition whitespace-nowrap shrink-0 ${
                    feeSubTab === 'report' 
                      ? 'bg-pink-500 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Fee Report Summary
                </button>
              </div>

              {feeSubTab === 'collection' && <FeeCollection />}
              {feeSubTab === 'defaulters' && (
                <DefaultersList onCollectFeeForStudent={handleCollectFeeForStudent} />
              )}
              {feeSubTab === 'report' && <FeeReport />}
            </div>
          )}

          {/* ATTENDANCE TAB */}
          {activeTab === 'attendance' && (
            <div className="space-y-5">
              {/* Attendance Sub-navigation */}
              <div className="flex bg-white p-1 rounded-2xl border border-slate-200 w-full sm:w-fit overflow-x-auto">
                <button
                  onClick={() => setAttendanceSubTab('mark')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition whitespace-nowrap shrink-0 ${
                    attendanceSubTab === 'mark' 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Mark Attendance Sheet
                </button>
                <button
                  onClick={() => setAttendanceSubTab('report')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition whitespace-nowrap shrink-0 ${
                    attendanceSubTab === 'report' 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Monthly Attendance Report
                </button>
              </div>

              {attendanceSubTab === 'mark' && <MarkAttendance />}
              {attendanceSubTab === 'report' && <AttendanceReport />}
            </div>
          )}

          {/* STAFF TAB */}
          {activeTab === 'staff' && <StaffList />}

          {/* EXPENSES TAB */}
          {activeTab === 'expenses' && <ExpenseList />}

          {activeTab === 'notices' && <NoticeBoard />}
          {activeTab === 'timetable' && <Timetable />}
          {activeTab === 'homework' && <Homework />}
          {activeTab === 'exams' && <ExamResults />}

        </main>

        <MobileNav
          activeTab={activeTab}
          role={role}
          onSelect={changeTab}
          onOpenMenu={() => setSidebarOpen(true)}
        />
      </div>
    </div>
  );
}

function MobileNav({ activeTab, role, onSelect, onOpenMenu }) {
  const items = role === 'Teacher'
    ? [
        { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
        { id: 'students', label: 'Students', icon: Users },
        { id: 'attendance', label: 'Attend', icon: CalendarCheck },
      ]
    : [
        { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
        { id: 'students', label: 'Students', icon: Users },
        { id: 'fees', label: 'Fees', icon: CreditCard },
        { id: 'attendance', label: 'Attend', icon: CalendarCheck },
      ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 shadow-[0_-4px_16px_rgba(15,23,42,0.06)]">
      <div className="flex items-stretch justify-around px-1 pt-1 pb-[max(0.35rem,env(safe-area-inset-bottom))]">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-[11px] font-semibold ${
                isActive ? 'text-blue-700' : 'text-slate-500'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              {item.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-[11px] font-semibold text-slate-500"
        >
          <Menu className="w-5 h-5 text-slate-400" />
          Menu
        </button>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
