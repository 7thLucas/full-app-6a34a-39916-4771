import { useState, useRef, useEffect, useCallback } from "react";
import { useConfigurables } from "~/modules/configurables";
import type { TDefaultConfigurableData } from "~/modules/configurables/src/constants/configurables.default";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SearchResult {
  platform: string;
  itemName: string;
  variant: string;
  price: number;
  currency: string;
  availability: "In Stock" | "Low Stock" | "Out of Stock";
  isExclusiveDrop: boolean;
  buyUrl: string;
}

interface SearchResponse {
  results: SearchResult[];
  totalDrops: number;
  searchedItem: string;
}

type SearchState = "idle" | "loading" | "done" | "error";

// ─── Platform Colors ───────────────────────────────────────────────────────────

const PLATFORM_COLORS: Record<string, string> = {
  ASOS: "#2AD2E4",
  Farfetch: "#0F0F0F",
  Zalando: "#FF6900",
  "Net-a-Porter": "#000000",
  Zara: "#1A1A1A",
  "H&M": "#E50010",
  "Brand Site": "#C8A96E",
};

function getPlatformColor(platform: string): string {
  return PLATFORM_COLORS[platform] ?? "#888888";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlatformBadge({ platform }: { platform: string }) {
  const color = getPlatformColor(platform);
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-widest border transition-colors duration-200"
      style={{
        borderColor: color,
        color: color,
        backgroundColor: `${color}14`,
      }}
    >
      {platform}
    </span>
  );
}

function DropBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
      style={{
        backgroundColor: "#E6394618",
        color: "#E63946",
        border: "1px solid #E6394640",
        animation: "faseyeon-pulse 2.4s ease-in-out infinite",
      }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: "#E63946", animation: "faseyeon-pulse 2.4s ease-in-out infinite" }}
      />
      Exclusive Drop
    </span>
  );
}

function BestPriceBadge() {
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
      style={{
        backgroundColor: "#2ECC7118",
        color: "#2ECC71",
        border: "1px solid #2ECC7140",
      }}
    >
      Best Price
    </span>
  );
}

function AvailabilityDot({ availability }: { availability: string }) {
  const colorMap: Record<string, string> = {
    "In Stock": "#2ECC71",
    "Low Stock": "#F59E0B",
    "Out of Stock": "#888888",
  };
  const color = colorMap[availability] ?? "#888888";
  return (
    <span className="flex items-center gap-1.5 text-xs" style={{ color }}>
      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {availability}
    </span>
  );
}

