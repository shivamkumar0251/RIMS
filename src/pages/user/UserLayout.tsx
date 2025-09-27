import React, { useState } from 'react';
import { FaWarehouse, FaClipboardList } from 'react-icons/fa';

// --- 1. TYPESCRIPT INTERFACES (UPDATED) ---
interface FixedAsset {
  id: number;
  itemName: string;
  category: string;
  subcategory: string;
  quantity: number;
  price: number; // Price per single unit
  imageUrl: string;
  gst: number; // GST percentage
}

interface UsageAsset {
  id: number;
  itemName: string;
  category: string;
  subcategory: string;
  packSize: string;
  quantity: number;
  price: number;
  imageUrl: string;
  gst: number;
}

// --- 2. MOCK DATA (EXPANDED) ---
const initialAssets: FixedAsset[] = [
  { id: 1, itemName: 'Conference Room Projector', category: 'Office Electronics', subcategory: 'Presentation', quantity: 2, price: 50000, gst: 18, imageUrl: 'https://placehold.co/100x100/D1FAE5/333?text=Projector' },
  { id: 2, itemName: 'Company Vehicle - Sedan', category: 'Transportation', subcategory: 'Cars', quantity: 1, price: 800000, gst: 28, imageUrl: 'https://placehold.co/100x100/D1FAE5/333?text=Car' },
  { id: 3, itemName: 'Office Air Conditioner', category: 'Appliances', subcategory: 'Climate Control', quantity: 5, price: 45000, gst: 28, imageUrl: 'https://placehold.co/100x100/D1FAE5/333?text=AC' },
  { id: 4, itemName: 'Dell XPS 15 Laptop', category: 'IT Hardware', subcategory: 'Laptops', quantity: 15, price: 150000, gst: 18, imageUrl: 'https://placehold.co/100x100/D1FAE5/333?text=Laptop' },
  { id: 5, itemName: 'Ergonomic Office Chair', category: 'Furniture', subcategory: 'Seating', quantity: 25, price: 12000, gst: 18, imageUrl: 'https://placehold.co/100x100/D1FAE5/333?text=Chair' },
  { id: 6, itemName: 'Cisco Network Switch', category: 'IT Hardware', subcategory: 'Networking', quantity: 4, price: 25000, gst: 18, imageUrl: 'https://placehold.co/100x100/D1FAE5/333?text=Switch' },
  { id: 7, itemName: 'Executive Desk', category: 'Furniture', subcategory: 'Desks', quantity: 10, price: 22000, gst: 18, imageUrl: 'https://placehold.co/100x100/D1FAE5/333?text=Desk' },
  { id: 8, itemName: 'Multi-Function Printer', category: 'Office Electronics', subcategory: 'Printing', quantity: 3, price: 35000, gst: 28, imageUrl: 'https://placehold.co/100x100/D1FAE5/333?text=Printer' },
  { id: 9, itemName: '4K Security Camera System', category: 'Security', subcategory: 'Surveillance', quantity: 1, price: 60000, gst: 18, imageUrl: 'https://placehold.co/100x100/D1FAE5/333?text=Camera' },
  { id: 10, itemName: 'Water Purifier', category: 'Appliances', subcategory: 'Pantry', quantity: 2, price: 15000, gst: 12, imageUrl: 'https://placehold.co/100x100/D1FAE5/333?text=Water' },
  { id: 11, itemName: 'Server Rack', category: 'IT Hardware', subcategory: 'Servers', quantity: 2, price: 40000, gst: 18, imageUrl: 'https://placehold.co/100x100/D1FAE5/333?text=Server' },
  { id: 12, itemName: 'Biometric Scanner', category: 'Security', subcategory: 'Access Control', quantity: 4, price: 8000, gst: 18, imageUrl: 'https://placehold.co/100x100/D1FAE5/333?text=Scanner' },
  { id: 13, itemName: 'Coffee Vending Machine', category: 'Appliances', subcategory: 'Pantry', quantity: 1, price: 75000, gst: 28, imageUrl: 'https://placehold.co/100x100/D1FAE5/333?text=Coffee' },
  { id: 14, itemName: 'Fire Extinguisher', category: 'Security', subcategory: 'Safety', quantity: 10, price: 2500, gst: 18, imageUrl: 'https://placehold.co/100x100/D1FAE5/333?text=Fire' },
  { id: 15, itemName: 'Filing Cabinet', category: 'Furniture', subcategory: 'Storage', quantity: 8, price: 9000, gst: 18, imageUrl: 'https://placehold.co/100x100/D1FAE5/333?text=Cabinet' },
];

