'use client'

import { useRef, useState, useEffect } from 'react'
import {
  motion, AnimatePresence, useInView,
  useMotionValue, useSpring, useTransform,
} from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import { useSparkle, EXPERT_ID, EXPERT_THEME } from '@/app/providers'

// ── Palette ───────────────────────────────────────────────────────────────────
const V     = '#DC321E'   // Vermilion / Cinnabar
const GOLD  = '#FFBF00'   // Amber gold
const IND   = '#3A56FF'   // Indigo
const TEAL  = '#00C2A0'   // Teal
const TEXT  = '#1A1A1A'
const MUTED = '#6B7280'
const EASE  = [0.22, 1, 0.36, 1] as const
const rd = (v: number, d = 3) => Math.round(v * 10 ** d) / 10 ** d

// ── Global brand color anchors (CTO spec) ─────────────────────────────────────
const CINNABAR = '#E11D48'   // Brand soul / Opportunity
const AMBER    = '#F59E0B'   // Parent portal
const BLUE     = '#3B82F6'   // Student portal
const GREEN    = '#10B981'   // Educator portal

// ── Static Halo — colour stain for non-hero frames ───────────────────────────
function Halo({ color, top = '-20%', right = '-10%', size = '70vw', opacity = 0.08 }: {
  color: string; top?: string; right?: string; size?: string; opacity?: number
}) {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        top, right,
        width: size, height: size,
        maxWidth: 960, maxHeight: 960,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        opacity,
        filter: 'blur(120px)',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}

// ── Breathing Glow — pulsing cinnabar radial for Frame 01 ─────────────────────
// Mimics the rhythm of "logic breathing" — inhale → peak → exhale in 5s cycles.
// Each instance has an independent delay so the two glows never peak together,
// creating a slow, organic alternation rather than a synchronized flash.
function BreathingGlow({ color, top = '0%', right = '0%', size = '70vw', peakOpacity = 0.10, delay = 0 }: {
  color: string; top?: string; right?: string; size?: string; peakOpacity?: number; delay?: number
}) {
  return (
    <motion.div
      aria-hidden
      animate={{
        opacity: [peakOpacity * 0.38, peakOpacity, peakOpacity * 0.42, peakOpacity * 0.38],
        scale:   [0.94, 1.06, 1.02, 0.94],
      }}
      transition={{
        duration: 6,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
        times: [0, 0.45, 0.72, 1],
      }}
      style={{
        position: 'absolute',
        top, right,
        width: size, height: size,
        maxWidth: 1000, maxHeight: 1000,
        background: `radial-gradient(circle, ${color} 0%, transparent 68%)`,
        filter: 'blur(110px)',
        pointerEvents: 'none',
        zIndex: 0,
        transformOrigin: 'center center',
      }}
    />
  )
}

// ── Glass card style object — spread into inline style ────────────────────────
const GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.65)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  border: '1px solid #E1E1E1',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 8px 28px rgba(0,0,0,0.05)',
}

// ── FadeUp scroll helper ──────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = '', style = {} }: {
  children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-55px' })
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={className} style={style}>
      {children}
    </motion.div>
  )
}

// ── Sparkline ─────────────────────────────────────────────────────────────────
const HASH_PTS = [35,42,38,52,57,46,63,55,71,65,76,70,84,79,87,81,91,86,94,90]

function Sparkline({ pts, color, h = 64 }: { pts: number[]; color: string; h?: number }) {
  const max = Math.max(...pts), min = Math.min(...pts), range = max - min
  const w = 260, step = w / (pts.length - 1)
  const toY = (v: number) => h - ((v - min) / range) * (h - 8) - 4
  const line = pts.map((v, i) => `${i === 0 ? 'M' : 'L'} ${rd(i * step)},${rd(toY(v))}`).join(' ')
  const fill = [
    ...pts.map((v, i) => `${i === 0 ? 'M' : 'L'} ${rd(i * step)},${rd(toY(v))}`),
    `L ${w},${h}`, `L 0,${h}`, 'Z',
  ].join(' ')
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="sf-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill="url(#sf-g)" />
      <motion.path d={line} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
        transition={{ duration: 2.0, ease: 'easeInOut' }} />
      <circle cx={rd((pts.length - 1) * step)} cy={rd(toY(pts[pts.length - 1]))}
        r={3.5} fill={color} style={{ filter: `drop-shadow(0 0 5px ${color})` }} />
    </svg>
  )
}

// ── Credit Ticker ─────────────────────────────────────────────────────────────
function CreditTicker({ credits }: { credits: number }) {
  const ref  = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: false })
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return
    const start = Date.now(), dur = 900
    const id = setInterval(() => {
      const p = Math.min((Date.now() - start) / dur, 1)
      setVal(credits * p)
      if (p >= 1) clearInterval(id)
    }, 16)
    return () => clearInterval(id)
  }, [credits, inView])
  return (
    <div ref={ref}>
      <span style={{
        fontSize: 68,
        fontFamily: '"SF Mono","Fira Code","JetBrains Mono",Consolas,monospace',
        fontWeight: 700,
        color: GOLD,
        lineHeight: 1,
        letterSpacing: '-0.025em',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {val.toFixed(1)}
      </span>
    </div>
  )
}

// ── Knowledge Constellation — faint digital node network behind hero ──────────
// 15 nodes connected by 20 edges, emanating from a central shimmering core.
// Drawn at 0.065 opacity so it never competes with typography.
function KnowledgeConstellation() {
  const nodes = [
    { x: 400, y: 280, r: 5.5 },   // 0 — central core (torch nexus)
    { x: 262, y: 195, r: 3.2 },   // 1
    { x: 138, y: 255, r: 2.6 },   // 2
    { x: 188, y: 388, r: 3.0 },   // 3
    { x: 316, y: 462, r: 2.4 },   // 4
    { x: 486, y: 468, r: 3.0 },   // 5
    { x: 592, y: 374, r: 2.6 },   // 6
    { x: 638, y: 198, r: 3.2 },   // 7
    { x: 512, y: 136, r: 2.4 },   // 8
    { x: 340, y: 122, r: 2.8 },   // 9
    { x:  84, y: 144, r: 2.0 },   // 10
    { x:  72, y: 430, r: 2.0 },   // 11
    { x: 698, y: 330, r: 2.2 },   // 12
    { x: 456, y: 322, r: 2.2 },   // 13
    { x: 296, y: 316, r: 2.2 },   // 14
  ]
  const edges = [
    [0,1],[0,9],[0,13],[0,14],[0,5],
    [1,2],[1,10],[1,9],[2,11],[2,3],
    [3,4],[3,11],[4,5],[5,6],[5,13],
    [6,7],[6,12],[7,8],[7,12],[8,9],
    [13,14],[9,8],
  ]
  return (
    <svg
      aria-hidden
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid meet"
      style={{ opacity: 0.065 }}
    >
      <defs>
        <radialGradient id="const-core-g" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#DC321E" stopOpacity="1" />
          <stop offset="100%" stopColor="#DC321E" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Edges */}
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].x} y1={nodes[a].y}
          x2={nodes[b].x} y2={nodes[b].y}
          stroke="#DC321E"
          strokeWidth="0.8"
          strokeOpacity="0.6"
        />
      ))}
      {/* Nodes */}
      {nodes.map((n, i) => (
        <circle
          key={i}
          cx={n.x} cy={n.y} r={n.r}
          fill="#DC321E"
          fillOpacity={i === 0 ? 0.9 : 0.55}
        />
      ))}
      {/* Core glow halo */}
      <circle cx={400} cy={280} r={18} fill="url(#const-core-g)" opacity="0.5" />
    </svg>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// FRAME 01 · GENESIS
// Family.co minimal white — 20% left/right breathing room, constellation bg
// ══════════════════════════════════════════════════════════════════════════════
function Frame01Genesis() {
  const { startMining } = useSparkle()
  const router = useRouter()

  function handleStartMining() {
    startMining()
    router.push('/parent')
  }

  return (
    <section
      className="relative flex flex-col items-center justify-center min-h-screen text-center overflow-hidden"
      style={{ background: '#FFFFFF', paddingTop: '5rem', paddingLeft: '20%', paddingRight: '20%' }}>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: EASE }}
        className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[16px] font-medium mb-6"
        style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)', color: MUTED }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: V }} />
        AI-DePIN Education Protocol · Genesis
      </motion.div>

      {/* ── Title — Sparkle / Protocol — layered stack ── */}
      <div className="relative z-10 mb-14 flex flex-col items-center">

        {/* Sparkle — top layer, vermilion, raised, physically fattened (+6%) */}
        <motion.div
          initial={{ opacity: 0, y: 38 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.18, ease: EASE }}
          style={{ position: 'relative', zIndex: 2, transform: 'translateY(-20px)' }}>
          <span
            className="block leading-[1]"
            style={{
              fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
              fontSize: 'clamp(93px, 13.8vw, 170px)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: '#DC321E',
              textShadow: '1px 0 0 #DC321E, -1px 0 0 #DC321E, 0 1px 0 rgba(220,50,30,0.45)',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.10))',
            }}>
            Sparkle
          </span>
        </motion.div>

        {/* Protocol — base layer, slate graphite, airy tracking, touch-not-overlap */}
        <motion.div
          initial={{ opacity: 0, y: 38 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.30, ease: EASE }}
          style={{ position: 'relative', zIndex: 1, marginTop: 'clamp(-16px, -1.6vw, -24px)' }}>
          <span
            className="block leading-[1.1]"
            style={{
              fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
              fontStyle: 'italic',
              fontSize: 'clamp(62px, 9.6vw, 115px)',
              fontWeight: 700,
              letterSpacing: 'calc(-0.01em + 0.1rem)',
              color: '#1F2937',
            }}>
            Protocol
          </span>
        </motion.div>
      </div>

      {/* Core copy — Inter, #4B5563, breathing space below title stack */}
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.44 }}
        className="relative z-10 max-w-md mb-12"
        style={{
          fontFamily: '"Inter", var(--font-geist-sans), system-ui, sans-serif',
          fontSize: '21px',
          fontWeight: 400,
          lineHeight: 1.6,
          letterSpacing: '-0.01em',
          color: '#4B5563',
        }}>
        A sovereign protocol where human wisdom powers AI,
        and AI works for your future.
      </motion.p>

      {/* Pill buttons */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.56, ease: EASE }}
        className="relative z-10 flex flex-wrap gap-3 justify-center">
        <button
          onClick={handleStartMining}
          className="inline-flex items-center px-6 py-2.5 rounded-full text-[13px] font-semibold text-white"
          style={{ background: '#111111', letterSpacing: '-0.01em', border: 'none', cursor: 'pointer' }}>
          Start Mining
        </button>
        <Link href="/student"
          className="inline-flex items-center px-6 py-2.5 rounded-full text-[13px] font-semibold"
          style={{
            background: 'transparent',
            border: '1px solid rgba(17,24,39,0.18)',
            color: '#111111',
            letterSpacing: '-0.01em',
          }}>
          Enter Knowledge Graph
        </Link>
      </motion.div>

    </section>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// FRAME 02 · THE FUEL — DePIN compute → amber amber
