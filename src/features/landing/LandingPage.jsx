import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'motion/react';
import { ArrowRight, Check, ChevronDown } from 'lucide-react';
import WordsPullUp from '../../components/prisma/WordsPullUp';
import WordsPullUpMultiStyle from '../../components/prisma/WordsPullUpMultiStyle';
import ScitrackSLogo from '../../components/prisma/ScitrackSLogo';

/* ═══════════════════════════════════════════════════════════════════════════
 Section 1 — Hero
 ═══════════════════════════════════════════════════════════════════════════ */

function HeroSection() {
 const navigate = useNavigate();

 const scrollTo = (id) => {
 const el = document.getElementById(id);
 if (el) el.scrollIntoView({ behavior: 'smooth' });
 };

 return (
 <section className="relative min-h-[100dvh] p-4 md:p-6 prisma-page">
  <div className="absolute inset-4 md:inset-6 rounded-2xl md:rounded-[2rem] overflow-hidden">
  {/* Background video */}
  <video
   autoPlay
   loop
   muted
   playsInline
   className="absolute inset-0 w-full h-full object-cover"
   src="https://videos.pexels.com/video-files/33592812/14279725_1440_2560_45fps.mp4"
  />

  {/* Noise overlay */}
  <div className="noise-overlay opacity-[0.7]" style={{ mixBlendMode: 'overlay' }} />

  {/* Gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />

  {/* Auth buttons — top right */}
  <div className="absolute top-10 sm:top-0 right-0 z-20 flex items-center gap-2 p-4 md:p-6">
   <button
   onClick={() => navigate('/register')}
   className="text-[10px] sm:text-xs md:text-sm font-medium px-3 py-1.5 md:px-4 md:py-2 rounded-full transition-all duration-200 active:scale-[0.97]"
   style={{ color: 'rgba(225, 224, 204, 0.8)' }}
   onMouseEnter={(e) => { e.target.style.color = '#E1E0CC'; }}
   onMouseLeave={(e) => { e.target.style.color = 'rgba(225, 224, 204, 0.8)'; }}
   >
   Register
   </button>
   <button
   onClick={() => navigate('/login')}
   className="text-[10px] sm:text-xs md:text-sm font-medium px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-[#DEDBC8] text-black transition-all duration-200 hover:scale-105 active:scale-[0.97]"
   >
   Sign In
   </button>
  </div>

  {/* Navbar — black pill hanging from top */}
  <nav className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
   <div className="bg-black rounded-b-2xl md:rounded-b-3xl px-4 py-2 md:px-8">
   <div className="flex items-center gap-3 sm:gap-6 md:gap-12 lg:gap-14">
    {[
    { label: 'Our story', id: 'about' },
    { label: 'Features', id: 'features' },
    { label: 'Search', href: '/login' },
    { label: 'Analytics', href: '/login' },
    { label: 'Pricing', href: '/register' },
    ].map((item) => (
    <a
     key={item.label}
     href={item.id ? `#${item.id}` : item.href}
     onClick={(e) => {
     if (item.id) {
      e.preventDefault();
      scrollTo(item.id);
     }
     }}
     className="text-[10px] sm:text-xs md:text-sm whitespace-nowrap transition-colors duration-200 active:scale-[0.97]"
     style={{ color: 'rgba(225, 224, 204, 0.8)' }}
     onMouseEnter={(e) => { e.target.style.color = '#E1E0CC'; }}
     onMouseLeave={(e) => { e.target.style.color = 'rgba(225, 224, 204, 0.8)'; }}
    >
     {item.label}
    </a>
    ))}
   </div>
   </div>
  </nav>

  {/* Hero Content — bottom aligned */}
  <div className="absolute bottom-0 left-0 right-0 z-10 p-6 md:p-10 lg:p-14">
   <div className="grid grid-cols-12 gap-6 md:gap-10 items-end">
   {/* Left — Giant heading (7 cols, slightly smaller for balance) */}
   <div className="col-span-12 lg:col-span-7">
    <WordsPullUp
    text="SCITRACK"
    showAsterisk
    className="font-medium leading-[0.85] tracking-[-0.07em] text-[#E1E0CC] text-[18vw] sm:text-[16vw] md:text-[14vw] lg:text-[12vw] xl:text-[11vw] 2xl:text-[12vw]"
    />
   </div>

   {/* Right — Description + CTA (5 cols) */}
   <div className="col-span-12 lg:col-span-5 flex flex-col gap-5 md:gap-6 pb-2 md:pb-4">
    <motion.p
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
    className="text-xs sm:text-sm md:text-base leading-[1.25]"
    style={{ color: 'rgba(225, 224, 204, 0.7)' }}
    >
    An academic research platform that helps you discover,
    search by keyword, and track trending papers across 50M+
    publications — built for researchers, by researchers.
    </motion.p>

    	    	    	    	    	    <motion.button
		    initial={{ y: 20, opacity: 0 }}
		    animate={{ y: 0, opacity: 1 }}
		    transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
		    onClick={() => navigate('/register')}
		    className="group relative flex items-center transition-all duration-500 bg-[#DEDBC8] hover:bg-black rounded-full pl-14 pr-8 py-2.5 text-black hover:text-white font-medium text-sm sm:text-base w-fit active:scale-[0.98]"
		    >
		    <span className="absolute left-1.5 group-hover:left-[calc(100%-40px)] sm:group-hover:left-[calc(100%-44px)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] bg-black group-hover:bg-[#DEDBC8] rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center z-10">
		     <ArrowRight size={16} className="text-[#DEDBC8] group-hover:text-black transition-colors duration-500" />
		    </span>
		    <span className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-8 sm:group-hover:-translate-x-10">
		     Explore more
		    </span>
		    </motion.button>
   </div>
   </div>
  </div>

  {/* Scroll-down indicator */}
  <motion.button
   onClick={() => scrollTo('about')}
   initial={{ opacity: 0 }}
   animate={{ opacity: 1 }}
   transition={{ delay: 1.2, duration: 0.6 }}
   className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 cursor-pointer group active:scale-[0.95]"
   aria-label="Scroll to our story"
  >
   <span className="text-[9px] uppercase tracking-[0.2em] text-[#DEDBC8]/50 group-hover:text-[#DEDBC8]/80 transition-colors">
   Scroll
   </span>
   <motion.span
   animate={{ y: [0, 8, 0] }}
   transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
   className="w-6 h-6 rounded-full border border-[#DEDBC8]/30 flex items-center justify-center group-hover:border-[#DEDBC8]/60 transition-colors"
   >
   <ChevronDown size={12} className="text-[#DEDBC8]/50 group-hover:text-[#DEDBC8] transition-colors" />
   </motion.span>
  </motion.button>
  </div>
 </section>
 );
}

