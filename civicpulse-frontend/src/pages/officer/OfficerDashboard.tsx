import React, { useEffect, useState } from 'react';
import { UploadCloud, Image as ImageIcon, CheckCircle, Clock, Filter, ShieldCheck, Activity, CheckSquare, X, AlertCircle } from 'lucide-react';
import API from '../../services/api';

const DEPARTMENTS = [
  "ALL DEPARTMENTS",
  "WATER BOARD",
  "ELECTRICITY DEPT",
  "PUBLIC WORKS",
  "MUNICIPAL CORPORATION",
  "SANITATION"
];

const OfficerDashboard = () => {
  const [allAssignedGrievances, setAllAssignedGrievances] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState('ALL DEPARTMENTS');
  const [selectedGrievance, setSelectedGrievance] = useState<any>(null);
  
  // Resolution Form State
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchAssignedGrievances();
  }, []);

  const fetchAssignedGrievances = async () => {
    try {
      const response = await API.get('/grievances/all');
      const forwardedTickets = response.data.filter((g: any) => 
        g.department && g.department.trim() !== ''
      );
      setAllAssignedGrievances(forwardedTickets);
    } catch (error) {
      console.error("Error fetching assigned grievances:", error);
    }
  };

  const displayedGrievances = selectedDept === 'ALL DEPARTMENTS' 
    ? allAssignedGrievances 
    : allAssignedGrievances.filter(g => 
        g.department?.toUpperCase() === selectedDept.toUpperCase()
      );

  const totalCount = displayedGrievances.length;
  const resolvedCount = displayedGrievances.filter(g => g.status === 'RESOLVED').length;
  const pendingCount = totalCount - resolvedCount - displayedGrievances.filter(g => g.status === 'CANCELLED').length;

  const openResolutionModal = (grievance: any) => {
    setSelectedGrievance(grievance);
    setStatus(grievance.status === 'RESOLVED' ? 'RESOLVED' : 'IN PROGRESS');
    setNotes(grievance.resolutionNotes || '');
    setFile(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'RESOLVED' && !file) {
      alert("⚠️ Proof Image Required: You must upload a photo to mark this issue as Resolved.");
      return;
    }
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append('status', status);
      formData.append('resolutionNotes', notes);
      if (file) {
        formData.append('resolvedImage', file);
      }
      await API.put(`/grievances/resolve/${selectedGrievance.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Grievance updated successfully!");
      setSelectedGrievance(null);
      fetchAssignedGrievances(); 
    } catch (error) {
      alert("Failed to update grievance.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto font-sans">
      
      {/* === HERO BANNER === */}
      <div className="bg-gradient-to-r from-[#1e293b] to-[#0f172a] rounded-2xl p-8 mb-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-[#00AEEF] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 mb-2">
              <ShieldCheck className="text-[#00AEEF]" size={32} /> 
              OFFICER <span className="text-[#00AEEF]">WORKSPACE</span>
            </h1>
            <p className="text-gray-400 text-sm">Review, manage, and resolve tickets assigned to municipal departments.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 p-2 rounded-xl backdrop-blur-sm">
            <Filter size={18} className="text-[#00AEEF] ml-2" />
            <select 
              value={selectedDept} 
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer py-1 pr-4 appearance-none"
            >
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept} className="text-black">{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* === QUICK STATS CARDS === */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-lg text-blue-500"><Activity size={20} /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Active</p>
            <p className="text-xl font-black text-[#1e293b]">{totalCount}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-orange-50 p-3 rounded-lg text-orange-500"><Clock size={20} /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pending</p>
            <p className="text-xl font-black text-orange-600">{pendingCount}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-lg text-green-500"><CheckSquare size={20} /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resolved</p>
            <p className="text-xl font-black text-green-600">{resolvedCount}</p>
          </div>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {displayedGrievances.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-bold uppercase tracking-widest text-sm flex flex-col items-center gap-3">
            <CheckCircle size={40} className="text-gray-300" />
            No grievances currently assigned to {selectedDept === 'ALL DEPARTMENTS' ? 'any department' : selectedDept}.
          </div>
        ) : (
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 tracking-widest border-b border-gray-100">
              <tr>
                <th className="p-5">ID</th>
                <th className="p-5">Department</th>
                <th className="p-5">Issue Title</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayedGrievances.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-5 font-black text-[#00AEEF]">CP-{g.id}</td>
                  <td className="p-5 font-bold text-[#1e293b] uppercase text-[11px] tracking-wider">{g.department}</td>
                  <td className="p-5 font-medium">{g.title}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md flex items-center gap-1.5 w-max ${
                      g.status === 'RESOLVED' ? 'bg-green-50 text-green-600 border border-green-200' : 
                      g.status === 'CANCELLED' ? 'bg-red-50 text-red-600 border border-red-200' :
                      g.status === 'IN PROGRESS' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                      'bg-orange-50 text-orange-600 border border-orange-200'
                    }`}>
                      {g.status === 'RESOLVED' ? <CheckCircle size={12} /> : <Clock size={12} />}
                      {g.status}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <button 
                      onClick={() => openResolutionModal(g)}
                      className="bg-[#1e293b] hover:bg-[#00AEEF] text-white px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* === FIX: BEAUTIFUL, ALIGNED SPLIT-PANE RESOLUTION MODAL === */}
      {selectedGrievance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl border border-gray-100 overflow-hidden flex flex-col relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gray-50/50">
              <div>
                <p className="text-[10px] font-black text-[#00AEEF] uppercase tracking-widest mb-0.5">TICKET #CP-{selectedGrievance.id}</p>
                <h2 className="text-xl font-black text-[#1e293b] capitalize">{selectedGrievance.title}</h2>
              </div>
              <button onClick={() => setSelectedGrievance(null)} className="p-2 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm">
                <X size={18} />
              </button>
            </div>

            {/* Modal Body (Strict Grid Layout to prevent scrolling issues) */}
            <div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* LEFT COLUMN: Original Citizen Complaint Details */}
              <div className="space-y-6 flex flex-col">
                
                {/* Fixed Text Alignment */}
                <div>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Reported By</h3>
                  <p className="text-sm font-bold text-[#1e293b]">{selectedGrievance.user?.name || 'Citizen User'}</p>
                </div>

                {/* Fixed Description Box padding */}
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Description of Issue</p>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-600 leading-relaxed min-h-[80px]">
                    {selectedGrievance.description}
                  </div>
                </div>

                {/* Fixed Image height so it doesn't stretch the modal */}
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Original Evidence</p>
                  <div className="w-full h-56 bg-gray-50 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center relative shadow-sm">
                    {selectedGrievance.imagePath ? (
                      <img 
                        src={`http://localhost:8080/uploads/${encodeURIComponent(selectedGrievance.imagePath)}`} 
                        alt="Evidence" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <AlertCircle size={28} className="text-gray-300 mx-auto mb-1" />
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No Image</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Officer Resolution Form */}
              <div className="flex flex-col">
                {selectedGrievance.status === 'CANCELLED' ? (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                    <p className="text-xs font-black text-red-700 uppercase tracking-widest mb-1">Ticket Cancelled</p>
                    <p className="text-sm text-red-900 font-medium">This ticket was cancelled by the Admin and requires no further action.</p>
                  </div>
                ) : (
                  <form onSubmit={handleUpdate} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_0_40px_-15px_rgba(0,0,0,0.1)] space-y-4 h-full flex flex-col">
                    <h3 className="text-xs font-black text-[#1e293b] uppercase tracking-widest flex items-center gap-2 mb-2 border-b border-gray-100 pb-3">
                      <UploadCloud size={16} className="text-[#00AEEF]" /> Resolution Panel
                    </h3>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mark Status</label>
                      <select 
                        value={status} onChange={(e) => setStatus(e.target.value)}
                        className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-[#00AEEF] text-sm font-bold text-gray-700"
                      >
                        <option value="FORWARDED">Acknowledged (Pending)</option>
                        <option value="IN PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resolution Notes *</label>
                      <textarea 
                        rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} required
                        placeholder="Describe the action taken to fix this..."
                        className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-[#00AEEF] text-sm resize-none"
                      />
                    </div>

                    {/* FIX: Custom File Upload Button */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        Upload Proof Image {status === 'RESOLVED' && <span className="text-red-500">*</span>}
                      </label>
                      
                      <label className={`w-full border-2 border-dashed ${file ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-[#00AEEF] hover:bg-blue-50/50'} rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all`}>
                        {file ? (
                          <div className="text-center">
                            <ImageIcon size={24} className="mx-auto text-green-500 mb-1" />
                            <p className="text-xs font-bold text-green-700 truncate max-w-[200px]">{file.name}</p>
                            <p className="text-[10px] text-red-500 uppercase tracking-widest mt-1 hover:underline">Click to change</p>
                          </div>
                        ) : (
                          <>
                            <UploadCloud size={20} className="text-[#00AEEF] mb-2" />
                            <span className="bg-[#00AEEF] text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-1 shadow-sm">
                              Choose File
                            </span>
                            <span className="text-[10px] text-gray-400">No file chosen</span>
                          </>
                        )}
                        {/* Hidden native file input */}
                        <input 
                          type="file" accept="image/*" className="hidden"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>

                    <button type="submit" disabled={isUpdating} className="w-full bg-[#1e293b] hover:bg-black text-white py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-md disabled:opacity-50 mt-auto">
                      {isUpdating ? 'Saving...' : 'Save Resolution Update'}
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerDashboard;