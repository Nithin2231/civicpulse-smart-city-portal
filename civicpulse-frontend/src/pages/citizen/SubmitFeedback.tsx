import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import API from '../../services/api'; // Adjust path to your API setup

interface SubmitFeedbackProps {
  complaintId: number;
  onSuccess?: () => void; // Optional callback to close a modal after submitting
}

const SubmitFeedback: React.FC<SubmitFeedbackProps> = ({ complaintId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a star rating between 1 and 5.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        complaintId: complaintId,
        userId: localStorage.getItem('email') || 'citizen@example.com',
        rating: rating,
        comments: comments
      };

      await API.post('/feedback/submit', payload);
      alert("Thank you! Your feedback has been submitted successfully.");
      setRating(0);
      setComments('');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please check the console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 max-w-lg mx-auto mt-8 font-sans">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-[#1e293b] uppercase tracking-tight">Rate Resolution</h2>
        <p className="text-sm text-gray-500 mt-1">How satisfied are you with the resolution of Complaint #{complaintId}?</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Interactive Star Rating */}
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              className="focus:outline-none transition-transform hover:scale-110"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(rating)}
            >
              <Star 
                size={40} 
                className={`transition-colors duration-200 ${
                  star <= (hover || rating) 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'text-gray-200 hover:text-gray-300'
                }`} 
              />
            </button>
          ))}
        </div>
        <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest h-4">
          {rating === 0 ? 'Select a rating' : `${rating} out of 5 stars`}
        </p>

        {/* Comments Input */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Additional Comments (Optional)</label>
          <textarea 
            rows={4} 
            value={comments} 
            onChange={(e) => setComments(e.target.value)}
            placeholder="Tell us about your experience..." 
            className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-[#00AEEF] text-sm resize-none transition-colors" 
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting || rating === 0}
          className="w-full flex items-center justify-center gap-2 bg-[#0081C9] hover:bg-[#006BA6] disabled:bg-gray-400 text-white py-3.5 px-6 rounded-xl shadow-md transition-all active:scale-[0.98] text-sm uppercase tracking-widest font-bold"
        >
          {isSubmitting ? "Submitting..." : <><Send size={18}/> Submit Feedback</>}
        </button>
      </form>
    </div>
  );
};

export default SubmitFeedback;