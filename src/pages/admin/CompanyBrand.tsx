import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    CircularProgress
} from "@mui/material";

import { useEffect, useRef, useState } from "react";
import { FiDownload, FiEdit, FiPlus, FiSearch, FiTrash2, FiUpload } from "react-icons/fi";
import { AdminLayout } from "../../layouts/AdminLayout";

import {
    addCompany,
    deleteCompany,
    getCompanies,
    updateCompany,
    addCompanyBulkExcel,
    selectCompanyState,
    selectAllCompaniesData,
    type Company,
    type BulkCompanyExcelResponse
} from "../../redux/slices/companySlice";
import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";


export default function CompanyBrand() {
    const dispatch = useAppDispatch();

    /** ======= REDUX STATES ======= **/
    const { loading, companies } = useAppSelector(selectCompanyState);
    const { total } = useAppSelector(selectAllCompaniesData) || { total: 0, limit: 10, page: 1 };

    /** ======= LOCAL STATES ======= **/
    const [query, setQuery] = useState("");
    const [fromDate, setFromDate] = useState<string | null>(null);
    const [toDate, setToDate] = useState<string | null>(null);

    const [pageNo, setPageNo] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [editOpen, setEditOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Company | null>(null);
    const [newBrandName, setNewBrandName] = useState("");

    const fileInputRef = useRef<HTMLInputElement | null>(null);


    /** ========== FETCH DATA ============ **/
    useEffect(() => {
        fetchData();
    }, [pageNo, rowsPerPage, query, fromDate, toDate]);


    const fetchData = () => {
        dispatch(
            getCompanies({
                page: pageNo + 1,
                limit: rowsPerPage,
                search: query || undefined,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined
            })
        );
    };


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

        fetchData();
        setEditOpen(false);
        setNewBrandName("");
    };


    /** ========= DELETE BRAND ========= **/
    const handleDelete = async (id: string) => {
        await dispatch(deleteCompany(id) as any);
        fetchData();
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

        fetchData();
    };


    /** ========= DOWNLOAD TEMPLATE ========= **/
    const handleDownloadTemplate = () => {
        const blob = new Blob(
            ["brandName\nSample Brand 1\nSample Brand 2"],
            { type: "xlsx/xls" }
        );

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");

        a.href = url;
        a.download = "CompanyBrandTemplate.xlsx";
        a.click();
        window.URL.revokeObjectURL(url);
    };


    return (
        <AdminLayout>
            <div className="p-4 w-full">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Company / Brand</h2>

                    <div className="flex items-center gap-2">
                        <Button variant="outlined" startIcon={<FiDownload />} onClick={handleDownloadTemplate}>
                            Download Template
                        </Button>

                        <input
                            type="file"
                            ref={fileInputRef}
                            accept=".xlsx,.xls,.csv"
                            hidden
                            onChange={handleExcelUpload}
                        />

                        <Button
                            variant="contained"
                            startIcon={<FiUpload />}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Import Excel
                        </Button>

                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<FiPlus />}
                            onClick={() => {
                                setEditingBrand(null);
                                setNewBrandName("");
                                setEditOpen(true);
                            }}
                        >
                            Add Brand
                        </Button>
                    </div>
                </div>


                {/* SEARCH + FILTERS */}
                <Paper className="p-4 mb-4 w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex items-center space-x-2">
                            <FiSearch />
                            <TextField
                                size="small"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search brand"
                                fullWidth
                            />
                        </div>

                        <TextField
                            type="date"
                            size="small"
                            label="From"
                            InputLabelProps={{ shrink: true }}
                            value={fromDate ?? ""}
                            onChange={(e) => setFromDate(e.target.value)}
                        />

                        <TextField
                            type="date"
                            size="small"
                            label="To"
                            InputLabelProps={{ shrink: true }}
                            value={toDate ?? ""}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>
                </Paper>


                {/* TABLE */}
                <Paper className="w-full">

                    {loading && (
                        <div className="p-4 flex justify-center">
                            <CircularProgress />
                        </div>
                    )}

                    {!loading && (
                        <>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>S.No</TableCell>
                                            <TableCell>Brand Name</TableCell>
                                            <TableCell>Created At</TableCell>
                                            <TableCell align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {companies?.map((b: Company, idx: number) => (
                                            <TableRow key={b._id}>
                                                <TableCell>{pageNo * rowsPerPage + idx + 1}</TableCell>
                                                <TableCell>{b.brandName}</TableCell>
                                                <TableCell>
                                                    {b.createdAt
                                                        ? new Date(b.createdAt).toLocaleDateString()
                                                        : "-"}
                                                </TableCell>

                                                <TableCell align="right">
                                                    <IconButton
                                                        onClick={() => {
                                                            setEditingBrand(b);
                                                            setNewBrandName(b.brandName ?? "");
                                                            setEditOpen(true);
                                                        }}
                                                    >
                                                        <FiEdit />
                                                    </IconButton>

                                                    <IconButton onClick={() => handleDelete(b._id)}>
                                                        <FiTrash2 />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* PAGINATION */}
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
                            />
                        </>
                    )}

                </Paper>


                {/* ADD / EDIT BRAND MODAL */}
                <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="xs">
                    <DialogTitle>{editingBrand ? "Edit Brand" : "Add Brand"}</DialogTitle>

                    <DialogContent>
                        <TextField
                            label="Brand Name"
                            fullWidth
                            value={newBrandName}
                            onChange={(e) => setNewBrandName(e.target.value)}
                        />
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={() => setEditOpen(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleSaveBrand}>
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>

            </div>
        </AdminLayout>
    );
}
