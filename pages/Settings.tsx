import React, { useState, useEffect } from 'react';
import { Lock, Unlock, AlertTriangle, Save, RotateCcw, ShieldAlert, Check } from 'lucide-react';
import { PROMPT_BASE_VTO } from '../constants';

export const Settings: React.FC = () => {
  const [prompt, setPrompt] = useState(PROMPT_BASE_VTO);
  const [isLocked, setIsLocked] = useState(true);
  const [unlockStep, setUnlockStep] = useState(0); 
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedPrompt = localStorage.getItem('tailor_vto_prompt');
    if (savedPrompt) setPrompt(savedPrompt);
  }, []);

  const handleUnlockClick = () => {
    if (unlockStep === 0) setUnlockStep(1);
    else if (unlockStep === 1) {
      setUnlockStep(2);
      setIsLocked(false);
    }
  };

  const handleLock = () => {
    setIsLocked(true);
    setUnlockStep(0);
  };

  const handleSave = () => {
    localStorage.setItem('tailor_vto_prompt', prompt);
    setIsSaved(true);
    handleLock();
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm("Revert to factory default?")) {
      setPrompt(PROMPT_BASE_VTO);
      localStorage.removeItem('tailor_vto_prompt');
      handleLock();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="glass-card rounded-2xl p-6 mb-8">
        <h2 className="text-3xl font-serif font-bold text-slate-800">Settings</h2>
        <p className="text-slate-500 font-medium">Configure AI Engine and Application Preferences</p>
      </div>

      {/* AI Engine Configuration Section */}
      <div className="glass-card rounded-3xl overflow-hidden shadow-xl ring-1 ring-white/60">
        <div className="bg-white/40 px-8 py-5 border-b border-white/40 flex items-center justify-between backdrop-blur-sm">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
               <ShieldAlert size={20} />
             </div>
             <div>
               <h3 className="font-bold text-slate-800">Core Generation Engine</h3>
               <p className="text-xs text-slate-500 font-medium">Manage system prompt logic</p>
             </div>
          </div>
          {isSaved && (
             <div className="flex items-center gap-2 text-green-700 bg-green-100/80 px-4 py-1.5 rounded-full text-sm font-bold animate-fade-in shadow-sm">
               <Check size={16} /> Saved
             </div>
          )}
        </div>

        <div className="p-8 space-y-6 bg-white/20">
          
          {/* Status Banner */}
          <div className={`rounded-2xl p-5 flex items-start gap-4 border ${isLocked ? 'bg-white/40 border-white/50' : 'bg-amber-50/60 border-amber-200/60'} shadow-sm`}>
            {isLocked ? (
              <Lock className="text-slate-400 mt-0.5" size={20} />
            ) : (
              <Unlock className="text-amber-600 mt-0.5" size={20} />
            )}
            <div className="flex-1">
              <h4 className={`font-bold text-sm ${isLocked ? 'text-slate-700' : 'text-amber-800'}`}>
                {isLocked ? "System Prompt is Locked" : "Editing Mode Active"}
              </h4>
              <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                {isLocked 
                  ? "The core VTO prompt is protected to ensure consistent generation quality. Unlock only if you are an advanced prompt engineer." 
                  : "You are editing the live system logic. Changes here affect ALL future generations immediately."}
              </p>
            </div>
            {isLocked ? (
               unlockStep === 0 ? (
                 <button 
                   onClick={handleUnlockClick}
                   className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
                 >
                   Unlock
                 </button>
               ) : (
                 <div className="flex flex-col gap-2 items-end">
                    <span className="text-xs font-bold text-red-600">Are you sure?</span>
                    <div className="flex gap-2">
                      <button onClick={handleLock} className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>
                      <button onClick={handleUnlockClick} className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-red-700">Yes, Edit</button>
                    </div>
                 </div>
               )
            ) : (
               <button 
                 onClick={handleLock}
                 className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg hover:bg-indigo-700 transition-colors"
               >
                 Done
               </button>
            )}
          </div>

          {/* Prompt Editor */}
          <div>
             <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">
               Permanent System Prompt
               {!isLocked && <span className="ml-2 text-xs font-bold text-amber-600 animate-pulse">(Live Editing)</span>}
             </label>
             <div className="relative">
               <textarea
                 value={prompt}
                 onChange={(e) => setPrompt(e.target.value)}
                 disabled={isLocked}
                 className={`
                   w-full h-96 p-6 font-mono text-sm leading-relaxed rounded-2xl border transition-all resize-none shadow-inner
                   ${isLocked 
                     ? 'bg-slate-50/50 text-slate-400 border-white/40 cursor-not-allowed select-none' 
                     : 'bg-white/70 text-slate-900 border-indigo-300 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500'}
                 `}
               />
               {isLocked && (
                 <div className="absolute inset-0 z-10 bg-white/0" title="Unlock to edit"></div>
               )}
             </div>
             
             <div className="flex justify-between mt-3 px-1">
                <p className="text-xs text-slate-400 font-medium">
                  Note: "Style Instructions" entered in the Studio are appended to this prompt automatically.
                </p>
                {!isLocked && (
                   <button 
                     onClick={handleReset} 
                     className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-red-600 transition-colors"
                   >
                     <RotateCcw size={12} /> Reset to Default
                   </button>
                )}
             </div>
          </div>

          {/* Actions */}
          {!isLocked && (
             <div className="flex justify-end pt-6 border-t border-white/30">
                <button 
                   onClick={handleSave}
                   className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:bg-green-700 hover:scale-[1.02] transition-all"
                >
                   <Save size={18} />
                   Save Changes
                </button>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};