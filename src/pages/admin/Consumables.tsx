import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  MenuItem,
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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useEffect, useState, useMemo } from "react";
import { FiSearch, FiRefreshCw, FiFileText, FiDownload } from "react-icons/fi";
import { toast } from "react-hot-toast";

import { AdminLayout } from "../../layouts/AdminLayout";
import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";

import {
  getConsumableStocks,
  selectConsumableStockState,
} from "../../redux/slices/consumableStockSlice";

// Note: This is a read-only consumption log screen
// It displays consumption history from Kitchen Consumption screen

const Consumables: React.FC = () => {
  const dispatch = useAppDispatch();

  const { loading, consumableStocks, allConsumableStocksData } = useAppSelector(
    selectConsumableStockState
  );

  // ---------------- Filters ----------------
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");
  const [purposeFilter, setPurposeFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");

  // ---------------- Pagination ----------------
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  // ---------------- Report Modal ----------------
  const [reportOpen, setReportOpen] = useState(false);

  // ---------------- Fetch consumables ----------------
  useEffect(() => {
    dispatch(
      getConsumableStocks({
        page: page + 1,
        limit,
        search,
        fromDate,
        toDate,
      })
    );
  }, [
    dispatch,
    page,
    search,
    limit,
    fromDate,
    toDate,
  ]);

  const handleResetFilters = () => {
    setSearch("");
    setPurposeFilter("");
    setUserFilter("");
    setFromDate("");
    setToDate("");
    setPage(0);
  };

  // Filter data client-side for purpose and user
  const filteredData = useMemo(() => {
    return consumableStocks.filter((row) => {
      const isWastage = (row.transfersToWastage || 0) > 0;
      const purpose = isWastage ? "Wastage" : "Usage";

      // Purpose filter
      if (purposeFilter && purpose !== purposeFilter) {
        return false;
      }

      // User filter (placeholder - add when user field is available)
      if (userFilter && !("Admin".toLowerCase().includes(userFilter.toLowerCase()))) {
        return false;
      }

      return true;
    });
  }, [consumableStocks, purposeFilter, userFilter]);

  // Calculate summary statistics
  const reportSummary = useMemo(() => {
    let totalConsumed = 0;
    let totalWastage = 0;
    let totalUsage = 0;
    const productBreakdown: Record<string, { name: string; consumed: number; wastage: number; usage: number }> = {};

    filteredData.forEach((row) => {
      const usageQty = row.transfersToUsage || 0;
      const wastageQty = row.transfersToWastage || 0;
      const consumedQty = usageQty + wastageQty;

      totalConsumed += consumedQty;
      totalWastage += wastageQty;
      totalUsage += usageQty;

      // Product breakdown
      const productId = row.productId?._id;
      const productName = row.productId?.productName || "Unknown";

      if (productId) {
        if (!productBreakdown[productId]) {
          productBreakdown[productId] = {
            name: productName,
            consumed: 0,
            wastage: 0,
            usage: 0,
          };
        }

        productBreakdown[productId].consumed += consumedQty;
        productBreakdown[productId].wastage += wastageQty;
        productBreakdown[productId].usage += usageQty;
      }
    });

    return {
      totalConsumed,
      totalWastage,
      totalUsage,
      productBreakdown: Object.values(productBreakdown),
      recordCount: filteredData.length,
    };
  }, [filteredData]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ["Date", "Product", "Category", "Consumed Qty", "Unit", "Purpose", "User", "Remarks"];
    const rows = filteredData.map((row) => {
      const usageQty = row.transfersToUsage || 0;
      const wastageQty = row.transfersToWastage || 0;
      const consumedQty = usageQty + wastageQty;
      const purpose = wastageQty > 0 ? (usageQty > 0 ? "Both" : "Wastage") : "Usage";

      return [
        dayjs(row.createdAt).format("DD/MM/YYYY HH:mm"),
        row.productId?.productName || "",
        row.productId?.categoryId?.categoryName || "N/A",
        consumedQty || 0,
        row.productId?.unit || "N/A",
        purpose,
        "Admin",
        "-",
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
      "",
      "Summary",
      `Total Records,${reportSummary.recordCount}`,
      `Total Consumed,${reportSummary.totalConsumed}`,
      `Total Usage,${reportSummary.totalUsage}`,
      `Total Wastage,${reportSummary.totalWastage}`,
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `consumption_report_${dayjs().format("YYYY-MM-DD")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV report downloaded successfully!");
  };

  // Export to PDF using jsPDF
  const handleExportPDF = () => {
    try {
      // Dynamically import jsPDF and autoTable
      Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ]).then(([jsPDFModule, autoTableModule]) => {
        const { jsPDF } = jsPDFModule;
        const autoTable = autoTableModule.default;

        const doc = new jsPDF();

        // Title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Consumption Report', 14, 20);

        // Generated date
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated on: ${dayjs().format("DD/MM/YYYY HH:mm")}`, 14, 28);

        // Filters Applied
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Filters Applied:', 14, 38);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Date Range: ${fromDate || "All"} to ${toDate || "All"}`, 14, 44);
        doc.text(`Search: ${search || "None"}`, 14, 50);
        doc.text(`Purpose: ${purposeFilter || "All"}`, 14, 56);
        doc.text(`User: ${userFilter || "All"}`, 14, 62);

        // Summary Statistics
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Summary Statistics:', 14, 72);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Total Records: ${reportSummary.recordCount}`, 14, 78);
        doc.text(`Total Consumed: ${reportSummary.totalConsumed}`, 14, 84);
        doc.text(`Total Usage: ${reportSummary.totalUsage}`, 70, 78);
        doc.text(`Total Wastage: ${reportSummary.totalWastage}`, 70, 84);

        // Consumption Records Table
        const tableData = filteredData.map((row) => {
          const usageQty = row.transfersToUsage || 0;
          const wastageQty = row.transfersToWastage || 0;
          const consumedQty = usageQty + wastageQty;
          const purpose = wastageQty > 0 ? (usageQty > 0 ? "Both" : "Wastage") : "Usage";

          return [
            dayjs(row.createdAt).format("DD/MM/YY HH:mm"),
            row.productId?.productName || "",
            row.productId?.categoryId?.categoryName || "N/A",
            consumedQty || 0,
            row.productId?.unit || "N/A",
            purpose,
            "Admin",
            "-"
          ];
        });

        // Use autoTable
        autoTable(doc, {
          startY: 92,
          head: [['Date', 'Product', 'Category', 'Qty', 'Unit', 'Purpose', 'User', 'Remarks']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [66, 139, 202], fontSize: 9 },
          bodyStyles: { fontSize: 8 },
          columnStyles: {
            0: { cellWidth: 28 },
            1: { cellWidth: 35 },
            2: { cellWidth: 25 },
            3: { cellWidth: 15, halign: 'center' },
            4: { cellWidth: 15 },
            5: { cellWidth: 20 },
            6: { cellWidth: 20 },
            7: { cellWidth: 20 }
          },
          margin: { top: 92 }
        });

        // Save PDF
        doc.save(`consumption_report_${dayjs().format("YYYY-MM-DD")}.pdf`);
        toast.success("PDF report downloaded successfully!");
      }).catch((error) => {
        console.error("Error loading PDF libraries:", error);
        toast.error("Failed to load PDF library. Please try again.");
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  // ---------------- Render ----------------
  return (
    <AdminLayout>
      <Box className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        {/* Filter Bar */}
        <Box className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border-b border-gray-100 bg-white shadow-sm shrink-0">
          {/* Filters Area */}
          <Box className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <TextField
              placeholder="Search product..."
              size="small"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearch(e.target.value);
                setPage(0);
              }}
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFromDate(e.target.value)}
                className="w-40"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />
              <TextField
                type="date"
                size="small"
                label="To"
                InputLabelProps={{ shrink: true }}
                value={toDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToDate(e.target.value)}
                className="w-40"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />
            </Box>

            <TextField
              select
              size="small"
              label="Purpose"
              value={purposeFilter}
              onChange={(e) => setPurposeFilter(e.target.value)}
              className="w-40"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Usage">Usage</MenuItem>
              <MenuItem value="Wastage">Wastage</MenuItem>
            </TextField>

            <TextField
              size="small"
              placeholder="Filter by user..."
              value={userFilter}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserFilter(e.target.value)}
              className="w-48"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
            />

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

          {/* Generate Report Button */}
          <Box className="w-full md:w-auto flex justify-end">
            <Button
              variant="contained"
              startIcon={<FiFileText />}
              onClick={() => setReportOpen(true)}
              className="bg-green-600 hover:bg-green-700 normal-case"
            >
              Generate Report
            </Button>
          </Box>
        </Box>

        {/* Content Section */}
        <Box className="flex-1 flex flex-col overflow-hidden p-2 sm:p-4">
          {/* Summary Cards */}
          <Box className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 shrink-0">
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <Typography variant="caption" className="text-gray-500">Total Records</Typography>
                <Typography variant="h5" className="font-bold text-blue-600">{reportSummary.recordCount}</Typography>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <Typography variant="caption" className="text-gray-500">Total Consumed</Typography>
                <Typography variant="h5" className="font-bold text-purple-600">{reportSummary.totalConsumed}</Typography>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <Typography variant="caption" className="text-gray-500">Total Usage</Typography>
                <Typography variant="h5" className="font-bold text-green-600">{reportSummary.totalUsage}</Typography>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <Typography variant="caption" className="text-gray-500">Total Wastage</Typography>
                <Typography variant="h5" className="font-bold text-red-600">{reportSummary.totalWastage}</Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Read-Only Table Section */}
          <Paper className="flex-1 flex flex-col shadow-md rounded-xl overflow-hidden border border-gray-100 bg-white">
            <TableContainer className="flex-1 overflow-auto">
              <Table stickyHeader>
                <TableHead className="bg-gray-50/80 backdrop-blur-md z-10">
                  <TableRow>
                    <TableCell className="font-bold bg-inherit">Date</TableCell>
                    <TableCell className="font-bold bg-inherit">Product</TableCell>
                    <TableCell className="font-bold bg-inherit">Category</TableCell>
                    <TableCell className="font-bold text-center bg-inherit">Consumed Qty</TableCell>
                    <TableCell className="font-bold bg-inherit">Unit</TableCell>
                    <TableCell className="font-bold bg-inherit">Purpose</TableCell>
                    <TableCell className="font-bold bg-inherit">User</TableCell>
                    <TableCell className="font-bold bg-inherit">Remarks</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" className="py-10">
                        <CircularProgress size={30} />
                        <Typography className="mt-2 text-gray-500 text-sm">
                          Loading consumption logs...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" className="py-10 text-gray-500 text-sm">
                        No consumption records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((row) => {
                      const usageQty = row.transfersToUsage || 0;
                      const wastageQty = row.transfersToWastage || 0;
                      const consumedQty = usageQty + wastageQty;
                      const isWastage = wastageQty > 0 && usageQty === 0;
                      const purpose = wastageQty > 0 ? (usageQty > 0 ? "Both" : "Wastage") : "Usage";

                      return (
                        <TableRow key={row._id} hover>
                          <TableCell className="text-gray-600">
                            {dayjs(row.createdAt).format("DD/MM/YYYY HH:mm")}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" className="font-medium">
                              {row.productId?.productName}
                            </Typography>
                            <Typography
                              variant="caption"
                              className="text-gray-500"
                            >
                              {row.productId?.packSize}
                            </Typography>
                          </TableCell>
                          <TableCell className="capitalize">
                            {row.productId?.categoryId?.categoryName || "N/A"}
                          </TableCell>
                          <TableCell className="text-center font-bold text-blue-600">
                            {consumedQty || 0}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {row.productId?.unit || "N/A"}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={purpose}
                              size="small"
                              color={isWastage ? "error" : "success"}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell className="text-gray-600">
                            Admin
                          </TableCell>
                          <TableCell className="text-gray-500 text-sm max-w-xs truncate">
                            -
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
              count={allConsumableStocksData?.pagination.total || 0}
              page={page}
              onPageChange={(
                _: React.MouseEvent<HTMLButtonElement> | null,
                p: number
              ) => setPage(p)}
              rowsPerPage={limit}
              onRowsPerPageChange={(
                e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
              ) => {
                setLimit(parseInt(e.target.value, 10));
                setPage(0);
              }}
              className="border-t bg-gray-50"
            />
          </Paper>

          {/* Info Box */}
          <Box className="mt-4 p-3 bg-blue-50/50 border border-blue-100 rounded-lg shrink-0">
            <Typography variant="body2" className="text-blue-800 text-xs sm:text-sm">
              <strong>Note:</strong> This is a read-only consumption log. Records are automatically created when items are consumed from the Kitchen Consumption screen.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Report Modal */}
      <Dialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="bg-gray-50 border-b">
          <Box className="flex items-center justify-between">
            <Typography variant="h6" className="font-bold">Consumption Report</Typography>
            <Typography variant="caption" className="text-gray-500">
              Generated on {dayjs().format("DD/MM/YYYY HH:mm")}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent className="mt-4">
          {/* Filters Applied */}
          <Box className="mb-4 p-3 bg-gray-50 rounded">
            <Typography variant="subtitle2" className="font-bold mb-2">Filters Applied:</Typography>
            <Box className="grid grid-cols-2 gap-4">
              <Box>
                <Typography variant="caption" className="text-gray-600">
                  <strong>Date Range:</strong> {fromDate || "All"} to {toDate || "All"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" className="text-gray-600">
                  <strong>Search:</strong> {search || "None"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" className="text-gray-600">
                  <strong>Purpose:</strong> {purposeFilter || "All"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" className="text-gray-600">
                  <strong>User:</strong> {userFilter || "All"}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider className="my-4" />

          {/* Summary Statistics */}
          <Typography variant="subtitle2" className="font-bold mb-3">Summary Statistics:</Typography>
          <Box className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <Box>
              <Card className="bg-blue-50">
                <CardContent className="text-center p-4">
                  <Typography variant="caption" className="text-gray-600">Records</Typography>
                  <Typography variant="h6" className="font-bold text-blue-600">
                    {reportSummary.recordCount}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box>
              <Card className="bg-purple-50">
                <CardContent className="text-center p-4">
                  <Typography variant="caption" className="text-gray-600">Total Consumed</Typography>
                  <Typography variant="h6" className="font-bold text-purple-600">
                    {reportSummary.totalConsumed}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box>
              <Card className="bg-green-50">
                <CardContent className="text-center p-4">
                  <Typography variant="caption" className="text-gray-600">Usage</Typography>
                  <Typography variant="h6" className="font-bold text-green-600">
                    {reportSummary.totalUsage}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box>
              <Card className="bg-red-50">
                <CardContent className="text-center p-4">
                  <Typography variant="caption" className="text-gray-600">Wastage</Typography>
                  <Typography variant="h6" className="font-bold text-red-600">
                    {reportSummary.totalWastage}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>

          <Divider className="my-4" />

          {/* Product Breakdown */}
          <Typography variant="subtitle2" className="font-bold mb-3">Product Breakdown:</Typography>
          <TableContainer component={Paper} variant="outlined" className="max-h-64">
            <Table size="small">
              <TableHead className="bg-gray-50">
                <TableRow>
                  <TableCell className="font-bold">Product</TableCell>
                  <TableCell className="font-bold text-right">Consumed</TableCell>
                  <TableCell className="font-bold text-right">Usage</TableCell>
                  <TableCell className="font-bold text-right">Wastage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportSummary.productBreakdown.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell className="text-right font-bold">{product.consumed}</TableCell>
                    <TableCell className="text-right text-green-600">{product.usage}</TableCell>
                    <TableCell className="text-right text-red-600">{product.wastage}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>

        <DialogActions className="bg-gray-50 border-t p-4">
          <Button
            onClick={() => setReportOpen(false)}
            variant="outlined"
            className="normal-case"
          >
            Close
          </Button>
          <Button
            onClick={handleExportCSV}
            startIcon={<FiDownload />}
            variant="outlined"
            color="success"
            className="normal-case"
          >
            Export CSV
          </Button>
          <Button
            onClick={handleExportPDF}
            startIcon={<FiDownload />}
            variant="contained"
            color="primary"
            className="normal-case"
          >
            Export PDF
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default Consumables;
