import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { exportStudentProfilePDF } from '../../utils/pdfExport';
import { 
  ArrowLeft, 
  Download, 
  Calendar, 
  CreditCard, 
  User, 
  Phone, 
  CheckCircle, 
  XCircle,
  Award
} from 'lucide-react';

export default function StudentProfile({ student, onBack }) {
  const [feeHistory, setFeeHistory] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) return;

    // Load Fee History
    const feeQuery = query(
      collection(db, 'fees'),
      where('studentId', '==', student.id)
    );
    const unsubFee = onSnapshot(feeQuery, (snapshot) => {
      const fees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fees.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
      setFeeHistory(fees);
    });

    // Load Attendance History
    const unsubAtt = onSnapshot(collection(db, 'attendance'), (snapshot) => {
      const list = [];
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.records && data.records[student.id]) {
          list.push({
            date: data.date,
            status: data.records[student.id],
            classSection: data.classSection
          });
        }
      });
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
      setAttendanceHistory(list);
      setLoading(false);
    });

    return () => {
      unsubFee();
      unsubAtt();
    };
  }, [student]);

  if (!student) return null;

  const totalFeesPaid = feeHistory.reduce((sum, f) => sum + Number(f.amount || 0), 0);
  const totalAttDays = attendanceHistory.length;
  const presentAttDays = attendanceHistory.filter(a => a.status === 'Present').length;
  const attPercentage = totalAttDays > 0 ? Math.round((presentAttDays / totalAttDays) * 100) : 100;

  return (
    <div className="space-y-6">
      
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl transition shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Students List
        </button>

        <button
          onClick={() => exportStudentProfilePDF(student, feeHistory, attendanceHistory)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl transition shadow-md"
        >
          <Download className="w-4 h-4" />
          Export Profile PDF
        </button>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-center md:items-start gap-6">
        <img
          src={student.photoUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80"}
          alt={student.name}
          className="w-28 h-28 rounded-2xl object-cover border-2 border-amber-400 shadow-md shrink-0"
        />

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{student.name}</h2>
              <p className="text-sm text-slate-500 font-medium">Class: {student.classSection}</p>
            </div>
            <span className={`self-center md:self-start px-3 py-1 rounded-full text-xs font-bold ${
              student.status === 'Active' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-slate-100 text-slate-500'
            }`}>
              {student.status || 'Active'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-4 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Father / Guardian</span>
              <span className="font-semibold text-slate-800 text-sm flex items-center justify-center md:justify-start gap-1 mt-0.5">
                <User className="w-3.5 h-3.5 text-amber-500" />
                {student.fatherName}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Contact Number</span>
              <span className="font-semibold text-slate-800 text-sm font-mono flex items-center justify-center md:justify-start gap-1 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-blue-500" />
                {student.contact}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Admission Date</span>
              <span className="font-semibold text-slate-800 text-sm flex items-center justify-center md:justify-start gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-purple-500" />
                {student.admissionDate || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Quick Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-amber-800 block">Monthly Tuition Fee</span>
            <span className="text-xl font-extrabold text-amber-950">RS. {student.monthlyFee}</span>
          </div>
        </div>

        <div className="bg-pink-50/60 border border-pink-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500 text-white font-bold flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-pink-800 block">Total Fees Paid</span>
            <span className="text-xl font-extrabold text-pink-950">RS. {totalFeesPaid.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500 text-white font-bold flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-blue-800 block">Attendance Rate</span>
            <span className="text-xl font-extrabold text-blue-950">{attPercentage}%</span>
          </div>
        </div>
      </div>

      {/* Two Column Tabs / Tables: Fee History & Attendance History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Fee History */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-pink-500" />
              Fee Payment History
            </h3>
            <span className="text-xs text-slate-400 font-medium">{feeHistory.length} Records</span>
          </div>

          <div className="overflow-y-auto max-h-72 flex-1">
            {feeHistory.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No fee transactions recorded yet.</p>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase font-semibold">
                    <th className="py-2.5 px-3">Receipt #</th>
                    <th className="py-2.5 px-3">Month</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {feeHistory.map((fee) => (
                    <tr key={fee.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-slate-500">{fee.receiptNo || fee.id}</td>
                      <td className="py-2.5 px-3 font-medium">{fee.month}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-600">RS. {fee.amount}</td>
                      <td className="py-2.5 px-3 text-slate-400">{fee.paymentDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Attendance History */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              Recent Attendance History
            </h3>
            <span className="text-xs text-slate-400 font-medium">{attendanceHistory.length} Days Recorded</span>
          </div>

          <div className="overflow-y-auto max-h-72 flex-1">
            {attendanceHistory.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No attendance records logged yet.</p>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase font-semibold">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Class</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {attendanceHistory.map((att, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-medium text-slate-800">{att.date}</td>
                      <td className="py-2.5 px-3 text-slate-500">{att.classSection}</td>
                      <td className="py-2.5 px-3 text-right">
                        {att.status === 'Present' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                            <CheckCircle className="w-3 h-3" />
                            Present
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-md">
                            <XCircle className="w-3 h-3" />
                            Absent
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
