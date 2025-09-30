// userOrdersData.ts

// ===================================
// 1. DEFINE THE DATA TYPES
// ===================================

/**
 * Defines the structure for a single product within an order.
 */
export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number; // Price per unit, before GST
  gst: number;   // GST percentage (e.g., 18 for 18%)
}

/**
 * Defines the structure for a customer's order.
 */
export interface Order {
  id: string;
  customerName: string;
  orderDate: string; // Format: YYYY-MM-DD
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  products: Product[]; // Each order contains an array of products
}


// ===================================
// 2. CREATE AND EXPORT DUMMY DATA
// ===================================

/**
 * An array of 15 sample orders to be used in the application.
 */
export const orders: Order[] = [
  {
    id: 'ORD-2025-001',
    customerName: 'Aarav Sharma',
    orderDate: '2025-09-28',
    status: 'Delivered',
    products: [
      { id: 'PROD-01', name: 'Laptop Pro', category: 'Electronics', quantity: 1, price: 85000, gst: 18 },
      { id: 'PROD-02', name: 'Wireless Mouse', category: 'Accessories', quantity: 1, price: 1500, gst: 18 },
    ],
  },
  {
    id: 'ORD-2025-002',
    customerName: 'Diya Patel',
    orderDate: '2025-09-27',
    status: 'Shipped',
    products: [
      { id: 'PROD-03', name: 'Mechanical Keyboard', category: 'Accessories', quantity: 1, price: 4500, gst: 18 },
    ],
  },
  {
    id: 'ORD-2025-003',
    customerName: 'Vihaan Singh',
    orderDate: '2025-09-26',
    status: 'Pending',
    products: [
      { id: 'PROD-04', name: '4K Monitor', category: 'Electronics', quantity: 2, price: 22000, gst: 28 },
      { id: 'PROD-05', name: 'USB-C Hub', category: 'Accessories', quantity: 1, price: 2500, gst: 18 },
    ],
  },
  {
    id: 'ORD-2025-004',
    customerName: 'Ananya Gupta',
    orderDate: '2025-09-25',
    status: 'Cancelled',
    products: [
      { id: 'PROD-06', name: 'Smartphone', category: 'Electronics', quantity: 1, price: 45000, gst: 18 },
    ],
  },
  {
    id: 'ORD-2025-005',
    customerName: 'Ishaan Kumar',
    orderDate: '2025-09-24',
    status: 'Delivered',
    products: [
      { id: 'PROD-07', name: 'Noise-Cancelling Headphones', category: 'Audio', quantity: 1, price: 12000, gst: 18 },
    ],
  },
  {
    id: 'ORD-2025-006',
    customerName: 'Myra Reddy',
    orderDate: '2025-09-23',
    status: 'Shipped',
    products: [
      { id: 'PROD-08', name: 'Webcam HD', category: 'Accessories', quantity: 1, price: 3500, gst: 18 },
      { id: 'PROD-09', name: 'Office Chair', category: 'Furniture', quantity: 1, price: 8000, gst: 28 },
    ],
  },
  {
    id: 'ORD-2025-007',
    customerName: 'Reyansh Joshi',
    orderDate: '2025-09-22',
    status: 'Delivered',
    products: [
      { id: 'PROD-10', name: 'Tablet', category: 'Electronics', quantity: 1, price: 32000, gst: 18 },
    ],
  },
  {
    id: 'ORD-2025-008',
    customerName: 'Saanvi Mehta',
    orderDate: '2025-09-21',
    status: 'Pending',
    products: [
      { id: 'PROD-01', name: 'Laptop Pro', category: 'Electronics', quantity: 2, price: 85000, gst: 18 },
    ],
  },
  {
    id: 'ORD-2025-009',
    customerName: 'Advik Verma',
    orderDate: '2025-09-20',
    status: 'Shipped',
    products: [
      { id: 'PROD-11', name: 'Gaming Mouse', category: 'Accessories', quantity: 1, price: 3000, gst: 18 },
      { id: 'PROD-12', name: 'Mouse Pad XL', category: 'Accessories', quantity: 1, price: 800, gst: 12 },
    ],
  },
  {
    id: 'ORD-2025-010',
    customerName: 'Kiara Nair',
    orderDate: '2025-09-19',
    status: 'Delivered',
    products: [
      { id: 'PROD-13', name: 'Smart Watch', category: 'Wearables', quantity: 1, price: 19500, gst: 18 },
    ],
  },
  {
    id: 'ORD-2025-011',
    customerName: 'Arjun Desai',
    orderDate: '2025-09-18',
    status: 'Cancelled',
    products: [
      { id: 'PROD-04', name: '4K Monitor', category: 'Electronics', quantity: 1, price: 22000, gst: 28 },
    ],
  },
  {
    id: 'ORD-2025-012',
    customerName: 'Pari Agarwal',
    orderDate: '2025-09-17',
    status: 'Shipped',
    products: [
      { id: 'PROD-14', name: 'Portable SSD 1TB', category: 'Storage', quantity: 1, price: 7500, gst: 18 },
    ],
  },
  {
    id: 'ORD-2025-013',
    customerName: 'Kabir Iyer',
    orderDate: '2025-09-16',
    status: 'Delivered',
    products: [
      { id: 'PROD-15', name: 'Bluetooth Speaker', category: 'Audio', quantity: 2, price: 4000, gst: 18 },
    ],
  },
  {
    id: 'ORD-2025-014',
    customerName: 'Zara Khan',
    orderDate: '2025-09-15',
    status: 'Pending',
    products: [
      { id: 'PROD-09', name: 'Office Chair', category: 'Furniture', quantity: 4, price: 8000, gst: 28 },
      { id: 'PROD-16', name: 'Adjustable Desk', category: 'Furniture', quantity: 2, price: 15000, gst: 28 },
    ],
  },
  {
    id: 'ORD-2025-015',
    customerName: 'Rohan Malhotra',
    orderDate: '2025-09-14',
    status: 'Delivered',
    products: [
      { id: 'PROD-02', name: 'Wireless Mouse', category: 'Accessories', quantity: 3, price: 1500, gst: 18 },
    ],
  },
];