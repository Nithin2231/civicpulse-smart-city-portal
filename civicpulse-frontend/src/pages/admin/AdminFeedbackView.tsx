import React, { useEffect, useState } from 'react';
import { Star, MessageSquare, Loader, Search } from 'lucide-react';
import API from '../../services/api';

interface Feedback {
  feedbackId: number;
  complaintId: number;
  userId: string;
  rating: number;
  comments: string;
  createdDate: string;
}

const AdminFeedbackView = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // === NEW: State for filtering ===
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    fetchFeedbackData();
  }, []);

  const fetchFeedbackData = async () => {
    try {
      const [listRes, avgRes] = await Promise.all([
        API.get('/feedback/all'),
        API.get('/feedback/average')
      ]);
      setFeedbacks(listRes.data);
      setAverageRating(avgRes.data.averageRating);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // === NEW: Filter Logic (By Date or Complaint ID) ===
  const filteredFeedbacks = feedbacks.filter((item) => {
    const formattedDate = new Date(item.createdDate).toLocaleDateString();
    const searchLower = filterText.toLowerCase();
    
    return (
      item.complaintId.toString().includes(searchLower) ||
      formattedDate.includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-[#00AEEF]">
        <Loader size={40} className="animate-spin mb-4" />
        <p className="font-bold text-gray-500 uppercase tracking-widest text-sm">Loading Feedback...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto font-sans space-y-6">
      
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1e293b] tracking-tight uppercase">Citizen Feedback</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor citizen satisfaction and ratings.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-yellow-50 px-6 py-4 rounded-xl border border-yellow-200 w-full md:w-auto">
          <div className="bg-white p-2 rounded-full shadow-sm flex-shrink-0">
            <Star size={28} className="fill-yellow-400 text-yellow-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest">Platform Average</p>
            <p className="text-3xl font-black text-yellow-700">
              {averageRating.toFixed(1)} <span className="text-sm text-yellow-600 font-bold uppercase tracking-widest">/ 5.0</span>
            </p>
          </div>
        </div>
      </div>

      {/* === NEW: Filter Input Bar === */}
      <div className="flex justify-end">
        <div className="relative w-full md:w-72">
          <input 
            type="text" 
            placeholder="Filter by Date or Complaint ID..." 
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full p-2.5 pl-10 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#00AEEF] text-sm shadow-sm"
          />
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Feedback Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600 min-w-[800px]">
          <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 tracking-widest border-b border-gray-100">
            <tr>
              <th className="p-5 whitespace-nowrap">Date Submitted</th>
              <th className="p-5">Complaint ID</th>
              <th className="p-5">User Email</th>
              <th className="p-5">Rating</th>
              <th className="p-5 w-1/3">Comments</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {/* USE filteredFeedbacks INSTEAD OF feedbacks */}
            {filteredFeedbacks.map((item) => (
              <tr key={item.feedbackId} className="hover:bg-blue-50/30 transition-colors">
                <td className="p-5 whitespace-nowrap text-gray-500 font-medium">
                  {new Date(item.createdDate).toLocaleDateString()}
                </td>
                <td className="p-5 font-black text-[#00AEEF]">CP-{item.complaintId}</td>
                <td className="p-5 text-gray-500">{item.userId}</td>
                <td className="p-5">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className={i < item.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-100 text-gray-200"} />
                    ))}
                  </div>
                </td>
                <td className="p-5">
                  {item.comments ? (
                    <div className="flex items-start gap-2 text-gray-600 bg-gray-50 p-3 rounded-lg text-xs">
                      <MessageSquare size={14} className="min-w-[14px] mt-0.5 text-[#00AEEF]" />
                      <p className="leading-relaxed">{item.comments}</p>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-300 italic">No comment provided</span>
                  )}
                </td>
              </tr>
            ))}
            {filteredFeedbacks.length === 0 && (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                  No feedback matches your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminFeedbackView;