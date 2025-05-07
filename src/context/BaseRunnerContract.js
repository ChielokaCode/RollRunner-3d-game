export const baseRunnerContract = {
  address: "0xbcCBab8702150D48B5881E87516E245C28113d68",
  abi: [
    {
      inputs: [{ internalType: "address", name: "_owner", type: "address" }],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "runner",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "EntryFeePaid",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "runner",
          type: "address",
        },
        {
          indexed: false,
          internalType: "string",
          name: "name",
          type: "string",
        },
      ],
      name: "RunnerRegistered",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "runner",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "scoreId",
          type: "uint256",
        },
      ],
      name: "ScoreAdded",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "runner",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "TokensMinted",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        { indexed: true, internalType: "address", name: "to", type: "address" },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "TokensTransferred",
      type: "event",
    },
    {
      inputs: [],
      name: "ENTRY_FEE",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "ENTRY_REWARD",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "SCORE_REWARD",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "_runnerCounter",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "_scoreCounter",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "_runnerAddress", type: "address" },
        { internalType: "string", name: "_runnerName", type: "string" },
      ],
      name: "addRunner",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "_runnerAddress", type: "address" },
        { internalType: "string", name: "_score", type: "string" },
      ],
      name: "addScore",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "_runnerAddress", type: "address" },
      ],
      name: "checkRunner",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getAllRunners",
      outputs: [
        {
          components: [
            { internalType: "uint256", name: "id", type: "uint256" },
            { internalType: "address", name: "runnerAddress", type: "address" },
            { internalType: "string", name: "runnerName", type: "string" },
            { internalType: "bool", name: "isRegistered", type: "bool" },
            {
              components: [
                { internalType: "uint256", name: "id", type: "uint256" },
                { internalType: "string", name: "score", type: "string" },
              ],
              internalType: "struct BaseRunnerContract.Score[]",
              name: "scoreList",
              type: "tuple[]",
            },
            { internalType: "uint256", name: "tokenBalance", type: "uint256" },
          ],
          internalType: "struct BaseRunnerContract.Runner[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "_runnerAddress", type: "address" },
      ],
      name: "getAllScoresByRunner",
      outputs: [
        {
          components: [
            { internalType: "uint256", name: "id", type: "uint256" },
            { internalType: "string", name: "score", type: "string" },
          ],
          internalType: "struct BaseRunnerContract.Score[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "_runnerAddress", type: "address" },
      ],
      name: "getTokenBalance",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "_runnerAddress", type: "address" },
      ],
      name: "payEntryFee",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [],
      name: "resetAllRunners",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "_from", type: "address" },
        { internalType: "address", name: "_to", type: "address" },
        { internalType: "uint256", name: "_amount", type: "uint256" },
      ],
      name: "transferTokens",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "withdraw",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    { stateMutability: "payable", type: "receive" },
  ],
};
