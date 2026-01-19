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
import { FiSearch, FiRefreshCw, FiFilter } from "react-icons/fi";
import { AdminLayout } from "../../layouts/AdminLayout";

import {
  getKitchenStocks,
  selectKitchenStockState,
} from "../../redux/slices/kitchenStockSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";

import { getCategories, selectCategories } from "../../redux/slices/categorySlice";
import { getCompanies, selectCompanies } from "../../redux/slices/companySlice";

const KitchenStockPage: React.FC = () => {
  const dispatch = useAppDispatch();

  const { kitchenStocks, loading, allKitchenStocksData } =
    useAppSelector(selectKitchenStockState);

  const categories = useAppSelector(selectCategories);
  const brands = useAppSelector(selectCompanies);

  // ---------------- Filters ----------------
  const [categoryId, setCategoryId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [search, setSearch] = useState("");

  // ---------------- Pagination ----------------
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  // ---------------- Popover States ----------------
  const [catAnchor, setCatAnchor] = useState<null | HTMLElement>(null);
  const [brandAnchor, setBrandAnchor] = useState<null | HTMLElement>(null);

  const [catSearch, setCatSearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");


  // ---------------- Load Dropdowns ----------------
  useEffect(() => {
    dispatch(getCategories({ page: 1, limit: 1000 }));
    dispatch(getCompanies({ page: 1, limit: 1000 }));
  }, [dispatch]);

  // ---------------- Load Kitchen Stocks ----------------
  useEffect(() => {
    dispatch(
      getKitchenStocks({
        page: page + 1,
        limit,
        search,
        categoryId,
        companyId,
      })
    );
  }, [dispatch, page, limit, search, categoryId, companyId]);

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



  // ---------------- UI ----------------
  return (
    <AdminLayout>
      <Box className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        {/* Filter Bar */}
        <Box className="flex flex-wrap items-center gap-4 p-4 border-b border-gray-100 bg-white shadow-sm shrink-0">
          <TextField
            placeholder="Search product..."
            size="small"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FiSearch className="text-gray-400" />
                </InputAdornment>
              ),
            }}
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

        {/* Clean Table Section */}
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
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" className="py-10">
                        <CircularProgress size={30} />
                        <Typography className="mt-2 text-gray-500 text-sm">Loading stocks...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : kitchenStocks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" className="py-10 text-gray-500 text-sm">
                        No products found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    kitchenStocks.map((row) => (
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
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={allKitchenStocksData?.pagination.total || 0}
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

export default KitchenStockPage;
