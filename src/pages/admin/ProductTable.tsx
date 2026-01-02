import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  Popover,
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
import { FiDownload, FiEdit, FiPlus, FiSearch, FiTrash2, FiUpload, FiRefreshCw, FiFilter } from "react-icons/fi";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { AdminLayout } from "../../layouts/AdminLayout";

import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";

// Product slice thunks & selectors
import type { BulkProductExcelResponse, GetProductsResponse, ProductInterface } from "../../redux/slices/productSlice";
import {
  addProduct,
  addProductBulkExcel,
  deleteProduct,
  getProducts,
  selectProductState,
  updateProduct,
} from "../../redux/slices/productSlice";

// Category, Company, Vendor slices
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
  const [categoryId, setCategoryId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(0); 
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Popover States
  const [catAnchor, setCatAnchor] = useState<null | HTMLElement>(null);
  const [companyAnchor, setCompanyAnchor] = useState<null | HTMLElement>(null);
  const [vendorAnchor, setVendorAnchor] = useState<null | HTMLElement>(null);
  
  const [catSearch, setCatSearch] = useState("");
  const [companySearch, setCompanySearch] = useState("");
  const [vendorSearch, setVendorSearch] = useState("");

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
    productType: "",
    shape: "",
    colour: "",
    printStatus: "",
    productImage: "",
    gstPct: 0,
    taxableValue: 0,
    perUnitRate: 0,
    stockAlert: 0,
    createdAt: new Date().toISOString(),
  });

  const loading = productState.loading;

  // === fetch lookup data on mount ===
  useEffect(() => {
    dispatch(getCategories({ page: 1, limit: 1000 }));
    dispatch(getCompanies({ page: 1, limit: 1000 }));
    dispatch(getVendorNameList());
  }, [dispatch]);

  // === fetch products when filters change ===
  useEffect(() => {
    dispatch(getProducts({
      search: searchName || undefined,
      page: page + 1,
      limit: rowsPerPage,
      fromDate: fromDate || '',
      toDate: toDate || '',
      category: categoryId || '',
      vendor: vendorId || '',
      company: companyId || '',
    }));
  }, [dispatch, page, rowsPerPage, searchName, categoryId, vendorId, companyId, fromDate, toDate]);

  const handleDownloadTemplate = () => {
    const sample = [
      {
        CategoryName: "",
        VendorsName: "",
        CompanyName: "",
        ProductName: "Sample Product A",
        PackSize: "10x10",
        Unit: "box",
        Shape: "tablet",
        Colour: "white",
        PrintStatus: "Printed",
        ProductImage: "",
        GstPercentage: 12,
        TaxableValue: 0,
        PerUnitRate: 120,
        StockAlert: 5,
      },
    ];
    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ProductsTemplate");
    XLSX.writeFile(wb, "Products_Template.xlsx");
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    const franchiseId = localStorage.getItem("franchiseId");
    if (franchiseId) formData.append("franchiseId", franchiseId);

    const res = await dispatch(addProductBulkExcel(formData));
    const payload = res?.payload as BulkProductExcelResponse;

    if (payload?.success) {
      alert(`Inserted: ${payload?.insertedCount || 0}`);
      e.currentTarget.value = "";
    } else {
      alert("Bulk upload failed");
      e.currentTarget.value = "";
    }
  };

  const openAddDrawer = () => {
    setEditingProduct(null);
    setForm({
      categoryId: { _id: "", categoryName: '' },
      vendorsId: { _id: "", vendor_name: '' },
      companyId: { _id: "", brandName: '' },
      productName: "",
      packSize: "",
      unit: "",
      productType: "",
      shape: "",
      colour: "",
      printStatus: "",
      productImage: "",
      gstPct: 0,
      taxableValue: 0,
      perUnitRate: 0,
      stockAlert: 0,
      createdAt: new Date().toISOString(),
    });
    setDrawerOpen(true);
  };

  const openEditDrawer = (p: ProductInterface) => {
    setEditingProduct(p);
    setForm({ ...p });
    setDrawerOpen(true);
  };

  useEffect(() => {
    const rate = Number(form.perUnitRate || 0);
    const gst = Number(form.gstPct || 0);
    const taxable = (rate * gst) / 100;

    setForm((prev) => ({
      ...prev,
      taxableValue: Number((taxable + rate).toFixed(2)),
    }));
  }, [form.perUnitRate, form.gstPct]);

  const handleSaveProduct = async () => {
    if (!form.productName || !form.categoryId || !form.companyId || !form.vendorsId || !form.productType) {
      alert("Please fill all required fields: Product Name, Category, Vendor, Company, and Product Type");
      return;
    }

    const payload: ProductInterface = {
      _id: editingProduct?._id || "",
      categoryId: form.categoryId,
      vendorsId: form.vendorsId,
      companyId: form.companyId,
      productName: String(form.productName || ""),
      packSize: String(form.packSize || ""),
      unit: String(form.unit || ""),
      productType: String(form.productType || ""),
      shape: String(form.shape || ""),
      colour: String(form.colour || ""),
      printStatus: String(form.printStatus || ""),
      productImage: form.productImage,
      gstPct: Number(form.gstPct || 0),
      taxableValue: Number(form.taxableValue || 0),
      perUnitRate: Number(form.perUnitRate || 0),
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
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await dispatch(deleteProduct(id));
  };

  const handleResetFilters = () => {
    setSearchName("");
    setCategoryId("");
    setCompanyId("");
    setVendorId("");
    setFromDate("");
    setToDate("");
    setPage(0);
  };

  // Filter Logic
  const filteredCats = useMemo(() => 
    categories.filter((c: any) => (c.categoryName || "").toLowerCase().includes(catSearch.toLowerCase())),
    [categories, catSearch]
  );

  const filteredVendors = useMemo(() => 
    vendors.filter((v: any) => (v.vendor_name || "").toLowerCase().includes(vendorSearch.toLowerCase())),
    [vendors, vendorSearch]
  );

  const filteredCompanies = useMemo(() => 
    companies.filter((c: any) => (c.brandName || "").toLowerCase().includes(companySearch.toLowerCase())),
    [companies, companySearch]
  );

  // Dropdown options for Drawer
  const categoryOptions = categories.map((c: any) => ({ label: c.categoryName || "", id: c._id }));
  const companyOptions = companies.map((c: any) => ({ label: c.brandName || "", id: c._id }));
  const vendorOptions = vendors.map((v: any) => ({ label: v.vendor_name || "", id: v._id }));

  const productNames = useMemo(() => (products || []).map((p: ProductInterface) => p.productName), [products]);

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
    if ((res.payload as GetVendorData)?._id) {
      alert("Vendor added");
      dispatch(getVendorNameList());
      setVendorDrawerOpen(false);
      setVendorForm({
        vendor_name: "", vendor_mobileNo: "", vendor_address: "", vendor_state: "",
        vendor_country: "", vendor_pinCode: "", vendor_bankName: "", vendor_accountNumber: "",
        vendor_ifscCode: "", vendor_paymentTerms: "", vendor_preferredPaymentMode: "",
        vendor_creditLimit: 0, vendor_outstandingBalance: 0, vendor_gstType: "",
        vendor_registrationType: "", vendor_gstNumber: "", vendor_openingBalance: 0,
      });
    }
  };

  return (
    <AdminLayout>
      <div>
        {/* Combined Tool Bar */}
        <Box className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border border-gray-100 shadow-sm">
          {/* Filters Area */}
          <Box className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <TextField
              placeholder="Search products..."
              size="small"
              value={searchName}
              onChange={(e) => { setSearchName(e.target.value); setPage(0); }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiSearch className="text-gray-400" />
                  </InputAdornment>
                ),
              }}
              className="w-full sm:w-64"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: "#fcfcfc" } }}
            />
            
            <Box className="flex items-center gap-2">
              <TextField
                type="date"
                size="small"
                label="From"
                InputLabelProps={{ shrink: true }}
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setPage(0); }}
                className="w-64"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />
              <TextField
                type="date"
                size="small"
                label="To"
                InputLabelProps={{ shrink: true }}
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setPage(0); }}
                className="w-64"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />
            </Box>

            <Button 
              size="small" 
              variant="text" 
              startIcon={<FiRefreshCw />} 
              onClick={handleResetFilters}
              className="text-blue-600 normal-case font-medium hover:bg-blue-50 px-3"
            >
              Reset
            </Button>
          </Box>

          {/* Actions Area */}
          <Box className="flex items-center gap-2 w-full md:w-auto justify-end">
            <Button variant="outlined" startIcon={<FiDownload />} onClick={handleDownloadTemplate} size="small" className="normal-case border-gray-300 text-gray-700 hover:bg-gray-50">
              Template
            </Button>
            <input id="product-excel" type="file" accept=".xlsx,.xls" style={{ display: "none" }} onChange={handleExcelUpload} />
            <Button variant="outlined" startIcon={<FiUpload />} onClick={() => (document.getElementById("product-excel") as HTMLInputElement).click()} size="small" className="normal-case border-gray-300 text-gray-700 hover:bg-gray-50">
              Import
            </Button>
            <Button variant="contained" startIcon={<FiPlus />} onClick={openAddDrawer} size="small" className="!bg-blue-600 hover:!bg-blue-700 normal-case shadow-none">
              Add Product
            </Button>
          </Box>
        </Box>

        <Paper className="shadow-md rounded-xl overflow-hidden border border-gray-100">
          <TableContainer>
            <Table>
              <TableHead className="bg-gray-50">
                <TableRow>
                  <TableCell className="font-bold">Product Details</TableCell>
                  <TableCell className="font-bold">
                    <Box className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors" onClick={(e) => setCatAnchor(e.currentTarget)}>
                      Category
                      <FiFilter size={14} className={categoryId ? "text-blue-600" : "text-gray-400"} />
                    </Box>
                    <Popover open={Boolean(catAnchor)} anchorEl={catAnchor} onClose={() => setCatAnchor(null)} PaperProps={{ sx: { minWidth: 240, shadow: 4, borderRadius: 2, overflow: 'hidden', mt: 1 } }}>
                      <Box className="p-2 border-b bg-gray-50">
                        <TextField placeholder="Search Category..." size="small" fullWidth variant="outlined" value={catSearch} onChange={(e) => setCatSearch(e.target.value)} InputProps={{ startAdornment: <FiSearch size={14} className="text-gray-400 mr-2" />, sx: { bgcolor: 'white' } }} />
                      </Box>
                      <List sx={{ maxHeight: 300, overflow: 'auto', py: 0 }}>
                        <ListItemButton onClick={() => { setCategoryId(""); setCatAnchor(null); }} selected={!categoryId}>
                          <ListItemText primary="All Categories" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                        </ListItemButton>
                        {filteredCats.map((c: any) => (
                          <ListItemButton key={c._id} onClick={() => { setCategoryId(c._id); setCatAnchor(null); }} selected={categoryId === c._id}>
                            <ListItemText primary={c.categoryName} primaryTypographyProps={{ fontSize: '0.875rem' }} />
                          </ListItemButton>
                        ))}
                      </List>
                    </Popover>
                  </TableCell>
                  <TableCell className="font-bold">
                    <Box className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors" onClick={(e) => setVendorAnchor(e.currentTarget)}>
                      Vendor
                      <FiFilter size={14} className={vendorId ? "text-blue-600" : "text-gray-400"} />
                    </Box>
                    <Popover open={Boolean(vendorAnchor)} anchorEl={vendorAnchor} onClose={() => setVendorAnchor(null)} PaperProps={{ sx: { minWidth: 240, shadow: 4, borderRadius: 2, overflow: 'hidden', mt: 1 } }}>
                      <Box className="p-2 border-b bg-gray-50">
                        <TextField placeholder="Search Vendor..." size="small" fullWidth variant="outlined" value={vendorSearch} onChange={(e) => setVendorSearch(e.target.value)} InputProps={{ startAdornment: <FiSearch size={14} className="text-gray-400 mr-2" />, sx: { bgcolor: 'white' } }} />
                      </Box>
                      <List sx={{ maxHeight: 300, overflow: 'auto', py: 0 }}>
                        <ListItemButton onClick={() => { setVendorId(""); setVendorAnchor(null); }} selected={!vendorId}>
                          <ListItemText primary="All Vendors" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                        </ListItemButton>
                        {filteredVendors.map((v: any) => (
                          <ListItemButton key={v._id} onClick={() => { setVendorId(v._id); setVendorAnchor(null); }} selected={vendorId === v._id}>
                            <ListItemText primary={v.vendor_name} primaryTypographyProps={{ fontSize: '0.875rem' }} />
                          </ListItemButton>
                        ))}
                      </List>
                    </Popover>
                  </TableCell>
                  <TableCell className="font-bold">
                    <Box className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors" onClick={(e) => setCompanyAnchor(e.currentTarget)}>
                      Brand
                      <FiFilter size={14} className={companyId ? "text-blue-600" : "text-gray-400"} />
                    </Box>
                    <Popover open={Boolean(companyAnchor)} anchorEl={companyAnchor} onClose={() => setCompanyAnchor(null)} PaperProps={{ sx: { minWidth: 240, shadow: 4, borderRadius: 2, overflow: 'hidden', mt: 1 } }}>
                      <Box className="p-2 border-b bg-gray-50">
                        <TextField placeholder="Search Brand..." size="small" fullWidth variant="outlined" value={companySearch} onChange={(e) => setCompanySearch(e.target.value)} InputProps={{ startAdornment: <FiSearch size={14} className="text-gray-400 mr-2" />, sx: { bgcolor: 'white' } }} />
                      </Box>
                      <List sx={{ maxHeight: 300, overflow: 'auto', py: 0 }}>
                        <ListItemButton onClick={() => { setCompanyId(""); setCompanyAnchor(null); }} selected={!companyId}>
                          <ListItemText primary="All Brands" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                        </ListItemButton>
                        {filteredCompanies.map((c: any) => (
                          <ListItemButton key={c._id} onClick={() => { setCompanyId(c._id); setCompanyAnchor(null); }} selected={companyId === c._id}>
                            <ListItemText primary={c.brandName} primaryTypographyProps={{ fontSize: '0.875rem' }} />
                          </ListItemButton>
                        ))}
                      </List>
                    </Popover>
                  </TableCell>
                  <TableCell className="font-bold text-center">Rate</TableCell>
                  <TableCell className="font-bold text-center">GST%</TableCell>
                  <TableCell className="font-bold text-center">Taxable</TableCell>
                  <TableCell className="font-bold text-center">Alert</TableCell>
                  <TableCell className="font-bold">Created</TableCell>
                  <TableCell align="right" className="font-bold">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={10} align="center" className="py-10"><CircularProgress size={30} /></TableCell></TableRow>
                ) : (products || []).length === 0 ? (
                  <TableRow><TableCell colSpan={10} align="center" className="py-10 text-gray-500 text-sm">No products found.</TableCell></TableRow>
                ) : (
                  (products || []).map((p: ProductInterface) => (
                    <TableRow key={p._id} hover>
                      <TableCell>
                        <Typography variant="body2" className="font-medium">{p.productName}</Typography>
                        <Typography variant="caption" className="text-gray-500">{p.packSize} | {p.unit}</Typography>
                      </TableCell>
                      <TableCell className="text-gray-600 capitalize">
                        {p.categoryId && typeof p.categoryId === "object" ? p.categoryId.categoryName : (p.categoryId || "N/A")}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {p.vendorsId && typeof p.vendorsId === "object" ? p.vendorsId.vendor_name : (p.vendorsId || "N/A")}
                      </TableCell>
                      <TableCell className="text-gray-600 italic">
                        {p.companyId && typeof p.companyId === "object" ? p.companyId.brandName : (p.companyId || "N/A")}
                      </TableCell>
                      <TableCell className="text-center font-medium">₹{p.perUnitRate}</TableCell>
                      <TableCell className="text-center text-gray-600">{p.gstPct}%</TableCell>
                      <TableCell className="text-center font-bold text-blue-600">₹{p.taxableValue}</TableCell>
                      <TableCell className="text-center">
                        <Box className="bg-orange-50 text-orange-700 rounded px-2 py-0.5 inline-block text-xs font-bold">
                          {p.stockAlert}
                        </Box>
                      </TableCell>
                      <TableCell className="text-gray-500 text-xs">
                        {p.createdAt ? dayjs(p.createdAt).format("DD/MM/YYYY") : "-"}
                      </TableCell>
                      <TableCell align="right">
                        <Box className="flex gap-1 justify-end">
                          <IconButton onClick={() => openEditDrawer(p)} size="small" className="text-blue-600"><FiEdit size={16} /></IconButton>
                          <IconButton onClick={() => handleDeleteProduct(p._id)} size="small" className="text-red-500"><FiTrash2 size={16} /></IconButton>
                        </Box>
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
            className="border-t bg-gray-50"
          />
        </Paper>

        {/* right drawer form */}
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box sx={{ width: { xs: '100vw', sm: 600 }, p: 4 }}>
            <Box className="flex items-center justify-between mb-6">
              <Typography variant="h6" className="font-bold">{editingProduct ? "Edit Product" : "Add New Product"}</Typography>
              <Box className="flex gap-2">
                <Button size="small" variant="outlined" onClick={async () => { const name = prompt("New category name"); if (name) { await dispatch(addCategory({ categoryName: name })); dispatch(getCategories({ page: 1, limit: 1000 })); } }}>+ Category</Button>
                <Button size="small" variant="outlined" onClick={() => setVendorDrawerOpen(true)}>+ Vendor</Button>
                <Button size="small" variant="outlined" onClick={async () => { const name = prompt("New company brand"); if (name) { await dispatch(addCompany({ brandName: name })); dispatch(getCompanies({ page: 1, limit: 1000 })); } }}>+ Brand</Button>
              </Box>
            </Box>

            <Divider className="mb-6" />

            <div className="space-y-4">
              <Autocomplete
                freeSolo
                size="small"
                options={productNames}
                value={form.productName || ""}
                onChange={(_, val) => {
                  const matched = products.find((x: ProductInterface) => x.productName === val);
                  if (matched) {
                    setForm({ ...matched });
                    setEditingProduct(matched);
                  } else {
                    setForm(prev => ({ ...prev, productName: val as string }));
                  }
                }}
                renderInput={(params) => <TextField {...params} label="Fast Product Search" placeholder="Type to find and fill..." />}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField fullWidth size="small" label="Product Name" value={form.productName || ""} onChange={(e) => setForm({ ...form, productName: e.target.value })} />
                
                <TextField select fullWidth size="small" label="Category" value={form.categoryId?._id || ""} onChange={(e) => {
                  const s = categoryOptions.find((c) => c.id === e.target.value);
                  setForm({ ...form, categoryId: { _id: e.target.value, categoryName: s?.label || "" } });
                }}>
                  <MenuItem value="">Select Category</MenuItem>
                  {categoryOptions.map((c) => <MenuItem key={c.id} value={c.id}>{c.label}</MenuItem>)}
                </TextField>

                <TextField select fullWidth size="small" label="Vendor" value={form.vendorsId?._id || ""} onChange={(e) => {
                  const s = vendorOptions.find((v) => v.id === e.target.value);
                  setForm({ ...form, vendorsId: { _id: e.target.value, vendor_name: s?.label || "" } });
                }}>
                  <MenuItem value="">Select Vendor</MenuItem>
                  {vendorOptions.map((v) => <MenuItem key={v.id} value={v.id}>{v.label}</MenuItem>)}
                </TextField>

                <TextField select fullWidth size="small" label="Brand" value={form.companyId?._id || ""} onChange={(e) => {
                  const s = companyOptions.find((c) => c.id === e.target.value);
                  setForm({ ...form, companyId: { _id: e.target.value, brandName: s?.label || "" } });
                }}>
                  <MenuItem value="">Select Brand</MenuItem>
                  {companyOptions.map((c) => <MenuItem key={c.id} value={c.id}>{c.label}</MenuItem>)}
                </TextField>

                <TextField fullWidth size="small" label="Pack Size" value={form.packSize || ""} onChange={(e) => setForm({ ...form, packSize: e.target.value })} />
                <TextField fullWidth size="small" label="Unit" value={form.unit || ""} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
                
                <FormControl fullWidth size="small" required>
                  <InputLabel id="product-type-label">Product Type *</InputLabel>
                  <Select 
                    labelId="product-type-label" 
                    value={form.productType || ""} 
                    label="Product Type *"
                    required
                    displayEmpty={false}
                    onChange={(e) => {
                      const newProductType = e.target.value;
                      setForm({ 
                        ...form, 
                        productType: newProductType,
                        // Clear shape and colour if not Packaging Items
                        ...(newProductType !== "Packaging Items" ? { shape: "", colour: "" } : {})
                      });
                    }}
                  >
                    <MenuItem value="Inventory Items">Inventory Items</MenuItem>
                    <MenuItem value="Packaging Items">Packaging Items</MenuItem>
                  </Select>
                </FormControl>

                {form.productType === "Packaging Items" && (
                  <>
                    <TextField fullWidth size="small" label="Shape" value={form.shape || ""} onChange={(e) => setForm({ ...form, shape: e.target.value })} />
                    <TextField fullWidth size="small" label="Colour" value={form.colour || ""} onChange={(e) => setForm({ ...form, colour: e.target.value })} />
                  </>
                )}
                
                <FormControl fullWidth size="small">
                  <InputLabel id="print-status-label">Print Status</InputLabel>
                  <Select labelId="print-status-label" value={form.printStatus || ""} label="Print Status" onChange={(e) => setForm({ ...form, printStatus: e.target.value })}>
                    <MenuItem value="Printed">Printed</MenuItem>
                    <MenuItem value="Not Printed">Not Printed</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                  </Select>
                </FormControl>

                <TextField fullWidth size="small" label="Per Unit Rate" type="number" value={form.perUnitRate ?? 0} onChange={(e) => setForm({ ...form, perUnitRate: Number(e.target.value) })} />
                <TextField fullWidth size="small" label="GST %" type="number" value={form.gstPct ?? 0} onChange={(e) => setForm({ ...form, gstPct: Number(e.target.value) })} />
                <TextField fullWidth size="small" label="Taxable Value" value={form.taxableValue ?? 0} InputProps={{ readOnly: true }} />
                <TextField fullWidth size="small" label="Stock Alert" type="number" value={form.stockAlert ?? 0} onChange={(e) => setForm({ ...form, stockAlert: Number(e.target.value) })} />
              </div>

              <Box className="flex gap-3 justify-end mt-8">
                <Button variant="outlined" onClick={() => setDrawerOpen(false)} className="normal-case">Cancel</Button>
                <Button variant="contained" onClick={handleSaveProduct} className="!bg-blue-600 hover:!bg-blue-700 normal-case px-8">Save Product</Button>
              </Box>
            </div>
          </Box>
        </Drawer>

        {/* VENDOR DRAWER */}
        <Drawer anchor="right" open={vendorDrawerOpen} onClose={() => setVendorDrawerOpen(false)}>
          <Box sx={{ width: { xs: '100vw', sm: 450 }, p: 4 }}>
            <Typography variant="h6" className="font-bold mb-6">Quick Add Vendor</Typography>
            <Divider className="mb-6" />

            <div className="space-y-4">
              <TextField fullWidth size="small" label="Vendor Name" value={vendorForm.vendor_name} onChange={(e) => setVendorForm({ ...vendorForm, vendor_name: e.target.value })} />
              <TextField fullWidth size="small" label="Mobile Number" value={vendorForm.vendor_mobileNo} onChange={(e) => setVendorForm({ ...vendorForm, vendor_mobileNo: e.target.value })} />
              <TextField fullWidth size="small" label="Address" value={vendorForm.vendor_address} onChange={(e) => setVendorForm({ ...vendorForm, vendor_address: e.target.value })} />
              <TextField fullWidth size="small" label="State" value={vendorForm.vendor_state} onChange={(e) => setVendorForm({ ...vendorForm, vendor_state: e.target.value })} />
              <TextField fullWidth size="small" label="Country" value={vendorForm.vendor_country} onChange={(e) => setVendorForm({ ...vendorForm, vendor_country: e.target.value })} />
              <TextField fullWidth size="small" label="Pin Code" value={vendorForm.vendor_pinCode} onChange={(e) => setVendorForm({ ...vendorForm, vendor_pinCode: e.target.value })} />
              
              <Box className="flex gap-3 justify-end mt-8">
                <Button variant="outlined" onClick={() => setVendorDrawerOpen(false)} size="small">Cancel</Button>
                <Button variant="contained" onClick={handleSaveVendor} size="small" className="!bg-blue-600">Save Vendor</Button>
              </Box>
            </div>
          </Box>
        </Drawer>
      </div>
    </AdminLayout>
  );
}
