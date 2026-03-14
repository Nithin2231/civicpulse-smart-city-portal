import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Briefcase, CheckCircle, Clock, Filter } from 'lucide-react';
import API from '../../services/api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const DEPARTMENTS = [
  "ALL DEPARTMENTS",
  "WATER BOARD",
  "ELECTRICITY BOARD",
  "MUNICIPAL CORPORATION",
  "PUBLIC WORKS",
  "SANITATION"
];

const OfficerAnalytics = () => {
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState('ALL DEPARTMENTS');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedDept]);

  const fetchAnalytics = async () => {
    try {
      let response;
      // If "ALL" is selected, fetch from the general status endpoint
      if (selectedDept === 'ALL DEPARTMENTS') {
        response = await API.get('/grievances/analytics/status');
      } else {
        // Otherwise, fetch for the specific department
        response = await API.get(`/grievances/analytics/department/${selectedDept}`);
      }
      setDepartmentData(response.data);
    } catch (error) {
      console.error("Failed to load analytics", error);
      setDepartmentData([]); // Clear data on error
    }
  };

  // Calculate Totals safely
  const totalTickets = departmentData.reduce((sum, item) => sum + item.value, 0);
  const resolvedTickets = departmentData.find(d => d.label === 'RESOLVED')?.value || 0;
  const pendingTickets = totalTickets - resolvedTickets;

  // Doughnut Chart (Completion Rate)
  const chartData = {
    labels: departmentData.map(d => d.label),
    datasets: [
      {
        data: departmentData.map(d => d.value),
        backgroundColor: departmentData.map(d => 
          d.label === 'RESOLVED' ? '#4ade80' : 
          d.label === 'IN PROGRESS' ? '#60a5fa' : '#fb923c'
        ),
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto font-sans space-y-6">
      
      {/* Header with Dropdown Filter */}
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
            className="bg-transparent text-sm font-bold text-[#1e293b] focus:outline-none cursor-pointer py-1 pr-2"
          >
            {DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><Briefcase size={24} /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Assigned</p>
            <h3 className="text-2xl font-black text-[#1e293b]">{totalTickets}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-xl text-green-600"><CheckCircle size={24} /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resolved</p>
            <h3 className="text-2xl font-black text-green-600">{resolvedTickets}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-xl text-orange-600"><Clock size={24} /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pending / Active</p>
            <h3 className="text-2xl font-black text-orange-600">{pendingTickets}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Doughnut Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest mb-6 w-full border-b border-gray-100 pb-3">
            Workload Status
          </h2>
          {totalTickets > 0 ? (
            <div className="w-64 h-64 relative">
              <Doughnut data={chartData} options={{ maintainAspectRatio: false }} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400 font-bold text-sm">No data available</div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest mb-6 border-b border-gray-100 pb-3">
            Resolution Breakdown
          </h2>
          {totalTickets > 0 ? (
            <div className="h-64">
              <Bar 
                data={chartData} 
                options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} 
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400 font-bold text-sm">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfficerAnalytics;