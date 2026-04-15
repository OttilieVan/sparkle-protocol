'use client'

import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ComposableMap, Geographies, Geography, Marker, useMapContext } from 'react-simple-maps'
import Nav from '@/components/Nav'
import { useSparkle, EXPERT_THEME } from '@/app/providers'

// ── Palette ────────────────────────────────────────────────────────────────────
const GREEN   = '#10B981'   // Brand canonical — matches Landing Page Frame 4
const CRIMSON = '#E11D48'
const AMBER   = '#F59E0B'
const INK     = '#111827'
const BODY    = '#374151'
const MUTED   = '#6B7280'
const SUBTLE  = '#9CA3AF'
const BORDER  = '#F3F4F6'

// ── Asset Metric Data ──────────────────────────────────────────────────────────
const ASSET_METRICS = [
  { label:'Encoded DNA',       value:'12 / 24',  sub:'logic units active',   icon:'\uD83E\uDDEC', curve:false },
  { label:'Total Royalties',   value:'1,875.2',  sub:'SPRK earned lifetime', icon:'\uD83D\uDC8E', curve:true  },
  { label:'Students Reached',  value:'539',      sub:'unique learners',       icon:'\uD83C\uDF10', curve:false },
  { label:'Total Invocations', value:'6,845',    sub:'asset sessions',        icon:'\u26A1',       curve:false },
]

// ── Nine Behavioral Measurement Indicators (Scaffolding Theory) ───────────────
const MEASUREMENT_GROUPS = [
  {
    cluster: 'Contingency',
    subtitle: 'Dynamic Adaptivity',
    color: GREEN,
    indicators: [
      {
        name: 'ZPD Deviation Rate',
        value: 12, unit: '%', trend: -2.1, good: 'low' as const,
        max: 40, platformAvg: 18,
        definition: 'Percentage of instructional moments operating outside the student\'s Zone of Proximal Development (Vygotsky, 1978). A lower rate indicates tighter calibration to the learner\'s current capability boundary.',
      },
      {
        name: 'Feedback Latency',
        value: 1.8, unit: 's', trend: -0.4, good: 'low' as const,
        max: 8, platformAvg: 2.8,
        definition: 'Mean elapsed time between a student response and corrective or affirming educator feedback. Shorter latency correlates with higher contingency and sustained engagement (Wood et al., 1976).',
      },
      {
        name: 'Interaction Cycles',
        value: 8.4, unit: '/session', trend: +1.2, good: 'high' as const,
        max: 15, platformAvg: 6.1,
        definition: 'Average number of complete initiation–response–feedback (IRF) cycles per instructional session. Higher density signals active Socratic scaffolding rather than passive transmission.',
      },
    ],
  },
  {
    cluster: 'Fading',
    subtitle: 'Gradual Release Efficacy',
    color: '#6366F1',
    indicators: [
      {
        name: 'Support Decay Rate',
        value: 68, unit: '%', trend: +5.3, good: 'high' as const,
        max: 100, platformAvg: 52,
        definition: 'Proportion of scaffolding cues systematically withdrawn as learner competence increases across a unit sequence. Higher decay signals healthy gradual-release in accordance with Bruner\'s fading principle.',
      },
      {
        name: 'Prompt Level Drop',
        value: 2.3, unit: 'levels', trend: +0.7, good: 'high' as const,
        max: 5, platformAvg: 1.6,
        definition: 'Mean downward shift in prompt hierarchy (from explicit modeling → guided practice → independent performance) over a learning arc. Larger drops indicate successful scaffolding removal.',
      },
    ],
  },
  {
    cluster: 'Transfer',
    subtitle: 'Responsibility Handover',
    color: AMBER,
    indicators: [
      {
        name: 'Success Rate Lift',
        value: 34, unit: '%', trend: +4.8, good: 'high' as const,
        max: 60, platformAvg: 22,
        definition: 'Percentage-point increase in independent problem-solving accuracy from pre- to post-scaffolded instruction. Directly measures near-transfer effectiveness (Perkins & Salomon, 1992).',
      },
      {
        name: 'Explanatory Output Ratio',
        value: 0.61, unit: 'ratio', trend: +0.08, good: 'high' as const,
        max: 1, platformAvg: 0.44,
        definition: 'Ratio of student-generated explanations to total conversational turns. Higher ratios indicate learners have internalized reasoning structures and can verbalize procedural knowledge independently.',
      },
      {
        name: 'Metacognitive Activation',
        value: 74, unit: '%', trend: +6.1, good: 'high' as const,
        max: 100, platformAvg: 57,
        definition: 'Frequency at which students demonstrate self-monitoring or self-regulation behaviors (e.g., self-correction, error detection, strategy switching) during independent practice phases.',
      },
    ],
  },
]

// ── Logic Asset Portfolio ─────────────────────────────────────────────────────
// scores[gi][ii] maps to MEASUREMENT_GROUPS[gi].indicators[ii]
const LOGIC_ASSETS = [
  { id: 1,  name: 'Dynamic Segment Analysis',   subject: 'Mathematics',   tier: 'Master'   as const, inv: 2103, sparkline: [18,28,36,48,55,63,72,80,88,94], scores: [[9,1.4,10.2],[78,2.8],[42,0.72,84]] },
  { id: 2,  name: 'Relative Motion Logic',      subject: 'Physics',       tier: 'Master'   as const, inv: 1651, sparkline: [12,20,30,42,52,60,68,76,84,90], scores: [[11,1.6,9.6],[72,2.5],[38,0.68,79]] },
  { id: 3,  name: 'Euclidean Intuition Bridge', subject: 'Geometry',      tier: 'Advanced' as const, inv: 1247, sparkline: [10,16,24,32,42,50,58,65,72,77], scores: [[14,2.1,8.0],[64,2.1],[31,0.58,70]] },
  { id: 4,  name: 'Work-Rate Logic',            subject: 'Mathematics',   tier: 'Advanced' as const, inv: 892,  sparkline: [8,13,19,26,34,42,50,57,62,68],  scores: [[16,2.4,7.3],[58,1.9],[26,0.52,64]] },
  { id: 5,  name: 'Ratio Partitioning',         subject: 'Mathematics',   tier: 'Foundation' as const, inv: 534, sparkline: [6,10,14,20,26,31,36,40,44,48], scores: [[20,3.0,6.2],[48,1.5],[19,0.42,54]] },
  { id: 6,  name: 'Fraction Intuition Bridge',  subject: 'Mathematics',   tier: 'Foundation' as const, inv: 418, sparkline: [5,8,11,15,20,25,29,33,37,42],  scores: [[22,3.2,5.8],[44,1.3],[15,0.38,49]] },
  { id: 7,  name: 'Probability Trees',          subject: 'Mathematics',   tier: 'Master'   as const, inv: 1384, sparkline: [14,22,31,40,50,59,67,75,81,88], scores: [[10,1.5,9.8],[75,2.7],[40,0.70,82]] },
  { id: 8,  name: 'Momentum Conservation',      subject: 'Physics',       tier: 'Master'   as const, inv: 987,  sparkline: [11,18,27,38,47,56,64,71,78,84], scores: [[12,1.7,9.2],[70,2.4],[36,0.66,77]] },
  { id: 9,  name: 'Chemical Equation Balance',  subject: 'Chemistry',     tier: 'Advanced' as const, inv: 783,  sparkline: [9,15,22,30,39,47,54,61,67,72],  scores: [[15,2.2,7.8],[62,2.0],[29,0.56,68]] },
  { id: 10, name: 'Proof by Induction',         subject: 'Mathematics',   tier: 'Master'   as const, inv: 1142, sparkline: [16,25,34,44,53,62,70,77,83,89], scores: [[10,1.5,10.1],[76,2.8],[41,0.71,83]] },
  { id: 11, name: 'Light Refraction Intuition', subject: 'Physics',       tier: 'Advanced' as const, inv: 621,  sparkline: [7,12,18,25,33,40,47,53,58,64],  scores: [[16,2.3,7.5],[60,1.9],[27,0.54,66]] },
  { id: 12, name: 'Area Under Curve',           subject: 'Mathematics',   tier: 'Advanced' as const, inv: 562,  sparkline: [6,11,17,23,30,37,43,49,54,59],  scores: [[17,2.4,7.2],[57,1.8],[25,0.51,63]] },
  { id: 13, name: 'Historical Causality',       subject: 'Social Science',tier: 'Advanced' as const, inv: 294,  sparkline: [4,7,11,16,21,26,31,35,39,43],   scores: [[18,2.6,6.8],[54,1.7],[22,0.47,59]] },
  { id: 14, name: 'Force Diagrams',             subject: 'Physics',       tier: 'Foundation' as const, inv: 445,  sparkline: [5,9,13,18,23,28,32,36,40,45],  scores: [[21,3.1,6.0],[46,1.4],[17,0.40,52]] },
  { id: 15, name: 'Number Theory Bridge',      subject: 'Mathematics',   tier: 'Master'     as const, inv: 1876, sparkline: [15,23,33,44,54,62,71,79,86,92], scores: [[10,1.5,10.0],[77,2.9],[42,0.71,83]] },
  { id: 16, name: 'Linear Algebra Visual',     subject: 'Mathematics',   tier: 'Advanced'   as const, inv: 1038, sparkline: [11,18,26,35,44,53,60,68,74,80], scores: [[13,2.0,8.3],[66,2.2],[32,0.60,72]] },
]

// ── Logic Playground source / dialogue ────────────────────────────────────────
const SOURCE_TEXT = `[Teaching Transcript — Expert-ZSF1220 · Session #247]
[Topic: Meeting-Separating Problem · Segment Diagram]

ZSF1220: "Let's draw a line segment first.
        What does this line represent?"
Student: "The distance between City A and City B?"
ZSF1220: "Correct. Now both cars depart at 8:00 AM,
        traveling toward each other.
        At 8 o'clock — where is Car A? Car B?"
Student: "Car A is at the left end, Car B at the right."
ZSF1220: "Good. I'll mark them. At 10:00 AM — two
        hours have passed. What happens on the diagram?"
Student: "They've moved closer?"
ZSF1220: "By how much? We don't know speeds yet.
        But the problem says the gap is 112.5 km.
        Can you draw that on the line?"
Student: "[draws segment] — like this?"
ZSF1220: "Perfect. Now here's the key question:
        At 1:00 PM, the gap is still 112.5 km.
        What does THAT tell us?"
Student: "...they passed each other and separated?"
ZSF1220: "Exactly. Symmetry. The segment diagram now
        shows a mirror image. Do you see it?"`

type DMsg = { role: 'mentor' | 'student' | 'system'; text: string }
const SOCRATIC_DIALOG: DMsg[] = [
  { role:'system',  text:'Source material ingested. Analyzing Expert-ZSF1220\'s pedagogical fingerprint...' },
  { role:'system',  text:'Detected: Visual anchoring \u2192 Segment construction \u2192 Socratic probing \u2192 Symmetry revelation' },
  { role:'mentor',  text:'Reconstructing Socratic scaffold for global deployment...' },
  { role:'student', text:'[Query] Why does the gap stay the same at 10 AM and 1 PM?' },
  { role:'mentor',  text:'Before I answer \u2014 draw what you see at both timestamps. What does the diagram show you?' },
  { role:'student', text:'They\'re on opposite sides of the midpoint now...' },
  { role:'mentor',  text:'Precisely. Symmetry here is structural, not coincidental. Meeting and separating are mirror events when velocity is constant. The segment diagram makes this visible in a way equations alone cannot.' },
]

// ── World Map ─────────────────────────────────────────────────────────────────
// viewBox 0 0 800 400  |  x=(lon+180)/360*800  y=(90-lat)/180*400
// High-fidelity paths using Q bezier curves for smooth coastlines
const HQ_LAND_PATHS: string[] = [
  // ── North America ──────────────────────────────────────────────────────────
  `M 27,80 Q 30,70 33,58 Q 40,52 51,42 Q 75,40 100,40
   Q 155,34 222,18 Q 244,18 256,24 Q 264,46 278,71 Q 281,84 282,96
   Q 271,99 264,100 Q 250,104 244,107 Q 237,109 231,122
   Q 224,126 218,133 Q 220,138 218,144
   Q 214,141 207,133 Q 202,134 200,136 Q 190,136 184,138
   Q 183,145 184,151 Q 186,156 187,158 Q 198,158 207,153
   Q 204,162 204,167 Q 208,172 213,175 Q 219,180 227,182
   Q 225,183 213,178 Q 209,173 200,171 Q 196,167 187,164
   Q 176,162 167,155 Q 164,149 156,149 Q 148,145 142,136
   Q 140,128 138,124 Q 130,117 129,116 Q 125,108 125,102
   Q 125,96 125,91 Q 111,80 98,73 Q 100,69 100,69
   Q 82,70 67,71 Q 55,73 44,76 Q 36,78 27,80 Z`,
  // ── Greenland ──────────────────────────────────────────────────────────────
  `M 256,24 Q 272,14 305,14 Q 336,14 355,22 Q 366,32 362,44
   Q 356,58 338,65 Q 318,68 298,62 Q 278,56 268,42 Q 258,30 256,24 Z`,
  // ── South America ──────────────────────────────────────────────────────────
  `M 229,182 Q 242,178 255,176 Q 264,176 278,191
   Q 302,202 322,211 Q 322,220 314,229 Q 308,242 306,251
   Q 299,253 284,271 Q 273,276 271,276 Q 262,284 255,302
   Q 249,316 251,324 Q 240,320 237,308 Q 233,290 238,278
   Q 242,266 244,254 Q 240,236 229,225 Q 222,206 222,200
   Q 224,193 229,191 Q 229,187 229,182 Z`,
  // ── Europe (Iberian + France + Central) ────────────────────────────────────
  `M 398,130 Q 410,120 424,120 Q 440,120 452,128
   Q 462,136 458,148 Q 452,160 438,164 Q 422,166 410,158
   Q 396,149 397,138 Q 396,133 398,130 Z`,
  // ── Scandinavia ────────────────────────────────────────────────────────────
  `M 448,84 Q 462,76 476,74 Q 492,72 504,82 Q 516,92 516,106
   Q 515,120 506,130 Q 496,140 482,142 Q 468,143 458,133
   Q 448,122 449,106 Q 449,95 448,84 Z`,
  // ── British Isles ──────────────────────────────────────────────────────────
  `M 410,95 Q 420,87 430,89 Q 437,94 434,104 Q 428,112 418,112
   Q 408,110 406,102 Q 406,97 410,95 Z`,
  // ── Africa ─────────────────────────────────────────────────────────────────
  `M 393,102 Q 416,95 440,97 Q 466,99 490,108 Q 514,118 528,134
   Q 542,152 548,172 Q 554,194 556,216 Q 558,240 554,264
   Q 549,290 540,314 Q 528,338 511,356 Q 492,372 470,377
   Q 447,381 424,374 Q 400,366 382,346 Q 363,324 356,298
   Q 349,270 354,244 Q 360,218 372,196 Q 384,174 395,153
   Q 405,132 410,112 Q 410,106 404,102 Q 398,100 393,102 Z`,
  // ── Madagascar ─────────────────────────────────────────────────────────────
  `M 566,246 Q 574,240 582,244 Q 588,250 585,264
   Q 581,276 572,278 Q 562,278 558,267 Q 554,254 562,248 Q 564,247 566,246 Z`,
  // ── Russia + Central Asia + China (main body) ──────────────────────────────
  `M 393,102 Q 418,96 444,94 Q 474,90 508,87 Q 544,84 580,82
   Q 618,80 656,80 Q 694,80 732,79 Q 768,78 800,76
   Q 826,74 850,70 Q 872,66 894,68 Q 916,70 934,80
   Q 952,91 958,108 Q 962,126 950,140 Q 936,154 912,159
   Q 886,163 858,164 Q 830,164 802,169 Q 774,174 746,178
   Q 718,181 690,175 Q 663,169 636,160 Q 610,152 586,156
   Q 561,160 536,156 Q 510,152 484,140 Q 459,128 436,115
   Q 416,103 393,102 Z`,
  // ── Arabian Peninsula ──────────────────────────────────────────────────────
  `M 550,142 Q 564,137 579,142 Q 594,148 598,164
   Q 602,181 593,195 Q 582,207 566,208 Q 549,207 538,194
   Q 526,180 530,163 Q 534,148 550,142 Z`,
  // ── Indian Subcontinent ────────────────────────────────────────────────────
  `M 636,160 Q 654,154 670,162 Q 685,171 688,188
   Q 691,207 683,224 Q 673,240 658,245 Q 641,249 626,242
   Q 610,234 605,216 Q 600,196 607,178 Q 615,160 632,156
   Q 634,155 636,160 Z`,
  // ── SE Asia / Indochina ────────────────────────────────────────────────────
  `M 748,178 Q 765,172 780,178 Q 795,185 798,202
   Q 800,220 791,232 Q 780,242 764,242 Q 748,240 740,228
   Q 732,214 736,198 Q 741,184 748,178 Z`,
  // ── Japan (Honshu) ─────────────────────────────────────────────────────────
  `M 701,111 Q 714,104 726,109 Q 736,116 734,128
   Q 731,140 719,146 Q 706,150 697,143 Q 687,134 690,121
   Q 694,113 701,111 Z`,
  // ── Australia ──────────────────────────────────────────────────────────────
  `M 672,218 Q 696,208 724,208 Q 756,208 784,217
   Q 812,227 829,244 Q 844,262 845,283 Q 845,305 834,323
   Q 820,340 799,349 Q 775,356 749,354 Q 722,350 698,337
   Q 673,322 658,300 Q 643,276 644,252 Q 646,228 662,215
   Q 667,211 672,218 Z`,
  // ── New Zealand ────────────────────────────────────────────────────────────
  `M 744,287 Q 754,280 763,283 Q 769,290 765,301
   Q 759,310 749,309 Q 740,306 740,295 Q 741,290 744,287 Z`,
]

