'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Nav from '@/components/Nav'
import { useSparkle, EXPERT_ID } from '@/app/providers'

// ── Palette ──────────────────────────────────────────────────────────────────
const CINNABAR = '#E63946'
const GREEN    = '#10B981'
const AMBER    = '#F59E0B'
const INDIGO   = '#6366F1'
const INK      = '#111827'
const BODY     = '#374151'
const MUTED    = '#6B7280'
const SUBTLE   = '#9CA3AF'
const BG       = '#FFFFFF'
const BORDER   = '#E9ECEF'
const CARD     = '#FFFFFF'
const EASE     = [0.22, 1, 0.36, 1] as const

// Single breathable shadow standard (≈ 3% opacity)
const SH     = '0 4px 20px rgba(0,0,0,0.03)'
const SH_HVR = '0 8px 32px rgba(0,0,0,0.07)'
const SH_RED = '0 4px 20px rgba(230,57,70,0.10)'

const PAD  = '0 12%'
const WRAP = { maxWidth:1440, margin:'0 auto', padding:PAD } as const

// ── Exchange ──────────────────────────────────────────────────────────────────
const BLUE_CHIP = [
  { rank:1,  teacher:'Expert-MHT5566', unit:'Dynamic Segment Analysis',      staked:48200, change24h:+5.2, apr:38.4, tier:'Master',   boost:false, sparkline:[34,39,42,38,45,52,58,61,67,72] },
  { rank:2,  teacher:'Expert-ZSF1220', unit:'Meeting-Separating Logic',      staked:32800, change24h:-1.8, apr:31.2, tier:'Master',   boost:false, sparkline:[58,55,62,59,61,57,53,55,51,49] },
  { rank:3,  teacher:'Expert-OKO9988', unit:'Euclidean Proof Systems',       staked:27500, change24h:+3.1, apr:24.9, tier:'Expert',   boost:false, sparkline:[40,44,41,48,51,49,54,57,60,63] },
  { rank:4,  teacher:'Expert-OKO9988', unit:'Inductive Reasoning Framework', staked:24100, change24h:+2.7, apr:22.1, tier:'Master',   boost:false, sparkline:[36,40,38,44,47,45,50,53,56,59] },
  { rank:5,  teacher:'Expert-NKM7733', unit:'Symbolic Logic Calculus',       staked:21300, change24h:-0.4, apr:20.8, tier:'Expert',   boost:false, sparkline:[62,60,64,61,59,62,58,60,56,55] },
  { rank:6,  teacher:'Expert-WLM8844', unit:'Bayesian Inference Methods',    staked:18900, change24h:+1.9, apr:19.3, tier:'Expert',   boost:false, sparkline:[28,31,30,34,36,40,38,43,46,49] },
  { rank:7,  teacher:'Expert-VSQ9955', unit:'Formal Proof Architecture',      staked:16400, change24h:+0.8, apr:18.1, tier:'Expert',   boost:false, sparkline:[44,46,43,48,47,51,49,53,55,57] },
  { rank:8,  teacher:'Expert-KVC1166', unit:'Higher-Order Logic Systems',     staked:14800, change24h:+1.3, apr:17.6, tier:'Expert',   boost:false, sparkline:[38,41,40,44,46,49,47,52,54,57] },
  { rank:9,  teacher:'Expert-CHL2277', unit:'Set Theory Foundations',         staked:13200, change24h:-0.7, apr:16.4, tier:'Expert',   boost:false, sparkline:[55,52,57,54,51,54,50,52,48,47] },
  { rank:10, teacher:'Expert-AND3388', unit:'Game-Theoretic Reasoning',       staked:11600, change24h:+2.8, apr:15.1, tier:'Verified', boost:false, sparkline:[24,27,26,30,33,37,35,40,42,45] },
  { rank:11, teacher:'Expert-PTV4499', unit:'Abstract Algebra Structures',    staked:10100, change24h:+0.5, apr:13.9, tier:'Verified', boost:false, sparkline:[44,46,43,48,47,51,49,53,55,57] },
  { rank:12, teacher:'Expert-NWS5500', unit:'Topology & Manifold Theory',     staked: 8700, change24h:-1.1, apr:12.7, tier:'Verified', boost:false, sparkline:[60,58,62,59,57,60,56,58,54,53] },
  { rank:13, teacher:'Expert-MLL6611', unit:'Descriptive Complexity Theory',  staked: 7400, change24h:+2.1, apr:11.8, tier:'Verified', boost:false, sparkline:[30,33,32,36,38,41,40,44,46,48] },
  { rank:14, teacher:'Expert-YLM7722', unit:'Constraint Logic Programming',   staked: 6100, change24h:-0.5, apr:10.6, tier:'Verified', boost:false, sparkline:[52,50,54,51,49,52,48,50,46,45] },
  { rank:15, teacher:'Expert-NKG8833', unit:'Non-Monotonic Reasoning Systems',staked: 5200, change24h:+1.7, apr: 9.4, tier:'Rising',   boost:false, sparkline:[20,23,22,26,28,31,30,34,36,38] },
]
const EMERGING = [
  { rank:1,  teacher:'Expert-RVR9911', unit:'Probabilistic Logic Chains',   staked:14600, change24h:+1.4, apr:17.2, tier:'Expert',   boost:false, sparkline:[30,33,31,35,34,38,40,39,43,45] },
  { rank:2,  teacher:'Expert-PTL1022', unit:'Propositional Calculus',       staked:11200, change24h:-0.6, apr:14.8, tier:'Verified', boost:true,  sparkline:[50,48,52,49,47,50,46,48,44,43] },
  { rank:3,  teacher:'Expert-TNK2133', unit:'Recursive Reasoning Patterns', staked: 9400, change24h:+2.3, apr:13.1, tier:'Verified', boost:true,  sparkline:[28,30,29,33,35,38,36,40,42,44] },
  { rank:4,  teacher:'Expert-IBR3244', unit:'Causal Graph Theory',          staked: 7800, change24h:+3.5, apr:11.7, tier:'Verified', boost:false, sparkline:[20,23,22,26,29,33,31,36,38,41] },
  { rank:5,  teacher:'Expert-PRK4355', unit:'Modal Logic Systems',          staked: 6200, change24h:-1.2, apr:10.4, tier:'Rising',   boost:true,  sparkline:[42,40,44,41,39,42,38,40,36,35] },
  { rank:6,  teacher:'Expert-OSE5466', unit:'Spatial Cognition Patterns',   staked: 4900, change24h:+0.9, apr: 9.8, tier:'Rising',   boost:false, sparkline:[18,21,20,24,23,27,26,30,32,33] },
  { rank:7,  teacher:'Expert-SNT6577', unit:'Analogical Transfer Theory',    staked: 3700, change24h:+4.1, apr: 8.6, tier:'Rising',   boost:true,  sparkline:[14,17,16,20,23,27,25,30,34,38] },
  { rank:8,  teacher:'Expert-BGS7688', unit:'Information-Theoretic Logic',   staked: 3100, change24h:+2.7, apr: 7.9, tier:'Rising',   boost:false, sparkline:[12,15,14,18,21,25,23,28,32,36] },
  { rank:9,  teacher:'Expert-HNG8799', unit:'Dialectical Reasoning Frames',  staked: 2600, change24h:-0.3, apr: 6.8, tier:'Rising',   boost:false, sparkline:[40,38,42,39,37,40,36,38,34,33] },
  { rank:10, teacher:'Expert-OKF9800', unit:'Constructive Proof Methods',    staked: 2100, change24h:+5.6, apr: 5.9, tier:'Rising',   boost:true,  sparkline:[10,13,12,16,19,23,21,27,33,39] },
  { rank:11, teacher:'Expert-JHN1011', unit:'Argumentation Theory',          staked: 1700, change24h:+1.0, apr: 5.1, tier:'Emerging', boost:false, sparkline:[22,24,23,27,26,30,29,33,35,37] },
  { rank:12, teacher:'Expert-ALR2122', unit:'Epistemic Logic Foundations',   staked: 1200, change24h:+3.4, apr: 4.4, tier:'Emerging', boost:true,  sparkline:[ 8,11,10,14,17,21,19,25,31,36] },
  { rank:13, teacher:'Expert-OBI3233', unit:'Paraconsistent Logic',          staked:  890, change24h:+6.2, apr: 3.8, tier:'Emerging', boost:true,  sparkline:[ 6, 9, 8,12,15,19,17,23,29,34] },
  { rank:14, teacher:'Expert-VLK4344', unit:'Decision Theory Frameworks',    staked:  660, change24h:+1.8, apr: 3.1, tier:'Emerging', boost:false, sparkline:[18,20,19,23,22,26,25,29,31,32] },
  { rank:15, teacher:'Expert-ACH5455', unit:'Deontic Logic Systems',         staked:  440, change24h:+4.5, apr: 2.6, tier:'Emerging', boost:true,  sparkline:[ 4, 7, 6,10,13,17,15,21,27,32] },
]

// ── Macro / Micro ─────────────────────────────────────────────────────────────
const MACRO_STATS = [
  { label:'Total Value Locked',       value:'4,280,000', unit:'SPRK',           trend:'+12.4%',  good:true,  special:false },
  { label:'Global Logic Velocity',    value:'38,420',    unit:'sessions / day', trend:'+8.1%',   good:true,  special:false },
  { label:'L6 Talent Conversion',     value:'7.3',       unit:'%',              trend:'+2.1 pp', good:true,  special:false },
  { label:'Global Wisdom Dividends',  value:'1,280,450', unit:'SPRK',           trend:'+19.3%',  good:true,  special:true  },
]
const MICRO_STATS = [
  { label:'Staked Nodes',      value:'3',     unit:'active',     icon:'⬡', accent:GREEN    },
  { label:'Current Yield',     value:'12.4',  unit:'SPRK / day', icon:'◆', accent:GREEN    },
  { label:'Claimable Rewards', value:'847.2', unit:'SPRK',       icon:'◈', accent:CINNABAR },
  { label:'Portfolio ROI',     value:'+34.7', unit:'%',          icon:'↑', accent:GREEN    },
]

// ── Partners / Pools ──────────────────────────────────────────────────────────
const PARTNER_LOGOS = [
  { name:'NVIDIA Research',   initials:'NV', color:'#76B900' },
  { name:'Citadel · Quant',   initials:'CQ', color:'#3B82F6' },
  { name:'DeepMind',          initials:'DM', color:'#7C3AED' },
  { name:'Two Sigma',         initials:'TS', color:'#F59E0B' },
  { name:'Jane Street',       initials:'JS', color:'#6366F1' },
  { name:'Renaissance Tech',  initials:'RT', color:'#14B8A6' },
  { name:'D.E. Shaw',         initials:'DS', color:'#EC4899' },
  { name:'Bridgewater',       initials:'BW', color:'#8B5CF6' },
]

// Match-color lookup (used by TalentRadarWithAudit)
const DEMAND_CARDS = [
  { company:'NVIDIA Research', color:'#76B900' },
  { company:'Citadel · Quant', color:'#3B82F6' },
  { company:'DeepMind Research',color:'#7C3AED' },
]

const SCHOLARSHIP_POOLS = [
  { id:'p1',  name:`${EXPERT_ID} Wisdom Elite`,   minBloom:5, amount:18400, tier:'L5+', slots:12, locked: 8, color:GREEN,      match:'NVIDIA / Citadel',        desc:'Segment Diagram · Master Logic cohort' },
  { id:'p2',  name:'Euclidean Proof Fellow',      minBloom:4, amount: 9200, tier:'L4+', slots:20, locked:11, color:'#7C3AED', match:'DeepMind',                desc:'Formal proof & verification' },
  { id:'p3',  name:'Logic Velocity Cohort',       minBloom:3, amount: 6700, tier:'L3+', slots:35, locked:19, color:'#10B981', match:'Open',                    desc:'Speed-based logic training' },
  { id:'p4',  name:'Probabilistic Minds',         minBloom:3, amount: 4100, tier:'L3+', slots:40, locked:14, color:'#F59E0B', match:'Open',                    desc:'Statistical & probabilistic reasoning' },
  { id:'p5',  name:'Linear Algebra Quant Pool',   minBloom:5, amount:22000, tier:'L5+', slots:10, locked: 5, color:'#6366F1', match:'Two Sigma / Jane Street', desc:'Quantitative research fast track' },
  { id:'p6',  name:'AI Ethics Research Grant',    minBloom:4, amount:15500, tier:'L4+', slots:18, locked: 9, color:'#14B8A6', match:'DeepMind',                desc:'Responsible AI alignment track' },
  { id:'p7',  name:'Distributed Systems Fellow',  minBloom:5, amount:31000, tier:'L5+', slots: 8, locked: 3, color:'#EC4899', match:'Jane Street',             desc:'Consensus protocols & fault tolerance' },
  { id:'p8',  name:'Computational Geometry Track',minBloom:4, amount:12800, tier:'L4+', slots:15, locked: 7, color:'#F97316', match:'NVIDIA',                  desc:'Spatial reasoning & mesh algorithms' },
  { id:'p9',  name:'NLP Research Collective',     minBloom:4, amount: 8900, tier:'L4+', slots:22, locked:12, color:'#8B5CF6', match:'DeepMind',                desc:'Language model alignment & safety' },
  { id:'p10', name:'Causal AI Pioneer Grant',     minBloom:6, amount:48000, tier:'L6',  slots: 5, locked: 2, color:'#E63946', match:'Renaissance Tech',        desc:'Causal inference at sovereign level' },
]

// ── Verified skill tags per student (Braintrust-style) ────────────────────────
const SKILLS_MAP: Record<string, string[]> = {
  'STU_9412': ['Inductive Reasoning', 'Gwm:91', 'ZK-Verified'],
  'STU_7831': ['Symbolic Logic', 'Gs:94', 'ZK-Verified'],
  'STU_4207': ['Visual-Spatial', 'Gc:82', 'ZK-Verified'],
  'STU_6583': ['Fluid Reasoning', 'Gc:91', 'ZK-Verified'],
  'STU_3019': ['Processing Speed', 'Gwm:88', 'Pending Review'],
  'STU_8847': ['Fluid Reasoning', 'Gwm:93', 'L6 Sovereign'],
  'STU_2156': ['Visual-Spatial', 'Gf:82', 'ZK-Verified'],
}

