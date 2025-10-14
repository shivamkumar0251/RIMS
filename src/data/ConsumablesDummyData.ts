export interface ConsumableItem {
  id: number;
  name: string;
  category: string;
  brand: string;
  packSize: string;
  unit: string;
  consumables: number;
  perUnitRate: number;
  taxableValue: number;
  gst: number;
  total: number;
  createdDate: string;
}

export const DUMMY_CONSUMABLE_ITEMS: ConsumableItem[] = Array.from(
  { length: 50 },
  (_, i) => {
    const id = i + 1;
    const consumables = Math.floor(Math.random() * 100) + 1;
    const perUnitRate = Number((Math.random() * 50 + 5).toFixed(2));
    const taxableValue = Number((consumables * perUnitRate).toFixed(2));
    const gst = [5, 12, 18][Math.floor(Math.random() * 3)];
    const total = Number((taxableValue * (1 + gst / 100)).toFixed(2));

    const productNames = [
      "Dish Soap", "Floor Cleaner", "Napkin Roll", "Tissue Paper", "Garbage Bag",
      "Detergent", "Scrubber", "Mop", "Broom", "Toilet Cleaner", "Glass Cleaner",
      "Hand Wash", "Room Freshener", "Air Filter", "Insect Spray", "Cotton Cloth",
      "Dust Pan", "Disinfectant", "Dish Sponge", "Laundry Soap", "Bleach", "Sanitizer",
      "Polish", "Scouring Pad", "Cleaning Brush", "Spray Bottle", "Bucket", "Wiper",
      "Plastic Gloves", "Paper Cup", "Plastic Spoon", "Paper Plate", "Foil Paper",
      "Cloth Duster", "Vacuum Bag", "Odor Neutralizer", "Steel Wool", "Tissue Box",
      "Mask", "Hand Gloves", "Disposable Cap", "Apron", "Dustbin", "Sponge Roll",
      "Cotton Ball", "Face Towel", "Cleaning Gel", "Kitchen Roll", "Surface Wipe",
      "Toilet Paper",
    ];

    return {
      id,
      name: productNames[i % productNames.length],
      category: ["Cleaning", "Hygiene", "Disposables", "Maintenance", "General"][i % 5],
      brand: ["Dettol", "Harpic", "Domex", "Savlon", "3M"][i % 5],
      packSize: `${[250, 500, 1000][i % 3]}ml`,
      unit: ["pcs", "box", "pack"][i % 3],
      consumables,
      perUnitRate,
      taxableValue,
      gst,
      total,
      createdDate: new Date(2025, 9, (i % 30) + 1).toLocaleDateString(),
    };
  }
);
