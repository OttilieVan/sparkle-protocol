'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSparkle } from '@/app/providers'
import { useEffect, useState, useRef } from 'react'

// ── Three-petal flame SVG — exact paths provided ──────────────────────────────
function FlameIcon({ size = 36 }: { size?: number }) {
  const h = Math.round(size * (42 / 36))
  return (
    <svg width={size} height={h} viewBox="0 0 36 42" fill="none" aria-hidden>
      <path d="M12 42C12 42 0 34 0 18C0 8 10 0 10 0C10 0 6 12 8 20C10 28 12 32 12 42Z" fill="#CE2029"/>
      <path d="M20 38C20 38 10 30 10 16C10 6 18 2 18 2C18 2 15 10 16 18C17 26 20 30 20 38Z" fill="#FF8C00"/>
      <path d="M26 34C26 34 18 26 18 16C18 10 24 6 24 6C24 6 22 12 23 18C24 24 26 28 26 34Z" fill="#FFD700"/>
    </svg>
  )
}

const links = [
  { href: '/',            label: 'Portal'      },
  { href: '/parent',      label: 'Parent'      },
  { href: '/student',     label: 'Student'     },
  { href: '/educator',    label: 'Expert'      },
  { href: '/opportunity', label: 'Opportunity' },
]

export default function Nav() {
  const pathname = usePathname()
  const { state } = useSparkle()

  // ── Animated count-up when first activated (Top Up Fuel) ──────────────────
  const [displayVal,      setDisplayVal]      = useState(0)
  const activationDone  = useRef(false)
  const rafRef          = useRef<number>(0)
  const stakeAnimating  = useRef(false)          // suppress direct-set during stake roll-up
  const prevStakeRev    = useRef(0)              // last handled stakeRevision

  // First-activation roll-up + live-balance tracking
  useEffect(() => {
    if (state.isActivated && !activationDone.current) {
      // First activation — roll from 0 → current protocolBalance over 1.5 s
      activationDone.current = true
      const target   = state.protocolBalance
      const DURATION = 1500
      const started  = performance.now()
      function tick(now: number) {
        const t     = Math.min((now - started) / DURATION, 1)
        const eased = 1 - Math.pow(1 - t, 3)
        setDisplayVal(parseFloat((eased * target).toFixed(1)))
        if (t < 1) rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(rafRef.current)
    } else if (state.isActivated && !stakeAnimating.current) {
      // Track live balance changes (drains, etc.) only when no stake roll-up is running
      setDisplayVal(state.protocolBalance)
    } else if (!state.isActivated) {
      cancelAnimationFrame(rafRef.current)
      setDisplayVal(0)
    }
  }, [state.isActivated, state.protocolBalance])

  // Stake event — count from 0 → new balance (fires when drawer closes + Frame 1 scrolls in)
  useEffect(() => {
    if (state.stakeRevision === 0 || state.stakeRevision <= prevStakeRev.current) return
    prevStakeRev.current = state.stakeRevision
    cancelAnimationFrame(rafRef.current)
    stakeAnimating.current = true
    const target   = state.protocolBalance
    const DURATION = 1400
    const started  = performance.now()
    function tick(now: number) {
      const t     = Math.min((now - started) / DURATION, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplayVal(parseFloat((eased * target).toFixed(1)))
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        stakeAnimating.current = false
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.stakeRevision])

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(233,236,239,0.8)',
      }}
    >
      {/* Container aligned with 12% content padding */}
      <div
        className="mx-auto flex items-center justify-between"
        style={{ maxWidth: 1440, padding: '0 12%', height: 60 }}
      >

        {/* ── Logo ── */}
        <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, cursor: 'pointer' }}
          >
            <FlameIcon size={32} />
            <span style={{
              fontFamily: 'var(--font-lobster), "Lobster", cursive',
              fontSize: 20,
              fontWeight: 400,
              letterSpacing: '0.01em',
              color: '#1A1A1A',
              lineHeight: 1,
            }}>
              Sparkle
            </span>
          </span>
        </Link>

        {/* ── Navigation links — centered ── */}
        <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
          {links.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-1.5 rounded-full transition-colors duration-150"
                style={{
                  fontSize: 13,
                  color: active ? '#111827' : '#6B7280',
                  fontWeight: active ? 600 : 400,
                  letterSpacing: '0.01em',
                  textDecoration: 'none',
                }}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'rgba(17,24,39,0.06)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* ── Credits pill ── */}
        <Link href="/opportunity" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <motion.span
            whileHover={{ background: 'rgba(206,32,41,0.04)' }}
            transition={{ duration: 0.18 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '7px 18px',
              border: '1.5px solid rgba(206,32,41,0.28)',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 500,
              color: '#1A1A1A',
              cursor: 'pointer',
              background: 'transparent',
            }}
          >
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#DC321E',
              boxShadow: '0 0 5px rgba(206,32,41,0.6)',
              flexShrink: 0,
            }} />
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
              {displayVal.toFixed(1)}
            </span>
            <span style={{ color: '#DC321E', fontSize: 11 }}>✦</span>
            <span>Credits</span>
          </motion.span>
        </Link>

      </div>
    </motion.nav>
  )
}