// ── Enterprise Talent Pool (45 students, bloom 3–6) ──────────────────────────
interface EnterpriseTalent {
  id: string
  bloom: number
  tier: string
  sbt: 'Verified' | 'Pending'
  percentile: number
  chcPrimary: string
  chcScore: number
  skills: string[]
}
const ENTERPRISE_TALENT: EnterpriseTalent[] = [
  // Bloom 6 — L6 Sovereign
  { id:'ENT_001', bloom:6, tier:'L6 Sovereign',  sbt:'Verified', percentile:99, chcPrimary:'Gf',  chcScore:97, skills:['CPS','Inductive Reasoning','L6 Sovereign'] },
  { id:'ENT_002', bloom:6, tier:'L6 Sovereign',  sbt:'Verified', percentile:99, chcPrimary:'Gwm', chcScore:95, skills:['Dual-Task','Working Memory','L6 Sovereign'] },
  { id:'ENT_003', bloom:6, tier:'L6 Sovereign',  sbt:'Verified', percentile:98, chcPrimary:'Gv',  chcScore:94, skills:['Visualization','Mental Rotation','ZK-Verified'] },
  { id:'ENT_004', bloom:6, tier:'L6 Sovereign',  sbt:'Verified', percentile:98, chcPrimary:'Gf',  chcScore:96, skills:['RG Reasoning','Analogical','ZK-Verified'] },
  { id:'ENT_005', bloom:6, tier:'L6 Sovereign',  sbt:'Verified', percentile:99, chcPrimary:'Glr', chcScore:93, skills:['Originality','Assoc Memory','L6 Sovereign'] },
  // Bloom 5 — L5 Ascending
  { id:'ENT_006', bloom:5, tier:'L5 Ascending',  sbt:'Verified', percentile:97, chcPrimary:'Gf',  chcScore:92, skills:['Inductive Reasoning','Gs:94','ZK-Verified'] },
  { id:'ENT_007', bloom:5, tier:'L5 Ascending',  sbt:'Verified', percentile:96, chcPrimary:'Gwm', chcScore:91, skills:['Attentional Control','Gwm:91','ZK-Verified'] },
  { id:'ENT_008', bloom:5, tier:'L5 Ascending',  sbt:'Verified', percentile:95, chcPrimary:'Gq',  chcScore:93, skills:['QR Quant','SR2 Stats','ZK-Verified'] },
  { id:'ENT_009', bloom:5, tier:'L5 Ascending',  sbt:'Verified', percentile:94, chcPrimary:'Gf',  chcScore:90, skills:['CPS','RQ Quant','ZK-Verified'] },
  { id:'ENT_010', bloom:5, tier:'L5 Ascending',  sbt:'Verified', percentile:96, chcPrimary:'Gv',  chcScore:89, skills:['Imagery','Gv:89','ZK-Verified'] },
  { id:'ENT_011', bloom:5, tier:'L5 Ascending',  sbt:'Verified', percentile:93, chcPrimary:'Glr', chcScore:88, skills:['Ideational Fluency','FO Originality','ZK-Verified'] },
  { id:'ENT_012', bloom:5, tier:'L5 Ascending',  sbt:'Verified', percentile:95, chcPrimary:'Gf',  chcScore:91, skills:['Analogical','Gf:91','ZK-Verified'] },
  { id:'ENT_013', bloom:5, tier:'L5 Ascending',  sbt:'Pending',  percentile:92, chcPrimary:'Gwm', chcScore:90, skills:['Working Memory','DT Dual','Pending Review'] },
  { id:'ENT_014', bloom:5, tier:'L5 Ascending',  sbt:'Verified', percentile:94, chcPrimary:'Gs',  chcScore:93, skills:['Perceptual Speed','Gs:93','ZK-Verified'] },
  { id:'ENT_015', bloom:5, tier:'L5 Ascending',  sbt:'Verified', percentile:93, chcPrimary:'Gq',  chcScore:91, skills:['Math Proof','A3 Achievement','ZK-Verified'] },
  { id:'ENT_016', bloom:5, tier:'L5 Ascending',  sbt:'Verified', percentile:91, chcPrimary:'Gf',  chcScore:89, skills:['Sequential Deduction','RG','ZK-Verified'] },
  { id:'ENT_017', bloom:5, tier:'L5 Ascending',  sbt:'Pending',  percentile:90, chcPrimary:'Gv',  chcScore:87, skills:['Spatial Relations','SR','Pending Review'] },
  // Bloom 4 — L4 Strategist
  { id:'ENT_018', bloom:4, tier:'L4 Strategist', sbt:'Verified', percentile:89, chcPrimary:'Gf',  chcScore:87, skills:['Inductive Reasoning','Gf:87','ZK-Verified'] },
  { id:'ENT_019', bloom:4, tier:'L4 Strategist', sbt:'Verified', percentile:88, chcPrimary:'Gwm', chcScore:88, skills:['Working Memory','AC Control','ZK-Verified'] },
  { id:'ENT_020', bloom:4, tier:'L4 Strategist', sbt:'Verified', percentile:87, chcPrimary:'Gv',  chcScore:85, skills:['Visualization','MV Rotation','ZK-Verified'] },
  { id:'ENT_021', bloom:4, tier:'L4 Strategist', sbt:'Verified', percentile:86, chcPrimary:'Gq',  chcScore:86, skills:['QR Quant','NE Estimation','ZK-Verified'] },
  { id:'ENT_022', bloom:4, tier:'L4 Strategist', sbt:'Pending',  percentile:85, chcPrimary:'Gf',  chcScore:84, skills:['Piagetian','Rp Analogical','Pending Review'] },
  { id:'ENT_023', bloom:4, tier:'L4 Strategist', sbt:'Verified', percentile:88, chcPrimary:'Gc',  chcScore:87, skills:['Language Dev','KC Communication','ZK-Verified'] },
  { id:'ENT_024', bloom:4, tier:'L4 Strategist', sbt:'Verified', percentile:87, chcPrimary:'Glr', chcScore:84, skills:['Assoc Fluency','FA','ZK-Verified'] },
  { id:'ENT_025', bloom:4, tier:'L4 Strategist', sbt:'Verified', percentile:86, chcPrimary:'Gwm', chcScore:85, skills:['DT Dual-Task','Gwm:85','ZK-Verified'] },
  { id:'ENT_026', bloom:4, tier:'L4 Strategist', sbt:'Pending',  percentile:84, chcPrimary:'Gs',  chcScore:88, skills:['Number Facility','N Facility','Pending Review'] },
  { id:'ENT_027', bloom:4, tier:'L4 Strategist', sbt:'Verified', percentile:87, chcPrimary:'Gf',  chcScore:83, skills:['RQ Quant','Gf:83','ZK-Verified'] },
  { id:'ENT_028', bloom:4, tier:'L4 Strategist', sbt:'Verified', percentile:85, chcPrimary:'Gv',  chcScore:84, skills:['Closure Flexibility','CF','ZK-Verified'] },
  { id:'ENT_029', bloom:4, tier:'L4 Strategist', sbt:'Verified', percentile:84, chcPrimary:'Gq',  chcScore:85, skills:['Statistical Reasoning','SR2','ZK-Verified'] },
  { id:'ENT_030', bloom:4, tier:'L4 Strategist', sbt:'Pending',  percentile:83, chcPrimary:'Gf',  chcScore:82, skills:['CPS Problem Solving','Pending Review'] },
  { id:'ENT_031', bloom:4, tier:'L4 Strategist', sbt:'Verified', percentile:86, chcPrimary:'Gwm', chcScore:86, skills:['Memory Span','MS','ZK-Verified'] },
  { id:'ENT_032', bloom:4, tier:'L4 Strategist', sbt:'Verified', percentile:85, chcPrimary:'Gc',  chcScore:83, skills:['KC Communication','SG Grammar','ZK-Verified'] },
  // Bloom 3 — L3 Analyst
  { id:'ENT_033', bloom:3, tier:'L3 Analyst',    sbt:'Verified', percentile:82, chcPrimary:'Gf',  chcScore:79, skills:['RQ Quant','Gf:79','ZK-Verified'] },
  { id:'ENT_034', bloom:3, tier:'L3 Analyst',    sbt:'Pending',  percentile:80, chcPrimary:'Gwm', chcScore:80, skills:['Working Memory','MW Capacity','Pending Review'] },
  { id:'ENT_035', bloom:3, tier:'L3 Analyst',    sbt:'Verified', percentile:81, chcPrimary:'Gv',  chcScore:78, skills:['Spatial Relations','SR','ZK-Verified'] },
  { id:'ENT_036', bloom:3, tier:'L3 Analyst',    sbt:'Verified', percentile:79, chcPrimary:'Gc',  chcScore:77, skills:['Language Dev','LD','ZK-Verified'] },
  { id:'ENT_037', bloom:3, tier:'L3 Analyst',    sbt:'Pending',  percentile:78, chcPrimary:'Gs',  chcScore:82, skills:['Perceptual Speed','P Speed','Pending Review'] },
  { id:'ENT_038', bloom:3, tier:'L3 Analyst',    sbt:'Verified', percentile:80, chcPrimary:'Gf',  chcScore:76, skills:['RO Speed','Analogical','ZK-Verified'] },
  { id:'ENT_039', bloom:3, tier:'L3 Analyst',    sbt:'Verified', percentile:79, chcPrimary:'Glr', chcScore:77, skills:['Assoc Memory','MA','ZK-Verified'] },
  { id:'ENT_040', bloom:3, tier:'L3 Analyst',    sbt:'Pending',  percentile:77, chcPrimary:'Gq',  chcScore:75, skills:['Math Knowledge','KM','Pending Review'] },
  { id:'ENT_041', bloom:3, tier:'L3 Analyst',    sbt:'Verified', percentile:78, chcPrimary:'Gv',  chcScore:76, skills:['Spatial Scanning','SS','ZK-Verified'] },
  { id:'ENT_042', bloom:3, tier:'L3 Analyst',    sbt:'Verified', percentile:77, chcPrimary:'Gwm', chcScore:78, skills:['Memory Span','Scm Spatial','ZK-Verified'] },
  { id:'ENT_043', bloom:3, tier:'L3 Analyst',    sbt:'Pending',  percentile:76, chcPrimary:'Gc',  chcScore:74, skills:['Oral Fluency','KO','Pending Review'] },
  { id:'ENT_044', bloom:3, tier:'L3 Analyst',    sbt:'Verified', percentile:78, chcPrimary:'Gf',  chcScore:77, skills:['Piagetian','Pf','ZK-Verified'] },
  { id:'ENT_045', bloom:3, tier:'L3 Analyst',    sbt:'Verified', percentile:75, chcPrimary:'Gs',  chcScore:80, skills:['Reading Speed','R9','ZK-Verified'] },
]

// ── Talent ────────────────────────────────────────────────────────────────────
const CHC_AXES = ['Gf','Gc','Gwm','Gv','Gs'] as const
type CHCKey = typeof CHC_AXES[number]
interface Student { id:string; bloom:number; tier:string; match:string; sbt:'Verified'|'Pending'; percentile:number; chc:Record<CHCKey,number> }
const TALENT_POOL: Student[] = [
  { id:'STU_9412', bloom:4, tier:'L4 Strategist', match:'NVIDIA',   sbt:'Verified', percentile:91, chc:{Gf:84,Gc:78,Gwm:91,Gv:88,Gs:72} },
  { id:'STU_7831', bloom:5, tier:'L5 Ascending',  match:'Citadel',  sbt:'Verified', percentile:97, chc:{Gf:92,Gc:85,Gwm:88,Gv:76,Gs:94} },
  { id:'STU_4207', bloom:3, tier:'L3 Analyst',    match:'DeepMind', sbt:'Verified', percentile:84, chc:{Gf:76,Gc:82,Gwm:79,Gv:91,Gs:84} },
  { id:'STU_6583', bloom:5, tier:'L5 Ascending',  match:'NVIDIA',   sbt:'Verified', percentile:96, chc:{Gf:89,Gc:91,Gwm:85,Gv:83,Gs:88} },
  { id:'STU_3019', bloom:4, tier:'L4 Strategist', match:'Citadel',  sbt:'Pending',  percentile:88, chc:{Gf:77,Gc:74,Gwm:88,Gv:79,Gs:95} },
  { id:'STU_8847', bloom:6, tier:'L6 Sovereign',  match:'DeepMind', sbt:'Verified', percentile:99, chc:{Gf:96,Gc:89,Gwm:93,Gv:88,Gs:91} },
  { id:'STU_2156', bloom:4, tier:'L4 Strategist', match:'NVIDIA',   sbt:'Verified', percentile:89, chc:{Gf:82,Gc:79,Gwm:84,Gv:94,Gs:77} },
]

// ── CHC Audit (66 narrow abilities × Bloom associations) ──────────────────────
const CHC_AUDIT = [
  { key:'Gf',  name:'Fluid Intelligence',       color:'#3B82F6', abilities:[
    { code:'I',   name:'Inductive Reasoning',            blooms:[4,5,6] },
    { code:'RG',  name:'Sequential Deductive Reasoning', blooms:[4,5,6] },
    { code:'RQ',  name:'Quantitative Reasoning',         blooms:[3,4,5] },
    { code:'Pf',  name:'Piagetian Reasoning',            blooms:[3,4]   },
    { code:'RO',  name:'Speed of Reasoning',             blooms:[3,4,5] },
    { code:'Rp',  name:'Analogical Reasoning',           blooms:[4,5,6] },
    { code:'CPS', name:'Complex Problem Solving',        blooms:[5,6]   },
    { code:'Rq',  name:'Relational Analogies',           blooms:[3,4]   },
  ]},
  { key:'Gc',  name:'Crystallized Intelligence', color:'#10B981', abilities:[
    { code:'VL',  name:'Lexical Knowledge',              blooms:[1,2]   },
    { code:'LD',  name:'Language Development',           blooms:[1,2,3] },
    { code:'K0',  name:'General World Knowledge',        blooms:[1,2]   },
    { code:'KO',  name:'Oral Fluency',                   blooms:[2,3]   },
    { code:'LS',  name:'Listening Ability',              blooms:[2,3]   },
    { code:'KC',  name:'Communication Ability',          blooms:[2,3,4] },
    { code:'K2',  name:'Cultural Knowledge',             blooms:[1,2]   },
    { code:'SG',  name:'Grammatical Sensitivity',        blooms:[2,3]   },
    { code:'MY',  name:'Foreign Language Proficiency',   blooms:[2,3]   },
  ]},
  { key:'Gwm', name:'Working Memory',            color:'#6366F1', abilities:[
    { code:'MW',  name:'Working Memory Capacity',        blooms:[2,3,4] },
    { code:'MS',  name:'Memory Span',                    blooms:[1,2]   },
    { code:'Scm', name:'Spatial Memory Coding',          blooms:[2,3]   },
    { code:'DT',  name:'Dual-Task Performance',          blooms:[3,4]   },
    { code:'AC',  name:'Attentional Control',            blooms:[3,4,5] },
  ]},
  { key:'Gv',  name:'Visual-Spatial Ability',    color:'#F59E0B', abilities:[
    { code:'SR',  name:'Spatial Relations',              blooms:[3,4]   },
    { code:'Vz',  name:'Visualization',                  blooms:[3,4,5] },
    { code:'CF',  name:'Closure Flexibility',            blooms:[3,4]   },
    { code:'SS',  name:'Spatial Scanning',               blooms:[2,3]   },
    { code:'CS',  name:'Speed of Closure',               blooms:[2,3]   },
    { code:'PI',  name:'Perceptual Illusions',           blooms:[3,4]   },
    { code:'MV',  name:'Mental Rotation',                blooms:[3,4,5] },
    { code:'SI',  name:'Serial Integration',             blooms:[3,4]   },
    { code:'IM',  name:'Imagery',                        blooms:[4,5,6] },
  ]},
  { key:'Ga',  name:'Auditory Processing',       color:'#EC4899', abilities:[
    { code:'PC',  name:'Phonetic Coding',                blooms:[1,2]   },
    { code:'US',  name:'Speech Sound Discrimination',    blooms:[1,2]   },
    { code:'UR',  name:'Resistance to Distortion',       blooms:[2,3]   },
    { code:'Um',  name:'Musical Discrimination',         blooms:[2,3,4] },
    { code:'RC',  name:'Rhythm',                         blooms:[1,2,3] },
    { code:'AP',  name:'Absolute Pitch',                 blooms:[1,2]   },
    { code:'SMP', name:'Memory for Sound Patterns',      blooms:[2,3]   },
    { code:'SL',  name:'Sound Localization',             blooms:[1,2]   },
  ]},
  { key:'Glr', name:'Long-Term Retrieval',        color:'#14B8A6', abilities:[
    { code:'MA',  name:'Associative Memory',             blooms:[1,2,3] },
    { code:'MM',  name:'Meaningful Memory',              blooms:[2,3]   },
    { code:'MF',  name:'Free Recall Memory',             blooms:[1,2]   },
    { code:'NA',  name:'Naming Facility',                blooms:[1,2]   },
    { code:'FW',  name:'Word Fluency',                   blooms:[2,3]   },
    { code:'FI',  name:'Ideational Fluency',             blooms:[4,5,6] },
    { code:'FE',  name:'Expressional Fluency',           blooms:[3,4,5] },
    { code:'FO',  name:'Originality / Creativity',       blooms:[5,6]   },
    { code:'FA',  name:'Associational Fluency',          blooms:[4,5]   },
  ]},
  { key:'Gs',  name:'Processing Speed',          color:'#8B5CF6', abilities:[
    { code:'P',   name:'Perceptual Speed',               blooms:[1,2]   },
    { code:'N',   name:'Number Facility',                blooms:[1,2,3] },
    { code:'R9',  name:'Reading Speed',                  blooms:[2,3]   },
    { code:'R4',  name:'Writing Speed',                  blooms:[2,3]   },
    { code:'Rc',  name:'Rate-of-Test-Taking',            blooms:[1,2]   },
  ]},
  { key:'Gq',  name:'Quantitative Knowledge',    color:'#F97316', abilities:[
    { code:'KM',  name:'Mathematical Knowledge',         blooms:[1,2,3] },
    { code:'A3',  name:'Mathematical Achievement',       blooms:[3,4,5] },
    { code:'QR',  name:'Quantitative Reasoning',         blooms:[4,5,6] },
    { code:'SR2', name:'Statistical Reasoning',          blooms:[4,5,6] },
    { code:'NE',  name:'Numerical Estimation',           blooms:[3,4]   },
  ]},
]

