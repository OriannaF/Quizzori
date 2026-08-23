---
name: Quizzori Dark Fidelity
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394e'
  surface-container-lowest: '#060d20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dbe2fd'
  on-surface-variant: '#c5c5d9'
  inverse-surface: '#dbe2fd'
  inverse-on-surface: '#283044'
  outline: '#8e8fa2'
  outline-variant: '#444656'
  surface-tint: '#bbc3ff'
  primary: '#bbc3ff'
  on-primary: '#001d93'
  primary-container: '#3d5afe'
  on-primary-container: '#f1f0ff'
  inverse-primary: '#2848ee'
  secondary: '#7dffa2'
  on-secondary: '#003918'
  secondary-container: '#05e777'
  on-secondary-container: '#00622e'
  tertiary: '#f3aeff'
  on-tertiary: '#55006a'
  tertiary-container: '#a63ec1'
  on-tertiary-container: '#ffebfd'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dee0ff'
  primary-fixed-dim: '#bbc3ff'
  on-primary-fixed: '#000f5d'
  on-primary-fixed-variant: '#002ccd'
  secondary-fixed: '#62ff96'
  secondary-fixed-dim: '#00e475'
  on-secondary-fixed: '#00210b'
  on-secondary-fixed-variant: '#005226'
  tertiary-fixed: '#fdd6ff'
  tertiary-fixed-dim: '#f3aeff'
  on-tertiary-fixed: '#340042'
  on-tertiary-fixed-variant: '#790096'
  background: '#0b1326'
  on-background: '#dbe2fd'
  surface-variant: '#2d3449'
typography:
  stat-display:
    fontFamily: Hanken Grotesk
    fontSize: 96px
    fontWeight: '800'
    lineHeight: '1'
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max: 1440px
---

## Brand & Style
The brand personality is **modern, academic, and energetic**. It targets students and lifelong learners who require a focused yet stimulating environment. 

The design style is **Glassmorphic-Industrial**, blending the technical precision of a dashboard with the immersive depth of modern SaaS interfaces. It utilizes a "Dark Fidelity" approach where the interface feels deep and layered rather than flat. Key characteristics include semi-transparent surfaces, vibrant accent glows (primary blue and secondary green), and a structured sidebar navigation that provides a sense of permanent grounding. The emotional response should be one of "productive flow"—organized, high-tech, and encouraging.

## Colors
The palette is rooted in a **deep navy neutral** (`#0b1326`) which serves as the canvas. 

- **Primary Blue (`#3d5afe`):** Used for core actions, active states, and progress indicators. It carries a subtle glow effect to signify importance.
- **Secondary Green (`#00e676`):** Used for "Complete" states, positive feedback, and secondary progress tracks.
- **Tertiary Purple (`#8e24aa`):** Reserved for high-value highlights, such as exam scores or specialized course modules.
- **Neutral Layers:** The system uses five tiers of surfaces to create hierarchy. Accents and borders use low-opacity variants of the neutral outline color to maintain a "ghost" aesthetic rather than hard lines.

## Typography
The typography system uses a tri-font strategy to balance character and readability.

1.  **Hanken Grotesk (Headlines):** A sharp, contemporary sans-serif used for all branding and structural headers. It is bold and high-impact.
2.  **Manrope (Body):** A balanced, modern sans-serif optimized for long-form reading and interface descriptions.
3.  **JetBrains Mono (Labels/Stats):** A technical monospaced font used for metadata, timers, and uppercase labels. It reinforces the "systematic" and "academic" nature of the tool.

For extreme statistical highlights (like the "20" grade), use the `stat-display` role at 96px with heavy weight and tight tracking.

## Layout & Spacing
The layout employs a **12-column fluid grid** for the main content area, pinned by a **fixed 256px (w-64) sidebar** on the left.

- **Main Container:** Max-width of 1440px with 24px gutters.
- **Header:** Fixed at the top with a 64px height and backdrop blur to maintain visibility over scrolled content.
- **Column Splits:** Content typically splits into an 8-column main feed and a 4-column "stats/context" sidebar.
- **Rhythm:** A 4px baseline unit is used for internal component padding, while 24px (gutter) is the standard for separating major sections and cards.

## Elevation & Depth
Depth is created through **Tonal Layering and Colored Backglows** rather than traditional black shadows.

- **Surfaces:** The background is the lowest level. Content sits on `surface-container-low`. Active or hovered elements rise to `surface-container-high`.
- **Shadows:** Shadows are rarely neutral; they are tinted with the primary or secondary color (e.g., `rgba(61, 90, 254, 0.2)`). This creates a "neon" or "emissive" effect.
- **Glassmorphism:** The top header uses a 70% opacity surface with a `backdrop-blur-md` to provide a sense of transparency and lightness.
- **Borders:** Thin, 1px borders using `outline-variant` at 5-10% opacity are used to define shapes without creating visual clutter.

## Shapes
The shape language is **Rounded and Organic**. 

- **Cards & Sidebar Items:** Use a 1.5rem (`rounded-xl`) corner radius to soften the technical feel of the dark theme.
- **Buttons & Inputs:** Follow the `rounded-lg` (1rem) or `rounded-full` (pill) pattern. Pill shapes are specifically used for search bars and status badges (like the timer) to distinguish them from actionable cards.
- **Progress Bars:** Fully rounded (caps) to maintain a smooth, fluid appearance as they fill.

## Components

- **Buttons:** 
  - *Primary:* Filled with `primary-container`, featuring a subtle outer glow of the same color.
  - *Icon-Only:* Circular with high-contrast icons, used for "Play" actions.
- **Cards:** Use `surface-container-low` with a 1px `white/5` ring. On hover, they should transition their border color to the primary or secondary accent.
- **Progress Bars:** Use a high-contrast track (`surface-container-highest`) and a vibrant, glowing fill. For major milestones, use a linear gradient from `primary` to `tertiary`.
- **Chips/Badges:** Use `JetBrains Mono` for text. For category tags, use a low-opacity background of the accent color (e.g., `primary/15`) with high-contrast text.
- **Inputs:** Search inputs are pill-shaped, using `surface-container-high` and no borders, relying on focus rings of `primary-container` for active states.
- **Side Navigation:** Active states use a solid `primary-container` background with a soft shadow. Inactive states use `on-surface-variant` text and scale icons on hover.