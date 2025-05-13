import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import { baseRunnerContract } from "../context/BaseRunnerContract";
import { parseAbi } from "viem";
import { useReadContract } from "wagmi";
import { Navigate, useNavigate } from "react-router-dom";

const ViewScores = () => {
  const [scoresList, setScoreList] = useState([]);
  const { isConnected, address: runnerAddress } = useAccount();
  const abi = parseAbi([
    "function getAllScoresByRunner(address) view returns ((uint256 id, string score)[])",
  ]);
  const navigate = useNavigate();

  const { data, isLoading, error, refetch } = useReadContract({
    address: baseRunnerContract.address,
    abi: abi,
    functionName: "getAllScoresByRunner",
    args: isConnected ? [runnerAddress] : undefined,
    enabled: isConnected,
  });

  useEffect(() => {
    if (data) {
      console.log(data);
      setScoreList(data);
      toast.success("Scores fetched successfully!");
    }

    if (error) {
      toast.error("Failed to fetch Scores");
    }
  }, [data, error]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Error loading scores: {error}
                  {refetch && (
                    <button
                      onClick={refetch}
                      className="ml-2 text-red-600 font-medium underline hover:text-red-500 transition-colors"
                    >
                      Retry
                    </button>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (scoresList.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  No scores found for this player
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-10 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8 mx-4">
        <div className="relative">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold z-[9999]"
          >
            &times;
          </button>
          <div className="overflow-x-auto">
            <div className="min-w-full divide-y divide-gray-200">
              <div className="bg-gray-50">
                <span className="font-bold text-3xl">Player's Scores</span>
                <br />
                <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="col-span-2">ID</div>
                  <div className="col-span-10">Score</div>
                </div>
              </div>
              <div className="bg-white divide-y divide-gray-200">
                {scoresList.map((score) => (
                  <div
                    key={score.id.toString()}
                    className="grid grid-cols-12 gap-4 px-6 py-4"
                  >
                    <div className="col-span-2 text-sm font-medium text-gray-900">
                      #{score.id.toString()}
                    </div>
                    <div className="col-span-10 text-sm text-gray-500">
                      {score.score}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewScores;
