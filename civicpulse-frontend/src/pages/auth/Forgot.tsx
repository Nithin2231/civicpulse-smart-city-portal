import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Forgot() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to reset with state
    navigate("/reset", { state: { email } });
  };

  return (
    <div className="min-h-screen bg-[#00AEEF] flex items-center justify-center p-4 font-sans text-[#1e293b]">
      <div className="flex flex-col md:flex-row w-full max-w-5xl min-h-[500px] bg-white rounded-3xl overflow-hidden shadow-2xl">
        <div className="md:w-5/12 bg-[#1e293b] flex flex-col items-center justify-center p-10 text-white text-center">
          <div className="w-full border-t-2 border-b-2 border-[#00AEEF] py-8">
            <h1 className="text-3xl font-black tracking-widest uppercase mb-2 whitespace-nowrap">
              Civic<span className="text-[#00AEEF]">Pulse</span>
            </h1>
            <p className="text-xs tracking-[0.3em] opacity-80 font-light uppercase">Recovery</p>
          </div>
        </div>
        <div className="md:w-7/12 p-10 md:p-16 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-3xl font-medium mb-2">Reset Password</h2>
            <p className="text-gray-400 mb-8 text-sm">Enter email to receive an OTP.</p>
            <form className="space-y-6" onSubmit={handleSendOtp}>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email</label>
                <input type="email" onChange={(e) => setEmail(e.target.value)} className="w-full p-3.5 border-2 border-gray-100 rounded-xl bg-gray-50 text-base outline-none focus:border-[#00AEEF]" required />
              </div>
              <button type="submit" className="w-full bg-[#0081C9] text-white py-4 rounded-xl font-bold uppercase tracking-widest">Send OTP</button>
            </form>
            <p className="text-center mt-8 text-sm text-gray-500">
              Remembered? <Link to="/login" className="text-[#0081C9] font-black uppercase">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}