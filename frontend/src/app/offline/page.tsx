"use client";

import Link from "next/link";
import { Wifi, WifiOff, Home, Compass } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#020617] to-slate-900 px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <WifiOff size={80} className="text-slate-400 mb-4" />
        </div>

        <h1 className="text-4xl font-bold text-white mb-3">You're Offline</h1>

        <p className="text-slate-400 mb-8">
          It looks like you've lost your internet connection. Some features may be unavailable, but you can still browse cached pages.
        </p>

        <div className="space-y-3 mb-8">
          <p className="text-sm text-slate-500">
            ✓ Previously visited pages are available
          </p>
          <p className="text-sm text-slate-500">
            ✓ Downloaded guides and maps are accessible
          </p>
          <p className="text-sm text-slate-500">
            ✗ New content and live features require internet
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            <Home size={20} />
            Go to Home
          </Link>

          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            <Wifi size={20} />
            Retry Connection
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-8">
          Once you're back online, all features will work normally.
        </p>
      </div>
    </div>
  );
}
