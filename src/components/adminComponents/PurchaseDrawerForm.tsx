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
    Divider,
} from "@mui/material";
import dayjs from "dayjs";
import { FiX, FiPlus, FiTrash2, FiSearch, FiSettings } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";
import { getProducts, selectProducts } from "../../redux/slices/productSlice";
import { getVendorNameList, selectVendorNames, getVendorById, type GetVendorData } from "../../redux/slices/vendorSlice";
import { toast } from "react-hot-toast";

interface PurchaseDrawerFormProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    initialData?: any;
    isEdit?: boolean;
}

interface ItemRow {
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
        { productId: null, productName: "", barcode: "", hsn: "", qty: 1, uom: "PKT", price: 0, discount: 0, tax: 0, cess: 0, total: 0, note: "" }
    ]);

    const [discountType, setDiscountType] = useState<"Rs" | "%">("%");
    const [discountValue, setDiscountValue] = useState(0);

    // --- Effects ---
    useEffect(() => {
        if (open) {
            dispatch(getProducts({ page: 1, limit: 1000 }));
            dispatch(getVendorNameList());

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

                const v = vendors.find(v => v._id === (initialData.vendorId?._id || initialData.vendorId));
                if (v) {
                    setSelectedVendor(v);
                    fetchVendorData(v._id);
                }

                if (initialData.products) {
                    setItems(initialData.products.map((p: any) => ({
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
                setItems([{ productId: null, productName: "", barcode: "", hsn: "", qty: 1, uom: "PKT", price: 0, discount: 0, tax: 0, cess: 0, total: 0, note: "" }]);
            }
        }
    }, [open, initialData, vendors]);

    const fetchVendorData = async (vendorId: string) => {
        try {
            const data = await dispatch(getVendorById(vendorId)).unwrap();
            setVendorDetails(data);
        } catch (err) {
            toast.error("Failed to load vendor details");
        }
    };

    const handleAddItem = () => {
        setItems([...items, { productId: null, productName: "", barcode: "", hsn: "", qty: 1, uom: "Unit", price: 0, discount: 0, tax: 0, cess: 0, total: 0, note: "" }]);
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
        item.total = item.qty * item.price;
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
                                        <Button size="small" variant="contained" className="bg-[#00c2a8] text-[10px] py-0.5 px-3 normal-case rounded-md">+ Add Vendor</Button>
                                    </Box>
                                    <Box className="space-y-3">
                                        {[
                                            {
                                                label: "M/S.*", field: (
                                                    <Box className="flex-1 flex gap-1">
                                                        <Autocomplete fullWidth size="small" options={vendors} getOptionLabel={(o) => o.vendor_name || ""} value={selectedVendor}
                                                            onChange={(_, v) => { setSelectedVendor(v); if (v) fetchVendorData(v._id); }}
                                                            renderInput={(params) => <TextField {...params} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }} />}
                                                        />
                                                        <IconButton className="bg-slate-50 border border-slate-200" size="small"><FiSearch size={14} /></IconButton>
                                                    </Box>
                                                )
                                            },
                                            { label: "Address", field: <TextField fullWidth multiline rows={2} size="small" value={vendorDetails?.vendor_address || ""} InputProps={{ readOnly: true, sx: { bgcolor: '#f8fafc', fontSize: '11px' } }} /> },
                                            { label: "Contact Person", field: <TextField fullWidth size="small" value={vendorDetails?.vendor_contactPerson_name || ""} InputProps={{ readOnly: true, sx: { bgcolor: '#f8fafc', fontSize: '11px' } }} /> },
                                            { label: "Phone No", field: <TextField fullWidth size="small" value={vendorDetails?.vendor_mobileNo || ""} InputProps={{ readOnly: true, sx: { bgcolor: '#f8fafc', fontSize: '11px' } }} /> },
                                            { label: "GSTIN / PAN", field: <TextField fullWidth size="small" value={vendorDetails?.vendor_gstNumber || ""} InputProps={{ readOnly: true, sx: { bgcolor: '#f8fafc', fontSize: '11px' } }} /> },
                                        ].map((item, i) => (
                                            <Box key={i} className="flex gap-4 items-center">
                                                <Typography className="text-[11px] font-medium text-slate-500 w-28 shrink-0">{item.label}</Typography>
                                                {item.field}
                                            </Box>
                                        ))}
                                        <Box className="flex gap-4 items-center">
                                            <Typography className="text-[11px] font-medium text-slate-500 w-28 shrink-0">Rev. Charge</Typography>
                                            <Select fullWidth size="small" value={revCharge} onChange={(e) => setRevCharge(e.target.value)} sx={{ fontSize: '11px', bgcolor: 'white' }}>
                                                <MenuItem value="No">No</MenuItem><MenuItem value="Yes">Yes</MenuItem>
                                            </Select>
                                        </Box>
                                        <Box className="flex justify-end"><Button className="text-[#00c2a8] text-[10px] normal-case font-bold">+ Add New Shipping</Button></Box>
                                        <Box className="flex gap-4 items-center">
                                            <Typography className="text-[11px] font-medium text-slate-500 w-28 shrink-0">Ship To</Typography>
                                            <Select fullWidth size="small" value={shipTo} onChange={(e) => setShipTo(e.target.value)} sx={{ fontSize: '11px', bgcolor: 'white' }}>
                                                <MenuItem value="Same as Billing Address">Same as Billing Address</MenuItem>
                                            </Select>
                                        </Box>
                                        <Box className="flex gap-4 items-center">
                                            <Typography className="text-[11px] font-medium text-slate-500 w-28 shrink-0">Place of Supply*</Typography>
                                            <TextField fullWidth size="small" value={placeOfSupply} onChange={(e) => setPlaceOfSupply(e.target.value)} InputProps={{ sx: { fontSize: '11px', bgcolor: 'white' } }} />
                                        </Box>
                                    </Box>
                                </Paper>
                            </Box>

                            {/* Purchase Invoice Detail Box */}
                            <Box className="col-span-12 lg:col-span-7">
                                <Paper className="p-5 rounded-xl border border-slate-200 h-full relative">
                                    <IconButton className="absolute top-3 right-3 text-slate-300 hover:text-rose-500" size="small"><FiTrash2 size={16} /></IconButton>
                                    <Typography className="text-xs font-black text-slate-400 uppercase tracking-wider mb-5">Purchase Invoice Detail</Typography>
                                    <Box className="grid grid-cols-12 gap-x-6 gap-y-4">
                                        <Box className="col-span-12 md:col-span-6 flex items-center gap-3">
                                            <Typography className="text-[11px] font-medium text-slate-500 w-24">Invoice Type</Typography>
                                            <Select fullWidth size="small" value={invoiceType} onChange={(e) => setInvoiceType(e.target.value)} sx={{ fontSize: '11px', bgcolor: 'white' }}>
                                                <MenuItem value="Regular">Regular</MenuItem>
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
                            <Box className="p-3 bg-white flex justify-between items-center border-b">
                                <Box className="flex gap-2">
                                    <Button variant="contained" size="small" className="bg-[#00c2a8] text-[10px] normal-case" onClick={handleAddItem}>+ Add Product</Button>
                                    <Button variant="contained" size="small" className="bg-[#00c2a8] text-[10px] normal-case">+ Add Additional Charges</Button>
                                </Box>
                                <Box className="flex items-center gap-3">
                                    <Typography className="text-[11px] font-bold text-slate-500">Discount :</Typography>
                                    <Box className="flex border rounded-md overflow-hidden h-7">
                                        <TextField size="small" value={discountValue} onChange={e => setDiscountValue(Number(e.target.value))} variant="standard" InputProps={{ disableUnderline: true, sx: { width: 50, px: 1, fontSize: '11px' } }} />
                                        <Box className="flex bg-slate-100 border-l">
                                            <Box onClick={() => setDiscountType("Rs")} className={`px-2 flex items-center text-[10px] cursor-pointer ${discountType === "Rs" ? "bg-[#00c2a8] text-white" : "text-slate-400"}`}>Rs</Box>
                                            <Box onClick={() => setDiscountType("%")} className={`px-2 flex items-center text-[10px] cursor-pointer ${discountType === "%" ? "bg-[#00c2a8] text-white" : "text-slate-400"}`}>%</Box>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead className="bg-slate-50/50">
                                        <TableRow>
                                            <TableCell className="text-[10px] font-black py-2 border-r" width={30} align="center">SR.</TableCell>
                                            <TableCell className="text-[10px] font-black py-2 border-r">PRODUCT / OTHER CHARGES</TableCell>
                                            <TableCell className="text-[10px] font-black py-2 border-r" width={100}>BARCODE NO.</TableCell>
                                            <TableCell className="text-[10px] font-black py-2 border-r" width={100}>HSN/SAC CODE</TableCell>
                                            <TableCell className="text-[10px] font-black py-2 border-r text-center" width={50}>QTY.</TableCell>
                                            <TableCell className="text-[10px] font-black py-2 border-r text-center" width={50}>UOM</TableCell>
                                            <TableCell className="text-[10px] font-black py-2 border-r text-right" width={80}>PRICE (RS)</TableCell>
                                            <TableCell className="text-[10px] font-black py-2 border-r text-center" width={70}>DISCOUNT</TableCell>
                                            <TableCell className="text-[10px] font-black py-2 border-r text-center" width={100}>CGST + SGST</TableCell>
                                            <TableCell className="text-[10px] font-black py-2 border-r text-center" width={60}>CESS</TableCell>
                                            <TableCell className="text-[10px] font-black py-2 text-right" width={100}>TOTAL</TableCell>
                                            <TableCell width={30}></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {items.map((row, idx) => (
                                            <React.Fragment key={idx}>
                                                <TableRow hover>
                                                    <TableCell className="border-r py-2 text-xs" align="center">{idx + 1}</TableCell>
                                                    <TableCell className="border-r py-1">
                                                        <Autocomplete size="small" options={products} getOptionLabel={o => o.productName || ""} value={row.productId}
                                                            onChange={(_, v) => handleItemChange(idx, "productId", v)}
                                                            renderInput={(params) => <TextField {...params} placeholder="Enter Product name" variant="standard" InputProps={{ ...params.InputProps, disableUnderline: true, sx: { fontSize: '11px' } }} />}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="border-r py-1"><TextField fullWidth size="small" variant="standard" placeholder="Barcode No." value={row.barcode} InputProps={{ disableUnderline: true, sx: { fontSize: '10px', color: 'slate.400' } }} /></TableCell>
                                                    <TableCell className="border-r py-1"><TextField fullWidth size="small" variant="standard" placeholder="HSN/SAC" value={row.hsn} InputProps={{ disableUnderline: true, sx: { fontSize: '10px', color: 'slate.400' } }} /></TableCell>
                                                    <TableCell className="border-r py-1" align="center"><TextField type="number" variant="standard" value={row.qty} onChange={e => handleItemChange(idx, "qty", Number(e.target.value))} InputProps={{ disableUnderline: true, sx: { fontSize: '11px', textAlign: 'center', '& input': { textAlign: 'center' } } }} /></TableCell>
                                                    <TableCell className="border-r py-1 bg-slate-50/30 font-bold text-[#64748b]" align="center"><Typography sx={{ fontSize: '10px' }}>{row.uom}</Typography></TableCell>
                                                    <TableCell className="border-r py-1" align="right"><TextField type="number" variant="standard" value={row.price} onChange={e => handleItemChange(idx, "price", Number(e.target.value))} InputProps={{ disableUnderline: true, sx: { fontSize: '11px', textAlign: 'right', '& input': { textAlign: 'right' } } }} /></TableCell>
                                                    <TableCell className="border-r py-1 text-center font-bold text-slate-300" sx={{ fontSize: '11px' }}>0</TableCell>
                                                    <TableCell className="border-r py-1 text-center font-bold text-slate-300" sx={{ fontSize: '11px' }}>0 + 0</TableCell>
                                                    <TableCell className="border-r py-1 text-center font-bold text-slate-300" sx={{ fontSize: '11px' }}>0</TableCell>
                                                    <TableCell className="py-1 text-right font-black text-slate-700" sx={{ fontSize: '11px' }}>{row.total.toFixed(2)}</TableCell>
                                                    <TableCell align="center"><IconButton size="small" onClick={() => setItems(items.filter((_, i) => i !== idx))}><FiTrash2 size={12} className="text-slate-300" /></IconButton></TableCell>
                                                </TableRow>
                                                <TableRow sx={{ bgcolor: '#fffde750' }}>
                                                    <TableCell className="border-r py-0.5" />
                                                    <TableCell colSpan={10} className="py-0.5">
                                                        <TextField fullWidth variant="standard" placeholder="Item Note..." value={row.note} onChange={e => handleItemChange(idx, "note", e.target.value)} InputProps={{ disableUnderline: true, sx: { fontSize: '10px', color: 'slate.500', px: 1 } }} />
                                                    </TableCell>
                                                    <TableCell className="py-0.5" />
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
                        </Paper>
                    </Box>
                </Box>

                <Box className="px-6 py-3 bg-white border-t flex gap-2">
                    <Button variant="contained" className="bg-[#2463eb] text-xs font-bold px-5 py-1.5 normal-case rounded shadow-none" onClick={handleSave}>Save</Button>
                    <Button variant="contained" className="bg-white text-slate-600 border border-slate-200 text-xs font-bold px-5 py-1.5 normal-case rounded shadow-none">Save and Send</Button>
                    <Button variant="contained" className="bg-white text-slate-600 border border-slate-200 text-xs font-bold px-5 py-1.5 normal-case rounded shadow-none" onClick={onClose}>Cancel</Button>
                </Box>
            </Box>
        </Drawer>
    );
};
