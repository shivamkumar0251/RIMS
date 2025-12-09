import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
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
import { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    FiFileText,
    FiRefreshCw,
    FiSearch,
    FiTable,
    FiTrash2,
    FiUpload,
} from "react-icons/fi";
import DateRangeFilter, { type DateRangeValue } from "../../components/common/DateRangeFilter";
import { AdminLayout } from "../../layouts/AdminLayout";
import { getConsumableStocks, deleteConsumableStock, selectConsumableStocks, selectConsumableStockLoading, selectAllConsumableStocksData } from "../../redux/slices/consumableStockSlice";
import type { AppDispatch } from "../../redux/store/store";
import type { ConsumableStock } from "../../redux/slices/consumableStockSlice";

export default function Consumables() {
    const dispatch = useDispatch<AppDispatch>();
    const consumableStocks = useSelector(selectConsumableStocks);
    const loading = useSelector(selectConsumableStockLoading);
    const allConsumableStocksData = useSelector(selectAllConsumableStocksData);

    const [searchTerm, setSearchTerm] = useState("");
    const [dateRange, setDateRange] = useState<DateRangeValue>([null, null]);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [page, setPage] = useState(1);

    // Fetch consumable stocks when filters change
    useEffect(() => {
        const fromDate = dateRange[0] ? dateRange[0].startOf('day').toISOString() : '';
        const toDate = dateRange[1] ? dateRange[1].endOf('day').toISOString() : '';
        dispatch(getConsumableStocks({ 
            search: searchTerm, 
            page, 
            limit: rowsPerPage,
            fromDate,
            toDate,
        }));
    }, [dispatch, searchTerm, page, rowsPerPage, dateRange]);

    // ---- Pagination ----
    const totalPages = allConsumableStocksData?.totalPages || 1;

    // ---- Delete ----
    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this consumable stock?')) {
            await dispatch(deleteConsumableStock(id));
        }
    };

    const handleRefresh = () => {
        setSearchTerm("");
        setDateRange([null, null]);
        setPage(1);
        dispatch(getConsumableStocks({ search: '', page: 1, limit: rowsPerPage }));
    };

    const safeValue = (val: unknown) =>
        val === null || val === undefined || val === "" ? "N.A" : String(val);

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
                    {/* Left Controls */}
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
                        />
                        <DateRangeFilter
                            value={dateRange}
                            onChange={setDateRange}
                            fullWidth={false}
                            size="small"
                        />
                    </Box>

                    {/* Right Controls */}
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
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
                                onClick={handleRefresh}
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
                            Consumables List
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
                                        <TableCell>Consumed Item</TableCell>
                                        <TableCell>Per Unit Rate</TableCell>
                                        <TableCell>Taxable Value</TableCell>
                                        <TableCell>GST (%)</TableCell>
                                        <TableCell>Total</TableCell>
                                        <TableCell>Created Date</TableCell>
                                        <TableCell align="center">Action</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={13} align="center">
                                                <CircularProgress size={24} sx={{ my: 2 }} />
                                            </TableCell>
                                        </TableRow>
                                    ) : consumableStocks.length > 0 ? (
                                        consumableStocks.map((item: ConsumableStock, idx) => {
                                            const itemData = item as Record<string, unknown>;
                                            const productName = String(itemData.productName || itemData.name || 'N.A');
                                            const category = String(itemData.category || itemData.categoryName || 'N.A');
                                            const brand = String(itemData.brand || itemData.brandName || itemData.companyName || 'N.A');
                                            const packSize = String(itemData.packSize || 'N.A');
                                            const unit = String(itemData.unit || 'N.A');
                                            const consumables = Number(itemData.consumables || itemData.consumedStock || 0);
                                            const perUnitRate = Number(itemData.perUnitRate || itemData.price || 0);
                                            const taxableValue = Number(itemData.taxableValue || consumables * perUnitRate);
                                            const gst = Number(itemData.gst || 0);
                                            const total = Number(itemData.total || taxableValue + (taxableValue * gst / 100));
                                            const createdDate = itemData.createdAt 
                                                ? dayjs(String(itemData.createdAt)).format('M/D/YYYY')
                                                : itemData.createdDate 
                                                ? String(itemData.createdDate)
                                                : 'N.A';

                                            return (
                                                <TableRow key={item._id}>
                                                    <TableCell>
                                                        {(page - 1) * rowsPerPage + idx + 1}
                                                    </TableCell>
                                                    <TableCell>{safeValue(productName)}</TableCell>
                                                    <TableCell>{safeValue(category)}</TableCell>
                                                    <TableCell>{safeValue(brand)}</TableCell>
                                                    <TableCell>{safeValue(packSize)}</TableCell>
                                                    <TableCell>{safeValue(unit)}</TableCell>
                                                    <TableCell>{consumables}</TableCell>
                                                    <TableCell>₹{perUnitRate.toFixed(2)}</TableCell>
                                                    <TableCell>₹{taxableValue.toFixed(2)}</TableCell>
                                                    <TableCell>{gst}%</TableCell>
                                                    <TableCell>₹{total.toFixed(2)}</TableCell>
                                                    <TableCell>{createdDate}</TableCell>
                                                    <TableCell align="center">
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
                                                                onClick={() => handleDelete(item._id)}
                                                            >
                                                                <FiTrash2 />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={13} align="center">
                                                No consumable stocks found
                                            </TableCell>
                                        </TableRow>
                                    )}
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
                                    onChange={(e) =>
                                        setRowsPerPage(Number(e.target.value))
                                    }
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
            </Box>
        </AdminLayout>
    );
}
