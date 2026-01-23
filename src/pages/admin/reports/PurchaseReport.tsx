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
import React, { useState, useEffect } from "react";
import { FiDownload, FiSearch, FiRefreshCw, FiPlay } from "react-icons/fi";
import { AdminLayout } from "../../../layouts/AdminLayout";
import { useAppDispatch, useAppSelector } from "../../../redux/store/storeHooks";
import { getVendors, selectVendors } from "../../../redux/slices/vendorSlice";
import { getProducts, selectProducts } from "../../../redux/slices/productSlice";
import { getPurchaseReportThunk, selectPurchaseReport, selectReportLoading } from "../../../redux/slices/reportSlice";
import AdvancedDateRangePicker from "../../../components/common/AdvancedDateRangePicker";
import { exportToExcel, exportToPDF } from "../../../utils/reportExport";
import { selectUsersList } from "../../../redux/slices/authSlice";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import quarterOfYear from "dayjs/plugin/quarterOfYear";

dayjs.extend(isBetween);
dayjs.extend(quarterOfYear);

const PurchaseReport: React.FC = () => {
    const dispatch = useAppDispatch();
    const vendors = useAppSelector(selectVendors);
    const products = useAppSelector(selectProducts);
    const purchaseData = useAppSelector(selectPurchaseReport);
    const loading = useAppSelector(selectReportLoading);

    const { user } = useAppSelector(selectUsersList);
    const [fromDate, setFromDate] = useState(dayjs().startOf('month').format("YYYY-MM-DD"));
    const [toDate, setToDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [vendorId, setVendorId] = useState("all");
    const [productId, setProductId] = useState("all");
    const [dateLabel, setDateLabel] = useState("This Month");
    const [isReportRun, setIsReportRun] = useState(false);

    useEffect(() => {
        dispatch(getVendors({ limit: 1000 }));
        dispatch(getProducts({ limit: 1000 }));
    }, [dispatch]);

    const handleDateRangeChange = (start: string, end: string, label: string) => {
        setFromDate(start);
        setToDate(end);
        setDateLabel(label);
    };

    const handleReset = () => {
        setVendorId("all");
        setProductId("all");
        setDateLabel("This Month");
        setFromDate(dayjs().startOf('month').format("YYYY-MM-DD"));
        setToDate(dayjs().format("YYYY-MM-DD"));
        setIsReportRun(false);
    };

    const handleRunReport = async () => {
        try {
            await dispatch(getPurchaseReportThunk({
                fromDate,
                toDate,
                vendorId,
                productId,
                limit: 1000
            })).unwrap();
            setIsReportRun(true);
            toast.success("Report generated successfully");
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error(String(error) || "Failed to generate report");
            }
        }
    };

    const handleExportExcel = () => {
        if (purchaseData.length === 0) return;

        const selectedVendor = vendors.find(v => v._id === vendorId)?.vendor_name || "All Vendors";
        const selectedProduct = products.find(p => p._id === productId)?.productName || "All Items";

        const metadata = {
            title: "Purchase Report",
            generatedBy: user?.name || user?.email || "Admin",
            dateRange: `${dayjs(fromDate).format("DD MMM YYYY")} to ${dayjs(toDate).format("DD MMM YYYY")}`,
            filters: [
                { label: "Vendor", value: selectedVendor },
                { label: "Product", value: selectedProduct }
            ],
            fileName: "Purchase_Report"
        };

        const headers = ["Date", "Vendor", "Item Name", "Qty Received", "Qty Sent to Store", "Unit Price", "Total Amount"];
        const data = purchaseData.map(row => [
            dayjs(row.createdAt).format("DD MMM YYYY"),
            row.productId?.vendorsId?.vendor_name || "N/A",
            row.productId?.productName || "N/A",
            `${row.rcvdPurchaseQty} ${row.productId?.unit || ""}`,
            `${row.sendToStoreQty} ${row.productId?.unit || ""}`,
            `₹${row.productId?.perUnitRate?.toFixed(2) || "0.00"}`,
            `₹${(row.rcvdPurchaseQty * (row.productId?.perUnitRate || 0)).toFixed(2)}`
        ]);

        exportToExcel(metadata, headers, data);
    };

    const handleExportPDF = () => {
        if (purchaseData.length === 0) return;

        const selectedVendor = vendors.find(v => v._id === vendorId)?.vendor_name || "All Vendors";
        const selectedProduct = products.find(p => p._id === productId)?.productName || "All Items";

        const metadata = {
            title: "Purchase Report",
            generatedBy: user?.name || user?.email || "Admin",
            dateRange: `${dayjs(fromDate).format("DD MMM YYYY")} to ${dayjs(toDate).format("DD MMM YYYY")}`,
            filters: [
                { label: "Vendor", value: selectedVendor },
                { label: "Product", value: selectedProduct }
            ],
            fileName: "Purchase_Report"
        };

        const headers = ["Date", "Vendor", "Item Name", "Qty Rcvd", "Qty Store", "Price", "Total"];
        const data = purchaseData.map(row => [
            dayjs(row.createdAt).format("DD MMM YYYY"),
            row.productId?.vendorsId?.vendor_name || "N/A",
            row.productId?.productName || "N/A",
            row.rcvdPurchaseQty,
            row.sendToStoreQty,
            `INR ${row.productId?.perUnitRate?.toFixed(2) || "0.00"}`,
            `INR ${(row.rcvdPurchaseQty * (row.productId?.perUnitRate || 0)).toFixed(2)}`
        ]);

        exportToPDF(metadata, headers, data);
    };

    return (
        <AdminLayout>
            <Box className="flex-1 flex flex-col overflow-hidden bg-slate-50">
                {/* Header Section */}
                <Box className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-gray-100 bg-white shadow-sm shrink-0">
                    <Box>
                        <Typography variant="h5" className="font-bold text-slate-800 tracking-tight">Purchase Report</Typography>
                        <Typography variant="body2" className="text-slate-500 mt-1">Generated report for the selected criteria and date range.</Typography>
                    </Box>
                    <Box className="flex gap-3">
                        <Button
                            variant="outlined"
                            startIcon={<FiDownload />}
                            onClick={handleExportExcel}
                            disabled={purchaseData.length === 0}
                            className="border-slate-200 text-slate-700 normal-case font-medium hover:bg-slate-50 px-4"
                        >
                            Export Excel
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<FiDownload />}
                            onClick={handleExportPDF}
                            disabled={purchaseData.length === 0}
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
                            <InputLabel>Filter by Vendor</InputLabel>
                            <Select
                                value={vendorId}
                                label="Filter by Vendor"
                                onChange={(e) => setVendorId(e.target.value as string)}
                            >
                                <MenuItem value="all">All Vendors</MenuItem>
                                {vendors.map((v) => (
                                    <MenuItem key={v._id} value={v._id}>{v.vendor_name}</MenuItem>
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
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4">Date</TableCell>
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4">Vendor</TableCell>
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4">Item Name</TableCell>
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4 text-center">Qty Received</TableCell>
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4 text-center">Qty Sent to Store</TableCell>
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4 text-right">Unit Price</TableCell>
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4 text-right">Total Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {isReportRun ? (
                                        purchaseData.length > 0 ? (
                                            purchaseData.map((row) => (
                                                <TableRow key={row._id} hover>
                                                    <TableCell className="py-4">{dayjs(row.createdAt).format("DD MMM YYYY")}</TableCell>
                                                    <TableCell className="py-4">{row.productId?.vendorsId?.vendor_name || "N/A"}</TableCell>
                                                    <TableCell className="py-4 font-medium text-slate-700">{row.productId?.productName}</TableCell>
                                                    <TableCell className="py-4 text-center font-semibold text-indigo-600">{row.rcvdPurchaseQty} {row.productId?.unit}</TableCell>
                                                    <TableCell className="py-4 text-center text-slate-600">{row.sendToStoreQty} {row.productId?.unit}</TableCell>
                                                    <TableCell className="py-4 text-right">₹{row.productId?.perUnitRate?.toFixed(2)}</TableCell>
                                                    <TableCell className="py-4 text-right font-bold text-slate-800">₹{(row.rcvdPurchaseQty * (row.productId?.perUnitRate || 0)).toFixed(2)}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} align="center" className="py-24">
                                                    <Box className="flex flex-col items-center gap-3">
                                                        <Box className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                                            <FiSearch size={32} />
                                                        </Box>
                                                        <Typography className="text-slate-400 font-medium">No purchase records found for the selected criteria.</Typography>
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
                                                    <Typography className="text-slate-400 font-medium">Click "Run Report" to generate purchase data.</Typography>
                                                    <Typography variant="caption" className="text-slate-300 uppercase tracking-widest">Reports Engine Ready</Typography>
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

export default PurchaseReport;
