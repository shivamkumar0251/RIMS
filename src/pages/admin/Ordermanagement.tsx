import {
  Box,
  Button,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TextField,
  Typography,
  IconButton,
  Popover,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Autocomplete,
  InputAdornment,
} from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useMemo, useState, type JSX } from "react";
import { FiSearch, FiFilter, FiPlus, FiCheck } from "react-icons/fi";
import { AdminLayout } from "../../layouts/AdminLayout";
import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";
import { useSearchParams } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "jspdf-autotable";
// import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import {
  addOrder,
  getOrdersProduct,
  selectOrderState,
  type Order,
} from "../../redux/slices/orderSlice";

import { getCategories, selectCategories } from "../../redux/slices/categorySlice";
import { getCompanies, selectCompanies } from "../../redux/slices/companySlice";
import { getVendorNameList, selectVendorNames, getVendors, selectVendors } from "../../redux/slices/vendorSlice";

import { CreateOrderModal } from "../../components/adminComponents/CreateOrderModal";
import { getProducts, selectProductState, updateProduct } from "../../redux/slices/productSlice";

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

  // Tabs (Removed UI, but keeping state for now if needed internally, or just set to empty string)
  const [activeTab] = useState("");

  // Filters
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const paramId = searchParams.get("id");

  // Derive initial state from URL (Persistence Logic)
  const initialCategoryId = (mode === 'category' && paramId) ? [paramId] : (searchParams.get("categoryId") ? searchParams.get("categoryId")!.split(',') : []);
  const initialVendorId = (mode === 'vendor' && paramId) ? paramId : (searchParams.get("vendorId") || "");
  const initialCompanyId = (mode === 'brand' && paramId) ? [paramId] : (searchParams.get("companyId") ? searchParams.get("companyId")!.split(',') : []);

  const [search] = useState("");
  const [categoryId, setCategoryId] = useState<string[]>(initialCategoryId);
  const [vendorId, setVendorId] = useState(initialVendorId);
  const [companyId, setCompanyId] = useState<string[]>(initialCompanyId);
  const [fromDate] = useState("");
  const [toDate] = useState("");

  // Sync state if URL changes externally (e.g. Back button or Sidebar click while on page)
  useEffect(() => {
    if (mode === 'vendor' && paramId) setVendorId(paramId);
    else if (searchParams.get("vendorId")) setVendorId(searchParams.get("vendorId") || "");
    else if (!mode) setVendorId(""); // Clear if no relevant params

    if (mode === 'category' && paramId) setCategoryId([paramId]);
    else if (searchParams.get("categoryId")) setCategoryId(searchParams.get("categoryId")?.split(',') || []);
    else if (!mode) setCategoryId([]);

    if (mode === 'brand' && paramId) setCompanyId([paramId]);
    else if (searchParams.get("companyId")) setCompanyId(searchParams.get("companyId")?.split(',') || []);
    else if (!mode) setCompanyId([]);
  }, [mode, paramId, searchParams]);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Selection & Qty
  const [selected, setSelected] = useState<string[]>([]);
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({});

  // Vendor Selection Dialog
  // Create Order Modal
  const [createOrderOpen, setCreateOrderOpen] = useState(false);

  // Popover States
  const [productAnchor, setProductAnchor] = useState<null | HTMLElement>(null);
  const [catAnchor, setCatAnchor] = useState<null | HTMLElement>(null);
  const [vendorAnchor, setVendorAnchor] = useState<null | HTMLElement>(null);
  const [brandAnchor, setBrandAnchor] = useState<null | HTMLElement>(null);

  const [productSearch, setProductSearch] = useState("");
  const [catSearch, setCatSearch] = useState("");
  const [vendorSearch, setVendorSearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");

  // Determine if we should show the table
  const shouldShowTable = useMemo(() => {
    if (!mode) return false;
    if (mode === 'vendor' && !vendorId) return false;
    if (mode === 'category' && categoryId.length === 0) return false;
    if (mode === 'brand' && companyId.length === 0) return false;
    return true;
  }, [mode, vendorId, categoryId, companyId]);

  // Vendor detection for selected items
  const selectedVendorIds = useMemo(() => {
    const selectedProds = ordersList.filter(p => selected.includes(p._id));
    const vIds = selectedProds.map(p => p.vendorsId?._id).filter(Boolean);
    return Array.from(new Set(vIds));
  }, [selected, ordersList]);

  const isMultipleVendorsSelected = selectedVendorIds.length > 1;
  const singleSelectedVendorId = selectedVendorIds.length === 1 ? selectedVendorIds[0] as string : null;

  // Load dropdowns
  useEffect(() => {
    dispatch(getCategories({ page: 1, limit: 1000 }));
    dispatch(getVendorNameList());
    dispatch(getVendors({ page: 1, limit: 1000 }));
    dispatch(getCompanies({ page: 1, limit: 1000 }));
  }, [dispatch]);

  // Fetch products
  useEffect(() => {
    // Only fetch if we should show the table (i.e., a filter is selected)
    if (!shouldShowTable) {
      return;
    }

    dispatch(
      getOrdersProduct({
        search: productSearch || search,
        page: page + 1,
        limit: rowsPerPage,
        category: categoryId.join(','),
        vendor: vendorId,
        brand: companyId.join(','),
        productType: "", // Fetch all
        fromDate,
        toDate
      })
    );
  }, [dispatch, page, rowsPerPage, search, productSearch, categoryId, vendorId, companyId, fromDate, toDate, shouldShowTable]);



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

    // --- Header Section ---
    doc.setFillColor(63, 81, 181); // Indigo color header
    doc.rect(0, 0, 210, 24, 'F');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("PURCHASE ORDER", 105, 16, { align: "center" });

    // --- Info Section (From & To) ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    let yPos = 35;

    // Left Side: Bill From (Our Company)
    doc.setFont("helvetica", "bold");
    doc.text("BILL FROM:", 14, yPos);
    doc.setFont("helvetica", "normal");
    doc.text("HopsNChops", 14, yPos + 5);
    doc.text("Dharamshala, Palampur, Rd.Sidhpur Fatepur H.P, 176215", 14, yPos + 10);
    doc.text("Contact: +91 9876543210", 14, yPos + 15);
    doc.text("Email: social@hopsnchops.com", 14, yPos + 20);

    // Right Side: Bill To (Vendor)
    const rightX = 120;
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO (VENDOR):", rightX, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(vendor.vendor_name || "N/A", rightX, yPos + 5);
    doc.text(`Mobile: ${vendor.vendor_mobileNo || "N/A"}`, rightX, yPos + 10);
    doc.text(`Contact Person: ${vendor.vendor_contactPerson_name || "N/A"} (${vendor.vendor_contactPerson_mobileNo || "N/A"})`, rightX, yPos + 15);
    doc.text(`Address: ${vendor.vendor_address || "N/A"}`, rightX, yPos + 20);
    doc.text(`Email: ${vendor.vendor_email || "N/A"}`, rightX, yPos + 25);
    if (vendor.vendor_gstNumber) doc.text(`GSTIN: ${vendor.vendor_gstNumber}`, rightX, yPos + 30);

    // Order Details
    doc.setFont("helvetica", "bold");
    doc.text(`Date: ${dayjs().format('DD/MM/YYYY')}`, 14, yPos + 35);
    doc.text(`Order Status: Created/Draft`, 120, yPos + 35);

    // --- Table ---
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
      startY: yPos + 40,
      theme: 'striped',
      headStyles: { fillColor: [63, 81, 181], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });

    // --- Footer ---
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Thank you for your business!", 105, finalY, { align: "center" });

    doc.save(`Order_${vendor.vendor_name}_${dayjs().format('YYYY-MM-DD')}.pdf`);
  };



  // Generic Action Handler
  const handleOrderAction = async (type: "whatsapp" | "pdf" | "excel" | "csv") => {
    // 2. Identify selected vendor
    // Use the filter 'vendorId' if set, otherwise use the auto-detected single vendor from selection
    // If multiple vendors, default to the first one found
    let targetVendorId = vendorId || singleSelectedVendorId;
    if (!targetVendorId && selectedVendorIds.length > 0) {
      targetVendorId = selectedVendorIds[0] as string;
    }

    const currentVendor = vendorsData.find(v => v._id === targetVendorId);

    if (!currentVendor) {
      alert("Please select a vendor first.");
      return;
    }

    // Filter products to match the target vendor
    const validProducts = ordersList.filter(p => selected.includes(p._id) && (qtyMap[p._id] || 0) > 0);
    const selectedProducts = validProducts.filter(p => p.vendorsId?._id === targetVendorId);

    if (isMultipleVendorsSelected) {
      const excludedCount = validProducts.length - selectedProducts.length;
      if (excludedCount > 0) {
        if (!confirm(`Multiple vendors detected.\n\nCreating order for "${currentVendor.vendor_name}" only.\n(${excludedCount} items from other vendors will be ignored).\n\nContinue?`)) {
          return;
        }
      }
    }

    if (selectedProducts.length === 0) return;

    // 2. Prepare Payload
    const payload = {
      vendorsId: currentVendor._id,
      products: selectedProducts.map(p => ({
        productId: p._id,
        orderQty: qtyMap[p._id]
      })),
      purchaseType: "Order"
    };

    // 3. Save Order to Backend (Always save when "Creating" an order record)
    try {
      await dispatch(addOrder(payload)).unwrap();
    } catch (err) {
      console.error("Failed to save order", err);
      // Optional: continue to download even if save fails? Better to stop.
      // return; 
    }

    // 4. Execute Specific Action
    if (type === "whatsapp") {
      // Construct WhatsApp message
      // Header with My Info (Placeholder) & Vendor Info
      let message = `📋 *PURCHASE ORDER*\n`;
      message += `📅 Date: ${dayjs().format("DD/MM/YYYY")}\n`;
      message += `🏪 *From:* HopsNChops\n`; // Replace with dynamic Store Name
      message += `👤 *To Vendor:* ${currentVendor.vendor_name}\n`;
      message += `📱 Mobile: ${currentVendor.vendor_mobileNo}\n`;
      message += `--------------------------------\n\n`;

      message += `*Order Details:*\n`;
      selectedProducts.forEach((p, index) => {
        const qty = qtyMap[p._id];
        const brand = p.companyId?.brandName || "N/A";
        message += `${index + 1}. *${p.productName}* (${p.unit})\n`;
        message += `   Brand: ${brand} | Qty: *${qty}*\n`;
      });

      message += `\n--------------------------------\n`;
      message += `Thank you!`;

      const phoneNumber = currentVendor.vendor_mobileNo || "";
      if (phoneNumber) {
        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
      }
    } else if (type === "pdf") {
      generatePDF(currentVendor);
    } else if (type === "excel") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Purchase Order');

      // 1. Set Column Widths
      sheet.columns = [
        { key: 'A', width: 12 },
        { key: 'B', width: 35 },
        { key: 'C', width: 20 },
        { key: 'D', width: 20 },
        { key: 'E', width: 15 },
        { key: 'F', width: 12 },
        { key: 'G', width: 12 },
        { key: 'H', width: 12 }
      ];

      // 2. Title Section
      const titleRow = sheet.addRow(['PURCHASE ORDER']);
      sheet.mergeCells('A1:H1');
      titleRow.getCell(1).font = { size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
      titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      titleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF444444' } }; // Dark Gray
      sheet.addRow([]); // Empty Row

      // 3. Billing Sections
      // BILL FROM
      sheet.addRow(['BILL From:', 'HopsNChops']).getCell(1).font = { bold: true };
      sheet.addRow(['Address:', 'Dharamshala, Palampur, Rd.Sidhpur Fatepur H.P']).getCell(1).font = { bold: true };
      sheet.addRow(['', '176215']);
      sheet.addRow(['Contact:', '+91 9876543210']).getCell(1).font = { bold: true };
      sheet.addRow(['Email:', 'social@hopsnchops.com']).getCell(1).font = { bold: true };
      sheet.addRow([]); // Separator

      // BILL TO
      sheet.addRow(['BILL TO (VENDOR):', currentVendor.vendor_name || "N/A"]).getCell(1).font = { bold: true };
      sheet.addRow(['Contact Person:', currentVendor.vendor_contactPerson_name || "N/A"]).getCell(1).font = { bold: true };
      sheet.addRow(['Contact Mobile:', currentVendor.vendor_contactPerson_mobileNo || "N/A"]).getCell(1).font = { bold: true };
      sheet.addRow(['Address:', currentVendor.vendor_address || "N/A"]).getCell(1).font = { bold: true };
      sheet.addRow(['Contact:', currentVendor.vendor_mobileNo || "N/A"]).getCell(1).font = { bold: true };
      sheet.addRow(['Email:', currentVendor.vendor_email || "N/A"]).getCell(1).font = { bold: true };
      sheet.addRow([]); // Separator

      // Metadata
      sheet.addRow(['Date:', dayjs().format("DD/MM/YYYY")]).getCell(1).font = { bold: true };
      sheet.addRow([]); // Space before table

      // 4. Table Header
      const tableHeaderRow = sheet.addRow(["Sr.No", "Product", "Category", "Brand", "Quantity", "Unit", "MRP", "Price"]);
      tableHeaderRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF666666' } }; // Medium Gray
        cell.alignment = { horizontal: 'center' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // 5. Product Data
      selectedProducts.forEach((p, index) => {
        const rowData = [
          index + 1,
          p.productName,
          p.categoryId?.categoryName || "-",
          p.companyId?.brandName || "-",
          qtyMap[p._id],
          p.unit,
          "", // MRP
          p.perUnitRate || "" // Price
        ];
        const row = sheet.addRow(rowData);
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          cell.alignment = { vertical: 'middle' };
        });
      });

      // 6. Generate and save
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(new Blob([buffer]), `Purchase_Order_${currentVendor.vendor_name || 'Vendor'}.xlsx`);
      });

    } else if (type === "csv") {
      const preamble = [
        "PURCHASE ORDER",
        "",
        "",
        "",
        "BILL From:,HopsNChops",
        "Address : Dharamshala",
        "Palampur",
        "Rd.Sidhpur Fatepur H.P",
        "176215",
        "Contact: +91 9876543210",
        "Email: social@hopsnchops.com",
        "",
        `BILL TO (VENDOR):,${currentVendor.vendor_name || "N/A"}`,
        `Contact Person:,${currentVendor.vendor_contactPerson_name || "N/A"} (${currentVendor.vendor_contactPerson_mobileNo || "N/A"})`,
        `Address : ${currentVendor.vendor_address || "N/A"}`,
        `Contact: ${currentVendor.vendor_mobileNo || "N/A"}`,
        `Email: ${currentVendor.vendor_email || "N/A"}`,
        "",
        `Date: ${dayjs().format("DD/MM/YYYY")}`,
        ""
      ].join("\n");

      const headers = ["Sr.No", "Product", "Category", "Brand", "Quantity", "Unit", "MRP", "Price"].join(",");
      const rows = selectedProducts.map((p, index) =>
        `${index + 1},"${p.productName}","${p.categoryId?.categoryName || "-"}","${p.companyId?.brandName || "-"}",${qtyMap[p._id]},"${p.unit}","","${p.perUnitRate || ""}"`
      ).join("\n");

      const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(preamble + "\n" + headers + "\n" + rows);
      const link = document.createElement("a");
      link.setAttribute("href", csvContent);
      link.setAttribute("download", `Order_${currentVendor.vendor_name}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // 5. Cleanup
    setCreateOrderOpen(false);
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

  ////// other vendor product start
  const productState = useAppSelector(selectProductState);
  const products = productState?.products || [];
  const [otherProductSearch, setOtherProductSearch] = useState("");


  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        getProducts({
          search: otherProductSearch || undefined,
          page: 1,
          limit: 100,
        })
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [dispatch, otherProductSearch]);
  ////// other vendor product end

  return (
    <AdminLayout>
      <Box className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        {/* Header Section */}
        <Box className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white shadow-sm border-b border-gray-100 shrink-0">
          <Box className="flex items-center gap-3">
            <Typography variant="h6" className="font-bold text-gray-800">
              {mode === 'vendor' && 'Order Management - By Vendor'}
              {mode === 'category' && 'Order Management - By Category'}
              {mode === 'brand' && 'Order Management - By Brand'}
              {!mode && 'Order Management'}
            </Typography>
          </Box>

          <Box className="flex items-center gap-3">
            {mode === 'vendor' && (
              <>
                <style>
                  {`
                    @keyframes border-glow {
                      0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); border-color: #3b82f6; transform: scale(1); }
                      50% { box-shadow: 0 0 12px 2px rgba(59, 130, 246, 0.3); border-color: #60a5fa; transform: scale(1.02); }
                      100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); border-color: #3b82f6; transform: scale(1); }
                    }
                  `}
                </style>
                <Autocomplete
                  size="small"
                  options={vendorsData}
                  getOptionLabel={(option) => option.vendor_name || ""}
                  value={vendorsData.find(v => v._id === vendorId) || null}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                  onChange={(_, newValue) => {
                    const newVal = newValue?._id || "";
                    setVendorId(newVal);
                    const currentParams = Object.fromEntries(searchParams.entries());
                    if (newVal) {
                      setSearchParams({ ...currentParams, vendorId: newVal });
                    } else {
                      delete currentParams.vendorId;
                      delete currentParams.id;
                      setSearchParams(currentParams);
                    }
                  }}
                  PaperComponent={({ children }) => (
                    <Paper className="shadow-2xl rounded-xl border border-blue-100 mt-2 overflow-hidden">
                      {children}
                    </Paper>
                  )}
                  renderOption={(props, option, { selected }) => (
                    <li {...props} key={option._id} className={`${props.className} !px-0 !py-0 border-b border-gray-50 last:border-0`}>
                      <Box className={`w-full py-2.5 px-4 flex flex-col gap-0.5 transition-all duration-200 cursor-pointer ${selected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                        <div className="flex items-center justify-between">
                          <Typography className={`font-semibold text-[14px] ${selected ? 'text-blue-700' : 'text-gray-800'}`}>
                            {option.vendor_name}
                          </Typography>
                          {selected && <FiCheck className="text-blue-600" />}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-gray-500">

                          {option.vendor_city && (
                            <span className="flex items-center gap-1 opacity-80">
                              📍 {option.vendor_city}
                            </span>
                          )}
                        </div>
                      </Box>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={!vendorId ? "Select Vendor First 👈" : "Select Vendor"}
                      placeholder="Choose a vendor..."
                      InputProps={{
                        ...params.InputProps,
                        sx: {
                          borderRadius: '12px',
                          bgcolor: 'white',
                          transition: 'all 0.3s ease-in-out',
                          ...(!vendorId && {
                            animation: 'border-glow 2s infinite ease-in-out',
                            '& fieldset': {
                              borderColor: '#3b82f6 !important',
                              borderWidth: '2px !important'
                            }
                          })
                        }
                      }}
                    />
                  )}
                  sx={{ width: 300 }}
                />
              </>
            )}

            {mode === 'category' && (
              <>
                <style>
                  {`
                    @keyframes border-glow {
                      0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); border-color: #3b82f6; transform: scale(1); }
                      50% { box-shadow: 0 0 12px 2px rgba(59, 130, 246, 0.3); border-color: #60a5fa; transform: scale(1.02); }
                      100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); border-color: #3b82f6; transform: scale(1); }
                    }
                  `}
                </style>
                <Autocomplete
                  multiple
                  size="small"
                  options={categories}
                  getOptionLabel={(option) => option.categoryName || ""}
                  value={categories.filter(c => categoryId.includes(c._id))}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                  onChange={(_, newValue) => {
                    const newVals = newValue.map(v => v._id);
                    setCategoryId(newVals);
                    const currentParams = Object.fromEntries(searchParams.entries());
                    if (newVals.length > 0) {
                      setSearchParams({ ...currentParams, categoryId: newVals.join(',') });
                    } else {
                      delete currentParams.categoryId;
                      delete currentParams.id;
                      setSearchParams(currentParams);
                    }
                  }}
                  PaperComponent={({ children }) => (
                    <Paper className="shadow-2xl rounded-xl border border-blue-100 mt-2 overflow-hidden">
                      {children}
                    </Paper>
                  )}
                  renderOption={(props, option, { selected }) => (
                    <li {...props} key={option._id} className={`${props.className} !px-0 !py-0 border-b border-gray-50 last:border-0`}>
                      <Box className={`w-full py-2.5 px-4 flex items-center justify-between transition-all duration-200 cursor-pointer ${selected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                        <Typography className={`font-semibold text-[14px] ${selected ? 'text-blue-700' : 'text-gray-800'}`}>
                          {option.categoryName}
                        </Typography>
                        {selected && <FiCheck className="text-blue-600 text-md" />}
                      </Box>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={categoryId.length === 0 ? "Select Category First 👈" : "Select Category"}
                      placeholder="Choose categories..."
                      InputProps={{
                        ...params.InputProps,
                        sx: {
                          borderRadius: '12px',
                          bgcolor: 'white',
                          transition: 'all 0.3s ease-in-out',
                          ...(categoryId.length === 0 && {
                            animation: 'border-glow 2s infinite ease-in-out',
                            '& fieldset': {
                              borderColor: '#3b82f6 !important',
                              borderWidth: '2px !important'
                            }
                          })
                        }
                      }}
                    />
                  )}
                  sx={{ width: 320 }}
                />
              </>
            )}

            {mode === 'brand' && (
              <>
                <style>
                  {`
                    @keyframes border-glow {
                      0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); border-color: #3b82f6; transform: scale(1); }
                      50% { box-shadow: 0 0 12px 2px rgba(59, 130, 246, 0.3); border-color: #60a5fa; transform: scale(1.02); }
                      100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); border-color: #3b82f6; transform: scale(1); }
                    }
                  `}
                </style>
                <Autocomplete
                  multiple
                  size="small"
                  options={companies}
                  getOptionLabel={(option) => option.brandName || ""}
                  value={companies.filter(c => companyId.includes(c._id))}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                  onChange={(_, newValue) => {
                    const newVals = newValue.map(v => v._id);
                    setCompanyId(newVals);
                    const currentParams = Object.fromEntries(searchParams.entries());
                    if (newVals.length > 0) {
                      setSearchParams({ ...currentParams, companyId: newVals.join(',') });
                    } else {
                      delete currentParams.companyId;
                      delete currentParams.id;
                      setSearchParams(currentParams);
                    }
                  }}
                  PaperComponent={({ children }) => (
                    <Paper className="shadow-2xl rounded-xl border border-blue-100 mt-2 overflow-hidden">
                      {children}
                    </Paper>
                  )}
                  renderOption={(props, option, { selected }) => (
                    <li {...props} key={option._id} className={`${props.className} !px-0 !py-0 border-b border-gray-50 last:border-0`}>
                      <Box className={`w-full py-2.5 px-4 flex items-center justify-between transition-all duration-200 cursor-pointer ${selected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                        <Typography className={`font-semibold text-[14px] ${selected ? 'text-blue-700' : 'text-gray-800'}`}>
                          {option.brandName}
                        </Typography>
                        {selected && <FiCheck className="text-blue-600 text-md" />}
                      </Box>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={companyId.length === 0 ? "Select Brand First 👈" : "Select Brand"}
                      placeholder="Choose brands..."
                      InputProps={{
                        ...params.InputProps,
                        sx: {
                          borderRadius: '12px',
                          bgcolor: 'white',
                          transition: 'all 0.3s ease-in-out',
                          ...(companyId.length === 0 && {
                            animation: 'border-glow 2s infinite ease-in-out',
                            '& fieldset': {
                              borderColor: '#3b82f6 !important',
                              borderWidth: '2px !important'
                            }
                          })
                        }
                      }}
                    />
                  )}
                  sx={{ width: 320 }}
                />
              </>
            )}

            {shouldShowTable && (
              <Box className="flex flex-col items-end gap-1">
                <Button
                  variant="contained"
                  size="medium"
                  onClick={() => setCreateOrderOpen(true)}
                  disabled={selected.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 normal-case"
                >
                  Create Order
                </Button>
              </Box>
            )}
          </Box>
        </Box>

        {/* Main Content Area */}
        <Box className="flex-1 flex flex-col overflow-hidden p-2 sm:p-3">
          {!shouldShowTable ? (
            <Paper className="flex-1 flex items-center justify-center shadow-md rounded-xl border border-gray-100 bg-white relative overflow-hidden">
              {/* Background Decoration */}
              <Box className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

              <Box className="text-center py-20 px-6 relative z-10 max-w-lg mx-auto">
                <Box className="mb-6 relative inline-block">
                  <div className="absolute inset-0 bg-blue-100 rounded-full scale-110 animate-pulse" />
                  <svg className="relative mx-auto h-20 w-20 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </Box>

                <Typography variant="h4" className="text-gray-800 font-bold mb-3 tracking-tight">
                  {!mode && 'Select an Order Type'}
                  {mode === 'vendor' && !vendorId && 'Select a Vendor'}
                  {mode === 'category' && categoryId.length === 0 && 'Select a Category'}
                  {mode === 'brand' && companyId.length === 0 && 'Select a Brand'}
                </Typography>

                <Box className="w-full relative flex flex-col items-center justify-center">
                  <Typography variant="body1" className="text-gray-500 text-lg leading-relaxed font-medium max-w-sm mx-auto">
                    {!mode && 'Choose "By Vendor", "By Category", or "By Brand" from the sidebar to start creating orders.'}
                    {mode === 'vendor' && !vendorId && 'Select a vendor from the dropdown above to manage products and orders.'}
                    {mode === 'category' && categoryId.length === 0 && 'Select a category above to filter the product list.'}
                    {mode === 'brand' && companyId.length === 0 && 'Select a brand above to see available items.'}
                  </Typography>


                </Box>
              </Box>
            </Paper>
          ) : (
            <Paper className="flex-1 flex flex-col shadow-md rounded-xl overflow-hidden border border-gray-100 bg-white">

              <Box className="p-4 bg-white/80 backdrop-blur-md border-b border-gray-100 z-20 flex items-center justify-between gap-6">
                <Box className="flex-1 max-w-2xl relative">
                  <Autocomplete
                    size="small"
                    options={products}
                    value={null} // always clear after select
                    isOptionEqualToValue={(o, v) => o._id === v?._id}
                    getOptionLabel={(p: any) => p.productName || ""}
                    renderOption={(props, option: any) => (
                      <li {...props} key={option._id} className={`${props.className} border-b border-gray-50 last:border-0`}>
                        <Box className="flex flex-col w-full py-1.5 px-1">
                          <div className="flex justify-between items-start">
                            <Typography className="font-semibold text-sm text-gray-800 leading-tight">
                              {option.productName}
                            </Typography>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full whitespace-nowrap ml-2">
                              {option.unit} {option.packSize ? `(${option.packSize})` : ''}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[11px] text-gray-500">
                            {option.companyId?.brandName && (
                              <span className="flex items-center gap-1 bg-gray-100 px-1.5 rounded">
                                <span className="opacity-60">Brand:</span> {option.companyId?.brandName}
                              </span>
                            )}
                            {option.categoryId?.categoryName && (
                              <span className="flex items-center gap-1 bg-gray-100 px-1.5 rounded">
                                <span className="opacity-60">Cat:</span> {option.categoryId?.categoryName}
                              </span>
                            )}
                          </div>

                          {option.vendorsId?.vendor_name && (
                            <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                              <span className="text-gray-400">Curr. Vendor:</span>
                              <span className="font-medium text-gray-700 bg-orange-50 text-orange-700 px-1.5 rounded border border-orange-100">
                                {option.vendorsId?.vendor_name}
                              </span>
                            </div>
                          )}
                        </Box>
                      </li>
                    )}

                    // 🔥 SEARCH TRIGGER
                    onInputChange={(_, value, reason) => {
                      if (reason === "input") {
                        setOtherProductSearch(value);
                      }
                    }}

                    onChange={async (_, product) => {
                      if (!product || !vendorId) return;

                      try {
                        await dispatch(
                          updateProduct({
                            productId: product._id,
                            productData: {
                              vendorsId: { _id: vendorId },
                            } as any,
                          })
                        ).unwrap();

                        dispatch(
                          getOrdersProduct({
                            search,
                            page: page + 1,
                            limit: rowsPerPage,
                            category: categoryId.join(","),
                            vendor: vendorId,
                            brand: companyId.join(","),
                            productType: "",
                            fromDate,
                            toDate,
                          })
                        );

                        // 🔥 clear search after select
                        setOtherProductSearch("");

                      } catch (err) {
                        console.error("Failed to update product vendor", err);
                      }
                    }}

                    sx={{
                      width: "100%",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        bgcolor: "#f8fafc",
                        borderColor: "transparent",
                        transition: "all 0.2s",
                        paddingLeft: "12px",
                        "&:hover": {
                          bgcolor: "#f1f5f9",
                          borderColor: "#e2e8f0"
                        },
                        "&.Mui-focused": {
                          bgcolor: "#fff",
                          boxShadow: "0 4px 12px rgba(59, 130, 246, 0.15)",
                          borderColor: "#3b82f6"
                        }
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Search products"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <InputAdornment position="start" className="pl-1">
                                <FiPlus className="text-blue-600 text-[18px]" />
                              </InputAdornment>
                              {params.InputProps.startAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Box>

                <Box className="hidden xl:block">
                  <Typography variant="caption" className="text-gray-400 font-medium italic tracking-wide">
                    * Start typing to search products from other vendors to move them here.
                  </Typography>
                </Box>
              </Box>


              <TableContainer className="flex-1"
                sx={{
                  maxHeight: {
                    xs: "70vh",
                    md: "79vh",
                  },
                  overflowY: "auto",
                }}>
                <Table stickyHeader size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox" className="bg-gray-50/80 backdrop-blur-md z-10">
                        <Checkbox
                          color="primary"
                          checked={ordersList.length > 0 && selected.length === ordersList.length}
                          onChange={toggleAll}
                        />
                      </TableCell>
                      <TableCell className="font-bold text-gray-700 bg-gray-50/80 backdrop-blur-md z-10">
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
                              onChange={(e) => setProductSearch(e.target.value)}
                              InputProps={{ startAdornment: <FiSearch size={14} className="text-gray-400 mr-2" />, sx: { bgcolor: 'white' } }}
                            />
                          </Box>
                        </Popover>
                      </TableCell>
                      <TableCell className="font-bold text-gray-700 bg-gray-50/80 backdrop-blur-md z-10">
                        <Box className="flex items-center gap-2">
                          Category
                          <IconButton size="small" onClick={(e) => setCatAnchor(e.currentTarget)}>
                            <FiFilter size={14} className={categoryId.length > 0 ? "text-blue-600" : "text-gray-400"} />
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
                              onChange={(e) => setCatSearch(e.target.value)}
                              InputProps={{ startAdornment: <FiSearch size={14} className="text-gray-400 mr-2" />, sx: { bgcolor: 'white' } }}
                            />
                          </Box>
                          <List sx={{ maxHeight: 300, overflow: 'auto', py: 0 }}>
                            <ListItemButton onClick={() => setCategoryId([])} selected={categoryId.length === 0}>
                              <Checkbox size="small" checked={categoryId.length === 0} indeterminate={categoryId.length > 0 && categoryId.length < categories.length} />
                              <ListItemText primary="All Categories" primaryTypographyProps={{ fontSize: '12px' }} />
                            </ListItemButton>
                            {filteredCats.map((c) => {
                              const isSelected = categoryId.includes(c._id);
                              return (
                                <ListItemButton key={c._id} onClick={() => setCategoryId(prev => isSelected ? prev.filter(id => id !== c._id) : [...prev, c._id])} selected={isSelected}>
                                  <Checkbox size="small" checked={isSelected} />
                                  <ListItemText primary={c.categoryName} primaryTypographyProps={{ fontSize: '12px' }} />
                                </ListItemButton>
                              );
                            })}
                          </List>
                        </Popover>
                      </TableCell>
                      <TableCell className="font-bold text-gray-700 bg-gray-50/80 backdrop-blur-md z-10">
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
                              onChange={(e) => setVendorSearch(e.target.value)}
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
                      <TableCell className="font-bold text-gray-700 bg-gray-50/80 backdrop-blur-md z-10">
                        <Box className="flex items-center gap-2">
                          Brand
                          <IconButton size="small" onClick={(e) => setBrandAnchor(e.currentTarget)}>
                            <FiFilter size={14} className={companyId.length > 0 ? "text-blue-600" : "text-gray-400"} />
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
                              onChange={(e) => setBrandSearch(e.target.value)}
                              InputProps={{ startAdornment: <FiSearch size={14} className="text-gray-400 mr-2" />, sx: { bgcolor: 'white' } }}
                            />
                          </Box>
                          <List sx={{ maxHeight: 300, overflow: 'auto', py: 0 }}>
                            <ListItemButton onClick={() => setCompanyId([])} selected={companyId.length === 0}>
                              <Checkbox size="small" checked={companyId.length === 0} indeterminate={companyId.length > 0 && companyId.length < companies.length} />
                              <ListItemText primary="All Brands" primaryTypographyProps={{ fontSize: '12px' }} />
                            </ListItemButton>
                            {filteredBrands.map((b) => {
                              const isSelected = companyId.includes(b._id);
                              return (
                                <ListItemButton key={b._id} onClick={() => setCompanyId(prev => isSelected ? prev.filter(id => id !== b._id) : [...prev, b._id])} selected={isSelected}>
                                  <Checkbox size="small" checked={isSelected} />
                                  <ListItemText primary={b.brandName} primaryTypographyProps={{ fontSize: '12px' }} />
                                </ListItemButton>
                              );
                            })}
                          </List>
                        </Popover>
                      </TableCell>
                      <TableCell className="font-bold text-gray-700 bg-gray-50/80 backdrop-blur-md z-10">Unit</TableCell>
                      <TableCell className="font-bold text-gray-700 bg-gray-50/80 backdrop-blur-md z-10">Pack Size</TableCell>
                      <TableCell className="font-bold text-gray-700 bg-gray-50/80 backdrop-blur-md z-10">Order Qty</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {orderState.loading ? (
                      <TableRow><TableCell colSpan={8} align="center" className="py-20"><CircularProgress size={30} /></TableCell></TableRow>
                    ) : ordersList.length === 0 ? (
                      <TableRow><TableCell colSpan={8} align="center" className="py-10 text-gray-500">No products found.</TableCell></TableRow>
                    ) : (
                      ordersList.map((p) => (
                        <TableRow key={p._id} hover selected={selected.includes(p._id)}>
                          <TableCell padding="checkbox">
                            <Checkbox color="primary" checked={selected.includes(p._id)} onChange={() => toggleRow(p._id)} />
                          </TableCell>
                          <TableCell className="font-medium text-gray-800">{p.productName}</TableCell>
                          <TableCell className="text-gray-600">{p.categoryId?.categoryName || "-"}</TableCell>
                          <TableCell className="text-gray-600">{p.vendorsId?.vendor_name || "-"}</TableCell>
                          <TableCell className="text-gray-500 italic">{p.companyId?.brandName || "-"}</TableCell>
                          <TableCell className="text-gray-600">{p.unit}</TableCell>
                          <TableCell className="text-gray-600">{p.packSize || "-"}</TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              type="number"
                              className="w-24"
                              value={qtyMap[p._id] || ""}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setQtyMap((prev) => ({ ...prev, [p._id]: isNaN(val) ? 1 : val }));
                                if (!selected.includes(p._id)) toggleRow(p._id);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              placeholder="0"
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={ordersResponse?.total || 0}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                rowsPerPageOptions={[25, 50, 100]}
                className="border-t bg-gray-50 shrink-0"
              />
            </Paper>
          )}
        </Box>

        <CreateOrderModal
          open={createOrderOpen}
          onClose={() => setCreateOrderOpen(false)}
          productCount={selected.length}
          onSendWhatsapp={() => handleOrderAction("whatsapp")}
          onDownloadPDF={() => handleOrderAction("pdf")}
          onDownloadExcel={() => handleOrderAction("excel")}
          onDownloadCSV={() => handleOrderAction("csv")}
        />
      </Box>
    </AdminLayout>
  );
}
