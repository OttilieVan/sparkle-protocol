'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Nav from '@/components/Nav'
import { useSparkle, EXPERT_ID, EXPERT_THEME } from '@/app/providers'

// ── Palette ───────────────────────────────────────────────────────────────────
const GOLD  = '#F59E0B'
const INK   = '#111827'
const MUTED = '#6B7280'
const SUBTLE = '#9CA3AF'
const EASE  = [0.22, 1, 0.36, 1] as const

// ── Glass constants ───────────────────────────────────────────────────────────
const CARD: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid #F3F4F6',
}
const CARD_HOVER: React.CSSProperties = {
  background: 'rgba(0,0,0,0.018)',
}
const MODAL_GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.46)',
  backdropFilter: 'blur(25px)',
  WebkitBackdropFilter: 'blur(25px)',
  border: '1px solid rgba(255,191,0,0.28)',
  boxShadow: '0 24px 64px rgba(0,0,0,0.13)',
}

// ── CHC Stratum I — 70 Narrow Abilities ──────────────────────────────────────
const CHC_STRATUM: { key:string; name:string; color:string; abilities:{ code:string; name:string; score:number }[] }[] = [
  { key:'Gf', name:'Fluid Intelligence', color:'#3B82F6', abilities:[
    { code:'I',   name:'Inductive Reasoning',    score:82 },
    { code:'RG',  name:'Deductive Reasoning',    score:78 },
    { code:'RQ',  name:'Quantitative Reasoning', score:88 },
    { code:'RP',  name:'Piagetian Reasoning',    score:76 },
    { code:'CZ',  name:'Speed of Reasoning',     score:71 },
    { code:'CF',  name:'Flexibility of Closure', score:79 },
    { code:'CS',  name:'Closure Speed',          score:73 },
    { code:'SS',  name:'Spatial Scanning',       score:84 },
  ]},
  { key:'Gc', name:'Crystallized Intelligence', color:'#10B981', abilities:[
    { code:'LD',  name:'Language Development',   score:85 },
    { code:'VL',  name:'Lexical Knowledge',      score:80 },
    { code:'LS',  name:'Listening Ability',      score:77 },
    { code:'K0',  name:'General Information',    score:83 },
    { code:'CM',  name:'Communication',          score:87 },
    { code:'KO',  name:'Oral Production',        score:74 },
    { code:'RC',  name:'Reading Comprehension',  score:78 },
    { code:'KS',  name:'General Science Info',   score:81 },
  ]},
  { key:'Gwm', name:'Working Memory', color:'#8B5CF6', abilities:[
    { code:'MS',  name:'Memory Span',            score:91 },
    { code:'WM',  name:'Working Memory Capacity',score:88 },
    { code:'MW',  name:'Attentional Control',    score:84 },
    { code:'MI',  name:'Interference Resistance',score:79 },
    { code:'AC',  name:'Cognitive Efficiency',   score:86 },
    { code:'AS',  name:'Attention Span',         score:82 },
    { code:'SE',  name:'Storage Efficiency',     score:90 },
    { code:'RT',  name:'Response Time',          score:77 },
  ]},
  { key:'Gv', name:'Visual-Spatial Processing', color:GOLD, abilities:[
    { code:'SR',  name:'Spatial Relations',      score:94 },
    { code:'VZ',  name:'Visualization',          score:92 },
    { code:'MR',  name:'Mental Rotation',        score:89 },
    { code:'PI',  name:'Perceptual Integration', score:76 },
    { code:'IL',  name:'Perceptual Illusions',   score:78 },
    { code:'PN',  name:'Perceptual Alternations',score:82 },
    { code:'IM',  name:'Imagery',                score:87 },
    { code:'LE',  name:'Length Estimation',      score:80 },
    { code:'FO',  name:'Figural Orientation',    score:85 },
  ]},
  { key:'Ga', name:'Auditory Processing', color:'#EC4899', abilities:[
    { code:'PC',  name:'Phonetic Coding',        score:71 },
    { code:'US',  name:'Sound Discrimination',   score:68 },
    { code:'UA',  name:'Resistance to Distortion',score:74 },
    { code:'UM',  name:'Memory for Sound',       score:79 },
    { code:'UK',  name:'Temporal Tracking',      score:72 },
    { code:'UP',  name:'Pitch Discrimination',   score:65 },
    { code:'UL',  name:'Sound Localization',     score:67 },
    { code:'AT',  name:'Auditory Attention',     score:73 },
  ]},
  { key:'Glr', name:'Long-term Retrieval', color:'#06B6D4', abilities:[
    { code:'MA',  name:'Associative Memory',     score:86 },
    { code:'MM',  name:'Meaningful Memory',      score:83 },
    { code:'M6',  name:'Free Recall Memory',     score:79 },
    { code:'FI',  name:'Idea Fluency',           score:90 },
    { code:'FA',  name:'Associational Fluency',  score:85 },
    { code:'FE',  name:'Expressional Fluency',   score:88 },
    { code:'FW',  name:'Word Fluency',           score:82 },
    { code:'FF',  name:'Figural Fluency',        score:77 },
    { code:'FX',  name:'Figural Flexibility',    score:80 },
  ]},
  { key:'Gs', name:'Processing Speed', color:'#F97316', abilities:[
    { code:'P',   name:'Perceptual Speed',       score:95 },
    { code:'N',   name:'Number Facility',        score:91 },
    { code:'R9',  name:'Rate of Test Taking',    score:88 },
    { code:'R4',  name:'Reading Speed',          score:84 },
    { code:'Rt',  name:'Decision Speed',         score:89 },
    { code:'R7',  name:'Number Comparison',      score:92 },
    { code:'PAR', name:'Pattern Execution',      score:87 },
    { code:'PS',  name:'Psychomotor Speed',      score:80 },
  ]},
  { key:'Gq', name:'Quantitative Knowledge', color:'#10B981', abilities:[
    { code:'KM',  name:'Mathematical Knowledge', score:89 },
    { code:'A3',  name:'Math Achievement',       score:92 },
    { code:'QR',  name:'Quantitative Reasoning', score:87 },
    { code:'SQ',  name:'Statistical Reasoning',  score:81 },
    { code:'NR',  name:'Numerical Reasoning',    score:94 },
    { code:'AT2', name:'Applied Mathematics',    score:88 },
    { code:'ES',  name:'Estimation',             score:85 },
    { code:'PR',  name:'Proportional Reasoning', score:90 },
  ]},
]

// ── Bloom taxonomy ────────────────────────────────────────────────────────────
type BloomTier = 'found' | 'apply' | 'master'
function bloomMeta(level: number): { name: string; tier: BloomTier; color: string } {
  if (level <= 2) return { name: level === 1 ? 'Remember' : 'Understand', tier: 'found',  color: '#3B82F6' }
  if (level <= 4) return { name: level === 3 ? 'Apply'    : 'Analyze',    tier: 'apply',  color: GOLD }
  return              { name: level === 5 ? 'Evaluate'  : 'Create',       tier: 'master', color: '#10B981' }
}

// ── Teacher + feed data ───────────────────────────────────────────────────────
const TEACHERS = {
  em001: { name: EXPERT_ID,             initials: EXPERT_THEME.initials,   color: EXPERT_THEME.color  },
  dl003: { name: 'Expert-DAD0824',      initials: 'DAD',                   color: '#8B5CF6'           },
  pz007: { name: EXPERT_ID,             initials: EXPERT_THEME.initials,   color: EXPERT_THEME.color  },
} satisfies Record<string, { name: string; initials: string; color: string }>
type TeacherId = keyof typeof TEACHERS

