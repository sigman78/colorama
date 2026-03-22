export const code = `\
/* Design system base styles */

:root {
  --color-primary: oklch(0.55 0.18 240deg);
  --color-surface: oklch(0.97 0.005 240deg);
  --font-size-base: 1rem;
  --spacing-unit: 0.5rem;
}

/* Reset & base */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: var(--font-size-base);
  line-height: 1.6;
  background-color: var(--color-surface);
  color: #1a1a2e;
}

/* Layout */
.container {
  width: min(90%, 72rem);
  margin-inline: auto;
  padding: calc(var(--spacing-unit) * 4) var(--spacing-unit);
}

#app {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  min-height: 100vh;
}

/* Card component */
.card {
  border-radius: 0.75rem;
  background: #ffffff;
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.08);
  padding: 1.5rem;
}

.card:hover {
  box-shadow: 0 4px 16px rgb(0 0 0 / 0.14);
  transform: translateY(-2px);
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.card__title:nth-child(1) {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-primary);
}

/* Responsive */
@media (max-width: 48em) {
  #app {
    grid-template-columns: 1fr;
  }
}`;
