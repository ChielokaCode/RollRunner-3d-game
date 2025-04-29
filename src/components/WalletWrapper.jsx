"use client";
import {
  Address,
  Avatar,
  EthBalance,
  Identity,
  Name,
} from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownBasename,
  WalletDropdownDisconnect,
  WalletDropdownFundLink,
  WalletDropdownLink,
  WalletAdvancedDefault,
  WalletIsland,
} from "@coinbase/onchainkit/wallet";
import { color } from "@coinbase/onchainkit/theme";
// import { base } from "viem/chains";

// export default function WalletWrapper() {
//   return (
//     <div className="flex justify-end">
//       <Wallet>
//         <ConnectWallet>
//           <Avatar className="h-6 w-6" />
//           <Name />
//         </ConnectWallet>
//         <WalletDropdown>
//           <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
//             <Avatar />
//             <Name />
//             <Address className={color.foregroundMuted} />
//             <EthBalance />
//           </Identity>
//           <WalletDropdownLink
//             // icon={BaseIcon}
//             href="https://www.base.org/"
//             rel="noopener noreferrer"
//           >
//             Base.org
//           </WalletDropdownLink>
//           <WalletDropdownBasename className="hover:bg-red-500" />
//           <WalletDropdownDisconnect text="Log out" />
//           <WalletDropdownFundLink
//             text="Add crypto"
//             icon={<walletDropdownLinkCustomBaseIconSvg />}
//             popupSize="sm"
//             openIn="tab"
//             target="_blank"
//             fundingUrl={"https://base.org"}
//           />
//         </WalletDropdown>
//       </Wallet>
//       {/* <WalletAdvancedDefault /> */}
//       <WalletIsland />
//     </div>
//   );
// }

export default function WalletWrapper({
  className,
  text,
  withWalletAggregator = false,
}) {
  return (
    <>
      <Wallet>
        <ConnectWallet
          withWalletAggregator={withWalletAggregator}
          text={text}
          className={className}
        >
          <Avatar className="h-6 w-6" />
          <Name />
        </ConnectWallet>
        <WalletDropdown>
          <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick={true}>
            <Avatar />
            <Name />
            <Address />
            <EthBalance />
          </Identity>
          <WalletDropdownBasename />
          <WalletDropdownLink icon="wallet" href="https://wallet.coinbase.com">
            Go to Wallet Dashboard
          </WalletDropdownLink>
          <WalletDropdownFundLink />
          <WalletDropdownDisconnect />
        </WalletDropdown>
      </Wallet>
    </>
  );
}
