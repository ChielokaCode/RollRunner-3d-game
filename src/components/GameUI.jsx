// import React from "react";
// import HealthBar from "./HealthBar";
// import DistanceBar from "./DistanceBar";
// import GameTimer from "./GameTimer";
// import CollisionCounter from "./CollisionCounter";

// function GameUI({ actorLife, currentDistance, time, collisions }) {
//   return (
//     <div id="game-ui" className="absolute inset-0 pointer-events-none m-2">
//       <div className="absolute top-0 left-0 right-0 flex justify-between items-start p-4">
//         <div className="flex-shrink-0">
//           <CollisionCounter collisions={collisions} />
//         </div>

//         <div className="flex-shrink-0 flex flex-col gap-3 w-64">
//           <HealthBar health={actorLife} />
//           <DistanceBar distance={currentDistance} />
//         </div>
//       </div>

//       <div className="absolute top-10 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
//         <GameTimer time={time} />
//       </div>
//     </div>
//   );
// }

// export default GameUI;

import React from "react";
import HealthBar from "./HealthBar";
import CollisionCounter from "./CollisionCounter";
import DistanceBar from "./DistanceBar";
import GameTimer from "./GameTimer";

function GameUI({ actorLife, distance, time, collisions }) {
  return (
    <div id="game-ui" className="absolute inset-0 pointer-events-none z-[100]">
      {/* Top HUD Container */}
      <div className="fixed top-0 left-0 right-0 flex justify-between items-start p-6">
        {/* Left Side - Collisions */}
        <div className="flex-shrink-0">
          <CollisionCounter collisions={collisions} />
        </div>

        {/* Right Side - Status Bars */}
        <div className="flex-shrink-0 flex flex-col gap-4 w-80">
          <HealthBar health={actorLife} />
          <DistanceBar distance={distance} />
        </div>
      </div>

      {/* Center - Game Timer */}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2">
        <GameTimer time={time} />
      </div>
    </div>
  );
}

export default GameUI;