const BLOOM_FEED: { id: number; topic: string; level: number; teacher: TeacherId; mins: number; yield: string }[] = [
  { id:  1, topic: 'The Pursuit of Logic',              level: 3, teacher: 'em001', mins: 15,  yield: '+0.2% Gf'  },
  { id:  2, topic: 'Spatial Geometry · Theorem 7',      level: 2, teacher: 'dl003', mins: 42,  yield: '+0.5% Gv'  },
  { id:  3, topic: 'Quantum Probability · Ch.4',        level: 4, teacher: 'pz007', mins: 88,  yield: '+0.3% Gwm' },
  { id:  4, topic: 'Inverse Reasoning · Final',         level: 5, teacher: 'em001', mins: 140, yield: '+0.4% Gf'  },
  { id:  5, topic: 'Phonetic Pattern Mapping',          level: 2, teacher: 'em001', mins: 35,  yield: '+0.4% Ga'  },
  { id:  6, topic: 'Abstract Fluid Forms',              level: 6, teacher: 'pz007', mins: 63,  yield: '+0.6% Gc'  },
  { id:  7, topic: 'Working Memory Drill · Set 3',      level: 3, teacher: 'dl003', mins: 28,  yield: '+0.5% Gwm' },
  { id:  8, topic: 'Matrix Decomposition · Vol.2',      level: 4, teacher: 'pz007', mins: 95,  yield: '+0.3% Gf'  },
  { id:  9, topic: 'Sound Discrimination Exercises',    level: 1, teacher: 'em001', mins: 18,  yield: '+0.3% Ga'  },
  { id: 10, topic: 'Visual Rotation · Level 6',         level: 5, teacher: 'pz007', mins: 112, yield: '+0.6% Gv'  },
  { id: 11, topic: 'Associative Memory Network',        level: 3, teacher: 'dl003', mins: 51,  yield: '+0.4% Glr' },
  { id: 12, topic: 'Applied Statistics · Module 5',     level: 4, teacher: 'pz007', mins: 77,  yield: '+0.2% Gq'  },
  { id: 13, topic: 'Processing Speed · Sprint Series',  level: 2, teacher: 'em001', mins: 24,  yield: '+0.5% Gs'  },
  { id: 14, topic: 'Linguistic Analogy Chains',         level: 3, teacher: 'dl003', mins: 44,  yield: '+0.3% Gc'  },
  { id: 15, topic: 'Fluid Deduction · Olympiad Set',    level: 5, teacher: 'pz007', mins: 165, yield: '+0.5% Gf'  },
]

// ── Expert Logic Pool — 120 items, 15 per CHC dimension ─────────────────────
const EXPERT_LOGIC_POOL: {
  initials: string; color: string; name: string; unit: string
  skill: string; category: string; match: number
}[] = [
  // ── Ga — Auditory Processing ─────────────────────────────────────────────
  { initials:EXPERT_THEME.initials, color:EXPERT_THEME.color, name:EXPERT_ID, unit:'Phonetic Decoding Bridge', skill:'Auditory Processing', category:'Ga', match:98 },
  { initials:'NKM', color:'#EC4899', name:'Expert-NKM7733',    unit:'Sound Pattern Recognition',        skill:'Auditory Processing',  category:'Ga',  match:93 },
  { initials:'ATR', color:'#EC4899', name:'Expert-ATR2245',    unit:'Pitch & Rhythm Sequencing',        skill:'Auditory Processing',  category:'Ga',  match:91 },
  { initials:'LIN', color:'#EC4899', name:'Expert-LIN3389',    unit:'Temporal Order Processing',        skill:'Auditory Processing',  category:'Ga',  match:89 },
  { initials:'KIM', color:'#EC4899', name:'Expert-KIM4412',    unit:'Acoustic Memory Mapping',          skill:'Auditory Processing',  category:'Ga',  match:86 },
  { initials:'YTO', color:'#EC4899', name:'Expert-YTO5527',    unit:'Speech Discrimination Circuits',   skill:'Auditory Processing',  category:'Ga',  match:84 },
  { initials:'BAO', color:'#EC4899', name:'Expert-BAO6634',    unit:'Phonological Loop Training',       skill:'Auditory Processing',  category:'Ga',  match:82 },
  { initials:'SRV', color:'#EC4899', name:'Expert-SRV7741',    unit:'Auditory Contrast Detection',      skill:'Auditory Processing',  category:'Ga',  match:80 },
  { initials:'JWV', color:'#EC4899', name:'Expert-JWV8856',    unit:'Binaural Integration Engine',      skill:'Auditory Processing',  category:'Ga',  match:80 },
  { initials:'AFO', color:'#EC4899', name:'Expert-AFO9963',    unit:'Tonal Memory Anchoring',           skill:'Auditory Processing',  category:'Ga',  match:80 },
  { initials:'KOA', color:'#EC4899', name:'Expert-KOA1174',    unit:'Rhythm Pattern Encoding',          skill:'Auditory Processing',  category:'Ga',  match:80 },
  { initials:'TON', color:'#EC4899', name:'Expert-TON2285',    unit:'Spectral Contrast Processing',     skill:'Auditory Processing',  category:'Ga',  match:80 },
  { initials:'ZHG', color:'#EC4899', name:'Expert-ZHG3396',    unit:'Phoneme Boundary Detection',       skill:'Auditory Processing',  category:'Ga',  match:80 },
  { initials:'RLB', color:'#EC4899', name:'Expert-RLB4407',    unit:'Harmonic Series Mapping',          skill:'Auditory Processing',  category:'Ga',  match:80 },
  { initials:'NSO', color:'#EC4899', name:'Expert-NSO5518',    unit:'Auditory Figure-Ground Logic',     skill:'Auditory Processing',  category:'Ga',  match:80 },
  // ── Gv — Visual-Spatial Processing ──────────────────────────────────────
  { initials:EXPERT_THEME.initials, color:EXPERT_THEME.color, name:EXPERT_ID, unit:'Segment Diagram · Socratic Protocol', skill:'Visual-Spatial', category:'Gv', match:97 },
  { initials:'WEI', color:'#F59E0B', name:'Expert-WEI1234',    unit:'Perspective & Depth Logic',        skill:'Visual-Spatial',       category:'Gv',  match:94 },
  { initials:'VSP', color:'#F59E0B', name:'Expert-VSP2345',    unit:'Mental Map Construction',          skill:'Visual-Spatial',       category:'Gv',  match:91 },
  { initials:'LGV', color:'#F59E0B', name:'Expert-LGV3456',    unit:'Figural Reasoning Chains',         skill:'Visual-Spatial',       category:'Gv',  match:89 },
  { initials:'KVS', color:'#F59E0B', name:'Expert-KVS4567',    unit:'Spatial Orientation Engine',       skill:'Visual-Spatial',       category:'Gv',  match:87 },
  { initials:'WRT', color:'#F59E0B', name:'Expert-WRT5678',    unit:'Mental Imagery Synthesis',         skill:'Visual-Spatial',       category:'Gv',  match:85 },
  { initials:'DCH', color:'#F59E0B', name:'Expert-DCH6789',    unit:'Visuospatial Pattern Lock',        skill:'Visual-Spatial',       category:'Gv',  match:83 },
  { initials:'ZPT', color:'#F59E0B', name:'Expert-ZPT7890',    unit:'3D Volume Estimation Logic',       skill:'Visual-Spatial',       category:'Gv',  match:81 },
  { initials:'ORT', color:'#F59E0B', name:'Expert-ORT8901',    unit:'Orthographic Projection Logic',    skill:'Visual-Spatial',       category:'Gv',  match:81 },
  { initials:'SPR', color:'#F59E0B', name:'Expert-SPR9012',    unit:'Depth Cue Integration',            skill:'Visual-Spatial',       category:'Gv',  match:80 },
  { initials:'PMV', color:'#F59E0B', name:'Expert-PMV1123',    unit:'Topographic Reasoning',            skill:'Visual-Spatial',       category:'Gv',  match:80 },
  { initials:'LRF', color:'#F59E0B', name:'Expert-LRF2234',    unit:'Architectural Schematic Logic',    skill:'Visual-Spatial',       category:'Gv',  match:80 },
  { initials:'CVZ', color:'#F59E0B', name:'Expert-CVZ3345',    unit:'Dynamic Tracking Engine',          skill:'Visual-Spatial',       category:'Gv',  match:80 },
  { initials:'GFM', color:'#F59E0B', name:'Expert-GFM4456',    unit:'Shape Decomposition Logic',        skill:'Visual-Spatial',       category:'Gv',  match:80 },
  { initials:'BNV', color:'#F59E0B', name:'Expert-BNV5567',    unit:'Stereoscopic Depth Engine',        skill:'Visual-Spatial',       category:'Gv',  match:80 },
  // ── Gwm — Working Memory ─────────────────────────────────────────────────
  { initials:'MHT', color:'#8B5CF6', name:'Expert-MHT5566',    unit:'Sequential Working Memory',        skill:'Working Memory',       category:'Gwm', match:97 },
  { initials:'WMM', color:'#8B5CF6', name:'Expert-WMM1122',    unit:'Dual-Task Capacity Training',      skill:'Working Memory',       category:'Gwm', match:93 },
  { initials:'KGM', color:'#8B5CF6', name:'Expert-KGM2233',    unit:'Interference Control Drills',      skill:'Working Memory',       category:'Gwm', match:90 },
  { initials:'LNW', color:'#8B5CF6', name:'Expert-LNW3344',    unit:'N-Back Protocol Suite',            skill:'Working Memory',       category:'Gwm', match:88 },
  { initials:'TYW', color:'#8B5CF6', name:'Expert-TYW4455',    unit:'Phonological Store Training',      skill:'Working Memory',       category:'Gwm', match:86 },
  { initials:'CHW', color:'#8B5CF6', name:'Expert-CHW5566',    unit:'Visuospatial Sketchpad Drills',    skill:'Working Memory',       category:'Gwm', match:84 },
  { initials:'RJW', color:'#8B5CF6', name:'Expert-RJW6677',    unit:'Executive Control Sequencing',     skill:'Working Memory',       category:'Gwm', match:82 },
  { initials:'BSY', color:'#8B5CF6', name:'Expert-BSY7788',    unit:'Cognitive Load Optimization',      skill:'Working Memory',       category:'Gwm', match:80 },
  { initials:'IFM', color:'#8B5CF6', name:'Expert-IFM8899',    unit:'Chunking Strategy Suite',          skill:'Working Memory',       category:'Gwm', match:80 },
  { initials:'TKC', color:'#8B5CF6', name:'Expert-TKC9900',    unit:'Multi-Channel Routing Logic',      skill:'Working Memory',       category:'Gwm', match:80 },
  { initials:'RBF', color:'#8B5CF6', name:'Expert-RBF1011',    unit:'Proactive Interference Shield',    skill:'Working Memory',       category:'Gwm', match:80 },
  { initials:'SQU', color:'#8B5CF6', name:'Expert-SQU2122',    unit:'Temporal Ordering Circuits',       skill:'Working Memory',       category:'Gwm', match:80 },
  { initials:'MFT', color:'#8B5CF6', name:'Expert-MFT3233',    unit:'Executive Gating System',          skill:'Working Memory',       category:'Gwm', match:80 },
  { initials:'CGT', color:'#8B5CF6', name:'Expert-CGT4344',    unit:'Load Balancing Protocol',          skill:'Working Memory',       category:'Gwm', match:80 },
  { initials:'WBN', color:'#8B5CF6', name:'Expert-WBN5455',    unit:'Integrated Buffer Training',       skill:'Working Memory',       category:'Gwm', match:80 },
  // ── Gf — Fluid Intelligence ──────────────────────────────────────────────
  { initials:'MXU', color:'#3B82F6', name:'Expert-MXU1155',    unit:'Abstract Symbol Mapping',          skill:'Fluid Intelligence',   category:'Gf',  match:97 },
  { initials:'FRO', color:'#3B82F6', name:'Expert-FRO2266',    unit:'Novel Pattern Induction',          skill:'Fluid Intelligence',   category:'Gf',  match:95 },
  { initials:'RZN', color:'#3B82F6', name:'Expert-RZN3377',    unit:'Analogical Transfer Logic',        skill:'Fluid Intelligence',   category:'Gf',  match:92 },
  { initials:'WNG', color:'#3B82F6', name:'Expert-WNG4488',    unit:'Matrix Reasoning Engine',          skill:'Fluid Intelligence',   category:'Gf',  match:90 },
  { initials:'LAR', color:'#3B82F6', name:'Expert-LAR5599',    unit:'Inductive Leap Circuits',          skill:'Fluid Intelligence',   category:'Gf',  match:88 },
  { initials:'YKN', color:'#3B82F6', name:'Expert-YKN6600',    unit:'Deductive Proof Chains',           skill:'Fluid Intelligence',   category:'Gf',  match:86 },
  { initials:'HRC', color:'#3B82F6', name:'Expert-HRC7711',    unit:'Systematic Hypothesis Testing',    skill:'Fluid Intelligence',   category:'Gf',  match:83 },
  { initials:'CDR', color:'#3B82F6', name:'Expert-CDR8822',    unit:'Rule Discovery Protocols',         skill:'Fluid Intelligence',   category:'Gf',  match:81 },
  { initials:'SCM', color:'#3B82F6', name:'Expert-SCM9933',    unit:'Constraint Relaxation Engine',     skill:'Fluid Intelligence',   category:'Gf',  match:81 },
  { initials:'IFL', color:'#3B82F6', name:'Expert-IFL1044',    unit:'Causal Chain Synthesis',           skill:'Fluid Intelligence',   category:'Gf',  match:81 },
  { initials:'ABD', color:'#3B82F6', name:'Expert-ABD2155',    unit:'Concept Mapping Logic',            skill:'Fluid Intelligence',   category:'Gf',  match:80 },
  { initials:'PVL', color:'#3B82F6', name:'Expert-PVL3266',    unit:'Structural Pattern Shift',         skill:'Fluid Intelligence',   category:'Gf',  match:80 },
  { initials:'NFM', color:'#3B82F6', name:'Expert-NFM4377',    unit:'Emergent Rule Formation',          skill:'Fluid Intelligence',   category:'Gf',  match:80 },
  { initials:'ARO', color:'#3B82F6', name:'Expert-ARO5488',    unit:'Cross-Domain Transfer Logic',      skill:'Fluid Intelligence',   category:'Gf',  match:80 },
  { initials:'THY', color:'#3B82F6', name:'Expert-THY6599',    unit:'Hypothesis Space Mapping',         skill:'Fluid Intelligence',   category:'Gf',  match:80 },
  // ── Gc — Crystallized Intelligence ──────────────────────────────────────
  { initials:'DAD', color:'#10B981', name:'Expert-DAD0824',    unit:'Linguistic Contextual Anchors',    skill:'Crystallized Intel.',  category:'Gc',  match:95 },
  { initials:'CKN', color:'#10B981', name:'Expert-CKN1133',    unit:'Semantic Web Expansion',           skill:'Crystallized Intel.',  category:'Gc',  match:93 },
  { initials:'LVB', color:'#10B981', name:'Expert-LVB2244',    unit:'Domain Knowledge Encoding',        skill:'Crystallized Intel.',  category:'Gc',  match:90 },
  { initials:'HGC', color:'#10B981', name:'Expert-HGC3355',    unit:'Cultural Schema Activation',       skill:'Crystallized Intel.',  category:'Gc',  match:88 },
  { initials:'ZGC', color:'#10B981', name:'Expert-ZGC4466',    unit:'Declarative Memory Webs',          skill:'Crystallized Intel.',  category:'Gc',  match:86 },
  { initials:'QWD', color:'#10B981', name:'Expert-QWD5577',    unit:'Academic Vocabulary Circuits',     skill:'Crystallized Intel.',  category:'Gc',  match:84 },
  { initials:'KNT', color:'#10B981', name:'Expert-KNT6688',    unit:'Interdisciplinary Linking',        skill:'Crystallized Intel.',  category:'Gc',  match:82 },
  { initials:'CCR', color:'#10B981', name:'Expert-CCR7799',    unit:'Applied Knowledge Synthesis',      skill:'Crystallized Intel.',  category:'Gc',  match:80 },
  { initials:'WLK', color:'#10B981', name:'Expert-WLK8800',    unit:'Lexical Network Expansion',        skill:'Crystallized Intel.',  category:'Gc',  match:80 },
  { initials:'SCN', color:'#10B981', name:'Expert-SCN9911',    unit:'Prior Knowledge Activation',       skill:'Crystallized Intel.',  category:'Gc',  match:80 },
  { initials:'ICD', color:'#10B981', name:'Expert-ICD1022',    unit:'Fact Compression Logic',           skill:'Crystallized Intel.',  category:'Gc',  match:80 },
  { initials:'RHB', color:'#10B981', name:'Expert-RHB2133',    unit:'Comprehension Scaffolding',        skill:'Crystallized Intel.',  category:'Gc',  match:80 },
  { initials:'HRT', color:'#10B981', name:'Expert-HRT3244',    unit:'Historical Context Webs',          skill:'Crystallized Intel.',  category:'Gc',  match:80 },
  { initials:'FDT', color:'#10B981', name:'Expert-FDT4355',    unit:'Encyclopedic Recall Engine',       skill:'Crystallized Intel.',  category:'Gc',  match:80 },
  { initials:'NCH', color:'#10B981', name:'Expert-NCH5466',    unit:'Story Grammar Encoding',           skill:'Crystallized Intel.',  category:'Gc',  match:80 },
  // ── Glr — Long-term Retrieval ────────────────────────────────────────────
  { initials:'BLK', color:'#06B6D4', name:'Expert-BLK1177',    unit:'Memory Palace Architecture',       skill:'Long-term Retrieval',  category:'Glr', match:93 },
  { initials:'MAR', color:'#06B6D4', name:'Expert-MAR2288',    unit:'Spaced Repetition Protocols',      skill:'Long-term Retrieval',  category:'Glr', match:91 },
  { initials:'RFL', color:'#06B6D4', name:'Expert-RFL3399',    unit:'Free Recall Optimization',         skill:'Long-term Retrieval',  category:'Glr', match:89 },
  { initials:'GGL', color:'#06B6D4', name:'Expert-GGL4400',    unit:'Cued Retrieval Chains',            skill:'Long-term Retrieval',  category:'Glr', match:87 },
  { initials:'AFL', color:'#06B6D4', name:'Expert-AFL5511',    unit:'Associational Fluency Nets',       skill:'Long-term Retrieval',  category:'Glr', match:85 },
  { initials:'WCH', color:'#06B6D4', name:'Expert-WCH6622',    unit:'Semantic Fluency Pathways',        skill:'Long-term Retrieval',  category:'Glr', match:83 },
  { initials:'MNM', color:'#06B6D4', name:'Expert-MNM7733',    unit:'Episodic Memory Binding',          skill:'Long-term Retrieval',  category:'Glr', match:82 },
  { initials:'IDR', color:'#06B6D4', name:'Expert-IDR8844',    unit:'Ideational Fluency Engine',        skill:'Long-term Retrieval',  category:'Glr', match:80 },
  { initials:'FLK', color:'#06B6D4', name:'Expert-FLK9955',    unit:'Figural Fluency Pathways',         skill:'Long-term Retrieval',  category:'Glr', match:80 },
  { initials:'LFL', color:'#06B6D4', name:'Expert-LFL1066',    unit:'Paired Associate Training',        skill:'Long-term Retrieval',  category:'Glr', match:80 },
  { initials:'CNT', color:'#06B6D4', name:'Expert-CNT2177',    unit:'Memory Consolidation Bridge',      skill:'Long-term Retrieval',  category:'Glr', match:80 },
  { initials:'ART', color:'#06B6D4', name:'Expert-ART3288',    unit:'Context-Dependent Recall',         skill:'Long-term Retrieval',  category:'Glr', match:80 },
  { initials:'PBD', color:'#06B6D4', name:'Expert-PBD4399',    unit:'Learning Curve Optimizer',         skill:'Long-term Retrieval',  category:'Glr', match:80 },
  { initials:'TEN', color:'#06B6D4', name:'Expert-TEN5400',    unit:'Contextual Encoding Engine',       skill:'Long-term Retrieval',  category:'Glr', match:80 },
  { initials:'NBL', color:'#06B6D4', name:'Expert-NBL6511',    unit:'Neural Trace Reinforcement',       skill:'Long-term Retrieval',  category:'Glr', match:80 },
  // ── Gs — Processing Speed ────────────────────────────────────────────────
  { initials:'RVR', color:'#F97316', name:'Expert-RVR1144',    unit:'Processing Speed Protocols',       skill:'Processing Speed',     category:'Gs',  match:97 },
  { initials:'SPG', color:'#F97316', name:'Expert-SPG2255',    unit:'Rapid Decision Encoding',          skill:'Processing Speed',     category:'Gs',  match:95 },
  { initials:'FGS', color:'#F97316', name:'Expert-FGS3366',    unit:'Perceptual Speed Sprint',          skill:'Processing Speed',     category:'Gs',  match:93 },
  { initials:'QTK', color:'#F97316', name:'Expert-QTK4477',    unit:'Number Facility Training',         skill:'Processing Speed',     category:'Gs',  match:90 },
  { initials:'CLG', color:'#F97316', name:'Expert-CLG5588',    unit:'Rate Test-Taking Engine',          skill:'Processing Speed',     category:'Gs',  match:88 },
  { initials:'RFP', color:'#F97316', name:'Expert-RFP6699',    unit:'Decision Speed Circuits',          skill:'Processing Speed',     category:'Gs',  match:86 },
  { initials:'ZFR', color:'#F97316', name:'Expert-ZFR7700',    unit:'Psychomotor Automation',           skill:'Processing Speed',     category:'Gs',  match:84 },
  { initials:'NRD', color:'#F97316', name:'Expert-NRD8811',    unit:'Reading Speed Optimization',       skill:'Processing Speed',     category:'Gs',  match:82 },
  { initials:'FKY', color:'#F97316', name:'Expert-FKY9922',    unit:'Visual Search Acceleration',       skill:'Processing Speed',     category:'Gs',  match:82 },
  { initials:'TSC', color:'#F97316', name:'Expert-TSC1033',    unit:'Eye Movement Efficiency',          skill:'Processing Speed',     category:'Gs',  match:81 },
  { initials:'CFT', color:'#F97316', name:'Expert-CFT2144',    unit:'Clerical Speed Calibration',       skill:'Processing Speed',     category:'Gs',  match:81 },
  { initials:'RPR', color:'#F97316', name:'Expert-RPR3255',    unit:'Symbol Comparison Sprint',         skill:'Processing Speed',     category:'Gs',  match:80 },
  { initials:'SBF', color:'#F97316', name:'Expert-SBF4366',    unit:'Rapid Execution Pathways',         skill:'Processing Speed',     category:'Gs',  match:80 },
  { initials:'WAC', color:'#F97316', name:'Expert-WAC5477',    unit:'Neural Latency Reduction',         skill:'Processing Speed',     category:'Gs',  match:80 },
  { initials:'CRX', color:'#F97316', name:'Expert-CRX6588',    unit:'Perceptual Automation Suite',      skill:'Processing Speed',     category:'Gs',  match:80 },
  // ── Gq — Quantitative Knowledge ─────────────────────────────────────────
  { initials:'YMD', color:'#059669', name:'Expert-YMD1199',    unit:'Number Theory Mastery',            skill:'Quantitative Know.',   category:'Gq',  match:97 },
  { initials:'QMT', color:'#059669', name:'Expert-QMT2200',    unit:'Applied Algebra Circuits',         skill:'Quantitative Know.',   category:'Gq',  match:95 },
  { initials:'NTK', color:'#059669', name:'Expert-NTK3311',    unit:'Statistical Pattern Reasoning',    skill:'Quantitative Know.',   category:'Gq',  match:93 },
  { initials:'CHQ', color:'#059669', name:'Expert-CHQ4422',    unit:'Calculus Logic Chains',            skill:'Quantitative Know.',   category:'Gq',  match:91 },
  { initials:'WQT', color:'#059669', name:'Expert-WQT5533',    unit:'Proportional Reasoning Engine',    skill:'Quantitative Know.',   category:'Gq',  match:89 },
  { initials:'ZLQ', color:'#059669', name:'Expert-ZLQ6644',    unit:'Geometric Proof Synthesis',        skill:'Quantitative Know.',   category:'Gq',  match:87 },
  { initials:'EKN', color:'#059669', name:'Expert-EKN7755',    unit:'Number Sense Calibration',         skill:'Quantitative Know.',   category:'Gq',  match:85 },
  { initials:'FMT', color:'#059669', name:'Expert-FMT8866',    unit:'Applied Statistics Circuits',      skill:'Quantitative Know.',   category:'Gq',  match:83 },
  { initials:'NLB', color:'#059669', name:'Expert-NLB9977',    unit:'Number Decomposition Logic',       skill:'Quantitative Know.',   category:'Gq',  match:83 },
  { initials:'ARQ', color:'#059669', name:'Expert-ARQ1088',    unit:'Arithmetic Fluency Engine',        skill:'Quantitative Know.',   category:'Gq',  match:82 },
  { initials:'GAL', color:'#059669', name:'Expert-GAL2199',    unit:'Algebraic Structure Logic',        skill:'Quantitative Know.',   category:'Gq',  match:82 },
  { initials:'DBR', color:'#059669', name:'Expert-DBR3200',    unit:'Data Interpretation Circuits',     skill:'Quantitative Know.',   category:'Gq',  match:81 },
  { initials:'CRA', color:'#059669', name:'Expert-CRA4311',    unit:'Ratio & Rate Mastery',             skill:'Quantitative Know.',   category:'Gq',  match:81 },
  { initials:'SET', color:'#059669', name:'Expert-SET5422',    unit:'Set Theory Foundations',           skill:'Quantitative Know.',   category:'Gq',  match:80 },
  { initials:'PMT', color:'#059669', name:'Expert-PMT6533',    unit:'Mathematical Proof Logic',         skill:'Quantitative Know.',   category:'Gq',  match:80 },
]

