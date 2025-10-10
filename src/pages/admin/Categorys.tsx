import React, { useState } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  Box,
  Typography,
} from "@mui/material";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
import { AdminLayout } from "../../layouts/AdminLayout";

interface Category {
  id: number;
  name: string;
  createdAt: string;
}

const initialData: Category[] = [
  { id: 1, name: "dairy", createdAt: "October 7, 2025" },
  { id: 2, name: "restro", createdAt: "October 7, 2025" },
  { id: 3, name: "hotel", createdAt: "October 6, 2025" },
  { id: 4, name: "room", createdAt: "October 6, 2025" },
  { id: 5, name: "kitchen", createdAt: "October 6, 2025" },
  { id: 6, name: "bakery", createdAt: "October 5, 2025" },
  { id: 7, name: "beverages", createdAt: "October 5, 2025" },
  { id: 8, name: "snacks", createdAt: "October 4, 2025" },
];

export default function ProductCategories() {
  const [categories, setCategories] = useState<Category[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleAdd = () => {
    setCurrentCategory(null);
    setCategoryName("");
    setIsModalOpen(true);
  };

  const handleEdit = (cat: Category) => {
    setCurrentCategory(cat);
    setCategoryName(cat.name);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      setCategories(prev => prev.filter(cat => cat.id !== id));
      if ((page - 1) * rowsPerPage >= categories.length - 1) setPage(page - 1);
    }
  };

  const handleSave = () => {
    if (!categoryName.trim()) return;

    if (currentCategory) {
      // Edit
      setCategories(prev =>
        prev.map(cat =>
          cat.id === currentCategory.id ? { ...cat, name: categoryName } : cat
        )
      );
    } else {
      // Add
      const newCategory: Category = {
        id: categories.length ? Math.max(...categories.map(c => c.id)) + 1 : 1,
        name: categoryName,
        createdAt: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      };
      setCategories(prev => [newCategory, ...prev]);
    }

    setIsModalOpen(false);
    setCategoryName("");
    setCurrentCategory(null);
    setPage(1); // reset to first page
  };

  // Pagination logic
  const totalPages = Math.ceil(categories.length / rowsPerPage);
  const paginatedData = categories.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold">Product Categories</h1>
          <Button
            variant="contained"
            startIcon={<FiPlus />}
            className="!bg-green-600 hover:!bg-green-700 normal-case"
            onClick={handleAdd}
          >
            Add Category
          </Button>
        </div>

        {/* Table */}
        <TableContainer component={Paper} className="shadow-md">
          <Table>
            <TableHead className="bg-gray-100">
              <TableRow>
                <TableCell>S/N</TableCell>
                <TableCell>Category Name</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((cat, index) => (
                <TableRow key={cat.id} className="hover:bg-gray-50">
                  <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                  <TableCell className="capitalize">{cat.name}</TableCell>
                  <TableCell>{cat.createdAt}</TableCell>
                  <TableCell align="right">
                    <div className="flex justify-end gap-3">
                      <FiEdit
                        onClick={() => handleEdit(cat)}
                        className="text-green-600 cursor-pointer hover:scale-110 transition-transform"
                        size={18}
                      />
                      <FiTrash2
                        onClick={() => handleDelete(cat.id)}
                        className="text-red-600 cursor-pointer hover:scale-110 transition-transform"
                        size={18}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination & Rows per page */}
          <Box className="flex justify-between items-center px-4 py-3">
            <Box className="flex items-center gap-2">
              <Typography variant="body2" className="text-gray-600">
                Rows per page
              </Typography>
              <Select
                size="small"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1); // reset to first page
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
            />
          </Box>
        </TableContainer>

        {/* Add/Edit Modal */}
        <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <DialogTitle>{currentCategory ? "Edit Category" : "Add Category"}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Category Name"
              type="text"
              fullWidth
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              variant="contained"
              className="!bg-green-600 hover:!bg-green-700"
            >
              {currentCategory ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
