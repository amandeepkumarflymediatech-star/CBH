'use client';

import React from 'react';
import { Star, CheckCircle2 } from 'lucide-react';

export default function Testimonials() {
  return (
    <div style={{ marginBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Verified Buyer Feedback
          </span>
          <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '24px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-dark-900)' }}>
            What Industrial Clients Say About Us
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#D97706' }}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={16} fill="#D97706" />
          ))}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 800, color: 'var(--color-dark-900)', marginLeft: '6px' }}>
            4.9 / 5.0
          </span>
        </div>
      </div>

      <div className="reviews-grid">
        {/* Rohit M */}
        <div className="review-card">
          <div>
            <div className="review-header">
              <div className="reviewer-profile">
                <div className="reviewer-avatar">R</div>
                <div className="reviewer-info">
                  <h5>Rohit M.</h5>
                  <span>Industrial Fabricator • Fabrication Shop</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '2px', color: '#D97706' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="#D97706" />
                ))}
              </div>
            </div>

            <p className="review-text">
              "Solid grip and smooth finish. Been using CBH Tech's fastener solution for over six months in my fabrication shop. No rust, no slips, just reliable hold. Highly recommend."
            </p>
          </div>

          <div className="review-footer">
            <span>Verified Purchase: DIN 933 High Tensile 8.8 Hex</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 700 }}>
              <CheckCircle2 size={13} />
              OEM Buyer
            </span>
          </div>
        </div>

        {/* Ananya P */}
        <div className="review-card">
          <div>
            <div className="review-header">
              <div className="reviewer-profile">
                <div className="reviewer-avatar" style={{ background: 'var(--color-primary)' }}>A</div>
                <div className="reviewer-info">
                  <h5>Ananya P.</h5>
                  <span>Procurement Manager • Infrastructure OEM</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '2px', color: '#D97706' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="#D97706" />
                ))}
              </div>
            </div>

            <p className="review-text">
              "Fast delivery, great quality. The threading is precise and consistent across batches. CBH Tech has become our go-to for all stainless steel fasteners."
            </p>
          </div>

          <div className="review-footer">
            <span>Verified Purchase: Stainless A2/A4 Bulk Metric Studs</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 700 }}>
              <CheckCircle2 size={13} />
              Enterprise PO
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
