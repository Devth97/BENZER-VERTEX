
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Loader2, Lock, ShoppingBag, ShieldCheck, AlertCircle } from 'lucide-react';
import { APP_NAME } from '../constants';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'shop' | 'admin'>('shop');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Authenticate with Supabase
      const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!session) throw new Error("No session created");

      // 2. Check Role in Profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        // If profile doesn't exist yet (race condition), allow if shop flow, but warn for admin
        console.warn("Profile fetch error:", profileError);
      }

      const role = profile?.role || 'shop'; // Default to shop if undefined

      // 3. Enforce separate flows
      if (activeTab === 'admin' && role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error("Access Denied: You do not have administrator privileges.");
      }

      if (activeTab === 'shop' && role === 'admin') {
         // Admins can technically log in as shops, allow it.
      }

      // Success
      onLoginSuccess();

    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.message || "Invalid login credentials.");
      // Ensure we don't leave a half-logged-in state if role check failed
      if (err.message && err.message.includes("Access Denied")) {
          await supabase.auth.signOut();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                <span className="text-3xl font-serif font-bold text-white">T</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-slate-800">{APP_NAME}</h1>
            <p className="text-slate-500 font-medium">Virtual Try-On Platform</p>
        </div>

        <div className="glass-card rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/60">
           {/* Tabs */}
           <div className="flex border-b border-white/30">
             <button
               onClick={() => { setActiveTab('shop'); setError(null); }}
               className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all
                 ${activeTab === 'shop' ? 'bg-white/50 text-indigo-700' : 'bg-transparent text-slate-500 hover:text-slate-700 hover:bg-white/20'}
               `}
             >
               <ShoppingBag size={18} />
               Shop Login
             </button>
             <button
               onClick={() => { setActiveTab('admin'); setError(null); }}
               className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all
                 ${activeTab === 'admin' ? 'bg-slate-800 text-white' : 'bg-transparent text-slate-500 hover:text-slate-700 hover:bg-white/20'}
               `}
             >
               <ShieldCheck size={18} />
               Admin Portal
             </button>
           </div>

           <div className="p-8 bg-white/40 backdrop-blur-md">
             <form onSubmit={handleLogin} className="space-y-5">
                <div>
                   <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Email Address</label>
                   <input 
                     type="email" 
                     required
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="w-full px-4 py-3 bg-white/60 border border-white/50 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900"
                     placeholder="name@company.com"
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Password</label>
                   <div className="relative">
                     <input 
                       type="password" 
                       required
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       className="w-full px-4 py-3 bg-white/60 border border-white/50 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900"
                       placeholder="••••••••"
                     />
                     <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   </div>
                </div>

                {error && (
                  <div className="bg-red-50/90 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-bold flex items-center gap-3 animate-pulse shadow-sm">
                    <AlertCircle size={20} className="flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 rounded-xl text-white font-bold shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2
                    ${activeTab === 'shop' 
                      ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30' 
                      : 'bg-slate-800 hover:bg-slate-900 shadow-slate-500/30'}
                  `}
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
                </button>
             </form>

             <div className="mt-6 text-center">
               <p className="text-xs text-slate-500">
                 {activeTab === 'shop' 
                   ? "Contact your administrator to create a shop account."
                   : "Restricted area. Authorized personnel only."}
               </p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};
