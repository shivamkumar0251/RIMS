import {
    Box,
    Button,
    Chip,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Pagination,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import React, { useEffect, useState } from "react";
import {
    FiEdit,
    FiFileText,
    FiPlus,
    FiRefreshCw,
    FiSearch,
    FiTable,
    FiTrash2,
    FiUpload,
} from "react-icons/fi";
import { useLocation } from "react-router-dom";
import { AdminLayout } from "../../layouts/AdminLayout";
import ProductModal from "../../layouts/ProductModal";

// MUI Date Picker
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from "dayjs";
import { productData, categories, brands } from "../../data/ProductDummyData";

// ✅ Product Type
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


const ProductTable: React.FC = () => {
    const [data, setData] = useState<Product[]>(productData);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
    const [selectedBrand, setSelectedBrand] = useState<string>("All Brands");
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [page, setPage] = useState<number>(1);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const location = useLocation();

    // ✅ Filter Data
    const filteredData = data.filter((item) => {
        const matchesSearch = item.product_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesCategory =
            selectedCategory === "All Categories" || item.category === selectedCategory;
        const matchesBrand = selectedBrand === "All Brands" || item.brand === selectedBrand;
        const matchesDate = selectedDate
            ? dayjs(item.createdAt).isSame(selectedDate, 'day')
            : true;

        return matchesSearch && matchesCategory && matchesBrand && matchesDate;
    });

    // ✅ Pagination
    const startIndex = (page - 1) * rowsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    const safeValue = (val: any) =>
        val === null || val === undefined || val === "" ? "N.A" : val;

    // ✅ Handlers
    const handleExportPDF = () => console.log("Export to PDF");
    const handleExportExcel = () => console.log("Export to Excel");
    const handleRefresh = () => console.log("Refresh data");
    const handleImportProducts = () => console.log("Import products");
    const handleAddProduct = () => setIsModalOpen(true);
    const handleEdit = (id: number) => setIsModalOpen(true);
    const handleDelete = (id: number) => setData(prev => prev.filter(p => p.id !== id));

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get("addProduct") === "1") setIsModalOpen(true);
    }, [location.search]);

    return (
        <AdminLayout>
            <Box sx={{ p: 3, bgcolor: "#f9f9f9", minHeight: "100vh" }}>
                {/* Filters & Actions */}
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" mb={2}>
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                        <TextField
                            placeholder="Search Products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{ startAdornment: <InputAdornment position="start"><FiSearch /></InputAdornment> }}
                            sx={{ minWidth: 250 }}
                        />
                        <FormControl sx={{ minWidth: 150 }}>
                            <InputLabel>Category</InputLabel>
                            <Select value={selectedCategory} label="Category" onChange={(e) => setSelectedCategory(e.target.value)}>
                                <MenuItem value="All Categories">All Categories</MenuItem>
                                {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControl sx={{ minWidth: 150 }}>
                            <InputLabel>Brand</InputLabel>
                            <Select value={selectedBrand} label="Brand" onChange={(e) => setSelectedBrand(e.target.value)}>
                                <MenuItem value="All Brands">All Brands</MenuItem>
                                {brands.map(brand => <MenuItem key={brand} value={brand}>{brand}</MenuItem>)}
                            </Select>
                        </FormControl>

                        {/* Created Date */}
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Filter by Created Date"
                                value={selectedDate}
                                onChange={(newValue) => setSelectedDate(newValue)}
                                renderInput={(params) => <TextField {...params} sx={{ minWidth: 180 }} />}
                            />
                        </LocalizationProvider>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Button variant="contained" startIcon={<FiPlus />} onClick={handleAddProduct}>Add Product</Button>
                        <Tooltip title="Export PDF">
                            <IconButton onClick={handleExportPDF} sx={{ backgroundColor: "#f44336", color: "white" }}><FiFileText /></IconButton>
                        </Tooltip>
                        <Tooltip title="Export Excel">
                            <IconButton onClick={handleExportExcel} sx={{ backgroundColor: "#4caf50", color: "white" }}><FiTable /></IconButton>
                        </Tooltip>
                        <Tooltip title="Refresh">
                            <IconButton onClick={handleRefresh} sx={{ backgroundColor: "#2196f3", color: "white" }}><FiRefreshCw /></IconButton>
                        </Tooltip>
                        <Button variant="contained" startIcon={<FiUpload />} onClick={handleImportProducts}>Import</Button>
                    </Box>
                </Box>

                {/* Table */}
                <TableContainer component={Paper} sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                    <Table>
                        <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                            <TableRow>
                                <TableCell>S.No</TableCell>
                                <TableCell>Product Name</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Brand</TableCell>
                                <TableCell>Pack Size</TableCell>
                                <TableCell>Unit</TableCell>
                                <TableCell>Shape</TableCell>
                                <TableCell>Colour</TableCell>
                                <TableCell>Print Status</TableCell>
                                <TableCell>Opening Stock</TableCell>
                                <TableCell>Quantity</TableCell>
                                <TableCell>Closing Stock</TableCell>
                                <TableCell>Created Date</TableCell>
                                <TableCell>Per Unit Rate</TableCell>
                                <TableCell>Taxable Value</TableCell>
                                <TableCell>GST (%)</TableCell>
                                <TableCell>Total</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {paginatedData.map((product, index) => {
                                const closingStock = product.openingStock + product.quantity;
                                const taxableValue = product.quantity * product.perUnitRate;
                                const total = taxableValue + taxableValue * (product.gst / 100);

                                return (
                                    <TableRow key={product.id} hover>
                                        <TableCell>{startIndex + index + 1}</TableCell>
                                        <TableCell>{safeValue(product.product_name)}</TableCell>
                                        <TableCell><Chip label={safeValue(product.category)} color="primary" size="small" /></TableCell>
                                        <TableCell>{safeValue(product.brand)}</TableCell>
                                        <TableCell>{safeValue(product.packSize)}</TableCell>
                                        <TableCell>{safeValue(product.unit)}</TableCell>
                                        <TableCell>{safeValue(product.shape)}</TableCell>
                                        <TableCell>{safeValue(product.colour)}</TableCell>
                                        <TableCell>{safeValue(product.printStatus)}</TableCell>
                                        <TableCell>{safeValue(product.openingStock)}</TableCell>
                                        <TableCell>{safeValue(product.quantity)}</TableCell>
                                        <TableCell>{safeValue(closingStock)}</TableCell>
                                        <TableCell>{dayjs(product.createdAt).format("DD-MM-YYYY")}</TableCell>
                                        <TableCell>₹{safeValue(product.perUnitRate)}</TableCell>
                                        <TableCell>₹{safeValue(taxableValue.toFixed(2))}</TableCell>
                                        <TableCell>{safeValue(product.gst)}%</TableCell>
                                        <TableCell>₹{safeValue(total.toFixed(2))}</TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Edit"><IconButton color="primary" onClick={() => handleEdit(product.id)}><FiEdit /></IconButton></Tooltip>
                                            <Tooltip title="Delete"><IconButton color="error" onClick={() => handleDelete(product.id)}><FiTrash2 /></IconButton></Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2" sx={{ color: "#666" }}>Rows per page</Typography>
                        <Select<number> value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))} size="small" sx={{ minWidth: 80 }}>
                            <MenuItem value={5}>5</MenuItem>
                            <MenuItem value={10}>10</MenuItem>
                            <MenuItem value={25}>25</MenuItem>
                            <MenuItem value={50}>50</MenuItem>
                        </Select>
                    </Box>
                    <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" showFirstButton showLastButton />
                </Box>

                {isModalOpen && <ProductModal open={isModalOpen} onClose={() => setIsModalOpen(false)} categories={categories} brands={brands} />}
            </Box>
        </AdminLayout>
    );
};

export default ProductTable;
