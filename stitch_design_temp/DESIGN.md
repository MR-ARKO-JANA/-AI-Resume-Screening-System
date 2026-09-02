---
name: Cognitive Talent System
colors:
  surface: '#fcf8fa'
  surface-dim: '#dcd9db'
  surface-bright: '#fcf8fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7e9'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#45464d'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#191c1e'
  on-tertiary-container: '#818486'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#fcf8fa'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
  success-shortlisted: '#059669'
  error-rejected: '#DC2626'
  warning-pending: '#D97706'
  score-high: '#7C3AED'
  slate-gray: '#64748B'
  border-subtle: '#E2E8F0'
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
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '450'
    lineHeight: 18px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max: 1440px
---

## Brand & Style

The design system is engineered for efficiency, precision, and high-trust decision-making. It serves recruiters and HR professionals who manage high-volume data and require immediate clarity. The aesthetic is "Enterprise Intelligence"—a hybrid of **Corporate Modern** and **Minimalist** styles that prioritizes data density without sacrificing legibility.

The system uses a high-contrast visual language to differentiate between AI-generated insights and human-input data. Key attributes include:
- **Precision:** Tight alignments and consistent spacing scales.
- **Reliability:** A grounded color palette that conveys stability.
- **Intelligence:** Subtle use of motion and elevation to highlight AI-processed results.
- **Clarity:** Heavy use of whitespace to separate complex candidate metrics and match scores.

## Colors

The palette is anchored by **Deep Navy** (`#0F172A`) for text and primary branding, providing a sophisticated, authoritative foundation. **Vibrant Action Blue** (`#2563EB`) is reserved for primary actions, links, and active states to guide the user's eye toward conversion points.

Functional status colors are critical for this system:
- **Shortlisted:** Emergent Green signifies growth and selection.
- **Rejected:** Critical Red for clear exclusion.
- **Pending:** Amber for items requiring attention.
- **AI Match Score:** A distinct Violet (`#7C3AED`) is used to separate AI-calculated metrics from standard status indicators, emphasizing the "Intelligence" aspect of the platform.

The background uses a tiered system of off-whites (`#F8FAFC`) and subtle borders (`#E2E8F0`) to create a structured "Dashboard" feel.

## Typography

This design system utilizes **Inter** for all primary interfaces to maintain a neutral, highly readable, and professional SaaS appearance. The type scale is optimized for high information density, favoring smaller body sizes with generous line heights to ensure long-form AI analysis text remains digestible.

**JetBrains Mono** is introduced as a utility font for specific data points, such as GitHub URLs, experience durations, or ID numbers, to reinforce the "Data-Driven" nature of the tool. 

Key Rules:
- **Headlines:** Use tight letter-spacing (`-0.01em` to `-0.02em`) for a modern, high-end feel.
- **Labels:** Always uppercase with increased letter-spacing for categorization (e.g., table headers).
- **Match Scores:** Large match scores (0-100) should use `headline-lg` in the Primary or Score-High color.

## Layout & Spacing

The system follows a **Fixed-Fluid hybrid grid**. The sidebar remains fixed (280px) while the main content area utilizes a 12-column fluid grid. 

- **Grid:** 12 columns on desktop, 8 on tablet, 4 on mobile.
- **Rhythm:** A 4px base unit controls all padding and margins. 
- **Density:** Use "Compact" spacing for data tables (8px vertical cell padding) and "Comfortable" spacing for candidate profile views (24px - 32px padding).
- **Breakpoints:**
  - Mobile: 0 - 599px
  - Tablet: 600px - 1023px
  - Desktop: 1024px+

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows. This maintains the "Precision" brand value.

1.  **Level 0 (Background):** Slate-50 (`#F8FAFC`) — The foundation.
2.  **Level 1 (Cards/Surface):** White (`#FFFFFF`) with a 1px border (`#E2E8F0`). No shadow. Used for dashboard widgets and table rows.
3.  **Level 2 (Dropdowns/Modals):** White with a soft, diffused shadow (0 4px 6px -1px rgb(0,0,0,0.1)). Used for elements that temporarily float over the UI.
4.  **Level 3 (AI Focus):** A subtle 2px tinted border using the Primary or Match-Score color to highlight a selected candidate or high-match result.

## Shapes

The design system uses a **Soft (0.25rem)** roundedness level to maintain a professional, slightly technical edge.

- **Buttons & Inputs:** 4px (`0.25rem`) corner radius.
- **Cards & Containers:** 8px (`0.5rem`) for `rounded-lg`.
- **Status Chips:** 100px (Pill-shaped) for "Shortlisted", "Rejected", and "Pending" badges to make them easily distinguishable from structural UI boxes.

## Components

### Buttons
- **Primary:** Solid Deep Navy (`#0F172A`) with White text. High contrast, sharp corners.
- **Secondary:** Outline Action Blue (`#2563EB`) with a 1px border.
- **AI Action:** Gradient background from Action Blue to Score-High Violet for the "Process Resumes" button.

### Status Chips
- **Shortlisted:** Light Green background, Dark Green text.
- **Rejected:** Light Red background, Dark Red text.
- **Pending:** Light Amber background, Dark Amber text.
- All chips use `label-md` typography.

### Data Tables
- Header background: Slate-50.
- Border-bottom only: 1px Slate-200.
- Hover state: Slate-50 background on the entire row.

### Match Score Gauge
A circular or semi-circular progress bar using the `score-high` color. The numerical value inside should be `title-lg`.

### Input Fields
- Default: 1px Slate-200 border.
- Focus: 2px Action Blue border with no "glow."
- Error: 1px Red-600 border with helper text in `label-md`.

### Candidate Cards
- Use Level 1 elevation.
- Header includes `candidateName` and a "Quick Look" link to LinkedIn/GitHub icons.
- Body includes a "Skills Match" section using small horizontal bars.