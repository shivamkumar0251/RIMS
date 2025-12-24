import {
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../../layouts/AdminLayout";
import {
  getVendorOrders,
  selectVendorOrderState
} from "../../redux/slices/vendorOrderSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";

const VendorsOrder: React.FC = () => {
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
      limit: 100, // Show more by default
      ...filters
    }));
  }, [filters, dispatch]);

  const handleResetFilters = () => {
    setFilters({
      fromDate: "",
      toDate: "",
      paymentStatus: ""
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'success';
      case 'Pending': return 'error';
      case 'Partial': return 'warning';
      default: return 'default';
    }
  };

  return (
    <AdminLayout>
      <div>
        <Box className="flex flex-wrap items-center gap-4 p-4 border border-gray-100 shadow-sm">
          <TextField
            type="date"
            size="small"
            label="From"
            InputLabelProps={{ shrink: true }}
            value={filters.fromDate}
            onChange={e => setFilters({ ...filters, fromDate: e.target.value })}
            className="w-full sm:w-64"
          />

          <TextField
            type="date"
            size="small"
            label="To"
            InputLabelProps={{ shrink: true }}
            value={filters.toDate}
            onChange={e => setFilters({ ...filters, toDate: e.target.value })}
            className="w-full sm:w-64"
          />

          <TextField
            size="small"
            select
            label="Payment Status"
            value={filters.paymentStatus}
            onChange={e => setFilters({ ...filters, paymentStatus: e.target.value })}
            className="w-full sm:w-44"
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Paid">Paid</MenuItem>
            <MenuItem value="Partial">Partial</MenuItem>
          </TextField>

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

        <Paper className="shadow-md rounded-xl overflow-hidden border border-gray-100">
          <TableContainer>
            <Table>
              <TableHead className="bg-gray-50">
                <TableRow>
                  <TableCell className="font-bold">Order No</TableCell>
                  <TableCell className="font-bold">Order Date</TableCell>
                  <TableCell className="font-bold">Total Qty</TableCell>
                  <TableCell className="font-bold">Total Amount</TableCell>
                  <TableCell className="font-bold">Payment Status</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {vendorOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" className="py-10 text-gray-500">
                      No vendor orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  vendorOrders.map(order => (
                    <TableRow
                      key={order._id}
                      hover
                      className="cursor-pointer"
                      onClick={() => navigate(`/admin/vendors-orders/${order._id}`)}
                    >
                      <TableCell className="font-medium text-blue-600">#{order.orderNumber}</TableCell>
                      <TableCell>{dayjs(order.orderDate).format("DD/MM/YYYY")}</TableCell>
                      <TableCell>{order.totelOrderQty}</TableCell>
                      <TableCell className="font-bold">₹{order.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip 
                          label={order.paymentStatus} 
                          color={getStatusColor(order.paymentStatus) as any}
                          size="small"
                          variant="outlined"
                          className="font-medium"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </div>
    </AdminLayout>
  );
};

export default VendorsOrder;
