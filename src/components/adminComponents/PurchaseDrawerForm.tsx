import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Drawer,
    IconButton,
    MenuItem,
    TextField,
    Typography,
    Autocomplete,
    CircularProgress,
    Divider,
    ToggleButton,
    ToggleButtonGroup,
    Paper
} from "@mui/material";
import { FiX, FiShoppingCart, FiPlus, FiSearch, FiPackage, FiInfo, FiCreditCard } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";
import { getProducts, selectProducts, selectProductLoading, addProduct } from "../../redux/slices/productSlice";
import { getCategories, selectCategories } from "../../redux/slices/categorySlice";
import { getCompanies, selectCompanies } from "../../redux/slices/companySlice";
import { getVendorNameList, selectVendorNames } from "../../redux/slices/vendorSlice";
import type { ProductInterface } from "../../redux/slices/productSlice";
import { toast } from "react-hot-toast";

interface PurchaseDrawerFormProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
}

const COMMON_UNITS = ["Kg", "Gm", "Ltr", "Ml", "Pcs", "Box", "Pkt", "Bag", "Bottle", "Can", "Bunch"];

export const PurchaseDrawerForm: React.FC<PurchaseDrawerFormProps> = ({
    open,
    onClose,
    onSave,
}) => {
    const dispatch = useAppDispatch();
    const products = useAppSelector(selectProducts);
    const productLoading = useAppSelector(selectProductLoading);
    const categories = useAppSelector(selectCategories);
    const companies = useAppSelector(selectCompanies);
    const vendors = useAppSelector(selectVendorNames);

    const [mode, setMode] = useState<"search" | "new">("search");
    const [selectedProduct, setSelectedProduct] = useState<ProductInterface | null>(null);

    // New Product Fields
    const [newProductData, setNewProductData] = useState({
        productName: "",
        categoryId: null as any,
        companyId: null as any,
        vendorsId: null as any,
        unit: "",
        packSize: "",
    });

    // Purchase Fields
    const [rcvdQty, setRcvdQty] = useState<number>(0);
    const [price, setPrice] = useState<number>(0);
    const [tax, setTax] = useState<number>(0);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (open) {
            dispatch(getProducts({ page: 1, limit: 1000 }));
            dispatch(getCategories({ page: 1, limit: 1000 }));
            dispatch(getCompanies({ page: 1, limit: 1000 }));
            dispatch(getVendorNameList());
        }
    }, [open, dispatch]);

    useEffect(() => {
        if (!open) {
            setMode("search");
            setSelectedProduct(null);
            setRcvdQty(0);
            setPrice(0);
            setTax(0);
            setNewProductData({
                productName: "",
                categoryId: null,
                companyId: null,
                vendorsId: null,
                unit: "",
                packSize: "",
            });
        }
    }, [open]);

    useEffect(() => {
        if (selectedProduct) {
            setPrice(selectedProduct.perUnitRate || 0);
            setTax(selectedProduct.gstPct || 0);
        }
    }, [selectedProduct]);

    const handleSave = async () => {
        if (rcvdQty <= 0) {
            toast.error("Please enter quantity");
            return;
        }

        setIsSaving(true);
        try {
            let productId = selectedProduct?._id;

            if (mode === "new") {
                if (!newProductData.productName || !newProductData.categoryId || !newProductData.vendorsId || !newProductData.unit) {
                    toast.error("Please fill all required fields (*)");
                    setIsSaving(false);
                    return;
                }

                const productPayload: any = {
                    productName: newProductData.productName,
                    categoryId: { _id: newProductData.categoryId._id },
                    vendorsId: { _id: newProductData.vendorsId._id },
                    unit: newProductData.unit,
                    packSize: newProductData.packSize || "1",
                    productType: "Inventory Item",
                    isActive: true,
                    gstPct: tax,
                    perUnitRate: price,
                    taxableValue: price * (1 + tax / 100)
                };

                if (newProductData.companyId) {
                    productPayload.companyId = { _id: newProductData.companyId._id };
                }

                const createdProduct = await dispatch(addProduct(productPayload)).unwrap();
                productId = createdProduct._id;
            }

            if (!productId) {
                toast.error("Product is required");
                setIsSaving(false);
                return;
            }

            await onSave({
                productId: productId,
                rcvdPurchaseQty: rcvdQty,
                currentPurchaseQty: rcvdQty,
                price: price,
                tax: tax,
                sendToStoreQty: 0
            });
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: { xs: '100vw', sm: 580 },
                    bgcolor: '#f8fafc',
                    boxShadow: '-10px 0 30px rgba(0,0,0,0.05)'
                }
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Header Section */}
                <Box className="px-6 py-5 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                    <Box className="flex items-center gap-4">
                        <Box className="p-2.5 bg-indigo-50 rounded-xl">
                            <FiShoppingCart className="text-indigo-600 text-xl" />
                        </Box>
                        <Box>
                            <Typography variant="h6" className="font-extrabold text-slate-800 leading-none">
                                Direct Purchase
                            </Typography>
                            <Typography variant="caption" className="text-slate-400 font-medium">
                                Manual Inventory Entry
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton
                        onClick={onClose}
                        className="bg-slate-50 hover:bg-slate-100 transition-all rounded-lg"
                        size="small"
                    >
                        <FiX size={20} className="text-slate-600" />
                    </IconButton>
                </Box>

                <Box className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                    {/* Method Selector */}
                    <Box className="space-y-4">
                        <Box className="flex items-center justify-between">
                            <Typography className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <FiInfo size={14} className="text-indigo-500" /> 1. Entry Method
                            </Typography>
                        </Box>
                        <ToggleButtonGroup
                            value={mode}
                            exclusive
                            onChange={(_, v) => v && setMode(v)}
                            fullWidth
                            size="medium"
                            className="bg-slate-100/50 p-1 rounded-2xl border-none"
                        >
                            <ToggleButton
                                value="search"
                                className={`normal-case font-bold py-2.5 rounded-xl border-none transition-all duration-300 flex-1 gap-2 ${mode === 'search' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-500'}`}
                            >
                                <FiSearch size={16} /> Search Existing
                            </ToggleButton>
                            <ToggleButton
                                value="new"
                                className={`normal-case font-bold py-2.5 rounded-xl border-none transition-all duration-300 flex-1 gap-2 ${mode === 'new' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-500'}`}
                            >
                                <FiPlus size={16} /> Create New Product
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    {/* Product Details Section */}
                    {mode === "search" ? (
                        <Paper elevation={0} className="p-5 border border-slate-200/60 rounded-2xl bg-white space-y-5 animate-in fade-in duration-500">
                            <Typography className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Select Product</Typography>
                            <Autocomplete
                                options={products || []}
                                getOptionLabel={(option) => `${option.productName} (${option.companyId?.brandName || 'N/A'}) - ${option.packSize} ${option.unit}`}
                                loading={productLoading}
                                value={selectedProduct}
                                onChange={(_, newValue) => setSelectedProduct(newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Product Name"
                                        placeholder="Start typing to search..."
                                        fullWidth
                                        size="medium"
                                        InputProps={{
                                            ...params.InputProps,
                                            sx: { borderRadius: '12px' }
                                        }}
                                    />
                                )}
                            />
                            {selectedProduct && (
                                <Box className="p-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 grid grid-cols-2 gap-y-3 gap-x-4 text-[13px] text-slate-600">
                                    <Box className="flex flex-col"><span className="text-[10px] text-slate-400 font-bold uppercase">Category</span> {selectedProduct.categoryId?.categoryName}</Box>
                                    <Box className="flex flex-col"><span className="text-[10px] text-slate-400 font-bold uppercase">Brand</span> {selectedProduct.companyId?.brandName || 'N/A'}</Box>
                                    <Box className="flex flex-col"><span className="text-[10px] text-slate-400 font-bold uppercase">Vendor</span> {selectedProduct.vendorsId?.vendor_name || 'N/A'}</Box>
                                    <Box className="flex flex-col"><span className="text-[10px] text-slate-400 font-bold uppercase">Packaging</span> {selectedProduct.packSize} {selectedProduct.unit}</Box>
                                </Box>
                            )}
                        </Paper>
                    ) : (
                        <Paper elevation={0} className="p-6 border border-slate-200/60 rounded-3xl bg-white space-y-6 animate-in slide-in-from-right-10 duration-500 shadow-sm">
                            <Typography className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Product Discovery</Typography>

                            <TextField
                                label="Product Name *"
                                fullWidth
                                variant="outlined"
                                value={newProductData.productName}
                                onChange={(e) => setNewProductData(p => ({ ...p, productName: e.target.value }))}
                                InputProps={{ sx: { borderRadius: '14px', bgcolor: '#fcfdfe' } }}
                            />

                            <Box className="grid grid-cols-2 gap-4">
                                <Autocomplete
                                    options={categories || []}
                                    getOptionLabel={(o) => o.categoryName || ""}
                                    value={newProductData.categoryId}
                                    onChange={(_, v) => setNewProductData(p => ({ ...p, categoryId: v }))}
                                    renderInput={(params) => <TextField {...params} label="Category *" size="small" InputProps={{ ...params.InputProps, sx: { borderRadius: '12px' } }} />}
                                />
                                <Autocomplete
                                    options={companies || []}
                                    getOptionLabel={(o) => o.brandName || ""}
                                    value={newProductData.companyId}
                                    onChange={(_, v) => setNewProductData(p => ({ ...p, companyId: v }))}
                                    renderInput={(params) => <TextField {...params} label="Brand" size="small" InputProps={{ ...params.InputProps, sx: { borderRadius: '12px' } }} />}
                                />
                                <Autocomplete
                                    options={vendors || []}
                                    getOptionLabel={(o) => o.vendor_name || ""}
                                    value={newProductData.vendorsId}
                                    onChange={(_, v) => setNewProductData(p => ({ ...p, vendorsId: v }))}
                                    renderInput={(params) => <TextField {...params} label="Buying From *" size="small" InputProps={{ ...params.InputProps, sx: { borderRadius: '12px' } }} />}
                                />
                                <Box className="flex gap-2">
                                    <TextField
                                        select
                                        label="Unit *"
                                        size="small"
                                        fullWidth
                                        value={newProductData.unit}
                                        onChange={(e) => setNewProductData(p => ({ ...p, unit: e.target.value }))}
                                        InputProps={{ sx: { borderRadius: '12px 0 0 12px' } }}
                                    >
                                        {COMMON_UNITS.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                                    </TextField>
                                    <TextField
                                        label="Pack *"
                                        size="small"
                                        fullWidth
                                        placeholder="e.g. 5"
                                        value={newProductData.packSize}
                                        onChange={(e) => setNewProductData(p => ({ ...p, packSize: e.target.value }))}
                                        InputProps={{ sx: { borderRadius: '0 12px 12px 0' } }}
                                    />
                                </Box>
                            </Box>
                        </Paper>
                    )}

                    {/* Billing Details Section */}
                    <Box className="space-y-4">
                        <Typography className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <FiCreditCard size={14} className="text-indigo-500" /> 2. Billing & Quantity
                        </Typography>

                        <Paper elevation={0} className="p-6 border border-slate-200 shadow-sm rounded-3xl bg-white space-y-6">
                            <Box className="grid grid-cols-3 gap-4">
                                <TextField
                                    label="Received Qty *"
                                    type="number"
                                    fullWidth
                                    variant="filled"
                                    value={rcvdQty || ""}
                                    onChange={(e) => setRcvdQty(Number(e.target.value))}
                                    InputProps={{ disableUnderline: true, sx: { borderRadius: '14px', border: '1px solid #e2e8f0' } }}
                                />
                                <TextField
                                    label="Unit Price *"
                                    type="number"
                                    fullWidth
                                    variant="filled"
                                    value={price || ""}
                                    onChange={(e) => setPrice(Number(e.target.value))}
                                    InputProps={{
                                        disableUnderline: true,
                                        startAdornment: <Typography variant="caption" sx={{ mr: 0.5, fontWeight: 'bold' }}>₹</Typography>,
                                        sx: { borderRadius: '14px', border: '1px solid #e2e8f0' }
                                    }}
                                />
                                <TextField
                                    label="Tax (%)"
                                    type="number"
                                    fullWidth
                                    variant="filled"
                                    value={tax || ""}
                                    onChange={(e) => setTax(Number(e.target.value))}
                                    InputProps={{ disableUnderline: true, sx: { borderRadius: '14px', border: '1px solid #e2e8f0' } }}
                                />
                            </Box>

                            {rcvdQty > 0 && price > 0 && (
                                <Box className="p-5 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl text-white shadow-xl animate-in zoom-in duration-300">
                                    <Box className="space-y-2.5">
                                        <Box className="flex justify-between items-center text-slate-400 text-xs font-semibold">
                                            <span>NET REVENUE (QTY x PRICE)</span>
                                            <span>₹{(price * rcvdQty).toLocaleString()}</span>
                                        </Box>
                                        <Box className="flex justify-between items-center text-slate-400 text-xs font-semibold">
                                            <span>TOTAL TAX ({tax}%)</span>
                                            <span>₹{(price * rcvdQty * tax / 100).toLocaleString()}</span>
                                        </Box>
                                        <Divider className="opacity-10 my-2" />
                                        <Box className="flex justify-between items-end">
                                            <Box>
                                                <Typography className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest italic">Inventory Impact</Typography>
                                                <Typography className="text-2xl font-black leading-tight">₹{(price * rcvdQty * (1 + tax / 100)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
                                            </Box>
                                            <Box className="bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-full text-[10px] font-bold border border-indigo-400/20">
                                                TOTAL PAYABLE
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            )}
                        </Paper>
                    </Box>
                </Box>

                {/* Footer Section */}
                <Box className="p-6 border-t border-slate-200 bg-white flex justify-end gap-4 sticky bottom-0 z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                    <Button
                        variant="text"
                        onClick={onClose}
                        className="normal-case px-6 font-bold text-slate-500 hover:bg-slate-50 rounded-xl"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={isSaving || (mode === "search" && !selectedProduct) || rcvdQty <= 0}
                        className={`normal-case px-10 py-3 font-extrabold text-[15px] rounded-2xl shadow-lg transition-all duration-300 ${mode === 'new' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
                        startIcon={isSaving ? <CircularProgress size={18} color="inherit" /> : mode === 'new' ? <FiPackage /> : <FiPlus />}
                    >
                        {isSaving ? "Processing..." : mode === "new" ? "Create & Save Purchase" : "Complete Purchase"}
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
};
