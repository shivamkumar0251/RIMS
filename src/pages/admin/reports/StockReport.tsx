import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Chip,
    CircularProgress,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { FiDownload, FiSearch, FiRefreshCw, FiPlay } from "react-icons/fi";
import { AdminLayout } from "../../../layouts/AdminLayout";
import { useAppDispatch, useAppSelector } from "../../../redux/store/storeHooks";
import { getCategories, selectCategories } from "../../../redux/slices/categorySlice";
import { getStockReportThunk, selectStockReport, selectReportLoading } from "../../../redux/slices/reportSlice";
import { exportToExcel, exportToPDF } from "../../../utils/reportExport";
import { selectUsersList } from "../../../redux/slices/authSlice";
import dayjs from "dayjs";

const StockReport: React.FC = () => {
    const dispatch = useAppDispatch();
    const categories = useAppSelector(selectCategories);
    const stockData = useAppSelector(selectStockReport);
    const loading = useAppSelector(selectReportLoading);
    const { user } = useAppSelector(selectUsersList);

    const [search, setSearch] = useState("");
    const [categoryId, setCategoryId] = useState("all");
    const [stockStatus, setStockStatus] = useState("all");
    const [isReportRun, setIsReportRun] = useState(false);

    useEffect(() => {
        dispatch(getCategories({ limit: 1000 }));
    }, [dispatch]);

    const handleReset = () => {
        setSearch("");
        setCategoryId("all");
        setStockStatus("all");
        setIsReportRun(false);
    };

    const handleRunReport = () => {
        dispatch(getStockReportThunk({
            categoryId,
            stockStatus
        }));
        setIsReportRun(true);
    };

    const handleExportExcel = () => {
        if (stockData.length === 0) return;

        const selectedCategory = categories.find(c => c._id === categoryId)?.categoryName || "All Categories";

        const metadata = {
            title: "Stock Status Report",
            generatedBy: user?.name || user?.email || "Admin",
            dateRange: `Current Snapshot (${dayjs().format("DD MMM YYYY")})`,
            filters: [
                { label: "Category", value: selectedCategory },
                { label: "Status", value: stockStatus }
            ],
            fileName: "Stock_Status_Report"
        };

        const headers = ["Item Name", "Category", "Store Qty", "Kitchen Qty", "Total Qty", "Stock Alert", "Status"];
        const data = filteredData.map(row => [
            row.productName,
            row.category,
            `${row.storeQty} ${row.unit}`,
            `${row.kitchenQty} ${row.unit}`,
            `${row.totalQty} ${row.unit}`,
            `${row.stockAlert} ${row.unit}`,
            row.status
        ]);
        exportToExcel(metadata, headers, data);
    };

    const handleExportPDF = () => {
        if (stockData.length === 0) return;

        const selectedCategory = categories.find(c => c._id === categoryId)?.categoryName || "All Categories";

        const metadata = {
            title: "Stock Status Report",
            generatedBy: user?.name || user?.email || "Admin",
            dateRange: `Current Snapshot (${dayjs().format("DD MMM YYYY")})`,
            filters: [
                { label: "Category", value: selectedCategory },
                { label: "Status", value: stockStatus }
            ],
            fileName: "Stock_Status_Report"
        };

        const headers = ["Item Name", "Category", "Store", "Kitchen", "Total", "Alert", "Status"];
        const data = filteredData.map(row => [
            row.productName,
            row.category,
            row.storeQty,
            row.kitchenQty,
            row.totalQty,
            row.stockAlert,
            row.status
        ]);
        exportToPDF(metadata, headers, data);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "In Stock": return "success";
            case "Low Stock": return "warning";
            case "Out of Stock": return "error";
            default: return "default";
        }
    };

    const filteredData = stockData.filter(item =>
        item.productName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout>
            <Box className="flex-1 flex flex-col overflow-hidden bg-slate-50">
                {/* Header Section */}
                <Box className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-gray-100 bg-white shadow-sm shrink-0">
                    <Box>
                        <Typography variant="h5" className="font-bold text-slate-800 tracking-tight">Stock Status Report</Typography>
                        <Typography variant="body2" className="text-slate-500 mt-1">Current inventory snapshot and availability across all locations.</Typography>
                    </Box>
                    <Box className="flex gap-3">
                        <Button
                            variant="outlined"
                            startIcon={<FiDownload />}
                            onClick={handleExportExcel}
                            disabled={stockData.length === 0}
                            className="border-slate-200 text-slate-700 normal-case font-medium hover:bg-slate-50 px-4"
                        >
                            Export Excel
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<FiDownload />}
                            onClick={handleExportPDF}
                            disabled={stockData.length === 0}
                            className="bg-indigo-600 hover:bg-indigo-700 normal-case shadow-none font-medium px-4"
                        >
                            Export PDF
                        </Button>
                    </Box>
                </Box>

                {/* Filter Section */}
                <Box className="p-6 bg-white border-b border-gray-100 shrink-0 space-y-6">
                    <Box className="flex flex-wrap items-end gap-5">
                        <TextField
                            placeholder="Search items..."
                            size="small"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full sm:w-64"
                            InputProps={{
                                startAdornment: <FiSearch className="text-gray-400 mr-2" />,
                            }}
                        />

                        {/* Category Filter */}
                        <FormControl size="small" className="w-full sm:w-56">
                            <InputLabel>Filter by Category</InputLabel>
                            <Select
                                value={categoryId}
                                label="Filter by Category"
                                onChange={(e) => setCategoryId(e.target.value as string)}
                            >
                                <MenuItem value="all">All Categories</MenuItem>
                                {categories.map((c) => (
                                    <MenuItem key={c._id} value={c._id}>{c.categoryName}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Availability Filter */}
                        <FormControl size="small" className="w-full sm:w-56">
                            <InputLabel>Stock Status</InputLabel>
                            <Select
                                value={stockStatus}
                                label="Stock Status"
                                onChange={(e) => setStockStatus(e.target.value as string)}
                            >
                                <MenuItem value="all">All Status</MenuItem>
                                <MenuItem value="in_stock">In Stock</MenuItem>
                                <MenuItem value="low_stock">Low Stock</MenuItem>
                                <MenuItem value="out_of_stock">Out of Stock</MenuItem>
                            </Select>
                        </FormControl>

                        <Box className="flex items-center gap-3">
                            <Button
                                variant="contained"
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <FiPlay />}
                                onClick={handleRunReport}
                                disabled={loading}
                                className="bg-indigo-600 hover:bg-indigo-700 normal-case shadow-lg shadow-indigo-200 px-6 py-2"
                            >
                                {loading ? "Generating..." : "Run Report"}
                            </Button>
                            <Button
                                size="medium"
                                variant="text"
                                startIcon={<FiRefreshCw />}
                                onClick={handleReset}
                                className="text-slate-500 hover:text-indigo-600 normal-case"
                            >
                                Reset
                            </Button>
                        </Box>
                    </Box>
                </Box>

                {/* Report Content */}
                <Box className="flex-1 overflow-auto p-6">
                    <Paper className="shadow-sm rounded-xl overflow-hidden border border-slate-200 bg-white">
                        <TableContainer>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4">Item Name</TableCell>
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4">Category</TableCell>
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4 text-center">Store Qty</TableCell>
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4 text-center">Kitchen Qty</TableCell>
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4 text-center">Total Qty</TableCell>
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4 text-center">Stock Alert</TableCell>
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4 text-center">Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {isReportRun ? (
                                        filteredData.length > 0 ? (
                                            filteredData.map((row) => (
                                                <TableRow key={row.productId} hover>
                                                    <TableCell className="py-4 font-medium text-slate-700">{row.productName}</TableCell>
                                                    <TableCell className="py-4">{row.category}</TableCell>
                                                    <TableCell className="py-4 text-center text-slate-600">{row.storeQty} {row.unit}</TableCell>
                                                    <TableCell className="py-4 text-center text-slate-600">{row.kitchenQty} {row.unit}</TableCell>
                                                    <TableCell className="py-4 text-center font-bold text-slate-800">{row.totalQty} {row.unit}</TableCell>
                                                    <TableCell className="py-4 text-center text-rose-400 font-medium">{row.stockAlert} {row.unit}</TableCell>
                                                    <TableCell className="py-4 text-center">
                                                        <Chip
                                                            label={row.status}
                                                            size="small"
                                                            color={getStatusColor(row.status) as any}
                                                            variant="outlined"
                                                            className="font-semibold"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} align="center" className="py-24">
                                                    <Box className="flex flex-col items-center gap-3">
                                                        <Box className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                                            <FiSearch size={32} />
                                                        </Box>
                                                        <Typography className="text-slate-400 font-medium">No stock records found matching your filters.</Typography>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center" className="py-24">
                                                <Box className="flex flex-col items-center gap-3">
                                                    <Box className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                                        <FiSearch size={32} />
                                                    </Box>
                                                    <Typography className="text-slate-400 font-medium">Click "Run Report" to generate current stock levels.</Typography>
                                                    <Typography variant="caption" className="text-slate-300 uppercase tracking-widest">Inventory Snapshot Ready</Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Box>
            </Box>
        </AdminLayout>
    );
};

export default StockReport;
