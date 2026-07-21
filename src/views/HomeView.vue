<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'

const router = useRouter()
const root = ref(null)
const pins = ref([])

// Lives in public/photos/ — save your generated poster there with this exact name
const posterSrc = '/photos/kc-illustrated-map.png'

let ctx
let mm
let lenis
let split
let tickerFn

onMounted(() => {
  if (!root.value) return

  fetch('http://localhost:8000/api/pins/')
    .then((response) => response.json())
    .then((data) => { pins.value = data })

  // --- Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync
  lenis = new Lenis({ autoRaf: false, lerp: 0.12 })
  lenis.on('scroll', ScrollTrigger.update)
  tickerFn = (time) => lenis.raf(time * 1000)
  gsap.ticker.add(tickerFn)
  gsap.ticker.lagSmoothing(0)

  ctx = gsap.context(() => {
    mm = gsap.matchMedia()

    mm.add(
      {
        desktop: '(min-width: 768px)',
        mobile: '(max-width: 767px)',
        noMotion: '(prefers-reduced-motion: reduce)',
        motionOK: '(prefers-reduced-motion: no-preference)',
      },
      (mmCtx) => {
        const { desktop, motionOK } = mmCtx.conditions
        if (!motionOK) {
          // Reduced motion: everything visible, nothing moves
          gsap.set('.will-reveal, .hero-word, .hero-sub, .hero-ctas, .hero-eyebrow', {
            clearProps: 'all',
            autoAlpha: 1,
          })
          return
        }

        /* ============ HERO LOAD SEQUENCE ============ */
        split = new SplitText('.hero-headline', { type: 'words' })
        const load = gsap.timeline({ defaults: { ease: 'back.out(1.6)' } })
        load
          .from('.hero-eyebrow', { autoAlpha: 0, y: 24, duration: 0.5 })
          .from(
            split.words,
            { autoAlpha: 0, y: 60, rotation: () => gsap.utils.random(-9, 9), stagger: 0.08, duration: 0.7 },
            '-=0.2',
          )
          .from('.hero-sub', { autoAlpha: 0, y: 30, duration: 0.5 }, '-=0.35')
          .from('.hero-ctas > *', { autoAlpha: 0, y: 24, scale: 0.85, stagger: 0.1, duration: 0.45 }, '-=0.25')
          .from('.mascot', { autoAlpha: 0, scale: 0, rotation: -12, duration: 0.7, ease: 'back.out(2.2)' }, '-=0.4')
          .from(
            '.confetti-piece',
            { autoAlpha: 0, scale: 0, stagger: 0.05, duration: 0.5, ease: 'back.out(2.5)' },
            '-=0.5',
          )

        /* ============ CONFETTI: ambient float + mouse parallax ============ */
        gsap.utils.toArray('.confetti-piece').forEach((el) => {
          gsap.to(el, {
            y: () => gsap.utils.random(-26, 26),
            rotation: () => gsap.utils.random(-30, 30),
            duration: () => gsap.utils.random(2.4, 4.5),
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          })
        })

        /* ============ MASCOT EYES follow the mouse (the crav homage) ============ */
        const pupils = gsap.utils.toArray('.pupil')
        const pupilXs = pupils.map((p) => gsap.quickTo(p, 'x', { duration: 0.4, ease: 'power3' }))
        const pupilYs = pupils.map((p) => gsap.quickTo(p, 'y', { duration: 0.4, ease: 'power3' }))
        const heroEl = root.value.querySelector('.hero')
        const confettiLayers = [
          { els: gsap.utils.toArray('.parallax-1'), depth: 14 },
          { els: gsap.utils.toArray('.parallax-2'), depth: 28 },
        ]
        const layerTos = confettiLayers.map((l) =>
          l.els.map((el) => ({
            x: gsap.quickTo(el, 'x', { duration: 0.8, ease: 'power2' }),
            depth: l.depth,
          })),
        )

        function onMouse(e) {
          const r = heroEl.getBoundingClientRect()
          const nx = (e.clientX - r.left) / r.width - 0.5
          const ny = (e.clientY - r.top) / r.height - 0.5
          pupilXs.forEach((fn) => fn(nx * 10))
          pupilYs.forEach((fn) => fn(ny * 8))
          layerTos.flat().forEach(({ x, depth }) => x(nx * depth))
        }
        heroEl.addEventListener('mousemove', onMouse)
        mmCtx.add(() => () => heroEl.removeEventListener('mousemove', onMouse))

        /* ============ MARQUEE: infinite loop, kicked faster by scroll velocity ============ */
        const marquee = gsap.to('.marquee-track', {
          xPercent: -50,
          duration: 18,
          ease: 'none',
          repeat: -1,
        })
        ScrollTrigger.create({
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          onUpdate: (self) => {
            const v = Math.abs(self.getVelocity()) / 300
            gsap.to(marquee, { timeScale: 1 + Math.min(v, 3), duration: 0.4, overwrite: true })
            gsap.to(marquee, { timeScale: 1, duration: 1.2, delay: 0.4, overwrite: false })
          },
        })

        /* ============ MAGNETIC CTA BUTTONS (desktop only) ============ */
        if (desktop) {
          gsap.utils.toArray('.magnetic').forEach((btn) => {
            const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3' })
            const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3' })
            const move = (e) => {
              const r = btn.getBoundingClientRect()
              xTo((e.clientX - (r.left + r.width / 2)) * 0.35)
              yTo((e.clientY - (r.top + r.height / 2)) * 0.35)
            }
            const leave = () => {
              xTo(0)
              yTo(0)
            }
            btn.addEventListener('mousemove', move)
            btn.addEventListener('mouseleave', leave)
            mmCtx.add(() => () => {
              btn.removeEventListener('mousemove', move)
              btn.removeEventListener('mouseleave', leave)
            })
          })
        }

        /* ============ HOW IT WORKS ============ */
        if (desktop) {
          // Pinned scene: section holds while the three step cards deal in like cards
          const steps = gsap.utils.toArray('.step-card')
          gsap.set(steps, { autoAlpha: 0, y: 120, rotation: (i) => [-6, 4, -3][i] })
          const pinTl = gsap.timeline({
            scrollTrigger: {
              trigger: '.how-section',
              start: 'top top',
              end: '+=1400',
              pin: true,
              scrub: 0.6,
            },
          })
          pinTl
            .from('.how-title', { autoAlpha: 0, y: 80, duration: 0.6 })
            .to(steps[0], { autoAlpha: 1, y: 0, rotation: -2, duration: 1, ease: 'back.out(1.4)' })
            .to(steps[1], { autoAlpha: 1, y: 0, rotation: 1.5, duration: 1, ease: 'back.out(1.4)' }, '+=0.3')
            .to(steps[2], { autoAlpha: 1, y: 0, rotation: -1, duration: 1, ease: 'back.out(1.4)' }, '+=0.3')
            .to('.how-cta', { autoAlpha: 1, y: 0, duration: 0.6 }, '+=0.2')
          gsap.set('.how-cta', { autoAlpha: 0, y: 40 })
        } else {
          // Mobile: simple staggered reveals, no pinning (cheap phones stay smooth)
          gsap.from('.how-title', {
            autoAlpha: 0,
            y: 50,
            duration: 0.7,
            ease: 'back.out(1.6)',
            scrollTrigger: { trigger: '.how-section', start: 'top 75%' },
          })
          gsap.utils.toArray('.step-card').forEach((card, i) => {
            gsap.from(card, {
              autoAlpha: 0,
              y: 70,
              rotation: i % 2 ? 4 : -4,
              duration: 0.7,
              ease: 'back.out(1.6)',
              scrollTrigger: { trigger: card, start: 'top 85%' },
            })
          })
        }

        /* ============ FEATURED PINS: batch stagger-in ============ */
        ScrollTrigger.batch('.pin-card', {
          start: 'top 88%',
          once: true,
          onEnter: (batch) =>
            gsap.from(batch, {
              autoAlpha: 0,
              y: 80,
              scale: 0.9,
              rotation: () => gsap.utils.random(-4, 4),
              stagger: 0.09,
              duration: 0.65,
              ease: 'back.out(1.7)',
            }),
        })
        gsap.from('.pins-title', {
          autoAlpha: 0,
          y: 50,
          duration: 0.7,
          ease: 'back.out(1.6)',
          scrollTrigger: { trigger: '.pins-section', start: 'top 75%' },
        })

        /* ============ ILLUSTRATED MAP FINALE ============ */
        gsap.from('.finale-title', {
          autoAlpha: 0,
          y: 60,
          duration: 0.8,
          ease: 'back.out(1.6)',
          scrollTrigger: { trigger: '.finale-section', start: 'top 70%' },
        })
        // The poster slow-pans upward as you scroll past it (parallax)
        gsap.fromTo(
          '.poster-img',
          { yPercent: -12 },
          {
            yPercent: 0,
            ease: 'none',
            scrollTrigger: { trigger: '.poster-frame', start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
        // Clouds drift forever across the sky band
        gsap.utils.toArray('.cloud').forEach((cloud, i) => {
          gsap.fromTo(
            cloud,
            { xPercent: -15 - i * 10 },
            {
              xPercent: 115,
              duration: gsap.utils.random(30, 48),
              ease: 'none',
              repeat: -1,
              delay: i * -14,
            },
          )
        })
        // Little plane crosses every so often with a wobble
        const plane = root.value.querySelector('.plane')
        gsap
          .timeline({ repeat: -1, repeatDelay: 5 })
          .fromTo(
            plane,
            { xPercent: -20, yPercent: 0 },
            { xPercent: 1200, duration: 12, ease: 'none' },
          )
        gsap.to(plane, { y: 10, duration: 1.6, yoyo: true, repeat: -1, ease: 'sine.inOut' })

        /* ============ FOOTER HEART PULSE ============ */
        gsap.to('.footer-heart', {
          scale: 1.15,
          transformOrigin: '50% 60%',
          duration: 0.9,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
        })
        gsap.from('.footer-title', {
          autoAlpha: 0,
          y: 50,
          duration: 0.8,
          ease: 'back.out(1.6)',
          scrollTrigger: { trigger: '.site-footer', start: 'top 80%' },
        })

        /* ============ WAVY DIVIDERS drift side to side ============ */
        gsap.utils.toArray('.wave-divider svg').forEach((w, i) => {
          gsap.to(w, {
            xPercent: i % 2 ? 3 : -3,
            duration: 6,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
          })
        })
      },
    )
  }, root.value)
})

onUnmounted(() => {
  split?.revert()
  mm?.revert()
  ctx?.revert()
  if (tickerFn) gsap.ticker.remove(tickerFn)
  lenis?.destroy()
})

function starString(rating) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}
</script>

<template>
  <main ref="root" class="home">
    <!-- ================= HERO ================= -->
    <section class="hero">
      <!-- chaos confetti (decorative) -->
      <div class="confetti-field" aria-hidden="true">
        <span class="confetti-piece parallax-1 c-circle"></span>
        <span class="confetti-piece parallax-2 c-triangle"></span>
        <span class="confetti-piece parallax-1 c-blob"></span>
        <span class="confetti-piece parallax-2 c-square"></span>
        <span class="confetti-piece parallax-1 c-star">✦</span>
        <span class="confetti-piece parallax-2 c-squiggle">〰</span>
        <span class="confetti-piece parallax-1 c-circle c-alt"></span>
        <span class="confetti-piece parallax-2 c-triangle c-alt2"></span>
      </div>

      <div class="hero-inner">
        <div class="hero-copy">
          <p class="hero-eyebrow">For KC interns · by KC interns</p>
          <h1 class="hero-headline">
            The map every intern <span class="accent-red">leaves behind.</span>
          </h1>
          <p class="hero-sub">
            Every summer, interns find the best BBQ, the good coffee, the park nobody mentions —
            then leave and take the list with them. Not anymore. Pin your spots. Steal theirs.
          </p>
          <div class="hero-ctas">
            <button class="btn-kc btn-kc--red magnetic" @click="router.push('/map')">Open the map</button>
            <button class="btn-kc btn-kc--paper magnetic" @click="router.push('/add')">+ Drop a pin</button>
          </div>
        </div>

        <!-- KC heart mascot — eyes follow your mouse -->
        <div class="mascot" aria-hidden="true">
          <svg viewBox="0 0 100 92" width="100%" height="100%">
            <path
              d="M50 88 C22 68 4 50 4 30 C4 13 17 4 29 4 C38 4 46 9 50 16 C54 9 62 4 71 4 C83 4 96 13 96 30 C96 50 78 68 50 88 Z"
              fill="#e31837"
              stroke="#1e1b18"
              stroke-width="4"
            />
            <g class="eye">
              <circle cx="33" cy="32" r="11" fill="#fffdf7" stroke="#1e1b18" stroke-width="3" />
              <circle class="pupil" cx="33" cy="32" r="4.5" fill="#1e1b18" />
            </g>
            <g class="eye">
              <circle cx="67" cy="32" r="11" fill="#fffdf7" stroke="#1e1b18" stroke-width="3" />
              <circle class="pupil" cx="67" cy="32" r="4.5" fill="#1e1b18" />
            </g>
            <path d="M38 56 Q50 68 62 56" fill="none" stroke="#1e1b18" stroke-width="4" stroke-linecap="round" />
          </svg>
        </div>
      </div>

      <!-- marquee -->
      <div class="marquee" aria-hidden="true">
        <div class="marquee-track">
          <span
            >BBQ&nbsp;·&nbsp;COFFEE&nbsp;·&nbsp;PARKS&nbsp;·&nbsp;JAZZ&nbsp;·&nbsp;FOUNTAINS&nbsp;·&nbsp;MURALS&nbsp;·&nbsp;GAME&nbsp;DAY&nbsp;·&nbsp;FIRST&nbsp;FRIDAYS&nbsp;·&nbsp;</span
          >
          <span
            >BBQ&nbsp;·&nbsp;COFFEE&nbsp;·&nbsp;PARKS&nbsp;·&nbsp;JAZZ&nbsp;·&nbsp;FOUNTAINS&nbsp;·&nbsp;MURALS&nbsp;·&nbsp;GAME&nbsp;DAY&nbsp;·&nbsp;FIRST&nbsp;FRIDAYS&nbsp;·&nbsp;</span
          >
        </div>
      </div>
    </section>

    <!-- wave: cream → royal -->
    <div class="wave-divider wave-to-royal" aria-hidden="true">
      <svg viewBox="0 0 1440 90" preserveAspectRatio="none">
        <path
          d="M0,48 C240,95 480,0 720,40 C960,80 1200,10 1440,55 L1440,90 L0,90 Z"
          fill="#004687"
        />
      </svg>
    </div>

    <!-- ================= HOW IT WORKS ================= -->
    <section class="how-section">
      <h2 class="how-title display-font">How it works</h2>
      <div class="steps-row">
        <article class="step-card">
          <p class="step-num">Step 01</p>
          <h3>Explore the map</h3>
          <p>Every heart is a real spot a real intern loved. Tap one.</p>
        </article>
        <article class="step-card">
          <p class="step-num">Step 02</p>
          <h3>Get the real story</h3>
          <p>Photos, star ratings, and the tips you'd only hear from a friend.</p>
        </article>
        <article class="step-card">
          <p class="step-num">Step 03</p>
          <h3>Leave your mark</h3>
          <p>Found a gem? Pin it for next summer's class. Anonymous is fine.</p>
        </article>
      </div>
      <div class="how-cta">
        <button class="btn-kc btn-kc--gold magnetic" @click="router.push('/map')">Start exploring</button>
      </div>
    </section>

    <!-- wave: royal → deep cream -->
    <div class="wave-divider wave-to-cream" aria-hidden="true">
      <svg viewBox="0 0 1440 90" preserveAspectRatio="none">
        <path
          d="M0,42 C260,0 520,88 780,50 C1040,12 1260,75 1440,35 L1440,90 L0,90 Z"
          fill="#efdfc5"
        />
      </svg>
    </div>

    <!-- ================= FEATURED PINS ================= -->
    <section class="pins-section">
      <h2 class="pins-title display-font">Already pinned <span class="accent-royal">by interns</span></h2>
      <div class="pin-scroller">
        <article v-for="pin in pins" :key="pin.id" class="pin-card">
          <div class="pin-photo">
            <img :src="pin.photos[0]" :alt="pin.name" loading="lazy" />
          </div>
          <div class="pin-body">
            <h3>{{ pin.name }}</h3>
            <p class="pin-stars" :aria-label="pin.rating + ' out of 5 stars'">
              <span class="stars">{{ starString(pin.rating) }}</span>
              <span class="rating-label">{{ pin.rating }}/5</span>
            </p>
            <p class="pin-desc">{{ pin.description }}</p>
            <button class="pin-more" @click="router.push(`/pin/${pin.id}`)">See more →</button>
          </div>
        </article>
      </div>
    </section>

    <!-- ================= ILLUSTRATED MAP FINALE ================= -->
    <section class="finale-section">
      <h2 class="finale-title display-font">One city. <span class="accent-red">Every summer's favorites.</span></h2>
      <div class="poster-frame">
        <!-- animated sky layer above the poster -->
        <div class="sky-layer" aria-hidden="true">
          <svg class="cloud" viewBox="0 0 120 50" width="90">
            <ellipse cx="40" cy="34" rx="34" ry="15" fill="#fffdf7" opacity="0.9" />
            <ellipse cx="72" cy="26" rx="28" ry="16" fill="#fffdf7" opacity="0.9" />
          </svg>
          <svg class="cloud cloud-2" viewBox="0 0 120 50" width="64">
            <ellipse cx="45" cy="32" rx="36" ry="14" fill="#fffdf7" opacity="0.85" />
            <ellipse cx="80" cy="24" rx="24" ry="13" fill="#fffdf7" opacity="0.85" />
          </svg>
          <svg class="plane" viewBox="0 0 60 24" width="54">
            <path d="M2 14 L44 10 L56 2 L50 14 L56 20 L44 14 Z" fill="#e31837" stroke="#1e1b18" stroke-width="2" />
          </svg>
        </div>
        <img
          class="poster-img"
          :src="posterSrc"
          alt="Image loading error: KC illustrated map poster"
        />
      </div>
    </section>

    <!-- ================= FOOTER ================= -->
    <footer class="site-footer">
      <h2 class="footer-title display-font">See you out there.</h2>
      <p class="footer-tag">
        Made with
        <svg class="footer-heart" viewBox="0 0 100 92" width="26" height="24" aria-label="love">
          <path
            d="M50 88 C22 68 4 50 4 30 C4 13 17 4 29 4 C38 4 46 9 50 16 C54 9 62 4 71 4 C83 4 96 13 96 30 C96 50 78 68 50 88 Z"
            fill="#e31837"
          />
        </svg>
        in Kansas City
      </p>
      <div class="footer-ctas">
        <button class="btn-kc btn-kc--red" @click="router.push('/map')">Open the map</button>
        <button class="btn-kc btn-kc--gold" @click="router.push('/add')">+ Drop a pin</button>
      </div>
    </footer>
  </main>
</template>

<style scoped>
.home {
  overflow-x: clip;
}

.display-font {
  font-family: var(--font-display);
  font-weight: 400;
}

.accent-red {
  color: var(--kc-red);
}

.accent-royal {
  color: var(--kc-royal);
}

/* ================= HERO ================= */
.hero {
  position: relative;
  min-height: calc(100svh - 60px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--sp-6) var(--sp-4) 0;
  overflow: hidden;
}

.hero-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-5);
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  flex: 1;
  justify-content: center;
  position: relative;
  z-index: 2;
  text-align: center;
}

