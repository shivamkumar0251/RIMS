import React, { useState } from 'react';
import { FaWarehouse, FaClipboardList } from 'react-icons/fa';
import UserLayout from '../../layouts/UserLayout';

// --- 1. TYPESCRIPT INTERFACES (UNCHANGED) ---
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

// --- 2. MOCK DATA (UNCHANGED) ---
const initialAssets: FixedAsset[] = [
    { id: 1, itemName: 'Conference Room Projector', category: 'Office Electronics', subcategory: 'Presentation', quantity: 2, price: 50000, gst: 18, imageUrl: 'https://placehold.co/100x100/D1FAE5/333?text=Projector' },
    { id: 2, itemName: 'Company Vehicle - Sedan', category: 'Transportation', subcategory: 'Cars', quantity: 1, price: 800000, gst: 28, imageUrl: 'https://placehold.co/100x100/D1FAE5/333?text=Car' },
    { id: 3, itemName: 'Office Air Conditioner', category: 'Appliances', subcategory: 'Climate Control', quantity: 5, price: 45000, gst: 28, imageUrl: 'https://placehold.co/100x100/D1FAE5/333?text=AC' },
    { id: 4, itemName: 'Dell XPS 15 Laptop', category: 'IT Hardware', subcategory: 'Laptops', quantity: 15, price: 150000, gst: 18, imageUrl: 'https://placehold.co/100x100/D1FAE5/333?text=Laptop' },
    { id: 5, itemName: 'Ergonomic Office Chair', category: 'Furniture', subcategory: 'Seating', quantity: 25, price: 12000, gst: 18, imageUrl: 'https://placehold.co/100x100/D1FAE5/333?text=Chair' },
];

const initialUsageAssets: UsageAsset[] = [
    { id: 101, itemName: 'A4 Paper Ream', category: 'Stationery', subcategory: 'Paper Goods', quantity: 50, price: 300, packSize: "500 sheets", gst: 12, imageUrl: 'https://placehold.co/100x100/E0E7FF/333?text=Paper' },
    { id: 102, itemName: 'Printer Ink Cartridge', category: 'IT Consumables', subcategory: 'Printing', quantity: 20, price: 1500, packSize: "XL Black", gst: 28, imageUrl: 'https://placehold.co/100x100/E0E7FF/333?text=Ink' },
    { id: 103, itemName: 'Ballpoint Pens', category: 'Stationery', subcategory: 'Writing Tools', quantity: 10, price: 100, packSize: "Box of 10", gst: 12, imageUrl: 'https://placehold.co/100x100/E0E7FF/333?text=Pens' },
    { id: 104, itemName: 'Hand Sanitizer', category: 'Hygiene', subcategory: 'Cleaning', quantity: 15, price: 250, packSize: "500ml Bottle", gst: 18, imageUrl: 'https://placehold.co/100x100/E0E7FF/333?text=Sanitizer' },
    { id: 105, itemName: 'Coffee Beans', category: 'Pantry', subcategory: 'Beverages', quantity: 5, price: 800, packSize: "1kg Bag", gst: 5, imageUrl: 'https://placehold.co/100x100/E0E7FF/333?text=Beans' },
];

// --- 3. HELPER COMPONENT (UNCHANGED) ---
const QuantityInput: React.FC<{ value: number; onChange: (newQuantity: number) => void }> = ({ value, onChange }) => (
  <input
    type="number"
    min="0"
    value={value}
    onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
    className="w-24 p-1 border border-gray-300 rounded-md text-center focus:ring-2 focus:ring-blue-500"
  />
);

