# Implementation Plan - Cozy Pixel Art UI Redesign for Buttons & Card Borders

We will transform the platform's UI elements (buttons, cards, badges, and modal borders) into a **Cozy Pixel Cafe / Village Style** featuring crisp pixelated borders, retro font touches (`font-mono`), warm pixel color palettes (amber/warm cream/coffee brown), and distinctive chunky retro button styles (`pixel-btn`, `pixel-card`).

## User Review Required
> [!IMPORTANT]
> Please review the cozy pixel art styling approach for buttons and card borders.

- **Aesthetic**: Cozy pixel cafe / village warmth (warm creams, rich browns, soft amber glow).
- **Components**:
  - Pixelated card borders (chunky retro drop-shadows & hard borders).
  - Pixel retro button styles with active press-down translation effect.
  - Pixel font styling for key badges and score numbers.

## Proposed Changes

### UI Components & Styling Shims
- **`src/app.css` / Tailwind utilities**: Add custom utility classes for pixel borders (`border-4 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]`), pixelated font classes, and warm cozy pixel color variables.
- **Button Component (`src/lib/components/ui/button/button.svelte`)**: Add a retro pixel variant with hard borders and active press animation.
- **Card & Container Components (`src/lib/components/ui/card/card.svelte`, `DailyProgressTracker.svelte`, `ParticipationTrendChart.svelte`)**: Apply cozy pixel card borders and warm village tones.
- **Headers & Navigation (`AppHeader.svelte`)**: Pixel art badge accents for XP, streaks, and navigation items.

## Verification Plan
- **Automated Tests**: Run `compile_applet` to ensure successful TypeScript and Svelte compilation.
- **Manual Verification**: Inspect frontend UI and admin dashboard for cozy pixel card styling and interactive buttons.