.hero-eyebrow {
  font-family: var(--font-varsity);
  font-size: 0.72rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--kc-royal);
  margin: 0 0 var(--sp-3);
}

.hero-headline {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(2.7rem, 9vw, 6rem);
  line-height: 1.02;
  margin: 0;
  text-wrap: balance;
}

.hero-sub {
  max-width: 54ch;
  font-size: clamp(1rem, 2.4vw, 1.15rem);
  margin: var(--sp-4) auto 0;
}

.hero-ctas {
  display: flex;
  gap: var(--sp-3);
  flex-wrap: wrap;
  justify-content: center;
  margin-top: var(--sp-5);
}

.mascot {
  width: clamp(120px, 22vw, 190px);
  aspect-ratio: 100 / 92;
  filter: drop-shadow(5px 6px 0 rgba(30, 27, 24, 0.9));
}

/* confetti */
.confetti-field {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.confetti-piece {
  position: absolute;
  display: block;
}

.c-circle {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--chaos-pink);
  border: 3px solid var(--ink);
  top: 14%;
  left: 8%;
}

.c-circle.c-alt {
  background: var(--chaos-teal);
  width: 18px;
  height: 18px;
  top: 68%;
  left: 84%;
}

.c-triangle {
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-bottom: 26px solid var(--chaos-lime);
  top: 22%;
  left: 86%;
}

