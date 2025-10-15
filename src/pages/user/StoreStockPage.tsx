// src/pages/StoreStockPage.tsx

import React, { useState, useMemo, useCallback } from 'react';
import { FiSearch, FiFileText, FiTable, FiRefreshCw } from 'react-icons/fi';
import UserLayout from '../../layouts/UserLayout';
import {
    Box,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Tooltip,
    IconButton,
    Pagination,
    Typography,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';

// --- Mock Data & Type Definitions (Self-contained for this example) ---
export interface Product {
    id: number;
    name: string;
    category: string;
    subCategory: string;
    quantity: number;
    price: number;
    brand: string;
    purchaseDate: string; 
}

const stockProducts: Product[] = [
    { id: 1, name: 'Warehouse Rack System', category: 'Infrastructure', subCategory: 'Storage', quantity: 10, price: 50000, brand: 'StoraTek', purchaseDate: '2024-01-15' },
    { id: 2, name: 'Forklift Model A', category: 'Equipment', subCategory: 'Material Handling', quantity: 2, price: 800000, brand: 'LiftCo', purchaseDate: '2024-03-01' },
    { id: 3, name: 'Pallet Jack', category: 'Equipment', subCategory: 'Material Handling', quantity: 5, price: 15000, brand: 'MoveFast', purchaseDate: '2024-03-20' },
    { id: 4, name: 'Heavy Duty Shelving', category: 'Infrastructure', subCategory: 'Storage', quantity: 50, price: 1200, brand: 'StoraTek', purchaseDate: '2024-04-10' },
    { id: 5, name: 'Safety Gloves (Box)', category: 'Safety', subCategory: 'PPE', quantity: 20, price: 800, brand: 'ProtectAll', purchaseDate: '2024-05-05' },
    { id: 6, name: 'Barcode Scanner', category: 'Infrastructure', subCategory: 'IT Tools', quantity: 8, price: 10500, brand: 'Honeywell', purchaseDate: '2024-06-12' },
    { id: 7, name: 'Large Industrial Fan', category: 'Equipment', subCategory: 'Climate Control', quantity: 3, price: 35000, brand: 'AirFlow', purchaseDate: '2024-07-01' },
    { id: 8, name: 'Packing Tape Rolls', category: 'Consumables', subCategory: 'Packaging', quantity: 100, price: 150, brand: 'PackFast', purchaseDate: '2024-07-20' },
];
// --- End Mock Data ---


const StoreStockPage: React.FC = () => {
    // --- State for Filtering and Pagination ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [selectedBrand, setSelectedBrand] = useState('All Brands');
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10); // Set default to 10
    // ------------------------------------------

    // --- Helper Functions and Memoized Values ---

    const allCategories = useMemo(() => {
        const cats = new Set(stockProducts.map(p => p.category));
        return Array.from(cats);
    }, []);

    const allBrands = useMemo(() => {
        const brands = new Set(stockProducts.map(p => p.brand));
        return Array.from(brands);
    }, []);

    const filteredProducts = useMemo(() => {
        let filtered = stockProducts;

        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (selectedCategory !== 'All Categories') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }
        if (selectedBrand !== 'All Brands') {
            filtered = filtered.filter(p => p.brand === selectedBrand);
        }
        if (selectedDate) {
             const filterDate = selectedDate.startOf('day');
             filtered = filtered.filter(p => dayjs(p.purchaseDate).isSame(filterDate, 'day'));
        }

        return filtered;
    }, [searchTerm, selectedCategory, selectedBrand, selectedDate]);

    const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);
    
    // Grouping and Pagination Logic
    const groupedAndPaginated = useMemo(() => {
        const paginatedItems = filteredProducts.slice(
            (page - 1) * rowsPerPage,
            page * rowsPerPage
        );
        
        return paginatedItems.reduce((acc: Record<string, Product[]>, product: Product) => {
            const { subCategory } = product;
            if (!acc[subCategory]) {
                acc[subCategory] = [];
            }
            acc[subCategory].push(product);
            return acc;
        }, {} as Record<string, Product[]>);

    }, [filteredProducts, page, rowsPerPage]);

    const handleExportPDF = useCallback(() => console.log('Export PDF clicked'), []);
    const handleExportExcel = useCallback(() => console.log('Export Excel clicked'), []);
    const handleRefresh = useCallback(() => {
        setSearchTerm('');
        setSelectedCategory('All Categories');
        setSelectedBrand('All Brands');
        setSelectedDate(null);
        setPage(1);
    }, []);
    // ------------------------------------------


    return (
        <UserLayout>
            <div className="container mx-auto p-4 md:p-6 lg:p-8 font-sans bg-gray-50 min-h-screen">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-2">📦 Store Stock Management</h1>
                
                {/* --- Filters & Actions (MUI) --- */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4, p: 3, bgcolor: 'white', borderRadius: '12px', boxShadow: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                        
                        {/* Filters */}
                        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                            <TextField
                                placeholder="Search Product Name..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                                InputProps={{ startAdornment: <InputAdornment position="start"><FiSearch /></InputAdornment> }}
                                sx={{ minWidth: 220 }}
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
                                    {allCategories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
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
                                    {allBrands.map(brand => <MenuItem key={brand} value={brand}>{brand}</MenuItem>)}
                                </Select>
                            </FormControl>

                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Purchase Date"
                                    value={selectedDate}
                                    onChange={(newValue) => { setSelectedDate(newValue); setPage(1); }}
                                    slotProps={{ textField: { size: "small", sx: { minWidth: 160 } } }}
                                />
                            </LocalizationProvider>
                            <Button variant="outlined" onClick={handleRefresh} size="small" sx={{ height: '40px' }}>
                                <FiRefreshCw className="mr-1" /> Reset
                            </Button>
                        </Box>

                        {/* Action Buttons (Export) */}
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                            <Tooltip title="Export PDF">
                                <IconButton onClick={handleExportPDF} sx={{ backgroundColor: "#f44336", color: "white" }} size="medium"><FiFileText /></IconButton>
                            </Tooltip>
                            <Tooltip title="Export Excel">
                                <IconButton onClick={handleExportExcel} sx={{ backgroundColor: "#4caf50", color: "white" }} size="medium"><FiTable /></IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                </Box>
                {/* --- End Filters & Actions --- */}
                
                {/* --- Stock Tables Grouped by Subcategory --- */}
                {Object.keys(groupedAndPaginated).length > 0 ? (
                    Object.keys(groupedAndPaginated).map(subCategory => (
                        <div key={subCategory} className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-700 mb-3 capitalize border-b-2 border-blue-100 pb-1">{subCategory}</h2>
                            <div className="bg-white shadow-lg rounded-xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full leading-normal">
                                        <thead className="bg-gray-100 border-b-2 border-gray-200">
                                            <tr>
                                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product Name (Brand)</th>
                                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                                                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                                                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Unit Price</th>
                                                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Stock Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {groupedAndPaginated[subCategory].map((product: Product) => {
                                                const totalValue = product.quantity * product.price;
                                                return (
                                                    <tr key={product.id} className="hover:bg-blue-50/50 border-b border-gray-100 transition-colors">
                                                        <td className="px-5 py-4 text-sm font-medium text-gray-900">
                                                            {product.name} <span className="text-xs font-normal text-blue-500">({product.brand})</span>
                                                        </td>
                                                        <td className="px-5 py-4 text-sm text-gray-700">{product.category}</td>
                                                        <td className="px-5 py-4 text-sm text-center font-bold text-blue-600">{product.quantity}</td>
                                                        <td className="px-5 py-4 text-sm text-right text-gray-700">₹{product.price.toLocaleString('en-IN')}</td>
                                                        <td className="px-5 py-4 text-sm text-right font-bold text-green-700">₹{totalValue.toLocaleString('en-IN')}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 bg-white rounded-xl shadow-lg border border-gray-200">
                        <p className="text-xl text-gray-600">😔 No items found matching the current filters.</p>
                        <Button onClick={handleRefresh} variant="contained" sx={{ mt: 2 }}>Reset Filters</Button>
                    </div>
                )}
                {/* --- End Stock Tables --- */}

                {/* --- Pagination (MUI) --- */}
                {filteredProducts.length > 0 && (
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
                            </Select>
                            <Typography variant="body2" sx={{ color: "#666", ml: 2 }}>
                                Showing {Math.min(filteredProducts.length, (page - 1) * rowsPerPage + 1)} - {Math.min(filteredProducts.length, page * rowsPerPage)} of {filteredProducts.length} items
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
                )}
                {/* --- End Pagination --- */}
                
            </div>
        </UserLayout>
    );
};

export default StoreStockPage;