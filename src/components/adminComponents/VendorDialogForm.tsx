import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Typography,
  Box,
  MenuItem,
  Grid,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FiX } from "react-icons/fi";

interface VendorDialogFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: any;
  isEdit?: boolean;
}

export const VendorDialogForm: React.FC<VendorDialogFormProps> = ({
  open,
  onClose,
  onSave,
  initialData,
  isEdit = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [formData, setFormData] = useState({
    vendor_name: initialData?.vendor_name || "",
    vendor_mobileNo: initialData?.vendor_mobileNo || "",
    vendor_email: initialData?.vendor_email || "",
    vendor_contactPerson_name: initialData?.vendor_contactPerson_name || "",
    vendor_registrationType: initialData?.vendor_registrationType || "Unregistered",
    vendor_gstNumber: initialData?.vendor_gstNumber || "",
    vendor_pan: initialData?.vendor_pan || "",
    vendor_address: initialData?.vendor_address || "",
    vendor_address_line2: initialData?.vendor_address_line2 || "",
    vendor_country: initialData?.vendor_country || "India",
    vendor_state: initialData?.vendor_state || "",
    vendor_city: initialData?.vendor_city || "",
    vendor_pinCode: initialData?.vendor_pinCode || "",
    vendor_landmark: initialData?.vendor_landmark || "",
    vendor_bankName: initialData?.vendor_bankName || "",
    vendor_ifscCode: initialData?.vendor_ifscCode || "",
    vendor_accountNumber: initialData?.vendor_accountNumber || "",
    vendor_branchName: initialData?.vendor_branchName || "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.vendor_name) {
      return;
    }
    await onSave(formData);
  };

  const SectionTitle = ({ title }: { title: string }) => (
    <Typography className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4 mt-2">
      {title}
    </Typography>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : "12px",
          maxHeight: isMobile ? "100%" : "90vh",
        },
      }}
    >
      <DialogTitle className="flex justify-between items-center border-b px-6 py-4">
        <Box>
          <Typography variant="h6" className="font-bold text-slate-800">
            {isEdit ? "Edit Vendor" : "Add New Vendor"}
          </Typography>
          <Typography variant="caption" className="text-slate-500">
            Create a new vendor profile to organize your business efficiently
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <FiX />
        </IconButton>
      </DialogTitle>

      <DialogContent className="p-6 bg-slate-50/50">
        <Box className="space-y-6">
          {/* BASIC DETAILS */}
          <Box className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
            <SectionTitle title="Basic Details" />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="GSTIN"
                  value={formData.vendor_gstNumber}
                  onChange={(e) => handleChange("vendor_gstNumber", e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Company Name *"
                  required
                  value={formData.vendor_name}
                  onChange={(e) => handleChange("vendor_name", e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Contact Person"
                  value={formData.vendor_contactPerson_name}
                  onChange={(e) => handleChange("vendor_contactPerson_name", e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Contact No"
                  value={formData.vendor_mobileNo}
                  onChange={(e) => handleChange("vendor_mobileNo", e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email"
                  placeholder="Use comma(,) for multiple emails"
                  value={formData.vendor_email}
                  onChange={(e) => handleChange("vendor_email", e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Registration Type"
                  value={formData.vendor_registrationType}
                  onChange={(e) => handleChange("vendor_registrationType", e.target.value)}
                >
                  <MenuItem value="Registered">Registered</MenuItem>
                  <MenuItem value="Unregistered">Unregistered</MenuItem>
                  <MenuItem value="Composition">Composition</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="PAN"
                  value={formData.vendor_pan}
                  onChange={(e) => handleChange("vendor_pan", e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>

          {/* BILLING ADDRESS */}
          <Box className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
            <SectionTitle title="Billing Address" />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Address Line 1"
                  value={formData.vendor_address}
                  onChange={(e) => handleChange("vendor_address", e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Address Line 2"
                  value={formData.vendor_address_line2}
                  onChange={(e) => handleChange("vendor_address_line2", e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Country *"
                  required
                  value={formData.vendor_country}
                  onChange={(e) => handleChange("vendor_country", e.target.value)}
                >
                  <MenuItem value="India">India</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="State *"
                  required
                  value={formData.vendor_state}
                  onChange={(e) => handleChange("vendor_state", e.target.value)}
                >
                  <MenuItem value="Himachal Pradesh">Himachal Pradesh</MenuItem>
                  <MenuItem value="Punjab">Punjab</MenuItem>
                  <MenuItem value="Haryana">Haryana</MenuItem>
                  <MenuItem value="Delhi">Delhi</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Landmark"
                  value={formData.vendor_landmark}
                  onChange={(e) => handleChange("vendor_landmark", e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="City *"
                  required
                  value={formData.vendor_city}
                  onChange={(e) => handleChange("vendor_city", e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Pincode"
                  value={formData.vendor_pinCode}
                  onChange={(e) => handleChange("vendor_pinCode", e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>

          {/* VENDOR BANK DETAILS */}
          <Box className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
            <SectionTitle title="Vendor Bank Details" />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Bank Name"
                  value={formData.vendor_bankName}
                  onChange={(e) => handleChange("vendor_bankName", e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="IFSC Code"
                  value={formData.vendor_ifscCode}
                  onChange={(e) => handleChange("vendor_ifscCode", e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Account Number"
                  value={formData.vendor_accountNumber}
                  onChange={(e) => handleChange("vendor_accountNumber", e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Branch Name"
                  value={formData.vendor_branchName}
                  onChange={(e) => handleChange("vendor_branchName", e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions className="border-t px-6 py-4 bg-white">
        <Button
          onClick={onClose}
          variant="outlined"
          startIcon={<FiX />}
          className="rounded-lg text-blue-600 border-blue-200 normal-case px-6"
        >
          CANCEL
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg normal-case px-6"
        >
          SAVE DETAILS
        </Button>
      </DialogActions>
    </Dialog>
  );
};
