import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import API from '../../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(''); 
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await API.post('/auth/login', { email, password });
      
      // Save all user data to local storage
      localStorage.setItem('name', response.data.name);
      localStorage.setItem('email', response.data.username);
      localStorage.setItem('role', response.data.role); 

      // Get the role once
      const userRole = response.data.role;

      // === CLEANED UP REDIRECTION LOGIC ===
      if (userRole === 'ROLE_ADMIN') {
        navigate('/admin/dashboard');
      } else if (userRole === 'ROLE_OFFICER') {
        navigate('/officer/dashboard'); 
      } else {
        navigate('/citizen/dashboard'); 
      }

    } catch (err) {
      setErrorMsg("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-[#00AEEF] flex items-center justify-center p-4 font-sans text-[#1e293b]">
      <div className="flex flex-col md:flex-row w-full max-w-3xl bg-white rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Left Side: Branding */}
        <div className="md:w-5/12 bg-[#1e293b] flex flex-col items-center justify-center p-6 text-white text-center">
          <div className="w-full border-t border-b border-[#00AEEF] py-4 px-2">
            <h1 className="text-2xl font-black tracking-widest uppercase mb-1 whitespace-nowrap">
              Civic<span className="text-[#00AEEF]">Pulse</span>
            </h1>
            <p className="text-[10px] tracking-[0.2em] opacity-80 font-light uppercase">Smart City Hub</p>
          </div>
          <p className="mt-4 text-gray-400 text-[10px] leading-relaxed uppercase tracking-widest px-2">
            Providing a seamless bridge between citizens and municipal authorities.
          </p>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-7/12 p-6 md:p-10 flex flex-col justify-center bg-white">
          <div className="max-w-sm mx-auto w-full">
            <h2 className="text-2xl font-medium mb-1">Welcome Back</h2>
            <p className="text-gray-400 mb-6 text-xs">Enter your credentials to access the portal.</p>

            {/* ERROR MESSAGE DISPLAY */}
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-lg text-center">
                {errorMsg}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@civicpulse.gov"
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00AEEF] bg-gray-50 transition-all text-sm"
                  required
                />
              </div>

              <div className="space-y-1 relative">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00AEEF] bg-gray-50 transition-all text-sm"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00AEEF]"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <div className="text-right">
                <Link to="/forgot" className="text-[10px] text-[#0081C9] hover:underline font-bold">Forgot Password?</Link>
              </div>

              <button type="submit" className="w-full bg-[#0081C9] hover:bg-[#006BA6] text-white py-2.5 rounded-lg shadow-sm transition-all active:scale-[0.98] text-xs font-bold uppercase tracking-widest mt-2">
                LOGIN
              </button>
            </form>

            <p className="text-center mt-6 text-[11px] text-gray-500">
              New to CivicPulse? <Link to="/register" className="text-[#0081C9] hover:underline font-black uppercase">Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;