'use client'

import { createContext, useContext, useReducer, useEffect, useRef, ReactNode } from 'react'

// ─── Global constants shared across portals ────────────────────────────────────
export const EXPERT_ID = 'Expert-ZSF1220'

// ── Full Expert Registry — canonical IDs for all portals ──────────────────────
export const EXPERT_DAD = 'Expert-DAD0824'  // formerly "Dad's Logic"
export const EXPERT_MHT = 'Expert-MHT5566'  // formerly "Prof. Zhang / Dr. Mehta"
export const EXPERT_OKO = 'Expert-OKO9988'  // formerly "Dr. Okonkwo / Dr. Chen"
export const EXPERT_NKM = 'Expert-NKM7733'  // formerly "Prof. Nakamura / Logic_Aria"
export const EXPERT_SVN = 'Expert-SVN8877'  // formerly "Dr. Svensson"
export const EXPERT_MXU = 'Expert-MXU1155'  // formerly "Master Xu"
export const EXPERT_WLM = 'Expert-WLM8844'  // formerly "Ms. Williams"

// ── Utility: auto-extract initials from Expert ID ─────────────────────────────
// "Expert-ZSF1220" → "ZSF"  |  "Expert-DAD0824" → "DAD"
export function expertInitials(id: string): string {
  const m = id.match(/^Expert-([A-Z]+)\d/)
  return m ? m[1] : id.slice(0, 3).toUpperCase()
}

// Single source of truth for the expert's visual identity
export const EXPERT_THEME = {
  id:       EXPERT_ID,
  color:    '#10B981',   // Emerald — canonical brand colour from Wisdom ID card
  initials: 'ZSF',
} as const

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SparkleState {
  credits: number
  revenue: number
  isMining: boolean
  enrolledCourses: string[]
  mintedNFTs: string[]
  hashRate: number
  totalMined: number
  // ── Protocol state (parent portal data loop) ──
  isActivated: boolean      // true after "Top Up Fuel" is clicked
  protocolBalance: number   // SPRK balance (12.4 after activation, decrements on claims)
  seedsCount: number        // number of claimed seeds
  usedCredits: number       // cumulative SPRK consumed via consumeLogic (explicit calls)
  // ── Educator forge state ──
  logicHash: string | null  // hash minted after forge completes
  expertRevenue: number     // cumulative educator revenue from minting
  lastSeenRevenue: number   // snapshot for arrival count-up animation
  // ── Stake events — Nav uses this to re-run from-0 animation ──
  stakeRevision: number     // increments on every SETTLE_STAKING dispatch
}

type SparkleAction =
  | { type: 'START_MINING' }
  | { type: 'STOP_MINING' }
  | { type: 'ADD_CREDITS'; amount: number }
  | { type: 'ENROLL_COURSE'; courseId: string; cost: number; educatorRevenue: number }
  | { type: 'MINT_NFT'; nftId: string }
  | { type: 'ACTIVATE_PROTOCOL' }
  | { type: 'CLAIM_SEED'; cost: number }
  | { type: 'CONSUME_BALANCE'; amount: number }
  | { type: 'CONSUME_LOGIC'; cost: number }
  | { type: 'SET_LOGIC_HASH'; hash: string }
  | { type: 'ADD_EXPERT_REVENUE'; amount: number }
  | { type: 'MARK_REVENUE_SEEN' }
  | { type: 'DEPOSIT_SPRK' }        // Frame-01 Deposit: balance → 25.0 SPRK
  | { type: 'SETTLE_STAKING' }      // Frame-02 Stake: +2.4 SPRK settlement credit

// ─── Reducer ─────────────────────────────────────────────────────────────────

