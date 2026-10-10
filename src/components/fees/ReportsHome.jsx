import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { ChartColumn, AlertCircle, Receipt } from 'lucide-react';

export default function ReportsHome({ onOpen }) {
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);

  useEffect(() => {
    const a = onSnapshot(collection(db, 'students'), (snap) => setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    const b = onSnapshot(collection(db, 'fees'), (snap) => setFees(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => { a(); b(); };
  }, []);

  const month = new Date().toISOString().slice(0, 7);
  const active = students.filter((s) => s.status !== 'Left');
  const paid = new Set(fees.filter((f) => f.month === month).map((f) => f.studentId));
  const demand = active.reduce((sum, s) => sum + Number(s.monthlyFee || 0), 0);
  const collected = fees.filter((f) => f.month === month).reduce((sum, f) => sum + Number(f.amount || 0), 0);
  const pending = active.filter((s) => !paid.has(s.id)).length;

  const cards = [
    { id: 'collection-report', title: 'Collection Report', text: `Rs. ${collected.toLocaleString()} collected against Rs. ${demand.toLocaleString()} demand`, icon: Receipt, tone: 'text-emerald-600 bg-emerald-50' },
    { id: 'defaulters', title: 'Defaulters Report', text: `${pending} students have not paid this month`, icon: AlertCircle, tone: 'text-rose-600 bg-rose-50' },
    { id: 'fees', title: 'Fee Collection Log', text: `${fees.length} payment records on file`, icon: ChartColumn, tone: 'text-blue-600 bg-blue-50' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Reports</h2>
        <p className="text-xs text-slate-500">Open a report from the current session</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button key={card.id} type="button" onClick={() => onOpen(card.id)} className="text-left bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 hover:shadow-md transition">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.tone}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="mt-4 font-bold text-slate-800">{card.title}</p>
              <p className="text-xs text-slate-500 mt-1">{card.text}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
