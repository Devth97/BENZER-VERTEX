import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export const InstallPWA: React.FC = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };
    
    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const onClick = (evt: React.MouseEvent) => {
    evt.preventDefault();
    if (!promptInstall) {
      return;
    }
    promptInstall.prompt();
    promptInstall.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA prompt');
        setIsInstalled(true);
      } else {
        console.log('User dismissed the PWA prompt');
      }
      setPromptInstall(null);
    });
  };

  if (!supportsPWA || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] animate-bounce-in">
      <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-indigo-400">
        <div className="bg-white/20 p-2 rounded-xl">
           <Download size={24} />
        </div>
        <div>
          <h4 className="font-bold text-sm">Install App</h4>
          <p className="text-xs text-indigo-100">Add to Home Screen for better experience</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setSupportsPWA(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
                <X size={16} />
            </button>
            <button
                onClick={onClick}
                className="px-4 py-2 bg-white text-indigo-600 rounded-lg text-xs font-bold shadow hover:bg-indigo-50 transition-colors"
            >
                Install
            </button>
        </div>
      </div>
    </div>
  );
};