import React, { useState } from "react";
import {
    Dialog, Box, Typography, Grid, TextField, Button, IconButton,
    FormControl, InputLabel, Select, MenuItem, InputAdornment, styled, DialogContent, DialogActions,
} from "@mui/material";
import { FiX, FiUpload } from "react-icons/fi";

// ✅ Interface mein categories aur brands props add kiye gaye
interface ProductModalProps {
    open: boolean;
    onClose: () => void;
    categories: string[];
    brands: string[];
}

// Custom styled input for hidden file upload
const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)', clipPath: 'inset(50%)', height: 1, overflow: 'hidden',
    position: 'absolute', bottom: 0, left: 0, whiteSpace: 'nowrap', width: 1,
});

// ✅ Component mein categories aur brands props receive kiye gaye
const ProductModal: React.FC<ProductModalProps> = ({ open, onClose, categories, brands }) => {
    // State for all your 14 form fields
    const [formData, setFormData] = useState({
        product_name: "", category: "", brand: "", packSize: "", unit: "",
        quantity: "", shape: "", colour: "", printStatus: "Not Printed",
        openingStock: "", closingStock: "", image: null as File | null,
        gst: "", price: "",
    });

    // Handlers
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name as string]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, image: e.target.files![0] }));
        }
    };

    const handleCancel = () => {
        // Reset form to initial state
        setFormData({
            product_name: "", category: "", brand: "", packSize: "", unit: "",
            quantity: "", shape: "", colour: "", printStatus: "Not Printed",
            openingStock: "", closingStock: "", image: null,
            gst: "", price: "",
        });
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form Submitted Data:", formData);
        alert("Product Added! Check console for data.");
        handleCancel();
    };

    return (
        <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="lg">
            <Box component="form" onSubmit={handleSubmit}>
                {/* --- MODAL HEADER --- */}
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                    <Typography variant="h6" component="h2" fontWeight="600">
                        Add New Product
                    </Typography>
                    <IconButton onClick={handleCancel}><FiX /></IconButton>
                </Box>

                {/* --- MODAL CONTENT --- */}
                <DialogContent>
                    <Grid container spacing={3} mt={0.5}>
                        
                        {/* --- Row 1 --- */}
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField variant="standard" name="product_name" label="Product Name" fullWidth required size="small" value={formData.product_name} onChange={handleChange} />
                        </Grid>
                        
                        {/* ✅ Category TextField ko Dropdown se replace kiya gaya */}
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth size="small" variant="standard" required>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    name="category"
                                    value={formData.category}
                                    label="Category"
                                    onChange={handleChange as any}
                                >
                                    {categories.map((category) => (
                                        <MenuItem key={category} value={category}>
                                            {category}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        
                        {/* ✅ Brand TextField ko Dropdown se replace kiya gaya */}
                        <Grid item xs={12} sm={6} md={4}>
                             <FormControl fullWidth size="small" variant="standard" required>
                                <InputLabel>Brand</InputLabel>
                                <Select
                                    name="brand"
                                    value={formData.brand}
                                    label="Brand"
                                    onChange={handleChange as any}
                                >
                                    {brands.map((brand) => (
                                        <MenuItem key={brand} value={brand}>
                                            {brand}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* --- Row 2 --- */}
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField variant="standard" name="packSize" label="Pack Size" fullWidth size="small" value={formData.packSize} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField variant="standard" name="unit" label="Unit" fullWidth size="small" value={formData.unit} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField variant="standard" name="quantity" label="Quantity" type="number" fullWidth required size="small" value={formData.quantity} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                           <FormControl fullWidth size="small" variant="standard">
                                <InputLabel>Print Status</InputLabel>
                                <Select name="printStatus" value={formData.printStatus} label="Print Status" onChange={handleChange as any}>
                                    <MenuItem value="Not Printed">Not Printed</MenuItem>
                                    <MenuItem value="Printed">Printed</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* --- Row 3 --- */}
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField variant="standard" name="openingStock" label="Opening Stock" type="number" fullWidth required size="small" value={formData.openingStock} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField variant="standard" name="closingStock" label="Closing Stock" type="number" fullWidth required size="small" value={formData.closingStock} onChange={handleChange} />
                        </Grid>
                         <Grid item xs={12} sm={6} md={3}>
                            <TextField variant="standard" name="shape" label="Shape" fullWidth size="small" value={formData.shape} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField variant="standard" name="colour" label="Colour" fullWidth size="small" value={formData.colour} onChange={handleChange} />
                        </Grid>

                        {/* --- Row 4 --- */}
                        <Grid item xs={12} sm={6}>
                            <TextField variant="standard" name="price" label="Price" type="number" fullWidth required size="small" value={formData.price} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField variant="standard" name="gst" label="GST" type="number" fullWidth required size="small" value={formData.gst} onChange={handleChange} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
                        </Grid>
                        
                        {/* --- Row 5 --- */}
                        <Grid item xs={12}>
                            <Button component="label" variant="outlined" startIcon={<FiUpload />} fullWidth size="large" sx={{ py: 1.5, mt: 1 }}>
                                Upload Product Image
                                <VisuallyHiddenInput type="file" accept="image/*" onChange={handleImageChange} />
                            </Button>
                            {formData.image && <Typography variant="body2" mt={1} noWrap>Selected File: {formData.image.name}</Typography>}
                        </Grid>

                    </Grid>
                </DialogContent>
                
                {/* --- MODAL ACTIONS --- */}
                <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                    <Button onClick={handleCancel} variant="contained" color="error">Cancel</Button>
                    <Button type="submit" variant="contained" color="success">Submit</Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default ProductModal;