// ══════════════════════════════════════════════════════════════════════════════
function Frame02Fuel() {
  const { state } = useSparkle()
  const credits = state.isMining ? state.credits : 12.4286

  return (
    <section className="py-28 px-6 relative overflow-hidden" style={{ background: '#FFFFFF' }}>
      {/* ── Frame 02 · Amber halo — Parent / DePIN fuel ── */}
      <Halo color={AMBER} top="-15%" right="-8%" size="72vw" opacity={0.08} />
      <Halo color={AMBER} top="40%" right="55%" size="45vw" opacity={0.04} />

      <div className="max-w-[1440px] mx-auto px-[12%] relative z-10">
        <FadeUp className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-black mb-7"
            style={{ fontFamily: 'var(--font-playfair)', color: TEXT }}>
            Compute{' '}
            <span style={{ color: GOLD }}>into</span>
            {' '}tuition.
            <br /><span className="italic" style={{ color: GOLD }}>Automatically.</span>
          </h2>
          <p className="mx-auto"
            style={{
              fontFamily: '"Inter", var(--font-geist-sans), system-ui, sans-serif',
              fontSize: '20px',
              fontWeight: 400,
              lineHeight: 1.6,
              letterSpacing: '-0.01em',
              color: '#4B5563',
            }}>
            Let your idle computer save for your child&apos;s future, every single day.
          </p>
        </FadeUp>

        {/* ── Two cards, forced equal height, top-aligned ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">

          {/* Card 1 — The Engine: hardware contribution + narrative */}
          <FadeUp delay={0.1} style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="rounded-2xl p-7 flex-1 flex flex-col" style={{ ...GLASS, borderTopColor: `${GOLD}55` }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[9px] tracking-[0.26em] uppercase font-semibold mb-0.5"
                    style={{ color: '#9CA3AF' }}>Node Activity</p>
                  <p className="text-base font-bold" style={{ color: TEXT }}>CPU Hashrate</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold"
                  style={{ background: `${GOLD}16`, color: GOLD }}>
                  <motion.span className="w-1.5 h-1.5 rounded-full block"
                    style={{ background: GOLD }}
                    animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
                  Live
                </div>
              </div>
              <Sparkline pts={HASH_PTS} color={GOLD} h={64} />
              <div className="grid grid-cols-3 gap-3 mt-5">
                {[{l:'Compute',v:'94.2 GFLOPS'},{l:'Minted',v:'12.4 $SPK'},{l:'Uptime',v:'99.4%'}].map(s => (
                  <div key={s.l} className="rounded-xl p-3 text-center"
                    style={{ background: 'rgba(0,0,0,0.025)', border: '1px solid rgba(0,0,0,0.04)' }}>
                    <p className="text-[9px] uppercase tracking-wide mb-1"
                      style={{ color: '#4B5563', fontFamily: '"Inter", system-ui, sans-serif' }}>{s.l}</p>
                    <p className="font-bold text-sm" style={{ color: TEXT }}>{s.v}</p>
                  </div>
                ))}
              </div>
              {/* Narrative box — amber bg, two-line split, centred */}
              <div className="mt-5 rounded-xl px-4 py-5"
                style={{ background: `${GOLD}0C`, border: `1px solid ${GOLD}22`, textAlign: 'center' }}>
                <p style={{
                  fontFamily: '"Inter", var(--font-geist-sans), system-ui, sans-serif',
                  fontSize: '12px',
                  fontWeight: 400,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.5,
                  color: '#4B5563',
                }}>
                  ✦&ensp;Your idle compute has been converted<br />
                  into today&apos;s{' '}
                  <span style={{ fontWeight: 600, color: TEXT }}>Quantum Physics</span>{' '}
                  lesson credit for Emma.
                </p>
              </div>
            </div>
          </FadeUp>

          {/* Card 2 — Asset & Seed Ledger: pure yield display */}
          <FadeUp delay={0.16}>
            <div className="rounded-2xl p-7 flex flex-col h-full"
              style={{ ...GLASS, borderTopColor: `${GOLD}55` }}>
              <p className="text-[9px] tracking-[0.26em] uppercase font-semibold mb-0.5"
                style={{ color: '#9CA3AF' }}>Credit Generator</p>
              <p className="text-base font-bold mb-5" style={{ color: TEXT }}>Earned today</p>
              <CreditTicker credits={credits} />
              <p className="text-[11px] mt-1 mb-6 font-mono" style={{ color: '#9CA3AF' }}>$SPK</p>

              {/* Claimed seed asset rows */}
              <p className="text-[9px] tracking-[0.18em] uppercase mb-3"
                style={{ color: '#9CA3AF', fontFamily: '"Inter", system-ui, sans-serif' }}>
                Claimed Seeds
              </p>
              <div className="flex flex-col gap-3">
                {[
                  { initials: EXPERT_THEME.initials, bg: EXPERT_THEME.color, name: EXPERT_ID, asset: 'Segment Diagram · Master', yield: '+0.8 SPRK' },
                  { initials: 'DAD', bg: '#DC321E', name: 'Expert-DAD0824',  asset: 'Wisdom Galaxy', yield: '+0.4 SPRK' },
                ].map(row => (
                  <div key={row.initials}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                    style={{ background: 'rgba(0,0,0,0.025)', border: '1px solid rgba(0,0,0,0.05)' }}>
                    {/* Seed icon */}
                    <span style={{ fontSize: '14px', flexShrink: 0, lineHeight: 1 }}>🌱</span>
                    {/* Circle avatar */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: row.bg }}>
                      <span style={{
                        fontFamily: '"Inter", system-ui, sans-serif',
                        fontSize: '10px',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        letterSpacing: '0.02em',
                      }}>{row.initials}</span>
                    </div>
                    {/* Name + asset */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <span style={{
                        fontFamily: '"Inter", system-ui, sans-serif',
                        fontSize: '12px',
                        fontWeight: 500,
                        letterSpacing: '-0.01em',
                        color: TEXT,
                        lineHeight: 1.3,
                      }}>{row.name}</span>
                      <span style={{
                        fontFamily: '"Inter", system-ui, sans-serif',
                        fontSize: '10px',
                        fontWeight: 300,
                        letterSpacing: '0.01em',
                        color: '#9CA3AF',
                        lineHeight: 1.3,
                      }}>{row.asset}</span>
                    </div>
                    {/* Yield — right-aligned, bold */}
                    <span style={{
                      fontFamily: '"Inter", system-ui, sans-serif',
                      fontSize: '13px',
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                      color: GOLD,
                      flexShrink: 0,
                    }}>{row.yield}</span>
                  </div>
                ))}
              </div>

              {/* Progress bar — Next chapter / Emma */}
              <div className="mt-auto pt-5">
                <div className="h-1.5 rounded-full overflow-hidden mb-1.5"
                  style={{ background: 'rgba(0,0,0,0.06)' }}>
                  <motion.div className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${GOLD}, #FFD740)` }}
                    initial={{ width: '0%' }} whileInView={{ width: '68%' }}
                    viewport={{ once: true }} transition={{ duration: 1.3, delay: 0.5, ease: 'easeOut' }} />
                </div>
                <div className="flex justify-between text-[10px]" style={{ color: '#D1D5DB' }}>
                  <span>Next chapter: Quantum Physics · Emma</span>
                  <span className="font-mono">68%</span>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// FRAME 03 · THE BRAIN — Wisdom Galaxy
// Organic node positions (random offsets break the star symmetry)
// Hair-thin gravity edges, flowing particles, bloom diffusion on white
// ══════════════════════════════════════════════════════════════════════════════

const GCX = 240, GCY = 196

// ── Organic, asymmetric node positions — NOT a regular polygon ────────────────
const GALAXY_NODES = [
  // Inner tier — slightly off-center, irregular angles
  { id:'g0',  dx:  14,  dy: -68,  r: 7,   color: '#6366F1', label: 'Logic Kernel',  dur: 2.4 },
  { id:'g1',  dx:  58,  dy:  26,  r: 6,   color: '#10B981', label: 'Inquiry',       dur: 3.1 },
  { id:'g2',  dx: -63,  dy:  40,  r: 6,   color: '#F59E0B', label: 'Dialectics',    dur: 3.7 },
  // Second tier — broken from hexagon regularity
  { id:'g3',  dx: -12,  dy:-116,  r: 5.5, color: '#3B82F6', label: 'Deduction',     dur: 2.8 },
  { id:'g4',  dx:  96,  dy:  46,  r: 5,   color: '#8B5CF6', label: 'Synthesis',     dur: 3.3 },
  { id:'g5',  dx: -90,  dy:  64,  r: 5,   color: '#06B6D4', label: 'Context',       dur: 4.2 },
  { id:'g6',  dx:  86,  dy: -64,  r: 4.5, color: '#EC4899', label: 'Analysis',      dur: 3.6 },
  { id:'g7',  dx:-104,  dy: -46,  r: 4.5, color: '#A78BFA', label: 'Metacognition', dur: 2.9 },
  // Outer orbit — irregular radii and angles, no two the same distance
  { id:'g8',  dx:  18,  dy:-156,  r: 5,   color: '#F472B6', label: 'Quantum',       dur: 5.1 },
  { id:'g9',  dx: 138,  dy: -62,  r: 4.5, color: '#34D399', label: 'Philosophy',    dur: 4.5 },
  { id:'g10', dx: 128,  dy:  86,  r: 4.5, color: '#60A5FA', label: 'Mathematics',   dur: 4.2 },
  { id:'g11', dx: -22,  dy: 150,  r: 5,   color: '#FBBF24', label: 'Ethics',        dur: 3.8 },
  { id:'g12', dx:-140,  dy:  60,  r: 4.5, color: '#C084FC', label: 'Logic DNA',     dur: 5.6 },
  { id:'g13', dx:-116,  dy: -94,  r: 4.5, color: '#4ADE80', label: 'Creativity',    dur: 4.9 },
]

const GALAXY_EDGES = [
  [0,1],[1,2],[2,0],
  [0,3],[0,6],[0,7],
  [1,4],[1,10],[2,5],[2,12],
  [3,8],[4,9],[4,10],[5,11],[6,9],[7,13],
  [8,9],[9,10],[10,11],[11,12],[12,13],[13,8],
]

// Quadratic bezier pulled toward galaxy center (gravity curvature)
function gravPath(ax: number, ay: number, bx: number, by: number) {
  const mx = (ax + bx) / 2, my = (ay + by) / 2
  const pull = 0.16
  return `M ${rd(ax)},${rd(ay)} Q ${rd(mx + (GCX - mx) * pull)},${rd(my + (GCY - my) * pull)} ${rd(bx)},${rd(by)}`
}

function WisdomGalaxy() {
  const ref   = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <div ref={ref}>
      <svg viewBox="0 0 480 392" className="w-full" style={{ maxHeight: 374, overflow: 'visible' }}>
        <defs>
          {/* Bloom filter for node glow */}
          <filter id="wg-bloom" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="9" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="wg-bloom-sm" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Ambient indigo radial behind center */}
          <radialGradient id="wg-amb" cx="50%" cy="50%">
            <stop offset="0%"   stopColor={IND} stopOpacity="0.07" />
            <stop offset="100%" stopColor={IND} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient haze */}
        <ellipse cx={GCX} cy={GCY} rx={205} ry={172} fill="url(#wg-amb)" />

        {/* Faint orbit guide rings — dashed, very low opacity */}
        {[68, 112, 155].map((r, i) => (
          <circle key={i} cx={GCX} cy={GCY} r={r}
            fill="none"
            stroke={`rgba(99,102,241,${0.055 - i * 0.012})`}
            strokeWidth={0.7}
            strokeDasharray={i === 0 ? '3 8' : i === 1 ? '5 13' : '8 20'} />
        ))}

        {/* Slowly orbiting outer micro-particles */}
        <motion.g
          style={{ transformOrigin: `${GCX}px ${GCY}px` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 88, repeat: Infinity, ease: 'linear' }}>
          {[0,52,108,165,222,288].map((a, i) => {
            const rad = (a * Math.PI) / 180
            return (
              <circle key={i}
                cx={rd(GCX + 188 * Math.cos(rad))} cy={rd(GCY + 188 * Math.sin(rad))}
                r={1.4} fill={GALAXY_NODES[i * 2].color} opacity={0.32} />
            )
          })}
        </motion.g>

        {/* Counter-rotating inner dust ring */}
        <motion.g
          style={{ transformOrigin: `${GCX}px ${GCY}px` }}
          animate={{ rotate: -360 }}
          transition={{ duration: 130, repeat: Infinity, ease: 'linear' }}>
          {[18,74,138,200,258,314].map((a, i) => {
            const rad = (a * Math.PI) / 180
            return (
              <circle key={i}
                cx={rd(GCX + 118 * Math.cos(rad))} cy={rd(GCY + 118 * Math.sin(rad))}
                r={1} fill={GALAXY_NODES[(i + 1) * 2 % 14].color} opacity={0.20} />
            )
          })}
        </motion.g>

        {/* Scatter dust — static background micro-stars */}
        {([
          [22,16,'#6366F1'],[76,10,'#10B981'],[152,8,'#F59E0B'],[312,12,'#3B82F6'],
          [408,24,'#EC4899'],[456,60,'#8B5CF6'],[14,74,'#F472B6'],[50,90,'#34D399'],
          [386,78,'#60A5FA'],[442,110,'#A78BFA'],[8,158,'#06B6D4'],[460,164,'#FBBF24'],
          [452,202,'#C084FC'],[16,248],[46,268,'#4ADE80'],[394,254,'#6366F1'],
          [446,282,'#F59E0B'],[26,338],[146,362,'#10B981'],[296,356,'#3B82F6'],
          [416,344,'#EC4899'],[200,18,'#8B5CF6'],[354,22,'#F472B6'],
        ] as (number|string)[][]).map(([x,y,c],i) => (
          <circle key={i} cx={Number(x)} cy={Number(y)} r={0.85}
            fill={String(c || '#6366F1')} opacity={0.16} />
        ))}

        {/* ── Gravity edges — hair-thin, curved, very low opacity ── */}
        {GALAXY_EDGES.map(([ai, bi], i) => {
          const a = GALAXY_NODES[ai], b = GALAXY_NODES[bi]
          const ax = GCX + a.dx, ay = GCY + a.dy
          const bx = GCX + b.dx, by = GCY + b.dy
          return (
            <motion.path key={i}
              d={gravPath(ax, ay, bx, by)}
              fill="none"
              stroke={a.color}
              strokeWidth={0.55}
              strokeOpacity={0.18}
              initial={{ pathLength: 0 }}
              animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 1.0, delay: 0.12 + i * 0.05, ease: 'easeInOut' }} />
          )
        })}

        {/* ── Flowing knowledge particles along edges ── */}
        {GALAXY_EDGES.slice(0, 14).map(([ai, bi], i) => {
          const a = GALAXY_NODES[ai], b = GALAXY_NODES[bi]
          const sx = rd(GCX + a.dx), sy = rd(GCY + a.dy)
          const ex = rd(GCX + b.dx), ey = rd(GCY + b.dy)
          return (
            <motion.circle key={`pf${i}`} r={1.3} fill={a.color} opacity={0.65}
              animate={{ cx: [sx, ex, sx], cy: [sy, ey, sy] }}
              transition={{ duration: 3.4 + i * 0.2, repeat: Infinity, delay: i * 0.24, ease: 'easeInOut' }} />
          )
        })}

        {/* ── Diffuse bloom behind each node (on white: looks like colored glow) ── */}
        {GALAXY_NODES.map((node, i) => {
          const sx = GCX + node.dx, sy = GCY + node.dy
          return (
            <circle key={`bloom${i}`}
              cx={rd(sx)} cy={rd(sy)}
              r={node.r * 6}
              fill={node.color}
              opacity={0.065}
              style={{ filter: 'blur(11px)' }} />
          )
        })}

        {/* Center bloom */}
        <circle cx={GCX} cy={GCY} r={38} fill={IND} opacity={0.09}
          style={{ filter: 'blur(18px)' }} />

        {/* ── Center CORE node ── */}
        <motion.g
          filter="url(#wg-bloom)"
          initial={{ scale: 0 }} animate={inView ? { scale: 1 } : { scale: 0 }}
          transition={{ duration: 0.75, ease: EASE }}
          style={{ transformOrigin: `${GCX}px ${GCY}px` }}>
          <motion.circle cx={GCX} cy={GCY} fill={IND} fillOpacity={0.11}
            initial={{ r: 22 }}
            animate={{ r: [22, 30, 22] }} transition={{ duration: 3.2, repeat: Infinity }} />
          <circle cx={GCX} cy={GCY} r={12} fill={IND} />
          <text x={GCX} y={GCY + 1} textAnchor="middle" dominantBaseline="middle"
            fontSize={5.5} fontWeight="900" fill="white" letterSpacing="0.06em">CORE</text>
        </motion.g>

        {/* ── Knowledge nodes ── */}
        {GALAXY_NODES.map((node, i) => {
          const sx = rd(GCX + node.dx), sy = rd(GCY + node.dy)
          return (
            <motion.g key={node.id} filter="url(#wg-bloom-sm)"
              initial={{ scale: 0, opacity: 0 }}
              animate={inView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.48, delay: 0.1 + i * 0.06, ease: EASE }}
              style={{ transformOrigin: `${sx}px ${sy}px` }}>
              {/* Breathing outer ring */}
              <motion.circle cx={sx} cy={sy}
                fill="none" stroke={node.color} strokeWidth={0.7}
                initial={{ r: node.r + 5, strokeOpacity: 0.22 }}
                animate={{ r: [node.r+5, node.r+14, node.r+5], strokeOpacity: [0.22, 0, 0.22] }}
                transition={{ duration: node.dur, repeat: Infinity, delay: i * 0.28 }} />
              {/* Node body */}
              <circle cx={sx} cy={sy} r={node.r} fill={node.color} opacity={0.90} />
              {/* Label */}
              <text x={sx} y={sy + node.r + 11} textAnchor="middle"
                fontSize={6.2} fontWeight="700" fill={node.color} fillOpacity={0.72}>
                {node.label}
              </text>
            </motion.g>
          )
        })}
      </svg>
    </div>
  )
}

