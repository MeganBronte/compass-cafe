"use client";

import {
  CheckCircle2,
  ChevronDown,
  Coffee,
  Compass,
  MapPin,
  PlugZap,
  ReceiptText,
  Table2,
  ThermometerSun,
  Wallet,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract
} from "wagmi";
import { compassCafeAbi } from "@/lib/abi";
import { attributionDataSuffix, contractAddress } from "@/lib/wagmi";

type ActionKey = "brewCup" | "setTable" | "warmCorner";
type FriendlyStatus = "Ready" | "Pending" | "Confirmed" | "Failed" | "Request rejected";

const actionDetails: Record<
  ActionKey,
  {
    label: string;
    fn: ActionKey;
    icon: typeof Coffee;
    station: string;
    note: string;
    color: string;
  }
> = {
  brewCup: {
    label: "Brew Cup",
    fn: "brewCup",
    icon: Coffee,
    station: "Counter 01",
    note: "Mark one fresh cafe pour.",
    color: "from-[#6f472f] to-[#2d74ff]"
  },
  setTable: {
    label: "Set Table",
    fn: "setTable",
    icon: Table2,
    station: "Table Tag 12",
    note: "Log a ready place setting.",
    color: "from-[#2f806f] to-[#6f472f]"
  },
  warmCorner: {
    label: "Warm Corner",
    fn: "warmCorner",
    icon: ThermometerSun,
    station: "Corner N-E",
    note: "Add warmth to the cozy corner.",
    color: "from-[#c58d3d] to-[#2d74ff]"
  }
};

const emptyAddress = "0x0000000000000000000000000000000000000000" as `0x${string}`;

function formatAddress(address?: string) {
  if (!address) return "No wallet";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function safeCounter(value: unknown) {
  return typeof value === "bigint" ? value.toString() : "0";
}

function statusFromError(error: unknown): FriendlyStatus {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("reject") || message.includes("denied")) return "Request rejected";
  return "Failed";
}

