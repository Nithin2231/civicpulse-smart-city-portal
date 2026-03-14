import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from 'lucide-react';
import API from "../../services/api";

export default function Reset() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async () => {
    try {
      setError("");
      await API.post("/auth/reset-password", { email, otp, newPassword });
      alert("Password reset successful");
      navigate("/login");
    } catch {
      setError("Invalid OTP or error occurred");
    }
  };

  if (!email) { navigate("/forgot"); return null; }

  return (
    <div className="min-h-screen bg-[#00AEEF] flex items-center justify-center p-8 font-sans">
      <div className="flex flex-col md:flex-row w-full max-w-7xl min-h-[700px] bg-white rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white/20">
        
        {/* Left Side: Branding */}
        <div className="md:w-5/12 bg-[#1e293b] flex flex-col items-center justify-center p-10 text-white text-center">
          <div className="w-full border-t-4 border-b-4 border-[#00AEEF] py-10 px-2">
            <h1 className="text-4xl lg:text-5xl font-black tracking-[0.2em] uppercase mb-4 whitespace-nowrap">
              Civic<span className="text-[#00AEEF]">Pulse</span>
            </h1>
            <p className="text-lg tracking-[0.4em] opacity-80 font-light">SECURE RESET</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-7/12 p-12 md:p-24 flex flex-col justify-center bg-white">
          <div className="max-w-xl mx-auto w-full">
            <h2 className="text-5xl font-medium text-[#1e293b] mb-4">Set New Password</h2>
            <p className="text-gray-400 mb-12 text-lg">Enter OTP sent to <span className="text-[#0081C9] font-bold">{email}</span></p>

            {error && <p className="text-red-500 text-sm mb-4 font-bold">{error}</p>}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">OTP Code</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-5 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[#00AEEF] bg-gray-50 text-xl transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••••••"
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-5 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[#00AEEF] bg-gray-50 text-xl transition-all"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff size={28} /> : <Eye size={28} />}
                  </button>
                </div>
              </div>

              <button 
                onClick={handleReset}
                className="w-full bg-[#0081C9] hover:bg-[#006BA6] text-white py-6 rounded-2xl shadow-xl transition-all active:scale-[0.98] text-2xl uppercase tracking-widest font-normal"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}