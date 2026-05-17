'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function TrackPageView() {
  const pathname = usePathname();
  const trackedPaths = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Avoid double tracking in development mode strict-mode mounts or immediate transitions
    const cacheKey = pathname;
    if (trackedPaths.current.has(cacheKey)) return;
    trackedPaths.current.add(cacheKey);

    // Get or initialize persistent visitor ID
    let visitorId = localStorage.getItem('inboxfixer_visitor_id');
    if (!visitorId) {
      visitorId = 'vis_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('inboxfixer_visitor_id', visitorId);
    }

    // Fire tracking payload asynchronously
    fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: pathname,
        visitorId: visitorId,
      }),
    }).catch((err) => {
      console.warn('Visitor tracking registration failed:', err);
    });
  }, [pathname]);

  return null;
}
