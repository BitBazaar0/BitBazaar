// User types
export interface User {
  id: string;
  email: string;
  username: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreateInput {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
}

export type Condition = 'new' | 'used' | 'refurbished';

export interface Category {
  id: string;
  name: string;
  slug: string;
  displayName: string;
  icon?: string;
  color?: string;
  isActive: boolean;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  category?: Category;
  brand?: string;
  model?: string;
  condition: Condition;
  price: number;
  location: string;
  images: string[];
  sellerId: string;
  views: number;
  isActive: boolean;
  isBoosted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListingCreateInput {
  title: string;
  description: string;
  categoryId: string; // Required: all listings must have a category
  brand?: string;
  model?: string;
  condition: Condition;
  price: number;
  location: string;
  images: string[];
}

export interface ListingFilters {
  categoryId?: string;
  categorySlug?: string;
  brand?: string;
  condition?: Condition;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  search?: string;
  sellerId?: string;
  isActive?: boolean;
}

// Chat types
export interface Chat {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  imageUrl?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface MessageCreateInput {
  content: string;
  imageUrl?: string;
}

// Favorite types
export interface Favorite {
  id: string;
  userId: string;
  listingId: string;
  createdAt: Date;
}

// Review types
export interface Review {
  id: string;
  listingId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewCreateInput {
  rating: number;
  comment?: string;
}

