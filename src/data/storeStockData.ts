// src/data/storeStockData.ts

export type Product = {
  id: string; name: string; category: string; subCategory: string;
  price: number; quantity: number; gst: number;
};

export const stockProducts: Product[] = [
  { id: 'PROD-004', name: 'Dell XPS 15', category: 'Electronics', subCategory: 'Laptops', price: 95000, quantity: 5, gst: 18 },
  { id: 'PROD-012', name: 'HP Spectre x360', category: 'Electronics', subCategory: 'Laptops', price: 112000, quantity: 3, gst: 18 },
  { id: 'PROD-015', name: 'Apple MacBook Pro 14"', category: 'Electronics', subCategory: 'Laptops', price: 190000, quantity: 4, gst: 18 },
  { id: 'PROD-005', name: 'Logitech MX Master 3', category: 'Electronics', subCategory: 'Accessories', price: 8500, quantity: 12, gst: 18 },
  { id: 'PROD-016', name: 'Dell 27" 4K Monitor', category: 'Electronics', subCategory: 'Accessories', price: 45000, quantity: 8, gst: 18 },
  { id: 'PROD-021', name: 'Sony WH-1000XM5', category: 'Electronics', subCategory: 'Audio', price: 28000, quantity: 10, gst: 18 },
];