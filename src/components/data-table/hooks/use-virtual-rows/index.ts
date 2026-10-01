import type { Row } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { type RefObject, useEffect } from 'react';

interface Options<T> {
  rows: Row<T>[];
  scrollRef: RefObject<HTMLDivElement | null>;
  enabled: boolean;
  estimateRowHeight?: number;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

// Rows to render plus top/bottom spacer heights. Calls `onLoadMore` when the
// rendered window reaches the last few rows. Disabled → returns every row.
export function useVirtualRows<T>({
  rows,
  scrollRef,
  enabled,
  estimateRowHeight = 48,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
}: Options<T>) {
  // TanStack returns fresh functions each render; compiler skipping this hook is intended.
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimateRowHeight,
    overscan: 10,
    enabled,
  });

  const items = virtualizer.getVirtualItems();
  const lastIndex = items.length ? items[items.length - 1].index : -1;

  useEffect(() => {
    if (enabled && hasMore && !isLoadingMore && lastIndex >= rows.length - 5) onLoadMore?.();
  }, [enabled, hasMore, isLoadingMore, lastIndex, rows.length, onLoadMore]);

  if (!enabled) return { visible: rows, padTop: 0, padBottom: 0 };

  return {
    visible: items.map((i) => rows[i.index]),
    padTop: items.length ? items[0].start : 0,
    padBottom: items.length ? virtualizer.getTotalSize() - items[items.length - 1].end : 0,
  };
}
