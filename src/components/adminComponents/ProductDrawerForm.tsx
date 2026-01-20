
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
  Autocomplete,
  IconButton,
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
  productNames: string[];
  onSave: (data: ProductInterface) => Promise<void>;
  onAddCategory: () => void;
  onAddVendor: () => void;
  onAddBrand: () => void;
  onFillFromSearch: (product: ProductInterface) => void;
  allowedProductTypes?: string[];
  title?: string;
}

const COMMON_PACK_SIZES = [
  "1 Kg",
  "500 gm",
  "250 gm",
  "100 gm",
  "1 Ltr",
  "500 ml",
  "250 ml",
  "1 Box",
  "10x10",
  "1 Dozen",
  "1 Pkt",
];

const COMMON_UNITS = [
  "Kg",
  "Gm",
  "Ltr",
  "Ml",
  "Pcs",
  "Box",
  "Pkt",
  "Bag",
  "Bottle",
  "Can",
  "Bunch",
];

const COMMON_COLORS = [
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Black",
  "White",
  "Orange",
  "Purple",
  "Pink",
  "Brown",
  "Grey",
  "Gold",
  "Silver",
  "Transparent",
];

const COMMON_SHAPES = ["Round", "Square", "Rectangle", "Oval", "Custom"];

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
  allowedProductTypes,
  title,
}) => {
  const [form, setForm] = useState<Partial<ProductInterface>>(initialData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const defaultType =
      allowedProductTypes && allowedProductTypes.length > 0
        ? allowedProductTypes[0]
        : "Inventory Item";

    setForm({
      ...initialData,
      productType: initialData.productType || defaultType,
      isActive: initialData.isActive ?? true,
    });

    setErrors({});
  }, [initialData, allowedProductTypes]);

  useEffect(() => {
    const rate = Number(form.perUnitRate || 0);
    const gst = Number(form.gstPct || 0);
    const taxable = (rate * gst) / 100;

    const newVal = Number((taxable + rate).toFixed(2));
    if (form.taxableValue !== newVal) {
      setForm((prev) => ({ ...prev, taxableValue: newVal }));
    }
  }, [form.perUnitRate, form.gstPct]);

  const handleInputChange = (key: keyof ProductInterface, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as string]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[key as string];
        return n;
      });
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!form.productType) newErrors.productType = "Product Type is required";
    if (!form.productName) newErrors.productName = "Product Name is required";

    const cat = form.categoryId as any;
    if (!cat || (!cat._id && !cat.categoryName))
      newErrors.categoryId = "Category is required";

    if (!form.unit) newErrors.unit = "Unit is required";
    if (!form.packSize) newErrors.packSize = "Pack Size is required";
    if (!form.vendorsId) newErrors.vendorsId = "Vendor is required";

    if (form.isActive === undefined)
      newErrors.isActive = "Active Status is required";

    if (form.productType === "Packaging Item") {
      if (!form.shape) newErrors.shape = "Shape is required for Packaging items";
      if (!form.colour)
        newErrors.colour = "Color is required for Packaging items";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      let finalizedForm = { ...form };

      const cat = form.categoryId as any;
      if (cat && !cat._id && cat.categoryName) {
        const res = await dispatch(
          addCategory({ categoryName: cat.categoryName })
        ).unwrap();

        if (res._id) {
          finalizedForm.categoryId = { _id: res._id, categoryName: res.categoryName };
          dispatch(getCategories({ page: 1, limit: 1000 }));
        }
      }

      const comp = form.companyId as any;
      if (comp && !comp._id && comp.brandName) {
        const res = await dispatch(addCompany({ brandName: comp.brandName })).unwrap();

        if (res._id) {
          finalizedForm.companyId = { _id: res._id, brandName: res.brandName };
          dispatch(getCompanies({ page: 1, limit: 1000 }));
        }
      }

      await onSave(finalizedForm as ProductInterface);
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      setErrors((prev) => ({
        ...prev,
        submit: error.message || "Failed to save product",
      }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleProductTypeChange = (type: string) => {
    setForm((prev) => ({
      ...prev,
      productType: type,
      ...(type === "Inventory Item" ? { shape: "", colour: "" } : {}),
    }));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: "#fdfdfd" }}>
      {/* Header */}
      <Box className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20">
        <div>
          <Typography variant="h6" className="font-bold text-gray-900 leading-tight">
            {title || (isEdit ? "Edit Product" : "Add New Product")}
          </Typography>
          <Typography variant="caption" className="text-gray-500 font-medium">
            {isEdit ? "Update product details" : `Create a new ${form.productType || 'item'} efficiently`}
          </Typography>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="text"
            size="small"
            onClick={onAddCategory}
            className="text-[10px] font-bold py-1.5 px-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
          >
            + CATEGORY
          </Button>
          <Button
            variant="text"
            size="small"
            onClick={onAddVendor}
            className="text-[10px] font-bold py-1.5 px-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
          >
            + VENDOR
          </Button>
          <Button
            variant="text"
            size="small"
            onClick={onAddBrand}
            className="text-[10px] font-bold py-1.5 px-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
          >
            + BRAND
          </Button>

          <IconButton onClick={onClose} size="small" className="ml-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <FiX size={22} />
          </IconButton>
        </div>
      </Box>

      {/* Scrollable Form Content */}
      <Box className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar bg-slate-50/30">
        <Box className="w-full space-y-8">
          {/* Product Type Selection */}
          <div>
            <Typography variant="caption" className="font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">
              SELECT PRODUCT TYPE <span className="text-red-500">*</span>
            </Typography>

            <Box className="bg-white p-1.5 rounded-xl inline-flex w-full box-border border border-gray-200 shadow-sm">
              {allowedProductTypes && allowedProductTypes.length > 0 ? (
                allowedProductTypes.map((type) => (
                  <Box
                    key={type}
                    onClick={() => handleProductTypeChange(type)}
                    className={`flex items-center justify-center gap-2 px-8 py-2.5 rounded-lg cursor-pointer transition-all flex-1 ${form.productType === type
                      ? "bg-blue-600 text-white shadow-md active:scale-95"
                      : "text-gray-500 hover:bg-gray-50"
                      }`}
                  >
                    <FiBox size={18} />
                    <span className="font-bold text-[10px] tracking-widest uppercase">{type}</span>
                  </Box>
                ))
              ) : (
                <>
                  <Box
                    onClick={() => handleProductTypeChange("Inventory Item")}
                    className={`flex items-center justify-center gap-2 px-8 py-2.5 rounded-lg cursor-pointer transition-all flex-1 ${form.productType === "Inventory Item"
                      ? "bg-blue-600 text-white shadow-md active:scale-95"
                      : "text-gray-500 hover:bg-gray-50"
                      }`}
                  >
                    <FiBox size={18} />
                    <span className="font-bold text-[10px] tracking-widest">INVENTORY ITEM</span>
                  </Box>

                  <Box
                    onClick={() => handleProductTypeChange("Packaging Item")}
                    className={`flex items-center justify-center gap-2 px-8 py-2.5 rounded-lg cursor-pointer transition-all flex-1 ${form.productType === "Packaging Item"
                      ? "bg-orange-500 text-white shadow-md active:scale-95"
                      : "text-gray-500 hover:bg-gray-50"
                      }`}
                  >
                    <FiPackage size={18} />
                    <span className="font-bold text-[10px] tracking-widest">PACKAGING ITEM</span>
                  </Box>
                </>
              )}
            </Box>
          </div>

          {/* 1. Common Details Card */}
          <Box className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md">
            <Typography variant="subtitle2" className="font-bold text-gray-900 tracking-tight block mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              COMMON DETAILS
            </Typography>

            <div className="flex flex-col gap-6">
              <TextField
                fullWidth
                size="small"
                label="Product Name *"
                value={form.productName || ""}
                onChange={(e) => handleInputChange("productName", e.target.value)}
                error={Boolean(errors.productName)}
                helperText={errors.productName}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
              />

              <TextField
                fullWidth
                size="small"
                label="Product Description"
                value={form.productDescription || ""}
                onChange={(e) => handleInputChange("productDescription", e.target.value)}
                multiline
                minRows={2}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
              />

              <Autocomplete
                fullWidth
                freeSolo
                options={categories}
                getOptionLabel={(option) => (typeof option === "string" ? option : option.categoryName || "")}
                value={form.categoryId || null}
                onChange={(_, val) => handleInputChange("categoryId", val)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label="Category *"
                    error={Boolean(errors.categoryId)}
                    helperText={errors.categoryId}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                  />
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Autocomplete
                  fullWidth
                  freeSolo
                  options={COMMON_UNITS}
                  value={form.unit || ""}
                  onChange={(_, val) => handleInputChange("unit", val)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Unit *"
                      error={Boolean(errors.unit)}
                      helperText={errors.unit}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                    />
                  )}
                />
                <Autocomplete
                  fullWidth
                  freeSolo
                  options={COMMON_PACK_SIZES}
                  value={form.packSize || ""}
                  onChange={(_, val) => handleInputChange("packSize", val)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Pack Size *"
                      error={Boolean(errors.packSize)}
                      helperText={errors.packSize}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                    />
                  )}
                />
              </div>

              <div className="w-full md:w-1/2">
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Active Status *"
                  value={form.isActive === undefined ? "true" : String(form.isActive)}
                  onChange={(e) => handleInputChange("isActive", e.target.value === "true")}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                >
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </TextField>
              </div>
            </div>
          </Box>

          {/* 2. Additional Details Card */}
          <Box className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md">
            <Typography variant="subtitle2" className="font-bold text-gray-900 tracking-tight block mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              ADDITIONAL DETAILS
            </Typography>

            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Autocomplete
                  fullWidth
                  freeSolo
                  options={companies}
                  getOptionLabel={(opt) => (typeof opt === "string" ? opt : opt.brandName || "")}
                  value={form.companyId || null}
                  onChange={(_, val) => handleInputChange("companyId", val)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Brand"
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                    />
                  )}
                />

                <Autocomplete
                  options={vendors}
                  getOptionLabel={(v) => v.vendor_name || ""}
                  value={vendors.find((v) => v._id === (typeof form.vendorsId === "object" ? form.vendorsId?._id : form.vendorsId)) || null}
                  onChange={(_, val) => handleInputChange("vendorsId", val ? val._id : "")}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Vendor *"
                      error={Boolean(errors.vendorsId)}
                      helperText={errors.vendorsId}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TextField
                  fullWidth
                  size="small"
                  label="Quantity"
                  type="number"
                  value={form.quantity ?? ""}
                  onChange={(e) => handleInputChange("quantity", e.target.value)}
                  sx={{ ...numberInputStyle, "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                />

                <TextField
                  fullWidth
                  size="small"
                  label="Per Unit Rate"
                  type="number"
                  value={form.perUnitRate ?? ""}
                  onChange={(e) => handleInputChange("perUnitRate", e.target.value)}
                  InputProps={{ startAdornment: <span className="text-gray-400 mr-2">₹</span> }}
                  sx={{ ...numberInputStyle, "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                />

                <TextField
                  fullWidth
                  size="small"
                  label="GST %"
                  type="number"
                  value={form.gstPct ?? ""}
                  onChange={(e) => handleInputChange("gstPct", e.target.value)}
                  InputProps={{ endAdornment: <span className="text-gray-400 ml-1">%</span> }}
                  sx={{ ...numberInputStyle, "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  fullWidth
                  size="small"
                  label="Computed Taxable Value"
                  value={form.taxableValue ?? ""}
                  InputProps={{
                    readOnly: true,
                    startAdornment: <span className="text-gray-400 mr-2">₹</span>,
                  }}
                  helperText={<span className="text-[10px] text-blue-500 font-medium italic">Calculated automatically</span>}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px", bgcolor: "#f8fafc" } }}
                />

                <TextField
                  fullWidth
                  size="small"
                  label="Stock Alert Limit"
                  type="number"
                  value={form.stockAlert ?? ""}
                  onChange={(e) => handleInputChange("stockAlert", e.target.value)}
                  sx={{ ...numberInputStyle, "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  fullWidth
                  size="small"
                  label="Warranty Start Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={form.warrantyStart || ""}
                  onChange={(e) => handleInputChange("warrantyStart", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Warranty End Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={form.warrantyEnd || ""}
                  onChange={(e) => handleInputChange("warrantyEnd", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  fullWidth
                  size="small"
                  label="Expiry Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={form.expiryDate || ""}
                  onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                />
              </div>
            </div>
          </Box>

          {/* 3. Packaging Specific Card */}
          {form.productType === "Packaging Item" && (
            <Box className="bg-orange-50/50 p-6 rounded-xl border border-orange-100 shadow-sm animate-fade-in">
              <Typography variant="subtitle2" className="font-bold text-orange-900 tracking-tight block mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
                PACKAGING SPECIFICS
              </Typography>

              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Autocomplete
                    freeSolo
                    options={COMMON_SHAPES}
                    value={form.shape || ""}
                    onChange={(_, val) => handleInputChange("shape", val)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Shape *"
                        placeholder="Box, Roll..."
                        error={Boolean(errors.shape)}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px", bgcolor: "#fff" } }}
                      />
                    )}
                  />

                  <Autocomplete
                    freeSolo
                    options={COMMON_COLORS}
                    value={form.colour || ""}
                    onChange={(_, val) => handleInputChange("colour", val)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Color *"
                        placeholder="Brown, White..."
                        error={Boolean(errors.colour)}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px", bgcolor: "#fff" } }}
                      />
                    )}
                  />
                </div>

                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Print Status"
                  value={form.printStatus || ""}
                  onChange={(e) => handleInputChange("printStatus", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px", bgcolor: "#fff" } }}
                >
                  <MenuItem value="Printed">Printed</MenuItem>
                  <MenuItem value="Non Print">Non Print</MenuItem>
                </TextField>
              </div>
            </Box>
          )}

          {/* 4. Product Image Section */}
          {/* <div>
            <Typography variant="caption" className="font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">
              PRODUCT IMAGE
            </Typography>

            <Box className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-white hover:bg-slate-50 transition-all cursor-pointer group hover:border-blue-400">
              <Box className="p-4 bg-blue-50 rounded-full group-hover:scale-110 transition-transform text-blue-600">
                <FiPackage size={28} />
              </Box>
              <div className="text-center">
                <Typography className="text-sm font-bold text-gray-700">Click to upload product image</Typography>
                <Typography variant="caption" className="text-gray-400">Support for SVG, PNG, JPG (Max 5MB)</Typography>
              </div>
            </Box>
          </div> */}
        </Box>
      </Box>

      {/* Sticky Footer */}
      <Box className="px-8 py-5 border-t border-gray-100 bg-white flex justify-end gap-3 sticky bottom-0 z-20">
        <Button
          variant="text"
          onClick={onClose}
          className="px-6 text-gray-500 hover:bg-gray-50 font-bold normal-case"
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSaving}
          className="px-10 bg-blue-600 hover:bg-blue-700 font-bold normal-case shadow-none"
          disableElevation
        >
          {isSaving ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
        </Button>
      </Box>
    </Box>
  );
};
