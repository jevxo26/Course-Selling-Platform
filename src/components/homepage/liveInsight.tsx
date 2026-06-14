"use client";

import { Plus_Jakarta_Sans } from "next/font/google";
import { Landmark } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useLandingWithdrawLiveQuery } from "@/lib/api/landing/withdraw-live";
import { useLandingEarningLiveQuery } from "@/lib/api/landing/earning-live";
import Image from "next/image";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// ─── Types ────────────────────────────────────────────────────────────────────

type EarningItem = {
  id: number;
  name: string;
  course: string;
  amount: string;
  avatar: string;
};

type WithdrawalItem = {
  id: number;
  name: string;
  status: string;
  amount: string;
  avatar: string;
};
function extractWithdrawLiveList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const obj = payload as Record<string, unknown>;
  const candidates = [
    obj.data,
    obj.items,
    obj.withdrawals,
    obj.withdraws,
    obj.results,
  ];

  for (const v of candidates) {
    if (Array.isArray(v)) return v;
  }

  return [];
}

function normalizeWithdrawAmount(amount: unknown): string {
  let val = 0;
  if (typeof amount === "number" && Number.isFinite(amount)) {
    val = amount;
  } else if (typeof amount === "string") {
    val = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
  }
  return `৳${val.toFixed(2)}`;
}

function normalizeWithdrawLiveItem(
  raw: unknown,
  idx: number,
): Omit<WithdrawalItem, "id"> | null {
  if (!raw || typeof raw !== "object") return null;

  const o = raw as Record<string, unknown>;
  const user = (o.user as Record<string, unknown> | null) ?? null;

  const name =
    (typeof user?.name === "string" && user.name.trim()) ||
    (typeof o.name === "string" && o.name.trim()) ||
    (typeof o.userName === "string" && o.userName.trim()) ||
    (typeof o.username === "string" && o.username.trim()) ||
    "Someone";

  const status =
    (typeof o.status === "string" && o.status.trim()) ||
    (typeof o.state === "string" && o.state.trim()) ||
    "Withdrawal Initiated";

  const avatar =
    (typeof user?.photo === "string" && user.photo.trim()) ||
    (typeof user?.avatar === "string" && user.avatar.trim()) ||
    (typeof o.avatar === "string" && o.avatar.trim()) ||
    (typeof o.photo === "string" && o.photo.trim()) ||
    (typeof o.userPhoto === "string" && o.userPhoto.trim()) ||
    `https://i.pravatar.cc/80?img=${(idx % 60) + 1}`;

  const amount = normalizeWithdrawAmount(o.amount);

  return { name, status, amount, avatar };
}

