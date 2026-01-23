import React from "react";
import { VendorDialogForm } from "../components/adminComponents/VendorDialogForm";

import type { GetVendorData } from "../redux/slices/vendorSlice";

interface VendorModalProps {
  open: boolean;
  onClose: () => void;
  onAddVendor: (vendor: GetVendorData) => void | Promise<void>;
  variant?: "dialog" | "embedded";
  isEdit?: boolean;
  initialData?: GetVendorData | null;
}

const VendorModal: React.FC<VendorModalProps> = ({
  open,
  onClose,
  onAddVendor,
  isEdit = false,
  initialData,
}) => {
  // Adapter to match VendorDialogForm's expectation of a Promise
  const handleSave = async (data: GetVendorData) => {
    await onAddVendor(data);
  };

  return (
    <VendorDialogForm
      open={open}
      onClose={onClose}
      onSave={handleSave}
      isEdit={isEdit}
      initialData={initialData}
    />
  );
};

export default VendorModal;
