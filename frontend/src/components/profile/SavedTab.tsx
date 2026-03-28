"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { BookmarkMinus, MapPin, BookOpen, MountainSnow } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function SavedTab({ user: initialUser }: { user?: any }) {
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const categories = ['All', 'Destination', 'Story', 'Trek'];

  const fetchSavedDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/saved`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        // The backend now returns enriched items (title, image, district_name)
        // We just need to map them to the format expected by the UI (category, district)
        setSavedItems(data.savedItems.map((item: any) => ({
          ...item,
          category: item.item_type.charAt(0).toUpperCase() + item.item_type.slice(1),
          district: item.district_name || "Nepal"
        })));
      }
    } catch (err) {
      console.error("Error fetching saved items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedDetails();
  }, []);

  const handleRemove = async (savedId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/saved/${savedId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSavedItems(prev => prev.filter(item => item.id !== savedId));
      }
    } catch (err) {
      console.error("Failed to remove item", err);
    }
  };

  const filteredItems = savedItems.filter((item: any) => 
    activeFilter === 'All' ? true : item.category === activeFilter
  );

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Retrieving your archives...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6 border-b border-white/5 pb-6">
        <div>
          <h3 className="text-3xl font-black text-white tracking-tight">Saved Items</h3>
          <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-semibold">Your personal collection of wonders</p>
        </div>
        
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 h-fit overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap
                ${activeFilter === cat 
                  ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredItems.map((item: any) => (
          <div key={item.id} className="bg-slate-900/40 backdrop-blur-md rounded-[2rem] border border-white/10 overflow-hidden hover:border-white/20 hover:scale-[1.03] transition-all duration-500 group flex flex-col shadow-2xl">
            <div className="relative h-48 overflow-hidden w-full">
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-2 shadow-xl backdrop-blur-md border
                  ${item.category === 'Destination' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 
                    item.category === 'Story' ? 'bg-blue-500/20 text-blue-400 border-blue-500/20' : 
                    'bg-orange-500/20 text-orange-400 border-orange-500/20'}
                `}>
                  {item.category === 'Destination' ? <MapPin size={10} /> : 
                   item.category === 'Story' ? <BookOpen size={10} /> : 
                   <MountainSnow size={10} />}
                  {item.category}
                </span>
              </div>
              <button 
                onClick={() => handleRemove(item.id)}
                className="absolute top-4 right-4 p-2.5 bg-black/40 backdrop-blur-md rounded-full text-slate-400 hover:text-red-400 border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 transition-all opacity-0 group-hover:opacity-100 shadow-xl"
                title="Remove from saved"
              >
                <BookmarkMinus size={18} />
              </button>
            </div>
            
            <div className="p-6 flex flex-col flex-1 space-y-4">
              <h4 className="text-lg font-black text-white line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                {item.title}
              </h4>
              <div className="flex items-center justify-between mt-auto">
                <p className="text-xs font-bold text-slate-500 flex items-center gap-2 uppercase tracking-widest">
                  <MapPin size={14} className="text-blue-500" />
                  {item.district}
                </p>
                {item.category === 'Story' ? (
                    <button className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] hover:text-blue-300 transition-colors">Read Story</button>
                ) : (
                    <button className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] hover:text-emerald-300 transition-colors">Explore</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-24 bg-white/5 rounded-[2.5rem] border border-white/5 border-dashed flex flex-col items-center space-y-6">
          <div className="h-20 w-20 rounded-full bg-slate-900/60 flex items-center justify-center border border-white/10 text-slate-500">
             <BookmarkMinus size={32} strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-black text-white tracking-tight">Empty Archives</h4>
            <p className="text-slate-500 max-w-xs mx-auto font-medium text-sm leading-relaxed">
              No items have been committed to your permanent records in this category.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
