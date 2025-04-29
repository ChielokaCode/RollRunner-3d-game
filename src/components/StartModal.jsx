import React from "react";
import { useAccount } from "wagmi";
import { Play } from "lucide-react";
import WalletWrapper from "./WalletWrapper";

import "@coinbase/onchainkit/styles.css";

function StartModal({ onStart }) {
  const { isConnected } = useAccount();

  const handleStartClick = () => {
    if (isConnected) {
      onStart();
    } else {
      alert("Please connect your wallet to start the game.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900 via-black to-gray-900">
      <div className="absolute top-4 left-4">
        {/* Top left corner of screen */}
        {/* <ConnectButton /> */}
        <WalletWrapper text="Connect Wallet" />
      </div>
      <div className="bg-black/80 backdrop-blur-lg p-8 rounded-xl border border-white/20 max-w-md w-96 h-1/3 shadow-2xl text-center transform transition-all hover:scale-105">
        <h1 className="text-3xl font-bold text-white mb-6">
          Welcome, BASE RUNNER
        </h1>

        <div className="text-cyan-400 mb-8">
          Navigate the obstacles and survive as long as possible!
        </div>

        <br />
        <div className="flex justify-center h-10">
          <button
            onClick={handleStartClick}
            className="flex items-center justify-center text-center bg-blue-600 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-8 w-80 rounded-md hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-cyan-500/30 group"
          >
            <Play className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
            START GAME
          </button>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 text-xs text-gray-400 space-y-6">
          <div className="flex flex-col items-center">
            <div className="bg-gray-700 w-10 h-10 rounded-lg flex items-center justify-center mb-1">
              Space
            </div>
            <span>Jump</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-gray-700 w-10 h-10 rounded-lg flex items-center justify-center mb-1">
              A
            </div>
            <span>Left</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-gray-700 w-10 h-10 rounded-lg flex items-center justify-center mb-1">
              D
            </div>
            <span>Right</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StartModal;