function normalizeEarningLiveItem(
  raw: unknown,
  idx: number,
): Omit<EarningItem, "id"> | null {
  if (!raw || typeof raw !== "object") return null;

  const o = raw as Record<string, unknown>;
  const user = (o.user as Record<string, unknown> | null) ?? null;

  const name =
    (typeof user?.name === "string" && user.name.trim()) ||
    (typeof o.name === "string" && o.name.trim()) ||
    (typeof o.userName === "string" && o.userName.trim()) ||
    (typeof o.username === "string" && o.username.trim()) ||
    "Someone";

  const course =
    (typeof o.course === "string" && o.course.trim()) ||
    (typeof o.product === "string" && o.product.trim()) ||
    "Course/Product";

  const avatar =
    (typeof user?.photo === "string" && user.photo.trim()) ||
    (typeof user?.avatar === "string" && user.avatar.trim()) ||
    (typeof o.avatar === "string" && o.avatar.trim()) ||
    (typeof o.photo === "string" && o.photo.trim()) ||
    (typeof o.userPhoto === "string" && o.userPhoto.trim()) ||
    `https://i.pravatar.cc/80?img=${(idx % 60) + 1}`;

  const amount = normalizeWithdrawAmount(o.amount);

  return { name, course, amount, avatar };
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const allEarners: Omit<EarningItem, "id">[] = [
  {
    name: "John Doe",
    course: "UI Architecture Path",
    amount: "৳120.00",
    avatar: "https://i.pravatar.cc/80?img=11",
  },
  {
    name: "Emma",
    course: "Agency Mastery",
    amount: "৳160.41",
    avatar: "https://i.pravatar.cc/80?img=47",
  },
  {
    name: "Chloe",
    course: "UI Architecture",
    amount: "৳100.53",
    avatar: "https://i.pravatar.cc/80?img=45",
  },
  {
    name: "Sarah K.",
    course: "Design Systems",
    amount: "৳88.20",
    avatar: "https://i.pravatar.cc/80?img=23",
  },
  {
    name: "Liam",
    course: "Branding Bootcamp",
    amount: "৳74.00",
    avatar: "https://i.pravatar.cc/80?img=3",
  },
  {
    name: "Nina",
    course: "Freelance Fast-Track",
    amount: "৳210.00",
    avatar: "https://i.pravatar.cc/80?img=49",
  },
  {
    name: "Omar",
    course: "Product Design",
    amount: "৳95.50",
    avatar: "https://i.pravatar.cc/80?img=18",
  },
  {
    name: "Zara",
    course: "Motion Design",
    amount: "৳135.00",
    avatar: "https://i.pravatar.cc/80?img=25",
  },
];

const allWithdrawers: Omit<WithdrawalItem, "id">[] = [
  {
    name: "Michael",
    status: "Withdrawal Initiated",
    amount: "৳957.34",
    avatar: "https://i.pravatar.cc/80?img=12",
  },
  {
    name: "Alex Chen",
    status: "Withdrawal Initiated",
    amount: "৳300.00",
    avatar: "https://i.pravatar.cc/80?img=15",
  },
  {
    name: "Alex",
    status: "Withdrawal Initiated",
    amount: "৳540.62",
    avatar: "https://i.pravatar.cc/80?img=60",
  },
  {
    name: "Michael",
    status: "Withdrawal Initiated",
    amount: "৳169.52",
    avatar: "https://i.pravatar.cc/80?img=33",
  },
  {
    name: "Grace",
    status: "Withdrawal Initiated",
    amount: "৳415.00",
    avatar: "https://i.pravatar.cc/80?img=29",
  },
  {
    name: "Carlos",
    status: "Withdrawal Initiated",
    amount: "৳880.00",
    avatar: "https://i.pravatar.cc/80?img=7",
  },
  {
    name: "Priya",
    status: "Withdrawal Initiated",
    amount: "৳225.30",
    avatar: "https://i.pravatar.cc/80?img=44",
  },
  {
    name: "Yuki",
    status: "Withdrawal Initiated",
    amount: "৳310.00",
    avatar: "https://i.pravatar.cc/80?img=38",
  },
];

const ROW_H = 58;
const GAP = 8;
const VISIBLE = 4;
const INTERVAL = 3000;

// ─── Conveyor Hook ────────────────────────────────────────────────────────────
// KEY FIX: instead of AnimatePresence (which battles with layout), we use a
// fixed-height clipping window + CSS translateY to slide rows in. No layout
// recalculation happens — the container height never changes.

function useConveyorFeed<T extends { id: number }>(initial: T[]) {
  const [rows, setRows] = useState<T[]>(initial);
  const [offset, setOffset] = useState(0);
  const busy = useRef(false);

  const push = useCallback((item: T) => {
    if (busy.current) return;
    busy.current = true;

    setRows((prev) => [item, ...prev].slice(0, VISIBLE + 1));
    setOffset(-(ROW_H + GAP));

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setOffset(0);
        setTimeout(() => {
          setRows((prev) => prev.slice(0, VISIBLE));
          busy.current = false;
        }, 580);
      });
    });
  }, []);

  const reset = useCallback((next: T[]) => {
    setRows(next);
    setOffset(0);
    busy.current = false;
  }, []);

  return useMemo(() => ({ rows, offset, push, reset }), [rows, offset, push, reset]);
}

// ─── Row Components ───────────────────────────────────────────────────────────