const TEACHER_NODE = { x:669, y:131, label:'Expert-ZSF1220 \u00b7 Shanghai' }
const STUDENT_NODES = [
  { x:236, y:110, label:'New York',   delay:0.0 },
  { x:400, y: 86, label:'London',     delay:0.3 },
  { x:710, y:121, label:'Tokyo',      delay:0.6 },
  { x:736, y:275, label:'Sydney',     delay:0.9 },
  { x:631, y:197, label:'Singapore',  delay:1.2 },
  { x:523, y:144, label:'Dubai',      delay:1.5 },
  { x:562, y:158, label:'Mumbai',     delay:0.4 },
  { x:682, y:116, label:'Seoul',      delay:0.7 },
  { x:224, y:103, label:'Toronto',    delay:1.0 },
  { x:441, y:275, label:'Cape Town',  delay:1.3 },
  { x:296, y:252, label:'S\u00e3o Paulo', delay:0.2 },
  { x:405, y: 91, label:'Paris',      delay:0.8 },
  { x:430, y: 83, label:'Berlin',     delay:1.1 },
  { x:538, y:105, label:'Almaty',     delay:0.5 },
]

// ── react-simple-maps data (real lon/lat coordinates) ────────────────────────
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
const MAP_TEACHER: [number, number] = [121.5, 31.2]   // Shanghai
const MAP_NODES: { name: string; coords: [number, number]; delay: number }[] = [
  { name:'New York',  coords:[-74.0,  40.7], delay:0.0 },
  { name:'London',    coords:[-0.1,   51.5], delay:0.3 },
  { name:'Tokyo',     coords:[139.7,  35.7], delay:0.6 },
  { name:'Sydney',    coords:[151.2, -33.9], delay:0.9 },
  { name:'Singapore', coords:[103.8,   1.3], delay:1.2 },
  { name:'Dubai',     coords:[ 55.3,  25.2], delay:1.5 },
  { name:'Mumbai',    coords:[ 72.8,  19.1], delay:0.4 },
  { name:'Seoul',     coords:[127.0,  37.6], delay:0.7 },
  { name:'Toronto',   coords:[-79.4,  43.7], delay:1.0 },
  { name:'Cape Town', coords:[ 18.4, -33.9], delay:1.3 },
  { name:'São Paulo', coords:[-46.6, -23.5], delay:0.2 },
  { name:'Paris',     coords:[  2.3,  48.9], delay:0.8 },
  { name:'Berlin',    coords:[ 13.4,  52.5], delay:1.1 },
  { name:'Almaty',    coords:[ 76.9,  43.3], delay:0.5 },
]

// ── Market Demand Gaps ────────────────────────────────────────────────────────
const DEMAND_GAPS = [
  { label:'Olympiad Logic',         subject:'Mathematics',    pct:94, hot:true  },
  { label:'Number Theory Bridge',   subject:'Mathematics',    pct:91, hot:true  },
  { label:'Advanced Set Theory',    subject:'Mathematics',    pct:89, hot:true  },
  { label:'Calculus Intuition Path',subject:'Mathematics',    pct:82, hot:false },
  { label:'Geometry Intuition',     subject:'Mathematics',    pct:87, hot:true  },
  { label:'Linear Algebra Visual',  subject:'Mathematics',    pct:85, hot:true  },
  { label:'Structural Logic',       subject:'Writing',        pct:79, hot:false },
  { label:'Probability Theory',     subject:'Mathematics',    pct:77, hot:false },
  { label:'Chemical Equilibrium',   subject:'Chemistry',      pct:72, hot:false },
  { label:'Essay Argumentation',    subject:'Writing',        pct:69, hot:false },
  { label:'Historical Causality',   subject:'Social Science', pct:68, hot:false },
  { label:'Newton Laws Applied',    subject:'Physics',        pct:66, hot:false },
  { label:'Proof Construction',     subject:'Mathematics',    pct:63, hot:false },
  { label:'Statistical Inference',  subject:'Mathematics',    pct:58, hot:false },
  { label:'Map Reading & GIS',      subject:'Geography',      pct:54, hot:false },
  { label:'Poetic Devices',         subject:'Literature',     pct:51, hot:false },
  { label:'Economic Systems',       subject:'Social Science', pct:47, hot:false },
]

// ── Per-Asset Student Testimonials (Frame 3 right column) ────────────────────
const ASSET_TESTIMONIALS: Record<number, { text: string; author: string; stars: number }[]> = {
  1: [
    { text: 'The segment diagram completely reframed how I approach every distance-time problem.', author: 'Student · Grade 6 · Toronto', stars: 5 },
    { text: 'My son went from 72 to 96 in competitions after mastering this single module.', author: 'Parent · Shanghai', stars: 5 },
    { text: 'Visual anchoring at its finest — the clearest scaffolding I\'ve encountered in a decade.', author: 'Educator · London', stars: 5 },
    { text: 'The symmetry insight at the end of the transcript is something no textbook ever surfaced for me.', author: 'Student · Grade 7 · Seoul', stars: 5 },
    { text: 'My daughter uses segment diagrams spontaneously now — it\'s become her default tool.', author: 'Parent · Tokyo', stars: 5 },
    { text: 'The Socratic progression from visual anchor to abstract equation is exactly right.', author: 'Tutor · Sydney', stars: 5 },
    { text: 'Competition preparation transformed entirely. The diagram method handles every variant.', author: 'Student · Grade 6 · Singapore', stars: 5 },
    { text: 'Three months of confusion resolved in a single session. Remarkable pedagogical design.', author: 'Parent · New York', stars: 5 },
  ],
  2: [
    { text: 'Relative motion finally clicked. The reference-frame analogy is genuinely ingenious.', author: 'Student · Grade 7 · Seoul', stars: 5 },
    { text: 'The Socratic probing sequence made the concept land in under 20 minutes.', author: 'Parent · Singapore', stars: 5 },
    { text: 'Best physics scaffolding I\'ve encountered in three years of review work.', author: 'Tutor · New York', stars: 5 },
    { text: 'My son used to guess at relative velocity. Now he builds the reference frame automatically.', author: 'Parent · Dubai', stars: 5 },
    { text: 'The train-and-river analogy cascades perfectly into the mathematical formulation.', author: 'Student · Grade 8 · Tokyo', stars: 5 },
    { text: 'Conceptual clarity without sacrificing mathematical rigor — genuinely rare.', author: 'Educator · Berlin', stars: 4 },
    { text: 'Our students\' momentum unit scores improved by an average of 18 points.', author: 'School · Shanghai', stars: 5 },
    { text: 'The stepping-stone approach from intuition to equation is flawless.', author: 'Tutor · London', stars: 5 },
  ],
  3: [
    { text: 'Intuition before formalism — this is how Euclidean geometry should always be taught.', author: 'Student · Grade 8 · Tokyo', stars: 5 },
    { text: 'Visual construction before proof. My daughter genuinely loves geometry now.', author: 'Parent · Berlin', stars: 5 },
    { text: 'The bridge from spatial intuition to rigorous proof is exceptionally designed.', author: 'Educator · Paris', stars: 4 },
    { text: 'The way the module delays formal notation until the intuition is solid is perfect pedagogy.', author: 'Tutor · Toronto', stars: 5 },
    { text: 'My son started constructing his own proofs after just two sessions. Unbelievable.', author: 'Parent · Seoul', stars: 5 },
    { text: 'The visual-construction-first approach removed the abstract fear students bring to geometry.', author: 'Educator · New York', stars: 5 },
    { text: 'Best Euclidean module I\'ve reviewed in five years of curriculum evaluation.', author: 'Curriculum Specialist · London', stars: 5 },
    { text: 'I finally understand WHY theorems are true, not just how to apply them.', author: 'Student · Grade 9 · Mumbai', stars: 5 },
  ],
  4: [
    { text: 'Work-rate problems finally make sense. The unit-time framework eliminated all guesswork.', author: 'Student · Grade 6 · Mumbai', stars: 5 },
    { text: 'Structured approach with perfect transfer to novel problem types my son hadn\'t seen before.', author: 'Parent · Dubai', stars: 5 },
    { text: 'Foundation tier executed with Master-level pedagogical depth.', author: 'Tutor · Almaty', stars: 4 },
    { text: 'The "one unit of time" anchoring technique is the missing piece every textbook skips.', author: 'Educator · Singapore', stars: 5 },
    { text: 'My student solved a competition problem independently using this exact framework.', author: 'Tutor · São Paulo', stars: 5 },
    { text: 'The inverse-rate visualization is something I\'d never seen presented this clearly before.', author: 'Student · Grade 7 · Seoul', stars: 5 },
    { text: 'Transfer to combined-work and efficiency problems was immediate and natural.', author: 'Parent · Sydney', stars: 5 },
    { text: 'My daughter has started teaching her classmates using this method. High praise.', author: 'Parent · Shanghai', stars: 5 },
  ],
  5: [
    { text: 'The ratio diagram method is the clearest partitioning model I\'ve ever encountered.', author: 'Student · Grade 5 · São Paulo', stars: 5 },
    { text: 'My child can now independently partition any ratio after just two sessions.', author: 'Parent · Cape Town', stars: 5 },
    { text: 'Foundation tier — but executed at a depth that challenges advanced students too.', author: 'Educator · Sydney', stars: 4 },
    { text: 'The bar-model connection to ratio notation is the conceptual bridge every young learner needs.', author: 'Tutor · Toronto', stars: 5 },
    { text: 'My son moved from concrete manipulation to abstract ratio in one session. Exceptional pacing.', author: 'Parent · London', stars: 5 },
    { text: 'Ratio Partitioning is the prerequisite module I wish I\'d had before teaching algebra.', author: 'Educator · Berlin', stars: 5 },
    { text: 'The "units of ratio" language is instantly intuitive and transfers perfectly to fractions.', author: 'Student · Grade 6 · Singapore', stars: 5 },
    { text: 'Competition preparation at Foundation level done correctly. Rare and valuable.', author: 'Tutor · Mumbai', stars: 5 },
  ],
  6: [
    { text: 'Fraction intuition before formal notation — this completely changed how I see fractions.', author: 'Student · Grade 4 · London', stars: 5 },
    { text: 'The visual bridge resolved years of fraction confusion in exactly two sessions.', author: 'Parent · Toronto', stars: 5 },
    { text: 'Exceptional conceptual sequencing — a model for early-stage numeracy instruction.', author: 'Educator · New York', stars: 5 },
    { text: 'The "fair share" anchor is exactly the right cognitive hook for young learners.', author: 'Tutor · Sydney', stars: 5 },
    { text: 'My daughter cried with relief when fractions finally made sense. Thank you.', author: 'Parent · Seoul', stars: 5 },
    { text: 'The transition from area models to symbolic notation is perfectly sequenced.', author: 'Educator · Paris', stars: 5 },
    { text: 'I\'ve used this with 40 students. 38 of them mastered equivalent fractions in one session.', author: 'Tutor · Shanghai', stars: 5 },
    { text: 'The "same whole" principle is explained here better than in any textbook I\'ve read.', author: 'Student · Grade 5 · Mumbai', stars: 5 },
  ],
  7: [
    { text: 'Probability trees demystified — the branch-by-branch approach is perfect.', author: 'Student · Grade 8 · Berlin', stars: 5 },
    { text: 'My son\'s exam score jumped from 61 to 89 after working through this module.', author: 'Parent · Tokyo', stars: 5 },
    { text: 'The conditional probability framing is introduced at exactly the right moment.', author: 'Educator · London', stars: 5 },
    { text: 'I\'ve never seen a cleaner path from sample space to tree diagram to formula.', author: 'Tutor · New York', stars: 5 },
    { text: 'The real-world anchoring (medical testing, weather) makes the abstract concrete instantly.', author: 'Student · Grade 9 · Singapore', stars: 5 },
    { text: 'Competition problems that once took 10 minutes now take 2. The tree method is that powerful.', author: 'Student · Grade 8 · Seoul', stars: 5 },
    { text: 'Exceptional bridge from counting principles to probability theory.', author: 'Educator · Sydney', stars: 4 },
    { text: 'The independent vs. dependent events distinction is the clearest I\'ve seen presented.', author: 'Tutor · Cape Town', stars: 5 },
  ],
  8: [
    { text: 'Momentum conservation finally makes physical sense, not just mathematical sense.', author: 'Student · Grade 9 · Seoul', stars: 5 },
    { text: 'The collision analogy series is brilliant — each example builds perfectly on the last.', author: 'Educator · Toronto', stars: 5 },
    { text: 'My student passed her physics olympiad section on momentum. Direct credit to this module.', author: 'Tutor · Shanghai', stars: 5 },
    { text: 'The "system boundary" concept is introduced so naturally I didn\'t even notice learning it.', author: 'Student · Grade 10 · Mumbai', stars: 5 },
    { text: 'The center-of-mass derivation is the most elegant I\'ve encountered in 8 years of teaching.', author: 'Educator · Berlin', stars: 5 },
    { text: 'My son started explaining momentum to ME after his second session. Remarkable.', author: 'Parent · Singapore', stars: 5 },
    { text: 'Vector momentum handled through systematic sign conventions — no confusion, no shortcuts.', author: 'Tutor · London', stars: 4 },
    { text: 'The explosion-vs-collision comparison is a pedagogical masterstroke.', author: 'Educator · Sydney', stars: 5 },
  ],
  9: [
    { text: 'Chemical balancing went from my worst skill to my strongest in two sessions.', author: 'Student · Grade 9 · Paris', stars: 5 },
    { text: 'The "atoms-in-atoms-out" principle is the intuitive anchor every chemistry student needs.', author: 'Educator · New York', stars: 5 },
    { text: 'My daughter finally stopped dreading chemistry homework. The visual approach is brilliant.', author: 'Parent · Seoul', stars: 5 },
    { text: 'The oxidation-state framework is introduced at exactly the right difficulty gradient.', author: 'Tutor · Toronto', stars: 5 },
    { text: 'Elegant progression from simple to complex equations. No cognitive overload.', author: 'Student · Grade 10 · Tokyo', stars: 4 },
    { text: 'The systematic inspection method removes all the trial-and-error students typically rely on.', author: 'Educator · Berlin', stars: 5 },
    { text: 'Our school\'s chemistry average improved 11 points after we introduced this module.', author: 'School · Singapore', stars: 5 },
    { text: 'The mole concept integration is handled with unusual care and precision.', author: 'Tutor · London', stars: 5 },
  ],
  10: [
    { text: 'Induction went from my most feared proof technique to my favorite. Genuinely.', author: 'Student · Grade 11 · London', stars: 5 },
    { text: 'The "domino" metaphor is perfect — my son understood the principle in five minutes.', author: 'Parent · Shanghai', stars: 5 },
    { text: 'The transition from base case to inductive step is scaffolded more carefully here than anywhere else.', author: 'Educator · New York', stars: 5 },
    { text: 'My olympiad student solved three induction problems independently after this module.', author: 'Tutor · Seoul', stars: 5 },
    { text: 'Strong induction and well-ordering introduced at just the right time in the sequence.', author: 'Student · Grade 12 · Berlin', stars: 4 },
    { text: 'The spiral structure — easy examples, then hard, then competition-grade — is exactly right.', author: 'Educator · Tokyo', stars: 5 },
    { text: 'The connection from induction to recursion is an insight I\'d never seen made explicit before.', author: 'Tutor · Singapore', stars: 5 },
    { text: 'Rigorously correct and pedagogically brilliant. An exceptional combination.', author: 'Educator · Paris', stars: 5 },
  ],
  11: [
    { text: 'Snell\'s law suddenly makes geometric sense. The ray-bending visualization is key.', author: 'Student · Grade 10 · Mumbai', stars: 5 },
    { text: 'My son stopped memorizing and started understanding optics. Huge shift.', author: 'Parent · Sydney', stars: 5 },
    { text: 'The Fermat\'s-principle-first approach is unusually sophisticated and rewarding.', author: 'Educator · London', stars: 4 },
    { text: 'The wavefront model makes the physics intuitive before the math is introduced.', author: 'Tutor · Seoul', stars: 5 },
    { text: 'Perfect module for students who struggle with the formula but understand the geometry.', author: 'Educator · Berlin', stars: 5 },
    { text: 'I scored 96 on my optics exam. This module was 80% of why.', author: 'Student · Grade 11 · Singapore', stars: 5 },
    { text: 'Critical angle and total internal reflection explained as a natural consequence — brilliant.', author: 'Tutor · New York', stars: 5 },
    { text: 'The real-world applications (fiber optics, rainbows) cement understanding perfectly.', author: 'Parent · Toronto', stars: 5 },
  ],
  12: [
    { text: 'Integration finally makes sense as accumulation, not just as anti-differentiation.', author: 'Student · Grade 12 · Paris', stars: 5 },
    { text: 'The Riemann-sum visual is the clearest approach to defining the integral I\'ve encountered.', author: 'Educator · Tokyo', stars: 5 },
    { text: 'My student went from failing calculus to scoring 91 on the final after this module.', author: 'Tutor · New York', stars: 5 },
    { text: 'The "slicing" principle for area and volume problems is explained with rare clarity.', author: 'Student · Grade 12 · Seoul', stars: 5 },
    { text: 'Physics applications (work, charge, mass) woven in at exactly the right moments.', author: 'Educator · Berlin', stars: 4 },
    { text: 'The Fundamental Theorem of Calculus is finally intuitive, not just technical.', author: 'Student · Grade 11 · London', stars: 5 },
    { text: 'The "area between curves" problems are sequenced with exceptional pedagogical care.', author: 'Tutor · Singapore', stars: 5 },
    { text: 'Best integration module I\'ve reviewed in six years of AP calculus tutoring.', author: 'Tutor · Toronto', stars: 5 },
  ],
  13: [
    { text: 'Causality in history always confused me. This module made the logic explicit and clear.', author: 'Student · Grade 10 · London', stars: 5 },
    { text: 'My son can now construct evidence-based arguments in history essays. Remarkable.', author: 'Parent · Sydney', stars: 5 },
    { text: 'The distinction between proximate and structural causes is handled with real nuance.', author: 'Educator · Berlin', stars: 4 },
    { text: 'APUSH essay scores improved dramatically after students worked through this module.', author: 'Teacher · New York', stars: 5 },
    { text: 'The counterfactual reasoning exercises are uniquely effective for building causal thinking.', author: 'Educator · Toronto', stars: 5 },
    { text: 'My student won her school\'s history debate competition the week after completing this.', author: 'Tutor · Singapore', stars: 5 },
    { text: 'The "necessary vs. sufficient conditions" framework transfers to every subject, not just history.', author: 'Student · Grade 11 · Seoul', stars: 5 },
    { text: 'Rare to find a module that teaches historical thinking rather than historical content.', author: 'Educator · Paris', stars: 5 },
  ],
  14: [
    { text: 'Free-body diagrams finally clicked. The "all forces from one point" rule changed everything.', author: 'Student · Grade 9 · Mumbai', stars: 5 },
    { text: 'My daughter drew her first correct FBD independently after just one session.', author: 'Parent · Seoul', stars: 5 },
    { text: 'The Newton\'s-law application sequence is built on genuinely solid conceptual foundations.', author: 'Educator · London', stars: 5 },
    { text: 'The common FBD errors section is worth the entire module on its own.', author: 'Tutor · New York', stars: 5 },
    { text: 'The transition from static to dynamic diagrams is handled with unusual clarity.', author: 'Student · Grade 10 · Tokyo', stars: 4 },
    { text: 'Every force physics student needs to start here. This is the correct foundation.', author: 'Educator · Berlin', stars: 5 },
    { text: 'The inclined-plane diagram progression is the clearest systematic treatment I\'ve seen.', author: 'Tutor · Singapore', stars: 5 },
    { text: 'My son\'s mechanics marks improved 22 points. Force diagrams were the missing piece.', author: 'Parent · Toronto', stars: 5 },
  ],
  15: [
    { text: 'Divisibility proofs finally make sense. The visual number-line anchoring is genius.',             author: 'Student · Grade 8 · Singapore',       stars: 5 },
    { text: 'My son jumped from 74 to 96 in his number theory section after two sessions.',                   author: 'Parent · Hong Kong',                  stars: 5 },
    { text: 'Prime factorisation scaffolding is the most lucid I have encountered in print or digital.',      author: 'Educator · London',                   stars: 5 },
    { text: 'The modular arithmetic visual is exactly what every competition student needs.',                  author: 'Tutor · Tokyo',                       stars: 5 },
    { text: 'GCD and LCM visually bridged in a way no textbook manages. Exceptional depth.',                  author: 'Student · Grade 9 · Toronto',         stars: 5 },
    { text: 'This module singlehandedly unlocked olympiad-level thinking for my daughter.',                   author: 'Parent · Seoul',                      stars: 5 },
    { text: 'The Euclidean algorithm walkthrough is pitch-perfect in difficulty calibration.',                 author: 'Educator · Berlin',                   stars: 4 },
    { text: 'Number theory has never felt this approachable. Credit entirely to the scaffold design.',        author: 'Student · Grade 10 · Mumbai',         stars: 5 },
  ],
  16: [
    { text: 'Vectors clicked after the geometric interpretation section. Absolute clarity.',                  author: 'Student · Grade 11 · Sydney',         stars: 5 },
    { text: 'My daughter understood matrix transformations visually before she ever saw the algebra.',        author: 'Parent · New York',                   stars: 5 },
    { text: 'The linear independence visualisation is the clearest treatment I have seen at this level.',     author: 'Educator · Toronto',                  stars: 5 },
    { text: 'Eigenvalue intuition built from scratch, geometrically. Outstanding module design.',              author: 'Tutor · Singapore',                   stars: 5 },
    { text: 'The span and basis section resolved years of confusion in a single session.',                    author: 'Student · University Year 1 · London',stars: 5 },
    { text: 'My son went from failing linear algebra to top of his class. This module is the reason.',       author: 'Parent · Shanghai',                   stars: 5 },
    { text: 'Best linear algebra visualisation resource I have used in twelve years of teaching.',            author: 'Educator · Seoul',                    stars: 5 },
    { text: 'Transformation composition handled with unusual depth and clarity. Highly recommended.',         author: 'Student · Grade 12 · Berlin',         stars: 4 },
  ],
}