const RECOMMENDED: { id: TeacherId; specialty: string; match: number; note: string }[] = [
  { id: 'em001', specialty: 'Quantitative Logic', match: 98, note: 'Closes Gq gap'     },
  { id: 'pz007', specialty: 'Fluid Reasoning',    match: 94, note: 'Lifts Gf score'    },
]

// ── Wisdom ID data per teacher ────────────────────────────────────────────────
const TEACHER_WISDOM: Record<TeacherId, { years: string; assets: number; activeNodes: number }> = {
  em001: { years: '30+', assets: 48, activeNodes: 2841 },
  pz007: { years: '25+', assets: 92, activeNodes: 5103 },
  dl003: { years: '18+', assets: 31, activeNodes: 1287 },
}

// ── Fraction helper ───────────────────────────────────────────────────────────
function Frac({ num, den }: { num: React.ReactNode; den: React.ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
      verticalAlign: 'middle', margin: '0 5px', lineHeight: 1.2 }}>
      <span style={{ borderBottom: `1px solid ${INK}`, paddingBottom: 2, whiteSpace: 'nowrap' }}>{num}</span>
      <span style={{ paddingTop: 2, whiteSpace: 'nowrap' }}>{den}</span>
    </span>
  )
}

// ── Economic Modal ────────────────────────────────────────────────────────────
function EconomicModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center px-5"
      style={{ background: 'rgba(0,0,0,0.16)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}>
      <motion.div className="w-full max-w-md rounded-3xl p-8 relative" style={MODAL_GLASS}
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.3, ease: EASE }}
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose}
          className="absolute top-5 right-5 w-7 h-7 rounded-full flex items-center justify-center text-sm hover:opacity-60 transition-opacity"
          style={{ background: 'rgba(0,0,0,0.06)', color: MUTED }}>×</button>
        <p className="text-[9px] font-bold tracking-[0.32em] uppercase mb-1" style={{ color: GOLD }}>
          Economic Specification
        </p>
        <h3 className="text-xl font-black mb-5" style={{ fontFamily: 'var(--font-playfair)', color: INK }}>
          Minting Phase
        </h3>
        <div className="rounded-2xl px-6 py-5 mb-5" style={{ background: `${GOLD}09`, border: `1px solid ${GOLD}22` }}>
          <p className="text-[10px] font-semibold tracking-[0.22em] uppercase mb-3" style={{ color: GOLD }}>
            Credit Minting Formula
          </p>
          <div className="text-sm font-mono leading-loose" style={{ color: INK }}>
            <span>Credits</span><sub style={{ fontSize: 10 }}>minted</sub>
            <span> = </span>
            <Frac num={<span>Hashrate × Δ<em>t</em></span>} den={<span>Network Difficulty</span>} />
            <span> × <strong style={{ color: GOLD }}>0.95</strong></span>
          </div>
        </div>
        <p className="text-xs leading-relaxed mb-6" style={{ color: MUTED }}>
          <span style={{ color: GOLD, fontWeight: 600 }}>5% Protocol Fee</span>{' '}
          applied for network maintenance, relay node upkeep, and proof-of-logic consensus validation.
        </p>
        <div className="space-y-2 mb-7">
          {[
            { term: 'Hashrate',           def: 'Device compute output in GFLOPS' },
            { term: 'Δt',                 def: 'Active mining interval in seconds' },
            { term: 'Network Difficulty', def: 'Global demand-adjusted proof target' },
            { term: '× 0.95',             def: '95% of gross minted to parent wallet' },
          ].map(r => (
            <div key={r.term} className="flex items-start gap-3">
              <span className="text-[10px] font-mono font-bold flex-shrink-0 mt-0.5 px-2 py-0.5 rounded"
                style={{ background: `${GOLD}12`, color: GOLD, minWidth: 100 }}>{r.term}</span>
              <span className="text-[11px] leading-relaxed" style={{ color: MUTED }}>{r.def}</span>
            </div>
          ))}
        </div>
        <div className="pt-5 flex flex-col items-center" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-1">
            <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD }}
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.6, repeat: Infinity }} />
            <p className="text-[10px] font-semibold" style={{ color: GOLD }}>
              Verified by Proof-of-Logic Consensus
            </p>
          </div>
          <p className="text-[9px]" style={{ color: '#9CA3AF' }}>Sparkle Protocol · v2.1.0 · On-chain</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Waveform ──────────────────────────────────────────────────────────────────
