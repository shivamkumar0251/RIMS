import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
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
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { FiDownload, FiEdit, FiPlus, FiSearch, FiTrash2, FiUpload, FiRefreshCw, FiFilter } from "react-icons/fi";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { toast, Toaster } from "react-hot-toast";
import { AdminLayout } from "../../layouts/AdminLayout";
import CreateCategoryModal from "../../components/adminComponents/CreateCategoryModal";
import CreateBrandModal from "../../components/adminComponents/CreateBrandModal";
import VendorModal, { VendorFormData } from "../../layouts/VendorModal";

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
    // stockAlert: 0,
    createdAt: new Date().toISOString(),
  });

  // Navigation & URL Params
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
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
    }));
  };

  // === fetch products when filters change ===
  useEffect(() => {
    refreshProducts();
  }, [dispatch, page, rowsPerPage, searchName, categoryId, vendorId, companyId, fromDate, toDate]);

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
      productType: "",
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

      if (dataToSave.categoryId?._id) payload.categoryId = dataToSave.categoryId;
      if (dataToSave.vendorsId?._id) payload.vendorsId = dataToSave.vendorsId;
      if (dataToSave.companyId?._id) payload.companyId = dataToSave.companyId;

      if (editingProduct) {
        await dispatch(updateProduct({ productId: editingProduct._id, productData: payload })).unwrap();
        toast.success("Product updated successfully");
      } else {
        await dispatch(addProduct(payload)).unwrap();
        toast.success("Product added successfully");
      }

      setDrawerOpen(false);
      // If we are in add mode, go back to list
      if (isAddMode) {
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
  const categoryOptions = categories.map((c: any) => ({ label: c.categoryName || "", id: c._id }));
  const companyOptions = companies.map((c: any) => ({ label: c.brandName || "", id: c._id }));
  const vendorOptions = vendors.map((v: any) => ({ label: v.vendor_name || "", id: v._id }));

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

  if (isAddMode || (isEditMode && productToEdit)) {
    return (
      <AdminLayout>
        <ProductDrawerForm
          open={true}
          onClose={handleCloseForm}
          isEdit={isEditMode}
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
        />
        {/* Still keep modals available if needed by the form */}
        <CreateCategoryModal open={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} onSave={handleSaveCategory} />
        <CreateBrandModal open={brandModalOpen} onClose={() => setBrandModalOpen(false)} onSave={handleSaveBrand} />
        <VendorModal open={vendorDrawerOpen} onClose={() => setVendorDrawerOpen(false)} onAddVendor={handleSaveVendor} />
        <Toaster position="top-right" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box className="flex flex-col h-[calc(100vh-80px)]">
        {/* Combined Tool Bar */}
        <Box className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 border border-gray-100 shadow-sm bg-white mb-4">
          {/* Filters Area */}
          <Box className="flex flex-col sm:flex-row xl:flex-row items-start sm:items-end gap-3 w-full lg:w-auto">
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

            <Box className="flex flex-col sm:flex-row items-end gap-3 w-full sm:w-auto">
              <TextField
                type="date"
                size="small"
                label="From"
                InputLabelProps={{ shrink: true }}
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setPage(0); }}
                className="w-full sm:w-40"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />
              <TextField
                type="date"
                size="small"
                label="To"
                InputLabelProps={{ shrink: true }}
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setPage(0); }}
                className="w-full sm:w-40"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />
              <Button
                size="small"
                variant="text"
                startIcon={<FiRefreshCw />}
                onClick={handleResetFilters}
                className="text-blue-600 normal-case font-medium hover:bg-blue-50 px-3 h-[40px] shrink-0"
              >
                Reset
              </Button>
            </Box>
          </Box>

          {/* Actions Area */}
          <Box className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0">
            <Tooltip title="Download Template">
              <Button variant="outlined" onClick={handleDownloadTemplate} size="small" className="flex-1 sm:flex-none normal-case border-gray-300 text-gray-700 hover:bg-gray-50 h-[40px] min-w-[44px]">
                <FiDownload size={18} />
              </Button>
            </Tooltip>
            <input id="product-excel" type="file" accept=".xlsx,.xls" style={{ display: "none" }} onChange={handleExcelUpload} />
            <Tooltip title="Import Products">
              <Button variant="outlined" onClick={() => (document.getElementById("product-excel") as HTMLInputElement).click()} size="small" className="flex-1 sm:flex-none normal-case border-gray-300 text-gray-700 hover:bg-gray-50 h-[40px] min-w-[44px]">
                <FiUpload size={18} />
              </Button>
            </Tooltip>
            <Button variant="contained" startIcon={<FiPlus />} onClick={openAddDrawer} size="small" className="w-full sm:w-auto !bg-blue-600 hover:!bg-blue-700 normal-case shadow-none h-[40px]">
              Add Product
            </Button>
          </Box>
        </Box>

        <Paper className="flex-1 flex flex-col shadow-md rounded-xl overflow-hidden border border-gray-100 bg-white">
          <TableContainer className="flex-1 overflow-auto">
            <Table stickyHeader size="medium">
              <TableHead>
                <TableRow>
                  <TableCell className="bg-gray-50 font-bold text-gray-700 py-3">Product Name</TableCell>
                  <TableCell className="bg-gray-50 font-bold text-gray-700 py-3">Type</TableCell>
                  <TableCell className="bg-gray-50 font-bold text-gray-700 py-3">
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
                  <TableCell className="bg-gray-50 font-bold text-gray-700 py-3">
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
                  <TableCell className="bg-gray-50 font-bold text-gray-700 py-3">
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
                  <TableCell className="bg-gray-50 font-bold text-gray-700 py-3">Pack Size</TableCell>
                  <TableCell className="bg-gray-50 font-bold text-gray-700 py-3">Attributes</TableCell>
                  <TableCell className="bg-gray-50 font-bold text-gray-700 py-3">Print</TableCell>
                  <TableCell className="bg-gray-50 font-bold text-gray-700 py-3 text-center">Rate</TableCell>
                  <TableCell className="bg-gray-50 font-bold text-gray-700 py-3 text-center">GST%</TableCell>
                  <TableCell className="bg-gray-50 font-bold text-gray-700 py-3 text-center">Taxable</TableCell>
                  <TableCell className="bg-gray-50 font-bold text-gray-700 py-3">Created</TableCell>
                  <TableCell align="right" className="bg-gray-50 font-bold text-gray-700 py-3">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={13} align="center" className="py-20"><CircularProgress size={30} /></TableCell></TableRow>
                ) : (products || []).length === 0 ? (
                  <TableRow><TableCell colSpan={13} align="center" className="py-20 text-gray-500 text-sm">No products found.</TableCell></TableRow>
                ) : (
                  (products || []).map((p: ProductInterface) => (
                    <TableRow key={p._id} hover className="transition-colors">
                      <TableCell className="py-3">
                        <Typography variant="body2" className="font-medium text-slate-800">{p.productName || "Unnamed Product"}</Typography>
                      </TableCell>
                      <TableCell className="py-3">
                        <Box className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-block ${p.productType === 'Packaging Item' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'}`}>
                          {p.productType === 'Packaging Item' ? 'Packaging' : 'Inventory'}
                        </Box>
                      </TableCell>
                      <TableCell className="text-gray-600 capitalize text-sm py-3">
                        {(() => {
                          if (p.categoryId && typeof p.categoryId === "object") return p.categoryId.categoryName;
                          if (typeof p.categoryId === "string") {
                            const found = categories.find((c: any) => c._id === p.categoryId);
                            return found?.categoryName || p.categoryId; // Fallback to ID if not found, but lookup tries first
                          }
                          return "N/A";
                        })()}
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm py-3">
                        {(() => {
                          if (p.vendorsId && typeof p.vendorsId === "object") return p.vendorsId.vendor_name;
                          if (typeof p.vendorsId === "string") {
                            const found = vendors.find((v: any) => v._id === p.vendorsId);
                            return found?.vendor_name || p.vendorsId;
                          }
                          return "N/A";
                        })()}
                      </TableCell>
                      <TableCell className="text-gray-600 italic text-sm py-3">
                        {p.productType === 'Inventory Item' ? (
                          (() => {
                            if (p.companyId && typeof p.companyId === "object") return p.companyId.brandName;
                            if (typeof p.companyId === "string") {
                              const found = companies.find((c: any) => c._id === p.companyId);
                              return found?.brandName || p.companyId;
                            }
                            return "N/A";
                          })()
                        ) : (
                          <Typography variant="caption" className="text-gray-400">-</Typography>
                        )}
                      </TableCell>
                      <TableCell className="py-3">
                        <Box className="flex flex-col">
                          <Typography variant="body2" className="font-medium">{p.packSize || "-"}</Typography>
                          <Typography variant="caption" className="text-gray-400">{p.unit || "-"}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell className="py-3">
                        {p.productType === "Packaging Item" ? (
                          <Box className="flex flex-col gap-0.5">
                            {p.shape && <Typography variant="caption" className="text-slate-500 block leading-tight">S: {p.shape}</Typography>}
                            {p.colour && <Typography variant="caption" className="text-slate-500 block leading-tight">C: {p.colour}</Typography>}
                            {!p.shape && !p.colour && <Typography variant="caption" className="text-gray-400">-</Typography>}
                          </Box>
                        ) : (
                          <Typography variant="caption" className="text-gray-400">-</Typography>
                        )}
                      </TableCell>
                      <TableCell className="py-3">
                        {p.productType === "Packaging Item" ? (
                          <Box className={`px-2 py-0.5 rounded-md text-[10px] font-bold inline-block ${p.printStatus === 'Non Print' ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-700'}`}>
                            {p.printStatus || "N/A"}
                          </Box>
                        ) : (
                          <Typography variant="caption" className="text-gray-400">-</Typography>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-medium py-3">₹{p.perUnitRate}</TableCell>
                      <TableCell className="text-center text-gray-600 py-3">{p.gstPct}%</TableCell>
                      <TableCell className="text-center font-bold text-blue-600 py-3">₹{p.taxableValue}</TableCell>
                      <TableCell className="text-gray-500 text-xs py-3">
                        {p.createdAt ? dayjs(p.createdAt).format("DD/MM/YYYY") : "-"}
                      </TableCell>
                      <TableCell align="right" className="py-3">
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

          <Box className="border-t border-gray-200 bg-gray-50/50 p-1">
            <TablePagination
              component="div"
              count={productsResponse?.total || 0}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[25, 50, 100]}
              className="text-sm text-gray-600"
            />
          </Box>
        </Paper>





        {/* QUICK ADD MODALS */}
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

        <Toaster position="top-right" />
      </Box>
    </AdminLayout>
  );
}
