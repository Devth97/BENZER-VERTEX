import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { LogOut, Users, ShoppingBag, Shield, Search, Loader2 } from 'lucide-react';

interface AdminDashboardProps {
  onSignOut: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSignOut }) => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      // Fetch profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
        {/* Background Mesh (Reused) */}
        <div className="fixed inset-0 z-0 mesh-bg opacity-50"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
           {/* Header */}
           <div className="glass-card p-6 rounded-2xl flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-slate-800 text-white rounded-xl shadow-lg">
                    <Shield size={24} />
                 </div>
                 <div>
                    <h1 className="text-2xl font-serif font-bold text-slate-800">Admin Dashboard</h1>
                    <p className="text-slate-500 font-medium">User Management & System Overview</p>
                 </div>
              </div>
              <button 
                onClick={onSignOut}
                className="px-5 py-2 bg-white text-red-600 font-bold text-sm rounded-xl hover:bg-red-50 border border-slate-200 transition-colors flex items-center gap-2"
              >
                <LogOut size={16} /> Sign Out
              </button>
           </div>

           {/* Stats Grid */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
                 <div className="p-4 bg-indigo-100 text-indigo-700 rounded-xl">
                    <Users size={24} />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Total Users</p>
                    <h3 className="text-3xl font-bold text-slate-800">{profiles.length}</h3>
                 </div>
              </div>
              <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
                 <div className="p-4 bg-emerald-100 text-emerald-700 rounded-xl">
                    <ShoppingBag size={24} />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Active Shops</p>
                    <h3 className="text-3xl font-bold text-slate-800">{profiles.filter(p => p.role === 'shop').length}</h3>
                 </div>
              </div>
              <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
                 <div className="p-4 bg-slate-200 text-slate-700 rounded-xl">
                    <Shield size={24} />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Admins</p>
                    <h3 className="text-3xl font-bold text-slate-800">{profiles.filter(p => p.role === 'admin').length}</h3>
                 </div>
              </div>
           </div>

           {/* User Table */}
           <div className="glass-card rounded-3xl overflow-hidden">
              <div className="px-8 py-6 border-b border-white/40 flex justify-between items-center bg-white/40">
                 <h3 className="font-bold text-lg text-slate-800">Registered Users</h3>
                 <button onClick={fetchProfiles} className="text-indigo-600 text-sm font-bold hover:underline">Refresh List</button>
              </div>

              {loading ? (
                <div className="p-20 flex justify-center">
                   <Loader2 className="animate-spin text-indigo-600" size={32} />
                </div>
              ) : (
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead className="bg-white/30 text-xs uppercase font-bold text-slate-500">
                         <tr>
                            <th className="px-8 py-4">ID / Email</th>
                            <th className="px-8 py-4">Role</th>
                            <th className="px-8 py-4">Shop Name</th>
                            <th className="px-8 py-4">Joined</th>
                            <th className="px-8 py-4">Status</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/40">
                         {profiles.map((profile) => (
                            <tr key={profile.id} className="hover:bg-white/20 transition-colors">
                               <td className="px-8 py-4">
                                  <span className="font-mono text-xs text-slate-500">{profile.id.substring(0,8)}...</span>
                               </td>
                               <td className="px-8 py-4">
                                  <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase
                                    ${profile.role === 'admin' ? 'bg-slate-800 text-white' : 'bg-indigo-100 text-indigo-700'}
                                  `}>
                                     {profile.role}
                                  </span>
                               </td>
                               <td className="px-8 py-4 font-bold text-slate-800">
                                  {profile.shop_name || '—'}
                               </td>
                               <td className="px-8 py-4 text-sm text-slate-600">
                                  {new Date(profile.created_at).toLocaleDateString()}
                               </td>
                               <td className="px-8 py-4">
                                  <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                                     <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Active
                                  </span>
                               </td>
                            </tr>
                         ))}
                         {profiles.length === 0 && (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">No profiles found.</td></tr>
                         )}
                      </tbody>
                   </table>
                </div>
              )}
           </div>
        </div>
    </div>
  );
};
