import React from 'react';
import Image from 'next/image';
export default function MessagesTab({ user }: { user?: any }) {
  const messages = user?.messages || [];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="border-b border-white/5 pb-6 flex justify-between items-center">
        <div>
          <h3 className="text-3xl font-black text-white tracking-tight">Messages</h3>
          <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-semibold">Conversations with fellow explorers</p>
        </div>
        <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
          {messages.filter((m: any) => m.unread).length} New
        </span>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col divide-y divide-white/5">
        {messages.map((msg: any) => (
          <div 
            key={msg.id} 
            className={`p-6 flex gap-5 hover:bg-white/5 cursor-pointer transition-all duration-300 group
              ${msg.unread ? 'bg-blue-500/5' : ''}
            `}
          >
            <div className="relative flex-shrink-0 w-16 h-16">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full blur-sm opacity-0 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative w-full h-full rounded-full border-2 border-white/10 overflow-hidden shadow-xl">
                 <Image 
                  src={msg.senderImage} 
                  alt={msg.senderName} 
                  fill
                  sizes="64px"
                  className="rounded-full object-cover"
                />
              </div>
              {msg.unread && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-[#020617] rounded-full shadow-lg shadow-emerald-500/40"></span>
              )}
            </div>
            
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex justify-between items-baseline mb-1">
                <h4 className={`text-lg transition-colors duration-300 ${msg.unread ? 'font-black text-white' : 'font-bold text-slate-300 group-hover:text-white'}`}>
                  {msg.senderName}
                </h4>
                <span className="text-xs font-bold text-slate-500 whitespace-nowrap ml-2 uppercase tracking-tighter">
                  {msg.timestamp}
                </span>
              </div>
              <p className={`text-sm truncate leading-relaxed ${msg.unread ? 'text-slate-200 font-bold' : 'text-slate-400 font-medium'}`}>
                {msg.preview}
              </p>
            </div>
          </div>
        ))}
      </div>

      {messages.length === 0 && (
        <div className="text-center py-24 bg-white/5 rounded-[2.5rem] border border-white/5 border-dashed flex flex-col items-center space-y-6">
          <div className="h-20 w-20 rounded-full bg-slate-900/60 flex items-center justify-center border border-white/10">
            <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-black text-white tracking-tight">The silence of the valleys</h4>
            <p className="text-slate-500 max-w-xs mx-auto font-medium text-sm leading-relaxed">
              No new transmissions have reached your terminal yet.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