/* ═══════════════════════════════════════════════════════════════════════════
 Section 2 — Our Story
 ═══════════════════════════════════════════════════════════════════════════ */

const TRENDING_PAPERS = [
 {
 title: 'Scaling Laws for Neural Language Models',
 field: 'AI & ML',
 trend: '+234%',
 image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop',
 },
 {
 title: 'mRNA Vaccine Platforms Against Infectious Diseases',
 field: 'Medicine',
 trend: '+201%',
 image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&h=400&fit=crop',
 },
 {
 title: 'Climate Tipping Points in Global Ecosystems',
 field: 'Climate',
 trend: '+156%',
 image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600&h=400&fit=crop',
 },
 {
 title: 'Fault-Tolerant Quantum Computing with Logical Qubits',
 field: 'Quantum',
 trend: '+312%',
 image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=400&fit=crop',
 },
 {
 title: 'Deep Learning for Protein Structure Prediction',
 field: 'Bioinformatics',
 trend: '+267%',
 image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&h=400&fit=crop',
 },
];

const STORY_ADVANTAGES = [
 {
 num: '01',
 title: 'One search, every database.',
 desc: 'No more jumping between Google Scholar, IEEE, Scopus, and Springer. SCITRACK indexes them all — 50M+ papers in a single search box.',
 },
 {
 num: '02',
 title: 'Trends before they trend.',
 desc: 'Our citation analysis engine detects emerging research directions months before they hit the mainstream — giving you a head start on your next breakthrough.',
 },
 {
 num: '03',
 title: 'Your research, organized.',
 desc: 'Bookmark, tag, and build custom reading lists. Export citations in any format. Turn weeks of literature review into hours of focused insight.',
 },
];

