import React, { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { convertTimeToSeconds } from "./timeConverter";

import toast from "react-hot-toast";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { baseRunnerContract } from "../context/BaseRunnerContract";
import { parseAbi } from "viem";
import WalletWrapper from "./WalletWrapper";
import { useNavigate } from "react-router-dom";
import ViewScores from "./ViewScores";

function GameOverModal({ distance, time, collisions, restartGame }) {
  const convertedTime = convertTimeToSeconds(time) || 0;
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showViewScore, setShowViewScores] = useState(false);
  const navigate = useNavigate();
  const { writeContractAsync } = useWriteContract();
  const account = useAccount();
  const { isConnected, address: runnerAddress } = useAccount();
  const [gameToken, setGameToken] = useState(0);
  const abi = parseAbi(["function addScore(address,string) returns (string)"]);
  const getTokenAbi = parseAbi([
    "function getTokenBalance(address) view returns (uint256)",
  ]);

  // Calculate score whenever game stats change
  useEffect(() => {
    calculateScore();
  }, [distance, time, collisions]);

  const calculateScore = () => {
    const calculatedScore = Math.floor(
      distance * (1 + convertedTime / 100) - collisions * 50
    );
    setScore(calculatedScore);
  };

  const { data, error, refetch } = useReadContract({
    address: baseRunnerContract.address,
    abi: getTokenAbi,
    functionName: "getTokenBalance",
    args: isConnected ? [runnerAddress] : undefined,
    enabled: isConnected,
  });

  useEffect(() => {
    if (data) {
      console.log(data);
      setGameToken(data);
      //toast.success("Game Token fetched successfully!");
      refetch();
    }

    if (error) {
      toast.error("Failed to fetch Game Token");
    }
  }, [data, error]);

  const handleSaveScore = async () => {
    if (!isConnected) {
      toast.error("Please connect your Wallet!");
      return;
    }
    const scoreString = score + "pts";
    setLoading(true);
    try {
      // Call the contract's addScore function
      await writeContractAsync(
        {
          address: baseRunnerContract.address,
          abi: abi,
          functionName: "addScore",
          args: [account.address, scoreString],
        },
        {
          onSettled(data, error) {
            if (error) {
              toast.error("Transaction failed");
              console.error("Transaction failed:", error);
            } else {
              toast.success("Score saved successfully!");
            }
            setLoading(false);
            console.log("Settled", { data, error });
          },
        }
      );
    } catch (error) {
      setLoading(false);
      console.error("Transaction failed:", error);
    }
  };

  const handleViewScores = () => {
    setShowViewScores(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900 via-black to-gray-900 space-y-4">
      <div className="absolute top-8 left-10 flex items-center space-x-12">
        {/* Top left corner of screen */}
        {/* <ConnectButton /> */}
        <WalletWrapper text="Connect Wallet" />
      </div>
      {/* Game token top right */}
      <div className="absolute top-8 right-10 flex items-center gap-2 sm:gap-3 bg-white/80 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1 sm:py-1.5 shadow-md border border-gray-200">
        <span className="text-xs sm:text-sm font-bold text-gray-700">
          Game Token:{" "}
        </span>
        <div className="flex items-center justify-center w-6 h-6 sm:w-6 sm:h-6 md:w-5 md:h-5 bg-blue-500 rounded-full">
          <span className="text-white font-bold text-[0.6rem] sm:text-xs">
            {gameToken}
          </span>
        </div>
        <span className="text-black font-medium text-sm sm:text-md">BRT</span>
      </div>
      {/* End */}
      <div className="bg-black/80 backdrop-blur-lg p-8 rounded-xl border border-white/20 max-w-md w-1/2 h-fit shadow-2xl text-center transform animate-bounce-in">
        <div className="text-6xl font-bold text-red-500 mb-6">GAME OVER</div>

        <div className="space-y-4 mb-8">
          {/* Game stats display */}
          <StatRow label="Distance:" value={`${distance}m`} />
          <StatRow label="Time:" value={time} />
          <StatRow label="Collisions:" value={collisions} />
          <StatRow label="Score:" value={score} />
        </div>

        <div className="flex flex-col space-y-4">
          <GameButton
            onClick={restartGame}
            icon={
              <RotateCcw className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
            }
            label="PLAY AGAIN"
          />

          <GameButton
            onClick={handleSaveScore}
            label="SAVE SCORE"
            variant="secondary"
          />

          <GameButton
            onClick={handleViewScores}
            label="VIEW PAST SCORES"
            variant="tertiary"
          />
          {showViewScore ? <ViewScores /> : null}
        </div>
      </div>
    </div>
  );
}

// Reusable components
const StatRow = ({ label, value }) => (
  <div className="bg-black/40 rounded-lg p-3 flex justify-between">
    <span className="text-gray-400">{label}</span>
    <span className="text-white font-mono font-bold">{value}</span>
  </div>
);

const GameButton = ({ onClick, icon, label, variant = "primary" }) => {
  const variants = {
    primary:
      "from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700",
    secondary:
      "from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700",
    tertiary: "from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700",
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center z-50 mt-2 w-fit h-fit border-2 border-white justify-center mx-auto bg-gradient-to-r text-white font-bold py-3 px-8 rounded-md transition-all duration-300 shadow-lg hover:shadow-[color]/30 group ${variants[variant]}`}
    >
      {icon}
      {label}
    </button>
  );
};

export default GameOverModal;
