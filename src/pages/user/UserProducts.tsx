import {
    Box,
    Button,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Pagination,
    Select,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Dayjs } from 'dayjs';
import React, { useCallback, useMemo, useState } from 'react';
import { FaClipboardList, FaWarehouse } from 'react-icons/fa';
import { FiFileText, FiSearch, FiTable, FiUpload } from 'react-icons/fi';
import UserLayout from '../../layouts/UserLayout';

// --- 1. TYPESCRIPT INTERFACES (UNCHANGED) ---
interface FixedAsset {
    id: number;
    itemName: string;
    category: string;
    subcategory: string;
    quantity: number;
    price: number;
    imageUrl: string;
    gst: number;
    brand?: string; // Added brand for filtering example
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
    brand?: string; // Added brand for filtering example
}

// --- 2. MOCK DATA (UPDATED with 'brand' field) ---
const initialAssets: FixedAsset[] = [
    { id: 1, itemName: 'Conference Room Projector', category: 'Office Electronics', subcategory: 'Presentation', quantity: 2, price: 50000, gst: 18, imageUrl: 'https://placehold.co/100x100/D1FAE5/333?text=Projector', brand: 'Epson' },
    { id: 2, itemName: 'Company Vehicle - Sedan', category: 'Transportation', subcategory: 'Cars', quantity: 1, price: 800000, gst: 28, imageUrl: 'https://placehold.co/100x100/D1FAE5/333?text=Car', brand: 'Toyota' },
    { id: 3, itemName: 'Office Air Conditioner', category: 'Appliances', subcategory: 'Climate Control', quantity: 5, price: 45000, gst: 28, imageUrl: 'https://placehold.co/100x100/D1FAE5/333?text=AC', brand: 'LG' },
    { id: 4, itemName: 'Dell XPS 15 Laptop', category: 'IT Hardware', subcategory: 'Laptops', quantity: 15, price: 150000, gst: 18, imageUrl: 'https://placehold.co/100x100/D1FAE5/333?text=Laptop', brand: 'Dell' },
    { id: 5, itemName: 'Ergonomic Office Chair', category: 'Furniture', subcategory: 'Seating', quantity: 25, price: 12000, gst: 18, imageUrl: 'https://placehold.co/100x100/D1FAE5/333?text=Chair', brand: 'Herman Miller' },
];

