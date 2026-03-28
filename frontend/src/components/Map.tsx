"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full grid place-items-center bg-slate-900 text-slate-500">
            <p>Loading Map...</p>
        </div>
    ),
});

export default function MapWrapper(props: any) {
    const Map = useMemo(() => LeafletMap, []);
    return <Map {...props} />;
}
