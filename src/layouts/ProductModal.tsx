import React, { useState, useEffect } from "react";
import {
  Dialog,
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  DialogContent,
  DialogActions,
  Autocomplete,
} from "@mui/material";
import { FiX } from "react-icons/fi";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { productData, categories, brands } from "../data/ProductDummyData";

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  categories: string[];
  brands: string[];
}

interface ProductOption {
  product_name: string;
  category: string;
  brand: string;
  packSize: string;
  unit: string;
  shape: string;
  colour: string;
  printStatus: string;
  openingStock: number;
  quantity: number;
  perUnitRate: number;
  gst: number;
}

interface FormData {
  product_name: string;
  category: string;
  brand: string;
  packSize: string;
  unit: string;
  shape: string;
  colour: string;
  printStatus: string;
  openingStock: number | "";
  quantity: number | "";
  createdAt: string;
  price: number | "";
  taxableValue: number | "";
  gst: number | "";
  total: number | "";
}

const ProductModal: React.FC<ProductModalProps> = ({ open, onClose }) => {
  const [formData, setFormData] = useState<FormData>({
    product_name: "",
    category: "",
    brand: "",
    packSize: "",
    unit: "",
    shape: "",
    colour: "",
    printStatus: "N.A",
    openingStock: "",
    quantity: "",
    createdAt: new Date().toLocaleDateString(),
    price: "",
    taxableValue: "",
    gst: "",
    total: "",
  });

  const [createdDate, setCreatedDate] = useState<Dayjs | null>(dayjs());

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target as HTMLInputElement;
    if (["openingStock", "quantity", "gst", "price"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? "" : Number(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (newValue: Dayjs | null) => {
    setCreatedDate(newValue);
    setFormData((prev) => ({
      ...prev,
      createdAt: newValue ? newValue.format("DD/MM/YYYY") : "",
    }));
  };

  useEffect(() => {
    const quantity = Number(formData.quantity || 0);
    const price = Number(formData.price || 0);
    const gst = Number(formData.gst || 0);

    const taxableValue = quantity * price;
    const total = taxableValue + (taxableValue * gst) / 100;

    setFormData((prev) => ({
      ...prev,
      taxableValue: quantity && price ? taxableValue : "",
      total: quantity && price && gst ? total : "",
    }));
  }, [formData.quantity, formData.price, formData.gst]);

  const handleCancel = () => {
    setFormData({
      product_name: "",
      category: "",
      brand: "",
      packSize: "",
      unit: "",
      shape: "",
      colour: "",
      printStatus: "N.A",
      openingStock: "",
      quantity: "",
      createdAt: new Date().toLocaleDateString(),
      price: "",
      taxableValue: "",
      gst: "",
      total: "",
    });
    setCreatedDate(dayjs());
    onClose();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form Submitted Data:", formData);
    alert("Product Added! Check console for data.");
    handleCancel();
  };

  return (
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="lg">
      <Box component="form" onSubmit={handleSubmit}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h6" component="h2" fontWeight="600">
              Add New Product
            </Typography>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Created Date"
                value={createdDate}
                onChange={handleDateChange}
                slotProps={{
                  textField: { size: "small", sx: { minWidth: 180 } },
                }}
              />
            </LocalizationProvider>
          </Box>

          <IconButton onClick={handleCancel}>
            <FiX />
          </IconButton>
        </Box>

        <DialogContent>
          <Grid container spacing={3} mt={0.5} >
            {/* Autocomplete Product */}
            <Grid component="div" >
              <Autocomplete<ProductOption>
                options={productData}
                getOptionLabel={(option) => option.product_name}
                onChange={(_, value) => {
                  if (value) {
                    setFormData({
                      product_name: value.product_name,
                      category: value.category,
                      brand: value.brand,
                      packSize: value.packSize,
                      unit: value.unit,
                      shape: value.shape,
                      colour: value.colour,
                      printStatus: value.printStatus,
                      openingStock: value.openingStock,
                      quantity: value.quantity,
                      createdAt: new Date().toLocaleDateString(),
                      price: value.perUnitRate,
                      taxableValue: value.quantity * value.perUnitRate,
                      gst: value.gst,
                      total:
                        value.quantity * value.perUnitRate +
                        (value.quantity * value.perUnitRate * value.gst) / 100,
                    });
                  } else {
                    setFormData({
                      product_name: "",
                      category: "",
                      brand: "",
                      packSize: "",
                      unit: "",
                      shape: "",
                      colour: "",
                      printStatus: "N.A",
                      openingStock: "",
                      quantity: "",
                      createdAt: new Date().toLocaleDateString(),
                      price: "",
                      taxableValue: "",
                      gst: "",
                      total: "",
                    });
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Product"
                    placeholder="Type to search..."
                    size="small"
                    variant="outlined"
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Product Name */}
            <Grid component="div">
              <TextField
                variant="outlined"
                name="product_name"
                label="Product Name"
                fullWidth
                required
                size="small"
                value={formData.product_name}
                onChange={handleChange}
              />
            </Grid>

            {/* Category */}
            <Grid component="div">
              <FormControl fullWidth size="small" variant="outlined" required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  label="Category"
                  onChange={handleChange as any}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Brand */}
            <Grid component="div">
              <FormControl fullWidth size="small" variant="outlined" required>
                <InputLabel>Brand</InputLabel>
                <Select
                  name="brand"
                  value={formData.brand}
                  label="Brand"
                  onChange={handleChange as any}
                >
                  {brands.map((b) => (
                    <MenuItem key={b} value={b}>
                      {b}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* PackSize, Unit, Shape, Colour */}
            <Grid component="div">
              <TextField
                variant="outlined"
                name="packSize"
                label="Pack Size"
                fullWidth
                size="small"
                value={formData.packSize}
                onChange={handleChange}
              />
            </Grid>
            <Grid component="div">
              <TextField
                variant="outlined"
                name="unit"
                label="Unit"
                fullWidth
                size="small"
                value={formData.unit}
                onChange={handleChange}
              />
            </Grid>
            <Grid component="div">
              <TextField
                variant="outlined"
                name="shape"
                label="Shape"
                fullWidth
                size="small"
                value={formData.shape}
                onChange={handleChange}
              />
            </Grid>
            <Grid component="div">
              <TextField
                variant="outlined"
                name="colour"
                label="Colour"
                fullWidth
                size="small"
                value={formData.colour}
                onChange={handleChange}
              />
            </Grid>

            {/* Print Status, Opening Stock, Quantity */}
            <Grid component="div">
              <FormControl fullWidth size="small" variant="outlined">
                <InputLabel>Print Status</InputLabel>
                <Select
                  name="printStatus"
                  value={formData.printStatus}
                  label="Print Status"
                  onChange={handleChange as any}
                >
                  <MenuItem value="N.A">N.A</MenuItem>
                  <MenuItem value="Not Printed">Not Printed</MenuItem>
                  <MenuItem value="Printed">Printed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid component="div">
              <TextField
                variant="outlined"
                name="openingStock"
                label="Opening Stock"
                type="number"
                fullWidth
                required
                size="small"
                value={formData.openingStock}
                onChange={handleChange}
              />
            </Grid>
            <Grid component="div">
              <TextField
                variant="outlined"
                name="quantity"
                label="Quantity"
                type="number"
                fullWidth
                required
                size="small"
                value={formData.quantity}
                onChange={handleChange}
              />
            </Grid>

            {/* Price, Taxable, GST, Total */}
            <Grid component="div">
              <TextField
                variant="outlined"
                name="price"
                label="Per Unit Rate"
                type="number"
                fullWidth
                required
                size="small"
                value={formData.price}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₹</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid component="div">
              <TextField
                variant="outlined"
                name="taxableValue"
                label="Taxable Value"
                type="number"
                fullWidth
                size="small"
                value={
                  formData.taxableValue !== "" ? formData.taxableValue : "N.A"
                }
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">₹</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid component="div">
              <TextField
                variant="outlined"
                name="gst"
                label="GST (%)"
                type="number"
                fullWidth
                required
                size="small"
                value={formData.gst}
                onChange={handleChange}
              />
            </Grid>
            <Grid component="div">
              <TextField
                variant="outlined"
                name="total"
                label="Total"
                type="number"
                fullWidth
                size="small"
                value={formData.total !== "" ? formData.total : "N.A"}
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">₹</InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
          <Button onClick={handleCancel} variant="contained" color="error">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="success">
            Submit
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default ProductModal;