const initialUsageAssets: UsageAsset[] = [
    { id: 101, itemName: 'A4 Paper Ream', category: 'Stationery', subcategory: 'Paper Goods', quantity: 50, price: 300, packSize: "500 sheets", gst: 12, imageUrl: 'https://placehold.co/100x100/E0E7FF/333?text=Paper', brand: 'JK Paper' },
    { id: 102, itemName: 'Printer Ink Cartridge', category: 'IT Consumables', subcategory: 'Printing', quantity: 20, price: 1500, packSize: "XL Black", gst: 28, imageUrl: 'https://placehold.co/100x100/E0E7FF/333?text=Ink', brand: 'HP' },
    { id: 103, itemName: 'Ballpoint Pens', category: 'Stationery', subcategory: 'Writing Tools', quantity: 10, price: 100, packSize: "Box of 10", gst: 12, imageUrl: 'https://placehold.co/100x100/E0E7FF/333?text=Pens', brand: 'Cello' },
    { id: 104, itemName: 'Hand Sanitizer', category: 'Hygiene', subcategory: 'Cleaning', quantity: 15, price: 250, packSize: "500ml Bottle", gst: 18, imageUrl: 'https://placehold.co/100x100/E0E7FF/333?text=Sanitizer', brand: 'Dettol' },
    { id: 105, itemName: 'Coffee Beans', category: 'Pantry', subcategory: 'Beverages', quantity: 5, price: 800, packSize: "1kg Bag", gst: 5, imageUrl: 'https://placehold.co/100x100/E0E7FF/333?text=Beans', brand: 'Starbucks' },
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

// --- 4. MAIN PAGE COMPONENT ---
const UserProducts: React.FC = () => {
    const [activeView, setActiveView] = useState<'assets' | 'usage'>('assets');
    const [fixedAssets, setFixedAssets] = useState<FixedAsset[]>(initialAssets);
    const [usageAssets, setUsageAssets] = useState<UsageAsset[]>(initialUsageAssets);
    const [selectedFixedAssets, setSelectedFixedAssets] = useState<number[]>([]);
    const [selectedUsageAssets, setSelectedUsageAssets] = useState<number[]>([]);

    // --- NEW: Filter & Pagination State ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [selectedBrand, setSelectedBrand] = useState('All Brands');
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    // --- END NEW STATE ---

    // --- Helper Functions (Memoized for Filters) ---
    const allItems = activeView === 'assets' ? fixedAssets : usageAssets;
    const itemType = activeView === 'assets' ? 'assets' : 'usage';

    const categories = useMemo(() => {
        const cats = new Set(allItems.map(item => item.category));
        return Array.from(cats);
    }, [allItems]);

    const brands = useMemo(() => {
        const brs = new Set(allItems.map(item => item.brand).filter((b): b is string => !!b));
        return Array.from(brs);
    }, [allItems]);

    const filteredItems = useMemo(() => {
        let filtered = allItems;

        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (selectedCategory !== 'All Categories') {
            filtered = filtered.filter(item => item.category === selectedCategory);
        }
        if (selectedBrand !== 'All Brands') {
            filtered = filtered.filter(item => item.brand === selectedBrand);
        }
        // Note: Date filtering requires actual dates in your mock data, so this is skipped for now.

        return filtered;
    }, [allItems, searchTerm, selectedCategory, selectedBrand]);

    const totalPages = Math.ceil(filteredItems.length / rowsPerPage);
    const paginatedItems = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredItems.slice(start, end);
    }, [filteredItems, page, rowsPerPage]);
    // --- End Helper Functions ---


    // --- CRUD/Action Handler Placeholders ---
    const handleExportPDF = useCallback(() => console.log('Export PDF clicked'), []);
    const handleExportExcel = useCallback(() => console.log('Export Excel clicked'), []);
    const handleRefresh = useCallback(() => {
        setSearchTerm('');
        setSelectedCategory('All Categories');
        setSelectedBrand('All Brands');
        setSelectedDate(null);
        setPage(1);
        console.log('Refresh clicked');
    }, []);
    const handleImportProducts = useCallback(() => console.log('Import Products clicked'), []);
    // --- End Action Handlers ---


    // --- Existing Asset State Handlers ---
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
        const currentData = type === 'assets' ? fixedAssets : usageAssets;
        const currentSelected = type === 'assets' ? selectedFixedAssets : selectedUsageAssets;

        if (type === 'assets') {
            if (currentSelected.length === currentData.length) {
                setSelectedFixedAssets([]);
            } else {
                setSelectedFixedAssets(currentData.map(a => a.id));
            }
        } else {
            if (currentSelected.length === currentData.length) {
                setSelectedUsageAssets([]);
            } else {
                setSelectedUsageAssets(currentData.map(a => a.id));
            }
        }
    };
    // --- End Existing Handlers ---


    const renderContent = () => {
        const assetsToDisplay = paginatedItems as (FixedAsset | UsageAsset)[];
        const selectedIds = itemType === 'assets' ? selectedFixedAssets : selectedUsageAssets;
        const allItemsList = itemType === 'assets' ? fixedAssets : usageAssets;
        const headers = itemType === 'assets' ? 
            ['Item Details', 'Quantity (Editable)', 'Price (Unit)', 'GST Amount', 'Total Value'] :
            ['Item Details', 'Pack Size', 'Quantity (Editable)', 'Price (Unit)', 'GST Amount', 'Total Value'];

        return (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in">
                <table className="w-full text-left min-w-[900px] divide-y divide-gray-200">
                    <thead className="bg-gray-100 sticky top-0">
                        <tr>
                            <th className="px-4 py-3">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        onChange={() => handleSelectAll(itemType)}
                                        checked={allItemsList.length > 0 && selectedIds.length === allItemsList.length}
                                    />
                                    <span className="text-sm font-bold text-gray-600">All</span>
                                </label>
                            </th>
                            {headers.map(header => (
                                <th key={header} className="px-6 py-3 text-sm font-bold text-gray-600 uppercase tracking-wider">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {assetsToDisplay.length > 0 ? (
                            assetsToDisplay.map((asset) => {
                                const isSelected = selectedIds.includes(asset.id);
                                const baseValue = asset.price * asset.quantity;
                                const gstAmount = baseValue * (asset.gst / 100);
                                const totalValue = baseValue + gstAmount;

                                return (
                                    <tr key={asset.id} className={`${isSelected ? 'bg-blue-50' : ''} hover:bg-gray-50 transition-colors`}>
                                        <td className="px-4 py-4">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={isSelected}
                                                onChange={() => handleSelectOne(asset.id, itemType)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-12 w-12">
                                                    <img className="h-12 w-12 rounded-md object-cover border border-gray-200" src={asset.imageUrl} alt={asset.itemName} />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-base font-bold text-gray-900">{asset.itemName}</div>
                                                    <div className="text-sm text-gray-500">{asset.category} &gt; {asset.subcategory}</div>
                                                </div>
                                            </div>
                                        </td>
                                        {'packSize' in asset && <td className="px-6 py-4 text-gray-600">{asset.packSize}</td>}
                                        <td className="px-6 py-4">
                                            <QuantityInput value={asset.quantity} onChange={(q) => handleQuantityChange(asset.id, q, itemType)} />
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">₹{asset.price.toLocaleString('en-IN')}</td>
                                        <td className="px-6 py-4 text-gray-600">₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({asset.gst}%)</td>
                                        <td className="px-6 py-4 font-bold text-lg text-gray-900">₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={7} className="text-center py-10 text-gray-500 text-lg">No assets found matching the current filters.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <UserLayout>
            <div className="container mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen font-sans">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-6">Asset & Usage Management</h1>

                {/* --- Tab Navigation --- */}
                <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                    <nav className="flex space-x-6" aria-label="Tabs">
                        <button onClick={() => { setActiveView('assets'); setPage(1); }} className={`${activeView === 'assets' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'} flex items-center gap-2 py-3 px-2 border-b-4 font-semibold text-lg transition-all`}>
                            <FaWarehouse /> Fixed Assets ({fixedAssets.length})
                        </button>
                        <button onClick={() => { setActiveView('usage'); setPage(1); }} className={`${activeView === 'usage' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'} flex items-center gap-2 py-3 px-2 border-b-4 font-semibold text-lg transition-all`}>
                            <FaClipboardList /> Usage Consumables ({usageAssets.length})
                        </button>
                    </nav>
                </div>

                {/* --- Filters & Actions (MUI Integrated) --- */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4, p: 3, bgcolor: 'white', borderRadius: '12px', boxShadow: 3 }}>
                    {/* Filters Row */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                            <TextField
                                placeholder="Search Products..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                                InputProps={{ startAdornment: <InputAdornment position="start"><FiSearch /></InputAdornment> }}
                                sx={{ minWidth: 250 }}
                                size="small"
                            />
                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={selectedCategory}
                                    label="Category"
                                    onChange={(e) => { setSelectedCategory(e.target.value as string); setPage(1); }}
                                >
                                    <MenuItem value="All Categories">All Categories</MenuItem>
                                    {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                <InputLabel>Brand</InputLabel>
                                <Select
                                    value={selectedBrand}
                                    label="Brand"
                                    onChange={(e) => { setSelectedBrand(e.target.value as string); setPage(1); }}
                                >
                                    <MenuItem value="All Brands">All Brands</MenuItem>
                                    {brands.map(brand => <MenuItem key={brand} value={brand}>{brand}</MenuItem>)}
                                </Select>
                            </FormControl>

                            {/* Created Date Filter */}
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Filter by Date"
                                    value={selectedDate}
                                    onChange={(newValue) => { setSelectedDate(newValue); setPage(1); }}
                                    slotProps={{ textField: { size: "small", sx: { minWidth: 160 } } }}
                                />
                            </LocalizationProvider>
                            <Button variant="outlined" onClick={handleRefresh} size="small" sx={{ height: '40px' }}>
                                Reset Filters
                            </Button>
                        </Box>

                        {/* Action Buttons */}
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                            <Tooltip title="Export PDF">
                                <IconButton onClick={handleExportPDF} sx={{ backgroundColor: "#f44336", color: "white" }} size="small"><FiFileText /></IconButton>
                            </Tooltip>
                            <Tooltip title="Export Excel">
                                <IconButton onClick={handleExportExcel} sx={{ backgroundColor: "#4caf50", color: "white" }} size="small"><FiTable /></IconButton>
                            </Tooltip>
                            <Button variant="contained" startIcon={<FiUpload />} onClick={handleImportProducts} size="small">Import</Button>
                        </Box>
                    </Box>
                </Box>
                {/* --- End Filters & Actions --- */}

                {renderContent()}

                {/* --- Pagination (MUI Integrated) --- */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: 'center', mt: 3, p: 2, bgcolor: 'white', borderRadius: '12px', boxShadow: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2" sx={{ color: "#666" }}>Items per page</Typography>
                        <Select<number>
                            value={rowsPerPage}
                            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                            size="small"
                            sx={{ minWidth: 80 }}
                        >
                            <MenuItem value={5}>5</MenuItem>
                            <MenuItem value={10}>10</MenuItem>
                            <MenuItem value={25}>25</MenuItem>
                            <MenuItem value={50}>50</MenuItem>
                        </Select>
                        <Typography variant="body2" sx={{ color: "#666", ml: 2 }}>
                            Showing {Math.min(filteredItems.length, (page - 1) * rowsPerPage + 1)} - {Math.min(filteredItems.length, page * rowsPerPage)} of {filteredItems.length} items
                        </Typography>
                    </Box>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        color="primary"
                        showFirstButton
                        showLastButton
                        size="medium"
                    />
                </Box>
                {/* --- End Pagination --- */}


                <div className="mt-8 flex justify-end">
                    <button className="px-10 py-4 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-xl transform hover:scale-105 transition-transform">
                        Submit All Changes
                    </button>
                </div>
            </div>
        </UserLayout>
    );
};

export default UserProducts;