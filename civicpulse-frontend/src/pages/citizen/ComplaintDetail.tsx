import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Tag, FileText, CheckCircle, Clock, Send, AlertTriangle, XCircle } from 'lucide-react';
import API from '../../services/api';

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  const fetchComplaintDetails = async () => {
    try {
      const userEmail = localStorage.getItem('email') || '';
      const response = await API.get(`/grievances/my?username=${userEmail}`);
      const foundComplaint = response.data.find((c: any) => c.id.toString() === id);
      
      if (foundComplaint) setComplaint(foundComplaint);
      else navigate('/citizen/my-complaints');
    } catch (error) {
      console.error("Error fetching details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-gray-500 animate-pulse uppercase tracking-widest">Loading Ticket Details...</div>;
  if (!complaint) return null;

  const getStatusBadge = (status: string) => {
    const s = status ? status.toUpperCase() : 'PENDING';
    if (s === 'RESOLVED') return <span className="flex items-center gap-1.5 px-4 py-1.5 bg-green-50 text-green-600 border border-green-200 rounded-full text-xs font-black uppercase tracking-widest"><CheckCircle size={14}/> RESOLVED</span>;
    if (s === 'FORWARDED') return <span className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-full text-xs font-black uppercase tracking-widest"><Send size={14}/> FORWARDED</span>;
    if (s === 'IN PROGRESS') return <span className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-50 text-purple-600 border border-purple-200 rounded-full text-xs font-black uppercase tracking-widest"><Clock size={14}/> IN PROGRESS</span>;
    if (s === 'CANCELLED') return <span className="flex items-center gap-1.5 px-4 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-black uppercase tracking-widest"><XCircle size={14}/> CANCELLED</span>;
    
    return <span className="flex items-center gap-1.5 px-4 py-1.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-full text-xs font-black uppercase tracking-widest"><Clock size={14}/> PENDING</span>;
  };

  return (
    <div className="p-4 md:p-6 font-sans max-w-4xl mx-auto space-y-6">
      
      <button onClick={() => navigate('/citizen/my-complaints')} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#00AEEF] transition-colors uppercase tracking-widest">
        <ArrowLeft size={16} /> Back to My Complaints
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-[#1e293b] p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-[#00AEEF] font-black text-xs uppercase tracking-widest mb-1">Ticket #CP-{complaint.id}</p>
            <h1 className="text-2xl font-black">{complaint.title}</h1>
          </div>
          <div>{getStatusBadge(complaint.status)}</div>
        </div>

        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-6">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1"><Tag size={12} /> Category</p>
              <p className="text-sm font-bold text-[#1e293b] bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 inline-block">{complaint.category || 'N/A'}</p>
            </div>

            <div>
              <p className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1"><Calendar size={12} /> Submitted On</p>
              <p className="text-sm font-bold text-[#1e293b]">{new Date(complaint.createdAt).toLocaleString()}</p>
            </div>

            <div>
              <p className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1"><MapPin size={12} /> Location</p>
              <p className="text-sm font-bold text-[#1e293b] leading-relaxed">{complaint.location}</p>
            </div>

            <div>
              <p className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1"><FileText size={12} /> Description</p>
              <p className="text-sm text-gray-600 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-50">{complaint.description}</p>
            </div>

            {/* Show Action Status OR Cancellation Reason */}
            {complaint.status === 'CANCELLED' ? (
              <div className="bg-red-50 rounded-2xl border border-red-200 p-5 mt-6">
                <h3 className="text-xs font-black text-red-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <AlertTriangle size={14} /> Ticket Cancelled
                </h3>
                <p className="text-sm font-bold text-red-900 leading-relaxed">
                  {complaint.cancellationReason || "This ticket was cancelled by the administrator."}
                </p>
              </div>
            ) : complaint.department ? (
              <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 mt-6">
                <h3 className="text-xs font-black text-[#1e293b] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-[#00AEEF]" /> Official Action Status
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Assigned Department</p>
                    <p className="text-sm font-black text-[#00AEEF] uppercase">{complaint.department}</p>
                  </div>
                  <div className="flex gap-6 pt-2 border-t border-gray-200">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Priority</p>
                      <p className={`text-xs font-bold ${complaint.priority === 'High' ? 'text-red-500' : 'text-gray-700'}`}>
                        {complaint.priority}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Expected Resolution</p>
                      <p className="text-xs font-bold text-gray-700">{complaint.deadline}</p>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-4 mt-6 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                <p className="text-xs font-bold text-gray-400">Waiting for Admin Assignment...</p>
              </div>
            )}
          </div>

          {/* Evidence Image Block */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 flex flex-col">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">Attached Geo-Tagged Evidence</p>
            <div className="w-full h-64 bg-white rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center">
              {complaint.imagePath ? (
                <img 
                  // Use encodeURIComponent to handle spaces in filenames
                  src={`http://localhost:8080/uploads/${encodeURIComponent(complaint.imagePath)}`} 
                  alt="Evidence" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/e2e8f0/64748b?text=Image+Load+Error';
                  }}
                />
              ) : (
                <p className="text-xs font-bold text-gray-400">No Image Uploaded</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;