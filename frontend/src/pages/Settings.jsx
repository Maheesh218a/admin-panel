import React, { useState } from 'react'
import { MdPerson, MdSecurity, MdLogout, MdEmail, MdPhone, MdLock, MdCheckCircle, MdArrowForward, MdInfoOutline } from 'react-icons/md'
import { FormField, inputClass, Btn } from '../components/UI'
import Modal from '../components/Modal'

export default function Settings({ admin, onLogout, addAlert }) {
  const [profile, setProfile] = useState({
    name: admin?.name || '',
    email: admin?.email || '',
    phone: admin?.phone || ''
  })
  const [isLoading, setIsLoading] = useState(false)

  // Password state
  const [passModal, setPassModal] = useState(null) // null | 'current' | 'otp'
  const [passForm, setPassForm] = useState({
    current: '',
    otp: '',
    newPass: '',
    confirmPass: ''
  })

  const f = (k, v) => setProfile(prev => ({ ...prev, [k]: v }))
  const pf = (k, v) => setPassForm(prev => ({ ...prev, [k]: v }))

  // 1. Profile Update
  const updateProfile = async () => {
    // Name validation (Characters only)
    if (!/^[A-Za-z\s]+$/.test(profile.name)) {
      addAlert?.('warning', 'Invalid Name', 'Your name should only contains letters.');
      return;
    }

    // Sri Lanka Phone validation
    const slPhoneRegex = /^(?:\+94|0)?7[0-9]{8}$/;
    if (profile.phone && !slPhoneRegex.test(profile.phone)) {
      addAlert?.('warning', 'Phone Format', 'Please enter a valid Sri Lankan mobile number (e.g. 07XXXXXXXX).');
      return;
    }

    setIsLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        addAlert?.('success', 'Profile Updated', 'Your contact details have been saved successfully.');
      } else {
        addAlert?.('error', 'Update Failed', 'An error occurred while saving your profile.');
      }
    } catch (err) {
      addAlert?.('error', 'Network Error', 'Could not reach the security server.');
    } finally {
      setIsLoading(false)
    }
  }

  // 2. Change Password Flow - Step 1: Verify Current Password
  const verifyCurrentPass = async () => {
    if (!passForm.current) return;
    setIsLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-current-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: admin.email, password: passForm.current }),
      });
      const data = await res.json();
      if (res.ok) {
        addAlert?.('info', 'Security Code Sent', 'A verification code has been sent to your registered email.');
        setPassModal('otp');
      } else {
        addAlert?.('error', 'Verification Failed', data.message || 'Incorrect current password.');
      }
    } catch (err) {
      addAlert?.('error', 'Error', 'Failed to initiate security check.');
    } finally {
      setIsLoading(false)
    }
  }

  // 2. Change Password Flow - Step 2: Final Verify & Update
  const finalizeChangePass = async () => {
    // Strength validation: Capital, simple, number, special char
    const strengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strengthRegex.test(passForm.newPass)) {
      addAlert?.('error', 'Weak Password', 'New password must have a Capital letter, small letter, number, and special character (@$!%*?&).');
      return;
    }

    if (passForm.newPass !== passForm.confirmPass) {
      addAlert?.('warning', 'Mismatch', 'Confirmation password does not match.');
      return;
    }

    if (!passForm.otp) {
      addAlert?.('warning', 'Missing Code', 'Please enter the 6-digit code sent to your email.');
      return;
    }

    setIsLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: admin.email, code: passForm.otp, newPassword: passForm.newPass }),
      });
      const data = await res.json();
      if (res.ok) {
        addAlert?.('success', 'Security Updated', 'Your admin password has been changed successfully.');
        setPassModal(null);
        setPassForm({ current: '', otp: '', newPass: '', confirmPass: '' });
      } else {
        addAlert?.('error', 'Change Failed', data.message || 'Invalid verification code.');
      }
    } catch (err) {
      addAlert?.('error', 'Error', 'Connection failed during security update.');
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8 fade-in transition-colors duration-300">
      
      {/* Profile Section */}
      <section className="bg-white dark:bg-black rounded-3xl border dark:border-white/5 shadow-card dark:shadow-none overflow-hidden transition-all duration-300">
        <div className="px-8 py-6 border-b dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex items-center gap-3">
          <div className="p-2.5 bg-sky-500/10 rounded-xl text-sky-500">
            <MdPerson size={22} />
          </div>
          <div>
            <h3 className="font-display font-700 text-slate-800 dark:text-white transition-colors">Admin Profile</h3>
            <p className="text-xs text-slate-400">Update your basic contact information.</p>
          </div>
        </div>
        <div className="p-8 space-y-5">
          <div className="grid md:grid-cols-2 gap-6">
            <FormField label="Full Name" required>
              <div className="relative">
                <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className={`${inputClass} pl-10`} value={profile.name} onChange={e => f('name', e.target.value)} />
              </div>
            </FormField>
            <FormField label="Email Address (Locked)">
              <div className="relative opacity-60">
                <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className={`${inputClass} pl-10 bg-slate-50 dark:bg-white/5 cursor-not-allowed`} value={profile.email} disabled />
              </div>
            </FormField>
          </div>
          <FormField label="Mobile Number" required>
            <div className="relative">
              <MdPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className={`${inputClass} pl-10`} value={profile.phone} onChange={e => f('phone', e.target.value)} placeholder="07XXXXXXXX" />
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-500">Format: +947XXXXXXXX or 07XXXXXXXX</p>
          </FormField>
          <div className="pt-4 flex justify-end">
            <Btn onClick={updateProfile} disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Profile Changes'}</Btn>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="bg-white dark:bg-black rounded-3xl border dark:border-white/5 shadow-card dark:shadow-none overflow-hidden transition-all duration-300">
        <div className="px-8 py-6 border-b dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-500">
            <MdSecurity size={22} />
          </div>
          <div>
            <h3 className="font-display font-700 text-slate-800 dark:text-white transition-colors">Security & Access</h3>
            <p className="text-xs text-slate-400">Manage your password and authentication settings.</p>
          </div>
        </div>
        <div className="p-8">
          <div className="flex items-center justify-between gap-4 p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border dark:border-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white dark:bg-black rounded-xl shadow-sm flex items-center justify-center text-slate-400">
                <MdLock size={20} />
              </div>
              <div>
                <p className="font-600 text-slate-700 dark:text-slate-200">Account Password</p>
                <p className="text-xs text-slate-400">Secure your admin account with a strong password.</p>
              </div>
            </div>
            <Btn variant="secondary" onClick={() => setPassModal('current')}>Change Password</Btn>
          </div>
        </div>
      </section>

      {/* Session Section */}
      <section className="bg-white dark:bg-black rounded-3xl border dark:border-white/5 shadow-card dark:shadow-none overflow-hidden transition-all duration-300">
        <div className="p-8 flex items-center justify-between bg-rose-50/50 dark:bg-rose-500/5 transition-colors">
          <div>
            <p className="font-700 text-slate-800 dark:text-white">Admin Logout</p>
            <p className="text-sm text-slate-400">End your current session safely.</p>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-2xl font-600 hover:bg-rose-600 active:scale-95 transition-all shadow-lg shadow-rose-500/20"
          >
            <MdLogout size={18} />
            Logout Now
          </button>
        </div>
      </section>

      {/* Current Pass Modal */}
      <Modal open={passModal === 'current'} onClose={() => setPassModal(null)} title="Security Verification" width="max-w-md">
        <div className="p-8 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-sky-500/10 text-sky-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdLock size={32} />
            </div>
            <h4 className="font-700 text-slate-800 dark:text-white">Verify Identity</h4>
            <p className="text-sm text-slate-400 mt-1">Please enter your current password to proceed with the security update.</p>
          </div>
          <FormField label="Current Password">
            <input className={inputClass} type="password" value={passForm.current} onChange={e => pf('current', e.target.value)} placeholder="••••••••" />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Btn variant="secondary" onClick={() => setPassModal(null)}>Cancel</Btn>
            <Btn onClick={verifyCurrentPass} disabled={isLoading}>{isLoading ? 'Verifying...' : 'Next Step'}</Btn>
          </div>
        </div>
      </Modal>

      {/* OTP & New Pass Modal */}
      <Modal open={passModal === 'otp'} onClose={() => setPassModal(null)} title="Set New Security" width="max-w-xl">
        <div className="p-8 space-y-6">
          <div className="bg-sky-50 dark:bg-sky-500/5 p-4 rounded-2xl border border-sky-100 dark:border-sky-500/10 flex items-start gap-3">
            <MdEmail className="text-sky-500 mt-1 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm font-600 text-sky-700 dark:text-sky-400">One-Time Password Sent</p>
              <p className="text-xs text-sky-600 dark:text-sky-500/80">We've sent a 6-digit code to {admin.email}. Please verify it below to complete the change.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <FormField label="Security Code (OTP)" required>
              <input className={`${inputClass} tracking-[0.5em] text-center font-700 text-lg`} maxLength={6} value={passForm.otp} onChange={e => pf('otp', e.target.value)} placeholder="000000" />
            </FormField>
            <div className="flex flex-col justify-end pb-3 space-y-1">
               <div className={`flex items-center gap-1.5 text-[10px] font-600 ${/^(?=.*[a-z])(?=.*[A-Z])/.test(passForm.newPass) ? 'text-emerald-500' : 'text-slate-400'}`}>
                 {/^(?=.*[a-z])(?=.*[A-Z])/.test(passForm.newPass) ? <MdCheckCircle /> : <div className="w-2.5 h-2.5 rounded-full border-2 border-slate-200" />} Case (Aa)
               </div>
               <div className={`flex items-center gap-1.5 text-[10px] font-600 ${/\d/.test(passForm.newPass) ? 'text-emerald-500' : 'text-slate-400'}`}>
                 {/\d/.test(passForm.newPass) ? <MdCheckCircle /> : <div className="w-2.5 h-2.5 rounded-full border-2 border-slate-200" />} Numbers (123)
               </div>
               <div className={`flex items-center gap-1.5 text-[10px] font-600 ${/[@$!%*?&]/.test(passForm.newPass) ? 'text-emerald-500' : 'text-slate-400'}`}>
                 {/[@$!%*?&]/.test(passForm.newPass) ? <MdCheckCircle /> : <div className="w-2.5 h-2.5 rounded-full border-2 border-slate-200" />} Symbol (#@!)
               </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-2">
            <FormField label="New Password" required>
              <input className={inputClass} type="password" value={passForm.newPass} onChange={e => pf('newPass', e.target.value)} placeholder="Minimum 8 chars" />
            </FormField>
            <FormField label="Confirm Password" required>
              <input className={inputClass} type="password" value={passForm.confirmPass} onChange={e => pf('confirmPass', e.target.value)} placeholder="Retype password" />
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t dark:border-white/5">
            <Btn variant="secondary" onClick={() => setPassModal('current')}>Back</Btn>
            <Btn onClick={finalizeChangePass} disabled={isLoading}>{isLoading ? 'Updating...' : 'Update Password Now'}</Btn>
          </div>
        </div>
      </Modal>

    </div>
  )
}
