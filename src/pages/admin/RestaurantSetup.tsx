import React, { useState } from "react";
import {
  Box,
  Tab,
  Tabs,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TablePagination,
  IconButton,
  Typography,
  TextField,
  InputAdornment,
} from "@mui/material";

import { FiPlus, FiEdit, FiTrash2, FiSearch } from "react-icons/fi";
import { AdminLayout } from "../../layouts/AdminLayout";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";
import { ProductDrawerForm } from "../../components/adminComponents/ProductDrawerForm";
import { getCategories, selectCategories, addCategory } from "../../redux/slices/categorySlice";
import { getCompanies, selectCompanies, addCompany } from "../../redux/slices/companySlice";
import { getVendorNameList, selectVendorNames, addVendor } from "../../redux/slices/vendorSlice";
import { addProduct, updateProduct, getProducts, deleteProduct, selectProductState, type ProductInterface } from "../../redux/slices/productSlice";
import { toast } from "react-toastify";
import CreateCategoryModal from "../../components/adminComponents/CreateCategoryModal";
import CreateBrandModal from "../../components/adminComponents/CreateBrandModal";
import VendorModal from "../../layouts/VendorModal";



export default function RestaurantSetup() {
  const [value, setValue] = useState(0);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux Data
  const categoriesList = useAppSelector(selectCategories) ?? [];
  const companies = useAppSelector(selectCompanies) ?? [];
  const vendors = useAppSelector(selectVendorNames) ?? [];
  const productState = useAppSelector(selectProductState);
  const products = productState?.products ?? [];

  // Local State for Modals
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [vendorDrawerOpen, setVendorDrawerOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState<Partial<ProductInterface>>({});
  const [searchName, setSearchName] = useState("");

  const refreshProducts = () => {
    dispatch(getProducts({
      page: 1,
      limit: 1000,
      productType: "Equipment,Crockery,Furniture",
      search: searchName || undefined
    }));
  };

  React.useEffect(() => {
    dispatch(getCategories({ page: 1, limit: 1000 }));
    dispatch(getCompanies({ page: 1, limit: 1000 }));
    dispatch(getVendorNameList());
  }, [dispatch]);

  React.useEffect(() => {
    refreshProducts();
  }, [dispatch, searchName]);



  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    setPage(0); // Reset page on tab change
  };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const categories = ["Equipment", "Crockery", "Furniture"];

  // Filter products by type
  const equipmentProducts = products.filter((p: ProductInterface) => p.productType === "Equipment");
  const crockeryProducts = products.filter((p: ProductInterface) => p.productType === "Crockery");
  const furnitureProducts = products.filter((p: ProductInterface) => p.productType === "Furniture");

  const paginatedEquipment = equipmentProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const paginatedCrockery = crockeryProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const paginatedFurniture = furnitureProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const currentCount = [equipmentProducts.length, crockeryProducts.length, furnitureProducts.length][value];
  const currentProducts = [paginatedEquipment, paginatedCrockery, paginatedFurniture][value];
  const currentCategoryLabel = ["Equipment Name", "Crockery Name", "Furniture Name"][value];


  const currentCategory = categories[value] as string;

  // Action Handling
  const action = searchParams.get("action");
  const isAddMode = action === "add";

  const handleCloseForm = () => {
    setIsEdit(false);
    setEditData({});
    navigate("/admin/restaurant-setup");
    // Refresh products after closing form
    dispatch(getProducts({ page: 1, limit: 1000, productType: "Equipment,Crockery,Furniture" }));
  };

  const handleEditProduct = (item: ProductInterface) => {
    setEditData(item);
    setIsEdit(true);
    navigate("?action=add");
  };

  const handleSaveProduct = async (productData: ProductInterface) => {
    try {
      const payload: any = {
        ...productData,
        gstPct: Number(productData.gstPct || 0),
        taxableValue: Number(productData.taxableValue || 0),
        perUnitRate: Number(productData.perUnitRate || 0),
        // Ensure we send string IDs
        categoryId: typeof productData.categoryId === 'object' ? productData.categoryId?._id : productData.categoryId,
        vendorsId: typeof productData.vendorsId === 'object' ? productData.vendorsId?._id : productData.vendorsId,
        companyId: typeof productData.companyId === 'object' ? productData.companyId?._id : productData.companyId,
      };

      if (isEdit && productData._id) {
        await dispatch(updateProduct({ productId: productData._id, productData: payload })).unwrap();
        toast.success("Item updated successfully");
      } else {
        await dispatch(addProduct(payload)).unwrap();
        toast.success("Item added successfully");
      }

      handleCloseForm();
    } catch (err: any) {
      toast.error(err.message || "Failed to save item");
    }
  };

  // Quick Add Handlers
  const handleSaveCategory = async (name: string) => {
    try {
      await dispatch(addCategory({ categoryName: name })).unwrap();
      dispatch(getCategories({ page: 1, limit: 1000 }));
      toast.success("Category added");
    } catch (e: any) { toast.error(e.message); }
  };

  const handleSaveBrand = async (name: string) => {
    try {
      await dispatch(addCompany({ brandName: name })).unwrap();
      dispatch(getCompanies({ page: 1, limit: 1000 }));
      toast.success("Brand added");
    } catch (e: any) { toast.error(e.message); }
  };

  const handleSaveVendor = async (data: any) => {
    try {
      await dispatch(addVendor(data)).unwrap();
      dispatch(getVendorNameList());
      toast.success("Vendor added");
      setVendorDrawerOpen(false);
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await dispatch(deleteProduct(id)).unwrap();
      toast.success("Product deleted successfully");
      refreshProducts();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete item");
    }
  };

  return (
    <AdminLayout>
      <Box className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        {!isAddMode ? (
          <Box className="flex-1 flex flex-col overflow-hidden">
            <Paper className="flex-1 flex flex-col shadow-md rounded-xl overflow-hidden border border-gray-100 bg-white min-h-0">
              {/* Header Area: Tabs & Search */}
              <Box className="flex flex-col md:flex-row items-center justify-between px-4 gap-4 border-b border-gray-100 bg-white shrink-0">
                <Tabs
                  value={value}
                  onChange={handleChange}
                  sx={{
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      minWidth: 100,
                      py: 2,
                      color: 'text.secondary',
                      '&.Mui-selected': { color: 'primary.main' },
                    },
                    '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' }
                  }}
                >
                  <Tab label="Equipment" />
                  <Tab label="Crockery" />
                  <Tab label="Furniture" />
                </Tabs>

                <Box className="flex items-center gap-3 w-full md:w-auto pb-2 md:pb-0">
                  <TextField
                    placeholder={`Search ${currentCategory.toLowerCase()}...`}
                    size="small"
                    value={searchName}
                    onChange={(e) => { setSearchName(e.target.value); setPage(0); }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FiSearch className="text-gray-400" />
                        </InputAdornment>
                      ),
                    }}
                    className="flex-1 md:w-64"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: "#fcfcfc" } }}
                  />
                  <Button
                    variant="contained"
                    startIcon={<FiPlus />}
                    onClick={() => navigate("?action=add")}
                    size="small"
                    className="bg-blue-600 hover:bg-blue-700 normal-case shadow-none h-[38px] px-4 shrink-0"
                  >
                    Add {currentCategory}
                  </Button>
                </Box>
              </Box>


              <Box className="flex-1 flex flex-col overflow-hidden min-h-0">
                <TableContainer className="flex-1 overflow-auto relative min-h-[200px]">
                  <Table stickyHeader size="medium">
                    <TableHead>
                      <TableRow sx={{ '& th': { borderBottom: '1px solid', borderColor: 'divider' } }}>
                        <TableCell className="bg-slate-50 font-semibold text-slate-500 py-4 uppercase tracking-wider text-[11px]" sx={{ width: 50 }}>S/N</TableCell>
                        <TableCell className="bg-slate-50 font-semibold text-slate-500 py-4 uppercase tracking-wider text-[11px]" sx={{ minWidth: 160 }}>{currentCategoryLabel}</TableCell>
                        <TableCell className="bg-slate-50 font-semibold text-slate-500 py-4 uppercase tracking-wider text-[11px]">Category</TableCell>
                        <TableCell className="bg-slate-50 font-semibold text-slate-500 py-4 uppercase tracking-wider text-[11px]">Vendor</TableCell>
                        <TableCell className="bg-slate-50 font-semibold text-slate-500 py-4 uppercase tracking-wider text-[11px]">Brand</TableCell>
                        <TableCell className="bg-slate-50 font-semibold text-slate-500 py-4 uppercase tracking-wider text-[11px] text-center">GST</TableCell>
                        <TableCell align="right" className="bg-slate-50 font-semibold text-slate-500 py-4 uppercase tracking-wider text-[11px]">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentProducts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center" className="py-20 text-gray-500 text-sm">
                            No {currentCategory.toLowerCase()} found. Click "Add {currentCategory}" to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentProducts.map((item: ProductInterface, idx: number) => (
                          <TableRow key={item._id} hover className="group transition-colors duration-200">
                            <TableCell className="py-2.5 text-slate-500 text-[12px] font-medium">
                              {page * rowsPerPage + idx + 1}
                            </TableCell>
                            <TableCell className="py-2.5">
                              <Box className="flex flex-col gap-0.5">
                                <Typography className="font-semibold text-slate-800 text-[13px] leading-tight">
                                  {item.productName}
                                </Typography>
                                <Typography className="text-slate-400 text-[11px] leading-tight truncate max-w-[180px]">
                                  {item.productDescription || "-"}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell className="py-2.5">
                              <Typography className="text-slate-600 text-[13px] font-medium capitalize">
                                {item.categoryId?.categoryName || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell className="py-2.5">
                              <Typography className="text-slate-600 text-[13px]">
                                {item.vendorsId?.vendor_name || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell className="py-2.5">
                              <Typography className="text-slate-600 text-[13px] font-medium italic">
                                {item.companyId?.brandName || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell className="text-center py-2.5">
                              <Box className="bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-[11px] font-bold inline-block">
                                {item.gstPct}%
                              </Box>
                            </TableCell>
                            <TableCell align="right" className="py-2.5">
                              <Box className="flex gap-0.5 justify-end">
                                <IconButton onClick={() => handleEditProduct(item)} size="small" className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                                  <FiEdit size={16} />
                                </IconButton>
                                <IconButton onClick={() => handleDeleteProduct(item._id)} size="small" className="text-slate-400 hover:text-red-600 hover:bg-red-50">
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
              </Box>


              <TablePagination
                component="div"
                count={currentCount}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 25, 50, 100]}
                className="border-t bg-gray-50 shrink-0"
              />
            </Paper>
          </Box>
        ) : (
          <ProductDrawerForm
            open={true}
            onClose={handleCloseForm}
            isEdit={isEdit}
            title={isEdit ? `Edit ${editData.productName}` : `Add ${categories[value]}`}
            initialData={isEdit ? editData : { productType: categories[value] }}
            categories={categoriesList}
            vendors={vendors}
            companies={companies}
            productNames={[]}
            onSave={handleSaveProduct}
            allowedProductTypes={["Equipment", "Crockery", "Furniture"]}
            onAddCategory={() => setCategoryModalOpen(true)}
            onAddVendor={() => setVendorDrawerOpen(true)}
            onAddBrand={() => setBrandModalOpen(true)}
            onFillFromSearch={() => { }}
          />
        )}

        <CreateCategoryModal open={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} onSave={handleSaveCategory} />
        <CreateBrandModal open={brandModalOpen} onClose={() => setBrandModalOpen(false)} onSave={handleSaveBrand} />
        <VendorModal open={vendorDrawerOpen} onClose={() => setVendorDrawerOpen(false)} onAddVendor={handleSaveVendor} />
      </Box>
    </AdminLayout>
  );
}