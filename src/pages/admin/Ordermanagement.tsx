import {
  Box,
  Button,
  Checkbox,
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
import dayjs from "dayjs";
import { useEffect, useMemo, useState, type JSX } from "react";
import { FiSend, FiSearch, FiRefreshCw, FiFilter } from "react-icons/fi";
import { AdminLayout } from "../../layouts/AdminLayout";
import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";

import {
  addOrder,
  getOrdersProduct,
  selectOrderState,
  type Order,
  type OrderPostData,
} from "../../redux/slices/orderSlice";

import { getCategories, selectCategories } from "../../redux/slices/categorySlice";
import { getCompanies, selectCompanies } from "../../redux/slices/companySlice";
import { getVendorNameList, selectVendorNames } from "../../redux/slices/vendorSlice";

export default function OrderManagementPage(): JSX.Element {
  const dispatch = useAppDispatch();

  // Orders
  const orderState = useAppSelector(selectOrderState);
  const ordersList: Order[] = orderState.ordersProductList || [];
  const ordersResponse = orderState.allOrdersData;

  // Lookups
  const categories = useAppSelector(selectCategories) || [];
  const vendors = useAppSelector(selectVendorNames) || [];
  const companies = useAppSelector(selectCompanies) || [];

  // Filters
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Selection & Qty
  const [selected, setSelected] = useState<string[]>([]);
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({});

  // Popover States
  const [catAnchor, setCatAnchor] = useState<null | HTMLElement>(null);
  const [vendorAnchor, setVendorAnchor] = useState<null | HTMLElement>(null);
  const [brandAnchor, setBrandAnchor] = useState<null | HTMLElement>(null);
  
  const [catSearch, setCatSearch] = useState("");
  const [vendorSearch, setVendorSearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");

  // Load dropdowns
  useEffect(() => {
    dispatch(getCategories({ page: 1, limit: 1000 }));
    dispatch(getVendorNameList());
    dispatch(getCompanies({ page: 1, limit: 1000 }));
  }, [dispatch]);

  // Fetch products
  useEffect(() => {
    dispatch(
      getOrdersProduct({
        search,
        page: page + 1,
        limit: rowsPerPage,
        category: categoryId,
        vendor: vendorId,
        brand: companyId,
        fromDate,
        toDate
      })
    );
  }, [dispatch, page, rowsPerPage, search, categoryId, vendorId, companyId, fromDate, toDate]);

  // Selection Logic
  const toggleRow = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selected.length === ordersList.length) {
      setSelected([]);
    } else {
      setSelected(ordersList.map((p) => p._id));
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearch("");
    setCategoryId("");
    setVendorId("");
    setCompanyId("");
    setFromDate("");
    setToDate("");
    setPage(0);
  };

  // Send order
  const handleSendOrder = async () => {
    const selectedProducts = ordersList.filter(p => selected.includes(p._id) && (qtyMap[p._id] || 0) > 0);
    
    if (selectedProducts.length === 0) return;

    // Construct WhatsApp message
    let message = "📦 *New Order Details*:\n\n";
    selectedProducts.forEach((p, index) => {
      const qty = qtyMap[p._id];
      const brand = p.companyId?.brandName || "N/A";
      message += `${index + 1}. *${p.productName}*\n   Brand: ${brand}\n   Qty: ${qty}\n\n`;
    });

    const phoneNumber = "7668955567";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    const payload: OrderPostData[] = selectedProducts.map(p => ({
      productId: p._id,
      orderQty: qtyMap[p._id]
    }));

    await dispatch(addOrder(payload));
    
    // Open WhatsApp
    window.open(whatsappUrl, "_blank");

    setSelected([]);
    setQtyMap({});
    // fetch is handled by useEffect due to state changes if necessary
  };

  // Filter Search Logic
  const filteredCats = useMemo(() => 
    categories.filter(c => (c.categoryName || "").toLowerCase().includes(catSearch.toLowerCase())),
    [categories, catSearch]
  );

  const filteredVendors = useMemo(() => 
    vendors.filter(v => (v.vendor_name || "").toLowerCase().includes(vendorSearch.toLowerCase())),
    [vendors, vendorSearch]
  );

  const filteredBrands = useMemo(() => 
    companies.filter(c => (c.brandName || "").toLowerCase().includes(brandSearch.toLowerCase())),
    [companies, brandSearch]
  );

  return (
    <AdminLayout>
      <div>
        {/* Compact Filter Row */}
        <Box className="flex flex-wrap items-center gap-4 p-4 border border-gray-100 shadow-sm">
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

          <Box className="ml-auto">
            <Button
              variant="contained"
              startIcon={<FiSend />}
              disabled={selected.length === 0 || selected.some(id => !(qtyMap[id]))}
              onClick={handleSendOrder}
            >
              Send Order ({selected.length})
            </Button>
          </Box>
        </Box>

        {/* Clean Table */}
        <Paper className="shadow-md rounded-xl overflow-hidden border border-gray-100">
          <TableContainer>
            <Table>
              <TableHead className="bg-gray-50">
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={
                        ordersList.length > 0 &&
                        selected.length === ordersList.length
                      }
                      onChange={toggleAll}
                    />
                  </TableCell>
                  <TableCell className="font-bold">Product</TableCell>
                  <TableCell className="font-bold">
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
                  <TableCell className="font-bold">
                    <Box className="flex items-center gap-2">
                      Vendor
                      <IconButton size="small" onClick={(e) => setVendorAnchor(e.currentTarget)}>
                        <FiFilter size={14} className={vendorId ? "text-blue-600" : "text-gray-400"} />
                      </IconButton>
                    </Box>
                    <Popover
                      open={Boolean(vendorAnchor)}
                      anchorEl={vendorAnchor}
                      onClose={() => setVendorAnchor(null)}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                      PaperProps={{ sx: { minWidth: 260, shadow: 4, borderRadius: 2, overflow: 'hidden', mt: 1 } }}
                    >
                      <Box className="p-2 border-b bg-gray-50">
                        <TextField
                          placeholder="Search Vendor..."
                          size="small"
                          fullWidth
                          variant="outlined"
                          value={vendorSearch}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVendorSearch(e.target.value)}
                          InputProps={{
                            startAdornment: <FiSearch size={14} className="text-gray-400 mr-2" />,
                            sx: { bgcolor: 'white' }
                          }}
                        />
                      </Box>
                      <List sx={{ maxHeight: 300, overflow: 'auto', py: 0 }}>
                        <ListItem disablePadding>
                          <ListItemButton 
                            onClick={() => { setVendorId(""); setVendorAnchor(null); }} 
                            selected={!vendorId}
                          >
                            <ListItemText primary="All Vendors" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                          </ListItemButton>
                        </ListItem>
                        {filteredVendors.map((v) => (
                          <ListItem key={v._id} disablePadding>
                            <ListItemButton 
                              onClick={() => { setVendorId(v._id); setVendorAnchor(null); }} 
                              selected={vendorId === v._id}
                            >
                              <ListItemText primary={v.vendor_name} primaryTypographyProps={{ fontSize: '12px' }} />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    </Popover>
                  </TableCell>
                  <TableCell className="font-bold">
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
                          placeholder="Search Company..."
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
                  <TableCell className="font-bold">Current Qty</TableCell>
                  <TableCell className="font-bold" style={{ width: 140 }}>Order Qty</TableCell>
                  <TableCell className="font-bold">Created</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {orderState.loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" className="py-10">
                      <CircularProgress size={30} />
                      <Typography className="mt-2 text-gray-500 text-sm">Loading products...</Typography>
                    </TableCell>
                  </TableRow>
                ) : ordersList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" className="py-10 text-gray-500">
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  ordersList.map((p) => {
                    const pid = p._id;
                    const isSelected = selected.includes(pid);

                    return (
                      <TableRow key={pid} hover selected={isSelected}>
                        <TableCell padding="checkbox">
                          <Checkbox 
                            color="primary" 
                            checked={isSelected} 
                            onChange={() => toggleRow(pid)} 
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" className="font-medium">{p.productName}</Typography>
                          <Typography variant="caption" className="text-gray-500">{p.packSize} | {p.unit}</Typography>
                        </TableCell>
                        <TableCell className="capitalize text-gray-600">{p.categoryId?.categoryName || "N/A"}</TableCell>
                        <TableCell className="text-gray-600">{p.vendorsId?.vendor_name}</TableCell>
                        <TableCell className="text-gray-600 italic">{p.companyId?.brandName}</TableCell>
                        <TableCell className="text-center">{p.currentPurchaseQty ?? "-"}</TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={qtyMap[pid] || ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const val = Number(e.target.value);
                              setQtyMap(prev => ({ ...prev, [pid]: val }));
                              if (val > 0) {
                                if (!selected.includes(pid)) setSelected(prev => [...prev, pid]);
                              } else {
                                setSelected(prev => prev.filter(id => id !== pid));
                              }
                            }}
                            sx={{ 
                              "& .MuiInputBase-input": { 
                                py: 0.5, 
                                px: 1, 
                                textAlign: 'center',
                                "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
                                  display: "none",
                                },
                                "&": {
                                  MozAppearance: "textfield",
                                },
                              } 
                            }}
                          />
                        </TableCell>
                        <TableCell className="text-gray-500 text-xs">
                          {p.createdAt ? dayjs(p.createdAt).format("DD/MM/YYYY") : "-"}
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
            count={ordersResponse?.total ?? 0}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(0);
            }}
            className="border-t bg-gray-50"
          />
        </Paper>
      </div>
    </AdminLayout>
  );
}
