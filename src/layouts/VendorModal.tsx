// src/components/VendorModal.tsx
import React, { useState } from "react";
import { FiX } from "react-icons/fi";

interface VendorModalProps {
  open: boolean;
  onClose: () => void;
  onAddVendor: (vendor: VendorFormData) => void;
}

export interface VendorFormData {
  name: string;
  address: string;
  state: string;
  country: string;
  pinCode: string;
  mobile: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  paymentTerms: string;
  preferredPaymentMode: string;
  creditLimit: string;
  outstandingBalance: string;
  gstType: string;
  registrationType: string;
  gstNumber: string;
  openingBalance: string;
}

const VendorModal: React.FC<VendorModalProps> = ({ open, onClose, onAddVendor }) => {
  const [formData, setFormData] = useState<VendorFormData>({
    name: "",
    address: "",
    state: "",
    country: "",
    pinCode: "",
    mobile: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
    paymentTerms: "",
    preferredPaymentMode: "",
    creditLimit: "",
    outstandingBalance: "",
    gstType: "",
    registrationType: "",
    gstNumber: "",
    openingBalance: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddVendor(formData);
    alert("Vendor Added Successfully!");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/20 backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl shadow-lg w-11/12 max-w-3xl h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center border-b px-6 py-3">
          <h2 className="text-lg font-semibold">Add New Vendor</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500">
            <FiX size={22} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input name="name" value={formData.name} onChange={handleChange} className="border p-2 rounded-md w-full" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mobile No</label>
            <input name="mobile" value={formData.mobile} onChange={handleChange} className="border p-2 rounded-md w-full" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Address</label>
            <input name="address" value={formData.address} onChange={handleChange} className="border p-2 rounded-md w-full" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <input name="state" value={formData.state} onChange={handleChange} className="border p-2 rounded-md w-full" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <input name="country" value={formData.country} onChange={handleChange} className="border p-2 rounded-md w-full" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Pin Code</label>
            <input name="pinCode" value={formData.pinCode} onChange={handleChange} className="border p-2 rounded-md w-full" />
          </div>

          {/* Bank Details */}
          <div>
            <label className="block text-sm font-medium mb-1">Bank Name</label>
            <input name="bankName" value={formData.bankName} onChange={handleChange} className="border p-2 rounded-md w-full" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Account Number</label>
            <input name="accountNumber" value={formData.accountNumber} onChange={handleChange} className="border p-2 rounded-md w-full" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">IFSC Code</label>
            <input name="ifsc" value={formData.ifsc} onChange={handleChange} className="border p-2 rounded-md w-full" />
          </div>

          {/* Payment Info */}
          <div>
            <label className="block text-sm font-medium mb-1">Payment Terms</label>
            <select name="paymentTerms" value={formData.paymentTerms} onChange={handleChange} className="border p-2 rounded-md w-full">
              <option value="">Select Payment Terms</option>
              <option value="Net 15">Net 15</option>
              <option value="Net 30">Net 30</option>
              <option value="On Delivery">On Delivery</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Preferred Payment Mode</label>
            <select
              name="preferredPaymentMode"
              value={formData.preferredPaymentMode}
              onChange={handleChange}
              className="border p-2 rounded-md w-full"
            >
              <option value="">Select Mode</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="UPI">UPI</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Credit Limit</label>
            <input name="creditLimit" value={formData.creditLimit} onChange={handleChange} className="border p-2 rounded-md w-full" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Outstanding Balance</label>
            <input name="outstandingBalance" value={formData.outstandingBalance} onChange={handleChange} className="border p-2 rounded-md w-full" />
          </div>

          {/* GST Info */}
          <div>
            <label className="block text-sm font-medium mb-1">GST Type</label>
            <select name="gstType" value={formData.gstType} onChange={handleChange} className="border p-2 rounded-md w-full">
              <option value="">Select GST Type</option>
              <option value="Registered">Registered</option>
              <option value="Unregistered">Unregistered</option>
              <option value="Composite">Composite</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Registration Type</label>
            <select name="registrationType" value={formData.registrationType} onChange={handleChange} className="border p-2 rounded-md w-full">
              <option value="">Select Registration Type</option>
              <option value="Composition">Composition</option>
              <option value="Registered">Registered</option>
              <option value="Unregistered/Consumer">Unregistered/Consumer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">GST Number</label>
            <input name="gstNumber" value={formData.gstNumber} onChange={handleChange} className="border p-2 rounded-md w-full" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Opening Balance</label>
            <input name="openingBalance" value={formData.openingBalance} onChange={handleChange} className="border p-2 rounded-md w-full" />
          </div>
        </form>

        <div className="border-t px-6 py-4 flex justify-end gap-3 bg-gray-50">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
            Cancel
          </button>
          <button type="submit" onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorModal;