function EarningRow({ item }: { item: EarningItem }) {
  return (
    <div
      className="flex items-center justify-between bg-green-50 rounded-[13px] px-4 flex-shrink-0"
      style={{ height: ROW_H }}
    >
      <div className="flex items-center gap-3">
        <Image
          src={item.avatar}
          alt={item.name}
          width={36}
          height={36}
          className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
        />
        <div>
          <p className="text-[13px] font-bold text-slate-900 leading-tight">
            {item.name}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">{item.course}</p>
        </div>
      </div>
      <p className="text-[13px] font-bold text-green-600">{item.amount}</p>
    </div>
  );
}

function WithdrawalRow({ item }: { item: WithdrawalItem }) {
  return (
    <div
      className="flex items-center justify-between bg-blue-50 rounded-[13px] px-4 flex-shrink-0"
      style={{ height: ROW_H }}
    >
      <div className="flex items-center gap-3">
        <Image
          src={item.avatar}
          alt={item.name}
          width={36}
          height={36}
          className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
        />
        <div>
          <p className="text-[13px] font-bold text-slate-900 leading-tight">
            {item.name}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">{item.status}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[13px] font-bold text-blue-600">{item.amount}</p>
        <span className="text-[9px] font-extrabold tracking-widest bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mt-1 inline-block">
          COMPLETED
        </span>
      </div>
    </div>
  );
}

// ─── Feed Viewport ────────────────────────────────────────────────────────────

