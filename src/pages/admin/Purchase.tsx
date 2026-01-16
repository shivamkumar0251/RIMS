import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Menu,
  MenuItem,
  ButtonGroup,
  Divider,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { FiPlus, FiEye, FiEdit, FiChevronDown, FiMail, FiPrinter, FiDownload, FiX } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { AdminLayout } from "../../layouts/AdminLayout";



import {
  getVendorOrders,
  selectVendorOrderState,
  updateVendorOrder,
  addVendorOrder
} from "../../redux/slices/vendorOrderSlice";

import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";
import { PurchaseDrawerForm } from "../../components/adminComponents/PurchaseDrawerForm";
import { addBulkPurchases } from "../../redux/slices/purchaseSlice";

const Purchase: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we are in "Receive Mode" (coming from Vendor Order Details)
  const vendorOrder = location.state?.vendorOrder;

  // ---------------- Shared State ----------------
  const { vendorOrders, loading: ordersLoading, allVendorOrdersData } = useAppSelector(selectVendorOrderState);

  // ---------------- UI States ----------------
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [actionAnchorEl, setActionAnchorEl] = useState<{ id: string, el: HTMLElement } | null>(null);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(25);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);

  // State for receipt data (Receive Mode)
  const [receiptData, setReceiptData] = useState<Record<string, { receivedQty: number; damagedQty: number; remarks: string }>>({});

  // Initialize receipt data when vendorOrder is present
  useEffect(() => {
    if (vendorOrder) {
      const initialData: Record<string, { receivedQty: number; damagedQty: number; remarks: string }> = {};
      vendorOrder.products.forEach((p: any) => {
        const qtyToRcv = p.sendToPurchaseQty || p.orderQty || 0;
        if (p.productId && qtyToRcv > 0) {
          initialData[p.productId._id] = {
            receivedQty: qtyToRcv,
            damagedQty: 0,
            remarks: ""
          };
        }
      });
      setReceiptData(initialData);
    }
  }, [vendorOrder]);

  // Initial Load
  useEffect(() => {
    if (!vendorOrder) {
      dispatch(getVendorOrders({ page: page + 1, limit, orderStatus: "Delivered" }));
    }
  }, [dispatch, vendorOrder, page, limit]);

  // Handlers
  const handleReceiptChange = (pid: string, field: string, value: any) => {
    setReceiptData(prev => ({
      ...prev,
      [pid]: { ...prev[pid], [field]: value }
    }));
  };

  const handleConfirmReceipt = async () => {
    if (!vendorOrder) return;
    setIsProcessing(true);

    const errors: string[] = [];
    const validItems: any[] = [];

    vendorOrder.products.forEach((p: any) => {
      const pid = p.productId?._id;
      const data = receiptData[pid];
      if (!data) return;

      const orderedQty = p.sendToPurchaseQty || p.orderQty;
      const acceptedQty = Math.max(0, data.receivedQty - data.damagedQty);

      if (data.receivedQty < orderedQty && !data.remarks.trim()) {
        errors.push(`Remarks required for ${p.productId.productName} (Received < Ordered)`);
      }

      validItems.push({
        ...p,
        ...data,
        acceptedQty
      });
    });

    if (errors.length > 0) {
      errors.forEach(e => toast.error(e));
      setIsProcessing(false);
      return;
    }

    try {
      await dispatch(updateVendorOrder({
        vendorOrderId: vendorOrder._id,
        orderStatus: 'Delivered',
        products: validItems.map(item => ({
          productId: item.productId._id,
          sendToPurchaseQty: item.receivedQty,
          remarks: item.remarks
        }))
      })).unwrap();

      toast.success("Order received and stock updated successfully!");
      setTimeout(() => navigate('/admin/vendorsOrder'), 500);
    } catch (error: any) {
      console.error("Error processing receipt:", error);
      toast.error(error.message || "Failed to process receipt");
      setIsProcessing(false);
    }
  };

  const handleSaveOrder = async (data: any) => {
    try {
      if (editingOrder) {
        await dispatch(updateVendorOrder({
          vendorOrderId: editingOrder._id,
          ...data
        })).unwrap();
        toast.success("Purchase order updated successfully");
      } else {
        await dispatch(addVendorOrder(data)).unwrap();
        toast.success("Purchase order created successfully");
      }
      setIsFormOpen(false);
      setEditingOrder(null);
      dispatch(getVendorOrders({ page: page + 1, limit, orderStatus: "Delivered" }));
    } catch (err: any) {
      toast.error(err.message || "Failed to save order");
    }
  };

  const selectedOrder = useMemo(() =>
    vendorOrders.find(o => o._id === selectedOrderId),
    [vendorOrders, selectedOrderId]
  );

  const getStatusColor = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === 'draft') return 'text-gray-500 bg-gray-50 border-gray-100';
    if (s === 'delivered') return 'text-indigo-500 bg-indigo-50 border-indigo-100';
    return 'text-gray-400 bg-gray-50 border-gray-100';
  };

  // ==================================================================================
  //                                    RENDER VIEWS
  // ==================================================================================

  // 1. RECEIVE VIEW
  if (vendorOrder) {
    return (
      <AdminLayout>
        <Box className="flex items-center gap-3 p-4 bg-white shadow-sm border-b border-gray-100">
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} className="normal-case font-medium text-gray-600 hover:text-blue-600">Back</Button>
          <Typography variant="h6" className="font-bold text-gray-800">Receive Purchase Order - #{vendorOrder.orderNumber}</Typography>
          <Box className="ml-auto">
            <Button variant="contained" onClick={handleConfirmReceipt} disabled={isProcessing} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-100 font-bold">
              {isProcessing ? "Processing..." : "Confirm Receipt"}
            </Button>
          </Box>
        </Box>
        <Box className="p-4">
          <Paper className="shadow-md rounded-xl overflow-hidden border border-gray-100">
            <TableContainer>
              <Table>
                <TableHead className="bg-gray-50">
                  <TableRow>
                    <TableCell className="font-bold">Product</TableCell>
                    <TableCell className="font-bold">Ordered Qty</TableCell>
                    <TableCell className="font-bold">Unit</TableCell>
                    <TableCell className="font-bold">Received Qty</TableCell>
                    <TableCell className="font-bold">Damaged Qty</TableCell>
                    <TableCell className="font-bold">Accepted Qty</TableCell>
                    <TableCell className="font-bold">Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vendorOrder.products.filter((p: any) => (p.sendToPurchaseQty || p.orderQty || 0) > 0).map((row: any) => {
                    const pid = row.productId?._id;
                    const data = receiptData[pid] || { receivedQty: 0, damagedQty: 0 };
                    const acceptedQty = Math.max(0, data.receivedQty - data.damagedQty);
                    return (
                      <TableRow key={row._id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" className="font-medium text-gray-800">{row.productId?.productName}</Typography>
                            <Typography variant="caption" className="text-gray-500">{row.productId?.brandName} | {row.productId?.categoryName}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{row.sendToPurchaseQty || row.orderQty}</TableCell>
                        <TableCell>{row.productId?.unit}</TableCell>
                        <TableCell>
                          <TextField type="number" size="small" sx={{ width: 100 }} value={data.receivedQty} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleReceiptChange(pid, 'receivedQty', Number(e.target.value))} />
                        </TableCell>
                        <TableCell>
                          <TextField type="number" size="small" sx={{ width: 100 }} value={data.damagedQty} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleReceiptChange(pid, 'damagedQty', Number(e.target.value))} />
                        </TableCell>
                        <TableCell className="font-bold text-blue-600">{acceptedQty}</TableCell>
                        <TableCell>
                          <TextField size="small" fullWidth placeholder="Add remarks..." value={data.remarks || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleReceiptChange(pid, 'remarks', e.target.value)} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </AdminLayout>
    );
  }

  // 2. PURCHASE DETAILS VIEW (Image 3)
  if (selectedOrderId && selectedOrder) {
    return (
      <AdminLayout>
        <Box className="flex h-screen bg-slate-50 overflow-hidden">
          {/* Left Panel: PO List */}
          <Box className="w-80 bg-white border-r border-slate-200 flex flex-col">
            <Box className="p-4 border-b flex items-center justify-between">
              <Typography className="font-bold text-slate-800">Purchase Orders</Typography>
              <IconButton size="small" onClick={() => setSelectedOrderId(null)}><FiX /></IconButton>
            </Box>
            <Box className="flex-1 overflow-y-auto">
              {vendorOrders.map(order => (
                <Box
                  key={order._id}
                  onClick={() => setSelectedOrderId(order._id)}
                  className={`p-4 border-b cursor-pointer transition-colors hover:bg-slate-50 ${selectedOrderId === order._id ? 'bg-blue-50/50 border-l-4 border-l-blue-600' : ''}`}
                >
                  <Box className="flex justify-between items-start mb-1">
                    <Typography className="font-bold text-sm text-slate-900">{order.orderNumber}</Typography>
                    <Typography className="text-[10px] text-slate-400 font-medium">{dayjs(order.orderDate).format('DD/MM/YY')}</Typography>
                  </Box>
                  <Typography className="text-xs text-slate-600 truncate mb-2">{(order.products?.[0] as any)?.productId?.vendorsId?.vendor_name || 'Vendor Name'}</Typography>
                  <Box className="flex justify-between items-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${getStatusColor(order.status)}`}>{order.status}</span>
                    <Typography className="font-bold text-sm text-slate-900">₹{order.totalAmount?.toLocaleString()}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Right Panel: PO Content */}
          <Box className="flex-1 overflow-y-auto flex flex-col">
            {/* Detail Header */}
            <Box className="px-6 py-2.5 bg-white border-b flex items-center justify-between sticky top-0 z-10 shadow-sm">
              <Box className="flex items-center gap-4">
                <IconButton onClick={() => setSelectedOrderId(null)} className="text-slate-400 hover:text-slate-600"><ArrowBackIcon /></IconButton>
                <Typography variant="h6" className="font-bold text-slate-800">{selectedOrder.orderNumber}</Typography>
                <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase border ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</span>
              </Box>
              <Box className="flex items-center gap-2">
                <Button
                  variant="outlined"
                  startIcon={<FiEdit />}
                  className="rounded-lg text-xs font-bold border-slate-200 text-slate-600 normal-case"
                  onClick={() => { setEditingOrder(selectedOrder); setIsFormOpen(true); }}
                >
                  Edit
                </Button>
                <Button variant="outlined" startIcon={<FiPrinter />} className="rounded-lg text-xs font-bold border-slate-200 text-slate-600 normal-case">Print</Button>
                <Button variant="outlined" startIcon={<FiMail />} className="rounded-lg text-xs font-bold border-slate-200 text-slate-600 normal-case">Email</Button>
                {selectedOrder.status !== 'Received' && (
                  <Button
                    variant="contained"
                    onClick={() => navigate('/admin/purchase', { state: { vendorOrder: selectedOrder } })}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold normal-case shadow-md"
                  >
                    Receive Order
                  </Button>
                )}
              </Box>
            </Box>

            {/* Document Body */}
            <Box className="p-8 max-w-4xl mx-auto w-full">
              <Paper className="p-8 shadow-xl rounded-2xl border border-slate-100">
                {/* Header */}
                <Box className="flex justify-between mb-12">
                  <Box>
                    <Typography variant="h4" className="font-black text-slate-900 mb-2 tracking-tight">PURCHASE ORDER</Typography>
                    <Typography className="text-slate-400 font-medium italic">PO Number: <span className="text-slate-900 font-bold not-italic">{selectedOrder.orderNumber}</span></Typography>
                  </Box>
                  <Box className="text-right">
                    <Typography className="font-black text-indigo-600 text-xl">RIMS RESTAURANT</Typography>
                    <Typography className="text-xs text-slate-500 max-w-[200px] ml-auto">123 Business Avenue, Food Plaza, Sector 45, Gurugram, India</Typography>
                  </Box>
                </Box>

                <Box className="flex gap-8 mb-12">
                  <Box className="flex-1">
                    <Typography className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Deliver To</Typography>
                    <Typography className="font-bold text-slate-800 text-sm">Main Store Kitchen</Typography>
                    <Typography className="text-xs text-slate-500 leading-relaxed">Ground Floor, Wing B<br />Contact: Operations Manager<br />+91 98765 43210</Typography>
                  </Box>
                  <Box className="flex-1">
                    <Typography className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Vendor Details</Typography>
                    <Typography className="font-bold text-slate-800 text-sm">{(selectedOrder.products?.[0] as any)?.productId?.vendorsId?.vendor_name || 'Vendor Name'}</Typography>
                    <Typography className="text-xs text-slate-500 leading-relaxed">
                      {(selectedOrder.products?.[0] as any)?.productId?.vendorsId?.vendor_address || 'Vendor Address'}<br />
                      GST: {(selectedOrder.products?.[0] as any)?.productId?.vendorsId?.vendor_gstNumber || 'GSTXXXXXXXX'}
                    </Typography>
                  </Box>
                </Box>

                {/* Items Table */}
                <TableContainer className="mb-8 border rounded-xl overflow-hidden">
                  <Table size="small">
                    <TableHead className="bg-slate-50">
                      <TableRow>
                        <TableCell className="font-bold text-slate-700 py-3">#</TableCell>
                        <TableCell className="font-bold text-slate-700 py-3">Item Description</TableCell>
                        <TableCell align="right" className="font-bold text-slate-700 py-3">Qty</TableCell>
                        <TableCell align="right" className="font-bold text-slate-700 py-3">Rate</TableCell>
                        <TableCell align="right" className="font-bold text-slate-700 py-3">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.products.map((p, idx) => (
                        <TableRow key={p._id} hover>
                          <TableCell className="text-slate-400 py-3">{idx + 1}</TableCell>
                          <TableCell className="py-3">
                            <Typography className="font-bold text-slate-800 text-sm">{p.productId?.productName}</Typography>
                            {/* <Typography className="text-[10px] text-slate-400">{p.productId?.brandName} | {p.productId?.categoryName}</Typography> */}
                          </TableCell>
                          <TableCell align="right" className="py-3 font-medium">{p.orderQty} {p.productId?.unit}</TableCell>
                          <TableCell align="right" className="py-3 text-slate-600">₹{(p.productId as any)?.perUnitRate || 0}</TableCell>
                          <TableCell align="right" className="font-bold text-slate-800 py-3">₹{(p.orderQty * ((p.productId as any)?.perUnitRate || 0)).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box className="flex justify-end pr-4">
                  <Box className="w-64 space-y-3">
                    <Box className="flex justify-between text-slate-500 text-sm">
                      <span>Sub Total</span>
                      <span className="font-medium text-slate-700">₹{selectedOrder.totalAmount?.toLocaleString()}</span>
                    </Box>
                    <Box className="flex justify-between text-slate-500 text-sm">
                      <span>GST (Included)</span>
                      <span className="font-medium text-slate-700">₹0</span>
                    </Box>
                    <Divider />
                    <Box className="flex justify-between items-center text-slate-900">
                      <span className="font-bold">Total Amount</span>
                      <span className="text-xl font-black text-indigo-600">₹{selectedOrder.totalAmount?.toLocaleString()}</span>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>

        <PurchaseDrawerForm
          open={isFormOpen}
          isEdit={Boolean(editingOrder)}
          initialData={editingOrder}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveOrder}
        />
      </AdminLayout>
    );
  }

  // 3. MAIN LIST VIEW (Image 1)
  return (
    <AdminLayout>
      <Box className="bg-slate-50 min-h-screen">
        {/* Compact Header */}
        <Box className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <Box className="flex items-center gap-4">
            <Typography variant="h5" className="font-black text-slate-800 tracking-tight ml-2">Purchase Orders</Typography>
          </Box>
          <Box className="flex items-center gap-3">
            <Button
              variant="contained"
              startIcon={<FiPlus />}
              onClick={() => { setEditingOrder(null); setIsFormOpen(true); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all normal-case"
            >
              Direct Purchase
            </Button>
          </Box>
        </Box>

        {/* Main Table */}
        <Box>
          <Paper className="shadow-2xl shadow-slate-200/50 rounded-2xl overflow-hidden border border-slate-200 bg-white">
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell className="font-bold text-slate-700 bg-slate-50/80 backdrop-blur-sm py-4">DATE</TableCell>
                    <TableCell className="font-bold text-slate-700 bg-slate-50/80 backdrop-blur-sm py-4">PURCHASE ORDER#</TableCell>
                    <TableCell className="font-bold text-slate-700 bg-slate-50/80 backdrop-blur-sm py-4">VENDOR NAME</TableCell>
                    <TableCell className="font-bold text-slate-700 bg-slate-50/80 backdrop-blur-sm py-4">STATUS</TableCell>
                    <TableCell align="right" className="font-bold text-slate-700 bg-slate-50/80 backdrop-blur-sm py-4">AMOUNT</TableCell>
                    <TableCell align="center" className="font-bold text-slate-700 bg-slate-50/80 backdrop-blur-sm py-4">ACTION</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ordersLoading ? (
                    <TableRow><TableCell colSpan={6} align="center" className="py-20"><CircularProgress size={40} className="text-indigo-600" /><Typography className="mt-4 text-slate-500 font-medium">Loading orders...</Typography></TableCell></TableRow>
                  ) : vendorOrders.length === 0 ? (
                    <TableRow><TableCell colSpan={6} align="center" className="py-20 text-slate-400">No purchase orders found</TableCell></TableRow>
                  ) : (
                    vendorOrders.map((row) => (
                      <TableRow key={row._id} hover onClick={() => setSelectedOrderId(row._id)} className="cursor-pointer group">
                        <TableCell className="py-4 text-slate-600 font-medium">{dayjs(row.orderDate).format('DD MMM YYYY')}</TableCell>
                        <TableCell className="py-4 font-black text-indigo-600 group-hover:underline underline-offset-4">{row.orderNumber}</TableCell>
                        <TableCell className="py-4 font-bold text-slate-800">{(row.products?.[0] as any)?.productId?.vendorsId?.vendor_name || 'Vendor Name'}</TableCell>
                        <TableCell className="py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border-2 ${getStatusColor(row.orderStatus)}`}>{row.orderStatus}</span>
                        </TableCell>
                        <TableCell align="right" className="py-4 font-black text-slate-900">₹{row.totalAmount?.toLocaleString()}</TableCell>
                        <TableCell align="center" className="py-4" onClick={(e) => e.stopPropagation()}>
                          <Box className="flex items-center justify-center">
                            <ButtonGroup size="small">
                              <Button
                                className="px-3 py-1 text-[11px] font-bold border-slate-200 bg-white hover:bg-slate-50 text-slate-600 normal-case rounded-l-md"
                                onClick={() => setSelectedOrderId(row._id)}
                              >
                                View / Print
                              </Button>
                              <Button
                                className="px-1 border border-slate-200 min-w-0 bg-white hover:bg-slate-50 text-slate-600 rounded-r-md"
                                onClick={(ev: React.MouseEvent<HTMLElement>) => setActionAnchorEl({ id: row._id, el: ev.currentTarget })}
                              >
                                <FiChevronDown size={14} />
                              </Button>
                            </ButtonGroup>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={allVendorOrdersData?.total || 0}
              page={page}
              onPageChange={(_: any, p: number) => setPage(p)}
              rowsPerPage={limit}
              onRowsPerPageChange={(e: React.ChangeEvent<HTMLInputElement>) => { setLimit(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[25, 50, 100]}
              className="border-t"
            />
          </Paper>
        </Box>

        {/* Action Menu (Image 2) */}
        <Menu
          anchorEl={actionAnchorEl?.el}
          open={Boolean(actionAnchorEl)}
          onClose={() => setActionAnchorEl(null)}
          PaperProps={{ sx: { minWidth: 160, borderRadius: 2, shadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', border: '1px solid #f1f5f9' } }}
        >
          <MenuItem
            onClick={() => {
              const order = vendorOrders.find(o => o._id === actionAnchorEl?.id);
              setEditingOrder(order);
              setIsFormOpen(true);
              setActionAnchorEl(null);
            }}
            className="text-xs font-bold text-slate-600 py-2"
          >
            <FiEdit className="mr-3" /> Edit Order
          </MenuItem>
          <MenuItem onClick={() => setActionAnchorEl(null)} className="text-xs font-bold text-slate-600 py-2"><FiMail className="mr-3" /> Send Email</MenuItem>
          <MenuItem onClick={() => setActionAnchorEl(null)} className="text-xs font-bold text-slate-600 py-2"><FiPrinter className="mr-3" /> Print PO</MenuItem>
          <MenuItem onClick={() => setActionAnchorEl(null)} className="text-xs font-bold text-slate-600 py-2"><FiDownload className="mr-3" /> Download PDF</MenuItem>
          <Divider sx={{ my: 1 }} />
          <MenuItem onClick={() => setActionAnchorEl(null)} className="text-xs font-bold text-rose-600 py-2 hover:bg-rose-50"><FiX className="mr-3" /> Cancel Order</MenuItem>
        </Menu>

        <PurchaseDrawerForm
          open={isFormOpen}
          isEdit={Boolean(editingOrder)}
          initialData={editingOrder}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveOrder}
        />

      </Box>
    </AdminLayout>
  );
};

export default Purchase;
