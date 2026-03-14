import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, CheckCircle, Clock, Image as ImageIcon, ShieldCheck, FileText } from 'lucide-react';
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
      const username = localStorage.getItem('email') || '';
      // Fetching all complaints for the user and finding the specific one
      const response = await API.get(`/grievances/my?username=${username}`);
      const foundComplaint = response.data.find((c: any) => c.id.toString() === id);
      
      setComplaint(foundComplaint);
    } catch (error) {
      console.error("Error fetching complaint details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-[#00AEEF]">
        <p className="font-bold uppercase tracking-widest text-sm animate-pulse">Loading Details...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="text-center mt-10">
        <p className="text-gray-500 font-bold">Complaint not found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-[#00AEEF] underline">Go Back</button>
      </div>
    );
  }

  const isResolved = complaint.status === 'RESOLVED';

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto font-sans space-y-6">
      
      {/* Header & Back Button */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/citizen/my-complaints')}
          className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-500"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-[#1e293b] tracking-tight uppercase">Complaint Details</h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2 font-bold tracking-widest uppercase text-[10px]">
            Ticket ID: <span className="text-[#00AEEF]">CP-{complaint.id}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Main Details */}
        <div className="md:col-span-2 space-y-6">
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-lg font-black text-[#1e293b] uppercase">{complaint.title}</h2>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 ${
                isResolved ? 'bg-green-100 text-green-700' : 
                complaint.status === 'IN PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {isResolved ? <CheckCircle size={14} /> : <Clock size={14} />}
                {complaint.status}
              </span>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed">{complaint.description}</p>

            <div className="flex flex-col gap-3 pt-2 text-xs text-gray-500 font-bold uppercase tracking-widest">
              <span className="flex items-center gap-2"><MapPin size={16} className="text-[#00AEEF]" /> {complaint.location}</span>
              <span className="flex items-center gap-2"><Calendar size={16} className="text-[#00AEEF]" /> Submitted: {new Date(complaint.createdAt).toLocaleDateString()}</span>
              {complaint.department && (
                <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#00AEEF]" /> Assigned To: {complaint.department}</span>
              )}
            </div>
          </div>

          {/* === NEW: OFFICER RESOLUTION BOX === */}
          {(complaint.resolutionNotes || complaint.resolvedImagePath) && (
            <div className="bg-green-50 rounded-2xl shadow-sm border border-green-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
              <h3 className="text-sm font-black text-green-800 uppercase tracking-widest flex items-center gap-2 border-b border-green-200 pb-2">
                <CheckCircle size={18} className="text-green-600" /> Official Resolution Update
              </h3>
              
              {complaint.resolutionNotes && (
                <div className="flex gap-3 text-sm text-green-900 bg-white p-4 rounded-xl shadow-sm border border-green-100">
                  <FileText size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-medium">{complaint.resolutionNotes}</p>
                </div>
              )}

              {complaint.resolvedImagePath && (
                <div className="mt-4">
                  <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest mb-2">Proof of Resolution</p>
                  <div className="w-full h-48 bg-white rounded-xl overflow-hidden border border-green-200 shadow-sm relative group">
                    <img 
                      src={`http://localhost:8080/uploads/${encodeURIComponent(complaint.resolvedImagePath)}`} 
                      alt="Resolution Proof" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Image+Unavailable';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Original Evidence */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Your Original Evidence</h3>
            
            <div className="w-full aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center">
              {complaint.imagePath ? (
                <img 
                  src={`http://localhost:8080/uploads/${encodeURIComponent(complaint.imagePath)}`} 
                  alt="Original Evidence" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=No+Image';
                  }}
                />
              ) : (
                <div className="text-gray-300 flex flex-col items-center">
                  <ImageIcon size={32} />
                  <span className="text-xs mt-2 font-bold uppercase tracking-widest">No Image</span>
                </div>
              )}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-800 font-medium">
              Geotagged image successfully verified and submitted to the municipal database.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ComplaintDetail;