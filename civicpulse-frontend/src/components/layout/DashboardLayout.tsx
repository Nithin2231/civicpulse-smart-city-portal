import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = () => {
  return (
  <div className="flex h-screen bg-gray-50">
    {/* Fixed Sidebar */}
    <div className="w-64 flex-shrink-0">
      <Sidebar />
    </div>

    {/* Scrollable Main Content */}
    <div className="flex-1 overflow-y-auto">
      <Navbar /> {/* Your Top Navbar */}
      <main className="p-4 md:p-8">
        <Outlet /> {/* This renders your pages like Dashboard or Settings */}
      </main>
    </div>
  </div>
);
  
};

export default DashboardLayout;