// ── Forge Analytics Metrics — 8 canonical dimensions ─────────────────────────
// PERFECT_VALS: locked "optimal" readings after a successful mint (one-to-one with FORGE_METRICS)
const PERFECT_VALS = [8, 1.2, 11.3, 88, 82, 74, 87, 95]

const FORGE_METRICS = [
  { name:'ZPD Deviation',  idx:0, unit:'%',     color:GREEN,     good:'low'  as const, pAvg:18,  max:40  },
  { name:'Feedback Loop',  idx:1, unit:'s',     color:GREEN,     good:'low'  as const, pAvg:2.8, max:8   },
  { name:'Cycle Depth',    idx:2, unit:'/sess', color:GREEN,     good:'high' as const, pAvg:6.1, max:15  },
  { name:'Logic Index',    idx:3, unit:'%',     color:'#6366F1', good:'high' as const, pAvg:64,  max:100 },
  { name:'Scaffold Rate',  idx:4, unit:'%',     color:'#6366F1', good:'high' as const, pAvg:52,  max:100 },
  { name:'Analogy Link',   idx:5, unit:'%',     color:AMBER,     good:'high' as const, pAvg:38,  max:100 },
  { name:'Meta-Cogn.',     idx:6, unit:'%',     color:AMBER,     good:'high' as const, pAvg:57,  max:100 },
  { name:'Engagement',     idx:7, unit:'%',     color:AMBER,     good:'high' as const, pAvg:71,  max:100 },
]

// ── Testimonials ──────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { text:'The segment diagram logic changed how my son thinks about every math problem.', author:'Parent \u00b7 Singapore'   },
  { text:'The clearest meeting-problem breakdown I\'ve ever seen \u2014 anywhere.', author:'Student \u00b7 Grade 6 \u00b7 Toronto' },
  { text:'Our child went from 60 to 95 in competitions after just 3 sessions.', author:'Parent \u00b7 Shanghai'    },
  { text:'The visual scaffolding approach is remarkably effective for visual learners.', author:'Educator \u00b7 London'     },
  { text:'I finally understand relative velocity \u2014 the diagram made it click.', author:'Student \u00b7 Grade 5 \u00b7 Seoul'  },
  { text:'The Socratic protocol is perfectly preserved in the digital format.', author:'Parent \u00b7 New York'    },
]

// ── Deterministic bar pattern ─────────────────────────────────────────────────
const BAR_PATTERN = [6,14,22,10,18,26,14,6,22,18,10,26,6,14,22,10,18,6,14,26,18,10,22,14,6,18,26,10,22,14,6,18]

// ══════════════════════════════════════════════════════════════════════════════
//  SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

// ── Growth Curve (royalties card) ─────────────────────────────────────────────
function GrowthCurve() {
  const pts = [0,6,10,16,22,28,26,34,40,50,54,58,64,70,75,80]
  const W = 80, H = 28, max = 80
  const d = pts.map((p, i) =>
    `${i === 0 ? 'M' : 'L'}${(i/(pts.length-1))*W},${H-(p/max)*H}`
  ).join(' ')
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display:'block' }}>
      <path d={d} fill="none" stroke={GREEN} strokeWidth={1.5}
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Waveform ──────────────────────────────────────────────────────────────────
function Waveform({ playing }: { playing: boolean }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:2, height:28 }}>
      {BAR_PATTERN.slice(0, 22).map((h, i) => (
        <motion.div key={i}
          animate={{ height: playing ? h : 4 }}
          transition={{ duration:0.09, delay: playing ? i*0.018 : 0, ease:'easeOut' }}
          style={{ width:3, borderRadius:2, flexShrink:0,
            background:`${GREEN}CC`, transition:'height 0.09s ease' }}
        />
      ))}
    </div>
  )
}

