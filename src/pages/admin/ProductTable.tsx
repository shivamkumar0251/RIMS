import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
import React, { useEffect, useMemo, useState } from "react";
import { FiDownload, FiEdit, FiPlus, FiSearch, FiTrash2, FiUpload } from "react-icons/fi";
import * as XLSX from "xlsx";
import { AdminLayout } from "../../layouts/AdminLayout";

import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";

// Product slice thunks & selectors (from your message)
import type { BulkProductExcelResponse, CategoryRef, GetProductsResponse, ProductInterface } from "../../redux/slices/productSlice";
import {
  addProduct,
  addProductBulkExcel,
  deleteProduct,
  getProducts,
  selectProductState,
  updateProduct,
} from "../../redux/slices/productSlice";

// Category, Company, Vendor slices (selectors & thunks you mentioned)
import { addCategory, getCategories, selectCategories } from "../../redux/slices/categorySlice";
import { addCompany, getCompanies, selectCompanies } from "../../redux/slices/companySlice";
import { addVendor, getVendorNameList, selectVendorNames, type GetVendorData, type VendorFormType } from "../../redux/slices/vendorSlice";

type PartialProductForm = Partial<ProductInterface>;

export default function ProductTable() {
  const dispatch = useAppDispatch();

  // Product state
  const productState = useAppSelector(selectProductState);
  const productsResponse = productState.allProductsData as GetProductsResponse | null;

  // Category / Company / Vendor lists
  const categories = useAppSelector(selectCategories) ?? [];
  const companies = useAppSelector(selectCompanies) ?? [];
  const vendors = useAppSelector(selectVendorNames) ?? [];
  const products = productState?.products;

  // UI state
  const [searchName, setSearchName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(0); // zero-based for TablePagination
  const [rowsPerPage, setRowsPerPage] = useState(10);


  // Drawer form state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductInterface | null>(null);
  const [form, setForm] = useState<PartialProductForm>({
    categoryId: { _id: "", categoryName: '' },
    vendorsId: { _id: "", vendor_name: '' },
    companyId: { _id: "", brandName: '' },
    productName: "",
    packSize: "",
    unit: "",
    quantity: 0,
    shape: "",
    colour: "",
    printStatus: "",
    productImage: "",
    gstPct: 0,
    productMRP: 0,
    taxableValue: 0,
    perUnitRate: 0,
    totalMRP: 0,
    stockAlert: 0,
    createdAt: new Date().toISOString(),
  });

  // loading flags
  const loading = productState.loading;

  // === fetch lookup data on mount ===
  useEffect(() => {
    dispatch(getCategories({ page: 1, limit: 1000 }));
    dispatch(getCompanies({ page: 1, limit: 1000 }));
    dispatch(getVendorNameList());
  }, [dispatch]);

  // === fetch products when filters change ===
  useEffect(() => {
    fetchProducts();
  }, [page, rowsPerPage, searchName, selectedCategory, selectedVendor, selectedCompany, fromDate, toDate]);

  function fetchProducts() {
    dispatch(getProducts({
      search: searchName || undefined,
      page: page + 1,
      limit: rowsPerPage,
      fromDate: fromDate || '',
      toDate: toDate || '',
      category: selectedCategory || '',
      vendor: selectedVendor || '',
      company: selectedCompany || '',
    }));
  }

  // === XLSX Template download ===
  const handleDownloadTemplate = () => {
    const fields = [
      "categoryId",
      "vendorsId",
      "companyId",
      "productName",
      "packSize",
      "unit",
      "quantity",
      "shape",
      "colour",
      "printStatus",
      "productImage",
      "gstPct",
      "productMRP",
      "taxableValue",
      "perUnitRate",
      "totalMRP",
      "stockAlert",
      "createdAt",
    ];

    // empty example row (you can include example values if you wish)
    const sample = [
      Object.fromEntries(fields.map((f) => [f, ""])),
      // two example rows (optional)
      {
        categoryId: "",
        vendorsId: "",
        companyId: "",
        productName: "Sample Product A",
        packSize: "10x10",
        unit: "box",
        quantity: 100,
        shape: "tablet",
        colour: "white",
        printStatus: "Printed",
        productImage: "",
        gstPct: 12,
        productMRP: 150,
        taxableValue: 0,
        perUnitRate: 120,
        totalMRP: 0,
        stockAlert: 5,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ProductsTemplate");
    XLSX.writeFile(wb, "Products_Template.xlsx");
  };

  // === Excel import handler (auto-upload on select) ===
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    // if franchiseId required, append it (you used previously)
    const franchiseId = localStorage.getItem("franchiseId");
    if (franchiseId) formData.append("franchiseId", franchiseId);

    const res = await dispatch(addProductBulkExcel(formData));
    const payload = res?.payload as BulkProductExcelResponse;

    if (payload?.success) {
      alert(`Inserted: ${payload?.insertedCount || 0}`);
      fetchProducts();
      e.currentTarget.value = "";
    } else {
      alert("Bulk upload failed");
      fetchProducts();
      e.currentTarget.value = "";
    }

  };

  // === open drawer to add ===
  const openAddDrawer = () => {
    setEditingProduct(null);
    setForm({
      categoryId: { _id: "", categoryName: '' },
      vendorsId: { _id: "", vendor_name: '' },
      companyId: { _id: "", brandName: '' },
      productName: "",
      packSize: "",
      unit: "",
      quantity: 0,
      shape: "",
      colour: "",
      printStatus: "",
      productImage: "",
      gstPct: 0,
      productMRP: 0,
      taxableValue: 0,
      perUnitRate: 0,
      totalMRP: 0,
      stockAlert: 0,
      createdAt: new Date().toISOString(),
    });
    setDrawerOpen(true);
  };

  // === open drawer to edit (or fill when clicking product from autocomplete) ===
  const openEditDrawer = (p: ProductInterface) => {
    setEditingProduct(p);
    setForm({ ...p });
    setDrawerOpen(true);
  };

  // === Auto-calc taxable and total whenever quantity/perUnitRate/gstPct change ===
  useEffect(() => {
    const q = Number(form.quantity || 0);
    const rate = Number(form.perUnitRate || 0);
    const gst = Number(form.gstPct || 0);

    const taxable = q * rate;
    const total = taxable + (taxable * gst) / 100;

    // Update but don't overwrite user-entered productMRP (we calculate taxableValue & totalMRP)
    setForm((prev) => ({
      ...prev,
      taxableValue: Number((taxable).toFixed(2)),
      totalMRP: Number((total).toFixed(2)),
    }));
  }, [form.quantity, form.perUnitRate, form.gstPct]);

  // === Save product (add or update) ===
  const handleSaveProduct = async () => {
    // validate minimal fields

    if (!form.productName || !form.categoryId || !form.companyId || !form.vendorsId) {
      alert("Please fill Product Name, Category, Vendor and Company");
      return;
    }

    const payload: ProductInterface = {
      // if editingProduct exists, copy _id
      _id: editingProduct?._id || "",
      categoryId: form.categoryId,
      vendorsId: form.vendorsId,
      companyId: form.companyId,
      productName: String(form.productName || ""),
      packSize: String(form.packSize || ""),
      unit: String(form.unit || ""),
      quantity: Number(form.quantity || 0),
      shape: String(form.shape || ""),
      colour: String(form.colour || ""),
      printStatus: String(form.printStatus || ""),
      productImage: form.productImage,
      gstPct: Number(form.gstPct || 0),
      productMRP: Number(form.productMRP || 0),
      taxableValue: Number(form.taxableValue || 0),
      perUnitRate: Number(form.perUnitRate || 0),
      totalMRP: Number(form.totalMRP || 0),
      stockAlert: Number(form.stockAlert || 0),
      createdAt: form.createdAt || new Date().toISOString(),
    };

    if (editingProduct) {
      await dispatch(updateProduct({ productId: editingProduct._id, productData: payload }));
      alert("Updated successfully");
    } else {
      await dispatch(addProduct(payload));
      alert("Added successfully");
    }

    setDrawerOpen(false);
    fetchProducts();
  };

  // === Delete product ===
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await dispatch(deleteProduct(id));
    fetchProducts();
  };

  // === Helpers for dropdown options ===
  const categoryOptions = (categories || []).map((c: CategoryRef) => ({ label: c.categoryName || "", id: c._id }));
  const companyOptions = (companies || []).map((c) => ({ label: c?.brandName || "", id: c._id }));
  const vendorOptions = (vendors || []).map((v) => ({ label: v?.vendor_name || "", id: (v)._id }));

  // Autocomplete product names for quick fill
  const productNames = useMemo(() => (products || []).map((p: ProductInterface) => p.productName), [products]);

  // === Vendor Drawer State ===
  const [vendorDrawerOpen, setVendorDrawerOpen] = useState(false);

  const [vendorForm, setVendorForm] = useState<VendorFormType>({
    vendor_name: "",
    vendor_mobileNo: "",
    vendor_address: "",
    vendor_state: "",
    vendor_country: "",
    vendor_pinCode: "",
    vendor_bankName: "",
    vendor_accountNumber: "",
    vendor_ifscCode: "",
    vendor_paymentTerms: "",
    vendor_preferredPaymentMode: "",
    vendor_creditLimit: 0,
    vendor_outstandingBalance: 0,
    vendor_gstType: "",
    vendor_registrationType: "",
    vendor_gstNumber: "",
    vendor_openingBalance: 0,
  });

  const handleSaveVendor = async () => {
    if (!vendorForm.vendor_name) {
      alert("Vendor name is required");
      return;
    }

    const res = await dispatch(addVendor(vendorForm));
    const payload = res.payload as GetVendorData;

    if (payload?._id) {
      alert("Vendor added");

      // refresh vendor list
      dispatch(getVendorNameList());

      setVendorDrawerOpen(false);

      // reset form
      setVendorForm({
        vendor_name: "",
        vendor_mobileNo: "",
        vendor_address: "",
        vendor_state: "",
        vendor_country: "",
        vendor_pinCode: "",
        vendor_bankName: "",
        vendor_accountNumber: "",
        vendor_ifscCode: "",
        vendor_paymentTerms: "",
        vendor_preferredPaymentMode: "",
        vendor_creditLimit: 0,
        vendor_outstandingBalance: 0,
        vendor_gstType: "",
        vendor_registrationType: "",
        vendor_gstNumber: "",
        vendor_openingBalance: 0,
      });
    } else {
      alert("Failed to add vendor");
    }
  };


  return (
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-xl font-semibold">Products</h2>
        <div className="flex justify-between items-center mb-4">

          <div className="flex gap-2">
            <Button variant="outlined" startIcon={<FiDownload />} onClick={handleDownloadTemplate}>
              <Typography sx={{ fontSize: { xs: "12px", sm: "14px", md: "16px" } }}>
                Template
              </Typography>
            </Button>

            <input
              id="product-excel"
              type="file"
              accept=".xlsx,.xls"
              style={{ display: "none" }}
              onChange={handleExcelUpload}
            />
            <Button variant="outlined" startIcon={<FiUpload />} onClick={() => (document.getElementById("product-excel") as HTMLInputElement).click()}>
              <Typography sx={{ fontSize: { xs: "12px", sm: "14px", md: "16px" } }}>
                Import Excel
              </Typography>
            </Button>

            <Button variant="contained" startIcon={<FiPlus />} onClick={openAddDrawer}>
              <Typography sx={{ fontSize: { xs: "12px", sm: "14px", md: "16px" } }}>
                Add Product
              </Typography>
            </Button>
          </div>
        </div>

        {/* filters row */}
        <Paper className="p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <TextField
              size="small"
              placeholder="Search product by name..."
              value={searchName}
              onChange={(e) => { setSearchName(e.target.value); setPage(0); }}
              InputProps={{ startAdornment: <FiSearch style={{ marginRight: 8 }} /> }}
            />

            <TextField
              select
              size="small"
              value={selectedCategory ?? ""}
              onChange={(e) => { setSelectedCategory(e.target.value || null); setPage(0); }}
              label="Category"
            >
              <MenuItem value="">All</MenuItem>
              {categoryOptions.map((c) => <MenuItem key={c.id} value={c.id}>{c.label}</MenuItem>)}
            </TextField>

            <TextField
              select
              size="small"
              value={selectedVendor ?? ""}
              onChange={(e) => { setSelectedVendor(e.target.value || null); setPage(0); }}
              label="Vendor"
            >
              <MenuItem value="">All</MenuItem>
              {vendorOptions.map((v) => <MenuItem key={v.id} value={v.id}>{v.label}</MenuItem>)}
            </TextField>

            <TextField
              select
              size="small"
              value={selectedCompany ?? ""}
              onChange={(e) => { setSelectedCompany(e.target.value || null); setPage(0); }}
              label="Company"
            >
              <MenuItem value="">All</MenuItem>
              {companyOptions.map((c) => <MenuItem key={c.id} value={c.id}>{c.label}</MenuItem>)}
            </TextField>

            <TextField
              size="small"
              type="date"
              label="From"
              InputLabelProps={{ shrink: true }}
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setPage(0); }}
            />

            <TextField
              size="small"
              type="date"
              label="To"
              InputLabelProps={{ shrink: true }}
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setPage(0); }}
            />
          </div>
        </Paper>

        {/* table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow className="bg-gray-100">
                  <TableCell>Product</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Per Unit</TableCell>
                  <TableCell>Taxable</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Stock Alert</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={11} align="center"><CircularProgress /></TableCell></TableRow>
                ) : (products || []).length === 0 ? (
                  <TableRow><TableCell colSpan={11} align="center">No products</TableCell></TableRow>
                ) : (
                  (products || []).map((p: ProductInterface) => (
                    <TableRow key={p._id}>
                      <TableCell>{p.productName}</TableCell>
                      <TableCell>{typeof p.categoryId === "object" ? (p.categoryId).categoryName : p.categoryId}</TableCell>
                      <TableCell>{typeof p.vendorsId === "object" ? (p.vendorsId).vendor_name : p.vendorsId}</TableCell>
                      <TableCell>{typeof p.companyId === "object" ? (p.companyId).brandName : p.companyId}</TableCell>
                      <TableCell>{p.quantity}</TableCell>
                      <TableCell>{p.perUnitRate}</TableCell>
                      <TableCell>{p.taxableValue}</TableCell>
                      <TableCell>{p.totalMRP}</TableCell>
                      <TableCell>{p.stockAlert}</TableCell>
                      <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <div className="flex gap-2 justify-end">
                          <IconButton onClick={() => openEditDrawer(p)}><FiEdit /></IconButton>
                          <IconButton onClick={() => handleDeleteProduct(p._id)}><FiTrash2 /></IconButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={productsResponse?.total || 0}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          />
        </Paper>

        {/* right drawer form */}
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box sx={{ width: 720, p: 3 }}>
            <div className="flex items-center justify-between mb-4">
              <Typography variant="h6">{editingProduct ? "Edit Product" : "Add Product"}</Typography>
              <div className="flex gap-2">
                {/* quick add category / vendor / company */}
                <Button size="small" onClick={async () => { const name = prompt("New category name"); if (name) { await dispatch(addCategory({ categoryName: name })); dispatch(getCategories({ page: 1, limit: 1000 })); } }}>+ Category</Button>
                <Button size="small" onClick={() => setVendorDrawerOpen(true)}>
                  + Vendor
                </Button>
                <Button size="small" onClick={async () => { const name = prompt("New company brand"); if (name) { await dispatch(addCompany({ brandName: name })); dispatch(getCompanies({ page: 1, limit: 1000 })); } }}>+ Company</Button>
              </div>
            </div>

            <Divider className="mb-4" />

            <div className="space-y-3">
              {/* product name autocomplete (click to populate) */}
              <Autocomplete
                freeSolo
                options={productNames}
                value={form.productName || ""}
                onChange={(_, val) => {
                  // when user picks from options, try find full product and fill form
                  const matched = products.find((x: ProductInterface) => x.productName === val);
                  if (matched) {
                    setForm({ ...matched });
                    setEditingProduct(matched);
                  } else {
                    setForm(prev => ({ ...prev, productName: val as string }));
                  }
                }}
                renderInput={(params) => <TextField {...params} label="Product Name" />}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <TextField
                  label="Product Name"
                  value={form.productName || ""}
                  onChange={(e) => setForm({ ...form, productName: e.target.value })}
                />
                <TextField
                  select
                  label="Category"
                  value={String(form.categoryId || "")}
                  onChange={(e) => setForm({ ...form, categoryId: { _id: e.target.value } })}
                >
                  <MenuItem value="">Select</MenuItem>
                  {categoryOptions.map(c => <MenuItem key={c.id} value={c.id}>{c.label}</MenuItem>)}
                </TextField>

                <TextField
                  select
                  label="Vendor"
                  value={String(form.vendorsId || "")}
                  onChange={(e) => setForm({ ...form, vendorsId: { _id: e.target.value } })}
                >
                  <MenuItem value="">Select</MenuItem>
                  {vendorOptions.map(v => <MenuItem key={v.id} value={v.id}>{v.label}</MenuItem>)}
                </TextField>

                <TextField
                  select
                  label="Company"
                  value={String(form.companyId || "")}
                  onChange={(e) => setForm({ ...form, companyId: { _id: e.target.value } })}
                >
                  <MenuItem value="">Select</MenuItem>
                  {companyOptions.map(c => <MenuItem key={c.id} value={c.id}>{c.label}</MenuItem>)}
                </TextField>

                <TextField
                  label="Pack Size"
                  value={form.packSize || ""}
                  onChange={(e) => setForm({ ...form, packSize: e.target.value })}
                />

                <TextField label="Unit" value={form.unit || ""} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
                <TextField label="Shape" value={form.shape || ""} onChange={(e) => setForm({ ...form, shape: e.target.value })} />
                <TextField label="Colour" value={form.colour || ""} onChange={(e) => setForm({ ...form, colour: e.target.value })} />
                {/* <TextField label="Print Status" value={form.printStatus || ""} onChange={(e) => setForm({ ...form, printStatus: e.target.value })} /> */}
                <FormControl fullWidth>
                  {/* THIS is the label that was missing */}
                  <InputLabel id="print-status-label">Print Status</InputLabel>

                  <Select
                    labelId="print-status-label" // Links the InputLabel to the Select
                    id="print-status-select"
                    value={form.printStatus || ""}
                    label="Print Status" // This prop is needed for the shrinking/floating effect
                    onChange={(e) => setForm({ ...form, printStatus: e.target.value })}
                  >
                    <MenuItem value="Printed">Printed</MenuItem>
                    <MenuItem value="Not Printed">Not Printed</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Quantity"
                  type="number"
                  value={form.quantity ?? 0}
                  onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                />

                <TextField
                  label="Per Unit Rate"
                  type="number"
                  value={form.perUnitRate ?? 0}
                  onChange={(e) => setForm({ ...form, perUnitRate: Number(e.target.value) })}
                />

                <TextField label="GST %" type="number" value={form.gstPct ?? 0} onChange={(e) => setForm({ ...form, gstPct: Number(e.target.value) })} />

                <TextField label="Taxable Value" value={form.taxableValue ?? 0} InputProps={{ readOnly: true }} />
                <TextField label="Total MRP" value={form.totalMRP ?? 0} InputProps={{ readOnly: true }} />

                <TextField label="Product MRP" type="number" value={form.productMRP ?? 0} onChange={(e) => setForm({ ...form, productMRP: Number(e.target.value) })} />
                <TextField label="Stock Alert" type="number" value={form.stockAlert ?? 0} onChange={(e) => setForm({ ...form, stockAlert: Number(e.target.value) })} />

                <TextField label="Per Unit Rate (editable)" type="number" value={form.perUnitRate ?? 0} onChange={(e) => setForm({ ...form, perUnitRate: Number(e.target.value) })} />

                <TextField
                  label="Created At (Post date)"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={form.createdAt ? new Date(form.createdAt).toISOString().slice(0, 10) : ""}
                  onChange={(e) => setForm({ ...form, createdAt: new Date(e.target.value).toISOString() })}
                />
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <Button variant="outlined" onClick={() => setDrawerOpen(false)}>Cancel</Button>
                <Button variant="contained" onClick={handleSaveProduct}>Save</Button>
              </div>
            </div>
          </Box>
        </Drawer>
        {/* ================== VENDOR DRAWER ================== */}
        <Drawer anchor="right" open={vendorDrawerOpen} onClose={() => setVendorDrawerOpen(false)}>
          <Box sx={{ width: 450, p: 3 }}>
            <Typography variant="h6" className="mb-3">Add Vendor</Typography>
            <Divider className="mb-4" />

            <div className="flex flex-col gap-3">

              {/* Vendor Name */}
              <TextField
                fullWidth
                label="Vendor Name"
                value={vendorForm.vendor_name}
                onChange={(e) => setVendorForm({ ...vendorForm, vendor_name: e.target.value })}
              />

              {/* Mobile No */}
              <TextField
                fullWidth
                label="Mobile Number"
                value={vendorForm.vendor_mobileNo}
                onChange={(e) => setVendorForm({ ...vendorForm, vendor_mobileNo: e.target.value })}
              />

              {/* Address */}
              <TextField
                fullWidth
                label="Address"
                value={vendorForm.vendor_address}
                onChange={(e) => setVendorForm({ ...vendorForm, vendor_address: e.target.value })}
              />

              {/* State */}
              <TextField
                fullWidth
                label="State"
                value={vendorForm.vendor_state}
                onChange={(e) => setVendorForm({ ...vendorForm, vendor_state: e.target.value })}
              />

              {/* Country */}
              <TextField
                fullWidth
                label="Country"
                value={vendorForm.vendor_country}
                onChange={(e) => setVendorForm({ ...vendorForm, vendor_country: e.target.value })}
              />

              {/* Pin Code */}
              <TextField
                fullWidth
                label="Pin Code"
                value={vendorForm.vendor_pinCode}
                onChange={(e) => setVendorForm({ ...vendorForm, vendor_pinCode: e.target.value })}
              />

              {/* Bank Name */}
              <TextField
                fullWidth
                label="Bank Name"
                value={vendorForm.vendor_bankName}
                onChange={(e) => setVendorForm({ ...vendorForm, vendor_bankName: e.target.value })}
              />

              {/* Account Number */}
              <TextField
                fullWidth
                label="Account Number"
                value={vendorForm.vendor_accountNumber}
                onChange={(e) => setVendorForm({ ...vendorForm, vendor_accountNumber: e.target.value })}
              />

              {/* IFSC Code */}
              <TextField
                fullWidth
                label="IFSC Code"
                value={vendorForm.vendor_ifscCode}
                onChange={(e) => setVendorForm({ ...vendorForm, vendor_ifscCode: e.target.value })}
              />

              {/* Payment Terms */}
              <FormControl fullWidth>
                <InputLabel>Payment Terms</InputLabel>
                <Select
                  label="Payment Terms"
                  value={vendorForm.vendor_paymentTerms}
                  onChange={(e) =>
                    setVendorForm({ ...vendorForm, vendor_paymentTerms: e.target.value })
                  }
                >
                  {["Net 15", "Net 30", "On Delivery"].map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Preferred Payment Mode */}
              <FormControl fullWidth>
                <InputLabel>Preferred Payment Mode</InputLabel>
                <Select
                  label="Preferred Payment Mode"
                  value={vendorForm.vendor_preferredPaymentMode}
                  onChange={(e) =>
                    setVendorForm({ ...vendorForm, vendor_preferredPaymentMode: e.target.value })
                  }
                >
                  {["Cash", "Bank Transfer", "UPI", "Cheque"].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option.replace("_", " ").toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Credit Limit */}
              <TextField
                fullWidth
                label="Credit Limit"
                type="number"
                value={vendorForm.vendor_creditLimit}
                onChange={(e) => setVendorForm({ ...vendorForm, vendor_creditLimit: Number(e.target.value) })}
              />

              {/* Outstanding Balance */}
              <TextField
                fullWidth
                label="Outstanding Balance"
                type="number"
                value={vendorForm.vendor_outstandingBalance}
                onChange={(e) =>
                  setVendorForm({ ...vendorForm, vendor_outstandingBalance: Number(e.target.value) })
                }
              />

              {/* GST Type */}
              <FormControl fullWidth>
                <InputLabel>GST Type</InputLabel>
                <Select
                  label="GST Type"
                  value={vendorForm.vendor_gstType}
                  onChange={(e) =>
                    setVendorForm({ ...vendorForm, vendor_gstType: e.target.value })
                  }
                >
                  {["Cgst Sgst", "Igst", "Non Gst", "Exempt"].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option.toUpperCase().replace("_", " + ")}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Registration Type */}
              <FormControl fullWidth>
                <InputLabel>Registration Type</InputLabel>
                <Select
                  label="Registration Type"
                  value={vendorForm.vendor_registrationType}
                  onChange={(e) =>
                    setVendorForm({ ...vendorForm, vendor_registrationType: e.target.value })
                  }
                >
                  {["Composition", "Registered", "UnRegistered"].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* GST Number */}
              <TextField
                fullWidth
                label="GST Number"
                value={vendorForm.vendor_gstNumber}
                onChange={(e) => setVendorForm({ ...vendorForm, vendor_gstNumber: e.target.value })}
              />

              {/* Opening Balance */}
              <TextField
                fullWidth
                label="Opening Balance"
                type="number"
                value={vendorForm.vendor_openingBalance}
                onChange={(e) =>
                  setVendorForm({ ...vendorForm, vendor_openingBalance: Number(e.target.value) })
                }
              />

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outlined" onClick={() => setVendorDrawerOpen(false)}>
                  Cancel
                </Button>

                <Button variant="contained" onClick={handleSaveVendor}>
                  Save Vendor
                </Button>
              </div>
            </div>
          </Box>
        </Drawer>


      </div>
    </AdminLayout>
  );
}
