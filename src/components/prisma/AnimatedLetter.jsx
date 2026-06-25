import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

/**
 * AnimatedLetter
 * Wraps a single character with scroll-linked opacity.
 * Used in the About section for progressive character-by-character text reveal.
 *
 * @param {string} char - The character to render
 * @param {number} index - Position index in the full string
 * @param {number} totalChars - Total number of characters
 * @param {object} scrollYProgress - The motion value from useScroll
 */
export default function AnimatedLetter({ char, index, totalChars, scrollYProgress }) {
  const charProgress = index / totalChars;
  const opacity = useTransform(
    scrollYProgress,
    [Math.max(0, charProgress - 0.1), charProgress + 0.05],
    [0.2, 1]
  );

  return (
    <motion.span style={{ opacity }}>
      {char === ' ' ? ' ' : char}
    </motion.span>
  );
}
