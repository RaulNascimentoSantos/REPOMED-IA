'use client';

/**
 * 🚀 Advanced Medical Virtualization System
 * High-performance virtualization optimized for medical data
 * Handles 10k+ patient records, documents, and medical lists
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

interface VirtualizationOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  estimateHeight?: boolean;
  getItemHeight?: (index: number) => number;
}

interface VirtualItem {
  index: number;
  start: number;
  end: number;
  height: number;
}

export function useVirtualization<T>(
  items: T[],
  options: VirtualizationOptions
) {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    itemHeight,
    containerHeight,
    overscan = 5,
    estimateHeight = false,
    getItemHeight
  } = options;

  // Enhanced visible items calculation
  const visibleItems = useMemo(() => {
    if (!items.length) {
      return {
        startIndex: 0,
        endIndex: 0,
        items: [],
        offsetY: 0,
        totalHeight: 0,
        virtualItems: []
      };
    }

    let startIndex: number;
    let endIndex: number;
    let totalHeight = 0;
    let offsetY = 0;

    if (getItemHeight) {
      // Variable height calculation
      let currentHeight = 0;
      startIndex = 0;
      endIndex = items.length - 1;

      // Find start index
      for (let i = 0; i < items.length; i++) {
        const height = getItemHeight(i);
        if (currentHeight + height > scrollTop) {
          startIndex = Math.max(0, i - overscan);
          offsetY = currentHeight - (i - startIndex) * itemHeight;
          break;
        }
        currentHeight += height;
      }

      // Find end index
      currentHeight = offsetY;
      for (let i = startIndex; i < items.length; i++) {
        const height = getItemHeight(i);
        currentHeight += height;
        if (currentHeight > scrollTop + containerHeight) {
          endIndex = Math.min(items.length - 1, i + overscan);
          break;
        }
      }

      // Calculate total height
      for (let i = 0; i < items.length; i++) {
        totalHeight += getItemHeight(i);
      }
    } else {
      // Fixed height calculation (optimized)
      startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
      endIndex = Math.min(
        items.length - 1,
        Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
      );
      offsetY = startIndex * itemHeight;
      totalHeight = items.length * itemHeight;
    }

    // Create virtual items
    const virtualItems: VirtualItem[] = [];
    let currentStart = offsetY;

    for (let i = startIndex; i <= endIndex; i++) {
      const height = getItemHeight ? getItemHeight(i) : itemHeight;
      virtualItems.push({
        index: i,
        start: currentStart,
        end: currentStart + height,
        height
      });
      currentStart += height;
    }

    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex + 1),
      offsetY,
      totalHeight,
      virtualItems
    };
  }, [items, scrollTop, itemHeight, containerHeight, overscan, getItemHeight]);

  // Enhanced scroll handler with scrolling state
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    setIsScrolling(true);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set scrolling to false after scroll ends
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);

  // Scroll to specific index
  const scrollToIndex = useCallback((index: number, align: 'start' | 'center' | 'end' = 'start') => {
    let targetScrollTop = 0;

    if (getItemHeight) {
      for (let i = 0; i < index; i++) {
        targetScrollTop += getItemHeight(i);
      }
    } else {
      targetScrollTop = index * itemHeight;
    }

    // Adjust for alignment
    if (align === 'center') {
      const currentItemHeight = getItemHeight ? getItemHeight(index) : itemHeight;
      targetScrollTop -= (containerHeight - currentItemHeight) / 2;
    } else if (align === 'end') {
      const currentItemHeight = getItemHeight ? getItemHeight(index) : itemHeight;
      targetScrollTop -= containerHeight - currentItemHeight;
    }

    return Math.max(0, Math.min(targetScrollTop, visibleItems.totalHeight - containerHeight));
  }, [containerHeight, itemHeight, visibleItems.totalHeight, getItemHeight]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...visibleItems,
    handleScroll,
    scrollToIndex,
    isScrolling,
    scrollTop
  };
}

// Medical-specific virtualization for patient lists
export function useMedicalListVirtualization<T extends { id: string | number; priority?: string }>(
  items: T[],
  itemHeight: number = 80,
  containerHeight: number = 600
) {
  const virtualization = useVirtualization(items, {
    itemHeight,
    containerHeight,
    overscan: 10, // Higher overscan for medical data
  });

  // Search within virtualized list
  const searchAndScrollTo = useCallback((searchTerm: string, searchKey: keyof T) => {
    const index = items.findIndex(item =>
      String(item[searchKey]).toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (index !== -1) {
      const scrollTop = virtualization.scrollToIndex(index, 'center');
      return { index, scrollTop };
    }

    return null;
  }, [items, virtualization]);

  // Medical priority sorting
  const sortByMedicalPriority = useCallback(() => {
    const priorityOrder = ['critical', 'urgent', 'high', 'medium', 'low'];
    return [...items].sort((a, b) => {
      const priorityA = String(a.priority || 'low').toLowerCase();
      const priorityB = String(b.priority || 'low').toLowerCase();

      const indexA = priorityOrder.indexOf(priorityA);
      const indexB = priorityOrder.indexOf(priorityB);

      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });
  }, [items]);

  return {
    ...virtualization,
    searchAndScrollTo,
    sortByMedicalPriority,
    getTotalItems: () => items.length,
    getVisibleRange: () => ({
      start: virtualization.startIndex + 1,
      end: virtualization.endIndex + 1,
      total: items.length
    })
  };
}

// Hook for medical documents with variable heights
export function useMedicalDocumentVirtualization(
  documents: any[],
  containerHeight: number = 500
) {
  const getDocumentHeight = useCallback((index: number) => {
    const doc = documents[index];
    if (!doc) return 60;

    // Variable heights based on document type and priority
    switch (doc.type) {
      case 'prescription':
        return doc.urgent ? 100 : 80;
      case 'medical_certificate':
        return 70;
      case 'lab_report':
        return doc.detailed ? 120 : 90;
      case 'consultation_report':
        return 95;
      default:
        return 60;
    }
  }, [documents]);

  return useVirtualization(documents, {
    itemHeight: 60,
    containerHeight,
    overscan: 8,
    estimateHeight: true,
    getItemHeight: getDocumentHeight
  });
}