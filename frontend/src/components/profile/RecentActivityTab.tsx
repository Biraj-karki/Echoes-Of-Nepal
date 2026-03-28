import React from 'react';
import { Eye, Clock, Upload, Bookmark, Map } from 'lucide-react';
export default function RecentActivityTab({ user }: { user?: any }) {
  const recentActivity = user?.recentActivity || [];

  const getIconForType = (type: string) => {
    switch (type) {
      case 'viewed': return <Eye size={18} className="text-blue-400" />;
      case 'uploaded': return <Upload size={18} className="text-emerald-400" />;
      case 'saved': return <Bookmark size={18} className="text-blue-400" />;
      case 'explored': return <Map size={18} className="text-emerald-400" />;
      default: return <Clock size={18} className="text-slate-500" />;
    }
  };

  const getBgForType = (type: string) => {
    switch (type) {
      case 'viewed': return 'bg-blue-500/10 border-blue-500/20';
      case 'uploaded': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'saved': return 'bg-blue-500/10 border-blue-500/20';
      case 'explored': return 'bg-emerald-500/10 border-emerald-500/20';
      default: return 'bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="border-b border-white/5 pb-6">
        <h3 className="text-3xl font-black text-white tracking-tight">Recent Activity</h3>
        <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-semibold">Your footsteps across the echoes of Nepal</p>
      </div>

      <div className="relative border-l border-white/10 ml-6 space-y-12 pb-10">
        {recentActivity.map((activity: any) => (
          <div key={activity.id} className="relative pl-12 group">
            {/* Timeline dot/icon */}
            <div className={`absolute -left-[21px] top-0 w-10 h-10 rounded-2xl border flex items-center justify-center shadow-2xl z-20 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3
              ${getBgForType(activity.type)} backdrop-blur-md
            `}>
              {getIconForType(activity.type)}
            </div>
            
            <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/5 shadow-2xl hover:border-white/20 transition-all duration-500 group-hover:translate-x-1">
              <p className="text-white font-bold text-lg mb-2 tracking-tight group-hover:text-blue-400 transition-colors">{activity.description}</p>
              <div className="flex items-center text-xs text-slate-500 gap-2 font-black uppercase tracking-widest">
                <Clock size={12} className="text-blue-500" />
                {activity.timestamp}
              </div>
            </div>
          </div>
        ))}
        
        {/* End of timeline marker */}
        <div className="relative pl-12 pt-6">
          <div className="absolute -left-[5px] top-6 w-2.5 h-2.5 rounded-full bg-slate-800 border border-white/10 shadow-lg"></div>
        </div>
      </div>

      {recentActivity.length === 0 && (
        <div className="text-center py-24 bg-white/5 rounded-[2.5rem] border border-white/5 border-dashed flex flex-col items-center space-y-6">
          <div className="h-20 w-20 rounded-full bg-slate-900/60 flex items-center justify-center border border-white/10">
            <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-black text-white tracking-tight">Time stands still...</h4>
            <p className="text-slate-500 max-w-xs mx-auto font-medium text-sm leading-relaxed">
              Begin your journey by exploring the map or sharing a story.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

