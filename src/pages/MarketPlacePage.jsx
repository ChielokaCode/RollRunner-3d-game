// import React, { useEffect, useState } from "react";
// import toast from "react-hot-toast";
// import { useAccount, useReadContract, useWriteContract } from "wagmi";
// import { baseRunnerContract } from "../context/BaseRunnerContract";
// import { parseAbi, parseEther } from "viem";
// import { useNavigate } from "react-router-dom";
// import { writeContract, waitForTransactionReceipt } from "@wagmi/core";
// import WalletWrapper from "../components/WalletWrapper";
// import { config } from "../wagmi";

// const MarketPlacePage = () => {
//   const [runnerList, setRunnerList] = useState([]);
//   const [transferAmount, setTransferAmount] = useState({});
//   const [gameToken, setGameToken] = useState(0);
//   const { isConnected, address: runnerAddress } = useAccount();
//   const { writeContractAsync } = useWriteContract();
//   const navigate = useNavigate();
//   const account = useAccount();
//   const getTokenAbi = parseAbi([
//     "function getTokenBalance(address) view returns (uint256)",
//   ]);

//   const handleBack = () => {
//     navigate(-1);
//   };

//   // Correct ABI for getAllRunners and transferTokens
//   const runnerAbi = parseAbi([
//     "function getAllRunners() view returns ((uint256,address,string,bool,(uint256,string)[],uint256)[])",
//   ]);
//   const transferTokenAbi = parseAbi([
//     "function transferTokens(address,address,uint256) returns (string)",
//   ]);

//   // Fetch all runners
//   const {
//     data: getAllRunnersData,
//     isLoading,
//     error: getAllRunnersError,
//     refetch,
//   } = useReadContract({
//     address: baseRunnerContract.address,
//     abi: runnerAbi,
//     functionName: "getAllRunners",
//   });

//   useEffect(() => {
//     if (!isConnected) return;
//     if (getAllRunnersData) {
//       const formattedRunners = data.map((runner) => ({
//         id: runner[0],
//         runnerAddress: runner[1],
//         runnerName: runner[2],
//         isRegistered: runner[3],
//         scoreList: runner[4].map((score) => ({
//           id: score[0],
//           score: score[1],
//         })),
//         tokenBalance: runner[5],
//       }));

//       setRunnerList(formattedRunners);
//       console.log("Formatted runners:", formattedRunners);
//       toast.success("Runners fetched successfully!");
//     }
//     if (getAllRunnersError) {
//       toast.error("Failed to fetch runners");
//       console.log(getAllRunnersError);
//     }
//   }, [getAllRunnersData, getAllRunnersError]);

//   const handleTransfer = async (toAddress, amount) => {
//     if (!amount || isNaN(Number(amount))) {
//       toast.error("Please enter a valid amount");
//       return;
//     }

//     if (!isConnected) {
//       toast.error("Please connect your Wallet!");
//       return;
//     }

//     try {
//       // 1. Send the transaction, get the hash
//       const { hash } = await writeContract(config, {
//         account: runnerAddress,
//         address: baseRunnerContract.address,
//         abi: transferTokenAbi,
//         functionName: "transferTokens",
//         args: [runnerAddress, toAddress, amount],
//       });

//       toast.success("Transaction sent, waiting for confirmation...");

//       // 2. Wait for it to be mined
//       const receipt = await waitForTransactionReceipt(config, { hash });

//       // 3. Check if successful
//       if (receipt.status === "success") {
//         toast.success(`Transferred ${amount} tokens successfully!`);
//         console.log("Successful Receipt:", receipt);
//         window.location.reload();
//       } else {
//         toast.error("Transaction failed after being mined.");
//         console.warn("Failed receipt:", receipt);
//       }
//     } catch (err) {
//       toast.error("Transfer failed");
//       console.error(err);
//     }
//   };

//   const { data, error } = useReadContract({
//     address: baseRunnerContract.address,
//     abi: getTokenAbi,
//     functionName: "getTokenBalance",
//     args: isConnected ? [runnerAddress] : undefined,
//     enabled: isConnected,
//   });

