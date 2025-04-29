import React from "react";

function DistanceBar({ distance }) {
  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-1 text-xs bg-green-500 px-2 py-1">
        <div className="flex items-center">
          <div className="w-5 h-5 mr-1.5 rounded-full border-2 border-white bg-blue-500 shadow-glow"></div>
          <span className="text-white font-bold tracking-wide text-sm uppercase">
            Distance
          </span>
        </div>
        <span id="distance" className="text-white font-mono text-3xl">
          {distance}
        </span>
      </div>
    </div>
  );
}

export default DistanceBar;
