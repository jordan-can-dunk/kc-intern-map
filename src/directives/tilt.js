/*
 * v-tilt — pointer-tracked 3D tilt with a gold sheen.
 * Sets CSS vars (--rx, --ry, --gx, --gy, --go) consumed by the global
 * .tilt rules in deco.css. The class is added on first pointer move so the
 * scroll-reveal entrance keeps ownership of `transform` until then.
 * No-ops on touch devices and under prefers-reduced-motion.
 */
export const tilt = {
  mounted(el, binding) {
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.matchMedia('(pointer: coarse)').matches
    ) {
      return
    }

    const max = binding.value?.max ?? 6
    let raf = null

    function onMove(e) {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = null
        el.classList.add('tilt')
        const r = el.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width - 0.5
        const py = (e.clientY - r.top) / r.height - 0.5
        el.style.setProperty('--ry', `${(px * max).toFixed(2)}deg`)
        el.style.setProperty('--rx', `${(-py * max).toFixed(2)}deg`)
        el.style.setProperty('--gx', `${((px + 0.5) * 100).toFixed(1)}%`)
        el.style.setProperty('--gy', `${((py + 0.5) * 100).toFixed(1)}%`)
        el.style.setProperty('--go', '1')
      })
    }

    function onLeave() {
      if (raf) {
        cancelAnimationFrame(raf)
        raf = null
      }
      el.style.setProperty('--rx', '0deg')
      el.style.setProperty('--ry', '0deg')
      el.style.setProperty('--go', '0')
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    el._tilt = { onMove, onLeave }
  },

  unmounted(el) {
    if (!el._tilt) return
    el.removeEventListener('pointermove', el._tilt.onMove)
    el.removeEventListener('pointerleave', el._tilt.onLeave)
    delete el._tilt
  },
}
