'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';

export default function LeadershipSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (gridRef.current) {
        gsap.from('.director-card', {
          opacity: 0,
          y: 40,
          duration: 0.75,
          stagger: 0.15,
          ease: 'power3.out',
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="director-section" id="director" ref={sectionRef} aria-labelledby="director-title">
      <div className="section-wrap">
        <div className="director-heading">
          <div>
            <p className="cbh-eyebrow" style={{ color: '#0A2E4E' }}>
              <span className="cbh-eyebrow-dot" style={{ background: '#0A2E4E' }}></span>
              LEADERSHIP
            </p>
            <h2 id="director-title">Guided by experience. Built across generations.</h2>
          </div>
          <p className="director-intro">Meet the leaders behind Capital Bolts &amp; Hardwares and its continued growth.</p>
        </div>

        <div className="director-grid" ref={gridRef}>
          {/* Director 1: Mr. Hitesh Nagpal */}
          <article className="director-card">
            <figure className="director-photo">
              <Image
                src="/assets/leadership/hitesh-nagpal-director.png"
                alt="Hitesh Nagpal at his office"
                width={600}
                height={500}
                loading="lazy"
              />
              <figcaption>Director</figcaption>
            </figure>
            <div className="director-copy">
              <h3>Mr. Hitesh Nagpal</h3>
              <p className="director-credential">MBA in Finance · Joined the business in 2000</p>
              <p className="director-bio">
                After completing an MBA in Finance, Hitesh Nagpal joined the family business in 2000. His leadership has helped guide the company’s move from traditional selling to modern business practices.
              </p>
            </div>
          </article>

          {/* Director 2: Mr. Satish Nagpal */}
          <article className="director-card">
            <figure className="director-photo">
              <Image
                src="/assets/leadership/satish-nagpal-chairman.png"
                alt="Satish Nagpal at his office"
                width={600}
                height={500}
                loading="lazy"
              />
              <figcaption>Chairman</figcaption>
            </figure>
            <div className="director-copy">
              <h3>Mr. Satish Nagpal</h3>
              <p className="director-credential">Joined the family business in 1970</p>
              <p className="director-bio">
                Since joining the business in 1970, Satish Nagpal has helped grow the original cycle-parts operation into a larger enterprise, bringing fresh ideas and a people-first approach to its development.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
