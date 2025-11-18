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
  Typography,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs"; // Import Dayjs and Dayjs type
import { useEffect, useMemo, useState } from "react";
import { FiChevronDown, FiChevronUp, FiDownload, FiEdit, FiPlus, FiSearch, FiTrash2, FiUpload } from "react-icons/fi";
import DateRangeFilter from "../../components/common/DateRangeFilter";
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
  type Category,
} from "../../redux/slices/categorySlice";
// import type Category from "../../redux/slices/categorySlice";

// const initialData: Category[] = [
//   {
//     id: 1,
//     name: "dairy",
//     createdAt: "October 7, 2025",
//     subCategories: [
//       { id: 1, name: "Milk", createdAt: "October 7, 2025" },
//       { id: 2, name: "Cheese", createdAt: "October 7, 2025" },
//     ],
//   },
//   {
//     id: 2,
//     name: "food service",
//     createdAt: "October 6, 2025",
//     subCategories: [{ id: 1, name: "Main Course", createdAt: "October 6, 2025" }],
//   },
//   {
//     id: 3,
//     name: "supplies",
//     createdAt: "October 6, 2025",
//     subCategories: [],
//   },
// ];

// Type for the date range value: [start, end]
type DateRangeValue = [Dayjs | null, Dayjs | null];


