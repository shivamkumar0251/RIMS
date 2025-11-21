import {
  Box,
  Button,
  Card,
  CardContent,
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
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs"; // Import Dayjs and Dayjs type
import { useEffect, useMemo, useRef, useState } from "react";
import { FiChevronDown, FiChevronUp, FiDownload, FiEdit, FiPlus, FiSearch, FiTrash2, FiUpload } from "react-icons/fi";
import DateRangeFilter from "../../components/common/DateRangeFilter";
import PaginationComponent from "../../components/common/Pagination";
import MainSpinner from "../../components/common/MainSpinner";
import { AdminLayout } from "../../layouts/AdminLayout";
import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  addSubCategory,
  updateSubCategory,
  deleteSubCategory,
  selectCategoryState,
} from "../../redux/slices/categorySlice";

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

  // Export current page (or available) categories to JSON and CSV
  const handleExport = async () => {
    try {
      setIoLoading(true);
      const list = allCategoriesData?.data ?? apiCategories ?? [];

      // JSON download
      const jsonBlob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' });
      const jsonUrl = URL.createObjectURL(jsonBlob);
      const a = document.createElement('a');
      a.href = jsonUrl;
      a.download = `categories_export_${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(jsonUrl);

      // CSV download (flatten subnames joined by '|')
      const csvRows: string[] = [];
      csvRows.push(['categoryName', 'createdAt', 'subCategories'].join(','));
      const getSubName = (s: unknown) => {
        if (!s) return '';
        if (typeof s === 'string') return s;
        if (typeof s === 'object' && s !== null) {
          const o = s as Record<string, unknown>;
          return String(o.subCategoryName ?? o.subCategory ?? '');
        }
        return '';
      };

      for (const c of list) {
        const obj = c as Record<string, unknown>;
        const catName = String(obj.categoryName ?? '').replace(/"/g, '""');
        const createdAt = String(obj.createdAt ?? '');
        const subsArr = Array.isArray(obj.subCategories) ? (obj.subCategories as unknown[]) : [];
        const subs = subsArr.map(getSubName).join('|').replace(/"/g, '""');
        csvRows.push([`"${catName}"`, `"${createdAt}"`, `"${subs}"`].join(','));
      }
      const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const csvUrl = URL.createObjectURL(csvBlob);
      const a2 = document.createElement('a');
      a2.href = csvUrl;
      a2.download = `categories_export_${new Date().toISOString()}.csv`;
      document.body.appendChild(a2);
      a2.click();
      a2.remove();
      URL.revokeObjectURL(csvUrl);
    } catch (err) {
      alert('Export failed. See console for details.');
      console.error(err);
    } finally {
      setIoLoading(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // Import supports JSON array of categories. It will add categories (name only).
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setIoLoading(true);
    try {
      const text = await file.text();
      if (file.type.includes('json') || file.name.endsWith('.json')) {
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) throw new Error('Expected an array of categories in JSON');
        for (const item of parsed) {
          let name = '';
          if (item && typeof item === 'object') {
            const o = item as Record<string, unknown>;
            name = String(o.categoryName ?? '');
          }
          if (name) {
            try {
              await dispatch(addCategory({ categoryName: name }));
            } catch (err) {
              console.error('Add category failed', err);
            }
          }
        }
        alert('Import finished (categories added). Refreshing list.');
        await dispatch(getCategories({ search: '', page: 1, limit: rowsPerPage, fromDate: '', toDate: '' }));
      } else if (file.type.includes('csv') || file.name.endsWith('.csv')) {
        const lines = text.split(/\r?\n/).filter(Boolean);
        if (lines.length <= 1) {
          alert('No CSV rows to import');
        } else {
          lines.shift();
          for (const line of lines) {
            const cols = line.split(',');
            const catName = cols[0]?.replace(/^"|"$/g, '') || '';
            if (catName) {
              try {
                await dispatch(addCategory({ categoryName: catName }));
              } catch (err) {
                console.error(err);
              }
            }
          }
          alert('CSV import finished (categories added). Refreshing list.');
          await dispatch(getCategories({ search: '', page: 1, limit: rowsPerPage, fromDate: '', toDate: '' }));
        }
      } else {
        alert('Unsupported file type. Please provide JSON or CSV.');
      }
    } catch (err) {
      alert('Import failed. See console for details.');
      console.error(err);
    } finally {
      setIoLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    const fromDate = dateRange[0] ? dateRange[0].startOf('day').toISOString() : '';
    const toDate = dateRange[1] ? dateRange[1].endOf('day').toISOString() : '';
    dispatch(getCategories({ search: debouncedSearch || '', page, limit: rowsPerPage, fromDate, toDate }));
  }, [dispatch, debouncedSearch, page, rowsPerPage, dateRange]);

  const totalPages = allCategoriesData?.totalPages || 1;
  // `total` is the total number of items across all pages (backend provided)
  const totalCount = allCategoriesData?.total ?? allCategoriesData?.count ?? 0;

  // Keep local `page` in sync with backend's `currentPage` when the list updates.
  useEffect(() => {
    const backendPage = allCategoriesData?.currentPage ?? null;
    if (backendPage && backendPage !== page) {
      setPage(backendPage);
    }
    // only run when backend pagination metadata changes
  }, [allCategoriesData?.currentPage, page]);
  const displayedCategories = uiCategories; // server returns paginated list

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
    // After add/update refresh current page (or reset to 1 when adding new)
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


  // --- Render ---

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-6">Product Categories Management 🏷️</h1>

        {error && (
          <Typography color="error" className="mb-4">
            {error}
          </Typography>
        )}

        {loading ? <MainSpinner /> :
        <div>
          <Card className="mb-6 shadow-md">
            <CardContent className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <Box className="flex flex-col sm:flex-row gap-4 w-full md:w-auto mt-1">
                <TextField
                  size="small"
                  placeholder="Search category/subcategory..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><FiSearch size={18} className="text-gray-500" /></InputAdornment> }}
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
                  disabled={loading || ioLoading}
                  onClick={handleExport}
                >
                  Export
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,text/csv"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <Button
                  startIcon={<FiUpload />}
                  variant="outlined"
                  color="inherit"
                  className="normal-case"
                  disabled={loading || ioLoading}
                  onClick={handleImportClick}
                >
                  Import
                </Button>
                <Button
                  startIcon={<FiPlus />}
                  variant="contained"
                  className="!bg-green-600 hover:!bg-green-700 normal-case"
                  onClick={handleAddCategory}
                  disabled={loading || ioLoading}
                >
                  Add Category
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* --- Table --- */}
          <TableContainer component={Paper} className="shadow-md">
            <Table>
              <TableHead className="bg-gray-100">
                <TableRow>
                  <TableCell style={{ width: '5%' }}>S/N</TableCell>
                  <TableCell style={{ width: '45%' }}>Category Name</TableCell>
                  <TableCell style={{ width: '30%' }}>Created At</TableCell>
                  <TableCell align="right" style={{ width: '20%' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedCategories.length === 0 ? (
                  <TableRow><TableCell colSpan={4} align="center" className="text-gray-500 py-8">No categories match the current filters.</TableCell></TableRow>
                ) : (
                  displayedCategories.map((cat: UICategory, index: number) => (
                    <>
                      <TableRow key={cat.id} className="hover:bg-blue-50/70 bg-blue-50">
                        <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                        <TableCell className="capitalize flex items-center gap-2 font-medium">
                          <IconButton
                            size="small"
                            onClick={() => setExpandedId(expandedId === cat.id ? null : cat.id)}
                            disabled={cat.subCategories.length === 0}
                          >
                            {expandedId === cat.id ? (
                              <FiChevronUp size={16} />
                            ) : (
                              <FiChevronDown size={16} />
                            )}
                          </IconButton>
                          {cat.name}
                        </TableCell>
                        <TableCell>{cat.createdAt}</TableCell>
                        <TableCell align="right">
                          <div className="flex justify-end gap-3">
                            <FiEdit
                              onClick={() => handleEditCategory(cat)}
                              className="text-green-600 cursor-pointer hover:scale-110 transition-transform"
                              size={18}
                              style={{ pointerEvents: loading ? 'none' : undefined, opacity: loading ? 0.5 : undefined }}
                            />
                            <FiTrash2
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="text-red-600 cursor-pointer hover:scale-110 transition-transform"
                              size={18}
                              style={{ pointerEvents: loading ? 'none' : undefined, opacity: loading ? 0.5 : undefined }}
                            />
                            <FiPlus
                              onClick={() => handleAddSubCategory(cat)}
                              className="text-blue-600 cursor-pointer hover:scale-110 transition-transform"
                              size={18}
                              title="Add Sub-Category"
                              style={{ pointerEvents: loading ? 'none' : undefined, opacity: loading ? 0.5 : undefined }}
                            />
                          </div>
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                          <Collapse in={expandedId === cat.id} timeout="auto" unmountOnExit>
                            <Box margin={1}>
                              <Typography variant="subtitle2" className="mb-2 text-gray-700">Sub-Categories of **{cat.name}**</Typography>
                              <Table size="small">
                                <TableHead>
                                  <TableRow className="bg-gray-50">
                                    <TableCell style={{ width: '5%' }}>S/N</TableCell>
                                    <TableCell style={{ width: '45%' }}>Sub-Category Name</TableCell>
                                    <TableCell style={{ width: '30%' }}>Created At</TableCell>
                                    <TableCell align="right" style={{ width: '20%' }}>Actions</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {cat.subCategories.length > 0 ? (
                                    cat.subCategories.map((sub: UISubCategory, idx: number) => (
                                      <TableRow key={sub.id} className="hover:bg-gray-100">
                                        <TableCell>{idx + 1}</TableCell>
                                        <TableCell className="capitalize">{sub.name}</TableCell>
                                        <TableCell>{sub.createdAt}</TableCell>
                                        <TableCell align="right">
                                          <div className="flex justify-end gap-3">
                                            <FiEdit
                                              onClick={() => handleEditSubCategory(cat.id, sub)}
                                              className="text-green-600 cursor-pointer hover:scale-110 transition-transform"
                                              size={16}
                                              style={{ pointerEvents: loading ? 'none' : undefined, opacity: loading ? 0.5 : undefined }}
                                            />
                                            <FiTrash2
                                              onClick={() => handleDeleteSubCategory(cat.id, sub.id)}
                                              className="text-red-600 cursor-pointer hover:scale-110 transition-transform"
                                              size={16}
                                              style={{ pointerEvents: loading ? 'none' : undefined, opacity: loading ? 0.5 : undefined }}
                                            />
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))
                                  ) : (
                                    <TableRow>
                                      <TableCell colSpan={4}>
                                        <Typography variant="body2" className="text-gray-500 text-center py-2">No sub-categories yet.</Typography>
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination (server-driven) */}
            <PaginationComponent
              page={page}
              onPageChange={(v) => setPage(v)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(v) => { setRowsPerPage(v); setPage(1); }}
              totalPages={totalPages}
              totalCount={totalCount}
            />
          </TableContainer>

          {/* Category Modal */}
          <Dialog open={isCatModalOpen} onClose={() => setIsCatModalOpen(false)}>
            <DialogTitle>{editingItemId ? "Edit Category" : "Add New Category"}</DialogTitle>
            <DialogContent>
              <TextField autoFocus margin="dense" label="Category Name" fullWidth value={currentName} onChange={(e) => { setCurrentName(e.target.value); setCategoryError(""); }} error={!!categoryError} helperText={categoryError} />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsCatModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveCategory} variant="contained" className="!bg-green-600 hover:!bg-green-700" disabled={!currentName.trim() || loading}>{editingItemId ? "Update" : "Add"}</Button>
            </DialogActions>
          </Dialog>

          {/* Sub-Category Modal */}
          <Dialog open={isSubCatModalOpen} onClose={() => setIsSubCatModalOpen(false)}>
            <DialogTitle>{editingItemId ? "Edit Sub-Category" : `Add Sub-Category to ${selectedCategory?.name || ""}`}</DialogTitle>
            <DialogContent>
              <TextField autoFocus margin="dense" label="Sub-Category Name" fullWidth value={currentName} onChange={(e) => setCurrentName(e.target.value)} />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsSubCatModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveSubCategory} variant="contained" className="!bg-green-600 hover:!bg-green-700" disabled={!currentName.trim() || loading}>{editingItemId ? "Update" : "Add"}</Button>
            </DialogActions>
          </Dialog>
        </div>}
      </div>
    </AdminLayout>
  );
}
