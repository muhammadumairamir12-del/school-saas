import React, { useState } from 'react';
import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import Modal from '../Modal';
import { DollarSign, Calendar, Tag, FileText, AlertCircle } from 'lucide-react';

export default function ExpenseFormModal({ isOpen, onClose, expense = null }) {
  const isEdit = Boolean(expense && expense.id);

  const [category, setCategory] = useState(expense?.category || 'Salary');
  const [amount, setAmount] = useState(expense?.amount || '');
  const [date, setDate] = useState(expense?.date || new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(expense?.description || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !date) {
      setError('Please provide expense amount and date.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const id = isEdit ? expense.id : `exp-${Date.now()}`;
      const payload = {
        id,
        category,
        amount: Number(amount),
        date,
        description,
        updatedAt: new Date().toISOString(),
        ...(isEdit ? {} : { createdAt: new Date().toISOString() })
      };

      await setDoc(doc(db, 'expenses', id), payload, { merge: true });
      onClose();
    } catch (err) {
      console.error('Error saving expense:', err);
      setError('Failed to save expense record in Firestore.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Expense Record' : 'Add New Expense Entry'}
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
          <label className="block text-xs font-semibold text-slate-600 mb-1">Expense Category *</label>
          <div className="relative">
            <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
            >
              <option value="Salary">Salary</option>
              <option value="Rent">Rent</option>
              <option value="Utilities">Utilities</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Supplies">Supplies</option>
              <option value="Misc">Misc</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Amount (RS.) *</label>
          <div className="relative">
            <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 5000"
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Expense Date *</label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Description / Notes</label>
          <div className="relative">
            <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Office stationery & printer ink"
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
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
            className="py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition shadow-md disabled:opacity-50"
          >
            {loading ? 'Saving...' : (isEdit ? 'Update Expense' : 'Save Expense Entry')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
