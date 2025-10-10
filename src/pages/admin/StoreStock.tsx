import {
  Box,
  Chip,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import React, { useState } from "react";
import {
  FiFileText,
  FiRefreshCw,
  FiSearch,
  FiTable
} from "react-icons/fi";
import { AdminLayout } from "../../layouts/AdminLayout";

// ✅ Type Definition
export interface StockItem {
  id: number;
  product_name: string;
  category: string;
  brand: string;
  unit: string;
  closingStock: number;
  taxableValue: number;
  perUnitRate: number;
  gst: number;
  totalAmount: number;
  status: string;
}

// ✅ Dummy Data
const categories = ["Dairy", "Bakery", "Beverages", "Snacks", "Personal Care"];
const brands = ["Amul", "Nestle", "Britannia", "Parle", "Colgate"];

// ✅ Updated Logic for Status
const stockData: StockItem[] = Array.from({ length: 50 }, (_, i) => {
  const closingStock = Math.floor(Math.random() * 200);
  let status = "";

  if (closingStock === 0) status = "Out of Stock";
  else if (closingStock <= 10) status = "Low Stock";
  else status =  "In Stock";

  return {
    id: i + 1,
    product_name: `Product ${i + 1}`,
    category: categories[i % categories.length],
    brand: brands[i % brands.length],
    unit: ["Kg", "Liter", "Pack", "Piece"][i % 4],
    closingStock,
    taxableValue: Math.floor(Math.random() * 5000) + 500,
    perUnitRate: Math.floor(Math.random() * 300) + 50,
    gst: [5, 12, 18, 28][i % 4],
    totalAmount: Math.floor(Math.random() * 7000) + 1000,
    status,
  };
});

// ✅ Component
const StoreStock: React.FC = () => {
  const [data, setData] = useState<StockItem[]>(stockData);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All"); // ✅ Status filter state

  // ✅ Filtering
  const filteredData = data.filter((item) => {
    const matchesSearch = item.product_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesBrand = selectedBrand === "All" || item.brand === selectedBrand;
    const matchesStatus =
      selectedStatus === "All" || item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesBrand && matchesStatus;
  });

  // ✅ Pagination
  const start = (page - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(start, start + rowsPerPage);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  // ✅ Handlers
  const handleRefresh = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedBrand("All");
    setSelectedStatus("All");
  };

  return (
    <AdminLayout>
      <Box sx={{ p: 3, bgcolor: "#f9f9f9", minHeight: "100vh" }}>
        {/* Header Section */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          mb={2}
        >
          {/* Filters */}
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
            <TextField
              placeholder="Search Product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiSearch />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Brand</InputLabel>
              <Select
                value={selectedBrand}
                label="Brand"
                onChange={(e) => setSelectedBrand(e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                {brands.map((b) => (
                  <MenuItem key={b} value={b}>
                    {b}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* ✅ Status Filter */}
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                label="Status"
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="In Stock">In Stock</MenuItem>
                <MenuItem value="Low Stock">Low Stock</MenuItem>
                <MenuItem value="Out of Stock">Out of Stock</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Actions */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Export PDF">
              <IconButton sx={{ backgroundColor: "#f44336", color: "white" }}>
                <FiFileText />
              </IconButton>
            </Tooltip>

            <Tooltip title="Export Excel">
              <IconButton sx={{ backgroundColor: "#4caf50", color: "white" }}>
                <FiTable />
              </IconButton>
            </Tooltip>

            <Tooltip title="Refresh">
              <IconButton
                sx={{ backgroundColor: "#2196f3", color: "white" }}
                onClick={handleRefresh}
              >
                <FiRefreshCw />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Table */}
        <TableContainer
          component={Paper}
          sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell>S.No</TableCell>
                <TableCell>Product Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Brand</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Closing Stock</TableCell>
                <TableCell>Per Unit Rate</TableCell>
                <TableCell>Taxable Value</TableCell>
                <TableCell>GST (%)</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedData.map((item, index) => (
                <TableRow key={item.id} hover>
                  <TableCell>{start + index + 1}</TableCell>
                  <TableCell>{item.product_name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.brand}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell align="center">{item.closingStock}</TableCell>
                  <TableCell>₹{item.perUnitRate}</TableCell>
                  <TableCell>₹{item.taxableValue.toLocaleString()}</TableCell>
                  <TableCell>{item.gst}%</TableCell>
                  <TableCell>₹{item.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.status}
                      color={
                        item.status === "In Stock"
                          ? "success"
                          : item.status === "Low Stock"
                            ? "warning"
                            : "error"
                      }
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Rows per page
            </Typography>
            <Select<number>
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              size="small"
              sx={{ minWidth: 80 }}
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
            showFirstButton
            showLastButton
          />
        </Box>
      </Box>
    </AdminLayout>
  );
};

export default StoreStock;
