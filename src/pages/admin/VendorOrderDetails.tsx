import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "../../layouts/AdminLayout";
import {
  getVendorOrders,
  selectVendorOrderState
} from "../../redux/slices/vendorOrderSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";

function VendorOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { vendorOrders } = useAppSelector(selectVendorOrderState);

  const order = vendorOrders.find(o => o._id === id);

  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openConfirm, setOpenConfirm] = useState(false);

  // ---------------- Fetch ----------------
  useEffect(() => {
    if (!order) {
      dispatch(getVendorOrders({ page: 1, limit: 10 }));
    }
  }, [order, dispatch]);

  const handleSendClick = () => {
    setOpenConfirm(true);
  };

  const handleConfirmSend = () => {
    setOpenConfirm(false);
    navigate("/admin/purchase", { state: { vendorOrder: order } });
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (!order) return null;

  const filterOrder = order?.products.filter(o => o.productId);
  const vendorName = filterOrder?.[0]?.productId?.vendorsId?.vendor_name || "N/A";
  
  // Slice for Pagination
  const paginatedProducts = filterOrder?.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // ---------------- UI ----------------
  return (
    <AdminLayout>
      {/* Page Header */}
      <Box className="flex items-center gap-3 p-4">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          className="normal-case font-medium text-gray-600 hover:text-blue-600"
        >
          Back
        </Button>

        <Typography variant="h6" className="font-bold text-gray-800">
          Order Details - #{order.orderNumber}
        </Typography>
      </Box>

      <Box >
        {/* Vendor Summary Card */}
        <Card className="p-6 rounded-2xl border border-gray-100 shadow-md bg-gradient-to-r from-blue-50 to-white flex items-center justify-between">
          <Grid container spacing={3}>
            <Grid item xs={12} sm={3}>
              <Typography variant="caption" className="text-gray-500 uppercase font-semibold">
                Vendor Name
              </Typography>
              <Typography variant="h6" className="text-blue-700 font-bold">
                {vendorName}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="caption" className="text-gray-500 uppercase font-semibold">
                Order Date
              </Typography>
              <Typography variant="body1" className="text-gray-800 font-medium">
                {new Date(order.orderDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric"
                })}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="caption" className="text-gray-500 uppercase font-semibold">
                Total Amount
              </Typography>
              <Typography variant="body1" className="text-gray-800 font-bold">
                ₹{order.totalAmount?.toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="caption" className="text-gray-500 uppercase font-semibold">
                Status
              </Typography>
              <Box className="mt-1">
                <Chip 
                  label={order.status || "Draft"} 
                  color={(order.status?.toLowerCase() === 'delivered' ? 'success' : order.status?.toLowerCase() === 'sent' ? 'info' : 'warning') as any}
                  size="small"
                  className="font-bold text-xs"
                />
              </Box>
            </Grid>
          </Grid>
          {(!order.status || order.status.toLowerCase() === "draft") && (
            <Button
              variant="contained"
              onClick={handleSendClick}
              className="normal-case px-6 py-2 font-bold rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg"
            >
              Send to Purchase Order
            </Button>
          )}
        </Card>

        {/* Table Card */}
        <Paper className="shadow-lg rounded-2xl overflow-hidden border border-gray-100">
          <TableContainer>
            <Table>
              {/* ---------- TABLE HEAD ---------- */}
              <TableHead className="bg-gray-50/50">
                <TableRow>
                  {[
                    "Product",
                    "Category",
                    "Brand",
                    "Order Qty",
                    "Unit"
                  ].map(header => (
                    <TableCell
                      key={header}
                      className="font-bold text-gray-600"
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              {/* ---------- TABLE BODY ---------- */}
              <TableBody>
                {paginatedProducts?.map(row => {
                  const product = row?.productId;
                  return (
                    <TableRow
                      key={row?._id}
                      hover
                      className="transition-colors hover:bg-blue-50/30"
                    >
                      <TableCell className="font-medium text-gray-800">
                        {product ? `${product?.productName} (${product?.packSize})` : "-"}
                      </TableCell>

                      <TableCell className="text-gray-600">
                        {product?.categoryId?.categoryName || "-"}
                      </TableCell>

                      <TableCell className="text-gray-600">
                        {product?.companyId?.brandName || "-"}
                      </TableCell>

                      <TableCell className="font-semibold text-gray-700">
                        {row?.orderQty}
                      </TableCell>

                      <TableCell className="text-gray-500">
                        {product?.unit || "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filterOrder?.length || 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>

      {/* Confirmation Modal */}
      <Dialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        PaperProps={{
          className: "rounded-2xl p-2",
          sx: { width: '100%', maxWidth: '500px' }
        }}
      >
        <DialogTitle className="font-bold text-gray-800">
          Confirm Purchase Order
        </DialogTitle>
        <DialogContent>
          <DialogContentText className="text-gray-600 text-lg">
            Are you sure you want to send this Purchase Order to <strong>{vendorName}</strong>? <br />
          </DialogContentText>
        </DialogContent>
        <DialogActions className="p-4 gap-3">
          <Button 
            onClick={() => setOpenConfirm(false)}
            variant="outlined"
            className="normal-case text-gray-600 border-gray-300 hover:bg-gray-50 font-medium px-6"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmSend}
            variant="contained"
            className="normal-case bg-blue-600 hover:bg-blue-700 shadow-none rounded-lg text-white font-semibold px-6"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}

export default VendorOrderDetails;
