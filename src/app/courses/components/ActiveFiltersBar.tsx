import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import FilterTag from "./FilterTag";

interface Props {
  selectedCats: string[];
  selectedEarning: string;
  maxPrice: number;
  searchQ: string;
  toggleCat: (cat: string) => void;
  toggleEarning: (tier: string) => void;
  handlePriceChange: (val: number) => void;
  handleSearch: (val: string) => void;
  clearAll: () => void;
  visible: boolean;
}

export default function ActiveFiltersBar({
  visible,
  selectedCats,
  selectedEarning,
  maxPrice,
  searchQ,
  toggleCat,
  toggleEarning,
  handlePriceChange,
  handleSearch,
  clearAll,
}: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden overflow-hidden mb-4"
        >
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
                onRemove={() => toggleEarning(selectedEarning)}
              />
            )}
            {maxPrice < 2000 && (
              <FilterTag
                label={`≤ ৳${maxPrice.toLocaleString()}`}
                onRemove={() => handlePriceChange(2000)}
              />
            )}
            {searchQ && (
              <FilterTag
                label={`"${searchQ}"`}
                onRemove={() => handleSearch("")}
              />
            )}
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-500 border border-red-100 text-[11px] font-semibold hover:bg-red-100 transition-all"
            >
              <X className="w-2.5 h-2.5" /> Clear all
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