.c-triangle.c-alt2 {
  border-bottom-color: var(--kc-gold);
  top: 78%;
  left: 6%;
  transform: rotate(18deg);
}

.c-blob {
  width: 42px;
  height: 38px;
  background: var(--chaos-purple);
  border: 3px solid var(--ink);
  border-radius: var(--r-blob);
  top: 62%;
  left: 12%;
}

.c-square {
  width: 20px;
  height: 20px;
  background: var(--chaos-powder);
  border: 3px solid var(--ink);
  border-radius: 4px;
  top: 12%;
  left: 72%;
  transform: rotate(-14deg);
}

.c-star {
  font-size: 34px;
  color: var(--kc-gold);
  -webkit-text-stroke: 1.5px var(--ink);
  top: 40%;
  left: 92%;
}

.c-squiggle {
  font-size: 40px;
  color: var(--chaos-teal);
  top: 34%;
  left: 3%;
}

/* marquee */
.marquee {
  position: relative;
  z-index: 2;
  border-top: var(--border-ink);
  border-bottom: var(--border-ink);
  background: var(--kc-gold);
  padding: 12px 0;
  margin: var(--sp-6) calc(-1 * var(--sp-4)) 0;
  overflow: hidden;
  white-space: nowrap;
}

.marquee-track {
  display: inline-flex;
  will-change: transform;
}

