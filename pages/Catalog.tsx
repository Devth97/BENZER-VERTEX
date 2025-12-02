
import React, { useState } from 'react';
import { Plus, Tag, Search, ShoppingBag, Folder, X, Upload, Trash2, Loader2 } from 'lucide-react';
import { CatalogItem } from '../types';
import { CATALOG_FOLDERS } from '../constants';
import { addToCatalogDB } from '../services/supabaseService';

interface CatalogProps {
  items: CatalogItem[];
  onAdd: (item: CatalogItem) => void;
  onRemove: (id: string) => void;
}

export const Catalog: React.FC<CatalogProps> = ({ items, onAdd, onRemove }) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFolder, setActiveFolder] = useState('All');
  
  // Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadCategory, setUploadCategory] = useState(CATALOG_FOLDERS[1]); 
  const [uploadTitle, setUploadTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveItem = async () => {
    if (uploadPreview && uploadTitle) {
      try {
        setIsUploading(true);
        // Upload to Supabase and get DB record
        const newItem = await addToCatalogDB({
            title: uploadTitle,
            category: uploadCategory,
            imageUrl: '', // Will be filled by service
            tags: [uploadCategory]
        }, uploadPreview);

        onAdd(newItem); // Update local state in App
        setIsUploadModalOpen(false);
        setUploadFile(null);
        setUploadPreview(null);
        setUploadTitle('');
        setUploadCategory(CATALOG_FOLDERS[1]);
      } catch (error) {
        console.error("Failed to upload item", error);
        alert("Failed to save item. Check console.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFolder = activeFolder === 'All' || item.category === activeFolder;
    return matchesSearch && matchesFolder;
  });

  return (
    <div className="space-y-8">
      <div className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-800">Catalog</h2>
          <p className="text-slate-500 font-medium">Manage your garment inventory</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2.5 bg-white/50 border border-white/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-sm transition-all !text-black text-slate-900 placeholder:text-slate-500"
            />
          </div>
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-105"
          >
            <Plus size={18} />
            <span className="font-semibold">Upload Item</span>
          </button>
        </div>
      </div>

      {/* Glass Tabs */}
      <div className="glass-card rounded-xl p-1.5 inline-flex flex-wrap gap-1">
        {CATALOG_FOLDERS.map(folder => (
          <button
            key={folder}
            onClick={() => setActiveFolder(folder)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all
              ${activeFolder === folder 
                ? 'bg-white shadow-md text-indigo-600' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/30'}
            `}
          >
            {folder === 'All' ? <ShoppingBag size={16} /> : <Folder size={16} />}
            {folder}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="group glass-card rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 relative">
            <div className="aspect-[3/4] bg-slate-100/50 relative overflow-hidden">
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute top-2 right-2 bg-white/30 backdrop-blur-md border border-white/40 text-slate-900 text-xs font-bold px-2 py-1 rounded-lg">
                {item.category}
              </div>
            </div>
            <div className="p-4 bg-white/40 backdrop-blur-sm">
              <h3 className="font-bold text-slate-900 truncate">{item.title}</h3>
              <div className="flex flex-wrap gap-1 mt-2">
                {item.tags.map((tag, i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-indigo-700 bg-indigo-50/60 px-2 py-0.5 rounded-md border border-indigo-100/50">
                    <Tag size={10} /> {tag}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Delete Button */}
            <button 
              onClick={(e) => {
                e.stopPropagation(); 
                e.preventDefault();
                if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
                  onRemove(item.id);
                }
              }}
              className="absolute top-2 left-2 p-2 bg-white text-red-500 hover:bg-red-500 hover:text-white rounded-full border border-slate-200 shadow-lg transition-all duration-200 z-30 cursor-pointer transform hover:scale-110 active:scale-95 opacity-100"
              title="Remove from Catalog"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        
        {filteredItems.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400 glass-card rounded-3xl border-dashed border-2 border-white/50">
            <Folder size={48} className="mx-auto mb-4 opacity-50 text-indigo-300" />
            <p className="text-lg font-bold text-slate-600">No items in {activeFolder}</p>
            <p className="text-sm">Upload items to this category to see them here.</p>
          </div>
        )}
      </div>

      {/* Glass Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="glass-card rounded-3xl w-full max-w-md overflow-hidden shadow-2xl ring-1 ring-white/60">
            <div className="px-6 py-4 border-b border-white/20 flex justify-between items-center bg-white/30">
              <h3 className="font-serif font-bold text-lg text-slate-800">Add New Garment</h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-500 hover:text-slate-800 p-1 hover:bg-white/40 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 bg-white/40">
              {/* Image Upload */}
              <div className="relative aspect-[3/4] bg-indigo-50/50 rounded-2xl border-2 border-dashed border-indigo-200/60 flex flex-col items-center justify-center overflow-hidden group hover:border-indigo-400/60 transition-colors">
                 {uploadPreview ? (
                   <>
                     <img src={uploadPreview} alt="Preview" className="w-full h-full object-cover" />
                     <button 
                       onClick={() => { setUploadPreview(null); setUploadFile(null); }}
                       className="absolute top-2 right-2 p-1.5 bg-white/60 backdrop-blur-md rounded-full hover:bg-red-50 text-red-500 border border-white/40"
                     >
                       <X size={16} />
                     </button>
                   </>
                 ) : (
                   <label className="flex flex-col items-center gap-2 cursor-pointer w-full h-full justify-center">
                      <div className="p-4 bg-white/60 text-indigo-600 rounded-full shadow-lg shadow-indigo-100/50 group-hover:scale-110 transition-transform">
                        <Upload size={24} />
                      </div>
                      <span className="text-sm font-bold text-slate-600">Click to upload image</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                   </label>
                 )}
              </div>

              {/* Details */}
              <div className="space-y-4">
                 <div>
                   <label className="block text-xs font-bold text-slate-600 mb-1 ml-1">Garment Name</label>
                   <input 
                     type="text"
                     value={uploadTitle}
                     onChange={(e) => setUploadTitle(e.target.value)}
                     placeholder="e.g. Navy Slim Fit Suit"
                     className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none backdrop-blur-sm !text-black text-slate-900 placeholder:text-slate-500"
                   />
                 </div>
                 
                 <div>
                   <label className="block text-xs font-bold text-slate-600 mb-1 ml-1">Category Folder</label>
                   <div className="relative">
                     <select 
                       value={uploadCategory}
                       onChange={(e) => setUploadCategory(e.target.value)}
                       className="w-full px-4 py-3 appearance-none bg-white/50 border border-white/40 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none backdrop-blur-sm !text-black text-slate-900"
                     >
                       {CATALOG_FOLDERS.filter(f => f !== 'All').map(folder => (
                         <option key={folder} value={folder}>{folder}</option>
                       ))}
                     </select>
                     <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                       <Folder size={16} />
                     </div>
                   </div>
                 </div>
              </div>

              <button 
                onClick={handleSaveItem}
                disabled={!uploadPreview || !uploadTitle || isUploading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 flex items-center justify-center gap-2"
              >
                {isUploading ? <Loader2 className="animate-spin" /> : 'Add to Catalog'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
