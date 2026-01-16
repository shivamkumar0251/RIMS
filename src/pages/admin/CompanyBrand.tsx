import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
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
import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import { FiDownload, FiEdit, FiPlus, FiRefreshCw, FiSearch, FiTrash2 } from "react-icons/fi";
import { AdminLayout } from "../../layouts/AdminLayout";

import {
  addCompany,
  addCompanyBulkExcel,
  deleteCompany,
  getCompanies,
  selectAllCompaniesData,
  selectCompanyState,
  updateCompany,
  type BulkCompanyExcelResponse,
  type Company
} from "../../redux/slices/companySlice";
import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";

export default function CompanyBrand() {
  const dispatch = useAppDispatch();

  /** ======= REDUX STATES ======= **/
  const { loading, companies } = useAppSelector(selectCompanyState);
  const { total } = useAppSelector(selectAllCompaniesData) || { total: 0, limit: 10, page: 1 };

  /** ======= LOCAL STATES ======= **/
  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const [pageNo, setPageNo] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [editOpen, setEditOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Company | null>(null);
  const [newBrandName, setNewBrandName] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /** ========== FETCH DATA ============ **/
  useEffect(() => {
    dispatch(
      getCompanies({
        page: pageNo + 1,
        limit: rowsPerPage,
        search: query || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined
      })
    );
  }, [dispatch, pageNo, rowsPerPage, query, fromDate, toDate]);

  /** ========= ADD / UPDATE BRAND ========= **/
  const handleSaveBrand = async () => {
    if (!newBrandName.trim()) return;

    if (editingBrand) {
      await dispatch(
        updateCompany({
          companyId: editingBrand._id,
          companyData: { brandName: newBrandName }
        }) as any
      );
    } else {
      await dispatch(addCompany({ brandName: newBrandName }) as any);
    }

    setEditOpen(false);
    setNewBrandName("");
  };

  /** ========= DELETE BRAND ========= **/
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this brand?")) return;
    await dispatch(deleteCompany(id) as any);
  };

  /** ========= BULK UPLOAD EXCEL ========= **/
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await dispatch(addCompanyBulkExcel(formData) as any);
    const result: BulkCompanyExcelResponse = res.payload;

    if (result?.success) {
      alert(`Inserted: ${result.insertedCount}`);
    }
    e.target.value = "";
  };

  /** ========= DOWNLOAD TEMPLATE ========= **/
  const handleDownloadTemplate = () => {
    const csvContent = "brandName\nSample Brand 1\nSample Brand 2";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "CompanyBrandTemplate.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFilters = () => {
    setQuery("");
    setFromDate("");
    setToDate("");
    setPageNo(0);
  };

  return (
    <AdminLayout>
      <div>
        {/* Combined Filter & Actions Bar */}
        <Box className="flex flex-col md:flex-row items-center justify-between gap-4  p-4 border border-gray-100 shadow-sm">
          {/* Filters Area */}
          <Box className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <TextField
              placeholder="Search brand by name..."
              size="small"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPageNo(0); }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiSearch className="text-gray-400" />
                  </InputAdornment>
                ),
              }}
              className="w-full sm:w-64"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: "#fcfcfc" } }}
            />
            
            <Box className="flex items-center gap-2">
              <TextField
                type="date"
                size="small"
                label="From"
                InputLabelProps={{ shrink: true }}
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setPageNo(0); }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                className="w-64"
              />
              <TextField
                type="date"
                size="small"
                label="To"
                InputLabelProps={{ shrink: true }}
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setPageNo(0); }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                className="w-64"
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
            <Button 
              variant="outlined" 
              startIcon={<FiDownload />} 
              onClick={handleDownloadTemplate} 
              size="small" 
              className="normal-case border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Template
            </Button>
            <input type="file" ref={fileInputRef} accept=".xlsx,.xls,.csv" hidden onChange={handleExcelUpload} />
            <Button 
              variant="outlined" 
              startIcon={<FiDownload />} 
              onClick={() => fileInputRef.current?.click()} 
              size="small" 
              className="normal-case border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Import
            </Button>
            <Button 
              variant="contained" 
              startIcon={<FiPlus />} 
              onClick={() => { setEditingBrand(null); setNewBrandName(""); setEditOpen(true); }}
              // className="!bg-blue-600 hover:!bg-blue-700 normal-case shadow-none"
              size="small"
            >
              Add Brand
            </Button>
          </Box>
        </Box>

        {/* Premium Table Card */}
        <Paper className="shadow-sm rounded-2xl overflow-hidden border border-gray-100 bg-white">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                  <TableCell className="font-bold py-5 text-gray-500 uppercase text-[11px] tracking-wider" style={{ width: 100, paddingLeft: '24px' }}>S.No</TableCell>
                  <TableCell className="font-bold py-5 text-gray-500 uppercase text-[11px] tracking-wider">Brand Name</TableCell>
                  <TableCell className="font-bold py-5 text-gray-500 uppercase text-[11px] tracking-wider">Created Date</TableCell>
                  <TableCell align="right" className="font-bold py-5 text-gray-500 uppercase text-[11px] tracking-wider" style={{ paddingRight: '24px' }}>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} align="center" className="py-20"><CircularProgress size={30} thickness={4} /></TableCell></TableRow>
                ) : companies?.length === 0 ? (
                  <TableRow><TableCell colSpan={4} align="center" className="py-20 text-gray-400">No brands found.</TableCell></TableRow>
                ) : (
                  companies?.map((b: Company, idx: number) => (
                    <TableRow key={b._id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                      <TableCell className="text-gray-400 font-medium" style={{ paddingLeft: '24px' }}>
                        {String(pageNo * rowsPerPage + idx + 1).padStart(2, '0')}
                      </TableCell>
                      <TableCell>
                        <Typography className="font-semibold text-gray-700">{b.brandName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography className="text-gray-500 text-sm">
                          {b.createdAt ? dayjs(b.createdAt).format("DD MMM, YYYY") : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" style={{ paddingRight: '24px' }}>
                        <Box className="flex gap-2 justify-end">
                          <IconButton 
                            onClick={() => { setEditingBrand(b); setNewBrandName(b.brandName ?? ""); setEditOpen(true); }} 
                            size="small" 
                            className="text-blue-500 bg-blue-50 hover:bg-blue-100 transition-all"
                          >
                            <FiEdit size={16} />
                          </IconButton>
                          <IconButton 
                            onClick={() => handleDelete(b._id)} 
                            size="small" 
                            className="text-red-500 bg-red-50 hover:bg-red-100 transition-all"
                          >
                            <FiTrash2 size={16} />
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
            count={total ?? 0}
            page={pageNo}
            rowsPerPage={rowsPerPage}
            onPageChange={(_, p) => setPageNo(p)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value));
              setPageNo(0);
            }}
            className="border-t border-gray-50 bg-gray-50/50"
            sx={{ ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": { fontSize: '13px', color: 'gray' } }}
          />
        </Paper>

        {/* Refined ADD / EDIT BRAND MODAL */}
        <Dialog 
          open={editOpen} 
          onClose={() => setEditOpen(false)} 
          fullWidth 
          maxWidth="xs" 
          PaperProps={{ sx: { borderRadius: "20px", padding: 1, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' } }}
        >
          <DialogTitle className="font-bold text-xl text-gray-800">
            {editingBrand ? "Update Brand" : "Create New Brand"}
            <Typography variant="body2" className="text-gray-400 font-normal">Enter the details of the company brand below.</Typography>
          </DialogTitle>
          <Divider sx={{ mx: 3 }} />
          <DialogContent className="pt-6">
            <TextField
              label="Brand Name"
              fullWidth
              size="medium"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              placeholder="e.g. Coca Cola, Nestle..."
              autoFocus
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
            />
          </DialogContent>
          <DialogActions className="p-4 px-6 flex justify-between">
            <Button onClick={() => setEditOpen(false)} className="normal-case text-gray-500 font-medium">Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleSaveBrand} 
              className="!bg-blue-600 hover:!bg-blue-700 normal-case px-8 shadow-lg shadow-blue-200 rounded-xl py-2"
            >
              {editingBrand ? "Save Changes" : "Save Brand"}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
