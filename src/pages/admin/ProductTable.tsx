import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiEdit,
  FiFileText,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTable,
  FiTrash2,
  FiUpload,
} from "react-icons/fi";
import { useLocation } from "react-router-dom";
import { AdminLayout } from "../../layouts/AdminLayout";
import ProductModal from "../../layouts/ProductModal";
import { getProducts, deleteProduct, selectProducts, selectProductLoading, selectAllProductsData } from "../../redux/slices/productSlice";
import { getCategories, selectCategories } from "../../redux/slices/categorySlice";
import { getCompanies, selectCompanies } from "../../redux/slices/companySlice";
import type { AppDispatch } from "../../redux/store/store";
import type { Product as ProductType } from "../../redux/slices/productSlice";

// ✅ MUI PRO Date Picker (Range)
import { AdapterDayjs } from "@mui/x-date-pickers-pro/AdapterDayjs";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { LocalizationProvider } from "@mui/x-date-pickers-pro/LocalizationProvider";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";

type DateRangeValue = [Dayjs | null, Dayjs | null];

const ProductTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const products = useSelector(selectProducts);
  const loading = useSelector(selectProductLoading);
  const allProductsData = useSelector(selectAllProductsData);
  const categories = useSelector(selectCategories);
  const companies = useSelector(selectCompanies);
  
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [selectedBrand, setSelectedBrand] = useState<string>("All Brands");
  const [dateRange, setDateRange] = useState<DateRangeValue>([null, null]);
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const location = useLocation();

  // Fetch initial data
  useEffect(() => {
    dispatch(getCategories({ page: 1, limit: 1000 }));
    dispatch(getCompanies({ page: 1, limit: 1000 }));
  }, [dispatch]);

  // Fetch products when filters change
  useEffect(() => {
    const fromDate = dateRange[0] ? dateRange[0].startOf('day').toISOString() : '';
    const toDate = dateRange[1] ? dateRange[1].endOf('day').toISOString() : '';
    // Combine search term with category if selected
    const searchQuery = selectedCategory !== "All Categories" 
      ? `${searchTerm} ${selectedCategory}`.trim()
      : searchTerm;
    
    dispatch(getProducts({ 
      search: searchQuery, 
      page, 
      limit: rowsPerPage,
      fromDate,
      toDate,
    }));
  }, [dispatch, searchTerm, page, rowsPerPage, dateRange, selectedCategory]);

  // ✅ Extract unique categories and brands from API data
  const categoryList = useMemo(() => {
    const uniqueCategories = new Set<string>();
    categories.forEach(cat => {
      if (cat.categoryName) uniqueCategories.add(cat.categoryName);
    });
    return Array.from(uniqueCategories).sort();
  }, [categories]);

  const brandList = useMemo(() => {
    const uniqueBrands = new Set<string>();
    companies.forEach(comp => {
      const compData = comp as Record<string, unknown>;
      if (compData.companyName && typeof compData.companyName === 'string') {
        uniqueBrands.add(compData.companyName);
      }
      if (compData.brandName && typeof compData.brandName === 'string') {
        uniqueBrands.add(compData.brandName);
      }
    });
    return Array.from(uniqueBrands).filter(Boolean).sort();
  }, [companies]);

  // ✅ Client-side filtering for brand (since API might not support brand filter)
  const filteredData = useMemo(() => {
    if (!products || products.length === 0) return [];
    
    return products.filter((item: ProductType) => {
      if (selectedBrand === "All Brands") return true;
      
      const itemData = item as Record<string, unknown>;
      return (
        itemData.brand === selectedBrand ||
        itemData.companyName === selectedBrand ||
        itemData.brandName === selectedBrand
      );
    });
  }, [products, selectedBrand]);

  // ✅ Pagination
  const startIndex = (page - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);
  const totalPages = allProductsData?.totalPages || Math.ceil((filteredData.length || 0) / rowsPerPage);

  const safeValue = (val: unknown) =>
    val === null || val === undefined || val === "" ? "N.A" : String(val);

  // ✅ Handlers
  const handleExportPDF = () => console.log("Export to PDF");
  const handleExportExcel = () => console.log("Export to Excel");
  const handleRefresh = () => {
    setSearchTerm("");
    setSelectedCategory("All Categories");
    setSelectedBrand("All Brands");
    setDateRange([null, null]);
    setPage(1);
    // Refetch data
    const fromDate = '';
    const toDate = '';
    dispatch(getProducts({ search: '', page: 1, limit: rowsPerPage, fromDate, toDate }));
  };
  const handleImportProducts = () => console.log("Import products");
  const handleAddProduct = () => setIsModalOpen(true);
  const handleEdit = () => {
    setIsModalOpen(true);
    // You can pass product data to modal if needed
  };
  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await dispatch(deleteProduct(productId));
      // Refetch products
      const fromDate = dateRange[0] ? dateRange[0].startOf('day').toISOString() : '';
      const toDate = dateRange[1] ? dateRange[1].endOf('day').toISOString() : '';
      const searchQuery = selectedCategory !== "All Categories" 
        ? `${searchTerm} ${selectedCategory}`.trim()
        : searchTerm;
      dispatch(getProducts({ 
        search: searchQuery, 
        page, 
        limit: rowsPerPage,
        fromDate,
        toDate,
      }));
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("addProduct") === "1") setIsModalOpen(true);
  }, [location.search]);

  return (
    <AdminLayout>
      <Box sx={{ p: 3, bgcolor: "#f9f9f9", minHeight: "100vh" }}>
        {/* 🔍 Filters & Actions */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          mb={2}
        >
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <TextField
              placeholder="Search Products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiSearch />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="All Categories">All Categories</MenuItem>
                {categoryList.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Brand</InputLabel>
              <Select
                value={selectedBrand}
                label="Brand"
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="All Brands">All Brands</MenuItem>
                {brandList.map((brand) => (
                  <MenuItem key={brand} value={brand}>
                    {brand}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 📅 Date Range Picker */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["DateRangePicker"]} sx={{ pt: 0 }}>
                <DateRangePicker
                  localeText={{ start: "Start Date", end: "End Date" }}
                  slotProps={{
                    textField: { size: "small", fullWidth: true },
                  }}
                  value={dateRange}
                  onChange={(newValue: DateRangeValue) => {
                    setDateRange(newValue);
                    setPage(1);
                  }}
                  className="w-full sm:w-80"
                />
              </DemoContainer>
            </LocalizationProvider>
          </Box>

          {/* 🔧 Action Buttons */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              startIcon={<FiPlus />}
              onClick={handleAddProduct}
            >
              Add Product
            </Button>
            <Tooltip title="Export PDF">
              <IconButton
                onClick={handleExportPDF}
                sx={{ backgroundColor: "#f44336", color: "white" }}
              >
                <FiFileText />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export Excel">
              <IconButton
                onClick={handleExportExcel}
                sx={{ backgroundColor: "#4caf50", color: "white" }}
              >
                <FiTable />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton
                onClick={handleRefresh}
                sx={{ backgroundColor: "#2196f3", color: "white" }}
              >
                <FiRefreshCw />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<FiUpload />}
              onClick={handleImportProducts}
            >
              Import
            </Button>
          </Box>
        </Box>

        {/* 🧾 Table */}
        <TableContainer
          component={Paper}
          sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell>S.No</TableCell>
                <TableCell>Product Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Brand</TableCell>
                <TableCell>Pack Size</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Shape</TableCell>
                <TableCell>Colour</TableCell>
                <TableCell>Print Status</TableCell>
                <TableCell>Opening Stock</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Closing Stock</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell>Per Unit Rate</TableCell>
                <TableCell>Taxable Value</TableCell>
                <TableCell>GST (%)</TableCell>
                <TableCell>Total</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={18} align="center">
                    <CircularProgress size={24} sx={{ my: 2 }} />
                  </TableCell>
                </TableRow>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((product: ProductType, index) => {
                  const p = product as Record<string, unknown>;
                  const openingStock = Number(p.openingStock) || Number(p.stock) || 0;
                  const quantity = Number(p.quantity) || 0;
                  const perUnitRate = Number(p.perUnitRate) || Number(p.price) || 0;
                  const gst = Number(p.gst) || 0;
                  const closingStock = openingStock + quantity;
                  const taxableValue = quantity * perUnitRate;
                  const total = taxableValue + taxableValue * (gst / 100);

                  return (
                    <TableRow key={product._id || product.id} hover>
                      <TableCell>{startIndex + index + 1}</TableCell>
                      <TableCell>{safeValue(p.productName || p.product_name || p.name)}</TableCell>
                      <TableCell>
                        <Chip
                          label={safeValue(p.category || p.categoryName)}
                          color="primary"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{safeValue(p.brand || p.brandName || p.companyName)}</TableCell>
                      <TableCell>{safeValue(p.packSize || p.pack_size)}</TableCell>
                      <TableCell>{safeValue(p.unit)}</TableCell>
                      <TableCell>{safeValue(p.shape)}</TableCell>
                      <TableCell>{safeValue(p.colour || p.color)}</TableCell>
                      <TableCell>{safeValue(p.printStatus || p.print_status)}</TableCell>
                      <TableCell>{safeValue(openingStock)}</TableCell>
                      <TableCell>{safeValue(quantity)}</TableCell>
                      <TableCell>{safeValue(closingStock)}</TableCell>
                      <TableCell>
                        {p.createdAt ? dayjs(p.createdAt).format("DD-MM-YYYY") : 'N.A'}
                      </TableCell>
                      <TableCell>₹{safeValue(perUnitRate)}</TableCell>
                      <TableCell>₹{safeValue(taxableValue.toFixed(2))}</TableCell>
                      <TableCell>{safeValue(gst)}%</TableCell>
                      <TableCell>₹{safeValue(total.toFixed(2))}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton
                            color="primary"
                            onClick={() => handleEdit()}
                          >
                            <FiEdit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(product._id || product.id)}
                          >
                            <FiTrash2 />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={18} align="center">
                    No products found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 📄 Pagination */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Rows per page
            </Typography>
            <Select<number>
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
              size="small"
              sx={{ minWidth: 80 }}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </Box>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>

        {isModalOpen && (
          <ProductModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
        )}
      </Box>
    </AdminLayout>
  );
};

export default ProductTable;
