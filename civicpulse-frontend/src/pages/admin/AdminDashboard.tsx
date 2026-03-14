import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, Eye, Filter, X, ShieldCheck, Activity, CheckSquare, AlertCircle, Building, Calendar, Flag, Send, XCircle } from 'lucide-react';
import API from '../../services/api';

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Assignment State
  const [assignDept, setAssignDept] = useState('');
  const [customDept, setCustomDept] = useState(''); 
  const [assignPriority, setAssignPriority] = useState('MEDIUM');
  const [assignDeadline, setAssignDeadline] = useState('');

  // Cancellation State
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchAllComplaints();
  }, []);

  const fetchAllComplaints = async () => {
    try {
      const response = await API.get('/grievances/all');
      // Sort newest first
      const sorted = response.data.sort((a: any, b: any) => b.id - a.id);
      setComplaints(sorted);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      await API.put(`/grievances/update-status/${id}?status=${newStatus}`);
      fetchAllComplaints(); 
      if (selectedComplaint && selectedComplaint.id === id) {
        setSelectedComplaint({ ...selectedComplaint, status: newStatus });
      }
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalDepartment = assignDept === 'Other' ? customDept : assignDept;

    if (!finalDepartment || !assignDeadline) {
      alert("Please specify a department and deadline.");
      return;
    }

    setIsUpdating(true);
    try {
      await API.put(`/grievances/assign/${selectedComplaint.id}?department=${encodeURIComponent(finalDepartment)}&priority=${encodeURIComponent(assignPriority)}&deadline=${encodeURIComponent(assignDeadline)}`);
      
      if (selectedComplaint.status === 'PENDING') {
        await API.put(`/grievances/update-status/${selectedComplaint.id}?status=FORWARDED`);
      }

      alert("Ticket assigned and forwarded successfully!");
      setSelectedComplaint(null);
      fetchAllComplaints();
      setAssignDept(''); setCustomDept(''); setAssignPriority('MEDIUM'); setAssignDeadline('');
    } catch (error) {
      alert("Error assigning grievance.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      alert("You must provide a reason for cancellation.");
      return;
    }
    setIsUpdating(true);
    try {
      await API.put(`/grievances/cancel/${selectedComplaint.id}?reason=${encodeURIComponent(cancelReason)}`);
      alert("Grievance cancelled.");
      setSelectedComplaint(null);
      fetchAllComplaints();
      setCancelReason('');
    } catch (error) {
      alert("Error cancelling grievance.");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredComplaints = filter === 'ALL' ? complaints : complaints.filter(c => c.status === filter);

  const totalCount = complaints.length;
  const pendingCount = complaints.filter(c => c.status === 'PENDING').length;
  const forwardedCount = complaints.filter(c => c.status === 'FORWARDED' || c.status === 'IN PROGRESS').length;
  const resolvedCount = complaints.filter(c => c.status === 'RESOLVED').length;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto font-sans">
      
      {/* === HERO BANNER === */}
      <div className="bg-gradient-to-r from-[#1e293b] to-[#0f172a] rounded-2xl p-8 mb-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-[#00AEEF] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 mb-2 uppercase">
              <ShieldCheck className="text-[#00AEEF]" size={32} /> 
              MUNICIPAL <span className="text-[#00AEEF]">COMMAND CENTER</span>
            </h1>
            <p className="text-gray-400 text-sm">Assign, track, and resolve citizen grievances city-wide.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 p-2 rounded-xl backdrop-blur-sm">
            <Filter size={18} className="text-[#00AEEF] ml-2" />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer py-1 pr-4 appearance-none"
            >
              <option value="ALL" className="text-black">All Tickets</option>
              <option value="PENDING" className="text-black">Pending</option>
              <option value="FORWARDED" className="text-black">Forwarded</option>
              <option value="IN PROGRESS" className="text-black">In Progress</option>
              <option value="RESOLVED" className="text-black">Resolved</option>
              <option value="CANCELLED" className="text-black">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* === QUICK STATS CARDS === */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-gray-100 p-3 rounded-lg text-gray-600"><Activity size={20} /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Tickets</p>
            <p className="text-xl font-black text-[#1e293b]">{totalCount}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-red-50 shadow-sm flex items-center gap-4">
          <div className="bg-red-50 p-3 rounded-lg text-red-500"><AlertCircle size={20} /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">New / Pending</p>
            <p className="text-xl font-black text-red-600">{pendingCount}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-50 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-lg text-blue-500"><Clock size={20} /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Forwarded</p>
            <p className="text-xl font-black text-blue-600">{forwardedCount}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-green-50 shadow-sm flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-lg text-green-500"><CheckSquare size={20} /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resolved</p>
            <p className="text-xl font-black text-green-600">{resolvedCount}</p>
          </div>
        </div>
      </div>

      {/* === MAIN TABLE === */}
      {loading ? (
        <p className="text-center py-20 font-bold text-gray-400 animate-pulse uppercase tracking-widest">Accessing Secure Records...</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredComplaints.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-bold uppercase tracking-widest text-sm flex flex-col items-center gap-3">
              <CheckCircle size={40} className="text-gray-300" />
              No complaints match this filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 tracking-widest border-b border-gray-100">
                  <tr>
                    <th className="p-5">ID</th>
                    <th className="p-5">Issue Details</th>
                    <th className="p-5">Department Assignment</th>
                    <th className="p-5">Status</th>
                    <th className="p-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredComplaints.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-5 font-black text-[#00AEEF]">CP-{c.id}</td>
                      <td className="p-5">
                        <p className="font-bold text-[#1e293b]">{c.title}</p>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-1">
                          {c.category} • {c.user?.name || 'Unknown User'}
                        </p>
                      </td>
                      <td className="p-5">
                        {c.department ? (
                          <div>
                            <p className="font-bold text-[#1e293b] text-[11px] uppercase tracking-wider flex items-center gap-1.5"><Building size={12} className="text-[#00AEEF]"/> {c.department}</p>
                            {c.deadline && <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Due: {new Date(c.deadline).toLocaleDateString()}</p>}
                          </div>
                        ) : (
                          <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest bg-red-50 px-2 py-1 rounded">Unassigned</span>
                        )}
                      </td>
                      <td className="p-5">
                        <span className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md flex items-center gap-1.5 w-max ${
                          c.status === 'RESOLVED' ? 'bg-green-50 text-green-600 border border-green-200' : 
                          c.status === 'FORWARDED' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 
                          c.status === 'CANCELLED' ? 'bg-red-50 text-red-600 border border-red-200' : 
                          'bg-orange-50 text-orange-600 border border-orange-200'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select 
                            onChange={(e) => updateStatus(c.id, e.target.value)}
                            value={c.status}
                            className="text-[10px] font-bold border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#00AEEF] cursor-pointer bg-white"
                          >
                            <option value="PENDING">Set Pending</option>
                            <option value="FORWARDED">Set Forwarded</option>
                            <option value="IN PROGRESS">Set In Progress</option>
                            <option value="RESOLVED">Set Resolved</option>
                            <option value="CANCELLED">Set Cancelled</option>
                          </select>
                          <button 
                            onClick={() => {
                              setSelectedComplaint(c);
                              setAssignDept(c.department || '');
                              setAssignPriority(c.priority || 'MEDIUM');
                              setAssignDeadline(c.deadline || '');
                            }}
                            className="bg-white border border-gray-200 hover:border-[#00AEEF] hover:text-[#00AEEF] text-gray-600 px-3 py-2 rounded-lg transition-all shadow-sm"
                            title="Review & Assign"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* === NEW ASSIGNMENT MODAL (Matches Uploaded UI) === */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col relative">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between p-8 pb-4 border-b border-gray-100">
              <div>
                <p className="text-[11px] font-black text-[#00AEEF] uppercase tracking-widest mb-1 flex items-center gap-1"><Flag size={12}/> TICKET #CP-{selectedComplaint.id}</p>
                <h2 className="text-2xl font-black text-[#1e293b] capitalize">{selectedComplaint.title}</h2>
              </div>
              <button onClick={() => setSelectedComplaint(null)} className="p-2 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body (Grid Layout) */}
            <div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-10">
              
              {/* LEFT COLUMN: Texts and Forms */}
              <div className="space-y-6 flex flex-col">
                <h3 className="text-lg font-black text-[#1e293b]">{selectedComplaint.user?.name || 'Citizen User'}</h3>

                {/* Description */}
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Description</p>
                  <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100 text-sm text-gray-600 leading-relaxed">
                    {selectedComplaint.description}
                  </div>
                </div>

                {/* Conditional Logic: Forms vs Status Badges */}
                {selectedComplaint.status === 'CANCELLED' ? (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                    <p className="text-xs font-black text-red-700 uppercase tracking-widest mb-2">Ticket Cancelled</p>
                    <p className="text-sm text-red-900 font-bold">Reason: {selectedComplaint.cancellationReason || 'No reason provided.'}</p>
                  </div>
                ) : selectedComplaint.department && selectedComplaint.status !== 'PENDING' ? (
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-center gap-3">
                    <CheckCircle size={24} className="text-blue-600" /> 
                    <p className="text-sm font-bold text-blue-700">Currently Forwarded to: {selectedComplaint.department}</p>
                  </div>
                ) : (
                  <>
                    {/* Assignment Box */}
                    <form onSubmit={handleAssign} className="border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                      <h3 className="text-xs font-black text-[#1e293b] uppercase tracking-widest flex items-center gap-2 mb-4">
                        <Send size={14} className="text-[#00AEEF]" /> Department Assignment
                      </h3>
                      
                      <select 
                        required value={assignDept} onChange={(e) => setAssignDept(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#00AEEF] text-sm font-bold text-gray-700"
                      >
                        <option value="">Select Department Officer...</option>
                        <option value="Water Board">Water Supply Board</option>
                        <option value="Public Works">Public Works (Roads)</option>
                        <option value="Electricity Dept">Electricity Department</option>
                        <option value="Sanitation Dept">Waste & Sanitation</option>
                        <option value="Other">Other (Specify Below)</option>
                      </select>

                      {assignDept === 'Other' && (
                        <input 
                          type="text" required placeholder="Specify Department Name..."
                          value={customDept} onChange={(e) => setCustomDept(e.target.value)}
                          className="w-full p-3 border border-[#00AEEF]/30 rounded-xl bg-blue-50/30 focus:outline-none focus:border-[#00AEEF] text-sm font-bold"
                        />
                      )}

                      <div className="flex gap-4">
                        <select 
                          value={assignPriority} onChange={(e) => setAssignPriority(e.target.value)}
                          className="w-1/3 p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#00AEEF] text-sm font-bold text-gray-700"
                        >
                          <option value="LOW">Low Pri</option>
                          <option value="MEDIUM">Medium Pri</option>
                          <option value="HIGH">High Pri</option>
                          <option value="CRITICAL">Critical</option>
                        </select>
                        <input 
                          type="date" value={assignDeadline} onChange={(e) => setAssignDeadline(e.target.value)} required
                          className="w-2/3 p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#00AEEF] text-sm font-bold text-gray-600"
                        />
                      </div>

                      <button type="submit" disabled={isUpdating} className="w-full bg-[#1e293b] hover:bg-black text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all mt-2">
                        {isUpdating ? 'Processing...' : 'Forward Ticket'}
                      </button>
                    </form>

                    {/* Cancellation Box */}
                    <div className="bg-red-50/30 border border-red-200 rounded-2xl p-6">
                      <h3 className="text-xs font-black text-red-600 uppercase tracking-widest flex items-center gap-2 mb-4">
                        <XCircle size={14} /> Reject / Cancel Ticket
                      </h3>
                      <div className="space-y-4">
                        <textarea 
                          placeholder="State reason for cancellation..."
                          value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
                          className="w-full p-3 border border-red-200 rounded-xl text-sm focus:outline-none focus:border-red-400 bg-white resize-none"
                          rows={2}
                        />
                        <button type="button" onClick={handleCancel} disabled={isUpdating} className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md">
                          Confirm Cancellation
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* RIGHT COLUMN: Big Image */}
              <div className="flex flex-col h-full min-h-[400px]">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 text-center">Geo-Tagged Evidence</p>
                <div className="flex-1 bg-gray-50 rounded-3xl overflow-hidden border border-gray-200 flex items-center justify-center relative shadow-inner">
                  {selectedComplaint.imagePath ? (
                    <img 
                      src={`http://localhost:8080/uploads/${encodeURIComponent(selectedComplaint.imagePath)}`} 
                      alt="Evidence" 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <AlertCircle size={32} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No Image Provided</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;