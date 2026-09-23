import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ShieldCheck, UserCheck, Lock, Mail, Sparkles } from 'lucide-react';

export default function Login() {
  const { loginWithDemo, loginWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Admin');
  const [assignedClass, setAssignedClass] = useState('Class 10 - A');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithEmail(email, password, role, assignedClass);
    } catch (err) {
      console.error(err);
      setError('Failed to login. Incorrect credentials or authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (selectedRole) => {
    setLoading(true);
    try {
      await loginWithDemo(selectedRole, selectedRole === 'Teacher' ? 'Class 10 - A' : '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Header Branding */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 text-white text-center relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-md mb-3 border border-white/20 shadow-inner">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Sky Education</h1>
          <p className="text-blue-200 text-sm mt-1">School Management System</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          {/* Role Selection Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Select Demo Role
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setRole('Admin')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                  role === 'Admin' 
                    ? 'bg-white text-blue-700 shadow-sm font-semibold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Admin
              </button>
              <button
                type="button"
                onClick={() => setRole('Teacher')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                  role === 'Teacher' 
                    ? 'bg-white text-indigo-700 shadow-sm font-semibold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                Teacher
              </button>
            </div>
          </div>

          {role === 'Teacher' && (
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Assigned Class
              </label>
              <select
                value={assignedClass}
                onChange={(e) => setAssignedClass(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Class 10 - A">Class 10 - A</option>
                <option value="Class 9 - B">Class 9 - B</option>
              </select>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder="admin@skyeducation.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition duration-200 text-sm disabled:opacity-50"
            >
              Sign In
            </button>
          </form>

          {/* Quick Demo Access Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-medium">Or Quick Demo Login</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleQuickDemo('Admin')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-medium transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Demo Admin
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('Teacher')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg text-xs font-medium transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Demo Teacher
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
