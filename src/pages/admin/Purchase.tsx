import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  Button,
  Chip,
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
  Checkbox,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { toast } from "react-hot-toast";
import { FiPlus, FiEdit, FiChevronDown, FiMail, FiPrinter, FiDownload, FiX, FiEye } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { AdminLayout } from "../../layouts/AdminLayout";
import { ExpiryBadge } from "../../components/common/ExpiryBadge";



import {
  getVendorOrders,
  selectVendorOrderState,
  updateVendorOrder,
  editVendorOrder,
  addVendorOrder
} from "../../redux/slices/vendorOrderSlice";

import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";
import { PurchaseDrawerForm } from "../../components/adminComponents/PurchaseDrawerForm";
import { addBulkPurchases } from "../../redux/slices/purchaseSlice";
import { addStoreStock } from "../../redux/slices/storeStockSlice";
import { addKitchenStock } from "../../redux/slices/kitchenStockSlice";

const Purchase: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Check if we are in "Receive Mode" (coming from Vendor Order Details)
  // Support both single vendorOrder (backward compat) and multiple vendorOrders
  const selectedVendorOrders: any[] = location.state?.vendorOrders ||
    (location.state?.vendorOrder ? [location.state.vendorOrder] : []);
  const isReceiveMode = selectedVendorOrders.length > 0;

  // Flatten all products from all selected orders
  const allProductsToReceive = useMemo(() => {
    const products: any[] = [];
    selectedVendorOrders.forEach((order: any) => {
      order.products?.forEach((p: any) => {
        const qtyToRcv = p.sendToPurchaseQty || p.orderQty || 0;
        if (p.productId && qtyToRcv > 0) {
          products.push({
            ...p,
            _orderId: order._id,
            _orderNumber: order.orderNumber
          });
        }
      });
    });
    return products;
  }, [selectedVendorOrders]);

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
  const [moveAnchorEl, setMoveAnchorEl] = useState<null | HTMLElement>(null);
  const [checkedOrderIds, setCheckedOrderIds] = useState<string[]>([]);

  // State for receipt data (Receive Mode)
  const [receiptData, setReceiptData] = useState<Record<string, { receivedQty: number; damagedQty: number; remarks: string; expiryDate: string }>>({});

  // Initialize receipt data when in receive mode
  useEffect(() => {
    if (isReceiveMode && allProductsToReceive.length > 0) {
      const initialData: Record<string, { receivedQty: number; damagedQty: number; remarks: string; expiryDate: string }> = {};
      allProductsToReceive.forEach((p: any) => {
        const pid = p.productId?._id;
        const qtyToRcv = p.sendToPurchaseQty || p.orderQty || 0;
        if (pid) {
          initialData[pid] = {
            receivedQty: qtyToRcv,
            damagedQty: 0,
            remarks: "",
            expiryDate: ""
          };
        }
      });
      setReceiptData(initialData);
    }
  }, [isReceiveMode, allProductsToReceive]);

  // Initial Load
  useEffect(() => {
    if (!isReceiveMode) {
      dispatch(getVendorOrders({ page: page + 1, limit }));
    }
  }, [dispatch, isReceiveMode, page, limit]);

  // Handlers
  const handleReceiptChange = (pid: string, field: string, value: any) => {
    setReceiptData(prev => ({
      ...prev,
      [pid]: { ...prev[pid], [field]: value }
    }));
  };

  const handleConfirmReceipt = async () => {
    if (!isReceiveMode || allProductsToReceive.length === 0) return;
    setIsProcessing(true);

    const errors: string[] = [];
    const validItems: any[] = [];

    allProductsToReceive.forEach((p: any) => {
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
      const target = location.state?.target;

      // 1. Update all Vendor Orders Status
      for (const order of selectedVendorOrders) {
        const orderProducts = validItems.filter(item => item._orderId === order._id);
        if (orderProducts.length > 0) {
          await dispatch(updateVendorOrder({
            vendorOrderId: order._id,
            // If target exists, it's being moved to stock (Received). Otherwise, it's just confirmed (Sent)
            orderStatus: target === "Store" ? 'MoveToStore' : target === "Kitchen" ? 'MoveToKitchen' : "Delivered",
            products: orderProducts.map(item => ({
              productId: item.productId._id,
              sendToPurchaseQty: item.receivedQty,
              remarks: item.remarks
            }))
          })).unwrap();
        }
      }

      // 2. Add to respective stock collection (ONLY if target is provided)
      if (target) {
        if (target === 'Store') {
          const storePayload = validItems.map(item => ({
            productId: item.productId._id,
            qty: item.receivedQty,
            expiryDate: item.expiryDate
          }));
          await dispatch(addStoreStock(storePayload)).unwrap();
        } else {
          const kitchenPayload = validItems.map(item => ({
            productId: item.productId._id,
            qty: item.receivedQty,
            expiryDate: item.expiryDate
          }));
          await dispatch(addKitchenStock(kitchenPayload)).unwrap();
        }
        toast.success(`Stock moved to ${target === 'Store' ? 'main store' : 'kitchen store'} successfully!`);
      } else {
        toast.success("Purchase Order confirmed and received successfully!");
      }

      // Navigate back and replace state to clear the receipt form
      navigate('/admin/purchase', { replace: true });
    } catch (error: any) {
      console.error("Error processing receipt:", error);
      toast.error(error.message || "Failed to process receipt");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveOrder = async (data: any) => {
    try {
      if (editingOrder) {
        await dispatch(editVendorOrder({
          orderId: editingOrder._id,
          data: data
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
    if (s === 'sent') return 'text-blue-500 bg-blue-50 border-blue-100';
    if (s === 'delivered') return 'text-emerald-500 bg-emerald-50 border-emerald-100';
    return 'text-gray-400 bg-gray-50 border-gray-100';
  };

  // ==================================================================================
  //                                    RENDER VIEWS
  // ==================================================================================

  // 1. RECEIVE VIEW (Multiple Orders Support)
  if (isReceiveMode) {
    const orderNumbers = selectedVendorOrders.map((o: any) => o.orderNumber).join(', ');
    return (
      <AdminLayout>
        <Box className="flex flex-wrap items-center gap-3 p-4 bg-white shadow-sm border-b border-gray-100">
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} className="normal-case font-medium text-gray-600 hover:text-blue-600">Back</Button>
          <Typography variant="h6" className="font-bold text-gray-800 flex-1">
            {location.state?.target
              ? `Move to ${location.state.target === 'Store' ? 'Main Store' : 'Kitchen Store'}`
              : 'Confirm Purchase Order'
            }
            {selectedVendorOrders.length === 1 ? ` - #${orderNumbers}` : ` (${selectedVendorOrders.length} Orders)`}
          </Typography>
          <Box>
            <Button variant="contained" onClick={handleConfirmReceipt} disabled={isProcessing} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-100 font-bold">
              {isProcessing ? "Processing..." : location.state?.target ? `MOVE TO ${location.state.target === 'Store' ? 'STORE' : 'KITCHEN STORE'}` : 'CONFIRM & SEND ORDER'}
            </Button>
          </Box>
        </Box>
        <Box className="p-6 bg-slate-50 min-h-[calc(100vh-64px)]">
          <Box className="max-w-6xl mx-auto">
            <Paper className="shadow-xl rounded-2xl overflow-hidden border border-slate-200 bg-white">
              <Box className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <Box>
                  <Typography className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Receiving Items For</Typography>
                  <Typography variant="subtitle1" className="font-black text-slate-800">
                    {selectedVendorOrders.length === 1 ? `#${orderNumbers}` : `${selectedVendorOrders.length} Orders: ${orderNumbers}`}
                  </Typography>
                </Box>
                <Box className="text-right">
                  <Typography className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {location.state?.target ? 'Target Location' : 'Document Type'}
                  </Typography>
                  <Typography className="font-black text-indigo-600 uppercase italic">
                    {location.state?.target ? (location.state.target === 'Store' ? 'Main Store Inventory' : 'Kitchen Store Stock') : 'Purchase Order Verification'}
                  </Typography>
                </Box>
              </Box>

              <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
                <Table stickyHeader sx={{ minWidth: 700 }}>
                  <TableHead className="bg-slate-50/50">
                    <TableRow>
                      {selectedVendorOrders.length > 1 && (
                        <TableCell className="text-[10px] font-black text-slate-500 py-4 bg-slate-50">ORDER#</TableCell>
                      )}
                      <TableCell className="text-[10px] font-black text-slate-500 py-4 bg-slate-50">ITEM DESCRIPTION</TableCell>
                      <TableCell className="text-[10px] font-black text-slate-500 py-4 bg-slate-50" align="center">ORDERED</TableCell>
                      <TableCell className="text-[10px] font-black text-slate-500 py-4 bg-slate-50" align="center">UNIT</TableCell>
                      <TableCell className="text-[10px] font-black text-slate-500 py-4 bg-slate-50" align="center">RECEIVED</TableCell>
                      <TableCell className="text-[10px] font-black text-slate-500 py-4 bg-slate-50" align="center">DAMAGED</TableCell>
                      <TableCell className="text-[10px] font-black text-slate-500 py-4 bg-slate-50" align="center">ACCEPTED</TableCell>
                      {location.state?.target !== 'Kitchen' && (
                        <TableCell className="text-[10px] font-black text-slate-500 py-4 bg-slate-50">EXPIRY DATE</TableCell>
                      )}
                      <TableCell className="text-[10px] font-black text-slate-500 py-4 bg-slate-50">REMARKS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allProductsToReceive.map((row: any, idx: number) => {
                      const pid = row.productId?._id;
                      const data = receiptData[pid] || { receivedQty: 0, damagedQty: 0 };
                      const acceptedQty = Math.max(0, data.receivedQty - data.damagedQty);
                      return (
                        <TableRow key={`${row._orderId}-${row._id}-${idx}`} hover className="group transition-colors hover:bg-slate-50/50">
                          {selectedVendorOrders.length > 1 && (
                            <TableCell className="py-4">
                              <Typography className="text-xs font-bold text-indigo-600">#{row._orderNumber}</Typography>
                            </TableCell>
                          )}
                          <TableCell className="py-4">
                            <Box>
                              <Typography className="text-sm font-bold text-slate-800">{row.productId?.productName}</Typography>
                              <Typography className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
                                {row.productId?.brandName || 'Generic'} | {row.productId?.categoryName}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center" className="text-sm font-black text-slate-700">{row.sendToPurchaseQty || row.orderQty}</TableCell>
                          <TableCell align="center" className="text-xs font-bold text-slate-500 italic">{row.productId?.unit}</TableCell>
                          <TableCell align="center">
                            <TextField
                              type="number"
                              size="small"
                              variant="outlined"
                              sx={{
                                width: 80,
                                '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }
                              }}
                              value={data.receivedQty}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleReceiptChange(pid, 'receivedQty', Number(e.target.value))}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <TextField
                              type="number"
                              size="small"
                              variant="outlined"
                              sx={{
                                width: 80,
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '8px',
                                  fontSize: '13px',
                                  fontWeight: 'bold',
                                  color: data.damagedQty > 0 ? '#e11d48' : 'inherit'
                                }
                              }}
                              value={data.damagedQty}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleReceiptChange(pid, 'damagedQty', Number(e.target.value))}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box className={`text-sm font-black p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 inline-block min-w-[40px]`}>
                              {acceptedQty}
                            </Box>
                          </TableCell>
                          {location.state?.target !== 'Kitchen' && (
                            <TableCell>
                              <Box className="flex flex-col gap-1">
                                <TextField
                                  type="date"
                                  size="small"
                                  variant="outlined"
                                  InputLabelProps={{ shrink: true }}
                                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '12px' }, minWidth: 130 }}
                                  value={data.expiryDate || ""}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleReceiptChange(pid, 'expiryDate', e.target.value)}
                                />
                                {data.expiryDate && (
                                  <Box className="scale-90 origin-left">
                                    <ExpiryBadge expiryDate={data.expiryDate} />
                                  </Box>
                                )}
                              </Box>
                            </TableCell>
                          )}
                          <TableCell>
                            <TextField
                              size="small"
                              fullWidth
                              variant="outlined"
                              placeholder="Any comments..."
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '12px' }, minWidth: 120 }}
                              value={data.remarks || ""}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleReceiptChange(pid, 'remarks', e.target.value)}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
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
                    <Typography variant="caption" className="text-gray-500 uppercase font-semibold">
                      Status
                    </Typography>
                    <Box className="mt-1">
                      <Chip
                        label={order.orderStatus}
                        color={getStatusColor(order.orderStatus) as any}
                        size="small"
                        className="font-bold text-xs"
                      />
                    </Box>
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
              <Box className="flex items-center gap-4 min-w-0 flex-shrink-1">
                <IconButton onClick={() => setSelectedOrderId(null)} className="text-slate-400 hover:text-slate-600 flex-shrink-0"><ArrowBackIcon /></IconButton>
                <Typography variant="h6" className="font-bold text-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">{selectedOrder.orderNumber}</Typography>
                <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase border flex-shrink-0 ${getStatusColor(selectedOrder.orderStatus)}`}>{selectedOrder.orderStatus}</span>
              </Box>
              <Box className="flex items-center gap-2 flex-shrink-0">
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
                  <>
                    <Button
                      variant="contained"
                      endIcon={<FiChevronDown />}
                      onClick={(e) => setMoveAnchorEl(e.currentTarget)}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold normal-case shadow-md whitespace-nowrap px-4"
                    >
                      MOVE STOCK
                    </Button>
                    <Menu
                      anchorEl={moveAnchorEl}
                      open={Boolean(moveAnchorEl)}
                      onClose={() => setMoveAnchorEl(null)}
                      PaperProps={{
                        elevation: 3,
                        sx: {
                          mt: 1,
                          minWidth: 180,
                          borderRadius: '10px',
                          border: '1px solid #e2e8f0',
                        }
                      }}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                      <MenuItem
                        onClick={() => {
                          setMoveAnchorEl(null);
                          navigate('/admin/purchase', { state: { vendorOrder: selectedOrder, target: 'Store' } });
                        }}
                        className="text-xs font-bold text-slate-700 py-2.5"
                      >
                        <Box className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                        MOVE TO MAIN STORE
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setMoveAnchorEl(null);
                          navigate('/admin/purchase', { state: { vendorOrder: selectedOrder, target: 'Kitchen' } });
                        }}
                        className="text-xs font-bold text-slate-700 py-2.5"
                      >
                        <Box className="w-2 h-2 rounded-full bg-indigo-500 mr-2" />
                        MOVE TO KITCHEN
                      </MenuItem>
                    </Menu>
                  </>
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
      <Box className="bg-slate-50 flex-1 flex flex-col overflow-hidden">
        {/* Compact Header - Mobile Responsive */}
        <Box className={`px-4 sm:px-6 py-3 sm:py-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0`}>
          <Box className="flex items-center gap-2 sm:gap-4">
            <Typography variant={isMobile ? "h6" : "h5"} className="font-black text-slate-800 tracking-tight">Purchase Orders</Typography>
          </Box>

          <Box className={`flex items-center gap-2 sm:gap-3 ${isMobile ? 'w-full justify-end' : ''}`}>
            <Button
              variant="contained"
              startIcon={!isMobile ? <FiPlus /> : undefined}
              onClick={() => { setEditingOrder(null); setIsFormOpen(true); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all normal-case text-xs sm:text-sm"
              size={isMobile ? "small" : "medium"}
            >
              {isMobile ? <FiPlus /> : 'Direct Purchase'}
            </Button>

            <Button
              variant="contained"
              endIcon={<FiChevronDown />}
              onClick={(e) => setMoveAnchorEl(e.currentTarget)}
              className={`${checkedOrderIds.length > 0 ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-3 sm:px-4 py-2 rounded-lg font-bold shadow-md normal-case text-xs sm:text-sm`}
              size={isMobile ? "small" : "medium"}
            >
              {isMobile ? 'MOVE' : 'MOVE STOCK'}
              {checkedOrderIds.length > 0 && (
                <Box
                  component="span"
                  className="ml-2 px-1.5 py-0.5 text-[10px] font-black bg-white text-emerald-600 rounded-full min-w-[18px] text-center"
                >
                  {checkedOrderIds.length}
                </Box>
              )}
            </Button>

            <Menu
              anchorEl={moveAnchorEl}
              open={Boolean(moveAnchorEl)}
              onClose={() => setMoveAnchorEl(null)}
              PaperProps={{
                elevation: 3,
                sx: {
                  mt: 1,
                  minWidth: 180,
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                }
              }}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem
                onClick={() => {
                  setMoveAnchorEl(null);
                  if (checkedOrderIds.length === 0) {
                    toast.error('Please select at least one order');
                    return;
                  }
                  // Get all selected orders for move
                  const ordersToMove = vendorOrders.filter(o => checkedOrderIds.includes(o._id));
                  if (ordersToMove.length > 0) {
                    navigate('/admin/purchase', {
                      state: { vendorOrders: ordersToMove, target: 'Store' }
                    });
                  }
                }}
                className="text-xs font-bold text-slate-700 py-2.5"
              >
                <Box className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                MOVE TO MAIN STORE
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setMoveAnchorEl(null);
                  if (checkedOrderIds.length === 0) {
                    toast.error('Please select at least one order');
                    return;
                  }
                  // Get all selected orders for move
                  const ordersToMove = vendorOrders.filter(o => checkedOrderIds.includes(o._id));
                  if (ordersToMove.length > 0) {
                    navigate('/admin/purchase', {
                      state: { vendorOrders: ordersToMove, target: 'Kitchen' }
                    });
                  }
                }}
                className="text-xs font-bold text-slate-700 py-2.5"
              >
                <Box className="w-2 h-2 rounded-full bg-indigo-500 mr-2" />
                MOVE TO KITCHEN
              </MenuItem>
            </Menu>

          </Box>
        </Box>

        {/* Main Table */}
        <Box className="flex-1 flex flex-col overflow-hidden p-2 sm:p-3">
          <Paper className="flex-1 flex flex-col shadow-2xl shadow-slate-200/50 rounded-2xl overflow-hidden border border-slate-200 bg-white">
            <TableContainer className="flex-1 overflow-auto">
              <Table stickyHeader sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" className="bg-slate-50/80 backdrop-blur-sm">
                      <Checkbox
                        indeterminate={checkedOrderIds.length > 0 && checkedOrderIds.length < vendorOrders.length}
                        checked={vendorOrders.length > 0 && checkedOrderIds.length === vendorOrders.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCheckedOrderIds(vendorOrders.map(o => o._id));
                          } else {
                            setCheckedOrderIds([]);
                          }
                        }}
                        sx={{ color: '#6366f1', '&.Mui-checked': { color: '#6366f1' } }}
                      />
                    </TableCell>
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
                    <TableRow><TableCell colSpan={7} align="center" className="py-20"><CircularProgress size={40} className="text-indigo-600" /><Typography className="mt-4 text-slate-500 font-medium">Loading orders...</Typography></TableCell></TableRow>
                  ) : vendorOrders.length === 0 ? (
                    <TableRow><TableCell colSpan={7} align="center" className="py-20 text-slate-400">No purchase orders found</TableCell></TableRow>
                  ) : (
                    vendorOrders
                      .filter(row => row.orderStatus !== 'Draft')
                      .map((row) => {
                        const isRowChecked = checkedOrderIds.includes(row._id);
                        return (
                          <TableRow
                            key={row._id}
                            hover
                            selected={isRowChecked}
                            className="cursor-pointer group"
                            sx={{ '&.Mui-selected': { backgroundColor: '#eef2ff !important' } }}
                          >
                            <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={isRowChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setCheckedOrderIds([...checkedOrderIds, row._id]);
                                  } else {
                                    setCheckedOrderIds(checkedOrderIds.filter(id => id !== row._id));
                                  }
                                }}
                                sx={{ color: '#6366f1', '&.Mui-checked': { color: '#6366f1' } }}
                              />
                            </TableCell>
                            <TableCell className="py-4 text-slate-600 font-medium" onClick={() => setSelectedOrderId(row._id)}>{dayjs(row.orderDate).format('DD MMM YYYY')}</TableCell>
                            <TableCell className="py-4 font-black text-indigo-600 group-hover:underline underline-offset-4" onClick={() => setSelectedOrderId(row._id)}>{row.orderNumber}</TableCell>
                            <TableCell className="py-4 font-bold text-slate-800" onClick={() => setSelectedOrderId(row._id)}>{(row.products?.[0] as any)?.productId?.vendorsId?.vendor_name || 'Vendor Name'}</TableCell>
                            <TableCell className="py-4" onClick={() => setSelectedOrderId(row._id)}>
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border-2 ${getStatusColor(row.orderStatus)}`}>{row.orderStatus === 'Sent' ? 'Draft' : row.orderStatus}</span>
                            </TableCell>
                            <TableCell align="right" className="py-4 font-black text-slate-900" onClick={() => setSelectedOrderId(row._id)}>₹{row.totalAmount?.toLocaleString()}</TableCell>
                            <TableCell align="center" className="py-4" onClick={(e) => e.stopPropagation()}>
                              <Box className="flex items-center justify-end gap-2 pr-4">
                                <Button
                                  startIcon={<FiEye size={16} />}
                                  className="min-w-0 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 border border-slate-200 rounded-lg normal-case transition-colors"
                                  onClick={() => setSelectedOrderId(row._id)}
                                >
                                  View
                                </Button>
                                <Button
                                  startIcon={<FiEdit size={16} />}
                                  className="min-w-0 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 border border-slate-200 rounded-lg normal-case transition-colors"
                                  onClick={() => { setEditingOrder(row); setIsFormOpen(true); }}
                                >
                                  Edit
                                </Button>
                                <IconButton
                                  size="small"
                                  className="text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-200 rounded-lg"
                                  onClick={(ev) => setActionAnchorEl({ id: row._id, el: ev.currentTarget })}
                                >
                                  <FiChevronDown />
                                </IconButton>
                              </Box>
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
              count={allVendorOrdersData?.total || 0}
              page={page}
              onPageChange={(_: any, p: number) => setPage(p)}
              rowsPerPage={limit}
              onRowsPerPageChange={(e: React.ChangeEvent<HTMLInputElement>) => { setLimit(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[25, 50, 100]}
              className="border-t bg-gray-50/50"
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
