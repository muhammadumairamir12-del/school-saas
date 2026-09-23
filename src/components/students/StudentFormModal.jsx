import React, { useState } from 'react';
import { db, storage } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Modal from '../Modal';
import { Upload, User, Phone, DollarSign, Calendar, AlertCircle } from 'lucide-react';

export default function StudentFormModal({ isOpen, onClose, student = null }) {
  const isEdit = Boolean(student && student.id);

  const [name, setName] = useState(student?.name || '');
  const [fatherName, setFatherName] = useState(student?.fatherName || '');
  const [contact, setContact] = useState(student?.contact || '');
  const [classSection, setClassSection] = useState(student?.classSection || 'Class 10 - A');
  const [admissionDate, setAdmissionDate] = useState(student?.admissionDate || new Date().toISOString().split('T')[0]);
  const [monthlyFee, setMonthlyFee] = useState(student?.monthlyFee || 3500);
  const [status, setStatus] = useState(student?.status || 'Active');
  
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(student?.photoUrl || '');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !fatherName.trim() || !contact.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let photoUrl = student?.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80';

      // If new photo file selected, upload to Firebase Storage
      if (photoFile) {
        try {
          const fileRef = ref(storage, `students/${Date.now()}_${photoFile.name}`);
          await uploadBytes(fileRef, photoFile);
          photoUrl = await getDownloadURL(fileRef);
        } catch (storageErr) {
          console.warn('Storage upload error, using local data URL fallback', storageErr);
          photoUrl = photoPreview;
        }
      }

      const id = isEdit ? student.id : `std-${Date.now()}`;
      const payload = {
        id,
        name,
        fatherName,
        contact,
        classSection,
        admissionDate,
        monthlyFee: Number(monthlyFee),
        status,
        photoUrl,
        updatedAt: new Date().toISOString(),
        ...(isEdit ? {} : { createdAt: new Date().toISOString() })
      };

      await setDoc(doc(db, 'students', id), payload, { merge: true });
      onClose();
    } catch (err) {
      console.error('Error saving student:', err);
      setError('Failed to save student record to Firestore.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Student Record' : 'Add New Student'}
      maxWidth="max-w-xl"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photo Upload & Preview */}
        <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <img
            src={photoPreview || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
            alt="Preview"
            className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shadow-xs"
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Student Photo</label>
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-medium text-slate-700 transition">
              <Upload className="w-3.5 h-3.5" />
              Choose Photo File
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Student Name *</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Father/Guardian Name *</label>
            <input
              type="text"
              required
              value={fatherName}
              onChange={(e) => setFatherName(e.target.value)}
              placeholder="e.g. Rajesh Sharma"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Contact Number *</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Class / Section *</label>
            <select
              value={classSection}
              onChange={(e) => setClassSection(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
            >
              <option value="Class 10 - A">Class 10 - A</option>
              <option value="Class 9 - B">Class 9 - B</option>
              <option value="Class 8 - A">Class 8 - A</option>
              <option value="Class 7 - C">Class 7 - C</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Admission Date</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="date"
                value={admissionDate}
                onChange={(e) => setAdmissionDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Monthly Fee (RS.)</label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="number"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="Active"
                checked={status === 'Active'}
                onChange={() => setStatus('Active')}
                className="text-amber-500 focus:ring-amber-500"
              />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="Left"
                checked={status === 'Left'}
                onChange={() => setStatus('Left')}
                className="text-red-500 focus:ring-red-500"
              />
              Left / Inactive
            </label>
          </div>
        </div>

        {/* Modal Buttons */}
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
            className="py-2 px-5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition shadow-md disabled:opacity-50"
          >
            {loading ? 'Saving...' : (isEdit ? 'Update Student' : 'Save Student')}
          </button>
        </div>

      </form>
    </Modal>
  );
}
