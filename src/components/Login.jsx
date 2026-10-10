import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ShieldCheck, UserCheck, Lock, Mail } from 'lucide-react';

export default function Login() {
  const { loginWithDemo, loginWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      loginWithEmail(email, password, role);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (selectedRole) => {
    setLoading(true);
    loginWithDemo(selectedRole);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#e8eef0] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-[#064e4e] to-[#0a6666] p-8 text-white text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-3 border border-white/20">
            <GraduationCap className="w-8 h-8 text-amber-300" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">SkyEagle</h1>
          <p className="text-teal-200 text-sm mt-1">School Management System</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Role
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setRole('Admin')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm transition-all ${
                  role === 'Admin'
                    ? 'bg-white text-teal-800 shadow-sm font-semibold'
                    : 'text-slate-600'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Admin
              </button>
              <button
                type="button"
                onClick={() => setRole('Teacher')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm transition-all ${
                  role === 'Teacher'
                    ? 'bg-white text-teal-800 shadow-sm font-semibold'
                    : 'text-slate-600'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                Teacher
              </button>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@skyeagle.edu"
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#0a6666] hover:bg-[#064e4e] text-white rounded-lg text-sm font-semibold transition disabled:opacity-60"
            >
              Sign in
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 uppercase">or demo</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemo('Admin')}
              className="py-2.5 border border-teal-700 text-teal-800 rounded-lg text-sm font-medium hover:bg-teal-50 transition"
            >
              Admin Demo
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemo('Teacher')}
              className="py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
            >
              Teacher Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
