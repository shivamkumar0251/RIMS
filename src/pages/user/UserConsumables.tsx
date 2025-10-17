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
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import {
    FiFileText,
    FiPlus,
    FiRefreshCw,
    FiSearch,
    FiTable,
    FiUpload,
} from "react-icons/fi";
import DateRangeFilter, { type DateRangeValue } from "../../components/common/DateRangeFilter";
import { USER_CONSUMABLES } from "../../data/UserConsumablesDummyData";
import UserLayout from "../../layouts/UserLayout";

interface Product {
    id: number;
    productName: string;
    quantity: number;
    consumables: number;
    wastage: number;
    createdDate: string;
}

export default function UserConsumables() {
    const [searchTerm, setSearchTerm] = useState("");
    const [dateRange, setDateRange] = useState<DateRangeValue>([null, null]);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [page, setPage] = useState(1);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [tableData, setTableData] = useState<Product[]>([...USER_CONSUMABLES]);

    // --- Filtered Data ---
    const filteredItems = useMemo(() => {
        return tableData.filter((item) => {
            const matchesSearch = item.productName
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

            const matchesDate =
                dateRange[0] && dateRange[1]
                    ? dayjs(item.createdDate, "M/D/YYYY").isAfter(dateRange[0].subtract(1, "day")) &&
                      dayjs(item.createdDate, "M/D/YYYY").isBefore(dateRange[1].add(1, "day"))
                    : true;

            return matchesSearch && matchesDate;
        });
    }, [tableData, searchTerm, dateRange]);

    // --- Pagination ---
    const totalPages = Math.ceil(filteredItems.length / rowsPerPage);
    const paginatedItems = filteredItems.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    // --- Handlers ---
    const handleAddProduct = () => {
        setOpenDrawer(true);
        setSelectedProducts([]);
    };

    const handleSaveConsumables = () => {
        const newItems = selectedProducts.map((p) => ({
            ...p,
            createdDate: new Date().toLocaleDateString(),
        }));
        setTableData((prev) => [...prev, ...newItems]);
        setOpenDrawer(false);
    };

    const handleExportPDF = () => alert("Export to PDF");
    const handleExportExcel = () => alert("Export to Excel");
    const handleRefresh = () => window.location.reload();
    const handleImportProducts = () => alert("Import clicked!");

    return (
        <UserLayout>
            <Box sx={{ p: 3, backgroundColor: "#f9fafb", minHeight: "100vh" }}>
                {/* Header */}
                <Typography variant="h5" mb={2} fontWeight="bold">
                    User Consumables
                </Typography>

                {/* Filters & Actions */}
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap"
                    mb={2}
                    gap={2}
                >
                    <Box
                        sx={{
                            display: "flex",
                            gap: 2,
                            flexWrap: "wrap",
                            alignItems: "center",
                        }}
                    >
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
                            size="small"
                        />

                        {/* 🔁 Reusable Date Range Picker */}
                        <DateRangeFilter
                            value={dateRange}
                            onChange={setDateRange}
                            fullWidth={false}
                            size="small"
                        />
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Button
                            variant="contained"
                            startIcon={<FiPlus />}
                            onClick={handleAddProduct}
                        >
                            Add Consumables
                        </Button>
                        <Tooltip title="Export PDF">
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
                        <Tooltip title="Export Excel">
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
                        >
                            Import
                        </Button>
                    </Box>
                </Box>

                {/* Table */}
                <Card sx={{ boxShadow: 4, borderRadius: 3 }}>
                    <CardContent>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead sx={{ backgroundColor: "#e3f2fd" }}>
                                    <TableRow>
                                        <TableCell>S.No</TableCell>
                                        <TableCell>Product Name</TableCell>
                                        <TableCell>Quantity</TableCell>
                                        <TableCell>Consumables</TableCell>
                                        <TableCell>Wastage</TableCell>
                                        <TableCell>Created Date</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedItems.map((item, idx) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                {(page - 1) * rowsPerPage + idx + 1}
                                            </TableCell>
                                            <TableCell>{item.productName}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>{item.consumables}</TableCell>
                                            <TableCell>{item.wastage}</TableCell>
                                            <TableCell>{item.createdDate}</TableCell>
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
                                flexWrap: "wrap",
                                gap: 2,
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

                {/* Drawer for Adding Consumables */}
                <Drawer
                    anchor="right"
                    open={openDrawer}
                    onClose={() => setOpenDrawer(false)}
                    PaperProps={{
                        sx: { width: { xs: "100%", sm: 400 }, p: 3 },
                    }}
                >
                    <Typography variant="h6" mb={2} fontWeight="bold">
                        Add User Consumables
                    </Typography>

                    <Autocomplete
                        multiple
                        options={USER_CONSUMABLES}
                        getOptionLabel={(option) => option.productName}
                        value={selectedProducts}
                        onChange={(_, newValue) => {
                            setSelectedProducts(
                                newValue.map((p) => ({
                                    ...p,
                                    consumables: 0,
                                    wastage: 0,
                                }))
                            );
                        }}
                        renderInput={(params) => (
                            <TextField {...params} label="Select Products" />
                        )}
                        sx={{ mb: 3 }}
                    />

                    {selectedProducts.map((prod, i) => (
                        <Box
                            key={prod.id}
                            sx={{
                                mb: 2,
                                p: 2,
                                border: "1px solid #e0e0e0",
                                borderRadius: 2,
                                backgroundColor: "#fafafa",
                            }}
                        >
                            <Typography fontWeight="bold">{prod.productName}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Quantity: {prod.quantity}
                            </Typography>

                            <TextField
                                label="Consumables"
                                type="number"
                                value={prod.consumables}
                                onChange={(e) => {
                                    const updated = [...selectedProducts];
                                    updated[i].consumables = Number(e.target.value);
                                    setSelectedProducts(updated);
                                }}
                                fullWidth
                                size="small"
                                sx={{ mt: 1 }}
                            />
                            <TextField
                                label="Wastage"
                                type="number"
                                value={prod.wastage}
                                onChange={(e) => {
                                    const updated = [...selectedProducts];
                                    updated[i].wastage = Number(e.target.value);
                                    setSelectedProducts(updated);
                                }}
                                fullWidth
                                size="small"
                                sx={{ mt: 1 }}
                            />
                        </Box>
                    ))}

                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleSaveConsumables}
                        disabled={selectedProducts.length === 0}
                    >
                        Save Consumables
                    </Button>
                </Drawer>
            </Box>
        </UserLayout>
    );
}
