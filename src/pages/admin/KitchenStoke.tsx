import {
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    Drawer,
    IconButton,
    InputAdornment,
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
    Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useMemo, useState } from "react";
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
import { DUMMY_PRODUCTS, type Product } from "../../data/kitchenProducts";
import { AdminLayout } from "../../layouts/AdminLayout";

interface KitchenStockItem extends Product {
    openingStock: number;
    quantity: number;
    consumedStock: number;
    closingStock: number;
    perUnitRate: number;
    taxableValue: number;
    gst: number;
    total: number;
    createdDate: string;
}

export default function KitchenStock() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDate, setSelectedDate] = useState<any>(null);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [page, setPage] = useState(1);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState<number>(0);
    const [openingStock, setOpeningStock] = useState<number>(0);
    const [perUnitRate, setPerUnitRate] = useState<number>(0);
    const [gst, setGst] = useState<number>(5);
    const [items, setItems] = useState<KitchenStockItem[]>([]);

    const totalPages = Math.ceil(items.length / rowsPerPage);

    const filteredItems = useMemo(() => {
        let data = items.filter((i) =>
            i.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (selectedDate)
            data = data.filter(
                (i) =>
                    new Date(i.createdDate).toDateString() ===
                    new Date(selectedDate).toDateString()
            );
        return data;
    }, [items, searchTerm, selectedDate]);

    const paginatedItems = filteredItems.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    const handleAddProduct = () => {
        setDrawerOpen(true);
    };

    const handleSave = () => {
        if (!selectedProduct) return;

        const consumedStock = Math.min(quantity, openingStock); // Quantity never exceeds openingStock
        const closingStock = Math.max(openingStock - consumedStock, 0);
        const taxableValue = consumedStock * perUnitRate; // taxableValue based on consumed stock
        const total = (taxableValue * gst) / 100; // total = taxableValue * GST(%)

        const newItem: KitchenStockItem = {
            ...selectedProduct,
            openingStock,
            quantity,
            consumedStock,
            closingStock,
            perUnitRate,
            taxableValue,
            gst,
            total,
            createdDate: new Date().toLocaleDateString(),
        };

        setItems((prev) => [...prev, newItem]);
        setDrawerOpen(false);
        setSelectedProduct(null);
        setOpeningStock(0);
        setQuantity(0);
        setPerUnitRate(0);
        setGst(5);
    };

    const handleDelete = (index: number) => {
        setItems((prev) => prev.filter((_, i) => i !== index));
    };

    const handleEdit = (index: number) => {
        const item = items[index];
        setSelectedProduct(item);
        setOpeningStock(item.openingStock);
        setQuantity(item.quantity);
        setPerUnitRate(item.perUnitRate);
        setGst(item.gst);
        setDrawerOpen(true);
    };

    return (
        <AdminLayout>
            <Box sx={{ p: 3, backgroundColor: "#f9fafb", minHeight: "100vh" }}>
                {/* Header */}
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap"
                    mb={2}
                >
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                        <TextField
                            placeholder="Search Products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <FiSearch />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ minWidth: 250 }}
                        />
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Filter by Created Date"
                                value={selectedDate}
                                onChange={(newValue) => setSelectedDate(newValue)}
                                renderInput={(params) => (
                                    <TextField {...params} sx={{ minWidth: 180 }} />
                                )}
                            />
                        </LocalizationProvider>
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Button
                            variant="contained"
                            startIcon={<FiPlus />}
                            onClick={handleAddProduct}
                            sx={{
                                transition: "0.3s",
                                "&:hover": { transform: "scale(1.05)" },
                            }}
                        >
                            Add In-Kitchen
                        </Button>
                        <Tooltip title="Export PDF">
                            <IconButton
                                sx={{
                                    backgroundColor: "#f44336",
                                    color: "white",
                                    transition: "0.3s",
                                    "&:hover": {
                                        backgroundColor: "#d32f2f",
                                        transform: "scale(1.05)",
                                    },
                                }}
                            >
                                <FiFileText />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Export Excel">
                            <IconButton
                                sx={{
                                    backgroundColor: "#4caf50",
                                    color: "white",
                                    transition: "0.3s",
                                    "&:hover": {
                                        backgroundColor: "#388e3c",
                                        transform: "scale(1.05)",
                                    },
                                }}
                            >
                                <FiTable />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Refresh">
                            <IconButton
                                sx={{
                                    backgroundColor: "#2196f3",
                                    color: "white",
                                    transition: "0.3s",
                                    "&:hover": {
                                        backgroundColor: "#1976d2",
                                        transform: "scale(1.05)",
                                    },
                                }}
                            >
                                <FiRefreshCw />
                            </IconButton>
                        </Tooltip>
                        <Button
                            variant="contained"
                            startIcon={<FiUpload />}
                            sx={{
                                transition: "0.3s",
                                "&:hover": { transform: "scale(1.05)" },
                            }}
                        >
                            Import
                        </Button>
                    </Box>
                </Box>

                {/* Table */}
                <Card sx={{ boxShadow: 4, borderRadius: 3 }}>
                    <CardContent>
                        <Typography variant="h6" mb={2}>
                            Kitchen Stock List
                        </Typography>

                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead sx={{ backgroundColor: "#e3f2fd" }}>
                                    <TableRow>
                                        <TableCell>S.No</TableCell>
                                        <TableCell>Product Name</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Brand</TableCell>
                                        <TableCell>Pack Size</TableCell>
                                        <TableCell>Unit</TableCell>
                                        <TableCell>Opening Stock</TableCell>
                                        <TableCell>Quantity</TableCell>
                                        <TableCell>Consumed Stock</TableCell>
                                        <TableCell>Closing Stock</TableCell>
                                        <TableCell>Per Unit Rate</TableCell>
                                        <TableCell>Taxable Value</TableCell>
                                        <TableCell>GST (%)</TableCell>
                                        <TableCell>Total</TableCell>
                                        <TableCell>Created Date</TableCell>
                                        <TableCell align="center">Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedItems.map((item, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{(page - 1) * rowsPerPage + idx + 1}</TableCell>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.category}</TableCell>
                                            <TableCell>{item.brand}</TableCell>
                                            <TableCell>{item.packSize}</TableCell>
                                            <TableCell>{item.unit}</TableCell>
                                            <TableCell>{item.openingStock}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>{item.consumedStock}</TableCell>
                                            <TableCell>
                                                {item.closingStock}{" "}
                                                <Typography
                                                    component="span"
                                                    color={
                                                        item.closingStock === 0
                                                            ? "error"
                                                            : item.closingStock < 10
                                                            ? "warning.main"
                                                            : "success.main"
                                                    }
                                                    sx={{ ml: 1, fontWeight: 600 }}
                                                >
                                                    {item.closingStock === 0
                                                        ? "Out of Stock"
                                                        : item.closingStock < 10
                                                        ? "Low Stock"
                                                        : "In Stock"}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{item.perUnitRate}</TableCell>
                                            <TableCell>{item.taxableValue.toFixed(2)}</TableCell>
                                            <TableCell>{item.gst}%</TableCell>
                                            <TableCell>{item.total.toFixed(2)}</TableCell>
                                            <TableCell>{item.createdDate}</TableCell>
                                            <TableCell align="center">
                                                <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                                                    <Tooltip title="Edit">
                                                        <IconButton
                                                            sx={{
                                                                color: "white",
                                                                backgroundColor: "#1976d2",
                                                                "&:hover": {
                                                                    backgroundColor: "#0d47a1",
                                                                    transform: "scale(1.1)",
                                                                },
                                                                transition: "0.3s",
                                                            }}
                                                            onClick={() => handleEdit(idx)}
                                                        >
                                                            <FiEdit />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <IconButton
                                                            sx={{
                                                                color: "white",
                                                                backgroundColor: "#f44336",
                                                                "&:hover": {
                                                                    backgroundColor: "#d32f2f",
                                                                    transform: "scale(1.1)",
                                                                },
                                                                transition: "0.3s",
                                                            }}
                                                            onClick={() => handleDelete(idx)}
                                                        >
                                                            <FiTrash2 />
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
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mt: 2,
                                alignItems: "center",
                            }}
                        >
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
                                    <MenuItem value={5}>5</MenuItem>
                                    <MenuItem value={10}>10</MenuItem>
                                    <MenuItem value={25}>25</MenuItem>
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
                    </CardContent>
                </Card>

                {/* Drawer Form */}
                <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                    <Box sx={{ width: 400, p: 3 }}>
                        <Typography variant="h6" mb={2}>
                            Add / Edit Kitchen Stock
                        </Typography>

                        <Autocomplete
                            options={DUMMY_PRODUCTS}
                            getOptionLabel={(option) => option.name}
                            value={selectedProduct}
                            onChange={(_, newValue) => {
                                setSelectedProduct(newValue);
                                setOpeningStock(newValue?.openingStoke || 0);
                                setPerUnitRate(newValue?.perUnitRate || 0);
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Select Product" fullWidth />
                            )}
                            sx={{ mb: 2 }}
                        />

                        {selectedProduct && (
                            <>
                                <TextField
                                    label="Category"
                                    value={selectedProduct.category}
                                    fullWidth
                                    margin="normal"
                                    InputProps={{ readOnly: true }}
                                />
                                <TextField
                                    label="Brand"
                                    value={selectedProduct.brand}
                                    fullWidth
                                    margin="normal"
                                    InputProps={{ readOnly: true }}
                                />
                                <TextField
                                    label="Pack Size"
                                    value={selectedProduct.packSize}
                                    fullWidth
                                    margin="normal"
                                    InputProps={{ readOnly: true }}
                                />
                                <TextField
                                    label="Unit"
                                    value={selectedProduct.unit}
                                    fullWidth
                                    margin="normal"
                                    InputProps={{ readOnly: true }}
                                />

                                <TextField
                                    label="Store Stock"
                                    value={openingStock}
                                    type="number"
                                    fullWidth
                                    margin="normal"
                                    InputProps={{ readOnly: true }}
                                />
                                <TextField
                                    label="Quantity"
                                    type="number"
                                    fullWidth
                                    margin="normal"
                                    value={quantity}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        setQuantity(val > openingStock ? openingStock : val);
                                    }}
                                />
                            </>
                        )}
                        <Button
                            variant="contained"
                            fullWidth
                            sx={{ mt: 3 }}
                            onClick={handleSave}
                            disabled={!selectedProduct}
                        >
                            Save
                        </Button>
                    </Box>
                </Drawer>
            </Box>
        </AdminLayout>
    );
}
