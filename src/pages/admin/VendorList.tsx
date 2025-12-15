import React, { useEffect, useState, useRef } from "react";
import { AdminLayout } from "../../layouts/AdminLayout";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    CircularProgress,
} from "@mui/material";
import {
    FiPlus,
    FiSearch,
    FiEdit,
    FiTrash2,
    FiUpload,
    FiDownload,
} from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";
import {
    addVendor,
    addVendorBulkExcel,
    deleteVendor,
    getVendors,
    updateVendor,
    selectVendorLoading,
    selectAllVendorsData,
} from "../../redux/slices/vendorSlice";
import * as XLSX from "xlsx";

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
    const [limit, setLimit] = useState(5);
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

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Fetch Vendors
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
    }, [page, limit]);

    // Open Add/Edit
    const handleOpenDialog = (vendor?: any) => {
        if (vendor) {
            setEditingVendor(vendor);
            setFormData({ ...vendor, franchiseId });
        } else {
            setEditingVendor(null);
            setFormData({
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
        }
        setOpenDialog(true);
    };

    // Save Vendor
    const handleSaveVendor = async () => {
        if (!formData.vendor_name.trim()) return;

        if (editingVendor) {
            await dispatch(
                updateVendor({
                    vendorId: editingVendor._id,
                    vendorData: formData,
                }) as any
            );
        } else {
            await dispatch(addVendor(formData) as any);
        }

        setOpenDialog(false);
        fetchData();
    };

    // Delete Vendor
    const handleDelete = async (id: string) => {
        await dispatch(deleteVendor(id) as any);
        fetchData();
    };

    // ✅ Excel Upload
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

    // ✅ Excel Template
    const handleDownloadTemplate = () => {
        const sample = [
            {
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
                vendor_creditLimit: "",
                vendor_outstandingBalance: "",
                vendor_gstType: "",
                vendor_registrationType: "",
                vendor_gstNumber: "",
                vendor_openingBalance: "",
            },
        ];
        const ws = XLSX.utils.json_to_sheet(sample);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "Vendor_Template.xlsx");
    };

    return (
        <AdminLayout>
            <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-semibold">Vendor List</h1>

                    <div className="flex gap-3">
                        <Button
                            variant="outlined"
                            startIcon={<FiDownload />}
                            onClick={handleDownloadTemplate}
                        >
                            Template
                        </Button>

                        {/* Excel Upload */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            hidden
                            accept=".xlsx,.xls"
                            onChange={handleExcelUpload}
                        />
                        <Button
                            variant="outlined"
                            startIcon={<FiUpload />}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Upload Excel
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<FiPlus />}
                            onClick={() => handleOpenDialog()}
                        >
                            Add Vendor
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-white p-4 rounded-lg shadow">
                    <TextField
                        label="Search Vendor"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        size="small"
                        InputProps={{
                            endAdornment: <FiSearch />,
                        }}
                    />

                    <TextField
                        type="date"
                        label="From Date"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                    />

                    <TextField
                        type="date"
                        label="To Date"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                    />

                    <Button
                        variant="contained"
                        onClick={() => {
                            setPage(0);
                            fetchData();
                        }}
                    >
                        Apply
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={() => {
                            setSearch("");
                            setFromDate("");
                            setToDate("");
                            setPage(0);
                            fetchData();
                        }}
                    >
                        Reset
                    </Button>
                </div>

                {/* Table */}
                <Paper>
                    <TableContainer>
                        <Table sx={{ minWidth: 1200 }}>
                            <TableHead>
                                <TableRow className="bg-gray-100">
                                    <TableCell>Name</TableCell>
                                    <TableCell>Mobile</TableCell>
                                    <TableCell>Address</TableCell>
                                    <TableCell>State</TableCell>
                                    <TableCell>Country</TableCell>
                                    <TableCell>PinCode</TableCell>
                                    <TableCell>Bank</TableCell>
                                    <TableCell>Account No</TableCell>
                                    <TableCell>IFSC</TableCell>
                                    <TableCell>Payment Terms</TableCell>
                                    <TableCell>Payment Mode</TableCell>
                                    <TableCell>Credit Limit</TableCell>
                                    <TableCell>Outstanding</TableCell>
                                    <TableCell>GST Type</TableCell>
                                    <TableCell>GST No</TableCell>
                                    <TableCell>Opening Balance</TableCell>
                                    <TableCell>Created At</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={18} align="center">
                                            <CircularProgress />
                                        </TableCell>
                                    </TableRow>
                                ) : vendorsData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={18} align="center">
                                            No Vendors Found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    vendorsData.map((vendor) => (
                                        <TableRow key={vendor._id}>
                                            <TableCell>{vendor.vendor_name}</TableCell>
                                            <TableCell>{vendor.vendor_mobileNo}</TableCell>
                                            <TableCell>{vendor.vendor_address}</TableCell>
                                            <TableCell>{vendor.vendor_state}</TableCell>
                                            <TableCell>{vendor.vendor_country}</TableCell>
                                            <TableCell>{vendor.vendor_pinCode}</TableCell>
                                            <TableCell>{vendor.vendor_bankName}</TableCell>
                                            <TableCell>{vendor.vendor_accountNumber}</TableCell>
                                            <TableCell>{vendor.vendor_ifscCode}</TableCell>
                                            <TableCell>{vendor.vendor_paymentTerms}</TableCell>
                                            <TableCell>{vendor.vendor_preferredPaymentMode}</TableCell>
                                            <TableCell>{vendor.vendor_creditLimit}</TableCell>
                                            <TableCell>{vendor.vendor_outstandingBalance}</TableCell>
                                            <TableCell>{vendor.vendor_gstType}</TableCell>
                                            <TableCell>{vendor.vendor_gstNumber}</TableCell>
                                            <TableCell>{vendor.vendor_openingBalance}</TableCell>
                                            <TableCell>
                                                {new Date(vendor.createdAt).toLocaleDateString()}
                                            </TableCell>

                                            <TableCell align="right">
                                                <div className="flex gap-3 justify-end">
                                                    <FiEdit
                                                        className="text-blue-600 cursor-pointer"
                                                        size={18}
                                                        onClick={() => handleOpenDialog(vendor)}
                                                    />
                                                    <FiTrash2
                                                        className="text-red-600 cursor-pointer"
                                                        size={18}
                                                        onClick={() => handleDelete(vendor._id)}
                                                    />
                                                </div>
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
                    />
                </Paper>

                {/* Add/Edit Dialog */}
                <Dialog
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                    fullWidth
                    maxWidth="md"
                >
                    <DialogTitle>
                        {editingVendor ? "Edit Vendor" : "Add Vendor"}
                    </DialogTitle>

                    <DialogContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.keys(formData)
                                .filter((k) => k !== "franchiseId")
                                .map((key: any) => (
                                    <TextField
                                        key={key}
                                        label={key.replace(/_/g, " ").toUpperCase()}
                                        type={
                                            key.includes("Balance") ||
                                            key.includes("Limit")
                                                ? "number"
                                                : "text"
                                        }
                                        fullWidth
                                        value={(formData as any)[key]}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                [key]: e.target.value,
                                            })
                                        }
                                    />
                                ))}
                        </div>
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleSaveVendor}>
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </AdminLayout>
    );
}

export default VendorList;
