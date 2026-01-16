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
                sx: { borderRadius: '20px', p: 0, overflow: 'hidden' }
            }}
            BackdropProps={{
                sx: { backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.2)' }
            }}
        >
            <Box className="bg-white">
                <Box className="bg-blue-50 px-6 py-4 flex items-center justify-between border-b border-blue-100">
                    <Box className="flex items-center gap-3">
                        <Box className="bg-white p-2 rounded-full text-blue-600 shadow-sm border border-blue-100">
                            <FiTag size={20} />
                        </Box>
                        {/* Title is explicitly Black and Bold as requested */}
                        <Typography variant="h6" className="font-bold text-black">Add New Brand</Typography>
                    </Box>
                    <IconButton onClick={onClose} size="small" className="text-blue-400 hover:text-blue-700 hover:bg-blue-200" aria-label="close">
                        <FiX size={20} />
                    </IconButton>
                </Box>

                <DialogContent className="px-6 pb-6 pt-2">
                    <Typography variant="body2" className="text-slate-500 mb-8 font-medium">
                        Enter the company or brand name associated with products.
                    </Typography>

                    <TextField
                        autoFocus
                        fullWidth
                        size="small"
                        label="Brand Name"
                        placeholder="e.g. Nestle, Amul..."
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (error) setError("");
                        }}
                        error={Boolean(error)}
                        helperText={error}
                        className="mt-8"
                        variant="outlined"
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "12px",
                                backgroundColor: "#fff",
                                "&.Mui-focused fieldset": {
                                    borderColor: "#2563eb"
                                }
                            },
                            "& .MuiInputLabel-root.Mui-focused": {
                                color: "#2563eb"
                            }
                        }}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') handleSave();
                        }}
                    />
                </DialogContent>

                <DialogActions className="p-6 pt-2 bg-slate-50 border-t border-slate-100">
                    <Button variant="outlined" onClick={onClose} className="px-6 border-gray-300 text-gray-700">
                        CANCEL
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={loading}
                        className="px-8 bg-blue-600 hover:bg-blue-700 font-bold shadow-sm"
                    >
                        {loading ? "Saving..." : "Create Brand"}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default CreateBrandModal;