function Frame03Brain() {
  // ── Yield Analytics bar chart data — 7 days ──────────────────────────────
  const DAYS  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const CHART = [
    { c: 35, s: 18, v: 12 }, { c: 42, s: 24, v: 16 }, { c: 38, s: 20, v: 14 },
    { c: 55, s: 32, v: 22 }, { c: 50, s: 28, v: 18 }, { c: 60, s: 38, v: 26 },
    { c: 68, s: 44, v: 30 },
  ]
  const CW = 260, CH = 66, BAR_AREA = CH - 14, MAX = 80
  const groupW = CW / 7
  const BW = 6, GAP = 2, SPAN = 3 * BW + 2 * GAP
  // ── Financial monochrome palette — slate/gray series ──
  const G_A = '#1F2937', G_B = '#6B7280', G_C = '#D1D5DB'

  // ── 8-axis Pedagogical Radial Hub — Logic Fingerprint ────────────────────
  const HUB_AXES = [
    { label: 'ZPD',      score: 94 },
    { label: 'Feedback', score: 87 },
    { label: 'Cycles',   score: 73 },
    { label: 'Logic',    score: 88 },
    { label: 'Scaffold', score: 91 },
    { label: 'Analogy',  score: 85 },
    { label: 'Meta',     score: 79 },
    { label: 'Engage',   score: 96 },
  ]
  // ── Logic DNA label map — human-readable marker names ─────────────────────
  const DNA_LABELS: Record<string, string> = {
    ZPD:      'ZPD Deviation',
    Feedback: 'Feedback Loop',
    Cycles:   'Cycle Depth',
    Logic:    'Logic Index',
    Scaffold: 'Scaffold Rate',
    Analogy:  'Analogy Link',
    Meta:     'Meta-Cogn.',
    Engage:   'Engagement',
  }

  return (
    <section className="py-24 px-6 relative overflow-hidden" style={{ background: '#FFFFFF' }}>

      {/* ── Wisdom-green aura layer — mirrors frame-level visual grammar ── */}
      <BreathingGlow color={GREEN} top="-20%" right="-8%"  size="70vw" peakOpacity={0.06} delay={0}   />
      <BreathingGlow color={GREEN} top="50%"  right="90%"  size="58vw" peakOpacity={0.05} delay={2.2} />
      <Halo          color={GREEN} top="62%"  right="32%"  size="48vw" opacity={0.035}                />

      <div className="max-w-[1440px] mx-auto px-[12%] relative z-10">

        {/* Header */}
        <FadeUp className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-black mb-7"
            style={{ fontFamily: 'var(--font-playfair)', color: TEXT }}>
            Expertise{' '}
            <span style={{ color: GREEN }}>commands</span>
            {' '}Equity.
            <br /><span className="italic" style={{ color: GREEN }}>Sustainably.</span>
          </h2>
          <p style={{
            fontFamily: '"Inter", var(--font-geist-sans), system-ui, sans-serif',
            fontSize: '20px', fontWeight: 400, lineHeight: 1.6,
            letterSpacing: '-0.01em', color: '#4B5563',
          }}>
            Turn your lifetime of wisdom into a &ldquo;digital asset&rdquo; that earns for you.
          </p>
        </FadeUp>

        {/* ── 2-col: Logic Factory (left) | Analytics + Portfolio (right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

          {/* ── LEFT COLUMN — merged full-height Logic Factory ── */}
          <FadeUp delay={0.08}>
            <div className="rounded-2xl p-5 h-full flex flex-col"
              style={{ ...GLASS, borderTopColor: `${GREEN}55` }}>

              {/* ═══ TOP HALF: Content Ingestion & Parsing ═══ */}
              <div className="flex items-center gap-2 mb-4">
                <p className="text-[9px] uppercase tracking-[0.22em] font-semibold"
                  style={{ color: '#4B5563' }}>Content Ingestion &amp; Parsing</p>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full ml-auto"
                  style={{ background: `${GREEN}12`, border: `1px solid ${GREEN}30` }}>
                  <motion.span className="w-1.5 h-1.5 rounded-full block" style={{ background: GREEN }}
                    animate={{ opacity: [1, 0.15, 1] }} transition={{ duration: 1.0, repeat: Infinity }} />
                  <span style={{ fontSize: '9px', fontWeight: 700, color: GREEN, letterSpacing: '0.08em' }}>ACTIVE</span>
                </div>
              </div>

              {/* File icons — neutral grey background, dark readable filenames */}
              <div className="relative rounded-xl overflow-hidden mb-3 py-3 px-2"
                style={{ background: '#F9FAFB', border: '1px solid rgba(0,0,0,0.08)' }}>
                <div className="flex justify-around items-start">
                  {[
                    { icon: '🎥', name: 'Lecture_Math.mp4',   type: 'Video'    },
                    { icon: '📄', name: 'Pedagogy_Notes.pdf',  type: 'Document' },
                    { icon: '📋', name: 'Framework_Q2.docx',   type: 'Notes'    },
                  ].map(f => (
                    <div key={f.type} className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                        style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.10)' }}>
                        {f.icon}
                      </div>
                      <span style={{
                        fontSize: '7px', color: '#1F2937', textAlign: 'center',
                        fontFamily: '"SF Mono","Fira Code",monospace', lineHeight: 1.3,
                        maxWidth: '56px', overflow: 'hidden', textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap', fontWeight: 500,
                      }}>{f.name}</span>
                    </div>
                  ))}
                </div>
                {/* Horizontal scan beam — stays GREEN as visual anchor */}
                <motion.div
                  className="absolute inset-y-0 w-10 pointer-events-none"
                  style={{ background: `linear-gradient(90deg, transparent, ${GREEN}50, ${GREEN}80, ${GREEN}50, transparent)` }}
                  animate={{ x: ['-40px', '300px'] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'linear', repeatDelay: 0.5 }} />
              </div>

              {/* Metadata stream — neutral bg */}
              <div className="rounded-lg px-3 py-2 mb-3"
                style={{ background: '#F9FAFB', border: '1px solid rgba(0,0,0,0.07)' }}>
                <motion.p
                  style={{ fontSize: '9px', color: '#6B7280',
                    fontFamily: '"SF Mono","Fira Code",monospace',
                    letterSpacing: '-0.01em', lineHeight: 1.4 }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
                  Parsing Pedagogical Logic: Scaffolding Index @ 0.98&hellip;
                </motion.p>
              </div>

              {/* ── Horizontal divider ── */}
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.07)', marginBottom: '1.1rem' }} />

              {/* ═══ Integrated Pedagogical Analysis ═══ */}
              <p className="text-[9px] uppercase tracking-[0.22em] font-semibold mb-2.5"
                style={{ color: '#4B5563' }}>Integrated Pedagogical Analysis</p>

              {/* ── Single merged analysis block: verdict conclusion + DNA data ── */}
              <div className="rounded-xl p-3 flex-1"
                style={{ background: '#F9FAFB', border: '1px solid rgba(0,0,0,0.08)' }}>

                {/* — Verdict header — */}
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ fontSize: '13px' }}>🏅</span>
                  <p style={{ fontSize: '9px', fontWeight: 700, color: '#4B5563',
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    fontFamily: '"Inter", system-ui, sans-serif' }}>AI Logic Verdict</p>
                </div>

                {/* — Signature text — */}
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#1F2937',
                  fontFamily: '"Inter", system-ui, sans-serif', letterSpacing: '-0.01em',
                  lineHeight: 1.5, marginBottom: '9px' }}>
                  Pedagogical Signature: High-Order Cognitive Scaffolding.
                </p>

                {/* — Pill badges — */}
                <div className="flex flex-wrap gap-2">
                  {['Logic Decomposition', 'Analogy Logic', 'ZPD Precision'].map(s => (
                    <div key={s} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{ border: '1px solid rgba(0,0,0,0.10)', background: 'rgba(0,0,0,0.02)' }}>
                      <span style={{ fontSize: '9px', color: GREEN, flexShrink: 0, lineHeight: 1 }}>✓</span>
                      <span style={{ fontSize: '9.5px', color: '#374151', lineHeight: 1,
                        fontFamily: '"Inter", system-ui, sans-serif',
                        letterSpacing: '-0.01em' }}>{s}</span>
                    </div>
                  ))}
                </div>

                {/* — Inner divider separating conclusion from raw data — */}
                <div style={{ borderTop: '1px solid rgba(0,0,0,0.065)', margin: '10px 0' }} />

                {/* — DNA data subheader — */}
                <p style={{ fontSize: '8px', color: '#9CA3AF', letterSpacing: '0.06em',
                  fontFamily: '"Inter", system-ui, sans-serif', marginBottom: '7px' }}>
                  8 ACTIVE MARKERS · LOGIC DNA
                </p>

                {/* — 2×4 DNA marker grid — */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                  {HUB_AXES.map((ax, i) => (
                    <motion.div
                      key={ax.label}
                      initial={{ opacity: 0, y: 4 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.22, delay: 0.05 + i * 0.04, ease: EASE }}
                      style={{ position: 'relative', background: '#F0F1F3',
                        borderRadius: '5px', padding: '5px 8px 8px', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{ width: '5px', height: '5px', borderRadius: '50%',
                          background: GREEN, flexShrink: 0, boxShadow: `0 0 5px ${GREEN}88` }} />
                        <span style={{ flex: 1, fontSize: '8.5px', fontWeight: 500, color: '#4B5563',
                          fontFamily: '"Inter", system-ui, sans-serif', letterSpacing: '-0.01em',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {DNA_LABELS[ax.label]}
                        </span>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: GREEN,
                          fontFamily: '"SF Mono","Fira Code",monospace',
                          letterSpacing: '-0.02em', flexShrink: 0 }}>
                          {ax.score}%
                        </span>
                      </div>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0,
                        height: '2px', background: 'rgba(0,0,0,0.06)' }}>
                        <motion.div
                          style={{ height: '100%', background: GREEN, borderRadius: '0 1px 1px 0' }}
                          initial={{ width: '0%' }}
                          whileInView={{ width: `${ax.score}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.65, delay: 0.12 + i * 0.05, ease: 'easeOut' }} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

            </div>
          </FadeUp>

          {/* ── RIGHT COLUMN — Yield Analytics + Minted Assets ── */}
          <FadeUp delay={0.18} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
            <div className="rounded-2xl p-4 flex flex-col"
              style={{ ...GLASS, borderTopColor: `${GREEN}55` }}>

              {/* Header row with legend */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.22em] font-semibold mb-0.5"
                    style={{ color: '#4B5563' }}>Yield Analytics</p>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: TEXT,
                    fontFamily: '"Inter", system-ui, sans-serif' }}>SPRK · Last 7 Days</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  {[
                    { label: 'Copyright',   color: G_A },
                    { label: 'Seeds',       color: G_B },
                    { label: 'Invocations', color: G_C },
                  ].map(leg => (
                    <div key={leg.label} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-sm flex-shrink-0"
                        style={{ background: leg.color }} />
                      <span style={{ fontSize: '8px', color: '#6B7280',
                        fontFamily: '"Inter", system-ui, sans-serif' }}>{leg.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SVG bar chart */}
              <svg viewBox={`0 0 ${CW} ${CH}`} width="100%" style={{ overflow: 'visible' }}>
                {/* Faint horizontal grid lines */}
                {[20, 40, 60, 80].map(v => (
                  <line key={v}
                    x1={0} y1={BAR_AREA - v * BAR_AREA / MAX}
                    x2={CW} y2={BAR_AREA - v * BAR_AREA / MAX}
                    stroke="rgba(0,0,0,0.045)" strokeWidth={0.6} />
                ))}

                {CHART.map((d, gi) => {
                  const cx  = (gi + 0.5) * groupW
                  const sx  = cx - SPAN / 2
                  const hA  = d.c / MAX * BAR_AREA
                  const hB  = d.s / MAX * BAR_AREA
                  const hC  = d.v / MAX * BAR_AREA
                  return (
                    <g key={gi}>
                      {/* Copyright bar — dark green */}
                      <motion.rect x={sx} width={BW} rx={1.5} fill={G_A}
                        initial={{ height: 0, y: BAR_AREA }}
                        whileInView={{ height: hA, y: BAR_AREA - hA }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.65, delay: gi * 0.055, ease: 'easeOut' }} />
                      {/* Seeds bar — mid green */}
                      <motion.rect x={sx + BW + GAP} width={BW} rx={1.5} fill={G_B}
                        initial={{ height: 0, y: BAR_AREA }}
                        whileInView={{ height: hB, y: BAR_AREA - hB }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.65, delay: gi * 0.055 + 0.04, ease: 'easeOut' }} />
                      {/* Invocations bar — light green */}
                      <motion.rect x={sx + 2 * (BW + GAP)} width={BW} rx={1.5} fill={G_C}
                        initial={{ height: 0, y: BAR_AREA }}
                        whileInView={{ height: hC, y: BAR_AREA - hC }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.65, delay: gi * 0.055 + 0.08, ease: 'easeOut' }} />
                      {/* Day label */}
                      <text x={cx} y={CH - 2} textAnchor="middle" fontSize={6.5}
                        fill="#9CA3AF" style={{ fontFamily: '"Inter",system-ui' }}>
                        {DAYS[gi]}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>

            {/* ── Minted Assets — financial statement view ── */}
            <div className="rounded-2xl p-5 flex-1 flex flex-col"
              style={{ ...GLASS, borderTopColor: `${GREEN}55` }}>
              <p className="text-[9px] uppercase tracking-[0.22em] font-semibold mb-3"
                style={{ color: '#4B5563' }}>Minted Assets</p>

              <div className="flex flex-col gap-3 flex-1">
                {[
                  { title: 'Relative Motion Logic',     tier: 'Master',   calls: '3,107 invocations' },
                  { title: 'Geometry Intuition Bridge', tier: 'Master',   calls: '1,894 invocations' },
                  { title: 'Proportional Reasoning',    tier: 'Advanced', calls: '892 invocations'   },
                ].map((chip, ci) => (
                  <motion.div key={chip.title}
                    initial={{ opacity: 0, x: 8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.28, delay: 0.1 + ci * 0.07, ease: EASE }}
                    className="flex items-center gap-3 px-3.5 py-3 rounded-xl flex-1"
                    style={{ background: `${GREEN}06`, border: `1px solid ${GREEN}1E` }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${GREEN}14` }}>
                      <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden>
                        <rect x="4.5" y="4.5" width="9" height="9" rx="1.5"
                          stroke={GREEN} strokeWidth="1.2" fill={`${GREEN}30`} />
                        <line x1="9"    y1="1"    x2="9"   y2="4.5"  stroke={GREEN} strokeWidth="1" strokeLinecap="round" />
                        <line x1="9"    y1="13.5" x2="9"   y2="17"   stroke={GREEN} strokeWidth="1" strokeLinecap="round" />
                        <line x1="1"    y1="9"    x2="4.5" y2="9"    stroke={GREEN} strokeWidth="1" strokeLinecap="round" />
                        <line x1="13.5" y1="9"    x2="17"  y2="9"    stroke={GREEN} strokeWidth="1" strokeLinecap="round" />
                        <circle cx="9" cy="9" r="1.8" fill={GREEN} />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: '11px', fontWeight: 600, color: TEXT,
                        letterSpacing: '-0.01em', lineHeight: 1.35,
                        fontFamily: '"Inter", system-ui, sans-serif' }}>{chip.title}</p>
                      <p style={{ fontSize: '9px', color: '#6B7280',
                        fontFamily: '"Inter", system-ui, sans-serif' }}>{chip.calls}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-semibold flex-shrink-0"
                      style={{ background: `${GREEN}14`, color: GREEN }}>{chip.tier}</span>
                  </motion.div>
                ))}
              </div>

              {/* ── Manage Wisdom Seeds — asset dashboard CTA ── */}
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: `0 8px 28px ${GREEN}44` }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 w-full rounded-full py-2.5 text-[12px] font-semibold"
                style={{ background: GREEN, border: `1.5px solid ${GREEN}`,
                  color: '#FFFFFF', fontFamily: '"Inter", system-ui, sans-serif',
                  letterSpacing: '-0.01em', cursor: 'pointer',
                  boxShadow: `0 4px 18px ${GREEN}30` }}>
                Manage Wisdom Seeds
              </motion.button>
            </div>

          </FadeUp>
        </div>
      </div>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// FRAME 04 · THE GROWTH — Bio-tech Neural Map
