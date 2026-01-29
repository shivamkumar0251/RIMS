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
    Typography,
    CircularProgress,
} from "@mui/material";
import React, { useState, useEffect, useMemo } from "react";
import { FiDownload, FiSearch, FiRefreshCw, FiPlay } from "react-icons/fi";
import { AdminLayout } from "../../../layouts/AdminLayout";
import { useAppDispatch, useAppSelector } from "../../../redux/store/storeHooks";
import { getCategories, selectCategories } from "../../../redux/slices/categorySlice";
import { getProducts, selectProducts } from "../../../redux/slices/productSlice";
import { getPurchaseOriginReportThunk, selectPurchaseOriginReport, selectReportLoading } from "../../../redux/slices/reportSlice";
import AdvancedDateRangePicker from "../../../components/common/AdvancedDateRangePicker";
import { exportToExcel, exportToPDF } from "../../../utils/reportExport";
import { selectUsersList } from "../../../redux/slices/authSlice";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import quarterOfYear from "dayjs/plugin/quarterOfYear";

dayjs.extend(isBetween);
dayjs.extend(quarterOfYear);

const PurchaseOriginReport: React.FC = () => {
    const dispatch = useAppDispatch();
    const categories = useAppSelector(selectCategories);
    const products = useAppSelector(selectProducts);
    const reportData = useAppSelector(selectPurchaseOriginReport);
    const loading = useAppSelector(selectReportLoading);

    const { user } = useAppSelector(selectUsersList);
    const [fromDate, setFromDate] = useState(dayjs().startOf('month').format("YYYY-MM-DD"));
    const [toDate, setToDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [categoryId, setCategoryId] = useState("all");
    const [productId, setProductId] = useState("all");
    const [dateLabel, setDateLabel] = useState("This Month");
    const [isReportRun, setIsReportRun] = useState(false);

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
    };

    const handleRunReport = () => {
        dispatch(getPurchaseOriginReportThunk({
            fromDate,
            toDate,
            productId,
            categoryId
        }));
        setIsReportRun(true);
    };

    const totals = useMemo(() => {
        if (!reportData) return { direct: 0, order: 0, total: 0, store: 0, kitchen: 0 };
        return reportData.reduce((acc, curr) => {
            acc.direct += curr.directQty || 0;
            acc.order += curr.orderQty || 0;
            acc.total += curr.totalQty || 0;
            acc.store += curr.storeQty || 0;
            acc.kitchen += curr.kitchenQty || 0;
            return acc;
        }, { direct: 0, order: 0, total: 0, store: 0, kitchen: 0 });
    }, [reportData]);

    const handleExportExcel = () => {
        if (reportData.length === 0) return;

        const selectedCategory = categories.find(c => c._id === categoryId)?.categoryName || "All Categories";
        const selectedProduct = products.find(p => p._id === productId)?.productName || "All Items";

        const metadata = {
            title: "Purchase Origin & Stock Distribution Report",
            generatedBy: user?.name || user?.email || "Admin",
            dateRange: `${dayjs(fromDate).format("DD MMM YYYY")} to ${dayjs(toDate).format("DD MMM YYYY")}`,
            filters: [
                { label: "Category", value: selectedCategory },
                { label: "Product", value: selectedProduct }
            ],
            fileName: "Purchase_Origin_Stock_Report"
        };

        const headers = ["Item Name", "Category", "Direct Qty", "Order Qty", "Total Purchased", "Store Stock", "Kitchen Stock", "Unit"];
        const data = reportData.map(row => [
            row.productName || "N/A",
            row.categoryName || "N/A",
            row.directQty,
            row.orderQty,
            row.totalQty,
            row.storeQty,
            row.kitchenQty,
            row.unit || ""
        ]);

        // Add Totals Row
        data.push(["TOTAL", "", totals.direct.toString(), totals.order.toString(), totals.total.toString(), totals.store.toString(), totals.kitchen.toString(), ""]);

        exportToExcel(metadata, headers, data);
    };

    const handleExportPDF = () => {
        if (reportData.length === 0) return;

        const selectedCategory = categories.find(c => c._id === categoryId)?.categoryName || "All Categories";
        const selectedProduct = products.find(p => p._id === productId)?.productName || "All Items";

        const metadata = {
            title: "Purchase Origin & Stock Distribution Report",
            generatedBy: user?.name || user?.email || "Admin",
            dateRange: `${dayjs(fromDate).format("DD MMM YYYY")} to ${dayjs(toDate).format("DD MMM YYYY")}`,
            filters: [
                { label: "Category", value: selectedCategory },
                { label: "Product", value: selectedProduct }
            ],
            fileName: "Purchase_Origin_Stock_Report"
        };

        const headers = ["Item Name", "Direct", "Order", "Purchased", "Store", "Kitchen", "Unit"];
        const data = reportData.map(row => [
            row.productName || "N/A",
            row.directQty,
            row.orderQty,
            row.totalQty,
            row.storeQty,
            row.kitchenQty,
            row.unit || ""
        ]);

        // Add Totals Row
        data.push(["TOTAL", totals.direct.toString(), totals.order.toString(), totals.total.toString(), totals.store.toString(), totals.kitchen.toString(), ""]);

        exportToPDF(metadata, headers, data);
    };

    return (
        <AdminLayout>
            <Box className="flex-1 flex flex-col overflow-hidden bg-slate-50">
                {/* Header Section */}
                <Box className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-gray-100 bg-white shadow-sm shrink-0">
                    <Box>
                        <Typography variant="h5" className="font-bold text-slate-800 tracking-tight">Purchase Origin & Stock Report</Typography>
                        <Typography variant="body2" className="text-slate-500 mt-1">Tracks acquisition source and current stock distribution across Store and Kitchen.</Typography>
                    </Box>
                    <Box className="flex gap-3">
                        <Button
                            variant="outlined"
                            startIcon={<FiDownload />}
                            onClick={handleExportExcel}
                            disabled={reportData.length === 0}
                            className="border-slate-200 text-slate-700 normal-case font-medium hover:bg-slate-50 px-4"
                        >
                            Export Excel
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<FiDownload />}
                            onClick={handleExportPDF}
                            disabled={reportData.length === 0}
                            className="bg-indigo-600 hover:bg-indigo-700 normal-case shadow-none font-medium px-4"
                        >
                            Export PDF
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

                        <FormControl size="small" className="w-full sm:w-56">
                            <InputLabel>Filter by Item</InputLabel>
                            <Select
                                value={productId}
                                label="Filter by Item"
                                onChange={(e) => setProductId(e.target.value as string)}
                            >
                                <MenuItem value="all">All Items</MenuItem>
                                {products.map((p) => (
                                    <MenuItem key={p._id} value={p._id}>{p.productName}</MenuItem>
                                ))}
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
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4 text-center">Direct Purchase</TableCell>
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4 text-center">Vendor Order</TableCell>
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4 text-center">Total Purchased</TableCell>
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4 text-center text-emerald-700 bg-emerald-50">Main Store</TableCell>
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4 text-center text-indigo-700 bg-indigo-50">Kitchen Store</TableCell>
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4">Unit</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {isReportRun ? (
                                        reportData && reportData.length > 0 ? (
                                            <>
                                                {reportData.map((row) => (
                                                    <TableRow key={row.productId} hover>
                                                        <TableCell className="py-4 font-medium text-slate-800">{row.productName}</TableCell>
                                                        <TableCell className="py-4 text-slate-500">{row.categoryName || "N/A"}</TableCell>
                                                        <TableCell className="py-4 text-center font-bold text-amber-600">{row.directQty}</TableCell>
                                                        <TableCell className="py-4 text-center font-bold text-blue-600">{row.orderQty}</TableCell>
                                                        <TableCell className="py-4 text-center font-bold text-slate-800">{row.totalQty}</TableCell>
                                                        <TableCell className="py-4 text-center font-black text-emerald-600 bg-emerald-50/30">{row.storeQty}</TableCell>
                                                        <TableCell className="py-4 text-center font-black text-indigo-600 bg-indigo-50/30">{row.kitchenQty}</TableCell>
                                                        <TableCell className="py-4 text-slate-500">{row.unit}</TableCell>
                                                    </TableRow>
                                                ))}
                                                {/* Totals Row */}
                                                <TableRow className="bg-slate-50">
                                                    <TableCell colSpan={2} className="py-5 font-bold text-slate-800 text-lg uppercase tracking-tight">Grand Total</TableCell>
                                                    <TableCell className="py-5 text-center font-black text-amber-600 text-lg">{totals.direct}</TableCell>
                                                    <TableCell className="py-5 text-center font-black text-blue-600 text-lg">{totals.order}</TableCell>
                                                    <TableCell className="py-5 text-center font-black text-slate-800 text-lg">{totals.total}</TableCell>
                                                    <TableCell className="py-5 text-center font-black text-emerald-700 text-lg bg-emerald-50">{totals.store}</TableCell>
                                                    <TableCell className="py-5 text-center font-black text-indigo-700 text-lg bg-indigo-50">{totals.kitchen}</TableCell>
                                                    <TableCell className="py-5"></TableCell>
                                                </TableRow>
                                            </>
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={8} align="center" className="py-24">
                                                    <Box className="flex flex-col items-center gap-3">
                                                        <Box className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                                            <FiSearch size={32} />
                                                        </Box>
                                                        <Typography className="text-slate-400 font-medium">No records found for the selected criteria.</Typography>
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
                                                    <Typography className="text-slate-400 font-medium">Click "Run Report" to view acquisition analysis.</Typography>
                                                    <Typography variant="caption" className="text-slate-300 uppercase tracking-widest ">Purchase Origin Analysis Ready</Typography>
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

export default PurchaseOriginReport;
