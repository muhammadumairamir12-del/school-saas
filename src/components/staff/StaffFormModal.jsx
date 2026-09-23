import React, { useState } from 'react';
import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import Modal from '../Modal';
import { UserCheck, Phone, DollarSign, BookOpen, AlertCircle } from 'lucide-react';

export default function StaffFormModal({ isOpen, onClose, staff = null }) {
  const isEdit = Boolean(staff && staff.id);

  const [name, setName] = useState(staff?.name || '');
  const [role, setRole] = useState(staff?.role || 'Senior Teacher');
  const [contact, setContact] = useState(staff?.contact || '');
  const [salary, setSalary] = useState(staff?.salary || 40000);
  const [assignedClass, setAssignedClass] = useState(staff?.assignedClass || 'Class 10 - A');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) {
      setError('Please fill in required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const id = isEdit ? staff.id : `stf-${Date.now()}`;
      const payload = {
        id,
        name,
        role,
        contact,
        salary: Number(salary),
        assignedClass,
        updatedAt: new Date().toISOString(),
        ...(isEdit ? {} : { createdAt: new Date().toISOString() })
      };

      await setDoc(doc(db, 'staff', id), payload, { merge: true });
      onClose();
    } catch (err) {
      console.error('Error saving staff:', err);
      setError('Failed to save staff record to Firestore.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Staff Member' : 'Add New Staff Member'}
      maxWidth="max-w-md"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
          <div className="relative">
            <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Nair"
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Role / Designation *</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
          >
            <option value="Senior Teacher">Senior Teacher</option>
            <option value="Mathematics Teacher">Mathematics Teacher</option>
            <option value="Science Teacher">Science Teacher</option>
            <option value="English Teacher">English Teacher</option>
            <option value="Administrator">Administrator</option>
            <option value="Support Staff">Support Staff</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Contact Phone *</label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="+91 91234 56789"
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Monthly Salary (RS.)</label>
          <div className="relative">
            <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="45000"
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Assigned Class</label>
          <div className="relative">
            <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <select
              value={assignedClass}
              onChange={(e) => setAssignedClass(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
            >
              <option value="Class 10 - A">Class 10 - A</option>
              <option value="Class 9 - B">Class 9 - B</option>
              <option value="Class 8 - A">Class 8 - A</option>
              <option value="Class 7 - C">Class 7 - C</option>
              <option value="None / Admin">None / Admin</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="py-2 px-5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm transition shadow-md disabled:opacity-50"
          >
            {loading ? 'Saving...' : (isEdit ? 'Update Staff' : 'Save Staff Member')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