// Hair-thin edges (0.5px), click → ripple, unlocked → breathing glow
// ══════════════════════════════════════════════════════════════════════════════

const NEURAL_NODES = [
  { id:'n0',  x:192, y:102, s:9.5, label:'Origin',     cat:'core'     },
  { id:'n1',  x:114, y: 76, s:6.5, label:'Memory',     cat:'logic'    },
  { id:'n2',  x:212, y: 64, s:6,   label:'Language',   cat:'language' },
  { id:'n3',  x:268, y: 90, s:7,   label:'Analysis',   cat:'logic'    },
  { id:'n4',  x:150, y:132, s:7,   label:'Reasoning',  cat:'logic'    },
  { id:'n5',  x:224, y:138, s:6.5, label:'Synthesis',  cat:'logic'    },
  { id:'n6',  x:292, y:136, s:6,   label:'Spatial',    cat:'stem'     },
  { id:'n7',  x: 94, y:134, s:5.5, label:'Ethics',     cat:'human'    },
  { id:'n8',  x:176, y:172, s:6.5, label:'Creativity', cat:'human'    },
  { id:'n9',  x:250, y:176, s:6,   label:'Intuition',  cat:'human'    },
  { id:'n10', x:118, y:180, s:5.5, label:'Empathy',    cat:'human'    },
  { id:'n11', x:310, y:174, s:5,   label:'Precision',  cat:'stem'     },
]

const NEURAL_EDGES = [
  [0,1],[0,2],[0,3],[0,4],[0,5],
  [1,4],[1,7],[2,3],[2,5],[3,6],[3,11],
  [4,5],[4,8],[5,6],[5,9],[6,9],[6,11],
  [7,8],[7,10],[8,9],[8,10],[9,11],[10,8],
]

const CAT_COLOR: Record<string,string> = {
  core: BLUE, logic: '#3B82F6', language: GOLD, stem: V, human: '#8B5CF6',
}

type Ripple = { id: number; x: number; y: number; color: string }

function NeuralMap() {
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set(['n0']))
  const [ripples,  setRipples]  = useState<Ripple[]>([])
  const rippleCount = useRef(0)
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  function handleClick(node: typeof NEURAL_NODES[0]) {
    const willUnlock = !unlocked.has(node.id)
    setUnlocked(prev => {
      const next = new Set(prev)
      willUnlock ? next.add(node.id) : next.delete(node.id)
      return next
    })
    rippleCount.current += 1
    const rId   = rippleCount.current
    const color = willUnlock ? BLUE : V
    setRipples(prev => [...prev, { id: rId, x: node.x, y: node.y, color }])
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== rId)), 1400)
  }

  return (
    <div ref={ref}>
      <svg viewBox="0 0 390 255" className="w-full" style={{ maxHeight: 238 }}>
        <defs>
          <filter id="nm-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="nm-core-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="5.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ── Hair-thin edges — 0.5px unlit, 0.9px lit ── */}
        {NEURAL_EDGES.map(([ai, bi], i) => {
          const a   = NEURAL_NODES[ai], b = NEURAL_NODES[bi]
          const lit = unlocked.has(a.id) && unlocked.has(b.id)
          return (
            <motion.path key={i}
              d={`M ${a.x},${a.y} L ${b.x},${b.y}`}
              fill="none"
              stroke={lit ? BLUE : 'rgba(0,0,0,0.09)'}
              strokeWidth={lit ? 0.9 : 0.5}
              strokeDasharray={lit ? undefined : '3 5'}
              initial={{ pathLength: 0 }}
              animate={inView ? { pathLength: 1 } : {}}
              transition={{ duration: 0.75, delay: 0.18 + i * 0.04, ease: 'easeInOut' }}
              style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }} />
          )
        })}

        {/* ── Click ripple waves — AnimatePresence ── */}
        <AnimatePresence>
          {ripples.map(rip => (
            <motion.circle key={rip.id}
              cx={rip.x} cy={rip.y} r={4}
              fill="none" stroke={rip.color} strokeWidth={1.2}
              initial={{ r: 4, opacity: 0.75 }}
              animate={{ r: 40, opacity: 0 }}
              exit={{}}
              transition={{ duration: 1.3, ease: 'easeOut' }} />
          ))}
        </AnimatePresence>

        {/* ── Nodes ── */}
        {NEURAL_NODES.map((node, i) => {
          const isUnlocked = unlocked.has(node.id)
          const color      = CAT_COLOR[node.cat]
          const isCore     = node.id === 'n0'
          return (
            <motion.g key={node.id}
              filter={isCore ? 'url(#nm-core-glow)' : 'url(#nm-glow)'}
              initial={{ scale: 0, opacity: 0 }}
              animate={inView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.38, delay: 0.12 + i * 0.05, ease: EASE }}
              style={{ transformOrigin: `${node.x}px ${node.y}px`, cursor: 'pointer' }}
              onClick={() => handleClick(node)}>

              {/* Breathing pulse ring — only when unlocked */}
              {isUnlocked && (
                <motion.circle cx={node.x} cy={node.y} r={node.s + 5}
                  fill="none" stroke={color} strokeWidth={0.8}
                  initial={{ opacity: 0.28, r: node.s + 5 }}
                  animate={{ r: [node.s+5, node.s+14, node.s+5], opacity: [0.28, 0, 0.28] }}
                  transition={{ duration: 2.8, repeat: Infinity }} />
              )}

              {/* Node body */}
              <motion.circle cx={node.x} cy={node.y} r={node.s}
                fill={isUnlocked ? color : 'rgba(0,0,0,0.055)'}
                stroke={isUnlocked ? color : 'rgba(0,0,0,0.12)'}
                strokeWidth={isUnlocked ? 0 : 0.6}
                initial={{ opacity: 1 }}
                animate={isUnlocked ? { opacity: [0.78, 1, 0.78] } : { opacity: 1 }}
                transition={isUnlocked ? { duration: 2.6, repeat: Infinity, delay: i * 0.18 } : {}}
                style={{ filter: isUnlocked ? `drop-shadow(0 0 4px ${color}55)` : 'none' }} />

              {/* Label appears on unlock */}
              {isUnlocked && (
                <text x={node.x} y={node.y - node.s - 6}
                  textAnchor="middle" fontSize={6.2} fontWeight="700"
                  fill={color} style={{ pointerEvents: 'none' }}>{node.label}</text>
              )}
            </motion.g>
          )
        })}
      </svg>
      <p className="text-[9px] text-center mt-2" style={{ color: '#D1D5DB' }}>
        Click nodes to unlock cognitive pathways
      </p>
    </div>
  )
}

