import { useRef } from 'react';
import { motion, useInView } from 'motion/react';

/**
 * WordsPullUp
 * Splits text by spaces into individual words.
 * Each word slides up (y:20 → 0) with staggered delay using useInView.
 *
 * @param {string} text - The text to animate
 * @param {string} [className] - Optional className for the container
 * @param {boolean} [showAsterisk=false] - Add a superscript * after the last "a" in the final word
 */
export default function WordsPullUp({ text, className = '', showAsterisk = false }) {
 const ref = useRef(null);
 const isInView = useInView(ref, { once: true });

 const words = text.split(' ');

 return (
 <span ref={ref} className={`inline-flex flex-wrap ${className}`}>
  {words.map((word, wi) => {
  const isLast = wi === words.length - 1;
  return (
   <span key={wi} className="inline-flex mr-[0.25em]">
   {word.split('').map((char, ci) => {
    const isLastA = isLast && showAsterisk && char === 'a' && ci === word.length - 1;
    return (
    <motion.span
     key={ci}
     className={`inline-block ${isLastA ? 'relative' : ''}`}
     initial={{ y: 20, opacity: 0 }}
     animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
     transition={{
     duration: 0.6,
     delay: (wi * 0.08) + (ci * 0.01),
     ease: [0.16, 1, 0.3, 1],
     }}
    >
     {char}
     {isLastA && (
     <sup className="absolute top-[0.65em] -right-[0.3em] text-[0.31em]">*</sup>
     )}
    </motion.span>
    );
   })}
   </span>
  );
  })}
 </span>
 );
}
