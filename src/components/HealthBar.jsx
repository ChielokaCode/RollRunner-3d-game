import React from "react";

function HealthBar({ health }) {
  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-1 text-xs bg-red-500 px-1 sm:px-2 py-0.5 sm:py-1">
        <div className="flex items-center">
          <div className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-1.5 rounded-full border-2 border-white bg-blue-500 shadow-glow"></div>
          <p className="text-white font-bold tracking-wide text-xs sm:text-sm uppercase">
            Health
          </p>
        </div>
        <p
          id="player-life"
          className="text-white font-mono text-xl sm:text-2xl md:text-3xl"
        >
          {health}
        </p>
      </div>
    </div>
  );
}

export default HealthBar;
