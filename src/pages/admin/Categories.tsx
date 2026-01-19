import {
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  Typography
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiChevronDown, FiChevronUp, FiDownload, FiEdit, FiPlus, FiRefreshCw, FiSearch, FiTrash2 } from "react-icons/fi";
import { SmallSpinner } from "../../components/common/SmallSpinner";
import { AdminLayout } from "../../layouts/AdminLayout";
import {
  addCategory,
  addCategoryBulkExcel,
  addSubCategory,
  deleteCategory,
  deleteSubCategory,
  getCategories,
  selectCategoryState,
  updateCategory,
  updateSubCategory,
} from "../../redux/slices/categorySlice";
import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";

type DateRangeValue = [Dayjs | null, Dayjs | null];

interface UISubCategory {
  id: number;
  apiId: string;
  name: string;
  createdAt: string;
}

interface UICategory {
  id: number;
  apiId: string;
  name: string;
  createdAt: string;
  subCategories: UISubCategory[];
}

interface RawSub {
  _id?: string;
  subCategoryName?: string;
  subCategory?: string;
  createdAt?: string;
}

export default function ProductCategories() {
  const { loading, error, categories: apiCategories, allCategoriesData } = useAppSelector(selectCategoryState);
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [ioLoading, setIoLoading] = useState(false);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".xlsx")) {
      alert("Only XLSX files are allowed");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setIoLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await dispatch(addCategoryBulkExcel(formData)).unwrap();
      alert("XLSX import completed successfully");
      const fromDate = dateRange[0]
        ? dateRange[0].startOf("day").toISOString()
        : "";
      const toDate = dateRange[1]
        ? dateRange[1].endOf("day").toISOString()
        : "";
      dispatch(
        getCategories({
          search: debouncedSearch || "",
          page: 1,
          limit: rowsPerPage,
          fromDate,
          toDate,
        })
      );
    } catch (error) {
      console.error(error);
      alert("XLSX import failed");
    } finally {
      setIoLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const [expandedId, setExpandedId] = useState<number | null>(null);

  const uiCategories = useMemo<UICategory[]>(() => {
    return (apiCategories || []).map((cat, idx) => ({
      id: idx + 1,
      apiId: cat._id,
      name: cat.categoryName,
      createdAt: cat.createdAt ? dayjs(cat.createdAt).format('MMMM D, YYYY') : '',
      subCategories: (cat.subCategories || []).map((sub, sidx) => {
        const raw = sub as RawSub;
        return {
          id: sidx + 1,
          apiId: raw._id || '',
          name: raw.subCategoryName || raw.subCategory || '',
          createdAt: raw.createdAt ? dayjs(raw.createdAt).format('MMMM D, YYYY') : '',
        } as UISubCategory;
      }),
    }));
  }, [apiCategories]);

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isSubCatModalOpen, setIsSubCatModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<UICategory | null>(null);
  const [currentName, setCurrentName] = useState("");
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [categoryError, setCategoryError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRangeValue>([null, null]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    const fromDate = dateRange[0] ? dateRange[0].startOf('day').toISOString() : '';
    const toDate = dateRange[1] ? dateRange[1].endOf('day').toISOString() : '';
    dispatch(getCategories({ search: debouncedSearch || '', page, limit: rowsPerPage, fromDate, toDate }));
  }, [dispatch, debouncedSearch, page, rowsPerPage, dateRange]);

  const totalCount = allCategoriesData?.total ?? allCategoriesData?.count ?? 0;
  const displayedCategories = uiCategories;

  const handleAddCategory = () => {
    setEditingItemId(null);
    setCurrentName("");
    setCategoryError("");
    setIsCatModalOpen(true);
  };

  const handleEditCategory = (cat: UICategory) => {
    setEditingItemId(cat.id);
    setCurrentName(cat.name);
    setCategoryError("");
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = async () => {
    const trimmedName = currentName.trim();
    if (!trimmedName) return;

    const nameExists = uiCategories.some((cat) =>
      cat.name.toLowerCase() === trimmedName.toLowerCase() &&
      cat.id !== editingItemId
    );

    if (nameExists) {
      setCategoryError(`Category "${trimmedName}" already exists. Please use a different name.`);
      return;
    }

    setCategoryError("");

    if (editingItemId) {
      const cat = uiCategories.find((c) => c.id === editingItemId);
      if (cat) {
        await dispatch(updateCategory({ categoryId: cat.apiId, categoryName: trimmedName }));
      }
    } else {
      await dispatch(addCategory({ categoryName: trimmedName }));
    }

    setIsCatModalOpen(false);
    setCurrentName("");
    const newPage = editingItemId ? page : 1;
    const fromDate = dateRange[0] ? dateRange[0].startOf('day').toISOString() : '';
    const toDate = dateRange[1] ? dateRange[1].endOf('day').toISOString() : '';
    dispatch(getCategories({ search: debouncedSearch || '', page: newPage, limit: rowsPerPage, fromDate, toDate }));
  };

  const handleAddSubCategory = (cat: UICategory) => {
    setSelectedCategory(cat);
    setEditingItemId(null);
    setCurrentName("");
    setIsSubCatModalOpen(true);
  };

  const handleEditSubCategory = (catId: number, sub: UISubCategory) => {
    setSelectedCategory(uiCategories.find((c) => c.id === catId) || null);
    setEditingItemId(sub.id);
    setCurrentName(sub.name);
    setIsSubCatModalOpen(true);
  };

  const handleDeleteCategory = async (id: number) => {
    if (window.confirm("WARNING: Deleting this category will also delete all its sub-categories. Proceed?")) {
      const cat = uiCategories.find((c) => c.id === id);
      if (cat) {
        await dispatch(deleteCategory(cat.apiId));
        const fromDate = dateRange[0] ? dateRange[0].startOf('day').toISOString() : '';
        const toDate = dateRange[1] ? dateRange[1].endOf('day').toISOString() : '';
        dispatch(getCategories({ search: debouncedSearch || '', page, limit: rowsPerPage, fromDate, toDate }));
      }
    }
  };

  const handleDeleteSubCategory = async (catId: number, subId: number) => {
    if (window.confirm("Delete this sub-category?")) {
      const cat = uiCategories.find((c) => c.id === catId);
      const sub = cat?.subCategories.find((s: UISubCategory) => s.id === subId);
      if (cat && sub) {
        await dispatch(deleteSubCategory({ categoryId: cat.apiId, subCategoryId: sub.apiId }));
        const fromDate = dateRange[0] ? dateRange[0].startOf('day').toISOString() : '';
        const toDate = dateRange[1] ? dateRange[1].endOf('day').toISOString() : '';
        dispatch(getCategories({ search: debouncedSearch || '', page, limit: rowsPerPage, fromDate, toDate }));
      }
    }
  };

  const handleSaveSubCategory = async () => {
    const trimmedName = currentName.trim();
    if (!trimmedName || !selectedCategory) return;

    const subNameExists = selectedCategory.subCategories.some((sub: UISubCategory) =>
      sub.name.toLowerCase() === trimmedName.toLowerCase() &&
      sub.id !== editingItemId
    );

    if (subNameExists) {
      alert(`Sub-category "${trimmedName}" already exists under ${selectedCategory.name}.`);
      return;
    }

    if (editingItemId) {
      const sub = selectedCategory.subCategories.find((s: UISubCategory) => s.id === editingItemId);
      if (sub) {
        await dispatch(updateSubCategory({ categoryId: selectedCategory.apiId, subCategoryId: sub.apiId, subCategoryName: trimmedName }));
      }
    } else {
      await dispatch(addSubCategory({ categoryId: selectedCategory.apiId, subCategoryName: trimmedName }));
    }

    setIsSubCatModalOpen(false);
    setCurrentName("");
    const fromDate = dateRange[0] ? dateRange[0].startOf('day').toISOString() : '';
    const toDate = dateRange[1] ? dateRange[1].endOf('day').toISOString() : '';
    dispatch(getCategories({ search: debouncedSearch || '', page, limit: rowsPerPage, fromDate, toDate }));
  };

  const handleDownloadTemplate = () => {
    const content =
      "categoryName\tsubCategories\n" +
      "Hotels\tBed\n" +
      "Hotels\tTV\n" +
      "Fruits\tBlackberry\n";

    const blob = new Blob([content], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "CategorySubCategoryTemplate.xlsx";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <Box className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        {error && (
          <Typography color="error" className="m-4">
            {error}
          </Typography>
        )}

        {/* Combined Tool Bar */}
        <Box className="bg-white p-4 border-b border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
          {/* Filters Area */}
          <Box className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <TextField
              size="small"
              placeholder="Search category/subcategory..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiSearch size={18} className="text-gray-400" />
                  </InputAdornment>
                )
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
                value={dateRange[0] ? dateRange[0].format("YYYY-MM-DD") : ""}
                onChange={(e) => {
                  setDateRange([
                    e.target.value ? dayjs(e.target.value) : null,
                    dateRange[1],
                  ]);
                  setPage(1);
                }}
                className="w-40"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />

              <TextField
                type="date"
                size="small"
                label="To"
                InputLabelProps={{ shrink: true }}
                value={dateRange[1] ? dateRange[1].format("YYYY-MM-DD") : ""}
                onChange={(e) => {
                  setDateRange([
                    dateRange[0],
                    e.target.value ? dayjs(e.target.value) : null,
                  ]);
                  setPage(1);
                }}
                className="w-40"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />
            </Box>

            <Button
              size="small"
              variant="text"
              startIcon={<FiRefreshCw />}
              onClick={() => { setSearchTerm(""); setDateRange([null, null]); setPage(1); }}
              className="text-blue-600 normal-case font-medium hover:bg-blue-50 px-3 h-9"
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
              className="normal-case border-gray-300 text-gray-700 hover:bg-gray-50 h-9"
            >
              Template
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <Button
              size="small"
              startIcon={<FiDownload />}
              variant="outlined"
              className="normal-case border-gray-300 text-gray-700 hover:bg-gray-50 h-9"
              disabled={loading || ioLoading}
              onClick={handleImportClick}
            >
              Import
            </Button>
            <Button
              startIcon={<FiPlus />}
              variant="contained"
              size="small"
              onClick={handleAddCategory}
              disabled={loading || ioLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white normal-case px-4 h-9 shadow-sm"
            >
              Add Category
            </Button>
          </Box>
        </Box>

        {/* --- Table --- */}
        <Box className="flex-1 flex flex-col overflow-hidden p-2 sm:p-4">
          <Paper className="flex-1 flex flex-col shadow-md rounded-xl overflow-hidden border border-gray-100 bg-white">
            <TableContainer className="flex-1 overflow-auto">
              {loading ? (
                <Box className="flex items-center justify-center p-20">
                  <SmallSpinner size={60} />
                </Box>
              ) : (
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell className="bg-gray-50/80 backdrop-blur-md z-10 font-bold" style={{ width: '5%' }}>S/N</TableCell>
                      <TableCell className="bg-gray-50/80 backdrop-blur-md z-10 font-bold" style={{ width: '45%' }}>Category Name</TableCell>
                      <TableCell className="bg-gray-50/80 backdrop-blur-md z-10 font-bold" style={{ width: '30%' }}>Created At</TableCell>
                      <TableCell align="right" className="bg-gray-50/80 backdrop-blur-md z-10 font-bold" style={{ width: '20%' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayedCategories.length === 0 ? (
                      <TableRow><TableCell colSpan={4} align="center" className="text-gray-500 py-20">No categories match the current filters.</TableCell></TableRow>
                    ) : (
                      displayedCategories.map((cat: UICategory, index: number) => (
                        <React.Fragment key={cat.id}>
                          <TableRow className="hover:bg-blue-50/40 transition-colors">
                            <TableCell className="py-3">{(page - 1) * rowsPerPage + index + 1}</TableCell>
                            <TableCell className="py-3 capitalize flex items-center gap-2 font-medium">
                              <IconButton
                                size="small"
                                onClick={() => setExpandedId(expandedId === cat.id ? null : cat.id)}
                                disabled={cat.subCategories.length === 0}
                                className="text-blue-600 hover:bg-blue-50"
                              >
                                {expandedId === cat.id ? (
                                  <FiChevronUp size={16} />
                                ) : (
                                  <FiChevronDown size={16} />
                                )}
                              </IconButton>
                              {cat.name}
                            </TableCell>
                            <TableCell className="py-3 text-gray-500">{cat.createdAt}</TableCell>
                            <TableCell className="py-3" align="right">
                              <Box className="flex justify-end gap-1">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditCategory(cat)}
                                  className="text-blue-600 hover:bg-blue-50"
                                  disabled={loading}
                                >
                                  <FiEdit size={16} />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteCategory(cat.id)}
                                  className="text-red-500 hover:bg-red-50"
                                  disabled={loading}
                                >
                                  <FiTrash2 size={16} />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleAddSubCategory(cat)}
                                  className="text-green-600 hover:bg-green-50"
                                  disabled={loading}
                                  title="Add Sub-Category"
                                >
                                  <FiPlus size={16} />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell style={{ paddingBottom: 0, paddingTop: 0, borderBottom: expandedId === cat.id ? '1px solid #f3f4f6' : 'none' }} colSpan={4}>
                              <Collapse in={expandedId === cat.id} timeout="auto" unmountOnExit>
                                <Box className="m-4 bg-gray-50/50 rounded-lg border border-gray-100 p-4">
                                  <Typography variant="subtitle2" className="mb-4 text-gray-800 font-bold flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                    Sub-Categories of {cat.name}
                                  </Typography>
                                  <Table size="small" className="bg-white rounded-lg overflow-hidden border border-gray-100">
                                    <TableHead>
                                      <TableRow className="bg-gray-50/50">
                                        <TableCell style={{ width: '10%' }} className="font-bold text-gray-600">S/N</TableCell>
                                        <TableCell style={{ width: '50%' }} className="font-bold text-gray-600">Sub-Category Name</TableCell>
                                        <TableCell style={{ width: '25%' }} className="font-bold text-gray-600">Created At</TableCell>
                                        <TableCell align="right" style={{ width: '15%' }} className="font-bold text-gray-600 pr-4">Actions</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {cat.subCategories.length > 0 ? (
                                        cat.subCategories.map((sub: UISubCategory, idx: number) => (
                                          <TableRow key={sub.id} className="hover:bg-gray-50 transition-colors">
                                            <TableCell className="py-2 text-gray-500">{idx + 1}</TableCell>
                                            <TableCell className="py-2 capitalize text-gray-700">{sub.name}</TableCell>
                                            <TableCell className="py-2 text-gray-500 text-xs">{sub.createdAt}</TableCell>
                                            <TableCell className="py-2" align="right">
                                              <Box className="flex justify-end gap-1 px-2">
                                                <IconButton
                                                  size="small"
                                                  onClick={() => handleEditSubCategory(cat.id, sub)}
                                                  className="text-blue-500 hover:bg-blue-50"
                                                  disabled={loading}
                                                >
                                                  <FiEdit size={14} />
                                                </IconButton>
                                                <IconButton
                                                  size="small"
                                                  onClick={() => handleDeleteSubCategory(cat.id, sub.id)}
                                                  className="text-red-400 hover:bg-red-50"
                                                  disabled={loading}
                                                >
                                                  <FiTrash2 size={14} />
                                                </IconButton>
                                              </Box>
                                            </TableCell>
                                          </TableRow>
                                        ))
                                      ) : (
                                        <TableRow>
                                          <TableCell colSpan={4} align="center" className="py-4 text-gray-400 text-sm">No sub-categories yet.</TableCell>
                                        </TableRow>
                                      )}
                                    </TableBody>
                                  </Table>
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </TableContainer>

            <TablePagination
              component="div"
              count={totalCount}
              page={page - 1}
              onPageChange={(_, newPage) => {
                setPage(newPage + 1);
              }}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(1);
              }}
              rowsPerPageOptions={[10, 25, 50, 100]}
              className="border-t bg-gray-50 shrink-0"
            />
          </Paper>
        </Box>

        {/* Category Modal */}
        <Dialog open={isCatModalOpen} onClose={() => setIsCatModalOpen(false)} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
          <DialogTitle className="font-bold">{editingItemId ? "Edit Category" : "Add New Category"}</DialogTitle>
          <DialogContent className="pt-2">
            <TextField autoFocus margin="dense" label="Category Name" fullWidth value={currentName} onChange={(e) => { setCurrentName(e.target.value); setCategoryError(""); }} error={!!categoryError} helperText={categoryError} variant="outlined" sx={{ mt: 1 }} />
          </DialogContent>
          <DialogActions className="p-4">
            <Button onClick={() => setIsCatModalOpen(false)} className="text-gray-500 normal-case">Cancel</Button>
            <Button onClick={handleSaveCategory} variant="contained" className="bg-blue-600 hover:bg-blue-700 normal-case px-6" disabled={!currentName.trim() || loading}>{editingItemId ? "Update" : "Add"}</Button>
          </DialogActions>
        </Dialog>

        {/* Sub-Category Modal */}
        <Dialog open={isSubCatModalOpen} onClose={() => setIsSubCatModalOpen(false)} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
          <DialogTitle className="font-bold">{editingItemId ? "Edit Sub-Category" : `Add Sub-Category to ${selectedCategory?.name || ""}`}</DialogTitle>
          <DialogContent className="pt-2">
            <TextField autoFocus margin="dense" label="Sub-Category Name" fullWidth value={currentName} onChange={(e) => setCurrentName(e.target.value)} variant="outlined" sx={{ mt: 1 }} />
          </DialogContent>
          <DialogActions className="p-4">
            <Button onClick={() => setIsSubCatModalOpen(false)} className="text-gray-500 normal-case">Cancel</Button>
            <Button onClick={handleSaveSubCategory} variant="contained" className="bg-blue-600 hover:bg-blue-700 normal-case px-6" disabled={!currentName.trim() || loading}>{editingItemId ? "Update" : "Add"}</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
}
