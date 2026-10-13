import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, AlertTriangle, ShieldCheck, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('user');
  const [adminSecret, setAdminSecret] = useState('');
  const [showAdminSection, setShowAdminSection] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(name, email, password, role, adminSecret || undefined);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      const msg = err.response?.data?.detail;
      if (Array.isArray(msg)) {
        setError(msg.map(m => m.msg).join(', '));
      } else {
        setError(msg || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="glass-panel max-w-md w-full p-8 rounded-3xl border-slate-800 space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">Create Security Account</h2>
          <p className="text-xs text-slate-400 mt-1">Register for persistent email threat logging and analysis history</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="analyst@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">Account Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setRole('user'); setShowAdminSection(false); setAdminSecret(''); }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  role === 'user'
                    ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <User className="w-4 h-4 mb-1" />
                <p className="text-xs font-bold">User</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Scan emails, view history</p>
              </button>
              <button
                type="button"
                onClick={() => { setRole('admin'); setShowAdminSection(true); }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  role === 'admin'
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <ShieldCheck className="w-4 h-4 mb-1" />
                <p className="text-xs font-bold">Admin</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Full system access</p>
              </button>
            </div>
          </div>

          {/* Admin Secret Input */}
          {showAdminSection && (
            <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/30 space-y-2">
              <p className="text-[11px] text-amber-400 font-semibold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin registration requires a secret key</span>
              </p>
              <input
                type="password"
                placeholder="Enter admin secret key"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-amber-500/30 focus:border-amber-500 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
              <p className="text-[10px] text-slate-500">
                Default secret: <code className="text-amber-400 font-mono">phishguard_admin_2026</code>
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Creating account...</span>
              </>
            ) : (
              <span>Create {role === 'admin' ? 'Admin' : ''} Account</span>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 pt-2">
          Already registered?{' '}
          <Link to="/login" className="text-cyan-400 font-semibold hover:underline">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
