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
    ToggleButton,
    ToggleButtonGroup
} from "@mui/material";
import { FiX, FiPlus, FiSearch } from "react-icons/fi";
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
                    toast.error("Please fill all required fields");
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
            PaperProps={{ sx: { width: { xs: '100vw', sm: 480 }, bgcolor: '#fff' } }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box className="px-4 py-2 border-b flex items-center justify-between bg-white sticky top-0 z-10">
                    <Typography className="font-bold text-slate-800">Direct Purchase</Typography>
                    <IconButton onClick={onClose} size="small"><FiX size={18} /></IconButton>
                </Box>

                <Box className="flex-1 overflow-y-auto p-2 bg-slate-50/20">
                    {/* 1. ENTRY METHOD */}
                    <Box className="mb-3">
                        <Typography className="text-[11px] font-bold text-[#8fa3ba] uppercase mb-1 px-1">1. Entry Method</Typography>
                        <ToggleButtonGroup
                            value={mode}
                            exclusive
                            onChange={(_, v) => v && setMode(v)}
                            fullWidth
                            size="small"
                            className="bg-white"
                            sx={{ '& .MuiToggleButton-root': { py: 0.75, borderRadius: '4px !important', border: '1px solid #e1e8ef !important', '&.Mui-selected': { bgcolor: '#f1f5f9' } } }}
                        >
                            <ToggleButton value="search" className="normal-case font-bold text-[11px]"><FiSearch className="mr-2" /> SEARCH EXISTING</ToggleButton>
                            <ToggleButton value="new" className="normal-case font-bold text-[11px]"><FiPlus className="mr-2" /> CREATE NEW PRODUCT</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    {/* PRODUCT DISCOVERY */}
                    <Box className="p-2 border border-[#eef2f6] rounded-md bg-white mb-3">
                        <Typography className="text-[10px] font-bold text-[#8fa3ba] uppercase mb-2">PRODUCT DISCOVERY</Typography>
                        <Box className="space-y-1.5">
                            {mode === "search" ? (
                                <Autocomplete
                                    options={products || []}
                                    getOptionLabel={(o) => `${o.productName} (${o.companyId?.brandName || 'N/A'})`}
                                    loading={productLoading}
                                    value={selectedProduct}
                                    onChange={(_, v) => setSelectedProduct(v)}
                                    renderInput={(params) => <TextField {...params} label="Product Name *" size="small" variant="outlined" />}
                                />
                            ) : (
                                <>
                                    <TextField label="Product Name *" fullWidth size="small" variant="outlined" value={newProductData.productName} onChange={(e) => setNewProductData(p => ({ ...p, productName: e.target.value }))} />
                                    <Box className="grid grid-cols-2 gap-1.5">
                                        <Autocomplete options={categories} getOptionLabel={(o) => o.categoryName} value={newProductData.categoryId} onChange={(_, v) => setNewProductData(p => ({ ...p, categoryId: v }))} renderInput={(params) => <TextField {...params} label="Category *" size="small" />} />
                                        <Autocomplete options={companies} getOptionLabel={(o) => o.brandName} value={newProductData.companyId} onChange={(_, v) => setNewProductData(p => ({ ...p, companyId: v }))} renderInput={(params) => <TextField {...params} label="Brand" size="small" />} />
                                    </Box>
                                    <Box className="grid grid-cols-12 gap-1.5">
                                        <Box className="col-span-6">
                                            <Autocomplete options={vendors} getOptionLabel={(o) => o.vendor_name} value={newProductData.vendorsId} onChange={(_, v) => setNewProductData(p => ({ ...p, vendorsId: v }))} renderInput={(params) => <TextField {...params} label="Vendor *" size="small" />} />
                                        </Box>
                                        <Box className="col-span-3">
                                            <TextField select label="Unit *" size="small" fullWidth value={newProductData.unit} onChange={(e) => setNewProductData(p => ({ ...p, unit: e.target.value }))}>
                                                {COMMON_UNITS.map(u => <MenuItem key={u} value={u} sx={{ fontSize: '12px' }}>{u}</MenuItem>)}
                                            </TextField>
                                        </Box>
                                        <Box className="col-span-3">
                                            <TextField label="Pack *" size="small" fullWidth value={newProductData.packSize} onChange={(e) => setNewProductData(p => ({ ...p, packSize: e.target.value }))} />
                                        </Box>
                                    </Box>
                                </>
                            )}
                        </Box>
                    </Box>

                    {/* 2. BILLING & QUANTITY */}
                    <Box className="p-2 border border-[#eef2f6] rounded-md bg-white">
                        <Typography className="text-[11px] font-bold text-[#8fa3ba] uppercase mb-2">2. Billing & Quantity</Typography>
                        <Box className="grid grid-cols-3 gap-1.5">
                            <TextField label="Qty *" type="number" size="small" value={rcvdQty || ""} onChange={(e) => setRcvdQty(Number(e.target.value))} />
                            <TextField label="Price *" type="number" size="small" value={price || ""} onChange={(e) => setPrice(Number(e.target.value))} />
                            <TextField label="Tax (%)" type="number" size="small" value={tax || ""} onChange={(e) => setTax(Number(e.target.value))} />
                        </Box>

                        {rcvdQty > 0 && price > 0 && (
                            <Box className="mt-2 pt-2 border-t border-slate-50 flex justify-between items-center px-1">
                                <Box>
                                    <Typography className="text-[10px] text-slate-400 font-bold uppercase">Payable Amount</Typography>
                                    <Typography className="text-xl font-black text-indigo-600">₹{(price * rcvdQty * (1 + tax / 100)).toLocaleString()}</Typography>
                                </Box>
                                <Box className="text-right">
                                    <Typography className="text-[9px] text-slate-400 font-bold">Tax: ₹{(price * rcvdQty * tax / 100).toLocaleString()}</Typography>
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Box>

                <Box className="p-3 border-t flex justify-end items-center gap-6 bg-white">
                    <Button onClick={onClose} className="text-indigo-500 font-bold text-xs p-0 min-w-0 hover:bg-transparent">CANCEL</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={isSaving || (mode === "search" && !selectedProduct) || rcvdQty <= 0}
                        className={`text-[11px] px-4 py-1.5 rounded shadow-none font-bold ${isSaving || (mode === "search" && !selectedProduct) || rcvdQty <= 0 ? 'bg-slate-200 text-slate-400' : 'bg-[#e1e8ef] text-slate-700 hover:bg-slate-300'}`}
                    >
                        {isSaving ? "SAVING..." : mode === "new" ? "CREATE & SAVE PURCHASE" : "ADD PURCHASE"}
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
};
