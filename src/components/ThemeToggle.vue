<script setup>
import { useTheme } from '../composables/useTheme.js'

const { theme, toggleTheme } = useTheme()
</script>

<template>
  <button
    class="theme-toggle"
    :aria-label="theme === 'dark' ? 'Switch to daylight theme' : 'Switch to evening theme'"
    :title="theme === 'dark' ? 'Daylight theme' : 'Evening theme'"
    @click="toggleTheme"
  >
    <!-- Deco sun (shown in dark mode — click for daylight) -->
    <svg v-if="theme === 'dark'" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="1.4" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <g stroke="currentColor" stroke-width="1.3">
        <line x1="12" y1="1.5" x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="22.5" />
        <line x1="1.5" y1="12" x2="5" y2="12" />
        <line x1="19" y1="12" x2="22.5" y2="12" />
        <line x1="4.9" y1="4.9" x2="7.2" y2="7.2" />
        <line x1="16.8" y1="16.8" x2="19.1" y2="19.1" />
        <line x1="19.1" y1="4.9" x2="16.8" y2="7.2" />
        <line x1="7.2" y1="16.8" x2="4.9" y2="19.1" />
      </g>
    </svg>
    <!-- Deco crescent + star (shown in light mode — click for evening) -->
    <svg v-else viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M14.5 3.5a9 9 0 1 0 6 15.2A10.5 10.5 0 0 1 14.5 3.5Z"
        fill="none"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linejoin="round"
      />
      <path d="M17 6.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7Z" fill="currentColor" />
    </svg>
  </button>
</template>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background: transparent;
  border: 1px solid var(--line);
  color: var(--gold);
  cursor: pointer;
  clip-path: polygon(
    8px 0, calc(100% - 8px) 0, 100% 8px,
    100% calc(100% - 8px), calc(100% - 8px) 100%,
    8px 100%, 0 calc(100% - 8px), 0 8px
  );
  transition:
    color var(--dur-fast) ease,
    border-color var(--dur-fast) ease,
    background-color var(--dur-fast) ease,
    transform var(--dur-fast) var(--ease-out);
}

.theme-toggle:hover {
  color: var(--gold-bright);
  border-color: var(--gold);
  background: color-mix(in srgb, var(--gold) 10%, transparent);
  transform: translateY(-1px);
}

.theme-toggle svg {
  width: 19px;
  height: 19px;
}
</style>
