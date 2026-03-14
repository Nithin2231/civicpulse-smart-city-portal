import React, { useEffect, useState } from 'react';
import { Search, MapPin, Calendar, ArrowRight, Image as ImageIcon } from 'lucide-react';
import API from '../../services/api';
import { useNavigate } from 'react-router-dom';

// --- ADDED: Import your Feedback Component ---
import SubmitFeedback from './SubmitFeedback'; 

const getStatusChip = (status: string) => {
  const upperStatus = status ? status.toUpperCase() : 'PENDING';
  switch (upperStatus) {
    case 'RESOLVED':
      return <span className="px-3 py-1 bg-green-100 text-green-700 font-black text-[10px] uppercase tracking-wider rounded-full border border-green-200">Resolved</span>;
    case 'IN PROGRESS':
    case 'FORWARDED':
      return <span className="px-3 py-1 bg-blue-100 text-blue-700 font-black text-[10px] uppercase tracking-wider rounded-full border border-blue-200">{upperStatus}</span>;
    case 'CANCELLED': 
      return <span className="px-3 py-1 bg-red-100 text-red-700 font-black text-[10px] uppercase tracking-wider rounded-full border border-red-200">Cancelled</span>;
    case 'PENDING':
    default:
      return <span className="px-3 py-1 bg-orange-100 text-orange-700 font-black text-[10px] uppercase tracking-wider rounded-full border border-orange-200">Pending</span>;
  }
};

const MyComplaints = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); 
  
  // --- ADDED: State to control when the Feedback Modal is open ---
  const [feedbackModalId, setFeedbackModalId] = useState<number | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  const fetchMyComplaints = async () => {
    try {
      const username = localStorage.getItem('email') || '';
      const response = await API.get(`/grievances/my?username=${username}`);
      setComplaints(response.data);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = complaints.filter(c => 
    (c.title && c.title.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (c.id && c.id.toString().includes(searchTerm))
  );

  return (
    <div className="p-4 md:p-6 font-sans max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1e293b] tracking-tight uppercase">My Complaints</h1>
          <p className="text-gray-500 mt-1 text-sm">Track the real-time status of your reported issues.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <input 
            type="text" 
            placeholder="Search complaint..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full p-2.5 pl-10 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#00AEEF] text-sm transition-all shadow-sm"
          />
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 font-bold mt-10">Loading your grievances...</p>
      ) : filteredComplaints.length === 0 ? (
        <p className="text-center text-gray-500 font-bold mt-10">No complaints found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredComplaints.map((complaint) => (
            <div key={complaint.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-all gap-4">
              
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 flex-1">
                
                <div className="w-full md:w-24 h-24 bg-gray-100 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                  {complaint.imagePath ? (
                    <img 
                      src={`http://localhost:8080/uploads/${encodeURIComponent(complaint.imagePath)}`} 
                      alt="Evidence" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImageIcon size={24} />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-[10px] font-black text-[#00AEEF] tracking-widest uppercase">CP-{complaint.id}</p>
                    {getStatusChip(complaint.status)}
                  </div>
                  <h3 className="text-base font-bold text-[#1e293b] mb-1">{complaint.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-500 text-[11px] font-medium">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(complaint.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} /> {complaint.location}</span>
                  </div>
                </div>
              </div>

              {/* --- ADDED: Action Buttons Area --- */}
              <div className="flex items-center justify-end gap-3">
                
                {/* 1. Only show "Rate" button if status is RESOLVED */}
                {complaint.status?.toUpperCase() === 'RESOLVED' && (
                  <button 
                    onClick={() => setFeedbackModalId(complaint.id)}
                    className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-sm active:scale-95"
                  >
                    ⭐ Rate
                  </button>
                )}

                {/* 2. Original Navigate Button */}
                <button 
                  onClick={() => navigate(`/citizen/complaint/${complaint.id}`)}
                  className="p-3 bg-gray-50 rounded-xl hover:bg-[#00AEEF] hover:text-white transition-all text-gray-400 group flex-shrink-0"
                >
                  <ArrowRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* --- ADDED: THE FEEDBACK MODAL OVERLAY --- */}
      {/* This invisible container only appears when you click a rate button */}
      {feedbackModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e293b]/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg">
            
            {/* Close Button */}
            <button 
              onClick={() => setFeedbackModalId(null)}
              className="absolute -top-10 right-0 text-white font-bold hover:text-gray-300 transition-colors uppercase tracking-widest text-sm flex items-center gap-1"
            >
              Close ✕
            </button>
            
            {/* The Form Component */}
            <SubmitFeedback 
              complaintId={feedbackModalId} 
              onSuccess={() => setFeedbackModalId(null)} 
            />
            
          </div>
        </div>
      )}

    </div>
  );
};

export default MyComplaints;