'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, Search, CheckCircle2, Scale, Truck, Percent } from 'lucide-react';

interface FastenerFinderProps {
  onFilterChange: (filters: {
    category: string;
    standard: string;
    grade: string;
    diameter: string;
    length: string;
    finish: string;
  }) => void;
}

export default function FastenerFinder({ onFilterChange }: FastenerFinderProps) {
  const [category, setCategory] = useState('hex-screws');
  const [standard, setStandard] = useState('din933');
  const [grade, setGrade] = useState('all');
  const [diameter, setDiameter] = useState('m10');
  const [length, setLength] = useState('100');
  const [finish, setFinish] = useState('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ category, standard, grade, diameter, length, finish });
  };

  return (
    <div className="container" style={{ marginTop: '-24px', position: 'relative', zIndex: 10 }}>
      <div className="finder-bar">
        <div className="finder-header">
          <div className="finder-title">
            <SlidersHorizontal size={18} color="#D2051E" />
            <span>Precision Fastener Finder Matrix</span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#5A6678' }}>
            2,00,000+ Active SKUs Parametrically Filterable
          </span>
        </div>

        <form onSubmit={handleSubmit} className="finder-grid">
          {/* Category */}
          <div className="finder-field">
            <label>Category</label>
            <select
              className="finder-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="hex-screws">Hex Screws</option>
              <option value="hex-bolts">Heavy Hex Bolts</option>
              <option value="socket-cap">Socket Cap Screws</option>
              <option value="anchors">Anchors & Fixings</option>
              <option value="threaded-rods">Threaded Rods</option>
            </select>
          </div>

          {/* Standard */}
          <div className="finder-field">
            <label>Standard</label>
            <select
              className="finder-select"
              value={standard}
              onChange={(e) => setStandard(e.target.value)}
            >
              <option value="all">All Standards</option>
              <option value="din933">DIN 933 (Full Thread)</option>
              <option value="din931">DIN 931 (Half Thread)</option>
              <option value="din912">DIN 912 (Socket Head)</option>
              <option value="din934">DIN 934 (Hex Nut)</option>
              <option value="astma193">ASTM A193 B7</option>
            </select>
          </div>

          {/* Grade */}
          <div className="finder-field">
            <label>Grade</label>
            <select
              className="finder-select"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            >
              <option value="all">All Grades</option>
              <option value="5.8">Grade 5.8 (Mild)</option>
              <option value="8.8">Grade 8.8 (High-Tensile)</option>
              <option value="10.9">Grade 10.9 (Structural)</option>
              <option value="ss304">SS 304 / A2-70</option>
              <option value="ss316">SS 316 / A4-80</option>
            </select>
          </div>

          {/* Diameter */}
          <div className="finder-field">
            <label>Diameter (d)</label>
            <select
              className="finder-select"
              value={diameter}
              onChange={(e) => setDiameter(e.target.value)}
            >
              <option value="all">All Diameters</option>
              <option value="m6">M6</option>
              <option value="m8">M8</option>
              <option value="m10">M10 (p=1.5)</option>
              <option value="m12">M12</option>
              <option value="m16">M16</option>
              <option value="m20">M20</option>
              <option value="m24">M24</option>
              <option value="m36">M36</option>
            </select>
          </div>

          {/* Length */}
          <div className="finder-field">
            <label>Length (L)</label>
            <select
              className="finder-select"
              value={length}
              onChange={(e) => setLength(e.target.value)}
            >
              <option value="all">All Lengths</option>
              <option value="12">12 mm</option>
              <option value="50">50 mm</option>
              <option value="100">100 mm</option>
              <option value="110">110 mm</option>
              <option value="120">120 mm</option>
              <option value="125">125 mm</option>
              <option value="130">130 mm</option>
              <option value="140">140 mm</option>
              <option value="150">150 mm</option>
            </select>
          </div>

          {/* Finish */}
          <div className="finder-field">
            <label>Coating / Finish</label>
            <select
              className="finder-select"
              value={finish}
              onChange={(e) => setFinish(e.target.value)}
            >
              <option value="all">All Coatings</option>
              <option value="blkzp">Black Zinc Phosphated</option>
              <option value="bp">Black Passivated</option>
              <option value="hdg">Hot Dip Galvanized</option>
              <option value="clear">Clear Zinc Cr3+</option>
            </select>
          </div>

          {/* Filter Action */}
          <button type="submit" className="finder-submit-btn">
            <span>Filter</span>
            <Search size={16} />
          </button>
        </form>

        {/* Trust Badges Strip Below Finder */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginTop: '16px',
          paddingTop: '14px',
          borderTop: '1px solid var(--color-surface-subtle)',
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--color-dark-800)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} color="#059669" />
            <span>BIS Certified Lab Tested</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Scale size={16} color="#D2051E" />
            <span>Dual Unit: PCS & KGS Live</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Truck size={16} color="#059669" />
            <span>Pan-India 24-48hr Dispatch</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Percent size={16} color="#D97706" />
            <span>25% Slabs on ₹1,00,000+</span>
          </div>
        </div>
      </div>
    </div>
  );
}