const initialUsageAssets: UsageAsset[] = [
  { id: 101, itemName: 'A4 Paper Ream', category: 'Stationery', subcategory: 'Paper Goods', quantity: 50, price: 300, packSize: "500 sheets", gst: 12, imageUrl: 'https://placehold.co/100x100/E0E7FF/333?text=Paper' },
  { id: 102, itemName: 'Printer Ink Cartridge', category: 'IT Consumables', subcategory: 'Printing', quantity: 20, price: 1500, packSize: "XL Black", gst: 28, imageUrl: 'https://placehold.co/100x100/E0E7FF/333?text=Ink' },
  { id: 103, itemName: 'Ballpoint Pens', category: 'Stationery', subcategory: 'Writing Tools', quantity: 10, price: 100, packSize: "Box of 10", gst: 12, imageUrl: 'https://placehold.co/100x100/E0E7FF/333?text=Pens' },
  { id: 104, itemName: 'Hand Sanitizer', category: 'Hygiene', subcategory: 'Cleaning', quantity: 15, price: 250, packSize: "500ml Bottle", gst: 18, imageUrl: 'https://placehold.co/100x100/E0E7FF/333?text=Sanitizer' },
  { id: 105, itemName: 'Coffee Beans', category: 'Pantry', subcategory: 'Beverages', quantity: 5, price: 800, packSize: "1kg Bag", gst: 5, imageUrl: 'https://placehold.co/100x100/E0E7FF/333?text=Beans' },
  { id: 106, itemName: 'Notepads', category: 'Stationery', subcategory: 'Paper Goods', quantity: 30, price: 50, packSize: "Pack of 5", gst: 12, imageUrl: 'https://placehold.co/100x100/E0E7FF/333?text=Notepads' },
  { id: 107, itemName: 'Cleaning Liquid', category: 'Hygiene', subcategory: 'Cleaning', quantity: 12, price: 180, packSize: "1L Bottle", gst: 18, imageUrl: 'https://placehold.co/100x100/E0E7FF/333?text=Liquid' },
  { id: 108, itemName: 'Whiteboard Markers', category: 'Stationery', subcategory: 'Writing Tools', quantity: 8, price: 150, packSize: "Set of 4", gst: 12, imageUrl: 'https://placehold.co/100x100/E0E7FF/333?text=Markers' },
  { id: 109, itemName: 'Sugar Sachets', category: 'Pantry', subcategory: 'Condiments', quantity: 3, price: 200, packSize: "Box of 500", gst: 5, imageUrl: 'https://placehold.co/100x100/E0E7FF/333?text=Sugar' },
  { id: 110, itemName: 'USB-C Cables', category: 'IT Consumables', subcategory: 'Cables', quantity: 25, price: 400, packSize: "1 meter", gst: 18, imageUrl: 'https://placehold.co/100x100/E0E7FF/333?text=Cable' },
  { id: 111, itemName: 'Envelopes', category: 'Stationery', subcategory: 'Mailing', quantity: 5, price: 120, packSize: "Pack of 100", gst: 12, imageUrl: 'https://placehold.co/100x100/E0E7FF/333?text=Envelopes' },
  { id: 112, itemName: 'Tea Bags', category: 'Pantry', subcategory: 'Beverages', quantity: 6, price: 220, packSize: "Box of 100", gst: 5, imageUrl: 'https://placehold.co/100x100/E0E7FF/333?text=Tea' },
  { id: 113, itemName: 'Mouse Batteries', category: 'IT Consumables', subcategory: 'Accessories', quantity: 10, price: 80, packSize: "AA - Pair", gst: 28, imageUrl: 'https://placehold.co/100x100/E0E7FF/333?text=Battery' },
  { id: 114, itemName: 'Paper Towels', category: 'Hygiene', subcategory: 'Cleaning', quantity: 20, price: 100, packSize: "Roll", gst: 18, imageUrl: 'https://placehold.co/100x100/E0E7FF/333?text=Towel' },
  { id: 115, itemName: 'Snack Biscuits', category: 'Pantry', subcategory: 'Snacks', quantity: 10, price: 150, packSize: "Family Pack", gst: 5, imageUrl: 'https://placehold.co/100x100/E0E7FF/333?text=Biscuits' },
];

// --- 3. HELPER COMPONENT ---

// In-place quantity editor
const QuantityInput: React.FC<{ value: number; onChange: (newQuantity: number) => void }> = ({ value, onChange }) => (
  <input
    type="number"
    min="0"
    value={value}
    onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
    className="w-24 p-1 border border-gray-300 rounded-md text-center focus:ring-2 focus:ring-blue-500"
  />
);

