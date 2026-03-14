import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, Eye, Filter, X, MapPin, Calendar, Image as ImageIcon, Send, XCircle } from 'lucide-react';
import API from '../../services/api';

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);

  // Assignment State
  const [assignDept, setAssignDept] = useState('');
  const [customDept, setCustomDept] = useState(''); // NEW: For "Other" department
  const [assignPriority, setAssignPriority] = useState('Medium');
  const [assignDeadline, setAssignDeadline] = useState('');

  // Cancellation State
  const [cancelReason, setCancelReason] = useState(''); // NEW: For cancelling

  useEffect(() => {
    fetchAllComplaints();
  }, []);

  const fetchAllComplaints = async () => {
    try {
      const response = await API.get('/grievances/all');
      setComplaints(response.data);
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

  const handleAssign = async () => {
    // Check if "Other" was selected and use the custom department name
    const finalDepartment = assignDept === 'Other' ? customDept : assignDept;

    if (!finalDepartment || !assignDeadline) {
      alert("Please specify a department and deadline.");
      return;
    }

    try {
      await API.put(`/grievances/assign/${selectedComplaint.id}?department=${finalDepartment}&priority=${assignPriority}&deadline=${assignDeadline}`);
      alert("Grievance forwarded successfully!");
      setSelectedComplaint(null);
      fetchAllComplaints();
      setAssignDept(''); setCustomDept(''); setAssignPriority('Medium'); setAssignDeadline('');
    } catch (error) {
      alert("Error assigning grievance.");
    }
  };

  // NEW: Handle Ticket Cancellation
  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      alert("You must provide a reason for cancellation.");
      return;
    }
    try {
      await API.put(`/grievances/cancel/${selectedComplaint.id}?reason=${encodeURIComponent(cancelReason)}`);
      alert("Grievance cancelled.");
      setSelectedComplaint(null);
      fetchAllComplaints();
      setCancelReason('');
    } catch (error) {
      alert("Error cancelling grievance.");
    }
  };

  const filteredComplaints = filter === 'ALL' ? complaints : complaints.filter(c => c.status === filter);

  return (
    <div className="p-6 font-sans max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1e293b] uppercase tracking-tight">Municipal Command Center</h1>
          <p className="text-gray-500 text-sm mt-1">Assign, track, and resolve citizen grievances.</p>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl bg-white shadow-sm">
          <Filter size={16} className="text-gray-400" />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs font-bold text-gray-600 focus:outline-none cursor-pointer uppercase tracking-widest bg-transparent"
          >
            <option value="ALL">All Tickets</option>
            <option value="PENDING">Pending</option>
            <option value="FORWARDED">Forwarded</option>
            <option value="IN PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-20 font-bold text-gray-400 animate-pulse uppercase tracking-widest">Accessing Secure Records...</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            {/* ... TABLE HEADERS REMAIN THE SAME ... */}
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Citizen / Title</th>
                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Department</th>
                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredComplaints.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-sm font-bold text-gray-400">No complaints match this filter.</td></tr>
              ) : (
                filteredComplaints.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 text-xs font-black text-gray-400">#CP-{item.id}</td>
                    <td className="p-4">
                      <p className="text-sm font-bold text-[#1e293b]">{item.title}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{item.user?.name || 'Unknown User'}</p>
                    </td>
                    <td className="p-4"><span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md uppercase">{item.category}</span></td>
                    <td className="p-4">
                      {item.department ? (
                        <div>
                           <p className="text-[10px] font-black text-[#00AEEF] uppercase">{item.department}</p>
                           <p className="text-[10px] text-gray-500 font-bold">Due: {item.deadline}</p>
                        </div>
                      ) : <span className="text-[10px] text-gray-400 italic">Unassigned</span>}
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase ${
                        item.status === 'RESOLVED' ? 'bg-green-50 text-green-600 border-green-100' : 
                        item.status === 'FORWARDED' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                        item.status === 'CANCELLED' ? 'bg-red-50 text-red-600 border-red-100' : 
                        'bg-orange-50 text-orange-600 border-orange-100'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select 
                          onChange={(e) => updateStatus(item.id, e.target.value)}
                          value={item.status}
                          className="text-[10px] font-bold border border-gray-200 rounded-lg p-1.5 focus:outline-none focus:border-[#00AEEF] cursor-pointer"
                        >
                          <option value="PENDING">Set Pending</option>
                          <option value="FORWARDED">Set Forwarded</option>
                          <option value="IN PROGRESS">Set In Progress</option>
                          <option value="RESOLVED">Set Resolved</option>
                          <option value="CANCELLED">Set Cancelled</option>
                        </select>
                        <button onClick={() => setSelectedComplaint(item)} className="p-2 text-gray-400 hover:text-[#00AEEF] bg-gray-50 hover:bg-blue-50 rounded-lg transition-all" title="View & Assign">
                          <Eye size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal View */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50">
              <div>
                <p className="text-[#00AEEF] font-black text-[10px] uppercase tracking-widest mb-0.5">Ticket #CP-{selectedComplaint.id}</p>
                <h2 className="text-xl font-black text-[#1e293b]">{selectedComplaint.title}</h2>
              </div>
              <button onClick={() => setSelectedComplaint(null)} className="p-2 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Citizen Details</p>
                  <p className="text-sm font-bold text-gray-800">{selectedComplaint.user?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Description</p>
                  <p className="text-sm text-gray-600 bg-blue-50/50 p-3 rounded-xl border border-blue-50/50 leading-relaxed">{selectedComplaint.description}</p>
                </div>

                {/* THE ASSIGNMENT PANEL */}
                {selectedComplaint.status !== 'CANCELLED' && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4">
                    <h3 className="text-xs font-black text-[#1e293b] uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Send size={14} className="text-[#00AEEF]" /> Department Assignment
                    </h3>
                    
                    {selectedComplaint.department ? (
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-green-600 bg-green-50 p-2 rounded-lg border border-green-100">✓ Assigned to {selectedComplaint.department}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <select 
                          required value={assignDept} onChange={(e) => setAssignDept(e.target.value)}
                          className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00AEEF] font-bold text-gray-600"
                        >
                          <option value="">Select Department Officer...</option>
                          <option value="Water Board">Water Supply Board</option>
                          <option value="Public Works">Public Works (Roads)</option>
                          <option value="Electricity Dept">Electricity Department</option>
                          <option value="Sanitation Dept">Waste & Sanitation</option>
                          <option value="Other">Other (Specify Below)</option>
                        </select>

                        {/* NEW: Input for "Other" department */}
                        {assignDept === 'Other' && (
                          <input 
                            type="text" required placeholder="Specify Department Name..."
                            value={customDept} onChange={(e) => setCustomDept(e.target.value)}
                            className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00AEEF]"
                          />
                        )}

                        <div className="flex gap-3">
                          <select 
                            value={assignPriority} onChange={(e) => setAssignPriority(e.target.value)}
                            className="w-1/3 p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00AEEF] font-bold text-gray-600"
                          >
                            <option value="Low">Low Priority</option>
                            <option value="Medium">Medium Priority</option>
                            <option value="High">High Priority</option>
                          </select>
                          <input 
                            type="date" required value={assignDeadline} onChange={(e) => setAssignDeadline(e.target.value)}
                            className="w-2/3 p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00AEEF] text-gray-600"
                          />
                        </div>
                        <button onClick={handleAssign} className="w-full bg-[#1e293b] hover:bg-black text-white py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all">
                          Forward Ticket
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* NEW: CANCELLATION PANEL */}
                {(!selectedComplaint.department && selectedComplaint.status !== 'CANCELLED') && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
                    <h3 className="text-xs font-black text-red-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <XCircle size={14} /> Reject / Cancel Ticket
                    </h3>
                    <div className="space-y-3">
                      <textarea 
                        placeholder="State reason for cancellation..."
                        value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
                        className="w-full p-2 border border-red-200 rounded-lg text-sm focus:outline-none focus:border-red-400"
                        rows={2}
                      />
                      <button onClick={handleCancel} className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all">
                        Confirm Cancellation
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Shows if already cancelled */}
                {selectedComplaint.status === 'CANCELLED' && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
                     <p className="text-xs font-black text-red-700 uppercase tracking-widest mb-1">Cancelled</p>
                     <p className="text-sm text-red-900 font-bold">Reason: {selectedComplaint.cancellationReason || 'No reason provided.'}</p>
                  </div>
                )}

              </div>

              {/* Image Block */}
              <div className="bg-gray-50 rounded-2xl border border-gray-200 p-3 flex flex-col h-full min-h-[300px]">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 text-center">Geo-Tagged Evidence</p>
                <div className="flex-1 bg-white rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center relative">
                  {selectedComplaint.imagePath ? (
                    <img 
                      src={`http://localhost:8080/uploads/${encodeURIComponent(selectedComplaint.imagePath)}`} 
                      alt="Evidence" className="w-full h-full object-cover"
                    />
                  ) : <p className="text-xs font-bold text-gray-400">No Image</p>}
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