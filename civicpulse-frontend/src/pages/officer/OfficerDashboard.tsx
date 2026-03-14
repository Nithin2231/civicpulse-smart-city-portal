import React, { useEffect, useState } from 'react';
import { UploadCloud, Image as ImageIcon, CheckCircle, Clock, Filter, ShieldCheck, Activity, CheckSquare } from 'lucide-react';
import API from '../../services/api';

// Updated to match the exact names in your database screenshots
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

  // === THE BUG FIX: Case-Insensitive Filtering ===
  const displayedGrievances = selectedDept === 'ALL DEPARTMENTS' 
    ? allAssignedGrievances 
    : allAssignedGrievances.filter(g => 
        g.department?.toUpperCase() === selectedDept.toUpperCase()
      );

  // Quick Stats for the new UI
  const totalCount = displayedGrievances.length;
  const resolvedCount = displayedGrievances.filter(g => g.status === 'RESOLVED').length;
  const pendingCount = totalCount - resolvedCount;

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
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto font-sans">
      
      {/* === NEW ATTRACTIVE HERO BANNER === */}
      <div className="bg-gradient-to-r from-[#1e293b] to-[#0f172a] rounded-2xl p-8 mb-6 text-white shadow-lg relative overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-[#00AEEF] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 mb-2">
              <ShieldCheck className="text-[#00AEEF]" size={32} /> 
              OFFICER <span className="text-[#00AEEF]">WORKSPACE</span>
            </h1>
            <p className="text-gray-400 text-sm">Review, manage, and resolve tickets assigned to municipal departments.</p>
          </div>
          
          {/* Filter Dropdown moved to the banner for a cleaner look */}
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

      {/* === NEW QUICK STATS CARDS === */}
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

      {/* RESOLUTION MODAL */}
      {selectedGrievance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-gray-100">
            <h2 className="text-xl font-black text-[#1e293b] uppercase tracking-tight mb-4 flex items-center gap-2 border-b border-gray-100 pb-4">
              <UploadCloud className="text-[#00AEEF]" /> Update Ticket CP-{selectedGrievance.id}
            </h2>
            
            <form onSubmit={handleUpdate} className="space-y-5 mt-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Mark Status</label>
                <select 
                  value={status} onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/20 text-sm font-bold transition-all"
                >
                  <option value="IN PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Resolution Notes *</label>
                <textarea 
                  rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} required
                  placeholder="Describe the action taken to fix this..."
                  className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/20 text-sm resize-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                  Upload Proof Image {status === 'RESOLVED' && <span className="text-red-500">*</span>}
                </label>
                <div className={`w-full border-2 border-dashed ${file ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50'} rounded-xl p-5 flex flex-col items-center justify-center transition-colors`}>
                  {file ? (
                    <div className="text-center">
                      <ImageIcon size={28} className="mx-auto text-green-500 mb-2" />
                      <p className="text-xs font-bold text-green-700">{file.name}</p>
                      <button type="button" onClick={() => setFile(null)} className="text-[10px] text-red-500 uppercase tracking-widest mt-2 hover:underline">Remove</button>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={28} className="text-gray-400 mb-3" />
                      <input 
                        type="file" accept="image/*" 
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:uppercase file:tracking-widest file:bg-[#00AEEF] file:text-white hover:file:bg-[#0081C9] cursor-pointer transition-all"
                      />
                      {status === 'RESOLVED' && (
                        <p className="text-[10px] text-red-500 uppercase tracking-widest mt-3 font-bold bg-red-50 px-3 py-1 rounded-full">Required for Resolution</p>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" onClick={() => setSelectedGrievance(null)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={isUpdating}
                  className="flex-1 py-3 bg-[#00AEEF] hover:bg-[#0081C9] text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-md transition-all disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerDashboard;