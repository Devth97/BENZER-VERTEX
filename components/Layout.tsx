import React, { useState } from 'react';
import { Loader2, LayoutDashboard, ShoppingBag, Users, Wand2, Images, Library, Settings, LogOut, Menu, X } from 'lucide-react';
import { APP_NAME } from '../constants';
import { ProcessingState, JobStatus } from '../types';
import { AppDock } from './Dock';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
  processingState?: ProcessingState;
  onSignOut?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate, processingState, onSignOut }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navItems = [
    { id: 'collections', label: 'Collections', icon: Library },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'studio', label: 'AI Studio', icon: Wand2 },
    { id: 'gallery', label: 'Gallery', icon: Images },
    { id: 'catalog', label: 'Catalog', icon: ShoppingBag },
    { id: 'customers', label: 'Customers', icon: Users },
  ];

  const handleNavClick = (page: string) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen overflow-hidden relative flex bg-transparent">
      
      {/* --- MOBILE BACKDROP --- */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 flex-col bg-white/30 backdrop-blur-xl border-r border-white/40 z-50 shadow-2xl transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:flex
      `}>
        {/* Logo Area */}
        <div className="h-24 flex items-center justify-between px-8 border-b border-white/20">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white font-serif font-bold text-xl">
                  T
               </div>
               <span className="font-serif font-bold text-xl text-slate-800 tracking-tight">{APP_NAME}</span>
            </div>
            {/* Mobile Close Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 text-slate-500 hover:bg-white/40 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
            <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group
                  ${activePage === item.id || (item.id === 'studio' && activePage === 'result')
                    ? 'bg-white/60 shadow-lg shadow-indigo-500/5 border border-white/60 text-indigo-700 font-bold' 
                    : 'text-slate-600 hover:bg-white/40 hover:text-slate-900 font-medium'
                  }
                `}
              >
                <item.icon 
                  size={20} 
                  className={activePage === item.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} 
                />
                {item.label}
              </button>
            ))}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/20 space-y-2 bg-white/10">
            <button
               onClick={() => handleNavClick('settings')}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${activePage === 'settings'
                    ? 'bg-white/60 shadow-sm text-indigo-700 font-bold' 
                    : 'text-slate-600 hover:bg-white/40'
                  }
               `}
            >
               <Settings size={20} className={activePage === 'settings' ? 'text-indigo-600' : 'text-slate-400'} />
               Settings
            </button>
            <button 
              onClick={onSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50/50 rounded-xl transition-colors font-medium"
            >
               <LogOut size={20} />
               Sign Out
            </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT WRAPPER --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden lg:pl-72 relative transition-all duration-300">
        
        {/* Header (Mobile Logo / Desktop Status) */}
        <header className="h-20 flex items-center justify-between px-6 lg:px-10 mt-2 z-10 flex-shrink-0">
          <div className="lg:hidden flex items-center gap-3">
             {/* Mobile Menu Button */}
             <button 
               onClick={() => setIsMobileMenuOpen(true)}
               className="p-2 -ml-2 text-slate-600 hover:bg-white/40 rounded-xl transition-colors"
             >
               <Menu size={24} />
             </button>

             {/* Mobile Logo Placeholder */}
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">T</div>
          </div>
          
          {/* Spacer for desktop layout alignment */}
          <div className="hidden lg:block"></div>

          <div className="flex items-center gap-4">
            <div className="glass-card px-4 py-2 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)] animate-pulse"></div>
              <span className="text-xs font-bold text-slate-600 tracking-wide">SYSTEM ACTIVE</span>
            </div>
            
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 border-2 border-white/50 cursor-pointer hover:scale-105 transition-transform">
              S
            </div>
          </div>
        </header>

        {/* Page Content Scroll Area */}
        <main className="flex-1 overflow-y-auto px-4 pb-32 lg:px-10 lg:pb-32 scroll-smooth">
          <div className="max-w-[1600px] mx-auto pt-4">
             {children}
          </div>
        </main>
      </div>

      {/* --- DOCK (Global Overlay) --- */}
      <AppDock activePage={activePage} onNavigate={onNavigate} />

      {/* --- GLOBAL LOADING OVERLAY --- */}
      {processingState && processingState.status === JobStatus.PROCESSING && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
           <div className="glass-card rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl ring-1 ring-white/50 bg-white/90">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner relative">
                 <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                 <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin"></div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Processing Job</h3>
              <p className="text-slate-500 mb-6 font-medium">
                Generating {processingState.currentStep} of {processingState.totalSteps}<br/>
                <span className="text-sm text-indigo-600 font-bold">{processingState.currentGarment}</span>
              </p>
              
              <div className="w-full bg-slate-200/50 rounded-full h-3 mb-3 overflow-hidden shadow-inner">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300"
                  style={{ width: `${(processingState.currentStep / processingState.totalSteps) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 font-medium">Please do not close this window.</p>
           </div>
        </div>
      )}
    </div>
  );
};
