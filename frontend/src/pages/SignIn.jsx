import React, { useState } from 'react';
import { MdLogin, MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdAdminPanelSettings, MdVerifiedUser, MdArrowBack } from 'react-icons/md';

export default function SignIn({ onLogin, addAlert }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Initial Login (Email & Password)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      addAlert('warning', 'Missing Credentials', 'Please enter both email and password.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      addAlert('error', 'Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (data.status === 'verification_required') {
        addAlert('success', 'Code Sent! 📧', 'Please check your email for the verification code.');
        setIsVerifying(true);
      } else if (data.status === 'success') {
        // Fallback if verification is disabled on server
        addAlert('success', `Welcome back, ${data.admin.name.split(' ')[0]}!`, "Access granted.");
        setTimeout(() => onLogin(data.admin), 600);
      } else {
        if (data.message.toLowerCase().includes('email')) {
          addAlert('error', 'Account Not Found', "We couldn't find an admin with that email.");
        } else if (data.message.toLowerCase().includes('password')) {
          addAlert('error', 'Access Denied', "Incorrect password. Please try again.");
        } else {
          addAlert('error', 'Login Failed', data.message);
        }
      }
    } catch (err) {
      addAlert('error', 'Connection Error', "We can't reach the server. Is it running?");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Code Verification
  const handleVerify = async (e) => {
    e.preventDefault();

    if (verificationCode.length !== 6) {
      addAlert('warning', 'Invalid Code', 'Please enter the 6-digit code sent to your email.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: verificationCode }),
      });

      const data = await res.json();

      if (data.status === 'success') {
        addAlert('success', `Verified! 🔐`, `Welcome back to Shofyra, ${data.admin.name.split(' ')[0]}!`);
        setTimeout(() => onLogin(data.admin), 600);
      } else {
        addAlert('error', 'Verification Failed', data.message || 'Invalid code.');
      }
    } catch (err) {
      addAlert('error', 'Connection Error', "Failed to verify the code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-surface-100 dark:bg-black p-4 relative overflow-hidden transition-colors duration-500">
      {/* Decorative background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-400/20 rounded-full blur-[120px] dark:bg-sky-500/10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] dark:bg-blue-700/10" />
      <div className="absolute top-[50%] left-[50%] w-[30%] h-[30%] bg-violet-500/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />

      <div className="w-full max-w-md z-10 fade-in">
        <div className="glass shadow-2xl rounded-3xl p-8 md:p-10 transition-colors duration-300">

          {!isVerifying ? (
            <>
              {/* Step 1: Sign In Header */}
              <div className="flex flex-col items-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-tr from-sky-500 via-blue-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-2xl mb-5 ring-4 ring-sky-400/20 text-white">
                  <MdAdminPanelSettings size={40} />
                </div>
                <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1 transition-colors">
                  Shofyra Admin
                </h1>
                <p className="text-surface-800/60 dark:text-slate-400 font-medium text-center transition-colors text-sm">
                  Sign in to manage your store
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-surface-800 dark:text-slate-300 mb-2 ml-1 transition-colors">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-surface-800/40 dark:text-slate-500 group-focus-within:text-sky-500 transition-colors">
                      <MdEmail size={20} />
                    </div>
                    <input
                      type="email"
                      className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-surface-900/50 border border-surface-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-surface-900 dark:text-white placeholder:text-surface-800/30"
                      placeholder="admin@shofyra.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-2 ml-1">
                    <label className="text-sm font-semibold text-surface-800 dark:text-slate-300 transition-colors">
                      Password
                    </label>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-surface-800/40 dark:text-slate-500 group-focus-within:text-sky-500 transition-colors">
                      <MdLock size={20} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full pl-11 pr-12 py-3.5 bg-white dark:bg-surface-900/50 border border-surface-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-surface-900 dark:text-white placeholder:text-surface-800/30"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-surface-800/30 dark:text-slate-600 hover:text-surface-800/60 dark:hover:text-slate-400 transition-colors"
                    >
                      {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-sky-500 via-blue-600 to-violet-600 hover:from-sky-600 hover:to-violet-700 text-white font-bold rounded-xl shadow-lg shadow-sky-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <MdLogin size={20} />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Step 2: Verification Header */}
              <div className="flex flex-col items-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-2xl mb-5 ring-4 ring-emerald-400/20 text-white">
                  <MdVerifiedUser size={40} />
                </div>
                <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1 transition-colors text-center">
                  Verify Your Identity
                </h1>
                <p className="text-surface-800/60 dark:text-slate-400 font-medium text-center transition-colors text-sm px-4">
                  We've sent a 6-digit code to <span className="text-sky-500 font-bold">{email}</span>
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-surface-800 dark:text-slate-300 mb-3 text-center transition-colors">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    className="w-full text-center text-3xl tracking-[1rem] font-mono py-4 bg-white dark:bg-surface-900/50 border-2 border-surface-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-surface-900 dark:text-white"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Verify Code
                      <MdVerifiedUser size={20} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsVerifying(false)}
                  className="w-full flex items-center justify-center gap-2 text-surface-800/50 dark:text-slate-500 hover:text-sky-500 dark:hover:text-sky-400 transition-colors font-medium text-sm"
                >
                  <MdArrowBack size={18} />
                  Back to Sign In
                </button>
              </form>
            </>
          )}

          <footer className="mt-8 pt-6 border-t border-surface-200/50 dark:border-slate-700/50 text-center transition-colors">
            <p className="text-sm text-surface-800/50 dark:text-slate-500 font-medium">
              © 2026 Shofyra Admin Panel. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