const FACULTY = [
  { name:EXPERT_ID,          domain:'Segment Logic',   calls:'9.2K',  color: EXPERT_THEME.color, emoji:'🧠' },
  { name:'Expert-OKO9988',   domain:'Quantum Physics', calls:'14.8K', color: V,                  emoji:'⚛️' },
  { name:'Expert-MHT5566',   domain:'Mathematics',     calls:'6.1K',  color: GOLD,               emoji:'∑'  },
  { name:'Expert-SVN8877',   domain:'Philosophy',      calls:'5.4K',  color: '#8B5CF6',          emoji:'φ'  },
  { name:'Expert-NKM7733',   domain:'AI Ethics',       calls:'8.7K',  color: TEAL,               emoji:'◈'  },
]

// ── Homepage CHC full dataset — mirrors student/page.tsx CHC_STRATUM exactly ──
const HP_CHC_STRATUM: { key:string; name:string; color:string; abilities:{ code:string; name:string; score:number }[] }[] = [
  { key:'Gf', name:'Fluid Intelligence', color:'#3B82F6', abilities:[
    { code:'I',   name:'Inductive Reasoning',       score:82 },
    { code:'RG',  name:'Deductive Reasoning',       score:78 },
    { code:'RQ',  name:'Quantitative Reasoning',    score:88 },
    { code:'RP',  name:'Piagetian Reasoning',       score:76 },
    { code:'CZ',  name:'Speed of Reasoning',        score:71 },
    { code:'CF',  name:'Flexibility of Closure',    score:79 },
    { code:'CS',  name:'Closure Speed',             score:73 },
    { code:'SS',  name:'Spatial Scanning',          score:84 },
  ]},
  { key:'Gc', name:'Crystallized Intelligence', color:'#10B981', abilities:[
    { code:'LD',  name:'Language Development',      score:85 },
    { code:'VL',  name:'Lexical Knowledge',         score:80 },
    { code:'LS',  name:'Listening Ability',         score:77 },
    { code:'K0',  name:'General Information',       score:83 },
    { code:'CM',  name:'Communication',             score:87 },
    { code:'KO',  name:'Oral Production',           score:74 },
    { code:'RC',  name:'Reading Comprehension',     score:78 },
    { code:'KS',  name:'General Science Info',      score:81 },
  ]},
  { key:'Gwm', name:'Working Memory', color:'#8B5CF6', abilities:[
    { code:'MS',  name:'Memory Span',               score:91 },
    { code:'WM',  name:'Working Memory Capacity',   score:88 },
    { code:'MW',  name:'Attentional Control',       score:84 },
    { code:'MI',  name:'Interference Resistance',   score:79 },
    { code:'AC',  name:'Cognitive Efficiency',      score:86 },
    { code:'AS',  name:'Attention Span',            score:82 },
    { code:'SE',  name:'Storage Efficiency',        score:90 },
    { code:'RT',  name:'Response Time',             score:77 },
  ]},
  { key:'Gv', name:'Visual-Spatial Processing', color:'#F59E0B', abilities:[
    { code:'SR',  name:'Spatial Relations',         score:94 },
    { code:'VZ',  name:'Visualization',             score:92 },
    { code:'MR',  name:'Mental Rotation',           score:89 },
    { code:'PI',  name:'Perceptual Integration',    score:76 },
    { code:'IL',  name:'Perceptual Illusions',      score:78 },
    { code:'PN',  name:'Perceptual Alternations',   score:82 },
    { code:'IM',  name:'Imagery',                   score:87 },
    { code:'LE',  name:'Length Estimation',         score:80 },
    { code:'FO',  name:'Figural Orientation',       score:85 },
  ]},
  { key:'Ga', name:'Auditory Processing', color:'#EC4899', abilities:[
    { code:'PC',  name:'Phonetic Coding',           score:71 },
    { code:'US',  name:'Sound Discrimination',      score:68 },
    { code:'UA',  name:'Resistance to Distortion',  score:74 },
    { code:'UM',  name:'Memory for Sound',          score:79 },
    { code:'UK',  name:'Temporal Tracking',         score:72 },
    { code:'UP',  name:'Pitch Discrimination',      score:65 },
    { code:'UL',  name:'Sound Localization',        score:67 },
    { code:'AT',  name:'Auditory Attention',        score:73 },
  ]},
  { key:'Glr', name:'Long-term Retrieval', color:'#06B6D4', abilities:[
    { code:'MA',  name:'Associative Memory',        score:86 },
    { code:'MM',  name:'Meaningful Memory',         score:83 },
    { code:'M6',  name:'Free Recall Memory',        score:79 },
    { code:'FI',  name:'Idea Fluency',              score:90 },
    { code:'FA',  name:'Associational Fluency',     score:85 },
    { code:'FE',  name:'Expressional Fluency',      score:88 },
    { code:'FW',  name:'Word Fluency',              score:82 },
    { code:'FF',  name:'Figural Fluency',           score:77 },
    { code:'FX',  name:'Figural Flexibility',       score:80 },
  ]},
  { key:'Gs', name:'Processing Speed', color:'#F97316', abilities:[
    { code:'P',   name:'Perceptual Speed',          score:95 },
    { code:'N',   name:'Number Facility',           score:91 },
    { code:'R9',  name:'Rate of Test Taking',       score:88 },
    { code:'R4',  name:'Reading Speed',             score:84 },
    { code:'Rt',  name:'Decision Speed',            score:89 },
    { code:'R7',  name:'Number Comparison',         score:92 },
    { code:'PAR', name:'Pattern Execution',         score:87 },
    { code:'PS',  name:'Psychomotor Speed',         score:80 },
  ]},
  { key:'Gq', name:'Quantitative Knowledge', color:'#10B981', abilities:[
    { code:'KM',  name:'Mathematical Knowledge',    score:89 },
    { code:'A3',  name:'Math Achievement',          score:92 },
    { code:'QR',  name:'Quantitative Reasoning',    score:87 },
    { code:'SQ',  name:'Statistical Reasoning',     score:81 },
    { code:'NR',  name:'Numerical Reasoning',       score:94 },
    { code:'AT2', name:'Applied Mathematics',       score:88 },
    { code:'ES',  name:'Estimation',                score:85 },
    { code:'PR',  name:'Proportional Reasoning',    score:90 },
  ]},
]

function buildHPRadarAngles() {
  const total = HP_CHC_STRATUM.reduce((s, g) => s + g.abilities.length, 0)
  const step = (2 * Math.PI) / total
  let idx = 0
  return HP_CHC_STRATUM.map(group => ({
    ...group,
    startIdx: (() => { const s = idx; idx += group.abilities.length; return s })(),
    abilities: group.abilities.map((ab, i) => ({
      ...ab,
      angle: -Math.PI / 2 + (idx - group.abilities.length + i) * step,
    })),
  }))
}

