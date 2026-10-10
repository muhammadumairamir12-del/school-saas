import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { BellRing, Send } from 'lucide-react';

export default function FeeReminders() {
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [note, setNote] = useState('');

  const month = new Date().toISOString().slice(0, 7);
  const monthLabel = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  useEffect(() => {
    const unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
      setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const unsubFees = onSnapshot(collection(db, 'fees'), (snap) => {
      setFees(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    const unsubReminders = onSnapshot(collection(db, 'reminders'), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => String(b.sentAt).localeCompare(String(a.sentAt)));
      setReminders(list);
    });
    return () => {
      unsubStudents();
      unsubFees();
      unsubReminders();
    };
  }, []);

  const paidIds = new Set(fees.filter((f) => f.month === month).map((f) => f.studentId));
  const pending = students.filter((s) => s.status !== 'Left' && !paidIds.has(s.id));

  const send = async (list) => {
    if (!list.length) return;
    setSending(true);
    const sentAt = new Date().toISOString();
    try {
      for (const student of list) {
        const id = `rem-${student.id}-${Date.now()}`;
        const message = note.trim()
          || `Dear ${student.fatherName || 'Parent'}, the fee for ${student.name} (${student.classSection}) is still unpaid for ${monthLabel}. Please pay Rs. ${Number(student.monthlyFee || 0).toLocaleString()} at the school office.`;
        await setDoc(doc(db, 'reminders', id), {
          id,
          studentId: student.id,
          studentName: student.name,
          contact: student.contact || '',
          classSection: student.classSection,
          message,
          sentAt,
          month,
        });
      }
      setNote('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Fee Reminders</h2>
            <p className="text-xs text-slate-500">{pending.length} students still unpaid for {monthLabel}</p>
          </div>
        </div>
        <button
          type="button"
          disabled={sending || pending.length === 0}
          onClick={() => send(pending)}
          className="self-start bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          {sending ? 'Sending...' : 'Remind all pending'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
        <label className="block text-xs font-semibold text-slate-500 mb-2">Optional message. Leave blank to use the standard fee reminder.</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Write a custom reminder..."
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm">Pending this month</h3>
        </div>
        {loading ? (
          <p className="p-8 text-center text-sm text-slate-500">Loading defaulters...</p>
        ) : pending.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-400">Every active student is paid for this month.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {pending.map((student) => (
              <li key={student.id} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">{student.name}</p>
                  <p className="text-xs text-slate-500">{student.classSection} · {student.contact || 'No contact'} · Rs. {Number(student.monthlyFee || 0).toLocaleString()}</p>
                </div>
                <button
                  type="button"
                  disabled={sending}
                  onClick={() => send([student])}
                  className="shrink-0 text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-100"
                >
                  Send
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm">Reminder log</h3>
        </div>
        {reminders.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-400">No reminders sent yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {reminders.slice(0, 12).map((item) => (
              <li key={item.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">{item.studentName}</p>
                  <p className="text-[11px] text-slate-400">{new Date(item.sentAt).toLocaleString()}</p>
                </div>
                <p className="text-xs text-slate-500 mt-1">{item.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
