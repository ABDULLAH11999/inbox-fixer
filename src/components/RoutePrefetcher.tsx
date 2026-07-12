'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function RoutePrefetcher({ routes }: { routes: string[] }) {
  const router = useRouter();

  useEffect(() => {
    if (!routes.length) {
      return;
    }

    const uniqueRoutes = Array.from(new Set(routes));
    const prefetch = () => {
      uniqueRoutes.forEach((route) => router.prefetch(route));
    };

    if ('requestIdleCallback' in window) {
      const requestIdle = window.requestIdleCallback?.bind(window);
      const cancelIdle = window.cancelIdleCallback?.bind(window);

      if (requestIdle && cancelIdle) {
        const id = requestIdle(prefetch, { timeout: 1500 });
        return () => cancelIdle(id);
      }
    }

    const timer = window.setTimeout(prefetch, 500);
    return () => window.clearTimeout(timer);
  }, [router, routes]);

  return null;
}
