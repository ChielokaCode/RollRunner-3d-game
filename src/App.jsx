import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { Toaster } from "react-hot-toast";
// import "@rainbow-me/rainbowkit/styles.css";

import { OnchainKitProvider } from "@coinbase/onchainkit";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { base, baseSepolia } from "wagmi/chains";
import { config } from "./wagmi";
import MarketPlacePage from "./pages/MarketPlacePage";
import BuyToken from "./pages/BuyToken";
import LoginPage from "./pages/LoginPage";

const queryClient = new QueryClient();

function App() {
  const apiKey = import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY;
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          // config={{
          //   appearance: {
          //     name: "OnchainKit Playground",
          //     logo: "https://onchainkit.xyz/favicon/48x48.png?v4-19-24",
          //     mode: "auto",
          //     theme: "default",
          //   },
          // }}
          apiKey={apiKey}
          chain={baseSepolia}
        >
          <RainbowKitProvider>
            <Router>
              <Routes>
                <Route exact path="/" element={<HomePage />} />
                <Route
                  exact
                  path="/marketplace"
                  element={<MarketPlacePage />}
                />
                <Route exact path="/buyTokens" element={<BuyToken />} />
                <Route exact path="/login" element={<LoginPage />} />
              </Routes>
              <Toaster />
            </Router>
          </RainbowKitProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
