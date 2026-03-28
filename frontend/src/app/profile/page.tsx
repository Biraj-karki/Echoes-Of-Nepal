'use client'

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import ProfileOverview from '@/components/profile/ProfileOverview';
import MyStoriesTab from '@/components/profile/MyStoriesTab';
import MessagesTab from '@/components/profile/MessagesTab';
import SavedTab from '@/components/profile/SavedTab';
import RecentActivityTab from '@/components/profile/RecentActivityTab';
import SettingsTab from '@/components/profile/SettingsTab';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch("http://localhost:5000/api/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
           window.location.href = "/login";
        }
        throw new Error("Failed to fetch profile");
      }

      const data = await res.json();
      setUserProfile(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProfile();
  }, []);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <ProfileOverview user={userProfile} />;
      case 'stories':
        return <MyStoriesTab user={userProfile} />;
      case 'messages':
        return <MessagesTab user={userProfile} />;
      case 'saved':
        return <SavedTab user={userProfile} />;
      case 'activity':
        return <RecentActivityTab user={userProfile} />;
      case 'settings':
        return <SettingsTab user={userProfile} onProfileUpdate={fetchProfile} />;
      default:
        return <ProfileOverview user={userProfile} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Profile Not Found</h2>
          <p className="text-neutral-500">We couldn't load your profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30">
      {/* Navbar is in RootLayout, so we remove it here to avoid duplication */}
      
      {/* 
        Header Banner Area - pure aesthetic 
      */}
      <div className="h-56 md:h-72 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-emerald-900/40 mix-blend-overlay z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1544735716-43b9e4a3ed60?auto=format&fit=crop&q=80"
          alt="Himalayas"
          className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent z-20"></div>
        
        {/* Subtle animated particles hint (optional/aesthetic) */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#020617] to-transparent z-20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-32 relative z-30 pb-20">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0">
            {/* Make sidebar sticky on desktop */}
            <div className="lg:sticky lg:top-24">
              <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} user={userProfile} />
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 min-w-0 w-full">
            {/* Render the selected tab component */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-2 md:p-8 shadow-2xl transition-all duration-500">
              {renderActiveTab()}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

