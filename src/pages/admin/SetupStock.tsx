import {
    Box,
    Button,
    Chip,
    CircularProgress,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Paper,
    Popover,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Typography,
    Drawer,
} from "@mui/material";
import React, { useEffect, useState, useMemo } from "react";
import { FiSearch, FiRefreshCw, FiFilter, FiCheck, FiX, FiAlertCircle, FiTrash2, FiTool, FiBox, FiCheckCircle, FiSlash, FiAlertTriangle, FiClock } from "react-icons/fi";
import { AdminLayout } from "../../layouts/AdminLayout";
import { toast } from "react-hot-toast";
import { ExpiryBadge } from "../../components/common/ExpiryBadge";
import AdvancedDateRangePicker from "../../components/common/AdvancedDateRangePicker";
import dayjs from "dayjs";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
} from "@mui/material";

import {
    getSetupStocks,
    selectSetupStockState,
    updateSetupStock,
    addSetupStock,
    getSetupStockLogs
} from "../../redux/slices/setupStockSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";

import { getCategories, selectCategories } from "../../redux/slices/categorySlice";
import { getCompanies, selectCompanies } from "../../redux/slices/companySlice";

const SetupStockComponent: React.FC = () => {
    const dispatch = useAppDispatch();

    const { setupStocks, loading, allSetupStocksData, logs, logsPagination } =
        useAppSelector(selectSetupStockState);

    const categories = useAppSelector(selectCategories);
    const brands = useAppSelector(selectCompanies);

    // ---------------- Filters ----------------
    const [categoryId, setCategoryId] = useState("");
    const [companyId, setCompanyId] = useState("");
    const [search, setSearch] = useState("");
    const [fromDate, setFromDate] = useState(dayjs().startOf('month').format("YYYY-MM-DD"));
    const [toDate, setToDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [dateLabel, setDateLabel] = useState("This Month");

    // ---------------- Pagination ----------------
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);

    // ---------------- Popover States ----------------
    const [catAnchor, setCatAnchor] = useState<null | HTMLElement>(null);
    const [brandAnchor, setBrandAnchor] = useState<null | HTMLElement>(null);

    const [catSearch, setCatSearch] = useState("");
    const [brandSearch, setBrandSearch] = useState("");

    // ---------------- Inline Edit State ----------------
    const [editingState, setEditingState] = useState<{ id: string, type: 'expiry' | 'warranty' } | null>(null);
    const [editDate, setEditDate] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [editingAsset, setEditingAsset] = useState<{ id: string, field: 'condition' | 'assetStatus' } | null>(null);
    const [assetAnchor, setAssetAnchor] = useState<null | HTMLElement>(null);

    // ---------------- Report Issue Modal State ----------------
    const [issueModalOpen, setIssueModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<{ id: string, name: string, stock: number } | null>(null);
    const [issueType, setIssueType] = useState<'damaged' | 'lost'>('damaged');
    const [issueQty, setIssueQty] = useState(1);
    const [issueRemarks, setIssueRemarks] = useState("");

    // ---------------- History Logs State ----------------
    const [historyOpen, setHistoryOpen] = useState(false);

    // ---------------- Load Dropdowns ----------------
    useEffect(() => {
        dispatch(getCategories({ page: 1, limit: 1000 }));
        dispatch(getCompanies({ page: 1, limit: 1000 }));
    }, [dispatch]);

    // ---------------- Load Setup Stocks ----------------
    useEffect(() => {
        dispatch(
            getSetupStocks({
                page: page + 1,
                limit,
                search,
                categoryId,
                companyId,
                fromDate,
                toDate
            })
        );
    }, [dispatch, page, limit, search, categoryId, companyId, fromDate, toDate]);

    // ---------------- Stock Alert ----------------
    const getStockStatus = (qty: number, alert: number) => {
        if (qty === 0) return <Chip label="Out of Stock" color="error" size="small" />;
        if (qty <= alert) return <Chip label="Low Stock" color="warning" size="small" />;
        return <Chip label="In Stock" color="success" size="small" />;
    };

    const handleResetFilters = () => {
        setSearch("");
        setCategoryId("");
        setCompanyId("");
        setDateLabel("This Month");
        setFromDate(dayjs().startOf('month').format("YYYY-MM-DD"));
        setToDate(dayjs().format("YYYY-MM-DD"));
        setPage(0);
    };

    const handleDateRangeChange = (start: string, end: string, label: string) => {
        setFromDate(start);
        setToDate(end);
        setDateLabel(label);
        setPage(0); // Reset page to first one on filter change
    };

    // ---------------- Filter Search Logic ----------------
    const filteredCats = useMemo(() =>
        categories.filter(c => (c.categoryName || "").toLowerCase().includes(catSearch.toLowerCase())),
        [categories, catSearch]
    );

    const filteredBrands = useMemo(() =>
        brands.filter(b => (b.brandName || "").toLowerCase().includes(brandSearch.toLowerCase())),
        [brands, brandSearch]
    );

    // ---------------- UI Helpers ----------------
    const getConditionBadge = (condition: string) => {
        const colors: Record<string, { bg: string, text: string, icon: any }> = {
            'Good': { bg: '#e8f5e9', text: '#2e7d32', icon: <FiCheckCircle size={12} /> },
            'Fair': { bg: '#e3f2fd', text: '#1565c0', icon: <FiBox size={12} /> },
            'Poor': { bg: '#fff3e0', text: '#ef6c00', icon: <FiAlertTriangle size={12} /> },
            'Broken': { bg: '#ffebee', text: '#c62828', icon: <FiSlash size={12} /> },
            'Lost': { bg: '#f3e5f5', text: '#7b1fa2', icon: <FiSearch size={12} /> },
        };
        const config = colors[condition] || colors['Good'];
        return (
            <Box
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider transition-all hover:scale-105"
                style={{ backgroundColor: config.bg, color: config.text, border: `1px solid ${config.text}33` }}
            >
                {config.icon}
                {condition}
            </Box>
        );
    };

    const getStatusBadge = (status: string) => {
        const configs: Record<string, { bg: string, text: string, icon: any }> = {
            'Working': { bg: '#059669', text: '#ffffff', icon: <FiCheckCircle size={12} /> },
            'Under Repair': { bg: '#d97706', text: '#ffffff', icon: <FiTool size={12} /> },
            'Out of Order': { bg: '#dc2626', text: '#ffffff', icon: <FiX size={12} /> },
            'Discarded': { bg: '#4b5563', text: '#ffffff', icon: <FiTrash2 size={12} /> },
        };
        const config = configs[status] || configs['Working'];
        return (
            <Box
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase shadow-sm transition-all hover:brightness-110"
                style={{ backgroundColor: config.bg, color: config.text }}
            >
                {config.icon}
                {status}
            </Box>
        );
    };

    const handleStartEdit = (id: string, currentVal: string, type: 'expiry' | 'warranty') => {
        setEditingState({ id, type });
        setEditDate(currentVal ? dayjs(currentVal).format("YYYY-MM-DD") : "");
    };

    const handleCancelEdit = () => {
        setEditingState(null);
        setEditDate("");
    };

    const handleSaveDate = async () => {
        if (isUpdating || !editingState) return;
        setIsUpdating(true);
        try {
            await dispatch(updateSetupStock({
                setupStockId: editingState.id,
                setupStockData: { [editingState.type === 'expiry' ? 'expiryDate' : 'warrantyDate']: editDate }
            })).unwrap();

            // Force refetch
            dispatch(getSetupStocks({
                page: page + 1,
                limit,
                search,
                categoryId,
                companyId,
                fromDate,
                toDate
            }));

            toast.success(`${editingState.type === 'expiry' ? 'Expiry' : 'Warranty'} date updated successfully`);
            setEditingState(null);
        } catch (err: any) {
            toast.error(err.message || "Failed to update date");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdateAssetField = async (id: string, field: string, value: string) => {
        setIsUpdating(true);
        try {
            await dispatch(updateSetupStock({
                setupStockId: id,
                setupStockData: { [field]: value }
            })).unwrap();
            toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated`);
            setEditingAsset(null);
            setAssetAnchor(null);
        } catch (err: any) {
            toast.error(err.message || "Failed to update");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleReportIssue = async () => {
        if (!selectedItem || issueQty <= 0) return;
        setIsUpdating(true);
        try {
            await dispatch(addSetupStock([{
                productId: selectedItem.id,
                qty: issueQty,
                type: issueType,
                remarks: issueRemarks
            }])).unwrap();

            toast.success(`${issueType.charAt(0).toUpperCase() + issueType.slice(1)} reported successfully`);
            setIssueModalOpen(false);
            setIssueQty(1);
            setIssueRemarks("");

            // Refresh
            dispatch(getSetupStocks({ page: page + 1, limit, search, categoryId, companyId, fromDate, toDate }));
        } catch (err: any) {
            toast.error(err.message || "Failed to report issue");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleOpenHistory = () => {
        setHistoryOpen(true);
        dispatch(getSetupStockLogs({ page: 1, limit: 50 }));
    };

    return (
        <AdminLayout>
            <Box className="flex-1 flex flex-col overflow-hidden bg-slate-50">
                {/* Compact Filter Row */}
                <Box className="flex flex-wrap items-center gap-4 p-4 border-b border-gray-100 bg-white shadow-sm shrink-0">
                    <Typography variant="h6" className="font-bold mr-4">Setup Store Inventory</Typography>
                    <TextField
                        placeholder="Search product..."
                        size="small"
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <FiSearch className="text-gray-400" />
                                </InputAdornment>
                            ),
                        }}
                        className="w-full sm:w-64"
                    />

                    <AdvancedDateRangePicker
                        fromDate={fromDate}
                        toDate={toDate}
                        onRangeChange={handleDateRangeChange}
                        initialLabel={dateLabel}
                    />

                    <Button
                        size="small"
                        variant="text"
                        startIcon={<FiRefreshCw />}
                        onClick={handleResetFilters}
                        className="text-blue-600 normal-case"
                    >
                        Reset
                    </Button>

                    <Box sx={{ flexGrow: 1 }} />

                    <Button
                        size="small"
                        variant="contained"
                        startIcon={<FiClock />}
                        onClick={handleOpenHistory}
                        className="bg-slate-800 hover:bg-slate-900 text-white shadow-md px-4 py-2 rounded-xl text-[12px] font-bold transition-all normal-case"
                    >
                        View History Logs
                    </Button>
                </Box>

                {/* Clean Table */}
                <Box className="flex-1 flex flex-col overflow-hidden p-2 sm:p-3">
                    <Paper className="flex-1 flex flex-col shadow-md rounded-xl overflow-hidden border border-gray-100 bg-white">
                        <TableContainer className="flex-1 overflow-auto">
                            <Table stickyHeader>
                                <TableHead className="bg-gray-50/80 backdrop-blur-md z-10">
                                    <TableRow>
                                        <TableCell className="font-bold bg-inherit">Product</TableCell>
                                        <TableCell className="font-bold bg-inherit">
                                            <Box className="flex items-center gap-2">
                                                Category
                                                <IconButton size="small" onClick={(e) => setCatAnchor(e.currentTarget)}>
                                                    <FiFilter size={14} className={categoryId ? "text-blue-600" : "text-gray-400"} />
                                                </IconButton>
                                            </Box>
                                            <Popover
                                                open={Boolean(catAnchor)}
                                                anchorEl={catAnchor}
                                                onClose={() => setCatAnchor(null)}
                                                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                                PaperProps={{ sx: { minWidth: 240, shadow: 4, borderRadius: 2, overflow: 'hidden', mt: 1 } }}
                                            >
                                                <Box className="p-2 border-b bg-gray-50">
                                                    <TextField
                                                        placeholder="Search Category..."
                                                        size="small"
                                                        fullWidth
                                                        variant="outlined"
                                                        value={catSearch}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCatSearch(e.target.value)}
                                                        InputProps={{
                                                            startAdornment: <FiSearch size={14} className="text-gray-400 mr-2" />,
                                                            sx: { bgcolor: 'white' }
                                                        }}
                                                    />
                                                </Box>
                                                <List sx={{ maxHeight: 300, overflow: 'auto', py: 0 }}>
                                                    <ListItem disablePadding>
                                                        <ListItemButton
                                                            onClick={() => { setCategoryId(""); setCatAnchor(null); }}
                                                            selected={!categoryId}
                                                        >
                                                            <ListItemText primary="All Categories" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                                                        </ListItemButton>
                                                    </ListItem>
                                                    {filteredCats.map((c) => (
                                                        <ListItem key={c._id} disablePadding>
                                                            <ListItemButton
                                                                onClick={() => { setCategoryId(c._id); setCatAnchor(null); }}
                                                                selected={categoryId === c._id}
                                                            >
                                                                <ListItemText primary={c.categoryName} primaryTypographyProps={{ fontSize: '0.875rem' }} />
                                                            </ListItemButton>
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </Popover>
                                        </TableCell>
                                        <TableCell className="font-bold bg-inherit">
                                            <Box className="flex items-center gap-2">
                                                Brand
                                                <IconButton size="small" onClick={(e) => setBrandAnchor(e.currentTarget)}>
                                                    <FiFilter size={14} className={companyId ? "text-blue-600" : "text-gray-400"} />
                                                </IconButton>
                                            </Box>
                                            <Popover
                                                open={Boolean(brandAnchor)}
                                                anchorEl={brandAnchor}
                                                onClose={() => setBrandAnchor(null)}
                                                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                                PaperProps={{ sx: { minWidth: 240, shadow: 4, borderRadius: 2, overflow: 'hidden', mt: 1 } }}
                                            >
                                                <Box className="p-2 border-b bg-gray-50">
                                                    <TextField
                                                        placeholder="Search Brand..."
                                                        size="small"
                                                        fullWidth
                                                        variant="outlined"
                                                        value={brandSearch}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBrandSearch(e.target.value)}
                                                        InputProps={{
                                                            startAdornment: <FiSearch size={14} className="text-gray-400 mr-2" />,
                                                            sx: { bgcolor: 'white' }
                                                        }}
                                                    />
                                                </Box>
                                                <List sx={{ maxHeight: 300, overflow: 'auto', py: 0 }}>
                                                    <ListItem disablePadding>
                                                        <ListItemButton
                                                            onClick={() => { setCompanyId(""); setBrandAnchor(null); }}
                                                            selected={!companyId}
                                                        >
                                                            <ListItemText primary="All Brands" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                                                        </ListItemButton>
                                                    </ListItem>
                                                    {filteredBrands.map((b) => (
                                                        <ListItem key={b._id} disablePadding>
                                                            <ListItemButton
                                                                onClick={() => { setCompanyId(b._id); setBrandAnchor(null); }}
                                                                selected={companyId === b._id}
                                                            >
                                                                <ListItemText primary={b.brandName} primaryTypographyProps={{ fontSize: '0.875rem' }} />
                                                            </ListItemButton>
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </Popover>
                                        </TableCell>
                                        <TableCell className="font-bold">Unit</TableCell>
                                        <TableCell className="font-bold text-center">Qty</TableCell>
                                        <TableCell className="font-bold text-center">Status</TableCell>
                                        <TableCell className="font-bold">Expiry</TableCell>
                                        <TableCell className="font-bold">Warranty</TableCell>
                                        <TableCell className="font-bold">Condition</TableCell>
                                        <TableCell className="font-bold">State</TableCell>
                                        <TableCell className="font-bold text-center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={10} align="center" className="py-10">
                                                <CircularProgress size={30} />
                                                <Typography className="mt-2 text-gray-500 text-sm">Loading stocks...</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : setupStocks.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={10} align="center" className="py-10 text-gray-500 text-sm">
                                                No items found in setup store.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        setupStocks.map((row) => {
                                            return (
                                                <TableRow key={row._id} hover>
                                                    <TableCell>
                                                        <Typography variant="body2" className="font-medium">{row.productId?.productName}</Typography>
                                                        <Typography variant="caption" className="text-gray-500">{row.productId?.packSize}</Typography>
                                                    </TableCell>
                                                    <TableCell className="capitalize text-gray-600">{row.productId?.categoryId?.categoryName || "N/A"}</TableCell>
                                                    <TableCell className="text-gray-600 italic">{row.productId?.companyId?.brandName || "N/A"}</TableCell>
                                                    <TableCell className="text-gray-600">{row.productId?.unit || "N/A"}</TableCell>
                                                    <TableCell className="text-center font-bold text-pink-600">{row.closingStock}</TableCell>
                                                    <TableCell className="text-center">
                                                        {getStockStatus(row.closingStock, row.productId?.stockAlert || 0)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box className="flex items-center gap-2 group/cell min-h-[40px]">
                                                            {editingState?.id === row._id && editingState?.type === 'expiry' ? (
                                                                <Box className="flex items-center gap-1">
                                                                    <TextField
                                                                        type="date"
                                                                        size="small"
                                                                        variant="outlined"
                                                                        value={editDate}
                                                                        onChange={(e) => setEditDate(e.target.value)}
                                                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px', fontSize: '12px' }, width: 130 }}
                                                                    />
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={handleSaveDate}
                                                                        disabled={isUpdating}
                                                                        className="text-green-600 hover:bg-green-50"
                                                                    >
                                                                        <FiCheck size={16} />
                                                                    </IconButton>
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={handleCancelEdit}
                                                                        className="text-red-500 hover:bg-red-50"
                                                                    >
                                                                        <FiX size={16} />
                                                                    </IconButton>
                                                                </Box>
                                                            ) : (
                                                                <Box
                                                                    onClick={() => handleStartEdit(row._id, row.expiryDate || "", 'expiry')}
                                                                    className="flex-1 cursor-pointer hover:bg-slate-50 transition-colors py-1 px-2 rounded-md min-h-[40px] flex flex-col justify-center"
                                                                >
                                                                    <ExpiryBadge expiryDate={row.expiryDate} />
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box className="flex items-center gap-2 group/cell min-h-[40px]">
                                                            {editingState?.id === row._id && editingState?.type === 'warranty' ? (
                                                                <Box className="flex items-center gap-1">
                                                                    <TextField
                                                                        type="date"
                                                                        size="small"
                                                                        variant="outlined"
                                                                        value={editDate}
                                                                        onChange={(e) => setEditDate(e.target.value)}
                                                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px', fontSize: '12px' }, width: 130 }}
                                                                    />
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={handleSaveDate}
                                                                        disabled={isUpdating}
                                                                        className="text-green-600 hover:bg-green-50"
                                                                    >
                                                                        <FiCheck size={16} />
                                                                    </IconButton>
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={handleCancelEdit}
                                                                        className="text-red-500 hover:bg-red-50"
                                                                    >
                                                                        <FiX size={16} />
                                                                    </IconButton>
                                                                </Box>
                                                            ) : (
                                                                <Box
                                                                    onClick={() => handleStartEdit(row._id, row.warrantyDate || "", 'warranty')}
                                                                    className="flex-1 cursor-pointer hover:bg-slate-50 transition-colors py-1 px-2 rounded-md min-h-[40px] flex flex-col justify-center"
                                                                >
                                                                    {row.warrantyDate ? (
                                                                        <Typography variant="caption" className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                                                            Ends: {dayjs(row.warrantyDate).format("DD MMM YYYY")}
                                                                        </Typography>
                                                                    ) : (
                                                                        <Typography variant="caption" className="text-gray-400 italic">None</Typography>
                                                                    )}
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box
                                                            onClick={(e) => {
                                                                setEditingAsset({ id: row._id, field: 'condition' });
                                                                setAssetAnchor(e.currentTarget);
                                                            }}
                                                            className="cursor-pointer inline-block"
                                                        >
                                                            {getConditionBadge(row.condition || "Good")}
                                                        </Box>
                                                        {editingAsset?.id === row._id && editingAsset?.field === 'condition' && (
                                                            <Popover
                                                                open={Boolean(assetAnchor)}
                                                                anchorEl={assetAnchor}
                                                                onClose={() => {
                                                                    setEditingAsset(null);
                                                                    setAssetAnchor(null);
                                                                }}
                                                                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                                                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                                                                PaperProps={{ sx: { p: 1, borderRadius: 3, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' } }}
                                                            >
                                                                <List sx={{ py: 0.5 }}>
                                                                    {['Good', 'Fair', 'Poor', 'Broken', 'Lost'].map(v => {
                                                                        const colors: any = {
                                                                            'Good': { text: '#2e7d32', bg: '#f1f8e9' },
                                                                            'Fair': { text: '#1565c0', bg: '#eef2ff' },
                                                                            'Poor': { text: '#ef6c00', bg: '#fffaf0' },
                                                                            'Broken': { text: '#c62828', bg: '#fef2f2' },
                                                                            'Lost': { text: '#7b1fa2', bg: '#faf5ff' },
                                                                        };
                                                                        const c = colors[v] || { text: 'inherit', bg: 'inherit' };
                                                                        return (
                                                                            <ListItem key={v} disablePadding>
                                                                                <ListItemButton
                                                                                    sx={{
                                                                                        borderRadius: 2,
                                                                                        mb: 0.5,
                                                                                        mx: 0.5,
                                                                                        color: c.text,
                                                                                        '&:hover': { bgcolor: c.bg }
                                                                                    }}
                                                                                    onClick={() => handleUpdateAssetField(row._id, 'condition', v)}
                                                                                >
                                                                                    <ListItemText primary={v} primaryTypographyProps={{ fontSize: '13px', fontWeight: 700 }} />
                                                                                </ListItemButton>
                                                                            </ListItem>
                                                                        );
                                                                    })}
                                                                </List>
                                                            </Popover>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box
                                                            onClick={(e) => {
                                                                setEditingAsset({ id: row._id, field: 'assetStatus' });
                                                                setAssetAnchor(e.currentTarget);
                                                            }}
                                                            className="cursor-pointer inline-block"
                                                        >
                                                            {getStatusBadge(row.assetStatus || "Working")}
                                                        </Box>
                                                        {editingAsset?.id === row._id && editingAsset?.field === 'assetStatus' && (
                                                            <Popover
                                                                open={Boolean(assetAnchor)}
                                                                anchorEl={assetAnchor}
                                                                onClose={() => {
                                                                    setEditingAsset(null);
                                                                    setAssetAnchor(null);
                                                                }}
                                                                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                                                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                                                                PaperProps={{ sx: { p: 1, borderRadius: 3, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' } }}
                                                            >
                                                                <Typography sx={{ px: 2, pt: 1, pb: 0.5, fontSize: '11px', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>Switch State</Typography>
                                                                <List>
                                                                    {['Working', 'Under Repair', 'Out of Order', 'Discarded'].map(v => {
                                                                        const colors: any = {
                                                                            'Working': { text: '#059669', bg: '#ecfdf5' },
                                                                            'Under Repair': { text: '#d97706', bg: '#fffbeb' },
                                                                            'Out of Order': { text: '#dc2626', bg: '#fef2f2' },
                                                                            'Discarded': { text: '#4b5563', bg: '#f3f4f6' },
                                                                        };
                                                                        const c = colors[v] || { text: 'inherit', bg: 'inherit' };
                                                                        return (
                                                                            <ListItem key={v} disablePadding>
                                                                                <ListItemButton
                                                                                    sx={{
                                                                                        borderRadius: 2,
                                                                                        mb: 0.5,
                                                                                        mx: 0.5,
                                                                                        color: c.text,
                                                                                        '&:hover': { bgcolor: c.bg }
                                                                                    }}
                                                                                    onClick={() => handleUpdateAssetField(row._id, 'assetStatus', v)}
                                                                                >
                                                                                    <ListItemText primary={v} primaryTypographyProps={{ fontSize: '13px', fontWeight: 700 }} />
                                                                                </ListItemButton>
                                                                            </ListItem>
                                                                        );
                                                                    })}
                                                                </List>
                                                            </Popover>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <IconButton
                                                            size="small"
                                                            className="bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                                                            onClick={() => {
                                                                setSelectedItem({ id: row.productId?._id, name: row.productId?.productName, stock: row.closingStock });
                                                                setIssueModalOpen(true);
                                                            }}
                                                            title="Report Damage/Loss"
                                                        >
                                                            <FiAlertCircle size={18} />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <TablePagination
                            component="div"
                            count={allSetupStocksData?.pagination.total || 0}
                            page={page}
                            onPageChange={(_: React.MouseEvent<HTMLButtonElement> | null, p: number) => setPage(p)}
                            rowsPerPage={limit}
                            onRowsPerPageChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setLimit(parseInt(e.target.value, 10)); setPage(0); }}
                            className="border-t bg-gray-50"
                        />
                    </Paper>
                </Box>
            </Box>

            {/* Report Issue Modal - Premium Redesign with Dynamic Theme */}
            <Dialog
                open={issueModalOpen}
                onClose={() => setIssueModalOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 4, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }
                }}
            >
                <DialogTitle
                    className={`relative flex flex-col items-center gap-2 pt-8 pb-6 bg-gradient-to-br ${issueType === 'damaged' ? 'from-orange-500 to-rose-600' : 'from-purple-600 to-indigo-700'} text-white overflow-hidden transition-all duration-500`}
                >
                    <Box className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <Box className="w-14 h-14 bg-white/20 backdrop-blur-md flex items-center justify-center rounded-2xl shadow-xl mb-2">
                        {issueType === 'damaged' ? <FiSlash size={32} /> : <FiSearch size={32} />}
                    </Box>
                    <Typography variant="h5" className="font-bold tracking-tight">Report {issueType === 'damaged' ? 'Damage' : 'Loss'}</Typography>
                    <Typography variant="caption" className="opacity-80 font-medium text-center px-4">Identify {issueType} for inventory accuracy and record keeping</Typography>
                </DialogTitle>

                <DialogContent sx={{ mt: 3, pb: 1 }}>
                    <Box className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-6">
                        <Box className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-slate-400">
                            <FiBox size={20} />
                        </Box>
                        <Box>
                            <Typography variant="caption" className="text-slate-400 font-bold block leading-none mb-1 uppercase tracking-tighter">Product Name</Typography>
                            <Typography variant="body1" className="font-bold text-slate-800 leading-none">{selectedItem?.name}</Typography>
                        </Box>
                    </Box>

                    <FormControl fullWidth size="small" className="mb-5">
                        <InputLabel>Issue Category</InputLabel>
                        <Select
                            value={issueType}
                            label="Issue Category"
                            onChange={(e) => setIssueType(e.target.value as any)}
                            sx={{ borderRadius: 3, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' } }}
                        >
                            <MenuItem value="damaged">
                                <Box className="flex items-center gap-2"><FiSlash className="text-red-500" /> <span>Broken / Damaged</span></Box>
                            </MenuItem>
                            <MenuItem value="lost">
                                <Box className="flex items-center gap-2"><FiSearch className="text-purple-500" /> <span>Lost / Missing</span></Box>
                            </MenuItem>
                        </Select>
                    </FormControl>

                    <Box className="flex gap-4 mb-5">
                        <TextField
                            label="Qty Affecting"
                            type="number"
                            fullWidth
                            size="small"
                            value={issueQty}
                            onChange={(e) => setIssueQty(Math.max(1, Math.min(selectedItem?.stock || 0, parseInt(e.target.value) || 0)))}
                            InputProps={{
                                sx: { borderRadius: 3, bgcolor: '#f8fafc' }
                            }}
                            helperText={`Total Available: ${selectedItem?.stock}`}
                        />
                    </Box>

                    <TextField
                        label="Reason / Remarks"
                        multiline
                        rows={3}
                        fullWidth
                        size="small"
                        value={issueRemarks}
                        onChange={(e) => setIssueRemarks(e.target.value)}
                        placeholder="e.g. Broke while handling during service..."
                        InputProps={{
                            sx: { borderRadius: 3 }
                        }}
                    />
                </DialogContent>

                <DialogActions className="p-6 gap-3 pt-2">
                    <Button
                        onClick={() => setIssueModalOpen(false)}
                        className="flex-1 rounded-xl py-2.5 font-bold text-slate-500 hover:bg-slate-100 normal-case"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleReportIssue}
                        variant="contained"
                        className={`flex-1 rounded-xl py-2.5 font-bold shadow-lg ${issueType === 'damaged' ? 'shadow-orange-200' : 'shadow-purple-200'} normal-case transition-all duration-500`}
                        sx={{
                            background: issueType === 'damaged'
                                ? 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'
                                : 'linear-gradient(135deg, #9333ea 0%, #4338ca 100%)',
                            '&:hover': {
                                background: issueType === 'damaged'
                                    ? 'linear-gradient(135deg, #d97706 0%, #dc2626 100%)'
                                    : 'linear-gradient(135deg, #7e22ce 0%, #3730a3 100%)'
                            }
                        }}
                        disabled={isUpdating}
                        startIcon={isUpdating ? <CircularProgress size={16} color="inherit" /> : null}
                    >
                        Report {issueType === 'damaged' ? 'Damage' : 'Loss'} Now
                    </Button>
                </DialogActions>
            </Dialog>

            {/* History Logs Drawer */}
            <Drawer
                anchor="right"
                open={historyOpen}
                onClose={() => setHistoryOpen(false)}
                PaperProps={{
                    sx: { width: { xs: '100vw', sm: '600px' }, p: 0, bgcolor: '#f8fafc' }
                }}
            >
                <Box className="flex flex-col h-full">
                    <Box className="p-6 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm">
                        <Box className="flex items-center gap-3">
                            <Box className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center rounded-xl shadow-lg">
                                <FiClock size={20} />
                            </Box>
                            <Box>
                                <Typography variant="h6" className="font-bold text-slate-800 leading-none mb-1">Stock History Logs</Typography>
                                <Typography variant="caption" className="text-slate-400 font-medium tracking-wide uppercase">Track all reports & transactions</Typography>
                            </Box>
                        </Box>
                        <IconButton onClick={() => setHistoryOpen(false)} className="bg-slate-50 hover:bg-red-50 hover:text-red-500 transition-colors">
                            <FiX />
                        </IconButton>
                    </Box>

                    <Box className="flex-1 overflow-auto p-4">
                        <TableContainer component={Paper} elevation={0} className="border border-slate-100 rounded-2xl overflow-hidden">
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ bgcolor: '#f1f5f9', fontWeight: 800, fontSize: '11px', color: '#475569', py: 2 }}>DATE & TIME</TableCell>
                                        <TableCell sx={{ bgcolor: '#f1f5f9', fontWeight: 800, fontSize: '11px', color: '#475569', py: 2 }}>PRODUCT</TableCell>
                                        <TableCell sx={{ bgcolor: '#f1f5f9', fontWeight: 800, fontSize: '11px', color: '#475569', py: 2 }}>TYPE</TableCell>
                                        <TableCell sx={{ bgcolor: '#f1f5f9', fontWeight: 800, fontSize: '11px', color: '#475569', py: 2 }} align="right">QTY</TableCell>
                                        <TableCell sx={{ bgcolor: '#f1f5f9', fontWeight: 800, fontSize: '11px', color: '#475569', py: 2 }}>REMARKS</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                                <CircularProgress size={24} sx={{ color: '#64748b' }} />
                                                <Typography sx={{ mt: 2, color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>Loading logs...</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : logs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                                <Box className="flex flex-col items-center opacity-40">
                                                    <FiBox size={40} className="mb-2" />
                                                    <Typography sx={{ fontSize: '12px', fontWeight: 600 }}>No history logs found</Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        logs.map((log) => (
                                            <TableRow key={log._id} hover className="transition-all">
                                                <TableCell sx={{ py: 1.5 }}>
                                                    <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>{dayjs(log.createdAt).format('DD MMM, YYYY')}</Typography>
                                                    <Typography sx={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>{dayjs(log.createdAt).format('hh:mm A')}</Typography>
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
                                                    {log.productId?.productName}
                                                </TableCell>
                                                <TableCell>
                                                    <Box
                                                        className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter"
                                                        style={{
                                                            backgroundColor: log.type === 'damaged' ? '#fef2f2' : log.type === 'lost' ? '#faf5ff' : '#ecfdf5',
                                                            color: log.type === 'damaged' ? '#dc2626' : log.type === 'lost' ? '#7b1fa2' : '#059669',
                                                        }}
                                                    >
                                                        {log.type}
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontSize: '13px', fontWeight: 800, color: log.type === 'receipt' ? '#059669' : '#dc2626' }}>
                                                    {log.type === 'receipt' ? '+' : '-'}{log.qty}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '11px', color: '#64748b', maxWidth: 150, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={log.remarks}>
                                                    {log.remarks}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>

                    <Box className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
                        <Typography variant="caption" className="text-slate-400 font-bold">Total Entries: {logsPagination?.total || 0}</Typography>
                        <Box className="flex gap-2">
                            <Button size="small" disabled={!logsPagination?.page || logsPagination.page <= 1} className="text-[11px] font-bold">Prev</Button>
                            <Button size="small" disabled={!logsPagination?.pages || logsPagination.page >= logsPagination.pages} className="text-[11px] font-bold">Next</Button>
                        </Box>
                    </Box>
                </Box>
            </Drawer>
        </AdminLayout>
    );
};

export default SetupStockComponent;
