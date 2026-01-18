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
  TablePagination,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { FiEye, FiRefreshCw } from "react-icons/fi";
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
  const { vendorOrders, allVendorOrdersData, loading } = useAppSelector(selectVendorOrderState);

  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    orderStatus: ""
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  useEffect(() => {
    dispatch(getVendorOrders({
      page: page + 1,
      limit: rowsPerPage,
      ...filters
    }));
  }, [filters, dispatch, page, rowsPerPage]);

  const handleResetFilters = () => {
    setFilters({
      fromDate: "",
      toDate: "",
      orderStatus: ""
    });
    setPage(0);
  };

  // const [deleteModal, setDeleteModal] = useState({
  //   open: false,
  //   orderId: ""
  // });

  // const handleDeleteOrder = (id: string) => {
  //   setDeleteModal({ open: true, orderId: id });
  // };

  // const confirmCancelOrder = async () => {
  //   try {
  //     await dispatch(deleteVendorOrder(deleteModal.orderId)).unwrap();
  //     toast.success("Order cancelled successfully");
  //     setDeleteModal({ open: false, orderId: "" });
  //   } catch (error: any) {
  //     toast.error(error?.message || "Failed to cancel order");
  //   }
  // };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'success';
      case 'draft': return 'warning';
      default: return 'default';
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <AdminLayout>
      <Box className="bg-[#f8f9fa] h-[calc(100vh-10px)] flex flex-col">

        {/* Filters Section */}
        <Box className="bg-white p-4 border border-gray-100 shadow-sm flex flex-wrap items-center gap-4">
          <TextField
            type="date"
            size="small"
            label="From"
            InputLabelProps={{ shrink: true }}
            value={filters.fromDate}
            onChange={e => {
              setFilters({ ...filters, fromDate: e.target.value });
              setPage(0);
            }}
            sx={{ width: 200 }}
          />

          <TextField
            type="date"
            size="small"
            label="To"
            InputLabelProps={{ shrink: true }}
            value={filters.toDate}
            onChange={e => {
              setFilters({ ...filters, toDate: e.target.value });
              setPage(0);
            }}
            sx={{ width: 200 }}
          />

          <TextField
            size="small"
            select
            label="Status"
            value={filters.orderStatus}
            onChange={e => {
              setFilters({ ...filters, orderStatus: e.target.value });
              setPage(0);
            }}
            sx={{ width: 180 }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="Draft">Draft</MenuItem>
            <MenuItem value="Delivered">Delivered</MenuItem>
          </TextField>

          <Button
            size="medium"
            variant="outlined"
            startIcon={<FiRefreshCw className={loading ? "animate-spin" : ""} />}
            onClick={handleResetFilters}
            className="normal-case border-blue-100 text-blue-600 hover:bg-blue-50 font-semibold"
          >
            RESET
          </Button>
        </Box>

        {/* Table Section */}
        <Paper className="flex-1 flex flex-col shadow-md rounded-xl overflow-hidden border border-gray-200 bg-white mx-4 mb-4">
          <TableContainer className="flex-1 overflow-auto">
            <Table stickyHeader>
              <TableHead className="bg-gray-50">
                <TableRow>
                  <TableCell className="font-bold text-gray-700 py-4 bg-gray-50">Order ID</TableCell>
                  <TableCell className="font-bold text-gray-700 bg-gray-50">Vendor Name</TableCell>
                  <TableCell align="center" className="font-bold text-gray-700 bg-gray-50">Total Items</TableCell>
                  <TableCell className="font-bold text-gray-700 bg-gray-50">Order Date</TableCell>
                  <TableCell align="center" className="font-bold text-gray-700 bg-gray-50">Status</TableCell>
                  <TableCell align="center" className="font-bold text-gray-700 pr-10 bg-gray-50">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" className="py-10">
                      <Typography className="text-gray-500">Loading orders...</Typography>
                    </TableCell>
                  </TableRow>
                )}
                {!loading && vendorOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" className="py-20">
                      <Typography className="text-gray-400">No vendor orders found.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  !loading && vendorOrders.map(order => (
                    <TableRow
                      key={order._id}
                      hover
                      className="transition-colors hover:bg-gray-50"
                    >
                      <TableCell className="font-semibold text-gray-900">
                        #{order.orderNumber}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {order.products?.[0]?.productId?.vendorsId?.vendor_name || (
                          <span className="text-gray-400 italic">N/A</span>
                        )}
                      </TableCell>
                      <TableCell align="center" className="text-gray-700">
                        {order.totelOrderQty}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {dayjs(order.orderDate).format("DD MMM, YYYY")}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={order.orderStatus || "Draft"}
                          color={getStatusColor(order.orderStatus || "Draft") as any}
                          size="small"
                          className="font-semibold px-2"
                        />
                      </TableCell>
                      <TableCell align="center" className="pr-4">
                        <Box className="flex items-center justify-center gap-2">
                          <Button
                            size="small"
                            startIcon={<FiEye size={16} />}
                            onClick={() => navigate(`/admin/vendors-orders/${order._id}`)}
                            className="normal-case text-gray-600 hover:bg-gray-100 font-medium whitespace-nowrap"
                          >
                            View
                          </Button>
                          {/* <Button
                            size="small"
                            startIcon={<FiXCircle size={16} />}
                            onClick={() => handleDeleteOrder(order._id)}
                            className="normal-case text-red-500 hover:bg-red-50 font-medium whitespace-nowrap"
                          >
                            Cancel
                          </Button> */}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={allVendorOrdersData?.total || 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            className="border-t border-gray-100"
          />
        </Paper>
      </Box>

      {/* Cancel Order Confirmation Modal */}
      {/* <Dialog
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, orderId: "" })}
        PaperProps={{
          className: "rounded-2xl p-2",
          sx: { width: '100%', maxWidth: '400px' }
        }}
      >
        <DialogTitle className="flex items-center gap-2 font-bold text-gray-800">
          <FiXCircle className="text-red-500" size={24} />
          Cancel Order
        </DialogTitle>
        <DialogContent>
          <DialogContentText className="text-gray-600">
            Are you sure you want to cancel this vendor order? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="p-4 gap-2">
          <Button
            onClick={() => setDeleteModal({ open: false, orderId: "" })}
            className="normal-case text-gray-500 hover:bg-gray-100"
          >
            No, Keep it
          </Button>
          <Button
            onClick={confirmCancelOrder}
            variant="contained"
            className="normal-case bg-red-500 hover:bg-red-600 shadow-none rounded-lg text-white font-semibold"
          >
            Yes, Cancel Order
          </Button>
        </DialogActions>
      </Dialog> */}
    </AdminLayout>
  );
};

export default VendorsOrder;
