import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, UploadCloud, AlertCircle, Loader, Camera, X } from 'lucide-react';
import API from '../../services/api';
import exifr from 'exifr'; 

const SubmitComplaint = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [otherCategory, setOtherCategory] = useState(''); 
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const [isGpsAppMode, setIsGpsAppMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingGeo, setIsCheckingGeo] = useState(false); 
  const [isFetchingLocation, setIsFetchingLocation] = useState(false); 
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const navigate = useNavigate();

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          setLocation(data.display_name || `Lat: ${latitude}, Lng: ${longitude}`);
        } catch (error) {
          setLocation(`Lat: ${latitude}, Lng: ${longitude}`);
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (error) => {
        alert("Unable to retrieve your location. Please check your browser permissions.");
        setIsFetchingLocation(false);
      }
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setIsCheckingGeo(true);
    setFile(null); 

    if (isGpsAppMode) {
      setTimeout(() => {
        setFile(selectedFile);
        setIsCheckingGeo(false);
      }, 500); 
      return;
    }

    try {
      const gpsData = await exifr.gps(selectedFile);
      if (!gpsData || !gpsData.latitude || !gpsData.longitude) {
        alert("❌ IMAGE REJECTED: No hidden GPS data found. \n\nIf you are using the 'GPS Map Camera' app, please check the box above the upload area to allow visual watermarks!");
        e.target.value = ''; 
      } else {
        setFile(selectedFile);
      }
    } catch (err) {
      alert("❌ ERROR: Could not read image metadata.");
      e.target.value = '';
    } finally {
      setIsCheckingGeo(false);
    }
  };

  const startCamera = async () => {
    if (!location) {
      alert("Please click 'Get GPS' to fetch your location BEFORE taking a live photo.");
      return;
    }
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access the camera. Please allow browser permissions.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    
    setIsCheckingGeo(true);
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const bannerHeight = canvas.height * 0.15;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, bannerHeight);

    const fontSize = Math.floor(canvas.height * 0.03); 
    ctx.fillStyle = 'white';
    ctx.font = `bold ${fontSize}px sans-serif`;
    
    const currentDateTime = new Date().toLocaleString();
    ctx.fillText(`📅 Date: ${currentDateTime}`, 20, canvas.height - bannerHeight + (fontSize * 1.5));
    
    ctx.font = `${fontSize * 0.8}px sans-serif`;
    ctx.fillText(`📍 Loc: ${location}`, 20, canvas.height - bannerHeight + (fontSize * 3));

    canvas.toBlob((blob) => {
      if (blob) {
        const watermarkedFile = new File([blob], `live_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setFile(watermarkedFile);
        setIsGpsAppMode(true); 
      }
      setIsCheckingGeo(false);
      stopCamera(); 
    }, 'image/jpeg', 0.9);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Please attach a geo-tagged image as evidence.");
      return;
    }
    setIsSubmitting(true);
    try {
      const username = localStorage.getItem('email') || 'citizen@example.com'; 
      const finalCategory = category === 'Other' ? otherCategory : category;

      const formData = new FormData();
      formData.append('username', username);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', finalCategory); 
      formData.append('location', location);
      formData.append('image', file);

      await API.post('/grievances/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert("Grievance submitted successfully!");
      navigate('/citizen/my-complaints');
    } catch (err) {
      console.error("Failed to submit grievance:", err);
      alert("Error submitting grievance. Check the console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 font-sans max-w-4xl mx-auto">
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-black rounded-xl overflow-hidden">
            <button 
              onClick={stopCamera} 
              className="absolute top-4 right-4 z-10 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
            >
              <X size={20} />
            </button>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-auto max-h-[70vh] object-contain bg-black"
            />
            <div className="p-4 flex justify-center bg-gray-900">
              <button 
                type="button"
                onClick={capturePhoto}
                className="bg-[#00AEEF] hover:bg-[#0081C9] text-white py-3 px-8 rounded-full shadow-lg font-bold flex items-center gap-2"
              >
                <Camera size={24} /> SNAP PHOTO
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#1e293b] tracking-tight uppercase">Report an Issue</h1>
        <p className="text-gray-500 mt-1 text-sm">Submit a new grievance to the municipal authorities.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Issue Title</label>
            <input 
              type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Broken pipe on Main St." 
              className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-[#00AEEF] text-sm" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Category</label>
              <select 
                required value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-[#1e293b] focus:outline-none focus:border-[#00AEEF] text-sm font-bold cursor-pointer"
              >
                <option value="">Select a category...</option>
                <option value="Water Supply">Water Supply & Leakage</option>
                <option value="Street Light">Street Light Outage</option>
                <option value="Roads">Road Damage / Potholes</option>
                <option value="Sanitation">Sanitation & Garbage</option>
                <option value="Other">Other (Specify below)</option>
              </select>
            </div>

            {category === 'Other' && (
              <div className="space-y-1 animate-in fade-in zoom-in-95">
                <label className="text-[10px] font-bold text-[#00AEEF] uppercase tracking-widest ml-1">Specify Issue</label>
                <input 
                  type="text" required value={otherCategory} onChange={(e) => setOtherCategory(e.target.value)}
                  placeholder="What is the exact issue?" 
                  className="w-full p-3 border border-[#00AEEF]/30 rounded-xl bg-blue-50/30 focus:outline-none focus:border-[#00AEEF] text-sm" 
                />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Location Details</label>
            <div className="flex flex-col md:flex-row gap-3">
              <input 
                type="text" required value={location} onChange={(e) => setLocation(e.target.value)}
                placeholder="Click 'Get GPS' or type manually" 
                className="flex-1 p-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-[#00AEEF] text-sm transition-all" 
              />
              <button 
                type="button" onClick={handleGetLocation} disabled={isFetchingLocation}
                className="flex items-center justify-center gap-2 bg-[#1e293b] text-white px-5 py-3 rounded-xl hover:bg-gray-800 disabled:bg-gray-400 transition-all text-sm font-bold tracking-wider whitespace-nowrap"
              >
                {isFetchingLocation ? <Loader size={16} className="animate-spin" /> : <MapPin size={16} />} 
                {isFetchingLocation ? 'Locating...' : 'Get GPS'}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Description</label>
            <textarea 
              rows={3} required value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..." 
              className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-[#00AEEF] text-sm resize-none" 
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Attach Evidence</label>
              <label className="flex items-center gap-2 cursor-pointer bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                <input 
                  type="checkbox" checked={isGpsAppMode} onChange={(e) => setIsGpsAppMode(e.target.checked)}
                  className="w-3.5 h-3.5 text-[#00AEEF] rounded focus:ring-[#00AEEF]"
                />
                <span className="text-[10px] font-bold text-[#00AEEF] uppercase tracking-widest flex items-center gap-1">
                  Third-Party GPS App Used
                </span>
              </label>
            </div>

            <div className={`w-full border-2 border-dashed ${file ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50'} rounded-xl p-6 flex flex-col items-center justify-center transition-all relative`}>
              
              {isCheckingGeo ? (
                <div className="flex flex-col items-center text-[#00AEEF] animate-pulse">
                  <Loader size={32} className="mb-2 animate-spin" />
                  <p className="font-bold text-sm">Processing Image...</p>
                </div>
              ) : file ? (
                <div className="flex flex-col items-center text-green-600">
                  <UploadCloud size={32} className="mb-2" />
                  <p className="font-bold text-sm">Verified: {file.name}</p>
                  <p className="text-[10px] uppercase tracking-widest mt-1">
                    {isGpsAppMode ? "Visual Watermark Generated/Accepted ✓" : "Geo-tag found ✓"}
                  </p>
                  <button 
                    type="button" onClick={() => setFile(null)} 
                    className="mt-3 text-xs text-red-500 font-bold underline cursor-pointer"
                  >
                    Remove Photo
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center w-full gap-4">
                  <Camera size={32} className="text-[#00AEEF]" />
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 max-w-[250px] text-center">
                    Upload an EXIF-tagged photo OR use the camera to auto-stamp GPS data
                  </p>
                  
                  {/* CLEANED UP BUTTONS */}
                  <div className="flex gap-4 w-full md:w-auto relative z-10">
                    
                    {/* BUTTON 1: GALLERY UPLOAD */}
                    <label className="flex-1 md:flex-none cursor-pointer bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-bold text-center transition-colors">
                      <input 
                        type="file" accept="image/jpeg, image/png, image/heic"
                        onChange={handleFileUpload} className="hidden" disabled={isCheckingGeo || isSubmitting}
                      />
                      Upload from Gallery
                    </label>

                    {/* BUTTON 2: IN-APP CAMERA */}
                    <button 
                      type="button"
                      onClick={startCamera}
                      disabled={isCheckingGeo || isSubmitting}
                      className="flex-1 md:flex-none cursor-pointer bg-[#00AEEF] hover:bg-[#0081C9] text-white py-2 px-4 rounded-lg text-sm font-bold text-center transition-colors flex items-center justify-center gap-2"
                    >
                      <Camera size={16} /> Take Live Photo
                    </button>
                  </div>

                </div>
              )}
            </div>
          </div>

          <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <p className="flex items-center text-xs text-gray-400 font-bold gap-1.5">
              <AlertCircle size={14} className="text-orange-500" /> Invalid images will be automatically rejected.
            </p>
            <button 
              type="submit" disabled={isSubmitting || isCheckingGeo || !file}
              className="bg-[#0081C9] hover:bg-[#006BA6] disabled:bg-gray-400 text-white py-3 px-8 rounded-xl shadow-md transition-all active:scale-[0.98] text-sm uppercase tracking-widest font-bold"
            >
              {isSubmitting ? "Submitting..." : "Submit Grievance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitComplaint;