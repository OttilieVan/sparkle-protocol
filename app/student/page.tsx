'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Nav from '@/components/Nav'
import { useSparkle, EXPERT_ID, EXPERT_THEME } from '@/app/providers'

// ── Palette ───────────────────────────────────────────────────────────────────
const BLUE     = '#3B82F6'
const AMBER    = '#F59E0B'
const GREEN    = '#10B981'
const INK      = '#111827'
const BODY     = '#374151'
const MUTED    = '#6B7280'
const SUBTLE   = '#9CA3AF'
const BORDER   = '#F3F4F6'
const CINNABAR = '#E11D48'

// ── Masters ───────────────────────────────────────────────────────────────────
const MASTERS = [
  { id:'em001', name:EXPERT_ID,     initials:EXPERT_THEME.initials, color:EXPERT_THEME.color, online:true,  school:'Segment Diagram Method',  match:98 },
  { id:'pz007', name:'Expert-MHT5566', initials:'MHT', color:'#3B82F6', online:true,  school:'Reverse Thinking Method', match:94 },
  { id:'sx012', name:'Expert-MXU1155', initials:'MXU', color:'#EC4899', online:true,  school:'Abstraction Ladder',      match:89 },
  { id:'dl003', name:'Expert-DAD0824', initials:'DAD', color:'#8B5CF6', online:false, school:'Socratic Protocol',       match:82 },
]

// ── CHC axes ──────────────────────────────────────────────────────────────────
const CHC_AXES = [
  { key:'Gf', label:'Fluid Reasoning',   score:78, angle:-90 },
  { key:'Gv', label:'Visual-Spatial',    score:85, angle:  0 },
  { key:'Gs', label:'Processing Speed',  score:91, angle: 90 },
  { key:'Gq', label:'Quantitative Logic',score:72, angle:180 },
]

// ── Records / Glitches ────────────────────────────────────────────────────────
const LEARNING_RECORDS = [
  { id:1, date:'Apr 2',  topic:'Ratio & Proportion',    bloom:'Apply',     minutes:15,  master:EXPERT_ID,   bcolor:'#F59E0B' },
  { id:2, date:'Apr 1',  topic:'Spatial Geometry',      bloom:'Understand',minutes:42,  master:'Expert-DAD0824',  bcolor:'#10B981' },
  { id:3, date:'Mar 30', topic:'Relative Velocity',     bloom:'Analyze',   minutes:58,  master:EXPERT_ID,   bcolor:'#3B82F6' },
  { id:4, date:'Mar 29', topic:'Inverse Reasoning',     bloom:'Evaluate',  minutes:140, master:EXPERT_ID,   bcolor:'#8B5CF6' },
  { id:5, date:'Mar 28', topic:'Number Theory · Primes',bloom:'Remember',  minutes:22,  master:'Expert-DAD0824',  bcolor:'#EC4899' },
]
const GLITCHES = [
  { id:1, topic:'Ratio Partitioning',  detail:'Confused total units with part units',   attempts:3, tag:'Quantitative'   },
  { id:2, topic:'Volume Calculation',  detail:'Applied 2D formula to 3D shape',         attempts:2, tag:'Visual-Spatial'  },
  { id:3, topic:'Conditional Logic',   detail:'Negated the wrong proposition',          attempts:4, tag:'Fluid Reasoning' },
  { id:4, topic:'Prime Factorization', detail:'Missed composite factor in factor tree', attempts:2, tag:'Number Theory'   },
]

// ── Master Logic: SVG geometry ────────────────────────────────────────────────
// AB = 262.5 km, equal speeds 37.5 km/h. Scale: 480px / 262.5km.
// 8:00 AM  → car1 = 50 (A),  car2 = 530 (B)
// 10:00 AM → car1 = 187,     car2 = 393   gap = 206px ≈ 112.5km
// Meeting  → car1 = car2 = 290 (11:30 AM midpoint)
// 1:00 PM  → car1 = 393,     car2 = 187   gap = 206px ≈ 112.5km

type SvgPhase = 'p8am' | 'p10am' | 'p1pm'
const SVG_PHASES: Record<SvgPhase, { c1: number; c2: number; showGap: boolean; label: string }> = {
  p8am:  { c1:  50, c2: 530, showGap:false, label:'8:00 AM  — Departure'  },
  p10am: { c1: 187, c2: 393, showGap:true,  label:'10:00 AM — 112.5 km gap' },
  p1pm:  { c1: 393, c2: 187, showGap:true,  label:'1:00 PM  — 112.5 km gap again' },
}

// ── Master Logic: Dialogue ────────────────────────────────────────────────────
type Role = 'mentor' | 'student'
interface DMsg { id:number; role:Role; text:string; phase?:SvgPhase }

const DIALOGUE: DMsg[] = [
  { id:1, role:'mentor',
    text:"A logic without a diagram is a path without a map. We have three temporal coordinates: 8:00 AM, 10:00 AM, and 1:00 PM. I've initialized the Temporal Coordinate System — what do you observe about the gap at each snapshot?",
    phase:'p8am' },
  { id:2, role:'student',
    text:"I've mapped both snapshots. The gap is identical — 112.5 km — at both 10 AM and 1 PM. That's... surprisingly symmetric.",
    phase:'p10am' },
  { id:3, role:'mentor',
    text:"Precisely. Symmetry in motion problems is never accidental — it's a structural invariant. Between 10 AM and 1 PM: how much time elapsed? And critically, what must have happened to the vehicles during that exact 3-hour window?",
    phase:'p10am' },
  { id:4, role:'student',
    text:"Three hours elapsed. And if the gap reached zero and expanded to the same value again — they must have met somewhere in the middle and then diverged. That's the Meeting-Separating principle!",
    phase:'p1pm' },
  { id:5, role:'mentor',
    text:"Cognitive Synthesis achieved. You've isolated the invariance. In 3 hours, combined path = 2 × 112.5 = 225 km. Relative Velocity = 225 ÷ 3 = 75 km/h. Combined path in first 2 hours = 75 × 2 = 150 km. ∴ AB = 150 + 112.5 = 262.5 km.",
    phase:'p1pm' },
]

// Student suggested responses (chips)
const STUDENT_CHIPS: Record<number, string> = {
  1: "I see the symmetry — let me mark both timestamps →",
  3: "3 hours elapsed — and they must have crossed and separated →",
}

// Solution steps revealed in achievement card
const SOLUTION_STEPS = [
  { badge:'①', label:'Temporal Gap',        value:'1:00 PM − 10:00 AM = 3 hours' },
  { badge:'②', label:'Combined Path',       value:'2 × 112.5 km = 225 km (meet + separate)' },
  { badge:'③', label:'Relative Velocity',   value:'225 ÷ 3 = 75 km/h' },
  { badge:'④', label:'Total Distance AB',   value:'75 × 2 + 112.5 = 262.5 km ✓' },
]

