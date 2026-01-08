import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Drawer,
    MenuItem,
    TextField,
    Typography,
    Autocomplete
} from "@mui/material";
import { FiBox, FiPackage, FiX } from "react-icons/fi";
import type { ProductInterface } from "../../redux/slices/productSlice";
import { useAppDispatch } from "../../redux/store/storeHooks";
import { addCategory, getCategories } from "../../redux/slices/categorySlice";
import { addCompany, getCompanies } from "../../redux/slices/companySlice";

interface ProductDrawerFormProps {
    open: boolean;
    onClose: () => void;
    isEdit: boolean;
    initialData: Partial<ProductInterface>;
    categories: any[];
    vendors: any[];
    companies: any[];
    productNames: string[]; // For autocomplete
    onSave: (data: ProductInterface) => Promise<void>;
    onAddCategory: () => void;
    onAddVendor: () => void;
    onAddBrand: () => void;
    onFillFromSearch: (product: ProductInterface) => void;
}

const COMMON_PACK_SIZES = [
    "1 Kg", "500 gm", "250 gm", "100 gm",
    "1 Ltr", "500 ml", "250 ml",
    "1 Box", "10x10", "1 Dozen", "1 Pkt"
];

const COMMON_UNITS = [
    "Kg", "Gm", "Ltr", "Ml",
    "Pcs", "Box", "Pkt", "Bag", "Bottle", "Can", "Bunch"
];

const COMMON_COLORS = [
    "Red", "Blue", "Green", "Yellow",
    "Black", "White", "Orange", "Purple",
    "Pink", "Brown", "Grey", "Gold", "Silver", "Transparent"
];

const COMMON_SHAPES = [
    "Round", "Square", "Rectangle", "Oval", "Custom"
];

const numberInputStyle = {
    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
        "-webkit-appearance": "none",
        margin: 0,
    },
    "& input[type=number]": {
        "-moz-appearance": "textfield",
    },
};

export const ProductDrawerForm: React.FC<ProductDrawerFormProps> = ({
    open,
    onClose,
    isEdit,
    initialData,
    categories,
    vendors,
    companies,
    onSave,
    onAddCategory,
    onAddVendor,
    onAddBrand,
}) => {
    const [form, setForm] = useState<Partial<ProductInterface>>(initialData);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSaving, setIsSaving] = useState(false);
    const dispatch = useAppDispatch();

    useEffect(() => {
        setForm({
            ...initialData,
            productType: initialData.productType || "Inventory Item",
            isActive: initialData.isActive ?? true
        });
        setErrors({});
    }, [initialData, open]);

    // Calculations for Taxable Value
    useEffect(() => {
        const rate = Number(form.perUnitRate || 0);
        const gst = Number(form.gstPct || 0);
        const taxable = (rate * gst) / 100;

        // Avoid infinite loop if value hasn't effectively changed
        const newVal = Number((taxable + rate).toFixed(2));
        if (form.taxableValue !== newVal) {
            setForm((prev) => ({ ...prev, taxableValue: newVal }));
        }
    }, [form.perUnitRate, form.gstPct]);

    const handleInputChange = (key: keyof ProductInterface, value: any) => {
        setForm(prev => ({ ...prev, [key]: value }));
        if (errors[key]) {
            setErrors(prev => { const n = { ...prev }; delete n[key as string]; return n; });
        }
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};

        // Product Type (Required)
        if (!form.productType) newErrors.productType = "Product Type is required";

        // Common Fields (Required)
        if (!form.productName) newErrors.productName = "Product Name is required";

        const cat = form.categoryId as any;
        if (!cat || (!cat._id && !cat.categoryName)) newErrors.categoryId = "Category is required";

        if (!form.unit) newErrors.unit = "Unit is required";
        if (!form.packSize) newErrors.packSize = "Pack Size is required";
        // if (form.stockAlert === undefined || form.stockAlert === null || form.stockAlert < 0) {
        //     newErrors.stockAlert = "Reorder Level is required";
        // }

        // Active Status (Required)
        if (form.isActive === undefined) newErrors.isActive = "Active Status is required";

        // Conditional Validation for Packaging Items
        if (form.productType === "Packaging Item") {
            if (!form.shape) newErrors.shape = "Shape is required for Packaging items";
            if (!form.colour) newErrors.colour = "Color is required for Packaging items";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setIsSaving(true);
        try {
            let finalizedForm = { ...form };

            // 1. Handle New Category if needed
            const cat = form.categoryId as any;
            if (cat && !cat._id && cat.categoryName) {
                const res = await dispatch(addCategory({ categoryName: cat.categoryName })).unwrap();
                if (res._id) {
                    finalizedForm.categoryId = { _id: res._id, categoryName: res.categoryName };
                    dispatch(getCategories({ page: 1, limit: 1000 })); // Refresh list
                }
            }

            // 2. Handle New Brand/Company if needed
            const comp = form.companyId as any;
            if (comp && !comp._id && comp.brandName) {
                const res = await dispatch(addCompany({ brandName: comp.brandName })).unwrap();
                if (res._id) {
                    finalizedForm.companyId = { _id: res._id, brandName: res.brandName };
                    dispatch(getCompanies({ page: 1, limit: 1000 })); // Refresh list
                }
            }

            if (finalizedForm.vendorsId && !finalizedForm.vendorsId._id) {
                delete finalizedForm.vendorsId;
            }
            if (finalizedForm.companyId && !finalizedForm.companyId._id) {
                delete finalizedForm.companyId;
            }
            // Also handle categoryId if it's empty (though it should be caught by validate)
            if (finalizedForm.categoryId && !finalizedForm.categoryId._id) {
                delete finalizedForm.categoryId;
            }

            // 4. Save Product
            await onSave(finalizedForm as ProductInterface);
        } catch (error: any) {
            console.error("Error in handleSubmit:", error);
            setErrors(prev => ({ ...prev, submit: error.message || "Failed to save product" }));
        } finally {
            setIsSaving(false);
        }
    };

    const handleProductTypeChange = (type: string) => {
        setForm(prev => ({
            ...prev,
            productType: type,
            // Clear conditional fields if switching to Inventory
            ...(type === "Inventory Item" ? { shape: "", colour: "" } : {})
        }));
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: { xs: '100vw', sm: 600 }, display: 'flex', flexDirection: 'column', height: '100%' }}>

                {/* Header */}
                <Box className="p-6 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                    <Box>
                        <Typography variant="h6" className="font-bold text-slate-800">
                            {isEdit ? "Edit Product" : "Add New Product"}
                        </Typography>
                        <Typography variant="caption" className="text-slate-500">
                            {isEdit ? "Update product details" : "Create a new inventory item"}
                        </Typography>
                    </Box>
                    <Box className="flex gap-2">
                        <Button size="small" variant="outlined" onClick={onAddCategory} className="normal-case border-slate-200 text-slate-600">+ Category</Button>
                        <Button size="small" variant="outlined" onClick={onAddVendor} className="normal-case border-slate-200 text-slate-600">+ Vendor</Button>
                        <Button size="small" variant="outlined" onClick={onAddBrand} className="normal-case border-slate-200 text-slate-600">+ Brand</Button>
                        <Button onClick={onClose} style={{ minWidth: 'auto', padding: 8 }} className="text-slate-400 hover:text-slate-600"><FiX size={24} /></Button>
                    </Box>
                </Box>

                {/* Scrollable Form Content */}
                <Box className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">

                    {/* 1. Product Type - MUST BE FIRST */}
                    <Box className="space-y-2">
                        <Typography variant="subtitle2" className="font-bold text-slate-700 uppercase tracking-wider text-xs">
                            Select Product Type <span className="text-red-500">*</span>
                        </Typography>
                        <Box className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex shadow-inner gap-1">
                            <Button
                                fullWidth
                                variant={form.productType === "Inventory Item" ? "contained" : "text"}
                                onClick={() => handleProductTypeChange("Inventory Item")}
                                className={`normal-case font-bold py-3 transition-all rounded-lg ${form.productType === "Inventory Item"
                                    ? "!bg-indigo-600 !text-white shadow-md"
                                    : "!text-slate-500 hover:!bg-slate-200"
                                    }`}
                                startIcon={<FiBox />}
                            >
                                Inventory Item
                            </Button>
                            <Button
                                fullWidth
                                variant={form.productType === "Packaging Item" ? "contained" : "text"}
                                onClick={() => handleProductTypeChange("Packaging Item")}
                                className={`normal-case font-bold py-3 transition-all rounded-lg ${form.productType === "Packaging Item"
                                    ? "!bg-amber-600 !text-white shadow-md"
                                    : "!text-slate-500 hover:!bg-slate-200"
                                    }`}
                                startIcon={<FiPackage />}
                            >
                                Packaging Item
                            </Button>
                        </Box>
                        {errors.productType && <Typography color="error" variant="caption">{errors.productType}</Typography>}
                    </Box>

                    {/* 2. Common Fields */}
                    <Box className="space-y-4">
                        <Typography variant="subtitle2" className="font-bold text-slate-700 flex items-center m-0 gap-2">
                            COMMON DETAILS (REQUIRED)
                        </Typography>
                        <Box className="grid grid-cols-1 gap-4">
                            <TextField
                                fullWidth size="small" label="Product Name *"
                                value={form.productName || ""}
                                onChange={(e) => handleInputChange('productName', e.target.value)}
                                error={Boolean(errors.productName)}
                                helperText={errors.productName}
                                className="bg-white"
                            />

                            <Autocomplete
                                freeSolo
                                options={categories}
                                getOptionLabel={(option) => {
                                    if (typeof option === 'string') return option;
                                    return option.categoryName || "";
                                }}
                                isOptionEqualToValue={(option, value) => {
                                    if (typeof option === 'string' || typeof value === 'string') return option === value;
                                    return option._id === value?._id;
                                }}
                                value={form.categoryId || null}
                                onChange={(_, newValue) => {
                                    if (typeof newValue === 'string') {
                                        handleInputChange('categoryId', { _id: "", categoryName: newValue });
                                    } else {
                                        handleInputChange('categoryId', newValue || { _id: "", categoryName: "" });
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        size="small"
                                        label="Category *"
                                        error={Boolean(errors.categoryId)}
                                        helperText={errors.categoryId}
                                        className="bg-white"
                                    />
                                )}
                            />

                            <Box className="grid grid-cols-2 gap-4">
                                <Autocomplete
                                    freeSolo
                                    options={COMMON_UNITS}
                                    value={form.unit || ""}
                                    onChange={(_, newValue) => handleInputChange('unit', newValue)}
                                    onInputChange={(_, newInputValue) => handleInputChange('unit', newInputValue)}
                                    renderInput={(params) => (
                                        <TextField {...params} fullWidth size="small" label="Unit *" className="bg-white" error={Boolean(errors.unit)} helperText={errors.unit} />
                                    )}
                                />
                                <Autocomplete
                                    freeSolo
                                    options={COMMON_PACK_SIZES}
                                    value={form.packSize || ""}
                                    onChange={(_, newValue) => handleInputChange('packSize', newValue)}
                                    onInputChange={(_, newInputValue) => handleInputChange('packSize', newInputValue)}
                                    renderInput={(params) => (
                                        <TextField {...params} fullWidth size="small" label="Pack Size *" className="bg-white" error={Boolean(errors.packSize)} helperText={errors.packSize} />
                                    )}
                                />
                            </Box>

                            <Box className="grid grid-cols-2 gap-4">
                                {/* <TextField fullWidth size="small" label="Reorder Level *" type="number"
                                    value={form.stockAlert ?? ""}
                                    onChange={(e) => handleInputChange('stockAlert', e.target.value === '' ? '' : Number(e.target.value))}
                                    error={Boolean(errors.stockAlert)}
                                    helperText={errors.stockAlert}
                                    className="bg-white"
                                    sx={numberInputStyle}
                                /> */}
                                <TextField
                                    select
                                    fullWidth
                                    size="small"
                                    label="Active Status *"
                                    value={form.isActive === undefined ? "true" : String(form.isActive)}
                                    onChange={(e) => handleInputChange('isActive', e.target.value === 'true')}
                                    error={Boolean(errors.isActive)}
                                    className="bg-white"
                                >
                                    <MenuItem value={"true"}>Active</MenuItem>
                                    <MenuItem value={"false"}>Inactive</MenuItem>
                                </TextField>
                            </Box>
                        </Box>
                    </Box>



                    {/* 3. Optional Fields */}
                    <Box className="space-y-4">
                        <Typography variant="subtitle2" className="font-bold text-slate-500 m-0 uppercase tracking-tighter text-xs">
                            Additional Details (Optional)
                        </Typography>
                        <Box className="grid grid-cols-2 gap-4">
                            <Autocomplete
                                freeSolo
                                options={companies}
                                getOptionLabel={(option) => {
                                    if (typeof option === 'string') return option;
                                    return option.brandName || "";
                                }}
                                isOptionEqualToValue={(option, value) => {
                                    if (typeof option === 'string' || typeof value === 'string') return option === value;
                                    return option._id === value?._id;
                                }}
                                value={form.companyId || null}
                                onChange={(_, newValue) => {
                                    if (typeof newValue === 'string') {
                                        handleInputChange('companyId', { _id: "", brandName: newValue });
                                    } else {
                                        handleInputChange('companyId', newValue || { _id: "", brandName: "" });
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} fullWidth size="small" label="Brand" className="bg-white" />
                                )}
                            />

                            <TextField
                                select fullWidth size="small" label="Vendor"
                                value={form.vendorsId && typeof form.vendorsId === 'object' ? form.vendorsId._id : form.vendorsId || ""}
                                onChange={(e) => {
                                    const selected = vendors.find(v => v._id === e.target.value);
                                    handleInputChange('vendorsId', selected || e.target.value);
                                }}
                                className="bg-white"
                                SelectProps={{
                                    MenuProps: {
                                        disableScrollLock: true,
                                        anchorOrigin: { vertical: "bottom", horizontal: "left" },
                                        transformOrigin: { vertical: "top", horizontal: "left" },
                                        PaperProps: { style: { maxHeight: 250 } }
                                    }
                                }}
                            >
                                <MenuItem value=""><em>None</em></MenuItem>
                                {vendors.map((v) => <MenuItem key={v._id} value={v._id}>{v.vendor_name}</MenuItem>)}
                            </TextField>

                            <TextField fullWidth size="small" label="Per Unit Rate" type="number"
                                value={form.perUnitRate ?? ""}
                                onChange={(e) => handleInputChange('perUnitRate', e.target.value === '' ? '' : Number(e.target.value))}
                                className="bg-white"
                                sx={numberInputStyle}
                            />
                            <TextField fullWidth size="small" label="GST %" type="number"
                                value={form.gstPct ?? ""}
                                onChange={(e) => handleInputChange('gstPct', e.target.value === '' ? '' : Number(e.target.value))}
                                className="bg-white"
                                sx={numberInputStyle}
                            />

                            <TextField fullWidth size="small" label="Computed Taxable Value" value={form.taxableValue ?? ""} InputProps={{ readOnly: true }} className="bg-slate-50 col-span-2" helperText="Automatically calculated based on rate and GST" />
                        </Box>
                    </Box>

                    {/* 4. Packaging Specifics (REQUIRED ONLY FOR PACKAGING) */}
                    {form.productType === "Packaging Item" && (
                        <Box className="bg-amber-50 p-4 rounded-xl border border-amber-200 animate-in fade-in slide-in-from-bottom-4">
                            <Typography variant="subtitle2" className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                                PACKAGING SPECIFICS (REQUIRED)
                            </Typography>
                            <Box className="grid grid-cols-2 gap-4">
                                <Autocomplete
                                    freeSolo
                                    options={COMMON_SHAPES}
                                    value={form.shape || ""}
                                    onChange={(_, newValue) => handleInputChange('shape', newValue)}
                                    renderInput={(params) => (
                                        <TextField {...params} fullWidth size="small" label="Shape *" placeholder="Round, Square..." error={Boolean(errors.shape)} helperText={errors.shape} className="bg-white" />
                                    )}
                                />
                                <Autocomplete
                                    freeSolo
                                    options={COMMON_COLORS}
                                    value={form.colour || ""}
                                    onChange={(_, newValue) => handleInputChange('colour', newValue)}
                                    renderInput={(params) => (
                                        <TextField {...params} fullWidth size="small" label="Color *" placeholder="Red, Blue..." error={Boolean(errors.colour)} helperText={errors.colour} className="bg-white" />
                                    )}
                                />
                                <TextField
                                    select
                                    fullWidth
                                    size="small"
                                    label="Print Status"
                                    value={form.printStatus || ""}
                                    onChange={(e) => handleInputChange('printStatus', e.target.value)}
                                    className="bg-white col-span-2"
                                >
                                    <MenuItem value="Printed">Printed</MenuItem>
                                    <MenuItem value="Non Print">Non Print</MenuItem>
                                </TextField>
                            </Box>
                        </Box>
                    )}

                </Box>

                {/* Footer */}
                <Box className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <Button
                        variant="outlined"
                        onClick={onClose}
                        className="normal-case border-slate-200 text-slate-600 hover:bg-slate-50 font-bold px-6 py-2 rounded-lg"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="normal-case bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-2 rounded-lg shadow-lg shadow-indigo-200"
                    >
                        {isSaving ? "Saving..." : (isEdit ? "Update Product" : "Create Product")}
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
};
