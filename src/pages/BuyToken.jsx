import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { baseRunnerContract } from "../context/BaseRunnerContract";
import { parseAbi, parseEther } from "viem";
import { useNavigate } from "react-router-dom";

const BuyToken = () => {
  const navigate = useNavigate();
  const [gameToken, setGameToken] = useState(0);
  const account = useAccount();
  const { writeContractAsync } = useWriteContract();

  const { isConnected, address: runnerAddress } = useAccount();

  const getTokenAbi = parseAbi([
    "function getTokenBalance(address) view returns (uint256)",
  ]);
  const payEntryFeeAbi100 = parseAbi(["function payEntryFee100(address)"]);

  const payEntryFeeAbi500 = parseAbi(["function payEntryFee500(address)"]);
  const payEntryFeeAbi1000 = parseAbi(["function payEntryFee1000(address)"]);

  const { data, error } = useReadContract({
    address: baseRunnerContract.address,
    abi: getTokenAbi,
    functionName: "getTokenBalance",
    args: [runnerAddress], // Add your args here
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

  const handleBuy100BRT = async () => {
    if (!isConnected) {
      toast.error("Please connect your Wallet!");
      return;
    }

    try {
      await writeContractAsync(
        {
          address: baseRunnerContract.address,
          abi: payEntryFeeAbi100,
          functionName: "payEntryFee100",
          args: [account.address],
          value: parseEther("0.001"),
        },
        {
          onSettled: async (data, error) => {
            if (error) {
              toast.error("Insufficient Balance");
            } else {
              toast.success("100 BRT purchased successfully!");
            }
          },
        }
      );
    } catch (error) {
      console.log(error);
      toast.error("Purchase failed");
    }
  };

  const handleBuy500BRT = async () => {
    if (!isConnected) {
      toast.error("Please connect your Wallet!");
      return;
    }

    try {
      await writeContractAsync(
        {
          address: baseRunnerContract.address,
          abi: payEntryFeeAbi500,
          functionName: "payEntryFee500",
          args: [account.address],
          value: parseEther("0.005"),
        },
        {
          onSettled: async (data, error) => {
            if (error) {
              toast.error("Insufficient Balance");
              return;
            } else {
              toast.success("500 BRT purchased successfully!");
            }
          },
        }
      );
    } catch (error) {
      console.log(error);
      toast.error("Purchase failed");
    }
  };

  const handleBuy1000BRT = async () => {
    if (!isConnected) {
      toast.error("Please connect your Wallet!");
      return;
    }

    try {
      await writeContractAsync(
        {
          address: baseRunnerContract.address,
          abi: payEntryFeeAbi1000,
          functionName: "payEntryFee1000",
          args: [account.address],
          value: parseEther("0.01"),
        },
        {
          onSettled: async (data, error) => {
            if (error) {
              toast.error("Insufficient Balance");
              return;
            } else {
              toast.success("1000 BRT purchased successfully!");
            }
          },
        }
      );
    } catch (error) {
      console.log(error);
      toast.error("Purchase failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900 via-black to-gray-900">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-8 left-10 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        <span className="text-white font-bold">Back</span>
      </button>

      {/* Game Token display */}
      <div className="absolute top-8 right-10 flex items-center gap-2 sm:gap-3 bg-white/80 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1 sm:py-1.5 shadow-md border border-gray-200">
        <span className="text-xs sm:text-sm font-bold text-gray-700">
          Game Token:{" "}
        </span>
        <div className="flex items-center justify-center w-6 h-6 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-blue-500 rounded-full">
          <span className="text-white font-bold text-[0.6rem] sm:text-xs">
            {gameToken}
          </span>
        </div>
        <span className="text-black font-medium text-sm sm:text-md">BRT</span>
      </div>

      {/* Token packages */}

      <div className="flex flex-col md:flex-row gap-6 px-4 py-8">
        {/* 100 BRT Package */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden shadow-lg border border-white/20 transition-transform duration-300 hover:scale-105">
          <div className="p-6">
            <img
              src="/images/token-100.png" // Replace with your image path
              alt="100 BRT Token Package"
              className="w-full h-32 object-cover rounded-lg mb-4"
            />
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">100 BRT</h3>
              <p className="text-gray-300 mb-4">for 0.001 ETH</p>
              <button
                onClick={() => handleBuy100BRT()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Buy 100 BRT
              </button>
            </div>
          </div>
        </div>

        {/* 500 BRT Package */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden shadow-lg border border-white/20 transition-transform duration-300 hover:scale-105">
          <div className="p-6">
            <img
              src="/images/token-500.png" // Replace with your image path
              alt="500 BRT Token Package"
              className="w-full h-32 object-cover rounded-lg mb-4"
            />
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">500 BRT</h3>
              <p className="text-gray-300 mb-4">for 0.005 ETH</p>
              <button
                onClick={() => handleBuy500BRT()}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Buy 500 BRT
              </button>
            </div>
          </div>
        </div>

        {/* 1000 BRT Package */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden shadow-lg border border-white/20 transition-transform duration-300 hover:scale-105">
          <div className="p-6">
            <img
              src="/images/token-1000.png" // Replace with your image path
              alt="1000 BRT Token Package"
              className="w-full h-32 object-cover rounded-lg mb-4"
            />
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">1000 BRT</h3>
              <p className="text-gray-300 mb-4">for 0.01 ETH</p>
              <button
                onClick={() => handleBuy1000BRT()}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Buy 1000 BRT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyToken;