// ── CHCMap — full-fidelity 70-narrow-ability radar, mirrors student portal ────
function CHCMap() {
  const CX = 200, CY = 200, R_MAX = 132, R_LABEL = R_MAX + 18
  const groups = buildHPRadarAngles()
  const total  = groups.reduce((s, g) => s + g.abilities.length, 0)
  const step   = (2 * Math.PI) / total

  const allPts = groups.flatMap(g =>
    g.abilities.map(ab => {
      const r = R_MAX * ab.score / 100
      return `${(CX + r * Math.cos(ab.angle)).toFixed(1)},${(CY + r * Math.sin(ab.angle)).toFixed(1)}`
    })
  ).join(' ')

  function sectorPath(startAngle: number, endAngle: number, r: number) {
    const x1 = CX + r * Math.cos(startAngle), y1 = CY + r * Math.sin(startAngle)
    const x2 = CX + r * Math.cos(endAngle),   y2 = CY + r * Math.sin(endAngle)
    const large = endAngle - startAngle > Math.PI ? 1 : 0
    return `M ${CX},${CY} L ${x1},${y1} A ${r},${r} 0 ${large},1 ${x2},${y2} Z`
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
      <div style={{ flex: '0 0 60%', minWidth: 0 }}>
      <svg viewBox="0 0 400 400" width="100%" style={{ display: 'block' }}>
        {/* Concentric rings at 25 / 50 / 75 / 100 */}
        {[25, 50, 75, 100].map(p => (
          <circle key={p} cx={CX} cy={CY} r={R_MAX * p / 100}
            fill="none" stroke="#F3F4F6" strokeWidth={p === 100 ? 1 : 0.7} />
        ))}
        {/* Ring percentage labels */}
        {[50, 75, 100].map(p => (
          <text key={p} x={CX + 2} y={CY - R_MAX * p / 100 + 9}
            fontSize={6.5} fill="#9CA3AF" textAnchor="middle"
            style={{ fontFamily: 'system-ui' }}>{p}</text>
        ))}

        {/* Sector backgrounds */}
        {groups.map(group => {
          const first = group.abilities[0].angle - step / 2
          const last  = group.abilities[group.abilities.length - 1].angle + step / 2
          return (
            <path key={group.key}
              d={sectorPath(first, last, R_MAX)}
              fill={`${group.color}09`}
              stroke={`${group.color}22`} strokeWidth={0.7} />
          )
        })}

        {/* Spoke lines */}
        {groups.flatMap(g => g.abilities.map(ab => (
          <line key={`${g.key}-${ab.code}`}
            x1={CX} y1={CY}
            x2={Number((CX + R_MAX * Math.cos(ab.angle)).toFixed(1))}
            y2={Number((CY + R_MAX * Math.sin(ab.angle)).toFixed(1))}
            stroke={`${g.color}22`} strokeWidth={0.6} />
        )))}

        {/* Score polygon */}
        <polygon points={allPts} fill={`${BLUE}10`} stroke={BLUE} strokeWidth={1.2} />

        {/* Score dots — larger for top performers */}
        {groups.flatMap(group => group.abilities.map(ab => {
          const r  = R_MAX * ab.score / 100
          const px = CX + r * Math.cos(ab.angle)
          const py = CY + r * Math.sin(ab.angle)
          return (
            <circle key={`${group.key}-${ab.code}-dot`}
              cx={Number(px.toFixed(1))} cy={Number(py.toFixed(1))}
              r={ab.score >= 90 ? 3.5 : 2.5}
              fill={ab.score >= 90 ? group.color : `${group.color}88`} />
          )
        }))}

        {/* Broad ability key labels at perimeter */}
        {groups.map(group => {
          const midAngle = group.abilities.reduce((s, a) => s + a.angle, 0) / group.abilities.length
          const lx = CX + (R_LABEL + 10) * Math.cos(midAngle)
          const ly = CY + (R_LABEL + 10) * Math.sin(midAngle)
          return (
            <text key={group.key}
              x={Number(lx.toFixed(1))} y={Number(ly.toFixed(1))}
              fontSize={9} fontWeight="700" fill={group.color}
              textAnchor="middle" dominantBaseline="middle"
              style={{ fontFamily: 'system-ui' }}>
              {group.key}
            </text>
          )
        })}
      </svg>

      </div>

      {/* Vertical legend — data-list style, right of radar ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {HP_CHC_STRATUM.map(g => (
          <div key={g.key} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: g.color, flexShrink: 0,
            }} />
            <span style={{
              fontSize: '8px', fontWeight: 700, color: g.color,
              fontFamily: '"SF Mono","Fira Code",monospace',
              letterSpacing: '0.04em', flexShrink: 0,
            }}>
              {g.key}
            </span>
            <span style={{
              fontSize: '7px', color: '#9CA3AF',
              fontFamily: '"Inter",system-ui,sans-serif',
              letterSpacing: '-0.01em',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              flex: 1,
            }}>
              {g.name.split(' ').slice(0, 2).join(' ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Frame04Growth() {
  return (
    <section className="py-24 px-6 relative overflow-hidden" style={{ background: '#FFFFFF' }}>
      {/* ── Frame 03 · Blue halo — Student / cognitive ignition ── */}
      <Halo color={BLUE} top="-15%" right="-8%" size="72vw" opacity={0.08} />
      <Halo color={BLUE} top="45%" right="58%" size="42vw" opacity={0.04} />

      <div className="max-w-[1440px] mx-auto px-[12%] relative z-10">
        <FadeUp className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-black mb-7"
            style={{ fontFamily: 'var(--font-playfair)', color: TEXT }}>
            Potential{' '}
            <span style={{ color: BLUE }}>becomes</span>
            {' '}mastery.
            <br /><span className="italic" style={{ color: BLUE }}>Individually.</span>
          </h2>
          <p className="mx-auto"
            style={{
              fontFamily: '"Inter", var(--font-geist-sans), system-ui, sans-serif',
              fontSize: '20px', fontWeight: 400, lineHeight: 1.6,
              letterSpacing: '-0.01em', color: '#4B5563',
            }}>
            Learn anything you want, in the exact way your mind works best.
          </p>
        </FadeUp>

        {/* ── 2-col grid: left = stacked pair, right = full-height AI window ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

          {/* ── Left column: Growth Metrics (top) + CHC Map (bottom) ── */}
          <FadeUp delay={0.08} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Top: Growth Metrics */}
            <div className="rounded-2xl p-5" style={{ ...GLASS, borderTopColor: `${BLUE}55` }}>
              <p className="text-[9px] uppercase tracking-[0.22em] font-semibold mb-4"
                style={{ color: '#9CA3AF' }}>Growth Metrics</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { l: 'Courses Taken',   v: '23' },
                  { l: 'Knowledge Node',  v: '12' },
                  { l: 'Learning Streak', v: '7d' },
                ].map(s => (
                  <div key={s.l} className="rounded-xl p-3 text-center"
                    style={{ background: 'rgba(0,0,0,0.025)', border: '1px solid rgba(0,0,0,0.04)' }}>
                    <p className="uppercase tracking-wide mb-2 leading-snug"
                      style={{ fontSize: 'clamp(7px, 0.85vw, 9px)', color: '#4B5563',
                        fontFamily: '"Inter", system-ui, sans-serif', fontWeight: 500 }}>{s.l}</p>
                    <p className="font-black leading-none"
                      style={{ fontSize: 'clamp(18px, 2.2vw, 26px)',
                        fontFamily: '"SF Mono","Fira Code",monospace', color: BLUE,
                        letterSpacing: '-0.03em' }}>{s.v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom: CHC 8-axis radar — flex-1 fills remaining height */}
            <div className="rounded-2xl p-5 flex-1 flex flex-col"
              style={{ ...GLASS, borderTopColor: `${BLUE}55` }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.22em] font-semibold mb-0.5"
                    style={{ color: '#9CA3AF' }}>CHC Cognitive Profile</p>
                  <p className="text-sm font-bold" style={{ color: TEXT }}>Your Neural Map</p>
                </div>
                <div className="flex gap-2">
                  {['Gf','Gc','Gwm'].map(k => (
                    <span key={k} style={{
                      fontSize: '8px', fontWeight: 700, color: BLUE,
                      fontFamily: '"SF Mono",monospace', letterSpacing: '0.04em',
                    }}>{k}</span>
                  ))}
                </div>
              </div>
              <div className="flex-1 flex items-center">
                <CHCMap />
              </div>
            </div>
          </FadeUp>

          {/* ── Right column: Active AI Tutoring — full height ── */}
          <FadeUp delay={0.18}>
            <div className="rounded-2xl p-6 h-full flex flex-col"
              style={{ ...GLASS, borderTopColor: `${BLUE}55` }}>

              {/* Header */}
              <div className="flex items-center gap-2 mb-5">
                <p className="text-[9px] uppercase tracking-[0.22em] font-semibold"
                  style={{ color: '#9CA3AF' }}>Active AI Tutoring</p>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full ml-auto"
                  style={{ background: `${BLUE}12`, border: `1px solid ${BLUE}30` }}>
                  <motion.span className="w-1.5 h-1.5 rounded-full block" style={{ background: BLUE }}
                    animate={{ opacity: [1, 0.15, 1] }} transition={{ duration: 1.1, repeat: Infinity }} />
                  <span style={{ fontSize: '9px', fontWeight: 700, color: BLUE, letterSpacing: '0.08em' }}>LIVE</span>
                </div>
              </div>

              {/* Expert Mom identity */}
              <div className="flex items-center gap-3 mb-5 pb-4"
                style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ background: V }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#FFF', letterSpacing: '0.02em' }}>EM</span>
                </div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: TEXT, letterSpacing: '-0.01em', lineHeight: 1.3,
                    fontFamily: '"Inter", system-ui, sans-serif' }}>Expert-DAD0824</p>
                  <p style={{ fontSize: '10px', color: '#9CA3AF', fontFamily: '"Inter", system-ui, sans-serif' }}>
                    AI Mirror · Wisdom Node Active
                  </p>
                </div>
              </div>

              {/* Dialogue thread */}
              <div className="flex flex-col gap-3 flex-1">

                {/* Exchange 1 */}
                <div className="flex justify-end">
                  <div className="rounded-2xl rounded-tr-sm px-3.5 py-2.5 max-w-[82%]"
                    style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <p style={{ fontSize: '12px', color: '#374151', lineHeight: 1.55,
                      fontFamily: '"Inter", system-ui, sans-serif', letterSpacing: '-0.01em' }}>
                      Mom, why is my brain described as a map?
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                    style={{ background: V }}>
                    <span style={{ fontSize: '7px', fontWeight: 700, color: '#FFF' }}>EM</span>
                  </div>
                  <div className="rounded-2xl rounded-tl-sm px-3.5 py-2.5 flex-1"
                    style={{ background: `${BLUE}08`, border: `1px solid ${BLUE}18` }}>
                    <p style={{ fontSize: '12px', color: '#374151', lineHeight: 1.65,
                      fontFamily: '"Inter", system-ui, sans-serif', letterSpacing: '-0.01em' }}>
                      We call it a &ldquo;Neural Map.&rdquo; Every knowledge point is a &ldquo;node.&rdquo;
                      Connect mathematical logic, and you&apos;ll understand real-world applications.
                    </p>
                  </div>
                </div>

                {/* Exchange 2 */}
                <div className="flex justify-end mt-1">
                  <div className="rounded-2xl rounded-tr-sm px-3.5 py-2.5 max-w-[82%]"
                    style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <p style={{ fontSize: '12px', color: '#374151', lineHeight: 1.55,
                      fontFamily: '"Inter", system-ui, sans-serif', letterSpacing: '-0.01em' }}>
                      Will logic slow down if I don&apos;t sleep?
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                    style={{ background: V }}>
                    <span style={{ fontSize: '7px', fontWeight: 700, color: '#FFF' }}>EM</span>
                  </div>
                  <div className="rounded-2xl rounded-tl-sm px-3.5 py-2.5 flex-1"
                    style={{ background: `${BLUE}08`, border: `1px solid ${BLUE}18` }}>
                    <p style={{ fontSize: '12px', color: '#374151', lineHeight: 1.65,
                      fontFamily: '"Inter", system-ui, sans-serif', letterSpacing: '-0.01em' }}>
                      Try the &ldquo;If&hellip; Then&hellip;&rdquo; structure. If you don&apos;t sleep,
                      then neural connections weaken, because the brain needs rest to solidify nodes.
                    </p>
                  </div>
                </div>

                {/* Typing indicator */}
                <div className="flex items-center gap-2.5 mt-auto">
                  <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ background: V }}>
                    <span style={{ fontSize: '7px', fontWeight: 700, color: '#FFF' }}>EM</span>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-2 rounded-2xl rounded-tl-sm"
                    style={{ background: `${BLUE}08`, border: `1px solid ${BLUE}18` }}>
                    {[0, 0.18, 0.36].map(d => (
                      <motion.span key={d} className="w-1.5 h-1.5 rounded-full block"
                        style={{ background: BLUE }}
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                        transition={{ duration: 0.9, delay: d, repeat: Infinity }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// FRAME 05 · THE ECOSYSTEM — Full-screen dot-matrix world map as background
// 140+ dots across real continent positions · mouse parallax · SBT + Staking
// ══════════════════════════════════════════════════════════════════════════════

// 580×330 coordinate space — active (true) = vermilion node with ring
// Keep active count ≤ 16 so rings don't overlap
const MAP_DOTS: [number, number, boolean][] = [
  // ── Greenland ──────────────────────────────────────────────────────────────
  [160,20,false],[168,24,false],[155,28,false],
  // ── North America — Canada ─────────────────────────────────────────────────
  [56,46,false],[68,42,true],[82,40,false],[96,42,false],[110,44,false],[124,46,false],[140,50,false],
  // ── NA — US west coast ─────────────────────────────────────────────────────
  [50,62,false],[52,74,false],[52,86,true],[54,98,false],[54,110,false],
  // ── NA — US central ────────────────────────────────────────────────────────
  [72,60,false],[78,72,false],[82,84,false],[84,96,true],[82,108,false],
  // ── NA — US east coast ─────────────────────────────────────────────────────
  [100,58,false],[104,68,true],[108,78,false],[108,88,false],[106,98,false],
  // ── Mexico / Caribbean ─────────────────────────────────────────────────────
  [80,130,false],[86,142,false],[90,154,false],
  // ── South America — north ──────────────────────────────────────────────────
  [88,170,false],[96,172,true],[106,172,false],[118,174,false],
  // ── SA — west (Andes) ──────────────────────────────────────────────────────
  [86,184,false],[88,196,false],[88,210,false],[90,224,false],[90,238,false],[92,252,false],
  // ── SA — east (Brazil) ─────────────────────────────────────────────────────
  [118,186,false],[124,198,false],[130,210,true],[130,224,false],[126,238,false],[122,252,false],
  // ── SA — south ─────────────────────────────────────────────────────────────
  [102,268,false],[106,282,false],
  // ── Europe — British Isles ─────────────────────────────────────────────────
  [238,62,true],[242,70,false],[240,78,false],
  // ── Europe — Scandinavia ───────────────────────────────────────────────────
  [262,42,false],[270,38,false],[280,42,false],[290,48,false],[298,54,false],
  // ── Europe — Western / Central ─────────────────────────────────────────────
  [250,74,false],[254,80,false],[260,86,false],[266,82,true],[272,76,false],
  [278,80,false],[286,76,false],[292,80,false],[300,74,false],[306,80,false],
  // ── Europe — Eastern ───────────────────────────────────────────────────────
  [312,76,false],[318,70,false],[322,78,false],
  // ── Russia / Siberia ───────────────────────────────────────────────────────
  [328,44,false],[348,40,true],[370,42,false],[394,40,false],[418,42,false],
  [444,40,false],[468,42,false],[492,44,false],[516,48,false],
  // ── North Africa ───────────────────────────────────────────────────────────
  [250,112,false],[266,110,false],[282,112,false],[298,110,true],[316,112,false],
  [334,110,false],[352,112,false],
  // ── West Africa ────────────────────────────────────────────────────────────
  [252,126,false],[256,138,false],[258,152,true],[260,166,false],[262,180,false],[264,194,false],
  // ── East Africa ────────────────────────────────────────────────────────────
  [346,128,false],[352,140,false],[354,154,false],[352,168,true],[350,182,false],[346,196,false],
  // ── Southern Africa ────────────────────────────────────────────────────────
  [302,212,false],[312,222,false],[318,234,false],[316,248,false],[312,260,false],
  [316,272,true],[314,284,false],
  // ── Middle East ────────────────────────────────────────────────────────────
  [342,110,false],[350,118,false],[358,126,true],[370,120,false],[378,128,false],
  // ── India ──────────────────────────────────────────────────────────────────
  [386,142,false],[390,154,false],[394,166,true],[394,180,false],[390,192,false],[384,206,false],
  // ── China / East Asia ──────────────────────────────────────────────────────
  [424,76,false],[434,72,false],[446,74,false],[458,72,true],[470,74,false],[480,76,false],
  [426,90,false],[436,92,false],[444,88,false],[454,92,false],[464,88,false],[474,90,false],
  [428,104,false],[438,106,false],[450,102,false],[460,106,true],[470,102,false],
  [430,116,false],[442,118,false],[454,114,false],[464,118,false],
  // ── Japan ──────────────────────────────────────────────────────────────────
  [516,88,false],[520,96,true],[518,106,false],[514,114,false],
  // ── Korea ──────────────────────────────────────────────────────────────────
  [504,100,false],[506,110,false],
  // ── Southeast Asia ─────────────────────────────────────────────────────────
  [458,160,false],[466,168,false],[474,162,false],[480,170,true],
  [456,184,false],[464,190,false],[474,186,false],[482,192,false],
  // ── Indonesia / Pacific ────────────────────────────────────────────────────
  [462,208,false],[474,212,false],[486,208,false],[498,212,true],[510,208,false],
  // ── Australia ──────────────────────────────────────────────────────────────
  [476,248,false],[488,244,false],[500,248,true],[512,244,false],[524,248,false],[532,244,false],
  [478,260,false],[490,262,false],[502,258,false],[514,262,false],[526,258,false],
  [484,274,false],[496,276,false],[508,272,true],[520,276,false],
  [490,288,false],[504,290,false],[516,288,false],
]

function GlobalNodeMap({ x, y }: { x: any; y: any }) {
  return (
    <motion.div className="absolute inset-[-6%]" style={{ x, y }}>
      <svg viewBox="0 0 580 330" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
        {/* Continent silhouette halos */}
        {([
          [100, 88, 72, 58],   // North America
          [108, 238, 38, 74],  // South America
          [278, 76, 48, 38],   // Europe
          [304, 200, 58, 90],  // Africa
          [452, 110, 88, 70],  // Asia
          [500, 276, 50, 36],  // Australia
          [163, 26,  18, 13],  // Greenland
        ] as number[][]).map(([cx,cy,rx,ry], i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry}
            fill="rgba(220,50,30,0.016)" stroke="rgba(0,0,0,0.045)" strokeWidth={0.4} />
        ))}

        {/* Active node expanding rings — small, tightly contained */}
        {MAP_DOTS.filter(([,,a]) => a).map(([dx, dy], i) => (
          <motion.circle key={`ring${i}`} cx={dx} cy={dy} r={2}
            fill="none" stroke={V} strokeWidth={0.65} strokeOpacity={0.5}
            animate={{ r: [2, 9, 2], strokeOpacity: [0.45, 0, 0.45] }}
            transition={{ duration: 4.0, repeat: Infinity, delay: i * 0.42 }} />
        ))}

        {/* Dots */}
        {MAP_DOTS.map(([dx, dy, active], i) => (
          <motion.circle key={i} cx={dx} cy={dy}
            r={active ? 2.8 : 1.7}
            fill={active ? V : 'rgba(0,0,0,0.11)'}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: active ? 0.90 : 0.45, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.16, delay: 0.02 + i * 0.011 }}
            style={active ? { filter: `drop-shadow(0 0 4px ${V}80)` } : {}} />
        ))}
      </svg>
    </motion.div>
  )
}

// Logic DNA radar for SBT verified state
const DNA_AXES = ['Deduction','Inquiry','Ethics','Analysis','Synthesis']
const DNA_VALS = [0.88, 0.72, 0.95, 0.80, 0.76]

function LogicDNARadar() {
  const cx = 100, cy = 100, R = 68, n = DNA_AXES.length
  const pts = DNA_AXES.map((label, i) => {
    const a = ((i * 360) / n - 90) * (Math.PI / 180)
    return {
      ax: rd(cx + R * Math.cos(a)),           ay: rd(cy + R * Math.sin(a)),
      vx: rd(cx + R * DNA_VALS[i] * Math.cos(a)), vy: rd(cy + R * DNA_VALS[i] * Math.sin(a)),
      lx: rd(cx + (R + 14) * Math.cos(a)),   ly: rd(cy + (R + 14) * Math.sin(a)), label,
    }
  })
  const rings = [0.25,0.5,0.75,1].map(f =>
    pts.map((_, i) => {
      const a = ((i * 360) / n - 90) * (Math.PI / 180)
      return `${rd(cx + R * f * Math.cos(a))},${rd(cy + R * f * Math.sin(a))}`
    }).join(' ')
  )
  return (
    <svg viewBox="0 0 200 200" width={172} height={172}>
      {rings.map((p, i) => (
        <polygon key={i} points={p} fill="none" stroke={IND} strokeWidth={0.5} strokeOpacity={0.15} />
      ))}
      {pts.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.ax} y2={p.ay}
          stroke={IND} strokeWidth={0.5} strokeOpacity={0.18} />
      ))}
      <motion.polygon points={pts.map(p => `${p.vx},${p.vy}`).join(' ')}
        fill={`${IND}1A`} stroke={IND} strokeWidth={1.4}
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ duration: 0.7, ease: EASE }}
        style={{ transformOrigin: `${cx}px ${cy}px` }} />
      {pts.map((p, i) => (
        <motion.circle key={i} cx={p.vx} cy={p.vy} r={3} fill={IND}
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.28 + i * 0.07 }} />
      ))}
      {pts.map((p, i) => (
        <text key={i} x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle"
          fontSize={6.2} fontWeight="700" fill={IND} fillOpacity={0.65}>{p.label}</text>
      ))}
    </svg>
  )
}

