import React, { useEffect, useState } from "react";
// import { useAccount } from "wagmi";
import { Play } from "lucide-react";
import WalletWrapper from "./WalletWrapper";
import { userOutlineIcon } from "@progress/kendo-svg-icons";

import "@coinbase/onchainkit/styles.css";
import Login from "./Login";
import { Button } from "@progress/kendo-react-buttons";
import { SvgIcon } from "@progress/kendo-react-common";

import toast from "react-hot-toast";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { baseRunnerContract } from "../context/BaseRunnerContract";
import { parseAbi, parseEther } from "viem";

function StartModal({ onStart }) {
  const [isLogin, setIsLogin] = useState(false);
  const [gameToken, setGameToken] = useState(0);
  const { writeContractAsync } = useWriteContract();
  const account = useAccount();
  const { isConnected, address: runnerAddress } = useAccount();
  const abi = parseAbi(["function checkRunner(address) returns (bool)"]);
  const getTokenAbi = parseAbi([
    "function getTokenBalance(address) view returns (uint256)",
  ]);
  const payEntryFeeAbi = parseAbi(["function payEntryFee(address)"]);

  const handleLogin = () => {
    setIsLogin(true);
  };

  const { data, error } = useReadContract({
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
      toast.success("Game Token fetched successfully!");
    }

    if (error) {
      toast.error("Failed to fetch Game Token");
    }
  }, [data, error]);

  const handleCloseLogin = () => {
    setIsLogin(!isLogin);
  };

  const handleCheckRunnerRegistered = async (e) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error("Please connect your Wallet!");
      return;
    }
    //TODO: fix this for unregistered runner still playing game, the check if registered is not working correctly for unregisterd runners
    try {
      await writeContractAsync(
        {
          address: baseRunnerContract.address,
          abi: abi,
          functionName: "checkRunner",
          args: [account.address],
        },
        {
          onSettled: async (data, error) => {
            if (error) {
              toast.error("Player hasn't logged in yet");
              return;
            }

            try {
              await writeContractAsync(
                {
                  address: baseRunnerContract.address,
                  abi: payEntryFeeAbi,
                  functionName: "payEntryFee",
                  args: [account.address],
                  value: parseEther("0.001"), // Ensure entry fee is sent
                },
                {
                  onSettled: (data, error) => {
                    if (error) {
                      toast.error("Error paying Entry Fee");
                    } else {
                      toast.success("Starting Game!");
                      onStart();
                    }
                  },
                }
              );
            } catch (error) {
              toast.error("Failed to process entry fee");
              console.error("Transaction failed", error);
            }
          },
        }
      );
    } catch (error) {
      toast.error("Failed to check runner registration");
      console.error("Transaction failed", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900 via-black to-gray-900">
      <div className="absolute top-8 left-10 flex items-center space-x-12">
        {/* Top left corner of screen */}
        <WalletWrapper text="Connect Wallet" />
        <div className="ml-6">
          <div
            onClick={handleLogin}
            className="w-8 h-8 bg-white border-2 rounded-md border-blue-500 cursor-pointer transition-colors duration-200 flex items-center justify-center"
          >
            <SvgIcon
              icon={userOutlineIcon}
              className="w-5 h-5 text-gray-500 transition duration-75"
            />
            {isLogin ? <Login onClose={handleCloseLogin} /> : null}
          </div>
        </div>
      </div>
      <div className="absolute top-8 right-10 flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-md border border-gray-200">
        <span className="text-sm font-bold text-gray-700">Game Token: </span>
        <div className="flex items-center justify-center w-7 h-7 bg-blue-500 rounded-full">
          <span className="text-white font-bold text-xs">{gameToken}</span>
        </div>
        <span className="text-black font-medium text-md">BRT</span>
      </div>

      <div className="bg-black/80 backdrop-blur-lg p-8 rounded-xl border border-white/20 max-w-md w-full h-fit shadow-2xl text-center transform transition-all hover:scale-105">
        <h1 className="text-3xl font-bold text-white mb-6">
          Welcome, BASE RUNNER
        </h1>

        <div className="text-cyan-400 mb-8">
          Navigate the obstacles and survive as long as possible!
        </div>

        <br />
        <div className="flex justify-center h-10">
          <button
            onClick={handleCheckRunnerRegistered}
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
          <div className="flex flex-col items-center">
            <div className="bg-gray-700 w-10 h-10 rounded-lg flex items-center justify-center mb-1">
              M
            </div>
            <span>Music</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-gray-700 w-10 h-10 rounded-lg flex items-center justify-center mb-1">
              Z
            </div>
            <span>Zoom In</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-gray-700 w-10 h-10 rounded-lg flex items-center justify-center mb-1">
              X
            </div>
            <span>Zoom out</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StartModal;
