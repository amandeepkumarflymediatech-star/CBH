'use client';

import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ShieldCheck, Cpu, ArrowUpRight, Zap, Crosshair } from 'lucide-react';

interface ApplicationItem {
  num: string;
  name: string;
  standard: string;
  specs: string;
  material: string;
  rating: string;
}

export default function ApplicationsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const fastenerRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLElement>(null);

  const leftApplications: ApplicationItem[] = [
    {
      num: '01',
      name: 'Oil & Gas',
      standard: 'ASTM A193 B7 / A194 2H',
      specs: 'High Pressure Flanged Piping Manifolds',
      material: 'Alloy Steel Cr-Mo (Grade B7)',
      rating: 'Severe Cryogenic & High Temp Tested',
    },
    {
      num: '02',
      name: 'Cleanroom Equipment & Consumables',
      standard: 'DIN 912 / ISO 4762 A4-80',
      specs: 'Electropolished Fasteners Zero Particle Shedding',
      material: 'Marine Grade SS 316L Austenitic',
      rating: 'Cleanroom Class 100 Compliant',
    },
    {
      num: '03',
      name: 'Solar',
      standard: 'DIN 933 & Solar T-Bolts',
      specs: 'Anodized Aluminum Module Clamping Hardware',
      material: 'Stainless Steel SS 304 / A2-70',
      rating: '3000-Hour Salt Spray Tested',
    },
    {
      num: '04',
      name: 'EV Mobility',
      standard: 'ISO 14583 Torx & Micro-Screws',
      specs: 'Battery Enclosure, Inverter & Motor Assemblies',
      material: 'High Tensile 10.9 Zinc Flake Geomet',
      rating: 'Zero Hydrogen Embrittlement Certified',
    },
    {
      num: '05',
      name: 'Electrical & Electronics',
      standard: 'DIN 84 / DIN 7985 Slotted & Cross',
      specs: 'High Electrical Conductivity Grounding Terminals',
      material: 'Cu-ETP High Purity Brass & Nickel Coated',
      rating: 'RoHS 3 & REACH Compliant',
    },
    {
      num: '06',
      name: 'Equipment & Machinery Manufacturers',
      standard: 'DIN 912 Socket Head Cap Screws',
      specs: 'Heavy Machine Bed & Hydraulic Cylinder Mounts',
      material: 'Class 12.9 Alloy Steel Quenched & Tempered',
      rating: '1220 MPa Ultimate Tensile Strength',
    },
    {
      num: '07',
      name: 'Agriculture Equipment',
      standard: 'DIN 931 / DIN 6921 Flanged',
      specs: 'High-Impact Plow Bolts & Tillage Mounts',
      material: 'Grade 8.8 Anti-Chipping Zinc Phosphate',
      rating: 'Vibration & Impact Resistant',
    },
    {
      num: '08',
      name: 'Railways',
      standard: 'UIC 864-1 & RDSO Approved',
      specs: 'High-Speed Track Fishplates & Bogie Mounts',
      material: 'Grade 8.8 / 10.9 Track Bolts + Lock Nuts',
      rating: 'Indian Railways RDSO Calibrated',
    },
    {
      num: '09',
      name: 'Furniture',
      standard: 'Confirmat & Hex Socket Joint Screws',
      specs: 'Engineered Wood Panel Rigid Assembly Fasteners',
      material: 'Carbon Steel Case Hardened Zinc Plated',
      rating: 'High Pull-Out Resistance',
    },
    {
      num: '10',
      name: 'Construction & Building Materials',
      standard: 'ETA Option 1 Heavy Duty Wedge Anchors',
      specs: 'Concrete Curtain Wall & Baseplate Embedments',
      material: 'Cold Formed Carbon Steel HDG 65μm',
      rating: 'Seismic Zone IV & V Certified',
    },
  ];

  const rightApplications: ApplicationItem[] = [
    {
      num: '11',
      name: 'Infrastructure & Construction',
      standard: 'EN 15048 Non-Preload Structural Bolting',
      specs: 'Flyovers, Airport Terminals & High-Rise Columns',
      material: 'Grade 8.8 / 10.9 HDG IS 1367 Part 13',
      rating: 'Full Mill Traceability EN 10204 3.1',
    },
    {
      num: '12',
      name: 'PEB & Steel Structures',
      standard: 'EN 14399 High-Strength Preload Assemblies (HR/HV)',
      specs: 'Pre-Engineered Building Rafters & Column Joints',
      material: 'Grade 10.9 Structural Fasteners with Direct Tension Indicators',
      rating: 'Calibrated K-Class Torque Preload',
    },
    {
      num: '13',
      name: 'Solar Projects',
      standard: 'Bi-Metallic Sheared Anti-Theft Nuts',
      specs: 'Ground Mount Utility Solar Tracker Drive Mounts',
      material: 'SS 316 + Dacromet 500h Fasteners',
      rating: '30-Year Warranty Anti-Theft Design',
    },
    {
      num: '14',
      name: 'OEM & Manufacturing',
      standard: 'Custom Cold Forged Precision Prints',
      specs: 'Proprietary Engineered Fasteners for Global Tier-1s',
      material: 'Alloy & Stainless Steels per Client Drawing',
      rating: 'PPAP Level 3 Qualified Runs',
    },
    {
      num: '15',
      name: 'Government / PSU Sector',
      standard: 'IS 1364 / IS 1367 BIS Mark Licenced',
      specs: 'Defence PSUs, NTPC, BHEL & Power Grid Projects',
      material: 'Class 4.6, 8.8, 10.9 Indian Standards Marked',
      rating: 'BIS License CM/L-9700253821',
    },
    {
      num: '16',
      name: 'Aerospace',
      standard: 'MS / NAS / AS Aerospace Specifications',
      specs: 'Airframe Structural Mounts & Turbine Engine Fasteners',
      material: 'Inconel 718, Titanium Ti-6Al-4V & A286',
      rating: 'Aerospace Quality Ultra-Clean Alloys',
    },
    {
      num: '17',
      name: 'Wind Energy',
      standard: 'DIN EN ISO 4014 M36 to M64 Foundation Studs',
      specs: 'Wind Turbine Nacelle & Tower Flange Bolting Sets',
      material: 'Grade 10.9 Zinc Flake Geomet Coated',
      rating: 'Fatigue & Dynamic Wind Shear Proven',
    },
    {
      num: '18',
      name: 'Energy',
      standard: 'ASTM A193 B16 / A194 Gr. 7 Fasteners',
      specs: 'Supercritical Boiler & Steam Turbine Casing Studs',
      material: 'Chromium-Molybdenum-Vanadium High Creep Alloy',
      rating: '550°C Sustained Temperature Creep Rated',
    },
    {
      num: '19',
      name: 'Defence',
      standard: 'MIL-STD Armor & Ordnance Grade Bolting',
      specs: 'Armored Tactical Combat Vehicles & Naval Vessels',
      material: 'Ultra-High Hardness Alloy Steel Anti-Spall',
      rating: 'Ballistic Shock & Corrosion Proof',
    },
  ];

  const allApplications = [...leftApplications, ...rightApplications];
  const [activeItem, setActiveItem] = useState<ApplicationItem>(allApplications[0]);
  const [isManualHover, setIsManualHover] = useState(false);
  const [mobileTab, setMobileTab] = useState<'all' | 'left' | 'right'>('all');

  // Auto-cycle through items when not hovered
  useEffect(() => {
    if (isManualHover) return;

    const interval = setInterval(() => {
      setActiveItem((prev) => {
        const currIdx = allApplications.findIndex((a) => a.num === prev.num);
        const nextIdx = (currIdx + 1) % allApplications.length;
        return allApplications[nextIdx];
      });
    }, 3200);

    return () => clearInterval(interval);
  }, [isManualHover, allApplications]);

  // Tilt and react 3D fastener whenever active item changes
  useEffect(() => {
    if (fastenerRef.current) {
      const isLeft = parseInt(activeItem.num) <= 10;
      const targetRotateY = isLeft ? -15 : 15;
      const targetRotateZ = isLeft ? -2 : 2;

      gsap.to(fastenerRef.current, {
        rotateY: targetRotateY,
        rotateZ: targetRotateZ,
        scale: 1.04,
        duration: 0.5,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(fastenerRef.current, {
            scale: 1,
            duration: 0.6,
            ease: 'sine.out',
          });
        },
      });
    }

    if (hudRef.current) {
      gsap.fromTo(
        hudRef.current,
        { opacity: 0.3, y: 8, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power2.out' }
      );
    }
  }, [activeItem]);

  // Entrance animations & continuous loops
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Counter animation from 1 to 19
      if (counterRef.current) {
        const obj = { val: 1 };
        gsap.to(obj, {
          val: 19,
          duration: 1.6,
          ease: 'power2.out',
          onUpdate: () => {
            if (counterRef.current) {
              counterRef.current.textContent = Math.round(obj.val).toString();
            }
          },
        });
      }

      // Stagger list entrance
      gsap.from('.industry-anim-node', {
        opacity: 0,
        y: 18,
        stagger: 0.03,
        duration: 0.6,
        ease: 'power2.out',
      });

      // Continuous gentle floating animation on the 3D bolt
      if (fastenerRef.current) {
        gsap.to(fastenerRef.current, {
          y: -14,
          duration: 2.8,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
        });
      }
    }, sectionRef);

    // Mouse move parallax on the 3D fastener
    const section = sectionRef.current;
    if (!section) return () => ctx.revert();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      if (fastenerRef.current) {
        gsap.to(fastenerRef.current, {
          '--object-tilt-x': `${-y * 20}deg`,
          '--object-tilt-y': `${x * 26}deg`,
          duration: 0.45,
          ease: 'power2.out',
        });
      }
    };

    section.addEventListener('mousemove', handleMouseMove);
    return () => {
      section.removeEventListener('mousemove', handleMouseMove);
      ctx.revert();
    };
  }, []);

  return (
    <section
      className="industry-section industry-3d"
      id="applications"
      ref={sectionRef}
      aria-labelledby="industry-title"
    >
      <div className="section-wrap">
        <header className="industry-3d-heading">
          <p className="cbh-eyebrow" style={{ color: '#F18A45' }}>
            <span className="cbh-eyebrow-dot" style={{ background: '#F18A45' }}></span>
            APPLICATIONS
          </p>
          <h1 id="industry-title">Fastening the industries that drive world.</h1>
          <div className="industry-total" aria-label="19 application areas">
            <strong ref={counterRef}>19</strong>
            <span>APPLICATION AREAS</span>
          </div>
        </header>

        {/* Mobile Filter Tabs (Visible on screens < 768px) */}
        <div className="industry-mobile-tabs" role="tablist" aria-label="Application sectors filter">
          <button
            type="button"
            className={`mobile-tab-btn ${mobileTab === 'all' ? 'active' : ''}`}
            onClick={() => setMobileTab('all')}
          >
            All Sectors (19)
          </button>
          <button
            type="button"
            className={`mobile-tab-btn ${mobileTab === 'left' ? 'active' : ''}`}
            onClick={() => setMobileTab('left')}
          >
            01-10 Core
          </button>
          <button
            type="button"
            className={`mobile-tab-btn ${mobileTab === 'right' ? 'active' : ''}`}
            onClick={() => setMobileTab('right')}
          >
            11-19 Advanced
          </button>
        </div>

        <div className="industry-3d-stage">
          {/* Left Column (01 - 10) */}
          <ol
            className={`industry-list industry-list--left ${mobileTab === 'right' ? 'mobile-hidden' : ''}`}
            onMouseEnter={() => setIsManualHover(true)}
            onMouseLeave={() => setIsManualHover(false)}
          >
            {leftApplications.map((app) => {
              const isActive = activeItem.num === app.num;
              return (
                <li
                  key={app.num}
                  className={`industry-anim-node ${isActive ? 'is-active' : ''}`}
                  onMouseEnter={() => {
                    setIsManualHover(true);
                    setActiveItem(app);
                  }}
                  onClick={() => {
                    setIsManualHover(true);
                    setActiveItem(app);
                  }}
                >
                  <span className="industry-node-number" aria-hidden="true">
                    {app.num}
                  </span>
                  <span className="industry-node-name">{app.name}</span>
                  {isActive && <span className="node-active-beacon" />}
                </li>
              );
            })}
          </ol>

          {/* Central 3D Fastener Assembly Scene */}
          <div className="fastener-visual" aria-hidden="true">
            <span className="fastener-aura"></span>
            <span className="fastener-orbit fastener-orbit--outer">
              <span className="orbit-energy-sparkle"></span>
            </span>
            <span className="fastener-orbit fastener-orbit--inner">
              <span className="orbit-energy-sparkle"></span>
            </span>
            <span className="fastener-axis"></span>

            {/* 3D Bolt with Tilts and Laser Scanner */}
            <span className="fastener-assembly" ref={fastenerRef}>
              <span className="fastener-head">
                <span className="fastener-head-socket"></span>
              </span>
              <span className="fastener-neck"></span>
              <span className="fastener-shaft">
                {/* Real-time laser scanner beam */}
                <span className="fastener-laser-beam"></span>
              </span>
              <span className="fastener-tip"></span>
            </span>

            <span className="fastener-floor-shadow"></span>

            {/* High-Tech HUD Display Card Overlay */}
            <div className="industry-hud-card" ref={hudRef}>
              <div className="hud-header">
                <span className="hud-badge">
                  <Crosshair size={11} color="#F18A45" />
                  <span>SECTOR #{activeItem.num}</span>
                </span>
                <span className="hud-status">
                  <span className="status-dot"></span>
                  <span>ACTIVE</span>
                </span>
              </div>
              <h4 className="hud-title">{activeItem.name}</h4>
              <div className="hud-standard">
                <Cpu size={12} color="#94A3B8" />
                <strong>{activeItem.standard}</strong>
              </div>
              <p className="hud-specs">{activeItem.specs}</p>
              <div className="hud-footer">
                <ShieldCheck size={12} color="#059669" />
                <span>{activeItem.rating}</span>
              </div>
            </div>
          </div>

          {/* Right Column (11 - 19) */}
          <ol
            className={`industry-list industry-list--right ${mobileTab === 'left' ? 'mobile-hidden' : ''}`}
            onMouseEnter={() => setIsManualHover(true)}
            onMouseLeave={() => setIsManualHover(false)}
          >
            {rightApplications.map((app) => {
              const isActive = activeItem.num === app.num;
              return (
                <li
                  key={app.num}
                  className={`industry-anim-node ${isActive ? 'is-active' : ''}`}
                  onMouseEnter={() => {
                    setIsManualHover(true);
                    setActiveItem(app);
                  }}
                  onClick={() => {
                    setIsManualHover(true);
                    setActiveItem(app);
                  }}
                >
                  <span className="industry-node-number" aria-hidden="true">
                    {app.num}
                  </span>
                  <span className="industry-node-name">{app.name}</span>
                  {isActive && <span className="node-active-beacon" />}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
