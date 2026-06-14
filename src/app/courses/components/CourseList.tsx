"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, Sparkles, TrendingUp } from "lucide-react";
import { useGetPublicCoursesQuery } from "@/lib/api/courseApi";
import { useAdminCategoriesQuery } from "@/lib/api/admin/category";
import { Course, EarningTier, SortKey } from "./types";
import { extractCategories, CATEGORY_PALETTE } from "./utils";
import FilterPanel from "./FilterPanel";
import SearchAndSortBar from "./SearchAndSortBar";
import ActiveFiltersBar from "./ActiveFiltersBar";
import EmptyState from "./EmptyState";
import CourseGrid from "./CourseGrid";
import Pagination from "./Pagination";
import MobileFilterSheet from "./MobileFilterSheet";

const PAGE_SIZE = 8;

export default function CourseList() {
  const { data: allCoursesData } = useGetPublicCoursesQuery({
    page: 1,
    limit: 100,
  });
  const { data: catData } = useAdminCategoriesQuery();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedEarning, setSelectedEarning] = useState<EarningTier | "">("");
  const [maxPrice, setMaxPrice] = useState(100000);
  const [searchQ, setSearchQ] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("potential");
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const cats = (searchParams.get("categories")?.split(",") ?? []) as string[];
    const earn = (searchParams.get("earnings") ?? "") as EarningTier | "";
    const price = parseInt(searchParams.get("price") ?? "3000", 10);
    const sort = (searchParams.get("sort") ?? "potential") as SortKey;
    const q = searchParams.get("q") ?? "";
    if (cats.length) setSelectedCats(cats);
    if (earn) setSelectedEarning(earn);
    if (!isNaN(price)) setMaxPrice(price);
    setSortBy(sort);
    setSearchQ(q);
  }, [searchParams]);

  const syncURL = useCallback(
    (cats: string[], earn: string, price: number, sort: string, q: string) => {
      const p = new URLSearchParams();
      if (cats.length) p.set("categories", cats.join(","));
      if (earn) p.set("earnings", earn);
      if (price < 100000) p.set("price", String(price));
      p.set("sort", sort);
      if (q) p.set("q", q);
      router.replace(`/courses?${p.toString()}`, { scroll: false });
    },
    [router],
  );

  const updateFilter = (updater: () => void) => {
    updater();
    setPage(1);
  };

  const toggleCat = (cat: string) =>
    updateFilter(() =>
      setSelectedCats((prev) =>
        prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
      ),
    );
  const toggleEarning = (tier: EarningTier) =>
    updateFilter(() =>
      setSelectedEarning((prev) => (prev === tier ? "" : tier)),
    );
  const handlePriceChange = (val: number) =>
    updateFilter(() => setMaxPrice(val));
  const handleSort = (val: SortKey) => {
    setSortBy(val);
    syncURL(selectedCats, selectedEarning, maxPrice, val, searchQ);
  };
  const handleSearch = (val: string) => {
    setSearchQ(val);
    setPage(1);
    syncURL(selectedCats, selectedEarning, maxPrice, sortBy, val);
  };
  const clearAll = () => {
    setSelectedCats([]);
    setSelectedEarning("");
    setMaxPrice(100000);
    setSearchQ("");
    setPage(1);
    router.replace("/courses");
  };

  const categoriesFromApi = useMemo(
    () => extractCategories(catData),
    [catData],
  );
  const categoryMeta = useMemo(() => {
    const map: Record<string, (typeof CATEGORY_PALETTE)[number]> = {};
    categoriesFromApi.forEach((cat, i) => {
      map[cat] = CATEGORY_PALETTE[i % CATEGORY_PALETTE.length];
    });
    return map;
  }, [categoriesFromApi]);

  const courses: Course[] = useMemo(() => {
    const rawItems = allCoursesData?.items || [];
    return rawItems.map((c: any) => ({
      id: c.id,
      title: c.title ?? "Untitled",
      desc: c.description ?? "",
      image: c.thumbnail ?? "/placeholder.jpg",
      price: Number(c.price ?? 0),
      category: c.category?.name ?? "Uncategorized",
      potential:
        Number(c.price) > 100 ? "৳10k+/mo Potential" : "৳2k+/mo Potential",
      potentialVal: Number(c.price) > 100 ? 10000 : 2000,
      commission: "0%",
      commissionVal: 0,
      earnings: "Beginner",
      rating: 4.9,
      reviews: "1.2k",
    }));
  }, [allCoursesData]);

  const filtered = courses
    .filter((c) => {
      if (selectedCats.length && !selectedCats.includes(c.category))
        return false;
      if (selectedEarning && c.earnings !== selectedEarning) return false;
      if (c.price > maxPrice) return false;
      if (
        searchQ &&
        !c.title.toLowerCase().includes(searchQ.toLowerCase()) &&
        !c.desc.toLowerCase().includes(searchQ.toLowerCase())
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "commission":
          return b.commissionVal - a.commissionVal;
        default:
          return b.potentialVal - a.potentialVal;
      }
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const hasActive =
    selectedCats.length > 0 ||
    !!selectedEarning ||
    maxPrice < 100000 ||
    !!searchQ;
  const activeCount =
    selectedCats.length +
    (selectedEarning ? 1 : 0) +
    (maxPrice < 100000 ? 1 : 0) +
    (searchQ ? 1 : 0);

  const filterPanelProps = {
    categoriesList: categoriesFromApi,
    categoryMeta,
    selectedCats,
    selectedEarning,
    maxPrice,
    hasActiveFilters: hasActive,
    searchQ,
    toggleCat,
    toggleEarning,
    handlePriceChange,
    clearAll,
  };

  // ── NEW BLUE PALETTE ──
  const grad = "linear-gradient(135deg, #0047FF 0%, #0066FF 50%, #0039CC 100%)";
  const gradSoft =
    "linear-gradient(135deg, #f0f4ff 0%, #e6edff 50%, #dbe6ff 100%)";

  return (
    <div
      className="min-h-screen"
      style={{ 
        fontFamily: "var(--font-bai-jamjuree, sans-serif)",
        background: "linear-gradient(135deg, #f8f9ff 0%, #f0f1ff 40%, #eef0ff 100%)" 
      }}
    >
      {/* HERO BANNER */}
      <div
        className="relative overflow-hidden border-b border-blue-200/60"
        style={{ background: gradSoft }}
      >
        {/* blobs */}
        <div
          className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-25 blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(circle, #3388FF, transparent)",
          }}
        />
        <div
          className="absolute -bottom-12 right-0 w-56 h-56 rounded-full opacity-20 blur-2xl pointer-events-none"
          style={{
            background: "radial-gradient(circle, #0066FF, transparent)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 opacity-10 blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, #66a3ff, transparent)",
          }}
        />

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
          {/* PREMIUM pill */}
          <div
            className="inline-flex items-center gap-1.5 text-[10.5px] font-black px-3 py-1 rounded-full mb-4 border border-blue-300/60 text-blue-700"
            style={{ background: "rgba(0,71,255,0.1)" }}
          >
            <Sparkles className="w-3 h-3" />
            PREMIUM COURSES
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            {/* Left — heading */}
            <div>
              <h1 className="text-[26px] sm:text-[32px] font-black text-slate-900 tracking-tight leading-tight">
                Active{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: grad }}
                >
                  Opportunities
                </span>
              </h1>
              <p className="text-[13px] sm:text-[13.5px] text-slate-500 mt-1.5 font-medium">
                {filtered.length} course{filtered.length !== 1 ? "s" : ""}{" "}
                available — hand-picked for maximum earning potential
              </p>
            </div>

            {/* Right — stat chips */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {[
                { label: "Avg. ROI", value: "312%" },
                { label: "Students", value: "24.8k" },
                { label: "Rating", value: "4.9 ★" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center bg-white/75 backdrop-blur-sm border border-blue-100 rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-sm min-w-[68px]"
                >
                  <span className="text-[14px] sm:text-[15px] font-black text-[#0047FF]">
                    {s.value}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE SEARCH + FILTER TRIGGER */}
      <div className="lg:hidden sticky top-[60px] z-40 bg-white/95 backdrop-blur-md border-b border-blue-100 px-4 py-3 shadow-sm">
        <SearchAndSortBar
          searchQ={searchQ}
          sortBy={sortBy}
          onSearch={handleSearch}
          onSort={handleSort}
          isMobile
          onFilterOpen={() => setFilterOpen(true)}
          activeFilterCount={activeCount}
        />
      </div>

      {/* MAIN LAYOUT */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col lg:flex-row gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 xl:w-[272px] shrink-0 lg:sticky lg:top-[76px] lg:self-start">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shadow-md shadow-blue-300/40"
                style={{ background: grad }}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[14px] font-extrabold text-slate-900 tracking-tight">
                Refine Pursuit
              </span>
            </div>
            {hasActive && (
              <span
                className="text-[10px] font-black text-white px-2.5 py-0.5 rounded-full shadow-sm"
                style={{ background: grad }}
              >
                {activeCount}
              </span>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-[0_4px_24px_rgba(0,71,255,0.08)]">
            <FilterPanel {...filterPanelProps} />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <ActiveFiltersBar
            visible={hasActive}
            selectedCats={selectedCats}
            selectedEarning={selectedEarning}
            maxPrice={maxPrice}
            searchQ={searchQ}
            toggleCat={toggleCat}
            toggleEarning={toggleEarning}
            handlePriceChange={handlePriceChange}
            handleSearch={handleSearch}
            clearAll={clearAll}
          />

          <div className="hidden lg:flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#0047FF]" />
              <span className="text-[13px] text-slate-500 font-medium">
                Showing{" "}
                <span className="font-extrabold text-slate-900">
                  {paginated.length}
                </span>{" "}
                of{" "}
                <span className="font-extrabold text-slate-900">
                  {filtered.length}
                </span>{" "}
                courses
              </span>
            </div>
            <SearchAndSortBar
              searchQ={searchQ}
              sortBy={sortBy}
              onSearch={handleSearch}
              onSort={handleSort}
            />
          </div>

          <div className="lg:hidden flex items-center gap-1.5 mb-4">
            <TrendingUp className="w-3.5 h-3.5 text-[#0047FF]" />
            <span className="text-[12px] text-slate-500 font-medium">
              <span className="font-extrabold text-slate-800">
                {filtered.length}
              </span>{" "}
              courses found
            </span>
          </div>

          {paginated.length === 0 ? (
            <EmptyState onClear={clearAll} />
          ) : (
            <>
              <CourseGrid courses={paginated} categoryMeta={categoryMeta} />
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </>
          )}
        </main>
      </div>

      <MobileFilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        activeFilterCount={activeCount}
        filteredCount={filtered.length}
        filterPanelProps={filterPanelProps}
      />
    </div>
  );
}
