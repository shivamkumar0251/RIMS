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
  type GetVendorData,
} from "../../redux/slices/vendorSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";

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
  const [limit, setLimit] = useState(25);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingVendor, setEditingVendor] = useState<any>(null);
  const [formData, setFormData] = useState<GetVendorData>({
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
    vendor_contactPerson_name: "",
    vendor_email: "",
    vendor_contactPerson_mobileNo: "",
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
        vendor_creditLimit: 0, vendor_outstandingBalance: 0, vendor_gstType: "", vendor_contactPerson_name: "",
        vendor_contactPerson_mobileNo: "", vendor_email: "",
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
        vendor_name: "John Doe", vendor_mobileNo: "1234567890", vendor_email: "", vendor_address: "123 Street",
        vendor_state: "State", vendor_country: "Country", vendor_pinCode: "123456",
        vendor_bankName: "Bank", vendor_accountNumber: "1234567890", vendor_ifscCode: "IFSC001",
        vendor_paymentTerms: "Net 30", vendor_preferredPaymentMode: "Cash",
        vendor_creditLimit: 10000, vendor_outstandingBalance: 0, vendor_contactPerson_name: "",
        vendor_contactPerson_mobileNo: "", vendor_gstType: "Igst",
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

      <Box className="flex flex-col h-[calc(100vh-10px)] p-4">
        {/* Header Section */}
        <Box className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
          <Box className="flex flex-col xl:flex-row items-center justify-between gap-4">
            {/* Filters */}
            <Box className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              <TextField
                placeholder="Search vendor..."
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
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: "#f8fafc" } }}
              />

              <Box className="flex items-center gap-2">
                <TextField
                  type="date"
                  size="small"
                  label="From"
                  InputLabelProps={{ shrink: true }}
                  value={fromDate}
                  onChange={(e) => { setFromDate(e.target.value); setPage(0); }}
                  className="w-40"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                />
                <TextField
                  type="date"
                  size="small"
                  label="To"
                  InputLabelProps={{ shrink: true }}
                  value={toDate}
                  onChange={(e) => { setToDate(e.target.value); setPage(0); }}
                  className="w-40"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                />
              </Box>

              <Button
                size="small"
                variant="text"
                startIcon={<FiRefreshCw />}
                onClick={handleResetFilters}
                className="text-blue-600 normal-case font-medium hover:bg-blue-50 px-3 h-9"
              >
                Reset
              </Button>
            </Box>

            {/* Actions */}
            <Box className="flex items-center gap-2 w-full xl:w-auto justify-end">
              <input type="file" ref={fileInputRef} hidden accept=".xlsx,.xls" onChange={handleExcelUpload} />
              <Button
                variant="outlined"
                startIcon={<FiDownload />}
                onClick={handleDownloadTemplate}
                size="small"
                className="normal-case border-gray-200 text-gray-600 hover:bg-gray-50 h-9"
              >
                Template
              </Button>
              <Button
                variant="outlined"
                startIcon={<FiDownload />}
                onClick={() => fileInputRef.current?.click()}
                size="small"
                className="normal-case border-gray-200 text-gray-600 hover:bg-gray-50 h-9"
              >
                Import
              </Button>
              <Button
                variant="contained"
                startIcon={<FiPlus />}
                onClick={() => handleOpenDialog()}
                size="small"
                className="bg-blue-600 hover:bg-blue-700 text-white normal-case px-4 h-9 shadow-sm"
              >
                Add Vendor
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Table Section */}
        <Paper className="flex-1 flex flex-col shadow-md rounded-xl overflow-hidden border border-gray-100 bg-white">
          <TableContainer className="flex-1 overflow-auto">
            <Table stickyHeader size="medium">
              <TableHead>
                <TableRow>
                  <TableCell className="bg-gray-50 font-bold text-gray-700 py-3">Vendor Info</TableCell>
                  <TableCell className="bg-gray-50 font-bold text-gray-700 py-3">Contact Details</TableCell>
                  <TableCell className="bg-gray-50 font-bold text-gray-700 py-3 text-center">Contact Person</TableCell>
                  <TableCell className="bg-gray-50 font-bold text-gray-700 py-3">Location</TableCell>
                  <TableCell className="bg-gray-50 font-bold text-gray-700 py-3">Bank Info</TableCell>
                  <TableCell className="bg-gray-50 font-bold text-gray-700 py-3">Terms</TableCell>
                  <TableCell className="bg-gray-50 font-bold text-gray-700 py-3 text-center">Credit</TableCell>
                  <TableCell className="bg-gray-50 font-bold text-gray-700 py-3 text-center">Outstanding</TableCell>
                  <TableCell className="bg-gray-50 font-bold text-gray-700 py-3">Created</TableCell>
                  <TableCell className="bg-gray-50 font-bold text-gray-700 py-3" align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={9} align="center" className="py-20"><CircularProgress size={30} /></TableCell></TableRow>
                ) : vendorsData.length === 0 ? (
                  <TableRow><TableCell colSpan={9} align="center" className="py-20 text-gray-500 text-sm">No vendors found.</TableCell></TableRow>
                ) : (
                  vendorsData.map((vendor) => (
                    <TableRow key={vendor._id} hover className="transition-colors">
                      <TableCell className="py-3">
                        <Typography variant="body2" className="font-bold text-gray-800">{vendor.vendor_name}</Typography>
                        <Box className="flex items-center gap-1 mt-0.5">
                          <Typography variant="caption" className="text-gray-400 font-medium">GST:</Typography>
                          <Typography variant="caption" className="text-gray-600">{vendor.vendor_gstNumber || "N/A"}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell className="py-3">
                        <Typography variant="body2" className="text-gray-700">{vendor.vendor_mobileNo}</Typography>
                        <Typography variant="caption" className="text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full inline-block mt-1">
                          {vendor.vendor_registrationType}
                        </Typography>
                        <Typography variant="body2" className="text-gray-700">{vendor.vendor_email || "raj@gmail.com"}</Typography>
                      </TableCell>
                      <TableCell className="py-3 max-w-[200px]">
                        <Typography variant="body2" className="truncate text-gray-700">{vendor.vendor_contactPerson_name || 'Raj'}</Typography>
                        <Typography variant="caption" className="text-gray-500">{vendor.vendor_contactPerson_mobileNo || 9966332211}</Typography>
                      </TableCell>
                      <TableCell className="py-3 max-w-[200px]">
                        <Typography variant="body2" className="truncate text-gray-700">{vendor.vendor_address}</Typography>
                        <Typography variant="caption" className="text-gray-500">{vendor.vendor_state}, {vendor.vendor_country}</Typography>
                      </TableCell>
                      <TableCell className="py-3">
                        <Typography variant="body2" className="font-medium text-gray-700">{vendor.vendor_bankName}</Typography>
                        <Typography variant="caption" className="text-gray-400 font-mono">Acc: {vendor.vendor_accountNumber || "N/A"}</Typography>
                      </TableCell>
                      <TableCell className="py-3">
                        <Box className="flex flex-col items-start gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            {vendor.vendor_paymentTerms}
                          </span>
                          <Typography variant="caption" className="text-gray-500 font-medium">{vendor.vendor_preferredPaymentMode}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        <span className="font-medium text-gray-700">₹{vendor.vendor_creditLimit?.toLocaleString()}</span>
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        <span className={`font-bold ${vendor.vendor_outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ₹{vendor.vendor_outstandingBalance?.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-sm">
                        {dayjs(vendor.createdAt).format("DD MMM, YYYY")}
                      </TableCell>
                      <TableCell className="py-3" align="right">
                        <Box className="flex gap-1 justify-end">
                          <IconButton onClick={() => handleOpenDialog(vendor)} size="small" className="text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100">
                            <FiEdit size={15} />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(vendor?._id)} size="small" className="text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100">
                            <FiTrash2 size={15} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box className="border-t border-gray-200 bg-gray-50/50 p-1">
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
              rowsPerPageOptions={[25, 50, 100]}
              className="text-sm text-gray-600"
            />
          </Box>
        </Paper>

        {/* Dialogs */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
          <DialogTitle className="font-bold flex justify-between items-center text-gray-800 pb-2 border-b border-gray-100">
            {editingVendor ? "Edit Vendor Profile" : "Create New Vendor"}
            <IconButton onClick={() => setOpenDialog(false)} size="small" className="text-gray-400 hover:text-gray-600">×</IconButton>
          </DialogTitle>
          <DialogContent className="space-y-6 pt-6 px-4">
            <Box className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
              <Typography variant="subtitle2" className="text-blue-700 font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Basic Information
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <TextField fullWidth size="small" label="Vendor Name" required value={formData.vendor_name} onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })} variant="outlined" sx={{ bgcolor: 'white' }} />
                <TextField fullWidth size="small" label="Mobile Number" value={formData.vendor_mobileNo} onChange={(e) => setFormData({ ...formData, vendor_mobileNo: e.target.value })} variant="outlined" sx={{ bgcolor: 'white' }} />
                <TextField fullWidth size="small" label="GST Number" value={formData.vendor_gstNumber} onChange={(e) => setFormData({ ...formData, vendor_gstNumber: e.target.value })} variant="outlined" sx={{ bgcolor: 'white' }} />
                <FormControl fullWidth size="small">
                  <InputLabel>Registration Type</InputLabel>
                  <Select value={formData.vendor_registrationType} label="Registration Type" onChange={(e) => setFormData({ ...formData, vendor_registrationType: e.target.value })} sx={{ bgcolor: 'white' }}>
                    {REGISTRATION_TYPES.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField fullWidth size="small" label="Vendor Email" value={formData.vendor_email} onChange={(e) => setFormData({ ...formData, vendor_email: e.target.value })} variant="outlined" sx={{ bgcolor: 'white' }} />
              </div>
            </Box>
            <Box className="bg-green-50/50 p-4 rounded-xl border border-green-100/50">
              <Typography variant="subtitle2" className="text-green-700 font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Contact Person Information
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <TextField fullWidth size="small" label="Contact Person Name" required value={formData.vendor_contactPerson_name} onChange={(e) => setFormData({ ...formData, vendor_contactPerson_name: e.target.value })} variant="outlined" sx={{ bgcolor: 'white' }} />
                <TextField fullWidth size="small" label="Contact Person Mobile Number" value={formData.vendor_contactPerson_mobileNo} onChange={(e) => setFormData({ ...formData, vendor_contactPerson_mobileNo: e.target.value })} variant="outlined" sx={{ bgcolor: 'white' }} />
              </div>
            </Box>

            <Box className="bg-purple-50/50 p-4 rounded-xl border border-purple-100/50">
              <Typography variant="subtitle2" className="text-purple-700 font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                Address & Location
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField fullWidth size="small" label="Address" value={formData.vendor_address} onChange={(e) => setFormData({ ...formData, vendor_address: e.target.value })} sx={{ bgcolor: 'white' }} />
                <TextField fullWidth size="small" label="Pin Code" value={formData.vendor_pinCode} onChange={(e) => setFormData({ ...formData, vendor_pinCode: e.target.value })} sx={{ bgcolor: 'white' }} className="md:col-span-1" />
                <TextField fullWidth size="small" label="State" value={formData.vendor_state} onChange={(e) => setFormData({ ...formData, vendor_state: e.target.value })} sx={{ bgcolor: 'white' }} />
                <TextField fullWidth size="small" label="Country" value={formData.vendor_country} onChange={(e) => setFormData({ ...formData, vendor_country: e.target.value })} sx={{ bgcolor: 'white' }} />
              </div>
            </Box>

            <Box className="bg-amber-50/50 p-4 rounded-xl border border-amber-100/50">
              <Typography variant="subtitle2" className="text-amber-700 font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Financial Details
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TextField fullWidth size="small" label="Bank Name" value={formData.vendor_bankName} onChange={(e) => setFormData({ ...formData, vendor_bankName: e.target.value })} sx={{ bgcolor: 'white' }} />
                <TextField fullWidth size="small" label="Account Number" value={formData.vendor_accountNumber} onChange={(e) => setFormData({ ...formData, vendor_accountNumber: e.target.value })} sx={{ bgcolor: 'white' }} />
                <TextField fullWidth size="small" label="IFSC Code" value={formData.vendor_ifscCode} onChange={(e) => setFormData({ ...formData, vendor_ifscCode: e.target.value })} sx={{ bgcolor: 'white' }} />

                <FormControl fullWidth size="small">
                  <InputLabel>Payment Terms</InputLabel>
                  <Select value={formData.vendor_paymentTerms} label="Payment Terms" onChange={(e) => setFormData({ ...formData, vendor_paymentTerms: e.target.value })} sx={{ bgcolor: 'white' }}>
                    {PAYMENT_TERMS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel>Payment Mode</InputLabel>
                  <Select value={formData.vendor_preferredPaymentMode} label="Payment Mode" onChange={(e) => setFormData({ ...formData, vendor_preferredPaymentMode: e.target.value })} sx={{ bgcolor: 'white' }}>
                    {PAYMENT_MODES.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel>GST Type</InputLabel>
                  <Select value={formData.vendor_gstType} label="GST Type" onChange={(e) => setFormData({ ...formData, vendor_gstType: e.target.value })} sx={{ bgcolor: 'white' }}>
                    {GST_TYPES.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                  </Select>
                </FormControl>

                <TextField fullWidth size="small" type="number" label="Credit Limit" value={formData.vendor_creditLimit} onChange={(e) => setFormData({ ...formData, vendor_creditLimit: Number(e.target.value) })} sx={{ bgcolor: 'white' }} />
                <TextField fullWidth size="small" type="number" label="Opening Balance" value={formData.vendor_openingBalance} onChange={(e) => setFormData({ ...formData, vendor_openingBalance: Number(e.target.value) })} sx={{ bgcolor: 'white' }} />
                <TextField fullWidth size="small" type="number" label="Outstanding Balance" value={formData.vendor_outstandingBalance} onChange={(e) => setFormData({ ...formData, vendor_outstandingBalance: Number(e.target.value) })} sx={{ bgcolor: 'white' }} />
              </div>
            </Box>
          </DialogContent>
          <DialogActions className="p-4 pt-2">
            <Button onClick={() => setOpenDialog(false)} className="normal-case text-gray-500 hover:bg-gray-100" size="large">Cancel</Button>
            <Button variant="contained" onClick={handleSaveVendor} className="!bg-blue-600 normal-case px-8 rounded-lg shadow-blue-200 shadow-md" size="large">
              {editingVendor ? "Update Vendor" : "Create Vendor"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
}

export default VendorList;
