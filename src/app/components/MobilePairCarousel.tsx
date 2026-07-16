'use client';

import { Children, isValidElement, useEffect, useRef, useState, type ReactNode, type UIEvent } from 'react';

function chunkPairs<T>(items: T[]): T[][] {
  const pairs: T[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    pairs.push(items.slice(i, i + 2));
  }
  return pairs;
}

function getSnapPageIndex(container: HTMLDivElement) {
  const width = container.clientWidth || 1;
  return Math.min(
    Math.max(0, Math.round(container.scrollLeft / width)),
    Math.max(0, Math.ceil(container.scrollWidth / width) - 1),
  );
}

/**
 * Mobile-only horizontal carousel: shows exactly 2 items, swipe for the next pair.
 * Hidden from md and up (desktop layouts render separately).
 */
export function MobilePairCarousel({
  children,
  label,
  showDots = true,
}: {
  children: ReactNode;
  label?: string;
  showDots?: boolean;
}) {
  const items = Children.toArray(children).filter(isValidElement);
  const pairs = chunkPairs(items);
  const [page, setPage] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  const onScroll = (event: UIEvent<HTMLDivElement>) => {
    setPage(getSnapPageIndex(event.currentTarget));
  };

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const onResize = () => setPage(getSnapPageIndex(node));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="md:hidden">
      <div
        ref={ref}
        onScroll={onScroll}
        className="bb-mobile-scroll flex snap-x snap-mandatory gap-0"
        aria-label={label}
      >
        {pairs.map((pair, pageIndex) => (
          <div key={`pair-page-${pageIndex}`} className="grid w-full shrink-0 snap-start grid-cols-2 gap-3">
            {pair.map((child, i) => (
              <div key={child.key ?? `item-${pageIndex}-${i}`} className="min-w-0 h-full">
                {child}
              </div>
            ))}
            {pair.length === 1 ? <div className="invisible" aria-hidden="true" /> : null}
          </div>
        ))}
      </div>

      {showDots && pairs.length > 1 ? (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {pairs.map((_, pageIndex) => (
            <button
              key={`dot-${pageIndex}`}
              type="button"
              aria-label={`Page ${pageIndex + 1}`}
              onClick={() => {
                const node = ref.current;
                if (!node) return;
                node.scrollTo({ left: pageIndex * node.clientWidth, behavior: 'smooth' });
                setPage(pageIndex);
              }}
              className={`h-2 rounded-full transition ${page === pageIndex ? 'w-5 bg-[#ae2f34]' : 'w-2 bg-stone-300'}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
