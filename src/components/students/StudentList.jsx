import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import StudentFormModal from './StudentFormModal';
import ConfirmDialog from '../ConfirmDialog';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  UserCheck, 
  Filter,
  GraduationCap
} from 'lucide-react';

export default function StudentList({ onSelectStudent }) {
  const { role } = useAuth();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'students'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleDelete = async () => {
    if (!deletingStudent) return;
    setDeleteLoading(true);
    try {
      await deleteDoc(doc(db, 'students', deletingStudent.id));
      setDeletingStudent(null);
    } catch (err) {
      console.error('Error deleting student:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtered List
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.fatherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.contact.includes(searchTerm);

    const matchesClass = selectedClass === 'All' || student.classSection === selectedClass;

    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-5">
      
      {/* Header bar with accent color (Amber/Gold #D4A017) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center shadow-md shadow-amber-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Student Directory</h2>
            <p className="text-xs text-slate-500">Manage student profiles, admission records & status</p>
          </div>
        </div>

        {role === 'Admin' && (
          <button
            onClick={() => {
              setEditingStudent(null);
              setIsFormOpen(true);
            }}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-md flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add New Student
          </button>
        )}
      </div>

      {/* Filter and Search controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search student by name, guardian, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
          />
        </div>

        <div className="relative">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
          >
            <option value="All">All Classes</option>
            <option value="Class 10 - A">Class 10 - A</option>
            <option value="Class 9 - B">Class 9 - B</option>
            <option value="Class 8 - A">Class 8 - A</option>
            <option value="Class 7 - C">Class 7 - C</option>
          </select>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-medium text-sm">
            Loading students from Firestore...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <UserCheck className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-slate-600">No students found</p>
            <p className="text-xs mt-1">Try adjusting your search query or class filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase border-b border-slate-200">
                  <th className="py-3.5 px-5">Student</th>
                  <th className="py-3.5 px-5">Class/Section</th>
                  <th className="py-3.5 px-5">Guardian</th>
                  <th className="py-3.5 px-5">Contact</th>
                  <th className="py-3.5 px-5">Admission Date</th>
                  <th className="py-3.5 px-5">Monthly Fee</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-5 font-semibold text-slate-800 flex items-center gap-3">
                      <img
                        src={student.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                        alt={student.name}
                        className="w-9 h-9 rounded-full object-cover border border-amber-300 shadow-xs"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{student.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {student.id}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-medium">{student.classSection}</td>
                    <td className="py-3.5 px-5 text-slate-600">{student.fatherName}</td>
                    <td className="py-3.5 px-5 font-mono text-xs text-slate-600">{student.contact}</td>
                    <td className="py-3.5 px-5 text-xs text-slate-500">{student.admissionDate || '-'}</td>
                    <td className="py-3.5 px-5 font-semibold text-slate-800">RS. {student.monthlyFee}</td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        student.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {student.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectStudent(student)}
                          title="View Profile"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {role === 'Admin' && (
                          <>
                            <button
                              onClick={() => {
                                setEditingStudent(student);
                                setIsFormOpen(true);
                              }}
                              title="Edit Student"
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingStudent(student)}
                              title="Delete Student"
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal for Add/Edit */}
      {isFormOpen && (
        <StudentFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          student={editingStudent}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingStudent)}
        onClose={() => setDeletingStudent(null)}
        onConfirm={handleDelete}
        title="Delete Student Record"
        message={`Are you sure you want to permanently delete ${deletingStudent?.name}? All associated record references will be removed.`}
        loading={deleteLoading}
      />

    </div>
  );
}
