import React, { useState } from "react";
import {
  Dialog,
  Typography,
  IconButton,
  TextField,
  Button,
  MenuItem,
  Box,
} from "@mui/material";
import { FiX } from "react-icons/fi";

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
  variant?: "dialog" | "embedded";
}

const VendorModal: React.FC<VendorModalProps> = ({ open, onClose, onAddVendor, variant = "dialog" }) => {
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
      "&.Mui-focused fieldset": { borderColor: "#2563eb", borderWidth: "2px" }
    },
    "& .MuiInputBase-input": {
      padding: "10px 14px",
      fontSize: "0.875rem",
      color: "#334155"
    }
  };

  const content = (
    <>
      {/* Header */}
      <Box className="px-6 py-4 flex items-center justify-between border-b border-gray-200 shrink-0 bg-white shadow-sm z-10">
        <Box>
          <Typography variant="h6" className="font-bold text-slate-800">
            {formData.companyType === "Vendor" ? "Add New Vendor" : "Add New Customer"}
          </Typography>
          <Typography variant="body2" className="text-slate-500 mt-1">
            Create a new {formData.companyType.toLowerCase()} profile to organize your business efficiently
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" className="text-slate-400 hover:text-slate-600 hover:bg-slate-100">
          <FiX size={22} />
        </IconButton>
      </Box>

      {/* Content */}
      <Box className="flex-1 overflow-auto px-4 py-6 custom-scrollbar bg-white">
        <Box className="w-full lg:w-3/4 space-y-6">
          
          {/* 1. Basic Details */}
          <Box className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 shadow-sm">
             <Typography variant="caption" className="font-bold text-blue-900 uppercase tracking-wider block mb-3 border-b border-blue-200 pb-2">
              BASIC DETAILS
            </Typography>

            <Box className="mb-4">
              <div className="grid grid-cols-1 gap-4">
                 {/* GSTIN Row */}
                 {/* GSTIN Row */}
                 <Box>
                    <TextField
                      fullWidth
                      size="small"
                      label="GSTIN"
                      placeholder="Enter GSTIN"
                      value={formData.gstin}
                      onChange={(e) => handleChange("gstin", e.target.value)}
                      sx={inputSx}
                    />
                 </Box>

                 {/* Company Name */}
                 <Box>
                    <TextField
                      fullWidth
                      size="small"
                      label="Company Name *"
                      placeholder="Enter Company name"
                      value={formData.companyName}
                      onChange={(e) => handleChange("companyName", e.target.value)}
                      sx={inputSx}
                    />
                 </Box>

                 {/* Contact Person & No */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Box>
                        <TextField
                          fullWidth
                          size="small"
                          label="Contact Person"
                          placeholder="Enter contact person"
                          value={formData.contactPerson}
                          onChange={(e) => handleChange("contactPerson", e.target.value)}
                          sx={inputSx}
                        />
                    </Box>
                    <Box>
                        <TextField
                          fullWidth
                          size="small"
                          label="Contact No"
                          placeholder="Enter contact No."
                          value={formData.contactNo}
                          onChange={(e) => handleChange("contactNo", e.target.value)}
                          sx={inputSx}
                        />
                    </Box>
                 </div>

                 {/* Email */}
                 <Box>
                    <TextField
                      fullWidth
                      size="small"
                      label="Email"
                      placeholder="emailaddress@domain.com"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      sx={inputSx}
                      helperText={<span className="italic text-[10px] text-gray-400">Use comma(,) for multiple emails</span>}
                    />
                 </Box>

                 {/* Reg Type & PAN */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Box>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Registration Type"
                          value={formData.registrationType}
                          onChange={(e) => handleChange("registrationType", e.target.value)}
                          sx={inputSx}
                        >
                          <MenuItem value="Unregistered">Unregistered</MenuItem>
                          <MenuItem value="Registered">Registered</MenuItem>
                          <MenuItem value="Composition">Composition</MenuItem>
                        </TextField>
                    </Box>
                    <Box>
                        <TextField
                          fullWidth
                          size="small"
                          label="PAN"
                          placeholder="Enter PAN"
                          value={formData.pan}
                          onChange={(e) => handleChange("pan", e.target.value)}
                          sx={inputSx}
                        />
                    </Box>
                  </div>
              </div>
            </Box>
          </Box>

          {/* 2. Billing Address */}
          <Box className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 shadow-sm">
            <Typography variant="caption" className="font-bold text-blue-900 uppercase tracking-wider block mb-3 border-b border-blue-200 pb-2">
              BILLING ADDRESS
            </Typography>

            <div className="grid grid-cols-1 gap-4">
               {/* Address Lines */}
               <Box>
                  <div className="space-y-2">
                    <TextField
                      fullWidth
                      size="small"
                      label="Address Line 1"
                      placeholder="Address Line 1"
                      value={formData.billingAddress}
                      onChange={(e) => handleChange("billingAddress", e.target.value)}
                      sx={inputSx}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Address Line 2"
                      placeholder="Address Line 2"
                      value={formData.billingAddress2}
                      onChange={(e) => handleChange("billingAddress2", e.target.value)}
                      sx={inputSx}
                    />
                  </div>
               </Box>
               
            

               {/* Country & State */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <Box>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Country *"
                        value={formData.billingCountry}
                        onChange={(e) => handleChange("billingCountry", e.target.value)}
                        sx={inputSx}
                      >
                        <MenuItem value="India">India</MenuItem>
                      </TextField>
                   </Box>
                   <Box>
                       <TextField
                        select
                        fullWidth
                        size="small"
                        label="State *"
                        value={formData.billingState}
                        onChange={(e) => handleChange("billingState", e.target.value)}
                        sx={inputSx}
                      >
                        <MenuItem value="">Select State</MenuItem>
                        <MenuItem value="Delhi">Delhi</MenuItem>
                        <MenuItem value="Maharashtra">Maharashtra</MenuItem>
                        <MenuItem value="Karnataka">Karnataka</MenuItem>
                      </TextField>
                   </Box>
               </div>


   {/* Landmark & City */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <Box>
                      <TextField
                        fullWidth
                        size="small"
                        label="Landmark"
                        placeholder="Landmark"
                        value={formData.billingLandmark}
                        onChange={(e) => handleChange("billingLandmark", e.target.value)}
                        sx={inputSx}
                      />
                   </Box>
                   <Box>
                      <TextField
                        fullWidth
                        size="small"
                        label="City *"
                        placeholder="City"
                        value={formData.billingCity}
                        onChange={(e) => handleChange("billingCity", e.target.value)}
                        sx={inputSx}
                      />
                   </Box>
               </div>
                {/* Pincode & Distance */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <Box>
                      <TextField
                        fullWidth
                        size="small"
                        label="Pincode"
                        placeholder="Pincode"
                        value={formData.billingZip}
                        onChange={(e) => handleChange("billingZip", e.target.value)}
                        sx={inputSx}
                      />
                   </Box>
               </div>
            </div>
          </Box>

          {/* 3. Bank Details */}
          <Box className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 shadow-sm">
            <Typography variant="caption" className="font-bold text-blue-900 uppercase tracking-wider block mb-3 border-b border-blue-200 pb-2">
              VENDOR BANK DETAILS
            </Typography>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Box>
                    <TextField
                      fullWidth
                      size="small"
                      label="Bank Name"
                      placeholder="Bank Name"
                      value={formData.bankName}
                      onChange={(e) => handleChange("bankName", e.target.value)}
                      sx={inputSx}
                    />
                 </Box>
                 <Box>
                    <TextField
                      fullWidth
                      size="small"
                      label="IFSC Code"
                      placeholder="IFSC Code"
                      value={formData.ifscCode}
                      onChange={(e) => handleChange("ifscCode", e.target.value)}
                      sx={inputSx}
                    />
                 </Box>
                 <Box>
                    <TextField
                      fullWidth
                      size="small"
                      label="Account Number"
                      placeholder="Account Number"
                      value={formData.accountNumber}
                      onChange={(e) => handleChange("accountNumber", e.target.value)}
                      sx={inputSx}
                    />
                 </Box>
                 <Box>
                    <TextField
                      fullWidth
                      size="small"
                      label="Branch Name"
                      placeholder="Branch Name"
                      value={formData.branchName}
                      onChange={(e) => handleChange("branchName", e.target.value)}
                      sx={inputSx}
                    />
                 </Box>
            </div>
          </Box>
      </Box>
    </Box>

      {/* Footer */}
      <Box className="px-6 py-4 bg-gray-50 border-t border-gray-200 shrink-0 flex justify-start gap-4 z-10">
        <Button
          variant="outlined"
          onClick={onClose}
          startIcon={<FiX />}
          className="px-6 py-2 border-blue-200 text-blue-600 hover:bg-blue-50 normal-case font-medium rounded-lg"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          className="px-8 py-2 bg-[#6200ea] hover:bg-[#5000d6] text-white shadow-md normal-case font-medium rounded-lg"
        >
          Save Details
        </Button>
      </Box>
    </>
  );

  if (variant === "embedded") {
    return (
      <Box className="flex flex-col h-full bg-white rounded-lg shadow-sm">
        {content}
      </Box>
    );
  }

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
      {content}
    </Dialog>
  );
};

export default VendorModal;
