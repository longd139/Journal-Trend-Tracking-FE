// src/constants/mockData.js

export const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  size: ((i * 13) % 5) + 2,
  left: (i * 37 + 7) % 100,
  top: (i * 29 + 11) % 100,
  color: ['#4F8CFF', '#8B5CF6', '#00D1B2'][i % 3],
  delay: (i * 0.35) % 6,
  dur: ((i * 0.71) % 8) + 12,
}));

export const FIELD_DATA = [
  { n: 'AI & ML', v: 34, c: '#4F8CFF' },
  { n: 'Biotech', v: 22, c: '#8B5CF6' },
  { n: 'Climate', v: 18, c: '#00D1B2' },
  { n: 'Quantum', v: 14, c: '#F59E0B' },
  { n: 'Neuro', v: 12, c: '#EF4444' },
];

export const PUB_DATA = [
  { m: 'Jan', ai: 2840, bio: 1920, cli: 1340, qc: 890 },
  { m: 'Feb', ai: 3120, bio: 2080, cli: 1480, qc: 960 },
  { m: 'Mar', ai: 3580, bio: 2240, cli: 1580, qc: 1040 },
  { m: 'Apr', ai: 3920, bio: 2380, cli: 1720, qc: 1120 },
  { m: 'May', ai: 4210, bio: 2560, cli: 1840, qc: 1200 },
  { m: 'Jun', ai: 4680, bio: 2720, cli: 1960, qc: 1320 },
  { m: 'Jul', ai: 5100, bio: 2890, cli: 2080, qc: 1420 },
  { m: 'Aug', ai: 5480, bio: 3040, cli: 2200, qc: 1540 },
  { m: 'Sep', ai: 5890, bio: 3180, cli: 2340, qc: 1680 },
  { m: 'Oct', ai: 6240, bio: 3350, cli: 2460, qc: 1800 },
  { m: 'Nov', ai: 6780, bio: 3520, cli: 2580, qc: 1940 },
  { m: 'Dec', ai: 7200, bio: 3680, cli: 2720, qc: 2100 },
];

export const CIT_DATA = [
  { y: '2019', v: 8.2 },
  { y: '2020', v: 12.4 },
  { y: '2021', v: 18.9 },
  { y: '2022', v: 26.8 },
  { y: '2023', v: 38.4 },
  { y: '2024', v: 52.1 },
];

const PAPERS = [
  {
    title: 'Scaling Laws for Neural Language Models',
    authors: 'Kaplan, Brown et al.',
    year: 2024,
    citations: 2847,
    field: 'AI & ML',
    trend: '+18%',
  },
  {
    title: 'CRISPR-Cas9 Precision Editing in Rare Genetic Diseases',
    authors: 'Zhang, Liu et al.',
    year: 2024,
    citations: 2341,
    field: 'Biotech',
    trend: '+12%',
  },
  {
    title: 'Climate Tipping Points and Cascade Effects in Global Ecosystems',
    authors: 'Lenton et al.',
    year: 2024,
    citations: 1983,
    field: 'Climate',
    trend: '+24%',
  },
  {
    title: 'Fault-Tolerant Quantum Computing with Logical Qubits',
    authors: 'Preskill, Harrow et al.',
    year: 2024,
    citations: 1654,
    field: 'Quantum',
    trend: '+31%',
  },
  {
    title: 'Neural Correlates of Conscious Awareness in Cortex',
    authors: 'Koch, Friston et al.',
    year: 2024,
    citations: 1428,
    field: 'Neuro',
    trend: '+9%',
  },
  {
    title: 'AlphaFold3 Applications in Drug Target Discovery',
    authors: 'Jumper, Hassabis et al.',
    year: 2024,
    citations: 1287,
    field: 'AI & ML',
    trend: '+45%',
  },
];

export const APIS = [
  {
    name: 'Google Scholar',
    up: 98.7,
    lat: '1.2ms',
    req: '142.8K',
    status: 'ok',
  },
  { name: 'IEEE Xplore', up: 99.1, lat: '0.8ms', req: '98.4K', status: 'ok' },
  {
    name: 'Springer Link',
    up: 97.8,
    lat: '1.4ms',
    req: '76.2K',
    status: 'warn',
  },
  { name: 'Scopus API', up: 99.3, lat: '0.6ms', req: '112.0K', status: 'ok' },
];