// --- 4. MAIN PAGE COMPONENT (UPDATED) ---
const AssetManagementPage: React.FC = () => {
  const [activeView, setActiveView] = useState<'assets' | 'usage'>('assets');
  const [fixedAssets, setFixedAssets] = useState<FixedAsset[]>(initialAssets);
  const [usageAssets, setUsageAssets] = useState<UsageAsset[]>(initialUsageAssets);
  const [selectedFixedAssets, setSelectedFixedAssets] = useState<number[]>([]);
  const [selectedUsageAssets, setSelectedUsageAssets] = useState<number[]>([]);

  const handleQuantityChange = (id: number, newQuantity: number, type: 'assets' | 'usage') => {
    if (type === 'assets') {
      setFixedAssets(assets => assets.map(a => a.id === id ? { ...a, quantity: newQuantity } : a));
    } else {
      setUsageAssets(assets => assets.map(a => a.id === id ? { ...a, quantity: newQuantity } : a));
    }
  };

  const handleSelectOne = (id: number, type: 'assets' | 'usage') => {
    if (type === 'assets') {
      setSelectedFixedAssets(prev =>
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
    } else {
      setSelectedUsageAssets(prev =>
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
    }
  };

  const handleSelectAll = (type: 'assets' | 'usage') => {
    if (type === 'assets') {
      if (selectedFixedAssets.length === fixedAssets.length) {
        setSelectedFixedAssets([]);
      } else {
        setSelectedFixedAssets(fixedAssets.map(a => a.id));
      }
    } else {
      if (selectedUsageAssets.length === usageAssets.length) {
        setSelectedUsageAssets([]);
      } else {
        setSelectedUsageAssets(usageAssets.map(a => a.id));
      }
    }
  };

  const renderContent = () => {
    if (activeView === 'assets') {
      return (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto animate-fade-in">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-100">
              <tr>
                {/* --- UPDATED: Smaller Checkbox with "All" text --- */}
                <th className="px-4 py-3">
                   <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            onChange={() => handleSelectAll('assets')}
                            checked={fixedAssets.length > 0 && selectedFixedAssets.length === fixedAssets.length}
                        />
                        <span className="text-sm font-bold text-gray-600">All</span>
                   </label>
                </th>
                <th className="px-6 py-3 text-sm font-bold text-gray-600 uppercase">Item Details</th>
                <th className="px-6 py-3 text-sm font-bold text-gray-600 uppercase">Quantity (Editable)</th>
                <th className="px-6 py-3 text-sm font-bold text-gray-600 uppercase">Price (Unit)</th>
                <th className="px-6 py-3 text-sm font-bold text-gray-600 uppercase">GST Amount</th>
                <th className="px-6 py-3 text-sm font-bold text-gray-600 uppercase">Total Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {fixedAssets.map((asset) => {
                const isSelected = selectedFixedAssets.includes(asset.id);
                const baseValue = asset.price * asset.quantity;
                const gstAmount = baseValue * (asset.gst / 100);
                const totalValue = baseValue + gstAmount;
                return (
                  <tr key={asset.id} className={`${isSelected ? 'bg-blue-50' : ''} hover:bg-gray-50`}>
                    <td className="px-4 py-4">
                      {/* --- UPDATED: Smaller Checkbox --- */}
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={isSelected}
                        onChange={() => handleSelectOne(asset.id, 'assets')}
                      />
                    </td>
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
                {/* --- UPDATED: Smaller Checkbox with "All" text --- */}
                <th className="px-4 py-3">
                   <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            onChange={() => handleSelectAll('usage')}
                            checked={usageAssets.length > 0 && selectedUsageAssets.length === usageAssets.length}
                        />
                        <span className="text-sm font-bold text-gray-600">All</span>
                   </label>
                </th>
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
                const isSelected = selectedUsageAssets.includes(asset.id);
                const baseValue = asset.price * asset.quantity;
                const gstAmount = baseValue * (asset.gst / 100);
                const totalValue = baseValue + gstAmount;
                return (
                  <tr key={asset.id} className={`${isSelected ? 'bg-blue-50' : ''} hover:bg-gray-50`}>
                    <td className="px-4 py-4">
                      {/* --- UPDATED: Smaller Checkbox --- */}
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={isSelected}
                        onChange={() => handleSelectOne(asset.id, 'usage')}
                      />
                    </td>
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
    <UserLayout>
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
    </UserLayout>
  );
};

export default AssetManagementPage;