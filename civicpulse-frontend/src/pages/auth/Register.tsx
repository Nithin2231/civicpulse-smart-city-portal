import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import API from '../../services/api'; // Connects to Spring Boot

const Register = () => {
  // State variables to hold the form data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // FIXED: Default state now perfectly matches your Spring Boot Enum!
  const [role, setRole] = useState('ROLE_CITIZEN'); 
  
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  // === NEW: Password Strength Validator ===
  const validatePassword = (pass: string) => {
    if (pass.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(pass)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(pass)) return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(pass)) return "Password must contain at least one number.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) return "Password must contain at least one special character (e.g. !@#$%).";
    return ""; // Empty string means the password is perfectly strong!
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // 1. Check Password Strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      setErrorMsg(passwordError); // Show exactly why the password is weak
      return;
    }

    // 2. Check if passwords match
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match!");
      return;
    }

    setIsLoading(true);

    try {
      // 3. Send the exact fields your Spring Boot User entity expects
      const payload = {
        name: name,
        username: email, 
        password: password,
        role: role
      };

      await API.post('/auth/register', payload);
      
      // 4. If successful, redirect to login
      alert("Registration Successful! Your password is safely encrypted. Please log in.");
      navigate('/login');

    } catch (err: any) {
      console.error(err);
      setErrorMsg("Registration failed. That email might already be in use.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#00AEEF] flex items-center justify-center p-4 font-sans text-[#1e293b]">
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Left Side: Branding */}
        <div className="md:w-5/12 bg-[#1e293b] flex flex-col items-center justify-center p-6 text-white text-center">
          <div className="w-full border-t border-b border-[#00AEEF] py-4 px-2">
            <h1 className="text-2xl font-black tracking-widest uppercase mb-1 whitespace-nowrap">
              Civic<span className="text-[#00AEEF]">Pulse</span>
            </h1>
            <p className="text-[10px] tracking-[0.2em] opacity-80 font-light uppercase">User Enrollment</p>
          </div>
          <p className="mt-4 text-gray-400 text-[10px] leading-relaxed uppercase tracking-widest px-2">
            Digital Governance & Grievance Management System
          </p>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-7/12 p-6 md:p-8 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-2xl font-medium mb-1">Register Account</h2>
            <p className="text-gray-400 mb-4 text-xs">Select your role and complete the details below.</p>

            {/* ERROR MESSAGE DISPLAY */}
            {errorMsg && (
              <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-lg text-center">
                {errorMsg}
              </div>
            )}

            <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={handleRegister}>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Registration Role</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg bg-gray-50 text-[#1e293b] focus:outline-none focus:border-[#00AEEF] text-sm cursor-pointer font-bold"
                >
                  <option value="ROLE_CITIZEN">Citizen Account</option>
                  <option value="ROLE_ADMIN">Administrator</option>
                  <option value="ROLE_OFFICER">Department Officer</option>
                </select>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe" 
                  className="w-full p-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-[#00AEEF] text-sm" 
                  required 
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com" 
                  className="w-full p-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-[#00AEEF] text-sm" 
                  required 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Secure Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-[#00AEEF] text-sm"
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00AEEF]">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Confirm</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full p-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-[#00AEEF] text-sm" 
                  required 
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="md:col-span-2 bg-[#0081C9] hover:bg-[#006BA6] disabled:bg-gray-400 text-white py-3 rounded-lg shadow-sm transition-all active:scale-[0.98] text-xs font-bold uppercase tracking-widest mt-2"
              >
                {isLoading ? "CREATING ACCOUNT..." : "SIGN UP"}
              </button>
            </form>

            <p className="text-center mt-4 text-[11px] text-gray-500">
              Already a member? <Link to="/login" className="text-[#0081C9] hover:underline font-black uppercase">SIGN IN</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;