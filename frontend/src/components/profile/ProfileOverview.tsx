import React from 'react';
import { BookOpen, Bookmark, MessageSquare, Map } from 'lucide-react';

export default function ProfileOverview({ user }: { user?: any }) {
  // Use dynamically passed user data
  const displayUser = user || {};

  const statCards = [
    { label: 'Stories Uploaded', value: displayUser.stats?.storiesUploaded || 0, icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'Saved Destinations', value: displayUser.stats?.savedDestinations || 0, icon: Bookmark, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Messages', value: displayUser.stats?.messages || 0, icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { label: 'Places Explored', value: displayUser.stats?.placesExplored || 0, icon: Map, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-10 border border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <h3 className="text-4xl font-black text-white tracking-tighter mb-3">
            Namaste, <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">{(displayUser.name || "Traveler").split(' ')[0]}</span>!
          </h3>
          <p className="text-slate-400 text-lg font-medium max-w-xl leading-relaxed">
            Welcome back to your journey. Your contribution to preserving the echoes of Nepal continues here.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`bg-slate-900/40 backdrop-blur-sm rounded-3xl p-8 border ${stat.border} flex flex-col items-center text-center gap-5 hover:scale-[1.02] hover:bg-slate-900/60 transition-all duration-300 group shadow-lg`}>
              <div className={`p-5 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform duration-500`}>
                <Icon size={28} className={stat.color} />
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-black text-white tracking-tighter transition-all duration-300 group-hover:tracking-tight">{stat.value}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Featured CTA */}
      <div className="relative rounded-[2.5rem] p-10 text-white overflow-hidden shadow-2xl group cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-emerald-700 z-0"></div>
        <img 
          src="https://images.unsplash.com/photo-1544735716-43b9e4a3ed60?auto=format&fit=crop&q=80" 
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay group-hover:scale-110 transition-transform duration-700" 
          alt="Adventure" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
        
        <div className="relative z-20 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="text-center lg:text-left space-y-3">
            <h3 className="text-3xl font-black tracking-tighter">Ready for your next summit?</h3>
            <p className="text-white/80 font-medium max-w-md leading-relaxed">
              New trails have been mapped in the Everest region. Be the first to share your story.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            <button className="flex-1 lg:flex-none px-10 py-4 bg-white text-[#020617] rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-100 transition-all shadow-xl shadow-black/20 hover:-translate-y-1 active:translate-y-0">
              Explore Map
            </button>
            <button className="flex-1 lg:flex-none px-10 py-4 bg-black/20 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black/40 transition-all hover:-translate-y-1 active:translate-y-0">
              Post Story
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

