import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, FileText, Settings, LogOut, ShieldAlert, Star, BarChart } from 'lucide-react'; // <--- NEW: BarChart imported here

const Sidebar = () => {
  const navigate = useNavigate();
  
  // Separate the roles so we can show different menus to different users
  const role = localStorage.getItem('role') || 'ROLE_CITIZEN';
  const isAdmin = role === 'ROLE_ADMIN';
  const isOfficer = role === 'ROLE_OFFICER';
  const isCitizen = role === 'ROLE_CITIZEN' || (!isAdmin && !isOfficer); // Default to citizen

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Helper function to style the active links
  const linkStyles = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
      isActive 
        ? 'bg-[#00AEEF] text-white shadow-md' 
        : 'text-gray-400 hover:text-white hover:bg-[#1e293b]'
    }`;

  return (
    <div className="w-64 bg-[#0f172a] h-screen fixed left-0 top-0 flex flex-col shadow-2xl z-50">
      
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="bg-[#00AEEF] p-2 rounded-lg">
          <ShieldAlert className="text-white" size={24} />
        </div>
        <h1 className="text-xl font-black text-white tracking-widest">
          CIVIC<span className="text-[#00AEEF]">PULSE</span>
        </h1>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        
        {/* Dynamic Menu Title */}
        <p className="px-4 text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">
          {isAdmin ? 'ADMIN MENU' : isOfficer ? 'OFFICER MENU' : 'CITIZEN MENU'}
        </p>

        {/* === ADMIN LINKS === */}
        {isAdmin && (
          <>
            <NavLink to="/admin/dashboard" className={linkStyles}>
              <LayoutDashboard size={20} /> Dashboard
            </NavLink>
            <NavLink to="/admin/feedback" className={linkStyles}>
              <Star size={20} /> Citizen Feedback
            </NavLink>
            <NavLink to="/admin/analytics" className={linkStyles}>
              <BarChart size={20} /> Analytics & Reports
            </NavLink>
          </>
        )}

        {/* === OFFICER LINKS === */}
        {isOfficer && (
          <>
            <NavLink to="/officer/dashboard" className={linkStyles}>
              <FileText size={20} /> Assigned to Me
            </NavLink>
            <NavLink to="/officer/analytics" className={linkStyles}>
              <BarChart size={20} /> Analytics & Reports
            </NavLink>
          </>
        )}

        {/* === CITIZEN LINKS === */}
        {isCitizen && (
          <>
            <NavLink to="/citizen/dashboard" className={linkStyles}>
              <LayoutDashboard size={20} /> Dashboard
            </NavLink>
            <NavLink to="/citizen/submit-complaint" className={linkStyles}>
              <PlusCircle size={20} /> Report Issue
            </NavLink>
            <NavLink to="/citizen/my-complaints" className={linkStyles}>
              <FileText size={20} /> My Complaints
            </NavLink>
          </>
        )}

        {/* === SHARED SETTINGS LINK === */}
        <NavLink 
          to={isAdmin ? "/admin/settings" : isOfficer ? "/officer/settings" : "/citizen/settings"} 
          className={linkStyles}
        >
          <Settings size={20} /> Settings
        </NavLink>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-800">
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold text-sm text-red-400 hover:bg-red-400/10 transition-all"
        >
          <LogOut size={20} /> Sign Out
        </button>
      </div>

    </div>
  );
};

export default Sidebar;