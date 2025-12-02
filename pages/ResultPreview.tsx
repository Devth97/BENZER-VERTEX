
import React, { useState } from 'react';
import { ArrowLeft, Edit3, Loader2, Save, Share2, Check, RefreshCw, Wand2, Download, CheckCircle, Sparkles } from 'lucide-react';
import { GenerationResult } from '../types';
import { editImage } from '../services/geminiService';

interface ResultPreviewProps {
  result: GenerationResult;
  onBack: () => void;
  onSaveToGallery?: () => void;
}

export const ResultPreview: React.FC<ResultPreviewProps> = ({ result, onBack, onSaveToGallery }) => {
  const [currentImage, setCurrentImage] = useState(result.imageUrl);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleMagicEdit = async () => {
    if (!currentImage || !editPrompt.trim()) return;
    setIsEditing(true);
    setError(null);
    try {
      const newImage = await editImage(currentImage, editPrompt);
      setCurrentImage(newImage);
      setEditPrompt('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to edit image");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDownloadAndSave = () => {
    if (!currentImage) return;
    const link = document.createElement('a');
    link.href = currentImage;
    link.download = `tailor-preview-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onSaveToGallery && !isSaved) {
      onSaveToGallery();
      setIsSaved(true);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 max-w-[1600px] mx-auto pb-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0 glass-card px-6 py-4 rounded-2xl">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-bold transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Studio
        </button>
        <div className="flex gap-3">
          <button 
            onClick={handleDownloadAndSave}
            className={`px-5 py-2.5 font-bold rounded-xl transition-all flex items-center gap-2 border shadow-sm
              ${isSaved 
                ? 'bg-green-50/80 border-green-200 text-green-700' 
                : 'bg-white/60 border-white/60 text-slate-700 hover:bg-white'}
            `}
          >
            {isSaved ? <Check size={18} /> : <Download size={18} />} 
            {isSaved ? 'Saved' : 'Save Image'}
          </button>
          <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/30">
            <Share2 size={18} /> Share
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        
        {/* Left Column: Generated Result */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center gap-2 px-1">
             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Garment Generated</h3>
          </div>
          <div className="glass-card flex-1 rounded-3xl overflow-hidden relative shadow-2xl flex flex-col border border-white/50 group h-[75vh]">
             <div className="absolute inset-0 bg-slate-900/5 pointer-events-none"></div>
             
             <img 
               src={currentImage} 
               alt="Generated Result" 
               className="w-full h-full object-contain p-4 relative z-10 transition-transform duration-500"
             />

             {/* Editing Overlay */}
             {isEditing && (
                <div className="absolute inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-30">
                    <div className="text-center bg-white/80 p-8 rounded-3xl shadow-2xl border border-white/60">
                      <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-indigo-600" />
                      <p className="font-bold text-lg text-slate-800">Applying Magic...</p>
                      <p className="text-sm text-slate-500 mt-2">"{editPrompt}"</p>
                    </div>
                </div>
             )}

             {/* Confidence Badge - Floating Glass Pill */}
             <div className="absolute bottom-6 left-6 z-20">
                <div className="bg-white/70 backdrop-blur-xl px-5 py-3 rounded-2xl flex items-center gap-4 border border-white/60 shadow-lg">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Confidence</span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-bold text-2xl text-slate-800">{(result.confidence * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${result.confidence > 0.85 ? 'bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]' : 'bg-yellow-400'}`} />
                </div>
             </div>

             {error && (
                <div className="absolute top-6 left-6 right-6 bg-red-500/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl z-30 flex justify-between items-center shadow-xl">
                  <span className="font-medium">{error}</span>
                  <button onClick={() => setError(null)} className="hover:bg-white/20 p-2 rounded-full"><RefreshCw size={20} /></button>
                </div>
              )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-96 flex flex-col gap-6 flex-shrink-0">
          
          {/* Job Info */}
          <div className="glass-card p-6 rounded-3xl">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              Asset Details
            </h3>
            <div className="space-y-4">
               <div className="flex items-center gap-4 p-3 bg-white/40 rounded-2xl border border-white/50">
                 <img src={result.customer.photoUrl} className="w-14 h-14 rounded-xl object-cover shadow-sm" />
                 <div>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Customer</p>
                   <p className="text-sm font-bold text-slate-800">{result.customer.name}</p>
                 </div>
               </div>
               <div className="flex items-center gap-4 p-3 bg-white/40 rounded-2xl border border-white/50">
                 <img src={result.garment.imageUrl} className="w-14 h-14 rounded-xl object-cover shadow-sm" />
                 <div>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Garment</p>
                   <p className="text-sm font-bold text-slate-800">{result.garment.title}</p>
                 </div>
               </div>
            </div>
          </div>

          {/* Magic Edit - Glass Panel */}
          <div className="glass-card p-6 rounded-3xl flex-1 flex flex-col border-indigo-200/50 bg-gradient-to-b from-white/60 to-indigo-50/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30">
                <Wand2 className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Magic Edit</h3>
                <p className="text-xs text-indigo-600 font-bold">Powered by Gemini 2.5</p>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col gap-4">
              <div className="text-xs font-medium text-slate-600 bg-white/40 p-4 rounded-xl border border-white/50">
                Type a prompt to modify the image while keeping the subject intact.
                <div className="mt-3 flex flex-wrap gap-2">
                   {['Vintage filter', 'Sunset lighting', 'Fix sleeve'].map(t => (
                      <button key={t} className="px-3 py-1.5 bg-white rounded-lg border border-white shadow-sm text-[10px] font-bold text-indigo-600 hover:scale-105 transition-transform" onClick={() => setEditPrompt(t)}>{t}</button>
                   ))}
                </div>
              </div>
              
              <textarea 
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                placeholder="E.g. Remove the background..."
                className="w-full flex-1 min-h-[120px] p-4 rounded-2xl bg-white/50 border border-white/50 focus:ring-2 focus:ring-indigo-500/50 outline-none backdrop-blur-sm text-sm font-medium resize-none shadow-inner !text-black text-slate-900 placeholder:text-slate-500"
              />
              
              <button 
                onClick={handleMagicEdit}
                disabled={!editPrompt.trim() || isEditing}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 disabled:opacity-50 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-xl"
              >
                {isEditing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                Apply Edit
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