.marquee-track span {
  font-family: var(--font-varsity);
  font-size: 0.95rem;
  letter-spacing: 0.22em;
  color: var(--ink);
}

/* ================= WAVES ================= */
.wave-divider {
  line-height: 0;
  overflow: hidden;
}

.wave-divider svg {
  width: 106%;
  margin-left: -3%;
  height: clamp(40px, 8vw, 90px);
  display: block;
}

.wave-to-royal {
  background: var(--cream);
}

.wave-to-cream {
  background: var(--kc-royal);
}

/* ================= HOW IT WORKS ================= */
.how-section {
  background: var(--kc-royal);
  color: var(--paper);
  padding: var(--sp-8) var(--sp-4);
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-6);
}

.how-title {
  font-size: clamp(2.2rem, 6vw, 3.6rem);
  color: var(--paper);
  text-align: center;
}

.steps-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--sp-4);
  max-width: 1000px;
  width: 100%;
}

@media (min-width: 768px) {
  .steps-row {
    grid-template-columns: repeat(3, 1fr);
  }
}

.step-card {
  background: var(--paper);
  color: var(--ink);
  border: var(--border-ink);
  border-radius: var(--r-card);
  box-shadow: var(--shadow-ink);
  padding: var(--sp-4) var(--sp-4) var(--sp-5);
  transition:
    transform var(--t-quick) var(--ease-bounce),
    box-shadow var(--t-quick) var(--ease-bounce);
}

