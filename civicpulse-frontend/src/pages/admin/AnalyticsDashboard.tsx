import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { AlertTriangle, MapPin, BarChart3, PieChart } from 'lucide-react';
import API from '../../services/api';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AnalyticsDashboard = () => {
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [redZones, setRedZones] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [catRes, statRes, zoneRes] = await Promise.all([
        API.get('/grievances/analytics/category'),
        API.get('/grievances/analytics/status'),
        API.get('/grievances/analytics/zones')
      ]);
      setCategoryData(catRes.data);
      setStatusData(statRes.data);
      setRedZones(zoneRes.data);
    } catch (error) {
      console.error("Failed to load analytics", error);
    }
  };

  // 1. Pie Chart Config (Category Distribution)
  const pieChartData = {
    labels: categoryData.map(d => d.label),
    datasets: [
      {
        data: categoryData.map(d => d.value),
        backgroundColor: ['#00AEEF', '#FF6B6B', '#4ECDC4', '#FFE66D', '#1A535C', '#FF9F1C'],
        borderWidth: 0,
      },
    ],
  };

  // 2. Bar Chart Config (SLA / Status Performance)
  const barChartData = {
    labels: statusData.map(d => d.label),
    datasets: [
      {
        label: 'Number of Tickets',
        data: statusData.map(d => d.value),
        backgroundColor: statusData.map(d => 
          d.label === 'RESOLVED' ? '#4ade80' : 
          d.label === 'PENDING' ? '#fb923c' : '#60a5fa'
        ),
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto font-sans space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#1e293b] tracking-tight uppercase">Analytics & Reports</h1>
        <p className="text-sm text-gray-500 mt-1">System-wide performance, SLA tracking, and Red Zone mapping.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Category Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2 mb-6 w-full border-b border-gray-100 pb-3">
            <PieChart size={18} className="text-[#00AEEF]" /> Complaint Distribution
          </h2>
          <div className="w-64 h-64">
            <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        {/* SLA Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2 mb-6 border-b border-gray-100 pb-3">
            <BarChart3 size={18} className="text-[#00AEEF]" /> SLA Performance Tracking
          </h2>
          <div className="h-64">
            <Bar 
              data={barChartData} 
              options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} 
            />
          </div>
        </div>

      </div>

      {/* Red Zones Heatmap / List */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 mt-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>
        <h2 className="text-sm font-black text-red-600 uppercase tracking-widest flex items-center gap-2 mb-4 border-b border-red-50 pb-3">
          <AlertTriangle size={18} /> Red Zone Highlighting (Repeated Complaints)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {redZones.slice(0, 6).map((zone, index) => (
            <div key={index} className="flex items-start justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:border-red-200 transition-colors">
              <div className="flex gap-3">
                <MapPin size={20} className={index === 0 ? "text-red-500" : index === 1 ? "text-orange-500" : "text-gray-400"} />
                <div>
                  <p className="text-sm font-bold text-[#1e293b] line-clamp-2">{zone.location}</p>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center bg-white shadow-sm border border-gray-100 rounded-lg px-3 py-1 ml-2">
                <span className="text-lg font-black text-red-500">{zone.count}</span>
                <span className="text-[8px] uppercase font-bold text-gray-400">Issues</span>
              </div>
            </div>
          ))}
        </div>
        {redZones.length === 0 && <p className="text-sm text-gray-500">No red zones detected yet.</p>}
      </div>

    </div>
  );
};

export default AnalyticsDashboard;