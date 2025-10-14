import React, { useMemo, useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
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
    Tooltip,
    Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
    FiFileText,
    FiRefreshCw,
    FiSearch,
    FiTable,
    FiTrash2,
    FiUpload,
} from "react-icons/fi";
import { AdminLayout } from "../../layouts/AdminLayout";
import { DUMMY_CONSUMABLE_ITEMS,  } from "../../data/ConsumablesDummyData";

export default function Consumables() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDate, setSelectedDate] = useState<any>(null);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [page, setPage] = useState(1);

    // ---- Filter ----
    const filteredItems = useMemo(() => {
        return DUMMY_CONSUMABLE_ITEMS.filter((item) => {
            const matchesSearch =
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.brand.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesDate = selectedDate
                ? new Date(item.createdDate).toDateString() ===
                new Date(selectedDate).toDateString()
                : true;

            return matchesSearch && matchesDate;
        });
    }, [searchTerm, selectedDate]);

    // ---- Pagination ----
    const totalPages = Math.ceil(filteredItems.length / rowsPerPage);
    const paginatedItems = filteredItems.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    // ---- Delete ----
    const handleDelete = (id: number) => {
        alert(`Delete item with ID: ${id}`);
    };

    return (
        <AdminLayout>
            <Box sx={{ p: 3, backgroundColor: "#f9fafb", minHeight: "100vh" }}>
                {/* Header */}
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap"
                    mb={2}
                >
                    {/* Left Controls */}
                    <Box
                        sx={{
                            display: "flex",
                            gap: 2,
                            flexWrap: "wrap",
                            alignItems: "center",
                        }}
                    >
                        <TextField
                            placeholder="Search Products..."
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
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Filter by Created Date"
                                value={selectedDate}
                                onChange={(newValue) => setSelectedDate(newValue)}
                                renderInput={(params) => (
                                    <TextField {...params} sx={{ minWidth: 180 }} />
                                )}
                            />
                        </LocalizationProvider>
                    </Box>

                    {/* Right Controls */}
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Tooltip title="Export PDF">
                            <IconButton
                                sx={{
                                    backgroundColor: "#f44336",
                                    color: "white",
                                    transition: "0.3s",
                                    "&:hover": {
                                        backgroundColor: "#d32f2f",
                                        transform: "scale(1.05)",
                                    },
                                }}
                            >
                                <FiFileText />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Export Excel">
                            <IconButton
                                sx={{
                                    backgroundColor: "#4caf50",
                                    color: "white",
                                    transition: "0.3s",
                                    "&:hover": {
                                        backgroundColor: "#388e3c",
                                        transform: "scale(1.05)",
                                    },
                                }}
                            >
                                <FiTable />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Refresh">
                            <IconButton
                                sx={{
                                    backgroundColor: "#2196f3",
                                    color: "white",
                                    transition: "0.3s",
                                    "&:hover": {
                                        backgroundColor: "#1976d2",
                                        transform: "scale(1.05)",
                                    },
                                }}
                            >
                                <FiRefreshCw />
                            </IconButton>
                        </Tooltip>
                        <Button
                            variant="contained"
                            startIcon={<FiUpload />}
                            sx={{
                                transition: "0.3s",
                                "&:hover": { transform: "scale(1.05)" },
                            }}
                        >
                            Import
                        </Button>
                    </Box>
                </Box>

                {/* Table */}
                <Card sx={{ boxShadow: 4, borderRadius: 3 }}>
                    <CardContent>
                        <Typography variant="h6" mb={2}>
                            Consumables List
                        </Typography>

                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead sx={{ backgroundColor: "#e3f2fd" }}>
                                    <TableRow>
                                        <TableCell>S.No</TableCell>
                                        <TableCell>Product Name</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Brand</TableCell>
                                        <TableCell>Pack Size</TableCell>
                                        <TableCell>Unit</TableCell>
                                        <TableCell>Consumed Item</TableCell>
                                        <TableCell>Per Unit Rate</TableCell>
                                        <TableCell>Taxable Value</TableCell>
                                        <TableCell>GST (%)</TableCell>
                                        <TableCell>Total</TableCell>
                                        <TableCell>Created Date</TableCell>
                                        <TableCell align="center">Action</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {paginatedItems.map((item, idx) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                {(page - 1) * rowsPerPage + idx + 1}
                                            </TableCell>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.category}</TableCell>
                                            <TableCell>{item.brand}</TableCell>
                                            <TableCell>{item.packSize}</TableCell>
                                            <TableCell>{item.unit}</TableCell>
                                            <TableCell>{item.consumables}</TableCell>
                                            <TableCell>{item.perUnitRate.toFixed(2)}</TableCell>
                                            <TableCell>{item.taxableValue.toFixed(2)}</TableCell>
                                            <TableCell>{item.gst}%</TableCell>
                                            <TableCell>{item.total.toFixed(2)}</TableCell>
                                            <TableCell>{item.createdDate}</TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Delete">
                                                    <IconButton
                                                        sx={{
                                                            color: "white",
                                                            backgroundColor: "#f44336",
                                                            "&:hover": {
                                                                backgroundColor: "#d32f2f",
                                                                transform: "scale(1.1)",
                                                            },
                                                            transition: "0.3s",
                                                        }}
                                                        onClick={() => handleDelete(item.id)}
                                                    >
                                                        <FiTrash2 />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                            {/* Pagination */}
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    mt: 2,
                                    alignItems: "center",
                                }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Typography variant="body2" sx={{ color: "#666" }}>
                                        Rows per page
                                    </Typography>
                                    <Select<number>
                                        value={rowsPerPage}
                                        onChange={(e) =>
                                            setRowsPerPage(Number(e.target.value))
                                        }
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
                    </CardContent>
                </Card>
            </Box>
        </AdminLayout>
    );
}
