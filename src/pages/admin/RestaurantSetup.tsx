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
import { addProduct, getProducts, deleteProduct, selectProductState, type ProductInterface } from "../../redux/slices/productSlice";
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
  const productState = useAppSelector(selectProductState);
  const products = productState?.products ?? [];

  // Local State for Modals
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [vendorDrawerOpen, setVendorDrawerOpen] = useState(false);

  React.useEffect(() => {
    dispatch(getCategories({ page: 1, limit: 1000 }));
    dispatch(getCompanies({ page: 1, limit: 1000 }));
    dispatch(getVendorNameList());
    dispatch(getProducts({ page: 1, limit: 1000 }));
  }, [dispatch]);


  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const categories = ["Equipment", "Crockery", "Furniture"];

  // Filter products by type
  const equipmentProducts = products.filter((p: ProductInterface) => p.productType === "Equipment");
  const crockeryProducts = products.filter((p: ProductInterface) => p.productType === "Crockery");
  const furnitureProducts = products.filter((p: ProductInterface) => p.productType === "Furniture");

  // const currentCategory = categories[value] as string;

  // Action Handling
  const action = searchParams.get("action");
  const isAddMode = action === "add";

  const handleCloseForm = () => {
    navigate("/admin/restaurant-setup");
    // Refresh products after closing form
    dispatch(getProducts({ page: 1, limit: 1000 }));
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
      dispatch(getProducts({ page: 1, limit: 1000 }));
      navigate("/admin/restaurant-setup");
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

  const handleEditProduct = (product: ProductInterface) => {
    // We can use a query param or state to open the edit form
    // For now, let's just log and navigate to add mode with product data
    // In a real app, you'd pass the initialData to ProductDrawerForm
    navigate(`?action=edit&id=${product._id}`);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await dispatch(deleteProduct(id)).unwrap();
        toast.success("Product deleted successfully");
        dispatch(getProducts({ page: 1, limit: 1000 })); // Refresh products after deletion
      } catch (err: any) {
        toast.error(err.message || "Failed to delete product");
      }
    }
  };

  const currentCategory = categories[value];

  const renderTable = (data: ProductInterface[], nameField: string, accentColor: string) => {
    // If no data, show some sample rows for visualization (as per user request "Implement mock data")
    const displayData = data.length > 0 ? data : [
      {
        _id: "sample-1",
        productName: `Sample ${currentCategory} 1`,
        productDescription: "High quality item for restaurant needs",
        quantity: 10,
        perUnitRate: 1500,
        gstPct: 18,
        taxableValue: 1770,
        vendorsId: { _id: "v1", vendor_name: "Global Supplies" } as any,
        companyId: { _id: "c1", brandName: "PremiumBrand" } as any,
        warrantyStart: "2023-01-01",
        warrantyEnd: "2024-01-01",
        productType: currentCategory,
      },
      {
        _id: "sample-2",
        productName: `Sample ${currentCategory} 2`,
        productDescription: "Durable and efficient unit",
        quantity: 5,
        perUnitRate: 4500,
        gstPct: 12,
        taxableValue: 5040,
        vendorsId: { _id: "v2", vendor_name: "Kitchen King" } as any,
        companyId: { _id: "c2", brandName: "ChefChoice" } as any,
        warrantyStart: "2023-06-15",
        warrantyEnd: "2025-06-15",
        productType: currentCategory,
      }
    ] as unknown as ProductInterface[];

    return (
      <TableContainer>
        <Table>
          <TableHead className="bg-gray-50">
            <TableRow>
              <TableCell className="font-black text-[10px] py-3 text-slate-500">S/N</TableCell>
              <TableCell className="font-black text-[10px] py-3 text-slate-500">{nameField}</TableCell>
              <TableCell className="font-black text-[10px] py-3 text-slate-500">Vendor</TableCell>
              <TableCell className="font-black text-[10px] py-3 text-slate-500">Brand</TableCell>
              <TableCell className="font-black text-[10px] py-3 text-slate-500">Description</TableCell>
              <TableCell className="font-black text-[10px] py-3 text-slate-500">Quantity</TableCell>
              <TableCell className="font-black text-[10px] py-3 text-slate-500">Rate</TableCell>
              <TableCell className="font-black text-[10px] py-3 text-slate-500">GST %</TableCell>
              <TableCell className="font-black text-[10px] py-3 text-slate-500">Taxable</TableCell>
              <TableCell className="font-black text-[10px] py-3 text-slate-500">Warranty (Start - End)</TableCell>
              <TableCell className="font-black text-[10px] py-3 text-slate-500" align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayData.map((item, idx) => (
              <TableRow key={item._id} hover className="group">
                <TableCell className="text-xs font-bold text-slate-500">{idx + 1}</TableCell>
                <TableCell className={`text-xs font-black ${accentColor}`}>{item.productName}</TableCell>
                <TableCell className="text-xs font-medium text-slate-600">{item.vendorsId?.vendor_name || "N/A"}</TableCell>
                <TableCell className="text-xs font-medium text-slate-600">{item.companyId?.brandName || "N/A"}</TableCell>
                <TableCell className="text-xs font-medium text-slate-500">
                  <span className="truncate block max-w-[150px]" title={item.productDescription}>
                    {item.productDescription || "N/A"}
                  </span>
                </TableCell>
                <TableCell className="text-xs font-black text-slate-700">{item.quantity || 0}</TableCell>
                <TableCell className="text-xs font-black text-slate-700">₹{item.perUnitRate?.toLocaleString() || 0}</TableCell>
                <TableCell className="text-xs font-bold text-slate-600">{item.gstPct}%</TableCell>
                <TableCell className="text-xs font-bold text-slate-600">₹{item.taxableValue?.toLocaleString() || 0}</TableCell>
                <TableCell className="text-xs font-medium text-slate-500 italic">
                  {item.warrantyStart && item.warrantyEnd
                    ? `${item.warrantyStart} - ${item.warrantyEnd}`
                    : "N/A"
                  }
                </TableCell>
                <TableCell align="right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <IconButton size="small" className="text-blue-600" onClick={() => handleEditProduct(item)}>
                      <FiEdit size={14} />
                    </IconButton>
                    <IconButton size="small" className="text-rose-600" onClick={() => handleDeleteProduct(item._id)}>
                      <FiTrash2 size={14} />
                    </IconButton>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

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

    if (isAddMode || searchParams.get("action") === "edit") {
      const editId = searchParams.get("id");
      const initialEditData = editId ? products.find(p => p._id === editId) || {} : {};

      return (
        <ProductDrawerForm
          open={true}
          onClose={handleCloseForm}
          isEdit={!!editId}
          initialData={initialEditData}
          categories={categoriesList}
          vendors={vendors}
          companies={companies}
          productNames={[]}
          onSave={handleSaveProduct}
          onAddCategory={() => setCategoryModalOpen(true)}
          onAddVendor={() => setVendorDrawerOpen(true)}
          onAddBrand={() => setBrandModalOpen(true)}
          onFillFromSearch={() => { }}
          allowedProductTypes={[currentCategory]}
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
              label="EQUIPMENT"
              {...a11yProps(0)}
              className="font-bold text-xs"
            />
            <Tab
              label="CROCKERY"
              {...a11yProps(1)}
              className="font-bold text-xs"
            />
            <Tab
              label="FURNITURE"
              {...a11yProps(2)}
              className="font-bold text-xs"
            />
          </Tabs>
          <Button
            variant="contained"
            startIcon={<FiPlus />}
            onClick={() => navigate("?action=add")}
            className="!bg-blue-600 hover:!bg-blue-700 font-bold text-xs"
            sx={{ borderRadius: '6px', px: 3, py: 1 }}
          >
            ADD {currentCategory.toUpperCase()}
          </Button>
        </Box>

        <CustomTabPanel value={value} index={0}>
          {renderTable(equipmentProducts, "Equipment Name", "text-blue-600")}
        </CustomTabPanel>

        <CustomTabPanel value={value} index={1}>
          {renderTable(crockeryProducts, "Item Name", "text-orange-600")}
        </CustomTabPanel>

        <CustomTabPanel value={value} index={2}>
          {renderTable(furnitureProducts, "Furniture Name", "text-purple-600")}
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
