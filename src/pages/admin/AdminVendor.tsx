import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Pagination,
  Select,
  TextField,
  Typography,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { FiSearch, FiDownload, FiUpload, FiEdit, FiTrash2 } from "react-icons/fi";
import { AdminLayout } from "../../layouts/AdminLayout";
import { DateRangeFilter, type DateRangeValue } from "../../components/common/DateRangeFilter";
import { getVendors, deleteVendor } from "../../redux/slices/vendorSlice";
import { selectVendors, selectVendorLoading, selectAllVendorsData } from "../../redux/slices/vendorSlice";
import type { AppDispatch } from "../../redux/store/store";
import dayjs from "dayjs";

const AdminVendor: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const vendors = useSelector(selectVendors);
  const loading = useSelector(selectVendorLoading);
  const allVendorsData = useSelector(selectAllVendorsData);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [dateRange, setDateRange] = useState<DateRangeValue>([null, null]);

  useEffect(() => {
    const fromDate = dateRange[0] ? dateRange[0].startOf('day').toISOString() : '';
    const toDate = dateRange[1] ? dateRange[1].endOf('day').toISOString() : '';
    dispatch(getVendors({ 
      search: searchTerm, 
      page, 
      limit: rowsPerPage,
      fromDate,
      toDate,
    }));
  }, [dispatch, searchTerm, page, rowsPerPage, dateRange]);

  // 🔍 Filtered data (search + date) - client-side filtering for additional filtering if needed
  const filteredData = useMemo(() => {
    if (!vendors || vendors.length === 0) return [];
    
    return vendors.filter((vendor) => {
      const matchesSearch = (vendor.vendorName || vendor.name || '').toLowerCase().includes(searchTerm.toLowerCase());

      if (dateRange[0] && dateRange[1] && vendor.createdAt) {
        const vendorDate = dayjs(vendor.createdAt);
        const start = dateRange[0];
        const end = dateRange[1];
        const inRange = vendorDate.isAfter(start, "day") && vendorDate.isBefore(end, "day");
        return matchesSearch && inRange;
      }

      return matchesSearch;
    });
  }, [vendors, searchTerm, dateRange]);

  // 📄 Pagination
  const totalPages = allVendorsData?.totalPages || Math.ceil((filteredData.length || 0) / rowsPerPage);
  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleDelete = async (vendorId: string) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      await dispatch(deleteVendor(vendorId));
      // Refresh the list
      const fromDate = dateRange[0] ? dateRange[0].startOf('day').toISOString() : '';
      const toDate = dateRange[1] ? dateRange[1].endOf('day').toISOString() : '';
      dispatch(getVendors({ search: searchTerm, page, limit: rowsPerPage, fromDate, toDate }));
    }
  };

  return (
    <AdminLayout>
      <Box className="p-6">
        {/* ---------- HEADER ---------- */}
        <Card className="mb-6 shadow-md">
          <CardContent className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <Box className="flex flex-col sm:flex-row gap-4 w-full md:w-auto mt-1">
              <TextField
                size="small"
                placeholder="Search vendor..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FiSearch size={18} className="text-gray-500" />
                    </InputAdornment>
                  ),
                }}
                className="w-full sm:w-64"
              />

              <DateRangeFilter
                value={dateRange}
                onChange={(newValue) => {
                  setDateRange(newValue);
                  setPage(1);
                }}
                size="small"
                className="w-full sm:w-80"
              />
            </Box>

            <div className="flex gap-3 w-full md:w-auto justify-end">
              <Button
                startIcon={<FiDownload />}
                variant="outlined"
                color="inherit"
                className="normal-case"
              >
                Export
              </Button>
              <Button
                startIcon={<FiUpload />}
                variant="outlined"
                color="inherit"
                className="normal-case"
              >
                Import
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ---------- TABLE ---------- */}
        <TableContainer component={Paper} className="shadow-md">
          <Table>
            <TableHead className="bg-gray-100">
              <TableRow>
                <TableCell>S.No</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Payment Status</TableCell>
                <TableCell>Closing</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((vendor, index) => (
                  <TableRow key={vendor._id || vendor.id}>
                    <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{vendor.vendorName || vendor.name || 'N/A'}</TableCell>
                    <TableCell>₹{(vendor as any).amount?.toLocaleString() || '0'}</TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          (vendor as any).paymentStatus === "Paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {(vendor as any).paymentStatus || 'Pending'}
                      </span>
                    </TableCell>
                    <TableCell>{(vendor as any).closing || 'N/A'}</TableCell>
                    <TableCell>{vendor.createdAt ? dayjs(vendor.createdAt).format("DD MMM YYYY") : 'N/A'}</TableCell>
                    <TableCell>
                      <Box className="flex gap-3">
                        <Tooltip title="Edit">
                          <Button
                            size="small"
                            color="primary"
                            startIcon={<FiEdit />}
                          />
                        </Tooltip>
                        <Tooltip title="Delete">
                          <Button
                            size="small"
                            color="error"
                            startIcon={<FiTrash2 />}
                            onClick={() => handleDelete(vendor._id || vendor.id)}
                          />
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No vendors found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ---------- PAGINATION ---------- */}
        <Box className="flex justify-between items-center px-4 py-3">
          <Box className="flex items-center gap-2">
            <Typography variant="body2" className="text-gray-600">
              Vendors per page
            </Typography>
            <Select
              size="small"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
            </Select>
          </Box>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            disabled={totalPages === 0}
          />
        </Box>
      </Box>
    </AdminLayout>
  );
};

export default AdminVendor;
