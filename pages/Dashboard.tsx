import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CreditCard, Image as ImageIcon, Users, TrendingUp } from 'lucide-react';

const data = [
  { name: 'Mon', previews: 12 },
  { name: 'Tue', previews: 19 },
  { name: 'Wed', previews: 32 },
  { name: 'Thu', previews: 24 },
  { name: 'Fri', previews: 45 },
  { name: 'Sat', previews: 58 },
  { name: 'Sun', previews: 38 },
];

export const Dashboard: React.FC = () => {
  const stats = [
    { label: 'Total Previews', value: '1,284', icon: ImageIcon, color: 'text-blue-600', bg: 'bg-blue-100/50' },
    { label: 'Active Customers', value: '342', icon: Users, color: 'text-green-600', bg: 'bg-green-100/50' },
    { label: 'Revenue (Est)', value: '$4,320', icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-100/50' },
    { label: 'Conversion Rate', value: '24%', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-100/50' },
  ];

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-slate-800">Dashboard</h2>
          <p className="text-slate-500 font-medium">Overview of your shop's performance</p>
        </div>
        <div className="text-sm font-semibold text-indigo-600 bg-indigo-50/50 px-4 py-2 rounded-xl border border-indigo-100/50">
           Last updated: Just now
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="glass-card p-6 rounded-2xl flex items-center gap-4 hover:transform hover:-translate-y-1 transition-transform duration-300">
            <div className={`p-4 rounded-xl ${stat.bg} backdrop-blur-sm`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-8 rounded-3xl">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Weekly Previews Generated</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: 'rgba(99, 102, 241, 0.1)'}}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '12px', 
                    border: '1px solid rgba(255,255,255,0.5)', 
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="previews" fill="url(#colorGradient)" radius={[6, 6, 6, 6]} barSize={32} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3 p-3 hover:bg-white/40 rounded-xl transition-colors cursor-pointer group">
                <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500 group-hover:bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.6)] flex-shrink-0 transition-colors" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">Generated preview for "Summer Floral Dress"</p>
                  <p className="text-xs text-slate-500 font-medium">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};