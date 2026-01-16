import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  TextField,
  Button,
  MenuItem,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox
} from "@mui/material";
import {
  FiX,
  FiFileText,
  FiMapPin,
  FiTruck,
  FiDollarSign,
  FiBriefcase,
  FiList,
  FiInfo
} from "react-icons/fi";

// Define the shape of our form data
export interface VendorFormData {
  companyType: string;
  gstin: string;
  companyName: string;
  contactPerson: string;
  contactNo: string;
  email: string;
  registrationType: string;
  pan: string;

  billingAddress: string;
  billingAddress2: string;
  billingLandmark: string;
  billingCity: string;
  billingCountry: string;
  billingState: string;
  billingZip: string;
  distance: string;

  hasShippingAddress: boolean;
  shippingAttention: string;
  shippingCountry: string;
  shippingAddress1: string;
  shippingAddress2: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  shippingPhone: string;

  openingBalanceType: string;
  openingBalance: string;

  bankName: string;
  ifscCode: string;
  accountNumber: string;
  branchName: string;

  licenseNo: string;
  customField1: string;
  customField2: string;

  fax: string;
  website: string;
  creditLimit: string;
  dueDays: string;
  remarks: string;
  isEnabled: boolean;
}

interface VendorModalProps {
  open: boolean;
  onClose: () => void;
  onAddVendor: (vendor: any) => void;
}

