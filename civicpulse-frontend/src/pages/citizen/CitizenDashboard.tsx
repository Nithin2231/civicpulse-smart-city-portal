import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import API from '../../services/api';

const CitizenDashboard = () => {
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, inProgress: 0 });
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Get the user's name and email from localStorage
  const userEmail = localStorage.getItem('email') || '';
  const userName = localStorage.getItem('name') || 'Citizen';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    if (!userEmail) {
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch complaints for this specific user from Spring Boot
      const response = await API.get(`/grievances/my?username=${userEmail}`);
      const complaints = response.data;

      // 2. Calculate the statistics dynamically
      let pendingCount = 0;
      let resolvedCount = 0;
      let inProgressCount = 0;

      complaints.forEach((c: any) => {
        const status = c.status ? c.status.toUpperCase() : 'PENDING';
        if (status === 'PENDING') pendingCount++;
        else if (status === 'RESOLVED') resolvedCount++;
        else inProgressCount++; // For "FORWARDED" or "IN PROGRESS"
      });

      setStats({
        total: complaints.length,
        pending: pendingCount,
        resolved: resolvedCount,
        inProgress: inProgressCount
      });

      // 3. Grab only the 3 most recent complaints to show in the preview list
      const sortedComplaints = complaints.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRecentComplaints(sortedComplaints.slice(0, 3));

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status ? status.toUpperCase() : 'PENDING';
    if (s === 'RESOLVED') return 'text-green-600 bg-green-50 border-green-200';
    if (s === 'PENDING') return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  return (
    <div className="p-4 md:p-6 font-sans max-w-6xl mx-auto space-y-6">
      
      {/* Welcome Header */}
      <div className="bg-[#1e293b] rounded-2xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-1">
            Welcome back, <span className="text-[#00AEEF]">{userName}</span>!
          </h1>
          <p className="text-gray-400 text-sm">Here is the latest overview of your submitted grievances.</p>
        </div>
        <Link 
          to="/citizen/submit-complaint" 
          className="bg-[#00AEEF] hover:bg-[#0081C9] text-white px-6 py-3 rounded-xl font-bold text-sm tracking-wider uppercase transition-all shadow-md active:scale-95 whitespace-nowrap"
        >
          + New Grievance
        </Link>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 font-bold mt-10">Loading your dashboard...</p>
      ) : (
        <>
          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-4 bg-gray-50 rounded-xl text-gray-600"><FileText size={24} /></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</p>
                <p className="text-2xl font-black text-[#1e293b]">{stats.total}</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-4 bg-orange-50 rounded-xl text-orange-500"><Clock size={24} /></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pending</p>
                <p className="text-2xl font-black text-[#1e293b]">{stats.pending}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-4 bg-blue-50 rounded-xl text-blue-500"><AlertCircle size={24} /></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">In Progress</p>
                <p className="text-2xl font-black text-[#1e293b]">{stats.inProgress}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-4 bg-green-50 rounded-xl text-green-500"><CheckCircle size={24} /></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resolved</p>
                <p className="text-2xl font-black text-[#1e293b]">{stats.resolved}</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-[#1e293b] uppercase tracking-wide text-sm">Recent Grievances</h3>
              <Link to="/citizen/my-complaints" className="text-[10px] font-bold text-[#00AEEF] hover:underline uppercase tracking-widest flex items-center gap-1">
                View All <ArrowRight size={12} />
              </Link>
            </div>
            
            <div className="p-5">
              {recentComplaints.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No recent grievances found.</p>
              ) : (
                <div className="space-y-4">
                  {recentComplaints.map((complaint) => (
                    <div key={complaint.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all bg-white">
                      <div>
                        <p className="font-bold text-[#1e293b] text-sm">{complaint.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{complaint.category} • {new Date(complaint.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(complaint.status)}`}>
                        {complaint.status || 'PENDING'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CitizenDashboard;