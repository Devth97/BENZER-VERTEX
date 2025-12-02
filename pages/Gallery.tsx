import React, { useState } from 'react';
import { GalleryItem } from '../types';
import { Download, Search, Filter, Calendar } from 'lucide-react';

interface GalleryProps {
  items: GalleryItem[];
}

export const Gallery: React.FC<GalleryProps> = ({ items }) => {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const categories = ['All', ...Array.from(new Set(items.map(item => item.garment.category)))];
  const filteredItems = items.filter(item => filterCategory === 'All' || item.garment.category === filterCategory);

  const handleDownload = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `tailor-generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-800">Generated Gallery</h2>
          <p className="text-slate-500 font-medium">History of all AI-generated previews</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white/40 p-1.5 rounded-xl border border-white/40 shadow-inner">
           <div className="px-2 text-slate-400"><Filter size={16} /></div>
           <select 
             value={filterCategory}
             onChange={(e) => setFilterCategory(e.target.value)}
             className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer pr-8"
           >
             {categories.map(cat => (
               <option key={cat} value={cat}>{cat}</option>
             ))}
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="group glass-card rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="relative aspect-[3/4] bg-slate-100/50">
               <img src={item.imageUrl} alt="Result" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <button 
                    onClick={() => handleDownload(item.imageUrl)}
                    className="p-3 bg-white text-slate-900 rounded-full hover:scale-110 transition-transform shadow-lg"
                    title="Download"
                  >
                    <Download size={24} />
                  </button>
               </div>
               <div className="absolute top-3 left-3 px-3 py-1.5 bg-white/30 backdrop-blur-md rounded-xl text-xs font-bold text-white border border-white/30 shadow-lg">
                 {item.garment.category}
               </div>
            </div>
            
            <div className="p-5 bg-white/40 backdrop-blur-md">
               <div className="flex items-center justify-between mb-2">
                 <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded-md">
                   {(item.confidence * 100).toFixed(0)}% Match
                 </span>
                 <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                   <Calendar size={10} /> {new Date(item.createdAt).toLocaleDateString()}
                 </span>
               </div>
               <h3 className="font-bold text-slate-800 text-sm truncate">{item.garment.title}</h3>
               
               <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200/50">
                  <div className="flex -space-x-2">
                    <img src={item.customer.photoUrl} className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-sm" title={item.customer.name} />
                    <img src={item.garment.imageUrl} className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-sm" title={item.garment.title} />
                  </div>
                  <span className="text-xs text-slate-500 font-medium ml-1">Generated</span>
               </div>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="col-span-full py-24 text-center glass-card rounded-3xl border-dashed border-2 border-white/50">
            <Search size={48} className="mx-auto mb-4 opacity-30 text-indigo-900" />
            <p className="text-xl font-bold text-slate-700">No generated images yet</p>
            <p className="text-slate-500 font-medium mt-1">Head to the AI Studio to create your first virtual try-on.</p>
          </div>
        )}
      </div>
    </div>
  );
};