import React, { useState } from 'react';
import { Bell, User, LogOut, Settings as SettingsIcon, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  
  // State to manage opening/closing the dropdown menus
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Dynamically fetch the user details from local storage!
  const userName = localStorage.getItem('name') || 'Citizen User';
  const userEmail = localStorage.getItem('email') || '';
  
  // Gets the role and removes the "ROLE_" prefix so it just says "CITIZEN"
  const rawRole = localStorage.getItem('role') || 'ROLE_CITIZEN';
  const displayRole = rawRole.replace('ROLE_', '');

  const handleLogout = () => {
    // Clear the stored data and kick the user back to the login page
    localStorage.clear();
    navigate('/login');
  };

  return (
    <header className="bg-white h-[72px] border-b border-gray-100 flex items-center justify-between px-6 z-20 sticky top-0 shadow-sm">
      
      {/* Left side: Search Bar */}
      <div className="flex-1 max-w-md relative hidden md:block">
        <input 
          type="text" 
          placeholder="Search portal..." 
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-[#00AEEF] focus:bg-white text-sm transition-all"
        />
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>

      {/* Right side: Actions & Profile */}
      <div className="flex items-center gap-4 relative ml-auto">
        
        {/* Notifications Button */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false); // Close other menu
            }}
            className="p-2 text-gray-400 hover:text-[#00AEEF] hover:bg-blue-50 rounded-full transition-all relative"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute top-12 right-0 w-72 bg-white border border-gray-100 shadow-xl rounded-2xl p-4 text-sm z-50 animate-in fade-in slide-in-from-top-2">
              <p className="font-black text-[#1e293b] mb-3 pb-2 border-b border-gray-100 uppercase tracking-wider text-xs">Notifications</p>
              <div className="space-y-3">
                <p className="text-gray-500 text-xs flex items-start gap-2">
                  <span className="w-2 h-2 mt-1 bg-[#00AEEF] rounded-full flex-shrink-0"></span>
                  Welcome to CivicPulse! Your account is now active.
                </p>
                <button className="w-full text-center text-[10px] font-bold text-[#00AEEF] uppercase tracking-widest hover:underline pt-2">
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-8 bg-gray-200 hidden md:block"></div>

        {/* Profile Section */}
        <div className="relative">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded-xl transition-all" 
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false); // Close other menu
            }}
          >
            <div className="text-right hidden md:block">
              <p className="text-xs font-black text-[#1e293b] uppercase tracking-wider">{userName}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{displayRole}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#00AEEF]/10 text-[#00AEEF] flex items-center justify-center border border-[#00AEEF]/20">
              <User size={18} />
            </div>
          </div>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute top-14 right-0 w-56 bg-white border border-gray-100 shadow-xl rounded-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-gray-50 mb-1">
                <p className="text-sm font-black text-[#1e293b] truncate capitalize">{userName}</p>
                <p className="text-[10px] font-bold text-gray-400 truncate uppercase tracking-widest mt-0.5">{userEmail}</p>
              </div>
              
              <button 
                onClick={() => { setShowProfileMenu(false); navigate('/citizen/settings'); }} 
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-[#00AEEF] flex items-center gap-3 transition-colors"
              >
                <SettingsIcon size={16} /> Account Settings
              </button>
              
              <div className="h-px bg-gray-50 my-1"></div>
              
              <button 
                onClick={handleLogout} 
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;