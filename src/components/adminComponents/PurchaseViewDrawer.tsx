import React, { useMemo } from 'react';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    useTheme,
    useMediaQuery,
    Checkbox,
    FormControlLabel,
    FormGroup
} from '@mui/material';
import { FiX, FiDownload, FiExternalLink, FiPrinter, FiMail, FiCopy } from 'react-icons/fi';
import { FaWhatsapp, FaFileExcel } from 'react-icons/fa';
import dayjs from 'dayjs';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// Simple Number to Words Utility
const numberToWords = (num: number): string => {
    const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    const inWords = (n: number): string => {
        if ((n = n.toString() as any).length > 9) return 'overflow';
        let nStr: any = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!nStr) return '';
        let str = '';
        str += (Number(nStr[1]) !== 0) ? (a[Number(nStr[1])] || b[nStr[1][0]] + ' ' + a[nStr[1][1]]) + 'crore ' : '';
        str += (Number(nStr[2]) !== 0) ? (a[Number(nStr[2])] || b[nStr[2][0]] + ' ' + a[nStr[2][1]]) + 'lakh ' : '';
        str += (Number(nStr[3]) !== 0) ? (a[Number(nStr[3])] || b[nStr[3][0]] + ' ' + a[nStr[3][1]]) + 'thousand ' : '';
        str += (Number(nStr[4]) !== 0) ? (a[Number(nStr[4])] || b[nStr[4][0]] + ' ' + a[nStr[4][1]]) + 'hundred ' : '';
        str += (Number(nStr[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(nStr[5])] || b[nStr[5][0]] + ' ' + a[nStr[5][1]]) : '';
        return str;
    };
    
    return inWords(Math.floor(num));
};

interface PurchaseViewDrawerProps {
    open: boolean;
    onClose: () => void;
    order: any;
}

