// src/data/userDashboardDummyData.ts

export interface User {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Staff";
  joinedDate: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  subcategory: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  totalPrice: number;
  date: string;
  status: "Pending" | "Completed" | "Cancelled";
}

export interface Consumable {
  id: number;
  name: string;
  category: string;
  quantity: number;
  usedQuantity: number;
}

export interface KitchenStock {
  id: number;
  item: string;
  quantity: number;
  lowStockThreshold: number;
}

export interface Category {
  id: number;
  name: string;
  subcategories: string[];
}

export interface Wastage {
  id: number;
  item: string;
  quantity: number;
  reason: string;
  date: string;
}

export interface Report {
  id: number;
  title: string;
  value: number;
  type: "Stock" | "Sales" | "Orders" | "Revenue";
}

// ===== DUMMY DATA =====

export const users: User[] = [
  { id: 1, name: "Alice Smith", email: "alice@example.com", role: "Admin", joinedDate: "2025-01-12" },
  { id: 2, name: "Bob Johnson", email: "bob@example.com", role: "Manager", joinedDate: "2025-02-25" },
  { id: 3, name: "Carol Williams", email: "carol@example.com", role: "Staff", joinedDate: "2025-03-10" },
];

export const products: Product[] = [
  { id: 1, name: "Olive Oil", category: "Food", subcategory: "Condiment", quantity: 120, price: 10 },
  { id: 2, name: "Glass Plate", category: "Crockery", subcategory: "Plates", quantity: 80, price: 5 },
  { id: 3, name: "Chef Knife", category: "Kitchen", subcategory: "Utensils", quantity: 50, price: 15 },
  { id: 4, name: "Rice", category: "Food", subcategory: "Grains", quantity: 200, price: 2 },
  { id: 5, name: "Steel Spoon", category: "Crockery", subcategory: "Cutlery", quantity: 300, price: 1 },
];

export const orders: Order[] = [
  { id: 1, productId: 1, productName: "Olive Oil", quantity: 3, totalPrice: 30, date: "2025-10-01", status: "Completed" },
  { id: 2, productId: 2, productName: "Glass Plate", quantity: 10, totalPrice: 50, date: "2025-10-03", status: "Pending" },
  { id: 3, productId: 4, productName: "Rice", quantity: 20, totalPrice: 40, date: "2025-10-05", status: "Completed" },
];

export const consumables: Consumable[] = [
  { id: 1, name: "Salt", category: "Spices", quantity: 500, usedQuantity: 120 },
  { id: 2, name: "Sugar", category: "Sweeteners", quantity: 300, usedQuantity: 80 },
  { id: 3, name: "Pepper", category: "Spices", quantity: 200, usedQuantity: 50 },
];

export const kitchenStock: KitchenStock[] = [
  { id: 1, item: "Frying Pan", quantity: 20, lowStockThreshold: 5 },
  { id: 2, item: "Mixing Bowl", quantity: 15, lowStockThreshold: 5 },
  { id: 3, item: "Chopping Board", quantity: 10, lowStockThreshold: 3 },
];

export const categories: Category[] = [
  { id: 1, name: "Food", subcategories: ["Condiment", "Beverages", "Grains", "Snacks"] },
  { id: 2, name: "Crockery", subcategories: ["Plates", "Glassware", "Cutlery"] },
  { id: 3, name: "Kitchen", subcategories: ["Utensils", "Appliances"] },
];

export const wastage: Wastage[] = [
  { id: 1, item: "Olive Oil", quantity: 2, reason: "Expired", date: "2025-09-28" },
  { id: 2, item: "Sugar", quantity: 5, reason: "Spilled", date: "2025-09-30" },
];

export const reports: Report[] = [
  { id: 1, title: "Total Stock Value", value: 4500, type: "Stock" },
  { id: 2, title: "Total Sales", value: 12500, type: "Sales" },
  { id: 3, title: "Pending Orders", value: 12, type: "Orders" },
  { id: 4, title: "Revenue This Month", value: 9800, type: "Revenue" },
];
