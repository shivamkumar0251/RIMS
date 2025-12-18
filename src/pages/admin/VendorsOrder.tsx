import {
  MenuItem,
  Paper,
  Table, TableBody, TableCell,
  TableContainer,
  TableHead, TableRow,
  TextField
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../../layouts/AdminLayout";

import {
  getVendorOrders,
  selectVendorOrderState
} from "../../redux/slices/vendorOrderSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";
import dayjs from "dayjs";

function VendorsOrder() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { vendorOrders } = useAppSelector(selectVendorOrderState);

  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    paymentStatus: ""
  });

  useEffect(() => {
    dispatch(getVendorOrders({
      page: 1,
      limit: 10,
      ...filters
    }));
  }, [filters, dispatch]);

  return (
    <AdminLayout>
      <h2 className="text-xl font-semibold mb-4 px-4 pt-3">Vendor Orders</h2>

      {/* FILTERS */}
      <div className="grid grid-cols-2 gap-4 mb-4 px-4">
        <TextField
          size="small"
          type="date"
          label="From Date"
          InputLabelProps={{ shrink: true }}
          value={filters.fromDate}
          onChange={e => setFilters({ ...filters, fromDate: e.target.value })}
        />

        <TextField
          size="small"
          type="date"
          label="To Date"
          InputLabelProps={{ shrink: true }}
          value={filters.toDate}
          onChange={e => setFilters({ ...filters, toDate: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 mb-4 px-4">
        <TextField
          size="small"
          select
          label="Payment Status"
          value={filters.paymentStatus}
          onChange={e => setFilters({ ...filters, paymentStatus: e.target.value })}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Paid">Paid</MenuItem>
          <MenuItem value="Partial">Partial</MenuItem>
        </TextField>
      </div>

      {/* TABLE */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order No</TableCell>
              <TableCell>Order Date</TableCell>
              <TableCell>Total Qty</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Payment Status</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {vendorOrders.map(order => (
              <TableRow
                key={order._id}
                hover
                sx={{ cursor: "pointer" }}
                onClick={() => navigate(`/admin/vendors-orders/${order._id}`)}
              >
                <TableCell>{order.orderNumber}</TableCell>
                <TableCell>{dayjs(order.orderDate).format("DD/MM/YYYY")}</TableCell>
                <TableCell>{order.totelOrderQty}</TableCell>
                <TableCell>{order.totalAmount}</TableCell>
                <TableCell>{order.paymentStatus}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </AdminLayout>
  );
}

export default VendorsOrder;
