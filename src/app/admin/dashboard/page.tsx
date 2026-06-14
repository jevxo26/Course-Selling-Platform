"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Download,
  BarChart2,
  Loader2,
  LayoutDashboard,
} from "lucide-react";

/* ─────────────────────── Smooth Line Chart ───────────────────────── */

const LineChart = ({ data, animated }: any) => {
  const [progress, setProgress] = useState(animated ? 0 : 1);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    setProgress(0);
    const start = performance.now();
    const duration = 900;
    const raf = requestAnimationFrame(function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(eased);
      if (t < 1) requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [data]);

  if (!data || data.length === 0) return null;

  const W = 560;
  const H = 180;
  const PAD = { top: 16, right: 16, bottom: 32, left: 42 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const max = Math.max(...data.map((d: any) => d.value));
  const min = Math.min(...data.map((d: any) => d.value));
  const range = max - min || 1;

  const pts = data.map((d: any, i: number) => ({
    x: PAD.left + (i / (data.length - 1)) * innerW,
    y: PAD.top + (1 - (d.value - min) / range) * innerH,
    ...d,
  }));

  const smooth = (points: any[]) => {
    if (points.length < 2) return "";
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(i - 1, 0)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(i + 2, points.length - 1)];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
  };

  const linePath = smooth(pts);
  const areaPath =
    linePath +
    ` L ${pts[pts.length - 1].x},${PAD.top + innerH} L ${pts[0].x},${PAD.top + innerH} Z`;

  const gridLines = [0, 0.33, 0.66, 1].map((t) => ({
    y: PAD.top + t * innerH,
    label: Math.round(max - t * range),
  }));

  return (
    <div style={{ width: "100%", position: "relative" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "auto", overflow: "visible" }}
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
          <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="revealClip">
            <rect x={PAD.left} y={0} width={innerW * progress} height={H} />
          </clipPath>
        </defs>

        {gridLines.map((g, i) => (
          <g key={i}>
            <line
              x1={PAD.left}
              y1={g.y}
              x2={PAD.left + innerW}
              y2={g.y}
              stroke="#E5E7EB"
              strokeWidth="1"
              strokeDasharray={i === 0 ? "none" : "4 4"}
            />
            <text
              x={PAD.left - 8}
              y={g.y + 4}
              textAnchor="end"
              fontSize="9"
              fill="#9CA3AF"
              fontFamily="system-ui"
            >
              {g.label}
            </text>
          </g>
        ))}

        {pts.map((p: any, i: number) => (
          <text
            key={i}
            x={p.x}
            y={H - 4}
            textAnchor="middle"
            fontSize="9"
            fill="#9CA3AF"
            fontFamily="system-ui"
          >
            {p.day}
          </text>
        ))}

        <path d={areaPath} fill="url(#areaGrad)" clipPath="url(#revealClip)" />
        <path
          d={linePath}
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glowFilter)"
          clipPath="url(#revealClip)"
        />

        {pts.map((p: any, i: number) => {
          const isHov = hovered === i;
          const visible = p.x <= PAD.left + innerW * progress;
          if (!visible) return null;
          return (
            <g key={i}>
              <rect
                x={p.x - 18}
                y={PAD.top}
                width={36}
                height={innerH}
                fill="transparent"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "crosshair" }}
              />
              {isHov && (
                <line
                  x1={p.x}
                  y1={PAD.top}
                  x2={p.x}
                  y2={PAD.top + innerH}
                  stroke="#6366F1"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.5"
                />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={isHov ? 6 : 4}
                fill={isHov ? "#4F46E5" : "#fff"}
                stroke={isHov ? "#4F46E5" : "#6366F1"}
                strokeWidth={isHov ? 0 : 2}
                style={{ transition: "r 0.15s, fill 0.15s" }}
              />
              {isHov && (
                <g>
                  <rect
                    x={p.x - 28}
                    y={p.y - 34}
                    width={56}
                    height={22}
                    rx={6}
                    fill="#4F46E5"
                  />
                  <text
                    x={p.x}
                    y={p.y - 19}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill="#fff"
                    fontFamily="system-ui"
                  >
                    {p.value}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/* ─────────────────────── Dashboard Page ───────────────────── */

import { useGetAdminDashboardStatsQuery } from "@/lib/api/statsApi";
import * as Icons from "lucide-react";

export default function Dashboard() {
  const { data: statsData, isLoading } = useGetAdminDashboardStatsQuery();

  const [chartView, setChartView] = useState("Weekly");
  const [searchTx, setSearchTx] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [chartKey, setChartKey] = useState(0);

  const transactions = statsData?.transactions || [];
  const dailyData = statsData?.dailyData || [];
  const weeklyData = statsData?.weeklyData || [];
  const activities = statsData?.activities || [];
  const kpis = statsData?.kpis || {
    totalActiveUsers: 0,
    revenueMTD: "৳0",
    completedTransactions: 0,
  };

  const chartData = chartView === "Daily" ? dailyData : weeklyData;

  const handleChartView = (v: string) => {
    setChartView(v);
    setChartKey((k) => k + 1);
  };

  const filtered = transactions.filter((t: any) => {
    const matchSearch =
      t.id.toLowerCase().includes(searchTx.toLowerCase()) ||
      t.user.toLowerCase().includes(searchTx.toLowerCase()) ||
      t.product.toLowerCase().includes(searchTx.toLowerCase());
    const matchStatus = statusFilter === "All" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const renderIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName] || Icons.Activity;
    return <IconComponent size={14} />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 bg-white sm:p-4 lg:p-5 space-y-4">
      {/* ── Premium Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <LayoutDashboard className="w-7 h-7 text-white" />
            </div>

            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
              Dashboard
            </h1>

            <p className="text-sm text-gray-500 font-medium mt-1">
              Welcome back, Admin · Here&apos;s what&apos;s happening today.
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-sm font-semibold text-gray-700">
            System Online
          </span>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            icon: <Users size={17} className="text-blue-600" />,
            bg: "bg-blue-50",
            label: "Total Active Users",
            value: kpis.totalActiveUsers.toLocaleString(),
            badge: "Live",
            up: true,
          },
          {
            icon: <div className="text-emerald-600 font-extrabold text-[17px] leading-none text-center min-w-[17px]">৳</div>,
            bg: "bg-emerald-50",
            label: "Revenue",
            value: kpis.revenueMTD,
            badge: "All time",
            up: true,
          },
          {
            icon: <ShoppingCart size={17} className="text-orange-500" />,
            bg: "bg-orange-50",
            label: "Completed Transactions",
            value: kpis.completedTransactions.toLocaleString(),
            badge: "Total",
            up: true,
          },
        ].map((c, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`${c.bg} p-2 rounded-lg`}>{c.icon}</div>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${c.up
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-500"
                  }`}
              >
                {c.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {c.badge}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">
              {c.label}
            </p>
            <p className="text-[22px] font-extrabold text-gray-900 mt-0.5 tracking-tight">
              {typeof c.value === 'string' ? c.value.replace('$', '৳') : c.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Chart + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
            <div>
              <h2 className="text-[13px] font-bold text-gray-900">
                Daily Performance
              </h2>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Revenue fluctuations over the period
              </p>
            </div>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
              {["Daily", "Weekly"].map((v) => (
                <button
                  key={v}
                  onClick={() => handleChartView(v)}
                  className={`text-[11px] font-semibold px-3 py-1 rounded-md transition-all ${chartView === v
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Summary row */}
          <div className="flex items-center gap-3 sm:gap-4 mb-3 px-1 flex-wrap">
            {[
              {
                label: "Peak",
                value: chartData?.length
                  ? Math.max(...chartData.map((d: any) => d.value))
                  : 0,
              },
              {
                label: "Avg",
                value: chartData?.length
                  ? Math.round(
                    chartData.reduce((s: number, d: any) => s + d.value, 0) /
                    chartData.length,
                  )
                  : 0,
              },
              {
                label: "Low",
                value: chartData?.length
                  ? Math.min(...chartData.map((d: any) => d.value))
                  : 0,
              },
            ].map((s, i, arr) => (
              <React.Fragment key={s.label}>
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                    {s.label}
                  </p>
                  <p className="text-[15px] font-extrabold text-gray-900">
                    {s.value}
                  </p>
                </div>
                {i < arr.length - 1 && (
                  <div className="w-px h-8 bg-gray-100 hidden sm:block" />
                )}
              </React.Fragment>
            ))}
            <div className="ml-auto flex items-center gap-1.5">
              <span className="w-3 h-0.5 rounded-full bg-indigo-500 inline-block" />
              <span className="text-[10px] text-gray-400 font-medium">
                Revenue
              </span>
            </div>
          </div>

          <LineChart key={chartKey} data={chartData} animated />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <h2 className="text-[13px] font-bold text-gray-900 mb-3">
            Recent Activity
          </h2>
          <div className="space-y-3">
            {activities.map((act: any, i: number) => (
              <div key={i} className="flex gap-3">
                <div className="flex-shrink-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                    style={{
                      backgroundColor: act.bg || "#EFF6FF",
                      color: act.color || "#3B82F6",
                    }}
                  >
                    {renderIcon(act.icon)}
                  </div>
                </div>
                <div className="pb-3 min-w-0">
                  <p className="text-[12px] font-bold text-gray-900 leading-tight truncate">
                    {act.title}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">
                    {act.desc}
                  </p>
                  <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
                    {act.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-3 border border-gray-200 text-[12px] text-indigo-600 font-semibold py-2 rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1 active:scale-95">
            View All Logs <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* ── Transactions Table ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3.5 border-b border-gray-100">
          <h2 className="text-[13px] font-bold text-gray-900">
            Recent High-Value Transactions
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <Search
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search hash, user…"
                value={searchTx}
                onChange={(e) => setSearchTx(e.target.value)}
                className="pl-7 pr-3 py-1.5 text-[12px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 w-full sm:w-44 transition-all"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className={`p-1.5 border rounded-lg transition-colors ${filterOpen || statusFilter !== "All"
                    ? "border-indigo-400 bg-indigo-50 text-indigo-600"
                    : "border-gray-200 hover:bg-gray-50 text-gray-500"
                  }`}
              >
                <SlidersHorizontal size={14} />
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-10 min-w-[130px]">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-1.5">
                    Status
                  </p>
                  {["All", "Success", "Failed"].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setStatusFilter(s);
                        setFilterOpen(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 text-[12px] font-medium rounded-lg transition-colors ${statusFilter === s
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Export — modal removed, simple download button */}
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors active:scale-95">
              <Download size={12} /> Export
            </button>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                {[
                  "Transaction ID",
                  "User",
                  "Product",
                  "Amount",
                  "Date",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 py-2.5"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-[12px] text-gray-400"
                  >
                    No transactions match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((tx: any, i: number) => (
                  <tr
                    key={i}
                    className="hover:bg-indigo-50/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-[12px] font-bold text-indigo-600">
                      {tx.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                          {tx.initials}
                        </div>
                        <span className="text-[12px] text-gray-800 font-medium">
                          {tx.user}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-500">
                      {tx.product}
                    </td>
                    <td className="px-4 py-3 text-[12px] font-bold text-gray-900">
                      ৳{String(tx.amount).replace(/[\$৳]/g, '')}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-400">
                      {tx.date}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${tx.status === "Success"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-600"
                          }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <p className="text-center text-[12px] text-gray-400 py-8">
              No transactions match your search.
            </p>
          ) : (
            filtered.map((tx: any, i: number) => (
              <div key={i} className="p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-indigo-600">
                    {tx.id}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tx.status === "Success"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-600"
                      }`}
                  >
                    {tx.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                    {tx.initials}
                  </div>
                  <span className="text-[12px] text-gray-800 font-medium">
                    {tx.user}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 truncate mr-2">
                    {tx.product}
                  </span>
                  <span className="text-[13px] font-extrabold text-gray-900 shrink-0">
                    ৳{String(tx.amount).replace(/[\$৳]/g, '')}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 font-medium">
                  {tx.date}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
