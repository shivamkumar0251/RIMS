import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import {
  FiDownload,
  FiEdit,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiRefreshCw,
} from "react-icons/fi";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { AdminLayout } from "../../layouts/AdminLayout";
import {
  addVendor,
  addVendorBulkExcel,
  deleteVendor,
  getVendors,
  selectAllVendorsData,
  selectVendorLoading,
  updateVendor,
} from "../../redux/slices/vendorSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";

interface VendorForm {
  vendor_name: string;
  vendor_mobileNo: string;
  vendor_address: string;
  vendor_state: string;
  vendor_country: string;
  vendor_pinCode: string;
  vendor_bankName: string;
  vendor_accountNumber: string;
  vendor_ifscCode: string;
  vendor_paymentTerms: string;
  vendor_preferredPaymentMode: string;
  vendor_creditLimit: number;
  vendor_outstandingBalance: number;
  vendor_gstType: string;
  vendor_registrationType: string;
  vendor_gstNumber: string;
  vendor_openingBalance: number;
  franchiseId?: string;
}

function VendorList() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectVendorLoading);
  const vendorsResponse = useAppSelector(selectAllVendorsData);
  const vendorsData = vendorsResponse?.data || [];
  const franchiseId = localStorage.getItem("franchiseId") || "";

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingVendor, setEditingVendor] = useState<any>(null);
  const [formData, setFormData] = useState<VendorForm>({
    vendor_name: "",
    vendor_mobileNo: "",
    vendor_address: "",
    vendor_state: "",
    vendor_country: "",
    vendor_pinCode: "",
    vendor_bankName: "",
    vendor_accountNumber: "",
    vendor_ifscCode: "",
    vendor_paymentTerms: "",
    vendor_preferredPaymentMode: "",
    vendor_creditLimit: 0,
    vendor_outstandingBalance: 0,
    vendor_gstType: "",
    vendor_registrationType: "",
    vendor_gstNumber: "",
    vendor_openingBalance: 0,
    franchiseId,
  });

  const PAYMENT_TERMS = ["Net 15", "Net 30", "On Delivery"];
  const PAYMENT_MODES = ["Cash", "Bank Transfer", "UPI", "Cheque"];
  const GST_TYPES = ["Cgst Sgst", "Igst", "Non Gst", "Exempt"];
  const REGISTRATION_TYPES = ["Composition", "Registered", "UnRegistered"];
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchData = () => {
    dispatch(
      getVendors({
        search,
        page: page + 1,
        limit,
        fromDate,
        toDate,
      }) as any
    );
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, search, fromDate, toDate]);

  const handleOpenDialog = (vendor?: any) => {
    if (vendor) {
      setEditingVendor(vendor);
      setFormData({ ...vendor, franchiseId });
    } else {
      setEditingVendor(null);
      setFormData({
        vendor_name: "", vendor_mobileNo: "", vendor_address: "", vendor_state: "",
        vendor_country: "", vendor_pinCode: "", vendor_bankName: "", vendor_accountNumber: "",
        vendor_ifscCode: "", vendor_paymentTerms: "", vendor_preferredPaymentMode: "",
        vendor_creditLimit: 0, vendor_outstandingBalance: 0, vendor_gstType: "",
        vendor_registrationType: "", vendor_gstNumber: "", vendor_openingBalance: 0,
        franchiseId,
      });
    }
    setOpenDialog(true);
  };

  const handleSaveVendor = async () => {
    if (!formData.vendor_name.trim()) return;
    const vendorPayload: any = { ...formData };
    delete vendorPayload._id;
    delete vendorPayload.franchiseId;

    if (editingVendor) {
      await dispatch(
        updateVendor({
          vendorId: editingVendor._id,
          vendorData: vendorPayload,
        }) as any
      );
    } else {
      await dispatch(addVendor(formData) as any);
    }

    setOpenDialog(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vendor?")) return;
    await dispatch(deleteVendor(id) as any);
    fetchData();
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);
    fd.append("franchiseId", franchiseId);

    const res = await dispatch(addVendorBulkExcel(fd) as any);
    const result = res?.payload;

    if (result?.success) {
      alert(`Uploaded Successfully. Inserted: ${result.insertedCount}`);
    } else {
      alert(result?.message || "Failed to upload Excel");
    }

    e.target.value = "";
    fetchData();
  };

  const handleDownloadTemplate = () => {
    const sample = [
      {
        vendor_name: "John Doe", vendor_mobileNo: "1234567890", vendor_address: "123 Street",
        vendor_state: "State", vendor_country: "Country", vendor_pinCode: "123456",
        vendor_bankName: "Bank", vendor_accountNumber: "1234567890", vendor_ifscCode: "IFSC001",
        vendor_paymentTerms: "Net 30", vendor_preferredPaymentMode: "Cash",
        vendor_creditLimit: 10000, vendor_outstandingBalance: 0, vendor_gstType: "Igst",
        vendor_registrationType: "Registered", vendor_gstNumber: "GSTIN123", vendor_openingBalance: 0,
      },
    ];
    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Vendor_Template.xlsx");
  };

  const handleResetFilters = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
    setPage(0);
  };

  return (
    <AdminLayout>
      <div>
        {/* Combined Tool Bar */}
        <Box className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border border-gray-100 shadow-sm">
          {/* Filters Area */}
          <Box className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <TextField
              placeholder="Search vendor by name..."
              size="small"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiSearch className="text-gray-400" />
                  </InputAdornment>
                ),
              }}
              className="w-full sm:w-64"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", bgcolor: "#fcfcfc" } }}
            />
            
            <Box className="flex items-center gap-2">
              <TextField
                type="date"
                size="small"
                label="From"
                InputLabelProps={{ shrink: true }}
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setPage(0); }}
                className="w-64"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />
              <TextField
                type="date"
                size="small"
                label="To"
                InputLabelProps={{ shrink: true }}
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setPage(0); }}
                className="w-64"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />
            </Box>

            <Button 
              size="small" 
              variant="text" 
              startIcon={<FiRefreshCw />} 
              onClick={handleResetFilters}
              className="text-blue-600 normal-case font-medium hover:bg-blue-50 px-3"
            >
              Reset
            </Button>
          </Box>

          {/* Actions Area */}
          <Box className="flex items-center gap-2 w-full md:w-auto justify-end">
            <Button variant="outlined" startIcon={<FiDownload />} onClick={handleDownloadTemplate} size="small" className="normal-case border-gray-300 text-gray-700 hover:bg-gray-50">
              Template
            </Button>
            <input type="file" ref={fileInputRef} hidden accept=".xlsx,.xls" onChange={handleExcelUpload} />
            <Button variant="outlined" startIcon={<FiDownload />} onClick={() => fileInputRef.current?.click()} size="small" className="normal-case border-gray-300 text-gray-700 hover:bg-gray-50">
              Import
            </Button>
            <Button variant="contained" startIcon={<FiPlus />} onClick={() => handleOpenDialog()}  size="small">
              Add Vendor
            </Button>
          </Box>
        </Box>

        <Paper className="shadow-md rounded-xl overflow-hidden border border-gray-100">
          <TableContainer>
            <Table size="small">
              <TableHead className="bg-gray-50">
                <TableRow>
                  <TableCell className="font-bold py-4">Vendor Info</TableCell>
                  <TableCell className="font-bold">Contact Details</TableCell>
                  <TableCell className="font-bold">Location</TableCell>
                  <TableCell className="font-bold">Bank Info</TableCell>
                  <TableCell className="font-bold">Terms</TableCell>
                  <TableCell className="font-bold text-center">Credit</TableCell>
                  <TableCell className="font-bold text-center">Outstanding</TableCell>
                  <TableCell className="font-bold">Created</TableCell>
                  <TableCell align="right" className="font-bold">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={9} align="center" className="py-10"><CircularProgress size={30} /></TableCell></TableRow>
                ) : vendorsData.length === 0 ? (
                  <TableRow><TableCell colSpan={9} align="center" className="py-10 text-gray-500 text-sm">No vendors found.</TableCell></TableRow>
                ) : (
                  vendorsData.map((vendor) => (
                    <TableRow key={vendor._id} hover>
                      <TableCell>
                        <Typography variant="body2" className="font-bold">{vendor.vendor_name}</Typography>
                        <Typography variant="caption" className="text-gray-500">GST: {vendor.vendor_gstNumber || "N/A"}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" className="block text-gray-700">{vendor.vendor_mobileNo}</Typography>
                        <Typography variant="caption" className="text-gray-500">{vendor.vendor_registrationType}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" className="block max-w-[150px] truncate">{vendor.vendor_address}</Typography>
                        <Typography variant="caption" className="text-gray-500">{vendor.vendor_state}, {vendor.vendor_country}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" className="block font-medium">{vendor.vendor_bankName}</Typography>
                        <Typography variant="caption" className="text-gray-400">Acc: {vendor.vendor_accountNumber}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box className="bg-blue-50 text-blue-700 rounded px-2 py-0.5 inline-block text-[10px] font-bold uppercase mb-1">{vendor.vendor_paymentTerms}</Box>
                        <Typography variant="caption" className="block text-gray-500 text-[10px]">{vendor.vendor_preferredPaymentMode}</Typography>
                      </TableCell>
                      <TableCell className="text-center font-medium">₹{vendor.vendor_creditLimit}</TableCell>
                      <TableCell className="text-center text-red-600 font-bold">₹{vendor.vendor_outstandingBalance}</TableCell>
                      <TableCell className="text-gray-500 text-xs text-nowrap">
                        {dayjs(vendor.createdAt).format("DD/MM/YYYY")}
                      </TableCell>
                      <TableCell align="right">
                        <Box className="flex gap-1 justify-end">
                          <IconButton onClick={() => handleOpenDialog(vendor)} size="small" className="text-blue-600"><FiEdit size={16} /></IconButton>
                          <IconButton onClick={() => handleDelete(vendor._id)} size="small" className="text-red-500"><FiTrash2 size={16} /></IconButton>
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
            count={vendorsResponse?.total || 0}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={limit}
            onRowsPerPageChange={(e) => {
              setLimit(parseInt(e.target.value, 10));
              setPage(0);
            }}
            className="border-t bg-gray-50"
          />
        </Paper>

        {/* Dialogs */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle className="font-bold flex justify-between items-center">
            {editingVendor ? "Edit Vendor Profile" : "Create New Vendor"}
            <IconButton onClick={() => setOpenDialog(false)} size="small">×</IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent className="space-y-6 pt-6">
            <Typography variant="subtitle2" className="text-blue-600 font-bold uppercase tracking-wider">Basic Information</Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField fullWidth size="small" label="Vendor Name" value={formData.vendor_name} onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })} />
              <TextField fullWidth size="small" label="Mobile Number" value={formData.vendor_mobileNo} onChange={(e) => setFormData({ ...formData, vendor_mobileNo: e.target.value })} />
              <TextField fullWidth size="small" label="GST Number" value={formData.vendor_gstNumber} onChange={(e) => setFormData({ ...formData, vendor_gstNumber: e.target.value })} />
              <FormControl fullWidth size="small">
                <InputLabel>Registration Type</InputLabel>
                <Select value={formData.vendor_registrationType} label="Registration Type" onChange={(e) => setFormData({ ...formData, vendor_registrationType: e.target.value })}>
                  {REGISTRATION_TYPES.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </Select>
              </FormControl>
            </div>

            <Typography variant="subtitle2" className="text-blue-600 font-bold uppercase tracking-wider mt-4">Address & Location</Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField fullWidth size="small" label="Address" value={formData.vendor_address} onChange={(e) => setFormData({ ...formData, vendor_address: e.target.value })} />
              <TextField fullWidth size="small" label="Pin Code" value={formData.vendor_pinCode} onChange={(e) => setFormData({ ...formData, vendor_pinCode: e.target.value })} />
              <TextField fullWidth size="small" label="State" value={formData.vendor_state} onChange={(e) => setFormData({ ...formData, vendor_state: e.target.value })} />
              <TextField fullWidth size="small" label="Country" value={formData.vendor_country} onChange={(e) => setFormData({ ...formData, vendor_country: e.target.value })} />
            </div>

            <Typography variant="subtitle2" className="text-blue-600 font-bold uppercase tracking-wider mt-4">Financial Details</Typography>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextField fullWidth size="small" label="Bank Name" value={formData.vendor_bankName} onChange={(e) => setFormData({ ...formData, vendor_bankName: e.target.value })} />
              <TextField fullWidth size="small" label="Account Number" value={formData.vendor_accountNumber} onChange={(e) => setFormData({ ...formData, vendor_accountNumber: e.target.value })} />
              <TextField fullWidth size="small" label="IFSC Code" value={formData.vendor_ifscCode} onChange={(e) => setFormData({ ...formData, vendor_ifscCode: e.target.value })} />
              
              <FormControl fullWidth size="small">
                <InputLabel>Payment Terms</InputLabel>
                <Select value={formData.vendor_paymentTerms} label="Payment Terms" onChange={(e) => setFormData({ ...formData, vendor_paymentTerms: e.target.value })}>
                  {PAYMENT_TERMS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Payment Mode</InputLabel>
                <Select value={formData.vendor_preferredPaymentMode} label="Payment Mode" onChange={(e) => setFormData({ ...formData, vendor_preferredPaymentMode: e.target.value })}>
                  {PAYMENT_MODES.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>GST Type</InputLabel>
                <Select value={formData.vendor_gstType} label="GST Type" onChange={(e) => setFormData({ ...formData, vendor_gstType: e.target.value })}>
                  {GST_TYPES.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </Select>
              </FormControl>

              <TextField fullWidth size="small" type="number" label="Credit Limit" value={formData.vendor_creditLimit} onChange={(e) => setFormData({ ...formData, vendor_creditLimit: Number(e.target.value) })} />
              <TextField fullWidth size="small" type="number" label="Opening Balance" value={formData.vendor_openingBalance} onChange={(e) => setFormData({ ...formData, vendor_openingBalance: Number(e.target.value) })} />
              <TextField fullWidth size="small" type="number" label="Outstanding Balance" value={formData.vendor_outstandingBalance} onChange={(e) => setFormData({ ...formData, vendor_outstandingBalance: Number(e.target.value) })} />
            </div>
          </DialogContent>
          <Divider />
          <DialogActions className="p-4 bg-gray-50">
            <Button onClick={() => setOpenDialog(false)} className="normal-case">Cancel</Button>
            <Button variant="contained" onClick={handleSaveVendor} className="!bg-blue-600 normal-case px-6">
              {editingVendor ? "Update Vendor" : "Create Vendor"}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

export default VendorList;
