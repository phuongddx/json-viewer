# Design Guidelines

**Version:** 0.1.0
**Last Updated:** 2026-03-14
**Design System:** CSS Custom Properties + CSS Modules

## Color Palette

### Dark Theme (Default)

```
Background:     #0F172A  (slate-950)
Text:           #F1F5F9  (slate-100)
Border:         #1E293B  (slate-800)
Accent:         #3B82F6  (blue-500)
Success:        #34D399  (emerald-400)
Error:          #F87171  (red-400)
```

### Light Theme

```
Background:     #FFFFFF  (white)
Text:           #0F172A  (slate-950)
Border:         #E2E8F0  (slate-200)
Accent:         #2563EB  (blue-600)
Success:        #10B981  (emerald-500)
Error:          #EF4444  (red-500)
```

### Usage

All colors defined as CSS Custom Properties in `globals.css`. Components use variables, not hardcoded hex values.

```typescript
// In component CSS
.button {
  background: var(--color-accent);    /* Switches with theme */
  color: var(--color-bg);
  border: 1px solid var(--color-border);
}
```

## Typography

### Font Family

| Use | Font | Source |
|-----|------|--------|
| Code/JSON | `'Fira Code', monospace` | Google Fonts |
| UI (headings, buttons) | System stack (no explicit font) | Default browser |

### System Font Stack

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
             'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
             sans-serif;
```

### Scale (Relative Units)

- **Base size:** 16px (1rem)
- **Scaling:** Use relative units (`rem`, `em`, `ch`) for responsive sizing
- **No fixed pixel sizes** except for icons

### Headings

```
h1 (title):     1.5rem (24px)   – Project name "JSON Viewer"
h2 (sections):  1.25rem (20px)  – Section titles in UI
p (body):       1rem (16px)     – Default paragraph text
small:          0.875rem (14px) – Helper text, hints
```

### Line Height

- **Code:** 1.6 (for readability in monospace)
- **UI:** 1.5 (standard)
- **Large text:** 1.4

## Spacing System

### Scale

All spacing uses **8px base unit** (multiples of 8).

```
4px   → 0.5 × base  (micro: borders, gaps)
8px   → 1 × base    (default padding/margin)
16px  → 2 × base    (standard spacing)
24px  → 3 × base    (larger spacing)
32px  → 4 × base    (section spacing)
```

### Usage

```css
/* Container spacing */
.container {
  padding: 16px;      /* 2 × base */
  gap: 16px;          /* Space between items */
  margin-bottom: 32px; /* Section separation */
}

/* Small elements */
.button {
  padding: 8px 16px;  /* 1 × base vertical, 2 × base horizontal */
  margin: 4px;        /* 0.5 × base micro-adjustment */
}
```

## Border Radius

- **Sharp corners:** 0 (inputs, code blocks)
- **Subtle rounding:** 4px (small buttons, tags)
- **Rounded:** 8px (containers, cards)
- **Pill/full:** 9999px (avatars, badges) — rarely used

```css
.button { border-radius: 4px; }
.container { border-radius: 8px; }
.pill { border-radius: 9999px; }
```

## Interaction Patterns

### Buttons

#### States

```
Normal        → background: var(--color-accent)
Hover         → opacity: 0.85 (slight fade)
Active/Press  → opacity: 0.7 (darker)
Disabled      → opacity: 0.5 + cursor: not-allowed
Focus         → outline: 2px solid var(--color-accent)
```

#### Implementation

```css
.button {
  background: var(--color-accent);
  cursor: pointer;
  transition: opacity 150ms ease-out;
}

.button:hover {
  opacity: 0.85;
}

