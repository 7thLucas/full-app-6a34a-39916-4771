# Faseyeon — Design Guidelines

## Aesthetic
Editorial luxury meets functional clarity. Think Vogue meets Bloomberg Terminal. Dark, high-contrast, typographically confident.

## Color Palette
- **Background:** #0A0A0A (near-black)
- **Surface:** #141414 (card/panel background)
- **Border:** #222222 (subtle dividers)
- **Accent:** #C8A96E (warm gold — exclusivity, premium signal)
- **Best Price Green:** #2ECC71 (clear positive signal)
- **Drop Red:** #E63946 (urgency for exclusive drops)
- **Text Primary:** #F5F5F5 (near-white)
- **Text Secondary:** #888888 (muted labels)

## Typography
- **Display / Headlines:** Playfair Display — serif, editorial gravitas
- **Body / UI:** Inter — clean, legible at all sizes
- **Accent labels:** Inter uppercase tracked — platform badges, tags

## Elevation & Surfaces
- Cards use subtle border (#222222) rather than heavy shadows
- Hover states: border lifts to #C8A96E (gold) for selected/active
- Glassmorphism sparingly on overlay panels only

## Key Components

### Search Bar
- Full-width, prominent, centered on landing
- Large placeholder text: "Search any fashion item…"
- Instant results below as user types

### Results Card
- Platform logo + name (left)
- Item name + variant info (center)
- Price large and bold (right)
- Best price badge (green chip: "Best Price")
- Drop badge (red chip: "Exclusive Drop") — pinned to top of list
- Direct "Buy Now" CTA button

### Drop Banner
- Full-width alert strip at top of results when drops are present
- Gold/red gradient background, animated pulse
- "X Exclusive Drops Found" with count

### Platform Badges
- Small pill labels per retailer (ASOS, Farfetch, Zalando, etc.)
- Monochrome with brand color on hover

## Layout
- Single-column search + results feed
- Max content width: 800px centered
- Generous whitespace — let results breathe
- Mobile-first, responsive

## Motion
- Results fade in staggered on search
- Drop badge pulses gently
- Price highlight animates in (scale up briefly)
