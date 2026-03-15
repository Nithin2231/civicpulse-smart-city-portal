import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AIChatbot from '../chatbot/AIChatbot'; // <-- Import the new chatbot

const DashboardLayout = () => {
  return (
    <div className="flex bg-[#f8fafc] min-h-screen">
      {/* Sidebar stays fixed on the left */}
      <Sidebar />
      
      {/* Main content area takes up the rest of the space */}
      <div className="flex-1 ml-64 p-8 overflow-y-auto">
        <Outlet /> 
      </div>

      {/* Render the floating chatbot here so it's on every page! */}
      <AIChatbot />
    </div>
  );
};

export default DashboardLayout;