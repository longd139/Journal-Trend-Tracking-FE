import { useRef } from 'react';
import { motion, useInView } from 'motion/react';

/**
 * WordsPullUpMultiStyle
 * Takes an array of {text, className} segments, splits all into individual words
 * preserving per-word className. Same pull-up animation as WordsPullUp.
 *
 * @param {Array<{text: string, className?: string}>} segments
 * @param {string} [className] - Optional className for the outer container
 */
export default function WordsPullUpMultiStyle({ segments, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  // Flatten all segments into individual words with their style info
  let globalWordIndex = 0;
  const allWords = [];
  segments.forEach((seg) => {
    const words = seg.text.split(' ');
    words.forEach((word) => {
      allWords.push({ word, className: seg.className || '' });
    });
  });

  return (
    <span ref={ref} className={`inline-flex flex-wrap justify-center ${className}`}>
      {allWords.map((item, wi) => {
        const delay = globalWordIndex * 0.08;
        globalWordIndex++;
        return (
          <motion.span
            key={wi}
            className={`inline-block mr-[0.25em] ${item.className}`}
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{
              duration: 0.6,
              delay,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {item.word}
          </motion.span>
        );
      })}
    </span>
  );
}
