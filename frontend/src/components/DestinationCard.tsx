import { Star } from "lucide-react";

export default function DestinationCard({ destination }: { destination: any }) {
    return (
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all flex flex-col group cursor-pointer relative shadow-lg">
            <div className="h-40 w-full overflow-hidden relative">
                <img 
                    src={destination.image} 
                    alt={destination.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                    loading="lazy"
                />
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-xs font-semibold text-white uppercase tracking-wider shadow-sm border border-white/5">
                    {destination.category}
                </div>
                {destination.rating && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 text-yellow-400 text-xs font-bold bg-black/60 backdrop-blur-md border border-white/5 px-1.5 py-1 rounded-md shadow-sm">
                        <Star size={12} className="fill-current" />
                        {destination.rating}
                    </div>
                )}
            </div>
            <div className="p-4 flex flex-col flex-1">
                <h3 className="text-base font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">{destination.name}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed line-clamp-2">
                    {destination.description}
                </p>
            </div>
        </div>
    );
}
