// --- INTERFACES ---
export interface FixedAsset {
  id: number;
  itemName: string;
  category: string;
  brand: string;
  quantity: number;
  purchaseDate: string;
  price: number;
}
export interface CrockeryItem {
  id: number;
  productName: string;
  category: 'Plates' | 'Glassware' | 'Cutlery' | 'Bowls' | 'Serveware' | 'Drinkware';
  material: string;
  brand: string;
  openingStock: number;
  closingStock: number;
  price: number;
}

// --- EXPANDED DUMMY DATA ---
export const initialFixedAssetsData: FixedAsset[] = [
    { id: 1, itemName: 'Dining Table (4-Seater)', category: 'Furniture', brand: 'WoodCraft', quantity: 10, purchaseDate: '2025-01-15', price: 15000 },
    { id: 2, itemName: 'Dining Chair', category: 'Furniture', brand: 'ComfortSeat', quantity: 40, purchaseDate: '2025-01-15', price: 3000 },
    { id: 3, itemName: 'Commercial Oven', category: 'Kitchen Equipment', brand: 'KitchenPro', quantity: 2, purchaseDate: '2025-01-10', price: 85000 },
    { id: 4, itemName: '4-Door Refrigerator', category: 'Kitchen Equipment', brand: 'CoolZone', quantity: 3, purchaseDate: '2025-01-12', price: 60000 },
    { id: 5, itemName: 'POS System Terminal', category: 'Electronics', brand: 'BillingFast', quantity: 2, purchaseDate: '2025-02-01', price: 45000 },
    { id: 6, itemName: 'Espresso Machine', category: 'Kitchen Equipment', brand: 'Caffeinator', quantity: 1, purchaseDate: '2025-02-05', price: 120000 },
    { id: 7, itemName: 'Lounge Sofa', category: 'Furniture', brand: 'ComfortSeat', quantity: 4, purchaseDate: '2025-03-01', price: 22000 },
    { id: 8, itemName: 'Security Camera', category: 'Electronics', brand: 'SecureEye', quantity: 8, purchaseDate: '2025-03-05', price: 5000 },
];
export const initialCrockeryData: CrockeryItem[] = [
    { id: 1, productName: 'Dinner Plate', category: 'Plates', material: 'Ceramic', brand: 'ClayCraft', openingStock: 100, closingStock: 85, price: 350 },
    { id: 2, productName: 'Water Glass', category: 'Glassware', material: 'Glass', brand: 'Luminarc', openingStock: 120, closingStock: 105, price: 150 },
    { id: 3, productName: 'Soup Bowl', category: 'Bowls', material: 'Porcelain', brand: 'ClayCraft', openingStock: 80, closingStock: 70, price: 250 },
    { id: 4, productName: 'Table Fork', category: 'Cutlery', material: 'Stainless Steel', brand: 'Vinod', openingStock: 150, closingStock: 140, price: 90 },
    { id: 5, productName: 'Wine Glass', category: 'Glassware', material: 'Crystal', brand: 'Ocean', openingStock: 60, closingStock: 55, price: 400 },
    { id: 6, productName: 'Side Plate', category: 'Plates', material: 'Ceramic', brand: 'ClayCraft', openingStock: 100, closingStock: 90, price: 200 },
    { id: 7, productName: 'Table Spoon', category: 'Cutlery', material: 'Stainless Steel', brand: 'Vinod', openingStock: 150, closingStock: 135, price: 90 },
];