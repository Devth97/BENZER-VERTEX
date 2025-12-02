
import React, { useState } from 'react';
import { ArrowRight, Check, Layers, Grid, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Customer, CatalogItem, JobConfig } from '../types';
import { CATALOG_FOLDERS } from '../constants';

interface StudioProps {
  customers: Customer[];
  catalog: CatalogItem[];
  onStartJob: (config: JobConfig) => void;
}

export const Studio: React.FC<StudioProps> = ({ customers, catalog, onStartJob }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectionMode, setSelectionMode] = useState<'individual' | 'collection'>('individual');
  const [selectedGarments, setSelectedGarments] = useState<CatalogItem[]>([]);
  const [instructions, setInstructions] = useState('');
  const [usePro, setUsePro] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleGarmentSelection = (garment: CatalogItem) => {
    setSelectedGarments(prev => {
      const exists = prev.find(g => g.id === garment.id);
      if (exists) return prev.filter(g => g.id !== garment.id);
      return [...prev, garment];
    });
  };

  const handleSelectCollection = (folder: string) => {
    const itemsInFolder = catalog.filter(g => g.category === folder);
    const allSelected = itemsInFolder.every(item => selectedGarments.some(g => g.id === item.id));
    
    if (allSelected) {
      setSelectedGarments(prev => prev.filter(g => g.category !== folder));
    } else {
      const newItems = itemsInFolder.filter(item => !selectedGarments.some(g => g.id === item.id));
      setSelectedGarments(prev => [...prev, ...newItems]);
    }
  };

  const handleGenerate = () => {
    if (!selectedCustomer || selectedGarments.length === 0) return;
    
    // Clear any previous error
    setError(null);

    // Delegate to App
    onStartJob({
      customer: selectedCustomer,
      garments: selectedGarments,
      instructions,
      usePro
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 relative">
      
      <div className="text-center mb-10">
        <h2 className="text-4xl font-serif font-bold text-slate-800 tracking-tight">AI Studio Job</h2>
        <p className="text-slate-500 mt-2 font-medium">Configure parameters for virtual try-on</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Step 1: Customer */}
        <div className="space-y-4">
           <div className="flex items-center gap-3 mb-2 px-1">
             <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/50 border border-white/60 text-slate-800 font-bold text-sm shadow-sm">1</span>
             <h3 className="font-bold text-lg text-slate-800">Select Customer</h3>
           </div>
           
           <div className="glass-card p-4 rounded-3xl h-96 overflow-y-auto custom-scrollbar">
             <div className="grid grid-cols-3 gap-3">
               {customers.map(c => (
                 <button
                   key={c.id}
                   onClick={() => setSelectedCustomer(c)}
                   className={`
                     relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 group
                     ${selectedCustomer?.id === c.id 
                       ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] scale-105 z-10' 
                       : 'border-transparent hover:border-white/50 hover:scale-105'}
                   `}
                 >
                   <img src={c.photoUrl} alt={c.name} className="w-full h-full object-cover" />
                   {selectedCustomer?.id === c.id && (
                     <div className="absolute top-2 right-2 bg-indigo-500 text-white rounded-full p-1 shadow-lg">
                       <Check size={12} />
                     </div>
                   )}
                   <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6 text-center">
                     <p className="text-[10px] text-white font-bold truncate">{c.name}</p>
                   </div>
                 </button>
               ))}
               {customers.length === 0 && <p className="text-sm text-slate-400 col-span-3 text-center py-10 font-medium">No customers found</p>}
             </div>
           </div>
        </div>

        {/* Step 2: Garment */}
        <div className="space-y-4">
           <div className="flex items-center justify-between mb-2 px-1">
             <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/50 border border-white/60 text-slate-800 font-bold text-sm shadow-sm">2</span>
                <h3 className="font-bold text-lg text-slate-800">Select Garment(s)</h3>
             </div>
             
             <div className="flex bg-white/40 p-1 rounded-xl shadow-inner border border-white/30">
                <button 
                  onClick={() => setSelectionMode('individual')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 transition-all ${selectionMode === 'individual' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
                >
                  <Grid size={14} /> Individual
                </button>
                <button 
                  onClick={() => setSelectionMode('collection')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 transition-all ${selectionMode === 'collection' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
                >
                  <Layers size={14} /> Collection
                </button>
             </div>
           </div>
           
           <div className="glass-card p-4 rounded-3xl h-96 overflow-y-auto custom-scrollbar relative">
             {selectionMode === 'individual' ? (
                <div className="grid grid-cols-3 gap-3">
                  {catalog.map(g => {
                    const isSelected = selectedGarments.some(sel => sel.id === g.id);
                    return (
                      <button
                        key={g.id}
                        onClick={() => toggleGarmentSelection(g)}
                        className={`
                          relative aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all duration-300 group
                          ${isSelected 
                            ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] scale-105 z-10' 
                            : 'border-transparent hover:border-white/50 hover:scale-105'}
                        `}
                      >
                        <img src={g.imageUrl} alt={g.title} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-indigo-500 text-white rounded-full p-1 shadow-lg">
                            <Check size={12} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                  {catalog.length === 0 && <p className="text-sm text-slate-400 col-span-3 text-center py-10 font-medium">No items in catalog</p>}
                </div>
             ) : (
                <div className="space-y-3">
                   {CATALOG_FOLDERS.filter(f => f !== 'All').map(folder => {
                      const itemsInFolder = catalog.filter(g => g.category === folder);
                      const isFullySelected = itemsInFolder.length > 0 && itemsInFolder.every(item => selectedGarments.some(g => g.id === item.id));
                      
                      return (
                        <button 
                          key={folder}
                          onClick={() => handleSelectCollection(folder)}
                          disabled={itemsInFolder.length === 0}
                          className={`
                            w-full p-4 rounded-2xl border flex items-center justify-between transition-all duration-300
                            ${isFullySelected 
                              ? 'border-indigo-500 bg-indigo-50/50 shadow-md' 
                              : 'border-white/40 bg-white/20 hover:bg-white/40 hover:border-white/60'}
                            disabled:opacity-50 disabled:cursor-not-allowed
                          `}
                        >
                          <div className="flex items-center gap-4">
                             <div className={`p-3 rounded-xl ${isFullySelected ? 'bg-indigo-200/50 text-indigo-700' : 'bg-white/40 text-slate-500'}`}>
                               <Layers size={20} />
                             </div>
                             <div className="text-left">
                               <p className={`font-bold text-sm ${isFullySelected ? 'text-indigo-900' : 'text-slate-800'}`}>{folder} Collection</p>
                               <p className="text-xs text-slate-500 font-medium">{itemsInFolder.length} items</p>
                             </div>
                          </div>
                          {isFullySelected && <div className="bg-indigo-500 text-white p-1 rounded-full"><CheckCircle2 size={16} /></div>}
                        </button>
                      );
                   })}
                </div>
             )}
             
             {selectedGarments.length > 0 && (
                <div className="sticky bottom-0 left-0 right-0 pt-4 flex justify-center pointer-events-none">
                   <div className="bg-slate-900/90 backdrop-blur-md text-white text-xs py-2 px-4 rounded-full font-bold shadow-xl border border-white/10">
                      {selectedGarments.length} garment{selectedGarments.length !== 1 ? 's' : ''} selected
                   </div>
                </div>
             )}
           </div>
        </div>
      </div>

      {/* Step 3: Config */}
      <div className="space-y-4 pt-6">
         <div className="flex items-center gap-3 mb-2 px-1">
             <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/50 border border-white/60 text-slate-800 font-bold text-sm shadow-sm">3</span>
             <h3 className="font-bold text-lg text-slate-800">Configuration</h3>
         </div>

         <div className="glass-card p-8 rounded-3xl space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">Processing Engine</label>
                   <div className="flex bg-white/30 p-1.5 rounded-xl border border-white/40 shadow-inner">
                      <button 
                        onClick={() => setUsePro(false)}
                        className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${!usePro ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Nano Banana
                      </button>
                      <button 
                        onClick={() => setUsePro(true)}
                        className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${usePro ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Nano Banana PRO
                      </button>
                   </div>
                   <p className="text-[10px] text-slate-500 mt-2 font-medium px-1">
                     {usePro ? "High Quality • Uses API Key • Slower" : "Standard Quality • Free Tier • Fast"}
                   </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">Style Instructions</label>
                  <textarea 
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder='E.g. "Tuck in the shirt", "Make it fit tighter"...'
                    className="w-full h-28 p-4 bg-white/40 border border-white/40 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none backdrop-blur-sm text-sm font-medium placeholder:text-slate-400 resize-none shadow-inner !text-black text-slate-900 placeholder:text-slate-500"
                  />
                </div>
            </div>

            {error && (
              <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-700">
                <AlertTriangle className="flex-shrink-0 mt-0.5" size={18} />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!selectedCustomer || selectedGarments.length === 0}
              className="w-full py-5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 border-t border-white/20"
            >
              {selectedGarments.length > 1 ? (
                 <>Generate Batch ({selectedGarments.length} Items)</>
              ) : (
                 <>Generate Preview</>
              )}
              <ArrowRight size={24} />
            </button>
         </div>
      </div>
    </div>
  );
};