export default function ProductCategories() {

  const { loading, error, categories: apiCategories, allCategoriesData } = useAppSelector(selectCategoryState);
  console.log('loading', loading);
  console.log('error', error);
  console.log('categories', apiCategories as Category[]);
  console.log('allCategoriesData', allCategoriesData);
  const dispatch = useAppDispatch();

  // useEffect(async () => {
  //   const response = await dispatch(getCategories())
  //   console.log('response', response);
  // }, [])

  useEffect(() => {

    const getCategoriesFunction = async () => {
      try {
        const response = await dispatch(getCategories({ search: '', page: 1, limit: 10, fromDate: '', toDate: '' }))
        console.log('response', response);
      } catch (err) {
        console.log(err);
      }
    };
    getCategoriesFunction();

  }, [dispatch])


  // local UI state removed; derive UI-friendly categories from the store
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Map API categories to a UI-friendly shape (preserve api ids for CRUD)
  const uiCategories = useMemo(() => {
    return (apiCategories || []).map((cat, idx) => ({
      id: idx + 1,
      apiId: cat._id,
      name: cat.categoryName,
      createdAt: cat.createdAt ? dayjs(cat.createdAt).format('MMMM D, YYYY') : '',
      subCategories: (cat.subCategories || []).map((sub, sidx) => ({
        id: sidx + 1,
        apiId: (sub as any)._id || '',
        name: (sub as any).subCategoryName || (sub as any).subCategory || '',
        createdAt: (sub as any).createdAt ? dayjs((sub as any).createdAt).format('MMMM D, YYYY') : '',
      })),
    }));
  }, [apiCategories]);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isSubCatModalOpen, setIsSubCatModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [currentName, setCurrentName] = useState("");
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [categoryError, setCategoryError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  // 1. State for DateRangePicker
  const [dateRange, setDateRange] = useState<DateRangeValue>([null, null]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const filteredCategories = useMemo(() => {
    let filtered = uiCategories;

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter((cat) =>
        cat.name.toLowerCase().includes(lowerSearchTerm) ||
        cat.subCategories.some(sub => sub.name.toLowerCase().includes(lowerSearchTerm))
      );
    }

    // 2. Date Range Filtering Logic
    const [startDate, endDate] = dateRange;

    if (startDate && endDate) {
      // Normalize start date to the beginning of the day (00:00:00)
      const start = startDate.startOf('day');
      // Normalize end date to the end of the day (23:59:59)
      const end = endDate.endOf('day');

      filtered = filtered.filter(cat => {
        const catDate = dayjs(cat.createdAt, "MMMM D, YYYY"); // Parse the date string
        // Check if the category's creation date is on or after the start date, and on or before the end date.
        return catDate.isAfter(start.subtract(1, 'day')) && catDate.isBefore(end.add(1, 'day'));
      });
    }

    // Handle case where only one date is selected (e.g., in a partial range selection)
    if (startDate && !endDate) {
      const start = startDate.startOf('day');
      filtered = filtered.filter(cat => {
        const catDate = dayjs(cat.createdAt, "MMMM D, YYYY");
        return catDate.isAfter(start.subtract(1, 'day'));
      });
    }

    if (endDate && !startDate) {
      const end = endDate.endOf('day');
      filtered = filtered.filter(cat => {
        const catDate = dayjs(cat.createdAt, "MMMM D, YYYY");
        return catDate.isBefore(end.add(1, 'day'));
      });
    }

    return filtered;
  }, [uiCategories, searchTerm, dateRange]); // Use dateRange in dependency array

  const totalPages = Math.ceil(filteredCategories.length / rowsPerPage);
  const paginatedCategories = filteredCategories.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleAddCategory = () => {
    setEditingItemId(null);
    setCurrentName("");
    setCategoryError("");
    setIsCatModalOpen(true);
  };

  const handleEditCategory = (cat: any) => {
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
    setPage(1); // Reset page after adding/editing
    // Refresh list
    dispatch(getCategories({ search: '', page: 1, limit: rowsPerPage, fromDate: '', toDate: '' }));
  };


  const handleAddSubCategory = (cat: any) => {
    setSelectedCategory(cat);
    setEditingItemId(null);
    setCurrentName("");
    setIsSubCatModalOpen(true);
  };

  const handleEditSubCategory = (catId: number, sub: any) => {
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
        // Refresh list
        dispatch(getCategories({ search: '', page: 1, limit: rowsPerPage, fromDate: '', toDate: '' }));
      }
    }
  };


  const handleDeleteSubCategory = async (catId: number, subId: number) => {
    if (window.confirm("Delete this sub-category?")) {
      const cat = uiCategories.find((c) => c.id === catId);
      const sub = cat?.subCategories.find((s: any) => s.id === subId);
      if (cat && sub) {
        await dispatch(deleteSubCategory({ categoryId: cat.apiId, subCategoryId: sub.apiId }));
        dispatch(getCategories({ search: '', page: page, limit: rowsPerPage, fromDate: '', toDate: '' }));
      }
    }
  };

  const handleSaveSubCategory = async () => {
    const trimmedName = currentName.trim();
    if (!trimmedName || !selectedCategory) return;

    const subNameExists = selectedCategory.subCategories.some((sub: any) =>
      sub.name.toLowerCase() === trimmedName.toLowerCase() &&
      sub.id !== editingItemId
    );

    if (subNameExists) {
      alert(`Sub-category "${trimmedName}" already exists under ${selectedCategory.name}.`);
      return;
    }

    if (editingItemId) {
      const sub = selectedCategory.subCategories.find((s: any) => s.id === editingItemId);
      if (sub) {
        await dispatch(updateSubCategory({ categoryId: selectedCategory.apiId, subCategoryId: sub.apiId, subCategoryName: trimmedName }));
      }
    } else {
      await dispatch(addSubCategory({ categoryId: selectedCategory.apiId, subCategoryName: trimmedName }));
    }

    setIsSubCatModalOpen(false);
    setCurrentName("");
    dispatch(getCategories({ search: '', page: page, limit: rowsPerPage, fromDate: '', toDate: '' }));
  };


  // --- Render ---

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-6">Product Categories Management 🏷️</h1>

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
              <Button
                startIcon={<FiPlus />}
                variant="contained"
                className="!bg-green-600 hover:!bg-green-700 normal-case"
                onClick={handleAddCategory}
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
              {paginatedCategories.length === 0 ? (
                <TableRow><TableCell colSpan={4} align="center" className="text-gray-500 py-8">No categories match the current filters.</TableCell></TableRow>
              ) : (
                paginatedCategories.map((cat, index) => (
                  <>
                    <TableRow key={cat.id} className="hover:bg-blue-50/70 bg-blue-50">
                      <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                      <TableCell className="capitalize flex items-center gap-2 font-medium">
                        <IconButton
                          size="small"
                          onClick={() =>
                            setExpandedId(expandedId === cat.id ? null : cat.id)
                          }
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
                          />
                          <FiTrash2
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="text-red-600 cursor-pointer hover:scale-110 transition-transform"
                            size={18}
                          />
                          <FiPlus
                            onClick={() => handleAddSubCategory(cat)}
                            className="text-blue-600 cursor-pointer hover:scale-110 transition-transform"
                            size={18}
                            title="Add Sub-Category"
                          />
                        </div>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={4}
                      >
                        <Collapse in={expandedId === cat.id} timeout="auto" unmountOnExit>
                          <Box margin={1}>
                            <Typography variant="subtitle2" className="mb-2 text-gray-700">
                              Sub-Categories of **{cat.name}**
                            </Typography>
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
                                  cat.subCategories.map((sub, idx) => (
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
                                          />
                                          <FiTrash2
                                            onClick={() =>
                                              handleDeleteSubCategory(cat.id, sub.id)
                                            }
                                            className="text-red-600 cursor-pointer hover:scale-110 transition-transform"
                                            size={16}
                                          />
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                ) : (
                                  <TableRow>
                                    <TableCell colSpan={4}>
                                      <Typography
                                        variant="body2"
                                        className="text-gray-500 text-center py-2"
                                      >
                                        No sub-categories yet.
                                      </Typography>
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

          {/* Pagination */}
          <Box className="flex justify-between items-center px-4 py-3">
            <Box className="flex items-center gap-2">
              <Typography variant="body2" className="text-gray-600">
                Categories per page
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
        </TableContainer>

        {/* Category Modal */}
        <Dialog open={isCatModalOpen} onClose={() => setIsCatModalOpen(false)}>
          <DialogTitle>
            {editingItemId ? "Edit Category" : "Add New Category"}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Category Name"
              fullWidth
              value={currentName}
              onChange={(e) => {
                setCurrentName(e.target.value);
                setCategoryError("");
              }}
              error={!!categoryError}
              helperText={categoryError}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsCatModalOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSaveCategory}
              variant="contained"
              className="!bg-green-600 hover:!bg-green-700"
              disabled={!currentName.trim()}
            >
              {editingItemId ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Sub-Category Modal */}
        <Dialog
          open={isSubCatModalOpen}
          onClose={() => setIsSubCatModalOpen(false)}
        >
          <DialogTitle>
            {editingItemId ? "Edit Sub-Category" : `Add Sub-Category to ${selectedCategory?.name || ""}`}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Sub-Category Name"
              fullWidth
              value={currentName}
              onChange={(e) => setCurrentName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsSubCatModalOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSaveSubCategory}
              variant="contained"
              className="!bg-green-600 hover:!bg-green-700"
              disabled={!currentName.trim()}
            >
              {editingItemId ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </AdminLayout>
  );
}