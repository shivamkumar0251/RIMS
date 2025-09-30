// src/data/ordersWithDetails.ts

export interface OrderItem {
  id: string;
  name: string;
  img: string; // Image URL for the product
  quantity: number;
  price: number;
  gst: number; // GST percentage, e.g., 18
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  orderDate: string;
  status: "Pending" | "Delivered" | "Canceled";
  items: OrderItem[];
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
}

export const mockOrders: Order[] = [
  // Order ID: ORD-001 (Large "Setup" order with 10 items)
  {
    id: "ORD-001",
    userId: "USR-101",
    customerName: "Rohan Sharma",
    orderDate: "2025-09-28",
    status: "Pending",
    items: [
      { id: "item_11", name: "Luxury 5-Seater Sofa Set", img: "https://picsum.photos/id/10/40/40", quantity: 1, price: 55000, gst: 18 },
      { id: "item_14", name: "Smart WiFi LED Strip", img: "https://picsum.photos/id/20/40/40", quantity: 2, price: 3000, gst: 12 },
      { id: "item_13", name: "Ergonomic Office Chair", img: "https://picsum.photos/id/30/40/40", quantity: 1, price: 9500, gst: 18 },
      { id: "item_8", name: "55-inch 4K UHD Smart TV", img: "https://picsum.photos/id/40/40/40", quantity: 1, price: 45000, gst: 28 },
      { id: "item_4", name: "Abstract Canvas Wall Art (Set of 3)", img: "https://picsum.photos/id/50/40/40", quantity: 1, price: 3999, gst: 12 },
      { id: "item_15", name: "Modern Crystal Chandelier", img: "https://picsum.photos/id/60/40/40", quantity: 1, price: 15000, gst: 18 },
      { id: "item_20", name: "Woven Macrame Wall Tapestry", img: "https://picsum.photos/id/70/40/40", quantity: 2, price: 1800, gst: 5 },
      { id: "item_12", name: "Solid Wood King Size Bed", img: "https://picsum.photos/id/80/40/40", quantity: 1, price: 40000, gst: 18 },
      { id: "item_18", name: "Double Door Refrigerator (300L)", img: "https://picsum.photos/id/90/40/40", quantity: 1, price: 28000, gst: 28 },
      { id: "item_24", name: "Indoor Money Plant with Ceramic Pot", img: "https://picsum.photos/id/100/40/40", quantity: 3, price: 800, gst: 5 },
    ],
    subtotal: 208499,
    gstAmount: 38879.88,
    totalAmount: 247378.88,
  },

  // Order ID: ORD-002 (Large "Products" order with 10 items)
  {
    id: "ORD-002",
    userId: "USR-102",
    customerName: "Priya Singh",
    orderDate: "2025-09-27",
    status: "Delivered",
    items: [
      { id: "item_21", name: "Organic Basmati Rice (5kg)", img: "https://picsum.photos/id/110/40/40", quantity: 3, price: 750, gst: 5 },
      { id: "item_25", name: "Fresh Motichoor Ladoo (1kg)", img: "https://picsum.photos/id/120/40/40", quantity: 2, price: 600, gst: 5 },
      { id: "item_22", name: "Whole Wheat Aata (10kg)", img: "https://picsum.photos/id/130/40/40", quantity: 4, price: 450, gst: 5 },
      { id: "item_23", name: "Cold Pressed Sunflower Oil (1L)", img: "https://picsum.photos/id/140/40/40", quantity: 5, price: 350, gst: 5 },
      { id: "item_27", name: "Disinfectant Floor Cleaner (1L)", img: "https://picsum.photos/id/150/40/40", quantity: 2, price: 180, gst: 18 },
      { id: "item_28", name: "Dishwashing Liquid Gel (750ml)", img: "https://picsum.photos/id/160/40/40", quantity: 3, price: 150, gst: 18 },
      { id: "item_30", name: "Pure Cow Ghee (1L)", img: "https://picsum.photos/id/170/40/40", quantity: 1, price: 650, gst: 12 },
      { id: "item_31", name: "Premium Khoya / Mawa (250g)", img: "https://picsum.photos/id/180/40/40", quantity: 4, price: 200, gst: 5 },
      { id: "item_33", name: "Natural Mineral Water (12 bottles)", img: "https://picsum.photos/id/190/40/40", quantity: 1, price: 240, gst: 18 },
      { id: "item_35", name: "Assam Masala Chai Tea Bags (100 pcs)", img: "https://picsum.photos/id/200/40/40", quantity: 2, price: 350, gst: 5 },
    ],
    subtotal: 9500,
    gstAmount: 655.5,
    totalAmount: 10155.5,
  },

  // Order ID: ORD-003 (High-tech electronics order with 10 items)
  {
    id: "ORD-003",
    userId: "USR-103",
    customerName: "Amit Kumar",
    orderDate: "2025-09-26",
    status: "Delivered",
    items: [
      { id: "item_8", name: "55-inch 4K UHD Smart TV", img: "https://picsum.photos/id/50/40/40", quantity: 1, price: 45000, gst: 28 },
      { id: "item_9", name: "Dolby Atmos Bluetooth Soundbar", img: "https://picsum.photos/id/51/40/40", quantity: 1, price: 12500, gst: 28 },
      { id: "item_10", name: "Smart Watch with GPS", img: "https://picsum.photos/id/52/40/40", quantity: 2, price: 8999, gst: 18 },
      { id: "item_17", name: "Front-Load Washing Machine", img: "https://picsum.photos/id/53/40/40", quantity: 1, price: 32000, gst: 28 },
      { id: "item_16", name: "Digital Air Fryer Oven", img: "https://picsum.photos/id/54/40/40", quantity: 1, price: 7200, gst: 18 },
      { id: "item_2", name: "Professional Blender Pro 5000", img: "https://picsum.photos/id/55/40/40", quantity: 1, price: 4500, gst: 18 },
      { id: "item_e1", name: "Wireless Noise-Cancelling Headphones", img: "https://picsum.photos/id/56/40/40", quantity: 1, price: 14000, gst: 18 },
      { id: "item_e2", name: "Gaming Mouse RGB", img: "https://picsum.photos/id/57/40/40", quantity: 1, price: 3500, gst: 18 },
      { id: "item_e3", name: "4TB External Hard Drive", img: "https://picsum.photos/id/58/40/40", quantity: 1, price: 8000, gst: 18 },
      { id: "item_e4", name: "Smart Speaker with Assistant", img: "https://picsum.photos/id/59/40/40", quantity: 2, price: 4500, gst: 18 },
    ],
    subtotal: 154198,
    gstAmount: 34095.64,
    totalAmount: 188293.64,
  },

  // Order ID: ORD-004 (Crockery and Kitchenware order with 10 items)
  {
    id: "ORD-004",
    userId: "USR-104",
    customerName: "Sunita Devi",
    orderDate: "2025-09-25",
    status: "Canceled",
    items: [
      { id: "item_6", name: "Porcelain Dinner Set (24 pcs)", img: "https://picsum.photos/id/210/40/40", quantity: 1, price: 5999, gst: 12 },
      { id: "item_7", name: "Crystal Wine Glasses (Set of 6)", img: "https://picsum.photos/id/211/40/40", quantity: 2, price: 3200, gst: 12 },
      { id: "item_c1", name: "Non-stick Cookware Set", img: "https://picsum.photos/id/212/40/40", quantity: 1, price: 4500, gst: 12 },
      { id: "item_c2", name: "Ceramic Serving Bowls (Set of 3)", img: "https://picsum.photos/id/213/40/40", quantity: 1, price: 1800, gst: 12 },
      { id: "item_3", name: "Stainless Steel Knife Set", img: "https://picsum.photos/id/214/40/40", quantity: 1, price: 2200, gst: 12 },
      { id: "item_c3", name: "Wooden Chopping Board", img: "https://picsum.photos/id/215/40/40", quantity: 2, price: 700, gst: 5 },
      { id: "item_c4", name: "Electric Kettle 1.5L", img: "https://picsum.photos/id/216/40/40", quantity: 1, price: 1500, gst: 18 },
      { id: "item_c5", name: "Cutlery Set (24 pcs)", img: "https://picsum.photos/id/217/40/40", quantity: 1, price: 2500, gst: 12 },
      { id: "item_c6", name: "Glass Storage Jars (Set of 4)", img: "https://picsum.photos/id/218/40/40", quantity: 2, price: 900, gst: 12 },
      { id: "item_c7", name: "Insulated Casserole", img: "https://picsum.photos/id/219/40/40", quantity: 1, price: 1200, gst: 12 },
    ],
    subtotal: 28299,
    gstAmount: 3287.88,
    totalAmount: 31586.88,
  },

  // Order ID: ORD-005 (Mixed order with 10 items)
  {
    id: "ORD-005",
    userId: "USR-105",
    customerName: "Vikram Rathod",
    orderDate: "2025-09-29",
    status: "Pending",
    items: [
      { id: "item_27", name: "Disinfectant Floor Cleaner (1L)", img: "https://picsum.photos/id/70/40/40", quantity: 2, price: 180, gst: 18 },
      { id: "item_28", name: "Dishwashing Liquid Gel (750ml)", img: "https://picsum.photos/id/80/40/40", quantity: 3, price: 150, gst: 18 },
      { id: "item_19", name: "Scented Candle Collection (Set of 5)", img: "https://picsum.photos/id/230/40/40", quantity: 1, price: 1500, gst: 12 },
      { id: "item_34", name: "Fresh Orange Juice (1L Tetra Pack)", img: "https://picsum.photos/id/231/40/40", quantity: 6, price: 120, gst: 5 },
      { id: "item_26", name: "Angoori Rasmalai (500g)", img: "https://picsum.photos/id/232/40/40", quantity: 2, price: 450, gst: 5 },
      { id: "item_32", name: "Kashmiri Saffron / Kesar (1g)", img: "https://picsum.photos/id/233/40/40", quantity: 1, price: 500, gst: 5 },
      { id: "item_5", name: "Plush Velvet Curtains (Pair)", img: "https://picsum.photos/id/234/40/40", quantity: 1, price: 2500, gst: 12 },
      { id: "item_9", name: "Crystal Wine Glasses (Set of 6)", img: "https://picsum.photos/id/235/40/40", quantity: 1, price: 3200, gst: 12 },
      { id: "item_m1", name: "Yoga Mat", img: "https://picsum.photos/id/236/40/40", quantity: 1, price: 1200, gst: 12 },
      { id: "item_m2", name: "Bluetooth Earbuds", img: "https://picsum.photos/id/237/40/40", quantity: 1, price: 2500, gst: 18 },
    ],
    subtotal: 13830,
    gstAmount: 1624.8,
    totalAmount: 15454.8,
  },
];