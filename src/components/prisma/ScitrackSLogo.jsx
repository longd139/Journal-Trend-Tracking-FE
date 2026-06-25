export default function ScitrackSLogo({ className = '' }) {
  return (
    <svg
      width="28"
      height="40"
      viewBox="0 0 28 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Bottom arc — solid bold stroke */}
      <path
        d="M6 34c-1-4 1-7 5-8l4-2c3-1 5-3 5-6s-2-5-5-5-6 2-8 4"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Top — trending line chart upward with arrow */}
      <path
        d="M5 14l4-5 4 3 5-7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Arrowhead */}
      <path
        d="M17 4.5l1.5-1.5 1.5 1.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M18.5 3v4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* Data nodes */}
      <circle cx="9" cy="9" r="2.5" fill="currentColor" />
      <circle cx="13" cy="12" r="2" fill="currentColor" opacity="0.6" />
    </svg>
  );
}