//   useEffect(() => {
//     if (data) {
//       console.log(data);
//       setGameToken(data);
//       toast.success("Game Token fetched successfully!");
//     }

//     if (error) {
//       toast.error("Failed to fetch Game Token");
//     }
//   }, [data, error]);

//   if (isLoading) {
//     return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900 via-black to-gray-900">
//         <div className="bg-white/20 p-8 rounded-lg backdrop-blur-md shadow-lg max-w-md w-full">
//           <div className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (getAllRunnersError) {
//     return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900 via-black to-gray-900">
//         <div className="bg-white/20 p-8 rounded-lg backdrop-blur-md shadow-lg max-w-md w-full">
//           <div className="bg-red-100/50 border-l-4 border-red-500 p-4">
//             <div className="flex">
//               <div className="flex-shrink-0">
//                 <svg
//                   className="h-5 w-5 text-red-500"
//                   viewBox="0 0 20 20"
//                   fill="currentColor"
//                 >
//                   <path
//                     fillRule="evenodd"
//                     d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//               </div>
//               <div className="ml-3">
//                 <p className="text-sm text-red-700">
//                   Error loading runners: {getAllRunnersError.message}
//                   <button
//                     onClick={refetch}
//                     className="ml-2 text-red-600 font-medium underline hover:text-red-500 transition-colors"
//                   >
//                     Retry
//                   </button>
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="fixed inset-0 z-50 flex justify-center bg-gradient-to-br from-blue-900 via-black to-gray-900 p-4 overflow-y-auto">
//       <div className="absolute top-8 right-10 flex items-center space-x-12">
//         {/* Top left corner of screen */}
//         <WalletWrapper text="Connect Wallet" />
//       </div>
//       {/* Game Token top right */}
//       <div className="absolute top-8 right-10 flex items-center gap-2 sm:gap-3 bg-white/80 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1 sm:py-1.5 shadow-md border border-gray-200">
//         <span className="text-xs sm:text-sm font-bold text-gray-700">
//           Game Token:{" "}
//         </span>
//         <div className="flex items-center justify-center w-6 h-6 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-blue-500 rounded-full">
//           <span className="text-white font-bold text-[0.6rem] sm:text-xs">
//             {gameToken}
//           </span>
//         </div>
//         <span className="text-black font-medium text-sm sm:text-md">BRT</span>
//       </div>
//       <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl w-full max-w-6xl my-8 border border-white/20">
//         <div className="relative p-6">
//           <button
//             onClick={handleBack}
//             className="absolute top-6 left-6 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200"
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="h-6 w-6 text-white"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M10 19l-7-7m0 0l7-7m-7 7h18"
//               />
//             </svg>
//           </button>
//           <h1 className="text-3xl font-bold mb-6 text-white text-center">
//             All Runners
//           </h1>

//           <div className="overflow-x-auto rounded-lg border border-white/20">
//             <table className="min-w-full divide-y divide-white/20">
//               <thead className="bg-white/10">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
//                     ID
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
//                     Address
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
//                     Name
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
//                     Balance
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
//                     Scores
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white/5 divide-y divide-white/10">
//                 {runnerList.map((runner) => {
//                   if (runner.runnerAddress === account.address) {
//                     return null; // Skip this runner
//                   }
//                   return (
//                     <tr
//                       key={`runner-${runner.id?.toString()}`}
//                       className="hover:bg-white/10 transition-colors"
//                     >
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
//                         #{runner.id?.toString()}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
//                         {runner.runnerAddress?.substring(0, 6)}...
//                         {runner.runnerAddress?.substring(38)}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
//                         {runner.runnerName}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm">
//                         {runner.isRegistered ? (
//                           <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-500/20 text-green-400">
//                             Registered
//                           </span>
//                         ) : (
//                           <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-500/20 text-red-400">
//                             Unregistered
//                           </span>
//                         )}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
//                         {runner.tokenBalance?.toString()} BRT
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex flex-col space-y-1 max-h-20 overflow-y-auto">
//                           {runner.scoreList?.map((score) => (
//                             <span
//                               key={`score-${runner.id}-${score.id}`}
//                               className="text-xs px-1 py-0.5 bg-white/10 rounded text-white/80"
//                             >
//                               #{score.id}: {score.score}
//                             </span>
//                           ))}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm">
//                         <div className="flex items-center space-x-2">
//                           <input
//                             type="number"
//                             value={transferAmount[runner.runnerAddress] || ""}
//                             onChange={(e) =>
//                               setTransferAmount({
//                                 ...transferAmount,
//                                 [runner.runnerAddress]: e.target.value,
//                               })
//                             }
//                             placeholder="Amount"
//                             className="border border-white/20 bg-white/10 rounded px-2 py-1 w-24 text-sm text-white placeholder-white/50"
//                             min="0"
//                             step="0.001"
//                           />