// ── Bloom ─────────────────────────────────────────────────────────────────────
const BLOOM_LABELS  = ['Remember','Understand','Apply','Analyze','Evaluate','Create']
const BLOOM_COLORS  = ['#94A3B8','#60A5FA','#34D399','#FBBF24', CINNABAR,'#A855F7']
const BLOOM_HEIGHTS = [24, 38, 52, 66, 80, 94]

// ── Ticker ───────────────────────────────────────────────────────────────────
const TICKER_MSGS = [
  '[TX] 0x7a3f…cD2 → 5,000 SPRK staked · Dynamic Segment Analysis · APR 38.4%',
  '[AUDIT] Unit #Gf-21 · ZK-Proof verified · Bloom L6 × Create confirmed on-chain',
  '[TX] Institutional_Node_04 acquired 12,000 SPRK in Euclidean Proof Systems',
  '[MATCH] STU_8847 · L6 Sovereign · P99 · DeepMind Research seat confirmed',
  '[AUDIT] Hash 0x88…f2 → Gf × RG × CPS integrity check passed · 3 nodes',
  '[TX] 0xB91c…4aF reinvested 8,400 SPRK · Inductive Reasoning Framework +2.7%',
  '[POOL] Zhang Logic Elite · 18,400 SPRK auto-disbursed to 12 matched candidates',
  '[AUDIT] Unit #Gwm-07 · Working Memory Capacity · Bloom L4–L6 · ZK-sealed',
  '[TX] 0x3d82…7eE → Meeting-Separating Logic · 2,200 SPRK · 24h Δ +3.1%',
  '[MATCH] Citadel · Quant unlocked STU_7831 interview · P97 · Gs:94',
  '[AUDIT] Protocol Health · 2,847 ZK nodes active · 0 anomalies detected',
  '[TX] 0xFc94…1bB staked 3,600 SPRK · Probabilistic Logic Chains · tier Expert',
]

const RATES: Record<'AUD'|'USDC'|'SGD', number> = { AUD:0.42, USDC:0.28, SGD:0.31 }

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString()
const AXIS_COLORS = ['#3B82F6','#10B981','#6366F1','#F59E0B', CINNABAR]

function pentagonPt(cx:number,cy:number,r:number,idx:number,pct:number) {
  const a = -Math.PI/2 + idx*(2*Math.PI/5)
  return { x: cx+r*pct*Math.cos(a), y: cy+r*pct*Math.sin(a) }
}
function pentagon5pts(cx:number,cy:number,r:number,pcts:number[]) {
  return pcts.map((_,i)=>pentagonPt(cx,cy,r,i,pcts[i])).map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
}
function gridPts(cx:number,cy:number,r:number) {
  return Array.from({length:5},(_,i)=>pentagonPt(cx,cy,r,i,1)).map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
}

// ════════════════════════════════════════════════════════════════════════════
// MiniSparkline — 1px precision line, no fill
function MiniSparkline({ pts, color=CINNABAR }:{ pts:number[]; color?:string }) {
  const W=60,H=22,mn=Math.min(...pts),mx=Math.max(...pts),rng=mx-mn||1
  const d=pts.map((v,i)=>`${i===0?'M':'L'}${((i/(pts.length-1))*W).toFixed(1)},${(H-((v-mn)/rng)*(H-4)-2).toFixed(1)}`).join(' ')
  return <svg width={W} height={H} style={{display:'block',flexShrink:0}}><path d={d} fill="none" stroke={color} strokeWidth={1} strokeLinecap="round" strokeLinejoin="round"/></svg>
}

// AuditChart — full-width chart for the side drawer
function AuditChart({ pts, color }:{ pts:number[]; color:string }) {
  const W=344,H=72,mn=Math.min(...pts),mx=Math.max(...pts),rng=mx-mn||1
  const d=pts.map((v,i)=>`${i===0?'M':'L'}${((i/(pts.length-1))*W).toFixed(1)},${(H-((v-mn)/rng)*(H-8)-4).toFixed(1)}`).join(' ')
  return <svg width={W} height={H} style={{display:'block',overflow:'visible'}}><path d={d} fill="none" stroke={color} strokeWidth={1} strokeLinecap="round" strokeLinejoin="round"/></svg>
}

// ── Messari-style Frame 01 data ───────────────────────────────────────────────
const TVL_SERIES       = [3.82,3.91,3.88,3.95,4.02,3.98,4.10,4.18,4.22,4.28]
const VELOCITY_SERIES  = [28.4,29.1,30.2,31.8,32.4,33.1,34.8,35.9,37.2,38.4]
const DIVIDEND_SERIES  = [850,890,920,960,1020,1080,1120,1180,1240,1280]

const TREEMAP_NODES = [
  { label:'Mathematics',          abbr:'MATH', value:84200, color:'#E63946', chc:'Gf · Gq'  },
  { label:'Computer Science',     abbr:'CS',   value:61800, color:'#3B82F6', chc:'Gf · Gs'  },
  { label:'Logic & Proofs',       abbr:'LGIC', value:48500, color:'#6366F1', chc:'Gf'       },
  { label:'Physics',              abbr:'PHYS', value:37200, color:'#10B981', chc:'Gv · Gq'  },
  { label:'Causal Inference',     abbr:'CAUS', value:29800, color:'#F59E0B', chc:'Gf'       },
  { label:'Statistics',           abbr:'STAT', value:24100, color:'#14B8A6', chc:'Gq'       },
  { label:'Cognitive Science',    abbr:'COGN', value:19600, color:'#E63946', chc:'Gwm'      },
  { label:'NLP & Semantics',      abbr:'NLP',  value:16400, color:'#8B5CF6', chc:'Gc · Gf'  },
  { label:'Distributed Systems',  abbr:'DIST', value:13100, color:'#EC4899', chc:'Gwm'      },
  { label:'Linguistics',          abbr:'LING', value:10200, color:'#F97316', chc:'Gc'       },
  { label:'Cryptography',         abbr:'CRPT', value: 8700, color:'#6366F1', chc:'Gf · Gs'  },
  { label:'Data Structures',      abbr:'DSTR', value: 6900, color:'#10B981', chc:'Gf'       },
]

// ── Treemap layout (binary slice-and-dice) ───────────────────────────────────
type TNode = typeof TREEMAP_NODES[0]
type TRect = { x:number; y:number; w:number; h:number; item:TNode }
function computeTreemap(items:TNode[], W:number, H:number, horiz=true): TRect[] {
  if (!items.length) return []
  if (items.length===1) return [{x:0,y:0,w:W,h:H,item:items[0]}]
  const sorted=[...items].sort((a,b)=>b.value-a.value)
  function layout(its:TNode[],x:number,y:number,w:number,h:number,hz:boolean):TRect[]{
    if(!its.length) return []
    if(its.length===1) return [{x,y,w,h,item:its[0]}]
    const sum=its.reduce((s,i)=>s+i.value,0)
    let acc=0,mid=its.length-1
    for(let i=0;i<its.length-1;i++){acc+=its[i].value;if(acc/sum>=0.5){mid=i+1;break}}
    const r=its.slice(0,mid).reduce((s,i)=>s+i.value,0)/sum
    if(hz){const w1=Math.floor(w*r);return[...layout(its.slice(0,mid),x,y,w1,h,false),...layout(its.slice(mid),x+w1,y,w-w1,h,false)]}
    const h1=Math.floor(h*r);return[...layout(its.slice(0,mid),x,y,w,h1,true),...layout(its.slice(mid),x,y+h1,w,h-h1,true)]
  }
  return layout(sorted,0,0,W,H,horiz)
}

// ── AreaChart ─────────────────────────────────────────────────────────────────
function AreaChart({pts,label,value,unit,trend,good,flash=false}:{
  pts:number[];label:string;value:string;unit:string;trend:string;good:boolean;flash?:boolean
}) {
  const VW=220,VH=76,mn=Math.min(...pts),mx=Math.max(...pts),rng=mx-mn||1
  const toX=(i:number)=>1+(i/(pts.length-1))*(VW-2)
  const toY=(v:number)=>2+((mx-v)/rng)*(VH-8)
  const linePts=pts.map((v,i)=>({x:toX(i),y:toY(v)}))
  const line=linePts.map((p,i)=>`${i===0?'M':'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')
  const area=`${line} L${toX(pts.length-1)},${VH} L${toX(0)},${VH} Z`
  const gId=`ac${label.replace(/\W/g,'')}`
  return (
    <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column'}}>
      {/* Label */}
      <p style={{margin:'0 0 7px',fontSize:9,fontWeight:700,color:SUBTLE,letterSpacing:'0.12em',textTransform:'uppercase',fontFamily:'monospace'}}>{label}</p>
      {/* Big value — flashes green on royalties update */}
      <div style={{display:'flex',alignItems:'baseline',gap:6,marginBottom:10}}>
        <span style={{
          fontSize:26,fontWeight:800,fontFamily:'monospace',lineHeight:1,letterSpacing:'-0.03em',
          color: flash ? GREEN : INK,
          transition: flash ? 'color 0.15s ease' : 'color 1.6s ease',
        }}>{value}</span>
        <span style={{fontSize:10,color:SUBTLE,fontFamily:'monospace',paddingBottom:2}}>{unit}</span>
        {flash && (
          <span style={{fontSize:9,fontWeight:700,color:GREEN,fontFamily:'monospace',
            animation:'pulse-green 0.8s ease-in-out 2',letterSpacing:'0.04em'}}>
            ↑ LIVE
          </span>
        )}
      </div>
      {/* SVG area chart — fixed viewBox, natural aspect, 1px line */}
      <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{display:'block',overflow:'visible'}}>
        <defs>
          <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={CINNABAR} stopOpacity="0.09"/>
            <stop offset="100%" stopColor={CINNABAR} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gId})`}/>
        <path d={line} fill="none" stroke={CINNABAR} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{animation:'line-pulse 3s ease-in-out infinite'}}/>
      </svg>
      {/* Footer hairline */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8,paddingTop:7,borderTop:'1px solid #F3F4F6'}}>
        <span style={{fontSize:9,color:SUBTLE,fontFamily:'monospace'}}>7d</span>
        <span style={{fontSize:10.5,fontWeight:700,color:good?GREEN:CINNABAR,fontFamily:'monospace'}}>{trend}</span>
      </div>
    </div>
  )
}

