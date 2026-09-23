import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { CalendarCheck, Check, X, Save, Filter, AlertCircle } from 'lucide-react';

export default function MarkAttendance() {
  const { role, assignedClass } = useAuth();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedClass, setSelectedClass] = useState(role === 'Teacher' ? assignedClass : 'Class 10 - A');
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [students, setStudents] = useState([]);
  const [attendanceRecord, setAttendanceRecord] = useState({}); // { studentId: 'Present' | 'Absent' }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync Students for Selected Class
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'students'), (snapshot) => {
      const list = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(s => s.status !== 'Left');
      setStudents(list);
    });
    return () => unsub();
  }, []);

  // Sync Existing Attendance for selectedClass + selectedDate
  useEffect(() => {
    const docId = `${selectedDate}_${selectedClass}`;
    const unsub = onSnapshot(collection(db, 'attendance'), (snapshot) => {
      const existingDoc = snapshot.docs.find(d => d.id === docId);
      if (existingDoc && existingDoc.data().records) {
        setAttendanceRecord(existingDoc.data().records);
      } else {
        // Default all students to Present for fresh date
        const defaultRecords = {};
        students
          .filter(s => s.classSection === selectedClass)
          .forEach(s => {
            defaultRecords[s.id] = 'Present';
          });
        setAttendanceRecord(defaultRecords);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [selectedClass, selectedDate, students]);

  const handleToggleStatus = (studentId) => {
    setAttendanceRecord(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'Absent' ? 'Present' : 'Absent'
    }));
    setSavedSuccess(false);
  };

  const handleMarkAll = (status) => {
    const updated = {};
    classStudents.forEach(s => {
      updated[s.id] = status;
    });
    setAttendanceRecord(updated);
    setSavedSuccess(false);
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      const docId = `${selectedDate}_${selectedClass}`;
      await setDoc(doc(db, 'attendance', docId), {
        id: docId,
        date: selectedDate,
        classSection: selectedClass,
        records: attendanceRecord,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setSavedSuccess(true);
    } catch (err) {
      console.error('Error saving attendance:', err);
    } finally {
      setSaving(false);
    }
  };

  const classStudents = students.filter(s => s.classSection === selectedClass);

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center shadow-md shadow-blue-500/20">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Class Attendance Sheet</h2>
            <p className="text-xs text-slate-500">Mark daily attendance or edit past records directly in Firestore</p>
          </div>
        </div>

        <button
          onClick={handleSaveAttendance}
          disabled={saving || classStudents.length === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-md flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Attendance Record'}
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          Attendance for {selectedClass} on {selectedDate} saved successfully!
        </div>
      )}

      {/* Selector Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Select Class / Section</label>
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSavedSuccess(false);
              }}
              disabled={role === 'Teacher'}
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
          <label className="block text-xs font-semibold text-slate-600 mb-1">Attendance Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSavedSuccess(false);
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Checklist Action Shortcuts */}
      <div className="flex items-center justify-between bg-slate-100 p-3 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-600">
        <span>Students in {selectedClass}: {classStudents.length}</span>
        <div className="flex gap-2">
          <button
            onClick={() => handleMarkAll('Present')}
            className="px-3 py-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-lg transition"
          >
            Mark All Present
          </button>
          <button
            onClick={() => handleMarkAll('Absent')}
            className="px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200 rounded-lg transition"
          >
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Attendance Checklist Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading class checklist...</div>
        ) : classStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-slate-600">No students enrolled in {selectedClass}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase border-b border-slate-200">
                  <th className="py-3.5 px-5">Student</th>
                  <th className="py-3.5 px-5">Father / Guardian</th>
                  <th className="py-3.5 px-5 text-center">Status</th>
                  <th className="py-3.5 px-5 text-right">Quick Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {classStudents.map((student) => {
                  const status = attendanceRecord[student.id] || 'Present';
                  const isPresent = status === 'Present';

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-5 font-bold text-slate-800 flex items-center gap-3">
                        <img
                          src={student.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                          alt={student.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        {student.name}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600">{student.fatherName}</td>
                      <td className="py-3.5 px-5 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          isPresent 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-red-50 text-red-600 border border-red-200'
                        }`}>
                          {isPresent ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          {status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => handleToggleStatus(student.id)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                            isPresent 
                              ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          Mark {isPresent ? 'Absent' : 'Present'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
