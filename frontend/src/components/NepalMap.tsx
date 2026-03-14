"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

interface NepalMapProps {
    selectedDistrictId: string | null;
    onSelectDistrict: (id: string, name: string) => void;
}

const LeafletDistrictMap = dynamic(() => import("./LeafletDistrictMap"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full grid place-items-center bg-slate-950 text-slate-500 animate-pulse">
            <div className="flex flex-col items-center gap-4">
                <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">Loading Nepal Map...</p>
            </div>
        </div>
    ),
});

export default function NepalMap(props: NepalMapProps) {
    const Map = useMemo(() => LeafletDistrictMap, []);
    return <Map {...props} />;
}
