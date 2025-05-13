import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Label } from "@progress/kendo-react-labels";
import { Input } from "@progress/kendo-react-inputs";
import toast from "react-hot-toast";
import { useAccount, useWriteContract } from "wagmi";
import { baseRunnerContract } from "../context/BaseRunnerContract";
import { parseAbi } from "viem";

const LoginPage = () => {
  const [notifStatus, setNotifStatus] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [runnerName, setRunnerName] = useState("");
  const navigate = useNavigate();

  const { writeContractAsync } = useWriteContract();
  const account = useAccount();
  const { isConnected } = useAccount();
  const abi = parseAbi(["function addRunner(address,string) returns (string)"]);

  useEffect(() => {
    if (notifStatus) {
      const timer = setTimeout(() => {
        setNotifStatus(false);
        navigate("/");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notifStatus, navigate]);

  const loginUser = async (e) => {
    e.preventDefault();
    setError("");

    if (!isConnected) {
      toast.error("Please connect your Wallet!");
      return;
    }
    setLoading(true);
    try {
      await writeContractAsync(
        {
          address: baseRunnerContract.address,
          abi: abi,
          functionName: "addRunner",
          args: [account.address, runnerName],
        },
        {
          onSettled(data, error) {
            if (error) {
              toast.error("Transaction failed");
              console.error("Transaction failed:", error);
            } else {
              toast.success("Runner added successfully!");
              setRunnerName("");
            }
            setLoading(false);
          },
        }
      );
    } catch (error) {
      setLoading(false);
      console.error("Transaction failed:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900 via-black to-gray-900">
      {/* Back Button */}
      <div className="flex space-x-12">
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
      </div>
      <div className="relative m-6 bg-white/10 backdrop-blur-md rounded-xl shadow-lg max-w-md w-full mx-4 border border-white/20">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">Player Login</h2>
          </div>

          <form onSubmit={loginUser} className="space-y-6">
            <div>
              <Label className="block text-sm font-bold text-white mb-2">
                Player Name
              </Label>
              <Input
                className="w-full rounded-lg px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="text"
                value={runnerName}
                placeholder="Enter your name"
                onChange={(e) => setRunnerName(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full border-2 border-white py-3 px-4 rounded-lg font-medium text-white ${
                loading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } transition-colors duration-200`}
            >
              {loading ? "Processing..." : "Enter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
