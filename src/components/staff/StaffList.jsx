import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import StaffFormModal from './StaffFormModal';
import ConfirmDialog from '../ConfirmDialog';
import { UserCheck, Plus, Edit, Trash2, Search, Phone, BookOpen } from 'lucide-react';

export default function StaffList() {
  const { role } = useAuth();

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const [deletingStaff, setDeletingStaff] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'staff'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStaffList(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleDeleteStaff = async () => {
    if (!deletingStaff) return;
    setDeleteLoading(true);
    try {
      await deleteDoc(doc(db, 'staff', deletingStaff.id));
      setDeletingStaff(null);
    } catch (err) {
      console.error('Error deleting staff:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredStaff = staffList.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.assignedClass?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5">
      
      {/* Header with Purple Accent #8B5CF6 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center shadow-md shadow-purple-500/20">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Staff & Faculty Directory</h2>
            <p className="text-xs text-slate-500">Manage teachers, assigned classes, salaries & contact information</p>
          </div>
        </div>

        {role === 'Admin' && (
          <button
            onClick={() => {
              setEditingStaff(null);
              setIsFormOpen(true);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-md flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add Staff Member
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search staff by name, role, or assigned class..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading staff directory...</div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="font-semibold text-slate-600">No staff members found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase border-b border-slate-200">
                  <th className="py-3.5 px-5">Staff Member</th>
                  <th className="py-3.5 px-5">Role / Designation</th>
                  <th className="py-3.5 px-5">Contact</th>
                  <th className="py-3.5 px-5">Assigned Class</th>
                  <th className="py-3.5 px-5">Monthly Salary</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-5 font-bold text-slate-900">{staff.name}</td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-200">
                        {staff.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-xs flex items-center gap-1.5 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {staff.contact}
                    </td>
                    <td className="py-3.5 px-5 font-medium">
                      <span className="inline-flex items-center gap-1 text-slate-700">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                        {staff.assignedClass || 'None'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-extrabold text-slate-800">RS. {staff.salary?.toLocaleString()}</td>
                    <td className="py-3.5 px-5 text-right">
                      {role === 'Admin' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingStaff(staff);
                              setIsFormOpen(true);
                            }}
                            title="Edit Staff"
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingStaff(staff)}
                            title="Delete Staff"
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <StaffFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          staff={editingStaff}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingStaff)}
        onClose={() => setDeletingStaff(null)}
        onConfirm={handleDeleteStaff}
        title="Delete Staff Member"
        message={`Are you sure you want to remove ${deletingStaff?.name} from staff records?`}
        loading={deleteLoading}
      />

    </div>
  );
}
