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
    vendor_name: "",
    vendor_mobileNo: "",
    vendor_email: "",
    vendor_contactPerson_name: "",
    vendor_registrationType: "Unregistered",
    vendor_gstNumber: "",
    vendor_pan: "",
    vendor_address: "",
    vendor_address_line2: "",
    vendor_country: "India",
    vendor_state: "",
    vendor_city: "",
    vendor_pinCode: "",
    vendor_landmark: "",
    vendor_bankName: "",
    vendor_ifscCode: "",
    vendor_accountNumber: "",
    vendor_branchName: "",
    vendor_paymentTerms: "",
    vendor_preferredPaymentMode: "",
    vendor_gstType: "",
    vendor_creditLimit: 0,
    vendor_openingBalance: 0,
    vendor_outstandingBalance: 0,
    vendor_contactPerson_mobileNo: "",
  });

  React.useEffect(() => {
    if (open) {
      setFormData({
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
        vendor_paymentTerms: initialData?.vendor_paymentTerms || "",
        vendor_preferredPaymentMode: initialData?.vendor_preferredPaymentMode || "",
        vendor_gstType: initialData?.vendor_gstType || "",
        vendor_creditLimit: initialData?.vendor_creditLimit || 0,
        vendor_openingBalance: initialData?.vendor_openingBalance || 0,
        vendor_outstandingBalance: initialData?.vendor_outstandingBalance || 0,
        vendor_contactPerson_mobileNo: initialData?.vendor_contactPerson_mobileNo || "",
      });
    }
  }, [initialData, open]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.vendor_name) {
      return;
    }
    await onSave(formData);
  };

  const SectionTitle = ({ title }: { title: string }) => (
    <Typography className="text-[14px] font-bold text-blue-600 uppercase mb-4 mt-2">
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
            {isEdit ? "Update vendor profile information" : "Create a new vendor profile to organize your business efficiently"}
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
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="GSTIN"
                  value={formData.vendor_gstNumber}
                  onChange={(e) => handleChange("vendor_gstNumber", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", height: '40px' }, "& .MuiInputLabel-root": { fontSize: '13px' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Company Name"
                  required
                  value={formData.vendor_name}
                  onChange={(e) => handleChange("vendor_name", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", height: '40px' }, "& .MuiInputLabel-root": { fontSize: '13px' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Contact Person Name"
                  value={formData.vendor_contactPerson_name}
                  onChange={(e) => handleChange("vendor_contactPerson_name", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", height: '40px' }, "& .MuiInputLabel-root": { fontSize: '13px' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Contact Person Phone"
                  value={formData.vendor_contactPerson_mobileNo}
                  onChange={(e) => handleChange("vendor_contactPerson_mobileNo", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", height: '40px' }, "& .MuiInputLabel-root": { fontSize: '13px' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Vendor Phone"
                  value={formData.vendor_mobileNo}
                  onChange={(e) => handleChange("vendor_mobileNo", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", height: '40px' }, "& .MuiInputLabel-root": { fontSize: '13px' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email"
                  placeholder="e.g. contact@company.com"
                  value={formData.vendor_email}
                  onChange={(e) => handleChange("vendor_email", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", height: '40px' }, "& .MuiInputLabel-root": { fontSize: '13px' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Registration Type"
                  value={formData.vendor_registrationType}
                  onChange={(e) => handleChange("vendor_registrationType", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", height: '40px' }, "& .MuiInputLabel-root": { fontSize: '13px' } }}
                >
                  <MenuItem value="Registered" sx={{ fontSize: '13px' }}>Registered</MenuItem>
                  <MenuItem value="Unregistered" sx={{ fontSize: '13px' }}>Unregistered</MenuItem>
                  <MenuItem value="Composition" sx={{ fontSize: '13px' }}>Composition</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="PAN"
                  value={formData.vendor_pan}
                  onChange={(e) => handleChange("vendor_pan", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", height: '40px' }, "& .MuiInputLabel-root": { fontSize: '13px' } }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* BILLING ADDRESS */}
          <Box className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
            <SectionTitle title="Billing Address" />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Address Line 1"
                  value={formData.vendor_address}
                  onChange={(e) => handleChange("vendor_address", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", height: '40px' }, "& .MuiInputLabel-root": { fontSize: '13px' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Address Line 2"
                  value={formData.vendor_address_line2}
                  onChange={(e) => handleChange("vendor_address_line2", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", height: '40px' }, "& .MuiInputLabel-root": { fontSize: '13px' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Country"
                  required
                  value={formData.vendor_country}
                  onChange={(e) => handleChange("vendor_country", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", height: '40px' }, "& .MuiInputLabel-root": { fontSize: '13px' } }}
                >
                  <MenuItem value="India" sx={{ fontSize: '13px' }}>India</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="State"
                  required
                  value={formData.vendor_state}
                  onChange={(e) => handleChange("vendor_state", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", height: '40px' }, "& .MuiInputLabel-root": { fontSize: '13px' } }}
                >
                  <MenuItem value="Himachal Pradesh" sx={{ fontSize: '13px' }}>Himachal Pradesh</MenuItem>
                  <MenuItem value="Punjab" sx={{ fontSize: '13px' }}>Punjab</MenuItem>
                  <MenuItem value="Haryana" sx={{ fontSize: '13px' }}>Haryana</MenuItem>
                  <MenuItem value="Delhi" sx={{ fontSize: '13px' }}>Delhi</MenuItem>
                  <MenuItem value="Uttar Pradesh" sx={{ fontSize: '13px' }}>Uttar Pradesh</MenuItem>
                  <MenuItem value="Uttarakhand" sx={{ fontSize: '13px' }}>Uttarakhand</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Landmark"
                  value={formData.vendor_landmark}
                  onChange={(e) => handleChange("vendor_landmark", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", height: '40px' }, "& .MuiInputLabel-root": { fontSize: '13px' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="City"
                  required
                  value={formData.vendor_city}
                  onChange={(e) => handleChange("vendor_city", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", height: '40px' }, "& .MuiInputLabel-root": { fontSize: '13px' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Pincode"
                  value={formData.vendor_pinCode}
                  onChange={(e) => handleChange("vendor_pinCode", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", height: '40px' }, "& .MuiInputLabel-root": { fontSize: '13px' } }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* FINANCIAL & PAYMENT DETAILS */}
          <Box className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
            <SectionTitle title="Financial & Payment Details" />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Payment Terms"
                  value={formData.vendor_paymentTerms}
                  onChange={(e) => handleChange("vendor_paymentTerms", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", height: '40px' }, "& .MuiInputLabel-root": { fontSize: '13px' } }}
                >
                  <MenuItem value="Net 15" sx={{ fontSize: '13px' }}>Net 15</MenuItem>
                  <MenuItem value="Net 30" sx={{ fontSize: '13px' }}>Net 30</MenuItem>
                  <MenuItem value="On Delivery" sx={{ fontSize: '13px' }}>On Delivery</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Payment Mode"
                  value={formData.vendor_preferredPaymentMode}
                  onChange={(e) => handleChange("vendor_preferredPaymentMode", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", height: '40px' }, "& .MuiInputLabel-root": { fontSize: '13px' } }}
                >
                  <MenuItem value="Cash" sx={{ fontSize: '13px' }}>Cash</MenuItem>
                  <MenuItem value="Bank Transfer" sx={{ fontSize: '13px' }}>Bank Transfer</MenuItem>
                  <MenuItem value="UPI" sx={{ fontSize: '13px' }}>UPI</MenuItem>
                  <MenuItem value="Cheque" sx={{ fontSize: '13px' }}>Cheque</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="GST Type"
                  value={formData.vendor_gstType}
                  onChange={(e) => handleChange("vendor_gstType", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", height: '40px' }, "& .MuiInputLabel-root": { fontSize: '13px' } }}
                >
                  <MenuItem value="Cgst Sgst" sx={{ fontSize: '13px' }}>Cgst Sgst</MenuItem>
                  <MenuItem value="Igst" sx={{ fontSize: '13px' }}>Igst</MenuItem>
                  <MenuItem value="Non Gst" sx={{ fontSize: '13px' }}>Non Gst</MenuItem>
                  <MenuItem value="Exempt" sx={{ fontSize: '13px' }}>Exempt</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Credit Limit"
                  value={formData.vendor_creditLimit}
                  onChange={(e) => handleChange("vendor_creditLimit", Number(e.target.value))}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", height: '40px' }, "& .MuiInputLabel-root": { fontSize: '13px' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Opening Balance"
                  value={formData.vendor_openingBalance}
                  onChange={(e) => handleChange("vendor_openingBalance", Number(e.target.value))}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", height: '40px' }, "& .MuiInputLabel-root": { fontSize: '13px' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Outstanding Balance"
                  value={formData.vendor_outstandingBalance}
                  onChange={(e) => handleChange("vendor_outstandingBalance", Number(e.target.value))}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", height: '40px' }, "& .MuiInputLabel-root": { fontSize: '13px' } }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* VENDOR BANK DETAILS */}
          <Box className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
            <SectionTitle title="Vendor Bank Details" />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Bank Name"
                  value={formData.vendor_bankName}
                  onChange={(e) => handleChange("vendor_bankName", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", height: '40px' }, "& .MuiInputLabel-root": { fontSize: '13px' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="IFSC Code"
                  value={formData.vendor_ifscCode}
                  onChange={(e) => handleChange("vendor_ifscCode", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", height: '40px' }, "& .MuiInputLabel-root": { fontSize: '13px' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Account Number"
                  value={formData.vendor_accountNumber}
                  onChange={(e) => handleChange("vendor_accountNumber", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", height: '40px' }, "& .MuiInputLabel-root": { fontSize: '13px' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Branch Name"
                  value={formData.vendor_branchName}
                  onChange={(e) => handleChange("vendor_branchName", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", height: '40px' }, "& .MuiInputLabel-root": { fontSize: '13px' } }}
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
