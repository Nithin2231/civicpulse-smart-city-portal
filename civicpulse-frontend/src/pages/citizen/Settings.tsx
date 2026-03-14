import React, { useState } from 'react';
import { User, Lock, Mail, Shield } from 'lucide-react';

const Settings = () => {
  // Pull the actual logged-in user's details from local storage
  const userName = localStorage.getItem('name') || 'Citizen User';
  const userEmail = localStorage.getItem('email') || 'citizen@example.com';
  const userRole = localStorage.getItem('role')?.replace('ROLE_', '') || 'CITIZEN';
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    // This is where you would call your Spring Boot update password API
    alert("Password updated successfully! (UI Only for now)");
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="p-4 md:p-6 font-sans max-w-5xl mx-auto space-y-6">
      
      <div>
        <h1 className="text-2xl font-black text-[#1e293b] tracking-tight uppercase">Account Settings</h1>
        <p className="text-gray-500 mt-1 text-sm">Manage your personal information and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Details Section */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-[#00AEEF]/10 text-[#00AEEF] flex items-center justify-center border-4 border-white shadow-md mb-4">
              <User size={40} />
            </div>
            <h2 className="text-xl font-black text-[#1e293b] capitalize">{userName}</h2>
            <p className="text-xs font-bold text-[#00AEEF] tracking-widest uppercase mt-1 bg-blue-50 px-3 py-1 rounded-full">{userRole}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Contact Info</h3>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-500"><Mail size={16} /></div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                <p className="text-sm font-bold text-[#1e293b] truncate">{userEmail}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-500"><Shield size={16} /></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account Status</p>
                <p className="text-sm font-bold text-green-600">Active & Verified</p>
              </div>
            </div>
          </div>
        </div>

        {/* Password Update Section */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-orange-50 text-orange-500 rounded-xl"><Lock size={20} /></div>
              <div>
                <h2 className="text-lg font-black text-[#1e293b] uppercase">Change Password</h2>
                <p className="text-xs text-gray-500">Ensure your account is using a long, random password to stay secure.</p>
              </div>
            </div>

            <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Current Password</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password" 
                  className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-[#00AEEF] text-sm transition-all" 
                  required 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password" 
                  className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-[#00AEEF] text-sm transition-all" 
                  required 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password" 
                  className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-[#00AEEF] text-sm transition-all" 
                  required 
                />
              </div>

              <button 
                type="submit" 
                className="mt-6 bg-[#1e293b] hover:bg-gray-800 text-white py-3 px-6 rounded-xl shadow-md transition-all active:scale-[0.98] text-xs font-bold uppercase tracking-widest"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;