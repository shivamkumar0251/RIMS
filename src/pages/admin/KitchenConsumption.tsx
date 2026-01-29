import {
    Box,
    Button,
    CircularProgress,
    InputAdornment,
    MenuItem,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import { FiRefreshCw, FiSave, FiSearch } from "react-icons/fi";
import { AdminLayout } from "../../layouts/AdminLayout";
import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";
import {
    getKitchenStocks,
    selectKitchenStockState,
} from "../../redux/slices/kitchenStockSlice";
import {
    addConsumableStock
} from "../../redux/slices/consumableStockSlice";
import type { ConsumableStockPostData } from "../../redux/slices/consumableStockSlice";

type PurposeType = "Cooking" | "Wastage" | "Staff Meal" | "Testing" | "";

interface ConsumptionItem {
    productId: string;
    productName: string;
    availableQty: number;
    consumedQty: number;
    unit: string;
    purpose: PurposeType;
    remarks: string;
}

const PURPOSE_OPTIONS: PurposeType[] = ["Cooking", "Wastage", "Staff Meal", "Testing"];

const KitchenConsumption: React.FC = () => {
    const dispatch = useAppDispatch();
    const { kitchenStocks, loading, allKitchenStocksData } = useAppSelector(selectKitchenStockState);

    // Filters
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);
    const [isProcessing, setIsProcessing] = useState(false);

    // Consumption items state
    const [consumptionItems, setConsumptionItems] = useState<Record<string, ConsumptionItem>>({});

    // Load Kitchen Stocks
    useEffect(() => {
        dispatch(
            getKitchenStocks({
                page: page + 1,
                limit,
                search,
            })
        );
    }, [dispatch, page, limit, search]);

    // Initialize consumption items when kitchen stocks load
    useEffect(() => {
        const newItems: Record<string, ConsumptionItem> = {};
        // Filter out Packaging Items from Kitchen Consumption list
        const consumableStocks = kitchenStocks.filter(s => s.productId?.productType !== "Packaging Item");

        consumableStocks.forEach((stock) => {
            const pid = stock.productId?._id;
            if (pid && !consumptionItems[pid]) {
                newItems[pid] = {
                    productId: pid,
                    productName: stock.productId?.productName || "",
                    availableQty: stock.closingStock,
                    consumedQty: 0,
                    unit: stock.productId?.unit || "",
                    purpose: "",
                    remarks: "",
                };
            } else if (pid && consumptionItems[pid]) {
                // Update available qty if stock changed
                newItems[pid] = {
                    ...consumptionItems[pid],
                    availableQty: stock.closingStock,
                };
            }
        });
        if (Object.keys(newItems).length > 0) {
            setConsumptionItems((prev) => ({ ...prev, ...newItems }));
        }
    }, [kitchenStocks]);

    const handleConsumedQtyChange = (productId: string, value: number) => {
        setConsumptionItems((prev) => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                consumedQty: Math.max(0, Math.min(value, prev[productId]?.availableQty || 0)),
            },
        }));
    };

    const handlePurposeChange = (productId: string, value: PurposeType) => {
        setConsumptionItems((prev) => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                purpose: value,
            },
        }));
    };

    const handleRemarksChange = (productId: string, value: string) => {
        setConsumptionItems((prev) => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                remarks: value,
            },
        }));
    };

    // Validation helper
    const isItemValid = (item: ConsumptionItem): boolean => {
        if (item.consumedQty <= 0 || item.consumedQty > item.availableQty) {
            return false;
        }
        if (!item.purpose) {
            return false;
        }
        if (item.purpose === "Wastage" && !item.remarks.trim()) {
            return false;
        }
        return true;
    };

    // Get valid items ready for consumption
    const validItemsToConsume = useMemo(() => {
        return Object.values(consumptionItems).filter(
            (item) => item.consumedQty > 0 && isItemValid(item)
        );
    }, [consumptionItems]);

    const handleSubmitConsumption = async () => {
        if (validItemsToConsume.length === 0) {
            toast.error("No valid items to log");
            return;
        }

        setIsProcessing(true);

        try {
            // 1. Add to Consumables (The backend now automatically deducts from Kitchen Stock)
            const consumablePayload: ConsumableStockPostData[] = validItemsToConsume.map((item) => ({
                productId: item.productId,
                transfersToUsage: item.purpose === "Wastage" ? 0 : item.consumedQty,
                transfersToWastage: item.purpose === "Wastage" ? item.consumedQty : 0
            }));

            await dispatch(addConsumableStock(consumablePayload)).unwrap();

            // Log transaction
            const transactionLog = {
                type: "KITCHEN_CONSUMPTION",
                items: validItemsToConsume.map(item => ({
                    productId: item.productId,
                    productName: item.productName,
                    qty: item.consumedQty,
                    purpose: item.purpose,
                    remarks: item.remarks,
                })),
                timestamp: new Date().toISOString(),
            };

            toast.success(`Successfully logged consumption for ${validItemsToConsume.length} item(s)`);

            // Reset consumption items
            setConsumptionItems({});

            // Refresh kitchen stocks
            dispatch(getKitchenStocks({ page: page + 1, limit, search }));

        } catch (error: any) {
            console.error("Error logging consumption:", error);
            toast.error(error.message || "Failed to log consumption. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleResetFilters = () => {
        setSearch("");
        setPage(0);
    };

    return (
        <AdminLayout>
            <Box className="flex-1 flex flex-col overflow-hidden bg-slate-50">
                {/* Filter Bar */}
                <Box className="flex flex-wrap items-center gap-4 p-4 border-b border-gray-100 bg-white shadow-sm shrink-0">
                    <TextField
                        placeholder="Search product..."
                        size="small"
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setSearch(e.target.value);
                            setPage(0);
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <FiSearch className="text-gray-400" />
                                </InputAdornment>
                            ),
                        }}
                        className="w-full sm:w-64"
                    />

                    <Button
                        size="small"
                        variant="text"
                        startIcon={<FiRefreshCw />}
                        onClick={handleResetFilters}
                        className="text-blue-600 normal-case"
                    >
                       REFRESH
                    </Button>

                    <Box className="ml-auto">
                        <Button
                            variant="contained"
                            startIcon={<FiSave />}
                            disabled={validItemsToConsume.length === 0 || isProcessing}
                            onClick={handleSubmitConsumption}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isProcessing ? "Processing..." : `Log Consumption (${validItemsToConsume.length})`}
                        </Button>
                    </Box>
                </Box>

                {/* Table Section */}
                <Box className="flex-1 flex flex-col overflow-hidden p-2 sm:p-3">
                    <Paper className="flex-1 flex flex-col shadow-md rounded-xl overflow-hidden border border-gray-100 bg-white">
                        <TableContainer className="flex-1 overflow-auto">
                            <Table stickyHeader>
                                <TableHead className="bg-gray-50/80 backdrop-blur-md z-10">
                                    <TableRow>
                                        <TableCell className="font-bold bg-inherit">Product</TableCell>
                                        <TableCell className="font-bold text-center bg-inherit">Available Qty</TableCell>
                                        <TableCell className="font-bold text-center bg-inherit">Consumed Qty</TableCell>
                                        <TableCell className="font-bold bg-inherit">Unit</TableCell>
                                        <TableCell className="font-bold bg-inherit">Purpose</TableCell>
                                        <TableCell className="font-bold bg-inherit">Remarks</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" className="py-10">
                                                <CircularProgress size={30} />
                                                <Typography className="mt-2 text-gray-500 text-sm">Loading kitchen stocks...</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : kitchenStocks.filter(s => s.productId?.productType !== "Packaging Item").length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" className="py-10 text-gray-500 text-sm">
                                                No products found in kitchen stock (Packaging items are restricted).
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        kitchenStocks
                                            .filter(s => s.productId?.productType !== "Packaging Item")
                                            .map((stock) => {
                                                const pid = stock.productId?._id;
                                                const item = consumptionItems[pid] || {
                                                    productId: pid || "",
                                                    productName: stock.productId?.productName || "",
                                                    availableQty: stock.closingStock,
                                                    consumedQty: 0,
                                                    unit: stock.productId?.unit || "",
                                                    purpose: "" as PurposeType,
                                                    remarks: "",
                                                };

                                                const hasConsumedQty = item.consumedQty > 0;
                                                const isQtyValid = item.consumedQty > 0 && item.consumedQty <= item.availableQty;
                                                const isPurposeValid = hasConsumedQty ? !!item.purpose : true;
                                                const isRemarksValid = hasConsumedQty && item.purpose === "Wastage" ? !!item.remarks.trim() : true;
                                                const isRowValid = hasConsumedQty && isQtyValid && isPurposeValid && isRemarksValid;

                                                return (
                                                    <TableRow
                                                        key={stock._id}
                                                        hover
                                                        className={hasConsumedQty && !isRowValid ? "bg-red-50" : ""}
                                                    >
                                                        <TableCell>
                                                            <Typography variant="body2" className="font-medium">
                                                                {stock.productId?.productName}
                                                            </Typography>
                                                            <Typography variant="caption" className="text-gray-500">
                                                                {stock.productId?.packSize}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell className="text-center font-bold text-green-600">
                                                            {item.availableQty}
                                                        </TableCell>
                                                        <TableCell>
                                                            <TextField
                                                                size="small"
                                                                type="number"
                                                                value={item.consumedQty || ""}
                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                    handleConsumedQtyChange(pid || "", Number(e.target.value));
                                                                }}
                                                                error={hasConsumedQty && !isQtyValid}
                                                                helperText={hasConsumedQty && !isQtyValid ? "Invalid qty" : ""}
                                                                inputProps={{
                                                                    min: 0,
                                                                    max: item.availableQty,
                                                                }}
                                                                sx={{
                                                                    width: 100,
                                                                    "& .MuiInputBase-input": {
                                                                        textAlign: "center",
                                                                        "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
                                                                            display: "none",
                                                                        },
                                                                        "&": {
                                                                            MozAppearance: "textfield",
                                                                        },
                                                                    },
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-gray-600">{item.unit}</TableCell>
                                                        <TableCell>
                                                            <TextField
                                                                select
                                                                size="small"
                                                                fullWidth
                                                                value={item.purpose}
                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                    handlePurposeChange(pid || "", e.target.value as PurposeType);
                                                                }}
                                                                error={hasConsumedQty && !isPurposeValid}
                                                                helperText={hasConsumedQty && !isPurposeValid ? "Required" : ""}
                                                                sx={{ minWidth: 150 }}
                                                                disabled={!hasConsumedQty}
                                                            >
                                                                <MenuItem value="">
                                                                    <em>Select Purpose</em>
                                                                </MenuItem>
                                                                {PURPOSE_OPTIONS.map((option) => (
                                                                    <MenuItem key={option} value={option}>
                                                                        {option}
                                                                    </MenuItem>
                                                                ))}
                                                            </TextField>
                                                        </TableCell>
                                                        <TableCell>
                                                            <TextField
                                                                size="small"
                                                                fullWidth
                                                                placeholder={item.purpose === "Wastage" ? "Required for wastage" : "Optional remarks..."}
                                                                value={item.remarks}
                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                    handleRemarksChange(pid || "", e.target.value);
                                                                }}
                                                                error={hasConsumedQty && !isRemarksValid}
                                                                helperText={hasConsumedQty && !isRemarksValid ? "Required for Wastage" : ""}
                                                                sx={{ minWidth: 180 }}
                                                                disabled={!hasConsumedQty}
                                                            />
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
                            count={allKitchenStocksData?.pagination.total || 0}
                            page={page}
                            onPageChange={(_: React.MouseEvent<HTMLButtonElement> | null, p: number) => setPage(p)}
                            rowsPerPage={limit}
                            onRowsPerPageChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                                setLimit(parseInt(e.target.value, 10));
                                setPage(0);
                            }}
                            className="border-t bg-gray-50"
                        />
                    </Paper>
                </Box>
            </Box>
        </AdminLayout>
    );
};

export default KitchenConsumption;