export const PurchaseViewDrawer: React.FC<PurchaseViewDrawerProps> = ({ open, onClose, order }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    // Checkbox State for Invoice Type
    const [copyType, setCopyType] = React.useState({
        original: true,
        duplicate: false,
        transport: false,
        office: false
    });

    const handleCopyTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCopyType({
            ...copyType,
            [event.target.name]: event.target.checked,
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const handleCopyLink = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        // Could add toast here
    };

    const handleShare = (platform: string) => {
        const text = `Invoice ${order?.orderNumber} from RIMS Restaurant`;
        const url = window.location.href;
        
        if (platform === 'whatsapp') {
            window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        } else if (platform === 'email') {
            window.open(`mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`, '_self');
        }
    };

    const handleExcelExport = async () => {
        if (!invoiceData) return;

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Purchase Invoice');

        // Set Column Widths
        sheet.columns = [
            { width: 5 },  // A - Sr
            { width: 25 }, // B - Name
            { width: 10 }, // C - HSN
            { width: 10 }, // D - Qty
            { width: 10 }, // E - Rate
            { width: 12 }, // F - Taxable Values
            { width: 8 },  // G - CGST %
            { width: 10 }, // H - CGST Amt
            { width: 8 },  // I - SGST %
            { width: 10 }, // J - SGST Amt
            { width: 15 }, // K - Total
        ];

        // Styles
        const borderStyle: Partial<ExcelJS.Borders> = {
            top: { style: 'thin', color: { argb: 'FF3B82F6' } }, // Blue border
            left: { style: 'thin', color: { argb: 'FF3B82F6' } },
            bottom: { style: 'thin', color: { argb: 'FF3B82F6' } },
            right: { style: 'thin', color: { argb: 'FF3B82F6' } }
        };
        const fontBold = { name: 'Arial', bold: true, size: 10 };
        const fontNormal = { name: 'Arial', size: 10 };
        const alignCenter: Partial<ExcelJS.Alignment> = { vertical: 'middle', horizontal: 'center' };
        const alignLeft: Partial<ExcelJS.Alignment> = { vertical: 'middle', horizontal: 'left' };
        const alignRight: Partial<ExcelJS.Alignment> = { vertical: 'middle', horizontal: 'right' };

        // 1. Header (Company Info) - Add Logo
        // Fetch Image
        try {
            const response = await fetch('/logo.png');
            const buffer = await response.arrayBuffer();
            const logoId = workbook.addImage({
                buffer: buffer,
                extension: 'png',
            });
            sheet.addImage(logoId, {
                tl: { col: 0, row: 0 }, // Top-left corner (A1)
                ext: { width: 80, height: 80 } // Adjust width/height as needed
            });
        } catch (error) {
            console.error("Error loading logo for Excel:", error);
        }

        sheet.mergeCells('A1:K1'); // Keep merge but text might overlap image if not careful. 
        // For Excel, maybe put text next to logo or below.
        // Let's adjust text position to start from center or leave space.
        // Actually, merging A1:K1 puts text in center. Logo at A1 (top left) should be fine if text is centered or pushed.
        // Let's keep text centered but ensure row height.
        sheet.getRow(1).height = 80; // Make first row taller for logo

        sheet.getCell('A1').value = 'RIMS RESTAURANT';
        sheet.getCell('A1').font = { name: 'Arial', bold: true, size: 20 };
        sheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

        sheet.mergeCells('A2:K2');
        sheet.getCell('A2').value = '123 Business Avenue, Food Plaza, Sector 45, Gurugram, India';
        sheet.getCell('A2').alignment = alignCenter;

        sheet.mergeCells('A3:K3');
        sheet.getCell('A3').value = 'GSTIN: 07AAPFH1234A1Z5 | License: FSSAI-1234567890';
        sheet.getCell('A3').alignment = alignCenter;

        sheet.addRow([]);

        // 2. Invoice Details Header (Blue Bar)
        sheet.mergeCells('A5:K5');
        const headerRow = sheet.getCell('A5');
        headerRow.value = 'PURCHASE INVOICE';
        headerRow.font = { name: 'Arial', bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } };
        headerRow.alignment = alignCenter;

        // 3. Vendor & Invoice Info Grid
        // Row 6: Vendor Name and Invoice No
        sheet.mergeCells('A6:E6');
        sheet.getCell('A6').value = `M/S: ${invoiceData.vendor.vendor_name || 'N/A'}`;
        sheet.getCell('A6').font = fontBold;
        sheet.getCell('A6').border = borderStyle;

        sheet.mergeCells('F6:K6');
        sheet.getCell('F6').value = `Invoice No: ${invoiceData.invoiceNo}`;
        sheet.getCell('F6').font = fontBold;
        sheet.getCell('F6').border = borderStyle;

        // Row 7: Address and Date
        sheet.mergeCells('A7:E7');
        sheet.getCell('A7').value = `Address: ${invoiceData.vendor.vendor_address || 'N/A'}`;
        sheet.getCell('A7').border = borderStyle;

        sheet.mergeCells('F7:K7');
        sheet.getCell('F7').value = `Invoice Date: ${invoiceData.invoiceDate}`;
        sheet.getCell('F7').font = fontBold;
        sheet.getCell('F7').border = borderStyle;

        // Row 8: GSTIN and Reverse Charge
        sheet.mergeCells('A8:E8');
        sheet.getCell('A8').value = `GSTIN: ${invoiceData.vendor.vendor_gstNumber || 'N/A'}`;
        sheet.getCell('A8').border = borderStyle;

        sheet.mergeCells('F8:K8');
        sheet.getCell('F8').value = `Reverse Charge: ${invoiceData.reverseCharge}`;
        sheet.getCell('F8').border = borderStyle;

        sheet.addRow([]);

        // 4. Items Table Header
        const tableHeaderRow = sheet.addRow(['Sr.', 'Product Name', 'HSN', 'Qty', 'Rate', 'Taxable', 'CGST %', 'CGST Amt', 'SGST %', 'SGST Amt', 'Total']);
        tableHeaderRow.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
        tableHeaderRow.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } };
            cell.alignment = alignCenter;
            cell.border = borderStyle;
        });

        // 5. Items Data
        invoiceData.items.forEach((item: any) => {
            const row = sheet.addRow([
                item.srNo,
                item.name,
                item.hsn,
                `${item.qty} ${item.uom}`,
                item.rate,
                item.taxableValue,
                item.cgstPct,
                item.cgstAmt,
                item.sgstPct,
                item.sgstAmt,
                item.total
            ]);
            
            row.eachCell((cell, colNumber) => {
                cell.border = borderStyle;
                cell.font = fontNormal;
                if (colNumber === 2) cell.alignment = alignLeft;
                else if (colNumber > 4) cell.alignment = alignRight;
                else cell.alignment = alignCenter;
            });
        });

        // 6. Totals
        sheet.addRow([]);
        
        const totalRowIdx = sheet.lastRow!.number + 1;
        
        // Total Amount in Words
        sheet.mergeCells(`A${totalRowIdx}:E${totalRowIdx + 3}`);
        const wordsCell = sheet.getCell(`A${totalRowIdx}`);
        wordsCell.value = `Amount in Words:\n${invoiceData.amountInWords}`;
        wordsCell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
        wordsCell.border = borderStyle;
        wordsCell.font = { name: 'Arial', bold: true, italic: true, size: 10 };

        // Detail Totals
        const addTotalRow = (label: string, value: any) => {
            const r = sheet.addRow(['', '', '', '', '', label, '', '', '', '', value]);
            r.getCell(6).font = fontBold;
            r.getCell(11).font = fontBold;
            r.getCell(11).alignment = alignRight;
            // Merge label cells F-J
            sheet.mergeCells(`F${r.number}:J${r.number}`);
            // Apply borders to the relevant cells
            sheet.getCell(`F${r.number}`).border = borderStyle;
            sheet.getCell(`K${r.number}`).border = borderStyle;
        };

        addTotalRow('Sub Total', invoiceData.subTotal);
        addTotalRow('Total Tax', invoiceData.totalTax);
        addTotalRow('Grand Total', invoiceData.totalAmount);

        // Highlight Grand Total
        const lastRowNum = sheet.lastRow!.number;
        const grandTotalLabel = sheet.getCell(`F${lastRowNum}`);
        const grandTotalVal = sheet.getCell(`K${lastRowNum}`);
        grandTotalLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } }; // Light blue
        grandTotalVal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };

        // Save File
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `Purchase_Invoice_${invoiceData.invoiceNo}.xlsx`);
    };

    const invoiceData = useMemo(() => {
        if (!order) return null;

        const products = order.products || [];
        let subTotal = 0;
        let totalVal = 0;
        let totalTax = 0;

        const items = products.map((p: any, index: number) => {
            const qty = p.orderQty || 0;
            const rate = p.rate || p.price || p.productId?.perUnitRate || 0;
            const discount = p.discount || 0;
            const baseAmount = (qty * rate) - discount;
            
            // Tax Calculation
            const gstPct = p.gstPct || p.productId?.gstPct || 0;
            const taxAmount = (baseAmount * gstPct) / 100;
            const cgstPct = gstPct / 2;
            const sgstPct = gstPct / 2;
            const cgstAmt = taxAmount / 2;
            const sgstAmt = taxAmount / 2;
            const total = baseAmount + taxAmount;

            subTotal += baseAmount;
            totalTax += taxAmount;
            totalVal += total;

            return {
                srNo: index + 1,
                name: p.productId?.productName || 'Unknown Product',
                hsn: p.productId?.hsnCode || '-',
                qty,
                uom: p.productId?.unit || 'Unit',
                rate,
                discount,
                taxableValue: baseAmount,
                cgstPct,
                cgstAmt,
                sgstPct,
                sgstAmt,
                total
            };
        });

        // Use order total if available (for small variances), else calculated
        const finalTotal = order.totalAmount || totalVal;

        return {
            vendor: order.products?.[0]?.productId?.vendorsId || {},
            invoiceNo: order.orderNumber || '-',
            // Try to find invoice specific fields or fallback to order fields
            invoiceDate: order.orderDate ? dayjs(order.orderDate).format('DD-MM-YYYY') : '-',
            reverseCharge: order.revCharge || 'No',
            items,
            subTotal,
            totalTax,
            totalAmount: finalTotal,
            amountInWords: numberToWords(finalTotal).toUpperCase() + ' ONLY'
        };
    }, [order]);

    if (!order || !invoiceData) return null;

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { width: isMobile ? '100vw' : '900px', bgcolor: '#f1f5f9' }
            }}
        >
            <Box className="flex flex-col h-full">
                {/* Header */}
                <Box className="bg-white border-b px-6 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                    <Typography className="font-bold text-lg text-slate-800">Print / View Document</Typography>
                    <Box className="flex items-center gap-3">
                        <Button 
                            variant="contained" 
                            size="small" 
                            startIcon={<FiExternalLink />} 
                            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold normal-case rounded-md shadow-sm"
                            onClick={() => window.open(window.location.href, '_blank')}
                        >
                            New Tab
                        </Button>
                        <Button 
                            variant="contained" 
                            size="small" 
                            startIcon={<FiCopy />} 
                            className="bg-[#1976d2] hover:bg-blue-700 text-white font-bold normal-case rounded-md shadow-sm"
                            onClick={handleCopyLink}
                        >
                            Copy Link
                        </Button>
                        <IconButton onClick={onClose} size="small" className="bg-slate-100 hover:bg-slate-200 text-slate-600 ml-1">
                            <FiX />
                        </IconButton>
                    </Box>
                </Box>

                {/* Content - Invoice Replica */}
                <Box className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center">
                    <Paper 
                        elevation={3} 
                        className="bg-white p-8 max-w-[210mm] w-full min-h-[297mm] mx-auto relative text-slate-900"
                        sx={{ '@media print': { boxShadow: 'none' } }}
                    >
                        {/* 1. Header Section */}
                        <Box className="flex justify-between items-start mb-6">
                            <Box className="flex items-center gap-4">
                                {/* Logo Placeholder */}
                                {/* Logo Placeholder - Replaced with Image look-alike */}
                                <Box className="w-20 h-20 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-1 overflow-hidden">
                                    <img 
                                        src="/logo.png" 
                                        alt="Logo" 
                                        className="w-full h-full object-contain"
                                    />
                                </Box>
                                <Box>
                                    <Typography className="font-black text-2xl text-slate-900 tracking-tight">RIMS RESTAURANT</Typography>
                                    <Typography className="text-xs font-medium text-slate-500">123 Business Avenue, Food Plaza</Typography>
                                    <Typography className="text-xs font-medium text-slate-500">Sector 45, Gurugram, India</Typography>
                                    <Typography className="text-xs font-medium text-slate-500">License: FSSAI-1234567890</Typography>
                                </Box>
                            </Box>
                            <Box className="text-right">
                                <Typography className="font-bold text-sm text-slate-800">RIMS RESTAURANT</Typography>
                                <Typography className="text-xs text-slate-600">Phone: +91 98765 43210</Typography>
                                <Typography className="text-xs text-slate-600">Email: info@rims.com</Typography>
                                <Typography className="text-xs text-slate-600">Website: www.rimsrestaurant.com</Typography>
                            </Box>
                        </Box>

                        {/* 2. Main Grid Container with Blue Borders */}
                        <Box className="border border-blue-500">
                            {/* Blue Header Info Bar */}
                            <Box className="grid grid-cols-2 border-b border-blue-500">
                                <Box className="p-2 border-r border-blue-500">
                                    <Typography className="font-bold text-sm text-slate-800">GSTIN : <span className="font-medium">07AAPFH1234A1Z5</span></Typography>
                                </Box>
                                <Box className="p-2 bg-white flex justify-center items-center">
                                    <Typography className="font-black text-lg text-blue-600 uppercase tracking-wider">PURCHASE INVOICE</Typography>
                                    <span className="ml-auto text-[10px] font-bold text-slate-400">ORIGINAL FOR RECIPIENT</span>
                                </Box>
                            </Box>

                            {/* Details Grid */}
                            <Box className="grid grid-cols-2 border-b border-blue-500 text-xs">
                                {/* Vendor Details (Left) */}
                                <Box className="p-0 border-r border-blue-500">
                                    <Box className="bg-slate-50 border-b border-blue-200 px-2 py-1 font-bold text-slate-700 text-center">Vendor Detail</Box>
                                    <Box className="p-3 space-y-1">
                                        <Box className="flex">
                                            <span className="font-bold w-20">M/S:</span>
                                            <span className="uppercase font-semibold">{invoiceData.vendor.vendor_name || 'N/A'}</span>
                                        </Box>
                                        <Box className="flex">
                                            <span className="font-bold w-20">Address:</span>
                                            <span>{invoiceData.vendor.vendor_address || 'N/A'}</span>
                                        </Box>
                                        <Box className="flex">
                                            <span className="font-bold w-20">Phone:</span>
                                            <span>{invoiceData.vendor.vendor_mobileNo || 'N/A'}</span>
                                        </Box>
                                        <Box className="flex">
                                            <span className="font-bold w-20">GSTIN:</span>
                                            <span>{invoiceData.vendor.vendor_gstNumber || 'N/A'}</span>
                                        </Box>
                                        <Box className="flex">
                                            <span className="font-bold w-20">State:</span>
                                            <span>{invoiceData.vendor.vendor_state || invoiceData.vendor.vendor_country || 'N/A'}</span>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Invoice Details (Right) */}
                                <Box className="p-0">
                                    <Box className="grid grid-cols-2 h-full">
                                        <Box className="p-3 border-r border-blue-200 space-y-2">
                                            <Box>
                                                <span className="font-bold block text-[10px] text-slate-500 uppercase">Invoice No.</span>
                                                <span className="font-bold text-sm">{invoiceData.invoiceNo}</span>
                                            </Box>
                                            <Box>
                                                <span className="font-bold block text-[10px] text-slate-500 uppercase">Reverse Charge</span>
                                                <span className="font-medium">{invoiceData.reverseCharge}</span>
                                            </Box>
                                        </Box>
                                        <Box className="p-3 space-y-2">
                                            <Box>
                                                <span className="font-bold block text-[10px] text-slate-500 uppercase">Invoice Date</span>
                                                <span className="font-bold text-sm">{invoiceData.invoiceDate}</span>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>

                            {/* 3. Items Table */}
                            <Box className="border-b border-blue-500">
                                <Table size="small" sx={{ '& .MuiTableCell-root': { borderRight: '1px solid #3b82f6', borderBottom: 'none', padding: '4px 8px', fontSize: '10px' }, '& .MuiTableCell-root:last-child': { borderRight: 'none' } }}>
                                    <TableHead>
                                        <TableRow className="bg-blue-50 border-b border-blue-500">
                                            <TableCell width="40px" className="font-bold text-center text-blue-900">Sr.</TableCell>
                                            <TableCell className="font-bold text-blue-900">Name of Product / Service</TableCell>
                                            <TableCell width="60px" className="font-bold text-center text-blue-900">HSN/SAC</TableCell>
                                            <TableCell width="60px" className="font-bold text-center text-blue-900">Qty</TableCell>
                                            <TableCell width="80px" className="font-bold text-right text-blue-900">Rate</TableCell>
                                            <TableCell width="90px" className="font-bold text-right text-blue-900">Taxable Val</TableCell>
                                            <TableCell width="80px" className="font-bold text-center text-blue-900 p-0">
                                                <Box className="border-b border-blue-300 pb-1">CGST</Box>
                                                <Box className="grid grid-cols-2 pt-1">
                                                    <span className="border-r border-blue-300">%</span>
                                                    <span>Amt</span>
                                                </Box>
                                            </TableCell>
                                            <TableCell width="80px" className="font-bold text-center text-blue-900 p-0">
                                                <Box className="border-b border-blue-300 pb-1">SGST</Box>
                                                <Box className="grid grid-cols-2 pt-1">
                                                    <span className="border-r border-blue-300">%</span>
                                                    <span>Amt</span>
                                                </Box>
                                            </TableCell>
                                            <TableCell width="90px" className="font-bold text-right text-blue-900">Total</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {invoiceData.items.map((item: any, idx: number) => (
                                            <TableRow key={idx} sx={{ height: '30px' }}>
                                                <TableCell className="text-center">{item.srNo}</TableCell>
                                                <TableCell className="font-medium text-slate-800">{item.name}</TableCell>
                                                <TableCell className="text-center">{item.hsn}</TableCell>
                                                <TableCell className="text-center font-bold">{item.qty} {item.uom}</TableCell>
                                                <TableCell className="text-right">{item.rate?.toFixed(2)}</TableCell>
                                                <TableCell className="text-right font-medium">{item.taxableValue?.toFixed(2)}</TableCell>
                                                <TableCell className="p-0">
                                                    <Box className="grid grid-cols-2 h-full items-center">
                                                        <span className="text-center border-r border-blue-200 h-full flex items-center justify-center text-[9px]">{item.cgstPct}%</span>
                                                        <span className="text-right px-1">{item.cgstAmt?.toFixed(2)}</span>
                                                    </Box>
                                                </TableCell>
                                                <TableCell className="p-0">
                                                    <Box className="grid grid-cols-2 h-full items-center">
                                                        <span className="text-center border-r border-blue-200 h-full flex items-center justify-center text-[9px]">{item.sgstPct}%</span>
                                                        <span className="text-right px-1">{item.sgstAmt?.toFixed(2)}</span>
                                                    </Box>
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-slate-900">{item.total?.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                        {/* Filler rows to maintain height if needed, OR just a min-height container for the table body */}
                                        {Array.from({ length: Math.max(0, 10 - invoiceData.items.length) }).map((_, i) => (
                                            <TableRow key={`fill-${i}`} sx={{ height: '30px' }}>
                                               <TableCell className="text-center">&nbsp;</TableCell>
                                               <TableCell>&nbsp;</TableCell>
                                               <TableCell>&nbsp;</TableCell>
                                               <TableCell>&nbsp;</TableCell>
                                               <TableCell>&nbsp;</TableCell>
                                               <TableCell>&nbsp;</TableCell>
                                               <TableCell className="p-0"><Box className="grid grid-cols-2 h-full"><span className="border-r border-blue-200"></span><span></span></Box></TableCell>
                                               <TableCell className="p-0"><Box className="grid grid-cols-2 h-full"><span className="border-r border-blue-200"></span><span></span></Box></TableCell>
                                               <TableCell>&nbsp;</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>

                            {/* 4. Totals & Signature Section */}
                            <Box className="grid grid-cols-12 min-h-[150px]">
                                {/* Left Side: Amount in Words & Terms */}
                                <Box className="col-span-8 border-r border-blue-500 flex flex-col justify-between">
                                    <Box className="border-b border-blue-500 p-2 text-xs">
                                        <Typography className="font-bold text-slate-700">Total in words</Typography>
                                        <Typography className="font-medium italic mt-1 text-slate-900">{invoiceData.amountInWords}</Typography>
                                    </Box>
                                    <Box className="p-4 flex-1">
                                        <Typography className="font-bold text-xs text-slate-700 mb-1">Terms & Condition</Typography>
                                        <ul className="list-disc list-inside text-[10px] text-slate-500 space-y-0.5">
                                            <li>Goods once sold will not be taken back.</li>
                                            <li>Interest @18% p.a. will be charged if payment is delayed.</li>
                                            <li>Subject to Gurugram Jurisdiction only.</li>
                                        </ul>
                                    </Box>
                                </Box>

                                {/* Right Side: Numeric Totals & Signature */}
                                <Box className="col-span-4 text-xs flex flex-col">
                                    <Box className="flex justify-between p-1.5 border-b border-blue-200">
                                        <span className="font-bold text-slate-600">Taxable Amount</span>
                                        <span className="font-bold">{invoiceData.subTotal.toFixed(2)}</span>
                                    </Box>
                                    <Box className="flex justify-between p-1.5 border-b border-blue-200">
                                        <span className="font-bold text-slate-600">Add: CGST</span>
                                        <span>{(invoiceData.totalTax / 2).toFixed(2)}</span>
                                    </Box>
                                    <Box className="flex justify-between p-1.5 border-b border-blue-200">
                                        <span className="font-bold text-slate-600">Add: SGST</span>
                                        <span>{(invoiceData.totalTax / 2).toFixed(2)}</span>
                                    </Box>
                                    <Box className="flex justify-between p-1.5 border-b border-blue-500 bg-blue-50">
                                        <span className="font-black text-slate-800">Total Amount After Tax</span>
                                        <span className="font-black text-slate-900">₹{invoiceData.totalAmount.toFixed(2)}</span>
                                    </Box>
                                    <Box className="p-1 text-[10px] text-right text-slate-400 italic mb-auto">
                                        (E & O.E.)
                                    </Box>
                                    
                                    <Box className="mt-8 p-2 text-center border-t border-blue-200">
                                        <Typography className="text-[9px] text-slate-500 mb-4 font-bold">Certified that the particulars given above are true and correct.</Typography>
                                        <Typography className="font-black text-xs text-slate-800 uppercase mb-4">For RIMS RESTAURANT</Typography>
                                        
                                        {/* Signature Placeholder */}
                                        {/* <img src="/signature-placeholder.png" alt="Sig" className="h-10 mx-auto" /> */}
                                        <Box className="h-8 mb-1"></Box>

                                        <Typography className="text-[10px] font-bold text-slate-600">Authorized Signatory</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                        
                        {/* Footer / Branding Line */}
                        <Box className="mt-4 text-center ">
                            <Typography className="text-[10px] text-slate-400 uppercase tracking-widest">Thank you for your business</Typography>
                        </Box>
                    </Paper>
                </Box>


            {/* Sticky Footer for Actions */}
            <Box className="bg-white border-t p-4 sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                {/* 1. Checkboxes - Centered & Responsive */}
                <Box className="flex justify-center mb-6 overflow-x-auto">
                    <FormGroup row className="gap-6 flex-nowrap min-w-max px-2">
                        <FormControlLabel 
                            control={<Checkbox checked={copyType.original} onChange={handleCopyTypeChange} name="original" 
                                sx={{ color: '#10b981', '&.Mui-checked': { color: '#10b981' } }} 
                            />} 
                            label={<span className="text-sm font-bold text-slate-700">Original</span>} 
                        />
                        <FormControlLabel 
                            control={<Checkbox checked={copyType.duplicate} onChange={handleCopyTypeChange} name="duplicate" 
                                sx={{ color: '#64748b', '&.Mui-checked': { color: '#10b981' } }} 
                            />} 
                            label={<span className="text-sm font-bold text-slate-600">Duplicate</span>} 
                        />
                        <FormControlLabel 
                            control={<Checkbox checked={copyType.transport} onChange={handleCopyTypeChange} name="transport" 
                                sx={{ color: '#64748b', '&.Mui-checked': { color: '#10b981' } }} 
                            />} 
                            label={<span className="text-sm font-bold text-slate-600">Transport</span>} 
                        />
                        <FormControlLabel 
                            control={<Checkbox checked={copyType.office} onChange={handleCopyTypeChange} name="office" 
                                sx={{ color: '#64748b', '&.Mui-checked': { color: '#10b981' } }} 
                            />} 
                            label={<span className="text-sm font-bold text-slate-600">Office</span>} 
                        />
                    </FormGroup>
                </Box>

                {/* 2. Action Buttons - Wrapped & Responsive */}
                <Box className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl mx-auto">
                    {/* Close (Left on Desktop, Top on Mobile) */}
                    <Button 
                        variant="contained" 
                        startIcon={<FiX />}
                        onClick={onClose}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold normal-case px-6 py-2 rounded-lg shadow-none"
                    >
                        Close
                    </Button>

                    {/* Actions (Right on Desktop, Stacked on Mobile) */}
                    <Box className="flex flex-wrap justify-center gap-3 w-full sm:w-auto">
                        <Button 
                            variant="contained" 
                            startIcon={<FaWhatsapp className="text-lg" />}
                            onClick={() => handleShare('whatsapp')}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold normal-case px-4 py-2 rounded-lg"
                        >
                            Whatsapp
                        </Button>
                        <Button 
                            variant="contained" 
                            startIcon={<FiMail />}
                            onClick={() => handleShare('email')}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold normal-case px-4 py-2 rounded-lg"
                        >
                            Email
                        </Button>
                        <Button 
                            variant="contained" 
                            startIcon={<FaFileExcel />}
                            onClick={handleExcelExport}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold normal-case px-4 py-2 rounded-lg"
                        >
                            Excel
                        </Button>
                        <Button 
                            variant="contained" 
                            startIcon={<FiDownload />}
                            onClick={handlePrint}
                            className="bg-amber-400 hover:bg-amber-500 text-white font-bold normal-case px-4 py-2 rounded-lg"
                        >
                            Download
                        </Button>
                        <Button 
                            variant="contained" 
                            startIcon={<FiPrinter />}
                            onClick={handlePrint}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold normal-case px-4 py-2 rounded-lg"
                        >
                            Print
                        </Button>
                    </Box>
                </Box>
            </Box>
            </Box>
    </Drawer>
    );
};
