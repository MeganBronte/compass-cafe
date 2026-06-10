# Compass Cafe

Compass Cafe is a mobile-first Base mini app with three onchain cafe actions:

- Brew Cup
- Set Table
- Warm Corner

The app uses Next.js, TypeScript, App Router, Tailwind CSS, Wagmi, and Viem. It does not use RainbowKit, WalletConnect, token payments, points, rewards, invitations, or extra write actions.

## Required Values

Before production deployment, replace these placeholders:

- `app/layout.tsx`: `REPLACE_WITH_BASE_DEV_VERIFY_TOKEN`
- `lib/wagmi.ts`: `contractAddress`
- `lib/wagmi.ts`: `attributionDataSuffix`

The UI never renders these sensitive or internal values.

## Local Development

```bash
npm run dev
```

## Production Check

```bash
npm run build
```

## Contract

The Solidity source is in `contracts/CompassCafe.sol`. The frontend ABI in `lib/abi.ts` matches the required public counters and the three write methods.
