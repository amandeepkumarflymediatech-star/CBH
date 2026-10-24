'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

export default function ApplicationsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const fastenerRef = useRef<HTMLDivElement>(null);

  const leftApplications = [
    { num: '01', name: 'Oil & Gas' },
    { num: '02', name: 'Cleanroom Equipment & Consumables' },
    { num: '03', name: 'Solar' },
    { num: '04', name: 'EV Mobility' },
    { num: '05', name: 'Electrical & Electronics' },
    { num: '06', name: 'Equipment & Machinery Manufacturers' },
    { num: '07', name: 'Agriculture Equipment' },
    { num: '08', name: 'Railways' },
    { num: '09', name: 'Furniture' },
    { num: '10', name: 'Construction & Building Materials' },
  ];

  const rightApplications = [
    { num: '11', name: 'Infrastructure & Construction' },
    { num: '12', name: 'PEB & Steel Structures' },
    { num: '13', name: 'Solar Projects' },
    { num: '14', name: 'OEM & Manufacturing' },
    { num: '15', name: 'Government / PSU Sector' },
    { num: '16', name: 'Aerospace' },
    { num: '17', name: 'Wind Energy' },
    { num: '18', name: 'Energy' },
    { num: '19', name: 'Defence' },
  ];

  // Mouse move parallax on the 3D fastener
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      if (fastenerRef.current) {
        gsap.to(fastenerRef.current, {
          '--object-tilt-x': `${-y * 18}deg`,
          '--object-tilt-y': `${x * 24}deg`,
          duration: 0.5,
          ease: 'power2.out',
        });
      }
    };

    section.addEventListener('mousemove', handleMouseMove);
    return () => {
      section.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <section className="industry-section industry-3d" id="applications" ref={sectionRef} aria-labelledby="industry-title">
      <div className="section-wrap">
        <header className="industry-3d-heading">
          <p className="cbh-eyebrow" style={{ color: '#F18A45' }}>
            <span className="cbh-eyebrow-dot" style={{ background: '#F18A45' }}></span>
            APPLICATIONS
          </p>
          <h2 id="industry-title">Fastening the industries that move us.</h2>
          <div className="industry-total" aria-label="19 application areas">
            <strong>19</strong>
            <span>APPLICATION AREAS</span>
          </div>
        </header>

        <div className="industry-3d-stage">
          {/* Left Column (Perspective 3D) */}
          <ol className="industry-list industry-list--left">
            {leftApplications.map((app) => (
              <li key={app.num}>
                <span className="industry-node-name">{app.name}</span>
                <span className="industry-node-number" aria-hidden="true">{app.num}</span>
              </li>
            ))}
          </ol>

          {/* Central 3D Fastener Assembly Scene */}
          <div className="fastener-visual" aria-hidden="true">
            <span className="fastener-aura"></span>
            <span className="fastener-orbit fastener-orbit--outer"></span>
            <span className="fastener-orbit fastener-orbit--inner"></span>
            <span className="fastener-axis"></span>
            <span className="fastener-assembly" ref={fastenerRef}>
              <span className="fastener-head">
                <span className="fastener-head-socket"></span>
              </span>
              <span className="fastener-neck"></span>
              <span className="fastener-shaft"></span>
              <span className="fastener-tip"></span>
            </span>
            <span className="fastener-floor-shadow"></span>
          </div>

          {/* Right Column (Perspective 3D) */}
          <ol className="industry-list industry-list--right">
            {rightApplications.map((app) => (
              <li key={app.num}>
                <span className="industry-node-number" aria-hidden="true">{app.num}</span>
                <span className="industry-node-name">{app.name}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
