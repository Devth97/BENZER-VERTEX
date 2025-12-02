
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, User, Check, AlertCircle, X, Loader2 } from 'lucide-react';
import { Customer } from '../types';
import { addCustomerDB } from '../services/supabaseService';

interface CustomerCaptureProps {
  customers: Customer[];
  onAdd: (c: Customer) => void;
}

export const CustomerCapture: React.FC<CustomerCaptureProps> = ({ customers, onAdd }) => {
  const [newCustomerName, setNewCustomerName] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Camera State & Refs
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => { stopCamera(); };
  }, []);
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        if (isCameraOpen) stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      setPhotoPreview(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      streamRef.current = stream;
      setIsCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please ensure you have granted camera permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setPhotoPreview(canvas.toDataURL('image/jpeg', 0.9));
        stopCamera();
      }
    }
  };

  const handleSave = async () => {
    if (newCustomerName && photoPreview) {
      try {
        setIsSaving(true);
        // Upload to Supabase and save DB record
        const newCustomer = await addCustomerDB(newCustomerName, photoPreview);
        
        onAdd(newCustomer);
        setNewCustomerName('');
        setPhotoPreview(null);
        stopCamera();
      } catch (e) {
        console.error("Failed to save customer", e);
        alert("Failed to save customer. See console.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="space-y-8">
       <div className="glass-card rounded-2xl p-6">
        <h2 className="text-2xl font-serif font-bold text-slate-800">Customers</h2>
        <p className="text-slate-500 font-medium">Manage customer profiles and body data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-3xl">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <User size={20} />
              </div>
              New Customer
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">Full Name</label>
                <input 
                  type="text" 
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none backdrop-blur-sm !text-black text-slate-900 placeholder:text-slate-500"
                  placeholder="e.g. Jane Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">Front Photo</label>
                <canvas ref={canvasRef} className="hidden" />

                <div className="relative overflow-hidden rounded-2xl bg-slate-50/50 border-2 border-dashed border-slate-300/50 min-h-[320px] flex flex-col items-center justify-center group hover:border-indigo-300/50 transition-colors">
                  
                  {/* State 1: Preview Image */}
                  {photoPreview ? (
                    <div className="absolute inset-0 z-20 bg-slate-900/10 backdrop-blur-xl flex items-center justify-center p-4">
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-contain rounded-lg shadow-2xl" />
                        <button 
                            onClick={() => setPhotoPreview(null)}
                            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-red-500 backdrop-blur-md transition-colors"
                            title="Remove photo"
                        >
                            <X size={20} />
                        </button>
                    </div>
                  ) : isCameraOpen ? (
                    /* State 2: Active Camera */
                    <div className="absolute inset-0 z-10 bg-black flex flex-col">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="flex-1 w-full h-full object-cover" 
                      />
                      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4 px-4">
                        <button 
                          onClick={stopCamera}
                          className="px-6 py-2 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-bold border border-white/20 hover:bg-white/30"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={capturePhoto}
                          className="w-16 h-16 rounded-full border-4 border-white/50 flex items-center justify-center bg-white/10 hover:bg-white/30 transition-all backdrop-blur-sm"
                        >
                          <div className="w-12 h-12 rounded-full bg-white shadow-lg" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* State 3: Selection Menu */
                    <div className="flex flex-col items-center gap-4 p-6 w-full">
                       <p className="text-sm text-slate-500 font-bold mb-2">Choose input method</p>
                       <div className="flex gap-3 w-full">
                          <label className="flex-1 cursor-pointer flex flex-col items-center gap-2 p-4 bg-white/60 border border-white/50 rounded-2xl hover:shadow-lg hover:shadow-indigo-500/10 transition-all group hover:-translate-y-1">
                             <div className="p-3 bg-indigo-50 rounded-full text-indigo-600 group-hover:scale-110 transition-transform">
                               <Upload size={24} />
                             </div>
                             <span className="text-xs font-bold text-slate-700">Upload</span>
                             <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                          </label>
                          
                          <button 
                            onClick={startCamera} 
                            className="flex-1 flex flex-col items-center gap-2 p-4 bg-white/60 border border-white/50 rounded-2xl hover:shadow-lg hover:shadow-indigo-500/10 transition-all group hover:-translate-y-1"
                          >
                             <div className="p-3 bg-indigo-50 rounded-full text-indigo-600 group-hover:scale-110 transition-transform">
                               <Camera size={24} />
                             </div>
                             <span className="text-xs font-bold text-slate-700">Camera</span>
                          </button>
                       </div>
                       <p className="text-[10px] text-slate-400 text-center px-4 font-medium">
                         Ensure good lighting and neutral background.
                       </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3 text-xs text-amber-800 font-medium flex items-start gap-2">
                 <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                 <p>By capturing this photo, you confirm customer consent.</p>
              </div>

              <button 
                onClick={handleSave}
                disabled={!newCustomerName || !photoPreview || isSaving}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="animate-spin" /> : <Check size={18} />}
                Save Profile
              </button>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-3xl overflow-hidden">
             <div className="px-6 py-4 border-b border-white/30 bg-white/30 backdrop-blur-sm">
                 <h3 className="font-bold text-slate-800">Recent Customers</h3>
             </div>
             <div className="divide-y divide-white/30">
                {customers.map(c => (
                    <div key={c.id} className="p-4 flex items-center gap-4 hover:bg-white/40 transition-colors">
                        <div className="h-14 w-14 rounded-2xl overflow-hidden bg-white/50 border border-white/50 shadow-sm flex-shrink-0">
                            <img src={c.photoUrl} alt={c.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-800">{c.name}</h4>
                            <p className="text-xs text-slate-500 font-medium">ID: #{c.id.slice(-6)}</p>
                        </div>
                        <button className="px-4 py-2 bg-white/50 hover:bg-white text-indigo-600 text-xs font-bold rounded-xl transition-all shadow-sm">
                            View History
                        </button>
                    </div>
                ))}
                {customers.length === 0 && (
                    <div className="p-10 text-center text-slate-400 font-medium">No customers added yet.</div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
