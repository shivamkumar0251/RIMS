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
  // TextField,
  // InputAdornment,
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
import { addProduct, type ProductInterface } from "../../redux/slices/productSlice";
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
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
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

  // Local State for Modals
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [vendorDrawerOpen, setVendorDrawerOpen] = useState(false);

  React.useEffect(() => {
    dispatch(getCategories({ page: 1, limit: 1000 }));
    dispatch(getCompanies({ page: 1, limit: 1000 }));
    dispatch(getVendorNameList());
  }, [dispatch]);


  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const categories = ["Equipment", "Crockery", "Furniture"];

  // Action Handling
  const action = searchParams.get("action");
  const isAddMode = action === "add";

  const handleCloseForm = () => {
    navigate("/admin/restaurant-setup");
  };

  const handleSaveProduct = async (productData: ProductInterface) => {
    try {
      const payload: any = {
        ...productData,
        gstPct: Number(productData.gstPct || 0),
        taxableValue: Number(productData.taxableValue || 0),
        perUnitRate: Number(productData.perUnitRate || 0),
        // Ensure we send string IDs if objects are populated
        categoryId: productData.categoryId?._id ? productData.categoryId : undefined,
        vendorsId: productData.vendorsId?._id ? productData.vendorsId : undefined,
        companyId: productData.companyId?._id ? productData.companyId : undefined,
      };

      await dispatch(addProduct(payload)).unwrap();
      toast.success("Item added successfully");
      navigate("/admin/restaurant-setup");
    } catch (err: any) {
      toast.error(err.message || "Failed to save item");
    }
  };

  // Quick Add Handlers (Reusing logic from ProductTable roughly)
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
    // Simplified mapping for brevity, assuming data matches API needs or similar to ProductTable
    try {
      await dispatch(addVendor(data)).unwrap();
      dispatch(getVendorNameList());
      toast.success("Vendor added");
      setVendorDrawerOpen(false);
    } catch (e: any) { toast.error(e.message); }
  };



  // Mock data for tables
  const mockData = {
    Equipment: [
      {
        id: 1,
        name: "Baking Oven",
        brand: "LG",
        quantity: 2,
        status: "Active",
      },
      {
        id: 2,
        name: "Refrigerator",
        brand: "Samsung",
        quantity: 5,
        status: "Active",
      },
    ],
    Crockery: [
      {
        id: 1,
        name: "Dinner Plate",
        material: "Ceramic",
        quantity: 100,
        status: "Active",
      },
      {
        id: 2,
        name: "Soup Bowl",
        material: "Glass",
        quantity: 50,
        status: "Active",
      },
    ],
    Furniture: [
      {
        id: 1,
        name: "Wooden Chair",
        type: "Dining",
        quantity: 40,
        status: "In Stock",
      },
      {
        id: 2,
        name: "Round Table",
        type: "Dining",
        quantity: 10,
        status: "In Stock",
      },
    ],
  };

  const currentCategory = categories[value] as keyof typeof mockData;

  const renderContent = () => {
    if (vendorDrawerOpen) {
      return (
        <VendorModal
          open={true}
          onClose={() => setVendorDrawerOpen(false)}
          onAddVendor={handleSaveVendor}
          variant="embedded"
        />
      );
    }

    if (isAddMode) {
      return (
        <ProductDrawerForm
          open={true}
          onClose={handleCloseForm}
          isEdit={false}
          initialData={{ productType: categories[value] }}
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
      );
    }

    return (
      <Paper className="shadow-md rounded-xl overflow-hidden">
        <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2, pt: 1 }} className="flex flex-row flex-wrap justify-between items-center">
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
            className="!bg-blue-600 hover:!bg-blue-700 normal-case"
          >
            Add {currentCategory}
          </Button>
        </Box>

        <CustomTabPanel value={value} index={0}>
          <TableContainer>
            <Table>
              <TableHead className="bg-gray-50">
                <TableRow>
                  <TableCell className="font-bold">S/N</TableCell>
                  <TableCell className="font-bold">Equipment Name</TableCell>
                  <TableCell className="font-bold">Brand</TableCell>
                  <TableCell className="font-bold">Quantity</TableCell>
                  <TableCell className="font-bold">Status</TableCell>
                  <TableCell className="font-bold" align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockData.Equipment.map((item, idx) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="font-medium text-blue-600">
                      {item.name}
                    </TableCell>
                    <TableCell>{item.brand}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex justify-end gap-2">
                        <IconButton size="small" className="text-blue-600">
                          <FiEdit size={18} />
                        </IconButton>
                        <IconButton size="small" className="text-red-600">
                          <FiTrash2 size={18} />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CustomTabPanel>

        <CustomTabPanel value={value} index={1}>
          <TableContainer>
            <Table>
              <TableHead className="bg-gray-50">
                <TableRow>
                  <TableCell className="font-bold">S/N</TableCell>
                  <TableCell className="font-bold">Item Name</TableCell>
                  <TableCell className="font-bold">Material</TableCell>
                  <TableCell className="font-bold">Quantity</TableCell>
                  <TableCell className="font-bold">Status</TableCell>
                  <TableCell className="font-bold" align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockData.Crockery.map((item, idx) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="font-medium text-orange-600">
                      {item.name}
                    </TableCell>
                    <TableCell>{item.material}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex justify-end gap-2">
                        <IconButton size="small" className="text-blue-600">
                          <FiEdit size={18} />
                        </IconButton>
                        <IconButton size="small" className="text-red-600">
                          <FiTrash2 size={18} />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CustomTabPanel>

        <CustomTabPanel value={value} index={2}>
          <TableContainer>
            <Table>
              <TableHead className="bg-gray-50">
                <TableRow>
                  <TableCell className="font-bold">S/N</TableCell>
                  <TableCell className="font-bold">Furniture Name</TableCell>
                  <TableCell className="font-bold">Type</TableCell>
                  <TableCell className="font-bold">Quantity</TableCell>
                  <TableCell className="font-bold">Status</TableCell>
                  <TableCell className="font-bold" align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockData.Furniture.map((item, idx) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="font-medium text-purple-600">
                      {item.name}
                    </TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex justify-end gap-2">
                        <IconButton size="small" className="text-blue-600">
                          <FiEdit size={18} />
                        </IconButton>
                        <IconButton size="small" className="text-red-600">
                          <FiTrash2 size={18} />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CustomTabPanel>
      </Paper>
    );
  };

  return (
    <AdminLayout>
      <div>
        {renderContent()}
        <CreateCategoryModal open={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} onSave={handleSaveCategory} />
        <CreateBrandModal open={brandModalOpen} onClose={() => setBrandModalOpen(false)} onSave={handleSaveBrand} />
      </div>
    </AdminLayout >
  );
}
