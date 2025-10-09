import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Button,
  MenuItem,
} from "@mui/material";

import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

// --- Interfaces ---
export interface ProductFormData {
  batch: string;
  name: string;
  description: string;
  costPrice: string;
  sellingPrice: string;
  qty: string;
  supplier: string;
  category: string;
  warehouse: string;
  mftDate: Date | null;
  expiryDate: Date | null;
}

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  // onSubmit: (product: ProductFormData) => void;
}

// --- Component ---
const ProductModal: React.FC<ProductModalProps> = ({ open, onClose }) => {
  const [formData, setFormData] = useState<ProductFormData>({
    batch: "",
    name: "",
    description: "",
    costPrice: "",
    sellingPrice: "",
    qty: "",
    supplier: "",
    category: "",
    warehouse: "",
    mftDate: null,
    expiryDate: null,
  });

  // Generic field change handler
  const handleChange = <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Reset and close
  const handleCancel = () => {
    setFormData({
      batch: "",
      name: "",
      description: "",
      costPrice: "",
      sellingPrice: "",
      qty: "",
      supplier: "",
      category: "",
      warehouse: "",
      mftDate: null,
      expiryDate: null,
    });
    onClose();
  };

  // Submit handler
  const handleSubmit = () => {
    // onSubmit(formData);
    handleCancel(); // Reset after submit
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="md">
        <DialogTitle>Add Product</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Product Batch"
                fullWidth
                value={formData.batch}
                onChange={(e) => handleChange("batch", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Product Name"
                fullWidth
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Product Description"
                fullWidth
                multiline
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Cost Price"
                type="number"
                fullWidth
                value={formData.costPrice}
                onChange={(e) => handleChange("costPrice", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Selling Price"
                type="number"
                fullWidth
                value={formData.sellingPrice}
                onChange={(e) => handleChange("sellingPrice", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Qty (Cartons)"
                type="number"
                fullWidth
                value={formData.qty}
                onChange={(e) => handleChange("qty", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Supplier"
                fullWidth
                select
                value={formData.supplier}
                onChange={(e) => handleChange("supplier", e.target.value)}
              >
                <MenuItem value="Supplier One Ltd">Supplier One Ltd</MenuItem>
                <MenuItem value="Supplier Two Ltd">Supplier Two Ltd</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Category"
                fullWidth
                select
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
              >
                <MenuItem value="Food">Food</MenuItem>
                <MenuItem value="Stationery">Stationery</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Warehouse"
                fullWidth
                select
                value={formData.warehouse}
                onChange={(e) => handleChange("warehouse", e.target.value)}
              >
                <MenuItem value="Store One">Store One</MenuItem>
                <MenuItem value="Store Two">Store Two</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="MFT Date"
                value={formData.mftDate}
                onChange={(date) => handleChange("mftDate", date)}
                slotProps={{
                  textField: { fullWidth: true },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Expiry Date"
                value={formData.expiryDate}
                onChange={(date) => handleChange("expiryDate", date)}
                slotProps={{
                  textField: { fullWidth: true },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancel}
            sx={{ textTransform: "capitalize" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSubmit}
            sx={{ textTransform: "capitalize" }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ProductModal;
