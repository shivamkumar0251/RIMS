import React from "react";
import { Button, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Pagination } from "@mui/material";
import { FiEdit, FiTrash2, FiPrinter, FiPlus } from "react-icons/fi";
import { AdminLayout } from "../../layouts/AdminLayout";

interface Category {
    id: number;
    name: string;
    createdAt: string;
}

const dummyData: Category[] = [
    { id: 1, name: "dairy", createdAt: "October 7, 2025" },
    { id: 2, name: "restro", createdAt: "October 7, 2025" },
    { id: 3, name: "hotel", createdAt: "October 6, 2025" },
    { id: 4, name: "room", createdAt: "October 6, 2025" },
    { id: 5, name: "kitchen", createdAt: "October 6, 2025" },
];

export default function ProductCategories() {
    const handleEdit = (id: number) => {
        console.log("Edit category:", id);
    };

    const handleDelete = (id: number) => {
        console.log("Delete category:", id);
    };

    return (
        <AdminLayout>
            <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-semibold">Product Categorys</h1>
                    <div className="flex gap-3">
                        <Button
                            variant="contained"
                            startIcon={<FiPlus />}
                            className="!bg-green-600 hover:!bg-green-700 normal-case"
                        >
                            Add Category
                        </Button>
                       
                    </div>
                </div>

                {/* Table */}
                <TableContainer component={Paper} className="shadow-md">
                    <Table>
                        <TableHead className="bg-gray-100">
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox />
                                </TableCell>
                                <TableCell>S/N</TableCell>
                                <TableCell>Category Name</TableCell>
                                <TableCell>Created At</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {dummyData.map((cat, index) => (
                                <TableRow key={cat.id} className="hover:bg-gray-50">
                                    <TableCell padding="checkbox">
                                        <Checkbox />
                                    </TableCell>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell className="capitalize">{cat.name}</TableCell>
                                    <TableCell>{cat.createdAt}</TableCell>
                                    <TableCell align="right">
                                        <div className="flex justify-end gap-3">
                                            <FiEdit
                                                onClick={() => handleEdit(cat.id)}
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

                    {/* Pagination */}
                    <div className="flex justify-between items-center px-4 py-3">
                        <p className="text-sm text-gray-600">Rows per page: 10</p>
                        <Pagination count={1} page={1} color="primary" />
                    </div>
                </TableContainer>
            </div>
        </AdminLayout>
    );
}
