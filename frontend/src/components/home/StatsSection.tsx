import { MapPin, Navigation, BookHeart, MountainSnow } from "lucide-react";

export default function StatsSection() {
    const stats = [
        { label: "Districts", value: "77", icon: MapPin },
        { label: "Destinations", value: "120+", icon: Navigation },
        { label: "Travel Stories", value: "300+", icon: BookHeart },
        { label: "Treks & Hikes", value: "40+", icon: MountainSnow },
    ];

    return (
        <section className="py-16 bg-slate-950 border-b border-white/5">
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
                    {stats.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <div key={i} className="flex flex-col items-center text-center p-6 rounded-3xl bg-slate-900/50 border border-white/5 hover:border-white/10 transition-colors">
                                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
                                    <Icon size={24} />
                                </div>
                                <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                                <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">{stat.label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