.step-card:hover {
  transform: translate(-2px, -5px) rotate(-0.6deg);
  box-shadow: var(--shadow-ink-lift);
}

.step-num {
  font-family: var(--font-varsity);
  font-size: 0.7rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--kc-red);
  margin: 0 0 var(--sp-2);
}

.step-card h3 {
  font-size: 1.15rem;
  margin-bottom: var(--sp-2);
  font-weight: 800;
}

.step-card p {
  margin: 0;
  font-size: 0.95rem;
}

.how-cta {
  text-align: center;
}

/* ================= FEATURED PINS ================= */
.pins-section {
  background: var(--cream-deep);
  padding: var(--sp-8) 0 var(--sp-8) var(--sp-4);
}

.pins-title {
  font-size: clamp(2rem, 5.5vw, 3.2rem);
  margin-bottom: var(--sp-6);
  padding-right: var(--sp-4);
}

.pin-scroller {
  display: flex;
  gap: var(--sp-4);
  overflow-x: auto;
  padding: var(--sp-2) var(--sp-4) var(--sp-4) var(--sp-1);
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}

.pin-scroller::-webkit-scrollbar {
  display: none;
}

.pin-card {
  flex: 0 0 min(78vw, 300px);
  scroll-snap-align: start;
  background: var(--paper);
  border: var(--border-ink);
  border-radius: var(--r-card);
  box-shadow: var(--shadow-ink);
  overflow: hidden;
  transition:
    transform var(--t-quick) var(--ease-bounce),
    box-shadow var(--t-quick) var(--ease-bounce);
}