// ── CognitiveTreemap ──────────────────────────────────────────────────────────
function CognitiveTreemap() {
  const ref=useRef<HTMLDivElement>(null)
  const [W,setW]=useState(900)
  const [hov,setHov]=useState<string|null>(null)
  useEffect(()=>{
    if(!ref.current)return
    const obs=new ResizeObserver(e=>setW(e[0].contentRect.width))
    obs.observe(ref.current)
    setW(ref.current.clientWidth)
    return ()=>obs.disconnect()
  },[])
  const H=200
  const GAP=2
  const rects=computeTreemap(TREEMAP_NODES,W,H)
  const hovNode=TREEMAP_NODES.find(n=>n.label===hov)
  return (
    <div>
      {/* Header row */}
      <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',marginBottom:10}}>
        <p style={{margin:0,fontSize:9,fontWeight:700,color:SUBTLE,letterSpacing:'0.12em',textTransform:'uppercase',fontFamily:'monospace'}}>Mindshare Distribution · Global Liquidity by Discipline</p>
        <p style={{margin:0,fontSize:9,color:SUBTLE,fontFamily:'monospace'}}>hover to inspect</p>
      </div>

      {/* Treemap container */}
      <div ref={ref} style={{position:'relative',height:H,border:'1px solid #F3F4F6',background:'#FFFFFF',overflow:'hidden'}}>
        {rects.map(r=>{
          const active=hov===r.item.label
          const dimmed=!!hov&&!active
          return (
            <motion.div
              key={r.item.label}
              onHoverStart={()=>setHov(r.item.label)}
              onHoverEnd={()=>setHov(null)}
              animate={{
                background:active?`${r.item.color}08`:'#FFFFFF',
                borderColor:active?r.item.color:'#F3F4F6',
                opacity:dimmed?0.38:1,
              }}
              transition={{duration:0.1}}
              style={{
                position:'absolute',
                left:r.x+GAP,top:r.y+GAP,
                width:Math.max(0,r.w-GAP*2),height:Math.max(0,r.h-GAP*2),
                border:'1px solid #F3F4F6',
                borderLeft:active?`2px solid ${r.item.color}`:'1px solid #F3F4F6',
                overflow:'hidden',cursor:'default',
                display:'flex',flexDirection:'column',
                justifyContent:'flex-end',padding:'5px 7px',
                boxSizing:'border-box',
              }}
            >
              {r.w>52&&r.h>26&&(
                <p style={{
                  margin:0,fontSize:Math.min(11,Math.max(8,r.w/14)),fontWeight:700,
                  color:active?r.item.color:INK,lineHeight:1.2,userSelect:'none',
                  whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',
                }}>{r.w<78?r.item.abbr:r.h<42?r.item.abbr:r.item.label}</p>
              )}
              {r.w>72&&r.h>46&&(
                <p style={{margin:'2px 0 0',fontSize:8.5,color:SUBTLE,fontFamily:'monospace',userSelect:'none'}}>
                  {fmt(r.item.value)} SPRK
                </p>
              )}
            </motion.div>
          )
        })}

        {/* Tooltip */}
        <AnimatePresence>
          {hovNode&&(
            <motion.div
              initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} exit={{opacity:0}}
              style={{
                position:'absolute',bottom:10,right:10,zIndex:10,
                background:'rgba(17,24,39,0.90)',color:'#fff',
                padding:'7px 12px',pointerEvents:'none',minWidth:168,
              }}
            >
              <p style={{margin:'0 0 2px',fontSize:11,fontWeight:700,fontFamily:'monospace'}}>{hovNode.label}</p>
              <p style={{margin:'0 0 1px',fontSize:9.5,opacity:0.6,fontFamily:'monospace'}}>Domain: {hovNode.chc}</p>
              <p style={{margin:0,fontSize:10.5,fontFamily:'monospace',color:hovNode.color}}>{fmt(hovNode.value)} SPRK</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── ProtocolRecap ─────────────────────────────────────────────────────────────
const RECAP_FOLD = 3   // rows visible when collapsed

function ProtocolRecap() {
  const [expanded, setExpanded] = useState(false)
  const [query, setQuery]       = useState('')

  const allMetrics = [
    { key:'Logic Units Audited',   val:'12,847 units',   hot:false },
    { key:'Avg Trust Score',       val:'94.2 / 100',     hot:true  },
    { key:'Daily Consensus Flow',  val:'38.4k nodes',    hot:true  },
    { key:'Active Contributors',   val:'3,291',          hot:false },
    { key:'TVL Delta 7d',          val:'+48,200 SPRK',   hot:true  },
    { key:'L6 Credentials',        val:'1 issued',       hot:false },
    { key:'Enterprise Demand',     val:'90-day high',    hot:false },
    { key:'Protocol Health',       val:'Optimal',        hot:false },
  ]

  const metrics  = query
    ? allMetrics.filter(m => m.key.toLowerCase().includes(query.toLowerCase()))
    : allMetrics
  const visible  = expanded ? metrics : metrics.slice(0, RECAP_FOLD)
  const hiddenCt = Math.max(0, metrics.length - RECAP_FOLD)

  return (
    <div style={{borderRight:'1px solid #F3F4F6',paddingRight:36}}>
      {/* Eyebrow + date */}
      <p style={{margin:'0 0 2px',fontSize:8.5,fontWeight:800,color:CINNABAR,letterSpacing:'0.18em',textTransform:'uppercase',fontFamily:'monospace'}}>Protocol Audit Recap</p>
      <p style={{margin:'0 0 12px',fontSize:9,color:SUBTLE,fontFamily:'monospace',letterSpacing:'0.04em'}}>Apr 07 – 14, 2026 · Global</p>

      {/* Search bar */}
      <div style={{position:'relative',marginBottom:14}}>
        <span style={{
          position:'absolute',left:9,top:'50%',transform:'translateY(-50%)',
          fontSize:10,color:SUBTLE,pointerEvents:'none',lineHeight:1,
        }}>⌕</span>
        <input
          value={query}
          onChange={e=>setQuery(e.target.value)}
          placeholder="Audit by ID / Creator…"
          style={{
            width:'100%',boxSizing:'border-box',
            paddingLeft:26,paddingRight:10,paddingTop:5,paddingBottom:5,
            border:'1px solid #E9ECEF',borderRadius:6,
            fontSize:10.5,color:INK,background:'#FAFAFA',
            outline:'none',fontFamily:'monospace',
          }}
        />
      </div>

      {/* Big title */}
      <p style={{margin:0,fontSize:17,fontWeight:800,color:INK,lineHeight:1.2,letterSpacing:'-0.02em'}}>Global Logic<br/>Index</p>
      <div style={{width:20,height:1,background:CINNABAR,margin:'8px 0 12px'}}/>

      {/* Monospace bullet metrics — animated height, hidden scrollbar */}
      <div style={{position:'relative'}}>
        <AnimatePresence initial={false}>
          <motion.div
            key={expanded?'open':'closed'}
            initial={{height: expanded ? 'auto' : undefined, opacity:0}}
            animate={{height:'auto', opacity:1}}
            exit={{opacity:0}}
            transition={{duration:0.28, ease:[0.22,1,0.36,1]}}
            style={{overflow:'hidden'}}
          >
            <div style={{display:'flex',flexDirection:'column'}}>
              {visible.map((m,i)=>(
                <div key={m.key} style={{
                  display:'flex',alignItems:'baseline',gap:7,
                  padding:'4px 0',
                  borderBottom:i<visible.length-1?'1px solid #F3F4F6':'none',
                }}>
                  <span style={{color:CINNABAR,fontSize:11,lineHeight:1,flexShrink:0,marginTop:1}}>·</span>
                  <span style={{flex:1,fontSize:10,color:MUTED,fontFamily:'monospace',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{m.key}</span>
                  <span style={{
                    fontSize:10.5,fontWeight:700,color:m.hot?CINNABAR:INK,fontFamily:'monospace',whiteSpace:'nowrap',
                    ...(m.hot ? {animation:'val-glow 2.8s ease-in-out infinite'} : {}),
                  }}>{m.val}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom fade + toggle — only when collapsed */}
        {!expanded && (
          <div style={{
            position:'relative',
            marginTop:0,
            paddingTop:4,
            borderTop:'1px solid #F3F4F6',
            display:'flex',alignItems:'center',justifyContent:'space-between',
          }}>
            <span style={{fontSize:9,color:SUBTLE,fontFamily:'monospace'}}>{hiddenCt} more signals</span>
            <button
              onClick={()=>setExpanded(true)}
              style={{
                background:'none',border:'none',cursor:'pointer',padding:'2px 0',
                fontSize:9,fontWeight:700,color:CINNABAR,fontFamily:'monospace',
                letterSpacing:'0.06em',textTransform:'uppercase',
              }}
            >Read More ↓</button>
          </div>
        )}
        {expanded && (
          <div style={{
            paddingTop:4,borderTop:'1px solid #F3F4F6',
            display:'flex',justifyContent:'flex-end',
          }}>
            <button
              onClick={()=>setExpanded(false)}
              style={{
                background:'none',border:'none',cursor:'pointer',padding:'2px 0',
                fontSize:9,fontWeight:700,color:SUBTLE,fontFamily:'monospace',
                letterSpacing:'0.06em',textTransform:'uppercase',
              }}
            >Collapse ↑</button>
          </div>
        )}
      </div>
    </div>
  )
}

// FrameDivider
function FrameDivider({ n, label }:{ n:number; label:string }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:14,...WRAP}}>
      <div style={{flex:1,height:1,background:BORDER}}/>
      <div style={{display:'flex',alignItems:'center',gap:7,padding:'5px 16px',background:CARD,border:`1px solid ${BORDER}`,borderRadius:999,boxShadow:SH,whiteSpace:'nowrap'}}>
        <span style={{fontSize:10,fontWeight:800,color:CINNABAR,letterSpacing:'0.08em'}}>{String(n).padStart(2,'0')}</span>
        <span style={{width:1,height:12,background:BORDER,display:'inline-block'}}/>
        <span style={{fontSize:11,fontWeight:600,color:MUTED,letterSpacing:'0.04em'}}>{label}</span>
      </div>
      <div style={{flex:1,height:1,background:BORDER}}/>
    </div>
  )
}

// ── WalletWidget ──────────────────────────────────────────────────────────────
function WalletWidget({ stakedAt = 0 }: { stakedAt?: number }) {
  const { depositSprk } = useSparkle()
  const [open,setOpen]       = useState(false)
  const [cashOut,setCashOut] = useState(false)
  const [cur,setCur]         = useState<'AUD'|'USDC'|'SGD'>('AUD')
  const [amt,setAmt]         = useState('')
  const [stage,setStage]     = useState<'idle'|'confirming'|'processing'|'done'>('idle')
  // ── Deposit flow state ──────────────────────────────────────────────────────
  const [sprkBalance,  setSprkBalance]  = useState(2384.60)
  const [depositFlash, setDepositFlash] = useState(false)
  // ── Royalties roll-up state ─────────────────────────────────────────────────
  const [royalties,    setRoyalties]    = useState(1875.20)
  const [investorDist, setInvestorDist] = useState(420.00)
  const [royFlash,     setRoyFlash]     = useState(false)
  const prevStakedAt   = useRef(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(()=>{
    const h=(e:MouseEvent)=>{ if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false) }
    document.addEventListener('mousedown',h); return ()=>document.removeEventListener('mousedown',h)
  },[])

  // Deposit: SPRK balance 2,384.60 → 2,400.00 + 1.5 s green flash
  // Also syncs global protocolBalance → 25.0 so the Nav Credits pill jumps
  function doDeposit() {
    setSprkBalance(2400.00)
    setDepositFlash(true)
    setTimeout(() => setDepositFlash(false), 1500)
    depositSprk()   // Nav Credits: current → 25.0
  }

  // Count-from-0 roll-up when staking completes and user scrolls back to Frame 1
  useEffect(() => {
    if (!stakedAt || stakedAt === prevStakedAt.current) return
    prevStakedAt.current = stakedAt
    // Snapshot current targets (royalties may already have been set by deposit)
    const targetS = sprkBalance   // 2400 after deposit
    const targetR = royalties + 14.80
    const targetI = investorDist + 6.20
    // Animate everything from 0 → target
    setSprkBalance(0)
    setRoyalties(0)
    setInvestorDist(0)
    const DURATION = 1400
    const t0 = performance.now()
    function tick(now: number) {
      const p = Math.min((now - t0) / DURATION, 1)
      const e = 1 - Math.pow(1 - p, 3)
      setSprkBalance(parseFloat((e * targetS).toFixed(2)))
      setRoyalties(parseFloat((e * targetR).toFixed(2)))
      setInvestorDist(parseFloat((e * targetI).toFixed(2)))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    setRoyFlash(true)
    setTimeout(() => setRoyFlash(false), 1500)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stakedAt])

  const fiatVal = amt ? (parseFloat(amt)*RATES[cur]).toFixed(2) : '0.00'
  function doWithdraw(){ setStage('confirming'); setTimeout(()=>setStage('processing'),800); setTimeout(()=>setStage('done'),2400) }

  return (
    <div ref={ref} style={{position:'relative'}}>
      <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.97}} onClick={()=>setOpen(v=>!v)} style={{
        display:'flex',alignItems:'center',gap:9,padding:'9px 16px',
        background: depositFlash ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.82)',
        backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',
        border:`1.5px solid ${depositFlash ? GREEN : CINNABAR}`,borderRadius:12,boxShadow:depositFlash?'0 4px 20px rgba(16,185,129,0.20)':SH_RED,
        cursor:'pointer',fontSize:13,fontWeight:600,color:INK,
        transition:'background 0.3s,border-color 0.3s,box-shadow 0.3s',
      }}>
        <span style={{fontSize:15}}>◈</span>
        <span>{sprkBalance >= 2400 ? '2,400' : '2,384'} SPRK</span>
        <motion.span animate={{rotate:open?180:0}} style={{fontSize:9,color:MUTED}}>▼</motion.span>
      </motion.button>

      <AnimatePresence>
        {open&&(
          <motion.div
            initial={{opacity:0,y:-8,scale:0.97}} animate={{opacity:1,y:0,scale:1}}
            exit={{opacity:0,y:-8,scale:0.97}} transition={{duration:0.2,ease:EASE}}
            style={{
              position:'absolute',top:'calc(100% + 10px)',right:0,width:320,zIndex:200,
              background:'rgba(255,255,255,0.96)',backdropFilter:'blur(32px)',WebkitBackdropFilter:'blur(32px)',
              border:`1px solid ${BORDER}`,borderRadius:16,
              boxShadow:'0 12px 40px rgba(0,0,0,0.08)',overflow:'hidden',
            }}
          >
            <div style={{padding:'18px 20px 12px',borderBottom:`1px solid ${BORDER}`}}>
              <p style={{margin:0,fontSize:10,fontWeight:700,color:MUTED,letterSpacing:'0.08em',textTransform:'uppercase'}}>SPRK Balance</p>
              <p style={{margin:'4px 0 0',fontSize:26,fontWeight:800,
                color: depositFlash ? GREEN : INK,letterSpacing:'-0.5px',
                transition:'color 0.3s'}}>
                {sprkBalance.toFixed(2)} <span style={{fontSize:13,fontWeight:500,color:MUTED}}>SPRK</span>
              </p>
              <p style={{margin:'2px 0 5px',fontSize:12,color:MUTED}}>≈ USD {(sprkBalance*0.28).toFixed(2)}</p>
              <p style={{margin:0,fontSize:11,fontWeight:600,color: depositFlash ? GREEN : CINNABAR,transition:'color 0.3s'}}>
                {depositFlash ? '✓ Deposit confirmed — +15.40 SPRK' : '⚡ Instant liquidity by Sparkle AMM.'}
              </p>
            </div>

            <div style={{display:'flex',gap:8,padding:'12px 20px 10px'}}>
              <motion.button whileTap={{scale:0.96}} onClick={doDeposit} style={{flex:1,padding:'8px 0',borderRadius:10,border:'none',cursor:'pointer',background: depositFlash ? GREEN : CINNABAR,color:'#fff',fontSize:13,fontWeight:700,boxShadow:depositFlash?'0 4px 20px rgba(16,185,129,0.28)':SH_RED,transition:'background 0.3s,box-shadow 0.3s'}}>{depositFlash ? '✓ Deposited' : 'Deposit'}</motion.button>
              <motion.button whileTap={{scale:0.96}} onClick={()=>setCashOut(v=>!v)} style={{flex:1,padding:'8px 0',borderRadius:10,cursor:'pointer',background:'transparent',color:CINNABAR,fontSize:13,fontWeight:700,border:`1.5px solid ${CINNABAR}`}}>{cashOut?'Hide':'Withdraw'}</motion.button>
            </div>

            <div style={{padding:'0 20px 12px',borderBottom:`1px solid ${BORDER}`}}>
              {[
              {label:'Educator Royalties',    val:royalties,    sub:`${EXPERT_ID} · 6 Logic Units`,   flash:royFlash},
              {label:'Investor Distribution', val:investorDist, sub:'Pool LP · Q1 Settlement',          flash:royFlash},
              {label:'Pending (T+1)',          val:89.40,        sub:'In transit · Clearing',            flash:false  },
            ].map((b,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:`1px solid ${BORDER}`,
                background: b.flash ? '#10B98108' : 'transparent', transition:'background 0.4s',borderRadius:4}}>
                <div><p style={{margin:0,fontSize:12,fontWeight:600,color:BODY}}>{b.label}</p><p style={{margin:0,fontSize:11,color:MUTED}}>{b.sub}</p></div>
                <span style={{fontSize:13,fontWeight:700,color: b.flash ? GREEN : INK,transition:'color 0.3s',fontVariantNumeric:'tabular-nums'}}>{b.val.toFixed(2)}</span>
              </div>
            ))}
            </div>

            <AnimatePresence>
              {cashOut&&(
                <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.22,ease:EASE}} style={{overflow:'hidden'}}>
                  <div style={{padding:'14px 20px 18px'}}>
                    <p style={{margin:'0 0 8px',fontSize:12,fontWeight:700,color:INK}}>Withdraw to Fiat</p>
                    <div style={{display:'flex',gap:6,marginBottom:8}}>
                      {(['AUD','USDC','SGD'] as const).map(c=>(
                        <button key={c} onClick={()=>setCur(c)} style={{flex:1,padding:'6px 0',borderRadius:8,border:`1.5px solid ${cur===c?CINNABAR:BORDER}`,background:cur===c?`rgba(230,57,70,0.06)`:'transparent',color:cur===c?CINNABAR:MUTED,fontSize:11,fontWeight:700,cursor:'pointer'}}>{c}</button>
                      ))}
                    </div>
                    <input value={amt} onChange={e=>setAmt(e.target.value.replace(/[^0-9.]/g,''))} placeholder="Amount in SPRK" style={{width:'100%',padding:'9px 12px',borderRadius:9,border:`1px solid ${BORDER}`,fontSize:13,color:INK,background:BG,outline:'none',boxSizing:'border-box',marginBottom:6}}/>
                    {amt&&<p style={{margin:'0 0 10px',fontSize:11,color:MUTED}}>≈ {cur} {fiatVal}</p>}
                    {stage==='idle'&&<motion.button whileTap={{scale:0.96}} onClick={doWithdraw} style={{width:'100%',padding:'9px 0',borderRadius:10,border:'none',cursor:'pointer',background:CINNABAR,color:'#fff',fontSize:13,fontWeight:700}}>Confirm Withdraw</motion.button>}
                    {stage==='confirming'&&<p style={{textAlign:'center',color:AMBER,fontSize:12,margin:0}}>Confirming…</p>}
                    {stage==='processing'&&<p style={{textAlign:'center',color:INDIGO,fontSize:12,margin:0}}>Processing on-chain…</p>}
                    {stage==='done'&&<p style={{textAlign:'center',color:GREEN,fontSize:12,fontWeight:700,margin:0}}>✓ Complete</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── LiveTicker ────────────────────────────────────────────────────────────────
function LiveTicker() {
  const msgs = [...TICKER_MSGS, ...TICKER_MSGS]
  return (
    <>
      <style>{`.tk{display:flex;animation:tk 28s linear infinite;width:max-content}.tk:hover{animation-play-state:paused}@keyframes tk{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
      {/* Container-aligned — matches WRAP width, floats as a pill */}
      <div style={{maxWidth:1440,margin:'0 auto',padding:'0 12%',paddingBottom:32}}>
        <div style={{
          borderRadius:8,overflow:'hidden',
          border:'1px solid rgba(233,236,239,0.8)',
          background:'rgba(249,250,251,0.72)',
          backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)',
        }}>
          <div style={{overflow:'hidden'}}><div className="tk">
            {msgs.map((m,i)=>(
              <span key={i} style={{
                display:'inline-block',
                padding:'6px 28px',fontSize:11,fontWeight:600,
                color:CINNABAR,whiteSpace:'nowrap',
                borderRight:'1px solid rgba(233,236,239,0.7)',
                fontFamily:'monospace',
              }}>{m}</span>
            ))}
          </div></div>
        </div>
      </div>
    </>
  )
}

// ── BoostBadge ────────────────────────────────────────────────────────────────
function BoostBadge() {
  return (
    <>
      <style>{`@keyframes breathe{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.05)}}.bb{animation:breathe 2.2s ease-in-out infinite}@keyframes val-glow{0%,100%{opacity:.85;text-shadow:none}50%{opacity:1;text-shadow:0 0 8px rgba(230,57,70,0.45)}}@keyframes line-pulse{0%,100%{opacity:.82}50%{opacity:1}}.recap-scroll::-webkit-scrollbar{display:none}`}</style>
      <span className="bb" style={{display:'inline-flex',alignItems:'center',gap:3,padding:'2px 7px',borderRadius:5,background:`rgba(230,57,70,0.09)`,color:CINNABAR,fontSize:10,fontWeight:800,border:`1px solid rgba(230,57,70,0.18)`}}>⚡ 2× Boost</span>
    </>
  )
}

// ── WisdomRoyaltyExchange ─────────────────────────────────────────────────────
type ExchangeAsset = typeof BLUE_CHIP[0]
const XCH_GRID = '28px 1fr 116px 88px 64px 68px 58px 70px 88px 62px'
const XCH_COLS = ['#','Knowledge Unit','Creator','Staked','24h','Vol','APR','Tier','Hash','Trend']
function zkHash(r:number){ return `0x${(r*13+0x88).toString(16).padStart(2,'0')}…${(r*7+0xf2).toString(16).slice(-2)}` }
function vol(a:ExchangeAsset){ return `${(Math.abs(a.change24h)*1.7+1.1+a.rank*0.2).toFixed(1)}%` }

function WisdomRoyaltyExchange({ onStake }: { onStake?: () => void }) {
  const [tab,setTab]     = useState<'blue_chip'|'emerging'>('blue_chip')
  const [query,setQ]     = useState('')
  const [hov,setHov]     = useState<number|null>(null)
  const [drawer,setDraw] = useState<ExchangeAsset|null>(null)
  const { state } = useSparkle()

  // Track whether the NEW badge is visible (auto-hides after 7s — 3 pulse cycles)
  const [showNewBadge, setShowNewBadge] = useState(false)
  const prevHashRefX = useRef<string | null>(null)
  useEffect(() => {
    if (!state.logicHash || state.logicHash === prevHashRefX.current) return
    prevHashRefX.current = state.logicHash
    setShowNewBadge(true)
    setTimeout(() => setShowNewBadge(false), 7200) // 3 × 2.4s pulse cycles
  }, [state.logicHash])

  // ── Hash Entry Ceremony ─────────────────────────────────────────────────────
  // Triggered when user clicks the [Emerging] tab (if a logicHash exists).
  const [hashCeremony,  setHashCeremony]  = useState<'idle'|'showing'|'flying'|'done'>('idle')
  const [emergingPulse, setEmergingPulse] = useState(false)
  const sectionRef       = useRef<HTMLDivElement>(null)
  const hashCeremonyDone = useRef(false)
  function triggerHashCeremony() {
    if (!state.logicHash || hashCeremonyDone.current) return
    hashCeremonyDone.current = true
    setHashCeremony('showing')
    setTimeout(() => {
      setHashCeremony('flying')
      setTimeout(() => {
        setHashCeremony('done')
        setEmergingPulse(true)
        setTimeout(() => setEmergingPulse(false), 1500)
      }, 700)
    }, 1500)
  }

  // ── Stake success ───────────────────────────────────────────────────────────
  const [stakeSuccess, setStakeSuccess] = useState(false)
  function handleStakeClick() {
    setStakeSuccess(true)
    // After 1.5 s "Success" dwell: close drawer, then hand off.
    // settleStaking() is called by OpportunityPage at scroll time, not here.
    setTimeout(() => {
      setStakeSuccess(false)
      setDraw(null)
      onStake?.()
    }, 1500)
  }

  const baseRows = tab==='blue_chip' ? BLUE_CHIP : EMERGING
  const filtered = query
    ? baseRows.filter(a => a.unit.toLowerCase().includes(query.toLowerCase()) || a.teacher.toLowerCase().includes(query.toLowerCase()))
    : baseRows

  // Inject Expert-ZSF1220 at the top of the blue-chip list when a hash has been minted
  const zsfRow: typeof BLUE_CHIP[0] | null = (state.logicHash && tab==='blue_chip') ? {
    rank:0, teacher:EXPERT_ID, unit:'Segment Diagram · Socratic Protocol',
    staked:5200, change24h:+8.4, apr:42.1, tier:'Master', boost:false,
    sparkline:[40,48,52,61,68,74,80,86,90,95],
  } : null
  const rows = zsfRow ? [zsfRow, ...filtered] : filtered

  return (
    // height:100% inherited from section → inner div chain
    <div ref={sectionRef} style={{flex:1,minHeight:0,display:'flex',flexDirection:'column'}}>
      <style>{`.xch-list::-webkit-scrollbar{display:none}.xch-tk{display:flex;animation:xch-tk 32s linear infinite;width:max-content}.xch-tk:hover{animation-play-state:paused}@keyframes xch-tk{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}@keyframes zsf-pulse{0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,0)}50%{box-shadow:0 0 0 4px rgba(16,185,129,0.18)}}`}</style>

      {/* ── Hash Entry Ceremony overlay — floats from centre for 1.5 s then flies out ── */}
      <AnimatePresence>
        {(hashCeremony === 'showing' || hashCeremony === 'flying') && (
          <motion.div
            key="hash-ceremony"
            initial={{ opacity:0, scale:0.38, y:24 }}
            animate={hashCeremony === 'flying'
              ? { opacity:0, scale:0.3, y:-260, x:180 }
              : { opacity:1, scale:1.08, y:0 }}
            exit={{ opacity:0 }}
            transition={hashCeremony === 'flying'
              ? { duration:0.7, ease:EASE }
              : { duration:1.0, ease:EASE }}
            style={{
              position:'fixed', top:'50%', left:'50%',
              transform:'translate(-50%,-50%)',
              zIndex:9999, pointerEvents:'none',
              background:'rgba(16,185,129,0.93)',
              backdropFilter:'blur(24px)',
              borderRadius:18,
              padding:'22px 36px',
              boxShadow:'0 28px 72px rgba(16,185,129,0.45)',
              display:'flex', flexDirection:'column', alignItems:'center', gap:10,
              minWidth:340,
            }}
          >
            <p style={{margin:0,fontSize:10,fontWeight:800,color:'rgba(255,255,255,0.7)',
              letterSpacing:'0.14em',textTransform:'uppercase'}}>
              ✦ Hash Signature Confirmed
            </p>
            <p style={{margin:0,fontSize:15,fontWeight:900,color:'#fff',
              fontFamily:'ui-monospace,monospace',letterSpacing:'0.04em'}}>
              {state.logicHash}
            </p>
            <p style={{margin:0,fontSize:9,color:'rgba(255,255,255,0.58)',fontFamily:'monospace'}}>
              Expert-ZSF1220 · Wisdom Asset · ZK-Verified on-chain
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Overlay ── */}
      <AnimatePresence>
        {drawer&&(
          <motion.div key="ov" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={()=>{ if(!stakeSuccess) setDraw(null) }}
            style={{position:'fixed',inset:0,zIndex:40,background:'rgba(0,0,0,0.10)',backdropFilter:'blur(1px)'}}
          />
        )}
      </AnimatePresence>

      {/* ── Side Audit Drawer — cinnabar left accent ── */}
      <AnimatePresence>
        {drawer&&(
          <motion.div key="drw"
            initial={{x:420,opacity:0}} animate={{x:0,opacity:1}} exit={{x:420,opacity:0}}
            transition={{type:'spring',stiffness:310,damping:34}}
            style={{
              position:'fixed',top:0,right:0,bottom:0,width:400,zIndex:50,
              background:'#FFFFFF',
              borderLeft:`1.5px solid ${CINNABAR}`,
              boxShadow:'-8px 0 48px rgba(0,0,0,0.08), -2px 0 16px rgba(230,57,70,0.08)',
              display:'flex',flexDirection:'column',overflow:'hidden',
              isolation:'isolate',
            }}
          >
            {/* Drawer header */}
            <div style={{padding:'26px 28px 18px',borderBottom:'1px solid #F3F4F6'}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
                <div>
                  <span style={{
                    display:'inline-block',marginBottom:10,
                    fontSize:9,fontWeight:800,color:CINNABAR,letterSpacing:'0.10em',
                    background:'rgba(230,57,70,0.06)',border:'1px solid rgba(230,57,70,0.18)',
                    padding:'3px 10px',
                    animation:'breathe 2.2s ease-in-out infinite',
                  }}>⚡ ZK-Proof Verified</span>
                  <h3 style={{margin:'0 0 4px',fontSize:15,fontWeight:800,color:INK,lineHeight:1.3}}>{drawer.unit}</h3>
                  <p style={{margin:'0 0 3px',fontSize:12,color:MUTED}}>{drawer.teacher}</p>
                  <p style={{margin:0,fontSize:9.5,color:SUBTLE,fontFamily:'monospace'}}>{zkHash(drawer.rank)}</p>
                </div>
                <button onClick={()=>setDraw(null)} style={{
                  flexShrink:0,width:26,height:26,border:'1px solid #F3F4F6',
                  background:'transparent',cursor:'pointer',fontSize:15,color:SUBTLE,
                  display:'flex',alignItems:'center',justifyContent:'center',
                }}>×</button>
              </div>
            </div>

            {/* 2×2 Metric grid */}
            <div style={{padding:'18px 28px',borderBottom:'1px solid #F3F4F6'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                {[
                  {label:'Trust Score',   value:`${Math.min(99,82+drawer.rank*2)}`,           unit:'/ 100'},
                  {label:'Node Velocity', value:`${(drawer.staked/1000).toFixed(1)}k`,        unit:'SPRK/d'},
                  {label:'Global Yield',  value:`${drawer.apr}%`,                              unit:'APR'},
                  {label:'IP Status',     value:drawer.tier==='Master'?'Sovereign':'Licensed', unit:'on-chain'},
                ].map(m=>(
                  <div key={m.label} style={{padding:'11px 12px',border:'1px solid #F3F4F6'}}>
                    <p style={{margin:'0 0 4px',fontSize:9,fontWeight:700,color:MUTED,letterSpacing:'0.08em',textTransform:'uppercase'}}>{m.label}</p>
                    <p style={{margin:0,fontSize:19,fontWeight:800,color:INK,lineHeight:1,fontFamily:'monospace'}}>
                      {m.value}<span style={{fontSize:10,fontWeight:500,color:MUTED,marginLeft:4}}>{m.unit}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cognitive curve */}
            <div style={{padding:'18px 28px',borderBottom:'1px solid #F3F4F6',flex:1}}>
              <p style={{margin:'0 0 10px',fontSize:9,fontWeight:700,color:MUTED,letterSpacing:'0.09em',textTransform:'uppercase'}}>认知价值演化曲线 · Cognitive Value Curve</p>
              <AuditChart pts={drawer.sparkline} color={drawer.change24h>0?CINNABAR:INDIGO}/>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:5}}>
                <span style={{fontSize:9,color:SUBTLE,fontFamily:'monospace'}}>T−9</span>
                <span style={{fontSize:9,color:SUBTLE,fontFamily:'monospace'}}>Now</span>
              </div>
            </div>

            {/* Stake success overlay */}
            <AnimatePresence>
              {stakeSuccess && (
                <motion.div
                  key="stake-success"
                  initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                  transition={{duration:0.22}}
                  style={{
                    position:'absolute',inset:0,zIndex:10,
                    background:'rgba(255,255,255,0.92)',backdropFilter:'blur(12px)',
                    display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12,
                  }}
                >
                  <motion.div
                    initial={{scale:0.6,opacity:0}} animate={{scale:1,opacity:1}}
                    transition={{type:'spring',stiffness:320,damping:22}}>
                    <div style={{width:52,height:52,borderRadius:'50%',background:'#10B98118',
                      border:'2px solid #10B981',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <span style={{fontSize:22}}>✓</span>
                    </div>
                  </motion.div>
                  <p style={{margin:0,fontSize:15,fontWeight:800,color:GREEN}}>Staking Successful</p>
                  <p style={{margin:0,fontSize:11,color:MUTED,fontFamily:'monospace'}}>
                    {drawer?.unit} · {drawer?.staked?.toLocaleString()} SPRK locked
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div style={{padding:'18px 28px',display:'flex',gap:10}}>
              <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.97}} style={{
                flex:1,padding:'10px 0',border:`1px solid ${CINNABAR}`,
                background:'transparent',color:CINNABAR,fontSize:12,fontWeight:700,cursor:'pointer',
              }}>Acquire License</motion.button>
              <motion.button
                whileHover={{scale:1.02}} whileTap={{scale:0.97}}
                onClick={handleStakeClick}
                style={{
                  flex:1,padding:'10px 0',border:'none',
                  background:CINNABAR,color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',boxShadow:SH_RED,
                }}>
                [ STAKE ASSETS ]
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Full-frame terminal table ── */}
      <div style={{flex:1,minHeight:0,display:'flex',flexDirection:'column'}}>

        {/* Control bar — title first */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:16,marginBottom:0,paddingBottom:14,borderBottom:'1px solid #F3F4F6',flexShrink:0}}>
          <div>
            <p style={{margin:0,fontSize:9.5,fontWeight:700,color:CINNABAR,letterSpacing:'0.12em',textTransform:'uppercase'}}>Live Market</p>
            <h3 style={{margin:'2px 0 0',fontSize:18,fontWeight:700,color:INK,letterSpacing:'-0.01em'}}>Wisdom Royalty Exchange</h3>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:0}}>
            <div style={{display:'flex',alignItems:'center',marginRight:16,borderBottom:'1px solid #F3F4F6'}}>
              {(['blue_chip','emerging'] as const).map(t=>(
                <motion.button key={t} onClick={()=>{ setTab(t); if(t==='emerging') triggerHashCeremony() }}
                  animate={t==='emerging' && emergingPulse
                    ? {scale:[1,1.10,1,1.06,1],color:[SUBTLE,GREEN,SUBTLE]}
                    : {scale:1}}
                  transition={{duration:0.55}}
                  style={{
                    padding:'4px 14px 8px',fontSize:11.5,fontWeight:700,cursor:'pointer',
                    background:'transparent',border:'none',
                    borderBottom:`1.5px solid ${tab===t?CINNABAR:'transparent'}`,
                    color:tab===t?CINNABAR:SUBTLE,
                    transition:'color .15s,border-color .15s',whiteSpace:'nowrap',marginBottom:-1,
                  }}>{t==='blue_chip'?'Blue Chip':'Emerging'}</motion.button>
              ))}
            </div>
            <div style={{position:'relative',display:'flex',alignItems:'center',marginRight:14}}>
              <span style={{position:'absolute',left:8,fontSize:11,color:SUBTLE,pointerEvents:'none'}}>⌕</span>
              <input value={query} onChange={e=>setQ(e.target.value)} placeholder="Search…" style={{
                paddingLeft:24,paddingRight:10,paddingTop:4,paddingBottom:4,
                border:'1px solid #F3F4F6',fontSize:11.5,color:INK,
                background:'transparent',outline:'none',width:140,
              }}/>
            </div>
            <span style={{fontSize:11,fontWeight:700,color:GREEN,whiteSpace:'nowrap'}}>● Live</span>
          </div>
        </div>

        {/* Live ticker — sits between title and column headers; 0.5px hairlines, no background */}
        <div style={{borderBottom:'0.5px solid #E5E7EB',overflow:'hidden',flexShrink:0}}>
          <div className="xch-tk">
            {[...TICKER_MSGS,...TICKER_MSGS].map((m,i)=>(
              <span key={i} style={{
                display:'inline-block',padding:'5px 24px',
                fontSize:10.5,fontWeight:600,color:CINNABAR,
                whiteSpace:'nowrap',borderRight:'0.5px solid #E5E7EB',
                fontFamily:'monospace',
              }}>{m}</span>
            ))}
          </div>
        </div>

        {/* Column headers — 10 columns */}
        <div style={{display:'grid',gridTemplateColumns:XCH_GRID,padding:'5px 0',borderBottom:'1px solid #F3F4F6',flexShrink:0}}>
          {XCH_COLS.map((h,i)=>(
            <span key={i} style={{fontSize:9,fontWeight:700,color:SUBTLE,letterSpacing:'0.08em',textTransform:'uppercase',textAlign:i===0?'center':'left'}}>{h}</span>
          ))}
        </div>

        {/* Rows — fill remaining viewport height, hidden scrollbar */}
        <div style={{flex:1,minHeight:0,position:'relative',display:'flex',flexDirection:'column'}}>
          <div className="xch-list" style={{
            flex:1,overflowY:'auto',scrollBehavior:'smooth',
            scrollbarWidth:'none',msOverflowStyle:'none',
          } as React.CSSProperties}>
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.18}}>
                {rows.length===0
                  ? <div style={{padding:'32px',textAlign:'center',color:SUBTLE,fontSize:13}}>No results for "{query}"</div>
                  : rows.map((a,i)=>{
                    const pos=a.change24h>0, chgColor=pos?CINNABAR:MUTED, sparkColor=pos?CINNABAR:INDIGO
                    const isZSF = a.teacher === EXPERT_ID
                    return (
                      <motion.div key={a.rank}
                        onClick={()=>setDraw(a)}
                        onHoverStart={()=>setHov(i)} onHoverEnd={()=>setHov(null)}
                        initial={isZSF ? {y:-12, opacity:0} : false}
                        animate={{background: isZSF ? `${GREEN}06` : hov===i?'#FAFAFA':'#FFFFFF', y:0, opacity:1}}
                        transition={isZSF ? {duration:0.38, ease:[0.22,1,0.36,1]} : {duration:0.09}}
                        style={{
                          display:'grid', gridTemplateColumns:XCH_GRID, height:54, alignItems:'center', cursor:'pointer',
                          borderBottom:`1px solid ${isZSF ? GREEN+'30' : '#F3F4F6'}`,
                          borderLeft: isZSF ? `2px solid ${GREEN}` : 'none',
                          paddingLeft: isZSF ? 0 : undefined,
                          animation: isZSF ? 'zsf-pulse 2.4s ease-in-out 3' : undefined,
                        }}
                      >
                        <span style={{fontSize:10,fontWeight:600,color:isZSF?GREEN:SUBTLE,textAlign:'center'}}>
                          {isZSF ? '★' : a.rank}
                        </span>
                        <div>
                          <div style={{display:'flex',alignItems:'center',gap:5,marginBottom:2}}>
                            <p style={{margin:0,fontSize:12.5,fontWeight:700,color:INK,lineHeight:1}}>{a.unit}</p>
                            {tab==='emerging'&&a.boost&&<BoostBadge/>}
                          </div>
                          <p style={{margin:0,fontSize:9,color:isZSF?GREEN:SUBTLE,fontFamily:'monospace'}}>
                            {isZSF && state.logicHash ? state.logicHash.slice(0,16)+'…' : zkHash(a.rank)}
                          </p>
                        </div>
                        <span style={{fontSize:11,color:BODY,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.teacher}</span>
                        <span style={{fontSize:11.5,fontWeight:600,color:INK,fontFamily:'monospace'}}>{fmt(a.staked)}</span>
                        <span style={{fontSize:11.5,fontWeight:700,color:chgColor,fontFamily:'monospace'}}>{pos?'+':''}{a.change24h}%</span>
                        <span style={{fontSize:11,color:SUBTLE,fontFamily:'monospace'}}>{vol(a)}</span>
                        <span style={{fontSize:11.5,fontWeight:600,color:INK,fontFamily:'monospace'}}>{a.apr}%</span>
                        {/* Tier cell — "NEW MINTED" badge pulses next to tier for ZSF */}
                        <div style={{display:'flex',alignItems:'center',gap:4}}>
                          <span style={{fontSize:10,fontWeight:600,color:isZSF?GREEN:MUTED}}>{a.tier}</span>
                          <AnimatePresence>
                            {isZSF && showNewBadge && (
                              <motion.span
                                initial={{opacity:0,scale:0.7}}
                                animate={{opacity:[0.65,1,0.65]}} exit={{opacity:0,scale:0.6}}
                                transition={{duration:1.5,repeat:Infinity}}
                                style={{fontSize:7,fontWeight:800,color:GREEN,background:`${GREEN}14`,
                                  padding:'1px 5px',borderRadius:3,letterSpacing:'0.05em',whiteSpace:'nowrap',
                                  border:`1px solid ${GREEN}30`}}>
                                NEW MINTED
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                        <span style={{fontSize:9.5,color:isZSF?GREEN:SUBTLE,fontFamily:'monospace'}}>
                          {isZSF && state.logicHash ? state.logicHash.slice(0,8)+'…' : zkHash(a.rank+3)}
                        </span>
                        <MiniSparkline pts={a.sparkline} color={isZSF?GREEN:sparkColor}/>
                      </motion.div>
                    )
                  })
                }
              </motion.div>
            </AnimatePresence>
          </div>
          <div style={{position:'absolute',bottom:0,left:0,right:0,height:56,background:'linear-gradient(to bottom,transparent,#FFFFFF)',pointerEvents:'none'}}/>
        </div>
      </div>
    </div>
  )
}

// ── LogoWall — Vercel/Linear monochrome style ─────────────────────────────────
function LogoWall() {
  const all = [...PARTNER_LOGOS, ...PARTNER_LOGOS]
  return (
    <>
      <style>{`
        .lw{display:flex;animation:lw 28s linear infinite;width:max-content}
        .lw:hover{animation-play-state:paused}
        @keyframes lw{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .lw-item{opacity:0.52;transition:opacity .2s}
        .lw-item:hover{opacity:1}
      `}</style>
      <div style={{
        borderBottom:'1px solid #F3F4F6',paddingBottom:20,marginBottom:28,
        position:'relative',overflow:'hidden',
      }}>
        <div style={{position:'absolute',left:0,top:0,bottom:0,width:48,background:`linear-gradient(to right,${BG},transparent)`,zIndex:1,pointerEvents:'none'}}/>
        <div style={{position:'absolute',right:0,top:0,bottom:0,width:48,background:`linear-gradient(to left,${BG},transparent)`,zIndex:1,pointerEvents:'none'}}/>
        <p style={{margin:'0 0 16px',fontSize:9,fontWeight:700,color:SUBTLE,letterSpacing:'0.14em',textTransform:'uppercase',fontFamily:'monospace'}}>Strategic Partners</p>
        <div style={{overflow:'hidden'}}>
          <div className="lw">
            {all.map((p,i)=>(
              <div key={i} className="lw-item" style={{
                display:'flex',alignItems:'center',gap:9,
                padding:'0 32px',borderRight:'1px solid #F3F4F6',cursor:'default',
              }}>
                <div style={{
                  width:28,height:28,borderRadius:6,border:'1px solid #E5E7EB',
                  background:'#F9FAFB',display:'flex',alignItems:'center',
                  justifyContent:'center',fontSize:10,fontWeight:800,
                  color:'#6B7280',flexShrink:0,fontFamily:'monospace',
                }}>{p.initials}</div>
                <span style={{fontSize:12,fontWeight:600,color:'#6B7280',whiteSpace:'nowrap'}}>{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

// ── Scholarship Cards (horizontal scroll) ─────────────────────────────────────
function ScholarshipCards() {
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
        <div>
          <p style={{margin:0,fontSize:10,fontWeight:700,color:CINNABAR,letterSpacing:'0.10em',textTransform:'uppercase'}}>Funding Pools</p>
          <h4 style={{margin:'2px 0 0',fontSize:16,fontWeight:700,color:INK}}>Scholarship Pools</h4>
        </div>
        <motion.button whileTap={{scale:0.95}} style={{padding:'6px 16px',borderRadius:8,border:`1.5px dashed ${BORDER}`,background:'transparent',color:MUTED,fontSize:12,fontWeight:600,cursor:'pointer',transition:'border-color .2s,color .2s'}}>
          + Initiate Pipeline
        </motion.button>
      </div>
      <div style={{display:'flex',gap:14,overflowX:'auto',scrollSnapType:'x mandatory',paddingBottom:8,scrollbarWidth:'none'}}>
        {SCHOLARSHIP_POOLS.map((p,i)=>(
          <motion.div key={p.id}
            initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
            whileHover={{y:-3,boxShadow:SH_HVR}}
            style={{
              flex:'0 0 240px',scrollSnapAlign:'start',
              background:CARD,border:`1px solid ${BORDER}`,borderRadius:14,
              padding:'18px 18px 16px',boxShadow:SH,
            }}
          >
            {/* Tier pill */}
            <span style={{fontSize:10,fontWeight:800,color:p.color,background:`${p.color}12`,padding:'2px 9px',borderRadius:5}}>{p.tier}</span>
            <p style={{margin:'10px 0 3px',fontSize:14,fontWeight:700,color:INK,lineHeight:1.3}}>{p.name}</p>
            <p style={{margin:'0 0 12px',fontSize:11,color:MUTED}}>{p.desc}</p>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:10}}>
              <span style={{fontSize:11,color:MUTED}}>Pool</span>
              <span style={{fontSize:16,fontWeight:800,color:INK}}>{fmt(p.amount)} <span style={{fontSize:11,color:MUTED}}>SPRK</span></span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:11,color:MUTED}}>{p.slots} slots · {p.match}</span>
              <motion.button whileTap={{scale:0.95}} style={{padding:'5px 13px',borderRadius:7,border:'none',cursor:'pointer',background:CINNABAR,color:'#fff',fontSize:11,fontWeight:700,boxShadow:SH_RED}}>Apply</motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── PentagonRadar (with center click hint) ────────────────────────────────────
function PentagonRadar({ student, onCenterClick }:{ student:Student; onCenterClick?:()=>void }) {
  const CX=100,CY=100,R=76
  const vals=CHC_AXES.map(k=>student.chc[k]/100)
  return (
    <svg viewBox="0 0 200 200" width={200} height={200}>
      {[0.25,0.5,0.75,1].map(r=><polygon key={r} points={gridPts(CX,CY,R*r)} fill="none" stroke={BORDER} strokeWidth={1}/>)}
      {CHC_AXES.map((_,i)=>{ const p=pentagonPt(CX,CY,R,i,1); return <line key={i} x1={CX} y1={CY} x2={p.x} y2={p.y} stroke={BORDER} strokeWidth={1}/> })}
      <motion.polygon key={student.id}
        initial={{opacity:0,scale:0.4}} animate={{opacity:1,scale:1}} transition={{duration:0.5,ease:EASE}}
        style={{transformOrigin:`${CX}px ${CY}px`}}
        points={pentagon5pts(CX,CY,R,vals)}
        fill="rgba(230,57,70,0.09)" stroke={CINNABAR} strokeWidth={2}
      />
      {CHC_AXES.map((k,i)=>{ const p=pentagonPt(CX,CY,R,i,student.chc[k]/100); return <motion.circle key={`${student.id}-${k}`} initial={{r:0}} animate={{r:5}} transition={{delay:0.3+i*0.07,duration:0.25}} cx={p.x} cy={p.y} fill={AXIS_COLORS[i]} stroke="#fff" strokeWidth={1.5}/> })}
      {CHC_AXES.map((k,i)=>{ const p=pentagonPt(CX,CY,R+16,i,1); return <text key={k} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" style={{fontSize:9,fontWeight:'bold',fill:AXIS_COLORS[i]}}>{k}</text> })}
      {/* Center drill-down target */}
      {onCenterClick&&(
        <>
          <motion.circle cx={CX} cy={CY} r={14} fill={`rgba(230,57,70,0.06)`} stroke={CINNABAR} strokeWidth={1} strokeDasharray="2 3" cursor="pointer" onClick={onCenterClick}
            animate={{r:[13,16,13]}} transition={{duration:2.2,repeat:Infinity,ease:'easeInOut'}}/>
          <text x={CX} y={CY} textAnchor="middle" dominantBaseline="central" style={{fontSize:7,fill:CINNABAR,cursor:'pointer',userSelect:'none',fontWeight:'bold'}} onClick={onCenterClick}>audit</text>
        </>
      )}
    </svg>
  )
}

// ── BloomStaircase (with bar click) ───────────────────────────────────────────
function BloomStaircase({ level, onBarClick }:{ level:number; onBarClick?:(l:number)=>void }) {
  return (
    <div style={{display:'flex',alignItems:'flex-end',gap:5,height:100}}>
      {BLOOM_LABELS.map((l,i)=>{
        const active=i<level,current=i===level-1
        return (
          <div key={l} onClick={()=>onBarClick?.(i+1)} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-end',cursor:onBarClick?'pointer':'default'}}>
            <motion.div initial={{height:0}} animate={{height:BLOOM_HEIGHTS[i]}} transition={{delay:i*0.07,duration:0.4,ease:EASE}} style={{
              width:'100%',borderRadius:'4px 4px 0 0',
              background:active?BLOOM_COLORS[i]:'#F1F3F5',
              boxShadow:current?`0 0 10px ${BLOOM_COLORS[i]}80`:'none',
              opacity:active?1:0.35,
            }}/>
            <span style={{fontSize:8,fontWeight:600,color:active?BLOOM_COLORS[i]:SUBTLE,marginTop:3}}>L{i+1}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── IntelligenceAuditPanel (inline slide-down) ────────────────────────────────
function IntelligenceAuditPanel({ activeBloom, setActiveBloom, onClose }:{
  activeBloom:number|null; setActiveBloom:(n:number|null)=>void; onClose:()=>void
}) {
  const total = CHC_AUDIT.reduce((s,g)=>s+g.abilities.length,0)
  const count = activeBloom ? CHC_AUDIT.reduce((s,g)=>s+g.abilities.filter(a=>a.blooms.includes(activeBloom)).length,0) : total
  return (
    <div style={{padding:'20px 24px'}}>
      {/* Panel header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{padding:'3px 10px',borderRadius:999,background:`rgba(230,57,70,0.07)`,border:`1px solid rgba(230,57,70,0.15)`,fontSize:10,fontWeight:800,color:CINNABAR,letterSpacing:'0.08em'}}>INTELLIGENCE AUDIT</span>
          <span style={{fontSize:12,color:MUTED}}>{count} <span style={{color:SUBTLE}}>/ {total} indicators active</span></span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          {BLOOM_LABELS.map((l,i)=>{
            const lvl=i+1,active=activeBloom===lvl
            return (
              <button key={lvl} onClick={()=>setActiveBloom(active?null:lvl)} style={{
                padding:'3px 9px',borderRadius:6,border:`1px solid ${active?BLOOM_COLORS[i]:BORDER}`,
                background:active?`${BLOOM_COLORS[i]}15`:'transparent',
                color:active?BLOOM_COLORS[i]:MUTED,fontSize:10,fontWeight:700,cursor:'pointer',
              }}>L{lvl}</button>
            )
          })}
          <button onClick={onClose} style={{width:24,height:24,borderRadius:6,border:`1px solid ${BORDER}`,background:'transparent',cursor:'pointer',fontSize:16,color:SUBTLE,display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1}}>×</button>
        </div>
      </div>

      {/* Ability grid — compact, subtle */}
      <div style={{
        display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',
        gap:14, maxHeight:320, overflowY:'auto',
        background:BG, borderRadius:10, padding:'16px',
        border:`1px solid ${BORDER}`,
      }}>
        {CHC_AUDIT.map(group=>{
          const abilities=activeBloom?group.abilities.filter(a=>a.blooms.includes(activeBloom)):group.abilities
          if(abilities.length===0) return null
          return (
            <div key={group.key}>
              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:7}}>
                <span style={{fontSize:10,fontWeight:800,color:group.color,background:`${group.color}12`,padding:'2px 7px',borderRadius:4}}>{group.key}</span>
                <span style={{fontSize:11,fontWeight:600,color:BODY}}>{group.name}</span>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:3}}>
                {abilities.map(ab=>(
                  <motion.div key={ab.code} initial={{opacity:0,x:-4}} animate={{opacity:1,x:0}} style={{display:'flex',alignItems:'center',gap:6,padding:'3px 0'}}>
                    <span style={{fontSize:10,fontWeight:700,color:group.color,fontFamily:'monospace',width:28,flexShrink:0}}>{ab.code}</span>
                    <span style={{fontSize:11,color:BODY}}>{ab.name}</span>
                    {activeBloom&&ab.blooms.includes(activeBloom)&&<span style={{width:4,height:4,borderRadius:'50%',background:CINNABAR,flexShrink:0,marginLeft:'auto'}}/>}
                  </motion.div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── TalentRadar (with embedded audit slide-down) ──────────────────────────────
function TalentRadarWithAudit() {
  const [selId,setSelId]             = useState(TALENT_POOL[0].id)
  const [reqSent,setReqSent]         = useState(false)
  const [auditOpen,setAuditOpen]     = useState(false)
  const [auditBloom,setAuditBloom]   = useState<number|null>(null)
  const student = TALENT_POOL.find(s=>s.id===selId)!
  const matchColor = DEMAND_CARDS.find(d=>d.company.toLowerCase().includes(student.match.toLowerCase()))?.color??CINNABAR

  function selectStudent(id:string){ setSelId(id); setReqSent(false); setAuditOpen(false); setAuditBloom(null) }
  function openAudit(bloom?:number){ setAuditBloom(bloom??null); setAuditOpen(true) }

  return (
    <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:14,overflow:'hidden',boxShadow:SH,position:'relative'}}>

      {/* ── Watermark: Sparkle flame at 5% opacity ──────────────────── */}
      <svg
        viewBox="0 0 36 52"
        aria-hidden
        style={{
          position:'absolute', top:'50%', left:'50%',
          transform:'translate(-50%,-50%)',
          width:300, height:434,
          opacity:0.05, pointerEvents:'none', zIndex:0,
        }}
      >
        <path
          d="M18 2C22 7 27 14 25 22C23 29 19 31 20 38C21 42 23 44 24 46L12 46C13 44 15 42 16 38C17 31 13 29 11 22C9 14 14 7 18 2Z"
          fill="#C41530"
        />
        <line x1="4" y1="48" x2="32" y2="48" stroke="#C41530" strokeWidth="2" strokeLinecap="round"/>
      </svg>

      <div style={{display:'grid',gridTemplateColumns:'210px 1fr',position:'relative',zIndex:1}}>
        {/* Student list */}
        <div style={{borderRight:`1px solid ${BORDER}`}}>
          <div style={{padding:'12px 16px',borderBottom:`1px solid ${BORDER}`}}>
            <p style={{margin:0,fontSize:10,fontWeight:700,color:MUTED,letterSpacing:'0.07em',textTransform:'uppercase'}}>Talent Pool</p>
            <p style={{margin:0,fontSize:11,color:SUBTLE}}>{TALENT_POOL.length} anonymized</p>
          </div>
          {TALENT_POOL.map(s=>{
            const sel=s.id===selId
            return (
              <motion.button key={s.id} onClick={()=>selectStudent(s.id)}
                animate={{background:sel?`rgba(230,57,70,0.05)`:CARD}}
                style={{width:'100%',textAlign:'left',padding:'10px 16px',borderBottom:`1px solid ${BORDER}`,border:'none',cursor:'pointer',display:'block',borderLeft:sel?`3px solid ${CINNABAR}`:'3px solid transparent'}}
              >
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:11,fontWeight:700,color:sel?CINNABAR:INK,fontFamily:'monospace'}}>{s.id}</span>
                  <span style={{fontSize:9,fontWeight:700,color:s.sbt==='Verified'?GREEN:AMBER,background:s.sbt==='Verified'?'rgba(16,185,129,0.1)':'rgba(245,158,11,0.1)',padding:'1px 5px',borderRadius:4}}>{s.sbt}</span>
                </div>
                <p style={{margin:'2px 0 0',fontSize:10,color:MUTED}}>{s.tier} · P{s.percentile}</p>
              </motion.button>
            )
          })}
        </div>

        {/* Radar + Bloom */}
        <div style={{padding:'20px 24px'}}>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:16}}>
            <div>
              <p style={{margin:0,fontSize:10,fontWeight:700,color:MUTED,letterSpacing:'0.07em',textTransform:'uppercase'}}>Cognitive Fingerprint</p>
              <h4 style={{margin:'3px 0 0',fontSize:15,fontWeight:700,color:INK,fontFamily:'monospace'}}>{student.id}</h4>
              <div style={{display:'flex',gap:7,marginTop:5,flexWrap:'wrap'}}>
                <span style={{fontSize:11,fontWeight:700,color:matchColor,background:`${matchColor}12`,padding:'2px 8px',borderRadius:5}}>{student.tier}</span>
                <span style={{fontSize:11,color:MUTED}}>Best match: {student.match}</span>
                <span style={{fontSize:11,fontWeight:700,color:INK}}>P{student.percentile}</span>
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <p style={{margin:0,fontSize:10,color:MUTED}}>Bloom Level</p>
              <p style={{margin:0,fontSize:21,fontWeight:800,color:BLOOM_COLORS[student.bloom-1]}}>L{student.bloom}</p>
              <p style={{margin:0,fontSize:10,color:MUTED}}>{BLOOM_LABELS[student.bloom-1]}</p>
            </div>
          </div>

          <div style={{display:'flex',gap:24,alignItems:'flex-end',marginBottom:18}}>
            {/* Pentagon (click center → audit) */}
            <div>
              <p style={{margin:'0 0 5px',fontSize:9,fontWeight:700,color:SUBTLE,letterSpacing:'0.07em',textTransform:'uppercase'}}>CHC Profile · click center to audit</p>
              <PentagonRadar student={student} onCenterClick={()=>openAudit()}/>
              <div style={{display:'flex',gap:4,marginTop:7}}>
                {CHC_AXES.map((k,i)=>(
                  <div key={k} style={{textAlign:'center',padding:'3px 5px',borderRadius:5,background:`${AXIS_COLORS[i]}10`}}>
                    <p style={{margin:0,fontSize:8,fontWeight:700,color:AXIS_COLORS[i]}}>{k}</p>
                    <p style={{margin:0,fontSize:11,fontWeight:800,color:INK}}>{student.chc[k]}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Bloom staircase (click bar → audit at that level) */}
            <div style={{flex:1}}>
              <p style={{margin:'0 0 5px',fontSize:9,fontWeight:700,color:SUBTLE,letterSpacing:'0.07em',textTransform:'uppercase'}}>Bloom Taxonomy · click bar to drill</p>
              <BloomStaircase key={student.id} level={student.bloom} onBarClick={l=>openAudit(l)}/>
              <div style={{marginTop:7}}>
                {BLOOM_LABELS.map((l,i)=>(
                  <div key={l} style={{display:'flex',alignItems:'center',gap:5,marginBottom:2}}>
                    <div style={{width:7,height:7,borderRadius:2,background:i<student.bloom?BLOOM_COLORS[i]:'#F1F3F5',flexShrink:0}}/>
                    <span style={{fontSize:10,color:i<student.bloom?BODY:SUBTLE}}>L{i+1} {l}</span>
                    {i===student.bloom-1&&<span style={{fontSize:9,fontWeight:700,color:BLOOM_COLORS[i],marginLeft:'auto'}}>Current</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Request Interview */}
          <div style={{borderTop:`1px solid ${BORDER}`,paddingTop:14,display:'flex',alignItems:'center',gap:12}}>
            <AnimatePresence mode="wait">
              {!reqSent?(
                <motion.button key="req" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                  whileHover={{scale:1.03}} whileTap={{scale:0.96}} onClick={()=>setReqSent(true)}
                  style={{padding:'8px 20px',borderRadius:9,border:'none',cursor:'pointer',background:CINNABAR,color:'#fff',fontSize:13,fontWeight:700,boxShadow:SH_RED}}
                >Request Interview</motion.button>
              ):(
                <motion.div key="conf" initial={{opacity:0,x:8}} animate={{opacity:1,x:0}} exit={{opacity:0}} style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontSize:13,fontWeight:700,color:GREEN}}>✓ Request sent to {student.id}</span>
                  <button onClick={()=>setReqSent(false)} style={{fontSize:11,color:MUTED,background:'none',border:'none',cursor:'pointer'}}>Undo</button>
                </motion.div>
              )}
            </AnimatePresence>
            <span style={{fontSize:11,color:SUBTLE}}>Notified anonymously via SBT protocol</span>
          </div>
        </div>
      </div>

      {/* Slide-down Intelligence Audit panel */}
      <AnimatePresence>
        {auditOpen&&(
          <motion.div
            initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}}
            exit={{height:0,opacity:0}} transition={{duration:0.36,ease:EASE}}
            style={{overflow:'hidden',borderTop:`1px solid ${BORDER}`}}
          >
            <IntelligenceAuditPanel
              activeBloom={auditBloom}
              setActiveBloom={setAuditBloom}
              onClose={()=>setAuditOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── InstitutionalFunnel ───────────────────────────────────────────────────────
function getEnterprisePool(pool: typeof SCHOLARSHIP_POOLS[0]): EnterpriseTalent[] {
  return ENTERPRISE_TALENT.filter(s => s.bloom >= pool.minBloom)
}

function InstitutionalFunnel() {
  const [activePoolId, setActivePoolId] = useState<string>('p1')
  const [loading, setLoading] = useState(false)
  const { state } = useSparkle()

  // When logicHash is set (forge complete), auto-select p1 and trigger absorb animation
  const [absorbingP1, setAbsorbingP1] = useState(false)
  const prevHashRef2 = useRef<string | null>(null)
  useEffect(() => {
    if (!state.logicHash || state.logicHash === prevHashRef2.current) return
    prevHashRef2.current = state.logicHash
    setActivePoolId('p1')
    setAbsorbingP1(true)
    setTimeout(() => setAbsorbingP1(false), 3200)
  }, [state.logicHash])

  function selectPool(id: string) {
    if (id === activePoolId) return
    setLoading(true)
    setActivePoolId(id)
    setTimeout(() => setLoading(false), 500)
  }

  const activePool = SCHOLARSHIP_POOLS.find(p => p.id === activePoolId)!
  const candidates = getEnterprisePool(activePool)
  const verifiedCount = candidates.filter(s => s.sbt === 'Verified').length

  return (
    <div>
      <style>{`
        @keyframes pulse-green{0%,100%{opacity:.7}50%{opacity:1}}
        @keyframes opp-shimmer{0%{transform:translateX(-200%)}100%{transform:translateX(400%)}}
        @keyframes absorb-fill{0%{width:66%}60%{width:82%}100%{width:66%}}
        .pool-list::-webkit-scrollbar{display:none}
        .talent-list::-webkit-scrollbar{display:none}
      `}</style>

      {/* ── Enterprise logo scroll ────────────────────────────────── */}
      <LogoWall/>

      {/* ── Two-column: pools LEFT · candidates RIGHT ────────────── */}
      <div style={{display:'grid', gridTemplateColumns:'5fr 7fr', gap:32, alignItems:'stretch'}}>

        {/* ══ LEFT — Scholarship Pools (5-row lock, 560px) ═══════════ */}
        <div style={{
          display:'flex', flexDirection:'column',
          height:560, overflow:'hidden',
          background:'rgba(249,250,251,0.4)',
          border:'1px solid #F3F4F6', borderRadius:8,
          padding:'14px 14px 0',
        }}>
          <p style={{
            margin:'0 0 12px', fontSize:9, fontWeight:700, color:SUBTLE,
            letterSpacing:'0.14em', textTransform:'uppercase', fontFamily:'monospace',
            flexShrink:0,
          }}>
            Scholarship Pools · {SCHOLARSHIP_POOLS.length} active
          </p>

          <div className="pool-list" style={{
            flex:1, overflowY:'auto', scrollbarWidth:'none',
            display:'flex', flexDirection:'column', gap:8,
            paddingBottom:14,
          }}>
            {SCHOLARSHIP_POOLS.map(p => {
              const sel = activePoolId === p.id
              const pct = Math.round((p.locked / p.slots) * 100)
              const hot = pct >= 70
              return (
                <motion.div key={p.id}
                  onClick={() => selectPool(p.id)}
                  whileHover={{ x: 2 }}
                  animate={sel ? {
                    boxShadow: [
                      '0 0 0px rgba(230,57,70,0)',
                      '0 0 18px rgba(230,57,70,0.20)',
                      '0 0 0px rgba(230,57,70,0)',
                    ],
                  } : { boxShadow: '0 0 0px rgba(230,57,70,0)' }}
                  transition={sel
                    ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
                    : { duration: 0.2 }}
                  style={{
                    padding: '13px 15px',
                    border: sel ? `1.5px solid ${CINNABAR}` : '1px solid #F3F4F6',
                    borderRadius: 8,
                    background: sel ? 'rgba(230,57,70,0.03)' : CARD,
                    cursor: 'pointer',
                    transition: 'border .15s, background .15s',
                  }}
                >
                  {/* Header row */}
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6}}>
                    <div style={{display:'flex', alignItems:'center', gap:6}}>
                      <span style={{
                        fontSize:9, fontWeight:800,
                        color: (absorbingP1 && p.id==='p1') ? GREEN : sel ? CINNABAR : MUTED,
                        background: (absorbingP1 && p.id==='p1') ? `${GREEN}14` : sel ? 'rgba(230,57,70,0.07)' : '#F3F4F6',
                        padding:'1px 7px', borderRadius:3, letterSpacing:'0.04em',
                        transition:'color 0.3s, background 0.3s',
                      }}>{p.tier}</span>
                      <span style={{fontSize:12, fontWeight:700, color: sel ? INK : BODY}}>{p.name}</span>
                      {absorbingP1 && p.id==='p1' && (
                        <motion.span
                          initial={{opacity:0, scale:0.7}} animate={{opacity:1, scale:1}} exit={{opacity:0}}
                          style={{fontSize:7, fontWeight:800, color:GREEN,
                            background:`${GREEN}18`, padding:'1px 5px', borderRadius:3,
                            border:`1px solid ${GREEN}44`, letterSpacing:'0.04em', whiteSpace:'nowrap'}}>
                          ⬡ ABSORBING
                        </motion.span>
                      )}
                    </div>
                    <span style={{
                      fontSize:8.5, fontWeight:700, color:GREEN, letterSpacing:'0.05em',
                      background:'rgba(16,185,129,0.07)', border:'1px solid rgba(16,185,129,0.18)',
                      padding:'2px 6px', borderRadius:999,
                      animation:'pulse-green 2.4s ease-in-out infinite',
                      whiteSpace:'nowrap',
                    }}>⬡ Auto-Disburse</span>
                  </div>

                  {/* Amount + desc */}
                  <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:10}}>
                    <span style={{fontSize:11, color:MUTED, flex:1}}>{p.desc}</span>
                    <span style={{fontSize:13, fontWeight:800, color:INK, whiteSpace:'nowrap', fontFamily:'monospace'}}>
                      {fmt(p.amount)}<span style={{fontSize:9, fontWeight:500, color:SUBTLE, marginLeft:3}}>SPRK</span>
                    </span>
                  </div>

                  {/* Gitcoin-style slot progress bar */}
                  <div>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:4, alignItems:'baseline'}}>
                      <span style={{fontSize:8.5, color:SUBTLE, fontFamily:'monospace'}}>{p.locked}/{p.slots} slots locked</span>
                      <span style={{fontSize:8.5, fontWeight:700, fontFamily:'monospace',
                        color: hot ? CINNABAR : MUTED}}>{pct}%</span>
                    </div>
                    <div style={{height:3, background:'#F3F4F6', borderRadius:999, overflow:'hidden'}}>
                      {/* CSS-native fill + indeterminate shimmer — browser handles both */}
                      <div style={{
                        height:'100%', borderRadius:999,
                        background: (absorbingP1 && p.id==='p1') ? GREEN : sel ? CINNABAR : (hot ? CINNABAR : p.color),
                        width:`${pct}%`,
                        transition:'width 1.4s cubic-bezier(0.22,1,0.36,1), background 0.4s ease',
                        transitionDelay:`${parseInt(p.id.replace('p','')) * 0.18}s`,
                        position:'relative', overflow:'hidden',
                        animationName: (absorbingP1 && p.id==='p1') ? 'absorb-fill' : undefined,
                        animationDuration: (absorbingP1 && p.id==='p1') ? '3.2s' : undefined,
                        animationTimingFunction: (absorbingP1 && p.id==='p1') ? 'ease-in-out' : undefined,
                        animationIterationCount: (absorbingP1 && p.id==='p1') ? 1 : undefined,
                      }}>
                        <div style={{
                          position:'absolute', inset:0,
                          background:'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.52) 50%,transparent 100%)',
                          /* Fold delay into the shorthand to avoid animationDelay conflict */
                          animation:`opp-shimmer ${(absorbingP1 && p.id==='p1') ? '0.9s' : '2.2s'} ease-in-out infinite ${parseInt(p.id.replace('p','')) * 0.22}s`,
                        }}/>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* ══ RIGHT — Live Talent Stream (pixel-matched to left: 560px) */}
        <div style={{
          height:560, overflow:'hidden',
          border:'1px solid #F3F4F6',
          background:'rgba(249,250,251,0.4)',
          display:'flex', flexDirection:'column',
          borderRadius:8,
        }}>

          {/* Panel header */}
          <div style={{
            padding:'11px 18px', borderBottom:'1px solid #F3F4F6',
            display:'flex', alignItems:'center', justifyContent:'space-between',
          }}>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <motion.span
                animate={{opacity:[0.3,1,0.3], scale:[1,1.4,1]}}
                transition={{duration:2, repeat:Infinity, ease:'easeInOut'}}
                style={{width:6,height:6,borderRadius:'50%',background:CINNABAR,display:'inline-block',flexShrink:0}}
              />
              <p style={{margin:0, fontSize:9, fontWeight:700, color:SUBTLE,
                letterSpacing:'0.14em', textTransform:'uppercase', fontFamily:'monospace'}}>
                Talent Stream · Live
              </p>
            </div>
            <span style={{
              fontSize:8.5, fontWeight:700, color:CINNABAR,
              background:'rgba(230,57,70,0.06)', border:'1px solid rgba(230,57,70,0.18)',
              padding:'2px 8px', letterSpacing:'0.06em',
            }}>ZK-PROOF VERIFIED</span>
          </div>

          {/* Live matching engine status bar */}
          <div style={{
            padding:'6px 18px', borderBottom:'1px solid #F3F4F6',
            background:'rgba(16,185,129,0.03)',
            display:'flex', alignItems:'center', justifyContent:'space-between',
          }}>
            <div style={{display:'flex', alignItems:'center', gap:7}}>
              <motion.span
                animate={{opacity:[0.5,1,0.5]}}
                transition={{duration:1.6, repeat:Infinity, ease:'easeInOut'}}
                style={{width:5,height:5,borderRadius:'50%',background:GREEN,flexShrink:0,display:'inline-block'}}
              />
              <span style={{fontSize:9, fontWeight:700, color:GREEN, fontFamily:'monospace', letterSpacing:'0.06em'}}>
                LIVE MATCHING ENGINE ACTIVE
              </span>
              <span style={{fontSize:9, color:SUBTLE, fontFamily:'monospace'}}>|</span>
              <span style={{fontSize:9, color:MUTED, fontFamily:'monospace'}}>7 nodes auditing</span>
            </div>
            <span style={{fontSize:9, color:MUTED, fontFamily:'monospace'}}>
              {candidates.length} eligible · {verifiedCount} ZK-verified · {activePool.tier}
            </span>
          </div>

          {/* Column label row */}
          <div style={{
            display:'grid', gridTemplateColumns:'16px 96px 60px 1fr auto',
            gap:12, padding:'6px 18px', borderBottom:'1px solid #F3F4F6',
            alignItems:'center',
          }}>
            {['', 'STU ID', 'CHC', 'Verified Skills', 'Status'].map((h, ci) => (
              <span key={ci} style={{fontSize:8, fontWeight:700, color:SUBTLE,
                letterSpacing:'0.10em', textTransform:'uppercase', fontFamily:'monospace',
                textAlign: ci===4 ? 'right' : 'left'}}>{h}</span>
            ))}
          </div>

          {/* Talent rows — AnimatePresence for loading ↔ list transition */}
          <div className="talent-list" style={{flex:1, minHeight:0, overflowY:'auto', scrollbarWidth:'none'}}>
            <AnimatePresence mode="wait">
              {loading ? (
                /* 0.5 s ZK-filtering loading state */
                <motion.div key="loading"
                  initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                  transition={{duration:0.18}}
                  style={{
                    display:'flex', flexDirection:'column', alignItems:'center',
                    justifyContent:'center', gap:12, padding:'48px 0',
                  }}
                >
                  <motion.div
                    animate={{rotate:360}}
                    transition={{duration:0.9, repeat:Infinity, ease:'linear'}}
                    style={{
                      width:22, height:22, borderRadius:'50%',
                      border:'2px solid rgba(230,57,70,0.15)',
                      borderTop:`2px solid ${CINNABAR}`,
                    }}
                  />
                  <span style={{fontSize:10, fontWeight:700, color:CINNABAR,
                    fontFamily:'monospace', letterSpacing:'0.08em'}}>
                    ZK-PROOF FILTERING…
                  </span>
                  <span style={{fontSize:9, color:SUBTLE, fontFamily:'monospace'}}>
                    Screening Bloom L{activePool.minBloom}+ candidates
                  </span>
                </motion.div>
              ) : (
                /* Talent list */
                <motion.div key={activePoolId}
                  initial={{opacity:0, y:4}} animate={{opacity:1, y:0}} exit={{opacity:0}}
                  transition={{duration:0.22, ease:[0.22,1,0.36,1]}}
                >
                  {candidates.map((s, i) => {
                    const lvlColor = BLOOM_COLORS[Math.max(0, s.bloom - 1)]
                    const locked = s.sbt === 'Verified'
                    return (
                      <motion.div key={s.id}
                        initial={{opacity:0, x:6}}
                        animate={{opacity:1, x:0}}
                        transition={{duration:0.2, delay: i * 0.025}}
                        style={{
                          display:'grid',
                          gridTemplateColumns:'16px 96px 60px 1fr auto',
                          gap:12, height:42, alignItems:'center',
                          padding:'0 18px', borderBottom:'1px solid #F3F4F6',
                          cursor:'default',
                        }}
                      >
                        {/* Breathing pulse dot */}
                        <motion.span
                          animate={{opacity:[0.3,1,0.3], scale:[1,1.4,1]}}
                          transition={{duration:2, repeat:Infinity, ease:'easeInOut', delay: i * 0.22}}
                          style={{width:5,height:5,borderRadius:'50%',
                            background:CINNABAR,display:'inline-block',flexShrink:0}}
                        />

                        {/* STU ID */}
                        <span style={{fontSize:11.5, fontWeight:700, color:INK,
                          fontFamily:'monospace', letterSpacing:'-0.01em'}}>{s.id}</span>

                        {/* CHC badge */}
                        <span style={{
                          display:'inline-flex', alignItems:'center', justifyContent:'center',
                          fontSize:9, fontWeight:800, color:lvlColor,
                          background:`${lvlColor}14`, padding:'2px 7px',
                          borderRadius:3, letterSpacing:'0.02em',
                        }}>L{s.bloom}·P{s.percentile}</span>

                        {/* Skill tags */}
                        <div style={{display:'flex', gap:4, overflow:'hidden', alignItems:'center'}}>
                          {s.skills.map(sk => (
                            <span key={sk} style={{
                              fontSize:9, color:'#6B7280', background:'#F3F4F6',
                              padding:'1px 7px', borderRadius:3,
                              whiteSpace:'nowrap', fontFamily:'monospace',
                            }}>{sk}</span>
                          ))}
                        </div>

                        {/* Status — Framer Motion glow for PROTOCOL LOCKED */}
                        <div style={{display:'flex', justifyContent:'flex-end'}}>
                          {locked ? (
                            <motion.span
                              animate={{boxShadow:[
                                '0 0 0px rgba(230,57,70,0)',
                                '0 0 6px rgba(230,57,70,0.48)',
                                '0 0 0px rgba(230,57,70,0)',
                              ]}}
                              transition={{duration:2.6, repeat:Infinity, ease:'easeInOut', delay: i * 0.30}}
                              style={{
                                fontSize:8.5, fontWeight:800, color:CINNABAR,
                                border:'1px solid rgba(230,57,70,0.28)',
                                padding:'2px 8px', whiteSpace:'nowrap',
                                fontFamily:'monospace', letterSpacing:'0.06em',
                              }}
                            >PROTOCOL LOCKED</motion.span>
                          ) : (
                            <span style={{
                              fontSize:8.5, fontWeight:600, color:AMBER,
                              border:'1px solid rgba(245,158,11,0.22)',
                              padding:'2px 8px', whiteSpace:'nowrap',
                              fontFamily:'monospace', letterSpacing:'0.06em',
                            }}>PENDING</span>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div style={{
            padding:'10px 18px', borderTop:'1px solid #F3F4F6',
            display:'flex', alignItems:'center', justifyContent:'space-between',
          }}>
            <span style={{fontSize:9, color:SUBTLE, fontFamily:'monospace'}}>
              {candidates.length} profiles · {verifiedCount} verified · {activePool.match}
            </span>
            <motion.button whileTap={{scale:0.96}} style={{
              padding:'5px 14px', border:`1px solid ${CINNABAR}`,
              background:'transparent', color:CINNABAR,
              fontSize:10, fontWeight:700, cursor:'pointer',
              fontFamily:'monospace', letterSpacing:'0.06em',
            }}>Request Batch Access</motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Page
export default function OpportunityPage() {
  const { state, settleStaking } = useSparkle()

  // ── PayFi loop state ────────────────────────────────────────────────────────
  const [stakedAt, setStakedAt] = useState(0)
  const frame1Ref = useRef<HTMLElement>(null)

  function handleStake() {
    setStakedAt(Date.now())
    // Scroll back to Frame 01 — wait for smooth-scroll to reach it (~1.6 s),
    // then fire settleStaking so Nav Credits + WalletWidget both animate from 0
    // exactly as Frame 1 becomes visible.
    setTimeout(() => {
      frame1Ref.current?.scrollIntoView({ behavior:'smooth', block:'start' })
      settleStaking()   // stakeRevision++ → Nav rAF from 0; stakedAt change → WalletWidget rAF from 0
    }, 1600)
  }

  // Big-number tickers — 0.01% per second, read-only from local state (no context writes)
  const [tvl,       setTvl]       = useState(4_280_000)
  const [royalties, setRoyalties] = useState(1_280_450)
  useEffect(() => {
    const id = setInterval(() => {
      setTvl(v      => Math.round(v + v * 0.0001))
      setRoyalties(v => Math.round(v + v * 0.0001))
    }, 1000)
    return () => clearInterval(id)
  }, [])
  function fmtBig(n: number): string {
    return `${(n / 1_000_000).toFixed(2)}M`
  }

  // ── Cumulative Royalties count-up driven by global expertRevenue ──────────────
  // When expertRevenue changes (after forge), display a count-up + green flash
  const [royaltiesFlash, setRoyaltiesFlash] = useState(false)
  const prevExpertRef = useRef(state.expertRevenue)
  useEffect(() => {
    const prev = prevExpertRef.current
    if (state.expertRevenue === prev) return
    prevExpertRef.current = state.expertRevenue
    // Bump the royalties ticker by the same delta × 1000 (protocol-level amplification)
    const delta = (state.expertRevenue - prev) * 1000
    setRoyalties(v => Math.round(v + delta))
    // Green flash
    setRoyaltiesFlash(true)
    setTimeout(() => setRoyaltiesFlash(false), 1800)
  }, [state.expertRevenue])

  // Corner cinnabar vignette (opacity 0.03 — barely perceptible warmth)
  const cornerVignette = `
    radial-gradient(ellipse 55% 38% at 0% 0%,   rgba(230,57,70,0.03) 0%, transparent 70%),
    radial-gradient(ellipse 55% 38% at 100% 0%,  rgba(230,57,70,0.03) 0%, transparent 70%),
    radial-gradient(ellipse 55% 38% at 100% 100%,rgba(230,57,70,0.03) 0%, transparent 70%),
    radial-gradient(ellipse 55% 38% at 0% 100%,  rgba(230,57,70,0.03) 0%, transparent 70%),
    ${BG}
  `

  return (
    <main style={{background:cornerVignette,minHeight:'100vh'}}>
      <Nav/>

      {/* ── Frame 01: Messari-style Audit Terminal ─────────────────── */}
      <section ref={frame1Ref} style={{paddingBottom:55}}>
        <div style={{...WRAP,paddingTop:'7rem'}}>

          {/* Title row */}
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:55}}>
            <div>
              <p style={{margin:0,fontSize:22,fontWeight:700,color:CINNABAR,letterSpacing:'0.15em',textTransform:'uppercase',fontFamily:'var(--font-geist-sans), system-ui, sans-serif'}}>Value attracts opportunity.</p>
              <h1 style={{margin:'16px 0 0',fontSize:40,fontWeight:700,color:'#000000',letterSpacing:'-0.02em',lineHeight:1.1}}>Sparkle Market</h1>
            </div>
            <WalletWidget stakedAt={stakedAt}/>
          </div>

          {/* ── 26% Audit sidebar + 74% charts ── */}
          <div style={{display:'grid',gridTemplateColumns:'26fr 74fr',gap:0,marginBottom:0,alignItems:'start'}}>
            <ProtocolRecap/>

            {/* Right: 3 area charts in a row, no boxes */}
            <div style={{paddingLeft:40}}>
              <div style={{display:'flex',gap:0}}>
                {[
                  {pts:TVL_SERIES,      label:'Total Value Locked',  value:fmtBig(tvl),       unit:'SPRK',       trend:'+12.4%', good:true,  flash:false},
                  {pts:VELOCITY_SERIES, label:'Talent Velocity',      value:'38.4k',           unit:'sess / day', trend:'+8.1%',  good:true,  flash:false},
                  {pts:DIVIDEND_SERIES, label:'Cumulative Royalties', value:fmtBig(royalties), unit:'SPRK',       trend:'+19.3%', good:true,  flash:royaltiesFlash},
                ].map((c,i)=>(
                  <div key={c.label} style={{
                    flex:1,minWidth:0,
                    paddingLeft:i===0?0:28,
                    borderLeft:i===0?'none':'1px solid #F3F4F6',
                  }}>
                    <AreaChart {...c}/>
                  </div>
                ))}
              </div>

              {/* Portfolio row — monospace, hairlines only */}
              <div style={{display:'flex',gap:0,marginTop:24,paddingTop:20,borderTop:'1px solid #F3F4F6'}}>
                {MICRO_STATS.map((s,i)=>(
                  <div key={s.label} style={{
                    flex:1,padding:'0',
                    paddingLeft:i===0?0:20,
                    borderLeft:i===0?'none':'1px solid #F3F4F6',
                  }}>
                    <p style={{margin:'0 0 4px',fontSize:8.5,fontWeight:700,color:SUBTLE,letterSpacing:'0.10em',textTransform:'uppercase',fontFamily:'monospace'}}>{s.label}</p>
                    <p style={{margin:0,fontSize:16,fontWeight:800,color:INK,fontFamily:'monospace',lineHeight:1}}>
                      {s.value}<span style={{fontSize:9.5,fontWeight:500,color:SUBTLE,marginLeft:4}}>{s.unit}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Cognitive Mindshare Treemap ── */}
          <div style={{marginTop:16,paddingTop:18,borderTop:'1px solid #F3F4F6',marginBottom:28}}>
            <CognitiveTreemap/>
          </div>
        </div>

      </section>

      {/* ── Frame 02: Exchange — full-viewport terminal ─────────────── */}
      {/* borderTop/Bottom double as dividers; zero padding so table lines coincide */}
      <section style={{
        height:'calc(100vh - 60px)',
        display:'flex',flexDirection:'column',
        borderTop:'1px solid #E5E7EB',borderBottom:'1px solid #E5E7EB',
        overflow:'hidden',
      }}>
        <div style={{flex:1,minHeight:0,maxWidth:1440,margin:'0 auto',padding:'0 5%',width:'100%',display:'flex',flexDirection:'column'}}>
          <WisdomRoyaltyExchange onStake={handleStake}/>
        </div>
      </section>

      {/* ── Frame 03: Institutional Funnel (merged) ────────────────── */}
      <section style={{paddingTop:'4.5rem',paddingBottom:'5rem'}}>
        <div style={WRAP}>
          <div style={{marginBottom:28}}>
            <p style={{margin:'0 0 4px',fontSize:11,fontWeight:700,color:CINNABAR,letterSpacing:'0.10em',textTransform:'uppercase'}}>Institutional Network</p>
            <h2 style={{margin:0,fontSize:20,fontWeight:800,color:INK}}>Enterprise Demand Hub</h2>
          </div>
          <InstitutionalFunnel/>
        </div>
      </section>
    </main>
  )
}
