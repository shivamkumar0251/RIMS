import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Button,
    IconButton,
    TextField,
    InputAdornment,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Checkbox,
    Avatar,
    Chip,
    Pagination,
    Tooltip,
} from "@mui/material";
import {
    FiSearch,
    FiFileText,
    FiTable,
    FiRefreshCw,
    FiUpload,
    FiEye,
    FiEdit,
    FiTrash2,
} from "react-icons/fi";
import { useLocation } from "react-router-dom";
import ProductModal from "../../layouts/ProductModal";
import { productData, categories, brands } from "../../data/productData";
import { AdminLayout } from "../../layouts/AdminLayout";

// ✅ Define Product type
interface CreatedBy {
    avatar: string;
    name: string;
}

export interface Product {
    id: number;
    sku: string;
    productName: string;
    category: string;
    brand: string;
    price: number;
    unit: string;
    qty: number;
    icon?: React.ReactNode;
    createdBy: CreatedBy;
}

const ProductTable: React.FC = () => {
    const [data, setData] = useState<Product[]>(productData);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
    const [selectedBrand, setSelectedBrand] = useState<string>("All Brands");
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [page, setPage] = useState<number>(1);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const location = useLocation();
    console.log(setData);

    // ✅ Filter data
    const filteredData = data.filter((item) => {
        const matchesSearch =
            item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
            selectedCategory === "All Categories" || item.category === selectedCategory;
        const matchesBrand = selectedBrand === "All Brands" || item.brand === selectedBrand;
        return matchesSearch && matchesCategory && matchesBrand;
    });

    // ✅ Pagination
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    // ✅ Handlers
    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedRows(paginatedData.map((item) => item.id));
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (id: number) => {
        setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
        );
    };

    const handleExportPDF = () => console.log("Export to PDF");
    const handleExportExcel = () => console.log("Export to Excel");
    const handleRefresh = () => console.log("Refresh data");
    const handleImportProducts = () => console.log("Import products");
    //   const handleAddProduct = () => setIsModalOpen(true);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get("addProduct") === "1") setIsModalOpen(true);
    }, [location.search]);

    const handleView = (id: number) => console.log("View product:", id);
    const handleEdit = (id: number) => console.log("Edit product:", id);
    const handleDelete = (id: number) => console.log("Delete product:", id);

    return (
        <AdminLayout>
            <Box sx={{ p: 3, bgcolor: "#f9f9f9", minHeight: "100vh" }}>
                {/* Search and Filters */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
                        <TextField
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <FiSearch />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ minWidth: 300 }}
                        />

                        <FormControl sx={{ minWidth: 150 }}>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={selectedCategory}
                                label="Category"
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                {categories.map((category) => (
                                    <MenuItem key={category} value={category}>
                                        {category}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl sx={{ minWidth: 150 }}>
                            <InputLabel>Brand</InputLabel>
                            <Select
                                value={selectedBrand}
                                label="Brand"
                                onChange={(e) => setSelectedBrand(e.target.value)}
                            >
                                {brands.map((brand) => (
                                    <MenuItem key={brand} value={brand}>
                                        {brand}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="Export to PDF">
                            <IconButton
                                onClick={handleExportPDF}
                                sx={{
                                    backgroundColor: "#f44336",
                                    color: "white",
                                    "&:hover": { backgroundColor: "#d32f2f" },
                                }}
                            >
                                <FiFileText />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Export to Excel">
                            <IconButton
                                onClick={handleExportExcel}
                                sx={{
                                    backgroundColor: "#4caf50",
                                    color: "white",
                                    "&:hover": { backgroundColor: "#388e3c" },
                                }}
                            >
                                <FiTable />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Refresh">
                            <IconButton
                                onClick={handleRefresh}
                                sx={{
                                    backgroundColor: "#2196f3",
                                    color: "white",
                                    "&:hover": { backgroundColor: "#1976d2" },
                                }}
                            >
                                <FiRefreshCw />
                            </IconButton>
                        </Tooltip>

                        <Button
                            variant="contained"
                            startIcon={<FiUpload />}
                            onClick={handleImportProducts}
                            sx={{
                                backgroundColor: "#1976d2",
                                "&:hover": { backgroundColor: "#1565c0" },
                            }}
                        >
                            Import Product
                        </Button>
                    </Box>
                </Box>

                {/* Table */}
                <TableContainer component={Paper} sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={
                                            selectedRows.length > 0 && selectedRows.length < paginatedData.length
                                        }
                                        checked={
                                            paginatedData.length > 0 &&
                                            selectedRows.length === paginatedData.length
                                        }
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                                <TableCell>SKU</TableCell>
                                <TableCell>Product Name</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Brand</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Unit</TableCell>
                                <TableCell>Qty</TableCell>
                                <TableCell>Created By</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedData.map((product) => (
                                <TableRow key={product.id} hover>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedRows.includes(product.id)}
                                            onChange={() => handleSelectRow(product.id)}
                                        />
                                    </TableCell>
                                    <TableCell>{product.sku}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            {product.icon}
                                            <Typography variant="body2">{product.productName}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={product.category} size="small" color="primary" />
                                    </TableCell>
                                    <TableCell>{product.brand}</TableCell>
                                    <TableCell>${product.price}</TableCell>
                                    <TableCell>{product.unit}</TableCell>
                                    <TableCell>{product.qty}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Avatar
                                                sx={{
                                                    width: 24,
                                                    height: 24,
                                                    fontSize: "0.75rem",
                                                    backgroundColor: "#1976d2",
                                                }}
                                            >
                                                {product.createdBy.avatar}
                                            </Avatar>
                                            <Typography variant="body2">{product.createdBy.name}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: "flex", gap: 0.5 }}>
                                            <Tooltip title="View">
                                                <IconButton size="small" onClick={() => handleView(product.id)}>
                                                    <FiEye color="#2196f3" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit">
                                                <IconButton size="small" onClick={() => handleEdit(product.id)}>
                                                    <FiEdit color="#ff9800" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton size="small" onClick={() => handleDelete(product.id)}>
                                                    <FiTrash2 color="#f44336" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2" sx={{ color: "#666" }}>
                            Rows per page
                        </Typography>
                        <Select<number>
                            value={rowsPerPage}
                            onChange={(e) => setRowsPerPage(Number(e.target.value))}
                            size="small"
                            sx={{ minWidth: 80 }}
                        >
                            <MenuItem value={5}>5 Entries</MenuItem>
                            <MenuItem value={10}>10 Entries</MenuItem>
                            <MenuItem value={25}>25 Entries</MenuItem>
                            <MenuItem value={50}>50 Entries</MenuItem>
                        </Select>
                    </Box>

                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        color="primary"
                        showFirstButton
                        showLastButton
                    />
                </Box>

                {isModalOpen && <ProductModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />}
            </Box>
        </AdminLayout>
    );
};

export default ProductTable;
