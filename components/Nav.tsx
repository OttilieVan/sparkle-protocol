'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSparkle } from '@/app/providers'
import { useEffect, useState, useRef } from 'react'

// ── 三色火焰图标 ─────────────────────────────────────────────────────────────
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
  const [isOpen, setIsOpen] = useState(false)

  // ── 余额滚动逻辑 (保持不变) ──────────────────────────────────────────────
  const [displayVal, setDisplayVal] = useState(0)
  const activationDone = useRef(false)
  const rafRef = useRef<number>(0)
  const stakeAnimating = useRef(false)
  const prevStakeRev = useRef(0)

  useEffect(() => {
    if (state.isActivated && !activationDone.current) {
      activationDone.current = true
      const target = state.protocolBalance
      const DURATION = 1500
      const started = performance.now()
      function tick(now: number) {
        const t = Math.min((now - started) / DURATION, 1)
        const eased = 1 - Math.pow(1 - t, 3)
        setDisplayVal(parseFloat((eased * target).toFixed(1)))
        if (t < 1) rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(rafRef.current)
    } else if (state.isActivated && !stakeAnimating.current) {
      setDisplayVal(state.protocolBalance)
    } else if (!state.isActivated) {
      cancelAnimationFrame(rafRef.current)
      setDisplayVal(0)
    }
  }, [state.isActivated, state.protocolBalance])

  useEffect(() => {
    if (state.stakeRevision === 0 || state.stakeRevision <= prevStakeRev.current) return
    prevStakeRev.current = state.stakeRevision
    cancelAnimationFrame(rafRef.current)
    stakeAnimating.current = true
    const target = state.protocolBalance
    const DURATION = 1400
    const started = performance.now()
    function tick(now: number) {
      const t = Math.min((now - started) / DURATION, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplayVal(parseFloat((eased * target).toFixed(1)))
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        stakeAnimating.current = false
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [state.stakeRevision])

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(233,236,239,0.8)',
      }}
    >
      <div
        className="mx-auto flex items-center justify-between"
        style={{ maxWidth: 1440, padding: '0 5%', mdPadding: '0 12%', height: 64 }}
      >
        {/* ── Logo ── */}
        <Link href="/" onClick={() => setIsOpen(false)} style={{ textDecoration: 'none', flexShrink: 0 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <FlameIcon size={28} />
            <span style={{
              fontFamily: 'var(--font-lobster), "Lobster", cursive',
              fontSize: 20, color: '#1A1A1A'
            }}>Sparkle</span>
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {links.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-1.5 rounded-full transition-colors"
                style={{
                  fontSize: 13,
                  color: active ? '#111827' : '#6B7280',
                  fontWeight: active ? 600 : 400,
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

        {/* ── Right Actions ── */}
        <div className="flex items-center gap-3">
          {/* Credits Pill */}
          <Link href="/opportunity" style={{ textDecoration: 'none' }}>
            <motion.span
              whileHover={{ background: 'rgba(206,32,41,0.04)' }}
              className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 border border-[#CE2029]/30 rounded-full bg-white/50"
              style={{ fontSize: 12, fontWeight: 500, color: '#1A1A1A' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#DC321E] shadow-[0_0_5px_rgba(206,32,41,0.6)]" />
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{displayVal.toFixed(1)}</span>
              <span className="text-[#DC321E]">✦</span>
              <span className="hidden xs:inline">Credits</span>
            </motion.span>
          </Link>

          {/* Hamburger Button (Mobile Only) */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-600 focus:outline-none"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 relative flex flex-col justify-between overflow-hidden">
              <motion.span 
                animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                className="w-full h-0.5 bg-current rounded-full origin-left"
              />
              <motion.span 
                animate={isOpen ? { opacity: 0, x: 20 } : { opacity: 1, x: 0 }}
                className="w-full h-0.5 bg-current rounded-full"
              />
              <motion.span 
                animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                className="w-full h-0.5 bg-current rounded-full origin-left"
              />
            </div>
          </button>
        </div>
      </div>

      {/* ── Mobile Menu Overlay ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-b border-gray-100"
          >
            <div className="flex flex-col p-6 gap-4">
              {links.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block text-lg font-medium text-gray-800 hover:text-[#CE2029] transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
