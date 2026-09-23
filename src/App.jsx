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

function MainApp() {
  const { currentUser, role } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
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

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'students') setSelectedStudent(null);
        }} 
        role={role} 
      />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header />

        <main className="p-6 flex-1 max-w-7xl w-full mx-auto">
          
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
              <div className="flex bg-white p-1 rounded-2xl border border-slate-200 w-fit">
                <button
                  onClick={() => setFeeSubTab('collection')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                    feeSubTab === 'collection' 
                      ? 'bg-pink-500 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Fee Collection Log
                </button>
                <button
                  onClick={() => setFeeSubTab('defaulters')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                    feeSubTab === 'defaulters' 
                      ? 'bg-pink-500 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Defaulters List
                </button>
                <button
                  onClick={() => setFeeSubTab('report')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
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
              <div className="flex bg-white p-1 rounded-2xl border border-slate-200 w-fit">
                <button
                  onClick={() => setAttendanceSubTab('mark')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                    attendanceSubTab === 'mark' 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Mark Attendance Sheet
                </button>
                <button
                  onClick={() => setAttendanceSubTab('report')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
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

        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
