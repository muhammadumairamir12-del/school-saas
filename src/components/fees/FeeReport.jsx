import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { exportFeeReportPDF } from '../../utils/pdfExport';
import { Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function FeeReport() {
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  useEffect(() => {
    const unsubStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(list);
    });

    const unsubFees = onSnapshot(collection(db, 'fees'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFees(list);
      setLoading(false);
    });

    return () => {
      unsubStudents();
      unsubFees();
    };
  }, []);

  const monthlyFees = fees.filter(f => f.month === selectedMonth);
  const totalCollected = monthlyFees.reduce((sum, f) => sum + Number(f.amount || 0), 0);

  const paidStudentIds = new Set(monthlyFees.map(f => f.studentId));
  const activeStudents = students.filter(s => s.status !== 'Left');
  const defaulterStudents = activeStudents.filter(s => !paidStudentIds.has(s.id));
  const totalPending = defaulterStudents.reduce((sum, s) => sum + Number(s.monthlyFee || 0), 0);

  return (
    <div className="space-y-5">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Monthly Fee Financial Report</h2>
          <p className="text-xs text-slate-500">Summary of collections vs pending dues by billing cycle</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
          />

          <button
            onClick={() => exportFeeReportPDF(selectedMonth, monthlyFees, totalCollected, totalPending)}
            className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition shadow-md flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF Summary
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Total Collected ({selectedMonth})</span>
            <span className="text-3xl font-extrabold text-emerald-950">RS. {totalCollected.toLocaleString()}</span>
            <span className="text-xs text-emerald-700 block mt-1">{monthlyFees.length} Fee Transactions</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-red-50/70 border border-red-200 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-red-800 uppercase tracking-wider block">Total Pending Dues</span>
            <span className="text-3xl font-extrabold text-red-950">RS. {totalPending.toLocaleString()}</span>
            <span className="text-xs text-red-700 block mt-1">{defaulterStudents.length} Defaulter Students</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Monthly Transactions List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-slate-800 text-sm">
          Recorded Collections Breakdown ({selectedMonth})
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 font-medium text-sm">Loading fee report...</div>
        ) : monthlyFees.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">
            No fee transactions recorded for {selectedMonth}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase border-b border-slate-200">
                  <th className="py-3 px-5">Receipt #</th>
                  <th className="py-3 px-5">Student Name</th>
                  <th className="py-3 px-5">Class</th>
                  <th className="py-3 px-5">Payment Date</th>
                  <th className="py-3 px-5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {monthlyFees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-5 font-mono text-xs text-slate-500">{fee.receiptNo || fee.id}</td>
                    <td className="py-3 px-5 font-bold text-slate-800">{fee.studentName}</td>
                    <td className="py-3 px-5">{fee.classSection}</td>
                    <td className="py-3 px-5 text-slate-500 text-xs">{fee.paymentDate}</td>
                    <td className="py-3 px-5 font-extrabold text-emerald-600 text-right">RS. {fee.amount}</td>
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
