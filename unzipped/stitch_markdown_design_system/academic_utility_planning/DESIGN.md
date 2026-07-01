---
name: Academic Utility Planning
colors:
  surface: '#f8f9fb'
  surface-dim: '#d9dadc'
  surface-bright: '#f8f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#edeef0'
  surface-container-high: '#e7e8ea'
  surface-container-highest: '#e1e2e4'
  on-surface: '#191c1e'
  on-surface-variant: '#45474c'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f3'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#555e74'
  primary: '#01081a'
  on-primary: '#ffffff'
  primary-container: '#172033'
  on-primary-container: '#7f879f'
  inverse-primary: '#bdc6e0'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#0f0800'
  on-tertiary: '#ffffff'
  tertiary-container: '#2c1e04'
  on-tertiary-container: '#9b8561'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d9e2fc'
  primary-fixed-dim: '#bdc6e0'
  on-primary-fixed: '#121b2e'
  on-primary-fixed-variant: '#3e475b'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#fadfb5'
  tertiary-fixed-dim: '#ddc39b'
  on-tertiary-fixed: '#271902'
  on-tertiary-fixed-variant: '#564426'
  background: '#f8f9fb'
  on-background: '#191c1e'
  surface-variant: '#e1e2e4'
  surface-panel: '#FFFFFF'
  surface-raised: '#F2F5F8'
  border-subtle: '#D9E0E7'
  border-strong: '#B8C3CF'
  text-secondary: '#4C5A6A'
  text-muted: '#718096'
  risk-low: '#2563EB'
  risk-medium: '#B45309'
  risk-high: '#B91C1C'
  success: '#15803D'
typography:
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Source Sans 3
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Source Sans 3
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Source Sans 3
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-caps:
    fontFamily: Source Sans 3
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max-width: 400px
  gutter: 1rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 1.5rem
  edge-margin: 1.25rem
---

## Brand & Style

The design system is built on a foundation of **Modern Minimalism** and **Corporate Utility**, specifically tailored for the academic environment. It is designed to feel like an native extension of an LMS (Learning Management System) rather than a third-party distraction. The brand personality is "The Reliable Academic Coach"—calm, specific, honest, and practical.

### Visual Principles
- **LMS Integration:** The UI utilizes off-white surfaces and subtle borders to harmonize with document-heavy environments like Canvas or Blackboard.
- **Data Clarity:** Complexity is managed through high-contrast typography and structured layouts rather than decorative elements.
- **Utilitarian Polish:** No gradients, no glows, and no "AI-purple" aesthetics. Depth is created through tonal layering and crisp, thin borders.
- **Trust via Transparency:** Use of confidence levels and reasoning bullets to ensure the user understands the "why" behind every AI-generated estimate.

## Colors

The palette is anchored in **Navy and Off-White** to provide a serious, academic tone.

- **Primary & Secondary:** Navy (`#172033`) serves as the primary text and structural color, while Blue (`#2563EB`) is the sole brand accent used for primary actions and focus states.
- **Semantic Logic:** Color is used strictly for information.
    - **Amber/Red:** Reserved for "Risk" levels (Medium/High) and urgent states.
    - **Green:** Reserved for "Success" and "Complete" states.
    - **Blue:** Used for "Low Risk" and standard interactions.
- **Neutral Tiering:** The system uses a triple-layered neutral approach: `Page Overlay` (lowest), `Panel Surface` (base), and `Raised Surface` (interactive/metrics).

## Typography

This design system uses a functional typographic trio to separate UI controls from academic data.

- **UI & Headlines:** **Hanken Grotesk** (or Geist) provides a sharp, contemporary professional look for titles and navigation.
- **Reading & Inputs:** **Source Sans 3** is selected for its high legibility in long-form descriptions and instructions, essential for accessibility in educational tools.
- **Data & Numerics:** **JetBrains Mono** is used for all time estimates (e.g., "2 hr 15 min"), due dates, and durations. Monospaced numerals ensure that time-blocks and schedules align perfectly in vertical lists.

## Layout & Spacing

The design system follows a **Fixed-Width Sidebar** model for desktop and a **Bottom Sheet** model for mobile.

- **Desktop:** A fixed 360px to 400px panel injected on the right edge of the viewport. It uses a vertical stack with 16px (1rem) gutters.
- **Mobile:** Transition to a bottom sheet that occupies 85% of the viewport height, ensuring the assignment content remains visible in the top 15%.
- **Density:** Visual density is moderately high (6/10). Use tight vertical spacing for task lists and more generous spacing (24px) between major sections (Estimate vs. Planner).

## Elevation & Depth

To maintain LMS compatibility, depth is communicated through **Tonal Layering** and **Low-Contrast Outlines** rather than heavy shadows.

- **Tiers:** The background uses the `neutral-color` (`#F7F8FA`). The main panel uses a white surface with a 1px border (`#D9E0E7`).
- **Raised Elements:** Metric tiles (Difficulty, Risk) and Calendar blocks use the `surface-raised` (`#F2F5F8`) color to distinguish themselves from the base panel.
- **Shadows:** Only use a single, extremely subtle ambient shadow on the main extension panel to separate it from the host website content (e.g., `0 4px 20px rgba(0,0,0,0.05)`).

## Shapes

The shape language is structured to feel approachable but orderly.

- **Panels:** 12px (`rounded-xl`) for the primary injected side panel and onboarding popups.
- **Cards/Tiles:** 10px (`rounded-lg`) for difficulty meters and metric containers.
- **Controls:** 8px (`rounded-md`) for buttons, text inputs, and calendar blocks.
- **Launcher:** The only exception is the floating launcher, which uses a 999px pill shape to denote its status as a floating utility button.

## Components

### Buttons
- **Primary:** Navy background (`#172033`) with White text. 8px radius.
- **Secondary/Action:** Outline style using `border-strong` or subtle blue text for "Edit" actions.
- **States:** 2px Blue focus ring (`#93C5FD`) is mandatory for accessibility.

### Metric Tiles
- Compact containers for Difficulty and Risk.
- Use a 10px radius and `surface-raised` background.
- Values are displayed with `label-mono` typography.

### Calendar Blocks
- Rectangular blocks with 8px radius.
- Use subtle left-border accents to denote the risk level associated with that specific work block (Blue, Amber, or Red).

### Task Rows
- Used in Work Breakdown.
- Features a checkbox, a task label, and a monospaced duration (e.g., 45m).
- Hover states should trigger a light grey background tint.

### Inputs
- Labels must always be visible above the field using `label-caps`.
- Use an 8px radius with a `border-subtle` stroke.

### AI Practice Mode
- Question cards use a white surface with a `border-strong` outline to differentiate from the standard planning UI.
- Concept tags use small 4px radius "chips" in neutral grey.