function AboutSection() {
 const navigate = useNavigate();
 const sectionRef = useRef(null);
 const { scrollYProgress } = useScroll({
 target: sectionRef,
 offset: ['start end', 'end start'],
 });

 // Scroll-driven values: image zooms out, overlay fades
 const imageScale = useTransform(scrollYProgress, [0, 0.5], [1.25, 1]);
 const overlayOpacity = useTransform(scrollYProgress, [0, 0.4], [0.85, 0.5]);

 return (
 <section ref={sectionRef} id="about" className="relative bg-black prisma-page">
  {/* ── Hero-style image banner with scroll-driven reveal ──────── */}
  <div className="relative h-[70vh] md:h-[80vh] overflow-hidden">
  <motion.img
   src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1400&h=900&fit=crop"
   alt="Library"
   className="absolute inset-0 w-full h-full object-cover"
   style={{ scale: imageScale }}
  />
  <motion.div
   className="absolute inset-0 bg-black"
   style={{ opacity: overlayOpacity }}
  />
  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
  <div className="noise-overlay opacity-[0.04]" style={{ mixBlendMode: 'overlay' }} />

  {/* Story text overlay — left-aligned, NOT centered (anti-center bias) */}
  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-14 lg:p-20">
   <div className="max-w-4xl">
   <motion.p
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="text-[10px] sm:text-xs font-medium mb-4 text-[#DEDBC8] tracking-widest uppercase"
   >
    Our Story
   </motion.p>
   <motion.h2
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: 0.1 }}
    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-[#E1E0CC] max-w-3xl leading-[1.08]"
   >
    Every researcher knows the feeling.
   </motion.h2>
   <motion.p
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: 0.25 }}
    className="text-sm sm:text-base md:text-lg text-gray-400 mt-4 max-w-2xl leading-relaxed"
   >
    You spend hours jumping between databases, drowning in thousands of papers,
    wondering if <span className="text-[#DEDBC8]">the one paper that changes everything</span> slipped
    through the cracks. We built SCITRACK so it never does.
   </motion.p>
   </div>
  </div>
  </div>

  {/* ── Advantages ──────────────────────────────────────────────── */}
  <div className="relative z-10 px-4 md:px-6 pb-20 md:pb-28 -mt-2">
  <div className="max-w-6xl mx-auto">
   {/* Asymmetric grid instead of 3 equal columns — 2fr + 1fr */}
   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
   {STORY_ADVANTAGES.map((item, i) => (
    <motion.div
    key={item.num}
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
    className="relative z-10 group bg-[#101010] rounded-2xl border border-[#DEDBC8]/5 p-6 md:p-7 hover:border-[#DEDBC8]/15 transition-all duration-300 active:scale-[0.98]"
    >
    <span className="text-4xl sm:text-5xl font-bold text-[#DEDBC8]/15 group-hover:text-[#DEDBC8] transition-all duration-500 leading-none">
     {item.num}
    </span>
    <h3 className="text-lg sm:text-xl font-medium text-[#E1E0CC] mt-3 mb-2">
     {item.title}
    </h3>
    <p className="text-sm text-gray-400 leading-relaxed">
     {item.desc}
    </p>
    </motion.div>
   ))}
   </div>
  </div>
  </div>

  {/* ── Trending Papers — Horizontal scroll carousel ──────────── */}
  <div className="relative px-4 md:px-6 pb-20 md:pb-28">
  {/* Background */}
  <div className="absolute inset-0 pointer-events-none">
   <img
   src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1400&h=900&fit=crop"
   alt=""
   className="w-full h-full object-cover opacity-[0.12]"
   />
   <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
  </div>

  <div className="relative z-10 max-w-7xl mx-auto">
   {/* Header — left-aligned, NOT centered */}
   <div className="mb-10 md:mb-14">
   <p className="text-[10px] sm:text-xs font-medium mb-3 text-[#DEDBC8] tracking-widest uppercase">
    Trending now
   </p>
   <h3 className="text-2xl sm:text-3xl md:text-4xl font-medium text-[#E1E0CC]">
    See what the world is
    <span className="italic font-serif-italic text-[#DEDBC8]"> researching.</span>
   </h3>
   </div>

   {/* Horizontal scroll carousel — replaces 5-column grid */}
   <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-none"
    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
   {TRENDING_PAPERS.map((paper, i) => (
    <motion.div
    key={i}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
    className="group bg-[#101010] rounded-2xl overflow-hidden border border-[#DEDBC8]/5 hover:border-[#DEDBC8]/15 transition-all duration-300 flex-shrink-0 w-[280px] sm:w-[320px] snap-start active:scale-[0.98]"
    >
    <div className="relative h-40 sm:h-44 overflow-hidden">
     <img
     src={paper.image}
     alt={paper.title}
     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
     />
     <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-transparent to-transparent" />
     <span className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#DEDBC8] text-black">
     {paper.trend}
     </span>
    </div>
    <div className="p-4 sm:p-5">
     <span className="text-[10px] font-medium text-[#DEDBC8] uppercase tracking-wider">
     {paper.field}
     </span>
     <h3 className="text-sm font-medium text-[#E1E0CC] mt-1.5 leading-snug line-clamp-2">
     {paper.title}
     </h3>
     <button
     onClick={() => navigate('/login')}
     className="flex items-center gap-1.5 mt-3 text-xs text-[#DEDBC8] hover:underline underline-offset-4 active:scale-[0.97]"
     >
     View paper <ArrowRight size={12} style={{ transform: 'rotate(-45deg)' }} />
     </button>
    </div>
    </motion.div>
   ))}
   </div>
  </div>
  </div>
 </section>
 );
}

