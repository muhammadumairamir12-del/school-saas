import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserCog,
  School,
  Wallet,
  CalendarCheck,
  AlertCircle,
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import {
  getState,
  listStaff,
  listClasses,
  money,
  classLabel,
} from '../../store';

function Stat({ icon: Icon, label, value, hint, onClick, live }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left bg-white border border-slate-200 rounded-xl p-4 hover:border-teal-600/40 transition w-full shadow-xs"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
            {live && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
          {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
        </div>
        <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </button>
  );
}

export default function Dashboard({ onNavigate }) {
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    const unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    
    const unsubFees = onSnapshot(collection(db, 'fees'), (snap) => {
      setFees(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    
    const unsubAttendance = onSnapshot(collection(db, 'attendance'), (snap) => {
      setAttendance(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubStudents();
      unsubFees();
      unsubAttendance();
    };
  }, []);

  const data = useMemo(() => {
    const activeStudents = students.filter((s) => s.status !== 'Left');
    const staff = listStaff().filter((s) => s.status !== 'Left');
    const classes = listClasses();
    const settings = getState().settings || {};
    
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const month = today.slice(0, 7);

    const monthFees = fees.filter((f) => String(f.paymentDate || f.paidOn || f.date || '').startsWith(month));
    const todayFees = fees.filter((f) => String(f.paymentDate || f.paidOn || f.date || '').startsWith(today));

    const todayCollected = todayFees.reduce((sum, f) => sum + Number(f.amount || 0), 0);
    const monthlyCollected = monthFees.reduce((sum, f) => sum + Number(f.amount || 0), 0);
    const demand = activeStudents.reduce((sum, s) => sum + Number(s.monthlyFee || 0), 0);
    
    const paidIds = new Set(monthFees.map((f) => f.studentId));
    const unpaid = activeStudents.filter((s) => !paidIds.has(s.id)).length;

    const todayRec = attendance.filter((a) => a.date === today);
    let present = 0;
    let absent = 0;
    todayRec.forEach((a) => {
      Object.values(a.records || {}).forEach((st) => {
        if (st === 'Present') present += 1;
        if (st === 'Absent') absent += 1;
      });
    });

    const totalAttendance = present + absent;
    const attendancePercent = totalAttendance > 0 ? Math.round((present / totalAttendance) * 100) : 0;

    const sortedFees = [...fees].sort((a, b) => {
      const dateA = a.paymentDate || a.paidOn || a.date || '';
      const dateB = b.paymentDate || b.paidOn || b.date || '';
      return dateB.localeCompare(dateA);
    });

    return {
      studentsCount: activeStudents.length,
      staffCount: staff.length,
      classCount: classes.length,
      todayCollected,
      monthlyCollected,
      demand,
      unpaid,
      present,
      absent,
      attendancePercent,
      settings,
      recentFees: sortedFees.slice(0, 5),
      classes,
    };
  }, [students, fees, attendance]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#064e4e] to-[#0a6666] rounded-xl p-5 sm:p-6 text-white shadow-xs">
        <p className="text-teal-200 text-sm">Welcome back</p>
        <h2 className="text-xl sm:text-2xl font-bold mt-1">{data.settings.schoolName || 'School Name'}</h2>
        <p className="text-teal-100 text-sm mt-1">
          Session {data.settings.session || '2024-25'} · {data.settings.campus || 'Main Campus'}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Stat
          icon={Users}
          label="Students"
          value={data.studentsCount}
          hint="Active enrolled"
          onClick={() => onNavigate('students')}
        />
        <Stat
          icon={UserCog}
          label="Staff"
          value={data.staffCount}
          hint="Teachers & admin"
          onClick={() => onNavigate('staff')}
        />
        <Stat
          icon={School}
          label="Classes"
          value={data.classCount}
          hint="Sections running"
          onClick={() => onNavigate('classes')}
        />
        <Stat
          icon={Wallet}
          label="Today's Fee"
          value={money(data.todayCollected)}
          hint={`Monthly: ${money(data.monthlyCollected)}`}
          onClick={() => onNavigate('fees')}
          live={true}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <CalendarCheck className="w-4 h-4 text-teal-700" />
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              Today's attendance
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </h3>
          </div>
          {data.present + data.absent === 0 ? (
            <p className="text-sm text-slate-500 py-2">No attendance marked yet today.</p>
          ) : (
            <div className="flex items-end gap-6">
              <div>
                <p className="text-3xl font-bold text-emerald-700">{data.present}</p>
                <p className="text-xs font-medium text-slate-500 uppercase mt-1">Present</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-rose-600">{data.absent}</p>
                <p className="text-xs font-medium text-slate-500 uppercase mt-1">Absent</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-2xl font-bold text-slate-800">{data.attendancePercent}%</p>
                <p className="text-xs font-medium text-slate-500 uppercase mt-1">Overall</p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => onNavigate('attendance')}
            className="mt-6 text-sm font-medium text-teal-700 hover:text-teal-800 hover:underline inline-flex items-center gap-1"
          >
            Mark attendance →
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <h3 className="font-semibold text-slate-800">Fee pending</h3>
          </div>
          <p className="text-3xl font-bold text-slate-800">{data.unpaid}</p>
          <p className="text-sm text-slate-500 mt-1">Students not paid this month</p>
          <p className="text-xs text-slate-400 mt-1">Expected demand: {money(data.demand)}</p>
          <button
            type="button"
            onClick={() => onNavigate('fees')}
            className="mt-4 text-sm font-medium text-teal-700 hover:text-teal-800 hover:underline inline-flex items-center gap-1"
          >
            Collect fees →
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-4 sm:px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Recent fee receipts</h3>
          <button 
            onClick={() => onNavigate('fees')}
            className="text-xs font-medium text-teal-700 hover:text-teal-800"
          >
            View all
          </button>
        </div>
        {data.recentFees.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No fee payments recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Student</th>
                  <th className="text-left px-4 py-3 font-semibold">Class</th>
                  <th className="text-left px-4 py-3 font-semibold">Month</th>
                  <th className="text-right px-4 py-3 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.recentFees.map((f, i) => (
                  <tr key={f.id || i} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{f.studentName}</td>
                    <td className="px-4 py-3 text-slate-600">{f.classSection || classLabel(f.classId, data.classes)}</td>
                    <td className="px-4 py-3 text-slate-600">{f.month}</td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-600">{money(f.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
