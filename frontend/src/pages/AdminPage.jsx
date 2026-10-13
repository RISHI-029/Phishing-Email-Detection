import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Users, Database, Trash2, UserCheck, UserX,
  Crown, RefreshCw, AlertTriangle, Search, ChevronUp, ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState(null);

  // Redirect non-admins
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/admin/stats');
      setStats(res.data);
    } catch {}
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/users');
      setUsers(res.data);
    } catch (e) {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const fetchScans = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/scans');
      setScans(res.data);
    } catch (e) {
      setError('Failed to load scans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'scans') fetchScans();
  }, [activeTab]);

  const handleToggleRole = async (u) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    try {
      await api.patch(`/api/admin/users/${u.id}/role`, { role: newRole });
      showSuccess(`${u.name} is now ${newRole}`);
      fetchUsers();
    } catch (e) {
      setError(e.response?.data?.detail || 'Role update failed.');
    }
  };

  const handleToggleStatus = async (u) => {
    try {
      await api.patch(`/api/admin/users/${u.id}/status`, { is_active: !u.is_active });
      showSuccess(`${u.name} account ${u.is_active ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch (e) {
      setError(e.response?.data?.detail || 'Status update failed.');
    }
  };

  const handleDeleteScan = async (id) => {
    if (!window.confirm('Delete this scan permanently?')) return;
    try {
      await api.delete(`/api/admin/scans/${id}`);
      showSuccess('Scan deleted');
      fetchScans();
    } catch {
      setError('Delete failed.');
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredScans = scans.filter(s =>
    s.sender.toLowerCase().includes(search.toLowerCase()) ||
    s.subject.toLowerCase().includes(search.toLowerCase())
  );

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Crown className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Admin Panel</h1>
            <p className="text-xs text-slate-400">System administration — full access</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase">
          Admin
        </span>
      </div>

      {/* Success/Error alerts */}
      {successMsg && (
        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-slate-500 hover:text-white">✕</button>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: stats.total_users, icon: Users, color: 'cyan' },
            { label: 'Admins', value: stats.admin_count, icon: Crown, color: 'amber' },
            { label: 'Total Scans', value: stats.total_scans, icon: Database, color: 'blue' },
            { label: 'Phishing Found', value: stats.phishing_count, icon: AlertTriangle, color: 'red' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass-panel p-4 rounded-2xl border-slate-800 text-center">
              <div className={`w-8 h-8 rounded-xl mx-auto mb-2 flex items-center justify-center
                ${color === 'cyan' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : ''}
                ${color === 'amber' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : ''}
                ${color === 'blue' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : ''}
                ${color === 'red' ? 'bg-red-500/10 border-red-500/30 text-red-400' : ''}
                border`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-white">{value}</p>
              <p className="text-[10px] text-slate-400 uppercase">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 p-1 bg-slate-900 rounded-xl border border-slate-800 w-fit">
        {[
          { key: 'overview', label: 'Overview', icon: ShieldCheck },
          { key: 'users', label: 'Users', icon: Users },
          { key: 'scans', label: 'All Scans', icon: Database },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setSearch(''); setError(null); }}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === key
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && stats && (
        <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white mb-4">System Overview</h2>
          <div className="space-y-3">
            {[
              { label: 'Total Registered Users', value: stats.total_users },
              { label: 'Admin Accounts', value: stats.admin_count },
              { label: 'Regular Users', value: stats.user_count },
              { label: 'Active Users', value: stats.active_users },
              { label: 'Total Email Scans', value: stats.total_scans },
              { label: 'Phishing Emails Detected', value: stats.phishing_count },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="text-sm text-slate-300">{label}</span>
                <span className="font-bold text-white">{value}</span>
              </div>
            ))}
          </div>
          <button
            onClick={fetchStats}
            className="mt-2 flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-cyan-300"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh stats</span>
          </button>
        </div>
      )}

      {/* Tab: Users */}
      {activeTab === 'users' && (
        <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center space-x-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition"
              />
            </div>
            <button onClick={fetchUsers} className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400 uppercase text-[10px] border-b border-slate-800">
                    <th className="p-3 text-left">User</th>
                    <th className="p-3 text-left">Role</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Scans</th>
                    <th className="p-3 text-left">Joined</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                      <td className="p-3">
                        <p className="font-semibold text-white">{u.name}</p>
                        <p className="text-slate-500">{u.email}</p>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          u.role === 'admin'
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                        }`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          u.is_active
                            ? 'bg-green-500/10 border-green-500/30 text-green-400'
                            : 'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300 font-semibold">{u.scan_count}</td>
                      <td className="p-3 text-slate-400">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          {u.id !== user.id && (
                            <>
                              <button
                                onClick={() => handleToggleRole(u)}
                                title={u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                                className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition border border-amber-500/20"
                              >
                                <Crown className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleToggleStatus(u)}
                                title={u.is_active ? 'Deactivate' : 'Activate'}
                                className={`p-1.5 rounded-lg border transition ${
                                  u.is_active
                                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20'
                                    : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20'
                                }`}
                              >
                                {u.is_active ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                              </button>
                            </>
                          )}
                          {u.id === user.id && (
                            <span className="text-[10px] text-slate-600 italic">You</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-sm">No users found.</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab: All Scans */}
      {activeTab === 'scans' && (
        <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center space-x-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by sender or subject..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition"
              />
            </div>
            <button onClick={fetchScans} className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading scans...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400 uppercase text-[10px] border-b border-slate-800">
                    <th className="p-3 text-left">#</th>
                    <th className="p-3 text-left">Sender</th>
                    <th className="p-3 text-left">Subject</th>
                    <th className="p-3 text-left">Verdict</th>
                    <th className="p-3 text-left">Risk</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Del</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredScans.map(s => (
                    <tr key={s.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                      <td className="p-3 text-slate-500">#{s.id}</td>
                      <td className="p-3 text-slate-300 max-w-[120px] truncate">{s.sender}</td>
                      <td className="p-3 text-white max-w-[200px] truncate">{s.subject}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          s.prediction === 'PHISHING'
                            ? 'bg-red-500/10 border-red-500/30 text-red-400'
                            : s.prediction === 'SUSPICIOUS'
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : 'bg-green-500/10 border-green-500/30 text-green-400'
                        }`}>
                          {s.prediction}
                        </span>
                      </td>
                      <td className="p-3 text-white font-bold">{s.risk_score}</td>
                      <td className="p-3 text-slate-400">{new Date(s.created_at).toLocaleDateString()}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDeleteScan(s.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredScans.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-sm">No scans found.</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
