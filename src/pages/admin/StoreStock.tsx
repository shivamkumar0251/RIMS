import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  List,
  ListItem,
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
  Typography,
} from "@mui/material";
import React, { useEffect, useState, useMemo } from "react";
import { FiSearch, FiRefreshCw, FiFilter, FiCheck, FiX } from "react-icons/fi";
import { AdminLayout } from "../../layouts/AdminLayout";
import { toast } from "react-hot-toast";
import { ExpiryBadge } from "../../components/common/ExpiryBadge";

import {
  getStoreStocks,
  selectStoreStockState,
  updateStoreStock
} from "../../redux/slices/storeStockSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";

import { getCategories, selectCategories } from "../../redux/slices/categorySlice";
import { getCompanies, selectCompanies } from "../../redux/slices/companySlice";

const StoreStockComponent: React.FC = () => {
  const dispatch = useAppDispatch();

  const { storeStocks, loading, allStoreStocksData } =
    useAppSelector(selectStoreStockState);

  const categories = useAppSelector(selectCategories);
  const brands = useAppSelector(selectCompanies);

  // ---------------- Filters ----------------
  const [categoryId, setCategoryId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ---------------- Pagination ----------------
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  // ---------------- Popover States ----------------
  const [catAnchor, setCatAnchor] = useState<null | HTMLElement>(null);
  const [brandAnchor, setBrandAnchor] = useState<null | HTMLElement>(null);

  const [catSearch, setCatSearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");

  // ---------------- Inline Edit State ----------------
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // ---------------- Load Dropdowns ----------------
  useEffect(() => {
    dispatch(getCategories({ page: 1, limit: 1000 }));
    dispatch(getCompanies({ page: 1, limit: 1000 }));
  }, [dispatch]);

  // ---------------- Load Store Stocks ----------------
  useEffect(() => {
    dispatch(
      getStoreStocks({
        page: page + 1,
        limit,
        search,
        categoryId,
        companyId,
        fromDate,
        toDate
      })
    );
  }, [dispatch, page, limit, search, categoryId, companyId, fromDate, toDate]);

  // ---------------- Stock Alert ----------------
  const getStockStatus = (qty: number, alert: number) => {
    if (qty === 0) return <Chip label="Out of Stock" color="error" size="small" />;
    if (qty <= alert) return <Chip label="Low Stock" color="warning" size="small" />;
    return <Chip label="In Stock" color="success" size="small" />;
  };

  const handleResetFilters = () => {
    setSearch("");
    setCategoryId("");
    setCompanyId("");
    setFromDate("");
    setToDate("");
    setPage(0);
  };

  // ---------------- Filter Search Logic ----------------
  const filteredCats = useMemo(() =>
    categories.filter(c => (c.categoryName || "").toLowerCase().includes(catSearch.toLowerCase())),
    [categories, catSearch]
  );

  const filteredBrands = useMemo(() =>
    brands.filter(b => (b.brandName || "").toLowerCase().includes(brandSearch.toLowerCase())),
    [brands, brandSearch]
  );

  const handleStartEdit = (id: string, currentVal: string) => {
    setEditingId(id);
    setEditDate(currentVal || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditDate("");
  };

  const handleSaveExpiry = async (id: string) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await dispatch(updateStoreStock({
        storeStockId: id,
        storeStockData: { expiryDate: editDate }
      })).unwrap();

      // Force refetch to ensure UI is in sync with DB
      dispatch(getStoreStocks({
        page: page + 1,
        limit,
        search,
        categoryId,
        companyId,
        fromDate,
        toDate
      }));

      toast.success("Expiry date updated successfully");
      setEditingId(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to update expiry date");
    } finally {
      setIsUpdating(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <AdminLayout>
      <Box className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        {/* Compact Filter Row */}
        <Box className="flex flex-wrap items-center gap-4 p-4 border-b border-gray-100 bg-white shadow-sm shrink-0">
          <TextField
            placeholder="Search product..."
            size="small"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FiSearch className="text-gray-400" />
                </InputAdornment>
              ),
            }}
            className="w-full sm:w-64"
          />

          <TextField
            type="date"
            size="small"
            label="From"
            InputLabelProps={{ shrink: true }}
            value={fromDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFromDate(e.target.value)}
            className="w-full sm:w-64"
          />

          <TextField
            type="date"
            size="small"
            label="To"
            InputLabelProps={{ shrink: true }}
            value={toDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToDate(e.target.value)}
            className="w-full sm:w-64"
          />

          <Button
            size="small"
            variant="text"
            startIcon={<FiRefreshCw />}
            onClick={handleResetFilters}
            className="text-blue-600 normal-case"
          >
            Reset
          </Button>
        </Box>

        {/* Clean Table */}
        <Box className="flex-1 flex flex-col overflow-hidden p-2 sm:p-3">
          <Paper className="flex-1 flex flex-col shadow-md rounded-xl overflow-hidden border border-gray-100 bg-white">
            <TableContainer className="flex-1 overflow-auto">
              <Table stickyHeader>
                <TableHead className="bg-gray-50/80 backdrop-blur-md z-10">
                  <TableRow>
                    <TableCell className="font-bold bg-inherit">Product</TableCell>
                    <TableCell className="font-bold bg-inherit">
                      <Box className="flex items-center gap-2">
                        Category
                        <IconButton size="small" onClick={(e) => setCatAnchor(e.currentTarget)}>
                          <FiFilter size={14} className={categoryId ? "text-blue-600" : "text-gray-400"} />
                        </IconButton>
                      </Box>
                      <Popover
                        open={Boolean(catAnchor)}
                        anchorEl={catAnchor}
                        onClose={() => setCatAnchor(null)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                        PaperProps={{ sx: { minWidth: 240, shadow: 4, borderRadius: 2, overflow: 'hidden', mt: 1 } }}
                      >
                        <Box className="p-2 border-b bg-gray-50">
                          <TextField
                            placeholder="Search Category..."
                            size="small"
                            fullWidth
                            variant="outlined"
                            value={catSearch}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCatSearch(e.target.value)}
                            InputProps={{
                              startAdornment: <FiSearch size={14} className="text-gray-400 mr-2" />,
                              sx: { bgcolor: 'white' }
                            }}
                          />
                        </Box>
                        <List sx={{ maxHeight: 300, overflow: 'auto', py: 0 }}>
                          <ListItem disablePadding>
                            <ListItemButton
                              onClick={() => { setCategoryId(""); setCatAnchor(null); }}
                              selected={!categoryId}
                            >
                              <ListItemText primary="All Categories" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                            </ListItemButton>
                          </ListItem>
                          {filteredCats.map((c) => (
                            <ListItem key={c._id} disablePadding>
                              <ListItemButton
                                onClick={() => { setCategoryId(c._id); setCatAnchor(null); }}
                                selected={categoryId === c._id}
                              >
                                <ListItemText primary={c.categoryName} primaryTypographyProps={{ fontSize: '0.875rem' }} />
                              </ListItemButton>
                            </ListItem>
                          ))}
                        </List>
                      </Popover>
                    </TableCell>
                    <TableCell className="font-bold bg-inherit">
                      <Box className="flex items-center gap-2">
                        Brand
                        <IconButton size="small" onClick={(e) => setBrandAnchor(e.currentTarget)}>
                          <FiFilter size={14} className={companyId ? "text-blue-600" : "text-gray-400"} />
                        </IconButton>
                      </Box>
                      <Popover
                        open={Boolean(brandAnchor)}
                        anchorEl={brandAnchor}
                        onClose={() => setBrandAnchor(null)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                        PaperProps={{ sx: { minWidth: 240, shadow: 4, borderRadius: 2, overflow: 'hidden', mt: 1 } }}
                      >
                        <Box className="p-2 border-b bg-gray-50">
                          <TextField
                            placeholder="Search Brand..."
                            size="small"
                            fullWidth
                            variant="outlined"
                            value={brandSearch}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBrandSearch(e.target.value)}
                            InputProps={{
                              startAdornment: <FiSearch size={14} className="text-gray-400 mr-2" />,
                              sx: { bgcolor: 'white' }
                            }}
                          />
                        </Box>
                        <List sx={{ maxHeight: 300, overflow: 'auto', py: 0 }}>
                          <ListItem disablePadding>
                            <ListItemButton
                              onClick={() => { setCompanyId(""); setBrandAnchor(null); }}
                              selected={!companyId}
                            >
                              <ListItemText primary="All Brands" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                            </ListItemButton>
                          </ListItem>
                          {filteredBrands.map((b) => (
                            <ListItem key={b._id} disablePadding>
                              <ListItemButton
                                onClick={() => { setCompanyId(b._id); setBrandAnchor(null); }}
                                selected={companyId === b._id}
                              >
                                <ListItemText primary={b.brandName} primaryTypographyProps={{ fontSize: '0.875rem' }} />
                              </ListItemButton>
                            </ListItem>
                          ))}
                        </List>
                      </Popover>
                    </TableCell>
                    <TableCell className="font-bold bg-inherit">Unit</TableCell>
                    <TableCell className="font-bold text-center bg-inherit">Available Qty</TableCell>
                    <TableCell className="font-bold text-center bg-inherit">Status</TableCell>
                    <TableCell className="font-bold bg-inherit">Expiry Date</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" className="py-10">
                        <CircularProgress size={30} />
                        <Typography className="mt-2 text-gray-500 text-sm">Loading stocks...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : storeStocks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" className="py-10 text-gray-500 text-sm">
                        No products found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    storeStocks.map((row) => {
                      const combinedExpiry = row.expiryDate || row.productId?.expiryDate;

                      return (
                        <TableRow key={row._id} hover>
                          <TableCell>
                            <Typography variant="body2" className="font-medium">{row.productId?.productName}</Typography>
                            <Typography variant="caption" className="text-gray-500">{row.productId?.packSize}</Typography>
                          </TableCell>
                          <TableCell className="capitalize text-gray-600">{row.productId?.categoryId?.categoryName || "N/A"}</TableCell>
                          <TableCell className="text-gray-600 italic">{row.productId?.companyId?.brandName || "N/A"}</TableCell>
                          <TableCell className="text-gray-600">{row.productId?.unit || "N/A"}</TableCell>
                          <TableCell className="text-center font-bold text-blue-600">{row.closingStock}</TableCell>
                          <TableCell className="text-center">
                            {getStockStatus(row.closingStock, row.productId?.stockAlert || 0)}
                          </TableCell>
                          <TableCell>
                            <Box className="flex items-center gap-2 group/cell min-h-[40px]">
                              {editingId === row._id ? (
                                <Box className="flex items-center gap-1">
                                  <TextField
                                    type="date"
                                    size="small"
                                    variant="outlined"
                                    value={editDate}
                                    onChange={(e) => setEditDate(e.target.value)}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px', fontSize: '12px' }, width: 130 }}
                                  />
                                  <IconButton
                                    size="small"
                                    onClick={() => handleSaveExpiry(row._id)}
                                    disabled={isUpdating}
                                    className="text-green-600 hover:bg-green-50"
                                  >
                                    <FiCheck size={16} />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={handleCancelEdit}
                                    className="text-red-500 hover:bg-red-50"
                                  >
                                    <FiX size={16} />
                                  </IconButton>
                                </Box>
                              ) : (
                                <Box
                                  onClick={() => handleStartEdit(row._id, combinedExpiry || "")}
                                  className="flex-1 cursor-pointer hover:bg-slate-50 transition-colors py-1 px-2 rounded-md min-h-[40px] flex flex-col justify-center"
                                >
                                  <ExpiryBadge expiryDate={combinedExpiry} />
                                </Box>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={allStoreStocksData?.pagination.total || 0}
              page={page}
              onPageChange={(_: React.MouseEvent<HTMLButtonElement> | null, p: number) => setPage(p)}
              rowsPerPage={limit}
              onRowsPerPageChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setLimit(parseInt(e.target.value, 10)); setPage(0); }}
              className="border-t bg-gray-50"
            />
          </Paper>
        </Box>
      </Box>
    </AdminLayout>
  );
};

export default StoreStockComponent;
