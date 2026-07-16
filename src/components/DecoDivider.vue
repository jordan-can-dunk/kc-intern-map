<template>
  <!-- Sunburst divider: hairlines meeting a fanned half-sun over a diamond -->
  <div class="deco-divider" aria-hidden="true">
    <span class="rule" />
    <svg viewBox="0 0 96 34">
      <g stroke="var(--gold)" stroke-width="1.4" fill="none">
        <line x1="48" y1="24" x2="48" y2="4" />
        <line x1="48" y1="24" x2="30" y2="8" />
        <line x1="48" y1="24" x2="66" y2="8" />
        <line x1="48" y1="24" x2="16" y2="18" />
        <line x1="48" y1="24" x2="80" y2="18" />
      </g>
      <path d="M48 20 l7 7 -7 7 -7 -7 Z" fill="var(--gold)" />
    </svg>
    <span class="rule" />
  </div>
</template>

<style scoped>
.deco-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.1rem;
  margin: 0 auto;
}

.deco-divider svg {
  width: 84px;
  flex: none;
}

.rule {
  height: 1px;
  width: min(120px, 22vw);
  background: linear-gradient(90deg, transparent, var(--line));
}

.rule:last-child {
  background: linear-gradient(90deg, var(--line), transparent);
}
</style>
