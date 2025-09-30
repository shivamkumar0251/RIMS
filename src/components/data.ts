// src/data.ts

// Define the Product type here
export interface Product {
  id: string;
  name: string;
  category: "setup" | "products";
  subcategory: string;
  price: number;
  stock: number;
}

// Export the master list of all products
export const mockAllProducts: Product[] = [
  //======================== Category: setup ========================
  // Subcategory: Kitchen
  { id: "item_1", name: "Modern 4-Burner Gas Stove", category: "setup", subcategory: "Kitchen", price: 8500, stock: 40 },
  { id: "item_2", name: "Professional Blender Pro 5000", category: "setup", subcategory: "Kitchen", price: 4500, stock: 75 },
  { id: "item_3", name: "Stainless Steel Knife Set", category: "setup", subcategory: "Kitchen", price: 2200, stock: 120 },

  // Subcategory: Interior
  { id: "item_4", name: "Abstract Canvas Wall Art (Set of 3)", category: "setup", subcategory: "Interior", price: 3999, stock: 85 },
  { id: "item_5", name: "Plush Velvet Curtains (Pair)", category: "setup", subcategory: "Interior", price: 2500, stock: 110 },

  // Subcategory: Crockery
  { id: "item_6", name: "Porcelain Dinner Set (24 pcs)", category: "setup", subcategory: "Crockery", price: 5999, stock: 60 },
  { id: "item_7", name: "Crystal Wine Glasses (Set of 6)", category: "setup", subcategory: "Crockery", price: 3200, stock: 90 },

  // Subcategory: Electronics
  { id: "item_8", name: "55-inch 4K UHD Smart TV", category: "setup", subcategory: "Electronics", price: 45000, stock: 35 },
  { id: "item_9", name: "Dolby Atmos Bluetooth Soundbar", category: "setup", subcategory: "Electronics", price: 12500, stock: 65 },
  { id: "item_10", name: "Smart Watch with GPS", category: "setup", subcategory: "Electronics", price: 8999, stock: 150 },

  // Subcategory: Furniture
  { id: "item_11", name: "Luxury 5-Seater Sofa Set", category: "setup", subcategory: "Furniture", price: 55000, stock: 15 },
  { id: "item_12", name: "Solid Wood King Size Bed", category: "setup", subcategory: "Furniture", price: 40000, stock: 25 },
  { id: "item_13", name: "Ergonomic Office Chair", category: "setup", subcategory: "Furniture", price: 9500, stock: 80 },

  // Subcategory: Lighting
  { id: "item_14", name: "Smart WiFi LED Strip (5 meters)", category: "setup", subcategory: "Lighting", price: 3000, stock: 180 },
  { id: "item_15", name: "Modern Crystal Chandelier", category: "setup", subcategory: "Lighting", price: 15000, stock: 20 },

  // Subcategory: Appliances
  { id: "item_16", name: "Digital Air Fryer Oven", category: "setup", subcategory: "Appliances", price: 7200, stock: 55 },
  { id: "item_17", name: "Front-Load Washing Machine (8kg)", category: "setup", subcategory: "Appliances", price: 32000, stock: 30 },
  { id: "item_18", name: "Double Door Refrigerator (300L)", category: "setup", subcategory: "Appliances", price: 28000, stock: 40 },

  // Subcategory: Decor
  { id: "item_19", name: "Scented Candle Collection (Set of 5)", category: "setup", subcategory: "Decor", price: 1500, stock: 300 },
  { id: "item_20", name: "Woven Macrame Wall Tapestry", category: "setup", subcategory: "Decor", price: 1800, stock: 120 },


  //======================== Category: products ========================
  // Subcategory: Grocery
  { id: "item_21", name: "Organic Basmati Rice (5kg)", category: "products", subcategory: "Grocery", price: 750, stock: 500 },
  { id: "item_22", name: "Whole Wheat Aata (10kg)", category: "products", subcategory: "Grocery", price: 450, stock: 800 },
  { id: "item_23", name: "Cold Pressed Sunflower Oil (1L)", category: "products", subcategory: "Grocery", price: 350, stock: 600 },
  
  // Subcategory: Sweets
  { id: "item_24", name: "Handmade Kaju Katli (500g)", category: "products", subcategory: "Sweets", price: 800, stock: 150 },
  { id: "item_25", name: "Fresh Motichoor Ladoo (1kg)", category: "products", subcategory: "Sweets", price: 600, stock: 200 },
  { id: "item_26", name: "Angoori Rasmalai (500g)", category: "products", subcategory: "Sweets", price: 450, stock: 120 },

  // Subcategory: Cleaning Supplies
  { id: "item_27", name: "Disinfectant Floor Cleaner (1L)", category: "products", subcategory: "Cleaning Supplies", price: 180, stock: 700 },
  { id: "item_28", name: "Dishwashing Liquid Gel (750ml)", category: "products", subcategory: "Cleaning Supplies", price: 150, stock: 900 },
  { id: "item_29", name: "All-Purpose Microfiber Cloths (Pack of 5)", category: "products", subcategory: "Cleaning Supplies", price: 250, stock: 1000 },

  // Subcategory: Sweet-Specific Ingredients
  { id: "item_30", name: "Pure Cow Ghee (1L)", category: "products", subcategory: "Sweet-Specific Ingredients", price: 650, stock: 300 },
  { id: "item_31", name: "Premium Khoya / Mawa (250g)", category: "products", subcategory: "Sweet-Specific Ingredients", price: 200, stock: 180 },
  { id: "item_32", name: "Kashmiri Saffron / Kesar (1g)", category: "products", subcategory: "Sweet-Specific Ingredients", price: 500, stock: 400 },

  // Subcategory: Beverages
  { id: "item_33", name: "Natural Mineral Water (1L x 12 bottles)", category: "products", subcategory: "Beverages", price: 240, stock: 1200 },
  { id: "item_34", name: "Fresh Orange Juice (1L Tetra Pack)", category: "products", subcategory: "Beverages", price: 120, stock: 800 },
  { id: "item_35", name: "Assam Masala Chai Tea Bags (100 pcs)", category: "products", subcategory: "Beverages", price: 350, stock: 650 }
];