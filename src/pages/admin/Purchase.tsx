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
import { PurchaseViewDrawer } from "../../components/adminComponents/PurchaseViewDrawer";
import { addStoreStock } from "../../redux/slices/storeStockSlice";
import { addKitchenStock } from "../../redux/slices/kitchenStockSlice";
import { addSetupStock } from "../../redux/slices/setupStockSlice";

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
  const [actionAnchorEl, setActionAnchorEl] = useState<{ id: string, el: HTMLElement } | null>(null);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(25);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [viewOrder, setViewOrder] = useState<any>(null);
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
            orderStatus: target === "Store" ? 'MoveToStore' : target === "Kitchen" ? 'MoveToKitchen' : target === "Setup" ? 'MoveToSetup' : "Delivered",
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
            expiryDate: item.expiryDate,
            type: "receipt"
          }));
          await dispatch(addStoreStock(storePayload)).unwrap();
        } else if (target === 'Kitchen') {
          const kitchenPayload = validItems.map(item => ({
            productId: item.productId._id,
            qty: item.receivedQty,
            expiryDate: item.expiryDate,
            type: "receipt"
          }));
          await dispatch(addKitchenStock(kitchenPayload)).unwrap();
        } else if (target === 'Setup') {
          if (validItems.length === 0) {
            toast.error("No valid items to move to Setup Store");
            return;
          }
          const setupPayload = validItems.map(item => ({
            productId: item.productId._id,
            qty: item.receivedQty,
            expiryDate: item.expiryDate,
            type: "receipt"
          }));
          await dispatch(addSetupStock(setupPayload)).unwrap();
        }
        toast.success(`Stock moved to ${target === 'Store' ? 'main store' : target === 'Kitchen' ? 'kitchen store' : 'setup store'} successfully!`);
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



  const getStatusColor = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === 'draft') return 'text-gray-500 bg-gray-50 border-gray-100';
    if (s === 'sent') return 'text-blue-500 bg-blue-50 border-blue-100';
    if (s === 'delivered') return 'text-emerald-500 bg-emerald-50 border-emerald-100';
    if (s === 'movetostore') return 'text-purple-600 bg-purple-50 border-purple-200';
    if (s === 'movetokitchen') return 'text-amber-600 bg-amber-50 border-amber-200';
    if (s === 'movetosetup') return 'text-pink-600 bg-pink-50 border-pink-200';
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
              ? `Move to ${location.state.target === 'Store' ? 'Main Store' : location.state.target === 'Kitchen' ? 'Kitchen Store' : 'Setup Store'}`
              : 'Confirm Purchase Order'
            }
            {selectedVendorOrders.length === 1 ? ` - #${orderNumbers}` : ` (${selectedVendorOrders.length} Orders)`}
          </Typography>
          <Box>
            <Button variant="contained" onClick={handleConfirmReceipt} disabled={isProcessing} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-100 font-bold">
              {isProcessing ? "Processing..." : location.state?.target ? `MOVE TO ${location.state.target === 'Store' ? 'STORE' : location.state.target === 'Kitchen' ? 'KITCHEN' : 'SETUP STORE'}` : 'CONFIRM & SEND ORDER'}
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
                    {location.state?.target ? (location.state.target === 'Store' ? 'Main Store Inventory' : location.state.target === 'Kitchen' ? 'Kitchen Store Stock' : 'Setup Store') : 'Purchase Order Verification'}
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
                      state: { vendorOrders: ordersToMove, target: 'Setup' }
                    });
                  }
                }}
                className="text-xs font-bold text-slate-700 py-2.5"
              >
                <Box className="w-2 h-2 rounded-full bg-pink-500 mr-2" />
                MOVE TO SETUP STORE
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
                        indeterminate={checkedOrderIds.length > 0 && checkedOrderIds.length < vendorOrders.filter(o => !['movetostore', 'movetokitchen', 'movetosetup'].includes(o.orderStatus?.toLowerCase())).length}
                        checked={vendorOrders.length > 0 && checkedOrderIds.length === vendorOrders.filter(o => !['movetostore', 'movetokitchen', 'movetosetup'].includes(o.orderStatus?.toLowerCase())).length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            // Only check orders that are NOT moved
                            const eligibleIds = vendorOrders
                              .filter(o => !['movetostore', 'movetokitchen', 'movetosetup'].includes(o.orderStatus?.toLowerCase()))
                              .map(o => o._id);
                            setCheckedOrderIds(eligibleIds);
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
                            className={`cursor-pointer group ${['movetostore', 'movetokitchen'].includes(row.orderStatus?.toLowerCase()) ? 'bg-slate-50/30' : ''}`}
                            sx={{ '&.Mui-selected': { backgroundColor: '#eef2ff !important' } }}
                          >
                            <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={isRowChecked}
                                disabled={['movetostore', 'movetokitchen'].includes(row.orderStatus?.toLowerCase())}
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
                            <TableCell className="py-4 text-slate-600 font-medium" onClick={() => setViewOrder(row)}>{dayjs(row.orderDate).format('DD MMM YYYY')}</TableCell>
                            <TableCell className="py-4 font-black text-indigo-600 group-hover:underline underline-offset-4" onClick={() => setViewOrder(row)}>{row.orderNumber}</TableCell>
                            <TableCell className="py-4 font-bold text-slate-800" onClick={() => setViewOrder(row)}>{(row.products?.[0] as any)?.productId?.vendorsId?.vendor_name || 'Vendor Name'}</TableCell>
                            <TableCell className="py-4" onClick={() => setViewOrder(row)}>
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border-2 ${getStatusColor(row.orderStatus)}`}>{row.orderStatus === 'Sent' ? 'Draft' : row.orderStatus}</span>
                            </TableCell>
                            <TableCell align="right" className="py-4 font-black text-slate-900" onClick={() => setViewOrder(row)}>₹{row.totalAmount?.toLocaleString()}</TableCell>
                            <TableCell align="center" className="py-4" onClick={(e) => e.stopPropagation()}>
                              <Box className="flex items-center justify-end gap-2 pr-4">
                                <Button
                                  startIcon={<FiEye size={16} />}
                                  className="min-w-0 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 border border-slate-200 rounded-lg normal-case transition-colors"
                                  onClick={() => setViewOrder(row)}
                                >
                                  View
                                </Button>
                                <Button
                                  startIcon={<FiEdit size={16} />}
                                  disabled={['movetostore', 'movetokitchen'].includes(row.orderStatus?.toLowerCase())}
                                  className={`min-w-0 px-3 py-1.5 text-xs font-bold rounded-lg normal-case transition-colors ${['movetostore', 'movetokitchen'].includes(row.orderStatus?.toLowerCase()) ? 'text-slate-300 border-slate-100' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50 border border-slate-200'}`}
                                  onClick={() => { setEditingOrder(row); setIsFormOpen(true); }}
                                >
                                  Edit
                                </Button>
                                <IconButton
                                  size="small"
                                  disabled={['movetostore', 'movetokitchen'].includes(row.orderStatus?.toLowerCase())}
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

        <PurchaseViewDrawer
          open={Boolean(viewOrder)}
          onClose={() => setViewOrder(null)}
          order={viewOrder}
        />

      </Box>
    </AdminLayout >
  );
};

export default Purchase;
