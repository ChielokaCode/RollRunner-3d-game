// import React from "react";

// const GameOverModal = ({ distance, time, restartGame }) => {
//   return (
//     <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center">
//       <div className="bg-white p-8 rounded-lg shadow-lg w-96">
//         <h2 className="text-3xl font-semibold text-center text-red-600">
//           Game Over!
//         </h2>
//         <p className="mt-4 text-lg text-center">
//           New Distance Score!! Keep it up
//         </p>
//         <p className="mt-4 text-lg text-center">
//           Distance: <span>{Math.floor(distance)} meters</span>
//         </p>
//         <p className="mt-4 text-lg text-center">
//           Time: <span>{time}</span>
//         </p>
//         <div className="mt-6 flex justify-center">
//           <button
//             onClick={restartGame}
//             className="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-400"
//           >
//             Restart Game
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default GameOverModal;

import React from "react";
import { RotateCcw } from "lucide-react";
import { convertTimeToSeconds } from "./timeConverter";

function GameOverModal({ distance, time, collisions, restartGame }) {
  const convertedTime = convertTimeToSeconds(time) || 0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900 via-black to-gray-900">
      <div className="bg-black/80 backdrop-blur-lg p-8 rounded-xl border border-white/20 max-w-md w-1/2 h-1/2 shadow-2xl text-center transform animate-bounce-in">
        <h2 className="text-3xl font-bold text-red-500 mb-6">GAME OVER</h2>
        <br />
        <div className="space-y-4 mb-8">
          <div className="bg-black/40 rounded-lg p-3 flex justify-between">
            <span className="text-gray-400">Distance:</span>
            <span className="text-white font-mono font-bold">{distance}m</span>
          </div>
          <br />
          <div className="bg-black/40 rounded-lg p-3 flex justify-between">
            <span className="text-gray-400">Time:</span>
            <span className="text-white font-mono font-bold">{time}</span>
          </div>
          <br />
          <div className="bg-black/40 rounded-lg p-3 flex justify-between">
            <span className="text-gray-400">Collisions:</span>
            <span className="text-white font-mono font-bold">{collisions}</span>
          </div>
          <br />
          <div className="bg-black/40 rounded-lg p-3 flex justify-between">
            <span className="text-gray-400">Score:</span>
            <span className="text-white font-mono font-bold">
              {Math.floor(
                distance * (1 + convertedTime / 100) - collisions * 50
              )}
            </span>
          </div>
        </div>

        <button
          onClick={restartGame}
          className="flex items-center text-center justify-center mx-auto bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 px-8 rounded-full hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/30 group"
        >
          <RotateCcw className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
}

export default GameOverModal;
