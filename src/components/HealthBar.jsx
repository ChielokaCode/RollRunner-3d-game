import React, { useMemo } from "react";

function HealthBar({ health }) {
  const healthColor = useMemo(() => {
    if (health > 70) return "bg-gradient-to-r from-emerald-500 to-green-500";
    if (health > 30) return "bg-gradient-to-r from-yellow-500 to-amber-500";
    return "bg-gradient-to-r from-red-600 to-rose-500";
  }, [health]);

  const pulseEffect = useMemo(() => {
    return health <= 20 ? "animate-pulse" : "";
  }, [health]);

  return (
    <div className="relative">
      <div className="flex items-center mb-1 text-xs">
        <div className="w-5 h-5 mr-1.5 rounded-full border-2 border-white bg-red-500 shadow-glow"></div>
        <span className="text-white font-bold tracking-wide text-sm uppercase">
          Health
        </span>
        <span className="ml-auto text-white font-mono">{health}%</span>
      </div>

      <div className="h-4 bg-black/60 backdrop-blur-sm rounded-full border border-white/20 overflow-hidden shadow-lg">
        <div
          className={`h-full ${healthColor} ${pulseEffect} transition-all duration-300 ease-out`}
          style={{ width: `${health}%` }}
        ></div>
      </div>
    </div>
  );
}

export default HealthBar;
