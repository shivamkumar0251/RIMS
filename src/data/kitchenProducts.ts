export interface Product {
    name: string;
    category: string;
    brand: string;
    packSize: string;
    unit: string;
    openingStoke:number;
    perUnitRate?:number;
}

export const DUMMY_PRODUCTS: Product[] = [
    { name: "Refined Oil", category: "Cooking", brand: "Fortune", packSize: "5L", unit: "Litre", openingStoke: 50 },
    { name: "Basmati Rice", category: "Grains", brand: "India Gate", packSize: "10kg", unit: "Kg", openingStoke: 100 },
    { name: "Maida", category: "Flour", brand: "Aashirvaad", packSize: "5kg", unit: "Kg", openingStoke: 70 },
    { name: "Sugar", category: "Sweetener", brand: "Patanjali", packSize: "10kg", unit: "Kg", openingStoke: 90 },
    { name: "Salt", category: "Condiment", brand: "Tata", packSize: "1kg", unit: "Kg", openingStoke: 80 },
    { name: "Mustard Oil", category: "Cooking", brand: "Dhara", packSize: "1L", unit: "Litre", openingStoke: 69 },
    { name: "Milk", category: "Dairy", brand: "Amul", packSize: "1L", unit: "Litre", openingStoke: 55 },
    { name: "Paneer", category: "Dairy", brand: "Amul", packSize: "500g", unit: "Gram", openingStoke: 66 },
    { name: "Butter", category: "Dairy", brand: "Amul", packSize: "500g", unit: "Gram", openingStoke: 77 },
    { name: "Atta", category: "Flour", brand: "Aashirvaad", packSize: "10kg", unit: "Kg", openingStoke: 88 },
    { name: "Cooking Gas", category: "Fuel", brand: "Indane", packSize: "14kg", unit: "Cylinder", openingStoke: 99 },
    { name: "Tea", category: "Beverage", brand: "Tata Tea", packSize: "500g", unit: "Gram", openingStoke: 79 },
    { name: "Coffee", category: "Beverage", brand: "Nescafé", packSize: "200g", unit: "Gram", openingStoke: 89 },
    { name: "Tomato Sauce", category: "Condiment", brand: "Kissan", packSize: "1kg", unit: "Kg", openingStoke: 91 },
    { name: "Spices Mix", category: "Spices", brand: "Everest", packSize: "500g", unit: "Gram", openingStoke: 93 },
];
