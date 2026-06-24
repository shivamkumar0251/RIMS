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
    Chip,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { FiDownload, FiSearch, FiRefreshCw, FiPlay } from "react-icons/fi";
import { AdminLayout } from "../../../layouts/AdminLayout";
import { useAppDispatch, useAppSelector } from "../../../redux/store/storeHooks";
import { getSetupStockLogs, selectSetupStockState } from "../../../redux/slices/setupStockSlice";
import { getProducts, selectProducts } from "../../../redux/slices/productSlice";
import AdvancedDateRangePicker from "../../../components/common/AdvancedDateRangePicker";
import { exportToExcel, exportToPDF } from "../../../utils/reportExport";
import { selectUsersList } from "../../../redux/slices/authSlice";
import dayjs from "dayjs";

const SetupInventoryReport: React.FC = () => {
    const dispatch = useAppDispatch();
    const products = useAppSelector(selectProducts);
    const { logs, loading } = useAppSelector(selectSetupStockState);
    const { user } = useAppSelector(selectUsersList);

    const [fromDate, setFromDate] = useState(dayjs().startOf('month').format("YYYY-MM-DD"));
    const [toDate, setToDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [productId, setProductId] = useState("all");
    const [dateLabel, setDateLabel] = useState("This Month");
    const [isReportRun, setIsReportRun] = useState(false);

    useEffect(() => {
        dispatch(getProducts({ limit: 1000 }));
    }, [dispatch]);

    const handleDateRangeChange = (start: string, end: string, label: string) => {
        setFromDate(start);
        setToDate(end);
        setDateLabel(label);
    };

    const handleReset = () => {
        setProductId("all");
        setDateLabel("This Month");
        setFromDate(dayjs().startOf('month').format("YYYY-MM-DD"));
        setToDate(dayjs().format("YYYY-MM-DD"));
        setIsReportRun(false);
    };

    const handleRunReport = () => {
        dispatch(getSetupStockLogs({
            fromDate,
            toDate,
            productId: productId === "all" ? undefined : productId,
            limit: 1000
        }));
        setIsReportRun(true);
    };

    const handleExportExcel = () => {
        if (logs.length === 0) return;

        const selectedProduct = products.find(p => p._id === productId)?.productName || "All Items";

        const metadata = {
            title: "Setup Inventory Damage & Loss Report",
            generatedBy: user?.name || user?.email || "Admin",
            dateRange: `${dayjs(fromDate).format("DD MMM YYYY")} to ${dayjs(toDate).format("DD MMM YYYY")}`,
            filters: [
                { label: "Product", value: selectedProduct }
            ],
            fileName: "Setup_Inventory_Report"
        };

        const headers = ["Date", "Item Name", "Type", "Change Qty", "Prev Stock", "New Stock", "Remarks"];
        const data = logs.map(log => [
            dayjs(log.createdAt).format("DD MMM YYYY hh:mm A"),
            log.productId?.productName || "N/A",
            log.type.toUpperCase(),
            `${log.type === 'receipt' ? '+' : '-'}${log.qty}`,
            log.prevClosing,
            log.newClosing,
            log.remarks
        ]);

        exportToExcel(metadata, headers, data);
    };

    const handleExportPDF = () => {
        if (logs.length === 0) return;

        const selectedProduct = products.find(p => p._id === productId)?.productName || "All Items";

        const metadata = {
            title: "Setup Inventory Damage & Loss Report",
            generatedBy: user?.name || user?.email || "Admin",
            dateRange: `${dayjs(fromDate).format("DD MMM YYYY")} to ${dayjs(toDate).format("DD MMM YYYY")}`,
            filters: [
                { label: "Product", value: selectedProduct }
            ],
            fileName: "Setup_Inventory_Report"
        };

        const headers = ["Date", "Item Name", "Type", "Qty", "Prev", "New", "Remarks"];
        const data = logs.map(log => [
            dayjs(log.createdAt).format("DD MMM YY"),
            log.productId?.productName || "N/A",
            log.type,
            `${log.type === 'receipt' ? '+' : '-'}${log.qty}`,
            log.prevClosing,
            log.newClosing,
            log.remarks
        ]);

        exportToPDF(metadata, headers, data);
    };

    return (
        <AdminLayout>
            <Box className="flex-1 flex flex-col overflow-hidden bg-slate-50">
                {/* Header Section */}
                <Box className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-gray-100 bg-white shadow-sm shrink-0">
                    <Box>
                        <Typography variant="h5" className="font-bold text-slate-800 tracking-tight">Setup Inventory Report</Typography>
                        <Typography variant="body2" className="text-slate-500 mt-1">Transaction logs for setup store items including damage, loss, and replenishment.</Typography>
                    </Box>
                    <Box className="flex gap-3">
                        <Button
                            variant="outlined"
                            startIcon={<FiDownload />}
                            onClick={handleExportExcel}
                            disabled={logs.length === 0}
                            className="border-slate-200 text-slate-700 normal-case font-medium hover:bg-slate-50 px-4"
                        >
                            Export Excel
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<FiDownload />}
                            onClick={handleExportPDF}
                            disabled={logs.length === 0}
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

                        <FormControl size="small" className="w-full sm:w-64">
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
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4">Date & Time</TableCell>
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4">Item Name</TableCell>
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4 text-center">Type</TableCell>
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4 text-center">Qty</TableCell>
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4 text-center">Prev Stock</TableCell>
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4 text-center">New Stock</TableCell>
                                        <TableCell className="font-bold bg-slate-50 text-slate-700 py-4">Remarks</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {isReportRun ? (
                                        logs.length > 0 ? (
                                            logs.map((log) => (
                                                <TableRow key={log._id} hover>
                                                    <TableCell className="py-4">
                                                        <Box className="flex flex-col">
                                                            <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>{dayjs(log.createdAt).format('DD MMM, YYYY')}</Typography>
                                                            <Typography sx={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>{dayjs(log.createdAt).format('hh:mm A')}</Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell className="py-4 font-medium text-slate-800">{log.productId?.productName || "N/A"}</TableCell>
                                                    <TableCell className="py-4 text-center">
                                                        <Chip
                                                            label={log.type}
                                                            size="small"
                                                            sx={{
                                                                fontWeight: 800,
                                                                textTransform: 'uppercase',
                                                                fontSize: '10px',
                                                                bgcolor: log.type === 'damaged' ? '#fef2f2' : log.type === 'lost' ? '#faf5ff' : '#ecfdf5',
                                                                color: log.type === 'damaged' ? '#dc2626' : log.type === 'lost' ? '#7b1fa2' : '#059669',
                                                                border: '1px solid currentColor'
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell className={`py-4 text-center font-bold ${log.type === 'receipt' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                        {log.type === 'receipt' ? '+' : '-'}{log.qty}
                                                    </TableCell>
                                                    <TableCell className="py-4 text-center text-slate-500 font-medium">{log.prevClosing}</TableCell>
                                                    <TableCell className="py-4 text-center text-slate-800 font-bold">{log.newClosing}</TableCell>
                                                    <TableCell className="py-4 text-slate-600 max-w-[200px] truncate" title={log.remarks}>{log.remarks}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} align="center" className="py-24">
                                                    <Box className="flex flex-col items-center gap-3">
                                                        <Box className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                                            <FiSearch size={32} />
                                                        </Box>
                                                        <Typography className="text-slate-400 font-medium">No inventory logs found for the selected criteria.</Typography>
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
                                                    <Typography className="text-slate-400 font-medium">Click "Run Report" to view inventory history.</Typography>
                                                    <Typography variant="caption" className="text-slate-300 uppercase tracking-widest ">Inventory Transaction History Ready</Typography>
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

export default SetupInventoryReport;