function Frame05Ecosystem() {
  const RED = '#EF4444'
  const [activePool, setActivePool] = useState(0)

  const ASSETS = [
    { initials: EXPERT_THEME.initials, bg: EXPERT_THEME.color, name: EXPERT_ID, cred: 'Expert',    title: 'Segment Diagram · Socratic Protocol', spark: [62,68,65,72,70,78,75,82,80,84] },
    { initials: 'DAD', bg: V,          name: 'Expert-DAD0824', cred: 'Stanford',  title: 'Advanced Calculus Scaffolding', spark: [45,48,44,52,50,47,55,53,58,56] },
    { initials: 'MHT', bg: '#F59E0B',  name: 'Expert-MHT5566', cred: 'Oxford',    title: 'Number Theory Framework #09',   spark: [58,62,68,65,72,76,73,80,78,84] },
    { initials: 'OKO', bg: '#8B5CF6',  name: 'Expert-OKO9988', cred: 'Harvard',   title: 'Quantum Logic Cluster #02',     spark: [80,76,82,78,85,82,88,85,92,90] },
    { initials: 'SVN', bg: TEAL,       name: 'Expert-SVN8877', cred: 'Cambridge', title: 'Philosophy of Science Logic',   spark: [42,45,43,48,46,52,50,54,53,57] },
  ]

  // Per-pool match data — right panel refreshes on selection
  const POOL_DATA = [
    { brand: 'OpenAI',   name: 'OpenAI Talent Grant', amount: '$80K',  focus: 'Math Tier 1+',
      matches: [
        { id: '0x7E2a3f', c: IND,       pct: '98%', tier: 'L9 · Logic' },
        { id: '0x4B8c12', c: '#8B5CF6', pct: '96%', tier: 'L8 · Math'  },
        { id: '0x9D3e7a', c: TEAL,      pct: '94%', tier: 'L9 · Logic' },
        { id: '0x2F6b45', c: '#F59E0B', pct: '91%', tier: 'L7 · STEM'  },
        { id: '0x8A1d90', c: V,         pct: '89%', tier: 'L8 · Logic' },
      ] },
    { brand: 'Google',   name: 'Google Logic Fund',   amount: '$50K',  focus: 'Logic DNA: A',
      matches: [
        { id: '0x3C4d1e', c: GREEN,     pct: '97%', tier: 'L9 · Logic' },
        { id: '0x7F2b3a', c: IND,       pct: '95%', tier: 'L8 · Logic' },
        { id: '0x1A5c6d', c: '#F59E0B', pct: '93%', tier: 'L8 · STEM'  },
        { id: '0x6E3f4b', c: '#8B5CF6', pct: '90%', tier: 'L7 · Math'  },
        { id: '0x2D8a7c', c: V,         pct: '87%', tier: 'L7 · Logic' },
      ] },
    { brand: 'DeepMind', name: 'DeepMind Research',   amount: '$120K', focus: 'Quantum Elite',
      matches: [
        { id: '0xA9B2c3', c: TEAL,      pct: '99%', tier: 'L10 · Quantum' },
        { id: '0x5E6f7a', c: IND,       pct: '97%', tier: 'L9 · Logic'   },
        { id: '0xC1D2e3', c: '#8B5CF6', pct: '95%', tier: 'L9 · Math'    },
        { id: '0xF4A5b6', c: GREEN,     pct: '92%', tier: 'L8 · STEM'    },
        { id: '0x3B7c8d', c: '#F59E0B', pct: '88%', tier: 'L8 · Logic'   },
      ] },
    { brand: 'Baidu',    name: 'Baidu AI Institute',  amount: '$35K',  focus: 'Applied Math',
      matches: [
        { id: '0x9C3d4e', c: '#F59E0B', pct: '96%', tier: 'L8 · Math'    },
        { id: '0x2A1b5f', c: IND,       pct: '93%', tier: 'L8 · Logic'   },
        { id: '0x7D4e5f', c: TEAL,      pct: '91%', tier: 'L7 · STEM'    },
        { id: '0x8B6c7d', c: '#8B5CF6', pct: '89%', tier: 'L7 · Math'    },
        { id: '0x1F2a3b', c: V,         pct: '85%', tier: 'L6 · Applied' },
      ] },
  ]

  // ── Minimal monochrome brand icons — 14×14 SVG ───────────────────────────
  function BrandIcon({ brand, color = '#374151' }: { brand: string; color?: string }) {
    if (brand === 'OpenAI') return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden style={{ flexShrink: 0 }}>
        {[0,1,2,3,4,5].map(i => {
          const a = (i * 60 - 90) * Math.PI / 180
          return <line key={i}
            x1={+(7 + 2.0 * Math.cos(a)).toFixed(2)} y1={+(7 + 2.0 * Math.sin(a)).toFixed(2)}
            x2={+(7 + 5.2 * Math.cos(a)).toFixed(2)} y2={+(7 + 5.2 * Math.sin(a)).toFixed(2)}
            stroke={color} strokeWidth="1" strokeLinecap="round" />
        })}
        <circle cx="7" cy="7" r="5.4" stroke={color} strokeWidth="1" fill="none" />
        <circle cx="7" cy="7" r="1.6" fill={color} />
      </svg>
    )
    if (brand === 'Google') return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden style={{ flexShrink: 0 }}>
        <circle cx="7" cy="7" r="5.4" stroke={color} strokeWidth="1" />
        <text x="7" y="10.4" textAnchor="middle" fontSize="8" fontWeight="800" fill={color}
          fontFamily='"Inter",Arial,sans-serif' style={{ userSelect: 'none' }}>G</text>
      </svg>
    )
    if (brand === 'DeepMind') return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden style={{ flexShrink: 0 }}>
        <polygon points="7,1.3 12.7,7 7,12.7 1.3,7" stroke={color} strokeWidth="1" />
        <polygon points="7,4 10,7 7,10 4,7" stroke={color} strokeWidth="0.9" />
        <circle cx="7" cy="7" r="1.3" fill={color} />
      </svg>
    )
    return ( // Baidu — 3-dot paw signature
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden style={{ flexShrink: 0 }}>
        <circle cx="7"    cy="9"   r="3.8"  stroke={color} strokeWidth="1" />
        <circle cx="3.8"  cy="4.4" r="1.3"  fill={color} />
        <circle cx="7"    cy="3.2" r="1.3"  fill={color} />
        <circle cx="10.2" cy="4.4" r="1.3"  fill={color} />
      </svg>
    )
  }

  // ── Compact inline sparkline — vermilion trend line ──────────────────────
  function Spark({ pts }: { pts: number[] }) {
    const W = 58, H = 26
    const mx = Math.max(...pts), mn = Math.min(...pts), rng = mx - mn || 1
    const step = W / (pts.length - 1)
    const toY = (v: number) => H - ((v - mn) / rng) * (H - 5) - 2.5
    const d = pts.map((v, i) => `${i === 0 ? 'M' : 'L'} ${rd(i * step)},${rd(toY(v))}`).join(' ')
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible', flexShrink: 0 }}>
        <motion.path d={d} fill="none" stroke={RED} strokeWidth={1.2} strokeLinecap="round"
          initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
          transition={{ duration: 1.1, delay: 0.3, ease: 'easeInOut' }} />
        <circle cx={rd((pts.length - 1) * step)} cy={rd(toY(pts[pts.length - 1]))}
          r={2} fill={RED} style={{ filter: `drop-shadow(0 0 3px ${RED}99)` }} />
      </svg>
    )
  }

  return (
    <section className="relative overflow-hidden" style={{ background: '#FFFFFF', minHeight: '100vh' }}>

      {/* ── Cinnabar aura layer — sovereignty depth, matches frames 1–3 ── */}
      <BreathingGlow color={V} top="-18%" right="-6%"  size="84vw" peakOpacity={0.084} delay={0}   />
      <BreathingGlow color={V} top="42%"  right="88%"  size="72vw" peakOpacity={0.066} delay={2.6} />
      <Halo          color={V} top="64%"  right="28%"  size="62vw" opacity={0.05}                  />

      <div className="relative z-10 py-24 px-6">
        <div className="max-w-[1440px] mx-auto px-[12%]">

          {/* ── Header ── */}
          <FadeUp className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-7"
              style={{ fontFamily: 'var(--font-playfair)', color: TEXT }}>
              Value{' '}
              <span style={{ color: RED }}>attracts</span>
              {' '}Opportunity.
              <br /><span className="italic" style={{ color: RED }}>Universally.</span>
            </h2>
            <p style={{
              fontFamily: '"Inter", var(--font-geist-sans), system-ui, sans-serif',
              fontSize: '20px', fontWeight: 400, lineHeight: 1.6,
              letterSpacing: '-0.01em', color: '#4B5563',
            }}>
              Stop chasing. Let the world&apos;s best funding and offers come to you.
            </p>
          </FadeUp>

          {/* ── Two columns ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            {/* ── LEFT — Individual Asset Exchange (sparkline rows + fade mask + CTA) ── */}
            <FadeUp delay={0.08}>
              <div className="rounded-2xl overflow-hidden h-full flex flex-col" style={GLASS}>
                <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${RED}, #FCA5A5)` }} />
                <div className="p-6 flex flex-col flex-1">

                  {/* Header */}
                  <div className="flex items-center gap-2 mb-5">
                    <span style={{ fontSize: '13px' }}>👤</span>
                    <p style={{ fontSize: '9px', fontWeight: 700, color: '#374151',
                      letterSpacing: '0.14em', textTransform: 'uppercase',
                      fontFamily: '"Inter", system-ui, sans-serif' }}>
                      Individual Asset Exchange
                    </p>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full ml-auto"
                      style={{ background: `${RED}0F`, border: `1px solid ${RED}2E` }}>
                      <motion.span className="w-1.5 h-1.5 rounded-full block" style={{ background: RED }}
                        animate={{ opacity: [1, 0.18, 1] }} transition={{ duration: 1.3, repeat: Infinity }} />
                      <span style={{ fontSize: '9px', fontWeight: 700, color: RED, letterSpacing: '0.08em' }}>LIVE</span>
                    </div>
                  </div>

                  {/* Asset rows + fade-out mask + charcoal scrollbar */}
                  <div style={{ position: 'relative', flex: 1 }}>
                    <div style={{ paddingRight: '16px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                      {ASSETS.map((asset, idx) => (
                        <motion.div
                          key={asset.initials}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: 0.08 + idx * 0.07, ease: EASE }}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl"
                          style={{ background: 'rgba(0,0,0,0.018)', border: '1px solid rgba(0,0,0,0.052)' }}>

                          {/* Avatar */}
                          <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                            style={{ background: asset.bg }}>
                            <span style={{ fontSize: '8px', fontWeight: 700, color: '#FFF',
                              letterSpacing: '0.02em', fontFamily: '"Inter", system-ui, sans-serif' }}>
                              {asset.initials}
                            </span>
                          </div>

                          {/* Name + credential + title */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span style={{ fontSize: '11px', fontWeight: 600, color: TEXT,
                                fontFamily: '"Inter", system-ui, sans-serif', letterSpacing: '-0.01em',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {asset.name}
                              </span>
                              <span className="px-1.5 py-0.5 rounded flex-shrink-0"
                                style={{ fontSize: '7px', fontWeight: 700, background: 'rgba(0,0,0,0.055)',
                                  color: '#6B7280', fontFamily: '"Inter", system-ui, sans-serif',
                                  letterSpacing: '0.04em' }}>
                                {asset.cred}
                              </span>
                            </div>
                            <p style={{ fontSize: '9.5px', color: '#6B7280',
                              fontFamily: '"Inter", system-ui, sans-serif', letterSpacing: '-0.005em',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {asset.title}
                            </p>
                          </div>

                          {/* Sparkline */}
                          <Spark pts={asset.spark} />
                        </motion.div>
                      ))}
                    </div>

                    {/* Bottom fade mask — "more assets below" illusion */}
                    <div aria-hidden style={{
                      position: 'absolute', bottom: 0, left: 0, right: '16px', height: '56px',
                      background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.96))',
                      pointerEvents: 'none', borderRadius: '0 0 6px 6px',
                    }} />

                    {/* Charcoal scrollbar track */}
                    <div style={{
                      position: 'absolute', right: 0, top: 0, bottom: 0, width: 4,
                      background: 'rgba(0,0,0,0.07)', borderRadius: 999,
                    }}>
                      <motion.div
                        style={{ width: '100%', background: '#6B7280', borderRadius: 999, position: 'absolute' }}
                        initial={{ height: '0%', top: '0%' }}
                        whileInView={{ height: '38%', top: '8%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.1, delay: 0.6, ease: 'easeOut' }} />
                    </div>
                  </div>

                  {/* ── ENTER WISDOM EXCHANGE — full-width grand CTA ── */}
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(239,68,68,0.32)' }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-5 w-full py-3 rounded-full font-bold text-white"
                    style={{ background: RED, border: 'none', cursor: 'pointer',
                      fontSize: '13px', letterSpacing: '0.08em',
                      fontFamily: '"Inter", system-ui, sans-serif',
                      boxShadow: '0 4px 20px rgba(239,68,68,0.22)' }}>
                    ENTER WISDOM EXCHANGE
                  </motion.button>
                </div>
              </div>
            </FadeUp>

            {/* ── RIGHT — Bilateral Matching Hub ── */}
            <FadeUp delay={0.14}>
              <div className="rounded-2xl overflow-hidden h-full flex flex-col" style={GLASS}>
                <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${RED}, #FCA5A5)` }} />
                <div className="p-6 flex flex-col flex-1">

                  {/* Header */}
                  <div className="flex items-center gap-2 mb-4">
                    <span style={{ fontSize: '13px' }}>⚙️</span>
                    <p style={{ fontSize: '9px', fontWeight: 700, color: '#374151',
                      letterSpacing: '0.14em', textTransform: 'uppercase',
                      fontFamily: '"Inter", system-ui, sans-serif' }}>
                      Bilateral Matching Hub
                    </p>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full ml-auto"
                      style={{ background: `${RED}0F`, border: `1px solid ${RED}2E` }}>
                      <motion.span className="w-1.5 h-1.5 rounded-full block" style={{ background: RED }}
                        animate={{ opacity: [1, 0.18, 1] }} transition={{ duration: 1.0, repeat: Infinity }} />
                      <span style={{ fontSize: '9px', fontWeight: 700, color: RED, letterSpacing: '0.08em' }}>
                        LIVE
                      </span>
                    </div>
                  </div>

                  {/* ── Main bilat panel: Pools | Matches — clean Master-Detail, no connector lines ── */}
                  <div className="flex flex-1 gap-3" style={{ minHeight: 0 }}>

                    {/* ── LEFT SUB-PANEL: Active Scholarship Pools ── */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <p style={{ fontSize: '8px', fontWeight: 700, color: '#374151',
                        letterSpacing: '0.14em', textTransform: 'uppercase',
                        fontFamily: '"Inter", system-ui, sans-serif', marginBottom: '8px' }}>
                        🏢 Active Pools
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                        {POOL_DATA.map((pool, idx) => (
                          <motion.div
                            key={pool.name}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{
                              opacity: 1,
                              x: 0,
                              scale: idx === activePool ? 1.08 : 1,
                            }}
                            transition={{
                              opacity: { duration: 0.35, delay: 0.1 + idx * 0.08 },
                              x:       { duration: 0.35, delay: 0.1 + idx * 0.08 },
                              scale:   { type: 'spring', stiffness: 340, damping: 26 },
                            }}
                            onClick={() => setActivePool(idx)}
                            className="rounded-xl px-2.5 py-2 flex flex-col"
                            style={idx === activePool ? {
                              background: '#FFFFFF',
                              border: '1px solid rgba(0,0,0,0.09)',
                              boxShadow: '0 6px 24px rgba(0,0,0,0.11)',
                              cursor: 'pointer',
                            } : {
                              background: 'rgba(0,0,0,0.018)',
                              border: '1px solid rgba(0,0,0,0.055)',
                              cursor: 'pointer',
                            }}>
                            {/* Logo + pool name */}
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <BrandIcon brand={pool.brand} color="#374151" />
                              <p style={{ fontSize: '10px', fontWeight: 600,
                                color: '#374151',
                                fontFamily: '"Inter", system-ui, sans-serif',
                                letterSpacing: '-0.01em', lineHeight: 1.3,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {pool.name}
                              </p>
                            </div>
                            <div className="flex items-center justify-between">
                              <span style={{ fontSize: '11px', fontWeight: 800, color: RED,
                                fontFamily: '"SF Mono","Fira Code",monospace',
                                letterSpacing: '-0.03em' }}>
                                {pool.amount}
                              </span>
                              <span style={{ fontSize: '7.5px', color: '#9CA3AF',
                                fontFamily: '"Inter", system-ui, sans-serif',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                maxWidth: '60px', textAlign: 'right' }}>
                                {pool.focus}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* ── RIGHT SUB-PANEL: Verified Matches — refreshes on pool selection ── */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <p style={{ fontSize: '8px', fontWeight: 700, color: '#374151',
                        letterSpacing: '0.14em', textTransform: 'uppercase',
                        fontFamily: '"Inter", system-ui, sans-serif', marginBottom: '8px' }}>
                        👥 Verified Matches
                      </p>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activePool}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                          {POOL_DATA[activePool].matches.map((m, idx) => (
                            <motion.div
                              key={m.id}
                              initial={{ opacity: 0, x: 6, scale: 1 }}
                              animate={{ opacity: 1, x: 0, scale: 1.08 }}
                              transition={{ duration: 0.22, delay: idx * 0.05, ease: EASE }}
                              className="rounded-xl px-2.5 py-2"
                              style={{
                                background: '#FFFFFF',
                                border: '1px solid rgba(0,0,0,0.09)',
                                boxShadow: '0 6px 24px rgba(0,0,0,0.11)',
                              }}>
                              <div className="flex items-center justify-between mb-0.5">
                                <p style={{ fontSize: '8px', color: '#9CA3AF',
                                  fontFamily: '"SF Mono","Fira Code",monospace',
                                  letterSpacing: '0.01em', lineHeight: 1.2 }}>
                                  {m.id}
                                </p>
                                <p style={{ fontSize: '11px', fontWeight: 800, color: GREEN,
                                  fontFamily: '"SF Mono","Fira Code",monospace',
                                  letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                                  {m.pct}
                                </p>
                              </div>
                              <p style={{ fontSize: '7.5px', color: '#6B7280',
                                fontFamily: '"Inter", system-ui, sans-serif',
                                letterSpacing: '0.01em' }}>
                                {m.tier}
                              </p>
                            </motion.div>
                          ))}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* ── Action buttons ── */}
                  <div className="flex gap-3 mt-4">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      className="flex-1 py-2.5 rounded-full text-[12px] font-semibold text-white"
                      style={{ background: RED, border: `1.5px solid ${RED}`,
                        fontFamily: '"Inter", system-ui, sans-serif', letterSpacing: '-0.01em',
                        cursor: 'pointer', boxShadow: '0 4px 18px rgba(239,68,68,0.20)' }}>
                      Create Fund
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      className="flex-1 py-2.5 rounded-full text-[12px] font-semibold"
                      style={{ background: 'transparent', border: `1.5px solid ${RED}`, color: RED,
                        fontFamily: '"Inter", system-ui, sans-serif', letterSpacing: '-0.01em',
                        cursor: 'pointer' }}>
                      Enterprise Portal
                    </motion.button>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>

        </div>
      </div>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT
// ══════════════════════════════════════════════════════════════════════════════
export default function LandingPage() {
  return (
    <div style={{ background: '#FFFFFF' }}>
      <Nav />
      <Frame01Genesis />
      <div className="h-px" style={{ background: 'rgba(0,0,0,0.05)' }} />
      <Frame02Fuel />
      <div className="h-px" style={{ background: 'rgba(0,0,0,0.05)' }} />
      <Frame04Growth />
      <div className="h-px" style={{ background: 'rgba(0,0,0,0.05)' }} />
      <Frame03Brain />
      <div className="h-px" style={{ background: 'rgba(0,0,0,0.05)' }} />
      <Frame05Ecosystem />
      <footer className="px-8 py-8 flex items-center justify-between text-[11px]"
        style={{ borderTop: '1px solid rgba(0,0,0,0.055)', color: '#9CA3AF', background: '#FFFFFF' }}>
        <span style={{ fontFamily: 'var(--font-playfair)', color: TEXT, fontWeight: 600 }}>
          Sparkle Protocol
        </span>
        <span>Existence into Liberty · 2026</span>
      </footer>
    </div>
  )
}
