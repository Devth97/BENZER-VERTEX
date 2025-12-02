import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Catalog } from './pages/Catalog';
import { CustomerCapture } from './pages/CustomerCapture';
import { Studio } from './pages/Studio';
import { ResultPreview } from './pages/ResultPreview';
import { Gallery } from './pages/Gallery';
import { Settings } from './pages/Settings';
import { Collections } from './pages/Collections';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { InstallPWA } from './components/InstallPWA';
import { Customer, CatalogItem, GenerationResult, GalleryItem, JobStatus, JobConfig, ProcessingState } from './types';
import { generatePreviewImage } from './services/geminiService';
import { fetchCatalog, fetchCustomers, fetchGallery, deleteFromCatalogDB, addToGalleryDB } from './services/supabaseService';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  // Auth State
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<'admin' | 'shop' | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [activePage, setActivePage] = useState('collections');
  
  // Data State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Job State
  const [processingState, setProcessingState] = useState<ProcessingState>({
    status: JobStatus.PENDING,
    currentStep: 0,
    totalSteps: 0,
    currentGarment: ''
  });
  
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);

  // --- AUTH INITIALIZATION ---
  useEffect(() => {
    // 1. Get Session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        if (session) {
           await fetchUserRole(session.user.id);
        } else {
           setAuthLoading(false);
        }

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          setSession(session);
          if (session) {
            await fetchUserRole(session.user.id);
          } else {
            setUserRole(null);
            setAuthLoading(false);
          }
        });

        return () => subscription.unsubscribe();
      } catch (e) {
        console.error("Auth init error", e);
        setAuthLoading(false);
      }
    };

    initAuth();
  }, []);

  const fetchUserRole = async (userId: string) => {
     try {
       const { data, error } = await supabase
         .from('profiles')
         .select('role')
         .eq('id', userId)
         .single();
       
       if (data) setUserRole(data.role);
     } catch (e) {
       console.warn("Profile fetch error, defaulting to shop", e);
       setUserRole('shop');
     } finally {
       setAuthLoading(false);
     }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // State updates handled by onAuthStateChange
  };

  // --- DATA LOADING (Only if Logged In as Shop) ---
  useEffect(() => {
    if (!session || userRole !== 'shop') return;

    const loadData = async () => {
      try {
        setIsLoadingData(true);
        const [catData, custData, galData] = await Promise.all([
          fetchCatalog(),
          fetchCustomers(),
          fetchGallery()
        ]);
        setCatalog(catData);
        setCustomers(custData);
        setGalleryItems(galData);
      } catch (error) {
        console.error("Failed to load data from Supabase:", error);
      } finally {
        setIsLoadingData(false);
      }
    };
    loadData();
  }, [session, userRole]);

  // --- HANDLERS ---

  const handleGenerateSuccess = (result: GenerationResult) => {
    setGenerationResult(result);
    setActivePage('result');
  };

  const handleAddToGallery = async (result: GenerationResult) => {
    try {
      const tempItem: GalleryItem = { ...result, id: 'temp-' + Date.now(), createdAt: Date.now() };
      setGalleryItems(prev => [tempItem, ...prev]);
      const newItem = await addToGalleryDB(result);
      setGalleryItems(prev => prev.map(i => i.id === tempItem.id ? newItem : i));
    } catch (e) {
      console.error("Failed to save to gallery DB", e);
    }
  };

  const handleRemoveFromCatalog = async (id: string) => {
    try {
      const previous = [...catalog];
      setCatalog(prev => prev.filter(item => item.id !== id));
      await deleteFromCatalogDB(id);
    } catch (e) {
      console.error("Failed to delete", e);
    }
  };

  const handleStartJob = async (config: JobConfig) => {
    const { customer, garments, instructions, usePro } = config;
    
    setProcessingState({
      status: JobStatus.PROCESSING,
      currentStep: 0,
      totalSteps: garments.length,
      currentGarment: garments[0]?.title || ''
    });

    const isBatch = garments.length > 1;

    try {
      for (let i = 0; i < garments.length; i++) {
        const garment = garments[i];
        
        setProcessingState({
          status: JobStatus.PROCESSING,
          currentStep: i + 1,
          totalSteps: garments.length,
          currentGarment: garment.title
        });

        const result = await generatePreviewImage({
          customerImage: customer.photoUrl,
          garmentImage: garment.imageUrl,
          instructions,
          useProModel: usePro
        });

        const resultObj: GenerationResult = {
          imageUrl: result.image,
          confidence: result.confidence,
          customer: customer,
          garment: garment,
          instructions
        };

        await handleAddToGallery(resultObj);

        const link = document.createElement('a');
        link.href = result.image;
        link.download = `TailorPreview_${customer.name}_${garment.title}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        if (!isBatch) {
           setGenerationResult(resultObj);
        }
      }

      setProcessingState(prev => ({ ...prev, status: JobStatus.COMPLETED }));
      
      setTimeout(() => {
        setProcessingState({
          status: JobStatus.PENDING,
          currentStep: 0,
          totalSteps: 0,
          currentGarment: ''
        });
        if (!isBatch) setActivePage('result');
      }, 2000);

    } catch (error) {
      console.error("Job Failed", error);
      setProcessingState(prev => ({ ...prev, status: JobStatus.FAILED }));
      // Alert handling handled by Layout via state, but let's add a global notification later
      alert("Job Failed: " + (error as any).message);
    }
  };

  // --- RENDER LOGIC ---

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
         <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (!session) {
    return <Login onLoginSuccess={() => { /* Handled by auth listener */ }} />;
  }

  if (userRole === 'admin') {
    return <AdminDashboard onSignOut={handleSignOut} />;
  }

  // --- SHOP APP ---

  const renderPage = () => {
    if (isLoadingData) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
          <Loader2 size={40} className="animate-spin text-indigo-500" />
          <p className="font-bold animate-pulse">Connecting to Database...</p>
        </div>
      );
    }

    switch (activePage) {
      case 'collections':
        return <Collections items={catalog} onNavigateToStudio={() => setActivePage('studio')} />;
      case 'dashboard':
        return <Dashboard />;
      case 'catalog':
        return (
          <Catalog 
            items={catalog} 
            onAdd={(item) => setCatalog(prev => [item, ...prev])} 
            onRemove={handleRemoveFromCatalog}
          />
        );
      case 'customers':
        return <CustomerCapture customers={customers} onAdd={(c) => setCustomers(prev => [c, ...prev])} />;
      case 'studio':
        return (
          <Studio 
            customers={customers} 
            catalog={catalog} 
            onStartJob={handleStartJob}
          />
        );
      case 'gallery':
        return <Gallery items={galleryItems} />;
      case 'result':
        return generationResult ? (
          <ResultPreview 
            result={generationResult} 
            onBack={() => setActivePage('studio')} 
            onSaveToGallery={() => handleAddToGallery(generationResult)}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
             <button onClick={() => setActivePage('studio')} className="text-indigo-600 hover:underline">
               No active result. Return to Studio.
             </button>
          </div>
        );
      case 'settings':
        return <Settings />;
      default:
        return <Collections items={catalog} />;
    }
  };

  return (
    <Layout 
      activePage={activePage} 
      onNavigate={setActivePage}
      processingState={processingState}
      onSignOut={handleSignOut}
    >
      <InstallPWA />
      {renderPage()}
    </Layout>
  );
};

export default App;