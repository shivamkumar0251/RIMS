
import {
    Dialog,
    DialogContent,
    Button,
    Typography,
    Box,
    IconButton,
} from "@mui/material";
import { FaFileCsv, FaFileExcel, FaFilePdf, FaWhatsapp } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import type { JSX } from "react";

interface CreateOrderModalProps {
    open: boolean;
    onClose: () => void;
    onDownloadExcel: () => void;
    onDownloadCSV: () => void;
    onDownloadPDF: () => void;
    onSendWhatsapp: () => void;
    productCount: number;
}

export const CreateOrderModal = ({
    open,
    onClose,
    onDownloadExcel,
    onDownloadCSV,
    onDownloadPDF,
    onSendWhatsapp,
    productCount,
}: CreateOrderModalProps): JSX.Element => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: '12px',
                    p: 0,
                    overflow: 'hidden',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
                },
            }}
            BackdropProps={{
                sx: { backdropFilter: 'blur(4px)', backgroundColor: 'rgba(15, 23, 42, 0.4)' }
            }}
        >
            <Box className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
                <Box>
                    <Typography variant="h6" className="font-bold text-gray-900 leading-tight">
                        Create Order
                    </Typography>
                    <Typography variant="caption" className="text-gray-500 font-medium">
                        Process {productCount} items in your inventory
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small" className="text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                    <FiX size={20} />
                </IconButton>
            </Box>

            <DialogContent className="px-6 py-8">
                <Box className="flex flex-col gap-6">
                    {/* WhatsApp Option */}
                    <Box>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={onSendWhatsapp}
                            startIcon={<FaWhatsapp className="text-2xl" />}
                            className="bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl capitalize shadow-none transition-all hover:scale-[1.01]"
                            sx={{ justifyContent: "center", px: 4 }}
                            disableElevation
                        >
                            <Box className="text-left ml-2">
                                <Typography className="font-bold text-lg">Send via WhatsApp</Typography>
                                <Typography variant="caption" className="opacity-90 block">
                                    Save order details & notify on WhatsApp
                                </Typography>
                            </Box>
                        </Button>
                    </Box>

                    <Box className="flex items-center gap-4 px-2">
                        <Box className="h-px bg-gray-100 flex-1" />
                        <Typography variant="caption" className="text-gray-400 font-bold tracking-widest uppercase">
                            OR DOWNLOAD AS
                        </Typography>
                        <Box className="h-px bg-gray-100 flex-1" />
                    </Box>

                    {/* Download Options */}
                    <Box className="grid grid-cols-3 gap-4">
                        {/* PDF Option */}
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={onDownloadPDF}
                            className="flex flex-col gap-3 py-6 border-gray-100 hover:border-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                            <FaFilePdf className="text-3xl text-red-500" />
                            <Typography className="font-bold text-gray-700 text-sm">PDF</Typography>
                        </Button>

                        {/* Excel Option */}
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={onDownloadExcel}
                            className="flex flex-col gap-3 py-6 border-gray-100 hover:border-green-600 hover:bg-green-50 rounded-xl transition-all"
                        >
                            <FaFileExcel className="text-3xl text-green-600" />
                            <Typography className="font-bold text-gray-700 text-sm">Excel</Typography>
                        </Button>

                        {/* CSV Option */}
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={onDownloadCSV}
                            className="flex flex-col gap-3 py-6 border-gray-100 hover:border-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                        >
                            <FaFileCsv className="text-3xl text-blue-500" />
                            <Typography className="font-bold text-gray-700 text-sm">CSV</Typography>
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};