function sparkleReducer(state: SparkleState, action: SparkleAction): SparkleState {
  switch (action.type) {
    case 'START_MINING':
      return { ...state, isMining: true }
    case 'STOP_MINING':
      return { ...state, isMining: false }
    case 'ADD_CREDITS':
      return {
        ...state,
        credits: state.credits + action.amount,
        totalMined: state.totalMined + action.amount,
      }
    case 'ENROLL_COURSE':
      if (state.credits < action.cost || state.enrolledCourses.includes(action.courseId)) {
        return state
      }
      return {
        ...state,
        credits: state.credits - action.cost,
        revenue: state.revenue + action.educatorRevenue,
        enrolledCourses: [...state.enrolledCourses, action.courseId],
      }
    case 'MINT_NFT':
      if (state.mintedNFTs.includes(action.nftId)) return state
      return { ...state, mintedNFTs: [...state.mintedNFTs, action.nftId] }
    case 'ACTIVATE_PROTOCOL':
      if (state.isActivated) return state
      return { ...state, isActivated: true, protocolBalance: 12.4, isMining: true }
    case 'CLAIM_SEED':
      if (state.protocolBalance < action.cost) return state
      return {
        ...state,
        protocolBalance: parseFloat((state.protocolBalance - action.cost).toFixed(4)),
        seedsCount: state.seedsCount + 1,
      }
    case 'CONSUME_BALANCE':
      if (!state.isActivated || state.protocolBalance <= 0) return state
      return {
        ...state,
        protocolBalance: parseFloat(
          Math.max(0, state.protocolBalance - action.amount).toFixed(4)
        ),
      }
    case 'CONSUME_LOGIC':
      if (!state.isActivated || state.protocolBalance <= 0) return state
      return {
        ...state,
        protocolBalance: parseFloat(Math.max(0, state.protocolBalance - action.cost).toFixed(4)),
        usedCredits:     parseFloat((state.usedCredits + action.cost).toFixed(4)),
      }
    case 'SET_LOGIC_HASH':
      return { ...state, logicHash: action.hash }
    case 'ADD_EXPERT_REVENUE':
      return { ...state, expertRevenue: parseFloat((state.expertRevenue + action.amount).toFixed(4)) }
    case 'MARK_REVENUE_SEEN':
      return { ...state, lastSeenRevenue: state.expertRevenue }
    case 'DEPOSIT_SPRK':
      return { ...state, protocolBalance: 25.0 }
    case 'SETTLE_STAKING':
      return {
        ...state,
        protocolBalance: parseFloat((state.protocolBalance + 2.4).toFixed(1)),
        stakeRevision: state.stakeRevision + 1,
      }
    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface SparkleContextValue {
  state: SparkleState
  startMining: () => void
  stopMining: () => void
  enrollCourse: (courseId: string, cost: number, educatorRevenue: number) => boolean
  mintNFT: (nftId: string) => void
  activateProtocol: () => void
  claimSeed: (cost: number) => boolean
  consumeBalance: (amount: number) => void
  consumeLogic: (cost: number) => void
  setLogicHash: (hash: string) => void
  addExpertRevenue: (amount: number) => void
  markRevenueSeen: () => void
  depositSprk: () => void
  settleStaking: () => void
}

const SparkleContext = createContext<SparkleContextValue | null>(null)

const initialState: SparkleState = {
  credits: 0,
  revenue: 0,
  isMining: false,
  enrolledCourses: [],
  mintedNFTs: [],
  hashRate: 0,
  totalMined: 0,
  isActivated: false,
  protocolBalance: 0,
  seedsCount: 0,
  usedCredits: 0,
  logicHash: null,
  expertRevenue: 1875.2,   // baseline lifetime royalties
  lastSeenRevenue: 1873.4, // snapshot for arrival count-up animation
  stakeRevision: 0,
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SparkleProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sparkleReducer, initialState)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Simulate DePIN mining: every 800ms add a small batch of credits
  useEffect(() => {
    if (state.isMining && state.isActivated) {
      intervalRef.current = setInterval(() => {
        const amount = parseFloat((Math.random() * 0.8 + 0.3).toFixed(2))
        dispatch({ type: 'ADD_CREDITS', amount })
      }, 800)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [state.isMining])

  const startMining = () => dispatch({ type: 'START_MINING' })
  const stopMining  = () => dispatch({ type: 'STOP_MINING' })

  const enrollCourse = (courseId: string, cost: number, educatorRevenue: number): boolean => {
    if (state.credits < cost || state.enrolledCourses.includes(courseId)) return false
    dispatch({ type: 'ENROLL_COURSE', courseId, cost, educatorRevenue })
    return true
  }

  const mintNFT = (nftId: string) => dispatch({ type: 'MINT_NFT', nftId })

  const activateProtocol = () => dispatch({ type: 'ACTIVATE_PROTOCOL' })

  const claimSeed = (cost: number): boolean => {
    if (state.protocolBalance < cost) return false
    dispatch({ type: 'CLAIM_SEED', cost })
    return true
  }

  const consumeBalance = (amount: number) =>
    dispatch({ type: 'CONSUME_BALANCE', amount })

  const consumeLogic = (cost: number) =>
    dispatch({ type: 'CONSUME_LOGIC', cost })

  const setLogicHash = (hash: string) =>
    dispatch({ type: 'SET_LOGIC_HASH', hash })

  const addExpertRevenue = (amount: number) =>
    dispatch({ type: 'ADD_EXPERT_REVENUE', amount })

  const markRevenueSeen = () =>
    dispatch({ type: 'MARK_REVENUE_SEEN' })

  const depositSprk   = () => dispatch({ type: 'DEPOSIT_SPRK' })
  const settleStaking = () => dispatch({ type: 'SETTLE_STAKING' })

  return (
    <SparkleContext value={{ state, startMining, stopMining, enrollCourse, mintNFT, activateProtocol, claimSeed, consumeBalance, consumeLogic, setLogicHash, addExpertRevenue, markRevenueSeen, depositSprk, settleStaking }}>
      {children}
    </SparkleContext>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSparkle() {
  const ctx = useContext(SparkleContext)
  if (!ctx) throw new Error('useSparkle must be used inside SparkleProvider')
  return ctx
}
