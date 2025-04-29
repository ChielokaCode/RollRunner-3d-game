import React from "react";
import { AlertTriangle } from "lucide-react";

function CollisionCounter({ collisions }) {
  return (
    <div className="bg-black/50 backdrop-blur-md px-5 py-3 rounded-lg border border-white/10 shadow-xl">
      <div className="flex items-center space-x-2">
        <AlertTriangle className="w-6 h-6 text-red-500" />
        <div>
          <div className="text-sm text-red-400 font-bold uppercase tracking-widest">
            Collisions
          </div>
          <div className="text-3xl font-mono text-white font-bold tracking-wider">
            {collisions}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CollisionCounter;
