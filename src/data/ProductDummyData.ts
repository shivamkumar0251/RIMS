import dayjs from "dayjs";

export interface Product {
  id: number;
  product_name: string;
  category: string;
  brand: string;
  packSize: string;
  unit: string;
  shape: string;
  colour: string;
  printStatus: string;
  openingStock: number;
  quantity: number;
  perUnitRate: number;
  gst: number;
  image: string;
  createdAt: string;
}

// ✅ Dummy Categories and Brands
export const categories = ["Dairy", "Bakery", "Beverages", "Snacks", "Personal Care"];
export const brands = ["Amul", "Nestle", "Britannia", "Parle", "Colgate"];

// ✅ Dummy Products
export const productData: Product[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  product_name: `Product ${i + 1}`,
  category: categories[i % categories.length],
  brand: brands[i % brands.length],
  packSize: `${(i % 5) + 1}L`,
  unit: "liter",
  shape: i % 2 === 0 ? "Round" : "Square",
  colour: i % 3 === 0 ? "White" : "Blue",
  printStatus: i % 2 === 0 ? "Printed" : "Not Printed",
  openingStock: 50 + i,
  quantity: (i % 10) + 5,
  perUnitRate: 25 + (i % 10),
  gst: (i % 5) * 3 + 5,
  image: `https://picsum.photos/seed/${i + 1}/60/60`,
  createdAt: dayjs().subtract(i, "day").toISOString(),
}));
