import { PartType } from '../services/listing.service';

export interface Category {
  name: string;
  path: string;
  partTypes?: PartType[];
  subcategories?: SubCategory[];
}

export interface SubCategory {
  name: string;
  partType: PartType;
}

export const categories: Category[] = [
  {
    name: 'NEW',
    path: '/listings?sort=newest',
    partTypes: undefined,
  },
  {
    name: 'GAMING PCS',
    path: '/listings?partType=Case',
    subcategories: [
      { name: 'Value PCs', partType: 'Case' },
      { name: 'Mid-Range PCs', partType: 'Case' },
      { name: 'Pro Gamer PCs', partType: 'Case' },
      { name: 'Full Systems', partType: 'Case' },
    ],
  },
  {
    name: 'GPUS',
    path: '/listings?partType=GPU',
    partTypes: ['GPU'],
    subcategories: [
      { name: 'NVIDIA GPUs', partType: 'GPU' },
      { name: 'AMD GPUs', partType: 'GPU' },
      { name: 'Intel GPUs', partType: 'GPU' },
    ],
  },
  {
    name: 'COMPONENTS',
    path: '/listings',
    partTypes: ['CPU', 'GPU', 'RAM', 'Motherboard', 'Storage', 'PSU', 'Case', 'Cooling'],
    subcategories: [
      { name: 'GPUs', partType: 'GPU' },
      { name: 'CPUs', partType: 'CPU' },
      { name: 'CPU Coolers', partType: 'Cooling' },
      { name: 'Motherboards', partType: 'Motherboard' },
      { name: 'Motherboard Bundles', partType: 'Motherboard' },
      { name: 'Memory', partType: 'RAM' },
      { name: 'Storage', partType: 'Storage' },
      { name: 'Cases', partType: 'Case' },
      { name: 'Case Fans', partType: 'Cooling' },
      { name: 'Power Supplies', partType: 'PSU' },
      { name: 'Expansion Cards', partType: 'Other' },
      { name: 'Network Adapters', partType: 'Other' },
      { name: 'Other Components', partType: 'Other' },
    ],
  },
  {
    name: 'PERIPHERALS',
    path: '/listings?partType=Peripheral',
    partTypes: ['Peripheral', 'Monitor'],
    subcategories: [
      { name: 'Monitors', partType: 'Monitor' },
      { name: 'Headphones', partType: 'Peripheral' },
      { name: 'Keyboards', partType: 'Peripheral' },
      { name: 'Mice', partType: 'Peripheral' },
      { name: 'Speakers', partType: 'Peripheral' },
      { name: 'Controllers', partType: 'Peripheral' },
      { name: 'Simulators & Racing Platforms', partType: 'Peripheral' },
      { name: 'Webcams', partType: 'Peripheral' },
      { name: 'VR', partType: 'Peripheral' },
      { name: 'External Storage', partType: 'Storage' },
      { name: 'Other Peripherals', partType: 'Peripheral' },
    ],
  },
  {
    name: 'OTHER SYSTEMS',
    path: '/listings',
    partTypes: ['Other'],
    subcategories: [
      { name: 'Laptops', partType: 'Other' },
      { name: 'Phones', partType: 'Other' },
      { name: 'Tablets', partType: 'Other' },
      { name: 'Consoles', partType: 'Other' },
      { name: 'Handhelds', partType: 'Other' },
    ],
  },
];

export const getCategoryBadgeColor = (partType: PartType): string => {
  const colors: Record<PartType, string> = {
    GPU: '#6366f1',
    CPU: '#10b981',
    RAM: '#f59e0b',
    Motherboard: '#8b5cf6',
    Storage: '#ec4899',
    PSU: '#3b82f6',
    Case: '#14b8a6',
    Cooling: '#06b6d4',
    Peripheral: '#a855f7',
    Monitor: '#f97316',
    Other: '#64748b',
  };
  return colors[partType] || colors.Other;
};

export const getCategoryLabel = (partType: PartType): string => {
  const labels: Record<PartType, string> = {
    GPU: 'GPUS',
    CPU: 'CPUS',
    RAM: 'MEMORY',
    Motherboard: 'MOTHERBOARDS',
    Storage: 'STORAGE',
    PSU: 'POWER SUPPLIES',
    Case: 'GAMING PCS',
    Cooling: 'COOLING',
    Peripheral: 'PERIPHERALS',
    Monitor: 'MONITORS',
    Other: 'OTHER',
  };
  return labels[partType] || 'OTHER';
};

