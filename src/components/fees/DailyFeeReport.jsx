import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { exportDailyFeeReportPDF } from '../../utils/pdfExport';
import { Download, Calendar, TrendingUp, Receipt, Hash } from 'lucide-react';

export default function DailyFeeReport() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    // YYYY-MM-DD
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, 'fees'), (snapshot) => {
      const allFees = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFees(allFees);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching fees: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const dailyFees = fees.filter(f => f.paymentDate === selectedDate).sort((a, b) => {
    // Sort by timestamp if available, else fallback to something
    const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
    const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
    return timeA - timeB; // Chronological order to maintain running total visually
  });

  const totalCollected = dailyFees.reduce((sum, f) => sum + Number(f.amount || 0), 0);
  const transactionCount = dailyFees.length;
  const avgAmount = transactionCount > 0 ? (totalCollected / transactionCount).toFixed(2) : 0;

  const handleExportPDF = () => {
    exportDailyFeeReportPDF(selectedDate, dailyFees, totalCollected);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Daily Fee Report</h2>
            <p className="text-slate-500 text-sm">Track daily collections and transactions</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-xs">
            <Calendar className="w-4 h-4 text-slate-400 mr-2" />
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border-none outline-none text-sm font-medium text-slate-700 bg-transparent"
            />
          </div>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-emerald-600 text-sm font-medium mb-1">Total Collected Today</p>
            <h3 className="text-3xl font-bold text-emerald-800">RS. {totalCollected.toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">Transactions</p>
            <h3 className="text-3xl font-bold text-slate-800">{transactionCount}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">Average Payment</p>
            <h3 className="text-3xl font-bold text-slate-800">RS. {Number(avgAmount).toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
            <Hash className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-slate-800">Collection Details ({selectedDate})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-sm text-slate-500">
                <th className="py-3 px-4 font-medium">Receipt #</th>
                <th className="py-3 px-4 font-medium">Student Name</th>
                <th className="py-3 px-4 font-medium">Class/Section</th>
                <th className="py-3 px-4 font-medium">For Month</th>
                <th className="py-3 px-4 font-medium text-right">Amount Paid</th>
                <th className="py-3 px-4 font-medium text-right">Running Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">Loading records...</td>
                </tr>
              ) : dailyFees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    No fees collected on {selectedDate}.
                  </td>
                </tr>
              ) : (
                (() => {
                  let runningTotal = 0;
                  return dailyFees.map((fee, idx) => {
                    runningTotal += Number(fee.amount || 0);
                    return (
                      <tr key={fee.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-sm font-medium text-slate-800">{fee.receiptNo || fee.id.slice(-6).toUpperCase()}</td>
                        <td className="py-3 px-4 text-sm text-slate-700">{fee.studentName || '-'}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{fee.classSection || '-'}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{fee.month || '-'}</td>
                        <td className="py-3 px-4 text-sm font-medium text-slate-800 text-right">RS. {Number(fee.amount || 0).toLocaleString()}</td>
                        <td className="py-3 px-4 text-sm font-bold text-emerald-600 text-right">RS. {runningTotal.toLocaleString()}</td>
                      </tr>
                    );
                  });
                })()
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
