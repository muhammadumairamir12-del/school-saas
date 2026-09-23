import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import ExpenseFormModal from './ExpenseFormModal';
import ConfirmDialog from '../ConfirmDialog';
import { exportExpenseReportPDF } from '../../utils/pdfExport';
import { 
  Receipt, 
  Plus, 
  Download, 
  Trash2, 
  Edit, 
  Search, 
  Tag, 
  DollarSign
} from 'lucide-react';

export default function ExpenseList() {
  const { role } = useAuth();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [searchTerm, setSearchTerm] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [deletingExpense, setDeletingExpense] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'expenses'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
      setExpenses(list);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleDeleteExpense = async () => {
    if (!deletingExpense) return;
    setDeleteLoading(true);
    try {
      await deleteDoc(doc(db, 'expenses', deletingExpense.id));
      setDeletingExpense(null);
    } catch (err) {
      console.error('Error deleting expense:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtered Expenses
  const monthlyExpenses = expenses.filter(e => e.date && e.date.startsWith(selectedMonth));
  
  const filteredExpenses = monthlyExpenses.filter(e =>
    e.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalExpense = monthlyExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  // Category breakdown
  const categoryTotals = {};
  monthlyExpenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount || 0);
  });

  return (
    <div className="space-y-5">
      
      {/* Header with Teal/Green Accent #10B981 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">School Expenses Tracker</h2>
            <p className="text-xs text-slate-500">Record utilities, rent, salaries & operational expenditures</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => exportExpenseReportPDF(selectedMonth, monthlyExpenses, totalExpense)}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-3.5 py-2 rounded-xl text-sm transition shadow-xs flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            PDF Export
          </button>

          {role === 'Admin' && (
            <button
              onClick={() => {
                setEditingExpense(null);
                setIsFormOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          )}
        </div>
      </div>

      {/* Monthly Summary & Category Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Total Monthly Expenses</span>
            <span className="text-3xl font-extrabold text-emerald-950">RS. {totalExpense.toLocaleString()}</span>
            <span className="text-xs text-emerald-700 block mt-1">Cycle: {selectedMonth}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category Breakdown ({selectedMonth})</span>
          <div className="flex flex-wrap gap-2">
            {Object.keys(categoryTotals).length === 0 ? (
              <span className="text-xs text-slate-400">No category breakdown available for this month.</span>
            ) : (
              Object.entries(categoryTotals).map(([cat, amt]) => (
                <div key={cat} className="px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold flex items-center gap-2">
                  <Tag className="w-3 h-3 text-emerald-600" />
                  <span className="text-slate-700">{cat}:</span>
                  <span className="text-emerald-700 font-extrabold">RS. {amt.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search expense category or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Expenses List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading expense logs...</div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No expenses logged for {selectedMonth}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase border-b border-slate-200">
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Description</th>
                  <th className="py-3.5 px-5">Amount</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-5 font-mono text-xs text-slate-500">{exp.date}</td>
                    <td className="py-3.5 px-5 font-bold text-slate-800">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">{exp.description || '-'}</td>
                    <td className="py-3.5 px-5 font-extrabold text-slate-900">RS. {exp.amount?.toLocaleString()}</td>
                    <td className="py-3.5 px-5 text-right">
                      {role === 'Admin' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingExpense(exp);
                              setIsFormOpen(true);
                            }}
                            title="Edit Expense"
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingExpense(exp)}
                            title="Delete Expense"
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
        <ExpenseFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          expense={editingExpense}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingExpense)}
        onClose={() => setDeletingExpense(null)}
        onConfirm={handleDeleteExpense}
        title="Delete Expense Log"
        message={`Are you sure you want to delete the expense entry for RS. ${deletingExpense?.amount}?`}
        loading={deleteLoading}
      />

    </div>
  );
}
