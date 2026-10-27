'use client';

import { useEffect } from 'react';

export default function CustomHeadInjector({ html }: { html?: string }) {
  useEffect(() => {
    if (!html || typeof document === 'undefined') return;

    try {
      const temp = document.createElement('div');
      temp.innerHTML = html;
      const elements = Array.from(temp.childNodes);

      elements.forEach((el) => {
        document.head.appendChild(el);
      });

      return () => {
        elements.forEach((el) => {
          if (el.parentNode === document.head) {
            document.head.removeChild(el);
          }
        });
      };
    } catch (err) {
      console.warn('Failed to inject custom head tags:', err);
    }
  }, [html]);

  return null;
}
