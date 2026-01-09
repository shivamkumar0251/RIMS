
import {
    Dialog,
    DialogTitle,
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
                    borderRadius: 3,
                    p: 1,
                },
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Box>
                    <Typography variant="h6" className="font-bold text-gray-800">
                        Create Order
                    </Typography>
                    <Typography variant="body2" className="text-gray-500">
                        Choose an action for {productCount} items
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <FiX />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ py: 3 }}>
                <Box className="flex flex-col gap-4">
                    {/* WhatsApp Option */}
                    <Box className="w-full">
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={onSendWhatsapp}
                            startIcon={<FaWhatsapp className="text-2xl" />}
                            className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl capitalize text-lg shadow-sm"
                            sx={{ justifyContent: "flex-start", px: 4 }}
                        >
                            <Box className="text-left ml-2">
                                <Typography className="font-bold line-clamp-1">Send via WhatsApp</Typography>
                                <Typography variant="caption" className="opacity-90">
                                    Save to DB & Open WhatsApp
                                </Typography>
                            </Box>
                        </Button>
                    </Box>

                    <Box className="w-full">
                        <Typography variant="subtitle2" className="text-gray-400 text-center my-1 uppercase text-xs font-bold tracking-wider">
                            OR Download As
                        </Typography>
                    </Box>

                    {/* Download Options */}
                    <Box className="grid grid-cols-3 gap-3">
                        {/* PDF Option */}
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={onDownloadPDF}
                            className="flex flex-col gap-2 py-4 border-gray-200 hover:border-red-500 hover:bg-red-50 rounded-xl"
                            sx={{ height: '100%' }}
                        >
                            <FaFilePdf className="text-3xl text-red-500" />
                            <Typography variant="caption" className="font-bold text-gray-700">PDF</Typography>
                        </Button>

                        {/* Excel Option */}
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={onDownloadExcel}
                            className="flex flex-col gap-2 py-4 border-gray-200 hover:border-green-600 hover:bg-green-50 rounded-xl"
                            sx={{ height: '100%' }}
                        >
                            <FaFileExcel className="text-3xl text-green-600" />
                            <Typography variant="caption" className="font-bold text-gray-700">Excel</Typography>
                        </Button>

                        {/* CSV Option */}
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={onDownloadCSV}
                            className="flex flex-col gap-2 py-4 border-gray-200 hover:border-blue-500 hover:bg-blue-50 rounded-xl"
                            sx={{ height: '100%' }}
                        >
                            <FaFileCsv className="text-3xl text-blue-500" />
                            <Typography variant="caption" className="font-bold text-gray-700">CSV</Typography>
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};