.pin-card:nth-child(even) {
  rotate: 0.8deg;
}

.pin-card:nth-child(odd) {
  rotate: -0.8deg;
}

.pin-card:hover {
  transform: translate(-2px, -6px);
  box-shadow: var(--shadow-ink-lift);
}

.pin-photo {
  aspect-ratio: 3 / 2;
  border-bottom: var(--border-ink);
  background: var(--cream);
}

.pin-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pin-body {
  padding: var(--sp-3) var(--sp-4) var(--sp-4);
}

.pin-body h3 {
  font-size: 1.05rem;
  font-weight: 800;
  margin-bottom: var(--sp-1);
}

.pin-stars {
  margin: 0 0 var(--sp-2);
  display: flex;
  align-items: baseline;
  gap: var(--sp-2);
}

.stars {
  color: var(--kc-gold);
  -webkit-text-stroke: 0.8px var(--ink);
  font-size: 1.05rem;
  letter-spacing: 2px;
}

.rating-label {
  font-family: var(--font-varsity);
  font-size: 0.7rem;
  letter-spacing: 0.12em;
}

.pin-desc {
  font-size: 0.88rem;
  margin: 0 0 var(--sp-3);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pin-more {
  font-family: var(--font-varsity);
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  background: none;
  border: none;
  color: var(--kc-royal);
  cursor: pointer;
  padding: 0;
  border-bottom: 2px solid var(--kc-gold);
  transition: color var(--t-micro) ease;
}

.pin-more:hover {
  color: var(--kc-red);
}

/* ================= FINALE ================= */
.finale-section {
  background: var(--cream);
  padding: var(--sp-8) var(--sp-4);
  text-align: center;
}

.finale-title {
  font-size: clamp(2rem, 6vw, 3.6rem);
  max-width: 20ch;
  margin: 0 auto var(--sp-6);
  text-wrap: balance;
}

.poster-frame {
  position: relative;
  max-width: 1000px;
  margin: 0 auto;
  border: var(--border-ink);
  border-radius: var(--r-card);
  box-shadow: 6px 7px 0 var(--ink);
  overflow: hidden;
  background: var(--cream-deep);
}

.poster-img {
  width: 100%;
  height: auto;
  transform-origin: center;
  scale: 1.15;
  will-change: transform;
}

.sky-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 22%;
  z-index: 2;
  pointer-events: none;
}

.cloud {
  position: absolute;
  top: 18%;
  left: 0;
}

.cloud-2 {
  top: 48%;
}

.plane {
  position: absolute;
  top: 30%;
  left: 0;
}

/* ================= FOOTER ================= */
.site-footer {
  background: var(--ink);
  color: var(--cream);
  text-align: center;
  padding: var(--sp-8) var(--sp-4);
}

.footer-title {
  font-size: clamp(2.2rem, 7vw, 4rem);
  color: var(--kc-gold);
  margin-bottom: var(--sp-3);
}

.footer-tag {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  font-size: 1rem;
  margin: 0 0 var(--sp-5);
}

.footer-heart {
  display: inline-block;
}

.footer-ctas {
  display: flex;
  gap: var(--sp-3);
  justify-content: center;
  flex-wrap: wrap;
}
</style>
