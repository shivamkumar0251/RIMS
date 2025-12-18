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
import { FiSend } from "react-icons/fi";

import { AdminLayout } from "../../layouts/AdminLayout";
import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";

import {
  addConsumableStock,
  getConsumableStocks,
  selectConsumableStockState
} from "../../redux/slices/consumableStockSlice";

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

import type { ConsumableStockPostData } from "../../redux/slices/consumableStockSlice";

const Consumables: React.FC = () => {
  const dispatch = useAppDispatch();

  const { loading, consumableStocks, allConsumableStocksData } =
    useAppSelector(selectConsumableStockState);

  const categories = useAppSelector(selectCategories);
  const companies = useAppSelector(selectCompanies);
  const vendors = useAppSelector(selectVendorNames);

  // ---------------- Filters ----------------
  const [categoryId, setCategoryId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");

  // ---------------- Pagination ----------------
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  // ---------------- Selection & Inputs ----------------
  const [selected, setSelected] = useState<string[]>([]);
  const [usageMap, setUsageMap] = useState<Record<string, number>>({});
  const [wastageMap, setWastageMap] = useState<Record<string, number>>({});

  // ---------------- Fetch master data ----------------
  useEffect(() => {
    dispatch(getCategories({ page: 1, limit: 1000 }));
    dispatch(getCompanies({ page: 1, limit: 1000 }));
    dispatch(getVendorNameList());
  }, [dispatch]);

  // ---------------- Fetch consumables ----------------
  useEffect(() => {
    dispatch(
      getConsumableStocks({
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
  }, [dispatch, page, search, limit, categoryId, vendorId, companyId, fromDate, toDate]);

  // ---------------- Selection logic ----------------
  const toggleRow = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selected.length === consumableStocks.length) {
      setSelected([]);
    } else {
      setSelected(consumableStocks.map((s) => s.productId._id));
    }
  };

  // ---------------- Submit to backend ----------------
  const handleSubmit = () => {
    const payload: ConsumableStockPostData[] = selected.map((productId) => ({
      productId,
      transfersToUsage: usageMap[productId] || 0,
      transfersToWastage: wastageMap[productId] || 0
    }));

    if (!payload.length) return;

    dispatch(addConsumableStock(payload));
    setSelected([]);
    setUsageMap({});
    setWastageMap({});
  };

  // ---------------- Render ----------------
  return (
    <AdminLayout>
      <div className="p-4 space-y-4">
        {/* ---------------- Filters ---------------- */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <TextField
            label="Search"
            size="small"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <TextField
            select
            size="small"
            label="Category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.categoryName}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Vendor"
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {vendors.map((v) => (
              <MenuItem key={v._id} value={v._id}>
                {v.vendor_name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Company"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {companies.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.brandName}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            size="small"
            type="date"
            label="From"
            InputLabelProps={{ shrink: true }}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />

          <TextField
            size="small"
            type="date"
            label="To"
            InputLabelProps={{ shrink: true }}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        {/* ---------------- Submit ---------------- */}
        <div className="flex justify-end">
          <Button
            variant="contained"
            color="primary"
            startIcon={<FiSend />}
            disabled={!selected.length}
            onClick={handleSubmit}
          >
            Post to Usage / Wastage
          </Button>
        </div>

        {/* ---------------- Table ---------------- */}
        <Paper>
          <TableContainer>
            <Table size="small">
              <TableHead className="bg-gray-100">
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={
                        selected.length === consumableStocks.length &&
                        consumableStocks.length > 0
                      }
                      onChange={toggleAll}
                    />
                  </TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Opening</TableCell>
                  <TableCell>Received</TableCell>
                  <TableCell>Usage</TableCell>
                  <TableCell>Wastage</TableCell>
                  <TableCell>Closing</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={13} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                )}

                {consumableStocks.map((row) => {
                  const pid = row.productId?._id;

                  return (
                    <TableRow key={row._id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selected.includes(pid)}
                          onChange={() => toggleRow(pid)}
                        />
                      </TableCell>
                      <TableCell>{row.productId?.productName} ({row.productId?.packSize})</TableCell>
                      <TableCell>{row.productId?.categoryId?.categoryName}</TableCell>
                      <TableCell>{row.productId?.vendorsId?.vendor_name}</TableCell>
                      <TableCell>{row.productId?.companyId?.brandName}</TableCell>
                      <TableCell>{row.productId?.unit}</TableCell>
                      <TableCell>{row?.openingStock}</TableCell>
                      <TableCell>{row?.rcvdKitchenQty}</TableCell>

                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={usageMap[pid] || ""}
                          onChange={(e) =>
                            setUsageMap({
                              ...usageMap,
                              [pid]: Number(e.target.value)
                            })
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={wastageMap[pid] || ""}
                          onChange={(e) =>
                            setWastageMap({
                              ...wastageMap,
                              [pid]: Number(e.target.value)
                            })
                          }
                        />
                      </TableCell>

                      <TableCell>{row.closingStock}</TableCell>
                      <TableCell>
                        {dayjs(row.createdAt).format("DD/MM/YYYY")}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* ---------------- Pagination ---------------- */}
          <TablePagination
            component="div"
            count={allConsumableStocksData?.pagination.total || 0}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={limit}
            onRowsPerPageChange={(e) => {
              setLimit(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Paper>
      </div>
    </AdminLayout>
  );
};

export default Consumables;
