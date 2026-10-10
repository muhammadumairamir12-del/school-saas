import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import Modal from '../Modal';
import ConfirmDialog from '../ConfirmDialog';
import { BookOpen, Plus, Edit2, Trash2, Calendar, FileText, Search, Filter, Download } from 'lucide-react';
// exportDiaryPDF will be added to pdfExport.js separately
import { exportDiaryPDF } from '../../utils/pdfExport'; 

export default function TeacherDiary() {
  const { currentUser, role } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterClass, setFilterClass] = useState('All');
  const [filterDate, setFilterDate] = useState('');
  
  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    classSection: 'Class 10 - A',
    topicTaught: '',
    homeworkAssigned: '',
    notes: ''
  });

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const classes = ['Class 10 - A', 'Class 9 - B', 'Class 8 - A', 'Class 7 - C'];

  useEffect(() => {
    const q = query(collection(db, 'diary'), orderBy('date', 'desc'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEntries(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching diary entries: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredEntries = entries.filter(entry => {
    // Role filter
    if (role === 'Teacher' && entry.teacherId !== currentUser?.uid) {
      return false;
    }
    // Class filter
    if (filterClass !== 'All' && entry.classSection !== filterClass) {
      return false;
    }
    // Date filter
    if (filterDate && entry.date !== filterDate) {
      return false;
    }
    return true;
  });

  const handleOpenModal = (entry = null) => {
    if (entry) {
      setFormData({
        date: entry.date,
        classSection: entry.classSection,
        topicTaught: entry.topicTaught,
        homeworkAssigned: entry.homeworkAssigned,
        notes: entry.notes || ''
      });
      setEditingId(entry.id);
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        classSection: 'Class 10 - A',
        topicTaught: '',
        homeworkAssigned: '',
        notes: ''
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const entryId = editingId || doc(collection(db, 'diary')).id;
      const now = new Date().toISOString();
      
      const payload = {
        ...formData,
        teacherId: currentUser?.uid || 'unknown_id',
        teacherName: currentUser?.displayName || 'Unknown Teacher',
        updatedAt: now
      };

      if (!editingId) {
        payload.createdAt = now;
      }

      await setDoc(doc(db, 'diary', entryId), payload, { merge: true });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving diary entry:", error);
      alert("Failed to save entry");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'diary', deletingId));
      setIsDeleteOpen(false);
      setDeletingId(null);
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Failed to delete entry");
    }
  };

  const handleExportPDF = () => {
    const classLabel = filterClass === 'All' ? 'All Classes' : filterClass;
    const dateLabel = filterDate || 'All Dates';
    exportDiaryPDF(classLabel, dateLabel, filteredEntries);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <BookOpen size={24} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {role === 'Admin' ? 'View All Diaries' : 'Teacher Diary'}
            </h1>
            <p className="text-slate-500 text-sm">
              {role === 'Admin'
                ? 'All class diary entries across teachers and sections'
                : 'Manage your daily lesson records and homework assignments'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span>New Entry</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex items-center gap-2 text-slate-500">
          <Filter size={18} />
          <span className="font-medium hidden sm:inline">Filters:</span>
        </div>
        <select 
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="flex-1 w-full sm:w-auto px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="All">All Classes</option>
          {classes.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input 
          type="date" 
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="flex-1 w-full sm:w-auto px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {(filterClass !== 'All' || filterDate) && (
          <button 
            onClick={() => { setFilterClass('All'); setFilterDate(''); }}
            className="text-sm text-indigo-600 font-medium hover:text-indigo-700 whitespace-nowrap"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Entry Cards */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Loading diary entries...</p>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400">
            <BookOpen size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">No Entries Found</h3>
          <p className="text-slate-500 max-w-md">There are no diary entries matching your current filters. Clear the filters or create a new entry to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntries.map(entry => (
            <div key={entry.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col hover:border-indigo-200 transition-colors">
              <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                <div>
                  <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-bold mb-3">
                    {entry.classSection}
                  </span>
                  <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                    <Calendar size={15} className="text-slate-400" />
                    <span>{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'})}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-white rounded-lg shadow-sm border border-slate-100">
                  <button 
                    onClick={() => handleOpenModal(entry)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-l-lg transition-colors border-r border-slate-100"
                    title="Edit entry"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => { setDeletingId(entry.id); setIsDeleteOpen(true); }}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-r-lg transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col gap-5">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <BookOpen size={12} />
                    Topic Taught
                  </h4>
                  <p className="text-slate-800 font-medium">{entry.topicTaught}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <FileText size={12} />
                    Homework Assigned
                  </h4>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <p className="text-slate-700 text-sm whitespace-pre-wrap">{entry.homeworkAssigned}</p>
                  </div>
                </div>
                {entry.notes && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Notes/Remarks</h4>
                    <p className="text-slate-600 text-sm italic">{entry.notes}</p>
                  </div>
                )}
              </div>
              {role === 'Admin' && (
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shadow-sm">
                    {entry.teacherName?.charAt(0) || 'T'}
                  </div>
                  <span className="font-medium">By: {entry.teacherName}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Diary Entry" : "New Diary Entry"}>
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
              <input 
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Class/Section</label>
              <select 
                required
                value={formData.classSection}
                onChange={(e) => setFormData({...formData, classSection: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              >
                {classes.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Topic Taught</label>
            <input 
              type="text"
              required
              placeholder="e.g. Chapter 4: Quadratic Equations"
              value={formData.topicTaught}
              onChange={(e) => setFormData({...formData, topicTaught: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Homework Assigned</label>
            <textarea 
              required
              rows={3}
              placeholder="e.g. Complete exercises 4.1 and 4.2"
              value={formData.homeworkAssigned}
              onChange={(e) => setFormData({...formData, homeworkAssigned: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-shadow"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes/Remarks <span className="text-slate-400 font-normal">(Optional)</span></label>
            <textarea 
              rows={2}
              placeholder="Any additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-shadow"
            ></textarea>
          </div>
          <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-sm"
            >
              {editingId ? "Update Entry" : "Save Entry"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog 
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setDeletingId(null); }}
        onConfirm={handleDelete}
        title="Delete Diary Entry"
        message="Are you sure you want to delete this diary entry? This action cannot be undone."
        confirmText="Delete"
        confirmColor="red"
      />
    </div>
  );
}