/* ═══════════════════════════════════════════════════════════════════════════
 Section 3 — Features (Bento Grid — anti "3 equal card columns")
 ═══════════════════════════════════════════════════════════════════════════ */

const FEATURE_HEADER_SEGMENTS = [
 { text: 'Powerful tools for serious research.', className: 'text-[#DEDBC8]' },
 { text: 'Built for discovery. Driven by data.', className: 'text-gray-500' },
];

const RICH_FEATURES = [
 {
 id: '01',
 title: 'Smart Search',
 subtitle: 'Find exactly what you need',
 desc: 'Semantic search across 50M+ papers with keyword, author, DOI, and advanced field filters. Real-time suggestions as you type.',
 image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&h=500&fit=crop',
 stats: '50M+',
 statsLabel: 'Papers indexed',
 points: ['Keyword & semantic search', 'Filter by field, year, journal', 'Real-time search suggestions'],
 },
 {
 id: '02',
 title: 'Trend Tracking',
 subtitle: 'Stay ahead of the curve',
 desc: 'Monitor citation velocity and detect emerging research directions before they become mainstream.',
 image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop',
 stats: '12K+',
 statsLabel: 'Active researchers',
 points: ['Citation trend analysis', 'Hot topic detection', 'Personalized recommendations'],
 },
 {
 id: '03',
 title: 'Deep Analytics',
 subtitle: 'Visualize your research landscape',
 desc: 'Interactive knowledge graphs, citation networks, and cross-domain impact scoring.',
 image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=360&fit=crop',
 stats: '98.7%',
 statsLabel: 'Data uptime',
 points: ['Citation network graphs', 'Impact scoring', 'Cross-domain mapping'],
 },
 {
 id: '04',
 title: 'Reports & Export',
 subtitle: 'Share your findings',
 desc: 'Generate professional reports and export data in multiple formats for presentations and publications.',
 image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=360&fit=crop',
 stats: '4',
 statsLabel: 'Export formats',
 points: ['PDF, CSV, JSON, BibTeX', 'Custom report builder', 'Bookmark & organize papers'],
 },
];

