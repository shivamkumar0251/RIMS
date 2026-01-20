import React, { useEffect, useState, useMemo } from "react";
import {
    Box,
    Button,
    Drawer,
    IconButton,
    MenuItem,
    TextField,
    Typography,
    Autocomplete,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Select,
} from "@mui/material";
import dayjs from "dayjs";
import { FiX, FiPlus, FiTrash2, FiSettings } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";
import { getProducts, selectProducts, addProduct } from "../../redux/slices/productSlice";
import { getVendorNameList, selectVendorNames, getVendorById, type GetVendorData, getVendors } from "../../redux/slices/vendorSlice";
import { getCategories, selectCategories } from "../../redux/slices/categorySlice";
import { getCompanies, selectCompanies } from "../../redux/slices/companySlice";
import { ProductDrawerForm } from "./ProductDrawerForm";
import { VendorDialogForm } from "./VendorDialogForm";
import { toast } from "react-hot-toast";
import { addVendor } from "../../redux/slices/vendorSlice";

interface PurchaseDrawerFormProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    initialData?: any;
    isEdit?: boolean;
}

interface ItemRow {
    id: string;
    productId: any;
    productName: string;
    barcode: string;
    hsn: string;
    qty: number;
    uom: string;
    price: number;
    discount: number;
    tax: number;
    cess: number;
    total: number;
    note: string;
}