// --- 4. MAIN PAGE COMPONENT ---
const AssetManagementPage: React.FC = () => {
  const [activeView, setActiveView] = useState<'assets' | 'usage'>('assets');
  const [fixedAssets, setFixedAssets] = useState<FixedAsset[]>(initialAssets);
  const [usageAssets, setUsageAssets] = useState<UsageAsset[]>(initialUsageAssets);

  const handleQuantityChange = (id: number, newQuantity: number, type: 'assets' | 'usage') => {
    if (type === 'assets') {
      setFixedAssets(assets => assets.map(a => a.id === id ? { ...a, quantity: newQuantity } : a));
    } else {
      setUsageAssets(assets => assets.map(a => a.id === id ? { ...a, quantity: newQuantity } : a));
    }
  };

  const renderContent = () => {
    if (activeView === 'assets') {
      return (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto animate-fade-in">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-sm font-bold text-gray-600 uppercase">Item Details</th>
                <th className="px-6 py-3 text-sm font-bold text-gray-600 uppercase">Quantity (Editable)</th>
                <th className="px-6 py-3 text-sm font-bold text-gray-600 uppercase">Price (Unit)</th>
                <th className="px-6 py-3 text-sm font-bold text-gray-600 uppercase">GST Amount</th>
                <th className="px-6 py-3 text-sm font-bold text-gray-600 uppercase">Total Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {fixedAssets.map((asset) => {
                const baseValue = asset.price * asset.quantity;
                const gstAmount = baseValue * (asset.gst / 100);
                const totalValue = baseValue + gstAmount;
                return (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <img className="h-12 w-12 rounded-md object-cover" src={asset.imageUrl} alt={asset.itemName} />
                        </div>
                        <div className="ml-4">
                          <div className="text-base font-bold text-gray-900">{asset.itemName}</div>
                          <div className="text-sm text-gray-500">{asset.category} &gt; {asset.subcategory}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <QuantityInput value={asset.quantity} onChange={(q) => handleQuantityChange(asset.id, q, 'assets')} />
                    </td>
                    <td className="px-6 py-4 text-gray-600">₹{asset.price.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-gray-600">₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 font-bold text-lg text-gray-900">₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeView === 'usage') {
      return (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto animate-fade-in">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-sm font-bold text-gray-600 uppercase">Item Details</th>
                <th className="px-6 py-3 text-sm font-bold text-gray-600 uppercase">Pack Size</th>
                <th className="px-6 py-3 text-sm font-bold text-gray-600 uppercase">Quantity (Editable)</th>
                <th className="px-6 py-3 text-sm font-bold text-gray-600 uppercase">Price (Unit)</th>
                <th className="px-6 py-3 text-sm font-bold text-gray-600 uppercase">GST Amount</th>
                <th className="px-6 py-3 text-sm font-bold text-gray-600 uppercase">Total Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {usageAssets.map((asset) => {
                const baseValue = asset.price * asset.quantity;
                const gstAmount = baseValue * (asset.gst / 100);
                const totalValue = baseValue + gstAmount;
                return (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                            <img className="h-12 w-12 rounded-md object-cover" src={asset.imageUrl} alt={asset.itemName} />
                        </div>
                        <div className="ml-4">
                            <div className="text-base font-bold text-gray-900">{asset.itemName}</div>
                            <div className="text-sm text-gray-500">{asset.category} &gt; {asset.subcategory}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{asset.packSize}</td>
                    <td className="px-6 py-4">
                      <QuantityInput value={asset.quantity} onChange={(q) => handleQuantityChange(asset.id, q, 'usage')} />
                    </td>
                    <td className="px-6 py-4 text-gray-600">₹{asset.price.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-gray-600">₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 font-bold text-lg text-gray-900">₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6">Asset & Usage Management</h1>
      <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
        <nav className="flex space-x-6" aria-label="Tabs">
          <button onClick={() => setActiveView('assets')} className={`${activeView === 'assets' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'} flex items-center gap-2 py-3 px-2 border-b-4 font-semibold text-lg transition-all`}>
            <FaWarehouse /> Fixed Assets
          </button>
          <button onClick={() => setActiveView('usage')} className={`${activeView === 'usage' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'} flex items-center gap-2 py-3 px-2 border-b-4 font-semibold text-lg transition-all`}>
            <FaClipboardList /> Usage
          </button>
        </nav>
      </div>

      {renderContent()}

      <div className="mt-8 flex justify-end">
        <button className="px-10 py-4 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-xl transform hover:scale-105 transition-transform">
          Submit All Changes
        </button>
      </div>
    </div>
  );
};

export default AssetManagementPage;