import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { FiDownload, FiSearch, FiRefreshCw, FiPlay } from "react-icons/fi";
import { AdminLayout } from "../../../layouts/AdminLayout";
import { useAppDispatch, useAppSelector } from "../../../redux/store/storeHooks";
import { getCategories, selectCategories } from "../../../redux/slices/categorySlice";
import { getProducts, selectProducts } from "../../../redux/slices/productSlice";
import { getConsumptionReportThunk, selectConsumptionReport, selectReportLoading } from "../../../redux/slices/reportSlice";
import AdvancedDateRangePicker from "../../../components/common/AdvancedDateRangePicker";
import { exportToExcel, exportToPDF } from "../../../utils/reportExport";
import { selectUsersList } from "../../../redux/slices/authSlice";
import toast from "react-hot-toast";
import dayjs from "dayjs";

const ConsumablesReport: React.FC = () => {
    const dispatch = useAppDispatch();
    const categories = useAppSelector(selectCategories);
    const products = useAppSelector(selectProducts);
    const consumptionData = useAppSelector(selectConsumptionReport);
    const loading = useAppSelector(selectReportLoading);
    const { user } = useAppSelector(selectUsersList);

    const [fromDate, setFromDate] = useState(dayjs().startOf('month').format("YYYY-MM-DD"));
    const [toDate, setToDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [categoryId, setCategoryId] = useState("all");
    const [productId, setProductId] = useState("all");
    const [dateLabel, setDateLabel] = useState("This Month");
    const [isReportRun, setIsReportRun] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        dispatch(getCategories({ limit: 1000 }));
        dispatch(getProducts({ limit: 1000 }));
    }, [dispatch]);

    const handleDateRangeChange = (start: string, end: string, label: string) => {
        setFromDate(start);
        setToDate(end);
        setDateLabel(label);
    };

    const handleReset = () => {
        setCategoryId("all");
        setProductId("all");
        setDateLabel("This Month");
        setFromDate(dayjs().startOf('month').format("YYYY-MM-DD"));
        setToDate(dayjs().format("YYYY-MM-DD"));
        setIsReportRun(false);
        setSearch("");
    };

    const handleRunReport = async () => {
        try {
            await dispatch(getConsumptionReportThunk({
                fromDate,
                toDate,
                productId,
                categoryId
            })).unwrap();
            setIsReportRun(true);
            toast.success("Report generated successfully");
        } catch (error: any) {
            toast.error(error?.message || "Failed to generate report");
        }
    };

    const filteredData = consumptionData.filter(item =>
        item.productId?.productName?.toLowerCase().includes(search.toLowerCase())
    );

    const handleExportExcel = () => {
        if (filteredData.length === 0) return;
        const selectedCategory = categories.find(c => c._id === categoryId)?.categoryName || "All Categories";
        const selectedProduct = products.find(p => p._id === productId)?.productName || "All Items";

        const metadata = {
            title: "Consumables Report",
            generatedBy: user?.name || user?.email || "Admin",
            dateRange: `${dayjs(fromDate).format("DD MMM YYYY")} to ${dayjs(toDate).format("DD MMM YYYY")}`,
            filters: [
                { label: "Category", value: selectedCategory },
                { label: "Product", value: selectedProduct }
            ],
            fileName: "Consumables_Report"
        };

        const headers = ["Date", "Item Name", "Category", "Unit", "Opening", "Added", "Used", "Available"];
        const data = filteredData.map(row => [
            dayjs(row.createdAt).format("DD MMM YYYY"),
            row.productId?.productName || "N/A",
            row.productId?.categoryId?.categoryName || "N/A",
            row.productId?.unit || "",
            row.openingStock,
            row.rcvdKitchenQty,
            row.transfersToUsage,
            row.closingStock
        ]);
        exportToExcel(metadata, headers, data);
    };

    const handleExportPDF = () => {
        if (filteredData.length === 0) return;
        const selectedCategory = categories.find(c => c._id === categoryId)?.categoryName || "All Categories";
        const selectedProduct = products.find(p => p._id === productId)?.productName || "All Items";

        const metadata = {
            title: "Consumables Report",
            generatedBy: user?.name || user?.email || "Admin",
            dateRange: `${dayjs(fromDate).format("DD MMM YYYY")} to ${dayjs(toDate).format("DD MMM YYYY")}`,
            filters: [
                { label: "Category", value: selectedCategory },
                { label: "Product", value: selectedProduct }
            ],
            fileName: "Consumables_Report"
        };

        const headers = ["Date", "Item Name", "Category", "Unit", "Opening", "Added", "Used", "Available"];
        const data = filteredData.map(row => [
            dayjs(row.createdAt).format("DD MMM YYYY"),
            row.productId?.productName || "N/A",
            row.productId?.categoryId?.categoryName || "N/A",
            row.productId?.unit || "",
            row.openingStock,
            row.rcvdKitchenQty,
            row.transfersToUsage,
            row.closingStock
        ]);
        exportToPDF(metadata, headers, data);
    };

    return (
        <AdminLayout>
            <Box className="flex-1 flex flex-col overflow-hidden bg-slate-50">
                {/* Header Section */}
                <Box className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-gray-100 bg-white shadow-sm shrink-0">
                    <Box>
                        <Typography variant="h5" className="font-bold text-slate-800">Consumables Report</Typography>
                        <Typography variant="body2" className="text-slate-500">Track non-ingredient items usage and stock.</Typography>
                    </Box>
                    <Box className="flex gap-2">
                        <Button
                            variant="contained"
                            startIcon={<FiDownload />}
                            onClick={handleExportPDF}
                            className="bg-indigo-600 hover:bg-indigo-700 normal-case shadow-none font-medium"
                            disabled={!isReportRun || filteredData.length === 0}
                        >
                            Export PDF
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<FiDownload />}
                            onClick={handleExportExcel}
                            className="border-gray-300 text-gray-700 normal-case font-medium"
                            disabled={!isReportRun || filteredData.length === 0}
                        >
                            Export Excel
                        </Button>
                    </Box>
                </Box>

                {/* Filter Section */}
                <Box className="p-6 bg-white border-b border-gray-100 shrink-0 space-y-6">
                    <Box className="flex flex-wrap items-end gap-5">
                        <AdvancedDateRangePicker
                            fromDate={fromDate}
                            toDate={toDate}
                            onRangeChange={handleDateRangeChange}
                            initialLabel={dateLabel}
                        />

                        <FormControl size="small" className="w-full sm:w-56">
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={categoryId}
                                label="Category"
                                onChange={(e) => setCategoryId(e.target.value as string)}
                            >
                                <MenuItem value="all">All Categories</MenuItem>
                                {categories.map((c) => (
                                    <MenuItem key={c._id} value={c._id}>{c.categoryName}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box className="flex items-center gap-3">
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
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4">Date</TableCell>
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4">Item Name</TableCell>
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4">Category</TableCell>
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4 text-center">Unit</TableCell>
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4 text-center">Opening</TableCell>
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4 text-center">Added</TableCell>
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4 text-center">Used</TableCell>
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4 text-right">Available</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {isReportRun ? (
                                        filteredData.length > 0 ? (
                                            filteredData.map((row) => (
                                                <TableRow key={row._id} hover>
                                                    <TableCell className="py-4">{dayjs(row.createdAt).format("DD MMM YYYY")}</TableCell>
                                                    <TableCell className="py-4 font-medium text-slate-700">{row.productId?.productName}</TableCell>
                                                    <TableCell className="py-4">{row.productId?.categoryId?.categoryName || "N/A"}</TableCell>
                                                    <TableCell className="py-4 text-center">{row.productId?.unit}</TableCell>
                                                    <TableCell className="py-4 text-center font-semibold text-slate-600">{row.openingStock}</TableCell>
                                                    <TableCell className="py-4 text-center text-indigo-600 font-semibold">{row.rcvdKitchenQty}</TableCell>
                                                    <TableCell className="py-4 text-center text-emerald-600 font-semibold">{row.transfersToUsage}</TableCell>
                                                    <TableCell className="py-4 text-right font-bold text-slate-800">{row.closingStock}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={8} align="center" className="py-24">
                                                    <Box className="flex flex-col items-center gap-3">
                                                        <Box className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                                            <FiSearch size={32} />
                                                        </Box>
                                                        <Typography className="text-slate-400 font-medium font-italic">
                                                            No consumables records found for the selected criteria.
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center" className="py-24">
                                                <Box className="flex flex-col items-center gap-3">
                                                    <Box className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                                        <FiSearch size={32} />
                                                    </Box>
                                                    <Typography className="text-slate-400 font-medium font-italic">
                                                        Generate consumables report to view stock movement.
                                                    </Typography>
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

export default ConsumablesReport;