function ResultCard({
  result,
  isBestPrice,
  index,
}: {
  result: SearchResult;
  isBestPrice: boolean;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  const borderColor = result.isExclusiveDrop
    ? "#E63946"
    : hovered
    ? "#C8A96E"
    : "#E0E0E0";

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: result.currency || "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(result.price);

  return (
    <div
      className="relative rounded-xl p-5 transition-all duration-300"
      style={{
        backgroundColor: "#FFFFFF",
        border: `1px solid ${borderColor}`,
        opacity: result.availability === "Out of Stock" ? 0.55 : 1,
        animation: `faseyeon-fadein 0.4s ease-out ${index * 0.06}s both`,
        boxShadow: result.isExclusiveDrop
          ? "0 0 20px #E6394618"
          : hovered
          ? "0 0 20px #C8A96E18"
          : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top row: badges */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <PlatformBadge platform={result.platform} />
        {result.isExclusiveDrop && <DropBadge />}
        {isBestPrice && !result.isExclusiveDrop && <BestPriceBadge />}
        {isBestPrice && result.isExclusiveDrop && <BestPriceBadge />}
      </div>

      {/* Main row: item info + price + cta */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: item details */}
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold leading-tight truncate"
            style={{ color: "#111111", fontFamily: "'Inter', sans-serif" }}
            title={result.itemName}
          >
            {result.itemName}
          </p>
          {result.variant && (
            <p
              className="text-xs mt-1 truncate"
              style={{ color: "#666666" }}
              title={result.variant}
            >
              {result.variant}
            </p>
          )}
          <div className="mt-2">
            <AvailabilityDot availability={result.availability} />
          </div>
        </div>

        {/* Right: price + button */}
        <div className="flex flex-col items-end gap-2.5 shrink-0">
          <span
            className="text-xl font-bold leading-none"
            style={{
              color: isBestPrice ? "#2ECC71" : "#111111",
              fontFamily: "'Inter', sans-serif",
              animation: isBestPrice ? "faseyeon-pricein 0.5s ease-out both" : undefined,
            }}
          >
            {formattedPrice}
          </span>
          {result.availability !== "Out of Stock" ? (
            <a
              href={result.buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95"
              style={{
                backgroundColor: result.isExclusiveDrop ? "#E63946" : "#C8A96E",
                color: "#0A0A0A",
              }}
            >
              Buy Now
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M1 9L9 1M9 1H3M9 1V7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          ) : (
            <span
              className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider"
              style={{ backgroundColor: "#EBEBEB", color: "#888888" }}
            >
              Sold Out
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function DropBanner({ count, searchedItem }: { count: number; searchedItem: string }) {
  return (
    <div
      className="w-full rounded-xl px-5 py-4 flex items-center justify-between gap-4 mb-2"
      style={{
        background: "linear-gradient(135deg, #C8A96E22 0%, #E6394622 100%)",
        border: "1px solid #E6394640",
        animation: "faseyeon-fadein 0.3s ease-out both",
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="text-lg"
          style={{ animation: "faseyeon-pulse 2s ease-in-out infinite" }}
          aria-hidden="true"
        >
          🔥
        </span>
        <div>
          <p
            className="text-sm font-bold"
            style={{ color: "#111111", fontFamily: "'Inter', sans-serif" }}
          >
            {count} Exclusive Drop{count !== 1 ? "s" : ""} Found
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#666666" }}>
            Limited availability for &ldquo;{searchedItem}&rdquo;
          </p>
        </div>
      </div>
      <span
        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shrink-0"
        style={{
          backgroundColor: "#E6394620",
          color: "#E63946",
          border: "1px solid #E6394640",
        }}
      >
        Act fast
      </span>
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div
      className="text-center py-16 px-6"
      style={{ animation: "faseyeon-fadein 0.4s ease-out both" }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: "#F5F5F5", border: "1px solid #E0E0E0" }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          style={{ color: "#888888" }}
        >
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
          <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-base font-semibold" style={{ color: "#111111" }}>
        No results for &ldquo;{query}&rdquo;
      </p>
      <p className="text-sm mt-2" style={{ color: "#666666" }}>
        Try a different item name or check the spelling.
      </p>
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="rounded-xl p-5 animate-pulse"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E0E0E0",
            animationDelay: `${i * 0.1}s`,
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className="h-5 rounded"
              style={{ width: "80px", backgroundColor: "#E0E0E0" }}
            />
            {i === 0 && (
              <div
                className="h-5 rounded-full"
                style={{ width: "100px", backgroundColor: "#E0E0E0" }}
              />
            )}
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div
                className="h-4 rounded"
                style={{ width: "60%", backgroundColor: "#E0E0E0" }}
              />
              <div
                className="h-3 rounded"
                style={{ width: "40%", backgroundColor: "#EBEBEB" }}
              />
            </div>
            <div className="flex flex-col items-end gap-2">
              <div
                className="h-6 rounded"
                style={{ width: "64px", backgroundColor: "#E0E0E0" }}
              />
              <div
                className="h-7 rounded-lg"
                style={{ width: "80px", backgroundColor: "#E0E0E0" }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PriceSummaryBar({
  results,
}: {
  results: SearchResult[];
}) {
  const available = results.filter((r) => r.availability !== "Out of Stock");
  if (available.length < 2) return null;

  const prices = available.map((r) => r.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const saving = max - min;
  const savingPct = Math.round((saving / max) * 100);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div
      className="rounded-xl px-5 py-4 flex flex-wrap items-center gap-x-6 gap-y-2 mb-2"
      style={{
        backgroundColor: "#F5F5F5",
        border: "1px solid #E0E0E0",
        animation: "faseyeon-fadein 0.3s ease-out 0.1s both",
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tracking-widest" style={{ color: "#666666" }}>
          Range
        </span>
        <span className="text-sm font-semibold" style={{ color: "#111111" }}>
          {fmt(min)} – {fmt(max)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tracking-widest" style={{ color: "#666666" }}>
          Max Saving
        </span>
        <span className="text-sm font-bold" style={{ color: "#2ECC71" }}>
          {fmt(saving)} ({savingPct}%)
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tracking-widest" style={{ color: "#666666" }}>
          Platforms
        </span>
        <span className="text-sm font-semibold" style={{ color: "#111111" }}>
          {results.length}
        </span>
      </div>
    </div>
  );
}

// ─── Search Hook ──────────────────────────────────────────────────────────────

function useSearch() {
  const [state, setState] = useState<SearchState>("idle");
  const [data, setData] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState("loading");
    setError(null);
    setData(null);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
        signal: controller.signal,
      });
      const json = (await res.json()) as {
        success: boolean;
        data?: SearchResponse;
        message?: string;
      };

      if (!json.success || !json.data) {
        setError(json.message ?? "Search failed. Please try again.");
        setState("error");
        return;
      }

      setData(json.data);
      setState("done");
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError("Search failed. Please try again.");
      setState("error");
    }
  }, []);

  return { state, data, error, search };
}

// ─── Trending Searches ────────────────────────────────────────────────────────

const TRENDING_ITEMS = [
  "Acne Studios scarf",
  "Nike Air Force 1",
  "Toteme trench coat",
  "New Balance 9060",
  "Bottega Veneta bag",
  "Adidas Samba",
  "Loewe puzzle bag",
  "APC jeans",
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function IndexPage() {
  const { config, loading } = useConfigurables();
  const cfg = config as TDefaultConfigurableData | null;

  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const { state, data, error, search } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  const appName = cfg?.appName ?? "Faseyeon";
  const tagline = cfg?.tagline ?? "Every piece. Every price. One search.";
  const searchPlaceholder = cfg?.searchPlaceholder ?? "Search any fashion item…";
  const heroHeadline = cfg?.heroHeadline ?? "Every piece. Every price.";
  const heroSubline =
    cfg?.heroSubline ??
    "Compare fashion prices across ASOS, Farfetch, Zalando, Net-a-Porter, Zara, H&M and more — instantly.";
  const ctaLabel = cfg?.ctaLabel ?? "Search Now";
  const footerText = cfg?.footerText ?? `© 2026 ${appName}. Compare smarter. Shop better.`;
  const showDropBanner = cfg?.showDropBanner !== false;
  const logoUrl = cfg?.logoUrl;

  const colors = cfg?.colors ?? {
    background: "#FFFFFF",
    surface: "#F5F5F5",
    border: "#E0E0E0",
    bestPriceGreen: "#2ECC71",
    dropRed: "#E63946",
    textPrimary: "#111111",
    textSecondary: "#666666",
  };

  const accent = cfg?.brandColor?.accent ?? cfg?.brandColor?.primary ?? "#C8A96E";

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || state === "loading") return;
    setSubmittedQuery(query.trim());
    search(query.trim());
  };

  const handleTrending = (item: string) => {
    setQuery(item);
    setSubmittedQuery(item);
    search(item);
    inputRef.current?.focus();
  };

  // Find best-price index among available results
  const bestPriceIndex =
    data?.results && data.results.length > 0
      ? data.results.reduce<number | null>((best, r, i) => {
          if (r.availability === "Out of Stock") return best;
          if (best === null) return i;
          return r.price < data.results[best].price ? i : best;
        }, null)
      : null;

  const hasResults = state === "done" && data && data.results.length > 0;
  const isEmpty = state === "done" && data && data.results.length === 0;

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: `${accent} transparent ${accent} ${accent}` }}
        />
      </div>
    );
  }

  return (
    <>
      {/* Global styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap');

        body {
          background-color: ${colors.background};
          color: ${colors.textPrimary};
          font-family: 'Inter', sans-serif;
        }

        @keyframes faseyeon-fadein {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes faseyeon-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes faseyeon-pricein {
          0% { transform: scale(0.9); opacity: 0; }
          60% { transform: scale(1.06); }
          100% { transform: scale(1); opacity: 1; }
        }

        .faseyeon-search-input:focus {
          outline: none;
          border-color: ${accent} !important;
          box-shadow: 0 0 0 1px ${accent}40;
        }

        .faseyeon-search-input::placeholder {
          color: #AAAAAA;
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${colors.background}; }
        ::-webkit-scrollbar-thumb { background: #CCCCCC; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #AAAAAA; }
      `}</style>

      <div
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: colors.background, color: colors.textPrimary }}
      >
        {/* ── Header ── */}
        <header
          className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
          style={{
            backgroundColor: `${colors.background}f0`,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center gap-3">
            {logoUrl && logoUrl !== "FILL_LOGO_URL_HERE" ? (
              <img src={logoUrl} alt={appName} className="h-7 w-auto object-contain" />
            ) : (
              <span
                className="text-xl font-bold tracking-tight"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: accent,
                }}
              >
                {appName}
              </span>
            )}
          </div>
          <p
            className="hidden sm:block text-xs uppercase tracking-widest"
            style={{ color: colors.textSecondary }}
          >
            {tagline}
          </p>
        </header>

        {/* ── Hero + Search ── */}
        <main className="flex-1 w-full mx-auto px-4 sm:px-6" style={{ maxWidth: "860px" }}>
          {/* Hero */}
          <div
            className="text-center pt-12 pb-10"
            style={{ animation: "faseyeon-fadein 0.6s ease-out both" }}
          >
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: colors.textPrimary,
              }}
            >
              {heroHeadline}
            </h1>
            <p
              className="text-sm sm:text-base max-w-xl mx-auto leading-relaxed"
              style={{ color: colors.textSecondary }}
            >
              {heroSubline}
            </p>
          </div>

          {/* Search form */}
          <div
            className="relative mb-8"
            style={{ animation: "faseyeon-fadein 0.6s ease-out 0.1s both" }}
          >
            <form onSubmit={handleSubmit} className="relative flex items-center">
              {/* Search icon */}
              <div className="absolute left-4 pointer-events-none" style={{ color: "#AAAAAA" }}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
                  <path
                    d="m21 21-4.35-4.35"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="faseyeon-search-input w-full pl-12 pr-36 py-4 rounded-xl text-base transition-all duration-200"
                style={{
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  color: colors.textPrimary,
                  fontFamily: "'Inter', sans-serif",
                }}
                autoComplete="off"
                spellCheck={false}
                disabled={state === "loading"}
                aria-label="Search fashion items"
              />

              <button
                type="submit"
                disabled={!query.trim() || state === "loading"}
                className="absolute right-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
                style={{
                  backgroundColor: accent,
                  color: "#0A0A0A",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {state === "loading" ? (
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin"
                      style={{ borderColor: `#0A0A0A transparent #0A0A0A #0A0A0A` }}
                    />
                    Searching
                  </span>
                ) : (
                  ctaLabel
                )}
              </button>
            </form>
          </div>

          {/* Trending searches */}
          {state === "idle" && (
            <div
              className="mb-10"
              style={{ animation: "faseyeon-fadein 0.6s ease-out 0.2s both" }}
            >
              <p
                className="text-xs uppercase tracking-widest mb-3"
                style={{ color: colors.textSecondary }}
              >
                Trending Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {TRENDING_ITEMS.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleTrending(item)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: colors.surface,
                      border: `1px solid ${colors.border}`,
                      color: colors.textSecondary,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = accent;
                      (e.currentTarget as HTMLButtonElement).style.color = accent;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = colors.border;
                      (e.currentTarget as HTMLButtonElement).style.color = colors.textSecondary;
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading skeleton */}
          {state === "loading" && (
            <div className="mb-10">
              <SearchSkeleton />
            </div>
          )}

          {/* Error state */}
          {state === "error" && error && (
            <div
              className="rounded-xl px-5 py-4 mb-10"
              style={{
                backgroundColor: "#E6394610",
                border: `1px solid #E6394640`,
                animation: "faseyeon-fadein 0.3s ease-out both",
              }}
            >
              <p className="text-sm font-semibold" style={{ color: "#E63946" }}>
                {error}
              </p>
            </div>
          )}

          {/* Results */}
          {hasResults && data && (
            <div className="mb-12">
              {/* Drop banner */}
              {showDropBanner && data.totalDrops > 0 && (
                <DropBanner count={data.totalDrops} searchedItem={data.searchedItem} />
              )}

              {/* Price summary */}
              <PriceSummaryBar results={data.results} />

              {/* Results header */}
              <div className="flex items-center justify-between mb-3 mt-2">
                <p
                  className="text-xs uppercase tracking-widest"
                  style={{ color: colors.textSecondary }}
                >
                  {data.results.length} results for &ldquo;{data.searchedItem}&rdquo;
                </p>
                <p className="text-xs" style={{ color: colors.textSecondary }}>
                  Sorted by price
                </p>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                {data.results.map((result, i) => (
                  <ResultCard
                    key={`${result.platform}-${i}`}
                    result={result}
                    isBestPrice={i === bestPriceIndex}
                    index={i}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {isEmpty && <EmptyState query={submittedQuery} />}
        </main>

        {/* ── Footer ── */}
        <footer
          className="px-6 py-6 text-center"
          style={{
            borderTop: `1px solid ${colors.border}`,
          }}
        >
          <p className="text-xs" style={{ color: colors.textSecondary }}>
            {footerText}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-3">
            {(cfg?.platforms ?? TRENDING_ITEMS).slice(0, 7).map
              ? (cfg?.platforms ?? ["ASOS", "Farfetch", "Zalando", "Net-a-Porter", "Zara", "H&M", "Brand Sites"]).slice(0, 7).map(
                  (p: string) => (
                    <span key={p} className="text-[10px] uppercase tracking-widest" style={{ color: "#999999" }}>
                      {p}
                    </span>
                  ),
                )
              : null}
          </div>
        </footer>
      </div>
    </>
  );
}
