import {
  Button,
  Checkbox,
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
import { AdminLayout } from "../../layouts/AdminLayout";

import {
  addBulkPurchases,
  getPurchases,
  selectPurchaseState
} from "../../redux/slices/purchaseSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";

import {
  getCategories,
  selectCategories
} from "../../redux/slices/categorySlice";

import {
  getCompanies,
  selectCompanies
} from "../../redux/slices/companySlice";

import {
  getVendorNameList,
  selectVendorNames
} from "../../redux/slices/vendorSlice";

import type { PurchaseItem, PurchasePostData } from "../../redux/slices/purchaseSlice";

const Purchase: React.FC = () => {
  const dispatch = useAppDispatch();

  const { purchases, loading, allPurchasesData } =
    useAppSelector(selectPurchaseState);

  const categories = useAppSelector(selectCategories);
  const companies = useAppSelector(selectCompanies);
  const vendors = useAppSelector(selectVendorNames);

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

  // ---------------- Selection ----------------
  const [selected, setSelected] = useState<Record<string, number>>({});

  // ---------------- Initial Load ----------------
  useEffect(() => {
    dispatch(getCategories({ page: 1, limit: 1000 }));
    dispatch(getCompanies({ page: 1, limit: 1000 }));
    dispatch(getVendorNameList());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      getPurchases({
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
  const handleSelect = (row: PurchaseItem) => {
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

  const handleQtyChange = (productId: string, value: number) => {
    setSelected(prev => ({
      ...prev,
      [productId]: value
    }));
  };

  // ---------------- Bulk Post ----------------
  const handlePost = () => {
    const payload: PurchasePostData[] = Object.entries(selected)
      .filter(([_, qty]) => qty > 0)
      .map(([productId, sendToStoreQty]) => ({
        productId,
        sendToStoreQty
      }));

    if (!payload.length) return;

    dispatch(addBulkPurchases(payload)).then(() => {
      setSelected({});
      dispatch(getPurchases({ page: page + 1, limit }));
    });
  };

  // ---------------- Helpers ----------------
  const isSelected = (id: string) => selected[id] !== undefined;

  // ---------------- Select All Helpers ----------------
  const allSelected =
    purchases.length > 0 &&
    purchases.every(row => selected[row.productId._id] !== undefined);

  const someSelected =
    purchases.some(row => selected[row.productId._id] !== undefined);

  const handleSelectAll = () => {
    if (allSelected) {
      // Unselect all visible rows
      const next = { ...selected };
      purchases.forEach(row => {
        delete next[row.productId._id];
      });
      setSelected(next);
    } else {
      // Select all visible rows
      const next = { ...selected };
      purchases.forEach(row => {
        if (next[row.productId._id] === undefined) {
          next[row.productId._id] = 0;
        }
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
            {vendors.map(v => (
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
            {companies.map(b => (
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

        {/* ---------------- Action ---------------- */}
        <div className="flex justify-end">
          <Button
            variant="contained"
            disabled={!Object.keys(selected).length}
            onClick={handlePost}
          >
            Send To Store
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
                      indeterminate={!allSelected && someSelected}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Brand</TableCell>
                  {/* <TableCell>MRP</TableCell> */}
                  <TableCell>Received</TableCell>
                  <TableCell>Current</TableCell>
                  <TableCell>Send Qty</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {purchases.map(row => (
                  <TableRow key={row._id} hover>
                    <TableCell>
                      <Checkbox
                        checked={isSelected(row.productId._id)}
                        onChange={() => handleSelect(row)}
                      />
                    </TableCell>

                    <TableCell>
                      {row.productId.productName} ({row.productId.packSize})
                    </TableCell>
                    <TableCell>{row.productId?.categoryId?.categoryName}</TableCell>
                    <TableCell>{row.productId?.vendorsId?.vendor_name}</TableCell>
                    <TableCell>{row.productId?.companyId?.brandName}</TableCell>
                    {/* <TableCell>{row.productId.productMRP}</TableCell> */}
                    <TableCell>{row.rcvdPurchaseQty}</TableCell>
                    <TableCell>{row.currentPurchaseQty}</TableCell>

                    <TableCell>
                      {isSelected(row.productId._id) && (
                        <TextField
                          type="number"
                          size="small"
                          value={selected[row.productId._id]}
                          onChange={e =>
                            handleQtyChange(
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
        {allPurchasesData && (
          <TablePagination
            component="div"
            page={page}
            rowsPerPage={limit}
            count={allPurchasesData.pagination.total}
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

export default Purchase;


// we want to option of select all in 