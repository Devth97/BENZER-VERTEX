
import React from 'react';
import { CatalogItem } from '../types';
import { CATALOG_FOLDERS } from '../constants';
import { Tag, ArrowRight } from 'lucide-react';

interface CollectionsProps {
  items: CatalogItem[];
  onNavigateToStudio?: () => void;
}

export const Collections: React.FC<CollectionsProps> = ({ items, onNavigateToStudio }) => {
  // Filter out 'All' and only show folders that actually have items (or show all if you prefer empty sections)
  const folders = CATALOG_FOLDERS.filter(f => f !== 'All');

  return (
    <div className="space-y-10 pb-12">
      <div className="glass-card rounded-2xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-serif font-bold text-slate-800 tracking-tight">Fashion Collections</h2>
          <p className="text-slate-600 font-medium mt-2 max-w-lg">
            Explore our curated inventory organized by style. Select a garment in the Studio to try it on.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      </div>

      <div className="space-y-12">
        {folders.map((folder) => {
          const folderItems = items.filter(item => item.category === folder);
          
          if (folderItems.length === 0) return null;

          return (
            <div key={folder} className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <span className="w-2 h-8 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
                  {folder}
                </h3>
                <span className="text-xs font-bold text-indigo-600 bg-white/40 px-3 py-1 rounded-full border border-white/50">
                  {folderItems.length} styles
                </span>
              </div>

              {/* Horizontal Scroll Container */}
              <div className="flex overflow-x-auto pb-8 pt-2 gap-6 px-2 snap-x snap-mandatory custom-scrollbar">
                {folderItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex-shrink-0 w-72 group snap-start"
                  >
                    <div className="glass-card rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 h-full flex flex-col relative border border-white/60">
                      <div className="aspect-[3/4] relative overflow-hidden bg-slate-100">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                           <p className="text-white font-serif text-lg font-bold translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                             {item.title}
                           </p>
                        </div>
                      </div>
                      
                      <div className="p-5 bg-white/30 backdrop-blur-md flex-1 flex flex-col justify-between">
                         <div>
                           <h4 className="font-bold text-slate-800 text-lg mb-2 truncate group-hover:text-indigo-700 transition-colors">
                             {item.title}
                           </h4>
                           <div className="flex flex-wrap gap-1.5">
                              {item.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="text-[10px] uppercase font-bold text-slate-500 bg-white/50 px-2 py-1 rounded-md">
                                  {tag}
                                </span>
                              ))}
                           </div>
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* "See All" Spacer Card if needed, or just padding */}
                <div className="w-12 flex-shrink-0"></div>
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="py-20 text-center glass-card rounded-3xl">
            <p className="text-slate-500 font-medium">No items found in the catalog.</p>
          </div>
        )}
      </div>
    </div>
  );
};