function Waveform() {
  const BARS = 20
  const [tick, setTick] = useState(0)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    const id = setInterval(() => setTick(t => t + 1), 90)
    return () => clearInterval(id)
  }, [])
  if (!mounted) return <div className="h-8 mt-3" />
  return (
    <div className="flex items-end gap-[2px] h-8 mt-3">
      {Array.from({ length: BARS }, (_, i) => {
        const phase = tick * 0.18 + i * 0.48
        const h = 4 + Math.abs(Math.sin(phase)) * 22
        const alpha = 0.25 + Math.abs(Math.sin(phase)) * 0.6
        return (
          <div key={i} style={{
            width: 3, height: h, borderRadius: 2, flexShrink: 0,
            background: `rgba(245,158,11,${alpha.toFixed(2)})`,
            transition: 'height 0.09s ease',
          }} />
        )
      })}
    </div>
  )
}

// ── Pulse Bar ─────────────────────────────────────────────────────────────────
function PulseBar() {
  const msg = `Emma is synchronizing with 'Spatial Geometry' Logic DNA by ${EXPERT_ID}  ·  ${EXPERT_ID}'s 'Quantum Probability' kernel invoked · L4 Analyze depth  ·  New Logic DNA available — 'Abstract Reasoning Vol.3'  ·  8.4 GFLOPS compute contributing to Sparkle network  ·  `
  return (
    <>
      <style>{`
        @keyframes sprk-pulse{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .sprk-pulse{animation:sprk-pulse 36s linear infinite;display:flex;white-space:nowrap;}
      `}</style>
      <div className="flex items-center overflow-hidden rounded-xl"
        style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.10)', height: 36 }}>
        <div className="flex items-center gap-2 px-4 flex-shrink-0"
          style={{ borderRight: '1px solid rgba(245,158,11,0.14)', height: '100%' }}>
          <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD }}
            animate={{ opacity: [1, 0.25, 1], scale: [1, 1.4, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} />
          <span className="text-[9px] font-bold tracking-[0.22em] uppercase" style={{ color: GOLD }}>Live</span>
        </div>
        <div className="overflow-hidden flex-1">
          <div className="sprk-pulse text-[11px] pl-4" style={{ color: SUBTLE }}>
            <span>{msg}</span><span>{msg}</span>
          </div>
        </div>
      </div>
    </>
  )
}

