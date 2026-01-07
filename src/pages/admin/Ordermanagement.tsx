import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Popover,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useMemo, useState, type JSX } from "react";
import { FiSend, FiSearch, FiFilter, FiFileText } from "react-icons/fi";
import { AdminLayout } from "../../layouts/AdminLayout";
import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  addOrder,
  getOrdersProduct,
  selectOrderState,
  type Order,
} from "../../redux/slices/orderSlice";

import { getCategories, selectCategories } from "../../redux/slices/categorySlice";
import { getCompanies, selectCompanies } from "../../redux/slices/companySlice";
import { getVendorNameList, selectVendorNames, getVendors, selectVendors } from "../../redux/slices/vendorSlice";

export default function OrderManagementPage(): JSX.Element {
  const dispatch = useAppDispatch();

  // Orders
  const orderState = useAppSelector(selectOrderState);
  const ordersList: Order[] = orderState.ordersProductList || [];
  const ordersResponse = orderState.allOrdersData;

  // Lookups
  const categories = useAppSelector(selectCategories) || [];
  const vendorNames = useAppSelector(selectVendorNames) || [];
  const vendorsData = useAppSelector(selectVendors) || [];
  const companies = useAppSelector(selectCompanies) || [];

  // Tabs
  const [activeTab, setActiveTab] = useState("Inventory Items");

  // Filters
  const [search] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [fromDate] = useState("");
  const [toDate] = useState("");

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Selection & Qty
  const [selected, setSelected] = useState<string[]>([]);
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({});

  // Vendor Selection Dialog
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"whatsapp" | "pdf">("whatsapp");

  // Popover States
  const [productAnchor, setProductAnchor] = useState<null | HTMLElement>(null);
  const [catAnchor, setCatAnchor] = useState<null | HTMLElement>(null);
  const [vendorAnchor, setVendorAnchor] = useState<null | HTMLElement>(null);
  const [brandAnchor, setBrandAnchor] = useState<null | HTMLElement>(null);

  const [productSearch, setProductSearch] = useState("");
  const [catSearch, setCatSearch] = useState("");
  const [vendorSearch, setVendorSearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");

  // Load dropdowns
  useEffect(() => {
    dispatch(getCategories({ page: 1, limit: 1000 }));
    dispatch(getVendorNameList());
    dispatch(getVendors({ page: 1, limit: 1000 }));
    dispatch(getCompanies({ page: 1, limit: 1000 }));
  }, [dispatch]);

  // Fetch products
  useEffect(() => {
    // Map activeTab to Product Type enum
    const typeMapping: Record<string, string> = {
      "Inventory Items": "Inventory Item",
      "Packaging Items": "Packaging Item"
    };

    dispatch(
      getOrdersProduct({
        search: productSearch || search,
        page: page + 1,
        limit: rowsPerPage,
        category: categoryId,
        vendor: vendorId,
        brand: companyId,
        productType: typeMapping[activeTab],
        fromDate,
        toDate
      })
    );
  }, [dispatch, page, rowsPerPage, search, productSearch, categoryId, vendorId, companyId, fromDate, toDate, activeTab]);

  // Reset page and selection when tab changes
  useEffect(() => {
    setPage(0);
    setSelected([]);
    setQtyMap({});
  }, [activeTab]);

  // Selection Logic
  const toggleRow = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selected.length === ordersList.length) {
      setSelected([]);
    } else {
      setSelected(ordersList.map((p) => p._id));
    }
  };


  // PDF Export Logic
  const generatePDF = (vendor: any) => {
    const doc = new jsPDF();
    const isPackaging = activeTab === "Packaging Items";

    // Add Vendor Info to PDF Header
    doc.setFontSize(18);
    doc.text("PURCHASE ORDER", 14, 20);
    doc.setFontSize(11);
    doc.text(`Vendor: ${vendor.vendor_name}`, 14, 30);
    doc.text(`Date: ${dayjs().format('DD/MM/YYYY')}`, 14, 35);
    doc.text(`Order No: (Draft)`, 14, 40);

    const headers = ['#', 'Product', 'Brand', 'Unit'];
    if (isPackaging) {
      headers.push('Shape', 'Colour');
    }
    headers.push('Order Qty', 'Created');

    const tableData = ordersList
      .filter(p => selected.includes(p._id))
      .map((p, index) => {
        const row: any[] = [
          index + 1,
          p.productName,
          p.companyId?.brandName || "N/A",
          p.unit
        ];
        if (isPackaging) {
          row.push(p.shape || "-", p.colour || "-");
        }
        row.push(qtyMap[p._id] || 0, dayjs(p.createdAt).format("DD/MM/YYYY"));
        return row;
      });

    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 45,
    });
    doc.save(`Order_${vendor.vendor_name}_${dayjs().format('YYYY-MM-DD')}.pdf`);
  };

  const handleExportPDF = () => {
    setActionType("pdf");
    setVendorDialogOpen(true);
  };

  // Vendor Selection, WhatsApp & API Call
  const handleSelectVendor = async (vendor: any) => {
    const selectedProducts = ordersList.filter(p => selected.includes(p._id) && (qtyMap[p._id] || 0) > 0);

    if (selectedProducts.length === 0) return;

    // 1. Prepare API Payload
    const payload = {
      vendorsId: vendor._id,
      products: selectedProducts.map(p => ({
        productId: p._id,
        orderQty: qtyMap[p._id]
      }))
    };

    // 2. Dispatch to Backend (Makes it show up in Vendor Orders)
    await dispatch(addOrder(payload)).unwrap();

    // 3. Perform specific action
    if (actionType === "whatsapp") {
      // Construct WhatsApp message
      let message = `📦 *Order for ${vendor.vendor_name}*\n\n`;
      selectedProducts.forEach((p, index) => {
        const qty = qtyMap[p._id];
        const brand = p.companyId?.brandName || "N/A";
        message += `${index + 1}. *${p.productName}*\n   Brand: ${brand}\n   Qty: ${qty}\n\n`;
      });

      const phoneNumber = vendor.vendor_mobileNo || "";
      if (phoneNumber) {
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
      }
    } else {
      // Generate PDF
      generatePDF(vendor);
    }

    setVendorDialogOpen(false);
    setSelected([]);
    setQtyMap({});
  };

  // Filter Search Logic
  const filteredCats = useMemo(() =>
    categories.filter(c => (c.categoryName || "").toLowerCase().includes(catSearch.toLowerCase())),
    [categories, catSearch]
  );

  const filteredVendors = useMemo(() =>
    vendorNames.filter(v => (v.vendor_name || "").toLowerCase().includes(vendorSearch.toLowerCase())),
    [vendorNames, vendorSearch]
  );

  const filteredBrands = useMemo(() =>
    companies.filter(c => (c.brandName || "").toLowerCase().includes(brandSearch.toLowerCase())),
    [companies, brandSearch]
  );

  return (
    <AdminLayout>
      <Box>
        {/* Top Header Row with Tabs */}
        <Box className="flex flex-col sm:flex-row items-center justify-between pt-4 pr-6 gap-4 border-b border-gray-200">
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="Inventory Items" value="Inventory Items" className="normal-case font-semibold" sx={{ fontSize: "12px" }} />
            <Tab label="Packaging Items" value="Packaging Items" className="normal-case font-semibold" sx={{ fontSize: "12px" }} />
          </Tabs>

          <Box className="flex items-center gap-2 mb-2">
            <Button
              variant="outlined"
              startIcon={<FiFileText />}
              onClick={handleExportPDF}
              disabled={selected.length === 0}
              className="normal-case border-blue-600 text-blue-600 hover:bg-blue-50"
              size="small"
            >
              Export to PDF
            </Button>
            <Button
              variant="contained"
              startIcon={<FiSend />}
              disabled={selected.length === 0 || selected.some(id => !(qtyMap[id]))}
              onClick={() => {
                setActionType("whatsapp");
                setVendorDialogOpen(true);
              }}
              size="small"
            >
              Send Order ({selected.length})
            </Button>
          </Box>
        </Box>

        {/* Clean Table */}
        <Paper className="shadow-md rounded-xl overflow-hidden border border-gray-100">
          <TableContainer>
            <Table>
              <TableHead className="bg-gray-50">
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={
                        ordersList.length > 0 &&
                        selected.length === ordersList.length
                      }
                      onChange={toggleAll}
                    />
                  </TableCell>
                  <TableCell className="font-bold">
                    <Box className="flex items-center gap-2">
                      Product
                      <IconButton size="small" onClick={(e) => setProductAnchor(e.currentTarget)}>
                        <FiFilter size={14} className={productSearch ? "text-blue-600" : "text-gray-400"} />
                      </IconButton>
                    </Box>
                    <Popover
                      open={Boolean(productAnchor)}
                      anchorEl={productAnchor}
                      onClose={() => setProductAnchor(null)}
                      PaperProps={{ sx: { minWidth: 240, shadow: 4, borderRadius: 2, overflow: 'hidden', mt: 1 } }}
                    >
                      <Box className="p-2 border-b bg-gray-50">
                        <TextField
                          placeholder="Search Product..."
                          size="small"
                          fullWidth
                          variant="outlined"
                          value={productSearch}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProductSearch(e.target.value)}
                          InputProps={{ startAdornment: <FiSearch size={14} className="text-gray-400 mr-2" />, sx: { bgcolor: 'white' } }}
                        />
                      </Box>
                    </Popover>
                  </TableCell>
                  <TableCell className="font-bold">
                    <Box className="flex items-center gap-2">
                      Category
                      <IconButton size="small" onClick={(e) => setCatAnchor(e.currentTarget)}>
                        <FiFilter size={14} className={categoryId ? "text-blue-600" : "text-gray-400"} />
                      </IconButton>
                    </Box>
                    <Popover
                      open={Boolean(catAnchor)}
                      anchorEl={catAnchor}
                      onClose={() => setCatAnchor(null)}
                      PaperProps={{ sx: { minWidth: 240, shadow: 4, borderRadius: 2, overflow: 'hidden', mt: 1 } }}
                    >
                      <Box className="p-2 border-b bg-gray-50">
                        <TextField
                          placeholder="Search Category..."
                          size="small"
                          fullWidth
                          variant="outlined"
                          value={catSearch}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCatSearch(e.target.value)}
                          InputProps={{ startAdornment: <FiSearch size={14} className="text-gray-400 mr-2" />, sx: { bgcolor: 'white' } }}
                        />
                      </Box>
                      <List sx={{ maxHeight: 300, overflow: 'auto', py: 0 }}>
                        <ListItemButton onClick={() => { setCategoryId(""); setCatAnchor(null); }} selected={!categoryId}>
                          <ListItemText primary="All Categories" primaryTypographyProps={{ fontSize: '12px' }} />
                        </ListItemButton>
                        {filteredCats.map((c) => (
                          <ListItemButton key={c._id} onClick={() => { setCategoryId(c._id); setCatAnchor(null); }} selected={categoryId === c._id}>
                            <ListItemText primary={c.categoryName} primaryTypographyProps={{ fontSize: '12px' }} />
                          </ListItemButton>
                        ))}
                      </List>
                    </Popover>
                  </TableCell>
                  <TableCell className="font-bold">
                    <Box className="flex items-center gap-2">
                      Vendor
                      <IconButton size="small" onClick={(e) => setVendorAnchor(e.currentTarget)}>
                        <FiFilter size={14} className={vendorId ? "text-blue-600" : "text-gray-400"} />
                      </IconButton>
                    </Box>
                    <Popover
                      open={Boolean(vendorAnchor)}
                      anchorEl={vendorAnchor}
                      onClose={() => setVendorAnchor(null)}
                      PaperProps={{ sx: { minWidth: 260, shadow: 4, borderRadius: 2, overflow: 'hidden', mt: 1 } }}
                    >
                      <Box className="p-2 border-b bg-gray-50">
                        <TextField
                          placeholder="Search Vendor..."
                          size="small"
                          fullWidth
                          variant="outlined"
                          value={vendorSearch}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVendorSearch(e.target.value)}
                          InputProps={{ startAdornment: <FiSearch size={14} className="text-gray-400 mr-2" />, sx: { bgcolor: 'white' } }}
                        />
                      </Box>
                      <List sx={{ maxHeight: 300, overflow: 'auto', py: 0 }}>
                        <ListItemButton onClick={() => { setVendorId(""); setVendorAnchor(null); }} selected={!vendorId}>
                          <ListItemText primary="All Vendors" primaryTypographyProps={{ fontSize: '12px' }} />
                        </ListItemButton>
                        {filteredVendors.map((v) => (
                          <ListItemButton key={v._id} onClick={() => { setVendorId(v._id); setVendorAnchor(null); }} selected={vendorId === v._id}>
                            <ListItemText primary={v.vendor_name} primaryTypographyProps={{ fontSize: '12px' }} />
                          </ListItemButton>
                        ))}
                      </List>
                    </Popover>
                  </TableCell>
                  <TableCell className="font-bold">
                    <Box className="flex items-center gap-2">
                      Brand
                      <IconButton size="small" onClick={(e) => setBrandAnchor(e.currentTarget)}>
                        <FiFilter size={14} className={companyId ? "text-blue-600" : "text-gray-400"} />
                      </IconButton>
                    </Box>
                    <Popover
                      open={Boolean(brandAnchor)}
                      anchorEl={brandAnchor}
                      onClose={() => setBrandAnchor(null)}
                      PaperProps={{ sx: { minWidth: 240, shadow: 4, borderRadius: 2, overflow: 'hidden', mt: 1 } }}
                    >
                      <Box className="p-2 border-b bg-gray-50">
                        <TextField
                          placeholder="Search Company..."
                          size="small"
                          fullWidth
                          variant="outlined"
                          value={brandSearch}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBrandSearch(e.target.value)}
                          InputProps={{ startAdornment: <FiSearch size={14} className="text-gray-400 mr-2" />, sx: { bgcolor: 'white' } }}
                        />
                      </Box>
                      <List sx={{ maxHeight: 300, overflow: 'auto', py: 0 }}>
                        <ListItemButton onClick={() => { setCompanyId(""); setBrandAnchor(null); }} selected={!companyId}>
                          <ListItemText primary="All Brands" primaryTypographyProps={{ fontSize: '12px' }} />
                        </ListItemButton>
                        {filteredBrands.map((b) => (
                          <ListItemButton key={b._id} onClick={() => { setCompanyId(b._id); setBrandAnchor(null); }} selected={companyId === b._id}>
                            <ListItemText primary={b.brandName} primaryTypographyProps={{ fontSize: '12px' }} />
                          </ListItemButton>
                        ))}
                      </List>
                    </Popover>
                  </TableCell>
                  <TableCell className="font-bold">Unit</TableCell>
                  {activeTab === "Packaging Items" && (
                    <>
                      <TableCell className="font-bold">Shape</TableCell>
                      <TableCell className="font-bold">Colour</TableCell>
                    </>
                  )}
                  <TableCell className="font-bold">Current Qty</TableCell>
                  <TableCell className="font-bold" style={{ width: 140 }}>Order Qty</TableCell>
                  <TableCell className="font-bold">Created</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {orderState.loading ? (
                  <TableRow>
                    <TableCell colSpan={activeTab === "Packaging Items" ? 11 : 9} align="center" className="py-10">
                      <CircularProgress size={30} />
                      <Typography className="mt-2 text-gray-500 text-sm">Loading products...</Typography>
                    </TableCell>
                  </TableRow>
                ) : ordersList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={activeTab === "Packaging Items" ? 11 : 9} align="center" className="py-10 text-gray-500">
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  ordersList.map((p) => {
                    const pid = p._id;
                    const isSelected = selected.includes(pid);

                    return (
                      <TableRow key={pid} hover selected={isSelected}>
                        <TableCell padding="checkbox">
                          <Checkbox color="primary" checked={isSelected} onChange={() => toggleRow(pid)} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" className="font-medium">{p.productName}</Typography>
                          <Typography variant="caption" className="text-gray-500">{p.packSize} | {p.unit}</Typography>
                        </TableCell>
                        <TableCell className="capitalize text-gray-600">{p.categoryId?.categoryName || "N/A"}</TableCell>
                        <TableCell className="text-gray-600">{p.vendorsId?.vendor_name}</TableCell>
                        <TableCell className="text-gray-600 italic">{p.companyId?.brandName}</TableCell>
                        <TableCell className="text-gray-600">{p.unit}</TableCell>
                        {activeTab === "Packaging Items" && (
                          <>
                            <TableCell className="text-gray-600">{p.shape || "-"}</TableCell>
                            <TableCell className="text-gray-600">{p.colour || "-"}</TableCell>
                          </>
                        )}
                        <TableCell className="text-center">{p.currentPurchaseQty ?? "-"}</TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={qtyMap[pid] || ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const val = Number(e.target.value);
                              setQtyMap(prev => ({ ...prev, [pid]: val }));
                              if (val > 0) {
                                if (!selected.includes(pid)) setSelected(prev => [...prev, pid]);
                              } else {
                                setSelected(prev => prev.filter(id => id !== pid));
                              }
                            }}
                            sx={{ "& .MuiInputBase-input": { py: 0.5, px: 1, textAlign: 'center' } }}
                          />
                        </TableCell>
                        <TableCell className="text-gray-500 text-xs">
                          {p.createdAt ? dayjs(p.createdAt).format("DD/MM/YYYY") : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={ordersResponse?.total ?? 0}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(0);
            }}
            className="border-t bg-gray-50"
          />
        </Paper>
      </Box>

      {/* Vendor Selection Dialog */}
      <Dialog open={vendorDialogOpen} onClose={() => setVendorDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle className="font-bold">Select Vendor</DialogTitle>
        <DialogContent>
          <List>
            {vendorsData.map((vendor: any) => (
              <ListItemButton key={vendor._id} onClick={() => handleSelectVendor(vendor)} className="border-b">
                <ListItemText
                  primary={vendor.vendor_name}
                  secondary={vendor.vendor_mobileNo}
                  primaryTypographyProps={{ fontWeight: 'bold' }}
                />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
