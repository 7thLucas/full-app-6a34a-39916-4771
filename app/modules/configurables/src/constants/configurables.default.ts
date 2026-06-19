/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  primary: string;
  secondary: string;
  accent: string;
};

export type TExtendedColors = {
  background: string;
  surface: string;
  border: string;
  bestPriceGreen: string;
  dropRed: string;
  textPrimary: string;
  textSecondary: string;
};

export type TDefaultConfigurableData = {
  appName: string;
  tagline: string;
  logoUrl: string;
  brandColor: TBrandColor;
  colors: TExtendedColors;
  searchPlaceholder: string;
  heroHeadline: string;
  heroSubline: string;
  ctaLabel: string;
  platforms: string[];
  footerText: string;
  showDropBanner: boolean;
  maxResultsPerSearch: number;
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "Faseyeon",
  tagline: "Every piece. Every price. One search.",
  logoUrl: "FILL_LOGO_URL_HERE",
  brandColor: {
    primary: "#C8A96E",
    secondary: "#141414",
    accent: "#C8A96E",
  },
  colors: {
    background: "#0A0A0A",
    surface: "#141414",
    border: "#222222",
    bestPriceGreen: "#2ECC71",
    dropRed: "#E63946",
    textPrimary: "#F5F5F5",
    textSecondary: "#888888",
  },
  searchPlaceholder: "Search any fashion item…",
  heroHeadline: "Every piece. Every price.",
  heroSubline: "Compare fashion prices across ASOS, Farfetch, Zalando, Net-a-Porter, Zara, H&M and more — instantly.",
  ctaLabel: "Search Now",
  platforms: ["ASOS", "Farfetch", "Zalando", "Net-a-Porter", "Zara", "H&M", "Brand Sites"],
  footerText: "© 2026 Faseyeon. Compare smarter. Shop better.",
  showDropBanner: true,
  maxResultsPerSearch: 20,
};
