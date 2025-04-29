import React from "react";

function GameTimer({ time }) {
  return (
    <div className="text-center">
      <div className="bg-black/50 backdrop-blur-md px-8 py-3 rounded-xl border border-white/10 shadow-xl">
        <div className="text-sm text-cyan-400 font-bold mb-1 uppercase tracking-widest">
          Time
        </div>
        <div className="text-5xl font-mono text-white font-bold tracking-wider">
          {time}
        </div>
      </div>
    </div>
  );
}

export default GameTimer;