// ── Mini Sparkline ────────────────────────────────────────────────────────────
function MiniSparkline({ pts, color = GREEN }: { pts: number[]; color?: string }) {
  const W = 54, H = 20
  const max = Math.max(...pts), min = Math.min(...pts), range = max - min || 1
  const d = pts.map((p, i) =>
    `${i === 0 ? 'M' : 'L'}${(i / (pts.length - 1)) * W},${H - ((p - min) / range) * (H - 3) - 1.5}`
  ).join(' ')
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display:'block', flexShrink:0 }}>
      <path d={d} fill="none" stroke={color} strokeWidth={1.5}
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Asset Metric Cards ────────────────────────────────────────────────────────
function AssetMetricCards() {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1.125rem' }}>
      {ASSET_METRICS.map((m, i) => (
        <motion.div key={m.label}
          whileHover={{ y:-3, boxShadow:`0 8px 28px rgba(16,185,129,0.10)` }}
          style={{ border:`1px solid ${BORDER}`, borderRadius:18,
            padding:'22px 22px', background:'#FFFFFF', cursor:'default',
            transition:'border-color 0.2s' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
            <span style={{ fontSize:22 }}>{m.icon}</span>
            {m.curve && <GrowthCurve />}
          </div>
          <p style={{ fontSize:9.5, fontWeight:700, letterSpacing:'0.1em',
            textTransform:'uppercase', color:MUTED, marginBottom:8 }}>{m.label}</p>
          <p style={{ fontSize:28, fontWeight:900, color:INK, lineHeight:1,
            letterSpacing:'-0.02em', marginBottom:6, fontVariantNumeric:'tabular-nums' }}>
            {m.value}
          </p>
          <p style={{ fontSize:11, color:SUBTLE }}>{m.sub}</p>
          <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:10 }}>
            <motion.div style={{ width:5, height:5, borderRadius:'50%', background:GREEN }}
              animate={{ opacity:[0.4,1,0.4] }}
              transition={{ duration:2, repeat:Infinity, delay:i*0.4 }} />
            <span style={{ fontSize:9, color:GREEN, fontWeight:600 }}>Live</span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ── Measurement Matrix (per-asset, with platform avg) ─────────────────────────
function MeasurementMatrix({ assetScores, assetId }: {
  assetScores: number[][];
  assetId: number;
}) {
  const [tooltip, setTooltip] = useState<{ gi: number; ii: number } | null>(null)

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
      {MEASUREMENT_GROUPS.map((group, gi) => (
        <div key={group.cluster}
          style={{ border:`1px solid ${BORDER}`, borderRadius:16, overflow:'hidden' }}>

          {/* Cluster header */}
          <div style={{ padding:'11px 18px', borderBottom:`1px solid ${BORDER}`,
            background:`${group.color}06`,
            display:'flex', alignItems:'center', gap:9 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:group.color, flexShrink:0 }} />
            <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.12em',
              textTransform:'uppercase', color:group.color }}>{group.cluster}</p>
            <p style={{ fontSize:10, color:SUBTLE, marginLeft:4 }}>{group.subtitle}</p>
            <span style={{ marginLeft:'auto', fontSize:8.5, fontWeight:700, padding:'2px 8px', borderRadius:99,
              background:`${group.color}14`, color:group.color }}>
              {group.indicators.length}
            </span>
          </div>

          {/* Indicators */}
          <div>
            {group.indicators.map((ind, ii) => {
              const isHovered = tooltip?.gi === gi && tooltip?.ii === ii
              const rawValue = assetScores?.[gi]?.[ii] ?? ind.value
              const pct = Math.min(100, (rawValue / ind.max) * 100)
              const platformPct = Math.min(100, (ind.platformAvg / ind.max) * 100)
              const vsAvg = rawValue - ind.platformAvg
              const goodDir = ind.good === 'high' ? vsAvg > 0 : vsAvg < 0
              const vsStr = `${vsAvg >= 0 ? '+' : ''}${Math.abs(vsAvg) >= 10 ? Math.round(vsAvg) : vsAvg.toFixed(1)}`

              return (
                <div key={ind.name} style={{ position:'relative' }}>
                  <div
                    onMouseEnter={() => setTooltip({ gi, ii })}
                    onMouseLeave={() => setTooltip(null)}
                    style={{
                      padding:'12px 18px', cursor:'default',
                      borderBottom: ii < group.indicators.length - 1 ? `1px solid ${BORDER}` : 'none',
                      background: isHovered ? `${group.color}04` : '#FFFFFF',
                      transition:'background 0.15s',
                    }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>

                      {/* Name */}
                      <div style={{ flex:'0 0 178px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                          <p style={{ fontSize:11.5, fontWeight:700, color:INK }}>{ind.name}</p>
                        </div>
                        <p style={{ fontSize:9, color:SUBTLE }}>
                          {ind.good === 'high' ? 'Higher \u2192 better' : 'Lower \u2192 better'}
                        </p>
                      </div>

                      {/* Dual bar: platform avg (gray) behind educator (color) */}
                      <div style={{ flex:1 }}>
                        <div style={{ height:7, background:BORDER, borderRadius:4, position:'relative', overflow:'hidden' }}>
                          {/* Platform avg — gray fill */}
                          <div style={{ position:'absolute', inset:0, width:`${platformPct}%`,
                            background:'#D1D5DB', borderRadius:4 }} />
                          {/* Educator bar — animated on top */}
                          <motion.div
                            key={`${assetId}-${gi}-${ii}`}
                            initial={{ width:0 }}
                            animate={{ width:`${pct}%` }}
                            transition={{ duration:0.6, ease:[0.22,1,0.36,1] }}
                            style={{ position:'absolute', inset:0, height:'100%', borderRadius:4,
                              background:`linear-gradient(90deg, ${group.color}, ${group.color}AA)`,
                              zIndex:1 }} />
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-between', marginTop:3 }}>
                          <span style={{ fontSize:8, color:SUBTLE }}>0</span>
                          <span style={{ fontSize:8, color:SUBTLE }}>{ind.max}{ind.unit}</span>
                        </div>
                      </div>

                      {/* Value + vs-avg badge */}
                      <div style={{ flex:'0 0 66px', textAlign:'right' }}>
                        <p style={{ fontSize:19, fontWeight:900, color:group.color, lineHeight:1,
                          fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em' }}>
                          {rawValue}
                        </p>
                        <span style={{ fontSize:8.5, fontWeight:700,
                          color: goodDir ? GREEN : CRIMSON }}>
                          {vsStr} avg
                        </span>
                      </div>

                      {/* ⓘ */}
                      <div style={{ flex:'0 0 18px', display:'flex', justifyContent:'center' }}>
                        <div style={{ width:15, height:15, borderRadius:'50%',
                          border:`1.5px solid ${isHovered ? group.color : '#D1D5DB'}`,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          transition:'border-color 0.15s' }}>
                          <span style={{ fontSize:8.5, fontWeight:800, lineHeight:1,
                            color: isHovered ? group.color : SUBTLE }}>i</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tooltip */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity:0, y:-4 }}
                        animate={{ opacity:1, y:0 }}
                        exit={{ opacity:0, y:-4 }}
                        transition={{ duration:0.15 }}
                        style={{ position:'absolute', top:'calc(100% + 3px)', left:18, right:18,
                          zIndex:60, padding:'10px 14px', borderRadius:10,
                          background:'#1F2937', border:'1px solid #374151',
                          boxShadow:'0 8px 24px rgba(0,0,0,0.20)', pointerEvents:'none' }}>
                        <p style={{ fontSize:8.5, fontWeight:700, letterSpacing:'0.1em',
                          textTransform:'uppercase', color:group.color, marginBottom:5 }}>
                          Academic Definition
                        </p>
                        <p style={{ fontSize:10.5, color:'#E5E7EB', lineHeight:1.7 }}>
                          {ind.definition}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Wisdom DNA Portfolio (split-view dashboard) ───────────────────────────────
function WisdomDNAPortfolio() {
  const [selectedId, setSelectedId] = useState<number>(1)
  const asset = LOGIC_ASSETS.find(a => a.id === selectedId) ?? LOGIC_ASSETS[0]

  function tierColor(tier: string) {
    if (tier === 'Master')   return GREEN
    if (tier === 'Advanced') return AMBER
    return SUBTLE
  }
  function tierBg(tier: string) {
    if (tier === 'Master')   return `${GREEN}18`
    if (tier === 'Advanced') return `${AMBER}18`
    return BORDER
  }

  return (
    <div style={{ display:'grid', gridTemplateColumns:'5fr 7fr', gap:'1.75rem', alignItems:'start' }}>

      {/* ── Left: Asset List ── */}
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase',
          color:MUTED, marginBottom:6 }}>6 Encoded Logic Assets</p>

        {LOGIC_ASSETS.map(a => {
          const isSel = a.id === selectedId
          return (
            <motion.div key={a.id}
              onClick={() => setSelectedId(a.id)}
              whileHover={{ x: isSel ? 0 : 2 }}
              style={{
                border:`1px solid ${isSel ? GREEN : BORDER}`,
                borderRadius:13, padding:'12px 14px', cursor:'pointer',
                background: isSel ? `${GREEN}05` : '#FFFFFF',
                transition:'border-color 0.18s, background 0.18s',
              }}>
              <div style={{ display:'flex', alignItems:'center', gap:11 }}>
                {/* Left accent bar */}
                <div style={{ width:3, height:32, borderRadius:2, flexShrink:0,
                  background: isSel ? GREEN : BORDER,
                  transition:'background 0.18s' }} />

                {/* Content */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
                    <p style={{ fontSize:12, fontWeight:700,
                      color: isSel ? INK : BODY,
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {a.name}
                    </p>
                    <span style={{ fontSize:8, fontWeight:700, padding:'2px 7px', borderRadius:99, flexShrink:0,
                      background:tierBg(a.tier), color:tierColor(a.tier) }}>
                      {a.tier}
                    </span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ fontSize:10, color:SUBTLE }}>{a.subject}</span>
                    <span style={{ fontSize:9, color:SUBTLE }}>&middot;</span>
                    <span style={{ fontSize:10, color:SUBTLE }}>{a.inv.toLocaleString()} inv</span>
                  </div>
                </div>

                {/* Sparkline */}
                <MiniSparkline pts={a.sparkline} color={isSel ? GREEN : '#D1D5DB'} />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ── Right: Measurement Matrix ── */}
      <div>
        {/* Context strip */}
        <AnimatePresence mode="wait">
          <motion.div key={selectedId}
            initial={{ opacity:0, x:6 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-6 }}
            transition={{ duration:0.2 }}
            style={{ marginBottom:14, padding:'10px 16px', borderRadius:12,
              background:`${GREEN}07`, border:`1px solid ${GREEN}20`,
              display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <p style={{ fontSize:12, fontWeight:700, color:INK }}>{asset.name}</p>
              <p style={{ fontSize:10, color:MUTED, marginTop:1 }}>
                {asset.subject} &middot; {asset.tier} &middot; {asset.inv.toLocaleString()} inv
              </p>
            </div>
            {/* Legend */}
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                <div style={{ width:12, height:4, borderRadius:2, background:GREEN }} />
                <span style={{ fontSize:9, color:MUTED }}>Expert-ZSF1220</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                <div style={{ width:12, height:4, borderRadius:2, background:'#D1D5DB' }} />
                <span style={{ fontSize:9, color:MUTED }}>Platform Avg</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <MeasurementMatrix assetScores={asset.scores as number[][]} assetId={asset.id} />
      </div>
    </div>
  )
}

// ── The Logic Forge ───────────────────────────────────────────────────────────
const MINT_HASH = '0x7f3a9c · e1b2d4 · 8f05ab · 3c6e12'
function LogicPlayground() {
  const [messages,   setMessages]   = useState<DMsg[]>([SOCRATIC_DIALOG[0]])
  const [simulating, setSimulating] = useState(false)
  const [minted,     setMinted]     = useState(false)
  const [scanPct,    setScanPct]    = useState(0)
  const msgRef   = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef   = useRef<number>(0)

  // Sequential message reveal → triggers mint on completion
  useEffect(() => {
    if (!simulating) return
    let idx = 1
    function addNext() {
      if (idx >= SOCRATIC_DIALOG.length) {
        setSimulating(false)
        setTimeout(() => setMinted(true), 220)
        return
      }
      timerRef.current = setTimeout(() => {
        const msg = SOCRATIC_DIALOG[idx]
        if (msg) setMessages(m => [...m, msg])
        idx++
        addNext()
      }, 1100)
    }
    addNext()
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [simulating])

  // Auto-scroll
  useEffect(() => {
    setTimeout(() => {
      msgRef.current?.scrollTo({ top: msgRef.current.scrollHeight, behavior:'smooth' })
    }, 80)
  }, [messages])

  // Scan line via rAF
  useEffect(() => {
    let start: number | null = null
    function frame(t: number) {
      if (!start) start = t
      const elapsed = (t - start) % 3200
      setScanPct(elapsed / 3200)
      rafRef.current = requestAnimationFrame(frame)
    }
    rafRef.current = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  function startSim() {
    if (simulating) return
    setMessages([SOCRATIC_DIALOG[0]])
    setMinted(false)
    setSimulating(true)
  }

  return (
    <motion.div
      animate={minted ? { x:[0, -3, 3, -2, 2, -1, 1, 0] } : { x:0 }}
      transition={minted ? { duration:0.38, ease:'easeOut' } : { duration:0.1 }}
      style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:0,
        border:`1px solid ${minted ? GREEN : BORDER}`, borderRadius:16, overflow:'hidden',
        transition:'border-color 0.3s' }}>

      {/* Left: Source Material */}
      <div style={{ borderRight:`1px solid ${BORDER}`, padding:'20px 22px',
        background:'#FAFBFC', position:'relative', overflow:'hidden' }}>
        <p style={{ fontSize:9.5, fontWeight:700, letterSpacing:'0.12em',
          textTransform:'uppercase', color:MUTED, marginBottom:12 }}>Source Material</p>
        {/* Scan line */}
        <div style={{ position:'absolute', left:0, right:0, top:0, bottom:0,
          pointerEvents:'none', overflow:'hidden' }}>
          <div style={{
            position:'absolute', left:0, right:0, height:2,
            background:`linear-gradient(90deg, transparent, ${GREEN}55, transparent)`,
            top:`${44 + scanPct * 300}px`
          }} />
        </div>
        <pre style={{ fontSize:10.5, lineHeight:1.8, color:BODY, fontFamily:'ui-monospace,monospace',
          whiteSpace:'pre-wrap', wordBreak:'break-word', margin:0, position:'relative' }}>
          {SOURCE_TEXT}
        </pre>
      </div>

      {/* Right: AI Reconstruction */}
      <div style={{ display:'flex', flexDirection:'column', background:'#FFFFFF' }}>
        <div style={{ padding:'16px 20px', borderBottom:`1px solid ${BORDER}`,
          display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <p style={{ fontSize:9.5, fontWeight:700, letterSpacing:'0.12em',
              textTransform:'uppercase', color:MUTED }}>AI Socratic Reconstruction</p>
            <p style={{ fontSize:11, color:SUBTLE, marginTop:2 }}>Master DNA &middot; Expert-ZSF1220 Protocol</p>
          </div>
          <motion.button
            onClick={startSim}
            disabled={simulating}
            whileHover={!simulating ? { scale:1.04, boxShadow:`0 6px 22px ${GREEN}55` } : {}}
            whileTap={!simulating ? { scale:0.96 } : {}}
            style={{
              fontSize:10.5, fontWeight:800, padding:'8px 16px', borderRadius:9,
              background: simulating ? BORDER : GREEN,
              color: simulating ? MUTED : '#fff',
              border:'none', cursor: simulating ? 'default' : 'pointer',
              letterSpacing:'0.04em', fontFamily:'ui-monospace,monospace',
              transition:'background 0.2s, color 0.2s',
            }}>
            {simulating ? 'FORGING…' : '[ MINT WISDOM ASSET ]'}
          </motion.button>
        </div>

        <div ref={msgRef} style={{ flex:1, overflowY:'auto', padding:'16px 20px',
          maxHeight:310, display:'flex', flexDirection:'column', gap:10 }}>
          <AnimatePresence initial={false}>
            {messages && messages.length > 0 && messages.map((msg, i) => {
              if (!msg) return null
              return (
                <motion.div key={i}
                  initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                  transition={{ duration:0.24 }}>
                  {msg.role === 'system' ? (
                    <div style={{ padding:'6px 10px', borderRadius:7,
                      background:`${GREEN}0E`, border:`1px solid ${GREEN}2A` }}>
                      <p style={{ fontSize:10, color:GREEN, fontWeight:600 }}>{msg.text}</p>
                    </div>
                  ) : (
                    <div style={{ display:'flex', gap:8, alignItems:'flex-start',
                      flexDirection: msg.role === 'student' ? 'row-reverse' : 'row' }}>
                      <div style={{ width:26, height:26, borderRadius:'50%', flexShrink:0,
                        background: msg.role === 'mentor' ? GREEN : BORDER,
                        display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <span style={{ fontSize:8, fontWeight:800,
                          color: msg.role === 'mentor' ? '#fff' : MUTED }}>
                          {msg.role === 'mentor' ? 'AI' : 'S'}
                        </span>
                      </div>
                      <div style={{ maxWidth:'80%', padding:'8px 12px',
                        borderRadius: msg.role === 'mentor' ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                        background: msg.role === 'mentor' ? `${GREEN}09` : '#F9FAFB',
                        border:`1px solid ${msg.role === 'mentor' ? GREEN+'22' : BORDER}` }}>
                        <p style={{ fontSize:11, lineHeight:1.65, color:BODY }}>{msg.text}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Minted hash badge */}
        <AnimatePresence>
          {minted && (
            <motion.div
              initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              transition={{ duration:0.28 }}
              style={{ margin:'0 16px 14px', padding:'9px 14px', borderRadius:9,
                background:`${GREEN}0C`, border:`1px solid ${GREEN}30`,
                display:'flex', alignItems:'center', gap:10 }}>
              <motion.div
                animate={{ opacity:[0.5,1,0.5] }} transition={{ duration:1.4, repeat:Infinity }}
                style={{ width:6, height:6, borderRadius:'50%', background:GREEN, flexShrink:0 }} />
              <div>
                <p style={{ fontSize:8.5, fontWeight:700, color:GREEN, letterSpacing:'0.12em',
                  textTransform:'uppercase', marginBottom:2 }}>Wisdom Asset Minted</p>
                <p style={{ fontSize:9.5, fontFamily:'ui-monospace,monospace', color:MUTED,
                  letterSpacing:'0.04em' }}>{MINT_HASH}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ── Multimodal Ingestion ──────────────────────────────────────────────────────
function MultimodalIngestion() {
  const [dragOver,  setDragOver]  = useState(false)
  const [progress,  setProgress]  = useState(0)
  const [processing,setProcessing]= useState(false)
  const [done,      setDone]      = useState(false)

  const TYPES = [
    { icon:'\uD83D\uDCDD', label:'Handwritten Notes', ext:'JPG / PNG'   },
    { icon:'\uD83D\uDCC4', label:'Documents',         ext:'PDF / DOCX'  },
    { icon:'\uD83C\uDF99\uFE0F', label:'Audio',        ext:'MP3 / WAV'  },
    { icon:'\uD83C\uDFAC', label:'Video',             ext:'MP4 / MOV'   },
  ]

  function simulate() {
    if (processing) return
    setProcessing(true); setProgress(0); setDone(false)
    let p = 0
    const id = setInterval(() => {
      p += 3 + (p < 60 ? 4 : p < 85 ? 2 : 0.8)
      if (p >= 100) {
        p = 100; clearInterval(id); setDone(true)
        setTimeout(() => { setProcessing(false); setDone(false); setProgress(0) }, 2200)
      }
      setProgress(p)
    }, 100)
  }

  return (
    <div style={{ border:`1px solid ${BORDER}`, borderRadius:18, padding:'24px 24px' }}>
      {/* Type cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:18 }}>
        {TYPES.map(t => (
          <div key={t.label} style={{ padding:'14px 10px', borderRadius:12, textAlign:'center',
            border:`1px solid ${BORDER}`, background:'#FAFBFC', cursor:'pointer',
            transition:'border-color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor=GREEN)}
            onMouseLeave={e => (e.currentTarget.style.borderColor=BORDER)}>
            <div style={{ fontSize:24, marginBottom:6 }}>{t.icon}</div>
            <p style={{ fontSize:11, fontWeight:600, color:INK, marginBottom:2 }}>{t.label}</p>
            <p style={{ fontSize:9, color:SUBTLE }}>{t.ext}</p>
          </div>
        ))}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); simulate() }}
        onClick={simulate}
        style={{ border:`2px dashed ${dragOver ? GREEN : '#D1D5DB'}`, borderRadius:14,
          padding:'32px 24px', textAlign:'center', cursor:'pointer',
          background: dragOver ? `${GREEN}06` : '#FAFBFC',
          transition:'all 0.2s' }}>
        {processing ? (
          <div>
            <p style={{ fontSize:13, fontWeight:700, marginBottom:14,
              color: done ? GREEN : INK }}>
              {done ? '\u2713 Logic Encoded Successfully' : 'Logic Processing...'}
            </p>
            <div style={{ height:6, background:BORDER, borderRadius:3, overflow:'hidden', maxWidth:320, margin:'0 auto' }}>
              <motion.div
                animate={{ width:`${progress}%` }}
                transition={{ duration:0.12 }}
                style={{ height:'100%', borderRadius:3,
                  background:`linear-gradient(90deg, ${GREEN}, ${GREEN}BB)` }} />
            </div>
            <p style={{ fontSize:10, color:SUBTLE, marginTop:10 }}>
              {Math.round(progress)}% complete
            </p>
          </div>
        ) : (
          <>
            <p style={{ fontSize:24, marginBottom:10 }}>{'\uD83D\uDCCE'}</p>
            <p style={{ fontSize:14, fontWeight:600, color:MUTED, marginBottom:5 }}>
              Drop teaching materials here or click to upload
            </p>
            <p style={{ fontSize:11, color:SUBTLE }}>
              Handwritten notes, audio, video — all become encoded logic assets
            </p>
          </>
        )}
      </div>
    </div>
  )
}

// ── THE LOGIC FORGE — Frame 2 workshop (ingestion + 3-col) ───────────────────
// memo() prevents the mining-ticker re-renders in EducatorPage from cascading
// into this component and resetting the in-flight state machine.
type ForgeStep = 'idle' | 'typeSelected' | 'ingested' | 'minting' | 'completed'

const LogicForge = memo(function LogicForge({
  onMintComplete,
}: {
  onMintComplete: (hash: string) => void
}) {
  const [forgeStep,      setForgeStep]      = useState<ForgeStep>('idle')
  const [selectedType,   setSelectedType]   = useState<string | null>(null)
  const [isIngesting,    setIsIngesting]    = useState(false)
  const [ingestProgress, setIngestProgress] = useState(0)
  const [messages,       setMessages]       = useState<DMsg[]>([SOCRATIC_DIALOG[0]])
  const [scanPct,        setScanPct]        = useState(0)
  const [liveVals,       setLiveVals]       = useState([12, 1.8, 8.4, 77, 68, 42, 74, 88])
  const [mintLock,       setMintLock]       = useState(false)
  const [hashGlitch,     setHashGlitch]     = useState('')
  const [showHashHero,   setShowHashHero]   = useState(false) // full-screen hash zoom shot

  const msgRef     = useRef<HTMLDivElement>(null)
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef     = useRef<number>(0)
  const valRef     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const flickerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const glitchRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const ingestRef  = useRef<ReturnType<typeof setInterval> | null>(null)

  const isMinting = forgeStep === 'minting'
  const mintReady = forgeStep === 'ingested'
  const mintDone  = forgeStep === 'completed'

  // ── Step A: type button click ─────────────────────────────────────────────
  function handleTypeSelect(label: string) {
    if (forgeStep === 'minting' || forgeStep === 'completed') return
    setSelectedType(label)
    if (forgeStep === 'idle') setForgeStep('typeSelected')
  }

  // ── Step B: drop zone click → ingestion progress bar ─────────────────────
  function handleIngest() {
    if (forgeStep !== 'typeSelected' || isIngesting) return
    setIsIngesting(true)
    setIngestProgress(0)
    let p = 0
    ingestRef.current = setInterval(() => {
      p += 3 + (p < 60 ? 4 : p < 85 ? 2 : 0.8)
      if (p >= 100) {
        clearInterval(ingestRef.current!)
        setIngestProgress(100)
        setTimeout(() => {
          setIsIngesting(false)
          setForgeStep('ingested')
        }, 400)
      } else {
        setIngestProgress(p)
      }
    }, 100)
  }

  // ── Step C: mint button click → ceremony ─────────────────────────────────
  function handleMint() {
    if (!mintReady) return
    setForgeStep('minting')
    setMessages([SOCRATIC_DIALOG[0]])
    setHashGlitch('')
    let idx = 1
    function addNext() {
      if (idx >= SOCRATIC_DIALOG.length) {
        // All messages delivered — lock bars, start hash reveal
        setMintLock(true)
        flickerRef.current = setTimeout(() => {
          const CHARS = '0123456789abcdef'
          let fr = 0
          const TOTAL = 28
          glitchRef.current = setInterval(() => {
            fr++
            if (fr >= TOTAL) {
              setHashGlitch(MINT_HASH)
              clearInterval(glitchRef.current!)
              setForgeStep('completed')
              // Hero shot: 1 s zoom-in → stay 1 s → auto-dismiss (total 2 s)
              setShowHashHero(true)
              setTimeout(() => setShowHashHero(false), 2000)
              onMintComplete(MINT_HASH)
              return
            }
            const resolved = Math.floor((fr / TOTAL) * MINT_HASH.length)
            setHashGlitch(
              MINT_HASH.split('').map((c, ci) => {
                if (c === ' ' || c === '·') return c
                if (ci < resolved) return c
                return CHARS[Math.floor(Math.random() * CHARS.length)]
              }).join('')
            )
          }, 60)
        }, 1620)
        return
      }
      timerRef.current = setTimeout(() => {
        const msg = SOCRATIC_DIALOG[idx]
        if (msg) setMessages(m => [...m, msg])
        idx++
        addNext()
      }, 1100)
    }
    addNext()
  }

  // Analytics fluctuation while minting (bars jump wildly before lock)
  useEffect(() => {
    if (!isMinting || mintLock) return
    const noises = [2, 0.2, 0.8, 4, 4, 3, 5, 4]
    const bases  = [12, 1.8, 8.4, 77, 68, 42, 74, 88]
    function tick() {
      setLiveVals(prev => prev.map((v, i) => {
        const n = (Math.random() - 0.5) * noises[i] * 2
        const next = v + n
        const clamped = Math.max(bases[i] * 0.78, Math.min(bases[i] * 1.22, next))
        return Math.round(clamped * 10) / 10
      }))
      valRef.current = setTimeout(tick, 380)
    }
    tick()
    return () => { if (valRef.current) clearTimeout(valRef.current) }
  }, [isMinting, mintLock])

  // Auto-scroll dialogue
  useEffect(() => {
    setTimeout(() => {
      msgRef.current?.scrollTo({ top: msgRef.current.scrollHeight, behavior:'smooth' })
    }, 80)
  }, [messages])

  // Scan-line rAF — continuous
  useEffect(() => {
    let start: number | null = null
    function frame(t: number) {
      if (!start) start = t
      const elapsed = (t - start) % 3200
      setScanPct(elapsed / 3200)
      rafRef.current = requestAnimationFrame(frame)
    }
    rafRef.current = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current)   clearTimeout(timerRef.current)
      if (valRef.current)     clearTimeout(valRef.current)
      if (flickerRef.current) clearTimeout(flickerRef.current)
      if (glitchRef.current)  clearInterval(glitchRef.current)
      if (ingestRef.current)  clearInterval(ingestRef.current)
    }
  }, [])

  // ── Derived UI helpers ────────────────────────────────────────────────────
  const mintBtnLabel =
    mintDone  ? '✓ MINTED' :
    isMinting ? 'FORGING…' :
    mintReady ? '[ MINT WISDOM ASSET ]' :
                '[ UPLOAD SOURCE FIRST ]'

  const mintBtnBg =
    mintDone  ? `${GREEN}CC` :
    isMinting ? BORDER :
    mintReady ? GREEN :
                '#E5E7EB'

  const mintBtnColor =
    mintDone  ? '#fff' :
    isMinting ? MUTED :
    mintReady ? '#fff' :
                SUBTLE

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>

      {/* ── Ingestion Strip ── */}
      <div style={{
        flexShrink:0, marginBottom:12,
        display:'flex', alignItems:'center', gap:10,
        padding:'8px 12px', borderRadius:13,
        border:`1px solid ${BORDER}`, background:'#FAFBFC',
      }}>
        <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.12em',
          textTransform:'uppercase', color:GREEN, flexShrink:0 }}>
          Multimodal Ingestion
        </p>

        {/* Type buttons — Step A */}
        <div style={{ display:'flex', gap:5 }}>
          {[
            { icon:'📝', label:'Notes'  },
            { icon:'📄', label:'Docs'   },
            { icon:'🎙️', label:'Audio' },
            { icon:'🎬', label:'Video'  },
          ].map(t => {
            const isSelected = selectedType === t.label
            return (
              <div key={t.label}
                onClick={() => handleTypeSelect(t.label)}
                style={{ padding:'5px 10px', borderRadius:8, display:'flex', alignItems:'center',
                  gap:5, cursor: (isMinting || mintDone) ? 'default' : 'pointer',
                  border:`1px solid ${isSelected ? GREEN : BORDER}`,
                  background: isSelected ? `${GREEN}0E` : '#FFFFFF',
                  transition:'border-color 0.18s, background 0.18s' }}
                onMouseEnter={e => {
                  if (!isMinting && !mintDone) e.currentTarget.style.borderColor = GREEN
                }}
                onMouseLeave={e => {
                  if (!isSelected) e.currentTarget.style.borderColor = BORDER
                }}>
                <span style={{ fontSize:13 }}>{t.icon}</span>
                <span style={{ fontSize:10, fontWeight:600,
                  color: isSelected ? GREEN : INK }}>{t.label}</span>
              </div>
            )
          })}
        </div>

        {/* Drop zone — Step B (only active after typeSelected) */}
        <div
          onClick={handleIngest}
          style={{ flex:1, borderRadius:9, minHeight:34,
            padding:'5px 14px', display:'flex', alignItems:'center', justifyContent:'center',
            cursor: forgeStep === 'typeSelected' && !isIngesting ? 'pointer' : 'default',
            border: isIngesting || forgeStep === 'ingested' || isMinting || mintDone
              ? `2px solid ${GREEN}`
              : `2px dashed ${forgeStep === 'typeSelected' ? GREEN : '#D1D5DB'}`,
            background: isIngesting || forgeStep === 'ingested' || isMinting || mintDone
              ? `${GREEN}08` : 'transparent',
            transition:'all 0.2s', flexDirection:'column', gap:4,
          }}
          onMouseEnter={e => {
            if (forgeStep === 'typeSelected' && !isIngesting)
              e.currentTarget.style.background = `${GREEN}06`
          }}
          onMouseLeave={e => {
            if (forgeStep === 'typeSelected' && !isIngesting)
              e.currentTarget.style.background = 'transparent'
          }}>
          {isIngesting ? (
            <>
              <span style={{ fontSize:10, color:GREEN, fontWeight:700,
                fontFamily:'ui-monospace,monospace' }}>
                Ingesting pedagogical fingerprint…
              </span>
              <div style={{ width:'80%', height:4, background:'#E5E7EB',
                borderRadius:2, overflow:'hidden', marginTop:4 }}>
                <div style={{
                  height:'100%', borderRadius:2, background:GREEN,
                  width:`${ingestProgress}%`, transition:'width 0.12s linear',
                }} />
              </div>
            </>
          ) : forgeStep === 'ingested' || isMinting || mintDone ? (
            <span style={{ fontSize:10, color:GREEN, fontWeight:700,
              fontFamily:'ui-monospace,monospace' }}>
              ✓ Source Ingested
            </span>
          ) : (
            <span style={{ fontSize:11,
              color: forgeStep === 'typeSelected' ? GREEN : MUTED }}>
              📎 {forgeStep === 'typeSelected'
                ? `Click to ingest ${selectedType ?? 'source'}…`
                : 'Drop or click to ingest teaching materials'}
            </span>
          )}
        </div>

        {/* Inline Mint button — Step C */}
        <AnimatePresence mode="wait">
          {mintDone ? (
            <motion.div key="minted-badge"
              initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
              transition={{ duration:0.26 }}
              style={{ flexShrink:0, display:'inline-flex', alignItems:'center', gap:6,
                padding:'8px 14px', borderRadius:9,
                background:`${GREEN}0C`, border:`1px solid ${GREEN}30` }}>
              <motion.div
                animate={{ opacity:[0.5,1,0.5] }} transition={{ duration:1.4, repeat:Infinity }}
                style={{ width:5, height:5, borderRadius:'50%', background:GREEN, flexShrink:0 }} />
              <span style={{ fontSize:9.5, fontFamily:'ui-monospace,monospace',
                color:MUTED, letterSpacing:'0.04em' }}>{MINT_HASH}</span>
            </motion.div>
          ) : (
            <motion.button key="mint-btn"
              onClick={handleMint}
              disabled={!mintReady || isMinting}
              whileHover={mintReady && !isMinting ? { scale:1.04, boxShadow:`0 6px 22px ${GREEN}55` } : {}}
              whileTap={mintReady && !isMinting ? { scale:0.96 } : {}}
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              transition={{ duration:0.2 }}
              style={{
                flexShrink:0, fontSize:11, fontWeight:800,
                padding:'10px 22px', borderRadius:11, border:'none',
                background: mintBtnBg, color: mintBtnColor,
                cursor: mintReady && !isMinting ? 'pointer' : 'default',
                letterSpacing:'0.05em', fontFamily:'ui-monospace,monospace',
                transition:'background 0.2s, color 0.2s',
                animation: mintReady && !isMinting ? 'mint-pulse 1.6s ease-in-out infinite' : undefined,
              }}>
              {mintBtnLabel}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── 3-Column Workshop ── */}
      <div style={{
        flex:1, minHeight:0,
        display:'grid', gridTemplateColumns:'1fr 1fr 1.4fr',
        border:`1px solid ${mintDone ? GREEN : BORDER}`,
        borderRadius:16, overflow:'hidden',
        transition:'border-color 0.3s',
      }}>

        {/* Left: Source Material */}
        <div
          style={{ borderRight:`1px solid ${BORDER}`, padding:'16px 18px',
            background: isIngesting ? `${GREEN}08`
              : (forgeStep === 'ingested' || isMinting || mintDone) ? `${GREEN}04`
              : '#FAFBFC',
            position:'relative', overflow:'hidden',
            display:'flex', flexDirection:'column',
            transition:'background 0.3s',
          }}>
          <p style={{ fontSize:9.5, fontWeight:700, letterSpacing:'0.12em',
            textTransform:'uppercase',
            color: (forgeStep === 'ingested' || isMinting || mintDone) ? GREEN : MUTED,
            marginBottom:12, flexShrink:0, transition:'color 0.2s' }}>
            {(forgeStep === 'ingested' || isMinting || mintDone) ? '✓ Source Verified' : 'Source Material'}
          </p>
          {/* Scan line */}
          <div style={{ position:'absolute', left:0, right:0, top:0, bottom:0,
            pointerEvents:'none', overflow:'hidden' }}>
            <div style={{
              position:'absolute', left:0, right:0, height:2,
              background:`linear-gradient(90deg, transparent, ${GREEN}55, transparent)`,
              top:`${40 + scanPct * 280}px`,
            }} />
          </div>
          <div style={{ flex:1, overflowY:'auto' }}>
            <pre style={{ fontSize:10, lineHeight:1.85, color:BODY,
              fontFamily:'ui-monospace,monospace',
              whiteSpace:'pre-wrap', wordBreak:'break-word', margin:0 }}>
              {SOURCE_TEXT}
            </pre>
          </div>
        </div>

        {/* Middle: AI Socratic Reconstruction */}
        <div style={{ borderRight:`1px solid ${BORDER}`, display:'flex',
          flexDirection:'column', background:'#FFFFFF' }}>
          <div style={{ padding:'12px 16px', borderBottom:`1px solid ${BORDER}`, flexShrink:0 }}>
            <p style={{ fontSize:9.5, fontWeight:700, letterSpacing:'0.12em',
              textTransform:'uppercase', color:MUTED }}>AI Socratic Reconstruction</p>
            <p style={{ fontSize:10, color:SUBTLE, marginTop:2 }}>Expert-ZSF1220 Protocol</p>
          </div>
          <div ref={msgRef} style={{ flex:1, overflowY:'auto', padding:'12px 16px',
            display:'flex', flexDirection:'column', gap:8 }}>
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div key={i}
                  initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                  transition={{ duration:0.22 }}>
                  {msg.role === 'system' ? (
                    <div style={{ padding:'5px 9px', borderRadius:7,
                      background:`${GREEN}0E`, border:`1px solid ${GREEN}2A` }}>
                      <p style={{ fontSize:9.5, color:GREEN, fontWeight:600 }}>{msg.text}</p>
                    </div>
                  ) : (
                    <div style={{ display:'flex', gap:7, alignItems:'flex-start',
                      flexDirection: msg.role === 'student' ? 'row-reverse' : 'row' }}>
                      <div style={{ width:22, height:22, borderRadius:'50%', flexShrink:0,
                        background: msg.role === 'mentor' ? GREEN : BORDER,
                        display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <span style={{ fontSize:7, fontWeight:800,
                          color: msg.role === 'mentor' ? '#fff' : MUTED }}>
                          {msg.role === 'mentor' ? 'AI' : 'S'}
                        </span>
                      </div>
                      <div style={{ maxWidth:'82%', padding:'7px 10px',
                        borderRadius: msg.role === 'mentor' ? '3px 10px 10px 10px' : '10px 3px 10px 10px',
                        background:   msg.role === 'mentor' ? `${GREEN}09` : '#F9FAFB',
                        border:`1px solid ${msg.role === 'mentor' ? GREEN+'22' : BORDER}` }}>
                        <p style={{ fontSize:10.5, lineHeight:1.6, color:BODY }}>{msg.text}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Pedagogical Analytics */}
        <div style={{ display:'flex', flexDirection:'column', background:'#FFFFFF', overflow:'hidden' }}>
          <div style={{ padding:'12px 16px', borderBottom:`1px solid ${BORDER}`, flexShrink:0 }}>
            <p style={{ fontSize:9.5, fontWeight:700, letterSpacing:'0.12em',
              textTransform:'uppercase', color:MUTED }}>Pedagogical Analytics</p>
            <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:4 }}>
              <motion.div
                style={{ width:5, height:5, borderRadius:'50%', background:GREEN }}
                animate={isMinting ? { opacity:[0.4,1,0.4] } : { opacity:0.4 }}
                transition={{ duration:0.8, repeat:Infinity }} />
              <span style={{ fontSize:9.5, fontWeight:600,
                color: isMinting ? GREEN : SUBTLE }}>
                {isMinting ? 'Live Analysis Running…' : mintDone ? 'Forge Complete ✓' : 'Awaiting simulation'}
              </span>
            </div>

            {/* Hash badge — matrix flicker reveals after bars settle */}
            <AnimatePresence>
              {mintDone && hashGlitch && (
                <motion.div key="hash-badge"
                  initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                  transition={{ duration:0.24 }}
                  style={{ marginTop:8, padding:'5px 10px', borderRadius:7,
                    background:`${GREEN}0E`, border:`1px solid ${GREEN}30`,
                    display:'inline-flex', alignItems:'center', gap:7 }}>
                  <span style={{ fontSize:8, fontWeight:800, color:GREEN, letterSpacing:'0.06em' }}>✓ MINTED</span>
                  <span style={{ fontSize:8, color:MUTED, fontFamily:'ui-monospace,monospace',
                    letterSpacing:'0.03em' }}>{hashGlitch}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div style={{ flex:1, overflowY:'auto', padding:'10px 14px',
            display:'flex', flexDirection:'column', gap:8 }}>
            {FORGE_METRICS.map(m => {
              const v          = liveVals[m.idx]
              const pct        = Math.min(100, (v / m.max) * 100)
              const platformPct= Math.min(100, (m.pAvg / m.max) * 100)
              const vsAvg      = v - m.pAvg
              const goodDir    = m.good === 'high' ? vsAvg > 0 : vsAvg < 0
              return (
                <div key={m.name} style={{ padding:'10px 12px', borderRadius:10,
                  border:`1px solid ${BORDER}`, background:'#FAFBFC' }}>
                  <div style={{ display:'flex', justifyContent:'space-between',
                    alignItems:'baseline', marginBottom:7 }}>
                    <span style={{ fontSize:10, fontWeight:700, color:INK }}>{m.name}</span>
                    <motion.span
                      animate={isMinting && !mintLock ? { opacity:[0.7,1,0.7] } : { opacity:1 }}
                      transition={{ duration:0.55, repeat:Infinity }}
                      style={{ fontSize:15, fontWeight:900, color:m.color,
                        fontFamily:'ui-monospace,monospace',
                        fontVariantNumeric:'tabular-nums' }}>
                      {mintLock ? PERFECT_VALS[m.idx] : v}{m.unit}
                    </motion.span>
                  </div>
                  <div style={{ height:5, background:BORDER, borderRadius:3,
                    position:'relative', overflow:'hidden' }}>
                    {/* Platform avg layer */}
                    <div style={{ position:'absolute', inset:0, width:`${platformPct}%`,
                      background:'#D1D5DB', borderRadius:3 }} />
                    {/* Educator bar — CSS transition during mint (browser-native, React-render-safe) */}
                    <div style={{
                      position:'absolute', inset:0, height:'100%', borderRadius:3,
                      background: m.color, zIndex:1,
                      width: mintLock
                        ? `${Math.min(100, (PERFECT_VALS[m.idx] / m.max) * 100)}%`
                        : `${pct}%`,
                      transition: mintLock
                        ? 'width 1.5s cubic-bezier(0.34,1.56,0.64,1)'
                        : 'width 0.35s ease-out',
                    }} />
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                    <span style={{ fontSize:8, color:SUBTLE }}>
                      Avg: {m.pAvg}{m.unit}
                    </span>
                    <span style={{ fontSize:8.5, fontWeight:700,
                      color: goodDir ? GREEN : CRIMSON,
                      fontFamily:'ui-monospace,monospace' }}>
                      {vsAvg >= 0 ? '+' : ''}{Math.round(vsAvg * 10) / 10} avg
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Hash Hero Shot — visual transplant from opportunity hash ceremony ── */}
      <AnimatePresence>
        {showHashHero && (
          <motion.div
            key="hash-hero"
            initial={{ opacity:0, scale:0.38, y:24 }}
            animate={{ opacity:1, scale:1.08, y:0 }}
            exit={{ opacity:0, scale:0.72, transition:{ duration:0.35 } }}
            transition={{ duration:1.0, ease:[0.22,1,0.36,1] }}
            onClick={() => setShowHashHero(false)}
            style={{
              position:'fixed', top:'50%', left:'50%',
              transform:'translate(-50%,-50%)',
              zIndex:99999, pointerEvents:'auto', cursor:'pointer',
              background:'rgba(16,185,129,0.93)',
              backdropFilter:'blur(24px)',
              WebkitBackdropFilter:'blur(24px)',
              borderRadius:18,
              padding:'22px 36px',
              boxShadow:'0 28px 72px rgba(16,185,129,0.45)',
              display:'flex', flexDirection:'column', alignItems:'center', gap:10,
              minWidth:340,
            }}
          >
            <p style={{margin:0,fontSize:10,fontWeight:800,color:'rgba(255,255,255,0.7)',
              letterSpacing:'0.14em',textTransform:'uppercase',whiteSpace:'nowrap'}}>
              ✦ Wisdom Asset Minted · On-Chain
            </p>
            <p style={{margin:0,fontSize:15,fontWeight:900,color:'#fff',
              fontFamily:'ui-monospace,monospace',letterSpacing:'0.04em',whiteSpace:'nowrap'}}>
              {MINT_HASH}
            </p>
            <p style={{margin:0,fontSize:9,color:'rgba(255,255,255,0.58)',
              fontFamily:'monospace',whiteSpace:'nowrap'}}>
              Expert-ZSF1220 · Wisdom Asset · ZK-Proof Verified · Sparkle Protocol
            </p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}) // end memo(LogicForge)

// ── ASSET LEDGER — Frame 3 three-column panel ─────────────────────────────────
function AssetLedger({ highlightNew = false }: { highlightNew?: boolean }) {
  const [selectedId,   setSelectedId]   = useState<number>(1)
  const asset        = LOGIC_ASSETS.find(a => a.id === selectedId) ?? LOGIC_ASSETS[0]
  const testimonials = ASSET_TESTIMONIALS[selectedId] ?? []
  const { state }    = useSparkle()

  // 2-second highlight on the first row when `highlightNew` becomes true
  const [isHighlighted, setIsHighlighted] = useState(false)
  useEffect(() => {
    if (!highlightNew) return
    setIsHighlighted(true)
    const id = setTimeout(() => setIsHighlighted(false), 2000)
    return () => clearTimeout(id)
  }, [highlightNew])

  // Live yield ticker — slowly grows for Master assets
  // When logicHash is set (forge complete) inject a visible bump
  const [liveYield, setLiveYield] = useState(156.832)
  useEffect(() => {
    const id = setInterval(() => {
      setLiveYield(v => parseFloat((v + 0.001 * (0.4 + Math.random() * 0.8)).toFixed(3)))
    }, 2400)
    return () => clearInterval(id)
  }, [])

  // Bump yield once when logicHash arrives
  const prevHashRef = useRef<string | null>(null)
  useEffect(() => {
    if (state.logicHash && prevHashRef.current !== state.logicHash) {
      prevHashRef.current = state.logicHash
      setLiveYield(v => parseFloat((v + 2.4).toFixed(3)))
    }
  }, [state.logicHash])

  // Dynamic invocations: each 0.5 SPRK consumed by a student → +2 invocations on asset #1
  const dynInv = (a: typeof LOGIC_ASSETS[0]) =>
    a.id === 1 ? a.inv + Math.round(state.usedCredits * 4) : a.inv

  // Dynamic yield per asset
  const dynYield = (id: number) => id === 1 ? liveYield : parseFloat((liveYield * 0.78).toFixed(3))

  function tierColor(tier: string) {
    if (tier === 'Master')   return GREEN
    if (tier === 'Advanced') return AMBER
    return SUBTLE
  }
  function tierBg(tier: string) {
    if (tier === 'Master')   return `${GREEN}18`
    if (tier === 'Advanced') return `${AMBER}18`
    return BORDER
  }

  return (
    <>
    {/* ── Dual-column layout: max-w-5xl centred, gap-12, equal height ── */}
    <div style={{
      maxWidth:1120, margin:'0 auto', width:'100%',
      display:'grid', gridTemplateColumns:'1fr 1fr', gap:48,
      paddingBottom:80,
    }}>

      {/* ── Left: Encoded Logic Assets ── */}
      <div style={{
        height:450, overflow:'hidden',
        display:'flex', flexDirection:'column',
        background:'rgba(255,255,255,0.72)',
        backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)',
        border:'1px solid rgba(16,185,129,0.18)',
        borderRadius:16, padding:'20px 22px',
      }}>
        <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.13em',
          textTransform:'uppercase', color:MUTED, marginBottom:12, flexShrink:0 }}>
          Encoded Logic Assets
        </p>
        <div style={{
          flex:1, minHeight:0, overflowY:'auto', display:'flex', flexDirection:'column', gap:7,
          scrollbarWidth:'none', msOverflowStyle:'none',
          maskImage:'linear-gradient(to bottom, black 80%, transparent 100%)',
          WebkitMaskImage:'linear-gradient(to bottom, black 80%, transparent 100%)',
        }}>
          {LOGIC_ASSETS.map(a => {
            const isSel   = a.id === selectedId
            const isNewRow = isHighlighted && a.id === 1
            return (
              <motion.div key={a.id}
                onClick={() => setSelectedId(a.id)}
                whileHover={{ x: isSel ? 0 : 3 }}
                style={{
                  border:`1px solid ${isNewRow ? GREEN : isSel ? GREEN : BORDER}`,
                  borderRadius:12, padding:'11px 14px', cursor:'pointer',
                  background: isNewRow ? `${GREEN}14` : isSel ? `${GREEN}05` : '#FFFFFF',
                  boxShadow: isNewRow ? `0 0 0 2px ${GREEN}44` : undefined,
                  transition:'border-color 0.18s, background 0.4s, box-shadow 0.4s',
                }}>
                <div style={{ display:'flex', alignItems:'center', gap:11 }}>
                  <div style={{ width:3, height:32, borderRadius:2, flexShrink:0,
                    background: (isNewRow || isSel) ? GREEN : BORDER,
                    transition:'background 0.18s' }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
                      <p style={{ fontSize:12, fontWeight:700,
                        color: isSel ? INK : BODY,
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {a.name}
                      </p>
                      <span style={{ fontSize:7.5, fontWeight:700, padding:'2px 7px',
                        borderRadius:99, flexShrink:0,
                        background:tierBg(a.tier), color:tierColor(a.tier) }}>
                        {a.tier}
                      </span>
                      {isNewRow && (
                        <motion.span
                          initial={{ opacity:0, scale:0.7 }}
                          animate={{ opacity:1, scale:1 }}
                          style={{ fontSize:7, fontWeight:800, color:GREEN,
                            background:`${GREEN}18`, padding:'1px 5px',
                            borderRadius:4, border:`1px solid ${GREEN}44`,
                            letterSpacing:'0.04em', flexShrink:0 }}>
                          NEW
                        </motion.span>
                      )}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontSize:10, color:SUBTLE }}>{a.subject}</span>
                      <span style={{ fontSize:9, color:SUBTLE }}>·</span>
                      <span style={{ fontSize:10, color:SUBTLE,
                        fontFamily:'ui-monospace,monospace' }}>
                        {dynInv(a).toLocaleString()} inv
                      </span>
                    </div>
                    {/* Live yield + hash for Master tier assets */}
                    {a.tier === 'Master' && (
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:3 }}>
                        <span style={{ fontSize:9, fontWeight:700, color:GREEN,
                          fontFamily:'ui-monospace,monospace' }}>
                          +{dynYield(a.id).toFixed(3)} SPRK/d
                        </span>
                        {state.logicHash && a.id === 1 && (
                          <span style={{ fontSize:8, color:SUBTLE,
                            fontFamily:'ui-monospace,monospace', letterSpacing:'0.02em' }}>
                            #{state.logicHash.slice(2, 10)}…
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <MiniSparkline pts={a.sparkline} color={isSel ? GREEN : '#D1D5DB'} />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* ── Right: Student Feedback Loop ── */}
      <div style={{
        height:450, overflow:'hidden',
        display:'flex', flexDirection:'column',
        background:'rgba(255,255,255,0.72)',
        backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)',
        border:'1px solid rgba(16,185,129,0.18)',
        borderRadius:16, padding:'20px 22px',
      }}>
        <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.13em',
          textTransform:'uppercase', color:MUTED, marginBottom:4, flexShrink:0 }}>
          Student Feedback Loop
        </p>
        <p style={{ fontSize:10, fontWeight:600, color:GREEN, marginBottom:12, flexShrink:0 }}>
          Refinement guide · 1,200+ learner sessions
        </p>
        <AnimatePresence mode="wait">
          <motion.div key={selectedId}
            initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-10 }}
            transition={{ duration:0.22 }}
            style={{
              flex:1, minHeight:0, overflowY:'auto', display:'flex', flexDirection:'column', gap:10,
              scrollbarWidth:'none', msOverflowStyle:'none',
              maskImage:'linear-gradient(to bottom, black 80%, transparent 100%)',
              WebkitMaskImage:'linear-gradient(to bottom, black 80%, transparent 100%)',
            }}>
            {/* Selected asset context */}
            <div style={{ padding:'10px 13px', borderRadius:11, marginBottom:2,
              background:`${GREEN}07`, border:`1px solid ${GREEN}22` }}>
              <p style={{ fontSize:12, fontWeight:700, color:INK }}>{asset.name}</p>
              <p style={{ fontSize:10, color:MUTED, marginTop:2 }}>
                {asset.subject} · {asset.tier} · {dynInv(asset).toLocaleString()} invocations
              </p>
            </div>
            {testimonials.map((t, i) => (
              <div key={i} style={{ padding:'12px 14px', borderRadius:12,
                border:`1px solid ${BORDER}`, background:'#FAFBFC' }}>
                <div style={{ display:'flex', gap:2, marginBottom:7 }}>
                  {Array.from({ length: t.stars }).map((_, si) => (
                    <span key={si} style={{ fontSize:10, color:AMBER }}>★</span>
                  ))}
                </div>
                <p style={{ fontSize:12, color:BODY, lineHeight:1.7, fontStyle:'italic',
                  marginBottom:8 }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <p style={{ fontSize:10, color:SUBTLE, fontWeight:600 }}>— {t.author}</p>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
    </>
  )
}

// ── Connection arcs drawn in pixel-space (no antimeridian issues) ────────────
// Uses the raw projection from MapContext → SVG x/y → quadratic bezier curves.
// Control point is elevated above the midpoint to produce natural globe-arc shapes.
function MapConnectionLines() {
  const ctx = useMapContext() as { projection?: (c:[number,number]) => [number,number]|null }
  const proj = ctx?.projection
  if (!proj) return null
  const tp = proj(MAP_TEACHER)
  if (!tp) return null
  return (
    <>
      {MAP_NODES.map((n, i) => {
        const np = proj(n.coords)
        if (!np) return null
        const mx  = (tp[0] + np[0]) / 2
        const my  = (tp[1] + np[1]) / 2
        const dx  = np[0] - tp[0]
        const dy  = np[1] - tp[1]
        const dist = Math.sqrt(dx * dx + dy * dy)
        // Quadratic bezier control point: arc always curves northward (up in SVG)
        const cpx = mx
        const cpy = my - dist * 0.28
        return (
          <path key={i}
            d={`M ${tp[0]},${tp[1]} Q ${cpx},${cpy} ${np[0]},${np[1]}`}
            stroke={GREEN} strokeWidth={1.6}
            strokeDasharray="4 5" strokeOpacity={0.82}
            fill="none"
          />
        )
      })}
    </>
  )
}

// ── High-Fidelity World Map (react-simple-maps, real country shapes) ──────────
function WorldMapHQ({ onTeacherClick }: { onTeacherClick: () => void }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return <div style={{ width:'100%', height:'100%', background:'#FFFFFF' }} />
  return (
    <ComposableMap
      projectionConfig={{ scale: 185, center: [10, 5] }}
      style={{ width:'100%', height:'100%', background:'#FFFFFF', display:'block' }}>

      {/* Real country paths — Natural Earth 110m TopoJSON */}
      <Geographies geography={GEO_URL}>
        {({ geographies }: { geographies: any[] }) =>
          geographies.map((geo: any) => (
            <Geography key={geo.rsmKey} geography={geo}
              fill="#F3F4F6" stroke="#FFFFFF" strokeWidth={0.8}
              style={{
                default:  { outline:'none' },
                hover:    { fill:'#E5E7EB', outline:'none' },
                pressed:  { outline:'none' },
              }} />
          ))
        }
      </Geographies>

      {/* Connection lines: pixel-space SVG lines via MapConnectionLines */}
      <MapConnectionLines />

      {/* Student glow nodes */}
      {MAP_NODES.map((n, i) => (
        <Marker key={i} coordinates={n.coords}>
          <motion.circle r={5} fill={GREEN} fillOpacity={0.35}
            animate={{ r:[5, 16], fillOpacity:[0.35, 0] }}
            transition={{ duration:2.4, repeat:Infinity, delay:n.delay, ease:'easeOut' }} />
          <circle r={3.5} fill={GREEN} />
        </Marker>
      ))}

      {/* Teacher origin — clickable red hotspot */}
      <Marker coordinates={MAP_TEACHER}>
        <g style={{ cursor:'pointer' }} onClick={onTeacherClick}>
          <motion.circle r={8} fill="none" stroke={CRIMSON} strokeWidth={1.5}
            animate={{ r:[7, 20], opacity:[0.9, 0] }}
            transition={{ duration:1.8, repeat:Infinity, ease:'easeOut' }} />
          <circle r={5.5} fill={CRIMSON} />
          <text y={-10} textAnchor="middle"
            fontSize={7.5} fontWeight="700" fill={CRIMSON}
            fontFamily="ui-monospace,monospace"
            style={{ pointerEvents:'none', userSelect:'none' }}>
            Expert-ZSF1220 · Shanghai
          </text>
        </g>
      </Marker>
    </ComposableMap>
  )
}

// ── Global Pedagogy Map ───────────────────────────────────────────────────────
function WorldPedagogyMap() {
  return (
    <div style={{ position:'relative', borderRadius:16, overflow:'hidden',
      background:'#F8FAFC', border:`1px solid ${BORDER}` }}>
      <svg viewBox="0 0 800 400" width="100%" style={{ display:'block' }}>
        {/* Continent fills */}
        {HQ_LAND_PATHS.map((d, i) => (
          <path key={i} d={d} fill="#EEF2F7" stroke="#CBD5E1" strokeWidth={0.5}
            strokeLinejoin="round" strokeLinecap="round" />
        ))}

        {/* Connection lines: teacher → student nodes */}
        {STUDENT_NODES.map((n, i) => (
          <motion.path key={i}
            d={`M ${TEACHER_NODE.x},${TEACHER_NODE.y} L ${n.x},${n.y}`}
            stroke={GREEN} strokeWidth={0.65} fill="none" strokeOpacity={0.28}
            strokeDasharray="4 7"
            animate={{ strokeDashoffset:[0, -22] }}
            transition={{ duration:2.2, repeat:Infinity, ease:'linear', delay:n.delay }} />
        ))}

        {/* Student pulse nodes */}
        {STUDENT_NODES.map((n, i) => (
          <g key={i}>
            <motion.circle cx={n.x} cy={n.y} r={5.5} fill={GREEN}
              animate={{ r:[5.5, 14], opacity:[0.25, 0] }}
              transition={{ duration:2.2, repeat:Infinity, delay:n.delay, ease:'easeOut' }} />
            <circle cx={n.x} cy={n.y} r={3.5} fill={GREEN} />
          </g>
        ))}

        {/* Teacher origin */}
        <motion.circle cx={TEACHER_NODE.x} cy={TEACHER_NODE.y} r={9} fill="none"
          stroke={CRIMSON} strokeWidth={1.5}
          animate={{ r:[8, 20], opacity:[0.9, 0] }}
          transition={{ duration:1.8, repeat:Infinity, ease:'easeOut' }} />
        <circle cx={TEACHER_NODE.x} cy={TEACHER_NODE.y} r={6} fill={CRIMSON} />
        <text x={TEACHER_NODE.x + 10} y={TEACHER_NODE.y - 9}
          fontSize={9} fontWeight="700" fill={CRIMSON}>{TEACHER_NODE.label}</text>
      </svg>

      {/* Stats overlay */}
      <div style={{ position:'absolute', bottom:12, right:14,
        background:'rgba(255,255,255,0.94)', borderRadius:9,
        padding:'6px 13px', border:`1px solid ${BORDER}` }}>
        <p style={{ fontSize:10, fontWeight:700, color:GREEN }}>
          {'\u25cf'} {STUDENT_NODES.length} active nodes &middot; 8 timezones
        </p>
      </div>
    </div>
  )
}

// ── Wisdom Bio Card — Financial Terminal Edition ──────────────────────────────
function WisdomBioCard() {
  const [playing, setPlaying] = useState(false)
  const { state, markRevenueSeen } = useSparkle()
  const [displayRevenue, setDisplayRevenue] = useState(state.lastSeenRevenue)

  // Arrival count-up: mount → 500ms delay → animate from lastSeenRevenue to expertRevenue
  useEffect(() => {
    const target = state.expertRevenue
    const from   = state.lastSeenRevenue
    if (target <= from) { setDisplayRevenue(target); return }
    const STEPS    = 38
    const INTERVAL = 28
    let step = 0
    const timerId = setTimeout(() => {
      const id = setInterval(() => {
        step++
        const t    = step / STEPS
        const ease = 1 - Math.pow(1 - t, 3)  // cubic ease-out
        setDisplayRevenue(parseFloat((from + (target - from) * ease).toFixed(1)))
        if (step >= STEPS) {
          clearInterval(id)
          setDisplayRevenue(target)
          markRevenueSeen()
        }
      }, INTERVAL)
    }, 500)
    return () => clearTimeout(timerId)
  }, []) // eslint-disable-line — intentionally mount-only

  const YIELD_BARS = [38, 52, 67, 44, 81, 73, 94]
  const DAY_LABELS = ['M','T','W','T','F','S','S']

  const MINTED_ASSETS = [
    { name:'Segment Diagram Pro',   tier:'Master',   status:'Active'  },
    { name:'Olympiad Logic Series', tier:'Master',   status:'Active'  },
    { name:'Motion Physics Set',    tier:'Advanced', status:'Active'  },
    { name:'Number Theory Bridge',  tier:'Advanced', status:'Seeded'  },
    { name:'Visual Algebra Pack',   tier:'Core',     status:'Seeded'  },
  ]

  return (
    <div style={{ padding:'22px 22px', display:'flex', flexDirection:'column', gap:18 }}>

      {/* ── Identity header ── */}
      <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
        <div style={{ width:46, height:46, borderRadius:'50%', background:`${EXPERT_THEME.color}12`,
          flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
          border:`2px solid ${EXPERT_THEME.color}40` }}>
          <span style={{ fontSize:11, fontWeight:900, color:EXPERT_THEME.color, fontFamily:'ui-monospace,monospace' }}>{EXPERT_THEME.initials}</span>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:14, fontWeight:800, color:INK, fontFamily:'ui-monospace,monospace' }}>
            Expert-ZSF1220 Studio
          </p>
          <p style={{ fontSize:9, color:GREEN, fontFamily:'ui-monospace,monospace', marginTop:5,
            letterSpacing:'0.03em', lineHeight:1.6, opacity:0.82 }}>
            STATUS: PROTOCOL ACTIVE
          </p>
          <p style={{ fontSize:8.5, color:MUTED, fontFamily:'ui-monospace,monospace', marginTop:3,
            letterSpacing:'0.02em', lineHeight:1.5 }}>
            HASH:&nbsp;
            <span style={{ color: state.logicHash ? GREEN : SUBTLE }}>
              {state.logicHash ?? '0x7F...3E2'}
            </span>
          </p>
          <p style={{ fontSize:9, color:SUBTLE, fontFamily:'ui-monospace,monospace', marginTop:2,
            letterSpacing:'0.02em' }}>
            ROYALTIES:&nbsp;
            <motion.span
              key={displayRevenue}
              initial={{ color: GREEN }}
              animate={{ color: MUTED }}
              transition={{ duration: 1.8 }}
              style={{ fontWeight:700, fontFamily:'ui-monospace,monospace' }}>
              {displayRevenue.toLocaleString('en', { minimumFractionDigits:1, maximumFractionDigits:1 })} SPRK
            </motion.span>
          </p>
        </div>
      </div>

      {/* ── Yield Analytics — 7-day bar chart ── */}
      <div style={{ borderRadius:12, border:`1px solid ${BORDER}`,
        padding:'13px 15px', background:'#F9FAFB' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <p style={{ fontSize:9, fontWeight:700, color:MUTED, letterSpacing:'0.12em',
            textTransform:'uppercase' }}>Yield Analytics</p>
          <p style={{ fontSize:9, color:GREEN, fontWeight:700,
            fontFamily:'ui-monospace,monospace' }}>Last 7 Days</p>
        </div>
        {/* Bar chart */}
        <div style={{ display:'flex', alignItems:'flex-end', gap:5, height:48 }}>
          {YIELD_BARS.map((h, i) => (
            <div key={i} style={{ flex:1, display:'flex', flexDirection:'column',
              alignItems:'center', gap:4, height:'100%', justifyContent:'flex-end' }}>
              {i === 6 && (
                <p style={{ fontSize:7.5, color:GREEN, fontWeight:700,
                  fontFamily:'ui-monospace,monospace', whiteSpace:'nowrap' }}>+94 $SPRK</p>
              )}
              <motion.div
                initial={{ height:0 }}
                animate={{ height:`${h}%` }}
                transition={{ duration:0.55, delay:i * 0.06, ease:[0.22,1,0.36,1] }}
                style={{ width:'100%', borderRadius:'3px 3px 0 0',
                  background: i === 6 ? GREEN : `${GREEN}38`,
                  minHeight:3 }} />
            </div>
          ))}
        </div>
        {/* Day labels */}
        <div style={{ display:'flex', gap:5, marginTop:6 }}>
          {DAY_LABELS.map((d, i) => (
            <p key={i} style={{ flex:1, textAlign:'center', fontSize:8,
              color: i === 6 ? GREEN : SUBTLE, fontWeight: i === 6 ? 700 : 400 }}>{d}</p>
          ))}
        </div>
      </div>

      {/* ── Minted Assets / Seeds ── */}
      <div>
        <p style={{ fontSize:9, fontWeight:700, color:MUTED, letterSpacing:'0.12em',
          textTransform:'uppercase', marginBottom:9 }}>Minted Assets / Seeds</p>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {MINTED_ASSETS.map(a => (
            <div key={a.name} style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'8px 12px', borderRadius:9,
              border:`1px solid ${BORDER}`, background:'rgba(255,255,255,0.72)' }}>
              <span style={{ fontSize:11, fontWeight:600, color:INK,
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                maxWidth:148, fontFamily:'ui-monospace,monospace' }}>
                {a.name}
              </span>
              <div style={{ display:'flex', gap:5, flexShrink:0 }}>
                <span style={{ fontSize:8, fontWeight:700, padding:'1px 6px', borderRadius:4,
                  border:'1px solid',
                  borderColor: a.tier === 'Master' ? `${GREEN}60` : a.tier === 'Advanced' ? `${AMBER}60` : BORDER,
                  color: a.tier === 'Master' ? GREEN : a.tier === 'Advanced' ? AMBER : SUBTLE }}>
                  {a.tier}
                </span>
                <span style={{ fontSize:8, fontWeight:700, padding:'1px 6px', borderRadius:4,
                  border:'1px solid',
                  borderColor: a.status === 'Active' ? `${GREEN}60` : BORDER,
                  color: a.status === 'Active' ? GREEN : SUBTLE }}>
                  {a.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Pedagogical Protocol ── */}
      <div style={{ padding:'12px 15px', borderRadius:11,
        background:`${GREEN}07`, border:`1px solid ${GREEN}1A` }}>
        <p style={{ fontSize:8.5, fontWeight:700, color:MUTED, letterSpacing:'0.12em',
          textTransform:'uppercase', marginBottom:6 }}>Pedagogical Protocol</p>
        <p style={{ fontSize:12.5, color:BODY, fontStyle:'italic', lineHeight:1.72 }}>
          &ldquo;Guide, do not dictate. Let the mind find its own path.&rdquo;
        </p>
      </div>

      {/* ── Voice Sample ── */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 13px',
        borderRadius:10, background:'#F9FAFB', border:`1px solid ${BORDER}` }}>
        <button onClick={() => setPlaying(!playing)}
          style={{ width:28, height:28, borderRadius:'50%', background:GREEN,
            border:'none', cursor:'pointer', flexShrink:0,
            display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ color:'#fff', fontSize:10 }}>{playing ? '\u23F8' : '\u25B6'}</span>
        </button>
        <Waveform playing={playing} />
        <span style={{ fontSize:9, color:SUBTLE, fontFamily:'ui-monospace,monospace',
          marginLeft:'auto' }}>0:42</span>
      </div>

      {/* ── Footer sync indicator ── */}
      <div style={{ display:'flex', alignItems:'center', gap:8,
        paddingTop:14, borderTop:`1px solid ${BORDER}` }}>
        <motion.div style={{ width:5, height:5, borderRadius:'50%', background:GREEN }}
          animate={{ opacity:[0.4,1,0.4] }} transition={{ duration:1.8, repeat:Infinity }} />
        <p style={{ fontSize:9.5, fontWeight:600, color:MUTED }}>
          Wisdom ID synced · Student &amp; Parent portals
        </p>
      </div>
    </div>
  )
}

// ── Testimonials Ticker ───────────────────────────────────────────────────────
function TestimonialsTicker() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIdx(v => (v + 1) % TESTIMONIALS.length), 3600)
    return () => clearInterval(id)
  }, [])
  const t = TESTIMONIALS[idx]
  return (
    <AnimatePresence mode="wait">
      <motion.div key={idx}
        initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
        transition={{ duration:0.32 }}>
        <p style={{ fontSize:12, color:BODY, lineHeight:1.65, fontStyle:'italic', marginBottom:7 }}>
          &ldquo;{t.text}&rdquo;
        </p>
        <p style={{ fontSize:10, color:SUBTLE, fontWeight:600 }}>&mdash; {t.author}</p>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Market Sidebar ────────────────────────────────────────────────────────────
function MarketSidebar() {
  const [students,    setStudents]    = useState(0)
  const [invocations, setInvocations] = useState(0)
  const [earned,      setEarned]      = useState(0)

  useEffect(() => {
    const steps = 44
    let i = 0
    const id = setInterval(() => {
      i++
      setStudents(Math.round(12 * i / steps))
      setInvocations(Math.round(247 * i / steps))
      setEarned(parseFloat((31.4 * i / steps).toFixed(1)))
      if (i >= steps) clearInterval(id)
    }, 28)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>

      {/* §S1 Market Demand Gaps */}
      <div style={{ border:`1px solid ${BORDER}`, borderRadius:20, padding:'22px 20px' }}>
        <p style={{ fontSize:9.5, fontWeight:700, letterSpacing:'0.12em',
          textTransform:'uppercase', color:GREEN, marginBottom:4 }}>Market Demand</p>
        <h3 style={{ fontSize:16, fontWeight:800, color:INK, marginBottom:16 }}>Logic Gaps</h3>
        <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
          {DEMAND_GAPS.map(g => (
            <div key={g.label}>
              <div style={{ display:'flex', justifyContent:'space-between',
                alignItems:'center', marginBottom:5 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  {g.hot && (
                    <span style={{ fontSize:8.5, fontWeight:700, padding:'1px 6px',
                      borderRadius:4, background:'#FEF2F2', color:CRIMSON }}>HOT</span>
                  )}
                  <span style={{ fontSize:12, fontWeight:600, color:INK }}>{g.label}</span>
                </div>
                <span style={{ fontSize:11, fontWeight:800, color:GREEN }}>{g.pct}%</span>
              </div>
              <div style={{ height:5, background:BORDER, borderRadius:3, overflow:'hidden' }}>
                <motion.div
                  initial={{ width:0 }}
                  animate={{ width:`${g.pct}%` }}
                  transition={{ duration:0.85, delay:0.15, ease:[0.22,1,0.36,1] }}
                  style={{ height:'100%', borderRadius:3,
                    background: g.hot
                      ? `linear-gradient(90deg, ${GREEN}, ${GREEN}BB)`
                      : GREEN }} />
              </div>
              <p style={{ fontSize:9.5, color:SUBTLE, marginTop:3 }}>{g.subject}</p>
            </div>
          ))}
        </div>
        <motion.button
          whileHover={{ opacity:0.88 }}
          whileTap={{ scale:0.97 }}
          style={{ marginTop:20, width:'100%', padding:'12px', borderRadius:12,
            background:GREEN, color:'#fff', fontWeight:700, fontSize:13,
            border:'none', cursor:'pointer' }}>
          Encode New DNA
        </motion.button>
      </div>

      {/* §S2 Student Testimonials */}
      <div style={{ border:`1px solid ${BORDER}`, borderRadius:20, padding:'22px 20px' }}>
        <p style={{ fontSize:9.5, fontWeight:700, letterSpacing:'0.12em',
          textTransform:'uppercase', color:GREEN, marginBottom:4 }}>Learner Voices</p>
        <h3 style={{ fontSize:16, fontWeight:800, color:INK, marginBottom:14 }}>Testimonials</h3>
        <div style={{ padding:'14px 16px', borderRadius:13,
          background:`${GREEN}07`, border:`1px solid ${GREEN}18`, minHeight:90 }}>
          <TestimonialsTicker />
        </div>
        <div style={{ display:'flex', justifyContent:'center', gap:5, marginTop:12 }}>
          {TESTIMONIALS.map((_, i) => (
            <div key={i} style={{ width:5, height:5, borderRadius:'50%',
              background: i < 3 ? GREEN : BORDER }} />
          ))}
        </div>
      </div>

      {/* §S3 Weekly Telemetry */}
      <div style={{ border:`1px solid ${BORDER}`, borderRadius:20, padding:'22px 20px' }}>
        <p style={{ fontSize:9.5, fontWeight:700, letterSpacing:'0.12em',
          textTransform:'uppercase', color:GREEN, marginBottom:4 }}>This Week</p>
        <h3 style={{ fontSize:16, fontWeight:800, color:INK, marginBottom:14 }}>Telemetry</h3>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[
            { label:'New Students',   value:`+${students}`,                icon:'\uD83D\uDC64' },
            { label:'Invocations',    value:`+${invocations}`,             icon:'\u26A1' },
            { label:'Earned (SPRK)',  value:`+${earned.toFixed(1)}`,       icon:'\uD83D\uDC8E' },
          ].map(item => (
            <div key={item.label}
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'10px 13px', borderRadius:10, background:'#FAFBFC', border:`1px solid ${BORDER}` }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:16 }}>{item.icon}</span>
                <span style={{ fontSize:12, color:MUTED }}>{item.label}</span>
              </div>
              <span style={{ fontSize:16, fontWeight:800, color:GREEN,
                fontVariantNumeric:'tabular-nums' }}>{item.value}</span>
            </div>
          ))}
        </div>
        <motion.button
          whileHover={{ background:GREEN, color:'#fff' }}
          style={{ marginTop:14, width:'100%', padding:'11px', borderRadius:11,
            background:'transparent', color:GREEN, fontWeight:700, fontSize:13,
            border:`1.5px solid ${GREEN}`, cursor:'pointer', transition:'all 0.22s' }}>
          Synchronize Wisdom
        </motion.button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function EducatorPage() {
  const { state, setLogicHash, addExpertRevenue } = useSparkle()

  // Telemetry counters
  const [students,    setStudents]    = useState(0)
  const [invocations, setInvocations] = useState(0)
  const [earned,      setEarned]      = useState(0)
  useEffect(() => {
    const steps = 44; let i = 0
    const id = setInterval(() => {
      i++
      setStudents(Math.round(12 * i / steps))
      setInvocations(Math.round(247 * i / steps))
      setEarned(parseFloat((31.4 * i / steps).toFixed(1)))
      if (i >= steps) clearInterval(id)
    }, 28)
    return () => clearInterval(id)
  }, [])

  // ── Frame 1: Total Royalties count-up + floating bubbles on mount ────────────
  const [royaltiesDisplay, setRoyaltiesDisplay] = useState(0)
  const [showBubbles,      setShowBubbles]      = useState(false)
  useEffect(() => {
    const target = state.expertRevenue
    const STEPS = 40; let i = 0
    setShowBubbles(true)
    const id = setInterval(() => {
      i++
      const t    = i / STEPS
      const ease = 1 - Math.pow(1 - t, 3)   // cubic ease-out
      setRoyaltiesDisplay(parseFloat((target * ease).toFixed(1)))
      if (i >= STEPS) {
        clearInterval(id)
        setRoyaltiesDisplay(target)
        setShowBubbles(false)
      }
    }, 35)
    return () => clearInterval(id)
  }, []) // eslint-disable-line — mount-only

  // Bio card toggle (triggered by map teacher-node click)
  const [showBioCard, setShowBioCard] = useState(false)

  // ── Frame 2: forge mint state ─────────────────────────────────────────────
  const [forgeMinted, setForgeMinted] = useState(false)

  // Frame 3 scroll ref — attached to the ASSET LEDGER section
  const frame3Ref = useRef<HTMLElement>(null)

  // Called by LogicForge when the mint ceremony completes.
  // Does NOT auto-scroll — user controls navigation after minting.
  const handleMintComplete = useCallback((hash: string) => {
    setForgeMinted(true)
    setLogicHash(hash)
    addExpertRevenue(0.1)
  }, [setLogicHash, addExpertRevenue])

  const INNER = {
    maxWidth:1440, margin:'0 auto',
    paddingLeft:'12%', paddingRight:'12%', width:'100%',
  } as const

  return (
    <div style={{ background:'#FFFFFF', color:INK }}>
      <Nav />

      {/* ══════════════════════════════════════════════════════
          Frame 1 — Global Command Center           100vh-nav
      ══════════════════════════════════════════════════════ */}
      <section style={{
        display:'flex', flexDirection:'column',
        background:'#FFFFFF',
        paddingTop:110,
      }}>
        <div style={{
          ...INNER,
          paddingBottom:60,
          display:'flex', flexDirection:'column',
        }}>

          {/* ── Title block ── */}
          <div style={{ flexShrink:0, marginBottom:20 }}>
            <p style={{ fontSize:22, fontWeight:700, letterSpacing:'0.15em',
              textTransform:'uppercase', color:GREEN, marginBottom:0,
              fontFamily:'var(--font-geist-sans), system-ui, sans-serif' }}>
              EXPERTISE COMMANDS EQUITY.
            </p>
            <h1 style={{ fontSize:40, fontWeight:700, color:'#000000', lineHeight:1.1,
              letterSpacing:'-0.02em', marginTop:16, whiteSpace:'nowrap' }}>
              <span style={{ fontFamily:'ui-monospace,monospace' }}>Expert-ZSF1220</span>
              {' '}Wisdom Studio
            </h1>
            <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.10em',
              textTransform:'uppercase', color:SUBTLE, marginTop:14,
              fontFamily:'ui-monospace,monospace' }}>
              CONSENSUS WEIGHT:&nbsp;<span style={{ color:GREEN }}>0.842</span>
              &nbsp;&nbsp;·&nbsp;&nbsp;
              <span style={{ color:MUTED, fontWeight:500, fontFamily:'inherit' }}>
                Click &#9679; origin node to reveal Wisdom ID
              </span>
            </p>
          </div>

          {/* ── Map + floating KPI columns ── */}
          <div style={{
            height:'calc(100vh - 410px)', minHeight:460, position:'relative',
            border:'1px solid rgba(243,244,246,0.10)',
            borderRadius:16,
            overflow:'hidden', background:'#FFFFFF',
          }}>
            {/* Map — scale 1.3, fills full container */}
            <div style={{ position:'absolute', inset:0, transform:'scale(1.3)', transformOrigin:'center center' }}>
              <WorldMapHQ onTeacherClick={() => setShowBioCard(v => !v)} />
            </div>

            {/* ── Royalty bubbles — fly from center to Total Royalties card on mount ── */}
            {showBubbles && (
              <>
                <motion.div
                  initial={{ x:0, y:0, opacity:0, scale:0.5 }}
                  animate={{ x:-390, y:0, opacity:[0, 1, 1, 1, 0], scale:[0.5, 2.0, 2.0, 2.0, 1.6] }}
                  transition={{ duration:3.5, delay:0.2, ease:[0.22,1,0.36,1] }}
                  style={{ position:'absolute', left:'50%', top:'38%', zIndex:30, pointerEvents:'none',
                    background:GREEN, borderRadius:24, padding:'7px 14px',
                    display:'flex', alignItems:'center', gap:6,
                    boxShadow:`0 8px 32px ${GREEN}88`, border:`1.5px solid ${GREEN}` }}>
                  <span style={{ fontSize:10, fontWeight:800, color:'#fff', fontFamily:'ui-monospace,monospace' }}>
                    +{(state.expertRevenue * 0.0008).toFixed(3)} SPRK
                  </span>
                  <span style={{ fontSize:9, color:'rgba(255,255,255,0.82)' }}>royalty credit</span>
                </motion.div>
                <motion.div
                  initial={{ x:0, y:0, opacity:0, scale:0.4 }}
                  animate={{ x:-350, y:0, opacity:[0, 1, 1, 1, 0], scale:[0.4, 2.0, 2.0, 2.0, 1.6] }}
                  transition={{ duration:3.5, delay:0.6, ease:[0.22,1,0.36,1] }}
                  style={{ position:'absolute', left:'50%', top:'56%', zIndex:30, pointerEvents:'none',
                    background:GREEN, borderRadius:20, padding:'5px 12px',
                    display:'flex', alignItems:'center', gap:5,
                    boxShadow:`0 6px 24px ${GREEN}88`, border:`1.5px solid ${GREEN}` }}>
                  <span style={{ fontSize:9.5, fontWeight:700, color:'#fff', fontFamily:'ui-monospace,monospace' }}>
                    +{(state.expertRevenue * 0.0005).toFixed(3)} SPRK
                  </span>
                </motion.div>
              </>
            )}

            {/* ── LEFT column: 3 cards ── Encoded DNA · Total Royalties · Students Reached */}
            <div style={{
              position:'absolute', left:20, top:'50%', transform:'translateY(-50%)', height:420,
              zIndex:10,
              display:'flex', flexDirection:'column', gap:8,
              width:133,
            }}>
              {ASSET_METRICS.slice(0, 3).map((m, idx) => (
                <motion.div key={m.label}
                  whileHover={{ scale:1.05, background:'rgba(255,255,255,0.10)' }}
                  transition={{ duration:0.22, ease:'easeOut' }}
                  style={{
                    flex:1,
                    padding:'11px 13px',
                    background:'rgba(255,255,255,0.04)',
                    backdropFilter:'blur(40px)',
                    WebkitBackdropFilter:'blur(40px)',
                    border:'1px solid rgba(255,255,255,0.10)',
                    borderRadius:13,
                    display:'flex', flexDirection:'column', justifyContent:'space-between',
                    cursor:'default',
                  }}>
                  <span style={{ fontSize:16, marginBottom:4, display:'block' }}>{m.icon}</span>
                  <div>
                    <p style={{ fontSize:7.5, fontWeight:700, letterSpacing:'0.10em',
                      textTransform:'uppercase', color:MUTED, marginBottom:4 }}>{m.label}</p>
                    <p style={{ fontSize:19, fontWeight:900, color:INK, lineHeight:1,
                      fontFamily:'ui-monospace,monospace', fontVariantNumeric:'tabular-nums',
                      letterSpacing:'-0.02em' }}>
                      {m.label === 'Total Royalties'
                        ? royaltiesDisplay.toLocaleString('en', { minimumFractionDigits:1, maximumFractionDigits:1 })
                        : m.value}
                    </p>
                    <p style={{ fontSize:8.5, color:SUBTLE, marginTop:3 }}>{m.sub}</p>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:6 }}>
                    <motion.div style={{ width:4, height:4, borderRadius:'50%', background:GREEN, flexShrink:0 }}
                      animate={{ opacity:[0.4,1,0.4] }}
                      transition={{ duration:2, repeat:Infinity, delay:idx*0.5 }} />
                    <span style={{ fontSize:7.5, color:GREEN, fontWeight:600 }}>Live</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ── RIGHT column: 4 cards ── Total Invocations + 3 telemetry ── */}
            <div style={{
              position:'absolute', right:20, top:'50%', transform:'translateY(-50%)', height:420,
              zIndex:10,
              display:'flex', flexDirection:'column', gap:8,
              width:133,
            }}>
              {/* All 4 right-column cards as a unified array */}
              {([
                { label: ASSET_METRICS[3].label, value: ASSET_METRICS[3].value, sub: ASSET_METRICS[3].sub,  icon: ASSET_METRICS[3].icon, green: false },
                { label:'New Students (7d)', value:`+${students}`,          sub:'',                         icon:'👤',                   green: true  },
                { label:'Invocations (7d)',  value:`+${invocations}`,        sub:'',                         icon:'⚡',                   green: true  },
                { label:'Earned SPRK (7d)', value:`+${earned.toFixed(1)}`,  sub:'',                         icon:'💎',                   green: true  },
              ] as { label:string; value:string; sub:string; icon:string; green:boolean }[]).map((item, idx) => (
                <motion.div key={item.label}
                  whileHover={{ scale:1.05, background:'rgba(255,255,255,0.10)' }}
                  transition={{ duration:0.22, ease:'easeOut' }}
                  style={{
                    flex:1,
                    padding:'11px 13px',
                    background:'rgba(255,255,255,0.04)',
                    backdropFilter:'blur(40px)',
                    WebkitBackdropFilter:'blur(40px)',
                    border:'1px solid rgba(255,255,255,0.10)',
                    borderRadius:13,
                    display:'flex', flexDirection:'column', justifyContent:'space-between',
                    cursor:'default',
                  }}>
                  <span style={{ fontSize:16, marginBottom:4, display:'block' }}>{item.icon}</span>
                  <div>
                    <p style={{ fontSize:7.5, fontWeight:700, letterSpacing:'0.10em',
                      textTransform:'uppercase', color:MUTED, marginBottom:4 }}>{item.label}</p>
                    <p style={{ fontSize:19, fontWeight:900,
                      color: item.green ? GREEN : INK, lineHeight:1,
                      fontFamily:'ui-monospace,monospace', fontVariantNumeric:'tabular-nums',
                      letterSpacing:'-0.02em' }}>
                      {item.value}
                    </p>
                    {item.sub && <p style={{ fontSize:8.5, color:SUBTLE, marginTop:3 }}>{item.sub}</p>}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:6 }}>
                    <motion.div style={{ width:4, height:4, borderRadius:'50%', background:GREEN, flexShrink:0 }}
                      animate={{ opacity:[0.4,1,0.4] }}
                      transition={{ duration:2, repeat:Infinity, delay:idx*0.45 }} />
                    <span style={{ fontSize:7.5, color:GREEN, fontWeight:600 }}>Live</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Wisdom ID opens as a fixed right-side drawer — see page root */}
          </div>

        </div>
        {/* ── Frame divider 1 ── full-width gradient line */}
        <div style={{
          flexShrink:0, height:1,
          background:'linear-gradient(to right, transparent 0%, rgba(229,231,235,0.85) 12%, rgba(229,231,235,0.85) 88%, transparent 100%)',
        }} />
      </section>

      {/* ══════════════════════════════════════════════════════
          Frame 2 — THE LOGIC FORGE                 100vh
      ══════════════════════════════════════════════════════ */}
      <section style={{
        height:'100vh', overflow:'hidden',
        display:'flex', flexDirection:'column',
      }}>
        <div style={{
          ...INNER, flex:1, minHeight:0,
          paddingTop:55, paddingBottom:55,
          display:'flex', flexDirection:'column',
        }}>
          {/* Header — title only (mint button now embedded in LogicForge ingestion strip) */}
          <div style={{ flexShrink:0, marginBottom:16 }}>
            <p style={{ fontSize:9.5, fontWeight:700, letterSpacing:'0.12em',
              textTransform:'uppercase', color:GREEN, marginBottom:5 }}>
              AI Reconstruction Engine
            </p>
            <h2 style={{ fontSize:23, fontWeight:800, color:INK,
              fontFamily:'ui-monospace,monospace', letterSpacing:'-0.01em' }}>
              THE LOGIC FORGE
            </h2>
            <p style={{ fontSize:13, color:MUTED, marginTop:5 }}>
              Ingest materials · forge Socratic logic · mint as a verified Wisdom Asset
            </p>
          </div>

          {/* Logic Forge — fills remaining height */}
          <style>{`@keyframes mint-pulse{0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,0)}50%{box-shadow:0 0 0 9px rgba(16,185,129,0.26)}}`}</style>
          <div style={{ flex:1, minHeight:0, overflow:'hidden' }}>
            <LogicForge onMintComplete={handleMintComplete} />
          </div>

        </div>
        {/* ── Frame divider 2 ── full-width gradient line */}
        <div style={{
          flexShrink:0, height:1,
          background:'linear-gradient(to right, transparent 0%, rgba(229,231,235,0.85) 12%, rgba(229,231,235,0.85) 88%, transparent 100%)',
        }} />
      </section>

      {/* ══════════════════════════════════════════════════════
          Frame 3 — ASSET LEDGER & REFINEMENT       100vh
      ══════════════════════════════════════════════════════ */}
      <section ref={frame3Ref} style={{
        display:'flex', flexDirection:'column',
        background:'#FFFFFF',
      }}>
        <div style={{
          ...INNER,
          paddingTop:55, paddingBottom:60,
          display:'flex', flexDirection:'column',
        }}>
          {/* Header */}
          <div style={{ flexShrink:0, marginBottom:16 }}>
            <p style={{ fontSize:9.5, fontWeight:700, letterSpacing:'0.12em',
              textTransform:'uppercase', color:GREEN, marginBottom:5 }}>
              Encoded Wisdom · Market Intelligence
            </p>
            <h2 style={{ fontSize:23, fontWeight:800, color:INK,
              fontFamily:'ui-monospace,monospace', letterSpacing:'-0.01em' }}>
              ASSET LEDGER &amp; REFINEMENT
            </h2>
            <p style={{ fontSize:13, color:MUTED, marginTop:5 }}>
              Market gaps guide creation · inventory tracks assets · learner feedback drives refinement
            </p>
          </div>

          {/* Asset Ledger */}
          <div>
            <AssetLedger highlightNew={forgeMinted} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          Wisdom ID Drawer — fixed right-side, 30vw, blur glass
      ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showBioCard && (
          <>
            {/* Scrim */}
            <motion.div
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              transition={{ duration:0.2 }}
              onClick={() => setShowBioCard(false)}
              style={{
                position:'fixed', inset:0, zIndex:90,
                background:'rgba(0,0,0,0.14)',
                backdropFilter:'blur(3px)',
                WebkitBackdropFilter:'blur(3px)',
                cursor:'pointer',
              }} />

            {/* Drawer panel */}
            <motion.aside
              initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }}
              transition={{ duration:0.34, ease:[0.22,1,0.36,1] }}
              style={{
                position:'fixed', top:0, right:0,
                height:'100vh', width:'30vw', minWidth:360, maxWidth:480,
                zIndex:100,
                background:'rgba(255,255,255,0.94)',
                backdropFilter:'blur(28px)',
                WebkitBackdropFilter:'blur(28px)',
                borderLeft:'1px solid rgba(243,244,246,0.95)',
                boxShadow:'-12px 0 56px rgba(0,0,0,0.08)',
                display:'flex', flexDirection:'column',
                overflowY:'auto',
              }}>

              {/* Sticky drawer header */}
              <div style={{
                padding:'20px 24px', borderBottom:`1px solid ${BORDER}`,
                display:'flex', alignItems:'center', justifyContent:'space-between',
                flexShrink:0, position:'sticky', top:0,
                background:'rgba(255,255,255,0.94)',
                backdropFilter:'blur(28px)', WebkitBackdropFilter:'blur(28px)',
                zIndex:1,
              }}>
                <div>
                  <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.12em',
                    textTransform:'uppercase', color:GREEN, marginBottom:4,
                    fontFamily:'ui-monospace,monospace' }}>Wisdom ID</p>
                  <p style={{ fontSize:14, fontWeight:800, color:INK,
                    fontFamily:'ui-monospace,monospace' }}>Expert-ZSF1220</p>
                </div>
                <button
                  onClick={() => setShowBioCard(false)}
                  style={{
                    width:30, height:30, borderRadius:'50%',
                    border:`1px solid ${BORDER}`, background:'#F9FAFB',
                    cursor:'pointer', display:'flex', alignItems:'center',
                    justifyContent:'center', fontSize:13, color:MUTED,
                    flexShrink:0,
                  }}>
                  ✕
                </button>
              </div>

              {/* WisdomBioCard content */}
              <div style={{ flex:1 }}>
                <WisdomBioCard />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}
