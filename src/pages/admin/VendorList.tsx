import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
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
import { VendorDialogForm } from "../../components/adminComponents/VendorDialogForm";
import {
  addVendor,
  addVendorBulkExcel,
  deleteVendor,
  getVendors,
  selectAllVendorsData,
  selectVendorLoading,
  updateVendor,
  type GetVendorData,
  type BulkVendorExcelResponse,
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
  const [editingVendor, setEditingVendor] = useState<GetVendorData | null>(null);
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

  /* const PAYMENT_TERMS = ["Net 15", "Net 30", "On Delivery"]; */
  /* const PAYMENT_MODES = ["Cash", "Bank Transfer", "UPI", "Cheque"]; */
  /* const GST_TYPES = ["Cgst Sgst", "Igst", "Non Gst", "Exempt"]; */
  /* const REGISTRATION_TYPES = ["Composition", "Registered", "UnRegistered"]; */
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchData = () => {
    dispatch(
      getVendors({
        search,
        page: page + 1,
        limit,
        fromDate,
        toDate,
      })
    );
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, search, fromDate, toDate]);

  const handleOpenDialog = (vendor?: GetVendorData) => {
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

  const handleSaveVendor = async (data: GetVendorData) => {
    // VendorDialogForm returns data.
    // If editing, merge with ID. 
    // BUT VendorDialogForm may not include ALL fields that were in local 'formData'.
    // However, existing data shouldn't be overridden if not in form? 
    // Actually full replacement is safer or partial?
    // The previous implementation used formData which was local state.
    // Now we get 'data' from the form on submit.
    
    // Ensure we send franchiseId if needed
    const payload = { ...formData, ...data, franchiseId }; // merge whatever initial + new data
    
    // We don't need to manually check validation as form handles it? 
    // VendorDialogForm checks for vender_name.

    if (editingVendor && editingVendor._id) {
      await dispatch(
        updateVendor({
          vendorId: editingVendor._id,
          vendorData: payload,
        })
      );
    } else {
      await dispatch(addVendor(payload));
    }

    setOpenDialog(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vendor?")) return;
    await dispatch(deleteVendor(id));
    fetchData();
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);
    fd.append("franchiseId", franchiseId);

    const res = await dispatch(addVendorBulkExcel(fd));
    const result = res?.payload as BulkVendorExcelResponse;

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
      <Box className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        {/* Header Section */}
        <Box className="bg-white p-4 shadow-sm border-b border-gray-100 shrink-0">
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
        <Box className="flex-1 flex flex-col overflow-hidden p-2 sm:p-3">
          <Paper className="flex-1 flex flex-col shadow-md rounded-xl overflow-hidden border border-gray-100 bg-white">
            <TableContainer className="flex-1 overflow-auto">
              <Table stickyHeader size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell className="bg-gray-50/80 backdrop-blur-md z-10 font-bold text-gray-700 py-3">Vendor Info</TableCell>
                    <TableCell className="bg-gray-50/80 backdrop-blur-md z-10 font-bold text-gray-700 py-3">Contact Details</TableCell>
                    <TableCell className="bg-gray-50/80 backdrop-blur-md z-10 font-bold text-gray-700 py-3 text-center">Contact Person</TableCell>
                    <TableCell className="bg-gray-50/80 backdrop-blur-md z-10 font-bold text-gray-700 py-3">Location</TableCell>
                    <TableCell className="bg-gray-50/80 backdrop-blur-md z-10 font-bold text-gray-700 py-3">Bank Info</TableCell>
                    <TableCell className="bg-gray-50/80 backdrop-blur-md z-10 font-bold text-gray-700 py-3">Terms</TableCell>
                    <TableCell className="bg-gray-50/80 backdrop-blur-md z-10 font-bold text-gray-700 py-3 text-center">Credit</TableCell>
                    <TableCell className="bg-gray-50/80 backdrop-blur-md z-10 font-bold text-gray-700 py-3 text-center">Outstanding</TableCell>
                    <TableCell className="bg-gray-50/80 backdrop-blur-md z-10 font-bold text-gray-700 py-3">Created</TableCell>
                    <TableCell className="bg-gray-50/80 backdrop-blur-md z-10 font-bold text-gray-700 py-3" align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={10} align="center" className="py-20"><CircularProgress size={30} /></TableCell></TableRow>
                  ) : vendorsData.length === 0 ? (
                    <TableRow><TableCell colSpan={10} align="center" className="py-20 text-gray-500 text-sm">No vendors found.</TableCell></TableRow>
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
                          <Typography variant="body2" className="text-gray-700">{vendor.vendor_email || "-"}</Typography>
                        </TableCell>
                        <TableCell className="py-3 max-w-[200px]">
                          <Typography variant="body2" className="truncate text-gray-700">{vendor.vendor_contactPerson_name || '-'}</Typography>
                          <Typography variant="caption" className="text-gray-500">{vendor.vendor_contactPerson_mobileNo || '-'}</Typography>
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
                            <IconButton onClick={() => vendor?._id && handleDelete(vendor._id)} size="small" className="text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100">
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
              className="border-t bg-gray-50 shrink-0"
            />
          </Paper>
        </Box>

      <VendorDialogForm
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSave={handleSaveVendor}
        isEdit={!!editingVendor}
        initialData={editingVendor}
      />
      </Box>
    </AdminLayout>
  );
}

export default VendorList;
