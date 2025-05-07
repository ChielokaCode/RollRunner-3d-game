import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Label } from "@progress/kendo-react-labels";
import { Input } from "@progress/kendo-react-inputs";
import { useNavigate } from "react-router-dom";
import { Notification } from "@progress/kendo-react-notification";
import toast from "react-hot-toast";
import { useAccount, useWriteContract } from "wagmi";
import { baseRunnerContract } from "../context/BaseRunnerContract";
import { parseAbi } from "viem";

const Login = ({ onClose }) => {
  const [notifStatus, setNotifStatus] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
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
    console.log("Add Runner");
    e.preventDefault();
    setError("");

    if (!isConnected) {
      toast.error("Please connect your Wallet!");
      return;
    }
    setLoading(true);
    try {
      // Call the contract's addManufacturer function
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
            console.log("Settled", { data, error });
          },
        }
      );
    } catch (error) {
      setLoading(false);
      console.error("Transaction failed:", error);
    }
  };

  const handleClose = () => {
    window.location.reload(); // Only called on button click
  };

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-20 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
      >
        {/* Close Button */}
        <div
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold z-[9999]"
        >
          &times;
        </div>

        <div className="flex flex-col justify-center px-2 py-6">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            {/* <img
              alt="Your Company" b
              src="https://lh3.googleusercontent.com/sD8t1fg9YFeCS2dzNITeosrp3i86wHs9CuZPZQWs5M_zrmqpvc0G7LX4sXKg4EJhIPiRdgQkvpPAC8gkQw=s265-w265-h265"
              className="mx-auto h-24 w-auto"
            /> */}
            <h2 className="mt-3 text-center text-2xl font-bold tracking-tight text-gray-900">
              Login
            </h2>
          </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form onSubmit={loginUser}>
              <div>
                <Label className="font-bold" editorId="name">
                  Player's Name&nbsp;
                </Label>
                <div className="mt-2">
                  <Input
                    className="w-full rounded-md px-4 py-4 border-2 border-black"
                    id="name"
                    type="text"
                    name="name"
                    value={runnerName}
                    placeholder="Enter your Name"
                    onChange={(e) => setRunnerName(e.target.value)}
                  />
                </div>
              </div>
              <br />
              <div>
                <div
                  onClick={loginUser}
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500"
                >
                  Enter
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
