import React, { useState } from 'react';
import { X, Lock, User, KeyRound, AlertCircle, Loader2, Sparkles } from 'lucide-react';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both your username/email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem('mj_admin_token', data.token);
        localStorage.setItem('mj_admin_user', JSON.stringify(data.user));
        onLoginSuccess(data.token, data.user);
      } else {
        setError(data.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#FAF8F5] text-[#191614] rounded-2xl shadow-2xl border border-[#9B7855]/30 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 bg-[#191614] text-[#FAF8F5] flex items-center justify-between border-b border-[#9B7855]/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#9B7855]/20 border border-[#9B7855]/40 flex items-center justify-center text-[#C9A96E]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-medium text-[#FAF8F5]">Salon Owner Portal</h3>
              <p className="text-xs text-[#FAF8F5]/60">MJ Hair Salon Management Dashboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#FAF8F5]/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-[#191614]/80 mb-1">
                Owner Email or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9B7855]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="malvin@mjhairsalon.com"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white rounded-xl border border-[#9B7855]/30 text-xs focus:outline-none focus:ring-2 focus:ring-[#9B7855]/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#191614]/80 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9B7855]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white rounded-xl border border-[#9B7855]/30 text-xs focus:outline-none focus:ring-2 focus:ring-[#9B7855]/40"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#191614] hover:bg-[#9B7855] text-white rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In to Dashboard</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
