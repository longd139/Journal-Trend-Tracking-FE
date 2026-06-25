import { Microscope } from 'lucide-react';
import './FeaturedSlider.scss';

const researchPapers = [
  {
    id: 1,
    title: "An IoT-Based Smart Feeding System Using Mamdani Fuzzy Logic",
    author: "J. T. I. E. Stekom et al.",
    category: "Internet of Things (IoT)",
    year: 2026,
  },
  {
    id: 2,
    title: "Design and Implementation of a WiFi Manager System on the ESP8266 Module for IoT Applications",
    author: "Rahmatul Nisa, Eka Dodi Suryanto",
    category: "Embedded Systems",
    year: 2026,
  },
  {
    id: 3,
    title: "Finding and Evaluating the Performance Impact of Redundant Data Access for Applications that are Developed Using Object-Relational Mapping Frameworks",
    author: "Tse-Hsun Chen et al.",
    category: "Software Engineering",
    year: 2016,
  },
  {
    id: 4,
    title: "Arduino based home automation using Internet of things (IoT)",
    author: "K. Venkatesan, U. Ramachandraiah",
    category: "Networking & IoT",
    year: 2018,
  },
  {
    id: 5,
    title: "IoT environmental monitoring system using Arduino and NODE MCU ESP8266",
    author: "Raúl Benítez Iglesias",
    category: "Hardware & Sensor Integration",
    year: 2021,
  },
];

/* Map categories to accent colors from the design system */
const categoryColors = {
  "Internet of Things (IoT)": '#DEDBC8',
  "Embedded Systems": '#C9C6B6',
  "Software Engineering": '#B8B5A3',
  "Networking & IoT": '#C9A852',
  "Hardware & Sensor Integration": '#D1523E',
};

export default function FeaturedSlider() {
  /* Duplicate the array so the marquee loops seamlessly.
     When translateX reaches -50%, the visible cards are the
     cloned set — visually identical to the originals at 0%.  */
  const slides = [...researchPapers, ...researchPapers];

  return (
    <section className="fs-section">
      <div className="fs-container">
        {/* ── Section header ── */}
        <div className="fs-header">
          <span className="fs-badge">
            <Microscope size={14} />
            Featured Research
          </span>
          <h2 className="fs-heading">Notable Publications</h2>
          <p className="fs-subtitle">
            Discover trending research papers from our curated collection
          </p>
        </div>

        {/* ── Infinite slider ── */}
        <div className="fs-slider">
          <div className="fs-track">
            {slides.map((paper, idx) => {
              const accent = categoryColors[paper.category] || '#DEDBC8';
              return (
                <div
                  key={`${paper.id}-${idx}`}
                  className="fs-card"
                  style={{ '--card-accent': accent }}
                >
                  {/* Top row: category badge + year */}
                  <div className="fs-card-top">
                    <span
                      className="fs-card-category"
                      style={{
                        background: `${accent}14`,
                        color: accent,
                        borderColor: `${accent}33`,
                      }}
                    >
                      {paper.category}
                    </span>
                    <span className="fs-card-year">{paper.year}</span>
                  </div>

                  {/* Title */}
                  <h3 className="fs-card-title">{paper.title}</h3>

                  {/* Author */}
                  <p className="fs-card-author">{paper.author}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
