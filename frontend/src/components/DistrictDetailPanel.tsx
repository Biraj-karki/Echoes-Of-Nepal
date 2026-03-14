import { useState } from "react";
import { X, MapPin, MountainSnow, BookOpen, Navigation } from "lucide-react";
import DestinationCard from "./DestinationCard";

type DistrictBase = {
    id: string;
    name: string;
    description: string;
    destinations: any[];
    stories: any[];
    treks: any[];
};

interface DistrictDetailPanelProps {
    district: DistrictBase | null;
    onClose: () => void;
}

export default function DistrictDetailPanel({ district, onClose }: DistrictDetailPanelProps) {
    const [activeTab, setActiveTab] = useState<"overview" | "destinations" | "stories" | "treks">("overview");

    if (!district) return null;

    const tabs = [
        { id: "overview", label: "Overview", icon: Navigation },
        { id: "destinations", label: "Destinations", icon: MapPin },
        { id: "stories", label: "Stories", icon: BookOpen },
        { id: "treks", label: "Treks", icon: MountainSnow },
    ] as const;

    return (
        <div className="absolute top-0 right-0 h-full w-full sm:w-[400px] md:w-[450px] bg-slate-950/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
            {/* Header */}
            <div className="p-6 border-b border-white/5 relative shrink-0">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mt-2">
                    {district.name}
                </h2>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-400 font-medium tracking-wide uppercase">
                    <span>{district.destinations.length} Destinations</span>
                    <span>•</span>
                    <span>{district.stories.length} Stories</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center px-4 pt-2 border-b border-white/5 shrink-0 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap text-sm font-medium ${
                                isActive 
                                ? "border-blue-400 text-blue-400" 
                                : "border-transparent text-slate-400 hover:text-slate-200"
                            }`}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {activeTab === "overview" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">About</h3>
                            <p className="text-slate-300 leading-relaxed text-sm">
                                {district.description}
                            </p>
                        </div>
                        {district.destinations.length === 0 && district.stories.length === 0 && (
                            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-sm">
                                We are still gathering data for this district. Be the first to share a story from {district.name}!
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "destinations" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {district.destinations.length > 0 ? (
                            district.destinations.map((dest, i) => (
                                <DestinationCard key={i} destination={dest} />
                            ))
                        ) : (
                            <p className="text-slate-400 text-sm italic text-center py-10">No popular destinations listed yet.</p>
                        )}
                    </div>
                )}

                {activeTab === "stories" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {district.stories.length > 0 ? (
                            district.stories.map((story, i) => (
                                <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group">
                                    <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors text-base">{story.title}</h4>
                                    <p className="text-xs text-slate-400 mt-1">By {story.author} • {new Date(story.date).toLocaleDateString()}</p>
                                    <p className="text-sm text-slate-300 mt-3 line-clamp-3 leading-relaxed">{story.excerpt}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-400 text-sm italic text-center py-10">No travel stories shared yet.</p>
                        )}
                    </div>
                )}

                {activeTab === "treks" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {district.treks && district.treks.length > 0 ? (
                            district.treks.map((trek, i) => (
                                <div key={i} className="p-4 bg-emerald-950/30 border border-emerald-500/20 rounded-xl flex justify-between items-center group hover:bg-emerald-900/40 transition-colors cursor-pointer relative overflow-hidden">
                                     <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500 rounded-l-xl"></div>
                                    <div>
                                        <h4 className="font-bold text-emerald-50">{trek.name}</h4>
                                        <div className="flex items-center gap-3 mt-1.5 text-xs text-emerald-200/70 font-medium">
                                            <span>{trek.duration}</span>
                                            <span>•</span>
                                            <span>{trek.difficulty}</span>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                        <MountainSnow size={16} />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-400 text-sm italic text-center py-10">No specific treks found in this district.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