function FeatureCard({ feature, index, isLarge }) {
 const ref = useRef(null);
 const isInView = useInView(ref, { once: true, margin: '-80px' });

 return (
 <motion.div
  ref={ref}
  initial={{ opacity: 0, y: 40 }}
  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
  transition={{ duration: 0.55, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
  className={`group bg-[#101010] rounded-2xl overflow-hidden border border-[#DEDBC8]/5 hover:border-[#DEDBC8]/20 transition-all duration-500 flex flex-col active:scale-[0.99] ${isLarge ? 'md:flex-row' : ''}`}
 >
  {/* Image */}
  <div className={`relative overflow-hidden ${isLarge ? 'md:w-[45%] md:min-h-full' : 'h-48 sm:h-52'}`}>
  <motion.img
   src={feature.image}
   alt={feature.title}
   className="w-full h-full object-cover"
   whileHover={{ scale: 1.08 }}
   transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
  />
  <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-[#101010]/20 to-transparent" />
  {/* ID badge */}
  <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#DEDBC8] text-black">
   {feature.id}
  </span>
  {/* Stat badge */}
  <div className="absolute bottom-3 right-3 text-right">
   <div className="text-xl sm:text-2xl font-bold text-[#E1E0CC] leading-none">{feature.stats}</div>
   <div className="text-[10px] text-gray-400 mt-0.5">{feature.statsLabel}</div>
  </div>
  </div>

  {/* Content */}
  <div className={`p-5 md:p-6 flex flex-col flex-1 ${isLarge ? 'md:justify-center' : ''}`}>
  <p className="text-[10px] font-medium text-[#DEDBC8] uppercase tracking-wider mb-1.5">
   {feature.subtitle}
  </p>
  <h3 className="text-lg sm:text-xl font-medium text-[#E1E0CC] mb-2">
   {feature.title}
  </h3>
  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-4">
   {feature.desc}
  </p>

  {/* Bullet points */}
  <ul className="space-y-2 mt-auto">
   {feature.points.map((point, i) => (
   <li key={i} className="flex items-start gap-2">
    <Check size={13} className="text-[#DEDBC8] mt-0.5 shrink-0" />
    <span className="text-xs text-gray-400 leading-snug">{point}</span>
   </li>
   ))}
  </ul>

  {/* Learn more */}
  <a
   href="/register"
   className="inline-flex items-center gap-1.5 text-xs text-[#DEDBC8] mt-5 hover:underline underline-offset-4 group/link active:scale-[0.97]"
  >
   Learn more
   <ArrowRight size={13} className="transition-transform duration-300 group-hover/link:translate-x-0.5" style={{ transform: 'rotate(-45deg)' }} />
  </a>
  </div>
 </motion.div>
 );
}

function FeaturesSection() {
 return (
 <section id="features" className="relative min-h-[100dvh] py-20 md:py-28 px-4 md:px-6 prisma-page overflow-hidden" style={{ background: '#0A0A0A' }}>
  {/* Background image — visible academic atmosphere */}
  <div className="absolute inset-0 pointer-events-none">
  <img
   src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1400&h=900&fit=crop"
   alt=""
   className="w-full h-full object-cover opacity-[0.25]"
  />
  </div>
  {/* Gradient — dark only at very edges */}
  <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-transparent to-black/90 pointer-events-none" />
  {/* Noise overlay */}
  <div className="bg-noise opacity-[0.04] pointer-events-none" />

  <div className="relative z-10 max-w-7xl mx-auto">
  {/* Header — centered */}
  <div className="mb-14 md:mb-20 text-center">
   <WordsPullUpMultiStyle
   segments={FEATURE_HEADER_SEGMENTS}
   className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal max-w-3xl mx-auto leading-[1.2]"
   />
  </div>

  {/* Bento grid — asymmetric layout replacing 4 equal columns */}
  {/*
   Row 1: Feature 1 (wide, horizontal layout) + Feature 2 (tall card)
   Row 2: Feature 3 (standard) + Feature 4 (standard)
   */}
  <div className="space-y-5">
   {/* Row 1 — Feature 1 (spans 2 cols, horizontal) */}
   <FeatureCard feature={RICH_FEATURES[0]} index={0} isLarge />

   {/* Row 2 — Feature 2 + Feature 3 */}
   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
    <FeatureCard feature={RICH_FEATURES[1]} index={1} />
    <FeatureCard feature={RICH_FEATURES[2]} index={2} />
   </div>

   {/* Row 3 — Feature 4 (centered, narrower) */}
   <div className="max-w-2xl mx-auto">
    <FeatureCard feature={RICH_FEATURES[3]} index={3} />
   </div>
  </div>
  </div>
 </section>
 );
}

/* ═══════════════════════════════════════════════════════════════════════════
 Footer
 ═══════════════════════════════════════════════════════════════════════════ */

function Footer() {
 return (
 <footer className="relative bg-black border-t border-[#DEDBC8]/10 prisma-page">
  <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-14">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
   {/* Brand */}
   <div className="flex flex-col items-center md:items-start gap-2">
   <div className="flex items-center">
    <ScitrackSLogo className="text-[#DEDBC8] -mr-1 w-7 h-10" />
    <span className="text-lg font-black text-[#E1E0CC] tracking-[0.05em]">CITRACK</span>
   </div>
   <p className="text-[10px] text-gray-500">Academic Research Platform</p>
   <p className="text-[10px] text-gray-600 mt-1">
    &copy; 2026 SCITRACK. All rights reserved.
   </p>
   </div>

   {/* Nav links */}
   <div className="flex flex-col items-center md:items-start gap-2">
   <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Navigation</span>
   <a href="/login" className="text-xs text-gray-400 hover:text-[#E1E0CC] transition-colors">Sign In</a>
   <a href="/register" className="text-xs text-gray-400 hover:text-[#E1E0CC] transition-colors">Register</a>
   </div>

   {/* Legal */}
   <div className="flex flex-col items-center md:items-start gap-2">
   <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Legal</span>
   <a href="#" className="text-xs text-gray-400 hover:text-[#E1E0CC] transition-colors">Privacy Policy</a>
   <a href="#" className="text-xs text-gray-400 hover:text-[#E1E0CC] transition-colors">Terms of Service</a>
   </div>
  </div>
  </div>
 </footer>
 );
}

/* ═══════════════════════════════════════════════════════════════════════════
 Landing Page
 ═══════════════════════════════════════════════════════════════════════════ */

export default function LandingPage() {
 return (
 <div className="bg-black">
  <HeroSection />
  <AboutSection />
  <FeaturesSection />
  <Footer />
 </div>
 );
}
