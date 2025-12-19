import {
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField
} from "@mui/material";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { FiSend } from "react-icons/fi";
import { AdminLayout } from "../../layouts/AdminLayout";

import {
  addStoreStock,
  getStoreStocks,
  selectStoreStockState
} from "../../redux/slices/storeStockSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";

import { getCategories, selectCategories } from "../../redux/slices/categorySlice";
import { getCompanies, selectCompanies } from "../../redux/slices/companySlice";
import { getVendorNameList, selectVendorNames } from "../../redux/slices/vendorSlice";

import type { StoreStock, StoreStockPostData } from "../../redux/slices/storeStockSlice";

const StoreStockComponent: React.FC = () => {
  const dispatch = useAppDispatch();

  const { storeStocks, loading, allStoreStocksData } =
    useAppSelector(selectStoreStockState);

  const categories = useAppSelector(selectCategories);
  const vendors = useAppSelector(selectCompanies);
  const companies = useAppSelector(selectVendorNames);

  // ---------------- Filters ----------------
  const [categoryId, setCategoryId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ---------------- Pagination ----------------
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  // ---------------- Selected Rows ----------------
  const [selected, setSelected] = useState<Record<string, number>>({});

  // ---------------- Load Dropdowns ----------------
  useEffect(() => {
    dispatch(getCategories({ page: 1, limit: 1000 }));
    dispatch(getCompanies({ page: 1, limit: 1000 }));
    dispatch(getVendorNameList());
  }, [dispatch]);

  // ---------------- Load Store Stocks ----------------
  useEffect(() => {
    dispatch(
      getStoreStocks({
        page: page + 1,
        limit,
        search,
        categoryId,
        vendorId,
        companyId,
        fromDate,
        toDate
      })
    );
  }, [
    dispatch,
    page,
    limit,
    search,
    categoryId,
    vendorId,
    companyId,
    fromDate,
    toDate
  ]);

  // ---------------- Select Row ----------------
  const toggleSelect = (row: StoreStock) => {
    setSelected(prev => {
      const next = { ...prev };
      if (next[row.productId._id] !== undefined) {
        delete next[row.productId._id];
      } else {
        next[row.productId._id] = 0;
      }
      return next;
    });
  };

  const updateQty = (productId: string, qty: number) => {
    setSelected(prev => ({
      ...prev,
      [productId]: qty
    }));
  };

  // ---------------- Stock Alert ----------------
  const getStockStatus = (qty: number, alert: number) => {
    if (qty === 0) return <Chip label="Out of Stock" color="error" size="small" />;
    if (qty <= alert) return <Chip label="Low Stock" color="warning" size="small" />;
    return <Chip label="In Stock" color="success" size="small" />;
  };

  // ---------------- Bulk Send ----------------
  const handleSendToKitchen = () => {
    const payload: StoreStockPostData[] = Object.entries(selected)
      .filter(([_, qty]) => qty > 0)
      .map(([productId, qty]) => ({
        productId,
        qty
      }));

    if (!payload.length) return;

    dispatch(addStoreStock(payload)).then(() => {
      setSelected({});
      dispatch(getStoreStocks({ page: page + 1, limit }));
    });
  };

  const isSelected = (id: string) => selected[id] !== undefined;

  const totalRows = storeStocks.length;

  const selectedCount = storeStocks.filter(
    row => selected[row.productId._id] !== undefined
  ).length;

  const allSelected = totalRows > 0 && selectedCount === totalRows;
  const someSelected = selectedCount > 0 && selectedCount < totalRows;
  const handleSelectAll = () => {
    if (allSelected) {
      // Unselect all
      setSelected({});
    } else {
      // Select all visible rows
      const next: Record<string, number> = {};
      storeStocks.forEach(row => {
        next[row.productId._id] = selected[row.productId._id] ?? 0;
      });
      setSelected(next);
    }
  };


  // ---------------- UI ----------------
  return (
    <AdminLayout>
      <div className="p-4 space-y-4">

        {/* ---------------- Filters ---------------- */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <TextField
            size="small"
            label="Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <TextField
            size="small"
            select
            label="Category"
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {categories.map(c => (
              <MenuItem key={c._id} value={c._id}>
                {c.categoryName}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            size="small"
            select
            label="Vendor"
            value={vendorId}
            onChange={e => setVendorId(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {companies.map(v => (
              <MenuItem key={v._id} value={v._id}>
                {v.vendor_name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            size="small"
            select
            label="Brand"
            value={companyId}
            onChange={e => setCompanyId(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {vendors.map(b => (
              <MenuItem key={b._id} value={b._id}>
                {b.brandName}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            size="small"
            type="date"
            label="From"
            InputLabelProps={{ shrink: true }}
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
          />

          <TextField
            size="small"
            type="date"
            label="To"
            InputLabelProps={{ shrink: true }}
            value={toDate}
            onChange={e => setToDate(e.target.value)}
          />
        </div>

        {/* ---------------- Action Button ---------------- */}
        <div className="flex justify-end">
          <Button
            variant="contained"
            startIcon={<FiSend />}
            disabled={!Object.keys(selected).length}
            onClick={handleSendToKitchen}
          >
            Send to Kitchen Store
          </Button>
        </div>

        {/* ---------------- Table ---------------- */}
        <TableContainer component={Paper}>
          {loading ? (
            <div className="p-6 text-center">
              <CircularProgress />
            </div>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Brand</TableCell>
                  {/* <TableCell>MRP</TableCell> */}
                  <TableCell>Opening</TableCell>
                  <TableCell>Received</TableCell>
                  <TableCell>Closing</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Qty → Kitchen</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {storeStocks.map(row => (
                  <TableRow key={row._id} hover>
                    <TableCell>
                      <Checkbox
                        checked={isSelected(row.productId._id)}
                        onChange={() => toggleSelect(row)}
                      />
                    </TableCell>

                    <TableCell>
                      {row.productId.productName} ({row.productId.packSize})
                    </TableCell>
                    <TableCell>{row.productId?.categoryId?.categoryName}</TableCell>
                    <TableCell>{row.productId?.vendorsId?.vendor_name}</TableCell>
                    <TableCell>{row.productId?.companyId?.brandName}</TableCell>
                    {/* <TableCell>{row.productId.productMRP}</TableCell> */}
                    <TableCell>{row.openingStock}</TableCell>
                    <TableCell>{row.rcvdStoreQty}</TableCell>
                    <TableCell>{row.closingStock}</TableCell>
                    <TableCell>
                      {getStockStatus(row.closingStock, row.productId.stockAlert)}
                    </TableCell>

                    <TableCell>
                      {isSelected(row.productId._id) && (
                        <TextField
                          type="number"
                          size="small"
                          value={selected[row.productId._id]}
                          onChange={e =>
                            updateQty(
                              row.productId._id,
                              Number(e.target.value)
                            )
                          }
                        />
                      )}
                    </TableCell>

                    <TableCell>
                      {dayjs(row.createdAt).format("DD/MM/YYYY")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {/* ---------------- Pagination ---------------- */}
        {allStoreStocksData && (
          <TablePagination
            component="div"
            page={page}
            rowsPerPage={limit}
            count={allStoreStocksData.pagination.total}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={e => {
              setLimit(Number(e.target.value));
              setPage(0);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default StoreStockComponent;
