import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { baseRunnerContract } from "../context/BaseRunnerContract";
import { parseAbi, parseEther } from "viem";
import { useNavigate } from "react-router-dom";

const MarketPlacePage = () => {
  const [runnerList, setRunnerList] = useState([]);
  const [transferAmount, setTransferAmount] = useState("");
  const { isConnected, address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  // Correct ABI for getAllRunners and transferTokens
  const runnerAbi = parseAbi([
    "function getAllRunners() view returns ((uint256,address,string,bool,(uint256,string)[],uint256)[])",
  ]);
  const transferTokenAbi = parseAbi([
    "function transferTokens(address,address,uint256) returns (string)",
  ]);

  // Fetch all runners
  const { data, isLoading, error, refetch } = useReadContract({
    address: baseRunnerContract.address,
    abi: runnerAbi,
    functionName: "getAllRunners",
  });

  useEffect(() => {
    if (data) {
      const formattedRunners = data.map((runner) => ({
        id: runner[0],
        runnerAddress: runner[1],
        runnerName: runner[2],
        isRegistered: runner[3],
        scoreList: runner[4].map((score) => ({
          id: score[0],
          score: score[1],
        })),
        tokenBalance: runner[5],
      }));

      setRunnerList(formattedRunners);
      console.log("Formatted runners:", formattedRunners);
      toast.success("Runners fetched successfully!");
    }
    if (error) {
      toast.error("Failed to fetch runners");
      console.log(error);
    }
  }, [data, error]);

  // Handle token transfer
  const handleTransfer = async (toAddress) => {
    if (!transferAmount || isNaN(Number(transferAmount))) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      await writeContractAsync({
        address: baseRunnerContract.address,
        abi: transferTokenAbi,
        functionName: "transferTokens",
        args: [address, toAddress, parseEther(transferAmount)],
      });
      toast.success(`Transferred ${transferAmount} tokens successfully!`);
      refetch(); // Refresh the list
    } catch (err) {
      toast.error("Transfer failed");
      console.error(err);
    }
  };

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
                  Error loading runners: {error.message}
                  <button
                    onClick={refetch}
                    className="ml-2 text-red-600 font-medium underline hover:text-red-500 transition-colors"
                  >
                    Retry
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-10 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl my-8 mx-4">
        <div className="relative p-6">
          <button
            onClick={handleBack}
            className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
          >
            &times;
          </button>
          <h1 className="text-2xl font-bold mb-6">All Runners</h1>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scores
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {runnerList.map((runner) => {
                  if (runner.runnerAddress === address) {
                    return null; // Skip this runner
                  }
                  <tr key={`runner-${runner.id?.toString()}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{runner.id?.toString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-md text-black">
                      {runner.runnerAddress?.substring(0, 6)}...
                      {runner.runnerAddress?.substring(38)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {runner.runnerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {runner.isRegistered ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Registered
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Unregistered
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {runner.tokenBalance} BRT
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1 max-h-20 overflow-y-auto">
                        {runner.scoreList?.map((score) => (
                          <span
                            key={`score-${runner.id}-${score.id}`}
                            className="text-xs px-1 py-0.5 bg-gray-100 rounded"
                          >
                            #{score.id}: {score.score}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          placeholder="Amount"
                          className="border rounded px-2 py-1 w-24 text-sm"
                          min="0"
                          step="0.001"
                        />
                        <button
                          onClick={() => handleTransfer(runner.runnerAddress)}
                          className="bg-blue-500 w-fit h-fit border-2 border-black hover:bg-blue-700 text-black font-bold py-1 px-3 rounded text-sm"
                        >
                          Transfer
                        </button>
                      </div>
                    </td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketPlacePage;