export default function Home() {
  const { address, isConnected, connector } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect({
    mutation: {
      onError(error) {
        console.error(error);
        setLastStatus(statusFromError(error));
      }
    }
  });
  const { disconnect } = useDisconnect();
  const [walletOpen, setWalletOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<ActionKey | null>(null);
  const [lastStatus, setLastStatus] = useState<FriendlyStatus>("Ready");
  const [lastLabel, setLastLabel] = useState("No transaction yet");
  const [lastHash, setLastHash] = useState<`0x${string}` | undefined>();

  const readAddress = address ?? emptyAddress;
  const contractCalls = useMemo(
    () =>
      [
        { functionName: "userBrews", args: [readAddress] },
        { functionName: "userTables", args: [readAddress] },
        { functionName: "userCorners", args: [readAddress] },
        { functionName: "totalBrews" },
        { functionName: "totalTables" },
        { functionName: "totalCorners" }
      ].map((call) => ({
        address: contractAddress,
        abi: compassCafeAbi,
        ...call
      })),
    [readAddress]
  );

  const { data, refetch, isLoading: isReading } = useReadContracts({
    contracts: contractCalls,
    query: {
      enabled: contractAddress !== emptyAddress,
      refetchInterval: 12000
    }
  });

  const { writeContract, isPending: isWriting } = useWriteContract({
    mutation: {
      onSuccess(hash) {
        setLastHash(hash);
        setLastStatus("Pending");
      },
      onError(error) {
        console.error(error);
        setLastStatus(statusFromError(error));
        setActiveAction(null);
      }
    }
  });

  const receipt = useWaitForTransactionReceipt({
    hash: lastHash,
    query: {
      enabled: Boolean(lastHash)
    }
  });

  useEffect(() => {
    if (receipt.isSuccess) {
      setLastStatus("Confirmed");
      setActiveAction(null);
      void refetch();
    }
  }, [receipt.isSuccess, refetch]);

  useEffect(() => {
    if (receipt.isError) {
      console.error(receipt.error);
      setLastStatus("Failed");
      setActiveAction(null);
    }
  }, [receipt.error, receipt.isError]);

  const counters = {
    myBrews: safeCounter(data?.[0]?.result),
    myTables: safeCounter(data?.[1]?.result),
    myCorners: safeCounter(data?.[2]?.result),
    totalBrews: safeCounter(data?.[3]?.result),
    totalTables: safeCounter(data?.[4]?.result),
    totalCorners: safeCounter(data?.[5]?.result)
  };

  const triggerCafeAction = (key: ActionKey) => {
    if (!isConnected) {
      setWalletOpen(true);
      setLastStatus("Ready");
      return;
    }

    setActiveAction(key);
    setLastLabel(actionDetails[key].label);
    setLastStatus("Pending");
    writeContract({
      address: contractAddress,
      abi: compassCafeAbi,
      functionName: actionDetails[key].fn,
      dataSuffix: attributionDataSuffix
    });
  };

  const walletStatus = isConnected ? "Connected" : "Not connected";
  const canWrite = isConnected && !isWriting && contractAddress !== emptyAddress;

  return (
    <main className="min-h-screen overflow-hidden bg-[#f9f1df] text-[#201711]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-3 rounded-[8px] border border-[#d9c8a9] bg-[#fffaf0]/90 px-4 py-3 shadow-[0_12px_34px_rgba(75,45,27,0.13)]">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-[8px] bg-[#6f472f] text-[#fffaf0]">
              <Compass size={24} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2f806f]">
                Base Mini App
              </p>
              <h1 className="truncate text-2xl font-black">Compass Cafe</h1>
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-[8px] bg-[#2d74ff] px-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(45,116,255,0.24)] transition hover:bg-[#1e62dc]"
              onClick={() => setWalletOpen((open) => !open)}
            >
              <Wallet size={18} aria-hidden="true" />
              <span className="hidden sm:inline">{formatAddress(address)}</span>
              <ChevronDown size={16} aria-hidden="true" />
            </button>

            {walletOpen ? (
              <div className="absolute right-0 z-20 mt-2 w-72 rounded-[8px] border border-[#d9c8a9] bg-[#fffaf0] p-3 shadow-[0_24px_50px_rgba(45,32,22,0.22)]">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black">Wallet Options</p>
                    <p className="text-xs text-[#6b5b48]">{walletStatus}</p>
                  </div>
                  <button
                    type="button"
                    className="grid size-8 place-items-center rounded-[8px] border border-[#d9c8a9]"
                    onClick={() => setWalletOpen(false)}
                    aria-label="Close wallet options"
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                </div>

                <div className="space-y-2">
                  {connectors.map((walletConnector) => (
                    <button
                      key={walletConnector.uid}
                      type="button"
                      className="flex w-full items-center justify-between rounded-[8px] border border-[#dfd0b8] bg-white px-3 py-2 text-left text-sm font-bold transition hover:border-[#2d74ff]"
                      disabled={isConnecting}
                      onClick={() => {
                        connect({ connector: walletConnector });
                        setWalletOpen(false);
                      }}
                    >
                      <span>{walletConnector.name}</span>
                      <PlugZap size={16} aria-hidden="true" />
                    </button>
                  ))}
                  {isConnected ? (
                    <button
                      type="button"
                      className="flex w-full items-center justify-center rounded-[8px] border border-[#dfd0b8] px-3 py-2 text-sm font-bold text-[#6f472f]"
                      onClick={() => {
                        disconnect();
                        setWalletOpen(false);
                      }}
                    >
                      Disconnect
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </header>

        <section className="mt-5 grid flex-1 gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="relative overflow-hidden rounded-[8px] border border-[#d0b892] bg-[#3c261a] text-[#fffaf0] shadow-[0_24px_70px_rgba(72,43,23,0.24)]">
            <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(90deg,rgba(255,250,240,.12)_1px,transparent_1px),linear-gradient(rgba(255,250,240,.1)_1px,transparent_1px)] [background-size:22px_22px]" />
            <div className="relative p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-[8px] border border-[#e8d6b9]/30 bg-[#fffaf0]/10 px-3 py-2 text-sm font-bold">
                  <MapPin size={16} aria-hidden="true" />
                  North Counter
                </div>
                <div className="rounded-[8px] bg-[#94d8bd] px-3 py-2 text-sm font-black text-[#1f392f]">
                  Table No. 08
                </div>
              </div>

              <div className="mt-7 grid gap-6 md:grid-cols-[1fr_220px] md:items-center">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#94d8bd]">
                    Cozy Cafe Navigation Board
                  </p>
                  <h2 className="mt-3 max-w-xl text-4xl font-black leading-[1.02] sm:text-5xl">
                    Pick a cafe action and leave a tiny mark on Base.
                  </h2>
                  <p className="mt-4 max-w-lg text-base leading-7 text-[#ecdcc0]">
                    No tokens, no points, no rewards. Just three simple cafe gestures, gas only, and counters that refresh after confirmation.
                  </p>
                </div>

                <div className="mx-auto grid aspect-square w-full max-w-[220px] place-items-center rounded-full border border-[#e8d6b9]/30 bg-[#fffaf0]/10 shadow-inner">
                  <div className="grid aspect-square w-[72%] place-items-center rounded-full border-2 border-dashed border-[#94d8bd] bg-[#2b1b13]">
                    <Compass size={80} aria-hidden="true" />
                    <span className="mt-[-34px] text-xs font-black tracking-[0.18em] text-[#94d8bd]">
                      BASE
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {(Object.keys(actionDetails) as ActionKey[]).map((key) => {
                  const action = actionDetails[key];
                  const Icon = action.icon;
                  const pending = activeAction === key && isWriting;

                  return (
                    <button
                      key={key}
                      type="button"
                      className="group min-h-[142px] rounded-[8px] border border-[#ead9bd]/30 bg-[#fffaf0] p-4 text-left text-[#201711] shadow-[0_14px_32px_rgba(19,13,10,0.22)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                      disabled={isWriting || contractAddress === emptyAddress}
                      onClick={() => triggerCafeAction(key)}
                    >
                      <div className={`mb-4 grid size-11 place-items-center rounded-[8px] bg-gradient-to-br ${action.color} text-white`}>
                        <Icon size={22} aria-hidden="true" />
                      </div>
                      <p className="text-lg font-black">{action.label}</p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.13em] text-[#2f806f]">
                        {action.station}
                      </p>
                      <p className="mt-2 text-sm leading-5 text-[#6b5b48]">
                        {pending ? "Sending transaction..." : action.note}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="grid content-start gap-5">
            <section className="rounded-[8px] border border-[#d9c8a9] bg-[#fffaf0] p-4 shadow-[0_16px_38px_rgba(75,45,27,0.12)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2f806f]">
                    Live Counter Board
                  </p>
                  <h2 className="mt-1 text-xl font-black">Cafe Counts</h2>
                </div>
                <span className="rounded-[8px] bg-[#e9f4ff] px-3 py-1 text-xs font-black text-[#2d74ff]">
                  {isReading ? "Syncing" : "Base"}
                </span>
              </div>

              <div className="mt-4 grid gap-3">
                <CounterRow label="Brews" my={counters.myBrews} total={counters.totalBrews} />
                <CounterRow label="Tables" my={counters.myTables} total={counters.totalTables} />
                <CounterRow label="Corners" my={counters.myCorners} total={counters.totalCorners} />
              </div>
            </section>

            <section className="rounded-[8px] border border-[#d9c8a9] bg-[#fffaf0] p-4 shadow-[0_16px_38px_rgba(75,45,27,0.12)]">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-[8px] bg-[#94d8bd] text-[#19392e]">
                  <ReceiptText size={20} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2f806f]">
                    Recent Activity
                  </p>
                  <h2 className="text-xl font-black">Last Transaction</h2>
                </div>
              </div>

              <div className="mt-4 rounded-[8px] border border-dashed border-[#d8c3a0] bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-[#6b5b48]">{lastLabel}</span>
                  <StatusPill status={lastStatus} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs font-bold uppercase text-[#8b7660]">Wallet Status</p>
                    <p className="mt-1 font-black">{walletStatus}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-[#8b7660]">Address</p>
                    <p className="mt-1 font-black">{formatAddress(address)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-[8px] bg-[#e9f4ff] px-3 py-2 text-sm font-bold text-[#2d74ff]">
                <CheckCircle2 size={17} aria-hidden="true" />
                <span>{canWrite ? "Ready for cafe actions" : "Connect wallet and add contract address"}</span>
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}

function CounterRow({ label, my, total }: { label: string; my: string; total: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-[8px] border border-[#e5d5bc] bg-white px-3 py-3">
      <p className="font-black">{label}</p>
      <div className="min-w-[76px] text-right">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8b7660]">My</p>
        <p className="text-lg font-black">{my}</p>
      </div>
      <div className="min-w-[82px] text-right">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8b7660]">Total</p>
        <p className="text-lg font-black text-[#2d74ff]">{total}</p>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: FriendlyStatus }) {
  const styles: Record<FriendlyStatus, string> = {
    Ready: "bg-[#f0e2c5] text-[#6f472f]",
    Pending: "bg-[#e9f4ff] text-[#2d74ff]",
    Confirmed: "bg-[#dff4e9] text-[#2f806f]",
    Failed: "bg-[#ffe7df] text-[#9a3d25]",
    "Request rejected": "bg-[#ffe7df] text-[#9a3d25]"
  };

  return (
    <span className={`rounded-[8px] px-3 py-1 text-xs font-black ${styles[status]}`}>
      {status}
    </span>
  );
}
