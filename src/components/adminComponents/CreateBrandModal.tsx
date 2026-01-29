import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    IconButton
} from "@mui/material";
import { FiX, FiTag } from "react-icons/fi";

interface CreateBrandModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (name: string) => Promise<void>;
}

const CreateBrandModal: React.FC<CreateBrandModalProps> = ({ open, onClose, onSave }) => {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSave = async () => {
        if (!name.trim()) {
            setError("Brand name is required");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await onSave(name);
            setName("");
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to save brand");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            PaperProps={{
                sx: { borderRadius: '12px', p: 0, overflow: 'hidden', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }
            }}
            BackdropProps={{
                sx: { backdropFilter: 'blur(4px)', backgroundColor: 'rgba(15, 23, 42, 0.4)' }
            }}
        >
            <Box className="bg-white">
                <Box className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
                    <Box className="flex items-center gap-3">
                        <Box className="bg-blue-50 p-2 rounded-lg text-blue-600">
                            <FiTag size={20} />
                        </Box>
                        <Box>
                            <Typography variant="h6" className="font-bold text-gray-900 leading-tight">Add New Brand</Typography>
                            <Typography variant="caption" className="text-gray-500 font-medium">Enter the brand name for products</Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={onClose} size="small" className="text-gray-400 hover:text-gray-600 hover:bg-gray-100" aria-label="close">
                        <FiX size={20} />
                    </IconButton>
                </Box>

                <DialogContent className="px-6 py-6">

                    <TextField
                        autoFocus
                        fullWidth
                        label="Brand Name"
                        placeholder="e.g. Nestle, Amul..."
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (error) setError("");
                        }}
                        error={Boolean(error)}
                        helperText={error}
                        variant="outlined"
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "6px",
                                backgroundColor: "#fff",
                                "&.Mui-focused fieldset": {
                                    borderColor: "#2563eb",
                                    borderWidth: '2px'
                                }
                            }
                        }}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') handleSave();
                        }}
                    />
                </DialogContent>

                <DialogActions className="p-6 border-t border-gray-100 flex gap-3">
                    <Button variant="text" onClick={onClose} className="px-6 text-gray-500 hover:bg-gray-100 font-bold normal-case">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={loading}
                        className="px-8 bg-blue-600 hover:bg-blue-700 font-bold normal-case shadow-none"
                        disableElevation
                    >
                        {loading ? "Saving..." : "Create Brand"}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};





export default CreateBrandModal;
// jfdsa