export const PurchaseDrawerForm: React.FC<PurchaseDrawerFormProps> = ({
    open,
    onClose,
    onSave,
    initialData,
    isEdit = false,
}) => {
    const dispatch = useAppDispatch();
    const products = useAppSelector(selectProducts);
    const vendors = useAppSelector(selectVendorNames);
    const categories = useAppSelector(selectCategories);
    const companies = useAppSelector(selectCompanies);

    // --- State ---
    const [selectedVendor, setSelectedVendor] = useState<any>(null);
    const [vendorDetails, setVendorDetails] = useState<GetVendorData | null>(null);
    const [revCharge, setRevCharge] = useState("No");
    const [shipTo, setShipTo] = useState("Same as Billing Address");
    const [placeOfSupply, setPlaceOfSupply] = useState("Himachal Pradesh");

    const [invoiceType, setInvoiceType] = useState("Regular");
    const [invoiceNo, setInvoiceNo] = useState("");
    const [invoiceDate, setInvoiceDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [challanNo, setChallanNo] = useState("");
    const [challanDate, setChallanDate] = useState("");
    const [lrNo, setLrNo] = useState("");
    const [ewayNo, setEwayNo] = useState("");
    const [deliveryMode, setDeliveryMode] = useState("");

    const [items, setItems] = useState<ItemRow[]>([
        { id: `${Date.now()}-0`, productId: null, productName: "", barcode: "", hsn: "", qty: 1, uom: "PKT", price: 0, discount: 0, tax: 0, cess: 0, total: 0, note: "" }
    ]);

    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isVendorDialogOpen, setIsVendorDialogOpen] = useState(false);
    const [activeRowIdx, setActiveRowIdx] = useState<number | null>(null);



    // --- Effects ---
    useEffect(() => {
        if (open) {
            dispatch(getProducts({ page: 1, limit: 1000 }));
            dispatch(getVendorNameList());
            dispatch(getVendors({ page: 1, limit: 1000 }));
            dispatch(getCategories({ page: 1, limit: 1000 }));
            dispatch(getCompanies({ page: 1, limit: 1000 }));

            if (initialData) {
                setInvoiceNo(initialData.orderNumber || "");
                setInvoiceDate(dayjs(initialData.orderDate).format("YYYY-MM-DD"));
                setInvoiceType(initialData.invoiceType || "Regular");
                setChallanNo(initialData.challanNo || "");
                setChallanDate(initialData.challanDate || "");
                setLrNo(initialData.lrNo || "");
                setEwayNo(initialData.ewayNo || "");
                setDeliveryMode(initialData.deliveryMode || "");
                setRevCharge(initialData.revCharge || "No");
                setShipTo(initialData.shipTo || "Same as Billing Address");
                setPlaceOfSupply(initialData.placeOfSupply || "Himachal Pradesh");

                if (initialData.products) {
                    setItems(initialData.products.map((p: any, idx: number) => ({
                        id: `${Date.now()}-${idx}`,
                        productId: p.productId,
                        productName: p.productId?.productName || "",
                        barcode: p.productId?.barcode || "",
                        hsn: p.productId?.hsnCode || "",
                        qty: p.orderQty || 1,
                        uom: p.productId?.unit || "Unit",
                        price: p.rate || 0,
                        discount: 0,
                        tax: 0,
                        cess: 0,
                        total: (p.orderQty || 1) * (p.rate || 0),
                        note: ""
                    })));
                }
            } else {
                setInvoiceNo("");
                setSelectedVendor(null);
                setVendorDetails(null);
                setItems([{ id: `${Date.now()}-0`, productId: null, productName: "", barcode: "", hsn: "", qty: 1, uom: "PKT", price: 0, discount: 0, tax: 0, cess: 0, total: 0, note: "" }]);
            }
        }
    }, [open, initialData, dispatch]);

    // Separate effect for vendor selection from initialData
    useEffect(() => {
        if (open && initialData && vendors.length > 0) {
            const v = vendors.find(v => v._id === (initialData.vendorId?._id || initialData.vendorId));
            if (v && !selectedVendor) {
                setSelectedVendor(v);
                fetchVendorData(v._id);
            }
        }
    }, [open, initialData, vendors, selectedVendor]);

    const fetchVendorData = async (vendorId: string) => {
        try {
            const data = await dispatch(getVendorById(vendorId)).unwrap();
            setVendorDetails(data);
            if (data.vendor_state) {
                setPlaceOfSupply(data.vendor_state);
            }
        } catch (err) {
            toast.error("Failed to load vendor details");
        }
    };

    const handleAddItem = () => {
        setItems([...items, { id: `${Date.now()}-${Math.random()}`, productId: null, productName: "", barcode: "", hsn: "", qty: 1, uom: "Unit", price: 0, discount: 0, tax: 0, cess: 0, total: 0, note: "" }]);
    };

    const handleItemChange = (idx: number, field: keyof ItemRow, val: any) => {
        const newItems = [...items];
        const item = { ...newItems[idx] };
        if (field === "productId") {
            item.productId = val;
            item.productName = val?.productName || "";
            item.barcode = val?.barcode || "";
            item.hsn = val?.hsnCode || "";
            item.uom = val?.unit || "Unit";
            item.price = val?.perUnitRate || 0;
        } else {
            (item as any)[field] = val;
        }
        // Calculate subtotal
        const subtotal = item.qty * item.price;
        // Calculate tax amount (CGST + SGST)
        const taxAmount = (subtotal * item.tax) / 100;
        // Total = Subtotal + Tax
        item.total = subtotal + taxAmount;
        newItems[idx] = item;
        setItems(newItems);
    };

    const totals = useMemo(() => {
        return items.reduce((acc, it) => ({
            qty: acc.qty + it.qty,
            total: acc.total + it.total
        }), { qty: 0, total: 0 });
    }, [items]);

    const handleSave = async () => {
        if (!selectedVendor || !invoiceNo) {
            toast.error("Vender and Invoice No are required");
            return;
        }
        const payload = {
            vendorId: selectedVendor._id,
            orderNumber: invoiceNo,
            orderDate: invoiceDate,
            invoiceType,
            challanNo,
            challanDate,
            lrNo,
            ewayNo,
            deliveryMode,
            revCharge,
            placeOfSupply,
            products: items.map(it => ({
                productId: it.productId?._id,
                orderQty: it.qty,
                rate: it.price
            })),
            totalAmount: totals.total,
            status: "Draft"
        };
        await onSave(payload);
    };

    return (
        <>
            <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: '100vw', bgcolor: '#f8fafc' } }}>
                <Box className="flex flex-col h-screen overflow-hidden">
                    <Box className="px-6 py-3 bg-white border-b flex items-center justify-between shadow-sm">
                        <Box className="flex items-center gap-2">
                            <Box className="w-8 h-8 rounded bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100">
                                <FiSettings className={isEdit ? "animate-spin-slow" : ""} />
                            </Box>
                            <Typography className="font-bold text-slate-700">{isEdit ? "Update Purchase Invoice" : "Create Purchase Invoice"}</Typography>
                        </Box>
                        <IconButton onClick={onClose} size="small"><FiX /></IconButton>
                    </Box>

                    <Box className="flex-1 overflow-y-auto p-4 content-center">
                        <Box className="max-w-[1500px] mx-auto space-y-4">
                            <Box className="grid grid-cols-12 gap-4">
                                {/* Vendor Information Box */}
                                <Box className="col-span-12 lg:col-span-5">
                                    <Paper className="p-5 rounded-xl border border-slate-200">
                                        <Box className="flex justify-between items-center mb-4">
                                            <Typography className="text-xs font-black text-slate-400 uppercase tracking-wider">Vendor Information</Typography>
                                            <Button 
                                                size="small" 
                                                variant="contained" 
                                                onClick={() => setIsVendorDialogOpen(true)}
                                                className="bg-[#00c2a8] text-[10px] py-0.5 px-3 normal-case rounded-md"
                                            >
                                                + Add Vendor
                                            </Button>
                                        </Box>
                                        <Box className="space-y-3">
                                            {[
                                                {
                                                    label: "M/S.*", field: (
                                                        <Box className="flex-1 flex gap-1">
                                                            <Autocomplete 
                                                                fullWidth 
                                                                size="small" 
                                                                options={vendors} 
                                                                getOptionLabel={(o) => o?.vendor_name || ""} 
                                                                isOptionEqualToValue={(option, value) => option?._id === value?._id}
                                                                value={selectedVendor}
                                                                onChange={(_, v) => { 
                                                                    setSelectedVendor(v); 
                                                                    if (v) {
                                                                        fetchVendorData(v._id); 
                                                                    } else {
                                                                        setVendorDetails(null);
                                                                        setPlaceOfSupply("Himachal Pradesh"); // Initial default or clear
                                                                    }
                                                                }}
                                                                renderInput={(params) => <TextField {...params} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }} />}
                                                            />
                                                            {/* <IconButton className="bg-slate-50 border border-slate-200" size="small"><FiSearch size={14} /></IconButton> */}
                                                        </Box>
                                                    )
                                                },
                                                { label: "Address", field: <TextField fullWidth multiline rows={2} size="small" value={vendorDetails?.vendor_address || ""} InputProps={{ readOnly: true, sx: { bgcolor: '#f8fafc', fontSize: '11px' } }} /> },
                                                { label: "Contact Person", field: <TextField fullWidth size="small" value={vendorDetails?.vendor_contactPerson_name || ""} InputProps={{ readOnly: true, sx: { bgcolor: '#f8fafc', fontSize: '11px' } }} /> },
                                                { label: "Phone No", field: <TextField fullWidth size="small" value={vendorDetails?.vendor_mobileNo || ""} InputProps={{ readOnly: true, sx: { bgcolor: '#f8fafc', fontSize: '11px' } }} /> },
                                                { label: "Email", field: <TextField fullWidth size="small" value={vendorDetails?.vendor_email || ""} InputProps={{ readOnly: true, sx: { bgcolor: '#f8fafc', fontSize: '11px' } }} /> },
                                                { 
                                                    label: "GSTIN / PAN", 
                                                    field: (
                                                        <TextField 
                                                            fullWidth 
                                                            size="small" 
                                                            value={[vendorDetails?.vendor_gstNumber, vendorDetails?.vendor_pan].filter(Boolean).join(" / ") || ""} 
                                                            InputProps={{ readOnly: true, sx: { bgcolor: '#f8fafc', fontSize: '11px' } }} 
                                                        />
                                                    ) 
                                                },
                                                { 
                                                    label: "Bank Details", 
                                                    field: (
                                                        <TextField 
                                                            fullWidth 
                                                            size="small" 
                                                            placeholder="A/c No, IFSC"
                                                            value={[vendorDetails?.vendor_accountNumber, vendorDetails?.vendor_ifscCode].filter(Boolean).join(", ") || ""} 
                                                            InputProps={{ readOnly: true, sx: { bgcolor: '#f8fafc', fontSize: '11px' } }} 
                                                        />
                                                    ) 
                                                },
                                            ].map((item, i) => (
                                                <Box key={i} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                                                    <Typography className="text-[10px] sm:text-[11px] font-semibold text-slate-500 sm:w-28 shrink-0">{item.label}</Typography>
                                                    {item.field}
                                                </Box>
                                            ))}
                                            <Box className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                                                <Typography className="text-[10px] sm:text-[11px] font-semibold text-slate-500 sm:w-28 shrink-0">Rev. Charge</Typography>
                                                <Select fullWidth size="small" value={revCharge} onChange={(e) => setRevCharge(e.target.value)} sx={{ fontSize: '11px', bgcolor: 'white' }}>
                                                    <MenuItem value="No">No</MenuItem><MenuItem value="Yes">Yes</MenuItem>
                                                </Select>
                                            </Box>
                                            {/* <Box className="flex justify-end"><Button className="text-[#00c2a8] text-[10px] normal-case font-bold">+ Add New Shipping</Button></Box> */}
                                            <Box className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                                                <Typography className="text-[10px] sm:text-[11px] font-semibold text-slate-500 sm:w-28 shrink-0">Ship To</Typography>
                                                <Select fullWidth size="small" value={shipTo} onChange={(e) => setShipTo(e.target.value)} sx={{ fontSize: '11px', bgcolor: 'white' }}>
                                                    <MenuItem value="Same as Billing Address">Same as Billing Address</MenuItem>
                                                </Select>
                                            </Box>
                                            <Box className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                                                <Typography className="text-[10px] sm:text-[11px] font-semibold text-slate-500 sm:w-28 shrink-0">Place of Supply*</Typography>
                                                <TextField fullWidth size="small" value={placeOfSupply} onChange={(e) => setPlaceOfSupply(e.target.value)} InputProps={{ sx: { fontSize: '11px', bgcolor: 'white' } }} />
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Box>

                                {/* Purchase Invoice Detail Box */}
                                <Box className="col-span-12 lg:col-span-7">
                                    <Paper className="p-5 rounded-xl border border-slate-200 h-full relative">
                                        <Typography className="text-xs font-black text-slate-400 uppercase tracking-wider mb-5">Purchase Invoice Detail</Typography>
                                        <Box className="grid grid-cols-12 gap-x-6 gap-y-4">
                                            <Box className="col-span-12 md:col-span-6 flex items-center gap-3">
                                                <Typography className="text-[11px] font-medium text-slate-500 w-24">Invoice Type</Typography>
                                                <Select fullWidth size="small" value={invoiceType} onChange={(e) => setInvoiceType(e.target.value)} sx={{ fontSize: '11px', bgcolor: 'white' }}>
                                                    <MenuItem value="Regular">Regular</MenuItem>
                                                    <MenuItem value="Bill to Supply">Bill to Supply</MenuItem>
                                                </Select>
                                            </Box>
                                            <Box className="col-span-12" />
                                            <Box className="col-span-12 md:col-span-6 flex items-center gap-3">
                                                <Typography className="text-[11px] font-medium text-slate-500 w-24">Invoice No.*</Typography>
                                                <TextField fullWidth size="small" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} InputProps={{ sx: { fontSize: '11px', bgcolor: 'white' } }} />
                                            </Box>
                                            <Box className="col-span-12 md:col-span-6 flex items-center gap-3">
                                                <Typography className="text-[11px] font-medium text-slate-500 w-24 text-right">Date*</Typography>
                                                <TextField type="date" fullWidth size="small" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} InputProps={{ sx: { fontSize: '11px', bgcolor: 'white' } }} />
                                            </Box>
                                            <Box className="col-span-12 md:col-span-6 flex items-center gap-3">
                                                <Typography className="text-[11px] font-medium text-slate-500 w-24">Challan No.</Typography>
                                                <TextField fullWidth size="small" placeholder="Challan No." value={challanNo} onChange={(e) => setChallanNo(e.target.value)} InputProps={{ sx: { fontSize: '11px', bgcolor: 'white' } }} />
                                            </Box>
                                            <Box className="col-span-12 md:col-span-6 flex items-center gap-3">
                                                <Typography className="text-[11px] font-medium text-slate-500 w-24 text-right">Challan Date</Typography>
                                                <TextField type="date" fullWidth size="small" value={challanDate} onChange={(e) => setChallanDate(e.target.value)} InputProps={{ sx: { fontSize: '11px', bgcolor: 'white' } }} />
                                            </Box>
                                            <Box className="col-span-12 md:col-span-6 flex items-center gap-3">
                                                <Typography className="text-[11px] font-medium text-slate-500 w-24">L.R. No.</Typography>
                                                <TextField fullWidth size="small" placeholder="L.R. No." value={lrNo} onChange={(e) => setLrNo(e.target.value)} InputProps={{ sx: { fontSize: '11px', bgcolor: 'white' } }} />
                                            </Box>
                                            <Box className="col-span-12 md:col-span-6 flex items-center gap-3">
                                                <Typography className="text-[11px] font-medium text-slate-500 w-24 text-right">E-Way No.</Typography>
                                                <TextField fullWidth size="small" placeholder="E-Way No." value={ewayNo} onChange={(e) => setEwayNo(e.target.value)} InputProps={{ sx: { fontSize: '11px', bgcolor: 'white' } }} />
                                            </Box>
                                            <Box className="col-span-12 flex items-center gap-3 mt-4">
                                                <Typography className="text-[11px] font-medium text-slate-500 w-16">Delivery</Typography>
                                                <Select fullWidth size="small" displayEmpty value={deliveryMode} onChange={(e) => setDeliveryMode(e.target.value)} sx={{ fontSize: '11px', bgcolor: 'white' }}>
                                                    <MenuItem value="" disabled>Select Delivery Mode</MenuItem>
                                                    <MenuItem value="Self">Self</MenuItem><MenuItem value="Courier">Courier</MenuItem>
                                                </Select>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Box>
                            </Box>

                            {/* Product Items Table */}
                            <Paper className="rounded-xl border border-slate-200 overflow-hidden">
                                <TableContainer>
                                    <Table size="small" sx={{ tableLayout: 'fixed' }}>
                                        <TableHead className="bg-slate-50/50">
                                            <TableRow>
                                                <TableCell className="text-[10px] font-black py-2 border-r" width={30} align="center">SR.</TableCell>
                                                <TableCell className="text-[10px] font-black py-2 border-r">PRODUCT / OTHER CHARGES</TableCell>
                                                <TableCell className="text-[10px] font-black py-2 border-r text-center" width={80}>QTY.</TableCell>
                                                <TableCell className="text-[10px] font-black py-2 border-r text-center" width={110}>UOM</TableCell>
                                                <TableCell className="text-[10px] font-black py-2 border-r text-right" width={100}>PRICE (RS)</TableCell>
                                                <TableCell className="text-[10px] font-black py-2 border-r text-center" width={80}>DISCOUNT</TableCell>
                                                <TableCell className="text-[10px] font-black py-2 border-r text-center" width={150}>CGST + SGST</TableCell>
                                                <TableCell className="text-[10px] font-black py-2 text-right" width={100}>TOTAL</TableCell>
                                                <TableCell width={40}></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {items.map((row, idx) => (
                                                <React.Fragment key={row.id}>
                                                    <TableRow hover>
                                                        <TableCell className="border-r py-2 text-xs" align="center">{idx + 1}</TableCell>
                                                        <TableCell className="border-r py-1 align-top">
                                                            <Box className="flex flex-col gap-1">
                                                                <Autocomplete
                                                                    size="small"
                                                                    fullWidth
                                                                    options={[...products, { isNew: true, productName: "Add New Item" }]}
                                                                    getOptionLabel={o => o.productName || ""}
                                                                    value={row.productId}
                                                                    onChange={(_, v) => {
                                                                        if ((v as any)?.isNew) {
                                                                            setActiveRowIdx(idx);
                                                                            setIsProductModalOpen(true);
                                                                            return;
                                                                        }
                                                                        handleItemChange(idx, "productId", v);
                                                                    }}
                                                                    renderOption={(props, option: any) => (
                                                                        <Box component="li" {...props} sx={{ px: 2, py: 1 }} className={`flex flex-col items-start ${option.isNew ? 'border-t mt-1 bg-blue-50/50' : ''}`}>
                                                                            {option.isNew ? (
                                                                                <Typography className="font-black text-blue-600 flex items-center gap-1 text-xs">
                                                                                    <FiPlus size={14} /> {option.productName}
                                                                                </Typography>
                                                                            ) : (
                                                                                <>
                                                                                    <Typography className="font-bold text-slate-800 text-xs">{option.productName}</Typography>
                                                                                    <Box className="flex items-center gap-2">
                                                                                        <Typography className="text-[10px] text-slate-400">
                                                                                            SKU: {option.sku || option.barcode || 'N/A'}
                                                                                        </Typography>
                                                                                        <Typography className="text-[10px] text-blue-500 font-medium">
                                                                                            Rate: Rs.{option.perUnitRate || 0}
                                                                                        </Typography>
                                                                                    </Box>
                                                                                </>
                                                                            )}
                                                                        </Box>
                                                                    )}
                                                                    renderInput={(params) =>
                                                                        <TextField
                                                                            {...params}
                                                                            placeholder="Type or click to select an item."
                                                                            variant="standard"
                                                                            InputProps={{
                                                                                ...params.InputProps,
                                                                                disableUnderline: true,
                                                                                sx: {
                                                                                    fontSize: '11px',
                                                                                    fontWeight: 600,
                                                                                    '& .MuiAutocomplete-endAdornment': { display: 'none' }
                                                                                }
                                                                            }}
                                                                        />
                                                                    }
                                                                    sx={{ '& .MuiAutocomplete-popupIndicator': { display: 'none' }, '& .MuiAutocomplete-clearIndicator': { display: 'none' } }}
                                                                />
                                                                {/* Integrated Description Field */}
                                                                <TextField
                                                                    fullWidth
                                                                    variant="standard"
                                                                    placeholder="Add a description for this item..."
                                                                    value={row.note}
                                                                    onChange={e => handleItemChange(idx, "note", e.target.value)}
                                                                    InputProps={{
                                                                        disableUnderline: true,
                                                                        sx: {
                                                                            fontSize: '10px',
                                                                            color: '#64748b',
                                                                            bgcolor: '#f8fafc',
                                                                            px: 1,
                                                                            py: 0.5,
                                                                            borderRadius: '4px',
                                                                            border: '1px dashed #e2e8f0',
                                                                            '&:hover': { border: '1px dashed #cbd5e1' }
                                                                        }
                                                                    }}
                                                                />
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell className="border-r py-1" align="center">
                                                            <TextField
                                                                type="number"
                                                                variant="standard"
                                                                value={row.qty}
                                                                onChange={e => {
                                                                    const newQty = Number(e.target.value);
                                                                    if (newQty >= 0) {
                                                                        handleItemChange(idx, "qty", newQty);
                                                                    }
                                                                }}
                                                                InputProps={{
                                                                    disableUnderline: true,
                                                                    sx: {
                                                                        fontSize: '11px',
                                                                        textAlign: 'center',
                                                                        '& input': { textAlign: 'center' }
                                                                    }
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="border-r py-1" align="center">
                                                            <TextField
                                                                select
                                                                variant="standard"
                                                                value={row.uom}
                                                                onChange={e => handleItemChange(idx, "uom", e.target.value)}
                                                                InputProps={{
                                                                    disableUnderline: true,
                                                                    sx: {
                                                                        fontSize: '11px',
                                                                        fontWeight: 600,
                                                                        color: '#64748b',
                                                                        '& .MuiSelect-select': {
                                                                            paddingRight: '24px !important',
                                                                            textAlign: 'left',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'flex-start',
                                                                            paddingLeft: '8px'
                                                                        },
                                                                        '& .MuiSelect-icon': {
                                                                            right: 2,
                                                                            fontSize: '18px'
                                                                        }
                                                                    }
                                                                }}
                                                                SelectProps={{
                                                                    MenuProps: {
                                                                        PaperProps: {
                                                                            sx: {
                                                                                maxHeight: 300,
                                                                                mt: 0.5,
                                                                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                                                                '& .MuiMenuItem-root': {
                                                                                    fontSize: '11px',
                                                                                    minHeight: '32px',
                                                                                    px: 2,
                                                                                    justifyContent: 'flex-start'
                                                                                }
                                                                            }
                                                                        },
                                                                        anchorOrigin: {
                                                                            vertical: 'bottom',
                                                                            horizontal: 'left'
                                                                        },
                                                                        transformOrigin: {
                                                                            vertical: 'top',
                                                                            horizontal: 'left'
                                                                        }
                                                                    }
                                                                }}
                                                            >
                                                                <MenuItem value="PKT">PKT</MenuItem>
                                                                <MenuItem value="kg">kg</MenuItem>
                                                                <MenuItem value="gm">gm</MenuItem>
                                                                <MenuItem value="ltr">ltr</MenuItem>
                                                                <MenuItem value="ml">ml</MenuItem>
                                                                <MenuItem value="pcs">pcs</MenuItem>
                                                                <MenuItem value="box">box</MenuItem>
                                                                <MenuItem value="dozen">dozen</MenuItem>
                                                                <MenuItem value="Unit">Unit</MenuItem>
                                                                <MenuItem value="bag">bag</MenuItem>
                                                                <MenuItem value="bottle">bottle</MenuItem>
                                                                <MenuItem value="can">can</MenuItem>
                                                                <MenuItem value="carton">carton</MenuItem>
                                                                <MenuItem value="case">case</MenuItem>
                                                                <MenuItem value="jar">jar</MenuItem>
                                                                <MenuItem value="pack">pack</MenuItem>
                                                                <MenuItem value="roll">roll</MenuItem>
                                                                <MenuItem value="set">set</MenuItem>
                                                                <MenuItem value="sheet">sheet</MenuItem>
                                                                <MenuItem value="ton">ton</MenuItem>
                                                            </TextField>
                                                        </TableCell>
                                                        <TableCell className="border-r py-1" align="right"><TextField type="number" variant="standard" value={row.price} onChange={e => handleItemChange(idx, "price", Number(e.target.value))} InputProps={{ disableUnderline: true, sx: { fontSize: '11px', textAlign: 'right', '& input': { textAlign: 'right' } } }} /></TableCell>
                                                        <TableCell className="border-r py-1 text-center font-bold text-slate-300" sx={{ fontSize: '11px' }}>0</TableCell>
                                                        <TableCell className="border-r py-1" align="center">
                                                            <TextField
                                                                select
                                                                variant="standard"
                                                                value={row.tax}
                                                                onChange={e => handleItemChange(idx, "tax", Number(e.target.value))}
                                                                InputProps={{
                                                                    disableUnderline: true,
                                                                    sx: {
                                                                        fontSize: '11px',
                                                                        fontWeight: 600,
                                                                        color: '#64748b',
                                                                        '& .MuiSelect-select': {
                                                                            paddingRight: '24px !important',
                                                                            textAlign: 'left',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'flex-start',
                                                                            paddingLeft: '8px'
                                                                        },
                                                                        '& .MuiSelect-icon': {
                                                                            right: 2,
                                                                            fontSize: '18px'
                                                                        }
                                                                    }
                                                                }}
                                                                SelectProps={{
                                                                    MenuProps: {
                                                                        PaperProps: {
                                                                            sx: {
                                                                                maxHeight: 350,
                                                                                mt: 0.5,
                                                                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                                                                '& .MuiMenuItem-root': {
                                                                                    fontSize: '11px',
                                                                                    minHeight: '32px',
                                                                                    px: 2,
                                                                                    justifyContent: 'flex-start'
                                                                                }
                                                                            }
                                                                        },
                                                                        anchorOrigin: {
                                                                            vertical: 'bottom',
                                                                            horizontal: 'left'
                                                                        },
                                                                        transformOrigin: {
                                                                            vertical: 'top',
                                                                            horizontal: 'left'
                                                                        }
                                                                    }
                                                                }}
                                                            >
                                                                <MenuItem value="">--</MenuItem>
                                                                <MenuItem value={0}>0 + 0</MenuItem>
                                                                <MenuItem value={0.1}>0.05 + 0.05</MenuItem>
                                                                <MenuItem value={0.25}>0.125 + 0.125</MenuItem>
                                                                <MenuItem value={0.5}>0.25 + 0.25</MenuItem>
                                                                <MenuItem value={1}>0.5 + 0.5</MenuItem>
                                                                <MenuItem value={1.5}>0.75 + 0.75</MenuItem>
                                                                <MenuItem value={3}>1.5 + 1.5</MenuItem>
                                                                <MenuItem value={5}>2.5 + 2.5</MenuItem>
                                                                <MenuItem value={6}>3 + 3</MenuItem>
                                                                <MenuItem value={7.5}>3.75 + 3.75</MenuItem>
                                                                <MenuItem value={12}>6 + 6</MenuItem>
                                                                <MenuItem value={18}>9 + 9</MenuItem>
                                                                <MenuItem value={28}>14 + 14</MenuItem>
                                                                <MenuItem value={40}>20 + 20</MenuItem>
                                                            </TextField>
                                                        </TableCell>
                                                        <TableCell className="py-1 text-right font-black text-slate-700" sx={{ fontSize: '11px' }}>{row.total.toFixed(2)}</TableCell>
                                                        <TableCell align="center"><IconButton size="small" onClick={() => setItems(items.filter((_, i) => i !== idx))}><FiTrash2 size={12} className="text-slate-300" /></IconButton></TableCell>
                                                    </TableRow>
                                                </React.Fragment>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <Box className="bg-[#fffde7] px-4 py-2 border-t flex justify-end gap-16 font-black text-slate-600 uppercase" sx={{ fontSize: '10px' }}>
                                    <Typography sx={{ fontSize: '10px' }}>Total Inv. Val</Typography>
                                    <Box className="flex gap-14">
                                        <Typography sx={{ fontSize: '10px' }}>0</Typography>
                                        <Typography sx={{ fontSize: '10px' }}>0</Typography>
                                        <Typography sx={{ fontSize: '10px' }}>0</Typography>
                                        <Typography sx={{ fontSize: '10px' }}>0</Typography>
                                        <Typography sx={{ fontSize: '10px' }}>0</Typography>
                                        <Typography sx={{ fontSize: '10px', color: '#101828' }}>{totals.total.toFixed(2)}</Typography>
                                    </Box>
                                    <Box sx={{ width: 10 }} />
                                </Box>
                                {/* Add New Row Button */}
                                <Box className="p-3 bg-white border-t flex justify-start">
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<FiPlus />}
                                        onClick={handleAddItem}
                                        className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs font-bold normal-case"
                                    >
                                        Add New Row
                                    </Button>
                                </Box>
                            </Paper>
                        </Box>
                    </Box>

                    <Box className="px-6 py-4 bg-white border-t flex justify-start gap-2">
                        <Button
                            variant="outlined"
                            onClick={onClose}
                            sx={{
                                color: '#2563eb',
                                borderColor: '#2563eb',
                                textTransform: 'uppercase',
                                fontSize: '11px',
                                fontWeight: 700,
                                px: 3,
                                '&:hover': { borderColor: '#1d4ed8', bgcolor: '#eff6ff' }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            sx={{
                                bgcolor: '#2563eb',
                                color: '#fff',
                                textTransform: 'uppercase',
                                fontSize: '11px',
                                fontWeight: 700,
                                px: 3,
                                boxShadow: 'none',
                                '&:hover': { bgcolor: '#1d4ed8', boxShadow: 'none' }
                            }}
                        >
                            Save
                        </Button>
                    </Box>
                </Box>
            </Drawer>

            {/* Quick Add Product Modal */}
            <Drawer
                anchor="right"
                open={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                PaperProps={{ sx: { width: '60vw', maxWidth: '800px' } }}
            >
                <Box className="h-full">
                    <ProductDrawerForm
                        open={isProductModalOpen}
                        onClose={() => setIsProductModalOpen(false)}
                        isEdit={false}
                        initialData={{}}
                        categories={categories}
                        vendors={vendors}
                        companies={companies}
                        productNames={products.map(p => p.productName)}
                        onSave={async (data) => {
                            try {
                                const newProduct = await dispatch(addProduct(data)).unwrap();
                                toast.success("New product added!");
                                dispatch(getProducts({ page: 1, limit: 1000 }));

                                if (activeRowIdx !== null) {
                                    handleItemChange(activeRowIdx, "productId", newProduct);
                                }
                                setIsProductModalOpen(false);
                            } catch (err: any) {
                                toast.error(err.message || "Failed to add product");
                            }
                        }}
                        onAddCategory={() => { }}
                        onAddVendor={() => { }}
                        onAddBrand={() => { }}
                        onFillFromSearch={() => { }}
                    />
                </Box>
            </Drawer>
            <VendorDialogForm
                open={isVendorDialogOpen}
                onClose={() => setIsVendorDialogOpen(false)}
                onSave={async (data) => {
                    try {
                        const newVendor = await dispatch(addVendor(data)).unwrap();
                        toast.success("New vendor added successfully!");
                        dispatch(getVendorNameList());
                        setSelectedVendor(newVendor);
                        if (newVendor._id) {
                            fetchVendorData(newVendor._id);
                        }
                        setIsVendorDialogOpen(false);
                    } catch (err: any) {
                        toast.error(err.message || "Failed to add vendor");
                    }
                }}
            />
        </>
    );
};
