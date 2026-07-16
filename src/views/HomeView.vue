<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import SkylineHero from '../components/SkylineHero.vue'
import DecoDivider from '../components/DecoDivider.vue'
import ThemeToggle from '../components/ThemeToggle.vue'
import { pins } from '../data/pins.js'

const steps = [
  {
    numeral: 'I',
    title: 'Wander the Map',
    text: 'Open the map and roam the city. Every gold pin marks a place an intern before you swears by.',
    icon: 'compass',
  },
  {
    numeral: 'II',
    title: 'Open the Story',
    text: 'Tap any pin for photos, ratings, and honest notes — plus the kind of tips only a regular would know.',
    icon: 'star',
  },
  {
    numeral: 'III',
    title: 'Leave Your Mark',
    text: 'Found somewhere worth remembering? Pin it with a few words and your name, and join the atlas for good.',
    icon: 'pin',
  },
]

// Scroll-reveal: flip on .is-visible as sections enter the viewport
let observer = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      }
    },
    { threshold: 0.15 },
  )
  document.querySelectorAll('.home .reveal').forEach((el) => observer.observe(el))
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div class="home">
    <!-- ======= HERO ======= -->
    <section class="hero">
      <div class="hero-sky">
        <SkylineHero />
      </div>
      <div class="hero-fade" />

      <header class="hero-topbar">
        <span class="monogram" aria-hidden="true">
          <span class="deco-diamond" />
        </span>
        <ThemeToggle />
      </header>

      <div class="hero-content">
        <p class="eyebrow hero-item" style="--d: 100ms">An intern&rsquo;s guide to Kansas City</p>
        <h1 class="wordmark hero-item" style="--d: 250ms">
          <span class="wordmark-the">The</span>
          <span class="wordmark-main">Fountain City</span>
          <span class="wordmark-atlas"><span class="deco-diamond" /> Atlas <span class="deco-diamond" /></span>
        </h1>
        <div class="hero-item" style="--d: 420ms">
          <DecoDivider />
        </div>
        <p class="hero-tagline editorial hero-item" style="--d: 560ms">
          Every great city keeps a few secrets. The interns before you wrote theirs down —
          barbecue counters, rose gardens, rooftops at golden hour — and pinned them to this
          map for you.
        </p>
        <div class="hero-ctas hero-item" style="--d: 700ms">
          <RouterLink to="/map" class="btn btn-gold">Enter the Map</RouterLink>
          <RouterLink to="/add" class="btn btn-ghost">Pin Your Favorite</RouterLink>
        </div>
      </div>

      <a class="scroll-cue" href="#how" aria-label="Scroll to learn how the atlas works">
        <span>Discover</span>
        <svg viewBox="0 0 20 12" aria-hidden="true">
          <path d="M2 2 L10 10 L18 2" fill="none" stroke="currentColor" stroke-width="2" />
        </svg>
      </a>
    </section>

    <!-- ======= HOW IT WORKS ======= -->
    <section id="how" class="section">
      <h2 class="deco-rule-label reveal">How the Atlas Works</h2>
      <div class="steps">
        <article
          v-for="(step, i) in steps"
          :key="step.numeral"
          v-tilt
          class="step deco-card deco-corners reveal"
          :style="{ '--reveal-delay': i * 120 + 'ms' }"
        >
          <span class="step-numeral lift-1">{{ step.numeral }}</span>
          <svg v-if="step.icon === 'compass'" class="step-icon lift-2" viewBox="0 0 48 48" aria-hidden="true">
            <circle cx="24" cy="24" r="19" fill="none" stroke="currentColor" stroke-width="1.5" />
            <circle cx="24" cy="24" r="14" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.5" />
            <path d="M24 8 l3 13 -3 19 -3 -19 Z" fill="currentColor" />
            <path d="M8 24 l13 -3 19 3 -19 3 Z" fill="currentColor" opacity="0.55" />
          </svg>
          <svg v-else-if="step.icon === 'star'" class="step-icon lift-2" viewBox="0 0 48 48" aria-hidden="true">
            <rect x="6" y="6" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" />
            <rect x="10.5" y="10.5" width="27" height="27" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.5" />
            <path d="M24 14 l2.7 6.8 7.3 0.6 -5.6 4.8 1.7 7.2 -6.1 -3.9 -6.1 3.9 1.7 -7.2 -5.6 -4.8 7.3 -0.6 Z" fill="currentColor" />
          </svg>
          <svg v-else class="step-icon lift-2" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M24 4 L36 18 L24 44 L12 18 Z" fill="none" stroke="currentColor" stroke-width="1.5" />
            <path d="M24 12 L30 18.5 L24 32 L18 18.5 Z" fill="currentColor" />
          </svg>
          <h3 class="step-title">{{ step.title }}</h3>
          <p class="step-text">{{ step.text }}</p>
        </article>
      </div>
    </section>

    <!-- ======= FROM THE COLLECTION ======= -->
    <section class="section">
      <h2 class="deco-rule-label reveal">From the Collection</h2>
      <p class="section-sub editorial reveal">A few of the city&rsquo;s finest, pinned by interns past.</p>
      <div class="collection">
        <RouterLink
          v-for="(pin, i) in pins"
          :key="pin.id"
          v-tilt
          :to="`/pin/${pin.id}`"
          class="pin-card deco-card reveal"
          :style="{ '--reveal-delay': i * 100 + 'ms' }"
        >
          <span class="pin-photo-frame lift-1">
            <img :src="pin.photos[0]" :alt="pin.name" loading="lazy" />
          </span>
          <span class="pin-card-body">
            <span class="pin-card-name">{{ pin.name }}</span>
            <span class="pin-card-stars" :aria-label="`Rated ${pin.rating} of 5`">
              <span v-for="n in pin.rating" :key="n">★</span><span v-for="n in 5 - pin.rating" :key="'e' + n">☆</span>
            </span>
            <span class="pin-card-desc">{{ pin.description }}</span>
            <span class="pin-card-link">Read the Entry <span aria-hidden="true">›</span></span>
          </span>
        </RouterLink>
      </div>
    </section>

    <!-- ======= CLOSING CTA ======= -->
    <section class="closing deco-chevrons">
      <div class="closing-inner reveal">
        <p class="closing-line editorial">Your Kansas City chapter starts tonight.</p>
        <p class="closing-sub eyebrow">The lights are on &mdash; the map is open</p>
        <RouterLink to="/map" class="btn btn-gold">Enter the Map</RouterLink>
      </div>
    </section>

    <!-- ======= FOOTER ======= -->
    <footer class="footer">
      <DecoDivider />
      <p class="footer-mark">The Fountain City Atlas</p>
      <p class="footer-small">
        Formerly the KC Intern Map &middot; Built by interns, for interns &middot; Kansas City, Missouri
      </p>
    </footer>
  </div>
