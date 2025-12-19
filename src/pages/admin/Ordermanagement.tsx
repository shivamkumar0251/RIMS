// ✅ OPTION A — CORRECT MAPPING

import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import { useEffect, useMemo, useState, type JSX } from "react";
import { FiSend } from "react-icons/fi";
import { AdminLayout } from "../../layouts/AdminLayout";
import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";

// Order slice
import {
  addOrder,
  getOrdersProduct,
  selectOrderState,
  type Order,
  type OrderPostData,
} from "../../redux/slices/orderSlice";

// Category, Company, Vendor slices
import { getCategories, selectCategories } from "../../redux/slices/categorySlice";
import { getCompanies, selectCompanies } from "../../redux/slices/companySlice";
import { getVendorNameList, selectVendorNames } from "../../redux/slices/vendorSlice";

export default function OrderManagementPage(): JSX.Element {
  const dispatch = useAppDispatch();

  // Orders
  const orderState = useAppSelector(selectOrderState);
  const ordersList: Order[] = orderState.ordersProductList || [];
  const ordersResponse = orderState.allOrdersData;

  // Lookups — OPTION A (Correct)
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
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [orderQtys, setOrderQtys] = useState<Record<string, number>>({});

  // Load dropdowns
  useEffect(() => {
    dispatch(getCategories({ page: 1, limit: 1000 }));
    dispatch(getVendorNameList());
    dispatch(getCompanies({ page: 1, limit: 1000 }));
  }, [dispatch]);

  // Fetch products on filter change
  useEffect(() => {
    fetchProducts();
    setSelectedIds({});
    setOrderQtys({});
  }, [page, rowsPerPage, search, categoryId, vendorId, companyId, fromDate, toDate]);

  const fetchProducts = () => {
    dispatch(
      getOrdersProduct({
        search: search || '',
        page: page + 1,
        limit: rowsPerPage,
        category: categoryId || '',
        vendor: vendorId || '',
        brand: companyId || '',
        fromDate: fromDate || '',
        toDate: toDate || ''
      })
    );
  };

  // Dropdown Map — OPTION A
  const categoryOptions = categories.map((c) => ({
    id: c._id,
    label: c.categoryName
  }));

  const vendorOptions = vendors.map((v) => ({
    id: v._id,
    label: v.vendor_name
  }));

  const companyOptions = companies.map((c) => ({
    id: c._id,
    label: c.brandName
  }));

  // Select single row
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = { ...prev, [id]: !prev[id] };

      if (!next[id]) {
        const oq = { ...orderQtys };
        delete oq[id];
        setOrderQtys(oq);
      } else {
        setOrderQtys((prevQty) => ({ ...prevQty, [id]: prevQty[id] ?? 1 }));
      }

      return next;
    });
  };

  // Select all visible
  const toggleSelectAllVisible = () => {
    const ids = ordersList.map((p) => p._id);
    const allSelected = ids.every((id) => selectedIds[id]);

    if (allSelected) {
      const newSel = { ...selectedIds };
      const newQty = { ...orderQtys };
      ids.forEach((id) => {
        delete newSel[id];
        delete newQty[id];
      });
      setSelectedIds(newSel);
      setOrderQtys(newQty);
    } else {
      const newSel = { ...selectedIds };
      const newQty = { ...orderQtys };
      ids.forEach((id) => {
        newSel[id] = true;
        newQty[id] = newQty[id] ?? 1;
      });
      setSelectedIds(newSel);
      setOrderQtys(newQty);
    }
  };

  // Change order qty
  const changeOrderQty = (id: string, value: number) => {
    if (value < 0) return;
    setOrderQtys((prev) => ({ ...prev, [id]: value }));
    setSelectedIds((prev) => ({ ...prev, [id]: true }));
  };

  // Send order
  const handleSendOrder = async () => {
    const selected = Object.keys(selectedIds).filter((id) => selectedIds[id]);

    if (selected.length === 0) {
      alert("Select at least one product and enter order quantity.");
      return;
    }

    const payload: OrderPostData[] = selected.map((id) => ({
      productId: id,
      orderQty: Number(orderQtys[id] || 0),
    })).filter((p) => p.orderQty > 0);

    if (!payload.length) {
      alert("Order qty must be > 0");
      return;
    }

    await dispatch(addOrder(payload));

    alert("Order sent successfully");
    setSelectedIds({});
    setOrderQtys({});
    fetchProducts();
  };

  const visibleSelectedCount = useMemo(
    () => Object.values(selectedIds).filter(Boolean).length,
    [selectedIds]
  );
  return (
    <AdminLayout>
      <Box className="p-6">

        {/* Header */}
        <Box className="flex items-center justify-between mb-4">
          <Typography variant="h6">Order Management</Typography>
          <Box className="flex gap-2">
            <Button
              variant="contained"
              color="secondary"
              startIcon={<FiSend />}
              disabled={visibleSelectedCount === 0}
              onClick={handleSendOrder}
            >
                Send Order ({visibleSelectedCount})
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Paper className="p-4 mb-4">
          <Grid container spacing={2}>
            {/* Search */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Search Product"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              />
            </Grid>

            {/* Category */}
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                fullWidth
                select
                size="small"
                label="Category"
                value={categoryId}
                onChange={(e) => { setCategoryId(e.target.value); setPage(0); }}
              >
                <MenuItem value="">All</MenuItem>
                {categoryOptions.map(c =>
                  <MenuItem key={c.id} value={c.id}>{c.label}</MenuItem>
                )}
              </TextField>
            </Grid>

            {/* Vendor */}
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                fullWidth
                select
                size="small"
                label="Vendor"
                value={vendorId}
                onChange={(e) => { setVendorId(e.target.value); setPage(0); }}
              >
                <MenuItem value="">All</MenuItem>
                {vendorOptions.map(v =>
                  <MenuItem key={v.id} value={v.id}>{v.label}</MenuItem>
                )}
              </TextField>
            </Grid>

            {/* Company */}
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                fullWidth
                select
                size="small"
                label="Company"
                value={companyId}
                onChange={(e) => { setCompanyId(e.target.value); setPage(0); }}
              >
                <MenuItem value="">All</MenuItem>
                {companyOptions.map(c =>
                  <MenuItem key={c.id} value={c.id}>{c.label}</MenuItem>
                )}
              </TextField>
            </Grid>

            {/* Date filters */}
            <Grid size={{ xs: 6, md: 1 }}>
              <TextField
                fullWidth
                type="date"
                size="small"
                label="From"
                InputLabelProps={{ shrink: true }}
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setPage(0); }}
              />
            </Grid>

            <Grid size={{ xs: 6, md: 1 }}>
              <TextField
                fullWidth
                type="date"
                size="small"
                label="To"
                InputLabelProps={{ shrink: true }}
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setPage(0); }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={
                        ordersList.length > 0 &&
                        ordersList.every((p) => selectedIds[p._id])
                      }
                      indeterminate={
                        ordersList.some((p) => selectedIds[p._id]) &&
                        !ordersList.every((p) => selectedIds[p._id])
                      }
                      onChange={toggleSelectAllVisible}
                    />
                  </TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Current Purchase Qty</TableCell>
                  {/* <TableCell>Order Qty</TableCell> */}
                  <TableCell>Created</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {orderState.loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : ordersList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">No Products Found</TableCell>
                  </TableRow>
                ) : (
                  ordersList.map((p) => {
                    const isSelected = !!selectedIds[p._id];
                    const qty = orderQtys[p._id] ?? 0;

                    return (
                      <TableRow key={p._id}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isSelected}
                            onChange={() => toggleSelect(p._id)}
                          />
                        </TableCell>

                        <TableCell>{p.productName}</TableCell>
                        <TableCell>{(p.categoryId)?.categoryName}</TableCell>
                        <TableCell>{(p.vendorsId)?.vendor_name}</TableCell>
                        <TableCell>{(p.companyId)?.brandName}</TableCell>
                        {/* <TableCell>{p.quantity}</TableCell> */}
                        <TableCell>{p.currentPurchaseQty ?? "-"}</TableCell>

                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={qty}
                            inputProps={{ min: 0 }}
                            onChange={(e) =>
                              changeOrderQty(p._id, Number(e.target.value))
                            }
                            disabled={!isSelected}
                            sx={{ width: 120 }}
                          />
                        </TableCell>

                        <TableCell>
                          {p.createdAt
                            ? new Date(p.createdAt).toLocaleDateString()
                            : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            page={page}
            component="div"
            count={ordersResponse?.total ?? 0}
            rowsPerPage={rowsPerPage}
            onPageChange={(_, p) => setPage(p)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(0);
            }}
          />
        </Paper>
      </Box>
    </AdminLayout>
  );
}
