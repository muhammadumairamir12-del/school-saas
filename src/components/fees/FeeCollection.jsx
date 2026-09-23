import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import Modal from '../Modal';
import ConfirmDialog from '../ConfirmDialog';
import { exportFeeReceiptPDF, exportFeeReportPDF } from '../../utils/pdfExport';
import { 
  CreditCard, 
  Plus, 
  Download, 
  Trash2, 
  Edit, 
  Search, 
  Calendar, 
  DollarSign,
  UserCheck,
  AlertCircle
} from 'lucide-react';

export default function FeeCollection() {
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState(null);

  const currentMonthStr = new Date().toISOString().slice(0, 7); // e.g. "2025-05"
  const todayStr = new Date().toISOString().split('T')[0];

  const [studentId, setStudentId] = useState('');
  const [month, setMonth] = useState(currentMonthStr);
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(todayStr);

  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Delete State
  const [deletingFee, setDeletingFee] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const unsubStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(list);
    });

    const unsubFees = onSnapshot(collection(db, 'fees'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
      setFees(list);
      setLoading(false);
    });

    return () => {
      unsubStudents();
      unsubFees();
    };
  }, []);

  const handleStudentSelect = (selectedId) => {
    setStudentId(selectedId);
    const selectedStd = students.find(s => s.id === selectedId);
    if (selectedStd && !editingFee) {
      setAmount(selectedStd.monthlyFee || 3500);
    }
  };

  const handleOpenModal = (feeToEdit = null) => {
    setError('');
    if (feeToEdit) {
      setEditingFee(feeToEdit);
      setStudentId(feeToEdit.studentId);
      setMonth(feeToEdit.month || currentMonthStr);
      setAmount(feeToEdit.amount || '');
      setPaymentDate(feeToEdit.paymentDate || todayStr);
    } else {
      setEditingFee(null);
      const defaultStudent = students[0];
      setStudentId(defaultStudent ? defaultStudent.id : '');
      setAmount(defaultStudent ? defaultStudent.monthlyFee : 3500);
      setMonth(currentMonthStr);
      setPaymentDate(todayStr);
    }
    setIsModalOpen(true);
  };

  const handleSubmitFee = async (e) => {
    e.preventDefault();
    if (!studentId || !amount || !month) {
      setError('Please fill in all fee details.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const selectedStd = students.find(s => s.id === studentId);
      const feeId = editingFee ? editingFee.id : `fee-${Date.now()}`;
      
      const payload = {
        id: feeId,
        studentId,
        studentName: selectedStd ? selectedStd.name : 'Unknown Student',
        classSection: selectedStd ? selectedStd.classSection : 'N/A',
        month,
        amount: Number(amount),
        paymentDate,
        receiptNo: editingFee?.receiptNo || 'REC-' + Math.floor(100000 + Math.random() * 900000),
        updatedAt: new Date().toISOString(),
        ...(editingFee ? {} : { createdAt: new Date().toISOString() })
      };

      await setDoc(doc(db, 'fees', feeId), payload, { merge: true });
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving fee:', err);
      setError('Failed to record fee entry in Firestore.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFee = async () => {
    if (!deletingFee) return;
    setDeleteLoading(true);
    try {
      await deleteDoc(doc(db, 'fees', deletingFee.id));
      setDeletingFee(null);
    } catch (err) {
      console.error('Error deleting fee entry:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Search filter
  const filteredFees = fees.filter(f => 
    f.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.receiptNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.month?.includes(searchTerm)
  );

  return (
    <div className="space-y-5">
      
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500 text-white font-bold flex items-center justify-center shadow-md shadow-pink-500/20">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Fee Collections</h2>
            <p className="text-xs text-slate-500">Collect fees, generate printable receipts & track payment logs</p>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal(null)}
          className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Collect Fee Payment
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search transaction by student name, receipt #, or month..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Fee Collections Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-medium text-sm">
            Loading fee collection records...
          </div>
        ) : filteredFees.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <UserCheck className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-slate-600">No fee collections found</p>
            <p className="text-xs mt-1">Click "Collect Fee Payment" to record a new payment entry.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase border-b border-slate-200">
                  <th className="py-3.5 px-5">Receipt #</th>
                  <th className="py-3.5 px-5">Student Name</th>
                  <th className="py-3.5 px-5">Class</th>
                  <th className="py-3.5 px-5">For Month</th>
                  <th className="py-3.5 px-5">Amount Paid</th>
                  <th className="py-3.5 px-5">Payment Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredFees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-5 font-mono text-xs font-semibold text-slate-500">
                      {fee.receiptNo || fee.id}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-800">{fee.studentName}</td>
                    <td className="py-3.5 px-5">{fee.classSection}</td>
                    <td className="py-3.5 px-5 font-medium">{fee.month}</td>
                    <td className="py-3.5 px-5 font-extrabold text-emerald-600">RS. {fee.amount}</td>
                    <td className="py-3.5 px-5 text-slate-500 text-xs">{fee.paymentDate}</td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => exportFeeReceiptPDF(fee)}
                          title="Download Receipt PDF"
                          className="p-1.5 text-pink-600 hover:bg-pink-50 rounded-lg transition"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(fee)}
                          title="Edit Transaction"
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingFee(fee)}
                          title="Delete Record"
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Collect / Edit Fee Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingFee ? "Edit Fee Entry" : "Collect Fee Payment"}
          maxWidth="max-w-md"
        >
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmitFee} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Select Student *</label>
              <select
                required
                value={studentId}
                onChange={(e) => handleStudentSelect(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none bg-white"
              >
                <option value="" disabled>-- Select Student --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.classSection})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Fee Month *</label>
              <input
                type="month"
                required
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Amount Paid (RS.) *</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="3500"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="py-2 px-4 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="py-2 px-5 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl text-sm transition shadow-md disabled:opacity-50"
              >
                {submitting ? 'Saving...' : (editingFee ? 'Update Fee' : 'Save & Generate Receipt')}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingFee)}
        onClose={() => setDeletingFee(null)}
        onConfirm={handleDeleteFee}
        title="Delete Fee Record"
        message={`Are you sure you want to delete receipt ${deletingFee?.receiptNo} for ${deletingFee?.studentName}?`}
        loading={deleteLoading}
      />

    </div>
  );
}
