import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    IconButton
} from "@mui/material";
import { FiX } from "react-icons/fi";

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
                sx: { borderRadius: '16px', p: 1 }
            }}
        >
            <DialogTitle className="flex justify-between items-center bg-white border-b pb-4">
                <Typography variant="h6" className="font-bold text-slate-800">Add New Brand</Typography>
                <IconButton onClick={onClose} size="small" className="text-slate-400">
                    <FiX size={20} />
                </IconButton>
            </DialogTitle>
            <DialogContent className="pt-6">
                <Box className="space-y-4">
                    <Typography variant="body2" className="text-slate-500 mb-2">
                        Enter the name of the company or brand for this product.
                    </Typography>
                    <TextField
                        autoFocus
                        fullWidth
                        size="small"
                        label="Brand Name"
                        placeholder="e.g. Amul, Nestle, etc."
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (error) setError("");
                        }}
                        error={Boolean(error)}
                        helperText={error}
                        className="bg-white"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') handleSave();
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions className="p-4 pt-2">
                <Button
                    onClick={onClose}
                    className="normal-case text-slate-500 font-bold px-6"
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={loading}
                    className="normal-case bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 rounded-lg shadow-lg shadow-indigo-100"
                >
                    {loading ? "Saving..." : "Save Brand"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateBrandModal;
