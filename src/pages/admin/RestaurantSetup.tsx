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
} from "@mui/material";

import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import { AdminLayout } from "../../layouts/AdminLayout";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";
import { ProductDrawerForm } from "../../components/adminComponents/ProductDrawerForm";
import { getCategories, selectCategories, addCategory } from "../../redux/slices/categorySlice";
import { getCompanies, selectCompanies, addCompany } from "../../redux/slices/companySlice";
import { getVendorNameList, selectVendorNames, addVendor } from "../../redux/slices/vendorSlice";
import { addProduct, updateProduct, getProducts, selectProductState, type ProductInterface } from "../../redux/slices/productSlice";
import { toast } from "react-hot-toast";
import CreateCategoryModal from "../../components/adminComponents/CreateCategoryModal";
import CreateBrandModal from "../../components/adminComponents/CreateBrandModal";
import VendorModal from "../../layouts/VendorModal";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      className="flex-1 flex flex-col overflow-hidden"
      {...other}
    >
      {value === index && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

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

  React.useEffect(() => {
    dispatch(getCategories({ page: 1, limit: 1000 }));
    dispatch(getCompanies({ page: 1, limit: 1000 }));
    dispatch(getVendorNameList());
    dispatch(getProducts({ page: 1, limit: 1000, productType: "Equipment,Crockery,Furniture" }));
  }, [dispatch]);


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

  return (
    <AdminLayout>
      <Box className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        {!isAddMode ? (
          <Box className="flex-1 flex flex-col overflow-hidden p-2 sm:p-3">
            <Paper className="flex-1 flex flex-col shadow-md rounded-xl overflow-hidden border border-gray-100 bg-white">
              <Box className="flex flex-wrap justify-between items-center px-4 pt-1 border-b border-gray-100 bg-white shrink-0">
                <Tabs
                  value={value}
                  onChange={handleChange}
                  aria-label="restaurant setup tabs"
                  textColor="primary"
                  indicatorColor="primary"
                >
                  <Tab
                    label="Equipment"
                    {...a11yProps(0)}
                    className="normal-case font-semibold"
                  />
                  <Tab
                    label="Crockery"
                    {...a11yProps(1)}
                    className="normal-case font-semibold"
                  />
                  <Tab
                    label="Furniture"
                    {...a11yProps(2)}
                    className="normal-case font-semibold"
                  />
                </Tabs>
                <Button
                  variant="contained"
                  startIcon={<FiPlus />}
                  onClick={() => navigate("?action=add")}
                  className="bg-blue-600 hover:bg-blue-700 normal-case my-2"
                >
                  Add {currentCategory}
                </Button>
              </Box>

              <Box className="flex-1 flex flex-col overflow-hidden">
                <CustomTabPanel value={value} index={0}>
                  <TableContainer className="flex-1 overflow-auto">
                    <Table stickyHeader>
                      <TableHead className="bg-gray-50/80 backdrop-blur-md z-10">
                        <TableRow>
                          <TableCell className="font-bold bg-inherit">S/N</TableCell>
                          <TableCell className="font-bold bg-inherit">Equipment Name</TableCell>
                          <TableCell className="font-bold bg-inherit">Category</TableCell>
                          <TableCell className="font-bold bg-inherit">Vendor</TableCell>
                          <TableCell className="font-bold bg-inherit">Brand</TableCell>
                          <TableCell className="font-bold bg-inherit">Description</TableCell>
                          <TableCell className="font-bold bg-inherit">Quantity</TableCell>
                          <TableCell className="font-bold bg-inherit">Rate</TableCell>
                          <TableCell className="font-bold bg-inherit">GST %</TableCell>
                          <TableCell className="font-bold bg-inherit">Taxable</TableCell>
                          <TableCell className="font-bold bg-inherit">Warranty (Start - End)</TableCell>
                          <TableCell className="font-bold bg-inherit" align="right">
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {equipmentProducts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={12} align="center" className="py-8 text-gray-500">
                              No equipment found. Click "Add Equipment" to get started.
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedEquipment.map((item: ProductInterface, idx: number) => (
                            <TableRow key={item._id} hover>
                              <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                              <TableCell className="font-medium text-blue-600">
                                {item.productName}
                              </TableCell>
                              <TableCell>{item.categoryId?.categoryName || 'N/A'}</TableCell>
                              <TableCell>{item.vendorsId?.vendor_name || 'N/A'}</TableCell>
                              <TableCell>{item.companyId?.brandName || 'N/A'}</TableCell>
                              <TableCell>
                                <span className="truncate block max-w-[150px]" title={item.productDescription}>
                                  {item.productDescription || 'N/A'}
                                </span>
                              </TableCell>
                              <TableCell>{item.quantity || 0}</TableCell>
                              <TableCell>₹{item.perUnitRate || 0}</TableCell>
                              <TableCell>{item.gstPct}%</TableCell>
                              <TableCell>₹{item.taxableValue || 0}</TableCell>
                              <TableCell>
                                {item.warrantyStart && item.warrantyEnd
                                  ? `${item.warrantyStart} to ${item.warrantyEnd}`
                                  : 'N/A'}
                              </TableCell>
                              <TableCell align="right">
                                <div className="flex justify-end gap-2">
                                  <IconButton size="small" className="text-blue-600" onClick={() => handleEditProduct(item)}>
                                    <FiEdit size={18} />
                                  </IconButton>
                                  <IconButton size="small" className="text-red-600">
                                    <FiTrash2 size={18} />
                                  </IconButton>
                                </div>
                              </TableCell>
                            </TableRow>
                          )))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CustomTabPanel>

                <CustomTabPanel value={value} index={1}>
                  <TableContainer className="flex-1 overflow-auto">
                    <Table stickyHeader>
                      <TableHead className="bg-gray-50/80 backdrop-blur-md z-10">
                        <TableRow>
                          <TableCell className="font-bold bg-inherit">S/N</TableCell>
                          <TableCell className="font-bold bg-inherit">Item Name</TableCell>
                          <TableCell className="font-bold bg-inherit">Category</TableCell>
                          <TableCell className="font-bold bg-inherit">Vendor</TableCell>
                          <TableCell className="font-bold bg-inherit">Brand</TableCell>
                          <TableCell className="font-bold bg-inherit">Description</TableCell>
                          <TableCell className="font-bold bg-inherit">Quantity</TableCell>
                          <TableCell className="font-bold bg-inherit">Rate</TableCell>
                          <TableCell className="font-bold bg-inherit">GST %</TableCell>
                          <TableCell className="font-bold bg-inherit">Taxable</TableCell>
                          <TableCell className="font-bold bg-inherit">Warranty (Start - End)</TableCell>
                          <TableCell className="font-bold bg-inherit" align="right">
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {crockeryProducts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={12} align="center" className="py-8 text-gray-500">
                              No crockery found. Click "Add Crockery" to get started.
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedCrockery.map((item: ProductInterface, idx: number) => (
                            <TableRow key={item._id} hover>
                              <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                              <TableCell className="font-medium text-orange-600">
                                {item.productName}
                              </TableCell>
                              <TableCell>{item.categoryId?.categoryName || 'N/A'}</TableCell>
                              <TableCell>{item.vendorsId?.vendor_name || 'N/A'}</TableCell>
                              <TableCell>{item.companyId?.brandName || 'N/A'}</TableCell>
                              <TableCell>
                                <span className="truncate block max-w-[150px]" title={item.productDescription}>
                                  {item.productDescription || 'N/A'}
                                </span>
                              </TableCell>
                              <TableCell>{item.quantity || 0}</TableCell>
                              <TableCell>₹{item.perUnitRate || 0}</TableCell>
                              <TableCell>{item.gstPct}%</TableCell>
                              <TableCell>₹{item.taxableValue || 0}</TableCell>
                              <TableCell>
                                {item.warrantyStart && item.warrantyEnd
                                  ? `${item.warrantyStart} to ${item.warrantyEnd}`
                                  : 'N/A'}
                              </TableCell>
                              <TableCell align="right">
                                <div className="flex justify-end gap-2">
                                  <IconButton size="small" className="text-blue-600" onClick={() => handleEditProduct(item)}>
                                    <FiEdit size={18} />
                                  </IconButton>
                                  <IconButton size="small" className="text-red-600">
                                    <FiTrash2 size={18} />
                                  </IconButton>
                                </div>
                              </TableCell>
                            </TableRow>
                          )))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CustomTabPanel>

                <CustomTabPanel value={value} index={2}>
                  <TableContainer className="flex-1 overflow-auto">
                    <Table stickyHeader>
                      <TableHead className="bg-gray-50/80 backdrop-blur-md z-10">
                        <TableRow>
                          <TableCell className="font-bold bg-inherit">S/N</TableCell>
                          <TableCell className="font-bold bg-inherit">Furniture Name</TableCell>
                          <TableCell className="font-bold bg-inherit">Category</TableCell>
                          <TableCell className="font-bold bg-inherit">Vendor</TableCell>
                          <TableCell className="font-bold bg-inherit">Brand</TableCell>
                          <TableCell className="font-bold bg-inherit">Description</TableCell>
                          <TableCell className="font-bold bg-inherit">Quantity</TableCell>
                          <TableCell className="font-bold bg-inherit">Rate</TableCell>
                          <TableCell className="font-bold bg-inherit">GST %</TableCell>
                          <TableCell className="font-bold bg-inherit">Taxable</TableCell>
                          <TableCell className="font-bold bg-inherit">Warranty (Start - End)</TableCell>
                          <TableCell className="font-bold bg-inherit" align="right">
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {furnitureProducts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={12} align="center" className="py-8 text-gray-500">
                              No furniture found. Click "Add Furniture" to get started.
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedFurniture.map((item: ProductInterface, idx: number) => (
                            <TableRow key={item._id} hover>
                              <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                              <TableCell className="font-medium text-purple-600">
                                {item.productName}
                              </TableCell>
                              <TableCell>{item.categoryId?.categoryName || 'N/A'}</TableCell>
                              <TableCell>{item.vendorsId?.vendor_name || 'N/A'}</TableCell>
                              <TableCell>{item.companyId?.brandName || 'N/A'}</TableCell>
                              <TableCell>
                                <span className="truncate block max-w-[150px]" title={item.productDescription}>
                                  {item.productDescription || 'N/A'}
                                </span>
                              </TableCell>
                              <TableCell>{item.quantity || 0}</TableCell>
                              <TableCell>₹{item.perUnitRate || 0}</TableCell>
                              <TableCell>{item.gstPct}%</TableCell>
                              <TableCell>₹{item.taxableValue || 0}</TableCell>
                              <TableCell>
                                {item.warrantyStart && item.warrantyEnd
                                  ? `${item.warrantyStart} to ${item.warrantyEnd}`
                                  : 'N/A'}
                              </TableCell>
                              <TableCell align="right">
                                <div className="flex justify-end gap-2">
                                  <IconButton size="small" className="text-blue-600" onClick={() => handleEditProduct(item)}>
                                    <FiEdit size={18} />
                                  </IconButton>
                                  <IconButton size="small" className="text-red-600">
                                    <FiTrash2 size={18} />
                                  </IconButton>
                                </div>
                              </TableCell>
                            </TableRow>
                          )))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CustomTabPanel>
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