// ── CHC Stratum I Radar — 70 Narrow Abilities ─────────────────────────────────
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
        {/* Concentric rings */}
        {[25,50,75,100].map(p => (
          <circle key={p} cx={CX} cy={CY} r={R_MAX * p / 100}
            fill="none" stroke="#F3F4F6" strokeWidth={p===100 ? 1 : 0.7} />
        ))}
        {/* Ring labels */}
        {[50,75,100].map(p => (
          <text key={p} x={CX+2} y={CY - R_MAX*p/100 + 9}
            fontSize={6.5} fill={SUBTLE} textAnchor="middle"
            style={{ fontFamily:'system-ui' }}>{p}</text>
        ))}
        {/* Sector backgrounds */}
        {groups.map(group => {
          const first   = group.abilities[0].angle - step / 2
          const last    = group.abilities[group.abilities.length-1].angle + step / 2
          const isSel   = selectedCategory === group.key
          const isDimmed = selectedCategory && !isSel
          return (
            <path key={group.key}
              d={sectorPath(first, last, R_MAX)}
              fill={isSel ? `${group.color}1E` : `${group.color}09`}
              stroke={isSel ? `${group.color}55` : `${group.color}22`}
              strokeWidth={isSel ? 1.4 : 0.7}
              opacity={isDimmed ? 0.3 : 1}
              style={{ transition:'opacity 0.2s, fill 0.2s' }} />
          )
        })}
        {/* Spoke lines */}
        {groups.flatMap(g => g.abilities.map(ab => (
          <line key={`${g.key}-${ab.code}`}
            x1={CX} y1={CY}
            x2={(CX + R_MAX * Math.cos(ab.angle)).toFixed(1) as unknown as number}
            y2={(CY + R_MAX * Math.sin(ab.angle)).toFixed(1) as unknown as number}
            stroke={`${g.color}22`} strokeWidth={0.6} />
        )))}
        {/* Score polygon */}
        <polygon points={allPts} fill={`${GOLD}12`} stroke={GOLD} strokeWidth={1.2} />
        {/* Score dots (interactive) */}
        {groups.flatMap(group => group.abilities.map(ab => {
          const r      = R_MAX * ab.score / 100
          const px     = CX + r * Math.cos(ab.angle)
          const py     = CY + r * Math.sin(ab.angle)
          const isHov  = hovered?.group === group.key && hovered?.code === ab.code
          const isSel  = selectedCategory === group.key
          return (
            <circle key={`${group.key}-${ab.code}-dot`}
              cx={px.toFixed(1) as unknown as number}
              cy={py.toFixed(1) as unknown as number}
              r={isHov || isSel ? 5.5 : ab.score >= 90 ? 3.5 : 2.5}
              fill={isHov || isSel ? group.color : `${group.color}88`}
              opacity={selectedCategory && !isSel ? 0.3 : 1}
              style={{ cursor:'pointer', transition:'r 0.15s, opacity 0.2s', filter: isSel ? `drop-shadow(0 0 3px ${group.color})` : 'none' }}
              onMouseEnter={() => setHovered({ group:group.key, code:ab.code })}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onDimClick(isSel ? null : group.key)} />
          )
        }))}
        {/* Broad ability labels — clickable */}
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
              fontSize={isSel ? 11 : 9}
              fontWeight={isSel ? '900' : '700'}
              fill={group.color}
              opacity={isDimmed ? 0.3 : 1}
              textAnchor="middle" dominantBaseline="middle"
              style={{ fontFamily:'system-ui', cursor:'pointer', transition:'opacity 0.2s' }}
              onClick={() => onDimClick(isSel ? null : group.key)}>
              {group.key}
            </text>
          )
        })}

        {/* Floating SVG tooltip — appears beside hovered dot */}
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
                fill="rgba(255,255,255,0.96)"
                stroke={`${grp.color}55`} strokeWidth={0.8}
                style={{ filter:'drop-shadow(0 2px 5px rgba(0,0,0,0.09))' }} />
              <text x={tx + tw / 2} y={ty + 13.5}
                textAnchor="middle" fontSize={8.5} fontWeight="700" fill={INK}
                style={{ fontFamily:'system-ui' }}>
                {lbl}
              </text>
            </g>
          )
        })()}
      </svg>

    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
