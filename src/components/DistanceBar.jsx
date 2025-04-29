import React, { useMemo } from "react";

function DistanceBar({ distance }) {
  const maxDistance = 1000;
  const progress = Math.min(100, (distance / maxDistance) * 100);

  const markers = useMemo(() => {
    return [25, 50, 75].map((marker) => (
      <div
        key={marker}
        className="absolute h-full w-0.5 bg-white/40"
        style={{ left: `${marker}%` }}
      />
    ));
  }, []);

  return (
    <div className="relative">
      <div className="flex items-center mb-1 text-xs">
        <div className="w-5 h-5 mr-1.5 rounded-full border-2 border-white bg-blue-500 shadow-glow"></div>
        <span className="text-white font-bold tracking-wide text-sm uppercase">
          Distance
        </span>
        <span className="ml-auto text-white font-mono">{distance}m</span>
      </div>

      <div className="h-3 bg-black/60 backdrop-blur-sm rounded-full border border-white/20 overflow-hidden shadow-lg relative">
        {markers}
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}

export default DistanceBar;
