
import type { Category } from './types';

const categories: Category[] = [
  { id: 'unisex-apparel', name: 'Unisex', isApparel: true },
  { id: 'men-tops', name: 'Men - Tops', isApparel: true },
  { id: 'men-bottoms', name: 'Men - Bottoms', isApparel: true },
  { id: 'women-tops', name: 'Women - Tops', isApparel: true },
  { id: 'women-bottoms', name: 'Women - Bottoms', isApparel: true },
];

export const getCategories = (): Category[] => {
  return categories;
};