// ── Wisdom ID Mini-Card ───────────────────────────────────────────────────────
function WisdomIdCard({ id, onClose }: { id: TeacherId; onClose: () => void }) {
  const t = TEACHERS[id]
  const w = TEACHER_WISDOM[id]
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center px-5"
      style={{ background: 'rgba(0,0,0,0.10)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}>
      <motion.div
        className="w-72 rounded-2xl p-6 relative"
        style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}
        initial={{ opacity: 0, scale: 0.93, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93 }}
        transition={{ duration: 0.22, ease: EASE }}
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose}
          className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center text-xs hover:opacity-60"
          style={{ background: 'rgba(0,0,0,0.05)', color: MUTED }}>×</button>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-black text-white flex-shrink-0"
            style={{ background: t.color }}>
            {t.initials}
          </div>
          <div>
            <p className="text-[9px] tracking-[0.22em] uppercase font-semibold mb-0.5" style={{ color: SUBTLE }}>Wisdom ID</p>
            <p className="text-[14px] font-black leading-tight" style={{ fontFamily: 'var(--font-playfair)', color: INK }}>{t.name}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Teaching', value: w.years + ' Yrs' },
            { label: 'Logic Assets', value: String(w.assets) },
            { label: 'Global Active', value: w.activeNodes.toLocaleString() },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-2.5 text-center"
              style={{ background: `${GOLD}09`, border: `1px solid ${GOLD}20` }}>
              <p className="text-[13px] font-black" style={{ color: INK }}>{s.value}</p>
              <p className="text-[8px] uppercase tracking-wide mt-0.5" style={{ color: SUBTLE }}>{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function ParentPage() {
  const { state, activateProtocol, claimSeed } = useSparkle()
  const [modalOpen, setModalOpen] = useState(false)

  // ── Toast ──
  const [toast, setToast] = useState<string | null>(null)
  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  // ── Count-up display values (animate from 0 → target on activation) ──
  const [dispCompute,  setDispCompute]  = useState(0)
  const [dispNetwork,  setDispNetwork]  = useState(0)
  const [dispFuel,     setDispFuel]     = useState(0)
  useEffect(() => {
    if (!state.isActivated) return
    const TARGETS = { compute: 94.2, network: 12.8, fuel: 85 }
    const STEPS = 36
    let step = 0
    const id = setInterval(() => {
      step++
      const ease = 1 - Math.pow(1 - Math.min(step / STEPS, 1), 3) // cubic ease-out
      setDispCompute(parseFloat((TARGETS.compute * ease).toFixed(1)))
      setDispNetwork(parseFloat((TARGETS.network * ease).toFixed(1)))
      setDispFuel(Math.round(TARGETS.fuel * ease))
      if (step >= STEPS) clearInterval(id)
    }, 25)
    return () => clearInterval(id)
  }, [state.isActivated])

  // Live minted counter — only ticks after activation
  const [minted, setMinted] = useState(12.4286)
  const [mintFlicker, setMintFlicker] = useState(false)
  const mintTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!state.isActivated) return   // ticker only starts after Top Up
    const id = setInterval(() => {
      const delta = 0.0001 + Math.random() * 0.0002
      setMinted(v => parseFloat((v + delta).toFixed(4)))
      setMintFlicker(true)
      if (mintTimer.current) clearTimeout(mintTimer.current)
      mintTimer.current = setTimeout(() => setMintFlicker(false), 380)
    }, 1000)
    return () => { clearInterval(id); if (mintTimer.current) clearTimeout(mintTimer.current) }
  }, [state.isActivated])

  const SPENT      = 3.1400
  // Use context balance after activation so Nav and card stay in sync
  const balance    = state.isActivated
    ? state.protocolBalance
    : 0
  const balDisplay = balance.toFixed(4)
  const spentPct   = state.isActivated ? (SPENT / minted * 100).toFixed(1) : '0.0'
  const balPct     = state.isActivated ? (balance / minted * 100).toFixed(1) : '0.0'

  // Reactive logic dimension filter
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Height-lock: left radar col → right list scroll container
  const leftColRef     = useRef<HTMLDivElement>(null)
  const listHeaderRef  = useRef<HTMLDivElement>(null)
  const listScrollRef  = useRef<HTMLDivElement>(null)
  const [listMaxH, setListMaxH] = useState(480)

  useEffect(() => {
    const leftEl   = leftColRef.current
    if (!leftEl) return
    const update = () => {
      const leftH = leftEl.getBoundingClientRect().height
      const hdrH  = listHeaderRef.current?.getBoundingClientRect().height ?? 68
      // 52px = right col py-5 top (20) + bottom (20) + mb-3 gap (12)
      setListMaxH(Math.max(320, leftH - hdrH - 52))
    }
    const obs = new ResizeObserver(update)
    obs.observe(leftEl)
    update()
    return () => obs.disconnect()
  }, [])

  // Scroll list to top when category changes
  useEffect(() => {
    if (listScrollRef.current) listScrollRef.current.scrollTop = 0
  }, [selectedCategory])

  // Log row hover state
  const [hoveredLog, setHoveredLog] = useState<number | null>(null)

  // ACT 03 — Claim Seed & Wisdom ID
  const [claimedSeeds, setClaimedSeeds] = useState<Set<number>>(new Set())
  const [wisdomId, setWisdomId] = useState<TeacherId | null>(null)

  return (
    <div className="min-h-screen" style={{ background: '#FFFFFF' }}>
      {/* ── Amber halo — Parent portal colour anchor ── */}
      <div aria-hidden style={{ position:'fixed', top:'-18%', right:'-10%', width:'72vw', height:'72vw', maxWidth:960, maxHeight:960, background:'radial-gradient(circle, #F59E0B 0%, transparent 70%)', opacity:0.08, filter:'blur(120px)', pointerEvents:'none', zIndex:0 }} />
      <div aria-hidden style={{ position:'fixed', bottom:'-12%', left:'-8%', width:'40vw', height:'40vw', maxWidth:600, maxHeight:600, background:'radial-gradient(circle, #F59E0B 0%, transparent 70%)', opacity:0.04, filter:'blur(100px)', pointerEvents:'none', zIndex:0 }} />

      <Nav />

      <style>{`
        .no-scroll::-webkit-scrollbar { display: none }
        .no-scroll { -ms-overflow-style: none; scrollbar-width: none }
      `}</style>

      <AnimatePresence>
        {modalOpen && <EconomicModal onClose={() => setModalOpen(false)} />}
        {wisdomId && <WisdomIdCard id={wisdomId} onClose={() => setWisdomId(null)} />}
        {toast && (
          <motion.div key="toast"
            initial={{ opacity: 0, y: 24, x: '-50%', scale: 0.88 }}
            animate={{ opacity: 1, y: 0,  x: '-50%', scale: 1.1  }}
            exit={{ opacity: 0, y: 16, x: '-50%', scale: 0.9 }}
            transition={{ duration: 0.32, ease: [0.22,1,0.36,1] }}
            style={{
              position: 'fixed', bottom: 36, left: '50%',
              zIndex: 99999,
              background: '#F59E0B',
              color: '#FFFFFF',
              fontSize: 14, fontWeight: 700,
              padding: '13px 26px',
              borderRadius: 14,
              boxShadow: '0 12px 48px rgba(245,158,11,0.38)',
              whiteSpace: 'nowrap',
              letterSpacing: '0.01em',
            }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main container ─────────────────────────────────────────────────── */}
      <main className="max-w-[1440px] mx-auto px-[12%] pt-28 pb-24" style={{ position:'relative', zIndex:1 }}>

        {/* ── Page header ── */}
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.52, ease: EASE }} className="mb-10">
          <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: GOLD, marginBottom: 0, fontFamily: 'var(--font-geist-sans), system-ui, sans-serif' }}>
            Compute into tuition.
          </p>
          <h1 style={{ fontSize: 40, fontWeight: 700, color: '#000000', lineHeight: 1.1, letterSpacing: '-0.02em', marginTop: 16 }}>
            Cyra's Learning Engine
          </h1>
        </motion.div>

        {/* ── Section 1: Asset Bento Row ────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48, delay: 0.07 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-5">

          {/* Compute / CPU */}
          <div className="px-6 py-5">
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-1" style={{ color: SUBTLE }}>
              CPU · Compute
            </p>
            <div className="flex items-baseline gap-1.5">
              <motion.span className="text-[26px] font-black leading-none" style={{ color: INK }}
                animate={{ opacity: state.isActivated ? 1 : 0.35 }}>
                {state.isActivated ? dispCompute : 0}
              </motion.span>
              <span className="text-[12px] font-semibold" style={{ color: MUTED }}>GFLOPS</span>
            </div>
            <p className="text-[10px] mt-0.5 mb-1" style={{ color: SUBTLE }}>
              {state.isActivated ? 'Live hashrate · 320W' : 'Idle — awaiting fuel'}
            </p>
            <Waveform />
          </div>

          {/* Minted — with (i) */}
          <div className="px-6 py-5 relative">
            <div className="flex items-start justify-between mb-1">
              <p className="text-[10px] font-semibold tracking-[0.18em] uppercase" style={{ color: SUBTLE }}>
                Minted
              </p>
              <button onClick={() => setModalOpen(true)}
                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold hover:opacity-65 transition-opacity"
                style={{ background: `${GOLD}14`, color: GOLD, border: `1px solid ${GOLD}38`, marginTop: -2 }}
                aria-label="Minting economic specs">
                i
              </button>
            </div>
            <motion.div className="text-[26px] font-black leading-none" style={{ color: INK }}
              animate={mintFlicker
                ? { textShadow: [`0 0 0px ${GOLD}00`, `0 0 12px ${GOLD}70`, `0 0 0px ${GOLD}00`] }
                : { textShadow: `0 0 0px ${GOLD}00` }}
              transition={{ duration: 0.36 }}>
              {state.isActivated ? minted.toFixed(1) : '0.0'}{' '}
              <span style={{ fontSize: 12, fontWeight: 500 }}>$SPK</span>
            </motion.div>
            <p className="text-[10px] mt-1" style={{ color: SUBTLE }}>
              {state.isActivated ? 'live · ticking' : 'inactive'}
            </p>
            {/* Live mining dot */}
            <div className="flex items-center gap-1.5 mt-2">
              <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD }}
                animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }} />
              <span className="text-[9px] font-medium" style={{ color: GOLD }}>Live Mining</span>
            </div>
          </div>

          {/* Network */}
          <div className="px-6 py-5">
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-1" style={{ color: SUBTLE }}>
              Network
            </p>
            <div className="flex items-baseline gap-1.5">
              <motion.span className="text-[26px] font-black leading-none" style={{ color: INK }}
                animate={{ opacity: state.isActivated ? 1 : 0.35 }}>
                {state.isActivated ? dispNetwork : 0}
              </motion.span>
              <span className="text-[12px] font-semibold" style={{ color: MUTED }}>ms</span>
            </div>
            <p className="text-[10px] mt-0.5" style={{ color: SUBTLE }}>
              {state.isActivated ? 'Peer latency · P2P mesh' : 'Idle — awaiting fuel'}
            </p>
          </div>

          {/* Balance — amber accent */}
          <div className="px-6 py-5 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: `radial-gradient(ellipse at 85% 0%, ${GOLD}08 0%, transparent 60%)` }} />
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-1 relative z-10" style={{ color: GOLD }}>
              Balance
            </p>
            <div className="text-[26px] font-black leading-none relative z-10" style={{ color: INK }}>
              {balDisplay}
            </div>
            <p className="text-[10px] mt-1 mb-3 relative z-10" style={{ color: SUBTLE }}>SPRK available</p>
            <div className="h-[3px] rounded-full overflow-hidden relative z-10" style={{ background: 'rgba(0,0,0,0.07)' }}>
              <motion.div className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${GOLD}, #FCD34D)` }}
                initial={{ width: '0%' }}
                animate={{ width: `${balPct}%` }}
                transition={{ duration: 1.1, ease: EASE }} />
            </div>
            <p className="text-[9px] mt-1.5 relative z-10" style={{ color: SUBTLE }}>{balPct}% balance ratio</p>
            {/* Yield Harvested */}
            <div className="flex items-center justify-between mt-3 relative z-10"
              style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 10 }}>
              <p className="text-[9px] uppercase tracking-wide font-semibold" style={{ color: SUBTLE }}>Yield Harvested</p>
              <p className="text-[12px] font-black" style={{ color: GOLD }}>+0.84 SPRK</p>
            </div>
            {/* TOP UP FUEL */}
            <button
              onClick={() => {
                if (!state.isActivated) {
                  activateProtocol()
                  showToast('⚡ Protocol activated — 12.4 SPRK fuelled')
                }
              }}
              className="w-full mt-2.5 py-1.5 rounded-xl text-[10px] font-semibold tracking-[0.08em] uppercase relative z-10 transition-all"
              style={{
                border: `1.5px solid ${state.isActivated ? '#10B981' : '#DC321E'}`,
                color:  state.isActivated ? '#10B981' : '#DC321E',
                background: state.isActivated ? 'rgba(16,185,129,0.06)' : 'transparent',
                cursor: state.isActivated ? 'default' : 'pointer',
              }}>
              {state.isActivated ? '✓ Fuel Active' : '+ Top Up Fuel'}
            </button>
          </div>
        </motion.div>

        {/* ── Section 2: Pulse Ribbon ────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.16, duration: 0.45 }} className="mb-12">
          <PulseBar />
        </motion.div>

        {/* ── Frame divider 1 ── */}
        <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', marginBottom: '3rem' }} />


        {/* ── Section 3: Insight Row — 2-col grid ───────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.48 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

          {/* ── LEFT: CHC Cognitive Matrix ── */}
          <div ref={leftColRef} className="px-6 py-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-0.5" style={{ color: SUBTLE }}>
                  Cognitive Matrix
                </p>
                <h2 className="text-[15px] font-black" style={{ fontFamily: 'var(--font-playfair)', color: INK }}>
                  CHC Potential Map
                </h2>
              </div>
            </div>
            <CHCRadar selectedCategory={selectedCategory} onDimClick={setSelectedCategory} />
          </div>

          {/* ── RIGHT: Reactive Logic Paths ── */}
          <div className="px-6 py-5 flex flex-col">

            {/* Header — shrinks to content, measured for height-lock math */}
            <div ref={listHeaderRef} className="mb-3 flex-shrink-0">
              <p className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-0.5" style={{ color: SUBTLE }}>
                AI Matched
              </p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-[15px] font-black" style={{ fontFamily: 'var(--font-playfair)', color: INK }}>
                  {selectedCategory ? `${selectedCategory} Logic Paths` : 'Optimal Logic Paths'}
                </h2>
                {selectedCategory && (
                  <button onClick={() => setSelectedCategory(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                      fontSize: 10, fontWeight: 600, color: MUTED, lineHeight: 1, letterSpacing: 0 }}>
                    ↺ reset
                  </button>
                )}
              </div>
              <p className="text-[10px] mt-0.5" style={{ color: SUBTLE }}>
                {selectedCategory
                  ? `${EXPERT_LOGIC_POOL.filter(p => p.category === selectedCategory).length} experts · scroll to explore`
                  : 'Click a radar point to filter'}
              </p>
            </div>

            {/* Scroll wrapper — height-locked to left col, fade at bottom */}
            <div className="relative flex-shrink-0">
              {/* Scrollable list */}
              <div
                ref={listScrollRef}
                className="no-scroll"
                style={{
                  maxHeight: listMaxH,
                  overflowY: 'scroll',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                } as React.CSSProperties}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedCategory || 'all'}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}>
                    {(selectedCategory
                      ? EXPERT_LOGIC_POOL.filter(p => p.category === selectedCategory)
                      : EXPERT_LOGIC_POOL.slice(0, 5)
                    ).map((item, i, arr) => (
                      <div key={`${item.category}-${item.name}`}
                        className="flex items-center gap-3"
                        style={{
                          height: 64,
                          borderBottom: i < arr.length - 1 ? '1px solid #F3F4F6' : 'none',
                          flexShrink: 0,
                        }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-black text-white flex-shrink-0"
                          style={{ background: item.color }}>
                          {item.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11.5px] font-bold leading-tight truncate" style={{ color: INK }}>{item.unit}</p>
                          <p className="text-[9.5px] mt-0.5 truncate" style={{ color: SUBTLE }}>
                            {item.name}
                            <span style={{ color: '#E5E7EB', margin: '0 3px' }}>·</span>
                            {item.skill}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[14px] font-black leading-none" style={{ color: GOLD }}>{item.match}%</p>
                          <p className="text-[8px] mt-0.5" style={{ color: SUBTLE }}>match</p>
                        </div>
                      </div>
                    ))}
                    {selectedCategory && EXPERT_LOGIC_POOL.filter(p => p.category === selectedCategory).length === 0 && (
                      <div className="flex items-center justify-center" style={{ height: 62 }}>
                        <motion.p className="text-[11px]" style={{ color: SUBTLE }}
                          animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>
                          AI is synthesizing more paths…
                        </motion.p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Fade-out gradient — soft "more below" cue */}
              <div aria-hidden style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 64,
                background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 40%, rgba(255,255,255,0.96) 100%)',
                pointerEvents: 'none',
              }} />
            </div>
          </div>
        </motion.div>


        {/* ── Frame divider 2 ── */}
        <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', marginBottom: '3rem' }} />

        {/* ── Section 4: Cognitive Deep Log — full width ────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.46 }}>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-0.5" style={{ color: SUBTLE }}>
                Learning Record
              </p>
              <h2 className="text-[15px] font-black" style={{ fontFamily: 'var(--font-playfair)', color: INK }}>
                Cognitive Deep Log
              </h2>
            </div>
            <p className="text-[11px]" style={{ color: SUBTLE }}>
              {BLOOM_FEED.length} sessions · Bloom depth-coded
            </p>
          </div>

          {/* Log rows — fixed height scrollable */}
          <div className="no-scroll" style={{ maxHeight: 400, overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}>
            {BLOOM_FEED.map((item, i) => {
              const bm = bloomMeta(item.level)
              const teacher = TEACHERS[item.teacher]
              const isHovered = hoveredLog === item.id
              return (
                <motion.div key={item.id}
                  className="flex items-center gap-5 px-6 py-3.5 cursor-default transition-colors duration-150"
                  style={{
                    borderBottom: i < BLOOM_FEED.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                    background: isHovered ? 'rgba(0,0,0,0.022)' : '#FFFFFF',
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.38, ease: EASE }}
                  onMouseEnter={() => setHoveredLog(item.id)}
                  onMouseLeave={() => setHoveredLog(null)}>

                  {/* Bloom badge */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg flex flex-col items-center justify-center"
                    style={{ background: `${bm.color}0E`, border: `1px solid ${bm.color}22` }}>
                    <span className="text-[8px] font-black leading-none" style={{ color: bm.color }}>L{item.level}</span>
                  </div>

                  {/* Topic + depth */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-semibold truncate" style={{ color: INK }}>
                        {item.topic}
                      </span>
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: `${bm.color}0E`, color: bm.color }}>
                        {bm.name}
                      </span>
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: '#10B98112', color: '#10B981' }}>
                        {item.yield} Growth
                      </span>
                    </div>
                    <p className="text-[10px] mt-0.5" style={{ color: SUBTLE }}>
                      {item.mins} min session
                    </p>
                  </div>

                  {/* Claim Seed button */}
                  <div className="flex-shrink-0">
                    {claimedSeeds.has(item.id) ? (
                      <div className="text-center">
                        <span className="text-[10px] font-semibold px-2 py-1 rounded-lg"
                          style={{ background: `${GOLD}14`, color: GOLD }}>
                          💎 Claimed
                        </span>
                        <p className="text-[8px] mt-1 font-mono" style={{ color: '#10B981' }}>
                          Yield: +12%
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          if (!state.isActivated) {
                            showToast('⚠️ Top Up Fuel first to enable claims')
                            return
                          }
                          const ok = claimSeed(2.0)
                          if (ok) {
                            setClaimedSeeds(prev => new Set([...prev, item.id]))
                            showToast('🌱 Claim Successful — 2.0 SPRK deducted')
                          } else {
                            showToast('⚠️ Insufficient balance for this claim')
                          }
                        }}
                        className="text-[10px] font-semibold px-2 py-1 rounded-lg transition-all hover:opacity-75"
                        style={{ border: '1px solid rgba(0,0,0,0.12)', color: MUTED, background: 'transparent', cursor: 'pointer' }}>
                        🌱 Claim Seed
                      </button>
                    )}
                  </div>

                  {/* Teacher DNA — right, compact */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-[10px] font-medium leading-tight" style={{ color: MUTED }}>
                        {teacher.name}
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#10B981' }} />
                        <span className="text-[9px] font-semibold" style={{ color: '#10B981' }}>
                          Logic Verified
                        </span>
                      </div>
                    </div>
                    {/* Clickable avatar → Wisdom ID */}
                    <button
                      onClick={() => setWisdomId(item.teacher)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black text-white flex-shrink-0 hover:scale-110 transition-transform"
                      style={{ background: teacher.color, cursor: 'pointer', border: 'none' }}
                      title={`View ${teacher.name} Wisdom ID`}>
                      {teacher.initials}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
