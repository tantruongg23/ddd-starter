import { Injectable } from '@angular/core';
import { Product, ProductSortOption, ProductStatus } from '../models/product.model';

/**
 * Product Filter Criteria
 */
export interface ProductFilterCriteria {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
  tags?: string[];
  inStockOnly?: boolean;
  onSaleOnly?: boolean;
  rating?: number;
  sortBy?: ProductSortOption;
}

/**
 * Product Filter Service
 * 
 * Domain service for filtering and sorting products.
 * Contains pure business logic without side effects.
 */
@Injectable({
  providedIn: 'root'
})
export class ProductFilterService {
  
  /**
   * Filters products based on criteria
   */
  filter(products: Product[], criteria: ProductFilterCriteria): Product[] {
    let filtered = [...products];
    
    // Search filter
    if (criteria.search) {
      const searchLower = criteria.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.brand.toLowerCase().includes(searchLower) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    // Category filter
    if (criteria.categoryId) {
      filtered = filtered.filter(p => p.categoryId === criteria.categoryId);
    }
    
    // Price range filter
    if (criteria.minPrice !== undefined) {
      filtered = filtered.filter(p => p.price.amount >= criteria.minPrice!);
    }
    if (criteria.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.price.amount <= criteria.maxPrice!);
    }
    
    // Brand filter
    if (criteria.brands && criteria.brands.length > 0) {
      const brandsLower = criteria.brands.map(b => b.toLowerCase());
      filtered = filtered.filter(p => brandsLower.includes(p.brand.toLowerCase()));
    }
    
    // Tags filter
    if (criteria.tags && criteria.tags.length > 0) {
      filtered = filtered.filter(p => 
        criteria.tags!.some(tag => p.hasTag(tag))
      );
    }
    
    // In stock filter
    if (criteria.inStockOnly) {
      filtered = filtered.filter(p => p.isInStock);
    }
    
    // On sale filter
    if (criteria.onSaleOnly) {
      filtered = filtered.filter(p => p.isOnSale);
    }
    
    // Rating filter
    if (criteria.rating !== undefined && criteria.rating > 0) {
      filtered = filtered.filter(p => p.rating.average >= criteria.rating!);
    }
    
    // Sort
    if (criteria.sortBy) {
      filtered = this.sort(filtered, criteria.sortBy);
    }
    
    return filtered;
  }
  
  /**
   * Sorts products by the specified option
   */
  sort(products: Product[], sortBy: ProductSortOption): Product[] {
    const sorted = [...products];
    
    switch (sortBy) {
      case ProductSortOption.NEWEST:
        return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
      case ProductSortOption.PRICE_LOW:
        return sorted.sort((a, b) => a.price.amount - b.price.amount);
        
      case ProductSortOption.PRICE_HIGH:
        return sorted.sort((a, b) => b.price.amount - a.price.amount);
        
      case ProductSortOption.RATING:
        return sorted.sort((a, b) => b.rating.average - a.rating.average);
        
      case ProductSortOption.NAME_ASC:
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
        
      case ProductSortOption.NAME_DESC:
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
        
      case ProductSortOption.POPULARITY:
        return sorted.sort((a, b) => b.rating.count - a.rating.count);
        
      default:
        return sorted;
    }
  }
  
  /**
   * Extracts available brands from products
   */
  extractBrands(products: Product[]): string[] {
    const brands = new Set<string>();
    products.forEach(p => {
      if (p.brand) {
        brands.add(p.brand);
      }
    });
    return Array.from(brands).sort();
  }
  
  /**
   * Extracts price range from products
   */
  extractPriceRange(products: Product[]): { min: number; max: number } {
    if (products.length === 0) {
      return { min: 0, max: 0 };
    }
    
    const prices = products.map(p => p.price.amount);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }
  
  /**
   * Extracts all unique tags from products
   */
  extractTags(products: Product[]): string[] {
    const tags = new Set<string>();
    products.forEach(p => {
      p.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }
  
  /**
   * Groups products by category
   */
  groupByCategory(products: Product[]): Map<string, Product[]> {
    const groups = new Map<string, Product[]>();
    
    products.forEach(product => {
      const categoryId = product.categoryId;
      if (!groups.has(categoryId)) {
        groups.set(categoryId, []);
      }
      groups.get(categoryId)!.push(product);
    });
    
    return groups;
  }
}
