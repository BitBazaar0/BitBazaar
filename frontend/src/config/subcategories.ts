/**
 * Subcategory mappings for category navigation dropdowns
 * 
 * Note: Brands are fetched dynamically from the API (see useCategoryBrands hook)
 * This file only contains static descriptive subcategories that don't come from the database
 */
export interface Subcategory {
  name: string;
  type: 'brand' | 'descriptive';
  filter: { categorySlug: string; brand?: string };
}

/**
 * Static descriptive subcategories that are UI-only and don't depend on database data
 * Brand-based subcategories are fetched dynamically from actual listings
 */
export const staticSubcategories: Record<string, Subcategory[]> = {
  ram: [
    { name: 'DDR4 RAM', type: 'descriptive', filter: { categorySlug: 'ram' } },
    { name: 'DDR5 RAM', type: 'descriptive', filter: { categorySlug: 'ram' } },
  ],
  motherboard: [
    { name: 'Motherboard Bundles', type: 'descriptive', filter: { categorySlug: 'motherboard' } },
  ],
  storage: [
    { name: 'NVMe SSDs', type: 'descriptive', filter: { categorySlug: 'storage' } },
    { name: 'SATA SSDs', type: 'descriptive', filter: { categorySlug: 'storage' } },
    { name: 'HDDs', type: 'descriptive', filter: { categorySlug: 'storage' } },
  ],
  psu: [
    { name: '80+ Gold PSUs', type: 'descriptive', filter: { categorySlug: 'psu' } },
    { name: 'Modular PSUs', type: 'descriptive', filter: { categorySlug: 'psu' } },
  ],
  case: [
    { name: 'Value PCs', type: 'descriptive', filter: { categorySlug: 'case' } },
    { name: 'Mid-Range PCs', type: 'descriptive', filter: { categorySlug: 'case' } },
    { name: 'Pro Gamer PCs', type: 'descriptive', filter: { categorySlug: 'case' } },
    { name: 'Full Systems', type: 'descriptive', filter: { categorySlug: 'case' } },
  ],
  cooling: [
    { name: 'CPU Coolers', type: 'descriptive', filter: { categorySlug: 'cooling' } },
    { name: 'Case Fans', type: 'descriptive', filter: { categorySlug: 'cooling' } },
    { name: 'Liquid Cooling', type: 'descriptive', filter: { categorySlug: 'cooling' } },
  ],
  peripheral: [
    { name: 'Keyboards', type: 'descriptive', filter: { categorySlug: 'peripheral' } },
    { name: 'Mice', type: 'descriptive', filter: { categorySlug: 'peripheral' } },
    { name: 'Headphones', type: 'descriptive', filter: { categorySlug: 'peripheral' } },
    { name: 'Speakers', type: 'descriptive', filter: { categorySlug: 'peripheral' } },
    { name: 'Controllers', type: 'descriptive', filter: { categorySlug: 'peripheral' } },
    { name: 'Webcams', type: 'descriptive', filter: { categorySlug: 'peripheral' } },
    { name: 'VR Headsets', type: 'descriptive', filter: { categorySlug: 'peripheral' } },
  ],
  monitor: [
    { name: 'Gaming Monitors', type: 'descriptive', filter: { categorySlug: 'monitor' } },
    { name: '4K Monitors', type: 'descriptive', filter: { categorySlug: 'monitor' } },
    { name: 'Ultrawide Monitors', type: 'descriptive', filter: { categorySlug: 'monitor' } },
  ],
};

/**
 * Get static descriptive subcategories for a category slug
 * Note: Brands are fetched dynamically - see useCategoryBrands hook
 */
export const getStaticSubcategoriesForCategory = (categorySlug: string): Subcategory[] => {
  return staticSubcategories[categorySlug] || [];
};

