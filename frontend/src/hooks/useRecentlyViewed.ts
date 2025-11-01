import { useState, useEffect } from 'react';

interface RecentlyViewedItem {
  id: string;
  title: string;
  price: number;
  image?: string;
  viewedAt: number;
}

const STORAGE_KEY = 'bitbazaar_recently_viewed';
const MAX_ITEMS = 10;

export const useRecentlyViewed = () => {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse recently viewed items:', error);
      }
    }
  }, []);

  const addItem = (item: Omit<RecentlyViewedItem, 'viewedAt'>) => {
    setItems(prev => {
      // Remove if already exists
      const filtered = prev.filter(i => i.id !== item.id);
      // Add to beginning
      const updated = [
        { ...item, viewedAt: Date.now() },
        ...filtered
      ].slice(0, MAX_ITEMS);
      
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearAll = () => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { items, addItem, clearAll };
};

