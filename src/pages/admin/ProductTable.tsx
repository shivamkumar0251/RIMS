import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  List,
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
  Tooltip,
  Typography,
  Tabs,
  Tab,
  LinearProgress,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FiDownload, FiEdit, FiPlus, FiSearch, FiTrash2, FiUpload, FiRefreshCw, FiFilter } from "react-icons/fi";
import * as XLSX from "xlsx";
import { toast, Toaster } from "react-hot-toast";
import { AdminLayout } from "../../layouts/AdminLayout";
import CreateCategoryModal from "../../components/adminComponents/CreateCategoryModal";
import CreateBrandModal from "../../components/adminComponents/CreateBrandModal";
import VendorModal from "../../layouts/VendorModal";

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
import { addVendor, getVendorNameList, selectVendorNames } from "../../redux/slices/vendorSlice";
import { ProductDrawerForm } from "../../components/adminComponents/ProductDrawerForm";

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
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [activeTab, setActiveTab] = useState(0); // 0: Inventory, 1: Packaging

  // Popover States
  const [catAnchor, setCatAnchor] = useState<null | HTMLElement>(null);
  const [companyAnchor, setCompanyAnchor] = useState<null | HTMLElement>(null);
  const [vendorAnchor, setVendorAnchor] = useState<null | HTMLElement>(null);

  const [catSearch, setCatSearch] = useState("");
  const [companySearch, setCompanySearch] = useState("");
  const [vendorSearch, setVendorSearch] = useState("");

  // Drawer form state
  const [editingProduct, setEditingProduct] = useState<ProductInterface | null>(null);
  const [form, setForm] = useState<PartialProductForm>({
    categoryId: { _id: "", categoryName: '' },
    vendorsId: { _id: "", vendor_name: '' },
    companyId: { _id: "", brandName: '' },
    productName: "",
    productDescription: "",
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
    quantity: 0,
    // stockAlert: 0,
    createdAt: new Date().toISOString(),
  });

  // Navigation & URL Params
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const action = searchParams.get("action");
  const isAddMode = action === "add";
  const isEditMode = action === "edit";
  const editId = searchParams.get("id");

  const productToEdit = useMemo(() => {
    if (isEditMode && editId && products) {
      return products.find(p => p._id === editId) || null;
    }
    return null;
  }, [isEditMode, editId, products]);

  // Quick Add Modal States
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [vendorDrawerOpen, setVendorDrawerOpen] = useState(false);

  const loading = productState.loading;

  // === fetch lookup data on mount ===
  useEffect(() => {
    dispatch(getCategories({ page: 1, limit: 1000 }));
    dispatch(getCompanies({ page: 1, limit: 1000 }));
    dispatch(getVendorNameList());
  }, [dispatch]);

  const refreshProducts = () => {
    dispatch(getProducts({
      search: searchName || undefined,
      page: page + 1,
      limit: rowsPerPage,
      fromDate: fromDate || '',
      toDate: toDate || '',
      category: categoryId || '',
      vendor: vendorId || '',
      company: companyId || '',
      productType: activeTab === 0 ? "Inventory Item" : "Packaging Item",
    }));
  };

  // === fetch products when filters change ===
  useEffect(() => {
    refreshProducts();
  }, [dispatch, page, rowsPerPage, searchName, categoryId, vendorId, companyId, fromDate, toDate, activeTab]);

  const handleDownloadTemplate = () => {
    const sample = [
      {
        CategoryName: "",
        VendorsName: "",
        CompanyName: "",
        ProductName: "Sample Product A",
        ProductType: "Packaging Item",
        PackSize: "10x10",
        Unit: "box",
        Shape: "Round",
        Colour: "White",
        PrintStatus: "Printed",
        ProductImage: "",
        GstPercentage: 12,
        TaxableValue: 0,
        PerUnitRate: 120,
        // StockAlert: 5,
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
      toast.success(`Successfully imported ${payload?.insertedCount || 0} products`);
      e.currentTarget.value = "";
      refreshProducts();
    } else {
      toast.error("Bulk upload failed");
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
      productDescription: "",
      packSize: "",
      unit: "",
      productType: activeTab === 0 ? "Inventory Item" : "Packaging Item",
      shape: "",
      colour: "",
      printStatus: "",
      productImage: "",
      gstPct: 0,
      taxableValue: 0,
      perUnitRate: 0,
      // stockAlert: 0,
      createdAt: new Date().toISOString(),
    });
    // setDrawerOpen(true); -> Now we navigate
    setSearchParams({ action: "add" });
  };

  const openEditDrawer = (p: ProductInterface) => {
    setEditingProduct(p); // Optional fallback
    setSearchParams({ action: "edit", id: p._id });
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

  const handleSaveProduct = async (productData?: ProductInterface) => {
    try {
      const dataToSave = productData || (form as ProductInterface);

      const payload: any = {
        _id: editingProduct?._id || "",
        productName: String(dataToSave.productName || ""),
        productDescription: String(dataToSave.productDescription || ""),
        packSize: String(dataToSave.packSize || ""),
        unit: String(dataToSave.unit || ""),
        productType: String(dataToSave.productType || ""),
        shape: String(dataToSave.shape || ""),
        colour: String(dataToSave.colour || ""),
        printStatus: String(dataToSave.printStatus || ""),
        productImage: dataToSave.productImage,
        gstPct: Number(dataToSave.gstPct || 0),
        taxableValue: Number(dataToSave.taxableValue || 0),
        perUnitRate: Number(dataToSave.perUnitRate || 0),
        // stockAlert: Number(dataToSave.stockAlert || 0),
        createdAt: dataToSave.createdAt || new Date().toISOString(),
        isActive: dataToSave.isActive ?? true
      };

      if (dataToSave.categoryId) {
        payload.categoryId = typeof dataToSave.categoryId === 'string' ? { _id: dataToSave.categoryId } : dataToSave.categoryId;
      }
      if (dataToSave.vendorsId) {
        payload.vendorsId = typeof dataToSave.vendorsId === 'string' ? { _id: dataToSave.vendorsId } : dataToSave.vendorsId;
      }
      if (dataToSave.companyId) {
        payload.companyId = typeof dataToSave.companyId === 'string' ? { _id: dataToSave.companyId } : dataToSave.companyId;
      }

      if (editingProduct) {
        await dispatch(updateProduct({ productId: editingProduct._id, productData: payload })).unwrap();
        toast.success("Product updated successfully");
      } else {
        await dispatch(addProduct(payload)).unwrap();
        toast.success("Product added successfully");
      }

      // After successfully saving (add or edit), go back to list
      if (isAddMode || isEditMode) {
        navigate("/admin/products");
      }
      refreshProducts();
    } catch (err: any) {
      toast.error(err.message || "Failed to save product");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await dispatch(deleteProduct(id)).unwrap();
      toast.success("Product deleted successfully");
      refreshProducts();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete product");
    }
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
  const productNames = useMemo(() => (products || []).map((p: ProductInterface) => p.productName), [products]);



  const handleSaveCategory = async (name: string) => {
    try {
      await dispatch(addCategory({ categoryName: name })).unwrap();
      dispatch(getCategories({ page: 1, limit: 1000 }));
      toast.success("Category added successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to add category");
      throw err;
    }
  };

  const handleSaveBrand = async (name: string) => {
    try {
      await dispatch(addCompany({ brandName: name })).unwrap();
      dispatch(getCompanies({ page: 1, limit: 1000 }));
      toast.success("Brand added successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to add brand");
      throw err;
    }
  };

  // Save handler for Vendor Modal
  const handleSaveVendor = async (data: any) => {
    try {
      const mappedData: any = {
        vendor_name: data.name,
        vendor_address: data.address,
        vendor_state: data.state,
        vendor_country: data.country,
        vendor_pinCode: data.pinCode,
        vendor_mobileNo: data.mobile,
        vendor_bankName: data.bankName,
        vendor_accountNumber: data.accountNumber,
        vendor_ifscCode: data.ifsc,
        vendor_paymentTerms: data.paymentTerms,
        vendor_preferredPaymentMode: data.preferredPaymentMode,
        vendor_creditLimit: Number(data.creditLimit) || 0,
        vendor_outstandingBalance: Number(data.outstandingBalance) || 0,
        vendor_gstType: data.gstType,
        vendor_registrationType: data.registrationType,
        vendor_gstNumber: data.gstNumber,
        vendor_openingBalance: Number(data.openingBalance) || 0,
      };

      await dispatch(addVendor(mappedData)).unwrap();
      dispatch(getVendorNameList()); // Refresh list
      toast.success("Vendor added successfully");
      setVendorDrawerOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to add vendor");
    }
  };

  // Close handler for the form view
  const handleCloseForm = () => {
    navigate("/admin/products");
  };

  return (
    <AdminLayout>
      {isAddMode || (isEditMode && productToEdit) ? (
        <ProductDrawerForm
          open={true}
          onClose={handleCloseForm}
          isEdit={isEditMode}
          title={isEditMode ? `Edit ${productToEdit?.productName}` : "Add Daily Product"}
          initialData={isEditMode && productToEdit ? productToEdit : form}
          categories={categories}
          vendors={vendors}
          companies={companies}
          productNames={productNames}
          onSave={handleSaveProduct}
          onAddCategory={() => setCategoryModalOpen(true)}
          onAddVendor={() => setVendorDrawerOpen(true)}
          onAddBrand={() => setBrandModalOpen(true)}
          onFillFromSearch={(matched) => {
            setForm({ ...matched });
            setEditingProduct(matched);
          }}
          allowedProductTypes={["Inventory Item", "Packaging Item"]}
        />
      ) : (
        <Box className="flex-1 flex flex-col overflow-hidden bg-slate-50 min-h-0">
          {/* Combined Header Area */}
          <Box className="bg-white border-b border-gray-100 shadow-sm shrink-0">
            {/* Top Row: Tabs & Search */}
            <Box className="flex flex-col md:flex-row items-center justify-between px-4 gap-4">
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => {
                  setActiveTab(newValue);
                  setPage(0);
                }}
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    minWidth: 100,
                    py: 2,
                    color: 'text.secondary',
                    '&.Mui-selected': { color: 'primary.main' },
                  },
                  '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' }
                }}
              >
                <Tab label="Inventory Items" />
                <Tab label="Packaging Items" />
              </Tabs>

              <Box className="flex items-center gap-3 w-full md:w-auto pb-2 md:pb-0">
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
                  className="flex-1 md:w-64"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: "#fcfcfc" } }}
                />

                <Box className="flex items-center gap-2">
                  <Tooltip title="Download Template">
                    <Button variant="outlined" onClick={handleDownloadTemplate} size="small" className="min-w-[40px] h-[38px] border-gray-300 text-gray-700 hover:bg-gray-50">
                      <FiDownload size={16} />
                    </Button>
                  </Tooltip>
                  <input id="product-excel" type="file" accept=".xlsx,.xls" style={{ display: "none" }} onChange={handleExcelUpload} />
                  <Tooltip title="Import Products">
                    <Button variant="outlined" onClick={() => (document.getElementById("product-excel") as HTMLInputElement).click()} size="small" className="min-w-[40px] h-[38px] border-gray-300 text-gray-700 hover:bg-gray-50">
                      <FiUpload size={16} />
                    </Button>
                  </Tooltip>
                  <Button
                    variant="contained"
                    startIcon={<FiPlus />}
                    onClick={openAddDrawer}
                    size="small"
                    className="bg-blue-600 hover:bg-blue-700 normal-case shadow-none h-[38px] px-4"
                  >
                    Add Product
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
          <Box className="flex-1 flex flex-col overflow-hidden min-h-0">
            <Paper className="flex-1 flex flex-col shadow-md rounded-xl overflow-hidden border border-gray-100 bg-white min-h-0">
              <TableContainer className="flex-1 overflow-auto relative min-h-[200px]">
                {loading && (products || []).length === 0 && (
                  <Box className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white">
                    <Box className="flex flex-col items-center gap-3">
                      <CircularProgress
                        size={45}
                        thickness={4.5}
                        sx={{
                          color: 'primary.main',
                          '& .MuiCircularProgress-circle': { strokeLinecap: 'round' }
                        }}
                      />
                      <Typography className="text-slate-600 font-semibold text-[15px] tracking-wide animate-pulse">
                        Fetching products...
                      </Typography>
                    </Box>
                  </Box>
                )}
                <Table stickyHeader size="medium">
                  <TableHead>
                    <TableRow sx={{ '& th': { borderBottom: '1px solid', borderColor: 'divider' } }}>
                      <TableCell className="bg-slate-50 font-semibold text-slate-500 py-4 uppercase tracking-wider text-[11px]" sx={{ width: 50 }}>S/N</TableCell>
                      <TableCell className="bg-slate-50 font-semibold text-slate-500 py-4 uppercase tracking-wider text-[11px]" sx={{ minWidth: 160 }}>Product Details</TableCell>
                      <TableCell className="bg-slate-50 font-semibold text-slate-500 py-4 uppercase tracking-wider text-[11px]">
                        <Box className="flex items-center gap-1 cursor-pointer hover:text-indigo-600 transition-colors" onClick={(e) => setCatAnchor(e.currentTarget)}>
                          Category
                          <FiFilter size={12} className={categoryId ? "text-indigo-600" : "text-slate-400"} />
                        </Box>
                        <Popover open={Boolean(catAnchor)} anchorEl={catAnchor} onClose={() => setCatAnchor(null)} PaperProps={{ sx: { minWidth: 240, elevation: 3, borderRadius: 2, mt: 1 } }}>
                          <Box className="p-3 border-b bg-slate-50/50">
                            <TextField placeholder="Search Category..." size="small" fullWidth variant="outlined" value={catSearch} onChange={(e) => setCatSearch(e.target.value)} InputProps={{ startAdornment: <FiSearch size={14} className="text-slate-400 mr-2" />, sx: { bgcolor: 'white', borderRadius: '8px' } }} />
                          </Box>
                          <List sx={{ maxHeight: 300, overflow: 'auto', py: 1 }}>
                            <ListItemButton onClick={() => { setCategoryId(""); setCatAnchor(null); }} selected={!categoryId} sx={{ py: 0.5 }}>
                              <ListItemText primary="All Categories" primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: !categoryId ? 600 : 400 }} />
                            </ListItemButton>
                            {filteredCats.map((c: any) => (
                              <ListItemButton key={c._id} onClick={() => { setCategoryId(c._id); setCatAnchor(null); }} selected={categoryId === c._id} sx={{ py: 0.5 }}>
                                <ListItemText primary={c.categoryName} primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: categoryId === c._id ? 600 : 400 }} />
                              </ListItemButton>
                            ))}
                          </List>
                        </Popover>
                      </TableCell>
                      <TableCell className="bg-slate-50 font-semibold text-slate-500 py-4 uppercase tracking-wider text-[11px]">
                        <Box className="flex items-center gap-1 cursor-pointer hover:text-indigo-600 transition-colors" onClick={(e) => setVendorAnchor(e.currentTarget)}>
                          Vendor
                          <FiFilter size={12} className={vendorId ? "text-indigo-600" : "text-slate-400"} />
                        </Box>
                        <Popover open={Boolean(vendorAnchor)} anchorEl={vendorAnchor} onClose={() => setVendorAnchor(null)} PaperProps={{ sx: { minWidth: 240, elevation: 3, borderRadius: 2, mt: 1 } }}>
                          <Box className="p-3 border-b bg-slate-50/50">
                            <TextField placeholder="Search Vendor..." size="small" fullWidth variant="outlined" value={vendorSearch} onChange={(e) => setVendorSearch(e.target.value)} InputProps={{ startAdornment: <FiSearch size={14} className="text-slate-400 mr-2" />, sx: { bgcolor: 'white', borderRadius: '8px' } }} />
                          </Box>
                          <List sx={{ maxHeight: 300, overflow: 'auto', py: 1 }}>
                            <ListItemButton onClick={() => { setVendorId(""); setVendorAnchor(null); }} selected={!vendorId} sx={{ py: 0.5 }}>
                              <ListItemText primary="All Vendors" primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: !vendorId ? 600 : 400 }} />
                            </ListItemButton>
                            {filteredVendors.map((v: any) => (
                              <ListItemButton key={v._id} onClick={() => { setVendorId(v._id); setVendorAnchor(null); }} selected={vendorId === v._id} sx={{ py: 0.5 }}>
                                <ListItemText primary={v.vendor_name} primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: vendorId === v._id ? 600 : 400 }} />
                              </ListItemButton>
                            ))}
                          </List>
                        </Popover>
                      </TableCell>
                      <TableCell className="bg-slate-50 font-semibold text-slate-500 py-4 uppercase tracking-wider text-[11px]">
                        <Box className="flex items-center gap-1 cursor-pointer hover:text-indigo-600 transition-colors" onClick={(e) => setCompanyAnchor(e.currentTarget)}>
                          Brand
                          <FiFilter size={12} className={companyId ? "text-indigo-600" : "text-slate-400"} />
                        </Box>
                        <Popover open={Boolean(companyAnchor)} anchorEl={companyAnchor} onClose={() => setCompanyAnchor(null)} PaperProps={{ sx: { minWidth: 240, elevation: 3, borderRadius: 2, mt: 1 } }}>
                          <Box className="p-3 border-b bg-slate-50/50">
                            <TextField placeholder="Search Brand..." size="small" fullWidth variant="outlined" value={companySearch} onChange={(e) => setCompanySearch(e.target.value)} InputProps={{ startAdornment: <FiSearch size={14} className="text-slate-400 mr-2" />, sx: { bgcolor: 'white', borderRadius: '8px' } }} />
                          </Box>
                          <List sx={{ maxHeight: 300, overflow: 'auto', py: 1 }}>
                            <ListItemButton onClick={() => { setCompanyId(""); setCompanyAnchor(null); }} selected={!companyId} sx={{ py: 0.5 }}>
                              <ListItemText primary="All Brands" primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: !companyId ? 600 : 400 }} />
                            </ListItemButton>
                            {filteredCompanies.map((c: any) => (
                              <ListItemButton key={c._id} onClick={() => { setCompanyId(c._id); setCompanyAnchor(null); }} selected={companyId === c._id} sx={{ py: 0.5 }}>
                                <ListItemText primary={c.brandName} primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: companyId === c._id ? 600 : 400 }} />
                              </ListItemButton>
                            ))}
                          </List>
                        </Popover>
                      </TableCell>
                      <TableCell className="bg-slate-50 font-semibold text-slate-500 py-4 uppercase tracking-wider text-[11px]">Pack Size</TableCell>

                      {activeTab === 1 && (
                        <>
                          <TableCell className="bg-slate-50 font-semibold text-slate-500 py-4 uppercase tracking-wider text-[11px]">Shape</TableCell>
                          <TableCell className="bg-slate-50 font-semibold text-slate-500 py-4 uppercase tracking-wider text-[11px]">Color</TableCell>
                          <TableCell className="bg-slate-50 font-semibold text-slate-500 py-4 uppercase tracking-wider text-[11px]">Print Status</TableCell>
                        </>
                      )}

                      <TableCell className="bg-slate-50 font-semibold text-slate-500 py-4 uppercase tracking-wider text-[11px] text-center">GST</TableCell>
                      <TableCell align="right" className="bg-slate-50 font-semibold text-slate-500 py-4 uppercase tracking-wider text-[11px]">Actions</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {!loading && (products || []).length === 0 ? (
                      <TableRow><TableCell colSpan={15} align="center" className="py-20 text-gray-500 text-sm">No products found.</TableCell></TableRow>
                    ) : (
                      (products || []).map((p: ProductInterface, index: number) => (
                        <TableRow key={p._id} hover className="group transition-colors duration-200">
                          <TableCell className="py-2.5 text-slate-500 text-[12px] font-medium">
                            {(page * rowsPerPage) + index + 1}
                          </TableCell>
                          <TableCell className="py-2.5">
                            <Box className="flex flex-col gap-0.5">
                              <Typography className="font-semibold text-slate-800 text-[13px] leading-tight">{p.productName || "Unnamed Product"}</Typography>
                              <Typography className="text-slate-400 text-[11px] leading-tight truncate max-w-[180px]">
                                {p.productDescription || "-"}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell className="py-2.5">
                            <Typography className="text-slate-600 text-[13px] font-medium capitalize">
                              {(() => {
                                if (p.categoryId && typeof p.categoryId === "object") return p.categoryId.categoryName;
                                if (typeof p.categoryId === "string") {
                                  return categories.find((c: any) => c._id === p.categoryId)?.categoryName || p.categoryId;
                                }
                                return "N/A";
                              })()}
                            </Typography>
                          </TableCell>
                          <TableCell className="py-2.5">
                            <Typography className="text-slate-600 text-[13px]">
                              {(() => {
                                if (p.vendorsId && typeof p.vendorsId === "object") return p.vendorsId.vendor_name;
                                if (typeof p.vendorsId === "string") {
                                  return vendors.find((v: any) => v._id === p.vendorsId)?.vendor_name || p.vendorsId;
                                }
                                return "N/A";
                              })()}
                            </Typography>
                          </TableCell>
                          <TableCell className="py-2.5">
                            <Typography className="text-slate-600 text-[13px] font-medium italic">
                              {p.productType === 'Inventory Item' ? (
                                (() => {
                                  if (p.companyId && typeof p.companyId === "object") return p.companyId.brandName;
                                  if (typeof p.companyId === "string") {
                                    return companies.find((c: any) => c._id === p.companyId)?.brandName || p.companyId;
                                  }
                                  return "N/A";
                                })()
                              ) : "-"}
                            </Typography>
                          </TableCell>
                          <TableCell className="py-2.5">
                            <Box className="flex items-baseline gap-1">
                              <Typography className="font-bold text-slate-700 text-[13px]">{p.packSize || "-"}</Typography>
                              <Typography className="text-slate-400 text-[11px] uppercase">{p.unit || ""}</Typography>
                            </Box>
                          </TableCell>

                          {activeTab === 1 && (
                            <>
                              <TableCell className="py-2.5">
                                <Typography className="text-slate-600 text-[13px] font-medium">{p.shape || "NA"}</Typography>
                              </TableCell>
                              <TableCell className="py-2.5">
                                <Box className="flex items-center gap-1.5">
                                  {p.colour && p.colour !== 'NA' && (
                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', border: '1px solid #e2e8f0', bgcolor: p.colour.toLowerCase() }} />
                                  )}
                                  <Typography className="text-slate-600 text-[13px]">{p.colour || "NA"}</Typography>
                                </Box>
                              </TableCell>
                              <TableCell className="py-2.5">
                                <Box className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center justify-center ${p.printStatus === 'Non Print' ? 'bg-slate-100 text-slate-500 border border-slate-200' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
                                  {p.printStatus || "N/A"}
                                </Box>
                              </TableCell>
                            </>
                          )}

                          <TableCell className="text-center py-2.5">
                            <Box className="bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-[11px] font-bold inline-block">
                              {p.gstPct}%
                            </Box>
                          </TableCell>
                          <TableCell align="right" className="py-2.5">
                            <Box className="flex gap-0.5 justify-end">
                              <Tooltip title="Edit Product">
                                <IconButton onClick={() => openEditDrawer(p)} size="small" className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                                  <FiEdit size={16} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Product">
                                <IconButton onClick={() => handleDeleteProduct(p._id)} size="small" className="text-slate-400 hover:text-red-600 hover:bg-red-50">
                                  <FiTrash2 size={16} />
                                </IconButton>
                              </Tooltip>
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
                rowsPerPageOptions={[25, 50, 100]}
                className="border-t bg-gray-50 shrink-0"
              />
            </Paper>
          </Box>
        </Box>
      )
      }

      <Toaster position="top-right" />
      <CreateCategoryModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSave={handleSaveCategory}
      />
      <CreateBrandModal
        open={brandModalOpen}
        onClose={() => setBrandModalOpen(false)}
        onSave={handleSaveBrand}
      />
      <VendorModal
        open={vendorDrawerOpen}
        onClose={() => setVendorDrawerOpen(false)}
        onAddVendor={handleSaveVendor}
      />
    </AdminLayout >
  );
}
