import { AnimatePresence, motion } from "framer-motion";
import { LayoutGrid, Tag, TrendingUp, X } from "lucide-react";
import { EarningTier } from "./types";
import { CATEGORY_PALETTE } from "./utils";
import FilterTag from "./FilterTag";

const EARNING_TIERS = [
  {
    label: "৳1k - ৳5k /mo",
    badge: "Starter",
    color: "from-slate-500 to-slate-700",
  },
  {
    label: "৳5k - ৳10k /mo",
    badge: "Growth",
    color: "from-blue-500 to-indigo-600",
  },
  { label: "৳10k+ / mo", badge: "Pro", color: "from-amber-500 to-orange-600" },
];

interface Props {
  categoriesList: string[];
  categoryMeta: Record<string, { icon: any; color: string; bg: string }>;
  selectedCats: string[];
  selectedEarning: EarningTier | "";
  maxPrice: number;
  hasActiveFilters: boolean;
  searchQ: string;
  toggleCat: (cat: string) => void;
  toggleEarning: (tier: EarningTier) => void;
  handlePriceChange: (val: number) => void;
  clearAll: () => void;
  // 👇 new: maximum possible price (slider upper bound)
  maxPriceLimit?: number;
}

export default function FilterPanel({
  categoriesList,
  categoryMeta,
  selectedCats,
  selectedEarning,
  maxPrice,
  hasActiveFilters,
  searchQ,
  toggleCat,
  toggleEarning,
  handlePriceChange,
  clearAll,
  maxPriceLimit = 100000, // default very high for “unlimited”
}: Props) {
  // progress bar width (1 … maxPriceLimit)
  const progressPercent = ((maxPrice - 1) / (maxPriceLimit - 1)) * 100;

  // determine if price filter is actually active (not at maximum limit)
  const isPriceFilterActive = maxPrice < maxPriceLimit;

  return (
    <div className="space-y-6">
      {/* Categories */}
      {/* ... unchanged ... */}

      <div className="border-t border-slate-100" />

      {/* Price Range – now unlimited */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="flex items-center gap-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-[.12em]">
            <Tag className="w-3 h-3" /> Price Range
          </p>
          <span className="text-[12px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
            Up to ৳{maxPrice.toLocaleString()}
          </span>
        </div>
        <div className="relative pt-1 pb-2">
          <div className="relative h-1.5 bg-slate-100 rounded-full">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <input
            type="range"
            min={1}
            max={maxPriceLimit}
            step={50}
            value={maxPrice}
            onChange={(e) => handlePriceChange(parseInt(e.target.value, 10))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-6 -top-2"
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 font-medium">
          <span>৳1</span>
          <span>৳{maxPriceLimit.toLocaleString()}</span>
        </div>
      </div>

      <div className="border-t border-slate-100" />

      {/* Earnings */}
      {/* ... unchanged ... */}

      {/* Active filters – price tag logic updated */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 pt-4">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[.12em] mb-2">
                Active Filters
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedCats.map((cat) => (
                  <FilterTag
                    key={cat}
                    label={cat}
                    onRemove={() => toggleCat(cat)}
                  />
                ))}
                {selectedEarning && (
                  <FilterTag
                    label={selectedEarning}
                    onRemove={() =>
                      toggleEarning(selectedEarning as EarningTier)
                    }
                  />
                )}
                {/* price filter – show only when NOT at max limit */}
                {isPriceFilterActive && (
                  <FilterTag
                    label={`≤ ৳${maxPrice.toLocaleString()}`}
                    onRemove={() => handlePriceChange(maxPriceLimit)}
                  />
                )}
                {searchQ && (
                  <FilterTag label={`"${searchQ}"`} onRemove={() => {}} />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => {
          // Clear all filters, and reset price to the maximum (no limit)
          handlePriceChange(maxPriceLimit);
          clearAll();
        }}
        className="w-full py-2.5 rounded-xl bg-slate-50 text-slate-500 border border-slate-200 text-[12.5px] font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all flex items-center justify-center gap-1.5"
      >
        <X className="w-3.5 h-3.5" /> Clear All Filters
      </button>
    </div>
  );
}
