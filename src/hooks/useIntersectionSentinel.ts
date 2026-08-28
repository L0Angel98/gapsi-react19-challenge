import { useEffect } from 'react';

export function useIntersectionSentinel(
  target: Element | null,
  onIntersect: () => void,
  options?: IntersectionObserverInit
) {
  useEffect(() => {
    if (!target) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) onIntersect();
    }, options);
    observer.observe(target);
    return () => observer.disconnect();
  }, [onIntersect, options, target]);
}