function Feed({
  children,
  offset,
}: {
  children: React.ReactNode;
  offset: number;
}) {
  const clipH = VISIBLE * ROW_H + (VISIBLE - 1) * GAP;
  return (
    <div className="relative overflow-hidden" style={{ height: clipH }}>
      {/* Bottom fade-out mask */}
      <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
      {/* Inner sliding container */}
      <div
        className="absolute inset-x-0 top-0 flex flex-col"
        style={{
          gap: GAP,
          transform: `translateY(${offset}px)`,
          // No transition when we snap back to -ROW_H; smooth only when sliding to 0
          transition:
            offset === 0
              ? "transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)"
              : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

let _idCtr = 100;

const LiveInsight = () => {
  const earningLive = useLandingEarningLiveQuery();
  const withdrawLive = useLandingWithdrawLiveQuery();
  
  const apiWithdrawers = useMemo(() => {
    const list = extractWithdrawLiveList(withdrawLive.data);
    return list
      .map((x, idx) => normalizeWithdrawLiveItem(x, idx))
      .filter((x): x is Omit<WithdrawalItem, "id"> => Boolean(x));
  }, [withdrawLive.data]);
  
  const apiEarners = useMemo(() => {
    const list = extractWithdrawLiveList(earningLive.data);
    return list
      .map((x, idx) => normalizeEarningLiveItem(x, idx))
      .filter((x): x is Omit<EarningItem, "id"> => Boolean(x));
  }, [earningLive.data]);

  const withdrawersRef = useRef<Omit<WithdrawalItem, "id">[]>(allWithdrawers);
  const earnersRef = useRef<Omit<EarningItem, "id">[]>(allEarners);

  const earningFeed = useConveyorFeed<EarningItem>(
    allEarners.slice(0, VISIBLE).map((d, i) => ({ ...d, id: i + 1 })),
  );
  const withdrawalFeed = useConveyorFeed<WithdrawalItem>(
    allWithdrawers.slice(0, VISIBLE).map((d, i) => ({ ...d, id: i + 1 })),
  );

  const [total, setTotal] = useState(12_483_035);
  const [totalKey, setTotalKey] = useState(0);
  const eIdxRef = useRef(VISIBLE);
  const wIdxRef = useRef(VISIBLE);

  useEffect(() => {
    if (apiWithdrawers.length === 0) return;
    withdrawersRef.current = apiWithdrawers;
    withdrawalFeed.reset(
      apiWithdrawers
        .slice(0, VISIBLE)
        .map((d, i) => ({ ...d, id: i + 1 })),
    );
    wIdxRef.current = VISIBLE;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiWithdrawers]);

  useEffect(() => {
    if (apiEarners.length === 0) return;
    earnersRef.current = apiEarners;
    earningFeed.reset(
      apiEarners
        .slice(0, VISIBLE)
        .map((d, i) => ({ ...d, id: i + 1 })),
    );
    eIdxRef.current = VISIBLE;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiEarners]);

  useEffect(() => {
    const t = setInterval(() => {
      const id = ++_idCtr;
      const earners = earnersRef.current.length > 0 ? earnersRef.current : allEarners;
      const newE = { ...earners[eIdxRef.current % earners.length], id };
      
      const withdrawers =
        withdrawersRef.current.length > 0
          ? withdrawersRef.current
          : allWithdrawers;

      const newW = {
        ...withdrawers[wIdxRef.current % withdrawers.length],
        id: id + 1,
      };

      earningFeed.push(newE);
      withdrawalFeed.push(newW);

      setTotal((prev) => prev + parseFloat(newE.amount.replace(/[^0-9.-]+/g, "")));
      setTotalKey((k) => k + 1);
      eIdxRef.current++;
      wIdxRef.current++;
    }, INTERVAL);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      className={`py-10 pb-15 ${plusJakarta.className}`}
      style={{
        background:
          "linear-gradient(135deg, #f8f9ff 0%, #f0f1ff 40%, #eef0ff 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* ── Header ─────────────────────────────────────────────── */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          {/* Live dot */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-[11px] font-bold tracking-[.12em] text-red-500">
              LIVE
            </span>
          </div>

          <h2 className="text-[34px] font-extrabold text-slate-900 tracking-tight leading-none">
            Live Insight
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            See how users are earning and withdrawing in real-time
          </p>

          {/* Total earnings pill */}
          <div className="mt-6 inline-flex flex-col items-center bg-white px-10 py-4 rounded-full shadow-[0_8px_28px_rgba(0,0,0,.09)]">
            <p className="text-[9.5px] font-bold tracking-[.13em] text-slate-400 mb-1">
              TOTAL EARNINGS DISTRIBUTED
            </p>
            <motion.p
              key={totalKey}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="text-[28px] font-extrabold text-blue-600 tracking-tight"
            >
              ৳{total.toLocaleString("en-US")}
            </motion.p>
          </div>
        </motion.div>

        {/* ── Cards ──────────────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-5 max-w-6xl mx-auto">
          {/* Earnings */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="bg-white rounded-[22px] p-[22px] shadow-[0_4px_24px_rgba(0,0,0,.07)]"
          >
            <div className="flex items-center gap-2.5 mb-4 pb-3.5 border-b border-slate-100">
              <div className="w-[30px] h-[30px] rounded-[9px] bg-green-100 flex items-center justify-center">
                <span className="text-[15px] font-black text-green-600">৳</span>
              </div>
              <h3 className="text-[13px] font-bold text-slate-900">
                Recent Earnings
              </h3>
            </div>
            <Feed offset={earningFeed.offset}>
              {earningFeed.rows.map((item) => (
                <EarningRow key={item.id} item={item} />
              ))}
            </Feed>
          </motion.div>

          {/* Withdrawals */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="bg-white rounded-[22px] p-[22px] shadow-[0_4px_24px_rgba(0,0,0,.07)]"
          >
            <div className="flex items-center gap-2.5 mb-4 pb-3.5 border-b border-slate-100">
              <div className="w-[30px] h-[30px] rounded-[9px] bg-blue-100 flex items-center justify-center">
                <Landmark className="w-[15px] h-[15px] text-blue-600" />
              </div>
              <h3 className="text-[13px] font-bold text-slate-900">
                Recent Withdrawals
              </h3>
            </div>
            <Feed offset={withdrawalFeed.offset}>
              {withdrawalFeed.rows.map((item) => (
                <WithdrawalRow key={item.id} item={item} />
              ))}
            </Feed>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LiveInsight;
