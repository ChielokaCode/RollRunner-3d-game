import { http, cookieStorage, createConfig, createStorage } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { coinbaseWallet, injected } from "wagmi/connectors";

// export const config = createConfig({
//   chains: [base, baseSepolia],
//   multiInjectedProviderDiscovery: false,
//   connectors: [
//     injected(),
//     coinbaseWallet({
//       appName: "RunOfFateGame",
//       preference: "all",
//     }),
//   ],
//   storage: createStorage({
//     storage: cookieStorage,
//   }),
//   ssr: true,
//   transports: {
//     [base.id]: http(),
//     [baseSepolia.id]: http(
//       "https://api.developer.coinbase.com/rpc/v1/base-sepolia/ZE6lCwxQJjCgyjF4dlCJA4GXHYGfpoKg"
//     ),
//   },
// });

// declare module "wagmi" {
//   interface Register {
//     config: typeof config;
//   }
// }

export const config = createConfig({
  chains: [baseSepolia],
  multiInjectedProviderDiscovery: false,
  connectors: [coinbaseWallet({ appName: "PharmVerify", preference: "all" })],
  ssr: true,
  transports: {
    [baseSepolia.id]: http(
      "https://api.developer.coinbase.com/rpc/v1/base-sepolia/sCjIRMpZIJTfPBBay3i3wAhMirdM5qV_"
    ),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