//                           <button
//                             onClick={() =>
//                               handleTransfer(
//                                 runner.runnerAddress,
//                                 transferAmount[runner.runnerAddress]
//                               )
//                             }
//                             className="bg-blue-600 border-2 border-green-500 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded text-sm transition-colors"
//                           >
//                             Transfer
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MarketPlacePage;

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { baseRunnerContract } from "../context/BaseRunnerContract";
import { parseAbi } from "viem";
import { useNavigate } from "react-router-dom";
import { writeContract, waitForTransactionReceipt } from "@wagmi/core";
import WalletWrapper from "../components/WalletWrapper";
import { config } from "../wagmi";

const MarketPlacePage = () => {
  const [runnerList, setRunnerList] = useState([]);
  const [transferAmount, setTransferAmount] = useState({});
  const [gameToken, setGameToken] = useState(0);
  const { isConnected, address: runnerAddress } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const navigate = useNavigate();
  const account = useAccount();
  const getTokenAbi = parseAbi([
    "function getTokenBalance(address) view returns (uint256)",
  ]);

  const handleBack = () => {
    navigate(-1);
  };

  // Correct ABI for getAllRunners and transferTokens
  const runnerAbi = parseAbi([
    "function getAllRunners() view returns ((uint256,address,string,bool,(uint256,string)[],uint256)[])",
  ]);
  const transferTokenAbi = parseAbi([
    "function transferTokens(address,address,uint256) returns (string)",
  ]);

  // Fetch all runners
  const {
    data: getAllRunnersData,
    error: getAllRunnersError,
    refetch,
  } = useReadContract({
    address: baseRunnerContract.address,
    abi: runnerAbi,
    functionName: "getAllRunners",
  });

  useEffect(() => {
    if (!isConnected) return;
    if (getAllRunnersData) {
      const formattedRunners = getAllRunnersData.map((runner) => ({
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
    if (getAllRunnersError) {
      toast.error("Failed to fetch runners");
      console.log(getAllRunnersError);
    }
  }, [getAllRunnersData, getAllRunnersError, isConnected]);

  const handleTransfer = async (toAddress, amount) => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!isConnected) {
      toast.error("Please connect your Wallet!");
      return;
    }

    if (amount > gameToken) {
      toast.error("Insufficient Balance");
      return;
    }

    try {
      // 1. Send the transaction, get the hash
      const { hash } = await writeContract(config, {
        account: runnerAddress,
        address: baseRunnerContract.address,
        abi: transferTokenAbi,
        functionName: "transferTokens",
        args: [runnerAddress, toAddress, BigInt(amount)],
      });

      toast.success("Transaction sent, waiting for confirmation...");

      // 2. Wait for it to be mined
      const receipt = await waitForTransactionReceipt(config, { hash });

      console.log(receipt, hash);
      refetch();

      // // 3. Check if successful
      // if (receipt.status === "success") {
      //   toast.success(`Transferred ${amount} tokens successfully!`);
      //   console.log("Successful Receipt:", receipt);
      //   refetch(); // Refresh data instead of reloading the page
      // } else {
      //   toast.error("Transaction failed after being mined.");
      //   console.warn("Failed receipt:", receipt);
      // }
    } catch (err) {
      toast.error("Transfer failed");
      console.error(err);
    }
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

  // if (isLoading) {
  //   return (
  //     <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900 via-black to-gray-900">
  //       <div className="bg-white/20 p-8 rounded-lg backdrop-blur-md shadow-lg max-w-md w-full">
  //         <div className="flex justify-center items-center h-64">
  //           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  if (getAllRunnersError) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900 via-black to-gray-900">
        <div className="bg-white/20 p-8 rounded-lg backdrop-blur-md shadow-lg max-w-md w-full">
          <div className="bg-red-100/50 border-l-4 border-red-500 p-4">
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
                  Error loading runners: {getAllRunnersError.message}
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
    <div className="fixed inset-0 z-50 flex justify-center bg-gradient-to-br from-blue-900 via-black to-gray-900 p-4 overflow-y-auto">
      <div className="absolute top-8 left-30 flex items-center space-x-12">
        {/* Top left corner of screen */}
        <WalletWrapper text="Connect Wallet" className="z-50" />
      </div>
      {/* Game Token top right */}
      <div className="absolute top-8 right-10 flex items-center gap-2 sm:gap-3 bg-white/80 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1 sm:py-1.5 shadow-md border border-gray-200">
        <span className="text-xs sm:text-sm font-bold text-gray-700">
          Game Token:{" "}
        </span>
        <div className="flex items-center justify-center w-6 h-6 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-blue-500 rounded-full">
          <span className="text-white font-bold text-[0.6rem] sm:text-xs">
            {gameToken.toString()}
          </span>
        </div>
        <span className="text-black font-medium text-sm sm:text-md">BRT</span>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl w-full my-8 border border-white/20">
        <div className="relative p-6">
          <button
            onClick={handleBack}
            className="absolute top-6 left-6 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200"
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
          </button>
          <h1 className="text-3xl font-bold mb-6 text-white text-center">
            All Runners
          </h1>

          <div className="overflow-x-auto rounded-lg border border-white/20">
            <table className="min-w-full divide-y divide-white/20">
              <thead className="bg-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    Scores
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/5 divide-y divide-white/10">
                {runnerList.map((runner) => {
                  if (runner.runnerAddress === account.address) {
                    return null; // Skip this runner
                  }
                  return (
                    <tr
                      key={`runner-${runner.id?.toString()}`}
                      className="hover:bg-white/10 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        #{runner.id?.toString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                        {runner.runnerAddress?.substring(0, 6)}...
                        {runner.runnerAddress?.substring(38)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {runner.runnerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {runner.isRegistered ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-500/20 text-green-400">
                            Registered
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-500/20 text-red-400">
                            Unregistered
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {runner.tokenBalance?.toString()} BRT
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1 max-h-20 overflow-y-auto">
                          {runner.scoreList?.map((score) => (
                            <span
                              key={`score-${runner.id}-${score.id}`}
                              className="text-xs px-1 py-0.5 bg-white/10 rounded text-white/80"
                            >
                              #{score.id}: {score.score}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={transferAmount[runner.runnerAddress] || ""}
                            onChange={(e) =>
                              setTransferAmount({
                                ...transferAmount,
                                [runner.runnerAddress]: e.target.value,
                              })
                            }
                            placeholder="Amount"
                            className="border border-white/20 bg-white/10 rounded px-2 py-1 w-24 text-sm text-white placeholder-white/50"
                            min="0"
                            step="0.001"
                          />

                          <button
                            onClick={() =>
                              handleTransfer(
                                runner.runnerAddress,
                                transferAmount[runner.runnerAddress]
                              )
                            }
                            className="bg-blue-600 border-2 border-green-500 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded text-sm transition-colors"
                          >
                            Transfer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
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
