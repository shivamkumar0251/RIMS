import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Drawer,
  IconButton,
  InputAdornment,
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
import { useMemo, useState, useEffect } from "react";
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
import { AdminLayout } from "../../layouts/AdminLayout";
import DateRangeFilter, { type
  DateRangeValue,
} from "../../components/common/DateRangeFilter";
import dayjs from "dayjs";
import { getKitchenStocks, addKitchenStock, updateKitchenStock, deleteKitchenStock, selectKitchenStocks, selectKitchenStockLoading, selectAllKitchenStocksData } from "../../redux/slices/kitchenStockSlice";
import { getProducts, selectProducts } from "../../redux/slices/productSlice";
import type { AppDispatch } from "../../redux/store/store";
import type { KitchenStock } from "../../redux/slices/kitchenStockSlice";
import type { Product } from "../../redux/slices/productSlice";

export default function KitchenStock() {
  const dispatch = useDispatch<AppDispatch>();
  const kitchenStocks = useSelector(selectKitchenStocks);
  const loading = useSelector(selectKitchenStockLoading);
  const allKitchenStocksData = useSelector(selectAllKitchenStocksData);
  const products = useSelector(selectProducts);

  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRangeValue>([null, null]);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [openingStock, setOpeningStock] = useState<number>(0);
  const [perUnitRate, setPerUnitRate] = useState<number>(0);
  const [gst, setGst] = useState<number>(5);

  // Fetch initial data
  useEffect(() => {
    dispatch(getProducts({ page: 1, limit: 1000 }));
  }, [dispatch]);

  // Fetch kitchen stocks when filters change
  useEffect(() => {
    const fromDate = dateRange[0] ? dateRange[0].startOf('day').toISOString() : '';
    const toDate = dateRange[1] ? dateRange[1].endOf('day').toISOString() : '';
    dispatch(getKitchenStocks({ 
      search: searchTerm, 
      page, 
      limit: rowsPerPage,
      fromDate,
      toDate,
    }));
  }, [dispatch, searchTerm, page, rowsPerPage, dateRange]);

  const totalPages = allKitchenStocksData?.totalPages || 1;

  // Convert products for Autocomplete
  const productOptions = useMemo(() => {
    return products.map((p: Product) => {
      const pData = p as Record<string, unknown>;
      return {
        _id: p._id,
        name: String(pData.productName || pData.product_name || pData.name || ''),
        category: String(pData.category || pData.categoryName || ''),
        brand: String(pData.brand || pData.brandName || pData.companyName || ''),
        packSize: String(pData.packSize || ''),
        unit: String(pData.unit || ''),
        openingStock: Number(pData.openingStock || pData.stock || 0),
        perUnitRate: Number(pData.perUnitRate || pData.price || 0),
      };
    });
  }, [products]);

  const handleAddProduct = () => {
    setEditingId(null);
    setSelectedProduct(null);
    setOpeningStock(0);
    setQuantity(0);
    setPerUnitRate(0);
    setGst(5);
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!selectedProduct) return;

    const consumedStock = Math.min(quantity, openingStock);
    const closingStock = Math.max(openingStock - consumedStock, 0);
    const taxableValue = consumedStock * perUnitRate;
    const total = taxableValue + (taxableValue * gst) / 100;

    const stockData = {
      productId: selectedProduct._id,
      productName: (selectedProduct as Record<string, unknown>).productName || (selectedProduct as Record<string, unknown>).name,
      openingStock,
      quantity,
      consumedStock,
      closingStock,
      perUnitRate,
      taxableValue,
      gst,
      total,
    };

    if (editingId) {
      await dispatch(updateKitchenStock({ kitchenStockId: editingId, kitchenStockData: stockData }));
    } else {
      await dispatch(addKitchenStock(stockData));
    }

    setDrawerOpen(false);
    setSelectedProduct(null);
    setOpeningStock(0);
    setQuantity(0);
    setPerUnitRate(0);
    setGst(5);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this kitchen stock?')) {
      await dispatch(deleteKitchenStock(id));
    }
  };

  const handleEdit = (item: KitchenStock) => {
    const itemData = item as Record<string, unknown>;
    setEditingId(item._id);
    const product = productOptions.find(p => p._id === itemData.productId);
    if (product) {
      setSelectedProduct(product as unknown as Product);
    }
    setOpeningStock(Number(itemData.openingStock || 0));
    setQuantity(Number(itemData.quantity || 0));
    setPerUnitRate(Number(itemData.perUnitRate || 0));
    setGst(Number(itemData.gst || 5));
    setDrawerOpen(true);
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setDateRange([null, null]);
    setPage(1);
    dispatch(getKitchenStocks({ search: '', page: 1, limit: rowsPerPage }));
  };

  return (
    <AdminLayout>
      <Box sx={{ p: 3, backgroundColor: "#f9fafb", minHeight: "100vh" }}>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          mb={2}
        >
          <Box
            sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}
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

            {/* ✅ Reusable Date Range Picker */}
            <DateRangeFilter
              value={dateRange}
              onChange={setDateRange}
              fullWidth={false}
              size="small"
            />
          </Box>

          {/* Actions */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              startIcon={<FiPlus />}
              onClick={handleAddProduct}
              sx={{
                transition: "0.3s",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              Add In-Kitchen
            </Button>
            <Tooltip title="Export PDF">
              <IconButton
                sx={{
                  backgroundColor: "#f44336",
                  color: "white",
                  transition: "0.3s",
                  "&:hover": {
                    backgroundColor: "#d32f2f",
                    transform: "scale(1.05)",
                  },
                }}
              >
                <FiFileText />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export Excel">
              <IconButton
                sx={{
                  backgroundColor: "#4caf50",
                  color: "white",
                  transition: "0.3s",
                  "&:hover": {
                    backgroundColor: "#388e3c",
                    transform: "scale(1.05)",
                  },
                }}
              >
                <FiTable />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton
                onClick={handleRefresh}
                sx={{
                  backgroundColor: "#2196f3",
                  color: "white",
                  transition: "0.3s",
                  "&:hover": {
                    backgroundColor: "#1976d2",
                    transform: "scale(1.05)",
                  },
                }}
              >
                <FiRefreshCw />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<FiUpload />}
              sx={{
                transition: "0.3s",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              Import
            </Button>
          </Box>
        </Box>

        {/* Table */}
        <Card sx={{ boxShadow: 4, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" mb={2}>
              Kitchen Stock List
            </Typography>

            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: "#e3f2fd" }}>
                  <TableRow>
                    <TableCell>S.No</TableCell>
                    <TableCell>Product Name</TableCell>
                    {/* <TableCell>Category</TableCell>
                    <TableCell>Brand</TableCell>
                    <TableCell>Pack Size</TableCell>
                    <TableCell>Unit</TableCell> */}
                    <TableCell>Opening Stock</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Consumed Stock</TableCell>
                    <TableCell>Closing Stock</TableCell>
                    
                    <TableCell>Created Date</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <CircularProgress size={24} sx={{ my: 2 }} />
                      </TableCell>
                    </TableRow>
                  ) : kitchenStocks.length > 0 ? (
                    kitchenStocks.map((item: KitchenStock, idx) => {
                      const itemData = item as Record<string, unknown>;
                      const productName = String(itemData.productName || itemData.name || 'N.A');
                      const openingStock = Number(itemData.openingStock || 0);
                      const quantity = Number(itemData.quantity || 0);
                      const consumedStock = Number(itemData.consumedStock || 0);
                      const closingStock = Number(itemData.closingStock || 0);
                      const createdDate = itemData.createdAt 
                        ? dayjs(String(itemData.createdAt)).format('M/D/YYYY')
                        : itemData.createdDate 
                        ? String(itemData.createdDate)
                        : 'N.A';

                      return (
                        <TableRow key={item._id}>
                          <TableCell>{(page - 1) * rowsPerPage + idx + 1}</TableCell>
                          <TableCell>{productName}</TableCell>
                          <TableCell>{openingStock}</TableCell>
                          <TableCell>{quantity}</TableCell>
                          <TableCell>{consumedStock}</TableCell>
                          <TableCell>
                            {closingStock}{" "}
                            <Typography
                              component="span"
                              color={
                                closingStock === 0
                                  ? "error"
                                  : closingStock < 10
                                  ? "warning.main"
                                  : "success.main"
                              }
                              sx={{ ml: 1, fontWeight: 600 }}
                            >
                              {closingStock === 0
                                ? "Out of Stock"
                                : closingStock < 10
                                ? "Low Stock"
                                : "In Stock"}
                            </Typography>
                          </TableCell>
                          <TableCell>{createdDate}</TableCell>
                          <TableCell align="center">
                            <Box
                              sx={{ display: "flex", gap: 1, justifyContent: "center" }}
                            >
                              <Tooltip title="Edit">
                                <IconButton
                                  sx={{
                                    color: "white",
                                    backgroundColor: "#1976d2",
                                    "&:hover": {
                                      backgroundColor: "#0d47a1",
                                      transform: "scale(1.1)",
                                    },
                                    transition: "0.3s",
                                  }}
                                  onClick={() => handleEdit(item)}
                                >
                                  <FiEdit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  sx={{
                                    color: "white",
                                    backgroundColor: "#f44336",
                                    "&:hover": {
                                      backgroundColor: "#d32f2f",
                                      transform: "scale(1.1)",
                                    },
                                    transition: "0.3s",
                                  }}
                                  onClick={() => handleDelete(item._id)}
                                >
                                  <FiTrash2 />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No kitchen stocks found
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
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Rows per page
                </Typography>
                <Select<number>
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
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
          </CardContent>
        </Card>

        {/* Drawer Form */}
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box sx={{ width: 400, p: 3 }}>
            <Typography variant="h6" mb={2}>
              Add / Edit Kitchen Stock
            </Typography>

            <Autocomplete
              options={productOptions}
              getOptionLabel={(option) => option.name || ''}
              value={selectedProduct ? productOptions.find(p => p._id === (selectedProduct as Record<string, unknown>)._id) || null : null}
              onChange={(_, newValue) => {
                if (newValue) {
                  setSelectedProduct(newValue as unknown as Product);
                  setOpeningStock(newValue.openingStock || 0);
                  setPerUnitRate(newValue.perUnitRate || 0);
                } else {
                  setSelectedProduct(null);
                  setOpeningStock(0);
                  setPerUnitRate(0);
                }
              }}
              renderInput={(params) => (
                <TextField {...params} label="Select Product" fullWidth />
              )}
              sx={{ mb: 2 }}
            />

            {selectedProduct && (
              <>
                <TextField
                  label="Category"
                  value={(selectedProduct as Record<string, unknown>).category || ''}
                  fullWidth
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Brand"
                  value={(selectedProduct as Record<string, unknown>).brand || ''}
                  fullWidth
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Pack Size"
                  value={(selectedProduct as Record<string, unknown>).packSize || ''}
                  fullWidth
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Unit"
                  value={(selectedProduct as Record<string, unknown>).unit || ''}
                  fullWidth
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />

                <TextField
                  label="Opening Stock"
                  value={openingStock}
                  type="number"
                  fullWidth
                  margin="normal"
                  onChange={(e) => setOpeningStock(Number(e.target.value) || 0)}
                />
                <TextField
                  label="Quantity"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={quantity}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setQuantity(val >= 0 ? val : 0);
                  }}
                />
                <TextField
                  label="Per Unit Rate"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={perUnitRate}
                  onChange={(e) => setPerUnitRate(Number(e.target.value) || 0)}
                />
                <TextField
                  label="GST (%)"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={gst}
                  onChange={(e) => setGst(Number(e.target.value) || 0)}
                />
              </>
            )}
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 3 }}
              onClick={handleSave}
              disabled={!selectedProduct}
            >
              Save
            </Button>
          </Box>
        </Drawer>
      </Box>
    </AdminLayout>
  );
}
