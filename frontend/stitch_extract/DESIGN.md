---
name: Midnight Protocol
colors:
  surface: '#051424'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#122131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#c8c6c8'
  on-secondary: '#313032'
  secondary-container: '#474649'
  on-secondary-container: '#b7b4b7'
  tertiary: '#c8c5ca'
  on-tertiary: '#303033'
  tertiary-container: '#929094'
  on-tertiary-container: '#2a292d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#e5e1e4'
  secondary-fixed-dim: '#c8c6c8'
  on-secondary-fixed: '#1c1b1d'
  on-secondary-fixed-variant: '#474649'
  tertiary-fixed: '#e4e1e6'
  tertiary-fixed-dim: '#c8c5ca'
  on-tertiary-fixed: '#1b1b1e'
  on-tertiary-fixed-variant: '#47464a'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
  emergency-red: '#ef4444'
  warning-amber: '#f59e0b'
  success-emerald: '#10b981'
  fema-blue: '#005287'
  unicef-cyan: '#00aeef'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  metric-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  stack-xs: 4px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  stack-xl: 32px
  container-margin: 24px
  gutter: 16px
---

## Brand & Style

The design system is engineered for high-stakes operational environments where clarity, speed of cognition, and data density are paramount. The brand personality is authoritative, vigilant, and ultra-modern, evoking the atmosphere of a high-tech command center. It is designed for emergency responders, logistics coordinators, and government officials who require real-time situational awareness.

The visual style is a sophisticated **Modern Dark Mode** with **Glassmorphic** accents. It leverages deep obsidian surfaces and tactical color signals to create a hierarchy of urgency. The aesthetic balances the structural rigidity of professional enterprise software with the sleek, luminous qualities of futuristic aerospace interfaces.

## Colors

This design system utilizes a layered dark-mode palette to create depth without sacrificing legibility. 

- **Base Surfaces:** The foundation uses `secondary_color_hex` (#0a0a0c) for background layers and `tertiary_color_hex` (#111114) for elevated card components.
- **Tactical Blue:** The `primary_color_hex` is used exclusively for interactive elements, focus states, and primary action paths.
- **Status Indicators:** Red, Amber, and Emerald are reserved for critical alerts, caution states, and operational success respectively. These must be used sparingly to maintain their psychological impact.
- **Luminance:** Text and icons use varying opacities of white and `neutral_color_hex` to establish visual hierarchy, ensuring the most critical data points have the highest contrast.

## Typography

The typography system prioritizes data density and rapid scanning. **Inter** provides a clean, geometric foundation for all prose and primary interface elements. For technical metadata, coordinates, and timestamps, a monospaced font (**JetBrains Mono**) is introduced to ensure character alignment and a "technical" feel.

- **High-Contrast Metrics:** Use `metric-xl` for critical numbers (e.g., casualty counts, wind speeds, active units).
- **Upper Case:** Labels should utilize uppercase styling with slight letter-spacing to distinguish them from interactive body text.
- **Contrast:** Headline levels must always be pure white (#FFFFFF), while body text should be slightly muted (85-90% opacity) to reduce eye strain during long shifts.

## Layout & Spacing

This design system adheres to a strict **8px/4px grid system**. All component dimensions, internal padding, and external margins must be multiples of these units to maintain mathematical harmony.

- **Grid Model:** A 12-column fluid grid is used for desktop dashboards. Components should snap to the grid, but internal card content relies on a **Fixed Grid** approach for metrics and data tables.
- **Internal Padding:** Cards and modules require generous internal padding (min 24px) to separate dense data clusters and prevent visual overwhelm.
- **Breakpoints:** 
  - **Desktop (1280px+):** 12 columns, 24px margins.
  - **Tablet (768px - 1279px):** 8 columns, 16px margins.
  - **Mobile (Under 768px):** 4 columns, 12px margins, vertical stack priority.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Glassmorphic** translucency rather than traditional heavy drop shadows.

- **Base Layer:** #0a0a0c (Solid).
- **Component Layer:** #111114 (Solid or 95% opacity).
- **Overlay/Modal Layer:** #111114 at 80% opacity with a 12px Backdrop Blur.
- **Borders:** Every card must have a subtle 1px border. Default state: `rgba(255, 255, 255, 0.1)`. Active/Hover state: `primary_color_hex` at 40% opacity.
- **Status Glows:** For critical status states, use a soft outer glow (spread: 12px, blur: 24px) using the respective status color at 15% opacity to "lift" the component off the base layer.

## Shapes

The shape language is "Soft-Technical." Elements use a subtle **0.25rem (4px) corner radius** to maintain a professional, rigid appearance while avoiding the aggressive feel of sharp corners.

- **Primary Components:** Buttons, Inputs, and Small Chips use the base 4px radius.
- **Large Components:** Dashboard cards and map overlays use `rounded-lg` (8px).
- **Indicators:** Small status pips (e.g., "Active" dots) should be fully circular.

## Components

- **Buttons:** Primary buttons use a solid `primary_color_hex` background. Secondary buttons use a transparent background with the 1px border. Hovering initiates a subtle 2% scale increase and a glow effect.
- **Cards:** The core of the system. Each card should feature a `label-sm` header with a 1px bottom border. Internal data points should be aligned to the 8px grid.
- **Status Chips:** Small, pill-shaped indicators using the named status colors. These should have a background opacity of 10% and a text opacity of 100% for maximum legibility.
- **Input Fields:** Darker than the card background (#070708) with a 1px border. On focus, the border shifts to `primary_color_hex` and the internal background glows slightly.
- **Data Tables:** High-density, no vertical borders, subtle horizontal zebra-striping using #16161a for alternate rows.
- **Tactical Map Overlays:** Use glassmorphism (80% opacity + blur) to allow the underlying map data to remain partially visible while interacting with sidebars or controls.