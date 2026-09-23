import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  CalendarCheck, 
  CreditCard, 
  AlertCircle, 
  Plus, 
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  UserCheck
} from 'lucide-react';

export default function Dashboard({ setActiveTab, onSelectStudent }) {
  const { role, assignedClass } = useAuth();

  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Realtime listeners for Firestore collections
    const unsubStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(list);
    });

    const unsubFees = onSnapshot(collection(db, 'fees'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFees(list);
    });

    const unsubAttendance = onSnapshot(collection(db, 'attendance'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAttendance(list);
      setLoading(false);
    });

    return () => {
      unsubStudents();
      unsubFees();
      unsubAttendance();
    };
  }, []);

  // Compute live Admin stats from Firestore data
  const totalStudents = students.filter(s => s.status !== 'Left').length;

  const currentMonthStr = new Date().toISOString().slice(0, 7); // e.g. '2025-05'
  const todayStr = new Date().toISOString().split('T')[0];

  // Fee collected this month
  const monthlyFeesCollected = fees
    .filter(f => f.month === currentMonthStr)
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);

  // Defaulters count: Active students who haven't paid fee for the current month
  const paidStudentIdsThisMonth = new Set(
    fees.filter(f => f.month === currentMonthStr).map(f => f.studentId)
  );

  const activeStudents = students.filter(s => s.status !== 'Left');
  const defaultersCount = activeStudents.filter(s => !paidStudentIdsThisMonth.has(s.id)).length;

  // Today's Attendance %
  const todayRecords = attendance.filter(a => a.date === todayStr);
  let totalPresentToday = 0;
  let totalMarkedToday = 0;

  todayRecords.forEach(a => {
    if (a.records) {
      Object.values(a.records).forEach(status => {
        totalMarkedToday++;
        if (status === 'Present') totalPresentToday++;
      });
    }
  });

  const todayAttendancePct = totalMarkedToday > 0 
    ? Math.round((totalPresentToday / totalMarkedToday) * 100) 
    : 0;

  // Teacher Filtered Stats
  const teacherStudents = students.filter(s => s.classSection === assignedClass && s.status !== 'Left');
  const teacherTodayAttDoc = attendance.find(a => a.date === todayStr && a.classSection === assignedClass);

  let teacherAttDone = false;
  let teacherPresentCount = 0;
  if (teacherTodayAttDoc && teacherTodayAttDoc.records) {
    teacherAttDone = true;
    teacherPresentCount = Object.values(teacherTodayAttDoc.records).filter(st => st === 'Present').length;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 font-medium">
        Loading dashboard metrics from Firestore...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome to Sky Education</h2>
            <p className="text-blue-200 text-sm mt-1">
              {role === 'Admin' 
                ? 'Overview of academic operations, live attendance, fee collections & student status.' 
                : `Teacher Portal - Managing ${assignedClass}`}
            </p>
          </div>
          <div className="flex gap-2">
            {role === 'Admin' ? (
              <button
                onClick={() => setActiveTab('students')}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm transition shadow-md flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Student
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('attendance')}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition shadow-md flex items-center gap-2"
              >
                <CalendarCheck className="w-4 h-4" />
                Mark Attendance
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ADMIN DASHBOARD CARDS */}
      {role === 'Admin' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Total Students Card (Amber/Gold #D4A017) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Students</span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-800">{totalStudents}</div>
            <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> Live
              </span>
              active enrolled students
            </div>
          </div>

          {/* Today's Attendance % Card (Blue #3B82F6) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Attendance</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-800">{todayAttendancePct}%</div>
            <div className="mt-2 text-xs text-slate-500">
              {totalMarkedToday > 0 ? `${totalPresentToday} of ${totalMarkedToday} marked present` : 'No attendance marked today'}
            </div>
          </div>

          {/* Monthly Fees Collected Card (Pink #E91E8C) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fee Collected (Month)</span>
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center border border-pink-200">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-800">RS. {monthlyFeesCollected.toLocaleString()}</div>
            <div className="mt-2 text-xs text-slate-500">
              For month of {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </div>
          </div>

          {/* Defaulters Count Card (Red Highlight) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fee Defaulters</span>
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-red-600">{defaultersCount}</div>
            <div className="mt-2 text-xs text-slate-500">
              Students with pending fee for {new Date().toLocaleString('default', { month: 'short' })}
            </div>
          </div>

        </div>
      )}

      {/* TEACHER DASHBOARD CARDS */}
      {role === 'Teacher' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Assigned Class</span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{assignedClass}</div>
            <p className="text-xs text-slate-500 mt-1">{teacherStudents.length} Students Enrolled</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Today's Status</span>
              <div className={`p-2 rounded-lg ${teacherAttDone ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                {teacherAttDone ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">
              {teacherAttDone ? `${teacherPresentCount} / ${teacherStudents.length} Present` : 'Pending'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {teacherAttDone ? 'Attendance already submitted today' : 'Attendance needs to be marked today'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-md flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg">Quick Attendance Action</h3>
              <p className="text-xs text-blue-100 mt-1">Mark present/absent checklist for {assignedClass}</p>
            </div>
            <button
              onClick={() => setActiveTab('attendance')}
              className="mt-4 w-full py-2 bg-white text-blue-700 font-semibold rounded-xl text-xs hover:bg-blue-50 transition flex items-center justify-center gap-1.5"
            >
              Go to Attendance Sheet
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* RECENT STUDENTS TABLE SUMMARY */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Enrolled Students Overview</h3>
            <p className="text-xs text-slate-500">Real-time synced list from Firestore</p>
          </div>
          <button
            onClick={() => setActiveTab('students')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase border-b border-slate-100">
                <th className="py-3 px-5">Student Name</th>
                <th className="py-3 px-5">Class/Section</th>
                <th className="py-3 px-5">Guardian</th>
                <th className="py-3 px-5">Contact</th>
                <th className="py-3 px-5">Fee Payment</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {students.slice(0, 5).map((student) => {
                const hasPaidThisMonth = paidStudentIdsThisMonth.has(student.id);
                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-5 font-semibold text-slate-800 flex items-center gap-3">
                      <img 
                        src={student.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"} 
                        alt={student.name} 
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      {student.name}
                    </td>
                    <td className="py-3.5 px-5">{student.classSection}</td>
                    <td className="py-3.5 px-5">{student.fatherName}</td>
                    <td className="py-3.5 px-5 font-mono text-xs">{student.contact}</td>
                    <td className="py-3.5 px-5">
                      {hasPaidThisMonth ? (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                          Paid
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full border border-red-200">
                          Unpaid
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => {
                          if (onSelectStudent) onSelectStudent(student);
                          setActiveTab('students');
                        }}
                        className="text-xs text-blue-600 hover:underline font-medium"
                      >
                        Profile & PDF
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
