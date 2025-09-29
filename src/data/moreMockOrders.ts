// src/data/moreMockOrders.ts

// First, define the types so this file is self-contained
export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  orderDate: string;
  status: "Pending" | "Shipped" | "Delivered" | "Canceled";
  items: OrderItem[];
  totalAmount: number;
}

// Export the master list of all mock orders
export const mockOrders: Order[] = [
  {
    id: "ORD-001",
    customerName: "Rohan Sharma",
    orderDate: "2025-09-28",
    status: "Pending",
    items: [
      { id: "item_11", name: "Luxury 5-Seater Sofa Set", quantity: 1, price: 55000 },
      { id: "item_14", name: "Smart WiFi LED Strip", quantity: 2, price: 3000 },
    ],
    totalAmount: 61000,
  },
  {
    id: "ORD-002",
    customerName: "Priya Singh",
    orderDate: "2025-09-27",
    status: "Shipped",
    items: [
      { id: "item_21", name: "Organic Basmati Rice (5kg)", quantity: 3, price: 750 },
      { id: "item_25", name: "Fresh Motichoor Ladoo (1kg)", quantity: 2, price: 600 },
    ],
    totalAmount: 3450,
  },
  {
    id: "ORD-003",
    customerName: "Amit Kumar",
    orderDate: "2025-09-26",
    status: "Delivered",
    items: [
      { id: "item_8", name: "55-inch 4K UHD Smart TV", quantity: 1, price: 45000 },
    ],
    totalAmount: 45000,
  },
  {
    id: "ORD-004",
    customerName: "Sunita Devi",
    orderDate: "2025-09-25",
    status: "Canceled",
    items: [
      { id: "item_17", name: "Front-Load Washing Machine (8kg)", quantity: 1, price: 32000 },
    ],
    totalAmount: 32000,
  },
  {
    id: "ORD-005",
    customerName: "Vikram Rathod",
    orderDate: "2025-09-29",
    status: "Pending",
    items: [
        { id: "item_27", name: "Disinfectant Floor Cleaner (1L)", quantity: 5, price: 180 },
        { id: "item_28", name: "Dishwashing Liquid Gel (750ml)", quantity: 4, price: 150 },
    ],
    totalAmount: 1500,
  },
  {
    id: "ORD-006",
    customerName: "Anjali Mehta",
    orderDate: "2025-09-28",
    status: "Delivered",
    items: [
        { id: "item_13", name: "Ergonomic Office Chair", quantity: 2, price: 9500 },
    ],
    totalAmount: 19000,
  },
  {
    id: "ORD-007",
    customerName: "Sameer Verma",
    orderDate: "2025-09-27",
    status: "Shipped",
    items: [
        { id: "item_20", name: "Woven Macrame Wall Tapestry", quantity: 1, price: 1800 },
        { id: "item_15", name: "Modern Crystal Chandelier", quantity: 1, price: 15000 },
    ],
    totalAmount: 16800,
  },
  {
    id: "ORD-008",
    customerName: "Neha Gupta",
    orderDate: "2025-09-26",
    status: "Delivered",
    items: [
        { id: "item_6", name: "Porcelain Dinner Set (24 pcs)", quantity: 1, price: 5999 },
    ],
    totalAmount: 5999,
  },
  {
    id: "ORD-009",
    customerName: "Deepak Joshi",
    orderDate: "2025-09-25",
    status: "Delivered",
    items: [
        { id: "item_35", name: "Assam Masala Chai Tea Bags (100 pcs)", quantity: 3, price: 350 },
        { id: "item_24", name: "Handmade Kaju Katli (500g)", quantity: 2, price: 800 },
    ],
    totalAmount: 2650,
  },
  {
    id: "ORD-010",
    customerName: "Kavita Patil",
    orderDate: "2025-09-24",
    status: "Canceled",
    items: [
        { id: "item_10", name: "Smart Watch with GPS", quantity: 1, price: 8999 },
    ],
    totalAmount: 8999,
  },
  {
    id: "ORD-011",
    customerName: "Manoj Tiwari",
    orderDate: "2025-09-29",
    status: "Pending",
    items: [
        { id: "item_31", name: "Premium Khoya / Mawa (250g)", quantity: 5, price: 200 },
    ],
    totalAmount: 1000,
  },
  {
    id: "ORD-012",
    customerName: "Geeta Singh",
    orderDate: "2025-09-28",
    status: "Shipped",
    items: [
        { id: "item_33", name: "Natural Mineral Water (1L x 12 bottles)", quantity: 2, price: 240 },
        { id: "item_22", name: "Whole Wheat Aata (10kg)", quantity: 1, price: 450 },
    ],
    totalAmount: 930,
  },
  {
    id: "ORD-013",
    customerName: "Rajesh Kumar",
    orderDate: "2025-09-23",
    status: "Delivered",
    items: [
        { id: "item_18", name: "Double Door Refrigerator (300L)", quantity: 1, price: 28000 },
    ],
    totalAmount: 28000,
  },
  {
    id: "ORD-014",
    customerName: "Sanjay Reddy",
    orderDate: "2025-09-22",
    status: "Delivered",
    items: [
        { id: "item_2", name: "Professional Blender Pro 5000", quantity: 1, price: 4500 },
        { id: "item_3", name: "Stainless Steel Knife Set", quantity: 1, price: 2200 },
    ],
    totalAmount: 6700,
  },
  {
    id: "ORD-015",
    customerName: "Pooja Desai",
    orderDate: "2025-09-29",
    status: "Pending",
    items: [
        { id: "item_7", name: "Crystal Wine Glasses (Set of 6)", quantity: 2, price: 3200 },
    ],
    totalAmount: 6400,
  }
];