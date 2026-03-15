import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Briefcase, CheckCircle, Clock, Filter, AlertTriangle } from 'lucide-react';
import API from '../../services/api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const DEPARTMENTS = [
  "ALL DEPARTMENTS",
  "WATER BOARD",
  "ELECTRICITY DEPT",
  "PUBLIC WORKS",
  "MUNICIPAL CORPORATION",
  "SANITATION"
];

const OfficerAnalytics = () => {
  const [allTickets, setAllTickets] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState('ALL DEPARTMENTS');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await API.get('/grievances/all');
      // THE FIX: Only keep tickets that have been officially assigned to a department
      const assigned = response.data.filter((g: any) => g.department && g.department.trim() !== '');
      setAllTickets(assigned);
    } catch (error) {
      console.error("Failed to load analytics", error);
    }
  };

  const departmentTickets = selectedDept === 'ALL DEPARTMENTS' 
    ? allTickets 
    : allTickets.filter(g => g.department?.toUpperCase() === selectedDept.toUpperCase());

  // Calculate Totals safely
  const totalTickets = departmentTickets.length;
  const resolvedTickets = departmentTickets.filter(t => t.status === 'RESOLVED').length;
  const cancelledTickets = departmentTickets.filter(t => t.status === 'CANCELLED').length;
  const pendingTickets = totalTickets - resolvedTickets - cancelledTickets; 

  // Group counts for charts
  const statusCounts = departmentTickets.reduce((acc, ticket) => {
    const status = ticket.status || 'UNKNOWN';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const labels = Object.keys(statusCounts);
  const dataValues = Object.values(statusCounts);

  const backgroundColors = labels.map(label => {
    if (label === 'RESOLVED') return '#4ade80'; // Green
    if (label === 'IN PROGRESS') return '#60a5fa'; // Blue
    if (label === 'FORWARDED') return '#fb923c'; // Orange
    if (label === 'CANCELLED') return '#f87171'; // Red
    return '#fb923c'; 
  });

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: backgroundColors,
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto font-sans space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#1e293b] tracking-tight uppercase">Department Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Performance metrics for <strong className="text-[#00AEEF]">{selectedDept}</strong>.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white border border-gray-200 p-1.5 rounded-xl shadow-sm">
          <Filter size={16} className="text-gray-400 ml-2" />
          <select 
            value={selectedDept} 
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-transparent text-sm font-bold text-[#1e293b] focus:outline-none cursor-pointer py-1 pr-2 appearance-none"
          >
            {DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
          <div className="flex items-center gap-3"><div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Briefcase size={20} /></div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Assigned</p></div>
          <h3 className="text-3xl font-black text-[#1e293b]">{totalTickets}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100 flex flex-col gap-2">
          <div className="flex items-center gap-3"><div className="bg-green-100 p-2 rounded-lg text-green-600"><CheckCircle size={20} /></div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resolved</p></div>
          <h3 className="text-3xl font-black text-green-600">{resolvedTickets}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 flex flex-col gap-2">
          <div className="flex items-center gap-3"><div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Clock size={20} /></div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active / Pending</p></div>
          <h3 className="text-3xl font-black text-orange-600">{pendingTickets}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 flex flex-col gap-2">
          <div className="flex items-center gap-3"><div className="bg-red-100 p-2 rounded-lg text-red-600"><AlertTriangle size={20} /></div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cancelled</p></div>
          <h3 className="text-3xl font-black text-red-600">{cancelledTickets}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest mb-6 w-full border-b border-gray-100 pb-3">Workload Status</h2>
          {totalTickets > 0 ? (
            <div className="w-64 h-64 relative"><Doughnut data={chartData} options={{ maintainAspectRatio: false }} /></div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400 font-bold text-sm uppercase tracking-widest">No data available</div>
          )}
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest mb-6 border-b border-gray-100 pb-3">Resolution Breakdown</h2>
          {totalTickets > 0 ? (
            <div className="h-64"><Bar data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} /></div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400 font-bold text-sm uppercase tracking-widest">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfficerAnalytics;