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
      <Box className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20 shadow-sm">
        <div>
          <Typography variant="h6" className="font-bold text-gray-800">
            {isEdit ? "Edit Product" : "Add New Product"}
          </Typography>
          <Typography variant="caption" className="text-gray-500">
            {isEdit ? "Update inventory details" : "Create a new inventory item"}
          </Typography>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outlined"
            size="small"
            onClick={onAddCategory}
            className="text-xs py-1 px-2 border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            + CATEGORY
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={onAddVendor}
            className="text-xs py-1 px-2 border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            + VENDOR
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={onAddBrand}
            className="text-xs py-1 px-2 border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            + BRAND
          </Button>

          <IconButton onClick={onClose} size="small" className="ml-2 text-gray-400 hover:text-red-500">
            <FiX size={24} />
          </IconButton>
        </div>
      </Box>

      {/* Scrollable Form Content */}
      <Box className="flex-1 overflow-y-auto p-4">
        {/* ✅ Width Increased to 75% & More Compact */}
        <Box className="w-full lg:w-3/4 space-y-4">
          {/* Product Type */}
          <div>
            <Typography variant="caption" className="font-bold text-gray-500 uppercase tracking-wider block mb-1">
              SELECT PRODUCT TYPE <span className="text-red-500">*</span>
            </Typography>

            <Box className="bg-white p-1 rounded-lg inline-flex w-full box-border border border-gray-200 shadow-sm">
              {allowedProductTypes && allowedProductTypes.length > 0 ? (
                allowedProductTypes.map((type) => (
                  <Box
                    key={type}
                    onClick={() => handleProductTypeChange(type)}
                    className={`flex items-center justify-center gap-2 px-8 py-2 rounded-md cursor-pointer transition-all flex-1 ${form.productType === type
                      ? "bg-[#6200ea] text-white shadow-md transform scale-[1.02]"
                      : "text-gray-500 hover:bg-gray-100"
                      }`}
                  >
                    <FiBox size={18} />
                    <span className="font-bold text-xs tracking-wide uppercase">{type}</span>
                  </Box>
                ))
              ) : (
                <>
                  <Box
                    onClick={() => handleProductTypeChange("Inventory Item")}
                    className={`flex items-center justify-center gap-2 px-8 py-2 rounded-md cursor-pointer transition-all flex-1 ${form.productType === "Inventory Item"
                      ? "bg-[#6200ea] text-white shadow-md transform scale-[1.02]"
                      : "text-gray-500 hover:bg-gray-100"
                      }`}
                  >
                    <FiBox size={18} />
                    <span className="font-bold text-xs tracking-wide">INVENTORY ITEM</span>
                  </Box>

                  <Box
                    onClick={() => handleProductTypeChange("Packaging Item")}
                    className={`flex items-center justify-center gap-2 px-8 py-2 rounded-md cursor-pointer transition-all flex-1 ${form.productType === "Packaging Item"
                      ? "bg-[#ef6c00] text-white shadow-md transform scale-[1.02]"
                      : "text-gray-500 hover:bg-gray-100"
                      }`}
                  >
                    <FiPackage size={18} />
                    <span className="font-bold text-xs tracking-wide">PACKAGING ITEM</span>
                  </Box>
                </>
              )}
            </Box>
          </div>

          {/* Common Details - Blue Theme */}
          <Box className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 shadow-sm">
            <Typography variant="caption" className="font-bold text-blue-900 uppercase tracking-wider block mb-3 border-b border-blue-200 pb-2">
              COMMON DETAILS (REQUIRED)
            </Typography>

            <div className="flex flex-col gap-3">
              <TextField
                fullWidth
                size="small"
                label="Product Name *"
                value={form.productName || ""}
                onChange={(e) => handleInputChange("productName", e.target.value)}
                error={Boolean(errors.productName)}
                helperText={errors.productName}
                className="bg-white"
                variant="outlined"
              />

              <TextField
                fullWidth
                size="small"
                label="Product Description"
                value={form.productDescription || ""}
                onChange={(e) => handleInputChange("productDescription", e.target.value)}
                className="bg-white"
                variant="outlined"
                multiline
                minRows={1}
              />

              <Autocomplete
                fullWidth
                freeSolo
                options={categories}
                getOptionLabel={(option) => {
                  if (typeof option === "string") return option;
                  return option.categoryName || "";
                }}
                value={form.categoryId || null}
                onChange={(_, val) => handleInputChange("categoryId", val)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label="Category *"
                    error={Boolean(errors.categoryId)}
                    helperText={errors.categoryId}
                    className="bg-white"
                  />
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                      className="bg-white"
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
                      className="bg-white"
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
                  className="bg-white"
                >
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </TextField>
              </div>
            </div>
          </Box>

          {/* Additional Details - Gray Theme */}
          <Box className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
            <Typography variant="caption" className="font-bold text-gray-700 uppercase tracking-wider block mb-3 border-b border-gray-200 pb-2">
              ADDITIONAL DETAILS (OPTIONAL)
            </Typography>

            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Autocomplete
                  fullWidth
                  freeSolo
                  options={companies}
                  getOptionLabel={(opt) => (typeof opt === "string" ? opt : opt.brandName || "")}
                  value={form.companyId || null}
                  onChange={(_, val) => handleInputChange("companyId", val)}
                  renderInput={(params) => <TextField {...params} size="small" label="Brand" className="bg-white" />}
                />

                <Autocomplete
                  options={vendors}
                  getOptionLabel={(v) => v.vendor_name || ""}
                  value={
                    vendors.find(
                      (v) =>
                        v._id ===
                        (typeof form.vendorsId === "object" ? form.vendorsId?._id : form.vendorsId)
                    ) || null
                  }
                  onChange={(_, val) => handleInputChange("vendorsId", val ? val._id : "")}
                  renderInput={(params) => <TextField {...params} size="small" label="Vendor *" error={Boolean(errors.vendorsId)} helperText={errors.vendorsId} className="bg-white" />}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <TextField
                  fullWidth
                  size="small"
                  label="Quantity"
                  type="number"
                  value={form.quantity ?? ""}
                  onChange={(e) => handleInputChange("quantity", e.target.value)}
                  sx={numberInputStyle}
                  className="bg-white"
                />

                <TextField
                  fullWidth
                  size="small"
                  label="Per Unit Rate"
                  type="number"
                  value={form.perUnitRate ?? ""}
                  onChange={(e) => handleInputChange("perUnitRate", e.target.value)}
                  InputProps={{ startAdornment: <span className="text-gray-400 mr-2">₹</span> }}
                  sx={numberInputStyle}
                  className="bg-white"
                />

                <TextField
                  fullWidth
                  size="small"
                  label="GST %"
                  type="number"
                  value={form.gstPct ?? ""}
                  onChange={(e) => handleInputChange("gstPct", e.target.value)}
                  InputProps={{ endAdornment: <span className="text-gray-400 ml-1">%</span> }}
                  sx={numberInputStyle}
                  className="bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <TextField
                  fullWidth
                  size="small"
                  label="Computed Taxable Value"
                  value={form.taxableValue ?? ""}
                  InputProps={{
                    readOnly: true,
                    startAdornment: <span className="text-gray-400 mr-2">₹</span>,
                  }}
                  helperText="Automatic"
                  className="bg-gray-100"
                />

                <TextField
                  fullWidth
                  size="small"
                  label="Stock Alert Limit"
                  type="number"
                  value={form.stockAlert ?? ""}
                  onChange={(e) => handleInputChange("stockAlert", e.target.value)}
                  sx={numberInputStyle}
                  className="bg-white"
                />
              </div>

              {/* Warranty Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <TextField
                  fullWidth
                  size="small"
                  label="Warranty Start Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={form.warrantyStart || ""}
                  onChange={(e) => handleInputChange("warrantyStart", e.target.value)}
                  className="bg-white"
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Warranty End Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={form.warrantyEnd || ""}
                  onChange={(e) => handleInputChange("warrantyEnd", e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>
          </Box>

          {/* Packaging Specifics - Yellow Theme */}
          {form.productType === "Packaging Item" && (
            <Box className="bg-[#fffde7] p-4 rounded-xl border border-yellow-200 shadow-sm animate-fade-in">
              <Typography className="font-bold text-yellow-900 text-xs uppercase tracking-wider mb-3 border-b border-yellow-200 pb-2">
                PACKAGING SPECIFICS (REQUIRED)
              </Typography>

              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                        className="bg-white"
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
                        className="bg-white"
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
                  className="bg-white"
                >
                  <MenuItem value="Printed">Printed</MenuItem>
                  <MenuItem value="Non Print">Non Print</MenuItem>
                </TextField>
              </div>
            </Box>
          )}

          {/* Product Image */}
          <div>
            <Typography variant="caption" className="font-bold text-gray-500 uppercase tracking-wider block mb-2">
              PRODUCT IMAGE
            </Typography>

            <Box className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-white transition-colors cursor-pointer group">
              <Box className="p-3 bg-blue-50 rounded-full group-hover:scale-110 transition-transform">
                <FiBox className="text-blue-500" size={24} />
              </Box>
              <span className="text-sm font-medium text-gray-600">Click to upload image</span>
              <span className="text-xs text-gray-400">SVG, PNG, JPG (Max 5MB)</span>
            </Box>
          </div>
        </Box>
      </Box>

      {/* Sticky Footer */}
      <Box className="px-6 py-4 border-t border-gray-200 bg-white flex justify-start gap-3 sticky bottom-0 z-20">
        <Button variant="outlined" onClick={onClose} className="px-6 border-gray-300 text-gray-700">
          CANCEL
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSaving}
          className="px-8 bg-blue-600 hover:bg-blue-700 font-bold shadow-sm"
        >
          {isSaving ? "CREATING..." : isEdit ? "UPDATE PRODUCT" : "CREATE PRODUCT"}
        </Button>
      </Box>
    </Box>
  );
};
