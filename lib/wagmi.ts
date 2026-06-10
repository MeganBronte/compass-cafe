import { coinbaseWallet, injected } from "wagmi/connectors";
import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";

export const contractAddress =
  "0x88fcc47bc0b908da1f0552f03bb436c4045248ff" as `0x${string}`;

export const attributionDataSuffix =
  "0x" as `0x${string}`;

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    injected({ target: "metaMask" }),
    injected(),
    coinbaseWallet({
      appName: "Compass Cafe",
      preference: "all"
    })
  ],
  transports: {
    [base.id]: http()
  }
});
