import React from 'react';
import Image from 'next/image';
import { 
  User, 
  BookOpen, 
  MessageSquare, 
  Bookmark, 
  Activity, 
  Settings,
  MapPin,
  Calendar
} from 'lucide-react';

interface ProfileSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user?: any;
}

export default function ProfileSidebar({ activeTab, setActiveTab, user }: ProfileSidebarProps) {
  // Use dynamically passed user data
  const displayUser = user || {};

  const getInitials = (name: string) => {
      if (!name) return "U";
      return name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'stories', label: 'My Stories', icon: BookOpen },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'saved', label: 'Saved', icon: Bookmark },
    { id: 'activity', label: 'Recent Activity', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col h-full transition-all duration-300 hover:border-white/20">
      {/* Profile Header Card */}
      <div className="p-8 border-b border-white/5 flex flex-col items-center text-center">
        <div className="relative h-28 w-28 mb-6 group cursor-pointer">
          {/* Outer glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
          
          <div className="relative h-full w-full rounded-full bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-center font-bold text-4xl shadow-2xl border-2 border-white/10 overflow-hidden group-hover:scale-105 transition-transform duration-300">
            {displayUser.profileImage ? (
              <img 
                src={displayUser.profileImage} 
                alt={displayUser.name || "User"} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="bg-gradient-to-br from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                {getInitials(displayUser.name)}
              </span>
            )}
          </div>
        </div>

        <h2 className="text-2xl font-black text-white tracking-tight mb-1">
          {displayUser.name || "Adventurer"}
        </h2>
        
        {displayUser.username && (
          <p className="text-blue-400/80 text-sm font-semibold mb-4 tracking-wide uppercase">
            @{displayUser.username}
          </p>
        )}
        
        <p className="text-sm text-slate-400 mb-6 leading-relaxed px-2 font-medium">
          {displayUser.bio || "Crafting memories across the peaks and valleys of Nepal."}
        </p>

        <div className="flex flex-col gap-3 text-xs text-slate-500 w-full mt-2 font-semibold uppercase tracking-widest">
          {displayUser.location && (
            <div className="flex items-center gap-2 justify-center bg-white/5 py-2 px-4 rounded-full border border-white/5">
              <MapPin size={14} className="text-blue-400" />
              <span>{displayUser.location}</span>
            </div>
          )}
          {displayUser.joinDate && (
            <div className="flex items-center gap-2 justify-center py-2 px-4">
              <Calendar size={14} className="text-emerald-400" />
              <span>Joined {displayUser.joinDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex-1 p-6 flex flex-col gap-2 overflow-y-auto w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 text-left w-full group
                ${isActive 
                  ? 'bg-gradient-to-r from-blue-600/20 to-emerald-600/20 text-white border border-white/10 shadow-lg' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                }
              `}
            >
              <Icon size={20} className={`transition-colors duration-300 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-blue-400'}`} />
              <span className="text-sm font-bold tracking-wide uppercase">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