const USERS_TABLE = [
  {
    id: 'U-001',
    name: 'Dr. Sarah Chen',
    email: 's.chen@mit.edu',
    role: 'Researcher',
    status: 'active',
    last: '2 min ago',
    papers: 127,
  },
  {
    id: 'U-002',
    name: 'Prof. James Patel',
    email: 'j.patel@stanford.edu',
    role: 'Professor',
    status: 'active',
    last: '15 min ago',
    papers: 284,
  },
  {
    id: 'U-003',
    name: 'Dr. Maria Santos',
    email: 'm.santos@ox.ac.uk',
    role: 'Researcher',
    status: 'idle',
    last: '1 hr ago',
    papers: 93,
  },
  {
    id: 'U-004',
    name: 'Dr. Liu Wei',
    email: 'l.wei@tsinghua.edu.cn',
    role: 'Researcher',
    status: 'active',
    last: '5 min ago',
    papers: 156,
  },
  {
    id: 'U-005',
    name: 'Prof. Anna Kowalski',
    email: 'a.kowalski@eth.ch',
    role: 'Professor',
    status: 'offline',
    last: '2 days ago',
    papers: 312,
  },
  {
    id: 'U-006',
    name: 'Dr. Raj Sharma',
    email: 'r.sharma@iit.ac.in',
    role: 'Researcher',
    status: 'active',
    last: 'Just now',
    papers: 78,
  },
];

export const INSIGHTS = [
  {
    topic: 'Large Multimodal Models',
    growth: '+234%',
    papers: 1847,
    c: '#4F8CFF',
    desc: 'Vision-language convergence enabling unprecedented cross-modal reasoning',
  },
  {
    topic: 'mRNA Vaccine Platforms',
    growth: '+189%',
    papers: 1234,
    c: '#8B5CF6',
    desc: 'Expanding beyond infectious disease into targeted cancer immunotherapy',
  },
  {
    topic: 'Carbon Capture Tech',
    growth: '+156%',
    papers: 892,
    c: '#00D1B2',
    desc: 'Direct air capture costs now below $200/tonne CO₂ at scale',
  },
  {
    topic: 'Neuromorphic Computing',
    growth: '+143%',
    papers: 743,
    c: '#F59E0B',
    desc: 'Brain-inspired chips achieving ultra-low-power edge AI deployment',
  },
];

import { BarChart2, TrendingUp, Brain, Eye, Search, Zap } from 'lucide-react';
export const FEATURES = [
  {
    Icon: BarChart2,
    label: 'Publication Analytics',
    desc: 'Track trends across 50M+ papers from all major journals worldwide',
    c: '#4F8CFF',
  },
  {
    Icon: TrendingUp,
    label: 'Citation Tracking',
    desc: 'Monitor citation velocity and impact factor evolution in real time',
    c: '#8B5CF6',
  },
  {
    Icon: Brain,
    label: 'AI Recommendations',
    desc: 'GPT-powered research discovery tailored to your specific domain',
    c: '#00D1B2',
  },
  {
    Icon: Eye,
    label: 'Research Visualization',
    desc: 'Interactive knowledge graphs and citation network topology maps',
    c: '#F59E0B',
  },
  {
    Icon: Search,
    label: 'Academic Search Engine',
    desc: 'Semantic full-text search with context-aware relevance ranking',
    c: '#EF4444',
  },
  {
    Icon: Zap,
    label: 'Trend Forecasting',
    desc: 'Predictive models for emerging research directions and hot topics',
    c: '#8B5CF6',
  },
];

const DB_TABLES = [
  {
    name: 'publications',
    rows: '50.2M',
    size: '840 GB',
    growth: '+2.1%',
    status: 'ok',
  },
  {
    name: 'citations',
    rows: '412.8M',
    size: '1.1 TB',
    growth: '+3.4%',
    status: 'ok',
  },
  {
    name: 'authors',
    rows: '8.4M',
    size: '120 GB',
    growth: '+1.2%',
    status: 'ok',
  },
  {
    name: 'journals',
    rows: '148K',
    size: '8.4 GB',
    growth: '+0.4%',
    status: 'ok',
  },
  {
    name: 'keywords',
    rows: '2.1M',
    size: '42 GB',
    growth: '+5.7%',
    status: 'ok',
  },
  {
    name: 'api_logs',
    rows: '890M',
    size: '340 GB',
    growth: '+8.2%',
    status: 'warn',
  },
];