.button:active {
  opacity: 0.7;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

### Input Focus

All interactive elements show clear focus indicator.

```css
input:focus,
textarea:focus,
button:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

### Hover Effects

- **Buttons:** Opacity change (not color shift, for theme independence)
- **Links:** Underline or color change
- **Icons:** Scale or opacity

```css
.icon-button:hover {
  opacity: 0.8;
}

.icon-button:hover svg {
  transform: scale(1.1);
}
```

### Transitions

Prefer fast, snappy transitions.

```css
/* Default */
transition: opacity 150ms ease-out;
transition: background 150ms ease-out;

/* Avoid slow transitions for interactive elements */
/* Slow (300ms+) only for page-level transitions */
```

### Drag-Over State

```css
.dropZone.dragOver {
  background: var(--color-accent);
  opacity: 0.1;  /* Light tint */
  border: 2px solid var(--color-accent);
}
```

## Animation Guidance

### Respect prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Allowed Animations

- Opacity changes (fade in/out)
- Scale changes (hover effects)
- Translate (slide in/out)

### Forbidden

- Blur effects (performance, accessibility)
- Long animations (> 500ms for page elements)
- Autoplaying animations

## Icons

### Rules

1. **SVG only** — No icon font, no emoji
2. **Inline in JSX** — No external icon library
3. **Consistent stroke width** — 1.5 for UI, 2 for larger icons
4. **aria-hidden="true"** — Icons are decorative; label nearby text

### Sizing

```
Small (UI):     16px (buttons, inline)
Medium (toolbar): 24px (copy, expand buttons)
Large (hero):   32px (empty state, placeholder)
```

### Color

Icons inherit text color by default.

```css
svg {
  color: currentColor;  /* Inherits from parent */
  stroke: currentColor;
}
```

### Example

```typescript
const SettingsIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="3" />
    {/* ... paths */}
  </svg>
)

// Usage
<button aria-label="Settings">
  <SettingsIcon />
</button>
```

## Responsive Design (v0.1.0 Partial)

### Breakpoints

Not fully implemented yet; polish planned for v0.2.0.

**Target breakpoints:**
```
Mobile:    320px - 767px
Tablet:    768px - 1023px
Desktop:   1024px+
```

### Layout

- **Mobile:** Single column (sidebar above main, or stacked)
- **Tablet:** Two column (sidebar left, main right)
- **Desktop:** Two column (as is)

### Typography Scaling

```css
/* Base scale */
h1 { font-size: 1.5rem; }

@media (max-width: 768px) {
  h1 { font-size: 1.25rem; }  /* Smaller on mobile */
}
```

## Accessibility Checklist

- [x] Color contrast ratio ≥ 4.5:1 (WCAG AA)
- [x] Focus indicators visible (2px outline)
- [x] Icon buttons have aria-label
- [x] Semantic HTML (button, input, textarea, not div)
- [x] Keyboard navigation (Tab, Enter, Space)
- [x] Respects prefers-reduced-motion
- [x] No reliance on color alone (error states use icons + color)
- [x] Font size ≥ 16px on inputs (prevents zoom on mobile)

## Error States

### Visual Indicator

Combine **color + icon + text**.

```typescript
// Not just color
<input style={{ borderColor: 'red' }} />

// Include icon + text
<div className={styles.error}>
  <WarningIcon /> {/* Color: --color-error */}
  <p>Invalid JSON: Unexpected token at line 5</p>
</div>
```

### Success States

```css
.success {
  color: var(--color-success);
  border: 2px solid var(--color-success);
}
```

## Empty States

Always provide context when no data present.

```
┌────────────────────────┐
│    [Large Icon]        │
│   No JSON to display   │  ← h2
│  Paste or drag-drop    │  ← p (hint text)
└────────────────────────┘
```

## Component Patterns

### Card/Container

```css
.card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);  /* Subtle depth */
}
```

### Button Group

```css
.buttonGroup {
  display: flex;
  gap: 8px;
}

.buttonGroup .button {
  flex: 1;
}
```

## Typography Pairing

### Recommended

```
Heading:  System font, 1.25rem, font-weight: 600
Body:     System font, 1rem, font-weight: 400, line-height: 1.5
Code:     Fira Code, 0.95rem, line-height: 1.6
```

## Dark/Light Mode Considerations

- **No pure black/white** — Use slate-50/slate-950 for less eye strain
- **Border colors lighter in dark mode** — More visible contrast
- **Subtle shadows in dark mode** — Depth cues when light is scarce
- **Consistent color relationships** — Accent same hue, different value

## Design Debt & Future

- [ ] Comprehensive mobile breakpoints (v0.2.0)
- [ ] Syntax highlighting in textarea (v0.2.0)
- [ ] Animations on expand/collapse (if needed)
- [ ] Custom scrollbar styling (low priority)