</template>

<style scoped>
/* ---------- Hero ---------- */
.hero {
  position: relative;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.hero-sky {
  position: absolute;
  inset: 0;
  z-index: 0;
}

/* Blend the illustration's base into the page background */
.hero-fade {
  position: absolute;
  inset: auto 0 0 0;
  height: 90px;
  z-index: 1;
  background: linear-gradient(180deg, transparent, var(--bg));
  pointer-events: none;
}

.hero-topbar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem clamp(1rem, 4vw, 2.5rem);
}

.monogram {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--line);
}

.hero-content {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  padding: clamp(1.5rem, 5vh, 4rem) 1.25rem 0;
  gap: 1.4rem;
}

.hero-content > * {
  max-width: 100%;
}

.hero-item {
  animation: rise-in 900ms var(--ease-out) both;
  animation-delay: var(--d, 0ms);
}

/* ---------- Wordmark ---------- */
.wordmark {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  margin: 0;
}

.wordmark-the {
  font-family: var(--font-editorial);
  font-style: italic;
  font-size: clamp(1.2rem, 2.6vw, 1.7rem);
  color: var(--ink-soft);
}

.wordmark-main {
  font-family: var(--font-display);
  font-size: clamp(2.4rem, 7.2vw, 5.2rem);
  line-height: 1.05;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: linear-gradient(175deg, var(--gold-bright) 15%, var(--gold) 55%, var(--gold-deep) 95%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  /* marquee-letter extrusion: crisp brass edge below, soft throw shadow beyond */
  filter: drop-shadow(0 2px 0 color-mix(in srgb, var(--gold-deep) 80%, #16100a))
    drop-shadow(0 16px 30px rgba(0, 0, 0, 0.38));
}

:root[data-theme='light'] .wordmark-main {
  filter: drop-shadow(0 2px 0 color-mix(in srgb, var(--gold-deep) 60%, transparent))
    drop-shadow(0 12px 22px rgba(94, 74, 32, 0.28));
}

.wordmark-atlas {
  display: inline-flex;
  align-items: center;
  gap: 0.9rem;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: clamp(0.9rem, 2vw, 1.15rem);
  letter-spacing: 0.55em;
  text-indent: 0.55em; /* optically recenters tracked text */
  text-transform: uppercase;
  color: var(--ink);
}

.hero-tagline {
  max-width: 560px;
  font-size: clamp(1.08rem, 2.4vw, 1.3rem);
  line-height: 1.6;
}

.hero-ctas {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-top: 0.4rem;
}

.scroll-cue {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 1.4rem 0 1.8rem;
  color: var(--gold);
  text-decoration: none;
  font-size: 0.66rem;
  font-weight: 600;
  letter-spacing: var(--track-wide);
  text-transform: uppercase;
  animation: rise-in 900ms var(--ease-out) 950ms both;
}

.scroll-cue svg {
  width: 18px;
  animation: float-cue 2.4s ease-in-out infinite;
}

@media (max-width: 520px) {
  .hero-content .eyebrow {
    font-size: 0.62rem;
    letter-spacing: 0.22em;
  }

  .wordmark-main {
    font-size: clamp(1.9rem, 10.5vw, 2.6rem);
    letter-spacing: 0.045em;
  }

  .wordmark-atlas {
    letter-spacing: 0.42em;
    text-indent: 0.42em;
  }

  .hero-tagline {
    font-size: 1.02rem;
  }
}

/* ---------- Sections ---------- */
.section {
  max-width: 1100px;
  margin: 0 auto;
  padding: clamp(3.5rem, 9vh, 6rem) 1.25rem 0;
}

.section-sub {
  text-align: center;
  font-size: 1.15rem;
  margin-top: 1rem;
}

/* ---------- Steps ---------- */
.steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2.5rem;
}

.step {
  position: relative;
  padding: 2.4rem 1.8rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
}

.step-numeral {
  font-family: var(--font-heading);
  font-size: 1rem;
  color: var(--gold);
  letter-spacing: 0.2em;
}

.step-numeral::after {
  content: '';
  display: block;
  width: 26px;
  height: 1px;
  margin: 0.55rem auto 0;
  background: var(--line);
}

.step-icon {
  width: 46px;
  height: 46px;
  color: var(--gold);
}

.step-title {
  font-size: 1.3rem;
  letter-spacing: 0.03em;
}

.step-text {
  font-size: 0.94rem;
  font-weight: 300;
  color: var(--ink-soft);
  line-height: 1.7;
}

/* ---------- Collection ---------- */
.collection {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-top: 2.5rem;
}

.pin-card {
  display: flex;
  flex-direction: column;
  padding: 0.8rem;
  text-decoration: none;
  color: inherit;
}

.pin-photo-frame {
  display: block;
  border: 1px solid var(--line);
  padding: 4px;
}

.pin-photo-frame img {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  filter: sepia(0.22) saturate(0.92);
  transition: filter var(--dur) ease;
}

.pin-card:hover .pin-photo-frame img {
  filter: sepia(0) saturate(1.05);
}

.pin-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 1.1rem 0.5rem 0.6rem;
  flex: 1;
}

.pin-card-name {
  font-family: var(--font-heading);
  font-size: 1.16rem;
  line-height: 1.3;
}

.pin-card-stars {
  color: var(--star);
  font-size: 0.95rem;
  letter-spacing: 0.22em;
}

.pin-card-desc {
  font-size: 0.88rem;
  font-weight: 300;
  color: var(--ink-soft);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.pin-card-link {
  margin-top: 0.5rem;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: var(--track);
  text-transform: uppercase;
  color: var(--gold);
}

/* ---------- Closing CTA ---------- */
.closing {
  margin-top: clamp(4rem, 10vh, 6.5rem);
  border-top: 1px solid var(--line-soft);
  border-bottom: 1px solid var(--line-soft);
}

.closing-inner {
  max-width: 720px;
  margin: 0 auto;
  padding: clamp(3.5rem, 9vh, 5.5rem) 1.25rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.3rem;
  background: radial-gradient(ellipse 70% 100% at 50% 50%, var(--bg) 40%, transparent 100%);
}

.closing-line {
  font-size: clamp(1.7rem, 4.5vw, 2.5rem);
  line-height: 1.25;
  color: var(--ink);
}

/* ---------- Footer ---------- */
.footer {
  text-align: center;
  padding: clamp(2.5rem, 6vh, 4rem) 1.25rem 2.6rem;
}

.footer-mark {
  margin-top: 1.4rem;
  font-family: var(--font-display);
  font-size: 1.05rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--gold);
}

.footer-small {
  margin-top: 0.6rem;
  font-size: 0.74rem;
  letter-spacing: 0.08em;
  color: var(--ink-faint);
}
</style>