// ── CHC Stratum I — 70 Narrow Abilities Radar ────────────────────────────────
const CHC_STRATUM: { key:string; name:string; color:string; abilities:{ code:string; name:string; score:number }[] }[] = [
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
  { key:'Gv', name:'Visual-Spatial Processing', color:AMBER, abilities:[
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
  { key:'Gq', name:'Quantitative Knowledge', color:GREEN, abilities:[
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

// ── Expert Logic Pool — 120 items, 15 per CHC dimension ─────────────────────
const EXPERT_LOGIC_POOL: {
  initials: string; color: string; name: string; unit: string
  skill: string; category: string; match: number
}[] = [
  { initials:EXPERT_THEME.initials, color:EXPERT_THEME.color, name:EXPERT_ID, unit:'Phonetic Decoding Bridge', skill:'Auditory Processing', category:'Ga', match:98 },
  { initials:'NKM', color:'#EC4899', name:'Expert-NKM7733',   unit:'Sound Pattern Recognition',      skill:'Auditory Processing',  category:'Ga',  match:93 },
  { initials:'ATR', color:'#EC4899', name:'Expert-ATR2245',   unit:'Pitch & Rhythm Sequencing',      skill:'Auditory Processing',  category:'Ga',  match:91 },
  { initials:'LIN', color:'#EC4899', name:'Expert-LIN3389',   unit:'Temporal Order Processing',      skill:'Auditory Processing',  category:'Ga',  match:89 },
  { initials:'KIM', color:'#EC4899', name:'Expert-KIM4412',   unit:'Acoustic Memory Mapping',        skill:'Auditory Processing',  category:'Ga',  match:86 },
  { initials:'YTO', color:'#EC4899', name:'Expert-YTO5527',   unit:'Speech Discrimination Circuits', skill:'Auditory Processing',  category:'Ga',  match:84 },
  { initials:'BAO', color:'#EC4899', name:'Expert-BAO6634',   unit:'Phonological Loop Training',     skill:'Auditory Processing',  category:'Ga',  match:82 },
  { initials:'SRV', color:'#EC4899', name:'Expert-SRV7741',   unit:'Auditory Contrast Detection',    skill:'Auditory Processing',  category:'Ga',  match:80 },
  { initials:'JWV', color:'#EC4899', name:'Expert-JWV8856',   unit:'Binaural Integration Engine',    skill:'Auditory Processing',  category:'Ga',  match:80 },
  { initials:'AFO', color:'#EC4899', name:'Expert-AFO9963',   unit:'Tonal Memory Anchoring',         skill:'Auditory Processing',  category:'Ga',  match:80 },
  { initials:'KOA', color:'#EC4899', name:'Expert-KOA1174',   unit:'Rhythm Pattern Encoding',        skill:'Auditory Processing',  category:'Ga',  match:80 },
  { initials:'TON', color:'#EC4899', name:'Expert-TON2285',   unit:'Spectral Contrast Processing',   skill:'Auditory Processing',  category:'Ga',  match:80 },
  { initials:'ZHG', color:'#EC4899', name:'Expert-ZHG3396',   unit:'Phoneme Boundary Detection',     skill:'Auditory Processing',  category:'Ga',  match:80 },
  { initials:'RLB', color:'#EC4899', name:'Expert-RLB4407',   unit:'Harmonic Series Mapping',        skill:'Auditory Processing',  category:'Ga',  match:80 },
  { initials:'NSO', color:'#EC4899', name:'Expert-NSO5518',   unit:'Auditory Figure-Ground Logic',   skill:'Auditory Processing',  category:'Ga',  match:80 },
  { initials:EXPERT_THEME.initials, color:EXPERT_THEME.color, name:EXPERT_ID, unit:'Segment Diagram · Socratic Protocol', skill:'Visual-Spatial', category:'Gv', match:97 },
  { initials:'WEI', color:'#F59E0B', name:'Expert-WEI1234',   unit:'Perspective & Depth Logic',      skill:'Visual-Spatial',       category:'Gv',  match:94 },
  { initials:'VSP', color:'#F59E0B', name:'Expert-VSP2345',   unit:'Mental Map Construction',        skill:'Visual-Spatial',       category:'Gv',  match:91 },
  { initials:'LGV', color:'#F59E0B', name:'Expert-LGV3456',   unit:'Figural Reasoning Chains',       skill:'Visual-Spatial',       category:'Gv',  match:89 },
  { initials:'KVS', color:'#F59E0B', name:'Expert-KVS4567',   unit:'Spatial Orientation Engine',     skill:'Visual-Spatial',       category:'Gv',  match:87 },
  { initials:'WRT', color:'#F59E0B', name:'Expert-WRT5678',   unit:'Mental Imagery Synthesis',       skill:'Visual-Spatial',       category:'Gv',  match:85 },
  { initials:'DCH', color:'#F59E0B', name:'Expert-DCH6789',   unit:'Visuospatial Pattern Lock',      skill:'Visual-Spatial',       category:'Gv',  match:83 },
  { initials:'ZPT', color:'#F59E0B', name:'Expert-ZPT7890',   unit:'3D Volume Estimation Logic',     skill:'Visual-Spatial',       category:'Gv',  match:81 },
  { initials:'ORT', color:'#F59E0B', name:'Expert-ORT8901',   unit:'Orthographic Projection Logic',  skill:'Visual-Spatial',       category:'Gv',  match:81 },
  { initials:'SPR', color:'#F59E0B', name:'Expert-SPR9012',   unit:'Depth Cue Integration',          skill:'Visual-Spatial',       category:'Gv',  match:80 },
  { initials:'PMV', color:'#F59E0B', name:'Expert-PMV1123',   unit:'Topographic Reasoning',          skill:'Visual-Spatial',       category:'Gv',  match:80 },
  { initials:'LRF', color:'#F59E0B', name:'Expert-LRF2234',   unit:'Architectural Schematic Logic',  skill:'Visual-Spatial',       category:'Gv',  match:80 },
  { initials:'CVZ', color:'#F59E0B', name:'Expert-CVZ3345',   unit:'Dynamic Tracking Engine',        skill:'Visual-Spatial',       category:'Gv',  match:80 },
  { initials:'GFM', color:'#F59E0B', name:'Expert-GFM4456',   unit:'Shape Decomposition Logic',      skill:'Visual-Spatial',       category:'Gv',  match:80 },
  { initials:'BNV', color:'#F59E0B', name:'Expert-BNV5567',   unit:'Stereoscopic Depth Engine',      skill:'Visual-Spatial',       category:'Gv',  match:80 },
  { initials:'MHT', color:'#8B5CF6', name:'Expert-MHT5566',   unit:'Sequential Working Memory',      skill:'Working Memory',       category:'Gwm', match:97 },
  { initials:'WMM', color:'#8B5CF6', name:'Expert-WMM1122',   unit:'Dual-Task Capacity Training',    skill:'Working Memory',       category:'Gwm', match:93 },
  { initials:'KGM', color:'#8B5CF6', name:'Expert-KGM2233',   unit:'Interference Control Drills',    skill:'Working Memory',       category:'Gwm', match:90 },
  { initials:'LNW', color:'#8B5CF6', name:'Expert-LNW3344',   unit:'N-Back Protocol Suite',          skill:'Working Memory',       category:'Gwm', match:88 },
  { initials:'TYW', color:'#8B5CF6', name:'Expert-TYW4455',   unit:'Phonological Store Training',    skill:'Working Memory',       category:'Gwm', match:86 },
  { initials:'CHW', color:'#8B5CF6', name:'Expert-CHW5566',   unit:'Visuospatial Sketchpad Drills',  skill:'Working Memory',       category:'Gwm', match:84 },
  { initials:'RJW', color:'#8B5CF6', name:'Expert-RJW6677',   unit:'Executive Control Sequencing',   skill:'Working Memory',       category:'Gwm', match:82 },
  { initials:'BSY', color:'#8B5CF6', name:'Expert-BSY7788',   unit:'Cognitive Load Optimization',    skill:'Working Memory',       category:'Gwm', match:80 },
  { initials:'IFM', color:'#8B5CF6', name:'Expert-IFM8899',   unit:'Chunking Strategy Suite',        skill:'Working Memory',       category:'Gwm', match:80 },
  { initials:'TKC', color:'#8B5CF6', name:'Expert-TKC9900',   unit:'Multi-Channel Routing Logic',    skill:'Working Memory',       category:'Gwm', match:80 },
  { initials:'RBF', color:'#8B5CF6', name:'Expert-RBF1011',   unit:'Proactive Interference Shield',  skill:'Working Memory',       category:'Gwm', match:80 },
  { initials:'SQU', color:'#8B5CF6', name:'Expert-SQU2122',   unit:'Temporal Ordering Circuits',     skill:'Working Memory',       category:'Gwm', match:80 },
  { initials:'MFT', color:'#8B5CF6', name:'Expert-MFT3233',   unit:'Executive Gating System',        skill:'Working Memory',       category:'Gwm', match:80 },
  { initials:'CGT', color:'#8B5CF6', name:'Expert-CGT4344',   unit:'Load Balancing Protocol',        skill:'Working Memory',       category:'Gwm', match:80 },
  { initials:'WBN', color:'#8B5CF6', name:'Expert-WBN5455',   unit:'Integrated Buffer Training',     skill:'Working Memory',       category:'Gwm', match:80 },
  { initials:'MXU', color:'#3B82F6', name:'Expert-MXU1155',   unit:'Abstract Symbol Mapping',        skill:'Fluid Intelligence',   category:'Gf',  match:97 },
  { initials:'FRO', color:'#3B82F6', name:'Expert-FRO2266',   unit:'Novel Pattern Induction',        skill:'Fluid Intelligence',   category:'Gf',  match:95 },
  { initials:'RZN', color:'#3B82F6', name:'Expert-RZN3377',   unit:'Analogical Transfer Logic',      skill:'Fluid Intelligence',   category:'Gf',  match:92 },
  { initials:'WNG', color:'#3B82F6', name:'Expert-WNG4488',   unit:'Matrix Reasoning Engine',        skill:'Fluid Intelligence',   category:'Gf',  match:90 },
  { initials:'LAR', color:'#3B82F6', name:'Expert-LAR5599',   unit:'Inductive Leap Circuits',        skill:'Fluid Intelligence',   category:'Gf',  match:88 },
  { initials:'YKN', color:'#3B82F6', name:'Expert-YKN6600',   unit:'Deductive Proof Chains',         skill:'Fluid Intelligence',   category:'Gf',  match:86 },
  { initials:'HRC', color:'#3B82F6', name:'Expert-HRC7711',   unit:'Systematic Hypothesis Testing',  skill:'Fluid Intelligence',   category:'Gf',  match:83 },
  { initials:'CDR', color:'#3B82F6', name:'Expert-CDR8822',   unit:'Rule Discovery Protocols',       skill:'Fluid Intelligence',   category:'Gf',  match:81 },
  { initials:'SCM', color:'#3B82F6', name:'Expert-SCM9933',   unit:'Constraint Relaxation Engine',   skill:'Fluid Intelligence',   category:'Gf',  match:81 },
  { initials:'IFL', color:'#3B82F6', name:'Expert-IFL1044',   unit:'Causal Chain Synthesis',         skill:'Fluid Intelligence',   category:'Gf',  match:81 },
  { initials:'ABD', color:'#3B82F6', name:'Expert-ABD2155',   unit:'Concept Mapping Logic',          skill:'Fluid Intelligence',   category:'Gf',  match:80 },
  { initials:'PVL', color:'#3B82F6', name:'Expert-PVL3266',   unit:'Structural Pattern Shift',       skill:'Fluid Intelligence',   category:'Gf',  match:80 },
  { initials:'NFM', color:'#3B82F6', name:'Expert-NFM4377',   unit:'Emergent Rule Formation',        skill:'Fluid Intelligence',   category:'Gf',  match:80 },
  { initials:'ARO', color:'#3B82F6', name:'Expert-ARO5488',   unit:'Cross-Domain Transfer Logic',    skill:'Fluid Intelligence',   category:'Gf',  match:80 },
  { initials:'THY', color:'#3B82F6', name:'Expert-THY6599',   unit:'Hypothesis Space Mapping',       skill:'Fluid Intelligence',   category:'Gf',  match:80 },
  { initials:'DAD', color:'#10B981', name:'Expert-DAD0824',   unit:'Linguistic Contextual Anchors',  skill:'Crystallized Intel.',  category:'Gc',  match:95 },
  { initials:'CKN', color:'#10B981', name:'Expert-CKN1133',   unit:'Semantic Web Expansion',         skill:'Crystallized Intel.',  category:'Gc',  match:93 },
  { initials:'LVB', color:'#10B981', name:'Expert-LVB2244',   unit:'Domain Knowledge Encoding',      skill:'Crystallized Intel.',  category:'Gc',  match:90 },
  { initials:'HGC', color:'#10B981', name:'Expert-HGC3355',   unit:'Cultural Schema Activation',     skill:'Crystallized Intel.',  category:'Gc',  match:88 },
  { initials:'ZGC', color:'#10B981', name:'Expert-ZGC4466',   unit:'Declarative Memory Webs',        skill:'Crystallized Intel.',  category:'Gc',  match:86 },
  { initials:'QWD', color:'#10B981', name:'Expert-QWD5577',   unit:'Academic Vocabulary Circuits',   skill:'Crystallized Intel.',  category:'Gc',  match:84 },
  { initials:'KNT', color:'#10B981', name:'Expert-KNT6688',   unit:'Interdisciplinary Linking',      skill:'Crystallized Intel.',  category:'Gc',  match:82 },
  { initials:'CCR', color:'#10B981', name:'Expert-CCR7799',   unit:'Applied Knowledge Synthesis',    skill:'Crystallized Intel.',  category:'Gc',  match:80 },
  { initials:'WLK', color:'#10B981', name:'Expert-WLK8800',   unit:'Lexical Network Expansion',      skill:'Crystallized Intel.',  category:'Gc',  match:80 },
  { initials:'SCN', color:'#10B981', name:'Expert-SCN9911',   unit:'Prior Knowledge Activation',     skill:'Crystallized Intel.',  category:'Gc',  match:80 },
  { initials:'ICD', color:'#10B981', name:'Expert-ICD1022',   unit:'Fact Compression Logic',         skill:'Crystallized Intel.',  category:'Gc',  match:80 },
  { initials:'RHB', color:'#10B981', name:'Expert-RHB2133',   unit:'Comprehension Scaffolding',      skill:'Crystallized Intel.',  category:'Gc',  match:80 },
  { initials:'HRT', color:'#10B981', name:'Expert-HRT3244',   unit:'Historical Context Webs',        skill:'Crystallized Intel.',  category:'Gc',  match:80 },
  { initials:'FDT', color:'#10B981', name:'Expert-FDT4355',   unit:'Encyclopedic Recall Engine',     skill:'Crystallized Intel.',  category:'Gc',  match:80 },
  { initials:'NCH', color:'#10B981', name:'Expert-NCH5466',   unit:'Story Grammar Encoding',         skill:'Crystallized Intel.',  category:'Gc',  match:80 },
  { initials:'BLK', color:'#06B6D4', name:'Expert-BLK1177',   unit:'Memory Palace Architecture',     skill:'Long-term Retrieval',  category:'Glr', match:93 },
  { initials:'MAR', color:'#06B6D4', name:'Expert-MAR2288',   unit:'Spaced Repetition Protocols',    skill:'Long-term Retrieval',  category:'Glr', match:91 },
  { initials:'RFL', color:'#06B6D4', name:'Expert-RFL3399',   unit:'Free Recall Optimization',       skill:'Long-term Retrieval',  category:'Glr', match:89 },
  { initials:'GGL', color:'#06B6D4', name:'Expert-GGL4400',   unit:'Cued Retrieval Chains',          skill:'Long-term Retrieval',  category:'Glr', match:87 },
  { initials:'AFL', color:'#06B6D4', name:'Expert-AFL5511',   unit:'Associational Fluency Nets',     skill:'Long-term Retrieval',  category:'Glr', match:85 },
  { initials:'WCH', color:'#06B6D4', name:'Expert-WCH6622',   unit:'Semantic Fluency Pathways',      skill:'Long-term Retrieval',  category:'Glr', match:83 },
  { initials:'MNM', color:'#06B6D4', name:'Expert-MNM7733',   unit:'Episodic Memory Binding',        skill:'Long-term Retrieval',  category:'Glr', match:82 },
  { initials:'IDR', color:'#06B6D4', name:'Expert-IDR8844',   unit:'Ideational Fluency Engine',      skill:'Long-term Retrieval',  category:'Glr', match:80 },
  { initials:'FLK', color:'#06B6D4', name:'Expert-FLK9955',   unit:'Figural Fluency Pathways',       skill:'Long-term Retrieval',  category:'Glr', match:80 },
  { initials:'LFL', color:'#06B6D4', name:'Expert-LFL1066',   unit:'Paired Associate Training',      skill:'Long-term Retrieval',  category:'Glr', match:80 },
  { initials:'CNT', color:'#06B6D4', name:'Expert-CNT2177',   unit:'Memory Consolidation Bridge',    skill:'Long-term Retrieval',  category:'Glr', match:80 },
  { initials:'ART', color:'#06B6D4', name:'Expert-ART3288',   unit:'Context-Dependent Recall',       skill:'Long-term Retrieval',  category:'Glr', match:80 },
  { initials:'PBD', color:'#06B6D4', name:'Expert-PBD4399',   unit:'Learning Curve Optimizer',       skill:'Long-term Retrieval',  category:'Glr', match:80 },
  { initials:'TEN', color:'#06B6D4', name:'Expert-TEN5400',   unit:'Contextual Encoding Engine',     skill:'Long-term Retrieval',  category:'Glr', match:80 },
  { initials:'NBL', color:'#06B6D4', name:'Expert-NBL6511',   unit:'Neural Trace Reinforcement',     skill:'Long-term Retrieval',  category:'Glr', match:80 },
  { initials:'RVR', color:'#F97316', name:'Expert-RVR1144',   unit:'Processing Speed Protocols',     skill:'Processing Speed',     category:'Gs',  match:97 },
  { initials:'SPG', color:'#F97316', name:'Expert-SPG2255',   unit:'Rapid Decision Encoding',        skill:'Processing Speed',     category:'Gs',  match:95 },
  { initials:'FGS', color:'#F97316', name:'Expert-FGS3366',   unit:'Perceptual Speed Sprint',        skill:'Processing Speed',     category:'Gs',  match:93 },
  { initials:'QTK', color:'#F97316', name:'Expert-QTK4477',   unit:'Number Facility Training',       skill:'Processing Speed',     category:'Gs',  match:90 },
  { initials:'CLG', color:'#F97316', name:'Expert-CLG5588',   unit:'Rate Test-Taking Engine',        skill:'Processing Speed',     category:'Gs',  match:88 },
  { initials:'RFP', color:'#F97316', name:'Expert-RFP6699',   unit:'Decision Speed Circuits',        skill:'Processing Speed',     category:'Gs',  match:86 },
  { initials:'ZFR', color:'#F97316', name:'Expert-ZFR7700',   unit:'Psychomotor Automation',         skill:'Processing Speed',     category:'Gs',  match:84 },
  { initials:'NRD', color:'#F97316', name:'Expert-NRD8811',   unit:'Reading Speed Optimization',     skill:'Processing Speed',     category:'Gs',  match:82 },
  { initials:'FKY', color:'#F97316', name:'Expert-FKY9922',   unit:'Visual Search Acceleration',     skill:'Processing Speed',     category:'Gs',  match:82 },
  { initials:'TSC', color:'#F97316', name:'Expert-TSC1033',   unit:'Eye Movement Efficiency',        skill:'Processing Speed',     category:'Gs',  match:81 },
  { initials:'CFT', color:'#F97316', name:'Expert-CFT2144',   unit:'Clerical Speed Calibration',     skill:'Processing Speed',     category:'Gs',  match:81 },
  { initials:'RPR', color:'#F97316', name:'Expert-RPR3255',   unit:'Symbol Comparison Sprint',       skill:'Processing Speed',     category:'Gs',  match:80 },
  { initials:'SBF', color:'#F97316', name:'Expert-SBF4366',   unit:'Rapid Execution Pathways',       skill:'Processing Speed',     category:'Gs',  match:80 },
  { initials:'WAC', color:'#F97316', name:'Expert-WAC5477',   unit:'Neural Latency Reduction',       skill:'Processing Speed',     category:'Gs',  match:80 },
  { initials:'CRX', color:'#F97316', name:'Expert-CRX6588',   unit:'Perceptual Automation Suite',    skill:'Processing Speed',     category:'Gs',  match:80 },
  { initials:'YMD', color:'#059669', name:'Expert-YMD1199',   unit:'Number Theory Mastery',          skill:'Quantitative Know.',   category:'Gq',  match:97 },
  { initials:'QMT', color:'#059669', name:'Expert-QMT2200',   unit:'Applied Algebra Circuits',       skill:'Quantitative Know.',   category:'Gq',  match:95 },
  { initials:'NTK', color:'#059669', name:'Expert-NTK3311',   unit:'Statistical Pattern Reasoning',  skill:'Quantitative Know.',   category:'Gq',  match:93 },
  { initials:'CHQ', color:'#059669', name:'Expert-CHQ4422',   unit:'Calculus Logic Chains',          skill:'Quantitative Know.',   category:'Gq',  match:91 },
  { initials:'WQT', color:'#059669', name:'Expert-WQT5533',   unit:'Proportional Reasoning Engine',  skill:'Quantitative Know.',   category:'Gq',  match:89 },
  { initials:'ZLQ', color:'#059669', name:'Expert-ZLQ6644',   unit:'Geometric Proof Synthesis',      skill:'Quantitative Know.',   category:'Gq',  match:87 },
  { initials:'EKN', color:'#059669', name:'Expert-EKN7755',   unit:'Number Sense Calibration',       skill:'Quantitative Know.',   category:'Gq',  match:85 },
  { initials:'FMT', color:'#059669', name:'Expert-FMT8866',   unit:'Applied Statistics Circuits',    skill:'Quantitative Know.',   category:'Gq',  match:83 },
  { initials:'NLB', color:'#059669', name:'Expert-NLB9977',   unit:'Number Decomposition Logic',     skill:'Quantitative Know.',   category:'Gq',  match:83 },
  { initials:'ARQ', color:'#059669', name:'Expert-ARQ1088',   unit:'Arithmetic Fluency Engine',      skill:'Quantitative Know.',   category:'Gq',  match:82 },
  { initials:'GAL', color:'#059669', name:'Expert-GAL2199',   unit:'Algebraic Structure Logic',      skill:'Quantitative Know.',   category:'Gq',  match:82 },
  { initials:'DBR', color:'#059669', name:'Expert-DBR3200',   unit:'Data Interpretation Circuits',   skill:'Quantitative Know.',   category:'Gq',  match:81 },
  { initials:'CRA', color:'#059669', name:'Expert-CRA4311',   unit:'Ratio & Rate Mastery',           skill:'Quantitative Know.',   category:'Gq',  match:81 },
  { initials:'SET', color:'#059669', name:'Expert-SET5422',   unit:'Set Theory Foundations',         skill:'Quantitative Know.',   category:'Gq',  match:80 },
  { initials:'PMT', color:'#059669', name:'Expert-PMT6533',   unit:'Mathematical Proof Logic',       skill:'Quantitative Know.',   category:'Gq',  match:80 },
]

// Flatten all abilities with cumulative angle
function buildRadarAngles() {
  const total = CHC_STRATUM.reduce((s, g) => s + g.abilities.length, 0)
  const step = (2 * Math.PI) / total
  let idx = 0
  return CHC_STRATUM.map(group => ({
    ...group,
    startIdx: (() => { const s = idx; idx += group.abilities.length; return s })(),
    abilities: group.abilities.map((ab, i) => ({
      ...ab,
      angle: -Math.PI / 2 + (idx - group.abilities.length + i) * step,
    })),
  }))
}

function CHCRadar({ selectedCategory, onDimClick }: {
  selectedCategory: string | null
  onDimClick: (k: string | null) => void
}) {
  const [hovered, setHovered] = useState<{ group:string; code:string } | null>(null)
  const CX = 200, CY = 200, R_MAX = 160, R_LABEL = R_MAX + 18

  const groups = buildRadarAngles()
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

  const hoveredAb = hovered
    ? groups.find(g => g.key === hovered.group)?.abilities.find(a => a.code === hovered.code)
    : null

  return (
    <div>
      <svg viewBox="0 0 400 400" width="100%" style={{ display:'block' }}>
        {[25,50,75,100].map(p => (
          <circle key={p} cx={CX} cy={CY} r={R_MAX * p / 100}
            fill="none" stroke={BORDER} strokeWidth={p===100 ? 1 : 0.7} />
        ))}
        {[50, 75, 100].map(p => (
          <text key={p} x={CX+2} y={CY - R_MAX*p/100 + 9}
            fontSize={6.5} fill={SUBTLE} textAnchor="middle"
            style={{ fontFamily:'system-ui' }}>{p}</text>
        ))}
        {groups.map(group => {
          const first    = group.abilities[0].angle - step / 2
          const last     = group.abilities[group.abilities.length-1].angle + step / 2
          const isSel    = selectedCategory === group.key
          const isDimmed = selectedCategory && !isSel
          return (
            <path key={group.key} d={sectorPath(first, last, R_MAX)}
              fill={isSel ? `${group.color}1E` : `${group.color}09`}
              stroke={isSel ? `${group.color}55` : `${group.color}22`}
              strokeWidth={isSel ? 1.4 : 0.7}
              opacity={isDimmed ? 0.3 : 1}
              style={{ transition:'opacity 0.2s, fill 0.2s' }} />
          )
        })}
        {groups.flatMap(g => g.abilities.map(ab => (
          <line key={`${g.key}-${ab.code}`} x1={CX} y1={CY}
            x2={(CX + R_MAX * Math.cos(ab.angle)).toFixed(1) as unknown as number}
            y2={(CY + R_MAX * Math.sin(ab.angle)).toFixed(1) as unknown as number}
            stroke={`${g.color}22`} strokeWidth={0.6} />
        )))}
        <polygon points={allPts} fill={`${BLUE}12`} stroke={BLUE} strokeWidth={1.2} />
        {groups.flatMap(group => group.abilities.map(ab => {
          const r     = R_MAX * ab.score / 100
          const px    = CX + r * Math.cos(ab.angle)
          const py    = CY + r * Math.sin(ab.angle)
          const isHov = hovered?.group === group.key && hovered?.code === ab.code
          const isSel = selectedCategory === group.key
          return (
            <circle key={`${group.key}-${ab.code}-dot`}
              cx={px.toFixed(1) as unknown as number}
              cy={py.toFixed(1) as unknown as number}
              r={isHov || isSel ? 5.5 : ab.score >= 90 ? 3.5 : 2.5}
              fill={isHov || isSel ? group.color : `${group.color}88`}
              opacity={selectedCategory && !isSel ? 0.3 : 1}
              style={{ cursor:'pointer', transition:'r 0.15s, opacity 0.2s',
                filter: isSel ? `drop-shadow(0 0 3px ${group.color})` : 'none' }}
              onMouseEnter={() => setHovered({ group:group.key, code:ab.code })}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onDimClick(isSel ? null : group.key)} />
          )
        }))}
        {groups.map(group => {
          const midAngle = group.abilities.reduce((s, a) => s + a.angle, 0) / group.abilities.length
          const lx = CX + (R_LABEL + 10) * Math.cos(midAngle)
          const ly = CY + (R_LABEL + 10) * Math.sin(midAngle)
          const isSel    = selectedCategory === group.key
          const isDimmed = selectedCategory && !isSel
          return (
            <text key={group.key}
              x={lx.toFixed(1) as unknown as number}
              y={ly.toFixed(1) as unknown as number}
              fontSize={isSel ? 11 : 9} fontWeight={isSel ? '900' : '700'}
              fill={group.color} opacity={isDimmed ? 0.3 : 1}
              textAnchor="middle" dominantBaseline="middle"
              style={{ fontFamily:'system-ui', cursor:'pointer', transition:'opacity 0.2s' }}
              onClick={() => onDimClick(isSel ? null : group.key)}>
              {group.key}
            </text>
          )
        })}
        {/* SVG floating tooltip — "Fluid Intelligence Gf 98" format */}
        {hoveredAb && hovered && (() => {
          const grp = groups.find(g => g.key === hovered.group)
          const ab  = grp?.abilities.find(a => a.code === hovered.code)
          if (!grp || !ab) return null
          const r   = R_MAX * ab.score / 100
          const px  = CX + r * Math.cos(ab.angle)
          const py  = CY + r * Math.sin(ab.angle)
          const lbl = `${grp.name} ${grp.key} ${ab.score}`
          const tw  = lbl.length * 5.2 + 18
          const th  = 20
          const dx  = px > CX ? 10 : -(tw + 10)
          const dy  = py > CY ? 8  : -(th + 8)
          const tx  = Math.max(2, Math.min(398 - tw, px + dx))
          const ty  = Math.max(2, Math.min(396 - th, py + dy))
          return (
            <g key="tip" style={{ pointerEvents:'none' }}>
              <rect x={tx} y={ty} width={tw} height={th} rx={5}
                fill="rgba(255,255,255,0.96)" stroke={`${grp.color}55`} strokeWidth={0.8}
                style={{ filter:'drop-shadow(0 2px 5px rgba(0,0,0,0.09))' }} />
              <text x={tx + tw/2} y={ty + 13.5}
                textAnchor="middle" fontSize={8.5} fontWeight="700" fill={INK}
                style={{ fontFamily:'system-ui' }}>{lbl}</text>
            </g>
          )
        })()}
      </svg>
    </div>
  )
}

// ── Timeline SVG ──────────────────────────────────────────────────────────────
function TimelineSVG({ phase, showMeeting }: { phase: SvgPhase; showMeeting: boolean }) {
  const ph  = SVG_PHASES[phase]
  const AX  = 50, BX = 530, LY = 100
  const GAP_Y = LY + 30

  const phaseSteps: SvgPhase[] = ['p8am', 'p10am', 'p1pm']
  const phaseIdx = phaseSteps.indexOf(phase)

  return (
    <div>
      {/* Phase progress tabs */}
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:14, justifyContent:'center' }}>
        {phaseSteps.map((p, i) => {
          const labels = ['8:00 AM', '10:00 AM', '1:00 PM']
          const active = i <= phaseIdx
          const current = i === phaseIdx
          return (
            <div key={p} style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{
                display:'flex', alignItems:'center', gap:6,
                fontSize:11, fontWeight:current ? 700 : 500,
                color: active ? BLUE : SUBTLE,
                padding:'4px 12px', borderRadius:20,
                background: current ? `${BLUE}12` : 'transparent',
                border:`1px solid ${current ? BLUE : BORDER}`,
                transition:'all 0.3s',
              }}>
                <div style={{
                  width:6, height:6, borderRadius:'50%',
                  background: active ? BLUE : BORDER,
                  flexShrink:0,
                }} />
                {labels[i]}
              </div>
              {i < 2 && (
                <div style={{ width:20, height:1, background: i < phaseIdx ? BLUE : BORDER, transition:'background 0.5s' }} />
              )}
            </div>
          )
        })}
      </div>

      {/* SVG Canvas */}
      <svg viewBox="0 0 580 168" width="100%" style={{ display:'block', borderRadius:10, overflow:'visible' }}>
        <rect width={580} height={168} fill="#FAFBFC" rx={10} />

        {/* Track */}
        <line x1={AX} y1={LY} x2={BX} y2={LY} stroke="#E5E7EB" strokeWidth={2} />

        {/* A / B endpoints */}
        <circle cx={AX} cy={LY} r={6} fill={CINNABAR} />
        <text x={AX} y={LY+22} textAnchor="middle" fill={CINNABAR} fontSize={12} fontWeight="700" fontFamily="system-ui, sans-serif">A</text>
        <circle cx={BX} cy={LY} r={6} fill={CINNABAR} />
        <text x={BX} y={LY+22} textAnchor="middle" fill={CINNABAR} fontSize={12} fontWeight="700" fontFamily="system-ui, sans-serif">B</text>

        {/* 11:30 meeting marker — always visible as reference */}
        <line x1={290} y1={LY-28} x2={290} y2={LY+28}
          stroke="#FDE68A" strokeWidth={1.2} strokeDasharray="3,3" />
        <text x={290} y={LY-36} textAnchor="middle" fill="#D97706"
          fontSize={9} fontWeight="700" fontFamily="system-ui, sans-serif">11:30 AM · Meeting</text>

        {/* Meeting flash */}
        <AnimatePresence>
          {showMeeting && (
            <motion.circle key="flash" cx={290} cy={LY} r={8} fill={AMBER}
              initial={{ r:8, opacity:0.8 }}
              animate={{ r:52, opacity:0 }}
              exit={{ opacity:0 }}
              transition={{ duration:0.75, ease:'easeOut' }}
            />
          )}
        </AnimatePresence>

        {/* 112.5 km bracket — amber, appears when showGap */}
        <AnimatePresence>
          {ph.showGap && (
            <motion.g key={phase + '-gap'}
              initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
              {/* Left bracket tick */}
              <line x1={187} y1={GAP_Y} x2={187} y2={GAP_Y+16} stroke={AMBER} strokeWidth={1.5} />
              {/* Right bracket tick */}
              <line x1={393} y1={GAP_Y} x2={393} y2={GAP_Y+16} stroke={AMBER} strokeWidth={1.5} />
              {/* Horizontal */}
              <line x1={187} y1={GAP_Y+8} x2={393} y2={GAP_Y+8} stroke={AMBER} strokeWidth={1.5} />
              {/* Label */}
              <text x={290} y={GAP_Y+30} textAnchor="middle" fill={AMBER}
                fontSize={11} fontWeight="700" fontFamily="system-ui, sans-serif">112.5 km</text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* Car A (Blue) — motion.circle */}
        <motion.circle
          animate={{ cx: ph.c1 }}
          transition={{ duration:0.85, ease:[0.4, 0, 0.2, 1] }}
          cy={LY} r={12} fill={BLUE}
        />
        <motion.text
          animate={{ x: ph.c1 }}
          transition={{ duration:0.85, ease:[0.4, 0, 0.2, 1] }}
          y={LY - 22} textAnchor="middle"
          fontSize={10} fontWeight="700" fill={BLUE} fontFamily="system-ui, sans-serif">
          Car A
        </motion.text>
        {/* → direction indicator */}
        <motion.text
          animate={{ x: ph.c1 }}
          transition={{ duration:0.85, ease:[0.4, 0, 0.2, 1] }}
          y={LY + 4} textAnchor="middle"
          fontSize={9} fontWeight="900" fill="white" fontFamily="system-ui, sans-serif">
          {'>'}
        </motion.text>

        {/* Car B (Amber) — motion.circle */}
        <motion.circle
          animate={{ cx: ph.c2 }}
          transition={{ duration:0.85, ease:[0.4, 0, 0.2, 1] }}
          cy={LY} r={12} fill={AMBER}
        />
        <motion.text
          animate={{ x: ph.c2 }}
          transition={{ duration:0.85, ease:[0.4, 0, 0.2, 1] }}
          y={LY - 22} textAnchor="middle"
          fontSize={10} fontWeight="700" fill={AMBER} fontFamily="system-ui, sans-serif">
          Car B
        </motion.text>
        {/* ← direction indicator */}
        <motion.text
          animate={{ x: ph.c2 }}
          transition={{ duration:0.85, ease:[0.4, 0, 0.2, 1] }}
          y={LY + 4} textAnchor="middle"
          fontSize={9} fontWeight="900" fill="white" fontFamily="system-ui, sans-serif">
          {'<'}
        </motion.text>
      </svg>

      {/* Phase label */}
      <p style={{ fontSize:11, color:MUTED, textAlign:'center', marginTop:10,
        fontStyle:'italic', letterSpacing:'0.02em' }}>
        {ph.label}
      </p>
    </div>
  )
}

// ── Achievement Card ──────────────────────────────────────────────────────────
function AchievementCard() {
  const [sprk,          setSprk]          = useState(0)
  const [revealedSteps, setRevealedSteps] = useState(0)

  useEffect(() => {
    // SPRK counter 0 → 1.00 over 1.5s
    let v = 0
    const step = 1.00 / 50
    const id = setInterval(() => {
      v = Math.min(v + step, 1.00)
      setSprk(parseFloat(v.toFixed(4)))
      if (v >= 1.00) clearInterval(id)
    }, 30)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    // Reveal solution steps sequentially
    let s = 0
    const id = setInterval(() => {
      s++
      setRevealedSteps(s)
      if (s >= SOLUTION_STEPS.length) clearInterval(id)
    }, 750)
    return () => clearInterval(id)
  }, [])

  return (
    <motion.div
      initial={{ opacity:0, y:28, scale:0.97 }}
      animate={{ opacity:1, y:0, scale:1 }}
      transition={{ duration:0.45, ease:[0.22, 1, 0.36, 1] }}
      style={{ marginTop:24 }}>

      {/* Golden ring burst */}
      <div style={{ position:'relative', overflow:'visible' }}>
        <motion.div
          initial={{ width:0, height:0, opacity:0.8 }}
          animate={{ width:300, height:300, opacity:0 }}
          transition={{ duration:0.9, ease:'easeOut' }}
          style={{
            position:'absolute', top:-150, left:'50%', marginLeft:-150,
            borderRadius:'50%', border:`2px solid ${AMBER}`,
            pointerEvents:'none', zIndex:0,
          }}
        />
      </div>

      <div style={{
        position:'relative', zIndex:1,
        border:`1.5px solid ${AMBER}30`,
        borderRadius:20, overflow:'hidden',
        background:`linear-gradient(135deg, #FFFBEB 0%, #FFFFFF 60%)`,
      }}>
        {/* Achievement header */}
        <div style={{
          padding:'22px 28px',
          borderBottom:`1px solid ${AMBER}20`,
          display:'flex', alignItems:'center', justifyContent:'space-between',
          background:`linear-gradient(90deg, ${AMBER}08, transparent)`,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ fontSize:28, lineHeight:1 }}>🏅</div>
            <div>
              <p style={{ fontSize:14, fontWeight:800, color:INK, marginBottom:2 }}>
                Cognitive Synthesis Complete
              </p>
              <div style={{ display:'flex', gap:8 }}>
                <span style={{ fontSize:10, fontWeight:700, color:AMBER,
                  background:`${AMBER}18`, borderRadius:5, padding:'2px 8px',
                  letterSpacing:'0.08em', textTransform:'uppercase' }}>
                  Logic Depth: L4 Analyze
                </span>
                <span style={{ fontSize:10, fontWeight:700, color:BLUE,
                  background:`${BLUE}12`, borderRadius:5, padding:'2px 8px',
                  letterSpacing:'0.08em', textTransform:'uppercase' }}>
                  Heuristic Inquiry
                </span>
              </div>
            </div>
          </div>

          {/* SPRK counter — amber pulse */}
          <div style={{ textAlign:'right', flexShrink:0 }}>
            <motion.p
              animate={{ textShadow: sprk < 1 ? `0 0 16px ${AMBER}80` : 'none' }}
              style={{ fontSize:26, fontWeight:900, color:AMBER,
                lineHeight:1, letterSpacing:'-0.02em', fontVariantNumeric:'tabular-nums' }}>
              +{sprk.toFixed(2)}
            </motion.p>
            <p style={{ fontSize:10, fontWeight:600, color:MUTED }}>SPRK Credits</p>
            <p style={{ fontSize:10, color:GREEN, marginTop:2 }}>Master DNA Synced ✓</p>
          </div>
        </div>

        {/* Solution steps */}
        <div style={{ padding:'20px 28px' }}>
          <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em',
            textTransform:'uppercase', color:SUBTLE, marginBottom:14 }}>Solution Walkthrough</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {SOLUTION_STEPS.slice(0, revealedSteps).map((s, i) => (
              <motion.div key={i}
                initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}
                transition={{ duration:0.3 }}
                style={{ display:'flex', gap:12, alignItems:'baseline',
                  padding:'11px 16px', background:'#F0FDF4',
                  borderRadius:10, border:'1px solid #BBF7D0' }}>
                <span style={{ fontSize:15, fontWeight:900, color:GREEN, flexShrink:0 }}>{s.badge}</span>
                <div>
                  <span style={{ fontSize:11, fontWeight:700, color:'#065F46', marginRight:8 }}>{s.label}</span>
                  <span style={{ fontSize:13, color:'#064E3B' }}>{s.value}</span>
                </div>
              </motion.div>
            ))}
          </div>
          {revealedSteps >= SOLUTION_STEPS.length && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
              style={{ marginTop:14, padding:'12px 16px',
                background:`${BLUE}08`, borderRadius:10, border:`1px solid ${BLUE}20` }}>
              <p style={{ fontSize:12, color:BODY, lineHeight:1.7 }}>
                <strong style={{ color:BLUE }}>Temporal Invariance</strong> — When two moving objects
                maintain an identical gap across a symmetric time window, a meeting-separating event
                is guaranteed. The combined relative velocity resolves both the meeting time and
                total distance simultaneously.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ── Master Logic Session ───────────────────────────────────────────────────────
function MasterLogicSession() {
  const { consumeBalance, consumeLogic } = useSparkle()
  const [dialogStep,     setDialogStep]     = useState(1)   // how many messages visible
  const [svgPhase,       setSvgPhase]       = useState<SvgPhase>('p8am')
  const [showMeeting,    setShowMeeting]    = useState(false)
  const [showAchievement,setShowAchievement]= useState(false)
  const [processing,        setProcessing]        = useState(false)
  const [showConsumeSuccess,setShowConsumeSuccess] = useState(false)
  const consumeSuccessShown = useRef(false)  // guard: show only once per session
  const [sprk,              setSprk]              = useState(0)
  const [isFlashing,        setIsFlashing]        = useState(false)
  const [flashKey,          setFlashKey]          = useState(0)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Auto-scroll dialog on new message
  useEffect(() => {
    setTimeout(() => {
      dialogRef.current?.scrollTo({ top: dialogRef.current.scrollHeight, behavior:'smooth' })
    }, 100)
  }, [dialogStep])

  // Ambient SPRK ticker — also trickles down global protocolBalance (learning consumption)
  useEffect(() => {
    const id = setInterval(() => {
      setSprk(v => parseFloat((v + 0.0001).toFixed(4)))
      consumeBalance(0.0001)   // 0.0001 SPRK per tick — visible drain in Nav
    }, 3000)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleStudentChip(msgIndex: number) {
    if (processing) return
    setProcessing(true)
    consumeLogic(0.5)         // 0.5 SPRK per dialogue step — debited to usedCredits
    setIsFlashing(true)
    setFlashKey(k => k + 1)
    setTimeout(() => setIsFlashing(false), 650)

    // Reveal student message
    setDialogStep(msgIndex + 1)

    // Update SVG phase
    const targetPhase = DIALOGUE[msgIndex].phase as SvgPhase
    if (targetPhase === 'p1pm') {
      // Animate through meeting point
      setTimeout(() => {
        setShowMeeting(true)
        setTimeout(() => {
          setShowMeeting(false)
          setSvgPhase('p1pm')
        }, 900)
      }, 400)
    } else {
      setSvgPhase(targetPhase)
    }

    // After delay, reveal next mentor message + brief "Consumption Successful" notice
    setTimeout(() => {
      setDialogStep(msgIndex + 2)
      setProcessing(false)
      if (!consumeSuccessShown.current) {
        consumeSuccessShown.current = true
        setShowConsumeSuccess(true)
        setTimeout(() => setShowConsumeSuccess(false), 2000)
      }

      // After final mentor message, show achievement
      if (msgIndex === 3) {
        setTimeout(() => setShowAchievement(true), 1200)
      }
    }, 2000)
  }

  const visibleMessages = DIALOGUE.slice(0, dialogStep)
  const nextStudentIdx  = visibleMessages.length < DIALOGUE.length
    ? DIALOGUE.findIndex((m, i) => i >= visibleMessages.length && m.role === 'student')
    : -1

  return (
    <div style={{ border:`1px solid ${BORDER}`, borderRadius:24, overflow:'hidden' }}>

      {/* ── Session Header ── */}
      <div style={{
        padding:'20px 28px',
        borderBottom:`1px solid ${BORDER}`,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        background:`linear-gradient(90deg, ${BLUE}04, transparent)`,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          {/* Mentor avatar */}
          <div style={{ width:42, height:42, borderRadius:'50%',
            background:`${EXPERT_THEME.color}18`,
            border:`2px solid ${EXPERT_THEME.color}40`,
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <span style={{ fontSize:12, fontWeight:900, color:EXPERT_THEME.color,
              fontFamily:'ui-monospace,monospace' }}>{EXPERT_THEME.initials}</span>
          </div>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:14, fontWeight:800, color:INK }}>{EXPERT_ID}</span>
              <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                <motion.div style={{ width:6, height:6, borderRadius:'50%', background:GREEN }}
                  animate={{ opacity:[1,0.3,1] }} transition={{ duration:1.6, repeat:Infinity }} />
                <span style={{ fontSize:10, fontWeight:600, color:GREEN }}>DNA Active</span>
              </span>
            </div>
            <p style={{ fontSize:12, color:MUTED, fontStyle:'italic', marginTop:2 }}>
              "Visualization is the bridge to logic."
            </p>
          </div>
        </div>

        {/* Logic Energy */}
        <div style={{ textAlign:'right', flexShrink:0, position:'relative' }}>

          {/* Minus fly-up on each chip click */}
          <AnimatePresence>
            {isFlashing && (
              <motion.span key={flashKey}
                initial={{ opacity:1, y:0 }}
                animate={{ opacity:0, y:-22 }}
                transition={{ duration:0.55, ease:'easeOut' }}
                style={{ position:'absolute', top:0, right:0,
                  fontSize:12, fontWeight:800, color:CINNABAR,
                  fontVariantNumeric:'tabular-nums', pointerEvents:'none',
                  whiteSpace:'nowrap' }}>
                −0.5
              </motion.span>
            )}
          </AnimatePresence>

          <p style={{ fontSize:10, fontWeight:600, letterSpacing:'0.1em',
            textTransform:'uppercase', color:SUBTLE, marginBottom:4 }}>Logic Energy</p>
          <p style={{ fontSize:18, fontWeight:800, color: showAchievement ? AMBER : INK,
            lineHeight:1, transition:'color 0.4s', fontVariantNumeric:'tabular-nums' }}>
            {showAchievement ? '+1.00' : sprk.toFixed(4)}
          </p>

          {/* Status label — Consuming → Consumption Successful (1.5 s) → streaming */}
          <AnimatePresence mode="wait">
            {processing ? (
              <motion.p key="consuming"
                initial={{ opacity:0 }} animate={{ opacity:0.72 }} exit={{ opacity:0 }}
                transition={{ duration:0.18 }}
                style={{ fontSize:9, color:EXPERT_THEME.color, marginTop:4,
                  fontFamily:'ui-monospace,monospace', letterSpacing:'0.04em',
                  whiteSpace:'nowrap' }}>
                Consuming 0.5 SPRK · {EXPERT_ID}
              </motion.p>
            ) : showConsumeSuccess ? (
              <motion.div key="success"
                initial={{ opacity:0, y:6, scale:0.88 }}
                animate={{ opacity:1, y:0,  scale:1.1  }}
                exit={{ opacity:0, y:-4, scale:0.9 }}
                transition={{ duration:0.28, ease:[0.22,1,0.36,1] }}
                style={{ position:'fixed', bottom:36, left:'50%', transform:'translateX(-50%)',
                  zIndex:99999, background:BLUE, color:'#fff',
                  fontSize:13, fontWeight:700, padding:'12px 24px', borderRadius:13,
                  boxShadow:'0 10px 40px rgba(59,130,246,0.42)', whiteSpace:'nowrap',
                  letterSpacing:'0.01em' }}>
                ✓ Consumption Successful · {EXPERT_ID}
              </motion.div>
            ) : (
              <motion.p key="streaming"
                initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                transition={{ duration:0.18 }}
                style={{ fontSize:10, color: showAchievement ? AMBER : SUBTLE }}>
                {showAchievement ? 'SPRK · Master DNA Synced' : 'SPRK · streaming'}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Problem Statement ── */}
      <div style={{ margin:'20px 28px 0', padding:'16px 20px',
        background:`${AMBER}08`, borderRadius:12, border:`1px solid ${AMBER}30` }}>
        <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.1em',
          textTransform:'uppercase', color:'#92400E', marginBottom:8 }}>Problem · Motion & Meeting</p>
        <p style={{ fontSize:14, lineHeight:1.85, color:INK }}>
          Cars A and B depart simultaneously from Cities A and B at{' '}
          <strong>8:00 AM</strong>, traveling toward each other. At{' '}
          <strong>10:00 AM</strong>, the distance between them is{' '}
          <strong style={{ color:AMBER }}>112.5 km</strong>. At{' '}
          <strong>1:00 PM</strong>, the distance between them is still{' '}
          <strong style={{ color:AMBER }}>112.5 km</strong>. Find the total distance A→B.
        </p>
      </div>

      {/* ── Main Canvas: SVG + Dialogue ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 400px', margin:'20px 0 0',
        borderTop:`1px solid ${BORDER}` }}>

        {/* Left: Timeline SVG */}
        <div style={{ padding:'24px 28px', borderRight:`1px solid ${BORDER}`, background:'#FAFBFC' }}>
          <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em',
            textTransform:'uppercase', color:BLUE, marginBottom:16 }}>
            Temporal Coordinate System
          </p>
          <TimelineSVG phase={svgPhase} showMeeting={showMeeting} />

          {/* Phase description */}
          <div style={{ marginTop:18, padding:'12px 16px',
            background:'#FFFFFF', borderRadius:10, border:`1px solid ${BORDER}` }}>
            <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:8 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:BLUE, flexShrink:0 }} />
              <span style={{ fontSize:12, fontWeight:700, color:INK }}>Car A</span>
              <span style={{ fontSize:11, color:MUTED }}>Departs from City A · moving →</span>
            </div>
            <div style={{ display:'flex', gap:12, alignItems:'center' }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:AMBER, flexShrink:0 }} />
              <span style={{ fontSize:12, fontWeight:700, color:INK }}>Car B</span>
              <span style={{ fontSize:11, color:MUTED }}>Departs from City B · moving ←</span>
            </div>
          </div>
        </div>

        {/* Right: Dialogue Feed */}
        <div style={{ display:'flex', flexDirection:'column', background:'#FFFFFF' }}>
          {/* Dialogue header */}
          <div style={{ padding:'16px 22px', borderBottom:`1px solid ${BORDER}` }}>
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em',
              textTransform:'uppercase', color:MUTED }}>
              Socratic Dialogue · Step {Math.min(dialogStep, 5)} of 5
            </p>
            {/* Progress bar */}
            <div style={{ height:3, background:BORDER, borderRadius:2, marginTop:8, overflow:'hidden' }}>
              <motion.div
                animate={{ width:`${(Math.min(dialogStep, 5) / 5) * 100}%` }}
                transition={{ duration:0.5 }}
                style={{ height:'100%', background:BLUE, borderRadius:2 }}
              />
            </div>
          </div>

          {/* Messages */}
          <div ref={dialogRef} style={{ flex:1, overflowY:'auto', padding:'16px 22px',
            maxHeight:320, display:'flex', flexDirection:'column', gap:14 }}>
            <AnimatePresence initial={false}>
              {visibleMessages.map((msg, i) => (
                <motion.div key={msg.id}
                  initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                  transition={{ duration:0.3 }}
                  style={{ display:'flex', gap:10,
                    flexDirection: msg.role === 'student' ? 'row-reverse' : 'row',
                    alignItems:'flex-start' }}>
                  {/* Avatar */}
                  {msg.role === 'mentor' ? (
                    <div style={{ width:30, height:30, borderRadius:'50%', background:'#F59E0B',
                      flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <span style={{ fontSize:9, fontWeight:800, color:'#fff' }}>EM</span>
                    </div>
                  ) : (
                    <div style={{ width:30, height:30, borderRadius:'50%', background:`${BLUE}20`,
                      flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <span style={{ fontSize:9, fontWeight:800, color:BLUE }}>E</span>
                    </div>
                  )}
                  {/* Bubble */}
                  <div style={{
                    maxWidth:'80%', padding:'10px 14px',
                    borderRadius: msg.role === 'mentor' ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                    background: msg.role === 'mentor' ? '#F9FAFB' : `${BLUE}0E`,
                    border:`1px solid ${msg.role === 'mentor' ? BORDER : `${BLUE}25`}`,
                  }}>
                    {msg.role === 'mentor' && (
                      <p style={{ fontSize:9, fontWeight:700, color:SUBTLE,
                        letterSpacing:'0.1em', marginBottom:4, textTransform:'uppercase' }}>
                        EXPERT_MOM_001
                      </p>
                    )}
                    <p style={{ fontSize:13, lineHeight:1.7, color:INK }}>{msg.text}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator while processing */}
            {processing && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                style={{ display:'flex', gap:5, alignItems:'center', paddingLeft:40 }}>
                {[0,1,2].map(i => (
                  <motion.div key={i}
                    animate={{ opacity:[0.3,1,0.3] }}
                    transition={{ duration:0.8, delay:i*0.18, repeat:Infinity }}
                    style={{ width:5, height:5, borderRadius:'50%', background:BLUE }} />
                ))}
              </motion.div>
            )}
          </div>

          {/* Student response chip */}
          <div style={{ padding:'14px 22px', borderTop:`1px solid ${BORDER}`,
            minHeight:70, display:'flex', alignItems:'center' }}>
            <AnimatePresence mode="wait">
              {!processing && nextStudentIdx !== -1 && (
                <motion.button
                  key={nextStudentIdx}
                  initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-4 }}
                  whileHover={{ scale:1.02, x:2 }}
                  whileTap={{ scale:0.97 }}
                  onClick={() => handleStudentChip(nextStudentIdx)}
                  style={{
                    width:'100%', textAlign:'left', fontSize:13, fontWeight:600,
                    color:BLUE, background:`${BLUE}0A`,
                    border:`1.5px solid ${BLUE}35`,
                    borderRadius:12, padding:'12px 16px', cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    gap:8,
                  }}>
                  <span>{STUDENT_CHIPS[nextStudentIdx]}</span>
                  <svg width={16} height={16} viewBox="0 0 16 16" fill="none" style={{ flexShrink:0 }}>
                    <path d="M2 14L14 8L2 2V7L10 8L2 9V14Z" fill={BLUE} />
                  </svg>
                </motion.button>
              )}
              {!processing && nextStudentIdx === -1 && dialogStep >= DIALOGUE.length && !showAchievement && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                  style={{ fontSize:12, color:GREEN, fontWeight:600, display:'flex', gap:6, alignItems:'center' }}>
                  <motion.div style={{ width:7, height:7, borderRadius:'50%', background:GREEN }}
                    animate={{ scale:[1,1.4,1] }} transition={{ duration:1.2, repeat:Infinity }} />
                  Generating cognitive synthesis...
                </motion.div>
              )}
              {showAchievement && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                  style={{ fontSize:12, color:AMBER, fontWeight:700, display:'flex', gap:6, alignItems:'center' }}>
                  <span>🏅</span> +1.00 SPRK Credits — Master DNA Synced
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Achievement Card */}
      <AnimatePresence>
        {showAchievement && (
          <div style={{ padding:'0 28px 28px' }}>
            <AchievementCard />
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── CountUp — RAF ease-out cubic animation ───────────────────────────────────
function CountUp({ to, suffix = '', duration = 1.8 }: { to: number; suffix?: string; duration?: number }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let t0: number | null = null
    const tick = (ts: number) => {
      if (!t0) t0 = ts
      const p    = Math.min((ts - t0) / (duration * 1000), 1)
      const ease = 1 - Math.pow(1 - p, 3)          // ease-out cubic
      setVal(Math.round(to * ease))
      if (p < 1) requestAnimationFrame(tick)
    }
    const id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [to, duration])
  return <>{val}{suffix}</>
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function StudentPage() {
  const { state } = useSparkle()

  // ── Available: animated roll-up from 0 → protocolBalance on activation ──
  const [displayBalance, setDisplayBalance] = useState(0)
  useEffect(() => {
    const target = state.isActivated ? state.protocolBalance : 0
    if (displayBalance === target) return
    const diff  = target - displayBalance
    const STEPS = 40
    let step = 0
    const id = setInterval(() => {
      step++
      const ease = 1 - Math.pow(1 - Math.min(step / STEPS, 1), 3) // cubic ease-out
      setDisplayBalance(parseFloat((displayBalance + diff * ease).toFixed(4)))
      if (step >= STEPS) clearInterval(id)
    }, 22)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.protocolBalance, state.isActivated])

  const usedCredits      = state.usedCredits
  const availableCredits = displayBalance

  // ── Flash effects — light up Available / Used when values change ──
  const [availFlash,    setAvailFlash]    = useState(false)
  const [usedFlash,     setUsedFlash]     = useState(false)
  const prevBalanceRef  = useRef(state.protocolBalance)
  const prevUsedRef     = useRef(state.usedCredits)

  useEffect(() => {
    const prev = prevBalanceRef.current
    prevBalanceRef.current = state.protocolBalance
    if (state.isActivated && state.protocolBalance < prev) {
      setAvailFlash(true)
      const t = setTimeout(() => setAvailFlash(false), 1400)
      return () => clearTimeout(t)
    }
  }, [state.protocolBalance, state.isActivated])

  useEffect(() => {
    const prev = prevUsedRef.current
    prevUsedRef.current = state.usedCredits
    if (state.usedCredits > prev) {
      setUsedFlash(true)
      const t = setTimeout(() => setUsedFlash(false), 1400)
      return () => clearTimeout(t)
    }
  }, [state.usedCredits])

  // ── Scan transition ──
  const frame2Ref  = useRef<HTMLDivElement>(null)
  const [scanning,  setScanning]  = useState(false)
  const [scanTopic, setScanTopic] = useState('')

  function triggerScan(topic: string) {
    setScanTopic(topic)
    setScanning(true)
    setTimeout(() => {
      setScanning(false)
      // Give the overlay a moment to fade before scroll
      setTimeout(() => {
        frame2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
    }, 820)
  }

  // Frame 3 — engine matrix state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const leftColRef    = useRef<HTMLDivElement>(null)
  const listHeaderRef = useRef<HTMLDivElement>(null)
  const listScrollRef = useRef<HTMLDivElement>(null)
  const [listMaxH, setListMaxH] = useState(480)

  useEffect(() => {
    const leftEl = leftColRef.current
    if (!leftEl) return
    const update = () => {
      const leftH = leftEl.getBoundingClientRect().height
      const hdrH  = listHeaderRef.current?.getBoundingClientRect().height ?? 68
      setListMaxH(Math.max(320, leftH - hdrH - 52))
    }
    const obs = new ResizeObserver(update)
    obs.observe(leftEl)
    update()
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (listScrollRef.current) listScrollRef.current.scrollTop = 0
  }, [selectedCategory])

  return (
    <div style={{ minHeight:'100vh', background:'#FFFFFF' }}>
      <div aria-hidden style={{ position:'fixed', top:'-18%', right:'-10%', width:'72vw', height:'72vw',
        maxWidth:960, maxHeight:960, background:'radial-gradient(circle, #3B82F6 0%, transparent 70%)',
        opacity:0.07, filter:'blur(120px)', pointerEvents:'none', zIndex:0 }} />
      <Nav />

      {/* ── Full-screen scan overlay ── */}
      <AnimatePresence>
        {scanning && (
          <motion.div
            key="scan-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(6,10,18,0.92)',
              overflow: 'hidden',
            }}>

            {/* Moving scan line */}
            <div style={{
              position: 'absolute', left: 0, right: 0,
              height: 3,
              background: `linear-gradient(90deg,
                transparent 0%,
                ${BLUE}44 8%,
                ${BLUE}CC 35%,
                ${BLUE}   50%,
                ${BLUE}CC 65%,
                ${BLUE}44 92%,
                transparent 100%)`,
              boxShadow: `0 0 18px 4px ${BLUE}88, 0 0 42px 8px ${BLUE}33`,
              animation: 'st-scan 0.72s cubic-bezier(0.4,0,0.2,1) forwards',
            }} />

            {/* Glow trace behind the line */}
            <div style={{
              position: 'absolute', left: 0, right: 0, top: 0,
              background: `linear-gradient(180deg, ${BLUE}06 0%, transparent 100%)`,
              animation: 'st-scan 0.72s cubic-bezier(0.4,0,0.2,1) forwards',
              height: 120,
            }} />

            {/* Centre info */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 12, pointerEvents: 'none',
            }}>
              <p style={{
                fontSize: 9, letterSpacing: '0.28em', color: `${BLUE}99`,
                fontFamily: 'ui-monospace,monospace', textTransform: 'uppercase',
              }}>
                Loading Session
              </p>
              <p style={{
                fontSize: 17, fontWeight: 700, color: '#FFFFFF',
                letterSpacing: '-0.01em', textAlign: 'center',
                maxWidth: 320,
              }}>
                {scanTopic}
              </p>
              <p style={{
                fontSize: 9, color: `${BLUE}66`,
                fontFamily: 'ui-monospace,monospace', letterSpacing: '0.18em',
              }}>
                SYNCING EXPERT DNA · {EXPERT_ID}
              </p>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .st-noscroll::-webkit-scrollbar{display:none}
        .st-noscroll{scrollbar-width:none;-ms-overflow-style:none}
        @keyframes st-scan {
          0%   { top: -4px }
          100% { top: 100vh }
        }
        @keyframes st-scanfade {
          0%,90% { opacity: 1 }
          100%   { opacity: 0 }
        }
      `}</style>

      <main className="max-w-[1440px] mx-auto px-[12%] pt-28 pb-24" style={{ position:'relative', zIndex:1 }}>

        {/* ── Page Header ── */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <p style={{ fontSize:22, fontWeight:700, letterSpacing:'0.15em', color:BLUE,
              textTransform:'uppercase', marginBottom:0, fontFamily:'var(--font-geist-sans), system-ui, sans-serif' }}>
              Potential becomes mastery.
            </p>
            <h1 style={{ fontSize:40, fontWeight:700, color:'#000000', lineHeight:1.1,
              letterSpacing:'-0.02em', marginTop:16 }}>
              Cyra's Learning Hub
            </h1>
          </div>
          {/* Inline credits — no box, pure typography */}
          <div className="flex items-end gap-10 pt-2 flex-shrink-0">
            <div className="text-right" style={{
              borderRadius: 8, padding: '4px 8px',
              outline: availFlash ? '2px solid #FBBF24' : '2px solid transparent',
              transition: 'outline-color 0.22s ease',
            }}>
              <p style={{ fontSize:10, fontWeight:600, letterSpacing:'0.15em', color:SUBTLE,
                textTransform:'uppercase', marginBottom:4 }}>Available</p>
              <p style={{ fontSize:26, fontWeight:800, color:INK, lineHeight:1 }}>{availableCredits.toFixed(2)}</p>
              <p style={{ fontSize:10, fontWeight:600, color:BLUE, marginTop:2 }}>$SPK</p>
            </div>
            <div className="text-right" style={{
              opacity: usedFlash ? 0.88 : 0.45,
              borderRadius: 8, padding: '4px 8px',
              outline: usedFlash ? '2px solid #FBBF24' : '2px solid transparent',
              transition: 'outline-color 0.22s ease, opacity 0.3s ease',
            }}>
              <p style={{ fontSize:10, fontWeight:600, letterSpacing:'0.15em', color:SUBTLE,
                textTransform:'uppercase', marginBottom:4 }}>Used</p>
              <p style={{ fontSize:26, fontWeight:800, color:INK, lineHeight:1 }}>{usedCredits.toFixed(2)}</p>
              <p style={{ fontSize:10, fontWeight:600, color:MUTED, marginTop:2 }}>$SPK</p>
            </div>
          </div>
        </div>

        {/* ── Cognitive Timer — single inline row with CountUp ── */}
        <motion.div
          initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.12, duration:0.44 }}
          style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:48, marginTop:55, marginBottom:55 }}>
          {[
            { label:'Courses Taken',   to:23, suffix:''  },
            { label:'Knowledge Nodes', to:12, suffix:''  },
            { label:'Learning Streak', to:7,  suffix:'d' },
          ].map(stat => (
            <p key={stat.label} style={{
              fontSize:18, color:MUTED, letterSpacing:'0.01em',
              fontFamily:'var(--font-geist-sans), system-ui, sans-serif',
              whiteSpace:'nowrap', margin:0,
            }}>
              {stat.label}{': '}
              <span style={{ fontWeight:700, color:BLUE }}>
                <CountUp to={stat.to} suffix={stat.suffix} />
              </span>
            </p>
          ))}
        </motion.div>

        {/* ══ Frame 1: Achievements ══════════════════════════════════════════ */}

        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.08, duration:0.46 }}
          className="grid grid-cols-2 gap-8 mb-20">

          {/* Learning Records — borderless */}
          <div>
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.18em', color:SUBTLE,
              textTransform:'uppercase', marginBottom:4 }}>Learning Records</p>
            <div className="flex items-baseline gap-2 mb-4">
              <h2 style={{ fontSize:15, fontWeight:800, color:INK,
                fontFamily:'var(--font-playfair)' }}>Recent Sessions</h2>
            </div>
            {LEARNING_RECORDS.map((rec, i) => (
              <div key={rec.id}
                onClick={() => triggerScan(rec.topic)}
                style={{ display:'flex', alignItems:'center', gap:11,
                padding:'13px 0', cursor:'pointer',
                borderBottom: i < LEARNING_RECORDS.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:rec.bcolor, flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                    <p style={{ fontSize:13, fontWeight:600, color:INK,
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{rec.topic}</p>
                    <span style={{ fontSize:10, fontWeight:600, color:'#fff', background:rec.bcolor,
                      borderRadius:4, padding:'1px 6px', flexShrink:0 }}>{rec.bloom}</span>
                  </div>
                  <p style={{ fontSize:11, color:SUBTLE, marginTop:2 }}>{rec.master} · {rec.minutes} min</p>
                </div>
                <p style={{ fontSize:11, color:SUBTLE, flexShrink:0 }}>{rec.date}</p>
              </div>
            ))}
          </div>

          {/* Glitch Forge — borderless */}
          <div>
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.18em', color:SUBTLE,
              textTransform:'uppercase', marginBottom:4 }}>Glitch Forge</p>
            <h2 style={{ fontSize:15, fontWeight:800, color:INK,
              fontFamily:'var(--font-playfair)', marginBottom:'1rem' }}>Logic Errors to Forge</h2>
            {GLITCHES.map((g, i) => (
              <div key={g.id}
                onClick={() => triggerScan(g.topic)}
                style={{ display:'flex', alignItems:'flex-start', gap:11,
                justifyContent:'space-between', padding:'14px 0', cursor:'pointer',
                borderBottom: i < GLITCHES.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:3 }}>
                    <p style={{ fontSize:13, fontWeight:600, color:INK }}>{g.topic}</p>
                    <span style={{ fontSize:10, color:MUTED, background:'#F3F4F6',
                      borderRadius:4, padding:'1px 6px' }}>{g.tag}</span>
                  </div>
                  <p style={{ fontSize:12, color:MUTED, lineHeight:1.55 }}>{g.detail}</p>
                </div>
                <div style={{ flexShrink:0, textAlign:'right' }}>
                  <p style={{ fontSize:18, fontWeight:800, color:CINNABAR }}>{g.attempts}×</p>
                  <p style={{ fontSize:10, color:SUBTLE }}>attempts</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ══ Frame 2: Socratic Session ══════════════════════════════════════ */}
        <hr style={{ border:'none', borderTop:'1px solid #E5E7EB', marginBottom:'3rem' }} />

        <motion.div ref={frame2Ref} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.18, duration:0.46 }} className="mb-20">
          <div style={{ marginBottom:20 }}>
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.18em', color:SUBTLE,
              textTransform:'uppercase', marginBottom:4 }}>Master Logic · Golden Case</p>
            <h2 style={{ fontSize:15, fontWeight:800, color:INK,
              fontFamily:'var(--font-playfair)' }}>Socratic Dialogue Session</h2>
          </div>
          <MasterLogicSession />
        </motion.div>

        {/* ══ Frame 3: Engine Matrix ═════════════════════════════════════════ */}
        <hr style={{ border:'none', borderTop:'1px solid #E5E7EB', marginBottom:'3rem' }} />

        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.26, duration:0.46 }}>
          <div style={{ marginBottom:20 }}>
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.18em', color:SUBTLE,
              textTransform:'uppercase', marginBottom:4 }}>Cognitive Matrix</p>
            <h2 style={{ fontSize:15, fontWeight:800, color:INK,
              fontFamily:'var(--font-playfair)' }}>CHC Potential Map · Matched Paths</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Left — interactive radar */}
            <div ref={leftColRef} className="px-6 py-5">
              <CHCRadar selectedCategory={selectedCategory} onDimClick={setSelectedCategory} />
            </div>

            {/* Right — scrollable expert list */}
            <div className="px-6 py-5 flex flex-col">
              <div ref={listHeaderRef} className="mb-3 flex-shrink-0">
                <p style={{ fontSize:10, fontWeight:600, letterSpacing:'0.18em', color:SUBTLE,
                  textTransform:'uppercase', marginBottom:4 }}>AI Matched</p>
                <div className="flex items-baseline gap-2">
                  <h3 style={{ fontSize:15, fontWeight:800, color:INK,
                    fontFamily:'var(--font-playfair)' }}>
                    {selectedCategory ? `${selectedCategory} Logic Paths` : 'Optimal Logic Paths'}
                  </h3>
                  {selectedCategory && (
                    <button onClick={() => setSelectedCategory(null)}
                      style={{ background:'none', border:'none', cursor:'pointer', padding:0,
                        fontSize:10, fontWeight:600, color:MUTED, lineHeight:1 }}>
                      ↺ reset
                    </button>
                  )}
                </div>
                <p style={{ fontSize:10, marginTop:2, color:SUBTLE }}>
                  {selectedCategory
                    ? `${EXPERT_LOGIC_POOL.filter(p => p.category === selectedCategory).length} experts · scroll to explore`
                    : 'Click a radar point to filter'}
                </p>
              </div>

              {/* Scroll container with fade */}
              <div className="relative flex-shrink-0">
                <div ref={listScrollRef} className="st-noscroll"
                  style={{ maxHeight:listMaxH, overflowY:'scroll',
                    scrollbarWidth:'none', msOverflowStyle:'none' } as React.CSSProperties}>
                  <AnimatePresence mode="wait">
                    <motion.div key={selectedCategory || 'all'}
                      initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                      exit={{ opacity:0, y:-6 }}
                      transition={{ duration:0.18, ease:'easeOut' }}>
                      {(selectedCategory
                        ? EXPERT_LOGIC_POOL.filter(p => p.category === selectedCategory)
                        : EXPERT_LOGIC_POOL.slice(0, 5)
                      ).map((item, i, arr) => (
                        <div key={`${item.category}-${item.name}`}
                          className="flex items-center gap-3"
                          style={{ height:64, flexShrink:0,
                            borderBottom: i < arr.length-1 ? `1px solid ${BORDER}` : 'none' }}>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-black text-white flex-shrink-0"
                            style={{ background:item.color }}>{item.initials}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11.5px] font-bold leading-tight truncate" style={{ color:INK }}>{item.unit}</p>
                            <p className="text-[9.5px] mt-0.5 truncate" style={{ color:SUBTLE }}>
                              {item.name}
                              <span style={{ color:'#E5E7EB', margin:'0 3px' }}>·</span>
                              {item.skill}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-[14px] font-black leading-none" style={{ color:BLUE }}>{item.match}%</p>
                            <p className="text-[8px] mt-0.5" style={{ color:SUBTLE }}>match</p>
                          </div>
                        </div>
                      ))}
                      {selectedCategory && EXPERT_LOGIC_POOL.filter(p => p.category === selectedCategory).length === 0 && (
                        <div className="flex items-center justify-center" style={{ height:64 }}>
                          <motion.p className="text-[11px]" style={{ color:SUBTLE }}
                            animate={{ opacity:[0.4,1,0.4] }} transition={{ duration:2, repeat:Infinity }}>
                            AI is synthesizing more paths…
                          </motion.p>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
                {/* Fade cue */}
                <div aria-hidden style={{ position:'absolute', bottom:0, left:0, right:0, height:56,
                  background:'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 40%, rgba(255,255,255,0.96) 100%)',
                  pointerEvents:'none' }} />
              </div>
            </div>
          </div>
        </motion.div>

      </main>
    </div>
  )
}

