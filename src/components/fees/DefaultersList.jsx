import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { AlertCircle, Search, Filter, Phone, DollarSign } from 'lucide-react';

export default function DefaultersList({ onCollectFeeForStudent }) {
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [selectedClass, setSelectedClass] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

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

  // Compute Defaulters
  const paidStudentIds = new Set(
    fees.filter(f => f.month === selectedMonth).map(f => f.studentId)
  );

  const activeStudents = students.filter(s => s.status !== 'Left');

  const defaulters = activeStudents.filter(student => {
    const hasPaid = paidStudentIds.has(student.id);
    const matchesClass = selectedClass === 'All' || student.classSection === selectedClass;
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.fatherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.contact.includes(searchTerm);

    return !hasPaid && matchesClass && matchesSearch;
  });

  const totalDefaulterAmount = defaulters.reduce((sum, s) => sum + Number(s.monthlyFee || 0), 0);

  return (
    <div className="space-y-5">
      
      {/* Alert Header Box */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white font-bold flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-red-900">Fee Defaulters List ({selectedMonth})</h2>
            <p className="text-xs text-red-700">
              Students who haven't paid their tuition fee for {selectedMonth}
            </p>
          </div>
        </div>

        <div className="bg-white px-4 py-2 rounded-xl border border-red-200 text-right">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">Total Pending Dues</span>
          <span className="text-xl font-extrabold text-red-600">RS. {totalDefaulterAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target Month</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Filter Class</label>
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="All">All Classes</option>
              <option value="Class 10 - A">Class 10 - A</option>
              <option value="Class 9 - B">Class 9 - B</option>
              <option value="Class 8 - A">Class 8 - A</option>
              <option value="Class 7 - C">Class 7 - C</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Search Student</label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search student or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </div>

      {/* Defaulters Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-medium text-sm">
            Calculating fee defaulters...
          </div>
        ) : defaulters.length === 0 ? (
          <div className="p-12 text-center text-emerald-600 bg-emerald-50/50">
            <p className="font-bold text-base">All cleared!</p>
            <p className="text-xs text-slate-500 mt-1">No pending defaulters found for {selectedMonth}.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-red-50/60 text-red-900 text-xs font-semibold uppercase border-b border-red-100">
                  <th className="py-3.5 px-5">Student Name</th>
                  <th className="py-3.5 px-5">Class/Section</th>
                  <th className="py-3.5 px-5">Father/Guardian</th>
                  <th className="py-3.5 px-5">Contact</th>
                  <th className="py-3.5 px-5">Pending Amount</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {defaulters.map((student) => (
                  <tr key={student.id} className="hover:bg-red-50/30 transition">
                    <td className="py-3.5 px-5 font-bold text-slate-900 flex items-center gap-3">
                      <img
                        src={student.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                        alt={student.name}
                        className="w-8 h-8 rounded-full object-cover border border-red-300"
                      />
                      {student.name}
                    </td>
                    <td className="py-3.5 px-5 font-medium">{student.classSection}</td>
                    <td className="py-3.5 px-5">{student.fatherName}</td>
                    <td className="py-3.5 px-5 font-mono text-xs flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {student.contact}
                    </td>
                    <td className="py-3.5 px-5 font-extrabold text-red-600">RS. {student.monthlyFee}</td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => onCollectFeeForStudent && onCollectFeeForStudent(student)}
                        className="py-1.5 px-3 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center gap-1 ml-auto"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        Collect Fee
                      </button>
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
