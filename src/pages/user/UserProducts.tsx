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
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import React, { useCallback, useMemo, useState } from 'react';
import { FaClipboardList, FaWarehouse } from 'react-icons/fa';
import { FiFileText, FiSearch, FiTable, FiUpload } from 'react-icons/fi';
// Assuming the path to your DateRangeFilter is correct
import DateRangeFilter, { type DateRangeValue } from '../../components/common/DateRangeFilter';
import UserLayout from '../../layouts/UserLayout';

// Extend dayjs with necessary plugins for date comparison
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

// --- TYPESCRIPT INTERFACES ---
interface FixedAsset {
    id: number;
    itemName: string;
    category: string;
    subcategory: string;
    // quantity: number;
    price: number;
    imageUrl: string;
    gst: number;
    brand?: string;
    createdDate: string; // NEW FIELD
}

interface UsageAsset {
    id: number;
    itemName: string;
    category: string;
    subcategory: string;
    packSize: string;
    // quantity: number;
    price: number;
    imageUrl: string;
    gst: number;
    brand?: string;
    createdDate: string; // NEW FIELD
}


// --- MOCK DATA ---
const initialAssets: FixedAsset[] = [
    { id: 1, itemName: 'Projector', category: 'Office Electronics', subcategory: 'Presentation', price: 50000, gst: 18, imageUrl: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Projector', brand: 'Epson', createdDate: '2025-10-01' },
    { id: 2, itemName: 'Company Car', category: 'Transportation', subcategory: 'Cars', price: 800000, gst: 28, imageUrl: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Car', brand: 'Toyota', createdDate: '2025-09-25' },
    { id: 3, itemName: 'AC', category: 'Appliances', subcategory: 'Climate Control', price: 45000, gst: 28, imageUrl: 'https://via.placeholder.com/150/00FF00/FFFFFF?text=AC', brand: 'LG', createdDate: '2025-10-10' },
];

const initialUsageAssets: UsageAsset[] = [
    { id: 101, itemName: 'A4 Paper', category: 'Stationery', subcategory: 'Paper Goods', price: 300, packSize: "500 sheets", gst: 12, imageUrl: 'https://via.placeholder.com/150/FFA500/FFFFFF?text=Paper', brand: 'JK Paper', createdDate: '2025-10-05' },
    { id: 102, itemName: 'Ink Cartridge', category: 'IT Consumables', subcategory: 'Printing', price: 1500, packSize: "XL Black", gst: 28, imageUrl: 'https://via.placeholder.com/150/800080/FFFFFF?text=Ink', brand: 'HP', createdDate: '2025-10-12' },
];


// // --- HELPER COMPONENT (QuantitiyInput) ---
// const QuantityInput: React.FC<{ value: number; onChange: (newQuantity: number) => void }> = ({ value, onChange }) => (
//     <input
//         type="number"
//         min="0"
//         value={value}
//         onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
//         className="w-24 p-1 border border-gray-300 rounded-md text-center focus:ring-2 focus:ring-blue-500"
//     />
// );

// --- MAIN PAGE COMPONENT ---
const UserProducts: React.FC = () => {
    const [activeView, setActiveView] = useState<'assets' | 'usage'>('assets');
    const [fixedAssets,] = useState<FixedAsset[]>(initialAssets);
    const [usageAssets,] = useState<UsageAsset[]>(initialUsageAssets);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [selectedBrand, setSelectedBrand] = useState('All Brands');
    // dateRange is correctly initialized with the DateRangeValue type
    const [dateRange, setDateRange] = useState<DateRangeValue>([null, null]);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const allItems = activeView === 'assets' ? fixedAssets : usageAssets;
    // const itemType = activeView === 'assets' ? 'assets' : 'usage';

    const categories = useMemo(() => Array.from(new Set(allItems.map(item => item.category))), [allItems]);
    const brands = useMemo(() => Array.from(new Set(allItems.map(item => item.brand).filter((b): b is string => !!b))), [allItems]);

    // --- FILTERING LOGIC (INCLUDING DATE RANGE) ---
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

        // --- DATE RANGE FILTERING ---
        if (dateRange[0] && dateRange[1]) {
            filtered = filtered.filter(item => {
                const itemDate = dayjs(item.createdDate);
                // dayjs(dateRange[0]) and dayjs(dateRange[1]) convert the Date or string/null to dayjs objects
                return itemDate.isSameOrAfter(dayjs(dateRange[0]), 'day') &&
                    itemDate.isSameOrBefore(dayjs(dateRange[1]), 'day');
            });
        }

        return filtered;
    }, [allItems, searchTerm, selectedCategory, selectedBrand, dateRange]);

    const totalPages = Math.ceil(filteredItems.length / rowsPerPage);
    const paginatedItems = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        return filteredItems.slice(start, start + rowsPerPage);
    }, [filteredItems, page, rowsPerPage]);

    const handleRefresh = useCallback(() => {
        setSearchTerm('');
        setSelectedCategory('All Categories');
        setSelectedBrand('All Brands');
        setDateRange([null, null]); // Resets the date range
        setPage(1);
    }, []);

    // const handleQuantityChange = (id: number,  type: 'assets' | 'usage') => {
    //     if (type === 'assets') {
    //         setFixedAssets(prev => prev.map(a => a.id === id ? { ...a } : a));
    //     } else {
    //         setUsageAssets(prev => prev.map(a => a.id === id ? { ...a } : a));
    //     }
    // };

    // --- RENDER CONTENT (TABLE) ---
    const renderContent = () => {
        const assetsToDisplay = paginatedItems as (FixedAsset | UsageAsset)[];

        // Safely determine the view type based on activeView state
        const isUsageView = activeView === 'usage';
        // The colspan needs to be 7 for Fixed Assets, and 8 for Usage Assets (due to 'Pack Size')
        const colSpanCount = isUsageView ? 8 : 7;

        return (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in">
                <table className="w-full text-left min-w-[900px] divide-y divide-gray-200">
                    <thead className="bg-gray-100 sticky top-0">
                        <tr>
                            <th className="px-4 py-3">#</th>
                            <th className="px-6 py-3">Item Details</th>
                            {/* Correctly conditional header based on view type */}
                            {isUsageView && <th className="px-6 py-3">Pack Size</th>}
                            {/* <th className="px-6 py-3">Quantity</th> */}
                            <th className="px-6 py-3">Price (Unit)</th>
                            <th className="px-6 py-3">GST Amount</th>
                            <th className="px-6 py-3">Total Value</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {assetsToDisplay.length > 0 ? (
                            assetsToDisplay.map((asset, idx) => {
                                const baseValue = asset.price * asset.price;
                                const gstAmount = baseValue * (asset.gst / 100);
                                const totalValue = baseValue + gstAmount;

                                return (
                                    <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4">{(page - 1) * rowsPerPage + idx + 1}</td>
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
                                        {/* Correctly conditional cell based on view type, safe type assertion */}
                                        {isUsageView && <td className="px-6 py-4">{(asset as UsageAsset).packSize}</td>}
                                        {/* <td className="px-6 py-4">
                                            <QuantityInput value={asset.quantity} onChange={(q) => handleQuantityChange(asset.id, q, itemType)} />
                                        </td> */}
                                        <td className="px-6 py-4 text-gray-600">₹{asset.price.toLocaleString('en-IN')}</td>
                                        <td className="px-6 py-4 text-gray-600">₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({asset.gst}%)</td>
                                        <td className="px-6 py-4 font-bold text-lg text-gray-900">₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                {/* Use colSpanCount for the correct number of columns */}
                                <td colSpan={colSpanCount} className="text-center py-10 text-gray-500 text-lg">No items found for current filters.</td>
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

                {/* --- Filters & Actions --- */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4, p: 3, bgcolor: 'white', borderRadius: '12px', boxShadow: 3 }}>
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

                            {/* --- DateRangeFilter Integration --- */}
                            <DateRangeFilter
                                value={dateRange}
                                onChange={(newRange) => { setDateRange(newRange); setPage(1); }}
                                fullWidth={false}
                                size="small"
                            />

                            <Button variant="outlined" onClick={handleRefresh} size="small" sx={{ height: '40px' }}>
                                Reset Filters
                            </Button>
                        </Box>

                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                            <Tooltip title="Export PDF">
                                <IconButton sx={{ backgroundColor: "#f44336", color: "white" }} size="small"><FiFileText /></IconButton>
                            </Tooltip>
                            <Tooltip title="Export Excel">
                                <IconButton sx={{ backgroundColor: "#4caf50", color: "white" }} size="small"><FiTable /></IconButton>
                            </Tooltip>
                            <Button variant="contained" startIcon={<FiUpload />} size="small">Import</Button>
                        </Box>
                    </Box>
                </Box>

                {renderContent()}

                {/* --- Pagination --- */}
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