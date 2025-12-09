import {
  Box,
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
  Typography
} from "@mui/material";
import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiFileText,
  FiRefreshCw,
  FiSearch,
  FiTable
} from "react-icons/fi";
import { AdminLayout } from "../../layouts/AdminLayout";
import { getStoreStocks, selectStoreStocks, selectStoreStockLoading, selectAllStoreStocksData } from "../../redux/slices/storeStockSlice";
import { getCategories, selectCategories } from "../../redux/slices/categorySlice";
import { getCompanies, selectCompanies } from "../../redux/slices/companySlice";
import type { AppDispatch } from "../../redux/store/store";
import type { StoreStock } from "../../redux/slices/storeStockSlice";

// ✅ Helper function to calculate status based on quantity
const getStockStatus = (quantity: number): string => {
  if (quantity === 0) return "Out of Stock";
  if (quantity <= 10) return "Low Stock";
  return "In Stock";
};

// ✅ Component
const StoreStock: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const storeStocks = useSelector(selectStoreStocks);
  const loading = useSelector(selectStoreStockLoading);
  const allStoreStocksData = useSelector(selectAllStoreStocksData);
  const categories = useSelector(selectCategories);
  const companies = useSelector(selectCompanies);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Fetch initial data
  useEffect(() => {
    dispatch(getCategories({ page: 1, limit: 1000 }));
    dispatch(getCompanies({ page: 1, limit: 1000 }));
  }, [dispatch]);

  // Fetch store stocks when filters change
  useEffect(() => {
    dispatch(getStoreStocks({ 
      search: searchTerm, 
      page, 
      limit: rowsPerPage,
    }));
  }, [dispatch, searchTerm, page, rowsPerPage]);

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

  // ✅ Client-side filtering for category, brand, and status
  const filteredData = useMemo(() => {
    if (!storeStocks || storeStocks.length === 0) return [];
    
    return storeStocks.filter((item: StoreStock) => {
      const itemData = item as Record<string, unknown>;
      const productName = String(itemData.productName || itemData.product_name || itemData.name || '');
      const category = String(itemData.category || itemData.categoryName || '');
      const brand = String(itemData.brand || itemData.brandName || itemData.companyName || '');
      const quantity = Number(itemData.quantity || itemData.closingStock || 0);
      const status = getStockStatus(quantity);

      const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || category === selectedCategory;
      const matchesBrand = selectedBrand === "All" || brand === selectedBrand;
      const matchesStatus = selectedStatus === "All" || status === selectedStatus;

      return matchesSearch && matchesCategory && matchesBrand && matchesStatus;
    });
  }, [storeStocks, searchTerm, selectedCategory, selectedBrand, selectedStatus]);

  // ✅ Pagination
  const start = (page - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(start, start + rowsPerPage);
  const totalPages = allStoreStocksData?.totalPages || Math.ceil((filteredData.length || 0) / rowsPerPage);

  // ✅ Handlers
  const handleRefresh = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedBrand("All");
    setSelectedStatus("All");
    setPage(1);
    // Refetch data
    dispatch(getStoreStocks({ search: '', page: 1, limit: rowsPerPage }));
  };

  const safeValue = (val: unknown) =>
    val === null || val === undefined || val === "" ? "N.A" : String(val);

  return (
    <AdminLayout>
      <Box
        sx={{
          p: 3,
          bgcolor: "#f9f9f9",
          minHeight: "100vh",
          "@media (max-width:600px)": {
            p: 1.5,
          },
        }}
      >
        {/* Header Section */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          mb={2}
          sx={{
            gap: 2,
            "@media (max-width:600px)": {
              flexDirection: "column",
              alignItems: "stretch",
            },
          }}
        >
          {/* Filters */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              mb: 2,
              flexWrap: "wrap",
              "@media (max-width:600px)": {
                flexDirection: "column",
                alignItems: "stretch",
                gap: 1.5,
              },
            }}
          >
            <TextField
              placeholder="Search Product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiSearch />
                  </InputAdornment>
                ),
              }}
              sx={{
                minWidth: 250,
                "@media (max-width:600px)": {
                  width: "100%",
                },
              }}
            />

            <FormControl
              sx={{
                minWidth: 150,
                "@media (max-width:600px)": { width: "100%" },
              }}
            >
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="All">All</MenuItem>
                {categoryList.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              sx={{
                minWidth: 150,
                "@media (max-width:600px)": { width: "100%" },
              }}
            >
              <InputLabel>Brand</InputLabel>
              <Select
                value={selectedBrand}
                label="Brand"
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="All">All</MenuItem>
                {brandList.map((b) => (
                  <MenuItem key={b} value={b}>
                    {b}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* ✅ Status Filter */}
            <FormControl
              sx={{
                minWidth: 150,
                "@media (max-width:600px)": { width: "100%" },
              }}
            >
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                label="Status"
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="In Stock">In Stock</MenuItem>
                <MenuItem value="Low Stock">Low Stock</MenuItem>
                <MenuItem value="Out of Stock">Out of Stock</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Actions */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              "@media (max-width:600px)": {
                justifyContent: "center",
                width: "100%",
              },
            }}
          >
            <Tooltip title="Export PDF">
              <IconButton sx={{ backgroundColor: "#f44336", color: "white" }}>
                <FiFileText />
              </IconButton>
            </Tooltip>

            <Tooltip title="Export Excel">
              <IconButton sx={{ backgroundColor: "#4caf50", color: "white" }}>
                <FiTable />
              </IconButton>
            </Tooltip>

            <Tooltip title="Refresh">
              <IconButton
                sx={{ backgroundColor: "#2196f3", color: "white" }}
                onClick={handleRefresh}
              >
                <FiRefreshCw />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Table */}
        <TableContainer
          component={Paper}
          sx={{
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            overflowX: "auto", // ✅ Mobile horizontal scroll
          }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell>S.No</TableCell>
                <TableCell>Product Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Brand</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Closing Stock</TableCell>
                <TableCell>Per Unit Rate</TableCell>
                <TableCell>Taxable Value</TableCell>
                <TableCell>GST (%)</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    <CircularProgress size={24} sx={{ my: 2 }} />
                  </TableCell>
                </TableRow>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((item: StoreStock, index) => {
                  const itemData = item as Record<string, unknown>;
                  const productName = String(itemData.productName || itemData.product_name || itemData.name || 'N.A');
                  const category = String(itemData.category || itemData.categoryName || 'N.A');
                  const brand = String(itemData.brand || itemData.brandName || itemData.companyName || 'N.A');
                  const unit = String(itemData.unit || 'N.A');
                  const quantity = Number(itemData.quantity || itemData.closingStock || 0);
                  const perUnitRate = Number(itemData.perUnitRate || itemData.price || 0);
                  const gst = Number(itemData.gst || 0);
                  const taxableValue = quantity * perUnitRate;
                  const totalAmount = taxableValue + (taxableValue * gst / 100);
                  const status = getStockStatus(quantity);

                  return (
                    <TableRow key={item._id || item.id} hover>
                      <TableCell>{start + index + 1}</TableCell>
                      <TableCell>{safeValue(productName)}</TableCell>
                      <TableCell>{safeValue(category)}</TableCell>
                      <TableCell>{safeValue(brand)}</TableCell>
                      <TableCell>{safeValue(unit)}</TableCell>
                      <TableCell align="center">{quantity}</TableCell>
                      <TableCell>₹{safeValue(perUnitRate)}</TableCell>
                      <TableCell>₹{safeValue(taxableValue.toFixed(2))}</TableCell>
                      <TableCell>{safeValue(gst)}%</TableCell>
                      <TableCell>₹{safeValue(totalAmount.toFixed(2))}</TableCell>
                      <TableCell>
                        <Chip
                          label={status}
                          color={
                            status === "In Stock"
                              ? "success"
                              : status === "Low Stock"
                              ? "warning"
                              : "error"
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    No store stocks found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 2,
            flexWrap: "wrap",
            "@media (max-width:600px)": {
              flexDirection: "column",
              alignItems: "center",
              gap: 1.5,
            },
          }}
        >
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
      </Box>
    </AdminLayout>
  );
};

export default StoreStock;
