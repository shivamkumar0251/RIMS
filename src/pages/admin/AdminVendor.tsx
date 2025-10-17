import React, { useState, useMemo } from "react";
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
} from "@mui/material";
import { FiSearch, FiDownload, FiUpload, FiEdit, FiTrash2 } from "react-icons/fi";
import { AdminLayout } from "../../layouts/AdminLayout";
import { vendorData } from "../../data/VendorDummyData";
import { DateRangeFilter, type DateRangeValue } from "../../components/common/DateRangeFilter";
import dayjs from "dayjs";

const AdminVendor: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [dateRange, setDateRange] = useState<DateRangeValue>([null, null]);

  // 🔍 Filtered data (search + date)
  const filteredData = useMemo(() => {
    return vendorData.filter((vendor) => {
      const matchesSearch = vendor.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      if (dateRange[0] && dateRange[1]) {
        const vendorDate = dayjs(vendor.date);
        const start = dateRange[0];
        const end = dateRange[1];
        const inRange =
          vendorDate.isAfter(start, "day") && vendorDate.isBefore(end, "day");
        return matchesSearch && inRange;
      }

      return matchesSearch;
    });
  }, [searchTerm, dateRange]);

  // 📄 Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

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
              {paginatedData.length > 0 ? (
                paginatedData.map((vendor, index) => (
                  <TableRow key={vendor.id}>
                    <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{vendor.name}</TableCell>
                    <TableCell>₹{vendor.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          vendor.paymentStatus === "Paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {vendor.paymentStatus}
                      </span>
                    </TableCell>
                    <TableCell>{vendor.closing}</TableCell>
                    <TableCell>{dayjs(vendor.date).format("DD MMM YYYY")}</TableCell>
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
