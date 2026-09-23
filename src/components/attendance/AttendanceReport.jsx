import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { exportAttendanceReportPDF } from '../../utils/pdfExport';
import { Download, CalendarCheck, Filter } from 'lucide-react';

export default function AttendanceReport() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [selectedClass, setSelectedClass] = useState('Class 10 - A');
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  useEffect(() => {
    const unsubStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(list);
    });

    const unsubAtt = onSnapshot(collection(db, 'attendance'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAttendance(list);
      setLoading(false);
    });

    return () => {
      unsubStudents();
      unsubAtt();
    };
  }, []);

  // Filter attendance records for class and month
  const classStudents = students.filter(s => s.classSection === selectedClass && s.status !== 'Left');
  
  const monthlyAttDocs = attendance.filter(a => 
    a.classSection === selectedClass && 
    a.date && 
    a.date.startsWith(selectedMonth)
  );

  const totalDaysRecorded = monthlyAttDocs.length;

  const reportData = classStudents.map(student => {
    let presentDays = 0;
    monthlyAttDocs.forEach(att => {
      if (att.records && att.records[student.id] === 'Present') {
        presentDays++;
      }
    });

    const percentage = totalDaysRecorded > 0 ? Math.round((presentDays / totalDaysRecorded) * 100) : 100;

    return {
      studentId: student.id,
      studentName: student.name,
      photoUrl: student.photoUrl,
      presentDays,
      totalDays: totalDaysRecorded,
      percentage
    };
  });

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center shadow-md shadow-blue-500/20">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Monthly Attendance Report</h2>
            <p className="text-xs text-slate-500">Calculated attendance percentages per student for billing or reviews</p>
          </div>
        </div>

        <button
          onClick={() => exportAttendanceReportPDF(selectedClass, selectedMonth, reportData)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          Export Report PDF
        </button>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Select Class</label>
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Class 10 - A">Class 10 - A</option>
              <option value="Class 9 - B">Class 9 - B</option>
              <option value="Class 8 - A">Class 8 - A</option>
              <option value="Class 7 - C">Class 7 - C</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Select Month</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Generating attendance report...</div>
        ) : reportData.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">No students found in {selectedClass}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase border-b border-slate-200">
                  <th className="py-3.5 px-5">Student</th>
                  <th className="py-3.5 px-5 text-center">Present Days</th>
                  <th className="py-3.5 px-5 text-center">Total Working Days</th>
                  <th className="py-3.5 px-5 text-center">Attendance %</th>
                  <th className="py-3.5 px-5">Performance Indicator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {reportData.map((row) => (
                  <tr key={row.studentId} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-5 font-bold text-slate-800 flex items-center gap-3">
                      <img
                        src={row.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                        alt={row.studentName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      {row.studentName}
                    </td>
                    <td className="py-3.5 px-5 text-center font-bold text-slate-800">{row.presentDays}</td>
                    <td className="py-3.5 px-5 text-center text-slate-500">{row.totalDays}</td>
                    <td className="py-3.5 px-5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                        row.percentage >= 80 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : row.percentage >= 60 
                            ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                            : 'bg-red-50 text-red-600 border border-red-200'
                      }`}>
                        {row.percentage}%
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                        <div
                          className={`h-full transition-all duration-300 ${
                            row.percentage >= 80 ? 'bg-emerald-500' : row.percentage >= 60 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${row.percentage}%` }}
                        ></div>
                      </div>
                    </td>
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