const VendorModal: React.FC<VendorModalProps> = ({ open, onClose, onAddVendor }) => {
  const [formData, setFormData] = useState<VendorFormData>({
    companyType: "Vendor",
    gstin: "",
    companyName: "",
    contactPerson: "",
    contactNo: "",
    email: "",
    registrationType: "Unregistered",
    pan: "",

    billingAddress: "",
    billingAddress2: "",
    billingLandmark: "",
    billingCity: "",
    billingCountry: "India",
    billingState: "",
    billingZip: "",
    distance: "",

    hasShippingAddress: false,
    shippingAttention: "",
    shippingCountry: "India",
    shippingAddress1: "",
    shippingAddress2: "",
    shippingCity: "",
    shippingState: "",
    shippingZip: "",
    shippingPhone: "",

    openingBalanceType: "Credit",
    openingBalance: "0",

    bankName: "",
    ifscCode: "",
    accountNumber: "",
    branchName: "",

    licenseNo: "",
    customField1: "",
    customField2: "",

    fax: "",
    website: "",
    creditLimit: "",
    dueDays: "",
    remarks: "",
    isEnabled: true
  });

  const handleChange = (key: keyof VendorFormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const payload = {
      ...formData,
      name: formData.companyName,
      contactPerson: formData.contactPerson,
      contactNo: formData.contactNo,
      address: formData.billingAddress,
      state: formData.billingState,
      country: formData.billingCountry,
      pinCode: formData.billingZip,
      gstNumber: formData.gstin,
      registrationType: formData.registrationType,
    };
    onAddVendor(payload);
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "6px",
      backgroundColor: "#fff",
      "& fieldset": { borderColor: "#e2e8f0" },
      "&:hover fieldset": { borderColor: "#cbd5e1" },
      "&.Mui-focused fieldset": { borderColor: "#10b981", borderWidth: "2px" }
    },
    "& .MuiInputBase-input": {
      padding: "10px 14px",
      fontSize: "0.875rem",
      color: "#334155"
    }
  };

  const renderField = (label: string, component: React.ReactNode, required = false, note?: string) => (
    <Box className="mb-4">
      <Typography className="text-sm text-slate-700 mb-2 font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Typography>
      {component}
      {note && (
        <Typography className="text-xs text-slate-500 mt-1 italic">
          {note}
        </Typography>
      )}
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          height: '92vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#fff',
        }
      }}
      BackdropProps={{
        sx: { backdropFilter: 'blur(3px)', backgroundColor: 'rgba(0,0,0,0.3)' }
      }}
    >
      {/* Header */}
      <Box className="px-6 py-4 flex items-center justify-between border-b border-gray-200 shrink-0 bg-white">
        <Box className="flex items-center gap-2">
          <Typography variant="h6" className="font-semibold text-slate-800">
            Add Customer / Vendor
          </Typography>
          <IconButton size="small" className="text-slate-400 hover:bg-slate-100">
            <FiX size={16} className="transform rotate-45" />
          </IconButton>
        </Box>
        <IconButton onClick={onClose} size="small" className="text-slate-400 hover:text-slate-600 hover:bg-slate-100">
          <FiX size={22} />
        </IconButton>
      </Box>

      {/* Content */}
      <DialogContent className="p-0 bg-white custom-scrollbar">
        <Box className="px-8 py-6">

          {/* 1. Customer / Vendor Detail */}
          <Box className="mb-8">
            <Box className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-200">
              <FiFileText className="text-slate-600" size={20} />
              <Typography className="font-semibold text-slate-800 text-base">
                Customer / Vendor Detail
              </Typography>
            </Box>

            {renderField("Company Type", (
              <RadioGroup
                row
                value={formData.companyType}
                onChange={(e) => handleChange("companyType", e.target.value)}
              >
                <FormControlLabel
                  value="Customer"
                  control={<Radio size="small" sx={{ color: '#cbd5e1', '&.Mui-checked': { color: '#10b981' } }} />}
                  label={<span className="text-sm text-slate-700">Customer</span>}
                />
                <FormControlLabel
                  value="Vendor"
                  control={<Radio size="small" sx={{ color: '#cbd5e1', '&.Mui-checked': { color: '#10b981' } }} />}
                  label={<span className="text-sm text-slate-700">Vendor</span>}
                />
                <FormControlLabel
                  value="Customer / Vendor"
                  control={<Radio size="small" sx={{ color: '#cbd5e1', '&.Mui-checked': { color: '#10b981' } }} />}
                  label={<span className="text-sm text-slate-700">Customer / Vendor</span>}
                />
              </RadioGroup>
            ))}

            {renderField("GSTIN", (
              <Box className="flex gap-2">
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter GSTIN"
                  value={formData.gstin}
                  onChange={(e) => handleChange("gstin", e.target.value)}
                  sx={inputSx}
                />
                <Button
                  variant="outlined"
                  className="whitespace-nowrap text-sm px-4 border-slate-300 text-slate-700 hover:bg-slate-50 normal-case"
                >
                  Auto Fill
                </Button>
              </Box>
            ))}

            {renderField("Company Name", (
              <TextField
                fullWidth
                size="small"
                placeholder="Enter Company name"
                value={formData.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                sx={inputSx}
              />
            ), true)}

            {renderField("Contact Person", (
              <TextField
                fullWidth
                size="small"
                placeholder="Enter contact person"
                value={formData.contactPerson}
                onChange={(e) => handleChange("contactPerson", e.target.value)}
                sx={inputSx}
              />
            ))}

            {renderField("Contact No", (
              <TextField
                fullWidth
                size="small"
                placeholder="Enter contact No."
                value={formData.contactNo}
                onChange={(e) => handleChange("contactNo", e.target.value)}
                sx={inputSx}
              />
            ))}

            {renderField("Email", (
              <TextField
                fullWidth
                size="small"
                placeholder="emailaddress@domain.com"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                sx={inputSx}
              />
            ), false, "Note : Use comma(,) as address separator to enter Multiple Email.")}

            {renderField("Registration Type", (
              <TextField
                select
                fullWidth
                size="small"
                value={formData.registrationType}
                onChange={(e) => handleChange("registrationType", e.target.value)}
                sx={inputSx}
              >
                <MenuItem value="Unregistered">Unregistered</MenuItem>
                <MenuItem value="Registered">Registered</MenuItem>
                <MenuItem value="Composition">Composition</MenuItem>
              </TextField>
            ))}

            {renderField("PAN", (
              <TextField
                fullWidth
                size="small"
                placeholder="Enter PAN"
                value={formData.pan}
                onChange={(e) => handleChange("pan", e.target.value)}
                sx={inputSx}
              />
            ))}
          </Box>

          {/* 2. Billing Address */}
          <Box className="mb-8">
            <Box className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-200">
              <FiMapPin className="text-slate-600" size={20} />
              <Typography className="font-semibold text-slate-800 text-base">
                Billing Address
              </Typography>
            </Box>

            {renderField("Address", (
              <Box className="space-y-2">
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter address1"
                  value={formData.billingAddress}
                  onChange={(e) => handleChange("billingAddress", e.target.value)}
                  sx={inputSx}
                />
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter address2"
                  value={formData.billingAddress2}
                  onChange={(e) => handleChange("billingAddress2", e.target.value)}
                  sx={inputSx}
                />
              </Box>
            ))}

            {renderField("Landmark", (
              <TextField
                fullWidth
                size="small"
                placeholder="Enter landmark"
                value={formData.billingLandmark}
                onChange={(e) => handleChange("billingLandmark", e.target.value)}
                sx={inputSx}
              />
            ))}

            {renderField("City", (
              <TextField
                fullWidth
                size="small"
                placeholder="Enter city"
                value={formData.billingCity}
                onChange={(e) => handleChange("billingCity", e.target.value)}
                sx={inputSx}
              />
            ), true)}

            {renderField("Country", (
              <TextField
                select
                fullWidth
                size="small"
                value={formData.billingCountry}
                onChange={(e) => handleChange("billingCountry", e.target.value)}
                sx={inputSx}
              >
                <MenuItem value="India">India</MenuItem>
              </TextField>
            ), true)}

            {renderField("State", (
              <TextField
                select
                fullWidth
                size="small"
                value={formData.billingState}
                onChange={(e) => handleChange("billingState", e.target.value)}
                sx={inputSx}
              >
                <MenuItem value="">Select State</MenuItem>
                <MenuItem value="Delhi">Delhi</MenuItem>
                <MenuItem value="Maharashtra">Maharashtra</MenuItem>
                <MenuItem value="Karnataka">Karnataka</MenuItem>
              </TextField>
            ), true)}

            {renderField("Pincode", (
              <TextField
                fullWidth
                size="small"
                placeholder="Enter pincode"
                value={formData.billingZip}
                onChange={(e) => handleChange("billingZip", e.target.value)}
                sx={inputSx}
              />
            ))}

            {renderField("Distance for e-way bill (in km)", (
              <Box className="flex gap-2">
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter Distance for e-way bill (in km)"
                  value={formData.distance}
                  onChange={(e) => handleChange("distance", e.target.value)}
                  sx={inputSx}
                />
                <Button
                  variant="outlined"
                  className="whitespace-nowrap text-sm px-4 border-slate-300 text-slate-700 hover:bg-slate-50 normal-case"
                >
                  Auto Fill
                </Button>
              </Box>
            ))}
          </Box>

          {/* 3. Shipping Address */}
          <Box className="mb-8">
            <Box className="flex items-center justify-between mb-5 pb-3 border-b border-slate-200">
              <Box className="flex items-center gap-2">
                <FiTruck className="text-slate-600" size={20} />
                <Typography className="font-semibold text-slate-800 text-base">
                  Shipping Address
                </Typography>
              </Box>
              {!formData.hasShippingAddress && (
                <Button
                  variant="contained"
                  size="small"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white normal-case shadow-none"
                  startIcon={<span className="text-lg">+</span>}
                  onClick={() => handleChange("hasShippingAddress", true)}
                >
                  Add
                </Button>
              )}
            </Box>

            {formData.hasShippingAddress && (
              <Box>
                <Box className="flex justify-end mb-3">
                  <Button
                    size="small"
                    className="text-red-500 normal-case text-xs hover:bg-red-50"
                    onClick={() => handleChange("hasShippingAddress", false)}
                  >
                    Remove Shipping Address
                  </Button>
                </Box>
                {renderField("Attention", (
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Attention"
                    value={formData.shippingAttention}
                    onChange={(e) => handleChange("shippingAttention", e.target.value)}
                    sx={inputSx}
                  />
                ))}
                {renderField("Address", (
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                    placeholder="Address"
                    value={formData.shippingAddress1}
                    onChange={(e) => handleChange("shippingAddress1", e.target.value)}
                    sx={inputSx}
                  />
                ))}
              </Box>
            )}
          </Box>

          {/* 4. Opening Balance */}
          <Box className="mb-8">
            <Box className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-200">
              <FiDollarSign className="text-slate-600" size={20} />
              <Typography className="font-semibold text-slate-800 text-base">
                Opening Balance
              </Typography>
            </Box>

            {renderField("Vendor Balance", (
              <RadioGroup
                row
                value={formData.openingBalanceType}
                onChange={(e) => handleChange("openingBalanceType", e.target.value)}
              >
                <FormControlLabel
                  value="Credit"
                  control={<Radio size="small" sx={{ color: '#cbd5e1', '&.Mui-checked': { color: '#10b981' } }} />}
                  label={<span className="text-sm text-slate-700">Credit</span>}
                />
                <FormControlLabel
                  value="Debit"
                  control={<Radio size="small" sx={{ color: '#cbd5e1', '&.Mui-checked': { color: '#ef4444' } }} />}
                  label={<span className="text-sm text-slate-700">Debit</span>}
                />
              </RadioGroup>
            ))}

            {renderField("Amount", (
              <TextField
                fullWidth
                size="small"
                type="number"
                placeholder="0"
                value={formData.openingBalance}
                onChange={(e) => handleChange("openingBalance", e.target.value)}
                sx={inputSx}
              />
            ))}
          </Box>

          {/* 5. Vendor Bank Details */}
          <Box className="mb-8">
            <Box className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-200">
              <FiBriefcase className="text-slate-600" size={20} />
              <Typography className="font-semibold text-slate-800 text-base">
                Vendor Bank Details
              </Typography>
            </Box>

            {renderField("Bank Name", (
              <TextField
                fullWidth
                size="small"
                placeholder="Enter bank name"
                value={formData.bankName}
                onChange={(e) => handleChange("bankName", e.target.value)}
                sx={inputSx}
              />
            ))}

            {renderField("Bank IFSC Code", (
              <TextField
                fullWidth
                size="small"
                placeholder="Enter IFSC code"
                value={formData.ifscCode}
                onChange={(e) => handleChange("ifscCode", e.target.value)}
                sx={inputSx}
              />
            ))}

            {renderField("Bank Account Number", (
              <TextField
                fullWidth
                size="small"
                placeholder="Enter account number"
                value={formData.accountNumber}
                onChange={(e) => handleChange("accountNumber", e.target.value)}
                sx={inputSx}
              />
            ))}

            {renderField("Bank Branch Name", (
              <TextField
                fullWidth
                size="small"
                placeholder="Enter branch name"
                value={formData.branchName}
                onChange={(e) => handleChange("branchName", e.target.value)}
                sx={inputSx}
              />
            ))}
          </Box>

          {/* 6. Custom Fields */}
          <Box className="mb-8">
            <Box className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-200">
              <FiList className="text-slate-600" size={20} />
              <Typography className="font-semibold text-slate-800 text-base">
                Custom Fields
              </Typography>
            </Box>

            {renderField("License No.", (
              <TextField
                fullWidth
                size="small"
                placeholder="Enter License No."
                value={formData.licenseNo}
                onChange={(e) => handleChange("licenseNo", e.target.value)}
                sx={inputSx}
              />
            ))}

            {renderField("custom field 1", (
              <TextField
                fullWidth
                size="small"
                placeholder="Enter custom field 1"
                value={formData.customField1}
                onChange={(e) => handleChange("customField1", e.target.value)}
                sx={inputSx}
              />
            ))}

            {renderField("custom field 2", (
              <TextField
                fullWidth
                size="small"
                placeholder="Enter custom field 2"
                value={formData.customField2}
                onChange={(e) => handleChange("customField2", e.target.value)}
                sx={inputSx}
              />
            ))}
          </Box>

          {/* 7. Additional Details */}
          <Box className="mb-6">
            <Box className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-200">
              <FiInfo className="text-slate-600" size={20} />
              <Typography className="font-semibold text-slate-800 text-base">
                Additional Details
              </Typography>
            </Box>

            {renderField("Fax No", (
              <TextField
                fullWidth
                size="small"
                placeholder="Enter fax No."
                value={formData.fax}
                onChange={(e) => handleChange("fax", e.target.value)}
                sx={inputSx}
              />
            ))}

            {renderField("Website", (
              <TextField
                fullWidth
                size="small"
                placeholder="www.sitename.com"
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                sx={inputSx}
              />
            ))}

            {renderField("Credit Limit", (
              <TextField
                fullWidth
                size="small"
                placeholder="Enter amount"
                value={formData.creditLimit}
                onChange={(e) => handleChange("creditLimit", e.target.value)}
                sx={inputSx}
              />
            ), false, "Note : A warning will be displayed if the customer's credit limit is exceeded while generating an invoice")}

            {renderField("Due Days", (
              <TextField
                fullWidth
                size="small"
                placeholder="Enter due days"
                value={formData.dueDays}
                onChange={(e) => handleChange("dueDays", e.target.value)}
                sx={inputSx}
              />
            ), false, "Note : Keep it blank to use the default due date from settings. Enter a number to set the due date as days from the invoice date.")}

            {renderField("Note", (
              <TextField
                fullWidth
                size="small"
                placeholder="Enter note"
                multiline
                rows={2}
                value={formData.remarks}
                onChange={(e) => handleChange("remarks", e.target.value)}
                sx={inputSx}
              />
            ))}

            {renderField("Enable", (
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={formData.isEnabled}
                    onChange={(e) => handleChange("isEnabled", e.target.checked)}
                    sx={{ color: '#10b981', '&.Mui-checked': { color: '#10b981' } }}
                  />
                }
                label={<span className="text-sm text-slate-700">Company will be visible on all document.</span>}
              />
            ))}
          </Box>

        </Box>
      </DialogContent>

      {/* Footer */}
      <DialogActions className="px-6 py-4 bg-gray-50 border-t border-gray-200 shrink-0 flex justify-between">
        <Button
          variant="outlined"
          onClick={onClose}
          startIcon={<FiX />}
          className="px-6 py-2 border-gray-300 text-slate-700 hover:bg-gray-100 normal-case font-medium"
        >
          Close
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          className="px-8 py-2 bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm normal-case font-medium"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VendorModal;
